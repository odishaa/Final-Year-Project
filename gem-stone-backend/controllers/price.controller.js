const PriceHistory = require('../models/PriceHistory.model');
const Gemstone = require('../models/Gemstone.model');

// @desc    Add price data
// @route   POST /api/prices
// @access  Private
exports.addPriceData = async (req, res) => {
  try {
    const priceData = {
      ...req.body,
      addedBy: req.user._id
    };

    const price = await PriceHistory.create(priceData);

    res.status(201).json({
      status: 'success',
      message: 'Price data added successfully',
      data: {
        price
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to add price data',
      error: error.message
    });
  }
};

// @desc    Get price history for gemstone type
// @route   GET /api/prices/:gemstoneType
// @access  Public
exports.getPriceHistory = async (req, res) => {
  try {
    const { gemstoneType } = req.params;
    const { startDate, endDate, quality } = req.query;

    const query = { gemstoneType };
    
    if (quality) query.quality = quality;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const prices = await PriceHistory.find(query)
      .sort({ date: -1 })
      .populate('addedBy', 'name');

    res.status(200).json({
      status: 'success',
      data: {
        count: prices.length,
        prices
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch price history',
      error: error.message
    });
  }
};

// @desc    Get price analysis/trends
// @route   GET /api/prices/analysis/:gemstoneType
// @access  Public
exports.getPriceAnalysis = async (req, res) => {
  try {
    const { gemstoneType } = req.params;
    
    // Get price statistics
    const stats = await PriceHistory.aggregate([
      { $match: { gemstoneType } },
      {
        $group: {
          _id: '$gemstoneType',
          avgPrice: { $avg: '$price.amount' },
          minPrice: { $min: '$price.amount' },
          maxPrice: { $max: '$price.amount' },
          count: { $sum: 1 },
          latestPrice: { $last: '$price.amount' }
        }
      }
    ]);

    // Get price by quality
    const byQuality = await PriceHistory.aggregate([
      { $match: { gemstoneType } },
      {
        $group: {
          _id: '$quality',
          avgPrice: { $avg: '$price.amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgPrice: -1 } }
    ]);

    // Get monthly trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyTrends = await PriceHistory.aggregate([
      {
        $match: {
          gemstoneType,
          date: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          avgPrice: { $avg: '$price.amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        statistics: stats[0] || null,
        byQuality,
        monthlyTrends
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Analysis failed',
      error: error.message
    });
  }
};

// @desc    Get estimated price for gemstone
// @route   POST /api/prices/estimate
// @access  Public
exports.estimatePrice = async (req, res) => {
  try {
    const { gemstoneType, carats, quality, clarity } = req.body;

    // Get similar gemstones from price history
    const query = { gemstoneType };
    if (quality) query.quality = quality;

    const similarPrices = await PriceHistory.find(query)
      .sort({ date: -1 })
      .limit(10);

    if (similarPrices.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No price data available for estimation'
      });
    }

    // Calculate average price per carat
    const avgPricePerCarat = similarPrices.reduce((sum, price) => {
      return sum + (price.price.perCarat ? price.price.amount : price.price.amount / (price.weight.max || 1));
    }, 0) / similarPrices.length;

    const estimatedPrice = avgPricePerCarat * carats;

    // Price range (±20%)
    const priceRange = {
      min: estimatedPrice * 0.8,
      max: estimatedPrice * 1.2,
      estimated: estimatedPrice,
      currency: 'LKR'
    };

    res.status(200).json({
      status: 'success',
      message: 'Price estimated based on market data',
      data: {
        priceRange,
        basedOn: similarPrices.length,
        factors: {
          gemstoneType,
          carats,
          quality,
          clarity
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Estimation failed',
      error: error.message
    });
  }
};

// @desc    Get market overview
// @route   GET /api/prices/market/overview
// @access  Public
exports.getMarketOverview = async (req, res) => {
  try {
    // Get price data for all gemstone types
    const overview = await PriceHistory.aggregate([
      {
        $group: {
          _id: '$gemstoneType',
          avgPrice: { $avg: '$price.amount' },
          count: { $sum: 1 },
          lastUpdated: { $max: '$date' }
        }
      },
      { $sort: { avgPrice: -1 } }
    ]);

    // Get total gemstones registered
    const totalGemstones = await Gemstone.countDocuments();
    const certifiedGemstones = await Gemstone.countDocuments({ 'ngja.certified': true });

    res.status(200).json({
      status: 'success',
      data: {
        pricesByType: overview,
        gemstoneStats: {
          total: totalGemstones,
          certified: certifiedGemstones
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch market overview',
      error: error.message
    });
  }
};
