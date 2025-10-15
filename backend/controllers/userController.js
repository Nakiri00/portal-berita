const User = require('../models/User'); 
const ErrorHandler = require('../utils/errorHandler'); 
const catchAsyncErrors = require('../middleware/catchAsyncErrors'); 
const Article = require('../models/Article'); // Pastikan ini diimpor

// @desc    Get single user public profile
// @route   GET /api/v1/user/:id
// @access  Public
const getUserProfile = catchAsyncErrors(async (req, res, next) => {
    // Mencari user berdasarkan ID dan memilih field yang aman untuk publik
    const user = await User.findById(req.params.id).select(
        '-password -resetPasswordToken -resetPasswordExpire -email -socialAccounts.id -__v'
    ).lean(); // Gunakan .lean() untuk objek JavaScript biasa yang lebih cepat

    if (!user) {
        return next(new ErrorHandler('Pengguna tidak ditemukan', 404));
    }

    // Hanya izinkan profil penulis/admin yang dapat dilihat.
    // Jika role tidak ada di database, ini akan dihitung sebagai 'user' biasa.
    if (user.role !== 'writer' && user.role !== 'admin') {
        return next(new ErrorHandler('Profil tidak tersedia karena bukan penulis atau administrator terdaftar', 404));
    }

    // Mengambil jumlah artikel yang telah diterbitkan oleh penulis
    const publishedArticlesCount = await Article.countDocuments({ 
        author: user._id, 
        status: 'published' 
    });

    res.status(200).json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
            bio: user.bio || 'Tidak ada bio yang tersedia.',
            joinedAt: user.createdAt,
            publishedArticles: publishedArticlesCount,
            // Pastikan field socialMedia dikirim, meskipun kosong atau undefined
            socialMedia: user.socialMedia || { instagram: '', facebook: '', twitter: '' }, 
            followers: user.followers || 0, 
            following: user.following || 0,
            title: user.title || 'Penulis Kontributor', 
            location: user.location || 'Indonesia' 
        }
    });
});

const toggleArticleLike = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.id; 

    // 1. Ambil User dan Article
    const user = await User.findById(userId);
    const article = await Article.findById(articleId);

    if (!user || !article) {
      return res.status(404).json({ success: false, message: 'User atau Artikel tidak ditemukan' });
    }

    // 2. Cek apakah artikel sudah di-like
    const isLiked = user.likedArticles.includes(articleId);
    let newLikeStatus;

    if (isLiked) {
      // Hapus Like (Unlike)
      user.likedArticles = user.likedArticles.filter(
        id => id.toString() !== articleId
      );
      article.likes -= 1; // Kurangi jumlah total likes di Article
      newLikeStatus = false;
    } else {
      // Tambah Like
      user.likedArticles.push(articleId);
      article.likes += 1; // Tambah jumlah total likes di Article
      newLikeStatus = true;
    }

    // 3. Simpan perubahan ke database
    await user.save({ validateBeforeSave: false });
    await article.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: newLikeStatus ? 'Artikel berhasil disukai' : 'Suka artikel dibatalkan',
      data: {
        isLiked: newLikeStatus,
        totalLikes: article.likes, // Mengirim jumlah total likes terbaru
      },
    });

  } catch (error) {
    console.error('Toggle article like error:', error);
    res.status(500).json({ success: false, message: 'Gagal memproses like artikel' });
  }
};

module.exports = {
    getUserProfile,
    toggleArticleLike
};