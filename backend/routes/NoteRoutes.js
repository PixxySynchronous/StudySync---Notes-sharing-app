const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { 
    createNote, 
    getNotes, 
    updateNote, 
    deleteNote, 
    searchNotes, 
    getNoteById 
} = require('../controllers/NoteController');

router.post('/', auth, createNote);
router.get('/', auth, getNotes);
router.get('/search', auth, searchNotes);
router.get('/:noteId', auth, getNoteById);
router.put('/:noteId', auth, updateNote);
router.delete('/:noteId', auth, deleteNote);

module.exports = router;
