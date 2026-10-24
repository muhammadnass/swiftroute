const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrder, trackOrder, assignRider, updateOrderStatus } = require('../controllers/orderController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/track/:code', trackOrder); // Public tracking
router.use(authenticate);
router.post('/', requireRole('COMPANY', 'ADMIN'), createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.put('/:id/assign', requireRole('COMPANY'), assignRider);
router.put('/:id/status', requireRole('RIDER', 'COMPANY', 'ADMIN'), updateOrderStatus);

module.exports = router;
