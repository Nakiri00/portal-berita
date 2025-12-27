const express = require('express');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth'); // Pastikan import authorize
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
    logArticleViewAndIncrement,
    getEditorArticles
} = require('../controllers/articleController');
const { uploadArticle } = require('../middleware/uploads');
const router = express.Router();

// --- PUBLIC ROUTES ---
router.get('/', getAllArticles); // GET /api/articles
router.get('/featured', getFeaturedArticles); // GET /api/articles/featured
router.get('/author/:authorId', getArticlesByAuthor); // GET /api/articles/author/:authorId
router.get('/editor/manage', authenticate, authorize('editor'), getEditorArticles); // GET /api/articles/editor/manage
router.get('/:id', optionalAuth, getArticleById); // GET /api/articles/:id

// --- PROTECTED ROUTES ---
router.use(authenticate); 

// 1. Social Features (User Biasa, Writer, dll bisa)
router.post('/:id/like', toggleArticleLike);
router.post('/:id/view', logArticleViewAndIncrement);

// 2. Writer/Dashboard Features
// Mengambil artikel milik sendiri (Intern/Writer/Editor bisa akses ini)
router.get('/writer/my-articles', authorize('intern', 'writer', 'editor'), getWriterArticles);
router.get('/editor/all', authenticate, authorize('editor', 'admin'), getEditorArticles);

// 3. Article Management (Create/Update/Delete)

// CREATE: Admin DIHAPUS. Intern, Writer, Editor BOLEH.
router.post('/create', 
    authorize('intern', 'writer', 'editor'), 
    uploadArticle, 
    createArticle
);

// UPDATE: Admin DIHAPUS. Intern, Writer, Editor BOLEH.
// (Pembatasan Intern & Writer dilakukan di Controller)
router.put('/:id', 
    authorize('intern', 'writer', 'editor'), 
    uploadArticle, 
    updateArticle
);

// DELETE: Admin DIHAPUS. Intern DIHAPUS.
// Hanya Writer (hapus punya sendiri) dan Editor (hapus semua) yang boleh.
router.delete('/:id', 
    authorize('writer', 'editor'), 
    deleteArticle
);

module.exports = router;