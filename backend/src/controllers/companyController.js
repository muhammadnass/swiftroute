const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCompanyProfile = async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { ownerId: req.user.id },
      include: {
        owner: { select: { firstName: true, lastName: true, email: true, phone: true } },
        _count: { select: { riders: true, orders: true } },
      },
    });
    if (!company) return res.status(404).json({ error: 'Company profile not found' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
};

const updateCompanyProfile = async (req, res) => {
  try {
    const { name, description, logo, coverImage, state, city, address, bankName, accountNumber, accountName } = req.body;
    const company = await prisma.company.findUnique({ where: { ownerId: req.user.id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const updated = await prisma.company.update({
      where: { id: company.id },
      data: { name, description, logo, coverImage, state, city, address, bankName, accountNumber, accountName },
    });
    res.json({ message: 'Profile updated', company: updated });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

const getCompanyRiders = async (req, res) => {
  try {
    const company = await prisma.company.findUnique({ where: { ownerId: req.user.id } });
    const riders = await prisma.rider.findMany({
      where: { companyId: company.id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, avatar: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch riders' });
  }
};

const addRider = async (req, res) => {
  try {
    const { email, phone, firstName, lastName, vehicleType, vehiclePlate, vehicleModel, licenseNumber, nin } = req.body;
    const company = await prisma.company.findUnique({ where: { ownerId: req.user.id } });

    const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existingUser) {
      // If rider already exists as user, link them
      const existingRider = await prisma.rider.findUnique({ where: { userId: existingUser.id } });
      if (existingRider) return res.status(409).json({ error: 'Rider already registered' });

      const rider = await prisma.rider.create({
        data: {
          userId: existingUser.id,
          companyId: company.id,
          vehicleType, vehiclePlate, vehicleModel, licenseNumber, nin,
        },
        include: { user: true },
      });
      return res.status(201).json({ message: 'Rider added', rider });
    }

    // Create new user and rider
    const bcrypt = require('bcryptjs');
    const tempPassword = `Swift${Math.random().toString(36).substr(2, 8)}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const newUser = await prisma.user.create({
      data: { email, phone, firstName, lastName, password: hashedPassword, role: 'RIDER' },
    });

    const rider = await prisma.rider.create({
      data: {
        userId: newUser.id,
        companyId: company.id,
        vehicleType, vehiclePlate, vehicleModel, licenseNumber, nin,
      },
      include: { user: true },
    });

    res.status(201).json({ message: 'Rider added', rider, tempPassword });
  } catch (err) {
    console.error('Add rider error:', err);
    res.status(500).json({ error: 'Failed to add rider' });
  }
};

const approveRider = async (req, res) => {
  try {
    const { riderId } = req.params;
    const company = await prisma.company.findUnique({ where: { ownerId: req.user.id } });
    const rider = await prisma.rider.findUnique({ where: { id: riderId } });

    if (!rider || rider.companyId !== company.id) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    const updated = await prisma.rider.update({
      where: { id: riderId },
      data: { isApproved: req.body.isApproved },
    });
    res.json({ message: `Rider ${updated.isApproved ? 'approved' : 'suspended'}`, rider: updated });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const company = await prisma.company.findUnique({ where: { ownerId: req.user.id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders, todayOrders, pendingOrders, activeRiders,
      totalEarnings, todayEarnings, recentOrders,
    ] = await Promise.all([
      prisma.order.count({ where: { companyId: company.id } }),
      prisma.order.count({ where: { companyId: company.id, createdAt: { gte: today } } }),
      prisma.order.count({ where: { companyId: company.id, status: { in: ['PENDING', 'ACCEPTED'] } } }),
      prisma.rider.count({ where: { companyId: company.id, status: { not: 'OFFLINE' }, isApproved: true } }),
      prisma.earning.aggregate({ where: { companyId: company.id }, _sum: { netAmount: true } }),
      prisma.earning.aggregate({
        where: { companyId: company.id, createdAt: { gte: today } },
        _sum: { netAmount: true },
      }),
      prisma.order.findMany({
        where: { companyId: company.id },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { firstName: true, lastName: true } },
          rider: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      }),
    ]);

    res.json({
      stats: {
        totalOrders, todayOrders, pendingOrders, activeRiders,
        walletBalance: company.walletBalance,
        totalEarnings: totalEarnings._sum.netAmount || 0,
        todayEarnings: todayEarnings._sum.netAmount || 0,
      },
      recentOrders,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

const getEarnings = async (req, res) => {
  try {
    const company = await prisma.company.findUnique({ where: { ownerId: req.user.id } });
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [earnings, total] = await Promise.all([
      prisma.earning.findMany({
        where: { companyId: company.id },
        include: {
          order: { select: { orderNumber: true, deliveryAddress: true, createdAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit),
      }),
      prisma.earning.count({ where: { companyId: company.id } }),
    ]);

    res.json({ earnings, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
};

module.exports = { getCompanyProfile, updateCompanyProfile, getCompanyRiders, addRider, approveRider, getDashboardStats, getEarnings };
