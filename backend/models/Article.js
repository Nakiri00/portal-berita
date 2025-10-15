const mongoose = require('mongoose');
const { commentSchema } = require('./CommentSchema'); 

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Judul artikel harus diisi'],
    trim: true,
    maxlength: [200, 'Judul tidak boleh lebih dari 200 karakter']
  },
  content: {
    type: String,
    required: [true, 'Konten artikel harus diisi'],
    trim: true
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt tidak boleh lebih dari 500 karakter'],
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author harus diisi']
  },
  authorName: {
    type: String,
    required: [true, 'Nama author harus diisi']
  },
  category: {
    type: String,
    required: [true, 'Kategori harus diisi'],
    enum: [
      'berita', 
      'tips & trik', 
      'opini', 
      'teknologi', 
      'pendidikan', 
      'olahraga', 
      'hiburan', 
      'lainnya',
      'akademik',
      'kehidupan kampus',
      'beasiswa',
      'karir'
    ],
    default: 'berita'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  featuredImage: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  seoTitle: {
    type: String,
    maxlength: [60, 'SEO title tidak boleh lebih dari 60 karakter']
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'SEO description tidak boleh lebih dari 160 karakter']
  },
  readingTime: {
    type: Number, // in minutes
    default: 0
  },
  comments: [commentSchema] 
}, {
  timestamps: true // createdAt dan updatedAt otomatis
});

// Index untuk performa
articleSchema.index({ author: 1, status: 1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ views: -1 });
articleSchema.index({ likes: -1 });
articleSchema.index({ tags: 1 });

// Virtual untuk URL slug
articleSchema.virtual('slug').get(function() {
  return this.title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
});

// Method untuk calculate reading time
articleSchema.methods.calculateReadingTime = function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  return this.readingTime;
};

// Method untuk increment views
articleSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Method untuk increment likes
articleSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save({ validateBeforeSave: false });
};

// Pre-save middleware
articleSchema.pre('save', function(next) {
  // Calculate reading time
  this.calculateReadingTime();
  
  // Generate excerpt if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 200) + '...';
  }
  
  // Generate SEO fields if not provided
  if (!this.seoTitle) {
    this.seoTitle = this.title;
  }
  
  if (!this.seoDescription) {
    this.seoDescription = this.excerpt;
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Transform output JSON
articleSchema.methods.toJSON = function() {
  const articleObject = this.toObject();
  articleObject.slug = this.slug;
  return articleObject;
};

module.exports = mongoose.model('Article', articleSchema);
