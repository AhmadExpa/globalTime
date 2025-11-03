"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

// ==========================
// Utility: Variants & Helpers
// ==========================
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const blurIn = {
  hidden: { opacity: 0, filter: "blur(6px)" },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

// ==========================
// Decorative Graphics (SVG)
// ==========================
function GradientBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] opacity-60"
        viewBox="0 0 1200 1200"
        aria-hidden
      >
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#a2d2ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#e0fbfc" stopOpacity="0" />
          </radialGradient>
        </defs>
        <motion.circle
          cx="600"
          cy="600"
          r="520"
          fill="url(#g1)"
          initial={{ scale: 0.9 }}
          animate={{ scale: [0.9, 1.02, 0.95, 1] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      </svg>

      <motion.div
        className="absolute top-32 -left-8 w-72 h-72 rounded-full bg-gradient-to-br from-white/60 to-sky-100/60 blur-2xl"
        animate={{ x: [0, 10, -6, 0], y: [0, -8, 6, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-24 -right-8 w-80 h-80 rounded-full bg-gradient-to-tr from-sky-50 to-teal-100 blur-3xl"
        animate={{ x: [0, -12, 8, 0], y: [0, 10, -6, 0] }}
        transition={{ duration: 22, repeat: Infinity }}
      />
    </div>
  );
}

function DottedGrid() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 w-full h-full opacity-[0.15] [mask-image:radial-gradient(transparent,black_60%)]"
    >
      <defs>
        <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#0f172a" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}

// ==========================
// Timer (enhanced)
// ==========================
function TimerCard() {
  const [sec, setSec] = useState(60);
  const [left, setLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setLeft(sec);
  }, [sec]);
  useEffect(() => {
    if (running && left > 0) {
      ref.current = setTimeout(() => setLeft((l) => l - 1), 1000);
    }
    return () => {
      if (ref.current) clearTimeout(ref.current);
    };
  }, [running, left]);

  return (
    <motion.div
      variants={blurIn}
      className="relative isolate rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="absolute -z-10 -inset-1 rounded-3xl bg-gradient-to-br from-sky-50 to-teal-50" />
      <div className="flex items-center justify-between gap-4">
        <div>
          <motion.div
            layout
            className="text-5xl font-medium tracking-tight text-slate-900"
          >
            {left}s
          </motion.div>
          <motion.p className="mt-1 text-sm text-slate-500">
            Lightweight countdown with smooth motion.
          </motion.p>
        </div>
        <motion.div
          initial={{ rotate: -6 }}
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="shrink-0 rounded-xl border border-slate-200 bg-white p-3"
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            className="opacity-80"
          >
            <path
              d="M12 8v5l3 1"
              stroke="#0f172a"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="13" r="7" stroke="#0f172a" strokeWidth="1.2" />
            <path
              d="M9 4h6"
              stroke="#0f172a"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <span className="text-sm text-slate-600">Seconds</span>
          <input
            type="number"
            value={sec}
            onChange={(e) => setSec(parseInt(e.target.value || "0"))}
            className="ml-auto w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-right text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
          />
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setRunning(true)}
            className="group relative flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition"
          >
            <motion.span whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              Start
            </motion.span>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-sky-50 opacity-0 group-hover:opacity-100 transition"
            />
          </button>
          <button
            onClick={() => setRunning(false)}
            className="group relative flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition"
          >
            <motion.span whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              Stop
            </motion.span>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-slate-50 opacity-0 group-hover:opacity-100 transition"
            />
          </button>
          <button
            onClick={() => {
              setRunning(false);
              setLeft(sec);
            }}
            className="group relative flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition"
          >
            <motion.span whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              Reset
            </motion.span>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-teal-50 opacity-0 group-hover:opacity-100 transition"
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ==========================
// Sections
// ==========================
function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="relative">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        {eyebrow && (
          <motion.p
            variants={fadeUp}
            className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2"
          >
            {eyebrow}
          </motion.p>
        )}
        <motion.h2
          variants={fadeUp}
          className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900"
        >
          {title}
        </motion.h2>
        <motion.div variants={fadeUp} className="mt-6 text-slate-600 leading-7">
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}

function FeatureCard({ icon, title, desc, i }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={i}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-3 h-10 w-10 rounded-xl border border-slate-200 grid place-items-center bg-gradient-to-br from-white to-slate-50">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </motion.div>
  );
}

function Stat({ value, label, i }) {
  return (
    <motion.div variants={fadeUp} custom={i} className="text-center">
      <div className="text-3xl font-medium text-slate-900">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </motion.div>
  );
}

function FAQItem({ q, a, i }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      custom={i}
      className="rounded-xl border border-slate-200 bg-white"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-4 text-left"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-slate-900">{q}</span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            className="text-slate-400"
          >
            ▾
          </motion.span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-5 pb-5 text-slate-600"
          >
            {a}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ==========================
// Navigation + Hero
// ==========================
function Nav() {
  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl border border-slate-200 grid place-items-center bg-gradient-to-br from-white to-slate-50">
            <span className="text-slate-700 text-sm">⌛</span>
          </div>
          <span className="font-medium text-slate-900">LightSite</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm text-slate-600">
          <a href="#features" className="hover:text-slate-900">
            Features
          </a>
          <a href="#content" className="hover:text-slate-900">
            Content
          </a>
          <a href="#faq" className="hover:text-slate-900">
            FAQ
          </a>
        </div>
        <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800">
          Get Started
        </button>
      </div>
    </motion.nav>
  );
}

function Hero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <header className="relative overflow-hidden">
      <GradientBlobs />
      <DottedGrid />

      <motion.div
        style={{ y }}
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16"
      >
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.h1
            variants={fadeUp}
            className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900"
          >
            Build fast. Look elegant. Stay light.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-2xl text-slate-600 leading-7"
          >
            A refined, motion-rich template built with Framer Motion and
            Tailwind—balanced for performance and a bright, airy aesthetic.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <TimerCard />
            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                Why this approach?
              </h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li>• Gentle micro-interactions (hover, press, scroll).</li>
                <li>• SVG + blur gradients for subtle visual richness.</li>
                <li>• Long-form layout to showcase depth of content.</li>
                <li>• Accessible, keyboard-friendly controls.</li>
              </ul>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </header>
  );
}

