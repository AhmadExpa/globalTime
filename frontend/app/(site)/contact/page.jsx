"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

/**
 * CONTACT US — Professional UI (JavaScript + JSX)
 * - Clean, accessible form with client-side validation
 * - Subtle motion, glassy cards, and clear hierarchy
 * - Honeypot + disabled-on-submit to reduce spam
 * - Ready to POST to /api/contact (you can swap the endpoint)
 * - Includes side panel with details, map, and FAQs
 */

const EASING = [0.22, 1, 0.36, 1];

const fadeIn = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: EASING },
  }),
};

export default function ContactUsPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "General",
    subject: "",
    message: "",
    consent: false,
    website: "", // honeypot (must stay empty)
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "idle", msg: "" });
  const submitBtnRef = useRef(null);

  // Simple validators
  const validators = {
    name: (v) => (v.trim().length < 2 ? "Please enter your full name." : ""),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email."),
    subject: (v) => (v.trim().length < 3 ? "Subject is required." : ""),
    message: (v) => (v.trim().length < 10 ? "Tell us a bit more (min 10 chars)." : ""),
    consent: (v) => (!v ? "You must agree to be contacted." : ""),
  };

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function validateAll() {
    const newErr = {};
    Object.entries(validators).forEach(([k, fn]) => {
      const msg = fn(form[k]);
      if (msg) newErr[k] = msg;
    });
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Honeypot check
    if (form.website) return; // bot likely
    if (!validateAll()) return;

    try {
      setStatus({ type: "loading", msg: "Sending…" });
      submitBtnRef.current?.setAttribute("disabled", "true");

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          topic: form.topic,
          subject: form.subject,
          message: form.message,
          consent: form.consent,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus({ type: "success", msg: "Thanks! We’ll get back to you shortly." });
      setForm({ name: "", email: "", phone: "", topic: "General", subject: "", message: "", consent: false, website: "" });
    } catch (err) {
      setStatus({ type: "error", msg: "Something went wrong. Please try again." });
    } finally {
      submitBtnRef.current?.removeAttribute("disabled");
      setTimeout(() => setStatus({ type: "idle", msg: "" }), 5000);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
        {/* Background accents */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 0.5, y: 0 }} transition={{ duration: 0.8, ease: EASING }} className="absolute -top-24 right-6 h-72 w-72 rounded-full bg-gradient-to-tr from-sky-200 via-cyan-100 to-white blur-3xl" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.4, y: 0 }} transition={{ duration: 0.8, ease: EASING }} className="absolute -bottom-24 left-6 h-80 w-80 rounded-full bg-gradient-to-tr from-fuchsia-200 via-pink-100 to-white blur-3xl" />
        </div>

        {/* Page header */}
        <header className="mb-10 md:mb-14">
          <motion.h1
            className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASING }}
          >
            Contact Us
          </motion.h1>
          <motion.p
            className="mt-2 max-w-2xl text-sm text-slate-600"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASING, delay: 0.05 }}
          >
            Questions, feedback, or a project in mind? Fill out the form and our team will respond within one business day.
          </motion.p>
        </header>

        <section className="grid gap-8 md:grid-cols-5">
          {/* Form */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="md:col-span-3 rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur md:p-8"
          >
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Honeypot */}
              <input type="text" name="website" autoComplete="off" value={form.website} onChange={handleChange} className="hidden" tabIndex={-1} aria-hidden />

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Full name" htmlFor="name" error={errors.name}>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    className="input"
                    placeholder="Jane Doe"
                    required
                  />
                </Field>

                <Field label="Email" htmlFor="email" error={errors.email}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input"
                    placeholder="jane@company.com"
                    required
                  />
                </Field>

                <Field label="Phone (optional)" htmlFor="phone">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className="input"
                    placeholder="+1 555 000 1234"
                  />
                </Field>

                <Field label="Topic" htmlFor="topic">
                  <select id="topic" name="topic" value={form.topic} onChange={handleChange} className="input">
                    <option>General</option>
                    <option>Sales</option>
                    <option>Support</option>
                    <option>Partnerships</option>
                  </select>
                </Field>
              </div>

              <Field label="Subject" htmlFor="subject" error={errors.subject}>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  className="input"
                  placeholder="How can we help?"
                  required
                />
              </Field>

              <Field label="Message" htmlFor="message" error={errors.message}>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={form.message}
                  onChange={handleChange}
                  className="input resize-y"
                  placeholder="Share a few details so we can prepare a helpful reply."
                  required
                />
              </Field>

              <div className="flex items-start gap-3">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={form.consent}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  required
                />
                <label htmlFor="consent" className="text-sm text-slate-600">
                  I agree to be contacted about my inquiry, and I consent to the processing of my information in accordance with the privacy policy.
                </label>
              </div>

              {/* Placeholder for reCAPTCHA / turnstile */}
              <div className="rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-500">
                Optional anti‑spam widget here (reCAPTCHA/Turnstile)
              </div>

              <div className="flex items-center gap-3">
                <button ref={submitBtnRef} type="submit" className="btn-primary">
                  Send message
                </button>
                <StatusPill status={status} />
              </div>
            </form>
          </motion.div>

          {/* Sidebar */}
          <motion.aside
            variants={fadeIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="md:col-span-2 space-y-6"
          >
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur">
              <h2 className="text-base font-semibold text-slate-900">Get in touch</h2>
              <p className="mt-2 text-sm text-slate-600">Prefer email or a quick call? We’ve got options.</p>

              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-slate-600">Email</span>
                  <a className="text-sky-700 hover:underline" href="mailto:hello@yourdomain.com">hello@yourdomain.com</a>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600">Phone</span>
                  <a className="text-sky-700 hover:underline" href="tel:+15550001234">+1 (555) 000‑1234</a>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600">Hours</span>
                  <span className="text-slate-700">Mon–Fri, 9:00–17:00</span>
                </li>
              </ul>

              <div className="mt-4 flex gap-3">
                <Link href="#" className="btn-muted">Twitter</Link>
                <Link href="#" className="btn-muted">LinkedIn</Link>
                <Link href="#" className="btn-muted">GitHub</Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur">
              <iframe
                title="Office location"
                className="h-56 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=Your%20Company&output=embed"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur">
              <h3 className="text-base font-semibold text-slate-900">FAQs</h3>
              <Accordion
                items={[
                  { q: "When will I hear back?", a: "We reply within one business day. Complex requests may take a little longer." },
                  { q: "Do you offer support SLAs?", a: "Yes—paid plans include response‑time guarantees. Tell us your needs in the form." },
                  { q: "Can I schedule a demo?", a: "Absolutely. Choose 'Sales' as the topic and include a couple of times that work for you." },
                ]}
              />
            </div>
          </motion.aside>
        </section>
      </main>
    </MotionConfig>
  );
}

