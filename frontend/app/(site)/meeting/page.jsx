"use client";
import { useMemo, useState } from "react";
import { DateTime } from "luxon";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Globe2, Plus, Trash2, ChevronDown } from "lucide-react";
import { COUNTRIES } from "../countryData";

/**
 * Meeting Planner — Framer Motion + Lucide, no external UI kit.
 * - Base country/time
 * - Add other countries
 * - Animated cards show local time and delta vs base
 */
export default function Meeting() {
  const [baseTz, setBaseTz] = useState("Asia/Karachi");
  const [baseTimeISO, setBaseTimeISO] = useState(
    DateTime.local().toISO({ suppressMilliseconds: true })
  );
  const [others, setOthers] = useState(["Europe/London", "America/New_York"]);
  const [pendingAdd, setPendingAdd] = useState("Asia/Dubai");

  const baseDT = useMemo(
    () => DateTime.fromISO(baseTimeISO).setZone(baseTz),
    [baseTimeISO, baseTz]
  );

  const addLocation = () => {
    if (!pendingAdd) return;
    if (others.includes(pendingAdd)) return;
    setOthers((prev) => [...prev, pendingAdd]);
  };

  const removeLocation = (tz) =>
    setOthers((prev) => prev.filter((x) => x !== tz));

  const tzOptions = useMemo(
    () =>
      COUNTRIES.map((c) => ({
        label: `${c.country} — ${c.timeZone}`,
        value: c.timeZone,
      })),
    []
  );

  const countryLabelForTz = (tz) =>
    tzOptions.find((o) => o.value === tz)?.label ?? tz;

  const formatDelta = (mins) => {
    const sign = mins > 0 ? "+" : mins < 0 ? "−" : "";
    const abs = Math.abs(mins);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `${sign}${h}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
  };

  const sortedOthers = useMemo(() => {
    return [...others].sort((a, b) => {
      const da = baseDT.setZone(a).offset - baseDT.offset;
      const db = baseDT.setZone(b).offset - baseDT.offset;
      return da - db;
    });
  }, [others, baseDT]);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-slate-100">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">
              Meeting Planner
            </h1>
            <p className="text-slate-500 text-sm">
              Plan across time zones without the mental math.
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-slate-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            Base: {baseDT.toFormat("ccc, dd LLL yyyy • HH:mm ZZZZ")}
          </span>
        </div>
      </div>

      {/* Base controls */}
      <motion.div
        layout
        className="rounded-2xl border bg-white/60 backdrop-blur shadow-sm p-4 md:p-6"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Base location
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={baseTz}
                onChange={(e) => setBaseTz(e.target.value)}
              >
                {tzOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Base date & time
            </label>
            <input
              type="datetime-local"
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={baseDT.toFormat("yyyy-LL-dd'T'HH:mm")}
              onChange={(e) => {
                const v = e.target.value;
                const parsed = DateTime.fromFormat(v, "yyyy-LL-dd'T'HH:mm", {
                  zone: baseTz,
                });
                if (parsed.isValid) setBaseTimeISO(parsed.toISO());
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Quick add location
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  className="w-full appearance-none rounded-xl border px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  value={pendingAdd}
                  onChange={(e) => setPendingAdd(e.target.value)}
                >
                  {tzOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <button
                onClick={addLocation}
                className="inline-flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Selected locations list (editable) */}
      <motion.div
        layout
        className="rounded-2xl border bg-white/60 backdrop-blur shadow-sm p-4 md:p-6"
      >
        <h2 className="text-base font-semibold mb-4">Selected locations</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {others.map((tz) => (
            <div key={tz} className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  className="w-full appearance-none rounded-xl border px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  value={tz}
                  onChange={(e) =>
                    setOthers((prev) =>
                      prev.map((p) => (p === tz ? e.target.value : p))
                    )
                  }
                >
                  {tzOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <button
                onClick={() => removeLocation(tz)}
                className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove ${tz}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Cards */}
      <section>
        <h2 className="text-base font-semibold mb-3">Time across locations</h2>
        <AnimatePresence initial={false}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Base card */}
            <motion.div
              key={`base-${baseTz}`}
              layout
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-2xl border bg-white/80 backdrop-blur p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-700">
                  Base — {countryLabelForTz(baseTz)}
                </div>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-3 font-mono text-2xl tracking-tight">
                {baseDT.toFormat("ccc • HH:mm")}
              </div>
              <div className="text-slate-500 text-xs mt-1">
                UTC {formatDelta(baseDT.offset)}
              </div>
            </motion.div>

            {/* Other cards */}
            {sortedOthers.map((tz) => {
              const local = baseDT.setZone(tz);
              const deltaMins = local.offset - baseDT.offset;
              return (
                <motion.div
                  key={tz}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="rounded-2xl border bg-white/80 backdrop-blur p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-700">
                      {countryLabelForTz(tz)}
                    </div>
                    <div className="text-xs rounded-full border px-2 py-0.5 text-slate-600">
                      {deltaMins === 0
                        ? "Same as base"
                        : `${deltaMins > 0 ? "+" : "−"}${Math.abs(
                            Math.round(deltaMins / 60)
                          )}h`}
                    </div>
                  </div>
                  <div className="mt-3 font-mono text-2xl tracking-tight">
                    {local.toFormat("ccc • HH:mm")}
                  </div>
                  <div className="text-slate-500 text-xs mt-1">
                    UTC {formatDelta(local.offset)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </section>

      {/* Footer note */}
      <p className="text-xs text-slate-500">
        Times reflect the selected base date/time converted per location.
        Daylight saving differences are handled via IANA zones.
      </p>
    </div>
  );
}
