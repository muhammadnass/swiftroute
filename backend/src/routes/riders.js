const express = require('express');
const router = express.Router();
const { getRiderProfile, updateRiderStatus, updateLocation, getRiderOrders, getRiderEarnings, getDashboardStats } = require('../controllers/riderController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('RIDER'));
router.get('/dashboard', getDashboardStats);
router.get('/profile', getRiderProfile);
router.put('/status', updateRiderStatus);
router.put('/location', updateLocation);
router.get('/orders', getRiderOrders);
router.get('/earnings', getRiderEarnings);

module.exports = router;
