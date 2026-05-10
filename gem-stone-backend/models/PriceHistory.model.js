const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  gemstoneType: {
    type: String,
    required: true
  },
  variety: String,
  weight: {
    min: Number,
    max: Number,
    unit: { type: String, default: 'carats' }
  },
  quality: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Premium']
  },
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'LKR'
    },
    perCarat: Boolean
  },
  source: {
    type: String,
    enum: ['market', 'auction', 'dealer', 'official', 'estimated'],
    default: 'market'
  },
  location: {
    country: String,
    city: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: String,
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

priceHistorySchema.index({ gemstoneType: 1, date: -1 });
priceHistorySchema.index({ date: -1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
