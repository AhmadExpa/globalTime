"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Flag,
  Gauge,
  Sparkles,
  BarChart3,
  Clock4,
  ChevronRight,
  CheckCircle2,
  MousePointerClick,
  Keyboard,
  ScrollText,
  Zap,
  Feather,
  LineChart,
  ArrowRight,
} from "lucide-react";

/*********************************
 * Elegant, long, content-rich page
 * (Only Framer Motion + Lucide + Tailwind)
 *********************************/
export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white text-slate-900">
      <Hero />
      <ContentBelt />
      <StopwatchSection />
      <AnalyticsSection />
      <DeepContent />
      <FAQ />
      <CTA />
    </div>
  );
}

/************ HERO ************/
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-7xl px-6 pt-24 pb-12"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
          <span className="inline-flex h-2 w-2 rounded-full bg-white" /> New •
          Motion-first
        </div>
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl"
            >
              Professional Stopwatch, reimagined for a{" "}
              <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                light, elegant
              </span>{" "}
              web.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-5 max-w-2xl text-lg text-slate-600"
            >
              Built with Framer Motion and Lucide. Long-form, content-dense, and
              clean.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <button className="group inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800">
                <Play className="mr-2 h-4 w-4" />
                Try the Stopwatch
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button className="inline-flex items-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50">
                <MousePointerClick className="mr-2 h-4 w-4" />
                Interactive Demo
              </button>
              <button className="inline-flex items-center rounded-2xl px-5 py-3 text-sm font-medium text-slate-600 hover:text-slate-800">
                <Keyboard className="mr-2 h-4 w-4" />
                Shortcuts
              </button>
            </motion.div>
            <div className="mt-8 flex gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Smooth motion
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Low latency
              </div>
              <div className="flex items-center gap-2">
                <Feather className="h-4 w-4" />
                Light aesthetic
              </div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 14 }}
              className="relative"
            >
              <div className="rounded-3xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur">
                <div className="border-b px-5 pb-2 pt-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Gauge className="h-5 w-5" /> Realtime Preview
                  </div>
                </div>
                <div className="p-5">
                  <div className="aspect-[16/10]">
                    <HeroTimerPreview />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock4 className="h-4 w-4" />
                    Sub‑millisecond render loop
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Framer Motion
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-slate-200 to-white blur-3xl"
      />
    </section>
  );
}

function ContentBelt() {
  const items = [
    { icon: <BarChart3 className="h-4 w-4" />, label: "Lap Analytics" },
    { icon: <ScrollText className="h-4 w-4" />, label: "Detailed Docs" },
    { icon: <Clock4 className="h-4 w-4" />, label: "Precise Reset" },
    { icon: <LineChart className="h-4 w-4" />, label: "Trends & Pace" },
    { icon: <Sparkles className="h-4 w-4" />, label: "Micro‑Interactions" },
  ];
  return (
    <div className="border-y bg-white/60 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <motion.ul
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-600"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {items.map((it, i) => (
            <motion.li
              key={i}
              variants={{
                hidden: { opacity: 0, y: 6 },
                show: { opacity: 1, y: 0 },
              }}
              className="flex items-center gap-2"
            >
              {it.icon}
              {it.label}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}

/************ STOPWATCH CORE ************/
function StopwatchSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StopwatchCard />
        </div>
        <div className="lg:col-span-5">
          <TipsPanel />
        </div>
      </div>
    </section>
  );
}

