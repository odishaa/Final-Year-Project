const BlockchainService = require('../utils/blockchain.utils');
const Block = require('../models/Block.model');

// @desc    Get blockchain info
// @route   GET /api/blockchain/info
// @access  Public
exports.getBlockchainInfo = async (req, res) => {
  try {
    const stats = await BlockchainService.getBlockchainStats();

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get blockchain info',
      error: error.message
    });
  }
};

// @desc    Get all blocks
// @route   GET /api/blockchain/blocks
// @access  Public
exports.getAllBlocks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const blocks = await Block.find()
      .populate('gemstoneId', 'gemId name type')
      .populate('userId', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ index: -1 });

    const count = await Block.countDocuments();

    res.status(200).json({
      status: 'success',
      data: {
        blocks,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch blocks',
      error: error.message
    });
  }
};

// @desc    Get block by hash
// @route   GET /api/blockchain/block/:hash
// @access  Public
exports.getBlockByHash = async (req, res) => {
  try {
    const block = await BlockchainService.getBlockByHash(req.params.hash);

    if (!block) {
      return res.status(404).json({
        status: 'error',
        message: 'Block not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        block
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch block',
      error: error.message
    });
  }
};

// @desc    Verify blockchain integrity
// @route   GET /api/blockchain/verify
// @access  Public
exports.verifyBlockchain = async (req, res) => {
  try {
    const result = await BlockchainService.verifyChain();

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Verification failed',
      error: error.message
    });
  }
};

// @desc    Get gemstone blockchain history
// @route   GET /api/blockchain/gemstone/:gemstoneId
// @access  Public
exports.getGemstoneBlockchain = async (req, res) => {
  try {
    const blocks = await BlockchainService.getGemstoneBlocks(req.params.gemstoneId);

    res.status(200).json({
      status: 'success',
      data: {
        count: blocks.length,
        blocks
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch gemstone blockchain',
      error: error.message
    });
  }
};

// @desc    Initialize blockchain (Genesis block)
// @route   POST /api/blockchain/init
// @access  Private (Admin only)
exports.initializeBlockchain = async (req, res) => {
  try {
    const genesisBlock = await BlockchainService.createGenesisBlock();

    res.status(200).json({
      status: 'success',
      message: 'Blockchain initialized',
      data: {
        genesisBlock
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Initialization failed',
      error: error.message
    });
  }
};
