const express = require('express');
const auth = require('../middleware/auth');
const Timer = require('../models/Timer');
const User = require('../models/User');

function maxTimers(role) {
  if (role === 'admin') return 9999;
  if (role === 'pro') return 999;
  return 2;
}

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const list = await Timer.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ timers: list });
});

router.post('/', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  const count = await Timer.countDocuments({ userId: req.userId });
  if (count >= maxTimers(user.role)) {
    return res.status(400).json({ message: 'Timer limit reached' });
  }
  const { label, seconds } = req.body;
  const t = await Timer.create({ userId: req.userId, label, seconds });
  res.json({ success: true, timer: t });
});

router.delete('/:id', auth, async (req, res) => {
  await Timer.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ success: true });
});

module.exports = router;
