const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const crypto = require('crypto');

const prisma = new PrismaClient();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PLAN_CODE = process.env.PAYSTACK_PLAN_CODE;
const SUBSCRIPTION_AMOUNT = parseInt(process.env.SUBSCRIPTION_AMOUNT_KOBO || '3000000', 10); // ₦30,000 in kobo
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const paystackHeaders = {
  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
};

// ─── Initialize Subscription (company calls this to get Paystack checkout URL) ───
const initializeSubscription = async (req, res) => {
  try {
    const companyId = req.user.companyId || req.user.id;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { subscription: true },
    });

    if (!company) return res.status(404).json({ error: 'Company not found' });

    // Already has an active subscription
    if (company.subscription?.status === 'ACTIVE') {
      return res.status(400).json({ error: 'You already have an active subscription' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const payload = {
      email: user.email,
      amount: SUBSCRIPTION_AMOUNT,
      callback_url: `${FRONTEND_URL}/company/subscription`,
      metadata: { companyId, userId: req.user.id },
    };

    // Attach plan if configured for recurring billing
    if (PAYSTACK_PLAN_CODE) {
      payload.plan = PAYSTACK_PLAN_CODE;
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      payload,
      { headers: paystackHeaders }
    );

    const { authorization_url, reference } = response.data.data;

    // Upsert a pending subscription record
    await prisma.subscription.upsert({
      where: { companyId },
      create: {
        companyId,
        status: 'INACTIVE',
        amount: 30000,
      },
      update: {},
    });

    return res.json({ authorization_url, reference });
  } catch (err) {
    console.error('[initializeSubscription]', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to initialize payment' });
  }
};

// ─── Verify Subscription (called after Paystack redirect) ───
const verifySubscription = async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ error: 'Reference required' });

    const companyId = req.user.companyId || req.user.id;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: paystackHeaders }
    );

    const txn = response.data.data;

    if (txn.status !== 'success') {
      return res.status(400).json({ error: 'Payment was not successful' });
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);

    const subscription = await prisma.subscription.upsert({
      where: { companyId },
      create: {
        companyId,
        status: 'ACTIVE',
        amount: 30000,
        paystackCustomerCode: txn.customer?.customer_code,
        paystackSubscriptionCode: txn.subscription_code,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        nextPaymentDate: periodEnd,
      },
      update: {
        status: 'ACTIVE',
        paystackCustomerCode: txn.customer?.customer_code,
        paystackSubscriptionCode: txn.subscription_code,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        nextPaymentDate: periodEnd,
      },
    });

    return res.json({ message: 'Subscription activated', subscription });
  } catch (err) {
    console.error('[verifySubscription]', err.response?.data || err.message);
    return res.status(500).json({ error: 'Verification failed' });
  }
};

// ─── Get Subscription Status ───
const getSubscriptionStatus = async (req, res) => {
  try {
    const companyId = req.user.companyId || req.user.id;

    let subscription = await prisma.subscription.findUnique({
      where: { companyId },
    });

    if (!subscription) {
      return res.json({ subscription: null, isActive: false, daysRemaining: 0 });
    }

    // Auto-expire past-due
    if (
      subscription.status === 'ACTIVE' &&
      subscription.currentPeriodEnd &&
      new Date() > subscription.currentPeriodEnd
    ) {
      subscription = await prisma.subscription.update({
        where: { companyId },
        data: { status: 'PAST_DUE' },
      });
    }

    const isActive = subscription.status === 'ACTIVE';
    let daysRemaining = 0;

    if (isActive && subscription.currentPeriodEnd) {
      const diff = subscription.currentPeriodEnd.getTime() - Date.now();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    return res.json({ subscription, isActive, daysRemaining });
  } catch (err) {
    console.error('[getSubscriptionStatus]', err.message);
    return res.status(500).json({ error: 'Failed to get subscription status' });
  }
};

// ─── Cancel Subscription ───
const cancelSubscription = async (req, res) => {
  try {
    const companyId = req.user.companyId || req.user.id;

    const subscription = await prisma.subscription.findUnique({ where: { companyId } });
    if (!subscription) return res.status(404).json({ error: 'No subscription found' });

    // Disable on Paystack if we have the code
    if (subscription.paystackSubscriptionCode && subscription.paystackEmailToken) {
      await axios.post(
        'https://api.paystack.co/subscription/disable',
        {
          code: subscription.paystackSubscriptionCode,
          token: subscription.paystackEmailToken,
        },
        { headers: paystackHeaders }
      ).catch(e => console.warn('[cancelSubscription] Paystack disable failed:', e.message));
    }

    const updated = await prisma.subscription.update({
      where: { companyId },
      data: { status: 'CANCELLED' },
    });

    return res.json({ message: 'Subscription cancelled', subscription: updated });
  } catch (err) {
    console.error('[cancelSubscription]', err.message);
    return res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

// ─── Paystack Webhook ───
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(req.body) // raw body buffer
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString());
    const { event: eventType, data } = event;

    console.log('[Webhook] Event:', eventType);

    switch (eventType) {
      case 'subscription.create': {
        const customerCode = data.customer?.customer_code;
        if (!customerCode) break;

        const sub = await prisma.subscription.findFirst({
          where: { paystackCustomerCode: customerCode },
        });
        if (!sub) break;

        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            paystackSubscriptionCode: data.subscription_code,
            paystackEmailToken: data.email_token,
            paystackPlanCode: data.plan?.plan_code,
            status: 'ACTIVE',
          },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const code = data.subscription?.subscription_code;
        if (!code) break;
        await prisma.subscription.updateMany({
          where: { paystackSubscriptionCode: code },
          data: { status: 'PAST_DUE' },
        });
        break;
      }

      case 'invoice.update': {
        // Successful recurring charge — extend period
        const code = data.subscription?.subscription_code;
        if (!code || data.paid !== true) break;

        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setDate(periodEnd.getDate() + 30);

        await prisma.subscription.updateMany({
          where: { paystackSubscriptionCode: code },
          data: {
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            nextPaymentDate: periodEnd,
          },
        });
        break;
      }

      case 'subscription.not_renew':
      case 'subscription.disable': {
        const code = data.subscription_code || data.code;
        if (!code) break;
        await prisma.subscription.updateMany({
          where: { paystackSubscriptionCode: code },
          data: { status: 'CANCELLED' },
        });
        break;
      }

      default:
        console.log('[Webhook] Unhandled event:', eventType);
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error('[handleWebhook]', err.message);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// ─── Admin: List All Subscriptions ───
const adminGetSubscriptions = async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        company: {
          select: { id: true, name: true, email: true, city: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'ACTIVE').length,
      inactive: subscriptions.filter(s => s.status === 'INACTIVE').length,
      pastDue: subscriptions.filter(s => s.status === 'PAST_DUE').length,
      cancelled: subscriptions.filter(s => s.status === 'CANCELLED').length,
      monthlyRevenue: subscriptions.filter(s => s.status === 'ACTIVE').length * 30000,
    };

    return res.json({ subscriptions, summary });
  } catch (err) {
    console.error('[adminGetSubscriptions]', err.message);
    return res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};

module.exports = {
  initializeSubscription,
  verifySubscription,
  getSubscriptionStatus,
  cancelSubscription,
  handleWebhook,
  adminGetSubscriptions,
};
