const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const bcrypt = require('bcrypt');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload avatar
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const avatarPath = `/uploads/avatars/${req.file.filename}`;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { avatar: avatarPath },
            { new: true }
        ).select('-password');

        res.json({ 
            message: 'Avatar uploaded successfully', 
            user,
            avatarUrl: avatarPath 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Change password
router.put('/password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
        
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