function StopwatchCard() {
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [compact, setCompact] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (running) ref.current = setInterval(() => setMs((m) => m + 10), 10);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running]);

  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        setRunning((r) => !r);
      }
      if (e.key?.toLowerCase() === "l") {
        e.preventDefault();
        if (running) setLaps((ls) => [ms, ...ls]);
      }
      if (e.key?.toLowerCase() === "r") {
        e.preventDefault();
        setRunning(false);
        setMs(0);
        setLaps([]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, ms]);

  const s = Math.floor(ms / 1000),
    m = Math.floor(s / 60),
    h = Math.floor(m / 60);
  const timeStr = `${String(h).padStart(2, "0")}:${String(m % 60).padStart(
    2,
    "0"
  )}:${String(s % 60).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;

  const goal = 60_000; // 60s ring
  const pct = Math.min(ms % goal, goal) / goal;
  const ring = useMemo(() => {
    const r = 80;
    const c = 2 * Math.PI * r;
    const o = c - c * pct;
    return { r, c, o };
  }, [pct]);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Clock4 className="h-5 w-5" /> Stopwatch
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500">
          Compact
          <input
            type="checkbox"
            checked={compact}
            onChange={(e) => setCompact(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
        </label>
      </div>

      <div className="grid items-center gap-8 md:grid-cols-2">
        {/* Time + ring */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center justify-center"
        >
          <svg width={220} height={220} className="drop-shadow-sm">
            <circle
              cx={110}
              cy={110}
              r={ring.r}
              stroke="#e6e9ef"
              strokeWidth="10"
              fill="none"
            />
            <motion.circle
              cx={110}
              cy={110}
              r={ring.r}
              stroke="#0f172a"
              strokeWidth="10"
              fill="none"
              strokeDasharray={ring.c}
              strokeDashoffset={ring.o}
              strokeLinecap="round"
              initial={false}
              animate={{ strokeDashoffset: ring.o }}
              transition={{ type: "spring", stiffness: 120, damping: 24 }}
            />
          </svg>
          <motion.div
            key={timeStr}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`absolute font-mono text-4xl md:text-5xl ${
              compact ? "scale-90" : ""
            }`}
          >
            {timeStr}
          </motion.div>
        </motion.div>

        {/* Controls & laps */}
        <div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setRunning(true)}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play className="h-4 w-4" />
              Start
            </button>
            <button
              onClick={() => setRunning(false)}
              disabled={!running}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Pause className="h-4 w-4" />
              Stop
            </button>
            <button
              onClick={() => {
                setMs(0);
                setRunning(false);
                setLaps([]);
              }}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={() => running && setLaps((ls) => [ms, ...ls])}
              disabled={!running}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Flag className="h-4 w-4" />
              Lap
            </button>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-slate-500">Pace ring (60s)</span>
              <span className="text-sm font-medium">
                {Math.round(pct * 100)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full bg-slate-900"
                initial={false}
                animate={{ width: `${pct * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-6 max-h-52 overflow-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">Lap</th>
                  <th className="px-3 py-2 text-left font-medium">
                    Δ from prev
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {laps.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 py-6 text-center text-slate-400"
                      >
                        No laps yet. Press <span className="font-mono">L</span>{" "}
                        while running.
                      </td>
                    </tr>
                  )}
                  {laps.map((l, i) => (
                    <motion.tr
                      key={l}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{
                        type: "spring",
                        stiffness: 180,
                        damping: 18,
                      }}
                      className="border-t"
                    >
                      <td className="px-3 py-2">{laps.length - i}</td>
                      <td className="px-3 py-2 font-mono">{formatMs(l)}</td>
                      <td className="px-3 py-2 font-mono text-slate-500">
                        {formatMs(i === laps.length - 1 ? l : l - laps[i + 1])}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Shortcuts:{" "}
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">
              Space
            </kbd>{" "}
            start/stop ·{" "}
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">
              L
            </kbd>{" "}
            lap ·{" "}
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">
              R
            </kbd>{" "}
            reset
          </p>
        </div>
      </div>
    </div>
  );
}

