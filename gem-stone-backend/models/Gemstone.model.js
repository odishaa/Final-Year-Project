const mongoose = require('mongoose');

const gemstoneSchema = new mongoose.Schema({
  // Basic Information
  gemId: {
    type: String,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Please provide gemstone name'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Sapphire', 'Ruby', 'Emerald', 'Topaz', 'Garnet', 'Amethyst', 'Aquamarine', 'Tourmaline', 'Spinel', 'Zircon', 'Other']
  },
  variety: String,
  
  // Physical Properties
  weight: {
    carats: {
      type: Number,
      required: true
    },
    grams: Number
  },
  dimensions: {
    length: Number,
    width: Number,
    depth: Number,
    unit: { type: String, default: 'mm' }
  },
  color: {
    primary: String,
    secondary: String,
    intensity: { type: String, enum: ['Light', 'Medium', 'Dark', 'Vivid'] }
  },
  clarity: {
    type: String,
    enum: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3']
  },
  cut: {
    type: String,
    enum: ['Round', 'Oval', 'Cushion', 'Emerald', 'Princess', 'Pear', 'Marquise', 'Cabochon', 'Other']
  },
  shape: String,
  
  // Origin & Mining
  origin: {
    country: { type: String, default: 'Sri Lanka' },
    region: String,
    mine: String
  },
  treatment: {
    type: String,
    enum: ['None', 'Heat Treated', 'Diffused', 'Oiled', 'Irradiated', 'Other'],
    default: 'None'
  },
  
  // NGJA Certification
  ngja: {
    certified: { type: Boolean, default: false },
    certificateNumber: String,
    certificationDate: Date,
    certifiedBy: String,
    reportUrl: String
  },
  
  // Blockchain
  blockchainHash: {
    type: String,
    required: true,
    unique: true
  },
  previousHash: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  // Ownership
  currentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownershipHistory: [{
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transferDate: Date,
    transactionHash: String
  }],
  
  // Pricing
  estimatedValue: {
    amount: Number,
    currency: { type: String, default: 'LKR' },
    lastUpdated: Date
  },
  
  // ⭐ UPDATED: Enhanced Images Array for Marketplace
  images: [{
    filename: String,          // ⭐ NEW: Original filename
    path: String,              // ⭐ NEW: Server path
    url: String,               // Kept: Public URL
    caption: String,           // Kept: Image caption
    isPrimary: { type: Boolean, default: false },  // Kept: Primary image flag
    uploadedAt: { type: Date, default: Date.now }  // ⭐ NEW: Upload timestamp
  }],
  
  certificates: [{
    type: String,
    issuer: String,
    url: String
  }],
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'verified', 'certified', 'listed', 'sold', 'transferred'],
    default: 'pending'
  },
  
  // ⭐ NEW: Marketplace Listing Status
  isListed: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  description: String,
  notes: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique GEM ID before saving
gemstoneSchema.pre('save', async function(next) {
  if (!this.gemId) {
    const prefix = this.type.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.gemId = `${prefix}-${timestamp}-${random}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
gemstoneSchema.index({ gemId: 1 });
gemstoneSchema.index({ blockchainHash: 1 });
gemstoneSchema.index({ currentOwner: 1 });
gemstoneSchema.index({ 'ngja.certificateNumber': 1 });
gemstoneSchema.index({ isListed: 1, status: 1 });  // ⭐ NEW: Index for marketplace queries

module.exports = mongoose.model('Gemstone', gemstoneSchema);