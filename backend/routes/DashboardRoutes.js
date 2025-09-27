const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getDashboardStats, getUserActivity } = require('../controllers/DashboardController');

// Get dashboard statistics
router.get('/stats', authMiddleware, getDashboardStats);

// Get user activity
router.get('/activity', authMiddleware, getUserActivity);

module.exports = router;
