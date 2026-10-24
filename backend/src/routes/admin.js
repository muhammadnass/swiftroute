const express = require('express');
const router = express.Router();
const { getDashboardStats, getCompanies, updateCompanyStatus, getRiders, getAllOrders, getPlatformRevenue, getStates } = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('ADMIN'));
router.get('/dashboard', getDashboardStats);
router.get('/companies', getCompanies);
router.put('/companies/:id/status', updateCompanyStatus);
router.get('/riders', getRiders);
router.get('/orders', getAllOrders);
router.get('/revenue', getPlatformRevenue);
router.get('/states', getStates);

module.exports = router;
