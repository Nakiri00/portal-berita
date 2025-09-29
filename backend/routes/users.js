// backend/routes/users.js

const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/userController'); 

// Rute Publik untuk mendapatkan profil penulis
router.route('/:id').get(getUserProfile);

module.exports = router;