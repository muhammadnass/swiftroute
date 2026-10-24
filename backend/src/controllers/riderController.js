const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getRiderProfile = async (req, res) => {
  try {
    const rider = await prisma.rider.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, avatar: true } },
        company: { select: { name: true, logo: true, state: true, city: true } },
        _count: { select: { orders: true } },
      },
    });
    if (!rider) return res.status(404).json({ error: 'Rider profile not found' });
    res.json(rider);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rider profile' });
  }
};

const updateRiderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['AVAILABLE', 'OFFLINE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const rider = await prisma.rider.update({
      where: { userId: req.user.id },
      data: { status },
    });
    res.json({ message: 'Status updated', status: rider.status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    await prisma.rider.update({
      where: { userId: req.user.id },
      data: { currentLat: parseFloat(lat), currentLng: parseFloat(lng) },
    });
    res.json({ message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update location' });
  }
};

const getRiderOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const rider = await prisma.rider.findUnique({ where: { userId: req.user.id } });

    const where = { riderId: rider.id };
    if (status) where.status = status;
    else where.status = { in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'] };

    const orders = await prisma.order.findMany({
      where,
      include: {
        company: { select: { name: true, logo: true } },
        customer: { select: { firstName: true, lastName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const getRiderEarnings = async (req, res) => {
  try {
    const rider = await prisma.rider.findUnique({ where: { userId: req.user.id } });
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [earnings, total, todayEarnings, weekEarnings, monthEarnings] = await Promise.all([
      prisma.riderEarning.findMany({
        where: { riderId: rider.id },
        include: {
          order: { select: { orderNumber: true, deliveryAddress: true, deliveredAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit),
      }),
      prisma.riderEarning.count({ where: { riderId: rider.id } }),
      prisma.riderEarning.aggregate({ where: { riderId: rider.id, createdAt: { gte: today } }, _sum: { amount: true } }),
      prisma.riderEarning.aggregate({ where: { riderId: rider.id, createdAt: { gte: weekStart } }, _sum: { amount: true } }),
      prisma.riderEarning.aggregate({ where: { riderId: rider.id, createdAt: { gte: monthStart } }, _sum: { amount: true } }),
    ]);

    res.json({
      earnings, total,
      page: parseInt(page), pages: Math.ceil(total / parseInt(limit)),
      summary: {
        walletBalance: rider.walletBalance,
        today: todayEarnings._sum.amount || 0,
        thisWeek: weekEarnings._sum.amount || 0,
        thisMonth: monthEarnings._sum.amount || 0,
        totalDeliveries: rider.totalDeliveries,
        rating: rider.rating,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const rider = await prisma.rider.findUnique({
      where: { userId: req.user.id },
      include: { company: { select: { name: true, logo: true } } },
    });
    if (!rider) return res.status(404).json({ error: 'Rider not found' });

    const today = new Date(); today.setHours(0, 0, 0, 0);

    const [activeOrders, todayDeliveries, todayEarnings] = await Promise.all([
      prisma.order.count({
        where: { riderId: rider.id, status: { in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'] } },
      }),
      prisma.order.count({
        where: { riderId: rider.id, status: 'DELIVERED', deliveredAt: { gte: today } },
      }),
      prisma.riderEarning.aggregate({
        where: { riderId: rider.id, createdAt: { gte: today } },
        _sum: { amount: true },
      }),
    ]);

    res.json({
      rider: {
        ...rider,
        user: undefined,
      },
      stats: {
        activeOrders,
        todayDeliveries,
        todayEarnings: todayEarnings._sum.amount || 0,
        totalDeliveries: rider.totalDeliveries,
        walletBalance: rider.walletBalance,
        rating: rider.rating,
        status: rider.status,
        isApproved: rider.isApproved,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

module.exports = { getRiderProfile, updateRiderStatus, updateLocation, getRiderOrders, getRiderEarnings, getDashboardStats };
