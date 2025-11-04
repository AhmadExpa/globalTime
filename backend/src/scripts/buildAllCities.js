// backend/src/scripts/buildAllCities.js
// Build a "popular" city list: one representative city per IANA tz.
// Usage: node backend/src/scripts/buildAllCities.js

const fs = require('fs');
const path = require('path');
const cityTimezones = require('city-timezones');
const { getName } = require('country-list');

const OUT = path.resolve(process.cwd(), 'worldCities.popular.json');

// All raw rows (~130k)
const all = cityTimezones.cityMapping;

function safeCountryName(iso2, fallback) {
  const code = (typeof iso2 === 'string' ? iso2.trim() : '');
  if (!code) return fallback || 'Unknown';
  try {
    const n = getName(code);
    return n || fallback || 'Unknown';
  } catch {
    return fallback || 'Unknown';
  }
}

function looksLikeIana(zone) {
  if (typeof zone !== 'string' || !zone.includes('/')) return false;
  if (zone.startsWith('Etc/')) return false;
  // Avoid some legacy/systemy aliases if you want even cleaner list:
  // if (zone.startsWith('SystemV') || zone.startsWith('US/') || zone.startsWith('Canada/')) return false;
  return true;
}

function displayFromZone(tz) {
  // Use the last segment of the tz, replace underscores, and apply a few human-friendly fixes.
  const seg = tz.split('/').pop().replace(/_/g, ' ');

  // Light-touch overrides for better names
  const overrides = {
    'Ho Chi Minh': 'Ho Chi Minh City',
    'Kolkata': 'Kolkata', // keep modern name (not Calcutta)
    'Saigon': 'Ho Chi Minh City',
    'Kiev': 'Kyiv',
    'Torshavn': 'Tórshavn',
    'Uzhgorod': 'Uzhhorod',
    'Zaporozhye': 'Zaporizhzhia',
    'St Johns': "St. John's",
    'Sao Paulo': 'São Paulo'
  };

  const key = seg.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  // map by a simplified key; fall back to original seg
  const map = {
    'Ho Chi Minh': overrides['Ho Chi Minh'],
    'Sao Paulo': overrides['Sao Paulo'],
    'St Johns': overrides['St Johns'],
    'Torshavn': overrides['Torshavn'],
    'Kiev': overrides['Kiev'],
    'Uzhgorod': overrides['Uzhgorod'],
    'Zaporozhye': overrides['Zaporozhye'],
  };

  return overrides[seg] || map[key] || seg;
}

// Build one entry per unique time zone
const byTz = new Map();

// Pre-pass: prefer top-level zones over regional subzones if both exist.
// e.g., prefer "America/New_York" over "America/Indiana/Knox" for the same offset region.
for (const c of all) {
  const tz = c.timezone;
  if (!looksLikeIana(tz)) continue;

  // Heuristic: deprioritize zones with more than one slash (e.g., America/Indiana/Knox)
  const depth = tz.split('/').length;

  const current = byTz.get(tz);
  if (!current || depth < current.depth) {
    byTz.set(tz, {
      raw: c,
      depth
    });
  }
}

const rows = [];
for (const [tz, { raw }] of byTz.entries()) {
  const lat = Number(raw.lat);
  const lon = Number(raw.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

  const cityFromTz = displayFromZone(tz);
  const countryName = safeCountryName(raw.iso2, raw.country);

  rows.push({
    country: `${cityFromTz} - ${countryName}`,
    timeZone: tz,
    lat,
    lon
  });
}

// Deduplicate (by timeZone) and sort by display name
const seen = new Set();
const deduped = rows.filter(r => {
  const key = r.timeZone;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
}).sort((a, b) => a.country.localeCompare(b.country));

// Optional: if you want ~350ish, you can also filter out older/alias regions:
// Keep only zones whose ID has exactly one slash (drop America/Indiana/* etc).
const popular = deduped.filter(r => r.timeZone.split('/').length === 2);

fs.writeFileSync(OUT, JSON.stringify(popular, null, 2));
console.log(`Wrote ${popular.length} popular time zones -> ${OUT}`);
