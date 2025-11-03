const express = require('express');
const User = require('../models/User');
const UpgradeRequest = require('../models/UpgradeRequest');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json({
    _id: user._id,
    email: user.email,
    role: user.role,
    preferredClockType: user.preferredClockType,
    preferredTheme: user.preferredTheme
  });
});

router.put('/preferences', auth, async (req, res) => {
  const { preferredClockType, preferredTheme } = req.body;
  await User.findByIdAndUpdate(req.userId, { preferredClockType, preferredTheme });
  res.json({ success: true });
});

router.post('/upgrade-request', auth, async (req, res) => {
  const existing = await UpgradeRequest.findOne({ userId: req.userId, status: 'pending' });
  if (existing) return res.json({ success: true }); // already pending
  await UpgradeRequest.create({ userId: req.userId, email: req.userEmail });
  res.json({ success: true });
});

module.exports = router;
