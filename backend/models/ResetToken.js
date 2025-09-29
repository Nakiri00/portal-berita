const mongoose = require('mongoose');

const resetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600 // Token expires in 1 hour (3600 seconds)
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries (token sudah unique, jadi tidak perlu index manual)
resetTokenSchema.index({ userId: 1 });

module.exports = mongoose.model('ResetToken', resetTokenSchema);
