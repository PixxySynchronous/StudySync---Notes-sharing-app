const SharedNote = require('../models/SharedNote');
const Note = require('../models/Note');
const User = require('../models/User');

// Share a note
exports.shareNote = async (req, res) => {
    const { noteId, sharedWithEmail, permission } = req.body;
    try {
        const note = await Note.findOne({ _id: noteId, owner: req.user.id });
        if(!note) return res.status(404).json({ message: 'Note not found' });

        const sharedWith = await User.findOne({ email: sharedWithEmail });
        if(!sharedWith) return res.status(404).json({ message: 'User to share with not found' });

        // Check if already shared
        const existingShare = await SharedNote.findOne({
            note: note._id,
            sharedWith: sharedWith._id
        });
        if(existingShare) {
            return res.status(400).json({ message: 'Note already shared with this user' });
        }

        const sharedNote = await SharedNote.create({
            note: note._id,
            sharedBy: req.user.id,
            sharedWith: sharedWith._id,
            permission: permission || 'read'
        });
        res.json({ message: 'Note shared', sharedNote });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all notes shared with the logged-in user
exports.getSharedNotes = async (req, res) => {
    try {
        const sharedNotes = await SharedNote.find({ sharedWith: req.user.id })
            .populate('note')
            .populate('sharedBy', 'name email');
        res.json(sharedNotes);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all notes shared by the logged-in user
exports.getNotesSharedByMe = async (req, res) => {
    try {
        const sharedNotes = await SharedNote.find({ sharedBy: req.user.id })
            .populate('note')
            .populate('sharedWith', 'name email avatar');
        res.json(sharedNotes);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

// Update sharing permission
exports.updateSharePermission = async (req, res) => {
    const { shareId } = req.params;
    const { permission } = req.body;
    try {
        const sharedNote = await SharedNote.findById(shareId);
        if(!sharedNote) {
            return res.status(404).json({ message: 'Shared note not found' });
        }

        // Check if user is the one who shared it (owner)
        if(sharedNote.sharedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this share' });
        }

        // Validate permission value
        if(!['read', 'edit'].includes(permission)) {
            return res.status(400).json({ message: 'Invalid permission value' });
        }

        const updatedShare = await SharedNote.findByIdAndUpdate(
            shareId, 
            { permission }, 
            { new: true }
        ).populate('sharedWith', 'name email');

        res.json({ 
            message: 'Permission updated successfully', 
            sharedNote: updatedShare 
        });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

// Remove sharing for a note
exports.removeShare = async (req, res) => {
    const { shareId } = req.params;
    try {
        const sharedNote = await SharedNote.findById(shareId);
        if(!sharedNote) {
            return res.status(404).json({ message: 'Shared note not found' });
        }

        // Check if user is the owner of the note or the one who shared it
        const note = await Note.findById(sharedNote.note);
        if(note.owner.toString() !== req.user.id && sharedNote.sharedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to remove this share' });
        }

        await SharedNote.findByIdAndDelete(shareId);
        res.json({ message: 'Share removed successfully' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};
