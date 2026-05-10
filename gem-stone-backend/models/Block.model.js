const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  previousHash: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true,
    unique: true
  },
  nonce: {
    type: Number,
    default: 0
  },
  // Additional metadata
  transactionType: {
    type: String,
    enum: ['registration', 'transfer', 'certification', 'update'],
    required: true
  },
  gemstoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gemstone'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verified: {
    type: Boolean,
    default: false
  }
});

// Index for faster queries
blockSchema.index({ hash: 1 });
blockSchema.index({ gemstoneId: 1 });
blockSchema.index({ index: -1 });

module.exports = mongoose.model('Block', blockSchema);
