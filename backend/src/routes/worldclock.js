const data = require('../worldData195.json');
const express = require('express');
const { DateTime } = require('luxon');
const SunCalc = require('suncalc');

const router = express.Router();

// Helpers
function toMinutesFromUTCOffsetStr(v) {
  if (!v) return 0;
  const m = String(v).match(/UTC([+-])(\d{2}):(\d{2})/i);
  if (!m) return 0;
  const sign = m[1] === '-' ? -1 : 1;
  return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3], 10));
}

function normalizeSortKey(k) {
  const allowed = new Set(['country', 'city', 'time24', 'offset']);
  return allowed.has(k) ? k : 'country';
}

// GET /api/worldclock
// Query params:
// q        : search text (country/city/iana tz)
// country  : exact country match (optional)
// tz       : exact IANA timezone match (optional)
// limit    : page size (default 100, max 500)
// offset   : page offset (default 0)
// sort     : country | city | time24 | offset (default country)
// dir      : asc | desc (default asc)
router.get('/', (req, res) => {
  const nowUTC = DateTime.utc();

  const q = String(req.query.q || '').trim().toLowerCase();
  const countryFilter = String(req.query.country || '').trim().toLowerCase();
  const tzFilter = String(req.query.tz || '').trim();

  const limitRaw = parseInt(req.query.limit, 10);
  const offsetRaw = parseInt(req.query.offset, 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 100;
  const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;

  const sortKey = normalizeSortKey(String(req.query.sort || 'country'));
  const sortDir = (req.query.dir === 'desc') ? 'desc' : 'asc';

  // Filter first (cheap)
  let rows = data.filter((r) => {
    const countryStr = String(r.country || '').toLowerCase();
    const cityStr = String(r.city || '').toLowerCase();
    const tzStr = String(r.timeZone || '').toLowerCase();

    if (countryFilter && countryStr !== countryFilter) return false;
    if (tzFilter && r.timeZone !== tzFilter) return false;
    if (q) {
      const hay = countryStr + ' ' + cityStr + ' ' + tzStr;
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const total = rows.length;

  // Compute current time + sun times ONLY for the requested page
  function formatRow(entry) {
    const { country, city, timeZone, lat, lon } = entry;
    let dt = nowUTC.setZone(timeZone);
    if (!dt.isValid) dt = nowUTC; // ultra-safe fallback

    const times = (Number.isFinite(lat) && Number.isFinite(lon))
      ? SunCalc.getTimes(new Date(), lat, lon)
      : null;

    const fmtSun = (d) => {
      if (!d) return '';
      try { return DateTime.fromJSDate(d).setZone(timeZone).toFormat('HH:mm'); } catch { return ''; }
    };

    return {
      country,                         // can be "Country : City - Country" or plain country
      city: city || undefined,         // included when available
      timeZone,
      time24: dt.toFormat('HH:mm:ss'),
      time12: dt.toFormat('hh:mm:ss a'),
      offset: dt.toFormat('ZZZZ'),     // e.g., UTC+05:00
      offsetMinutes: dt.offset,        // minutes offset from UTC (helps sorting by offset)
      isDST: dt.isInDST,
      sunriseLocal: fmtSun(times && times.sunrise),
      sunsetLocal: fmtSun(times && times.sunset),
      lat: Number.isFinite(lat) ? lat : undefined,
      lon: Number.isFinite(lon) ? lon : undefined,
    };
  }

  // Sort on lightweight fields first; for time24/offset, we can transform
  const sortAccessor = (r) => {
    if (sortKey === 'offset') return r.offsetMinutes || 0;
    if (sortKey === 'time24') {
      const [h, m, s] = String(r.time24 || '00:00:00').split(':').map(n => parseInt(n, 10));
      return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
    }
    // country / city (strings)
    return String(r[sortKey] || '').toLowerCase();
  };

  // Slice page, then compute heavy fields
  const pageEntries = rows.slice(offset, offset + limit).map(formatRow);

  // Secondary sort: after time formatting so time24/offset exist
  pageEntries.sort((a, b) => {
    const av = sortAccessor(a);
    const bv = sortAccessor(b);
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  res.json({
    generatedAtUTC: nowUTC.toISO(),
    total,
    limit,
    offset,
    count: pageEntries.length,
    sort: sortKey,
    dir: sortDir,
    clocks: pageEntries,
  });
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


