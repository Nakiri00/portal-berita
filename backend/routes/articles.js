const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getAllArticles,
  getArticleById,
  getArticlesByAuthor,
  getWriterArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  getFeaturedArticles
} = require('../controllers/articleController');
const multer = require('multer');
const path = require('path');
const uploadPath = path.join(__dirname,'..', '..', 'src', 'uploads'); 
const storage = multer.diskStorage({
  destination: uploadPath,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });
const router = express.Router();

// Public routes
router.get('/', getAllArticles); // GET /api/articles
router.get('/featured', getFeaturedArticles); // GET /api/articles/featured
router.get('/author/:authorId', getArticlesByAuthor); // GET /api/articles/author/:authorId
router.get('/:id', getArticleById); // GET /api/articles/:id
router.post('/:id/like', likeArticle); // POST /api/articles/:id/like

// Protected routes (requires authentication)
router.use(authenticate);

// Writer routes
router.get('/writer/my-articles', getWriterArticles); // GET /api/articles/writer/my-articles
router.post('/writer/create', authenticate, upload.single('imageFile'), createArticle); // POST /api/articles/writer/create
router.put('/writer/:id', updateArticle); // PUT /api/articles/writer/:id
router.delete('/writer/:id', deleteArticle); // DELETE /api/articles/writer/:id

module.exports = router;
