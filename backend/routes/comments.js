const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
    getArticleComments,
    addComment,
    addReply,
    toggleCommentLike
} = require('../controllers/commentController');

const router = express.Router();

// Public: Ambil semua komentar untuk artikel (dengan optionalAuth untuk status like)
router.route('/:articleId').get(optionalAuth, getArticleComments);

// Protected: Tambah Komentar Utama
router.route('/:articleId').post(authenticate, addComment);

// Protected: Balas Komentar
router.route('/:articleId/:commentId/reply').post(authenticate, addReply);

// Protected: Like/Unlike Komentar (atau Balasan)
router.route('/:articleId/:commentId/like').post(authenticate, toggleCommentLike); 

module.exports = router;