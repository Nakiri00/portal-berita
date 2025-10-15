const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  getAllArticles,
  getArticleById,
  getArticlesByAuthor,
  getWriterArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleArticleLike,
  getFeaturedArticles,
  logArticleViewAndIncrement
} = require('../controllers/articleController');
const {uploadArticle} = require('../middleware/uploads');
const router = express.Router();

// Public routes
router.get('/', getAllArticles); // GET /api/articles
router.get('/featured', getFeaturedArticles); // GET /api/articles/featured
router.get('/author/:authorId', getArticlesByAuthor); // GET /api/articles/author/:authorId
router.get('/:id', optionalAuth, getArticleById); // GET /api/articles/:id

// Protected routes (requires authentication)
router.use(authenticate);

// Writer routes
router.post('/:id/like', toggleArticleLike); // POST /api/articles/:id/like
router.post('/:id/view', logArticleViewAndIncrement); // POST /api/articles/:id/view 
router.get('/writer/my-articles', getWriterArticles); // GET /api/articles/writer/my-articles
router.post('/writer/create', authenticate, uploadArticle, createArticle); // POST /api/articles/writer/create
router.put('/writer/:id', updateArticle); // PUT /api/articles/writer/:id
router.delete('/writer/:id', deleteArticle); // DELETE /api/articles/writer/:id

module.exports = router;
