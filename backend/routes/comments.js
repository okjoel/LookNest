const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Comment = require('../models/Comment');

// Edit a comment
router.put('/comments/:id', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Text is required' });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (String(comment.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not allowed to edit this comment' });
    }

    comment.text = text.trim();
    await comment.save();
    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a comment
router.delete('/comments/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (String(comment.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not allowed to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
