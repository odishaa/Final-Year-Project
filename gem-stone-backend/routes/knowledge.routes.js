const express = require('express');
const router = express.Router();
const {
  createArticle,
  getAllArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  getArticlesByCategory,
  getPopularArticles
} = require('../controllers/knowledge.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.route('/')
  .get(getAllArticles)
  .post(protect, authorize('ngja_officer', 'admin'), createArticle);

router.get('/popular', getPopularArticles);
router.get('/category/:category', getArticlesByCategory);

router.route('/:slug')
  .get(getArticle);

router.route('/:id')
  .put(protect, updateArticle)
  .delete(protect, deleteArticle);

router.post('/:id/like', protect, likeArticle);

module.exports = router;
