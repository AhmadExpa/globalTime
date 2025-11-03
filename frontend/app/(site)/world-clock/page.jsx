'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe2, Sun, Moon, Clock, ArrowUpDown, RefreshCw, X } from 'lucide-react';
import { worldClock } from '../../../lib/api';

export default function WorldClockPage() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('country'); // 'country' | 'time24' | 'offset'
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // Fetch and refresh every 60s so times stay fresh
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data } = await worldClock();
        if (!mounted) return;
        setRows(Array.isArray(data?.clocks) ? data.clocks : []);
      } catch (e) {
        // fail silently; keep previous rows
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchData();
    const id = setInterval(fetchData, 60_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? rows.filter(r =>
          (r.country || '').toLowerCase().includes(q) ||
          (r.timeZone || '').toLowerCase().includes(q)
        )
      : rows;

    const sorted = [...base].sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === 'offset') {
        // offsets like UTC+05:00 → normalize to minutes
        const toMin = v => {
          if (!v) return 0;
          const m = String(v).match(/UTC([+-])(\d{2}):(\d{2})/i);
          if (!m) return 0;
          const sign = m[1] === '-' ? -1 : 1;
          return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3], 10));
        };
        av = toMin(av); bv = toMin(bv);
      }
      if (sortKey === 'time24') {
        // HH:mm → minutes since midnight
        const toMin = v => {
          if (!v) return 0;
          const [h, m] = String(v).split(':').map(n => parseInt(n, 10));
          return (h || 0) * 60 + (m || 0);
        };
        av = toMin(av); bv = toMin(bv);
      }
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [rows, query, sortKey, sortDir]);

  const toggleSort = key => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="min-h-[80vh] space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className="rounded-2xl border bg-white shadow-sm p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center rounded-xl border bg-white p-2 shadow-sm">
              <Globe2 className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">World Clock</h1>
              <p className="text-sm text-slate-600">195 time zones & regions • live</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => inputRef.current?.focus()}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
            <button
              onClick={() => {
                // trigger immediate refresh by toggling isLoading and reusing effect interval tick via a quick fetch
                (async () => {
                  try {
                    setIsLoading(true);
                    const { data } = await worldClock();
                    setRows(Array.isArray(data?.clocks) ? data.clocks : []);
                  } finally {
                    setIsLoading(false);
                  }
                })();
              }}
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
              aria-label="Refresh times"
            >
              <RefreshCw className={"h-4 w-4 " + (isLoading ? 'animate-spin' : '')} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by country or IANA zone…"
              className="w-full rounded-xl border bg-white px-10 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-200"
              aria-label="Search countries"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 hover:bg-slate-100"
                aria-label="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500">Showing <span className="font-medium">{filtered.length}</span> of {rows.length || 0}</div>
        </div>
      </motion.header>

      {/* Table Card */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.05 }}
        className="rounded-2xl border bg-white shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
              <tr className="text-slate-600">
                <ThButton onClick={() => toggleSort('country')} active={sortKey==='country'} dir={sortDir}>Country</ThButton>
                <ThButton onClick={() => toggleSort('time24')} active={sortKey==='time24'} dir={sortDir} className="hidden md:table-cell">
                  Local Time (24h)
                </ThButton>
                <th className="text-left py-3 px-3">Local Time (12h)</th>
                <ThButton onClick={() => toggleSort('offset')} active={sortKey==='offset'} dir={sortDir}>UTC Offset</ThButton>
                <th className="text-left py-3 px-3">Sunrise / Sunset</th>
                <th className="text-left py-3 px-3">IANA Zone</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((r, i) => (
                  <motion.tr
                    key={`${r.country}-${r.timeZone}-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="border-t hover:bg-slate-50/60"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="font-medium">{r.country}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono hidden md:table-cell">{r.time24}</td>
                    <td className="py-3 px-3 font-mono">{r.time12}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center rounded-lg border bg-white px-2 py-1 text-xs shadow-sm">
                        {r.offset}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Sun className="h-4 w-4" />
                        <span className="font-mono text-xs">{r.sunriseLocal}</span>
                        <span className="text-slate-400">/</span>
                        <Moon className="h-4 w-4" />
                        <span className="font-mono text-xs">{r.sunsetLocal}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-500 font-mono">{r.timeZone}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-10 text-center text-slate-500">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border bg-white shadow-sm">
              <Search className="h-5 w-5" />
            </div>
            <p className="font-medium">No results</p>
            <p className="text-sm">Try a different country or IANA zone.</p>
          </div>
        )}
      </motion.section>

      {/* Footer note */}
      <p className="text-center text-xs text-slate-500">
        Data updates every minute. Times shown are local to each region.
      </p>
    </div>
  );
}

function ThButton({ children, onClick, active, dir, className = '' }) {
  return (
    <th className={"text-left py-3 px-3 " + className}>
      <button
        onClick={onClick}
        className={
          "inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-sm hover:bg-slate-100 " +
          (active ? 'font-semibold' : 'font-medium')
        }
      >
        {children}
        <ArrowUpDown className={"h-4 w-4 " + (active ? 'opacity-100' : 'opacity-50')} />
        <span className="sr-only">Sort</span>
      </button>
    </th>
  );
}
