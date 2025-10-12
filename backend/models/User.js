const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama harus diisi'],
    trim: true,
    maxlength: [50, 'Nama tidak boleh lebih dari 50 karakter']
  },
  email: {
    type: String,
    required: [true, 'Email harus diisi'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Format email tidak valid'
    ]
  },
  password: {
    type: String,
    minlength: [6, 'Password minimal 6 karakter'],
    select: false // Jangan tampilkan password di response
  },
  // OAuth fields
  googleId: {
    type: String,
    sparse: true, // Allows multiple null values
    unique: true
  },
  facebookId: {
    type: String,
    sparse: true, // Allows multiple null values
    unique: true
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio tidak boleh lebih dari 500 karakter'],
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'writer', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    threads: { type: String, default: '' }
  },
  readingHistory: [{
    articleId: String,
    title: String,
    readDate: Date,
    lastReadAt: Date,
    readCount: Number,
  }],
  savedArticles: [{
    articleId: String,
    title: String,
    excerpt: String,
    imageUrl: String,
    tag: String,
    author: String,
    savedAt: Date,
  }],
  likedArticles: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Article',
  }],
}, {
  timestamps: true // createdAt dan updatedAt otomatis
});

// Hash password sebelum save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method untuk compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method untuk update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Transform output JSON (hapus password dari response)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Index untuk performa (email sudah unique, jadi tidak perlu index manual)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);
