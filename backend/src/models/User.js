const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['free', 'pro', 'admin'], default: 'free' },
  preferredClockType: { type: String, enum: ['analog', 'digital'], default: 'analog' },
  preferredTheme: { type: String, default: 'classic' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
