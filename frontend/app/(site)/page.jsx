"use client";
import { DateTime } from "luxon";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MotionConfig,
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";

/**
 * Professional Home Page (JavaScript + JSX)
 * - Clean hierarchy, accessible landmarks, subtle motion
 * - No TypeScript; plain React JSX
 */

const EASING = [0.22, 1, 0.36, 1];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.55, ease: EASING },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASING } },
};

const lift = {
  initial: { y: 0 },
  hover: {
    y: -10,
    transition: { type: "spring", stiffness: 260, damping: 22, mass: 0.6 },
  },
};

function Section({ children, className = "", as: Tag = "section", id }) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className={`relative ${className}`}
    >
      {children}
    </motion.section>
  );
}

function Card({ children, index = 0, className = "" }) {
  return (
    <motion.div
      variants={fadeIn}
      custom={index}
      className={`group rounded-2xl ring-1 ring-slate-200 bg-white/70 backdrop-blur px-6 py-5 md:px-8 md:py-7 ${className}`}
    >
      <motion.div
        className="transform-gpu"
        initial="initial"
        whileHover="hover"
        variants={lift}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}

function GradientOrnament() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.6, 0.2]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div style={{ y, opacity }} className="absolute -top-16 right-6 h-64 w-64 rounded-full bg-gradient-to-tr from-sky-200 via-cyan-100 to-white blur-3xl" />
      <motion.div style={{ y, opacity }} className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-gradient-to-tr from-fuchsia-200 via-pink-100 to-white blur-3xl" />
    </div>
  );
}

function TimeFlip({ value }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -12, opacity: 0 }}
        transition={{ duration: 0.24 }}
        className="tabular-nums"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

