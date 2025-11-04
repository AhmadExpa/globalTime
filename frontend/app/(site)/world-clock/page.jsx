"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Globe2,
  Sun,
  Moon,
  Clock,
  ArrowUpDown,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Globe,
} from "lucide-react";
import { worldClock } from "../../../lib/api";

export default function WorldClockPage() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("country"); // 'country' | 'city' | 'time24' | 'offset'
  const [sortDir, setSortDir] = useState("asc");
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);
  const inputRef = useRef(null);

  const page = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  // Fetch page
  async function load() {
    setIsLoading(true);
    try {
      const data = await worldClock({
        q: query,
        sort: sortKey,
        dir: sortDir,
        limit,
        offset,
      });
      setRows(Array.isArray(data?.clocks) ? data.clocks : []);
      setTotal(data?.total || 0);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      if (alive) await load();
    })();
    const id = setInterval(() => {
      if (alive) load();
    }, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [query, sortKey, sortDir, limit, offset]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const nextPage = () =>
    setOffset((o) => Math.min(o + limit, Math.max(total - limit, 0)));
  const prevPage = () => setOffset((o) => Math.max(o - limit, 0));

  // Background gradient + subtle globe image
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(56,189,248,0.25),transparent),radial-gradient(1000px_600px_at_80%_-20%,rgba(167,139,250,0.25),transparent),radial-gradient(600px_600px_at_50%_120%,rgba(34,197,94,0.25),transparent)]" />

      {/* Decorative world image (local or remote). Replace src with your asset if needed. */}
      <div className="absolute -right-20 -top-20 opacity-20 select-none hidden md:block">
        <img
          src="https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=1400&auto=format&fit=crop"
          alt="World"
          className="w-[560px] h-[560px] rounded-full object-cover mix-blend-overlay"
        />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="rounded-3xl border bg-white/70 backdrop-blur shadow-lg p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center rounded-2xl border bg-white p-2 shadow-sm">
                <Globe2 className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  World Clock
                </h1>
                <p className="text-sm text-slate-600">
                  {total.toLocaleString()} cities • live
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => inputRef.current?.focus()}
                className="hidden sm:inline-flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
              <button
                onClick={load}
                className="inline-flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
                aria-label="Refresh times"
              >
                <RefreshCw
                  className={"h-4 w-4 " + (isLoading ? "animate-spin" : "")}
                />
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
                onChange={(e) => {
                  setOffset(0);
                  setQuery(e.target.value);
                }}
                placeholder="Search by country, city, or IANA zone…"
                className="w-full rounded-2xl border bg-white px-10 py-2.5 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-sky-200"
                aria-label="Search"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setOffset(0);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 hover:bg-slate-100"
                  aria-label="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="mt-2 text-xs text-slate-600">
              Page <span className="font-medium">{page}</span> of {pageCount} •
              Showing <span className="font-medium">{rows.length}</span> of{" "}
              <span className="font-medium">{total.toLocaleString()}</span>
            </div>
          </div>
        </motion.header>

        {/* Controls */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Select
              value={String(limit)}
              onChange={(e) => {
                setOffset(0);
                setLimit(Number(e.target.value));
              }}
              label="Page size"
            >
              {[50, 100, 200, 300, 500].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <PagerButton onClick={prevPage} disabled={offset === 0}>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </PagerButton>
            <PagerButton onClick={nextPage} disabled={offset + limit >= total}>
              Next
              <ChevronRight className="h-4 w-4" />
            </PagerButton>
          </div>
        </div>

        {/* Table Card */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 16,
            delay: 0.05,
          }}
          className="mt-3 rounded-3xl border bg-white/80 backdrop-blur shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <tr className="text-slate-600">
                  <ThButton
                    onClick={() => toggleSort("country")}
                    active={sortKey === "country"}
                    dir={sortDir}
                  >
                    Country / City
                  </ThButton>
                  <ThButton
                    onClick={() => toggleSort("time24")}
                    active={sortKey === "time24"}
                    dir={sortDir}
                    className="hidden md:table-cell"
                  >
                    Local Time (24h)
                  </ThButton>
                  <th className="text-left py-3 px-3">Local Time (12h)</th>
                  <ThButton
                    onClick={() => toggleSort("offset")}
                    active={sortKey === "offset"}
                    dir={sortDir}
                  >
                    UTC Offset
                  </ThButton>
                  <th className="text-left py-3 px-3">Sunrise / Sunset</th>
                  <th className="text-left py-3 px-3">IANA Zone</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {rows.map((r, i) => (
                    <motion.tr
                      key={`${r.country}-${r.timeZone}-${i}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="border-t hover:bg-slate-50/60"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-xl border bg-gradient-to-br from-sky-100 via-indigo-100 to-emerald-100">
                            <img
                              src={`https://source.unsplash.com/40x40/?city,night,${encodeURIComponent(
                                r.city || r.country
                              )}`}
                              alt="city"
                              className="absolute inset-0 h-full w-full object-cover opacity-70"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-60">
                              <Globe className="h-4 w-4" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {r.city ? `${r.city}` : r.country}
                            </div>
                            <div className="truncate text-xs text-slate-500">
                              {r.city ? r.country : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono hidden md:table-cell">
                        {r.time24}
                      </td>
                      <td className="py-3 px-3 font-mono">{r.time12}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center rounded-lg border bg-white px-2 py-1 text-xs shadow-sm">
                          {r.offset}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Sun className="h-4 w-4" />
                          <span className="font-mono text-xs">
                            {r.sunriseLocal}
                          </span>
                          <span className="text-slate-400">/</span>
                          <Moon className="h-4 w-4" />
                          <span className="font-mono text-xs">
                            {r.sunsetLocal}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500 font-mono">
                        {r.timeZone}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="p-10 text-center text-slate-500">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border bg-white shadow-sm">
                <Search className="h-5 w-5" />
              </div>
              <p className="font-medium">No results</p>
              <p className="text-sm">
                Try a different country, city, or IANA zone.
              </p>
            </div>
          )}
        </motion.section>

        {/* Footer with pager duplication for convenience */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Data refreshes every minute. Times are local to each city.
          </div>
          <div className="flex items-center gap-2">
            <PagerButton onClick={prevPage} disabled={offset === 0}>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </PagerButton>
            <PagerButton onClick={nextPage} disabled={offset + limit >= total}>
              Next
              <ChevronRight className="h-4 w-4" />
            </PagerButton>
          </div>
        </div>
      </main>
    </div>
  );
}

function ThButton({ children, onClick, active, dir, className = "" }) {
  return (
    <th className={"text-left py-3 px-3 " + className}>
      <button
        onClick={onClick}
        className={
          "inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-sm hover:bg-slate-100 " +
          (active ? "font-semibold" : "font-medium")
        }
      >
        {children}
        <ArrowUpDown
          className={"h-4 w-4 " + (active ? "opacity-100" : "opacity-50")}
        />
        <span className="sr-only">Sort</span>
      </button>
    </th>
  );
}

function PagerButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        "inline-flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 text-sm shadow-sm " +
        (disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50")
      }
    >
      {children}
    </button>
  );
}

function Select({ value, onChange, children, label }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-slate-600">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="rounded-xl border bg-white px-2 py-1.5 shadow-sm"
      >
        {children}
      </select>
    </label>
  );
}
