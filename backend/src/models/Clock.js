const mongoose = require('mongoose');
const ClockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, default: '' },
  timeZone: { type: String, required: true },
  type: { type: String, enum: ['analog','digital'], default: 'analog' },
  theme: { type: String, default: 'classic' }
}, { timestamps: true });

module.exports = mongoose.model('Clock', ClockSchema);
