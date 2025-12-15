const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

// Middleware untuk verifikasi JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan atau tidak aktif'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid'
    });
  }
};

// Middleware untuk cek role admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang bisa mengakses'
    });
  }
  next();
};

// Middleware untuk cek role writer atau admin
const requireWriter = (req, res, next) => {
  if (!['writer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya writer atau admin yang bisa mengakses'
    });
  }
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    // Pastikan req.user sudah ada (biasanya dipasang setelah authenticate)
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'User belum terautentikasi' 
        });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) tidak memiliki izin akses resource ini`
      });
    }
    next();
  };
};

// Optional auth middleware (tidak wajib login)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Token invalid, tapi tidak error karena optional
    next();
  }
};



module.exports = {
  authenticate,
  requireAdmin,
  requireWriter,
  optionalAuth,
  authorize
};
