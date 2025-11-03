/* components/DigitalClock.jsx */
"use client";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";

const DIGITAL = {
  classic: "bg-white border-slate-300 text-slate-900",
  minimal: "bg-white border-slate-200 text-slate-900",
  neon: "bg-slate-900 border-slate-800 text-cyan-200",
  sunset: "bg-gradient-to-b from-orange-50 to-rose-100 border-rose-200 text-slate-900",
  matrix: "bg-slate-950 border-slate-800 text-emerald-300",
  glass: "bg-green/10 border-brown/30 backdrop-blur text-black",
  royal: "bg-gradient-to-b from-indigo-600 to-indigo-800 border-indigo-500 text-amber-200",
};

export default function DigitalClock({
  timeZone = DateTime.local().zoneName,
  theme = "classic",
}) {
  const [now, setNow] = useState(DateTime.local());
  useEffect(() => {
    const i = setInterval(() => setNow(DateTime.local()), 1000);
    return () => clearInterval(i);
  }, []);
  const dt = useMemo(() => now.setZone(timeZone), [now, timeZone]);
  const themeClass = DIGITAL[theme] || DIGITAL.classic;

  return (
    <div
      className={`rounded-2xl border p-4 text-center shadow-[0_30px_80px_rgba(0,0,0,0.07)] ${themeClass}`}
    >
      <div className="text-4xl font-mono tracking-tight">{dt.toFormat("HH:mm:ss")}</div>
      <div className="text-xs opacity-70 mt-1">{dt.toFormat("DDD, ccc")}</div>
    </div>
  );
}
