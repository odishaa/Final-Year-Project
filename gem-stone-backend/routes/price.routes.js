const express = require('express');
const router = express.Router();
const {
  addPriceData,
  getPriceHistory,
  getPriceAnalysis,
  estimatePrice,
  getMarketOverview
} = require('../controllers/price.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', protect, authorize('admin', 'ngja_officer'), addPriceData);
router.get('/market/overview', getMarketOverview);
router.get('/analysis/:gemstoneType', getPriceAnalysis);
router.get('/:gemstoneType', getPriceHistory);
router.post('/estimate', estimatePrice);

module.exports = router;
