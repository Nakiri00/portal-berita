// backend/controllers/articleInteractionController.js

const Article = require('../models/Article');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

exports.recordUniqueView = catchAsyncErrors(async (req, res, next) => {
    // Memastikan user sudah login (middleware isAuthenticatedUser sudah dijalankan)
    if (!req.user) {
        return next(new ErrorHandler("Fitur ini membutuhkan login user.", 401));
    }
    const articleId = req.params.id;
    const userId = req.user.id;
    
    // 1. Cari artikel berdasarkan ID
    const article = await Article.findById(articleId);
    if (!article) {
        return next(new ErrorHandler('Artikel tidak ditemukan', 404));
    }
    
    // 2. Cek apakah user sudah ada di array viewedBy
    const userHasViewed = article.viewedBy.some(
        (viewedUserId) => viewedUserId.toString() === userId.toString()
    );
    
    if (userHasViewed) {
        // User sudah pernah membaca, view count tidak bertambah
        return res.status(200).json({
            success: true,
            message: 'View sudah tercatat sebelumnya.',
            totalViews: article.totalViews,
        });
    }

    // 3. User baru pertama kali membaca, tambahkan ID user ke array dan increment totalViews
    article.viewedBy.push(userId);
    article.totalViews += 1; // Increment view count
    
    await article.save({ validateBeforeSave: false });

    // Optional: Tambahkan juga ke readingHistory user di sini jika belum ada
    // ...
    
    res.status(200).json({
        success: true,
        message: 'Unique view berhasil dicatat!',
        totalViews: article.totalViews,
    });
});

exports.toggleLike = catchAsyncErrors(async (req, res, next) => {
    // Memastikan user sudah login
    if (!req.user) {
        return next(new ErrorHandler("Silakan login untuk menyukai artikel.", 401));
    }

    const articleId = req.params.id;
    const userId = req.user.id;

    const article = await Article.findById(articleId);

    if (!article) {
        return next(new ErrorHandler('Artikel tidak ditemukan', 404));
    }

    // Cek apakah user sudah me-like artikel
    const isLiked = article.likes.some(
        (likeUserId) => likeUserId.toString() === userId.toString()
    );

    if (isLiked) {
        // UNLIKE: Hapus ID user dari array likes
        article.likes.pull(userId); 
        article.totalLikes -= 1; // Decrement like count
        message = 'Unlike berhasil.';
    } else {
        // LIKE: Tambahkan ID user ke array likes
        article.likes.push(userId);
        article.totalLikes += 1; // Increment like count
        message = 'Like berhasil.';
    }

    await article.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: message,
        isLiked: !isLiked, // Status like saat ini
        totalLikes: article.totalLikes,
    });
});