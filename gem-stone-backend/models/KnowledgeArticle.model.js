const mongoose = require('mongoose');

const knowledgeArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide article title'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Identification', 'Treatment', 'Mining', 'Pricing', 'Care', 'History', 'Market Trends', 'Certification', 'Other']
  },
  tags: [String],
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    maxlength: 500
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  featuredImage: String,
  relatedGemstones: [{
    type: String // Gemstone types
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate slug before saving
knowledgeArticleSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  this.updatedAt = Date.now();
  next();
});

knowledgeArticleSchema.index({ slug: 1 });
knowledgeArticleSchema.index({ category: 1 });
knowledgeArticleSchema.index({ tags: 1 });

module.exports = mongoose.model('KnowledgeArticle', knowledgeArticleSchema);
