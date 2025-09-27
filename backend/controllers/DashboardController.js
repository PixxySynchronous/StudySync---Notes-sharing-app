const Note = require('../models/Note');
const SharedNote = require('../models/SharedNote');
const User = require('../models/User');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Count total notes by user
        const totalNotes = await Note.countDocuments({ owner: userId });
        
        // Count shared notes (notes shared with this user)
        const sharedNotes = await SharedNote.countDocuments({ sharedWith: userId });
        
        // Count notes shared by user
        const notesSharedByUser = await SharedNote.countDocuments({ sharedBy: userId });
        
        // Get recent notes (last 5)
        const recentNotes = await Note.find({ owner: userId })
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('title updatedAt');
        
        // Get notes by tags
        const notesByTags = await Note.aggregate([
            { $match: { owner: userId } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        
        res.json({
            totalNotes,
            sharedNotes,
            notesSharedByUser,
            recentNotes,
            notesByTags
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get user activity
exports.getUserActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get notes created in last 7 days
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const recentActivity = await Note.find({
            owner: userId,
            createdAt: { $gte: lastWeek }
        }).select('title createdAt updatedAt');
        
        res.json({ recentActivity });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
