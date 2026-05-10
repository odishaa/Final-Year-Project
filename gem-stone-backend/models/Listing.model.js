const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  gemstone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gemstone',
    required: true,
    unique: true
  },
  
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Pricing
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'LKR'
    },
    negotiable: {
      type: Boolean,
      default: false
    }
  },
  
  // Listing Details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'pending_verification', 'active', 'reserved', 'sold', 'removed'],
    default: 'draft'
  },
  
  // NGJA Verification for Listing
  ngjaVerified: {
    verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    notes: String
  },
  
  // Views & Engagement
  views: { type: Number, default: 0 },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Featured
  isFeatured: { type: Boolean, default: false },
  featuredUntil: Date,
  
  // Metadata
  publishedAt: Date,
  soldAt: Date,
  soldTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
listingSchema.index({ seller: 1, status: 1 });
listingSchema.index({ status: 1, publishedAt: -1 });
listingSchema.index({ 'price.amount': 1 });

// Update timestamp
listingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Listing', listingSchema);