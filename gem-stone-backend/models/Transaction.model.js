const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  
  gemstone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gemstone',
    required: true
  },
  
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'LKR'
    }
  },
  
  // Payment
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'escrow', 'other']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentProof: String, // File path
  
  // Blockchain Transaction
  blockchainTxHash: String,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'payment_received', 'ownership_transferred', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  
  // Tracking
  completedAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  
  // Ratings
  buyerRating: {
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    ratedAt: Date
  },
  sellerRating: {
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    ratedAt: Date
  },
  
  createdAt: { type: Date, default: Date.now }
});

// Indexes
transactionSchema.index({ buyer: 1, status: 1 });
transactionSchema.index({ seller: 1, status: 1 });
transactionSchema.index({ gemstone: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);