export default function Home() {
  // Live time (local)
  const [now, setNow] = useState(DateTime.local());
  useEffect(() => {
    const t = setInterval(() => setNow(DateTime.local()), 1000);
    return () => clearInterval(t);
  }, []);
  const [h, m, s] = useMemo(() => [now.toFormat("HH"), now.toFormat("mm"), now.toFormat("ss")], [now]);

  // Hero parallax
  const pageRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <MotionConfig reducedMotion="user">
      <main ref={pageRef} className="space-y-14 md:space-y-20" role="main">
        {/* HERO */}
        <Section className="pt-6 md:pt-10" id="hero">
          <GradientOrnament />

          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            {/* Left column: live time + CTA */}
            <motion.div variants={fadeIn} className="order-2 md:order-1">
              <p className="text-sm text-slate-500">Your Local Time</p>
              <div className="mt-2 flex items-baseline gap-2 text-5xl font-semibold tracking-tight text-slate-900 md:text-6xl" aria-live="polite">
                <TimeFlip value={h} />
                <span aria-hidden>:</span>
                <TimeFlip value={m} />
                <span aria-hidden>:</span>
                <TimeFlip value={s} />
              </div>
              <div className="mt-2 text-sm text-slate-500">{now.toFormat("DDD, ccc")}</div>

              <motion.div
                variants={fadeIn}
                custom={1}
                className="mt-6 rounded-xl border border-slate-200 bg-white/70 p-4 backdrop-blur"
              >
                <h2 className="text-sm font-medium text-slate-700">Plan across time zones</h2>
                <p className="mt-2 text-sm text-slate-600">Find corresponding times around the world.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link className="btn-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400" href="/meeting" aria-label="Open Meeting Planner">
                    Open Meeting Planner
                  </Link>
                  <Link className="btn-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400" href="/time-difference">
                    Time Difference
                  </Link>
                  <Link className="btn-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400" href="/world-clock">
                    World Clock
                  </Link>
                </div>
              </motion.div>
            </motion.div>

            {/* Right column: hero visual */}
            <motion.div variants={scaleIn} className="order-1 md:order-2">
              <motion.div style={{ y: heroY }} className="relative mx-auto aspect-[5/4] w-full max-w-lg">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white to-slate-50 ring-1 ring-slate-200" />
                <div className="absolute inset-0 grid grid-cols-3 gap-3 p-3">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.06, duration: 0.5 }}
                      className="rounded-xl border border-slate-200 bg-white/80 p-3 backdrop-blur"
                    >
                      <div className="h-16 w-full rounded-md bg-gradient-to-tr from-slate-100 to-white" />
                      <div className="mt-3 h-2 w-3/5 rounded bg-slate-200" />
                      <div className="mt-2 h-2 w-2/5 rounded bg-slate-200" />
                    </motion.div>
                  ))}
                </div>
                <div className="absolute -right-4 -top-4 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-600 shadow-sm">World Planner</div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-600 shadow-sm">Live Clock</div>
              </motion.div>
            </motion.div>
          </div>
        </Section>

        {/* QUICK FEATURES */}
        <Section aria-label="Quick features">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Your Tools</h2>
            <Badge>Light • Elegant • Fast</Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Personal Clocks",
                desc: "Create analog/digital clocks in 7 styles. Guests 2 (session), Free saves 2, Pro saves 4.",
                href: "/personalize",
                cta: "Create Now",
              },
              {
                title: "Event Announcer",
                desc: "Design a countdown with live preview, export a clean PDF & ICS (no colors in PDF).",
                href: "/events",
                cta: "Build Countdown",
              },
              {
                title: "Timers",
                desc: "Custom timers for everyone; saved for signed-in users.",
                href: "/timers",
                cta: "Create Timer",
              },
            ].map((item, i) => (
              <Card index={i} key={item.title}>
                <div className="section-head text-slate-900">{item.title}</div>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                <Link href={item.href} className="btn-primary mt-4 inline-block" aria-label={`${item.title} – ${item.cta}`}>
                  {item.cta}
                </Link>
              </Card>
            ))}
          </div>
        </Section>

        {/* WORLD & DATE TOOLS */}
        <Section aria-label="World and date tools">
          <div className="grid gap-6 md:grid-cols-2">
            <Card index={0}>
              <div className="section-head text-slate-900">World Clock (195)</div>
              <p className="mt-2 text-sm text-slate-600">All countries with sunrise/sunset below the time.</p>
              <Link href="/world-clock" className="btn-primary mt-4 inline-block" aria-label="Browse World Clock">
                Browse World Clock
              </Link>
            </Card>
            <Card index={1}>
              <div className="section-head text-slate-900">Date Tools & More</div>
              <p className="mt-2 text-sm text-slate-600">Date calculators, stopwatch, timer and more utilities.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/date-calculators" className="btn-muted" aria-label="Open Date Calculators">
                  Date Calculators
                </Link>
                <Link href="/stopwatch" className="btn-muted" aria-label="Open Stopwatch">
                  Stopwatch
                </Link>
                <Link href="/timer" className="btn-muted" aria-label="Open Timer">
                  Timer
                </Link>
              </div>
            </Card>
          </div>
        </Section>

        {/* INFO STRIP */}
        <Section aria-label="Stats">
          <motion.div variants={scaleIn} className="grid gap-4 rounded-2xl border border-slate-200 bg-white/70 p-5 md:grid-cols-4 md:p-6">
            {[
              { k: "Cities", v: "25k+", d: "Tracked in World Clock" },
              { k: "Formats", v: "7", d: "Analog + Digital Styles" },
              { k: "Latency", v: "~40ms", d: "Real-time Sync" },
              { k: "Export", v: "PDF, ICS", d: "Clean & Consistent" },
            ].map((stat, i) => (
              <motion.div key={stat.k} variants={fadeIn} custom={i} className="rounded-xl border border-slate-200 bg-white/60 p-4">
                <p className="text-xs text-slate-500">{stat.k}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{stat.v}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.d}</p>
              </motion.div>
            ))}
          </motion.div>
        </Section>

        {/* AD SECTION */}
        <Section aria-label="Sponsored">
          <div className="grid gap-6 md:grid-cols-2">
            {[0, 1].map((n) => (
              <motion.a
                key={n}
                href="#"
                variants={fadeIn}
                className="relative block overflow-hidden rounded-2xl border border-slate-200 bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                rel="sponsored noopener"
                aria-label="Sponsored link"
              >
                <div className="relative aspect-[6/2] w-full">
                  <Image
                    src="/ads.jpg"
                    alt="Sponsored"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={false}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/20 to-transparent" />
                <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
                  Ad
                </span>
              </motion.a>
            ))}
          </div>
        </Section>

        {/* CTA STRIP */}
        <Section aria-label="Call to action">
          <motion.div variants={scaleIn} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 md:p-10">
            <GradientOrnament />
            <div className="grid items-center gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Plan smarter, across the globe</h2>
                <p className="mt-2 text-sm text-slate-600">Compare time zones, share countdowns, and keep perfect time. No clutter, just clarity.</p>
                <div className="mt-4 flex gap-3">
                  <Link className="btn-primary" href="/meeting">Start Planning</Link>
                  <Link className="btn-muted" href="/world-clock">Explore World Clock</Link>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: EASING }}
                viewport={{ once: true }}
                className="relative mx-auto aspect-[4/3] w-full max-w-md"
              >
                <div className="absolute inset-0 rounded-2xl border border-slate-200 bg-white/80 p-3">
                  <div className="h-full rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50" />
                </div>
                <div className="absolute -right-2 -top-2 rounded-full border border-slate-200 bg-white/90 px-2 py-1 text-[10px] text-slate-600 shadow">ICS</div>
                <div className="absolute -left-2 bottom-2 rounded-full border border-slate-200 bg-white/90 px-2 py-1 text-[10px] text-slate-600 shadow">PDF</div>
              </motion.div>
            </div>
          </motion.div>
        </Section>
      </main>
    </MotionConfig>
  );
}
