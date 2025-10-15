const Article = require('../models/Article');
const User = require('../models/User');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler'); 

// 1. Ambil Semua Komentar
exports.getArticleComments = catchAsyncErrors(async (req, res, next) => {
    const article = await Article.findById(req.params.articleId)
        .select('comments')
        .lean(); 

    if (!article) {
        return next(new ErrorHandler('Artikel tidak ditemukan', 404));
    }

    let processedComments = article.comments;

    if (req.user) {
        const userId = req.user._id.toString();
        processedComments = processedComments.map(comment => {
            const isLiked = comment.likedBy.some(id => id.toString() === userId);
            
            // Proses balasan (replies)
            const processedReplies = comment.replies.map(reply => ({
                ...reply,
                isLikedByMe: reply.likedBy.some(id => id.toString() === userId),
            }));

            return {
                ...comment,
                isLikedByMe: isLiked,
                replies: processedReplies
            };
        });
    }

    res.status(200).json({
        success: true,
        comments: processedComments
    });
});

// 2. Tambah Komentar Utama
exports.addComment = catchAsyncErrors(async (req, res, next) => {
    const { text } = req.body;
    const articleId = req.params.articleId;

    if (!text) {
        return next(new ErrorHandler('Komentar tidak boleh kosong', 400));
    }

    const user = req.user; // Dari middleware authenticate

    const newComment = {
        userId: user._id,
        userName: user.name,
        userAvatar: user.avatar,
        text: text,
        createdAt: Date.now(),
        likes: 0,
        likedBy: [],
        replies: []
    };

    const updatedArticle = await Article.findByIdAndUpdate(
        articleId,
        { $push: { comments: { $each: [newComment], $position: 0 } } }, // $position: 0 untuk menempatkan komentar baru di atas
        { new: true, runValidators: true }
    );

    if (!updatedArticle) {
        return next(new ErrorHandler('Artikel tidak ditemukan', 404));
    }

    // Mengambil komentar terbaru yang baru ditambahkan
    const latestComment = updatedArticle.comments[0];

    res.status(201).json({
        success: true,
        message: 'Komentar berhasil ditambahkan',
        comment: latestComment
    });
});


// 3. Tambah Balasan Komentar
exports.addReply = catchAsyncErrors(async (req, res, next) => {
    const { text } = req.body;
    const { articleId, commentId } = req.params;

    if (!text) {
        return next(new ErrorHandler('Balasan tidak boleh kosong', 400));
    }

    const user = req.user;

    const newReply = {
        userId: user._id,
        userName: user.name,
        userAvatar: user.avatar,
        text: text,
        createdAt: Date.now(),
        likes: 0,
        likedBy: []
    };

    // $push ke array replies di dalam objek comments
    const updatedArticle = await Article.findOneAndUpdate(
        { _id: articleId, 'comments._id': commentId },
        { $push: { 'comments.$.replies': newReply } },
        { new: true, runValidators: true }
    );

    if (!updatedArticle) {
        return next(new ErrorHandler('Komentar atau Artikel tidak ditemukan', 404));
    }

    // Ambil balasan terbaru yang baru ditambahkan
    const updatedComment = updatedArticle.comments.find(c => c._id.toString() === commentId);
    const latestReply = updatedComment.replies[updatedComment.replies.length - 1];

    res.status(201).json({
        success: true,
        message: 'Balasan berhasil ditambahkan',
        reply: latestReply
    });
});

// 4. Toggle Like Komentar/Balasan
exports.toggleCommentLike = catchAsyncErrors(async (req, res, next) => {
    const { articleId, commentId } = req.params;
    const replyId = req.query.replyId; // Opsi: Jika ini adalah balasan
    const userId = req.user._id;

    // 1. Tentukan variabel dan path untuk update
    let updatePath;
    let messagePrefix;
    let arrayFilters = [{ 'c._id': commentId }]; // Filter untuk komentar utama
    
    if (replyId) {
        // Jika ini adalah Balasan
        updatePath = 'comments.$[c].replies.$[r].likedBy'; // Gunakan $[] untuk array filters
        arrayFilters.push({ 'r._id': replyId });           // Filter untuk balasan
        messagePrefix = 'Balasan';
    } else {
        // Jika ini adalah Komentar Utama
        updatePath = 'comments.$[c].likedBy';
        messagePrefix = 'Komentar';
    }

    // 2. Ambil artikel untuk menentukan status like saat ini (untuk menentukan operasi $pull atau $addToSet)
    const article = await Article.findById(articleId).select('comments');
    if (!article) return next(new ErrorHandler('Artikel tidak ditemukan', 404));

    // 3. Tentukan apakah user sudah like
    let targetArray;
    const comment = article.comments.id(commentId);
    if (!comment) return next(new ErrorHandler('Komentar tidak ditemukan', 404));

    if (replyId) {
        const reply = comment.replies.id(replyId);
        if (!reply) return next(new ErrorHandler('Balasan tidak ditemukan', 404));
        targetArray = reply.likedBy;
    } else {
        targetArray = comment.likedBy;
    }
        
    const isCurrentlyLiked = targetArray.includes(userId);
    let updateQuery;
    let newLikeStatus;

    if (isCurrentlyLiked) {
        // UNLIKE: Gunakan $pull
        updateQuery = { $pull: { [updatePath]: userId } };
        message = `${messagePrefix} berhasil di-unlike.`;
        newLikeStatus = false;
    } else {
        // LIKE: Gunakan $addToSet
        updateQuery = { $addToSet: { [updatePath]: userId } };
        message = `${messagePrefix} berhasil disukai.`;
        newLikeStatus = true;
    }
    
    // 4. Eksekusi Update
    const updatedArticle = await Article.findOneAndUpdate(
        { _id: articleId }, // Hanya perlu filter _id artikel
        updateQuery,
        { 
            new: true,
            arrayFilters: arrayFilters,
            runValidators: true 
        }
    ).select('comments');

    if (!updatedArticle) {
         return next(new ErrorHandler('Gagal mengupdate like.', 500));
    }
    
    // 5. Hitung Like Count terbaru
    const updatedComment = updatedArticle.comments.id(commentId);
    let totalLikes;

    if (replyId) {
        totalLikes = updatedComment.replies.id(replyId)?.likedBy.length || 0;
    } else {
        totalLikes = updatedComment.likedBy.length;
    }
    
    res.status(200).json({
        success: true,
        message: message,
        isLiked: newLikeStatus,
        totalLikes: totalLikes
    });
});