const express = require('express');
const ContactMessage = require('../models/ContactMessage');
const router = express.Router();

// Controller + route in same file
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, topic = 'General', subject, message, consent } = req.body || {};
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Basic anti-spam (optional honeypot on frontend already)
    if (typeof message === 'string' && message.length > 8000) {
      return res.status(400).json({ message: 'Message too long' });
    }

    await ContactMessage.create({
      name, email, phone, topic, subject, message, consent: !!consent,
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress,
      ua: req.headers['user-agent'] || ''
    });

    return res.json({ success: true });
  } catch (e) {
    console.error('Contact submit error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
