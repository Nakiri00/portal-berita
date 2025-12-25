const User = require('../models/User');
const { generateToken, createTokenPayload } = require('../utils/jwt');

// Register user baru
const register = async (req, res) => {
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

    await user.save();

    // Generate token
    const tokenPayload = createTokenPayload(user);
    const token = generateToken(tokenPayload);

    // Update last login
    await user.updateLastLogin();

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
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

    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (req.file) { 
        updateData.avatar = `/uploads/avatars/${req.file.filename}`; 
    } else if (avatar !== undefined) {
        updateData.avatar = avatar; 
    }
    if (email) {
        if (email.toLowerCase() !== req.user.email.toLowerCase()) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email sudah digunakan oleh pengguna lain'
                });
            }
            updateData.email = email;
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
    }


    const user = await User.findByIdAndUpdate(
      userId,
      updateData, // Gunakan updateData dengan dot notation
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: {
        user: user.toJSON()
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
  getProfile,
  updateProfile,
  changePassword,
  logout
};
