"use client";
import { useMemo, useRef, useState, useEffect } from "react";
import { DateTime } from "luxon";
import { motion } from "framer-motion";
import { Clock, Globe2, Plus, Trash2, X, Search } from "lucide-react";
import { COUNTRIES } from "../countryData";

/**
 * Meeting Planner — FINAL
 * JSX only (no TS). Tailwind + Framer Motion. No external UI kit.
 *
 * ✅ Header + square image side-by-side (stacks on mobile)
 * ✅ Full-width 24-hour table below
 * ✅ Color bands per local hour (red 0–9, green 9–17, yellow 17–24)
 * ✅ Select & delete hours (rows) + Reset
 * ✅ Add time zones (max 5 incl. base) + delete columns (non-base)
 * ✅ SEARCH in Base Location & Quick Add (live, debounced)
 */

// Small utility: basic debounce hook
function useDebounced(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

// Reusable searchable select (combobox-style, ultra-lightweight)
function SearchSelect({ label, options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 120);
  const wrapperRef = useRef(null);

  // Keep input in sync with external value
  useEffect(() => {
    const opt = options.find((o) => o.value === value);
    setQuery(opt ? opt.label : "");
  }, [value, options]);

  // Click outside to close
  useEffect(() => {
    const onClick = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return options.slice(0, 200);
    return options
      .filter((o) => o.label.toLowerCase().includes(q))
      .slice(0, 200);
  }, [options, debounced]);

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="text-sm font-medium text-slate-700 mb-1 block">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-slate-200">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          className="w-full text-sm outline-none"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && (
        <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">No matches</div>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setQuery(opt.label);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${
                  value === opt.value ? "bg-slate-50" : ""
                }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function Meeting() {
  // --- Core state ---
  const [baseTz, setBaseTz] = useState("Asia/Karachi");
  const [baseTimeISO, setBaseTimeISO] = useState(
    DateTime.local().toISO({ suppressMilliseconds: true })
  );
  const [others, setOthers] = useState(["Europe/London", "America/New_York"]);
  const [pendingAdd, setPendingAdd] = useState("Asia/Dubai");

  const MAX_VISIBLE = 5; // Base + up to 4 others

  const baseDT = useMemo(
    () => DateTime.fromISO(baseTimeISO).setZone(baseTz),
    [baseTimeISO, baseTz]
  );
  const baseAnchor = useMemo(() => baseDT.startOf("day"), [baseDT]);

  // --- Options ---
  const tzOptions = useMemo(
    () =>
      COUNTRIES.map((c) => ({
        label: `${c.country} — ${c.timeZone}`,
        value: c.timeZone,
      })),
    []
  );
  const labelFor = (tz) => tzOptions.find((o) => o.value === tz)?.label ?? tz;

  // --- Zones list (sorted) ---
  const sortedOthers = useMemo(
    () =>
      [...others].sort(
        (a, b) => baseDT.setZone(a).offset - baseDT.setZone(b).offset
      ),
    [others, baseDT]
  );
  const zones = useMemo(
    () => [baseTz, ...sortedOthers].slice(0, MAX_VISIBLE),
    [baseTz, sortedOthers]
  );

  // --- Hours ---
  const allHours = useMemo(() => Array.from({ length: 24 }, (_, h) => h), []);
  const [hiddenHours, setHiddenHours] = useState(new Set());
  const [selectedHours, setSelectedHours] = useState(new Set());

  const visibleHours = allHours.filter((h) => !hiddenHours.has(h));
  const fmtHour12 = (h) =>
    `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "am" : "pm"}`;
  const bandColor = (hour) =>
    hour >= 9 && hour < 17
      ? "bg-emerald-200/70"
      : hour >= 17
      ? "bg-amber-200/70"
      : "bg-rose-200/70";

  // --- Actions ---
  const toggleHour = (h) =>
    setSelectedHours((prev) => {
      const n = new Set(prev);
      n.has(h) ? n.delete(h) : n.add(h);
      return n;
    });
  const deleteSelected = () => {
    if (selectedHours.size === 0) return;
    setHiddenHours((prev) => {
      const n = new Set(prev);
      selectedHours.forEach((h) => n.add(h));
      return n;
    });
    setSelectedHours(new Set());
  };
  const resetHours = () => {
    setHiddenHours(new Set());
    setSelectedHours(new Set());
  };

  const addLocation = () => {
    if (
      !pendingAdd ||
      others.includes(pendingAdd) ||
      1 + others.length >= MAX_VISIBLE
    )
      return;
    setOthers((prev) => [...prev, pendingAdd]);
  };
  const removeLocation = (tz) =>
    setOthers((prev) => prev.filter((x) => x !== tz));

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24 space-y-8">
      {/* Header + image side by side */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-slate-100">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">
              Meeting Planner
            </h1>
            <p className="text-slate-500 text-sm">
              24-hour grid across up to 5 locations
            </p>
            <div className="mt-2 hidden md:flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {baseDT.toFormat("ccc, dd LLL yyyy • HH:mm ZZZZ")}
              </span>
            </div>
          </div>
        </div>
        <img
          src="/Project_164-12.png"
          alt="Visual"
          className="object-contain max-h-[320px] w-full md:w-auto "
        />
      </div>

      {/* Controls */}
      <motion.div
        layout
        className="rounded-2xl border bg-white/70 backdrop-blur shadow-sm p-4 md:p-6"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <SearchSelect
            label="Base location"
            options={tzOptions}
            value={baseTz}
            onChange={(v) => setBaseTz(v)}
            placeholder="Search base timezone…"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Base date & time
            </label>
            <input
              type="datetime-local"
              className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-slate-200"
              value={baseDT.toFormat("yyyy-LL-dd'T'HH:mm")}
              onChange={(e) => {
                const parsed = DateTime.fromFormat(
                  e.target.value,
                  "yyyy-LL-dd'T'HH:mm",
                  { zone: baseTz }
                );
                if (parsed.isValid) setBaseTimeISO(parsed.toISO());
              }}
            />
          </div>

          <div className="space-y-2">
            <SearchSelect
              label="Quick add location"
              options={tzOptions}
              value={pendingAdd}
              onChange={(v) => setPendingAdd(v)}
              placeholder="Search location to add…"
            />
            <div className="flex justify-end">
              <button
                onClick={addLocation}
                disabled={1 + others.length >= MAX_VISIBLE}
                className="inline-flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Row / column actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={deleteSelected}
          disabled={selectedHours.size === 0}
          className="inline-flex items-center gap-2 rounded-xl border bg-rose-50 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" /> Delete selected times
        </button>
        {hiddenHours.size > 0 && (
          <button
            onClick={resetHours}
            className="inline-flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100"
          >
            Reset hours
          </button>
        )}
        <span className="text-xs text-slate-500">
          Select hours via checkboxes to delete. You can reset anytime.
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <i className="w-3 h-3 inline-block rounded bg-emerald-200/70 border" />{" "}
          9–5
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="w-3 h-3 inline-block rounded bg-amber-200/70 border" />{" "}
          5–12
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="w-3 h-3 inline-block rounded bg-rose-200/70 border" />{" "}
          12–9
        </span>
      </div>

      {/* Table */}
      <motion.div
        layout
        className="rounded-2xl border bg-white/80 backdrop-blur p-3 shadow-sm overflow-x-auto"
      >
        <table className="min-w-[720px] w-full text-sm table-fixed">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white/90 backdrop-blur px-3 py-3 text-left font-medium text-slate-700 border-b w-28">
                Time
              </th>
              {zones.map((tz, idx) => (
                <th
                  key={`h-${tz}`}
                  className="px-3 py-3 text-left font-medium text-slate-700 border-b sticky top-0 bg-white/90"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span>
                        {idx === 0 ? `Base — ${labelFor(tz)}` : labelFor(tz)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        UTC {DateTime.now().setZone(tz).toFormat("ZZZZ")}
                      </span>
                    </div>
                    {idx !== 0 && (
                      <button
                        onClick={() => removeLocation(tz)}
                        className="ml-2 p-1 text-slate-400 hover:text-rose-500"
                        title={`Remove ${tz}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleHours.map((h) => (
              <tr key={`r-${h}`} className="border-b last:border-b-0">
                <td className="sticky left-0 z-10 bg-white/90 backdrop-blur px-3 py-0 align-middle w-28">
                  <label className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300"
                      checked={selectedHours.has(h)}
                      onChange={() => toggleHour(h)}
                    />
                    <span className="font-mono text-xs md:text-sm">
                      {fmtHour12(h)}
                    </span>
                  </label>
                </td>
                {zones.map((tz, idx) => {
                  const local = baseAnchor.plus({ hours: h }).setZone(tz);
                  const color = bandColor(local.hour);
                  const label =
                    idx === 0
                      ? fmtHour12(
                          baseAnchor.plus({ hours: h }).setZone(baseTz).hour
                        )
                      : fmtHour12(local.hour);
                  return (
                    <td key={`${tz}-${h}`} className="p-0">
                      <div
                        className={`h-9 md:h-11 ${color} flex items-center justify-between px-3`}
                        title={`${local.toFormat("ccc, dd LLL HH:mm")} (${tz})`}
                      >
                        <span className="font-mono text-xs md:text-sm">
                          {label}
                        </span>
                        <span className="hidden sm:inline text-[11px] text-slate-600">
                          {local.toFormat("HH:mm")}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <p className="text-xs text-slate-500">
        Colors reflect each column's local hour relative to the base day's
        midnight. Daylight saving handled via IANA zones. Visible columns capped
        at five.
      </p>
    </div>
  );
}
