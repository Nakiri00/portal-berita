const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'portal-berita',
    audience: 'portal-berita-users'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Generate token payload
const createTokenPayload = (user) => {
  return {
    userId: user._id,
    email: user.email,
    role: user.role,
    name: user.name
  };
};

module.exports = {
  generateToken,
  verifyToken,
  createTokenPayload
};
