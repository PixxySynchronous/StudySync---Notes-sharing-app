const mongoose = require('mongoose');

const SharedNoteSchema = new mongoose.Schema({
  note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
  sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  permission: { type: String, enum: ['read', 'edit'], default: 'read' }
}, { timestamps: true });

module.exports = mongoose.model('SharedNote', SharedNoteSchema);
