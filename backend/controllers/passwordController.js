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
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

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

    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password konfirmasi tidak cocok.'
      });
    }

    user.password = req.body.password;
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password berhasil diubah! Silakan login.'
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

// Verify Reset Token - Check if token is valid
// const verifyResetToken = async (req, res) => {
//   try {
//     const { token } = req.params;

//     if (!token) {
//       return res.status(400).json({
//         success: false,
//         message: 'Token diperlukan'
//       });
//     }

//     // Find valid reset token
//     const resetTokenDoc = await ResetToken.findOne({
//       token,
//       used: false,
//       expiresAt: { $gt: new Date() }
//     });

//     if (!resetTokenDoc) {
//       return res.status(400).json({
//         success: false,
//         message: 'Token tidak valid atau sudah kadaluarsa'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Token valid'
//     });

//   } catch (error) {
//     console.error('Verify reset token error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Terjadi kesalahan saat memverifikasi token'
//     });
//   }
// };

module.exports = {
  forgotPassword,
  resetPassword,
  // verifyResetToken
};
