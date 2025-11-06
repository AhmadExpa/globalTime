"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MotionConfig,
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Globe2,
  CalendarClock,
  Timer,
  AlarmClock,
  Clock,
  LayoutGrid,
  Mail,
  User,
  Settings2,
  Sparkles,
} from "lucide-react";

/**
 * Image + Icon Cards Home (JSX, no navbar/footer, no top blur)
 * - Works with 4–5 images in /public
 * - Responsive, animated, guest-friendly
 * - Uses Lucide icons for feature cards
 */

// ---- Replace with your actual image filenames (4–5 is perfect) ----
const IMAGES = [
  "/stopwatch.jpg",
  "/vector.jpg",
  "/vector_2.jpg",
  "/timerclock.jpg",
  "/zone.jpg",
];

// ---- Image actions: each tile links to one of your real pages ----
const IMAGE_ACTIONS = [
  { href: "/meeting", label: "Meeting", imgIndex: 0 },
  { href: "/world-clock", label: "World Clock", imgIndex: 1 },
  { href: "/time-difference", label: "Compare", imgIndex: 2 },
  { href: "/timers", label: "Timers", imgIndex: 3 },
];

// ---- Icon cards: use Lucide + links to your existing routes ----
const ICON_CARDS = [
  {
    href: "/personalize",
    label: "Personalize",
    Icon: Sparkles,
    desc: "Clocks & layouts",
  },
  { href: "/timer", label: "Timer", Icon: Timer, desc: "Simple countdown" },
  {
    href: "/stopwatch",
    label: "Stopwatch",
    Icon: AlarmClock,
    desc: "Track sessions",
  },
  {
    href: "/date-calculators",
    label: "Date Tools",
    Icon: CalendarClock,
    desc: "Durations & math",
  },
  { href: "/dst", label: "DST", Icon: LayoutGrid, desc: "Offset changes" },
  {
    href: "/events",
    label: "Events",
    Icon: CalendarClock,
    desc: "Countdown & share",
  },
  { href: "/newsletter", label: "Newsletter", Icon: Mail, desc: "Updates" },
  { href: "/contact", label: "Contact", Icon: Mail, desc: "Get in touch" },
  { href: "/account", label: "Account", Icon: User, desc: "Profile" },
  { href: "/login", label: "Login", Icon: Settings2, desc: "Access" },
];

// ---- Motion helpers ----
const EASE = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.55, ease: EASE },
  }),
};

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}
const pad = (n) => String(n).padStart(2, "0");

function Flip({ value }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -12, opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="tabular-nums"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

/* =========================
   Sections (no header/footer)
   ========================= */

// Full-bleed hero slideshow (no top blur; adds padding to clear your navbar)
function Hero() {
  const [i, setI] = useState(0);
  const now = useNow();
  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());

  useEffect(() => {
    if (IMAGES.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % IMAGES.length), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative w-full pt-6 md:pt-8">
      <div className="relative h-[68vh] min-h-[480px] w-full overflow-hidden rounded-3xl">
        <AnimatePresence initial={false}>
          <motion.div
            key={IMAGES[i]}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.85, ease: EASE }}
          >
            <Image
              src={IMAGES[i]}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Clock + primary actions */}
        <div className="absolute inset-0 flex items-end md:items-center">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 md:py-0">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="max-w-xl"
            >
              <motion.div
                variants={fadeUp}
                className="text-white/85 text-sm mb-2 flex items-center gap-2"
              >
                <Clock className="h-4 w-4" /> Local
              </motion.div>
              <motion.div
                variants={fadeUp}
                className="flex items-baseline gap-2 text-white font-semibold tracking-tight text-6xl md:text-7xl drop-shadow"
              >
                <Flip value={h} />
                <span aria-hidden>:</span>
                <Flip value={m} />
                <span aria-hidden>:</span>
                <Flip value={s} />
              </motion.div>
              <motion.div
                variants={fadeUp}
                custom={1}
                className="mt-6 flex flex-wrap gap-3"
              >
                <Link
                  href="/meeting"
                  className="rounded-full bg-white text-slate-900 px-4 py-2 text-sm hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  Plan a Meeting
                </Link>
                <Link
                  href="/time-difference"
                  className="rounded-full border border-white/70 bg-white/10 text-white px-4 py-2 text-sm hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  Compare Zones
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Image action tiles (each uses one of your 4–5 images + links)
function ImageActions() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-lg font-semibold text-slate-900 mb-4"
      >
        Quick Actions
      </motion.h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {IMAGE_ACTIONS.map((t, idx) => {
          const src = IMAGES[t.imgIndex] || IMAGES[0];
          return (
            <motion.div
              key={t.href}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={idx}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200"
            >
              {src && (
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width:1024px) 50vw, 25vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <Link
                  href={t.href}
                  className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-900 shadow hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  {t.label}
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// Lucide icon cards (no images here; compact & fast to scan)
function IconCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-lg font-semibold text-slate-900 mb-4"
      >
        Tools & Pages
      </motion.h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ICON_CARDS.map((c, i) => (
          <motion.div
            key={c.href}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={i}
            className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition"
          >
            <Link href={c.href} className="flex items-start gap-4 group">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800">
                <c.Icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-slate-900 font-medium group-hover:underline">
                  {c.label}
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  {c.desc}
                </span>
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  const bg = IMAGES[3] || IMAGES[0];
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative overflow-hidden rounded-2xl border border-slate-200"
      >
        <div className="relative w-full" style={{ aspectRatio: "21 / 9" }}>
          {bg && (
            <Image
              src={bg}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center">
          <div className="px-6 md:px-10 max-w-xl">
            <h3 className="text-white text-2xl md:text-3xl font-semibold tracking-tight drop-shadow">
              Make time work for you.
            </h3>
            <div className="mt-4 flex gap-3">
              <Link
                className="rounded-full bg-white text-slate-900 px-4 py-2 text-sm hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                href="/planner"
              >
                Open Planner
              </Link>
              <Link
                className="rounded-full border border-white/80 bg-white/10 text-white px-4 py-2 text-sm hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                href="/world-clock"
              >
                World Clock
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
export default function Page() {
  const wrapRef = useRef(null);
  useScroll({ target: wrapRef }); // keeps framer hooks happy even if unused

  return (
    <MotionConfig reducedMotion="user">
      <div ref={wrapRef} className="relative min-h-screen bg-white">
        {/* No top overlay/blur here so nothing interferes with your navbar */}
        <Hero />
        <ImageActions />
        <IconCards />
        <CTA />
      </div>
    </MotionConfig>
  );
}
