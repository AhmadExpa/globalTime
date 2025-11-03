"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Flag, Clock4, ArrowRight } from "lucide-react";

/**
 * Date & Time – light theme, fast, minimal
 * JSX only • Tailwind + Framer Motion + Lucide
 */
export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white text-slate-900">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <StopwatchCard />
          <NowCard />
        </div>
      </main>
      <CTA />
    </div>
  );
}

/**************** HEADER ****************/
function Header() {
  return (
    <section className="border-b bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-4xl font-semibold tracking-tight md:text-5xl"
        >
          Time tools, without the clutter.
        </motion.h1>
        <p className="mt-3 text-slate-600">
          Stopwatch with laps and a live clock. Light UI, quick to use.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-white">
            <Clock4 className="h-4 w-4" /> Precision-first
          </span>
          <kbd className="rounded-full border border-slate-300 px-3 py-1">
            Space: start/stop
          </kbd>
          <kbd className="rounded-full border border-slate-300 px-3 py-1">
            L: lap
          </kbd>
          <kbd className="rounded-full border border-slate-300 px-3 py-1">
            R: reset
          </kbd>
        </div>
      </div>
    </section>
  );
}

/**************** STOPWATCH ****************/
function StopwatchCard() {
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const ref = useRef(null);

  // 10ms tick when running
  useEffect(() => {
    if (running) ref.current = setInterval(() => setMs((m) => m + 10), 10);
    return () => ref.current && clearInterval(ref.current);
  }, [running]);

  // keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        setRunning((r) => !r);
      }
      const k = e.key?.toLowerCase();
      if (k === "l") {
        e.preventDefault();
        if (running) setLaps((ls) => [ms, ...ls]);
      }
      if (k === "r") {
        e.preventDefault();
        setRunning(false);
        setMs(0);
        setLaps([]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, ms]);

  const timeStr = fmt(ms);

  // 60s progress ring
  const goal = 60_000;
  const pct = Math.min(ms % goal, goal) / goal;
  const ring = useMemo(() => {
    const r = 72;
    const c = 2 * Math.PI * r;
    const o = c - c * pct;
    return { r, c, o };
  }, [pct]);

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Clock4 className="h-5 w-5" /> Stopwatch
        </div>
        <span className="text-xs text-slate-500">
          Pace {Math.round(pct * 100)}%
        </span>
      </div>

      <div className="grid items-center gap-6 md:grid-cols-2">
        {/* Dial */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center justify-center"
        >
          <svg width={200} height={200} className="drop-shadow-sm">
            <circle
              cx={100}
              cy={100}
              r={ring.r}
              stroke="#e6e9ef"
              strokeWidth="10"
              fill="none"
            />
            <motion.circle
              cx={100}
              cy={100}
              r={ring.r}
              stroke="#0f172a"
              strokeWidth="10"
              fill="none"
              strokeDasharray={ring.c}
              strokeDashoffset={ring.o}
              strokeLinecap="round"
              initial={false}
              animate={{ strokeDashoffset: ring.o }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
            />
          </svg>
          <motion.div
            key={timeStr}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute font-mono text-3xl md:text-4xl"
          >
            {timeStr}
          </motion.div>
        </motion.div>

        {/* Controls & Laps */}
        <div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRunning(true)}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              <Play className="h-4 w-4" /> Start
            </button>
            <button
              onClick={() => setRunning(false)}
              disabled={!running}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 disabled:opacity-40"
            >
              <Pause className="h-4 w-4" /> Stop
            </button>
            <button
              onClick={() => {
                setRunning(false);
                setMs(0);
                setLaps([]);
              }}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
            <button
              onClick={() => running && setLaps((ls) => [ms, ...ls])}
              disabled={!running}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-40"
            >
              <Flag className="h-4 w-4" /> Lap
            </button>
          </div>

          <div className="mt-4 max-h-44 overflow-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">Lap</th>
                  <th className="px-3 py-2 text-left font-medium">Δ</th>
                </tr>
              </thead>
              <tbody>
                {laps.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-6 text-center text-slate-400"
                    >
                      No laps yet.
                    </td>
                  </tr>
                )}
                {laps.map((l, i) => (
                  <tr key={l} className="border-t">
                    <td className="px-3 py-2">{laps.length - i}</td>
                    <td className="px-3 py-2 font-mono">{fmt(l)}</td>
                    <td className="px-3 py-2 font-mono text-slate-500">
                      {fmt(i === laps.length - 1 ? l : l - laps[i + 1])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Shortcuts: Space · L · R
          </p>
        </div>
      </div>
    </section>
  );
}

/**************** LIVE CLOCK ****************/
function NowCard() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const local = new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "medium",
  }).format(now);
  const utc = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "medium",
    timeZone: "UTC",
  }).format(now);

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Clock4 className="h-5 w-5" /> Now
        </div>
        <span className="text-xs text-slate-500">Live</span>
      </div>
      <div className="space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Local
          </div>
          <div className="font-mono text-lg">{local}</div>
        </div>
        <div className="border-t pt-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            UTC
          </div>
          <div className="font-mono text-lg">{utc}</div>
        </div>
      </div>
    </section>
  );
}

/**************** CTA ****************/
function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h3 className="text-2xl font-semibold">Time, measured right.</h3>
            <p className="mt-1 text-slate-600">
              Start the stopwatch or check the exact time. Done.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**************** UTIL ****************/
function fmt(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(
    2,
    "0"
  )}:${String(s % 60).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
}
