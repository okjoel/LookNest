// @route   POST /api/photos/:photoId/save
// @desc    Save a photo for the current user
// @access  Private
router.post('/:photoId/save', authMiddleware, async (req, res) => {
  try {
    const photoId = req.params.photoId;
    const user = await require('../models/User').findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.savedPhotos.includes(photoId)) {
      return res.status(400).json({ message: 'Photo already saved' });
    }
    user.savedPhotos.push(photoId);
    await user.save();
    res.json({ message: 'Photo saved successfully' });
  } catch (error) {
    console.error('Save photo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Photo = require('../models/Photo');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route   POST /api/photos
// @desc    Upload a new photo
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, imageUrls } = req.body;

    if (!title || !imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({ message: 'Title and at least one image are required' });
    }

    const photo = new Photo({
      title,
      description,
      imageUrl: imageUrls,
      user: req.user.id
    });

    await photo.save();

    // Emit to current user that photo uploaded
    global.wss.clients.forEach(client => {
      if (client.userId === req.user.id) {
        client.send(JSON.stringify({ type: 'photo_uploaded' }));
      }
    });

    res.status(201).json({ message: 'Photo uploaded successfully', photo });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/photos
// @desc    Get all photos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const photos = await Photo.find()
      .populate('user', 'fullName username profileImage')
      .sort({ createdAt: -1 });

    res.json(photos);
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/photos/user/:userId
// @desc    Get photos by user
// @access  Private if account is set to private
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isOwner = req.user.id === targetUser._id.toString();
    const isFollower = targetUser.followers.includes(req.user.id);

    if (targetUser.settings?.privateProfile && !isOwner && !isFollower) {
      return res.status(403).json({ message: 'This account is private' });
    }

    const photos = await Photo.find({ user: req.params.userId })
      .populate('user', 'fullName username profileImage')
      .sort({ createdAt: -1 });

    res.json(photos);
  } catch (error) {
    console.error('Get user photos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/photos/:id
// @desc    Delete a photo
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    if (photo.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await photo.deleteOne();

    global.wss.clients.forEach(client => {
      if (client.userId === req.user.id) {
        client.send(JSON.stringify({ type: 'photo_deleted' }));
      }
    });

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/photos/:id/like
// @desc    Like or unlike a photo
// @access  Private
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id).populate('user', 'fullName username');

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    const userIndex = photo.likes.indexOf(req.user.id);
    let isLiked = false;
    let message = '';

    if (userIndex > -1) {
      photo.likes.splice(userIndex, 1);
      message = 'Photo unliked';
    } else {
      photo.likes.push(req.user.id);
      isLiked = true;
      message = 'Photo liked';

      if (photo.user._id.toString() !== req.user.id) {
        const notification = new Notification({
          recipient: photo.user._id,
          sender: req.user.id,
          type: 'like',
          message: `liked your photo "${photo.title}"`,
          photo: photo._id
        });
        await notification.save();
      }
    }

    await photo.save();

    global.wss.clients.forEach(client => {
      if (client.userId === photo.user._id.toString()) {
        client.send(JSON.stringify({ type: 'notification' }));
      }
    });

    res.json({ message, isLiked, likesCount: photo.likes.length });
  } catch (error) {
    console.error('Like photo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/photos/:id/comment
// @desc    Add a comment to a photo
// @access  Private
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const photo = await Photo.findById(req.params.id).populate('user', 'fullName username');

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    const newComment = {
      user: req.user.id,
      text: text.trim()
    };

    photo.comments.push(newComment);
    await photo.save();

    await photo.populate('comments.user', 'fullName username profileImage');
    const addedComment = photo.comments[photo.comments.length - 1];

    if (photo.user._id.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: photo.user._id,
        sender: req.user.id,
        type: 'comment',
        message: `commented on your photo "${photo.title}": "${text.trim()}"`,
        photo: photo._id
      });
      await notification.save();
    }

    global.wss.clients.forEach(client => {
      if (client.userId === photo.user._id.toString()) {
        client.send(JSON.stringify({ type: 'notification' }));
      }
    });

    res.status(201).json({ message: 'Comment added', comment: addedComment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/photos/:id
// @desc    Get single photo with comments
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id)
      .populate('user', 'fullName username profileImage')
      .populate('comments.user', 'fullName username profileImage')
      .populate('likes', 'fullName username');

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    res.json(photo);
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
