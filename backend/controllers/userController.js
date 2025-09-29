const User = require('../models/User'); 
const ErrorHandler = require('../utils/errorHandler'); 
const catchAsyncErrors = require('../middleware/catchAsyncErrors'); 
const Article = require('../models/Article'); // Pastikan ini diimpor

// @desc    Get single user public profile
// @route   GET /api/v1/user/:id
// @access  Public
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
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
            followers: user.followers || 0, // Asumsi fields ini ada di model User
            following: user.following || 0,
            title: user.title || 'Penulis Kontributor', // Asumsi field title ada
            location: user.location || 'Indonesia' // Asumsi field location ada
        }
    });
});
