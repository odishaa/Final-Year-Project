const Offer = require('../models/Offer.model');
const Listing = require('../models/Listing.model');
const User = require('../models/User.model');

// @desc    Make an offer on a listing
// @route   POST /api/offers
// @access  Private (Buyer)
exports.createOffer = async (req, res) => {
  try {
    const { listingId, offerAmount, message } = req.body;

    const listing = await Listing.findById(listingId).populate('seller');

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'This listing is not active'
      });
    }

    // Can't make offer on your own listing
    if (listing.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot make an offer on your own listing'
      });
    }

    // Check if buyer already has pending offer
    const existingOffer = await Offer.findOne({
      listing: listingId,
      buyer: req.user._id,
      status: 'pending'
    });

    if (existingOffer) {
      return res.status(400).json({
        status: 'error',
        message: 'You already have a pending offer on this listing'
      });
    }

    const offer = await Offer.create({
      listing: listingId,
      buyer: req.user._id,
      offerAmount: {
        amount: offerAmount,
        currency: 'LKR'
      },
      message
    });

    await offer.populate('buyer', 'name email');

    res.status(201).json({
      status: 'success',
      message: 'Offer submitted successfully',
      data: { offer }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create offer',
      error: error.message
    });
  }
};

// @desc    Get my offers (as buyer)
// @route   GET /api/offers/my-offers
// @access  Private (Buyer)
exports.getMyOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ buyer: req.user._id })
      .populate({
        path: 'listing',
        populate: [
          { path: 'gemstone', select: 'gemId name type images' },
          { path: 'seller', select: 'name email' }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        count: offers.length,
        offers
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch offers',
      error: error.message
    });
  }
};

// @desc    Get offers for a listing (seller)
// @route   GET /api/offers/listing/:listingId
// @access  Private (Seller)
exports.getListingOffers = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }

    // Check ownership
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view offers for this listing'
      });
    }

    const offers = await Offer.find({ listing: req.params.listingId })
      .populate('buyer', 'name email phone buyerInfo')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        count: offers.length,
        offers
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch offers',
      error: error.message
    });
  }
};

// @desc    Accept an offer
// @route   PUT /api/offers/:id/accept
// @access  Private (Seller)
exports.acceptOffer = async (req, res) => {
  try {
    const { sellerResponse } = req.body;
    const offer = await Offer.findById(req.params.id).populate('listing');

    if (!offer) {
      return res.status(404).json({
        status: 'error',
        message: 'Offer not found'
      });
    }

    const listing = await Listing.findById(offer.listing._id);

    // Check ownership
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to accept this offer'
      });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'This offer has already been responded to'
      });
    }

    offer.status = 'accepted';
    offer.respondedAt = new Date();
    offer.sellerResponse = sellerResponse || 'Offer accepted';
    await offer.save();

    // Reserve the listing
    listing.status = 'reserved';
    await listing.save();

    // Reject all other pending offers for this listing
    await Offer.updateMany(
      {
        listing: offer.listing._id,
        _id: { $ne: offer._id },
        status: 'pending'
      },
      {
        status: 'rejected',
        respondedAt: new Date(),
        sellerResponse: 'Seller accepted another offer'
      }
    );

    await offer.populate('buyer', 'name email');

    res.status(200).json({
      status: 'success',
      message: 'Offer accepted successfully',
      data: { offer }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to accept offer',
      error: error.message
    });
  }
};

// @desc    Reject an offer
// @route   PUT /api/offers/:id/reject
// @access  Private (Seller)
exports.rejectOffer = async (req, res) => {
  try {
    const { sellerResponse } = req.body;
    const offer = await Offer.findById(req.params.id).populate('listing');

    if (!offer) {
      return res.status(404).json({
        status: 'error',
        message: 'Offer not found'
      });
    }

    const listing = await Listing.findById(offer.listing._id);

    // Check ownership
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to reject this offer'
      });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'This offer has already been responded to'
      });
    }

    offer.status = 'rejected';
    offer.respondedAt = new Date();
    offer.sellerResponse = sellerResponse || 'Offer rejected';
    await offer.save();

    res.status(200).json({
      status: 'success',
      message: 'Offer rejected',
      data: { offer }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to reject offer',
      error: error.message
    });
  }
};

// @desc    Withdraw an offer
// @route   PUT /api/offers/:id/withdraw
// @access  Private (Buyer)
exports.withdrawOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        status: 'error',
        message: 'Offer not found'
      });
    }

    // Check ownership
    if (offer.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to withdraw this offer'
      });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Only pending offers can be withdrawn'
      });
    }

    offer.status = 'withdrawn';
    await offer.save();

    res.status(200).json({
      status: 'success',
      message: 'Offer withdrawn successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to withdraw offer',
      error: error.message
    });
  }
};