const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalCompanies, activeCompanies, pendingCompanies,
      totalRiders, activeRiders,
      totalOrders, todayOrders, monthOrders,
      totalRevenue, monthRevenue,
      recentOrders, pendingApprovals,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { status: 'ACTIVE' } }),
      prisma.company.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.rider.count(),
      prisma.rider.count({ where: { status: { not: 'OFFLINE' } } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.earning.aggregate({ _sum: { platformFee: true } }),
      prisma.earning.aggregate({ where: { createdAt: { gte: monthStart } }, _sum: { platformFee: true } }),
      prisma.order.findMany({
        take: 10, orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { name: true } },
          customer: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.company.findMany({
        where: { status: 'PENDING_APPROVAL' }, take: 5,
        include: { owner: { select: { firstName: true, lastName: true, email: true, phone: true } } },
      }),
    ]);

    res.json({
      stats: {
        totalCompanies, activeCompanies, pendingCompanies,
        totalRiders, activeRiders,
        totalOrders, todayOrders, monthOrders,
        totalRevenue: totalRevenue._sum.platformFee || 0,
        monthRevenue: monthRevenue._sum.platformFee || 0,
      },
      recentOrders,
      pendingApprovals,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

const getCompanies = async (req, res) => {
  try {
    const { status, state, page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (state) where.state = state;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          owner: { select: { firstName: true, lastName: true, email: true, phone: true } },
          _count: { select: { riders: true, orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit),
      }),
      prisma.company.count({ where }),
    ]);

    res.json({ companies, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

const updateCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED', 'PENDING_APPROVAL'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const company = await prisma.company.update({
      where: { id },
      data: { status },
      include: { owner: { select: { firstName: true, email: true } } },
    });

    // Notify company owner
    const io = req.app.get('io');
    io.to(`user:${company.ownerId}`).emit('company:status', { status, companyName: company.name });

    res.json({ message: 'Company status updated', company });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

const getRiders = async (req, res) => {
  try {
    const { companyId, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;

    const [riders, total] = await Promise.all([
      prisma.rider.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true, phone: true, avatar: true } },
          company: { select: { name: true, state: true } },
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit),
      }),
      prisma.rider.count({ where }),
    ]);

    res.json({ riders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch riders' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status, companyId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          company: { select: { name: true, state: true } },
          customer: { select: { firstName: true, lastName: true, phone: true } },
          rider: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const getPlatformRevenue = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const [revenue, byState] = await Promise.all([
      prisma.earning.aggregate({
        where: { createdAt: { gte: startDate, lte: endDate } },
        _sum: { platformFee: true, amount: true },
        _count: true,
      }),
      prisma.earning.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { company: { select: { state: true } } },
      }),
    ]);

    // Group by state
    const stateRevenue = byState.reduce((acc, e) => {
      const state = e.company.state;
      if (!acc[state]) acc[state] = 0;
      acc[state] += e.platformFee;
      return acc;
    }, {});

    res.json({ revenue, stateRevenue });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
};

const getStates = async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json(states);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch states' });
  }
};

module.exports = { getDashboardStats, getCompanies, updateCompanyStatus, getRiders, getAllOrders, getPlatformRevenue, getStates };
