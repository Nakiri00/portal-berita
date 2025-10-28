const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {authenticate} = require("../middleware/auth");

// GET saved articles
router.get("/", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id, "savedArticles");
    res.json({ success: true, articles: user.savedArticles });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengambil artikel yang disimpan" });
  }
});

// POST save article (Logika lama yang HANYA MENYIMPAN jika belum ada)
router.post("/", authenticate, async (req, res) => {
  try {
    const { articleId, title, excerpt, author, imageUrl, tag } = req.body;
    const user = await User.findById(req.user._id);

    // Cek apakah artikel sudah ada
    if (!user.savedArticles.some(a => a.articleId === articleId)) {
      // Jika belum ada, tambahkan
      user.savedArticles.unshift({
        articleId,
        title,
        excerpt,
        author,
        imageUrl,
        tag,
        savedDate: new Date()
      });
      await user.save();
    }
    // Jika sudah ada, tidak melakukan apa-apa dan mengembalikan daftar artikel
    res.json({ success: true, message: "Artikel berhasil disimpan.", articles: user.savedArticles });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menyimpan artikel" });
  }
});

// 💡 TAMBAHAN: DELETE unsave article 
router.delete("/:articleId", authenticate, async (req, res) => {
    try {
        const { articleId } = req.params;
        
        // Gunakan $pull untuk menghapus item dari array savedArticles yang cocok dengan articleId
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            // $pull menghapus elemen dari array yang cocok dengan kriteria
            { $pull: { savedArticles: { articleId: articleId } } },
            { new: true }
        );
        
        if (!updatedUser) {
             return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
        }
        
        res.json({ 
            success: true, 
            message: "Artikel berhasil dihapus dari tersimpan.",
            articles: updatedUser.savedArticles
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal menghapus artikel." });
    }
});


module.exports = router;