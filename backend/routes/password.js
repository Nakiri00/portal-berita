const express = require('express');
const router = express.Router();

const { forgotPassword, resetPassword, verifyResetToken} = require('../controllers/passwordController');

router.post('/forgot-password', forgotPassword);

router.post('/reset/:token', resetPassword); 

router.get('/verify-reset-token/:token', verifyResetToken);

module.exports = router;