const Gemstone = require('../models/Gemstone.model');
const BlockchainService = require('../utils/blockchain.utils');
const web3Service = require('../utils/web3.utils');

// @desc    Submit gemstone for NGJA certification
// @route   POST /api/ngja/certify/:gemstoneId
// @access  Private
exports.submitForCertification = async (req, res) => {
  try {
    const gemstone = await Gemstone.findById(req.params.gemstoneId);

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
        message: 'Not authorized'
      });
    }

    // Update certification status
    gemstone.status = 'pending';
    await gemstone.save();

    res.status(200).json({
      status: 'success',
      message: 'Gemstone submitted for NGJA certification',
      data: {
        gemstone
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Submission failed',
      error: error.message
    });
  }
};

// @desc    Certify gemstone (NGJA Officer only)
// @route   POST /api/ngja/approve/:gemstoneId
// @access  Private (NGJA Officer)
exports.certifyGemstone = async (req, res) => {
  try {
    const { certificateNumber, certifiedBy } = req.body;
    const gemstone = await Gemstone.findById(req.params.gemstoneId);

    if (!gemstone) {
      return res.status(404).json({
        status: 'error',
        message: 'Gemstone not found'
      });
    }

    // OLD BLOCKCHAIN (MongoDB)
    const blockData = {
      action: 'certification',
      gemstoneId: gemstone._id,
      certificateNumber,
      certifiedBy: certifiedBy || req.user.name,
      officerId: req.user._id,
      timestamp: new Date().toISOString()
    };

    const block = await BlockchainService.addBlock(
      blockData,
      'certification',
      gemstone._id,
      req.user._id
    );

    // Update MongoDB
    gemstone.ngja = {
      certified: true,
      certificateNumber,
      certificationDate: new Date(),
      certifiedBy: certifiedBy || req.user.name
    };
    gemstone.status = 'certified';
    await gemstone.save();

    // 🔥 NEW: Certify on Smart Contract
    const smartContractResult = await web3Service.certifyGemstoneOnChain(
      gemstone.gemId,
      certificateNumber,
      certifiedBy || req.user.name,
      1 // NGJA officer account
    );

    console.log('📊 MongoDB Hash:', block.hash);
    console.log('🔗 Smart Contract Tx:', smartContractResult.transactionHash);

    res.status(200).json({
      status: 'success',
      message: 'Gemstone certified successfully',
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
      message: 'Certification failed',
      error: error.message
    });
  }
};

// @desc    Verify NGJA certificate
// @route   GET /api/ngja/verify/:certificateNumber
// @access  Public
exports.verifyCertificate = async (req, res) => {
  try {
    const gemstone = await Gemstone.findOne({
      'ngja.certificateNumber': req.params.certificateNumber
    }).populate('currentOwner', 'name email');

    if (!gemstone) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found',
        verified: false
      });
    }

    // 🔥 NEW: Verify on Smart Contract too
    const blockchainVerification = await web3Service.verifyCertificateOnChain(
      gemstone.gemId,
      req.params.certificateNumber
    );

    res.status(200).json({
      status: 'success',
      message: 'Certificate verified',
      verified: true,
      data: {
        gemstone: {
          gemId: gemstone.gemId,
          name: gemstone.name,
          type: gemstone.type,
          weight: gemstone.weight,
          certificateNumber: gemstone.ngja.certificateNumber,
          certificationDate: gemstone.ngja.certificationDate,
          certifiedBy: gemstone.ngja.certifiedBy
        },
        blockchain: blockchainVerification // NEW!
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Verification failed',
      error: error.message
    });
  }
};

// @desc    Get pending certifications (NGJA Officer)
// @route   GET /api/ngja/pending
// @access  Private (NGJA Officer)
exports.getPendingCertifications = async (req, res) => {
  try {
    const gemstones = await Gemstone.find({ status: 'pending' })
      .populate('currentOwner', 'name email phone')
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
      message: 'Failed to fetch pending certifications',
      error: error.message
    });
  }
};

// @desc    Get all certified gemstones
// @route   GET /api/ngja/certified
// @access  Public
exports.getCertifiedGemstones = async (req, res) => {
  try {
    const gemstones = await Gemstone.find({ 'ngja.certified': true })
      .populate('currentOwner', 'name')
      .sort({ 'ngja.certificationDate': -1 });

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
      message: 'Failed to fetch certified gemstones',
      error: error.message
    });
  }
};

// @desc    Reject certification
// @route   POST /api/ngja/reject/:gemstoneId
// @access  Private (NGJA Officer)
exports.rejectCertification = async (req, res) => {
  try {
    const { reason } = req.body;
    const gemstone = await Gemstone.findById(req.params.gemstoneId);

    if (!gemstone) {
      return res.status(404).json({
        status: 'error',
        message: 'Gemstone not found'
      });
    }

    gemstone.status = 'verified'; // Back to verified status
    gemstone.notes = `Certification rejected: ${reason}`;
    await gemstone.save();

    res.status(200).json({
      status: 'success',
      message: 'Certification rejected',
      data: {
        gemstone
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Rejection failed',
      error: error.message
    });
  }
};
