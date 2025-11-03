const mongoose = require('mongoose');
const EventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  targetISO: { type: String, required: true }, // ISO string of target datetime
  bgColor: { type: String, default: '#ffffff' },
  textColor: { type: String, default: '#000000' },
  bullets: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
