const express = require('express');
const router = express.Router();
const { getCompanyProfile, updateCompanyProfile, getCompanyRiders, addRider, approveRider, getDashboardStats, getEarnings } = require('../controllers/companyController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('COMPANY'));
router.get('/dashboard', getDashboardStats);
router.get('/profile', getCompanyProfile);
router.put('/profile', updateCompanyProfile);
router.get('/riders', getCompanyRiders);
router.post('/riders', addRider);
router.put('/riders/:riderId/approve', approveRider);
router.get('/earnings', getEarnings);

module.exports = router;
