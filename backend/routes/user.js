const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ProfileView = require('../models/ProfileView');

// @route   GET /api/user/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, username, phoneNumber, bio, gender, birthday, address, profileImage } = req.body;

    // Check if username is already taken
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const updateData = {
      fullName,
      username,
      phoneNumber,
      bio,
      gender,
      birthday,
      address,
      profileImage
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key =>
      updateData[key] === undefined && delete updateData[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Emit to current user that profile updated
    global.wss.clients.forEach(client => {
      if (client.userId === req.user.id) {
        client.send(JSON.stringify({ type: 'profile_updated' }));
      }
    });

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId
// @desc    Get user profile by ID
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Track profile view if viewer is authenticated and not viewing their own profile
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const viewerId = decoded.id || decoded.userId;

        if (viewerId !== req.params.userId) {
          const recentView = user.profileViews.find(view =>
            view.viewer.toString() === viewerId &&
            new Date() - new Date(view.viewedAt) < 60 * 60 * 1000
          );

          if (!recentView) {
            user.profileViews.push({ viewer: viewerId });
            await user.save();
          }
        }
      } catch (error) {
        // Invalid token, continue without tracking
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:userId/follow
// @desc    Send follow request to a user
// @access  Private
router.post('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if already following
    if (currentUser.following.includes(req.params.userId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Check if request already sent
    if (userToFollow.followRequests.includes(req.user.id)) {
      return res.status(400).json({ message: 'Follow request already sent' });
    }

    // Directly follow the user (assuming public accounts)
    userToFollow.followers.push(req.user.id);
    await userToFollow.save();

    currentUser.following.push(req.params.userId);
    await currentUser.save();

    // Create notification for the target user
    const notification = new Notification({
      recipient: req.params.userId,
      sender: req.user.id,
      type: 'follow',
      message: `${currentUser.fullName} started following you`
    });
    await notification.save();

    // Emit updates
    global.wss.clients.forEach(client => {
      if (client.userId === req.user.id) {
        client.send(JSON.stringify({ type: 'following_updated' }));
      }
      if (client.userId === req.params.userId) {
        client.send(JSON.stringify({ type: 'followers_updated' }));
      }
    });

    res.json({ message: 'Followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:userId/follow
// @desc    Unfollow a user
// @access  Private
router.delete('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.userId);
    await currentUser.save();

    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user.id);
    await userToUnfollow.save();

    // Emit updates
    global.wss.clients.forEach(client => {
      if (client.userId === req.user.id) {
        client.send(JSON.stringify({ type: 'following_updated' }));
      }
      if (client.userId === req.params.userId) {
        client.send(JSON.stringify({ type: 'followers_updated' }));
      }
    });

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// @route   POST /api/users/:userId/follow/accept
// @desc    Accept follow request
// @access  Private
router.post('/:userId/follow/accept', authMiddleware, async (req, res) => {
  try {
    const requester = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!requester) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if follow request exists
    if (!currentUser.followRequests.includes(req.params.userId)) {
      return res.status(200).json({ message: 'Follow request already accepted or does not exist' });
    }

    // Remove from follow requests
    currentUser.followRequests = currentUser.followRequests.filter(id => id.toString() !== req.params.userId);
    // Add to followers of current user
    currentUser.followers.push(req.params.userId);
    await currentUser.save();

    // Add to following of requester
    requester.following.push(req.user.id);
    await requester.save();

    // Create notification for the requester
    const notification = new Notification({
      recipient: req.params.userId,
      sender: req.user.id,
      type: 'follow',
      message: `${currentUser.fullName} accepted your follow request`
    });
    await notification.save();

    // Emit updates
    global.wss.clients.forEach(client => {
      if (client.userId === req.user.id) {
        client.send(JSON.stringify({ type: 'followers_updated' }));
      }
      if (client.userId === req.params.userId) {
        client.send(JSON.stringify({ type: 'following_updated' }));
      }
    });

    res.json({ message: 'Follow request accepted' });
  } catch (error) {
    console.error('Accept follow request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:userId/follow/reject
// @desc    Reject follow request
// @access  Private
router.post('/:userId/follow/reject', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    currentUser.followRequests = currentUser.followRequests.filter(id => id.toString() !== req.params.userId);
    await currentUser.save();

    res.json({ message: 'Follow request rejected' });
  } catch (error) {
    console.error('Reject follow request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId/follow-status
// @desc    Check if current user is following the specified user
// @access  Private
router.get('/:userId/follow-status', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.userId);

    const isFollowing = currentUser.following.includes(req.params.userId);
    const isRequested = targetUser.followRequests.includes(req.user.id);

    res.json({ isFollowing, isRequested });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId/followers
// @desc    Get user's followers
// @access  Private
router.get('/:userId/followers', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followers = await User.find({ _id: { $in: user.followers } }).select('fullName profileImage username');
    let result = followers.map(f => ({ ...f.toObject(), status: 'accepted' }));

    if (req.user.id === req.params.userId) {
      const pending = await User.find({ _id: { $in: user.followRequests } }).select('fullName profileImage username');
      result = result.concat(pending.map(p => ({ ...p.toObject(), status: 'pending' })));
    }

    res.json(result);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId/following
// @desc    Get users that this user is following
// @access  Private
router.get('/:userId/following', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const following = await User.find({ _id: { $in: user.following } }).select('username profilePicture');
    res.json(following);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId/views
// @desc    Get user's profile views
// @access  Private
router.get('/:userId/views', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const views = await User.findById(req.params.userId).populate('profileViews.viewer', 'username profilePicture');
    res.json(views.profileViews);
  } catch (error) {
    console.error('Get views error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:userId/followers/:followerId
// @desc    Remove a follower
// @access  Private
router.delete('/:userId/followers/:followerId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const follower = await User.findById(req.params.followerId);

    if (!user || !follower) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    user.followers = user.followers.filter(id => id.toString() !== req.params.followerId);
    await user.save();

    follower.following = follower.following.filter(id => id.toString() !== req.params.userId);
    await follower.save();

    res.json({ message: 'Follower removed successfully' });
  } catch (error) {
    console.error('Remove follower error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
