const Transaction = require('../models/Transaction.model');
const Listing = require('../models/Listing.model');
const Gemstone = require('../models/Gemstone.model');
const User = require('../models/User.model');
const web3Service = require('../utils/web3.utils');
const BlockchainService = require('../utils/blockchain.utils');

// @desc    Purchase a gemstone
// @route   POST /api/transactions/purchase
// @access  Private (Buyer)
exports.createPurchase = async (req, res) => {
  try {
    const { listingId, paymentMethod } = req.body;

    const listing = await Listing.findById(listingId)
      .populate('gemstone')
      .populate('seller');

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }

    if (listing.status !== 'active' && listing.status !== 'reserved') {
      return res.status(400).json({
        status: 'error',
        message: 'This listing is not available for purchase'
      });
    }

    // Can't buy your own listing
    if (listing.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot purchase your own listing'
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      listing: listingId,
      gemstone: listing.gemstone._id,
      seller: listing.seller._id,
      buyer: req.user._id,
      price: listing.price,
      paymentMethod,
      status: 'pending'
    });

    // Update listing status
    listing.status = 'reserved';
    await listing.save();

    await transaction.populate([
      { path: 'buyer', select: 'name email' },
      { path: 'seller', select: 'name email' },
      { path: 'gemstone', select: 'gemId name type' }
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Purchase initiated. Please complete payment.',
      data: { transaction }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Purchase failed',
      error: error.message
    });
  }
};

// @desc    Get my purchases (buyer)
// @route   GET /api/transactions/my-purchases
// @access  Private (Buyer)
exports.getMyPurchases = async (req, res) => {
  try {
    const transactions = await Transaction.find({ buyer: req.user._id })
      .populate({
        path: 'gemstone',
        select: 'gemId name type images weight'
      })
      .populate('seller', 'name email sellerInfo')
      .populate('listing', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        count: transactions.length,
        transactions
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch purchases',
      error: error.message
    });
  }
};

// @desc    Get my sales (seller)
// @route   GET /api/transactions/my-sales
// @access  Private (Seller)
exports.getMySales = async (req, res) => {
  try {
    const transactions = await Transaction.find({ seller: req.user._id })
      .populate({
        path: 'gemstone',
        select: 'gemId name type images'
      })
      .populate('buyer', 'name email buyerInfo')
      .populate('listing', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        count: transactions.length,
        transactions
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch sales',
      error: error.message
    });
  }
};

// @desc    Complete transaction (transfer ownership on blockchain)
// @route   PUT /api/transactions/:id/complete
// @access  Private (Seller)
exports.completeTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('gemstone')
      .populate('buyer')
      .populate('seller');

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }

    // Check authorization
    if (transaction.seller._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }

    if (transaction.paymentStatus !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Payment must be completed first'
      });
    }

    const gemstone = await Gemstone.findById(transaction.gemstone._id);
    
    // Create blockchain entry for ownership transfer
    const blockData = {
      action: 'transfer',
      gemstoneId: gemstone._id,
      fromOwner: transaction.seller._id,
      toOwner: transaction.buyer._id,
      transactionId: transaction._id,
      timestamp: new Date().toISOString()
    };

    const block = await BlockchainService.addBlock(
      blockData,
      'transfer',
      gemstone._id,
      req.user._id
    );

    // Transfer ownership on smart contract (if available)
    let smartContractTx = null;
    try {
      // Note: This requires buyer's wallet address
      // For now, we'll use account index 2 as placeholder
      // In production, buyer would provide their wallet address
      smartContractTx = await web3Service.transferOwnershipOnChain(
        gemstone.gemId,
        transaction.buyer.walletAddress || process.env.DEFAULT_BUYER_ADDRESS,
        0 // Seller account index
      );
    } catch (error) {
      console.error('Smart contract transfer failed:', error);
    }

    // Update gemstone ownership
    gemstone.ownershipHistory.push({
      owner: transaction.buyer._id,
      transferDate: new Date(),
      transactionHash: smartContractTx?.transactionHash || block.hash
    });
    gemstone.currentOwner = transaction.buyer._id;
    gemstone.status = 'transferred';
    gemstone.isListed = false;
    await gemstone.save();

    // Update transaction
    transaction.status = 'ownership_transferred';
    transaction.blockchainTxHash = smartContractTx?.transactionHash || block.hash;
    await transaction.save();

    // Update listing
    const listing = await Listing.findById(transaction.listing);
    if (listing) {
      listing.status = 'sold';
      listing.soldAt = new Date();
      listing.soldTo = transaction.buyer._id;
      await listing.save();
    }

    // Update seller stats
    const seller = await User.findById(transaction.seller._id);
    if (seller.sellerInfo) {
      seller.sellerInfo.totalSales += 1;
      await seller.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Ownership transferred successfully',
      data: {
        transaction,
        blockchainHash: block.hash,
        smartContractTx
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete transaction',
      error: error.message
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/transactions/:id/payment
// @access  Private (Buyer or Admin)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentProof } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }

    // Check authorization
    if (transaction.buyer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }

    transaction.paymentStatus = paymentStatus;
    if (paymentProof) transaction.paymentProof = paymentProof;
    
    if (paymentStatus === 'completed') {
      transaction.status = 'payment_received';
    }

    await transaction.save();

    res.status(200).json({
      status: 'success',
      message: 'Payment status updated',
      data: { transaction }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update payment',
      error: error.message
    });
  }
};

// @desc    Rate transaction
// @route   POST /api/transactions/:id/rate
// @access  Private (Buyer or Seller)
exports.rateTransaction = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'ownership_transferred' && transaction.status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Transaction must be completed before rating'
      });
    }

    const isBuyer = transaction.buyer.toString() === req.user._id.toString();
    const isSeller = transaction.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to rate this transaction'
      });
    }

    if (isBuyer) {
      if (transaction.buyerRating.rating) {
        return res.status(400).json({
          status: 'error',
          message: 'You have already rated this transaction'
        });
      }
      transaction.buyerRating = {
        rating,
        review,
        ratedAt: new Date()
      };

      // Update seller rating
      const seller = await User.findById(transaction.seller);
      if (seller.sellerInfo) {
        const currentTotal = seller.sellerInfo.rating * seller.sellerInfo.totalReviews;
        seller.sellerInfo.totalReviews += 1;
        seller.sellerInfo.rating = (currentTotal + rating) / seller.sellerInfo.totalReviews;
        await seller.save();
      }
    }

    if (isSeller) {
      if (transaction.sellerRating.rating) {
        return res.status(400).json({
          status: 'error',
          message: 'You have already rated this transaction'
        });
      }
      transaction.sellerRating = {
        rating,
        review,
        ratedAt: new Date()
      };

      // Update buyer rating
      const buyer = await User.findById(transaction.buyer);
      if (buyer.buyerInfo) {
        const currentTotal = buyer.buyerInfo.rating * buyer.buyerInfo.totalReviews;
        buyer.buyerInfo.totalReviews += 1;
        buyer.buyerInfo.rating = (currentTotal + rating) / buyer.buyerInfo.totalReviews;
        await buyer.save();
      }
    }

    // Mark as completed if both rated
    if (transaction.buyerRating.rating && transaction.sellerRating.rating) {
      transaction.status = 'completed';
      transaction.completedAt = new Date();
    }

    await transaction.save();

    res.status(200).json({
      status: 'success',
      message: 'Rating submitted successfully',
      data: { transaction }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit rating',
      error: error.message
    });
  }
};