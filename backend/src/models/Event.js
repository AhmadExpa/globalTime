const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:      { type: String, required: true },
  targetISO:  { type: String, required: true },
  bgColor:    { type: String, default: '#ffffff' },
  textColor:  { type: String, default: '#000000' },
  bullets:    { type: [String], default: [] },

  // Sharing
  shareSlug:      { type: String, index: true, unique: true, sparse: true },
  shareEnabled:   { type: Boolean, default: false },
  shareExpiresAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
