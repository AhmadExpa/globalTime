const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  email: { type: String, trim: true, required: true },
  phone: { type: String, trim: true },
  topic: { type: String, trim: true, default: 'General' },
  subject: { type: String, trim: true, required: true },
  message: { type: String, trim: true, required: true },
  consent: { type: Boolean, default: false },
  ip: { type: String },
  ua: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
