const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {authenticate} = require("../middleware/auth");

// GET reading history
router.get("/", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id, "readingHistory");
    res.json({ success: true, history: user.readingHistory });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengambil reading history" });
  }
});

// POST add reading history
router.post("/", authenticate, async (req, res) => {
  try {
    const { articleId, title } = req.body;
    const now = new Date();

    const user = await User.findById(req.user._id);
    const existing = user.readingHistory.find(h => h.articleId === articleId);

    if (existing) {
      existing.readCount += 1;
      existing.lastReadAt = now;
    } else {
      user.readingHistory.unshift({
        articleId,
        title,
        readCount: 1,
        readDate: now,
        lastReadAt: now
      });
    }

    await user.save();
    res.json({ success: true, history: user.readingHistory });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal menambah reading history" });
  }
});

module.exports = router;