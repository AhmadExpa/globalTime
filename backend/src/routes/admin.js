const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Newsletter = require('../models/Newsletter');
const UpgradeRequest = require('../models/UpgradeRequest');
const nodemailer = require('nodemailer');

const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
}

router.get('/stats', auth, requireAdmin, async (req, res) => {
  const totalUsers = await User.countDocuments({});
  const totalSubscribers = await Newsletter.countDocuments({});
  res.json({ totalUsers, totalSubscribers });
});

router.post('/newsletter/send', auth, requireAdmin, async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) return res.status(400).json({ message: 'Missing subject/message' });
  const all = await Newsletter.find({}).lean();
  const toList = all.map(x => x.email).filter(Boolean);
  if (!toList.length) return res.json({ success: true, sent: 0 });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  let sentCount = 0;
  for (const to of toList) {
    try {
      await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text: message });
      sentCount++;
    } catch (e) { }
  }
  res.json({ success: true, sent: sentCount });
});

router.get('/requests', auth, requireAdmin, async (req, res) => {
  const list = await UpgradeRequest.find({}).sort({ createdAt: -1 }).lean();
  res.json({ requests: list });
});
router.post('/requests/:id/approve', auth, requireAdmin, async (req, res) => {
  const reqDoc = await UpgradeRequest.findById(req.params.id);
  if (!reqDoc) return res.status(404).json({ message: 'Not found' });
  await UpgradeRequest.updateOne({ _id: reqDoc._id }, { $set: { status: 'approved' } });
  await User.updateOne({ _id: reqDoc.userId }, { $set: { role: 'pro' } });
  res.json({ success: true });
});
router.post('/requests/:id/reject', auth, requireAdmin, async (req, res) => {
  const reqDoc = await UpgradeRequest.findById(req.params.id);
  if (!reqDoc) return res.status(404).json({ message: 'Not found' });
  await UpgradeRequest.updateOne({ _id: reqDoc._id }, { $set: { status: 'rejected' } });
  res.json({ success: true });
});
// NEW: list users with search + pagination
router.get('/users', auth, requireAdmin, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
  const q = (req.query.q || '').trim();

  const filter = q
    ? {
      $or: [
        { email: { $regex: q, $options: 'i' } },
        { role: { $regex: q, $options: 'i' } }
      ]
    }
    : {};

  const total = await User.countDocuments(filter);
  const items = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('_id email role preferredClockType preferredTheme createdAt')
    .lean();

  res.json({ total, items });
});

// NEW: unapprove (re-open) an approved request (and optionally downgrade user)
router.post('/requests/:id/unapprove', auth, requireAdmin, async (req, res) => {
  const reqDoc = await UpgradeRequest.findById(req.params.id);
  if (!reqDoc) return res.status(404).json({ message: 'Not found' });

  await UpgradeRequest.updateOne({ _id: reqDoc._id }, { $set: { status: 'pending' } });

  // Optional: downgrade user back to free if previously upgraded
  if (reqDoc.userId) {
    await User.updateOne({ _id: reqDoc.userId }, { $set: { role: 'free' } });
  }
  res.json({ success: true });
});
module.exports = router;
