const express = require('express');
const router = express.Router();
const {
  createOffer,
  getMyOffers,
  getListingOffers,
  acceptOffer,
  rejectOffer,
  withdrawOffer
} = require('../controllers/offer.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Buyer routes
router.post('/', protect, authorize('buyer', 'user', 'admin'), createOffer);
router.get('/my-offers', protect, authorize('buyer', 'user', 'admin'), getMyOffers);
router.put('/:id/withdraw', protect, authorize('buyer', 'user', 'admin'), withdrawOffer);

// Seller routes
router.get('/listing/:listingId', protect, authorize('seller', 'admin'), getListingOffers);
router.put('/:id/accept', protect, authorize('seller', 'admin'), acceptOffer);
router.put('/:id/reject', protect, authorize('seller', 'admin'), rejectOffer);

module.exports = router;