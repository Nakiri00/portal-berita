const express = require('express');
const router = express.Router();
const { forgotPassword, resetPassword, verifyResetToken } = require('../controllers/passwordController');

// Forgot password - request reset link
router.post('/forgot-password', forgotPassword);

// Reset password - update password with token
router.post('/reset-password', resetPassword);

// Verify reset token
router.get('/verify-reset-token/:token', verifyResetToken);

module.exports = router;
