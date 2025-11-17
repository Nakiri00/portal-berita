const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  activateUser,
  getUserStats,
  createWriter
} = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId/role', updateUserRole);
router.put('/users/:userId/deactivate', deactivateUser);
router.put('/users/:userId/activate', activateUser);
router.post('/writer', createWriter);


// Statistics
router.get('/stats', getUserStats);

module.exports = router;
