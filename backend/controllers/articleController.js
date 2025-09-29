const Article = require('../models/Article');
const User = require('../models/User');

// Get all articles (public)
const getAllArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const status = req.query.status || 'published';
    const search = req.query.search;
    const tag = req.query.tag; 
    const sortBy = req.query.sortBy || 'publishedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (tag) {
        // Menggunakan operator $in (jika ingin mencari artikel yang memiliki salah satu dari banyak tags)
        // Jika tag dikirim sebagai string tunggal (misal 'akademik'), kita buat array.
        // Jika tag dikirim sebagai string yang dipisahkan koma (misal 'tag1,tag2'), kita split.
        const tagsArray = Array.isArray(tag) ? tag : String(tag).split(',');
        
        // Memastikan tags yang dicari sudah di lowercase (sesuai skema model)
        const lowerCaseTags = tagsArray.map(t => t.trim().toLowerCase());

        // Mencari artikel yang memiliki setidaknya satu tag dari daftar yang diminta
        query.tags = { $in: lowerCaseTags }; 
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query with pagination
    const articles = await Article.find(query)
      .populate('author', 'name email avatar')
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data artikel'
    });
  }
};

// Get article by ID
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findById(id)
      .populate('author', 'name email avatar')
      .lean();

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artikel tidak ditemukan'
      });
    }

    // Increment views
    await Article.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: { article: { ...article, views: article.views + 1 } }
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil artikel'
    });
  }
};

// Get articles by author
const getArticlesByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'published';

    const query = { 
      author: authorId,
      status 
    };

    const articles = await Article.find(query)
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get author articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil artikel penulis'
    });
  }
};

// Get writer's own articles
const getWriterArticles = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = { author: userId };
    if (status) {
      query.status = status;
    }

    const articles = await Article.find(query)
      .populate('author', 'name email avatar')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get writer articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil artikel penulis'
    });
  }
};

// Create new article
const createArticle = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      featuredImage,
      status = 'draft',
      seoTitle,
      seoDescription
    } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Judul dan konten harus diisi'
      });
    }

    // Get author info
    const author = await User.findById(req.user.id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author tidak ditemukan'
      });
    }

    // Create article
    const article = new Article({
      title,
      content,
      excerpt,
      category: category || 'berita',
      tags: tags || [],
      featuredImage,
      status,
      author: req.user.id,
      authorName: author.name,
      seoTitle,
      seoDescription
    });

    await article.save();

    // Populate author info
    await article.populate('author', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Artikel berhasil dibuat',
      data: { article }
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat artikel'
    });
  }
};

// Update article
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      featuredImage,
      status,
      seoTitle,
      seoDescription
    } = req.body;

    // Check if article exists and belongs to user
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artikel tidak ditemukan'
      });
    }

    // Check if user is the author or admin
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk mengedit artikel ini'
      });
    }

    // Update fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (status !== undefined) updateData.status = status;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar');

    res.json({
      success: true,
      message: 'Artikel berhasil diupdate',
      data: { article: updatedArticle }
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate artikel'
    });
  }
};

// Delete article
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if article exists and belongs to user
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artikel tidak ditemukan'
      });
    }

    // Check if user is the author or admin
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk menghapus artikel ini'
      });
    }

    await Article.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Artikel berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus artikel'
    });
  }
};

// Like article
const likeArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artikel tidak ditemukan'
      });
    }

    await article.incrementLikes();

    res.json({
      success: true,
      message: 'Artikel berhasil di-like',
      data: { likes: article.likes + 1 }
    });
  } catch (error) {
    console.error('Like article error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memberikan like'
    });
  }
};

// Get featured articles
const getFeaturedArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const articles = await Article.find({ 
      status: 'published',
      isFeatured: true 
    })
      .populate('author', 'name email avatar')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: { articles }
    });
  } catch (error) {
    console.error('Get featured articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil artikel unggulan'
    });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  getArticlesByAuthor,
  getWriterArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  getFeaturedArticles
};
