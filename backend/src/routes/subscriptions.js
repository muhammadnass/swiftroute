const express = require('express');
const router = express.Router();
const {
  initializeSubscription,
  verifySubscription,
  getSubscriptionStatus,
  cancelSubscription,
  handleWebhook,
  adminGetSubscriptions,
} = require('../controllers/subscriptionController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// Paystack webhook — raw body required for HMAC verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Company routes
router.post('/initialize', authenticateToken, requireRole('COMPANY'), initializeSubscription);
router.get('/verify', authenticateToken, requireRole('COMPANY'), verifySubscription);
router.get('/status', authenticateToken, requireRole('COMPANY'), getSubscriptionStatus);
router.post('/cancel', authenticateToken, requireRole('COMPANY'), cancelSubscription);

// Admin routes
router.get('/admin/all', authenticateToken, requireRole('ADMIN'), adminGetSubscriptions);

module.exports = router;
