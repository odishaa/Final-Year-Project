const express = require('express');
const router = express.Router();
const {
  registerGemstone,
  getAllGemstones,
  getGemstone,
  getGemstoneByGemId,
  updateGemstone,
  transferOwnership,
  getMyGemstones,
  deleteGemstone
} = require('../controllers/gemstone.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.route('/')
  .get(getAllGemstones)
  .post(protect, registerGemstone);

router.get('/my/collection', protect, getMyGemstones);
router.get('/gem/:gemId', getGemstoneByGemId);

router.route('/:id')
  .get(getGemstone)
  .put(protect, updateGemstone)
  .delete(protect, authorize('admin'), deleteGemstone);

router.post('/:id/transfer', protect, transferOwnership);

module.exports = router;