// ==========================
// Long Content Sections to signal a "lengthy" site
// ==========================
function ContentBlock() {
  return (
    <Section
      id="features"
      eyebrow="Overview"
      title="Thoughtful features with a light visual language"
    >
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          {
            t: "Motion-first",
            d: "Framer Motion powers reveal, hover, and presence.",
          },
          {
            t: "Elegant by default",
            d: "Soft borders, subtle depth, and ample whitespace.",
          },
          { t: "Accessible UX", d: "Focusable controls with clear feedback." },
          { t: "Composable", d: "Small, readable components; easy to extend." },
          {
            t: "SVG graphics",
            d: "Gradient blobs, dotted grids, tasteful accents.",
          },
          {
            t: "Production-friendly",
            d: "Clean semantics and minimal footprint.",
          },
        ].map((f, i) => (
          <FeatureCard
            key={i}
            i={i}
            icon={<span className="text-slate-700">★</span>}
            title={f.t}
            desc={f.d}
          />
        ))}
      </div>
    </Section>
  );
}

function StatsBand() {
  return (
    <section className="bg-white/70 border-y border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6"
        >
          <Stat value="98%" label="CLS Stability" i={0} />
          <Stat value=",<200ms" label="UI Response" i={1} />
          <Stat value="11" label="Animated Sections" i={2} />
          <Stat value="∞" label="Extendable" i={3} />
        </motion.div>
      </div>
    </section>
  );
}

function Steps() {
  return (
    <Section
      eyebrow="How it works"
      title="From scaffold to polish in three steps"
    >
      <ol className="mt-6 grid md:grid-cols-3 gap-5">
        {[
          { t: "Drop In", d: "Copy this component into your Next.js page." },
          { t: "Style & Wire", d: "Adjust colors, copy, and data sources." },
          { t: "Ship", d: "Deploy with confidence; animations stay smooth." },
        ].map((s, i) => (
          <motion.li
            key={i}
            variants={fadeUp}
            custom={i}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-2 text-sm text-slate-500">Step {i + 1}</div>
            <div className="text-lg font-semibold text-slate-900">{s.t}</div>
            <div className="mt-1 text-sm text-slate-600">{s.d}</div>
          </motion.li>
        ))}
      </ol>
    </Section>
  );
}

function LongRead() {
  return (
    <Section
      id="content"
      eyebrow="Deep dive"
      title="An intentionally long, content-rich layout"
    >
      <div className="prose prose-slate max-w-none">
        <motion.p variants={fadeUp}>
          This page is deliberately lengthy to showcase how motion can guide
          attention without overwhelming. Sections breathe; elements reveal as
          you scroll, keeping orientation and rhythm intact.
        </motion.p>
        <motion.p variants={fadeUp}>
          Use the pattern here as a foundation for documentation, marketing
          pages, or dashboards that need more than a hero and a footer. Motion
          is restrained, predictable, and easy on the eyes.
        </motion.p>
        <motion.p variants={fadeUp}>
          Swap the palette, tone down the shadows, and keep the typographic
          scale. You get a fast, elegant, and light site that still feels
          premium.
        </motion.p>
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900">
            Editorial block
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Stack these as needed to suggest depth and breadth of content.
          </p>
          <div className="mt-4 h-48 rounded-xl bg-gradient-to-br from-sky-50 to-teal-50 border border-slate-200" />
        </motion.div>
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900">Data block</h3>
          <p className="mt-1 text-sm text-slate-600">
            Use cards for metrics, charts, and long-form tables.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg border border-slate-200 bg-slate-50"
              />
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="h-40 rounded-2xl border border-slate-200 bg-white shadow-sm"
          />
        ))}
      </div>
    </Section>
  );
}

function FAQ() {
  return (
    <Section id="faq" eyebrow="Help" title="Frequently asked questions">
      <div className="mt-6 space-y-3">
        {[
          {
            q: "Is this production-ready?",
            a: "Yes—keep animations subtle, prefer transform/opacity, and measure.",
          },
          {
            q: "Will this match a light brand?",
            a: "The palette favors whites, slates, and soft sky/teal accents.",
          },
          {
            q: "How do I extend it?",
            a: "Extract sections into their own components and compose as needed.",
          },
        ].map((f, i) => (
          <FAQItem key={i} i={i} q={f.q} a={f.a} />
        ))}
      </div>
    </Section>
  );
}

// ==========================
// Page Export
// ==========================
export default function Page() {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,1),rgba(240,249,255,0.6))] text-slate-800">
      <Hero />
      <main>
        <ContentBlock />
        <StatsBand />
        <FAQ />
      </main>
    </div>
  );
}
