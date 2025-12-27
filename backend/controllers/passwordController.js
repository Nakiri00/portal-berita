const crypto = require('crypto');
const User = require('../models/User');
const ResetToken = require('../models/ResetToken');
const jwt = require('jsonwebtoken');
const { sendResetPasswordEmail } = require('../services/emailService');

// Forgot Password - Generate reset token and send email
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Email tidak ditemukan' });
    }
    

    // Generate token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendResetPasswordEmail(user.email, resetToken, user.name);

      res.status(200).json({
        success: true,
        message: 'Link reset password telah dikirim ke email Anda.'
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: 'Gagal mengirim email.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 2. RESET PASSWORD (User submit password baru)
const resetPassword = async (req, res) => {
  try {
    const rawToken = req.params.token;
    
    // 1. Validasi Input Dasar
    // Pastikan password dikirim (Mencegah error 'undefined')
    if (!req.body.password || !req.body.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password dan Konfirmasi Password wajib diisi.'
      });
    }

    // 2. Hash token dari URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    // 3. Cari user
    const user = await User.findOne({
      resetPasswordToken: resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token reset password tidak valid atau sudah kadaluarsa.'
      });
    }

    // 4. Cek kecocokan password
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password dan konfirmasi tidak cocok.'
      });
    }

    // 5. Update password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    // Gunakan save() normal agar hook hashing di User.js berjalan
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password berhasil diubah! Silakan login.'
    });

  } catch (error) {
    // Log error detail ke terminal backend agar ketahuan jika ada validasi lain yg gagal (misal: nama kosong)
    console.error("❌ RESET PASSWORD ERROR:", error);
    
    // Kirim pesan error spesifik jika itu error validasi Mongoose
    if (error.name === 'ValidationError') {
       const messages = Object.values(error.errors).map(val => val.message);
       return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
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

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
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
