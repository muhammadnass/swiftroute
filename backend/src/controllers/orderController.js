const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

const generateOrderNumber = () => `SR${Date.now().toString().slice(-8)}`;
const generateTrackingCode = () => `TRK${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

// Create a new order (by company or via API)
const createOrder = async (req, res) => {
  try {
    const {
      pickupAddress, pickupLat, pickupLng, pickupContactName, pickupContactPhone,
      deliveryAddress, deliveryLat, deliveryLng, deliveryContactName, deliveryContactPhone,
      packageDescription, packageWeight, isFragile, deliveryFee, notes, scheduledAt,
      customerId,
    } = req.body;

    let companyId;
    if (req.user.role === 'COMPANY') {
      const company = await prisma.company.findUnique({ where: { ownerId: req.user.id } });
      if (!company || company.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'Company account not active' });
      }
      companyId = company.id;
    } else {
      companyId = req.body.companyId;
    }

    const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || 8) / 100;
    const platformFee = parseFloat(deliveryFee) * platformFeePercent;
    const totalAmount = parseFloat(deliveryFee);

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        trackingCode: generateTrackingCode(),
        companyId,
        customerId: customerId || req.user.id,
        pickupAddress, pickupLat: parseFloat(pickupLat), pickupLng: parseFloat(pickupLng),
        pickupContactName, pickupContactPhone,
        deliveryAddress, deliveryLat: parseFloat(deliveryLat), deliveryLng: parseFloat(deliveryLng),
        deliveryContactName, deliveryContactPhone,
        packageDescription,
        packageWeight: packageWeight ? parseFloat(packageWeight) : null,
        isFragile: Boolean(isFragile),
        deliveryFee: parseFloat(deliveryFee),
        platformFee,
        totalAmount,
        notes,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
      include: {
        company: { select: { name: true } },
        customer: { select: { firstName: true, lastName: true, phone: true } },
      },
    });

    // Notify company via socket
    const io = req.app.get('io');
    io.to(`company:${companyId}`).emit('order:new', order);

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get orders (filtered by role)
const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let where = {};
    if (req.user.role === 'COMPANY') {
      const company = await prisma.company.findUnique({ where: { ownerId: req.user.id } });
      where.companyId = company.id;
    } else if (req.user.role === 'RIDER') {
      const rider = await prisma.rider.findUnique({ where: { userId: req.user.id } });
      where.riderId = rider.id;
    }
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          company: { select: { name: true } },
          customer: { select: { firstName: true, lastName: true, phone: true } },
          rider: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get single order
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        company: true,
        customer: { select: { firstName: true, lastName: true, phone: true, email: true } },
        rider: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true, avatar: true } },
          },
        },
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Track order by tracking code (public)
const trackOrder = async (req, res) => {
  try {
    const { code } = req.params;
    const order = await prisma.order.findUnique({
      where: { trackingCode: code },
      select: {
        orderNumber: true, status: true, trackingCode: true,
        pickupAddress: true, deliveryAddress: true,
        estimatedDistance: true, estimatedDuration: true,
        acceptedAt: true, pickedUpAt: true, deliveredAt: true, createdAt: true,
        rider: {
          select: {
            currentLat: true, currentLng: true,
            user: { select: { firstName: true, avatar: true } },
          },
        },
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Tracking failed' });
  }
};

// Assign rider to order
const assignRider = async (req, res) => {
  try {
    const { id } = req.params;
    const { riderId } = req.body;

    const company = await prisma.company.findUnique({ where: { ownerId: req.user.id } });
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order || order.companyId !== company.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const rider = await prisma.rider.findUnique({
      where: { id: riderId },
      include: { user: true },
    });
    if (!rider || rider.companyId !== company.id) {
      return res.status(400).json({ error: 'Rider not found in your company' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { riderId, status: 'ACCEPTED', acceptedAt: new Date() },
      include: { rider: { include: { user: true } }, customer: true },
    });

    await prisma.rider.update({ where: { id: riderId }, data: { status: 'BUSY' } });

    const io = req.app.get('io');
    io.to(`user:${rider.userId}`).emit('order:assigned', updatedOrder);
    io.to(`user:${order.customerId}`).emit('order:updated', {
      orderId: id,
      status: 'ACCEPTED',
      rider: { name: `${rider.user.firstName} ${rider.user.lastName}`, phone: rider.user.phone },
    });

    res.json({ message: 'Rider assigned successfully', order: updatedOrder });
  } catch (err) {
    console.error('Assign rider error:', err);
    res.status(500).json({ error: 'Failed to assign rider' });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, proofOfDelivery } = req.body;

    const validTransitions = {
      RIDER: { ACCEPTED: 'PICKED_UP', PICKED_UP: 'IN_TRANSIT', IN_TRANSIT: 'DELIVERED' },
      COMPANY: { PENDING: 'ACCEPTED', ACCEPTED: 'CANCELLED' },
    };

    const order = await prisma.order.findUnique({ where: { id }, include: { rider: true } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const now = new Date();
    const updateData = { status };

    if (status === 'PICKED_UP') updateData.pickedUpAt = now;
    if (status === 'IN_TRANSIT') updateData.inTransitAt = now;
    if (status === 'DELIVERED') {
      updateData.deliveredAt = now;
      if (proofOfDelivery) updateData.proofOfDelivery = proofOfDelivery;

      // Create earnings records
      if (order.riderId) {
        const riderCommissionPercent = parseFloat(process.env.RIDER_COMMISSION_PERCENTAGE || 70) / 100;
        const riderAmount = order.deliveryFee * riderCommissionPercent;
        const netCompanyAmount = order.deliveryFee - order.platformFee;

        await prisma.$transaction([
          prisma.riderEarning.create({
            data: { riderId: order.riderId, orderId: id, amount: riderAmount },
          }),
          prisma.earning.create({
            data: {
              companyId: order.companyId,
              orderId: id,
              amount: order.deliveryFee,
              platformFee: order.platformFee,
              netAmount: netCompanyAmount,
            },
          }),
          prisma.rider.update({
            where: { id: order.riderId },
            data: {
              status: 'AVAILABLE',
              totalDeliveries: { increment: 1 },
              walletBalance: { increment: riderAmount },
            },
          }),
          prisma.company.update({
            where: { id: order.companyId },
            data: {
              totalDeliveries: { increment: 1 },
              walletBalance: { increment: netCompanyAmount },
            },
          }),
        ]);
      }
    }

    const updatedOrder = await prisma.order.update({ where: { id }, data: updateData });

    const io = req.app.get('io');
    io.to(`user:${order.customerId}`).emit('order:updated', { orderId: id, status });
    io.to(`company:${order.companyId}`).emit('order:updated', { orderId: id, status });

    res.json({ message: 'Order status updated', order: updatedOrder });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

module.exports = { createOrder, getOrders, getOrder, trackOrder, assignRider, updateOrderStatus };
