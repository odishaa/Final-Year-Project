const Gemstone = require('../models/Gemstone.model');
const BlockchainService = require('../utils/blockchain.utils');
const web3Service = require('../utils/web3.utils');

// @desc    Register new gemstone
// @route   POST /api/gemstones
// @access  Private
exports.registerGemstone = async (req, res) => {
  try {
    const gemstoneData = {
      ...req.body,
      currentOwner: req.user._id,
      ownershipHistory: [{
        owner: req.user._id,
        transferDate: new Date(),
        transactionHash: 'initial'
      }]
    };

    // OLD BLOCKCHAIN (MongoDB)
    const blockData = {
      action: 'registration',
      gemstoneData: gemstoneData,
      registeredBy: req.user._id,
      timestamp: new Date().toISOString()
    };

    const block = await BlockchainService.addBlock(
      blockData,
      'registration',
      null,
      req.user._id
    );

    gemstoneData.blockchainHash = block.hash;
    gemstoneData.previousHash = block.previousHash;

    // Save to MongoDB
    const gemstone = await Gemstone.create(gemstoneData);

    // Update block with gemstone ID
    await BlockchainService.getBlockByHash(block.hash).then(async (b) => {
      b.gemstoneId = gemstone._id;
      await b.save();
    });

    // 🔥 NEW: Register on REAL Smart Contract (Ganache)
    const smartContractResult = await web3Service.registerGemstoneOnChain(gemstone, 0);
    
    console.log('📊 MongoDB Hash:', block.hash);
    console.log('🔗 Smart Contract Tx:', smartContractResult.transactionHash);

    res.status(201).json({
      status: 'success',
      message: 'Gemstone registered successfully',
      data: {
        gemstone,
        mongodb: {
          blockchainHash: block.hash
        },
        smartContract: smartContractResult // NEW!
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gemstone registration failed',
      error: error.message
    });
  }
};

// @desc    Get all gemstones
// @route   GET /api/gemstones
// @access  Public
exports.getAllGemstones = async (req, res) => {
  try {
    const { type, status, certified, page = 1, limit = 10 } = req.query;
    
    const query = { isPublic: true };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (certified) query['ngja.certified'] = certified === 'true';

    const gemstones = await Gemstone.find(query)
      .populate('currentOwner', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Gemstone.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        gemstones,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch gemstones',
      error: error.message
    });
  }
};

// @desc    Get single gemstone
// @route   GET /api/gemstones/:id
// @access  Public
exports.getGemstone = async (req, res) => {
  try {
    const gemstone = await Gemstone.findById(req.params.id)
      .populate('currentOwner', 'name email phone')
      .populate('ownershipHistory.owner', 'name email');

    if (!gemstone) {
      return res.status(404).json({
        status: 'error',
        message: 'Gemstone not found'
      });
    }

    // Get blockchain history
    const blockchainHistory = await BlockchainService.getGemstoneBlocks(gemstone._id);

    res.status(200).json({
      status: 'success',
      data: {
        gemstone,
        blockchainHistory
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch gemstone',
      error: error.message
    });
  }
};

// @desc    Get gemstone by GEM ID
// @route   GET /api/gemstones/gem/:gemId
// @access  Public
exports.getGemstoneByGemId = async (req, res) => {
  try {
    const gemstone = await Gemstone.findOne({ gemId: req.params.gemId.toUpperCase() })
      .populate('currentOwner', 'name email');

    if (!gemstone) {
      return res.status(404).json({
        status: 'error',
        message: 'Gemstone not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        gemstone
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch gemstone',
      error: error.message
    });
  }
};

// @desc    Update gemstone
// @route   PUT /api/gemstones/:id
// @access  Private
exports.updateGemstone = async (req, res) => {
  try {
    let gemstone = await Gemstone.findById(req.params.id);

    if (!gemstone) {
      return res.status(404).json({
        status: 'error',
        message: 'Gemstone not found'
      });
    }

    // Check ownership
    if (gemstone.currentOwner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this gemstone'
      });
    }

    // Create blockchain entry for update
    const blockData = {
      action: 'update',
      gemstoneId: gemstone._id,
      updates: req.body,
      updatedBy: req.user._id,
      timestamp: new Date().toISOString()
    };

    const block = await BlockchainService.addBlock(
      blockData,
      'update',
      gemstone._id,
      req.user._id
    );

    // Update gemstone
    gemstone = await Gemstone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Gemstone updated successfully',
      data: {
        gemstone,
        blockchainHash: block.hash
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

// @desc    Transfer gemstone ownership
// @route   POST /api/gemstones/:id/transfer
// @access  Private
exports.transferOwnership = async (req, res) => {
  try {
    const { newOwnerId } = req.body;
    const gemstone = await Gemstone.findById(req.params.id);

    if (!gemstone) {
      return res.status(404).json({
        status: 'error',
        message: 'Gemstone not found'
      });
    }

    // Check ownership
    if (gemstone.currentOwner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to transfer this gemstone'
      });
    }

    // Create blockchain entry
    const blockData = {
      action: 'transfer',
      gemstoneId: gemstone._id,
      fromOwner: req.user._id,
      toOwner: newOwnerId,
      timestamp: new Date().toISOString()
    };

    const block = await BlockchainService.addBlock(
      blockData,
      'transfer',
      gemstone._id,
      req.user._id
    );

    // Update ownership
    gemstone.ownershipHistory.push({
      owner: newOwnerId,
      transferDate: new Date(),
      transactionHash: block.hash
    });
    gemstone.currentOwner = newOwnerId;
    await gemstone.save();

    res.status(200).json({
      status: 'success',
      message: 'Ownership transferred successfully',
      data: {
        gemstone,
        blockchainHash: block.hash
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Transfer failed',
      error: error.message
    });
  }
};

// @desc    Get my gemstones
// @route   GET /api/gemstones/my/collection
// @access  Private
exports.getMyGemstones = async (req, res) => {
  try {
    const gemstones = await Gemstone.find({ currentOwner: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        count: gemstones.length,
        gemstones
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch your gemstones',
      error: error.message
    });
  }
};

// @desc    Delete gemstone
// @route   DELETE /api/gemstones/:id
// @access  Private (Admin only)
exports.deleteGemstone = async (req, res) => {
  try {
    const gemstone = await Gemstone.findById(req.params.id);

    if (!gemstone) {
      return res.status(404).json({
        status: 'error',
        message: 'Gemstone not found'
      });
    }

    await gemstone.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Gemstone deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Delete failed',
      error: error.message
    });
  }
};
