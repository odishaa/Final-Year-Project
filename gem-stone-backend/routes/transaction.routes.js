const express = require('express');
const router = express.Router();
const {
  createPurchase,
  getMyPurchases,
  getMySales,
  completeTransaction,
  updatePaymentStatus,
  rateTransaction
} = require('../controllers/transaction.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Buyer routes
router.post('/purchase', protect, authorize('buyer', 'user', 'admin'), createPurchase);
router.get('/my-purchases', protect, authorize('buyer', 'user', 'admin'), getMyPurchases);
router.put('/:id/payment', protect, updatePaymentStatus);

// Seller routes
router.get('/my-sales', protect, authorize('seller', 'admin'), getMySales);
router.put('/:id/complete', protect, authorize('seller', 'admin'), completeTransaction);

// Both buyer and seller
router.post('/:id/rate', protect, rateTransaction);

module.exports = router;