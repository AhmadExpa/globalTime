const express = require('express');
const auth = require('../middleware/auth');
const Clock = require('../models/Clock');
const User = require('../models/User');

function maxClocks(role) {
  if (role === 'admin') return 9999;
  if (role === 'pro') return 4;
  return 2;
}

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const list = await Clock.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ clocks: list });
});

router.post('/', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  const count = await Clock.countDocuments({ userId: req.userId });
  if (count >= maxClocks(user.role)) {
    return res.status(400).json({ message: 'Clock limit reached' });
  }
  const { label, timeZone, type, theme } = req.body;
  const c = await Clock.create({ userId: req.userId, label, timeZone, type, theme });
  res.json({ success: true, clock: c });
});

router.put('/:id', auth, async (req, res) => {
  const { label, timeZone, type, theme } = req.body;
  await Clock.updateOne({ _id: req.params.id, userId: req.userId }, { $set: { label, timeZone, type, theme } });
  res.json({ success: true });
});

router.delete('/:id', auth, async (req, res) => {
  await Clock.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ success: true });
});

module.exports = router;
