const express = require('express');
const router = express.Router();
const {
  submitForCertification,
  certifyGemstone,
  verifyCertificate,
  getPendingCertifications,
  getCertifiedGemstones,
  rejectCertification
} = require('../controllers/ngja.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/certify/:gemstoneId', protect, submitForCertification);
router.post('/approve/:gemstoneId', protect, authorize('ngja_officer', 'admin'), certifyGemstone);
router.post('/reject/:gemstoneId', protect, authorize('ngja_officer', 'admin'), rejectCertification);
router.get('/verify/:certificateNumber', verifyCertificate);
router.get('/pending', protect, authorize('ngja_officer', 'admin'), getPendingCertifications);
router.get('/certified', getCertifiedGemstones);

module.exports = router;