function TipsPanel() {
  const tips = [
    {
      title: "Precision timing",
      desc: "Updates at 10ms with smooth spring animations to avoid jank.",
    },
    {
      title: "Lap tracking",
      desc: "Capture laps instantly; analyze pace deltas and cumulative time.",
    },
    {
      title: "Keyboard‑first",
      desc: "Fast control via Space, L, and R. Great for focus sessions.",
    },
    {
      title: "Light, professional UI",
      desc: "Subtle shadows, soft borders, calm typography—no visual noise.",
    },
  ];
  return (
    <div className="h-full rounded-3xl border border-slate-200/80 bg-white p-5">
      <div className="mb-2 text-lg font-semibold">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-5 w-5" /> Design Notes
        </span>
      </div>
      <div className="space-y-5">
        {tips.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-start gap-3">
              <ChevronRight className="mt-0.5 h-4 w-4 text-slate-400" />
              <div>
                <div className="font-medium">{t.title}</div>
                <p className="text-sm leading-relaxed text-slate-600">
                  {t.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/************ ANALYTICS (no chart libs) ************/
function AnalyticsSection() {
  // demo sparkline data
  const data = Array.from(
    { length: 40 },
    (_, i) => 40 + Math.sin(i / 2) * 10 + (i % 5)
  );
  const w = 640,
    h = 200,
    pad = 16;
  const step = (w - pad * 2) / (data.length - 1);
  const max = Math.max(...data),
    min = Math.min(...data);
  const points = data
    .map((v, i) => {
      const x = pad + i * step;
      const y = pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
              <BarChart3 className="h-5 w-5" /> Lap Trend (demo)
            </div>
            <div className="h-72">
              <motion.svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
                <defs>
                  <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f172a" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  points={points}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2"
                />
                <motion.polygon
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  points={`${pad},${h - pad} ${points} ${w - pad},${h - pad}`}
                  fill="url(#glow)"
                />
              </motion.svg>
            </div>
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="h-full rounded-3xl border border-slate-200/80 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
              <LineChart className="h-5 w-5" /> Pace Notes
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Visuals rendered with raw SVG and Framer Motion.</li>
              <li>• No chart library dependencies.</li>
              <li>• Clean gradients and subtle strokes keep it elegant.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/************ LONG-FORM CONTENT ************/
function DeepContent() {
  const [tab, setTab] = useState("principles");
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="inline-flex rounded-2xl border border-slate-300 bg-white p-1 text-sm">
        {["principles", "guides", "api"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2 transition ${
              tab === t
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {t === "principles"
              ? "Design Principles"
              : t === "guides"
              ? "Usage Guides"
              : "API"}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6 text-slate-700 leading-relaxed">
        {tab === "principles" &&
          Array.from({ length: 5 }).map((_, i) => (
            <ParagraphBlock key={i} index={i} />
          ))}
        {tab === "guides" &&
          Array.from({ length: 4 }).map((_, i) => (
            <GuideBlock key={i} index={i} />
          ))}
        {tab === "api" && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5">
            <div className="mb-2 text-lg font-semibold">Component API</div>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <code className="rounded bg-slate-100 px-2 py-0.5">
                  start()
                </code>{" "}
                — start the timer.
              </li>
              <li>
                <code className="rounded bg-slate-100 px-2 py-0.5">stop()</code>{" "}
                — stop without resetting.
              </li>
              <li>
                <code className="rounded bg-slate-100 px-2 py-0.5">
                  reset()
                </code>{" "}
                — clear to zero.
              </li>
              <li>
                <code className="rounded bg-slate-100 px-2 py-0.5">lap()</code>{" "}
                — capture current elapsed time.
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function ParagraphBlock({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
    >
      <h3 className="mb-2 text-xl font-semibold">
        Principle {index + 1}: Clarity over spectacle
      </h3>
      <p>
        Motion exists to guide—not distract. Favor micro‑interactions that
        reinforce hierarchy and intent. Use easing that feels natural and keep
        durations snappy.
      </p>
    </motion.div>
  );
}

function GuideBlock({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
    >
      <h3 className="mb-2 text-xl font-semibold">
        Guide {index + 1}: Productive timing sessions
      </h3>
      <ol className="list-decimal space-y-1 pl-6">
        <li>Define a clear target duration for laps.</li>
        <li>Rely on keyboard shortcuts to keep your hands on the keys.</li>
        <li>Use the pace ring to understand relative progress at a glance.</li>
        <li>Analyze laps to spot consistency and drift.</li>
      </ol>
    </motion.div>
  );
}

/************ FAQ ************/
function FAQ() {
  const faqs = [
    {
      q: "Does motion impact performance?",
      a: "Animations are lightweight and tuned. We use spring transitions and avoid layout thrash.",
    },
    {
      q: "Is there dark mode?",
      a: "This design focuses on an elegant light theme. Adding dark mode is a straightforward extension.",
    },
    {
      q: "Can I export laps?",
      a: "Yes in a full build. Here we focus on UI/UX; wiring a CSV export is trivial.",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-6 md:grid-cols-2">
        {faqs.map((f, i) => (
          <Disclosure key={i} {...f} index={i} />
        ))}
      </div>
    </section>
  );
}

function Disclosure({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="rounded-3xl border border-slate-200/80 bg-white">
        <button onClick={() => setOpen((o) => !o)} className="w-full text-left">
          <div className="border-b px-5 pb-2 pt-4">
            <div className="flex items-center justify-between text-base font-semibold">
              {q}
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  open ? "rotate-90" : ""
                }`}
              />
            </div>
          </div>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="px-5 py-4 text-slate-700">{a}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/************ CTA ************/
function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <h3 className="text-2xl font-semibold">
              Ready to time with intent?
            </h3>
            <p className="mt-1 text-slate-600">
              Start a precision session and feel the difference in seconds.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
              <Play className="h-4 w-4" />
              Start now
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50">
              Learn more
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/************ UTIL ************/
function formatMs(ms) {
  const s = Math.floor(ms / 1000),
    m = Math.floor(s / 60),
    h = Math.floor(m / 60);
  return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(
    2,
    "0"
  )}:${String(s % 60).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
}

function HeroTimerPreview() {
  const [ms, setMs] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    ref.current = setInterval(() => setMs((m) => m + 37), 37);
    return () => ref.current && clearInterval(ref.current);
  }, []);
  const s = Math.floor(ms / 1000),
    m = Math.floor(s / 60),
    h = Math.floor(m / 60);
  const timeStr = `${String(h).padStart(2, "0")}:${String(m % 60).padStart(
    2,
    "0"
  )}:${String(s % 60).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        key={timeStr}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="font-mono text-4xl md:text-5xl"
      >
        {timeStr}
      </motion.div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-2 -translate-x-1/2 text-xs text-slate-400">
          live
        </div>
      </motion.div>
    </div>
  );
}
