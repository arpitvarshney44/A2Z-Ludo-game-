import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { email, username } = req.body;
    const user = await User.findById(req.user._id);

    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ 
        username: username.trim(),
        _id: { $ne: req.user._id }
      });
      
      if (existingUsername) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      
      user.username = username.trim();
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ 
        email: email.trim().toLowerCase(),
        _id: { $ne: req.user._id }
      });
      
      if (existingEmail) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
      
      user.email = email.trim().toLowerCase();
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        username: user.username,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken` 
      });
    }
    
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// @desc    Upload avatar
// @route   POST /api/user/avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);

    // Check if Cloudinary is configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      // Delete old avatar from Cloudinary if exists
      if (user.avatar && user.avatar.includes('cloudinary')) {
        try {
          const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.log('Failed to delete old avatar:', err.message);
        }
      }

      // Upload new avatar to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'a2z-ludo/avatars',
        public_id: `user_${user._id}_${Date.now()}`,
        width: 300,
        height: 300,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto:good',
        format: 'webp'
      });

      // Delete temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.log('Failed to delete temp file:', err.message);
      });

      user.avatar = result.secure_url;
    } else {
      // Development fallback - use local file or placeholder
      user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&size=300&background=random`;
    }

    await user.save();

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Upload Avatar Error:', error);
    
    // Clean up temp file on error
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    
    res.status(500).json({ message: 'Failed to upload avatar', error: error.message });
  }
};

// @desc    Get user statistics
// @route   GET /api/user/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const stats = {
      totalGamesPlayed: user.totalGamesPlayed,
      totalGamesWon: user.totalGamesWon,
      totalGamesLost: user.totalGamesLost,
      winRate: user.totalGamesPlayed > 0 ? ((user.totalGamesWon / user.totalGamesPlayed) * 100).toFixed(2) : 0,
      totalCoinsWon: user.totalCoinsWon,
      totalWithdrawal: user.totalWithdrawal,
      referralEarnings: user.referralEarnings,
      referredUsers: user.referredUsers.length
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Get User Stats Error:', error);
    res.status(500).json({ message: 'Failed to get user stats', error: error.message });
  }
};
