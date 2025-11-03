"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, AlertCircle } from "lucide-react";

export default function PublicEventPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(() => new Date());

  // Live tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch event JSON from the public endpoint
  useEffect(() => {
    if (!slug) return;
    const base = process.env.NEXT_PUBLIC_API_BASE;
    if (!base) {
      setError(
        "Missing NEXT_PUBLIC_API_BASE. Set it in your environment to use the public API."
      );
      return;
    }
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch(`${base}/api/events/public/${slug}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setEvent(data);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Failed to load event");
      }
    };
    load();
    return () => controller.abort();
  }, [slug]);

  const target = useMemo(() => {
    try {
      return event?.targetISO ? new Date(event.targetISO) : null;
    } catch {
      return null;
    }
  }, [event?.targetISO]);

  const diff = useMemo(() => {
    if (!target) return null;
    const ms = Math.max(0, target.getTime() - now.getTime());
    const s = Math.floor(ms / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    return { ms, s, days, hours, minutes, seconds };
  }, [target, now]);

  const bgColor = event?.bgColor || "#0f172a"; // slate-900 fallback
  const textColor = event?.textColor || "#ffffff";

  const gradient = `radial-gradient(1200px 800px at 50% -10%, ${bgColor}cc, #000000)`;

  return (
    <div
      className="min-h-dvh w-full flex items-center justify-center p-6"
      style={{ color: textColor, backgroundImage: gradient }}
    >
      <div className="w-full max-w-4xl">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10 bg-white/5 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 sm:px-10 py-8 border-b border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <CalendarDays className="h-6 w-6 opacity-80" />
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight line-clamp-2">
                {event?.title ?? "Loading…"}
              </h1>
            </div>
            {target && (
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Clock className="h-4 w-4" />
                <time dateTime={target.toISOString()}>
                  {target.toUTCString()} (UTC)
                </time>
              </div>
            )}
            {error && (
              <div className="mt-3 flex items-start gap-2 text-sm text-red-200">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Countdown */}
          <div className="px-6 sm:px-10 py-10">
            {target ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  <FlipBlock label="Days" value={diff.days} />
                  <FlipBlock label="Hours" value={diff.hours} />
                  <FlipBlock label="Minutes" value={diff.minutes} />
                  <FlipBlock label="Seconds" value={diff.seconds} />
                </div>

                {/* Status */}
                <AnimatePresence mode="wait" initial={false}>
                  {diff.ms === 0 ? (
                    <motion.p
                      key="started"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35 }}
                      className="mt-6 text-center text-base sm:text-lg font-medium"
                    >
                      The countdown has finished.
                    </motion.p>
                  ) : (
                    <motion.p
                      key="running"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35 }}
                      className="mt-6 text-center text-base sm:text-lg opacity-80"
                    >
                      Ticking live. Last updated {now.toLocaleTimeString()}.
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Bullets */}
                {Array.isArray(event?.bullets) && event.bullets.length > 0 && (
                  <ul className="mt-8 space-y-2 list-disc list-inside text-sm sm:text-base opacity-90">
                    {event.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <SkeletonCountdown />
            )}
          </div>
        </motion.div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs opacity-60">
          Public event · slug: <code className="opacity-80">{String(slug || "—")}</code>
        </p>
      </div>
    </div>
  );
}

function SkeletonCountdown() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
      {["Days", "Hours", "Minutes", "Seconds"].map((label) => (
        <div
          key={label}
          className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5 text-center"
        >
          <div className="h-10 sm:h-12 w-24 sm:w-28 mx-auto rounded-md bg-white/10" />
          <div className="mt-2 text-xs uppercase tracking-widest opacity-60">{label}</div>
        </div>
      ))}
    </div>
  );
}

function FlipBlock({ label, value }) {
  const prev = useRef(value);
  const [dir, setDir] = useState(0);

  useEffect(() => {
    if (prev.current !== value) {
      setDir(value > prev.current ? 1 : -1);
      prev.current = value;
    }
  }, [value]);

  return (
    <div className="text-center">
      <div className="relative">
        <motion.div
          key={value}
          initial={{ rotateX: dir === 1 ? 90 : -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          className="mx-auto w-28 sm:w-32 h-14 sm:h-16 rounded-xl bg-black/50 backdrop-blur border border-white/10 flex items-center justify-center shadow-lg"
          style={{
            boxShadow:
              "inset 0 -2px 12px rgba(255,255,255,0.06), 0 6px 18px rgba(0,0,0,0.35)",
          }}
        >
          <span className="tabular-nums text-3xl sm:text-4xl font-semibold">
            {String(value).padStart(2, "0")}
          </span>
        </motion.div>
      </div>
      <div className="mt-2 text-[11px] sm:text-xs uppercase tracking-widest opacity-70">
        {label}
      </div>
    </div>
  );
}