/* ————— Subcomponents ————— */
function Field({ label, htmlFor, error, children }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        <AnimatePresence initial={false}>
          {error ? (
            <motion.span
              key="err"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-rose-600"
              role="alert"
            >
              {error}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function StatusPill({ status }) {
  if (status.type === "idle") return null;
  const tone = status.type === "success" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : status.type === "error" ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-slate-50 text-slate-600 ring-slate-200";
  return (
    <motion.span
      key={status.type + status.msg}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs ring-1 ${tone}`}
    >
      {status.msg}
    </motion.span>
  );
}

function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <ul className="mt-3 divide-y divide-slate-200">
      {items.map((it, i) => (
        <li key={i} className="py-3">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left text-sm font-medium text-slate-800"
            onClick={() => setOpen((o) => (o === i ? -1 : i))}
            aria-expanded={open === i}
          >
            {it.q}
            <span className="ml-3 text-slate-400">{open === i ? "–" : "+"}</span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.p
                key="a"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASING }}
                className="pt-2 text-sm text-slate-600"
              >
                {it.a}
              </motion.p>
            )}
          </AnimatePresence>
        </li>
      ))}
    </ul>
  );
}

/* ————— Tailwind helpers you might already have globally —————
.btn-primary { @apply inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400; }
.btn-muted { @apply inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-700 hover:bg-white; }
.input { @apply w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none ring-0 focus:border-sky-400 focus:ring-2 focus:ring-sky-100; }
*/
