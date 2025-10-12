// backend/routes/users.js

const express = require('express');
const router = express.Router();
const { getUserProfile, toggleArticleLike} = require('../controllers/userController'); 
const { authenticate } = require('../middleware/auth'); 
// const { toggleArticleLike } = require('../controllers/userController'); 

// Rute Publik untuk mendapatkan profil penulis
router.route('/:id').get(getUserProfile);
router.route('/article/:articleId/like').put(authenticate, toggleArticleLike);

module.exports = router;