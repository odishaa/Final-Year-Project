const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  offerAmount: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'LKR'
    }
  },
  
  message: String,
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'expired'],
    default: 'pending'
  },
  
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 7*24*60*60*1000) // 7 days
  },
  
  respondedAt: Date,
  sellerResponse: String,
  
  createdAt: { type: Date, default: Date.now }
});

// Indexes
offerSchema.index({ listing: 1, status: 1 });
offerSchema.index({ buyer: 1, status: 1 });
offerSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Offer', offerSchema);