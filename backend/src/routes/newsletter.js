const express = require('express');
const Newsletter = require('../models/Newsletter');
const router = express.Router();

router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  await Newsletter.create({ email });
  res.json({ success: true });
});

module.exports = router;
