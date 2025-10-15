// backend/models/CommentSchema.js (Jika Anda ingin file terpisah)
const mongoose = require('mongoose');

// Skema Balasan (Reply)
const replySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: '' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    // Fitur Like Komentar/Balasan (Mirip Like Artikel)
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.ObjectId, ref: 'User' }], // Array ID user yang menyukai
});

// Skema Komentar Utama
const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: '' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    // Balasan (Nested)
    replies: [replySchema]
});

module.exports = { commentSchema, replySchema };