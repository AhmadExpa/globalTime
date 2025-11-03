'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Globe, Search, ArrowUpDown, LayoutGrid } from 'lucide-react';

// Adjust these to your project structure

import { worldClockDiff } from '../../../lib/api';
import { COUNTRIES } from '../countryData';

export default function TimeDifference() {
  // default to Pakistan → Asia/Karachi
  const defaultCountry = useMemo(
    () => COUNTRIES.find(c => c.country === 'Pakistan') ?? COUNTRIES[0],
    []
  );

  const [baseCountry, setBaseCountry] = useState(defaultCountry.country);
  const baseTZ = useMemo(
    () =>
      COUNTRIES.find(c => c.country === baseCountry)?.timeZone ??
      defaultCountry.timeZone,
    [baseCountry, defaultCountry]
  );

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState('diff'); // 'diff' | 'country'
  const [sortAsc, setSortAsc] = useState(true);
  const [now, setNow] = useState(new Date());

  async function load() {
    const { data } = await worldClockDiff(baseTZ);
    setRows(Array.isArray(data?.rows) ? data.rows : []);
  }

  useEffect(() => {
    load();
  }, [baseTZ]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    let f = rows.filter(r =>
      r.country?.toLowerCase?.().includes(q.toLowerCase())
    );
    f.sort((a, b) => {
      if (sortKey === 'country') {
        const aa = a.country.toLowerCase();
        const bb = b.country.toLowerCase();
        return sortAsc ? aa.localeCompare(bb) : bb.localeCompare(aa);
      }
      // sort by diff
      return sortAsc ? a.diffHours - b.diffHours : b.diffHours - a.diffHours;
    });
    return f;
  }, [rows, q, sortKey, sortAsc]);

  const baseDisplayTime = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: baseTZ,
      }).format(now);
    } catch {
      return '';
    }
  }, [now, baseTZ]);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.02 } } };
  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-6 text-slate-900">
      {/* Header / Controls */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 140, damping: 16 }}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
            <Globe className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-semibold">Time Difference Calculator</h2>
            <p className="mt-1 text-sm text-slate-600">
              Pick a base country; we’ll show the hour difference for every other country relative to it.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {/* Country selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-slate-500">Base country</span>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 pr-8 text-sm shadow-sm outline-none transition focus:border-slate-400"
                    value={baseCountry}
                    onChange={e => setBaseCountry(e.target.value)}
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.country} value={c.country}>
                        {c.country}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                    ▾
                  </span>
                </div>
              </div>

              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    placeholder="Search country…"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                  />
                </div>
              </div>

              {/* Live base time */}
              <div className="md:col-span-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>
                  Local time in <span className="font-medium">{baseCountry}</span>{' '}
                  (<code className="text-xs">{baseTZ}</code>):
                </span>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs">
                  {baseDisplayTime}
                </span>
              </div>
            </div>

            {/* Sorting */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setSortKey('diff');
                  setSortAsc(s => (sortKey === 'diff' ? !s : true));
                }}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:bg-slate-50 ${
                  sortKey === 'diff' ? 'border-slate-400' : 'border-slate-200'
                }`}
              >
                <ArrowUpDown className="h-4 w-4" />
                Sort by Δ hours {sortKey === 'diff' ? (sortAsc ? '(asc)' : '(desc)') : ''}
              </button>
              <button
                onClick={() => {
                  setSortKey('country');
                  setSortAsc(s => (sortKey === 'country' ? !s : true));
                }}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:bg-slate-50 ${
                  sortKey === 'country' ? 'border-slate-400' : 'border-slate-200'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Sort by Country {sortKey === 'country' ? (sortAsc ? '(A–Z)' : '(Z–A)') : ''}
              </button>
              <span className="text-xs text-slate-500 ml-auto">
                Showing {filtered.length.toLocaleString()} matches
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cards grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence initial={false}>
          {filtered.map((r, i) => {
            const diff = r.diffHours;
            const tz = r.timeZone;

            // Local time for each country (from its own tz)
            let local = '';
            try {
              local = new Intl.DateTimeFormat(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: tz,
              }).format(now);
            } catch {
              local = '';
            }

            const chip =
              diff === 0
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : diff > 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200';

            const bar =
              diff === 0
                ? 'bg-slate-200'
                : diff > 0
                ? 'bg-emerald-400'
                : 'bg-rose-400';

            return (
              <motion.div
                key={`${r.country}-${i}`}
                variants={item}
                layout
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Accent bar */}
                <div className={`absolute left-0 top-0 h-full w-1 ${bar}`} />

                <div className="flex items-start gap-3">
                  <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold truncate">{r.country}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="truncate text-slate-600">{tz}</span>
                      <span
                        className={`ml-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] ${chip}`}
                        title="Hour difference vs base"
                      >
                        Δ {diff > 0 ? `+${diff}` : diff}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{local}</span>
                </div>

                {/* Hover flourish */}
                <motion.div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
                  initial={false}
                  animate={{}}
                >
                  <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-slate-100/70 blur-2xl" />
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <motion.p
        className="text-xs text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Differences are computed by your <code>worldClockDiff</code> API relative to the selected base
        country’s time zone.
      </motion.p>
    </div>
  );
}
