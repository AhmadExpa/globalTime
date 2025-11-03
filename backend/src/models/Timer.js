const mongoose = require('mongoose');
const TimerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, default: '' },
  seconds: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Timer', TimerSchema);
