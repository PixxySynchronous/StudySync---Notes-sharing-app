const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { shareNote, getSharedNotes, getNotesSharedByMe, updateSharePermission, removeShare } = require('../controllers/SharedController');

// Share a note with another user
router.post('/share', authMiddleware, shareNote);

// Get all notes shared with the current user
router.get('/notes', authMiddleware, getSharedNotes);

// Get all notes shared by the current user
router.get('/by-me', authMiddleware, getNotesSharedByMe);

// Update sharing permission
router.put('/:shareId/permission', authMiddleware, updateSharePermission);

// Remove sharing for a note
router.delete('/:shareId', authMiddleware, removeShare);

module.exports = router;
