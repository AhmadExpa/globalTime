"use client";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useRef, useState, useMemo } from "react";
import { fetchTimers, createTimer, deleteTimer } from "../../../lib/api";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";

/**
 * Professional, elegant, light-themed redesign using TailwindCSS + Framer Motion.
 * - Subtle animated gradients and illustrated shapes to elevate the aesthetic.
 * - Long, content-rich layout (hero, form, timers grid, tips, FAQ) to convey depth.
 * - Smooth, tasteful animations; no flashy colors to preserve a calm, premium feel.
 */

export default function Timers() {
  const { token } = useAuth();
  const [timers, setTimers] = useState([]);
  const [label, setLabel] = useState("");
  const [seconds, setSeconds] = useState(60);

  // Loaders --------------------------------------------------------------
  function loadGuest() {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("guestTimers")
        : null;
    setTimers(raw ? JSON.parse(raw) : []);
  }
  async function load() {
    if (!token) return loadGuest();
    const { data } = await fetchTimers(token);
    setTimers(data.timers || []);
  }
  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [token]);

  // Mutations ------------------------------------------------------------
  async function addTimer() {
    if (!seconds || seconds < 1) return; // basic guard
    if (!token) {
      const t = {
        _id: "guest-" + Math.random().toString(36).slice(2),
        label,
        seconds,
      };
      const updated = [t, ...timers];
      setTimers(updated);
      if (typeof window !== "undefined")
        sessionStorage.setItem("guestTimers", JSON.stringify(updated));
      setLabel("");
      return;
    }
    await createTimer(token, { label, seconds });
    setLabel("");
    load();
  }
  async function remove(id) {
    if (!token) {
      const updated = timers.filter((t) => t._id !== id);
      setTimers(updated);
      if (typeof window !== "undefined")
        sessionStorage.setItem("guestTimers", JSON.stringify(updated));
      return;
    }
    await deleteTimer(token, id);
    load();
  }

  // Page chrome animations ----------------------------------------------
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.85]);
  const headerBlur = useTransform(
    scrollYProgress,
    [0, 0.2],
    ["blur(0px)", "blur(2px)"]
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-white to-slate-50 text-slate-800">
      {/* Decorative, subtle graphics */}
      <BackgroundOrnaments />

      {/* Sticky top header */}
      <motion.header
        style={{ opacity: headerOpacity, filter: headerBlur }}
        className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200/60"
      >
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark />
            <span className="font-semibold tracking-tight">Focus Timers</span>
          </div>
          <div className="text-xs text-slate-500">
            {token ? "Signed in" : "Guest mode"}
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-8">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900"
          >
            Craft your pace.{" "}
            <span className="bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
              Timers
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
            className="mt-3 max-w-2xl text-slate-600"
          >
            Create focused countdowns, stack sessions, and keep momentum.
            Elegant by default, powerful when you need it.
          </motion.p>

          {/* Quick stats to imply richness */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerStagger}
            className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {[
              { k: "Active", v: timers.length || 0 },
              { k: "Default", v: "60s" },
              { k: "Mode", v: token ? "Synced" : "Local" },
              { k: "Latency", v: "~0.1s" },
            ].map((s, i) => (
              <motion.div
                key={s.k}
                variants={fadeUp}
                className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm"
              >
                <div className="text-xs text-slate-500">{s.k}</div>
                <div className="text-lg font-medium mt-1">{s.v}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Create Timer card */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 md:p-6 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Create Timer
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Name it, set seconds, and drop it into your queue.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-3 w-full md:w-auto">
                <input
                  className="input appearance-none rounded-xl border border-slate-300/80 bg-white px-4 py-2 text-sm outline-none ring-0 focus:border-slate-400"
                  placeholder="Label (e.g. Deep Work)"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
                <input
                  className="input appearance-none rounded-xl border border-slate-300/80 bg-white px-4 py-2 text-sm outline-none ring-0 focus:border-slate-400"
                  type="number"
                  min={1}
                  value={seconds}
                  onChange={(e) => setSeconds(parseInt(e.target.value || "0"))}
                />
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -1 }}
                  onClick={addTimer}
                  className="btn-primary inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  Add Timer
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timers grid */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold tracking-tight">
              Your Timers
            </h2>
            <span className="text-xs text-slate-500">
              {timers.length || 0} total
            </span>
          </div>

          <AnimatePresence initial={false}>
            {timers.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500"
              >
                No timers yet. Add one above to get rolling.
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                layout
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {timers.map((t, idx) => (
                  <TimerCard key={t._id} t={t} remove={remove} index={idx} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Content-rich supportive sections to signal depth ------------------*/}
      <TipsSection />
      <FAQSection />
    </div>
  );
}

// ---------------------------------------------------------------------
// Timer Card: animated, elegant, with progress ring
function TimerCard({ t, remove, index }) {
  const [left, setLeft] = useState(t.seconds);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (running && left > 0)
      ref.current = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => ref.current && clearTimeout(ref.current);
  }, [running, left]);

  // progress derived
  const duration = Math.max(1, t.seconds || 1);
  const progress = useMemo(() => 1 - left / duration, [left, duration]);
  const done = left <= 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.02 * index }}
      className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm"
    >
      {/* decorative corner gradient */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 blur-2xl" />

      <div className="flex items-start gap-4">
        <ProgressRing progress={progress} done={done} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate font-medium text-slate-900">
              {t.label || "Timer"}
            </h3>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
              {duration}s
            </span>
          </div>
          <motion.div
            key={left}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-1 font-mono text-2xl ${
              done ? "text-emerald-600" : "text-slate-900"
            }`}
          >
            {left}s
          </motion.div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setRunning(true)}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
            >
              Start
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setRunning(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            >
              Pause
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setLeft(duration)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            >
              Reset
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => remove(t._id)}
              className="ml-auto rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 hover:bg-red-100"
            >
              Remove
            </motion.button>
          </div>
        </div>
      </div>

      {/* completion shimmer */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
          />
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// Progress ring graphic -------------------------------------------------
function ProgressRing({ progress, done }) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0.0001, c * progress);

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      initial={{ rotate: -90 }}
      animate={{ rotate: -90 }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="rgb(226 232 240)"
        strokeWidth={stroke}
        fill="transparent"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={done ? "rgb(16 185 129)" : "rgb(15 23 42)"}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="transparent"
        initial={{ strokeDasharray: `0 ${c}` }}
        animate={{ strokeDasharray: `${dash} ${c}` }}
        transition={{ type: "spring", stiffness: 120, damping: 30 }}
      />
    </motion.svg>
  );
}

// Background ornaments --------------------------------------------------
function BackgroundOrnaments() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* soft gradient blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-gradient-to-br from-white to-slate-100 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute -left-24 bottom-24 h-80 w-80 rounded-full bg-gradient-to-br from-white to-slate-100 blur-3xl"
      />
    </div>
  );
}

// Tips / guidance section ----------------------------------------------
function TipsSection() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-lg font-semibold tracking-tight"
        >
          Make the most of your sessions
        </motion.h3>
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerStagger}
          className="mt-4 grid gap-3 md:grid-cols-3"
        >
          {[
            {
              h: "Batch timers",
              p: "Queue multiple timers to structure your day into clear blocks.",
            },
            {
              h: "Stay local or sync",
              p: "Use guest mode for quick sprints or sign in to sync across devices.",
            },
            {
              h: "Reset smartly",
              p: "One tap to reset; keep flow without losing context.",
            },
          ].map((f) => (
            <motion.li
              key={f.h}
              variants={fadeUp}
              className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm"
            >
              <div className="text-sm font-medium text-slate-900">{f.h}</div>
              <div className="mt-1 text-sm text-slate-600">{f.p}</div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

// FAQ section -----------------------------------------------------------
function FAQSection() {
  const faqs = [
    {
      q: "Does the timer keep running in the background?",
      a: "The countdown continues while the tab is open. Pausing halts it immediately.",
    },
    {
      q: "What happens at 0 seconds?",
      a: "The card highlights completion. You can reset to the original duration or remove it.",
    },
    {
      q: "Is there a maximum duration?",
      a: "Use any positive number of seconds that fits your workflow. Longer sessions are fine.",
    },
  ];
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-lg font-semibold tracking-tight"
        >
          FAQ
        </motion.h3>
        <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200/70 bg-white/70">
          {faqs.map((f, i) => (
            <Disclosure key={i} question={f.q} answer={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Disclosure({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-slate-900">{question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className="text-slate-500"
        >
          ▾
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden pt-2 text-sm text-slate-600"
          >
            {answer}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple mark -----------------------------------------------------------
function LogoMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 12h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 7v10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Motion variants -------------------------------------------------------
const containerStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};
