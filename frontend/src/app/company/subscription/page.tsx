'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, CheckCircle, AlertCircle, Clock, Zap,
  RefreshCw, XCircle, Shield, BarChart3, MapPin, Users
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Subscription {
  id: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELLED';
  amount: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  nextPaymentDate: string | null;
  createdAt: string;
}

interface SubStatus {
  subscription: Subscription | null;
  isActive: boolean;
  daysRemaining: number;
}

const statusConfig = {
  ACTIVE: { label: 'Active', color: 'text-green-400', bg: 'bg-green-400/10', icon: CheckCircle },
  INACTIVE: { label: 'Inactive', color: 'text-gray-400', bg: 'bg-gray-400/10', icon: Clock },
  PAST_DUE: { label: 'Past Due', color: 'text-red-400', bg: 'bg-red-400/10', icon: AlertCircle },
  CANCELLED: { label: 'Cancelled', color: 'text-orange-400', bg: 'bg-orange-400/10', icon: XCircle },
};

export default function CompanySubscriptionPage() {
  const [status, setStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get('/subscriptions/status');
      setStatus(data);
    } catch {
      toast.error('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Check for verification after Paystack redirect
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('reference') || params.get('trxref');
    if (ref) {
      verifyAfterRedirect(ref);
    }
  }, []);

  const verifyAfterRedirect = async (reference: string) => {
    try {
      const { data } = await api.get(`/subscriptions/verify?reference=${reference}`);
      toast.success('Subscription activated successfully! 🎉');
      setStatus({ subscription: data.subscription, isActive: true, daysRemaining: 30 });
      window.history.replaceState({}, '', '/company/subscription');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Payment verification failed');
    }
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const { data } = await api.post('/subscriptions/initialize');
      window.location.href = data.authorization_url;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to initialize payment');
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription? You keep access until the end of your billing period.')) return;
    setCancelling(true);
    try {
      await api.post('/subscriptions/cancel');
      toast.success('Subscription cancelled. Access continues until billing period ends.');
      fetchStatus();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-60">
      <div className="spinner w-8 h-8" />
    </div>
  );

  const sub = status?.subscription;
  const isActive = status?.isActive;
  const cfg = sub ? statusConfig[sub.status] : statusConfig.INACTIVE;
  const StatusIcon = cfg.icon;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Subscription</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Manage your SwiftRoute platform subscription
        </p>
      </div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 border ${
          isActive
            ? 'bg-green-400/5 border-green-400/20'
            : sub?.status === 'PAST_DUE'
            ? 'bg-red-400/5 border-red-400/20'
            : 'bg-white/5 border-white/10'
        }`}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${cfg.bg} flex items-center justify-center`}>
              <StatusIcon className={`w-7 h-7 ${cfg.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Business Plan</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
              {isActive ? (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {status!.daysRemaining} days remaining · Renews {formatDate(sub?.nextPaymentDate || null)}
                </p>
              ) : sub?.status === 'PAST_DUE' ? (
                <p className="text-sm text-red-400">Payment overdue — renew to restore full access</p>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Subscribe to unlock all platform features
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isActive || sub?.status === 'PAST_DUE' || sub?.status === 'CANCELLED' ? (
              <button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="btn-primary flex items-center gap-2 py-3 px-6"
              >
                {subscribing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {sub?.status === 'PAST_DUE' ? 'Renew Now' : 'Subscribe — ₦30,000/mo'}
              </button>
            ) : (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="btn-ghost flex items-center gap-2 py-3 px-5 text-red-400 hover:bg-red-400/10"
              >
                {cancelling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Cancel Plan
              </button>
            )}
          </div>
        </div>

        {sub && (
          <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Plan</div>
              <div className="font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>Business</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Amount</div>
              <div className="font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>₦{sub.amount.toLocaleString()}/mo</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Started</div>
              <div className="font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{formatDate(sub.currentPeriodStart)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Expires</div>
              <div className="font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{formatDate(sub.currentPeriodEnd)}</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* What's included */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-display font-semibold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>What&apos;s included in your subscription</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: Zap, title: 'Unlimited Orders', desc: 'No cap on the number of orders or deliveries you can process per month.', color: 'text-brand-400', bg: 'bg-brand-400/10' },
            { icon: MapPin, title: 'Live GPS Tracking', desc: 'Real-time rider location on Google Maps for you and your customers.', color: 'text-red-400', bg: 'bg-red-400/10' },
            { icon: BarChart3, title: 'Revenue Projection', desc: 'AI-driven 30/60/90-day revenue forecast based on your delivery history.', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            { icon: Users, title: 'Rider Management', desc: 'Onboard and manage unlimited riders with automatic earnings and wallet.', color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { icon: Shield, title: 'Priority Support', desc: 'Dedicated support via email and phone — sunusinasir@gmail.com · 09132726410.', color: 'text-green-400', bg: 'bg-green-400/10' },
            { icon: CreditCard, title: '8% Platform Fee', desc: 'Low 8% fee per delivery (down from 10%). You keep more profit as you scale.', color: 'text-purple-400', bg: 'bg-purple-400/10' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-4 p-4 rounded-xl"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment info */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-display font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Payment &amp; Billing</h3>
        <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span>Payments are processed securely via <strong style={{ color: 'var(--text-primary)' }}>Paystack</strong> — Nigeria&apos;s trusted payment gateway.</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span>Pay with <strong style={{ color: 'var(--text-primary)' }}>card, bank transfer, or USSD</strong> — whichever is easiest for you.</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span>Your subscription <strong style={{ color: 'var(--text-primary)' }}>auto-renews monthly</strong>. Cancel anytime and keep access until end of period.</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span>The 8% platform fee is deducted automatically per delivery — no manual transfers needed.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
