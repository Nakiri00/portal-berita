const crypto = require('crypto');
const User = require('../models/User');
const ResetToken = require('../models/ResetToken');
const jwt = require('jsonwebtoken');
const { sendResetPasswordEmail } = require('../services/emailService');

// Forgot Password - Generate reset token and send email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email diperlukan'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User dengan email tersebut tidak ditemukan'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Save reset token to database
    const resetTokenDoc = new ResetToken({
      userId: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
    });

    await resetTokenDoc.save();

    // Generate reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    console.log(`Reset link for ${email}: ${resetLink}`);

    // Send email
    const emailResult = await sendResetPasswordEmail(email, resetLink, user.name);
    
    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Link reset password telah dikirim ke email Anda',
        resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined // Only show in development
      });
    } else {
      // If email fails, still return success but with warning
      console.error('Email sending failed:', emailResult.error);
      res.json({
        success: true,
        message: 'Link reset password telah dibuat, tetapi gagal mengirim email. Silakan hubungi admin.',
        resetLink: resetLink // Always show link if email fails
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memproses permintaan reset password'
    });
  }
};

// Reset Password - Verify token and update password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token dan password baru diperlukan'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter'
      });
    }

    // Find valid reset token
    const resetTokenDoc = await ResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!resetTokenDoc) {
      return res.status(400).json({
        success: false,
        message: 'Token tidak valid atau sudah kadaluarsa'
      });
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await User.findByIdAndUpdate(resetTokenDoc.userId._id, {
      password: hashedPassword
    });

    // Mark token as used
    resetTokenDoc.used = true;
    await resetTokenDoc.save();

    res.json({
      success: true,
      message: 'Password berhasil direset. Silakan login dengan password baru'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mereset password'
    });
  }
};

// Verify Reset Token - Check if token is valid
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token diperlukan'
      });
    }

    // Find valid reset token
    const resetTokenDoc = await ResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetTokenDoc) {
      return res.status(400).json({
        success: false,
        message: 'Token tidak valid atau sudah kadaluarsa'
      });
    }

    res.json({
      success: true,
      message: 'Token valid'
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memverifikasi token'
    });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
  verifyResetToken
};
