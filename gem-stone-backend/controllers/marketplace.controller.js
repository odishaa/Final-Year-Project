const Listing = require('../models/Listing.model');
const Gemstone = require('../models/Gemstone.model');

// @desc    Get all marketplace listings
// @route   GET /api/marketplace/listings
// @access  Public
exports.getAllListings = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, certified, page = 1, limit = 12, sort = '-publishedAt' } = req.query;
    
    const query = { status: 'active' };
    
    if (type) {
      const gemstones = await Gemstone.find({ type, isListed: true }).select('_id');
      query.gemstone = { $in: gemstones.map(g => g._id) };
    }
    
    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) query['price.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) query['price.amount'].$lte = parseFloat(maxPrice);
    }
    
    if (certified === 'true') {
      const certifiedGems = await Gemstone.find({ 'ngja.certified': true, isListed: true }).select('_id');
      query.gemstone = { $in: certifiedGems.map(g => g._id) };
    }

    const listings = await Listing.find(query)
      .populate({
        path: 'gemstone',
        select: 'gemId name type weight color clarity cut images ngja status'
      })
      .populate('seller', 'name sellerInfo.rating sellerInfo.totalSales')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const count = await Listing.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        listings,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch listings',
      error: error.message
    });
  }
};

// @desc    Get single listing
// @route   GET /api/marketplace/listings/:id
// @access  Public
exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate({
        path: 'gemstone',
        populate: { path: 'currentOwner', select: 'name email phone' }
      })
      .populate('seller', 'name email phone sellerInfo address');

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }

    // Increment views
    listing.views += 1;
    await listing.save();

    res.status(200).json({
      status: 'success',
      data: { listing }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch listing',
      error: error.message
    });
  }
};

// @desc    Create new listing
// @route   POST /api/marketplace/listings
// @access  Private (Seller only)
exports.createListing = async (req, res) => {
  try {
    const { gemstoneId, title, description, price, negotiable } = req.body;

    // Check if gemstone exists and belongs to seller
    const gemstone = await Gemstone.findById(gemstoneId);
    
    if (!gemstone) {
      return res.status(404).json({
        status: 'error',
        message: 'Gemstone not found'
      });
    }

    if (gemstone.currentOwner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not own this gemstone'
      });
    }

    if (gemstone.isListed) {
      return res.status(400).json({
        status: 'error',
        message: 'Gemstone is already listed'
      });
    }

    // Create listing (active immediately)
    const listing = await Listing.create({
      gemstone: gemstoneId,
      seller: req.user._id,
      title,
      description,
      price: {
        amount: price,
        currency: 'LKR',
        negotiable: negotiable || false
      },
      status: 'active',
      publishedAt: new Date()
    });

    // Update gemstone
    gemstone.isListed = true;
    gemstone.status = 'listed';
    await gemstone.save();

    res.status(201).json({
      status: 'success',
      message: 'Listing created successfully and is now live.',
      data: { listing }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Listing creation failed',
      error: error.message
    });
  }
};

// @desc    Update listing
// @route   PUT /api/marketplace/listings/:id
// @access  Private (Seller only)
exports.updateListing = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);

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
        message: 'Not authorized to update this listing'
      });
    }

    const { title, description, price, negotiable, status } = req.body;

    listing.title = title || listing.title;
    listing.description = description || listing.description;
    if (price) listing.price.amount = price;
    if (negotiable !== undefined) listing.price.negotiable = negotiable;
    if (status) listing.status = status;

    await listing.save();

    res.status(200).json({
      status: 'success',
      message: 'Listing updated successfully',
      data: { listing }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Update failed',
      error: error.message
    });
  }
};

// @desc    Delete/Remove listing
// @route   DELETE /api/marketplace/listings/:id
// @access  Private (Seller only)
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

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
        message: 'Not authorized to delete this listing'
      });
    }

    // Update gemstone
    const gemstone = await Gemstone.findById(listing.gemstone);
    if (gemstone) {
      gemstone.isListed = false;
      gemstone.status = 'certified';
      await gemstone.save();
    }

    listing.status = 'removed';
    await listing.save();

    res.status(200).json({
      status: 'success',
      message: 'Listing removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Delete failed',
      error: error.message
    });
  }
};

// @desc    Get my listings (seller)
// @route   GET /api/marketplace/my-listings
// @access  Private (Seller)
exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id })
      .populate('gemstone', 'gemId name type weight images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        count: listings.length,
        listings
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch your listings',
      error: error.message
    });
  }
};

// @desc    Toggle favorite listing
// @route   POST /api/marketplace/listings/:id/favorite
// @access  Private
exports.toggleFavorite = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }

    const user = req.user;
    const isFavorited = user.favoriteListings.includes(listing._id);

    if (isFavorited) {
      user.favoriteListings = user.favoriteListings.filter(
        id => id.toString() !== listing._id.toString()
      );
      listing.favorites = listing.favorites.filter(
        id => id.toString() !== user._id.toString()
      );
    } else {
      user.favoriteListings.push(listing._id);
      listing.favorites.push(user._id);
    }

    await user.save();
    await listing.save();

    res.status(200).json({
      status: 'success',
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      data: { isFavorited: !isFavorited }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update favorite',
      error: error.message
    });
  }
};

// @desc    Verify listing (NGJA Officer)
// @route   POST /api/marketplace/listings/:id/verify
// @access  Private (NGJA Officer)
exports.verifyListing = async (req, res) => {
  try {
    const { notes, approved } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }

    listing.ngjaVerified.verified = approved;
    listing.ngjaVerified.verifiedBy = req.user._id;
    listing.ngjaVerified.verifiedAt = new Date();
    listing.ngjaVerified.notes = notes || '';
    listing.status = approved ? 'active' : 'draft';
    listing.publishedAt = approved ? new Date() : null;

    await listing.save();

    res.status(200).json({
      status: 'success',
      message: approved ? 'Listing approved and published' : 'Listing rejected',
      data: { listing }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Verification failed',
      error: error.message
    });
  }
};
