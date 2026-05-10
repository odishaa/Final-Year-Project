const KnowledgeArticle = require('../models/KnowledgeArticle.model');

// @desc    Create knowledge article
// @route   POST /api/knowledge
// @access  Private (NGJA Officer, Admin)
exports.createArticle = async (req, res) => {
  try {
    const articleData = {
      ...req.body,
      author: req.user._id
    };

    const article = await KnowledgeArticle.create(articleData);

    res.status(201).json({
      status: 'success',
      message: 'Article created successfully',
      data: {
        article
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Article creation failed',
      error: error.message
    });
  }
};

// @desc    Get all articles
// @route   GET /api/knowledge
// @access  Public
exports.getAllArticles = async (req, res) => {
  try {
    const { category, tags, search, page = 1, limit = 10 } = req.query;
    
    const query = { isPublished: true };
    
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    const articles = await KnowledgeArticle.find(query)
      .populate('author', 'name')
      .select('-content') // Exclude full content in list view
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ publishedAt: -1 });

    const count = await KnowledgeArticle.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        articles,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch articles',
      error: error.message
    });
  }
};

// @desc    Get single article
// @route   GET /api/knowledge/:slug
// @access  Public
exports.getArticle = async (req, res) => {
  try {
    const article = await KnowledgeArticle.findOne({ slug: req.params.slug })
      .populate('author', 'name email');

    if (!article) {
      return res.status(404).json({
        status: 'error',
        message: 'Article not found'
      });
    }

    // Increment views
    article.views += 1;
    await article.save();

    res.status(200).json({
      status: 'success',
      data: {
        article
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch article',
      error: error.message
    });
  }
};

// @desc    Update article
// @route   PUT /api/knowledge/:id
// @access  Private (Author, Admin)
exports.updateArticle = async (req, res) => {
  try {
    let article = await KnowledgeArticle.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        status: 'error',
        message: 'Article not found'
      });
    }

    // Check authorization
    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this article'
      });
    }

    article = await KnowledgeArticle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Article updated successfully',
      data: {
        article
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Update failed',
      error: error.message
    });
  }
};

// @desc    Delete article
// @route   DELETE /api/knowledge/:id
// @access  Private (Author, Admin)
exports.deleteArticle = async (req, res) => {
  try {
    const article = await KnowledgeArticle.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        status: 'error',
        message: 'Article not found'
      });
    }

    // Check authorization
    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this article'
      });
    }

    await article.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Article deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Delete failed',
      error: error.message
    });
  }
};

// @desc    Like article
// @route   POST /api/knowledge/:id/like
// @access  Private
exports.likeArticle = async (req, res) => {
  try {
    const article = await KnowledgeArticle.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        status: 'error',
        message: 'Article not found'
      });
    }

    article.likes += 1;
    await article.save();

    res.status(200).json({
      status: 'success',
      message: 'Article liked',
      data: {
        likes: article.likes
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to like article',
      error: error.message
    });
  }
};

// @desc    Get articles by category
// @route   GET /api/knowledge/category/:category
// @access  Public
exports.getArticlesByCategory = async (req, res) => {
  try {
    const articles = await KnowledgeArticle.find({
      category: req.params.category,
      isPublished: true
    })
      .populate('author', 'name')
      .select('-content')
      .sort({ publishedAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        count: articles.length,
        articles
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch articles',
      error: error.message
    });
  }
};

// @desc    Get popular articles
// @route   GET /api/knowledge/popular
// @access  Public
exports.getPopularArticles = async (req, res) => {
  try {
    const articles = await KnowledgeArticle.find({ isPublished: true })
      .populate('author', 'name')
      .select('-content')
      .sort({ views: -1, likes: -1 })
      .limit(10);

    res.status(200).json({
      status: 'success',
      data: {
        articles
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch popular articles',
      error: error.message
    });
  }
};
