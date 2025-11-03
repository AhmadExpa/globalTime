'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { subscribeNewsletter } from '../../../lib/api';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const emailValid = useMemo(() => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email), [email]);

  async function submit(e) {
    e.preventDefault();
    setMessage('');

    if (!emailValid) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    try {
      setStatus('loading');
      await subscribeNewsletter(email);
      setStatus('success');
      setMessage("You're in! Check your inbox for a confirmation.");
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage('Subscription failed. Please try again.');
    }
  }

  return (
    <div className="min-h-[70vh] w-full bg-gradient-to-b from-white via-slate-50 to-white text-slate-900 flex items-center justify-center p-6">
      {/* Decorative backdrop */}
      <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(60%_60%_at_50%_30%,white,transparent)] bg-[radial-gradient(70%_50%_at_50%_-10%,rgba(56,189,248,0.12),transparent),radial-gradient(50%_40%_at_10%_90%,rgba(99,102,241,0.08),transparent),radial-gradient(40%_40%_at_90%_90%,rgba(236,72,153,0.1),transparent)] " />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl"
      >
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-cyan-500/30 via-indigo-500/30 to-pink-500/30 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl p-8 md:p-10">
            <div className="flex items-start gap-3 mb-6">
              <div className="h-11 w-11 rounded-2xl bg-slate-100 grid place-items-center shadow-inner">
                <Mail className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">Newsletter</h1>
                <p className="text-sm md:text-base text-slate-600 mt-1">Actionable insights, no fluff. One click to join.</p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="group">
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="peer w-full rounded-2xl bg-white border border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200 outline-none px-4 py-3 md:py-4 pr-12 text-slate-900 placeholder-slate-400 transition"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <AnimatePresence mode="wait" initial={false}>
                      {status === 'success' && (
                        <motion.span key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </motion.span>
                      )}
                      {status === 'error' && (
                        <motion.span key="err" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                          <AlertCircle className="h-5 w-5 text-rose-500" />
                        </motion.span>
                      )}
                      {status === 'loading' && (
                        <motion.span key="spin" className="inline-flex">
                          <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <motion.div
                  initial={false}
                  animate={{ height: message ? 'auto' : 0, opacity: message ? 1 : 0, marginTop: message ? 8 : 0 }}
                  className="overflow-hidden"
                  aria-live="polite"
                >
                  <div className={`text-sm ${status === 'error' ? 'text-rose-600' : status === 'success' ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {message}
                  </div>
                </motion.div>
              </div>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                type="submit"
                disabled={status === 'loading' || !emailValid}
                className="relative w-full inline-flex items-center justify-center rounded-2xl px-4 py-3 md:py-4 font-medium transition focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 opacity-90"></span>
                <span className="absolute inset-[2px] rounded-2xl bg-white"></span>
                <span className="relative inline-flex items-center gap-2 text-slate-900">
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Subscribing…
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5" />
                      Subscribe
                    </>
                  )}
                </span>
              </motion.button>

              <p className="text-xs text-slate-500 text-center">No spam. Unsubscribe anytime.</p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
