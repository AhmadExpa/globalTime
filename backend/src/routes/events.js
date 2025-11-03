const express = require('express');
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const { DateTime } = require('luxon');
const { createEvents } = require('ics');
const crypto = require('crypto');

function maxEvents(role) {
  if (role === 'admin') return 9999;
  if (role === 'pro') return 4;
  return 2;
}
const isHexColor = (s) => typeof s === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s);

const router = express.Router();

// List (auth)
router.get('/', auth, async (req, res, next) => {
  try {
    const list = await Event.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ events: list });
  } catch (err) { next(err); }
});

// Create (auth)
router.post('/', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const count = await Event.countDocuments({ userId: req.userId });
    if (count >= maxEvents(user?.role || 'free')) {
      return res.status(400).json({ message: 'Event limit reached' });
    }

    let { title, targetISO, bgColor, textColor, bullets } = req.body || {};
    title = (title || '').trim();
    if (!title) return res.status(422).json({ message: 'Title is required' });

    const dt = DateTime.fromISO(targetISO);
    if (!dt.isValid) return res.status(422).json({ message: 'targetISO must be a valid ISO datetime' });

    targetISO = dt.toUTC().toISO({ suppressMilliseconds: true });

    if (bgColor && !isHexColor(bgColor)) return res.status(422).json({ message: 'bgColor must be a valid hex color like #RRGGBB' });
    if (textColor && !isHexColor(textColor)) return res.status(422).json({ message: 'textColor must be a valid hex color like #RRGGBB' });

    if (!Array.isArray(bullets)) bullets = [];
    bullets = bullets.map(String).map(s => s.trim()).filter(Boolean);

    const e = await Event.create({
      userId: req.userId, title, targetISO,
      bgColor: bgColor || '#ffffff',
      textColor: textColor || '#000000',
      bullets
    });

    res.json({ success: true, event: e });
  } catch (err) {
    if (err?.name === 'ValidationError') return res.status(422).json({ message: err.message });
    next(err);
  }
});

// Delete (auth)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    await Event.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// PDF (auth)
router.get('/:id/pdf', auth, async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.userId });
    if (!event) return res.status(404).end();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="event-${event._id}.pdf"`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text(event.title, { align: 'left' });
    doc.moveDown();

    const dt = DateTime.fromISO(event.targetISO);
    doc.fontSize(12).text(`Event Time (Local): ${dt.toFormat('fff')}`);
    doc.text(`Event Time (UTC): ${dt.toUTC().toFormat('fff')}`);
    doc.moveDown();

    doc.fontSize(14).text('Agenda / Bullets:', { underline: true });
    doc.moveDown(0.5);
    (event.bullets || []).forEach((b) => { doc.text(`• ${b}`); });

    doc.end();
  } catch (err) { next(err); }
});

// ICS (auth)
router.get('/:id/ics', auth, async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.userId });
    if (!event) return res.status(404).end();

    const dt = DateTime.fromISO(event.targetISO).toUTC();
    const icsEvent = [{
      title: event.title,
      start: [dt.year, dt.month, dt.day, dt.hour, dt.minute],
      duration: { minutes: 60 }
    }];

    createEvents(icsEvent, (error, value) => {
      if (error) return res.status(500).json({ message: 'ICS error' });
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="event-${event._id}.ics"`);
      res.send(value);
    });
  } catch (err) { next(err); }
});

// Helpers
function makeSlug(len = 16) {
  return crypto.randomBytes(len).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Create/refresh share link (auth)
router.post('/:id/share', auth, async (req, res, next) => {
  try {
    const { enable = true, expiresInDays = 30 } = req.body || {};
    const ev = await Event.findOne({ _id: req.params.id, userId: req.userId });
    if (!ev) return res.status(404).json({ message: 'Not found' });

    if (!enable) {
      ev.shareEnabled = false;
      ev.shareExpiresAt = null;
      await ev.save();
      return res.json({ disabled: true });
    }

    if (!ev.shareSlug) ev.shareSlug = makeSlug(16);
    ev.shareEnabled = true;
    const days = Math.max(1, Math.min(365, Number(expiresInDays) || 30));
    ev.shareExpiresAt = DateTime.utc().plus({ days }).toJSDate();
    await ev.save();

    const base = process.env.PUBLIC_APP_ORIGIN || `${req.protocol}://${req.get('host')}`;
    const url = `${process.env.FRONTEND}/share/${ev.shareSlug}`;
    res.json({ url, expiresAt: ev.shareExpiresAt });
  } catch (err) { next(err); }
});

// Public fetch (no auth) – countdown payload only
router.get('/public/:slug', async (req, res, next) => {
  try {
    const ev = await Event.findOne({ shareSlug: req.params.slug });
    if (!ev || !ev.shareEnabled) return res.status(404).end();
    if (ev.shareExpiresAt && ev.shareExpiresAt < new Date()) return res.status(404).end();

    res.json({
      title: ev.title,
      targetISO: ev.targetISO,
      bgColor: ev.bgColor,
      textColor: ev.textColor,
      bullets: ev.bullets || [],
    });
  } catch (err) { next(err); }
});

// Disable share (auth)
router.delete('/:id/share', auth, async (req, res, next) => {
  try {
    const ev = await Event.findOne({ _id: req.params.id, userId: req.userId });
    if (!ev) return res.status(404).json({ message: 'Not found' });
    ev.shareEnabled = false;
    await ev.save();
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
