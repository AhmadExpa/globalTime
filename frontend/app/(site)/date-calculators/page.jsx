'use client';
import { useMemo, useState } from 'react';
import { DateTime, Interval } from 'luxon';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Baby, Timer, ArrowLeftRight, Plus, Minus } from 'lucide-react';

/**
 * Date Calculators — (1) Age from Date of Birth, (2) Days from Any Date
 * Tech: React, Tailwind, Framer Motion, lucide-react, Luxon
 */
export default function DateCalculatorsPage() {
  // ----- Age / DOB -----
  const [dob, setDob] = useState('1995-01-01');
  const [asOfISO, setAsOfISO] = useState(DateTime.local().toISODate());

  const asOf = useMemo(() => DateTime.fromISO(asOfISO) || DateTime.local(), [asOfISO]);
  const dobDT = useMemo(() => DateTime.fromISO(dob), [dob]);

  const age = useMemo(() => {
    if (!dobDT.isValid || !asOf.isValid) return null;
    if (dobDT > asOf) return 'future';

    // years / months / days breakdown
    let years = asOf.year - dobDT.year;
    let months = asOf.month - dobDT.month;
    let days = asOf.day - dobDT.day;

    if (days < 0) {
      const prevMonth = asOf.minus({ months: 1 });
      days += prevMonth.daysInMonth;
      months -= 1;
    }
    if (months < 0) {
      months += 12;
      years -= 1;
    }
    const totalDays = Math.floor(asOf.diff(dobDT, 'days').days);
    const totalWeeks = Math.floor(totalDays / 7);

    return { years, months, days, totalDays, totalWeeks };
  }, [dobDT, asOf]);

  // ----- Days Between -----
  const [startISO, setStartISO] = useState(DateTime.local().toISODate());
  const [endISO, setEndISO] = useState(DateTime.local().plus({ days: 30 }).toISODate());
  const [includeEnd, setIncludeEnd] = useState(true);

  const diffInfo = useMemo(() => {
    const a = DateTime.fromISO(startISO);
    const b = DateTime.fromISO(endISO);
    if (!a.isValid || !b.isValid) return null;

    let start = a;
    let end = b;
    let sign = 1;
    if (end < start) {
      [start, end] = [end, start];
      sign = -1;
    }
    const interval = Interval.fromDateTimes(start.startOf('day'), end.startOf('day'));
    let days = Math.round(interval.length('days')) + (includeEnd ? 1 : 0);
    days = days * sign;

    const absDays = Math.abs(days);
    const weeks = Math.floor(absDays / 7);
    const remDays = absDays % 7;

    return { days, weeks, remDays, start, end, inverted: sign === -1 };
  }, [startISO, endISO, includeEnd]);

  // UI helpers
  const chip = (label, value, key) => (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="rounded-xl border bg-white/70 backdrop-blur px-3 py-1.5 text-sm shadow-sm"
    >
      <span className="text-slate-500">{label}: </span>
      <span className="font-semibold tabular-nums">{value}</span>
    </motion.div>
  );

  const presetAdjust = (days) => setEndISO((prev) => {
    const current = DateTime.fromISO(prev).isValid ? DateTime.fromISO(prev) : DateTime.local();
    return current.plus({ days }).toISODate();
  });

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-slate-100"><Calendar className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Date Calculators</h1>
            <p className="text-slate-500 text-sm">Two practical tools: age from DOB, and days between any two dates.</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Age Calculator */}
        <motion.section
          layout
          className="rounded-2xl border bg-white/60 backdrop-blur shadow-sm p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Baby className="w-5 h-5 text-slate-600" />
            <h2 className="font-semibold">Age from Date of Birth</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date of birth</label>
              <input
                type="date"
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={asOfISO}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">As of</label>
              <input
                type="date"
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={asOfISO}
                onChange={(e) => setAsOfISO(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-5">
            <AnimatePresence initial={false}>
              {!dobDT.isValid || !asOf.isValid ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-600"
                >
                  Enter valid dates.
                </motion.p>
              ) : age === 'future' ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-600">
                  DOB is after the as-of date. Fix that.
                </motion.p>
              ) : (
                <motion.div
                  key={`${age?.years}-${age?.months}-${age?.days}-${age?.totalDays}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="rounded-2xl border p-4 bg-white/70 backdrop-blur"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {chip('Years', age.years, 'y')}
                    {chip('Months', age.months, 'm')}
                    {chip('Days', age.days, 'd')}
                  </div>
                  <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl border p-3 bg-white/60">
                      <div className="text-slate-500">Total days alive</div>
                      <div className="font-semibold tabular-nums">{age.totalDays.toLocaleString()}</div>
                    </div>
                    <div className="rounded-xl border p-3 bg-white/60">
                      <div className="text-slate-500">Total weeks</div>
                      <div className="font-semibold tabular-nums">{age.totalWeeks.toLocaleString()}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Days Between */}
        <motion.section
          layout
          className="rounded-2xl border bg-white/60 backdrop-blur shadow-sm p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeftRight className="w-5 h-5 text-slate-600" />
            <h2 className="font-semibold">Days from Any Date</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Start</label>
              <input
                type="date"
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={startISO}
                onChange={(e) => setStartISO(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">End</label>
              <input
                type="date"
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={endISO}
                onChange={(e) => setEndISO(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => setIncludeEnd((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${includeEnd ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50'}`}
            >
              <Timer className="w-4 h-4" />
              {includeEnd ? 'Inclusive' : 'Exclusive'} end
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
              <span>Presets:</span>
              <button onClick={() => presetAdjust(-1)} className="rounded-lg border px-2 py-1 hover:bg-slate-50 inline-flex items-center gap-1"><Minus className="w-3 h-3" />1d</button>
              <button onClick={() => presetAdjust(7)} className="rounded-lg border px-2 py-1 hover:bg-slate-50 inline-flex items-center gap-1"><Plus className="w-3 h-3" />7d</button>
              <button onClick={() => presetAdjust(30)} className="rounded-lg border px-2 py-1 hover:bg-slate-50 inline-flex items-center gap-1"><Plus className="w-3 h-3" />30d</button>
            </div>
          </div>

          <div className="mt-5">
            <AnimatePresence initial={false}>
              {!diffInfo ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-600">Enter valid dates.</motion.p>
              ) : (
                <motion.div
                  key={`${diffInfo.days}-${includeEnd}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="rounded-2xl border p-4 bg-white/70 backdrop-blur"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {chip('Total days', diffInfo.days, 'days')}
                    {chip('Weeks', diffInfo.weeks, 'weeks')}
                    {chip('Remainder days', diffInfo.remDays, 'rem')}
                  </div>
                  <p className="text-xs text-slate-500 mt-3">{diffInfo.inverted ? 'End is before start — values shown as negative days.' : 'Start to end counted '}{includeEnd ? 'inclusively' : 'exclusively'}.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      </div>

      {/* Footer */}
      <p className="text-xs text-slate-500">All calculations use local time and calendar dates (no time-of-day). Powered by Luxon for reliable date math.</p>
    </div>
  );
}
