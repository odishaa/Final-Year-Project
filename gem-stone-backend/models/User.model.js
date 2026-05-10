const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'buyer', 'seller', 'ngja_officer', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    province: String,
    country: { type: String, default: 'Sri Lanka' },
    postalCode: String
  },
  
  // Seller specific
  sellerInfo: {
    businessName: String,
    licenseNumber: String,
    verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalSales: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  
  // Buyer specific
  buyerInfo: {
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalPurchases: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  ngjaLicenseNumber: {
    type: String,
    sparse: true
  },
  
  // Preferences
  favoriteListings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
