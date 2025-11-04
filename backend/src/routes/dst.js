// routes/dst.js
const express = require('express');
const { DateTime } = require('luxon');

const data = require('../worldData195.json');

const router = express.Router();

function normalizeSortKey(k) {
  const allowed = new Set(['country', 'city', 'nextChange', 'offset', 'time24']);
  return allowed.has(k) ? k : 'country';
}

function safeSetZone(dt, tz) {
  const z = dt.setZone(tz);
  return z.isValid ? z : dt;
}

function getOffsetMinutes(zone, dtUTC) {
  return safeSetZone(dtUTC, zone).offset;
}

// --- replace your current findTransition with this ---
function findTransition(zone, startDT, direction = 1) {
  // direction: +1 next change, -1 previous change
  const maxDays = 450;
  const stepDays = direction > 0 ? 1 : -1;

  const ms = (dt) => dt.toMillis();
  const midpointUTC = (a, b) =>
    DateTime.fromMillis(Math.floor((ms(a) + ms(b)) / 2), { zone: 'utc' });

  let cursor = startDT; // assume UTC
  let lastOffset = getOffsetMinutes(zone, cursor);

  for (let i = 0; i < maxDays; i++) {
    const nextCursor = cursor.plus({ days: stepDays });
    const nextOffset = getOffsetMinutes(zone, nextCursor);

    if (nextOffset !== lastOffset) {
      // Offset change occurs between cursor and nextCursor
      let lo = stepDays > 0 ? cursor : nextCursor;
      let hi = stepDays > 0 ? nextCursor : cursor;

      // narrow down to hour precision
      while (ms(hi) - ms(lo) > 60 * 60 * 1000) {
        const mid = midpointUTC(lo, hi);
        const midOff = getOffsetMinutes(zone, mid);
        if (midOff === lastOffset) lo = mid; else hi = mid;
      }
      // narrow down to minute precision
      while (ms(hi) - ms(lo) > 60 * 1000) {
        const mid = midpointUTC(lo, hi);
        const midOff = getOffsetMinutes(zone, mid);
        if (midOff === lastOffset) lo = mid; else hi = mid;
      }

      const at = hi;
      const beforeOff = getOffsetMinutes(zone, at.minus({ minutes: 2 }));
      const afterOff = getOffsetMinutes(zone, at.plus({ minutes: 2 }));
      return {
        atUTC: at.toUTC(),
        beforeOffset: beforeOff,
        afterOffset: afterOff,
        type: afterOff > beforeOff ? 'DST starts' : 'DST ends',
      };
    }

    cursor = nextCursor;
    lastOffset = nextOffset;
  }
  return null; // No transition found in search window
}


function hasDST(zone, nowUTC) {
  // Quick heuristic: if next or previous change exists in ~450 days span, the zone observes DST
  const next = findTransition(zone, nowUTC, +1);
  const prev = findTransition(zone, nowUTC, -1);
  return Boolean(next || prev);
}

// GET /api/dst
// Query params:
// q        : search (country/city/iana tz)
// country  : exact country match
// tz       : exact IANA timezone match
// active   : 'true' -> only currently in DST
// limit    : 1..500 (default 100)
// offset   : >=0 (default 0)
// sort     : country | city | nextChange | offset | time24 (default country)
// dir      : asc | desc (default asc)
router.get('/', async (req, res) => {
  const nowUTC = DateTime.utc();

  const q = String(req.query.q || '').trim().toLowerCase();
  const countryFilter = String(req.query.country || '').trim().toLowerCase();
  const tzFilter = String(req.query.tz || '').trim();
  const activeOnly = String(req.query.active || '').toLowerCase() === 'true';

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
      const hay = `${countryStr} ${cityStr} ${tzStr}`;
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Keep only zones that actually have DST rules (or are currently in DST if activeOnly)
  rows = rows.filter((r) => {
    const zNow = safeSetZone(nowUTC, r.timeZone);
    if (!zNow.isValid) return false;
    if (activeOnly) return zNow.isInDST ?? false;
    return hasDST(r.timeZone, nowUTC);
  });

  const total = rows.length;

  function formatRow(entry) {
    const { country, city, timeZone } = entry;
    const nowLocal = safeSetZone(nowUTC, timeZone);
    const offsetMinutes = nowLocal.offset;
    const offsetStr = nowLocal.toFormat('ZZZZ'); // e.g., UTC+05:00
    const isDST = nowLocal.isInDST ?? false;

    const next = findTransition(timeZone, nowUTC, +1);
    const prev = findTransition(timeZone, nowUTC, -1);

    const fmt = (dt) => dt?.setZone(timeZone).toFormat("yyyy-LL-dd HH:mm");
    const fmtISO = (dt) => dt?.toISO();

    return {
      country,
      city: city || undefined,
      timeZone,
      time24: nowLocal.toFormat('HH:mm:ss'),
      time12: nowLocal.toFormat('hh:mm:ss a'),
      offset: offsetStr,
      offsetMinutes,
      isDST,
      nextChangeUTC: fmtISO(next?.atUTC),
      nextChangeLocal: next ? fmt(next.atUTC) : null,
      nextChangeType: next?.type || null,
      prevChangeUTC: fmtISO(prev?.atUTC),
      prevChangeLocal: prev ? fmt(prev.atUTC) : null,
      prevChangeType: prev?.type || null,
    };
  }

  const page = rows.slice(offset, offset + limit).map(formatRow);

  const sortAccessor = (r) => {
    if (sortKey === 'offset') return r.offsetMinutes || 0;
    if (sortKey === 'time24') {
      const [h, m, s] = String(r.time24 || '00:00:00').split(':').map(n => parseInt(n, 10));
      return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
    }
    if (sortKey === 'nextChange') {
      // nulls last in asc, first in desc
      return r.nextChangeUTC ? Date.parse(r.nextChangeUTC) : (sortDir === 'asc' ? Infinity : -Infinity);
    }
    return String(r[sortKey] || '').toLowerCase();
  };

  page.sort((a, b) => {
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
    count: page.length,
    sort: sortKey,
    dir: sortDir,
    clocks: page,
  });
});

module.exports = router;
