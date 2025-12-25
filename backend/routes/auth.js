const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { uploadProfilePicture } = require('../middleware/uploads'); // Pastikan path import benar

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);

// [PERBAIKAN] Hapus route duplikat, HANYA gunakan satu baris ini:
router.put('/profile', authenticate, uploadProfilePicture, updateProfile);

router.put('/change-password', authenticate, changePassword);
router.post('/logout', authenticate, logout);

module.exports = router;