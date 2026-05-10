const express = require('express');
const router = express.Router();
const {
  getBlockchainInfo,
  getAllBlocks,
  getBlockByHash,
  verifyBlockchain,
  getGemstoneBlockchain,
  initializeBlockchain
} = require('../controllers/blockchain.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/info', getBlockchainInfo);
router.get('/blocks', getAllBlocks);
router.get('/block/:hash', getBlockByHash);
router.get('/verify', verifyBlockchain);
router.get('/gemstone/:gemstoneId', getGemstoneBlockchain);
router.post('/init', initializeBlockchain); // Made public for easy testing

module.exports = router;
