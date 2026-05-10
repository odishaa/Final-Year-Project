const express = require('express');
const router = express.Router();
const web3Service = require('../utils/web3.utils');

// Get smart contract info
router.get('/info', async (req, res) => {
  try {
    const info = web3Service.getContractInfo();
    const stats = await web3Service.getTotalGemstones();
    
    res.json({
      status: 'success',
      data: {
        ...info,
        totalGemstones: stats.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get gemstone from blockchain
// Get gemstone from blockchain
router.get('/gemstone/:gemId', async (req, res) => {
  try {
    const result = await web3Service.getGemstoneFromChain(req.params.gemId);
    
    // The result already has success and data structure
    // Just return it directly with proper status
    if (result.success) {
      res.json({
        status: 'success',
        ...result  // This spreads success: true, data: {...}
      });
    } else {
      res.status(404).json({
        status: 'error',
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      success: false,
      message: error.message
    });
  }
});

// Verify certificate on blockchain
router.get('/verify/:gemId/:certificateNumber', async (req, res) => {
  try {
    const result = await web3Service.verifyCertificateOnChain(
      req.params.gemId,
      req.params.certificateNumber
    );
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;