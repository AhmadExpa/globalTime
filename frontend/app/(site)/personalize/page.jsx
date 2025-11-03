/* app/personalize/page.jsx */
"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Globe, Clock as ClockIcon, Search } from "lucide-react";
import { DateTime } from "luxon";

import { useAuth } from "../../context/AuthContext";
import { fetchClocks, createClock, deleteClock } from "../../../lib/api";
import AnalogClock from "../../../components/AnalogClock";
import DigitalClock from "../../../components/DigitalClock";
import ThemePicker from "../../../components/ThemePicker";
import { COUNTRIES } from "../countryData";

const ALL_THEMES = ["classic", "neon", "minimal", "sunset", "matrix", "glass", "royal"];

export default function Personalize() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [type, setType] = useState("analog");
  const [theme, setTheme] = useState("classic");
  const [label, setLabel] = useState("");
  const [filter, setFilter] = useState("");

  const localZone = useMemo(() => DateTime.local().zoneName, []);
  const initialCountry = useMemo(() => {
    const hit = COUNTRIES.find((c) => c.timeZone === localZone);
    return hit ? hit.country : "Pakistan";
  }, [localZone]);
  const [country, setCountry] = useState(initialCountry);

  const timeZone = useMemo(() => {
    const c = COUNTRIES.find((x) => x.country === country);
    return c ? c.timeZone : localZone;
  }, [country, localZone]);

  const [notice, setNotice] = useState("");

  async function load() {
    try {
      if (token) {
        const { data } = await fetchClocks(token);
        setList(data.clocks || []);
      } else {
        const raw = sessionStorage.getItem("guestClocks");
        setList(raw ? JSON.parse(raw) : []);
      }
    } catch {
      setNotice("Failed to load clocks.");
    }
  }
  useEffect(() => {
    load();
  }, [token]);

  function saveGuest(updated) {
    sessionStorage.setItem("guestClocks", JSON.stringify(updated));
  }

  async function addClock() {
    const payload = { label, timeZone, type, theme };

    if (!token) {
      const cap = 2;
      if (list.length >= cap) {
        setNotice("Guest limit reached (2). Log in to save more.");
        return;
      }
      const newC = { _id: "guest-" + Math.random().toString(36).slice(2), ...payload };
      const updated = [newC, ...list];
      setList(updated);
      saveGuest(updated);
      setLabel("");
      setNotice("");
      return;
    }

    try {
      await createClock(token, payload);
      setLabel("");
      setNotice("");
      load();
    } catch {
      setNotice("Failed to create clock.");
    }
  }

  async function remove(id) {
    if (!token) {
      const updated = list.filter((x) => x._id !== id);
      setList(updated);
      saveGuest(updated);
      return;
    }
    try {
      await deleteClock(token, id);
      load();
    } catch {
      setNotice("Failed to remove clock.");
    }
  }

  const filteredCountries = useMemo(() => {
    if (!filter.trim()) return COUNTRIES;
    const f = filter.toLowerCase();
    return COUNTRIES.filter((c) => c.country.toLowerCase().includes(f));
  }, [filter]);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Personalize your clocks
          </h1>
          <p className="text-sm text-slate-500">
            Create, preview, and manage your world clocks. Smooth, fast, and friendly.
          </p>
        </div>
      </motion.div>

      {/* Notice */}
      <AnimatePresence>
        {notice && (
          <motion.div
            key="notice"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 px-4 py-2 text-sm"
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="rounded-2xl border bg-white/80 backdrop-blur p-5 shadow-sm"
      >
        <div className="text-lg font-semibold flex items-center gap-2">
          <ClockIcon className="h-5 w-5" /> Create a personal clock
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Left: form */}
          <div className="space-y-4">
            <input
              className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Label (optional)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />

            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                Clock type
              </div>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    className="accent-sky-600"
                    checked={type === "analog"}
                    onChange={() => setType("analog")}
                  />
                  Analog
                </label>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    className="accent-sky-600"
                    checked={type === "digital"}
                    onChange={() => setType("digital")}
                  />
                  Digital
                </label>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                Theme
              </div>
              <ThemePicker value={theme} onChange={setTheme} />
            </div>

            {/* Country -> TimeZone */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Country
                </div>
                <div className="text-[10px] text-slate-400">Maps to IANA zone automatically</div>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    placeholder="Filter countries..."
                    className="w-full rounded-xl border pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
                <select
                  className="min-w-[12rem] rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {filteredCountries.map((c) => (
                    <option key={c.country} value={c.country}>
                      {c.country}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Selected time zone: <span className="font-mono">{timeZone}</span>
              </div>
            </div>

            <button
              onClick={addClock}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 text-white px-4 py-2 hover:bg-sky-700 active:scale-[.98] transition"
            >
              <Plus className="h-4 w-4" /> Add Clock
            </button>
          </div>

          {/* Right: live preview */}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">Live preview</div>
            <motion.div
              key={`${type}-${theme}-${timeZone}`}
              initial={{ opacity: 0, scale: 0.98, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border p-4 flex items-center justify-center"
            >
              {type === "analog" ? (
                <AnalogClock timeZone={timeZone} theme={theme} size={220} smooth />
              ) : (
                <DigitalClock timeZone={timeZone} theme={theme} />
              )}
            </motion.div>

            <div className="text-xs text-slate-500">Theme previews</div>
            <div className="grid grid-cols-3 gap-3">
              {ALL_THEMES.map((t) => (
                <motion.button
                  key={t}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTheme(t)}
                  className={`group border rounded-xl p-3 text-left transition ${
                    theme === t ? "ring-2 ring-sky-400" : ""
                  }`}
                >
                  <div className="text-[11px] mb-1 capitalize text-slate-600 group-hover:text-slate-800">
                    {t}
                  </div>
                  <div className="flex items-center justify-center">
                    <AnalogClock timeZone={timeZone} theme={t} size={120} smooth={false} />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Your clocks */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        className="rounded-2xl border bg-white/80 backdrop-blur p-5 shadow-sm"
      >
        <div className="text-lg font-semibold">Your clocks</div>
        <div className="text-xs text-slate-500 mb-3">Guests 2 (session) • Free=2 • Pro=4 • Admin=∞</div>

        <AnimatePresence initial={false}>
          <div className="grid gap-4 md:grid-cols-3">
            {list.map((c) => (
              <motion.div
                key={c._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="border rounded-xl p-3"
              >
                <div className="text-sm font-medium truncate" title={c.label || c.timeZone}>
                  {c.label || c.timeZone}
                </div>
                <div className="mt-2">
                  {c.type === "analog" ? (
                    <AnalogClock timeZone={c.timeZone} theme={c.theme} />
                  ) : (
                    <DigitalClock timeZone={c.timeZone} theme={c.theme} />
                  )}
                </div>
                <button
                  onClick={() => remove(c._id)}
                  className="mt-3 inline-flex items-center gap-2 text-slate-600 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </motion.div>
            ))}

            {list.length === 0 && (
              <div className="col-span-full text-sm text-slate-500 border-dashed border rounded-xl p-6 flex items-center gap-3">
                <ClockIcon className="h-4 w-4" /> No clocks yet. Create one above to get started.
              </div>
            )}
          </div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
