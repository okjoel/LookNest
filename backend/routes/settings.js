const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET user settings + profile basics
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      'fullName email username bio profileImage settings'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT update user settings + profile basics
// PUT update user settings + profile basics
router.put('/', auth, async (req, res) => {
  try {
    const { fullName, email, username, bio, profileImage, settings } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Only update fields if they are non-empty strings
    if (fullName?.trim()) user.fullName = fullName;
    if (email?.trim()) user.email = email;
    if (username?.trim()) user.username = username;
    if (bio?.trim()) user.bio = bio;
    if (profileImage?.trim()) user.profileImage = profileImage;

    // Update settings object if provided
    if (settings) {
      user.settings = { ...user.settings, ...settings };
    }

    await user.save();
    res.json({ message: 'Settings updated successfully', user });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});


module.exports = router;
