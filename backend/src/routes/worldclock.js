const express = require('express');
const { DateTime } = require('luxon');
const SunCalc = require('suncalc');
const data = require('../worldData195.json');

const router = express.Router();

router.get('/', (req, res) => {
  const nowUTC = DateTime.utc();
  const clocks = data.map(entry => {
    const { country, timeZone, lat, lon } = entry;
    let dt;
    try {
      dt = nowUTC.setZone(timeZone);
    } catch {
      dt = nowUTC;
    }
    const times = SunCalc.getTimes(new Date(), lat, lon);
    function fmt(d) {
      try { return DateTime.fromJSDate(d).setZone(timeZone).toFormat('HH:mm'); }
      catch { return ''; }
    }
    return {
      country,
      timeZone,
      time24: dt.toFormat('HH:mm:ss'),
      time12: dt.toFormat('hh:mm:ss a'),
      offset: dt.toFormat('ZZZZ'),
      sunriseLocal: fmt(times.sunrise),
      sunsetLocal: fmt(times.sunset)
    };
  });
  res.json({ generatedAtUTC: nowUTC.toISO(), clocks });
});

router.get('/diff', (req, res) => {
  const baseTz = req.query.base || 'UTC';
  const now = DateTime.utc();
  let base = now.setZone(baseTz);
  if (!base.isValid) base = now;
  const rows = data.map(entry => {
    const other = now.setZone(entry.timeZone);
    const diffHours = Math.round((other.offset - base.offset) / 60);
    return { country: entry.country, timeZone: entry.timeZone, diffHours };
  });
  res.json({ base: baseTz, rows });
});

module.exports = router;
