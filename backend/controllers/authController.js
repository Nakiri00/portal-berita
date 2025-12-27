const User = require('../models/User');
const { generateToken, createTokenPayload } = require('../utils/jwt');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../services/emailService');
const crypto = require('crypto');

// Register user baru
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password harus diisi'
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Buat user baru
    const user = new User({
      name,
      email,
      password,
      role
    });

    // Generate token verifikasi (untuk link email)
    const verificationToken = user.getVerificationToken();

    // Simpan user ke database
    await user.save();

    // Kirim Email
    try {
      await sendVerificationEmail(user.email, verificationToken, user.name);
      const tokenPayload = createTokenPayload(user);
      const token = generateToken(tokenPayload);

      // Update last login
      await user.updateLastLogin();
      
      // JIKA SUKSES MENGIRIM EMAIL:
      // Kita kirim respon sukses di sini dan STOP (return).
      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi akun.',
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified, 
            avatar: user.avatar
          },
          token
        },
      });

    } catch (emailError) {
      console.error("Email Error:", emailError);
      
      // JIKA GAGAL MENGIRIM EMAIL:
      // Hapus user dari database agar bisa daftar ulang
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengirim email verifikasi. Pastikan konfigurasi email benar.'
      });
    }

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat registrasi'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi'
      });
    }

    // Cari user dengan password (select: true untuk login)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // if (!user.isVerified) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Email belum diverifikasi. Silakan cek inbox email Anda.'
    //   });
    // }

    // Cek password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Generate token
    const tokenPayload = createTokenPayload(user);
    const token = generateToken(tokenPayload);

    // Update last login
    await user.updateLastLogin();

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat login'
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    // Hash token dari URL untuk dicocokkan dengan database
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Cari user dengan token tersebut dan belum expired
    const user = await User.findOne({
      verificationToken,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token verifikasi tidak valid atau sudah kedaluwarsa'
      });
    }

    // Update status user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    
    // Kirim Welcome Email (Opsional, pindahkan dari register ke sini)
    // const { sendWelcomeEmail } = require('../services/emailService');
    // await sendWelcomeEmail(user.email, user.name);

    await user.save();

    // Langsung buat token login agar user otomatis login setelah verifikasi (User Experience bagus)
    const { generateToken, createTokenPayload } = require('../utils/jwt');
    const tokenPayload = createTokenPayload(user);
    const token = generateToken(tokenPayload);

    res.status(200).json({
      success: true,
      message: 'Email berhasil diverifikasi!',
      data: {
        token,
        user
      }
    });

  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ success: false, message: 'Gagal verifikasi email' });
  }
};



// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil profil'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar, socialLinks, email } = req.body;
    const userId = req.user._id;
    const currentUser = await User.findById(userId);

    if (!currentUser) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
  
    if (req.file) { 
        updateData.avatar = `/uploads/avatars/${req.file.filename}`; 
    } else if (avatar !== undefined) {
        updateData.avatar = avatar; 
    }
    let emailChanged = false;
    if (email && email !== currentUser.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email baru sudah digunakan oleh akun lain.' });
      }
      updateData.email = email;
      updateData.isVerified = false; 
      const verificationToken = currentUser.getVerificationToken();
      updateData.verificationToken = currentUser.verificationToken;
      updateData.verificationTokenExpire = currentUser.verificationTokenExpire;

      try {
        await sendVerificationEmail(updateData.email, verificationToken, updateData.name || currentUser.name);
        emailChanged = true;
      } catch (error) {
        console.error("Gagal kirim email ganti alamat:", error);
        return res.status(500).json({ success: false, message: 'Gagal mengirim email verifikasi ke alamat baru.' });
      }
    }
    if (socialLinks) {
        let links = socialLinks;
        if (typeof socialLinks === 'string') {
            try {
                links = JSON.parse(socialLinks);
            } catch (e) {
                console.error("Failed to parse socialLinks JSON:", e);
                links = null;
            }
        }
        
        if (links && typeof links === 'object') {
            if (links.instagram !== undefined) updateData['socialLinks.instagram'] = links.instagram;
            if (links.facebook !== undefined) updateData['socialLinks.facebook'] = links.facebook;
            if (links.threads !== undefined) updateData['socialLinks.threads'] = links.threads;
        }
    }
    if (Object.keys(updateData).length === 0) {
        return res.json({ success: true, message: 'Tidak ada perubahan data.', data: { user: currentUser } });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      updateData, 
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: emailChanged 
        ? 'Profil diperbarui. Karena email berubah, silakan cek inbox untuk verifikasi ulang.' 
        : 'Profil berhasil diperbarui.',
      data: {
        user: user 
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui profil'
    });
  }
};


// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Validasi input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan password baru harus diisi'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter'
      });
    }

    // Ambil user dengan password
    const user = await User.findById(userId).select('+password');
    
    // Cek password lama
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password lama salah'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengubah password'
    });
  }
};

// Logout (optional - bisa untuk blacklist token)
const logout = async (req, res) => {
  try {
    // Di implementasi sederhana, logout hanya response success
    // Di production, bisa tambahkan token blacklist
    
    res.json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat logout'
    });
  }
};


module.exports = {
  register,
  login,
  verifyEmail,
  getProfile,
  updateProfile,
  changePassword,
  logout
};
