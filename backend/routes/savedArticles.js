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
    res.status(500).json({ success: false, message: "Gagal mengambil saved articles" });
  }
});

// POST save article
router.post("/", authenticate, async (req, res) => {
  try {
    const { articleId, title, excerpt, author, imageUrl, tag } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.savedArticles.some(a => a.articleId === articleId)) {
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

    res.json({ success: true, articles: user.savedArticles });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menyimpan artikel" });
  }
});

module.exports = router;