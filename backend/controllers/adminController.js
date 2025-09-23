const User = require('../models/User');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data user'
    });
  }
};

// Get user by ID (admin only)
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data user'
    });
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'writer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role tidak valid'
      });
    }

    // Jangan biarkan admin mengubah role sendiri
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Tidak bisa mengubah role sendiri'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Role user berhasil diperbarui',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui role user'
    });
  }
};

// Deactivate user (admin only)
const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Jangan biarkan admin menonaktifkan diri sendiri
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Tidak bisa menonaktifkan akun sendiri'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'User berhasil dinonaktifkan',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menonaktifkan user'
    });
  }
};

// Activate user (admin only)
const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'User berhasil diaktifkan',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengaktifkan user'
    });
  }
};

// Get user statistics (admin only)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalWriters = await User.countDocuments({ role: 'writer', isActive: true });
    const totalAdmins = await User.countDocuments({ role: 'admin', isActive: true });
    
    // Users registered this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const usersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
      isActive: true
    });

    // Recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      isActive: true
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalWriters,
          totalAdmins,
          usersThisMonth,
          recentUsers
        }
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil statistik user'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  activateUser,
  getUserStats
};
