const express = require('express');
const router = express.Router();
const {
  getAllListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  toggleFavorite,
  verifyListing
} = require('../controllers/marketplace.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/listings', getAllListings);
router.get('/listings/:id', getListing);

// Protected routes - Any authenticated user
router.post('/listings', protect, createListing);
router.put('/listings/:id', protect, updateListing);
router.delete('/listings/:id', protect, deleteListing);
router.get('/my-listings', protect, getMyListings);

// Protected routes - Any authenticated user
router.post('/listings/:id/favorite', protect, toggleFavorite);

// Protected routes - NGJA Officer
router.post('/listings/:id/verify', protect, authorize('ngja_officer', 'admin'), verifyListing);

module.exports = router;