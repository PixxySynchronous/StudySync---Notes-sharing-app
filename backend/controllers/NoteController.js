const Note = require('../models/Note');
const SharedNote = require('../models/SharedNote');

// Create a new note
exports.createNote = async (req, res) => {
    const { title, content, tags } = req.body;
    try {
        const note = await Note.create({
            owner: req.user.id,
            title,
            content,
            tags
        });
        res.json({ message: 'Note created', note });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all notes of logged-in user
exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ owner: req.user.id });
        res.json(notes);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a note
exports.updateNote = async (req, res) => {
    const { noteId } = req.params;
    const { title, content, tags } = req.body;
    try {
        // First check if user owns the note
        let note = await Note.findOne({ _id: noteId, owner: req.user.id });
        
        // If user doesn't own it, check if they have edit permission via sharing
        if (!note) {
            const sharedNote = await SharedNote.findOne({
                note: noteId,
                sharedWith: req.user.id,
                permission: 'edit'
            });
            
            if (!sharedNote) {
                return res.status(404).json({ message: 'Note not found or no edit permission' });
            }
            
            // User has edit permission, update the note
            note = await Note.findByIdAndUpdate(
                noteId,
                { title, content, tags },
                { new: true }
            );
        } else {
            // User owns the note, update normally
            note = await Note.findByIdAndUpdate(
                noteId,
                { title, content, tags },
                { new: true }
            );
        }
        
        if(!note) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note updated', note });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a note
exports.deleteNote = async (req, res) => {
    const { noteId } = req.params;
    try {
        const note = await Note.findOneAndDelete({ _id: noteId, owner: req.user.id });
        if(!note) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note deleted' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

// Search notes
exports.searchNotes = async (req, res) => {
    const { query } = req.query;
    try {
        const notes = await Note.find({
            owner: req.user.id,
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } }
            ]
        });
        res.json(notes);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

// Get note by ID
exports.getNoteById = async (req, res) => {
    const { noteId } = req.params;
    try {
        // First check if user owns the note
        let note = await Note.findOne({ _id: noteId, owner: req.user.id });
        
        // If user doesn't own it, check if they have access via sharing
        if (!note) {
            const sharedNote = await SharedNote.findOne({
                note: noteId,
                sharedWith: req.user.id
            });
            
            if (!sharedNote) {
                return res.status(404).json({ message: 'Note not found or no access' });
            }
            
            // User has access via sharing, get the note
            note = await Note.findById(noteId);
            
            // Add permission info to the response
            if (note) {
                note = note.toObject();
                note.sharedPermission = sharedNote.permission;
                note.isShared = true;
            }
        } else {
            // User owns the note
            note = note.toObject();
            note.isOwner = true;
        }
        
        if(!note) return res.status(404).json({ message: 'Note not found' });
        res.json(note);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};
