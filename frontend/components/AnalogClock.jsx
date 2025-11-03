/* components/AnalogClock.jsx */
"use client";
import { DateTime } from "luxon";
import { useEffect, useMemo, useRef, useState } from "react";

const THEMES = {
  classic: {
    wrapper:
      "bg-white border border-slate-300 shadow-[0_20px_60px_rgba(0,0,0,0.07)]",
    faceFill: "#ffffff",
    tickMajor: "#0f172a",
    tickMinor: "#94a3b8",
    hour: "#0f172a",
    minute: "#334155",
    second: "#0ea5e9",
    capFill: "#0f172a",
    capStroke: "#ffffff",
    glow: "",
  },
  minimal: {
    wrapper:
      "bg-white border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
    faceFill: "#ffffff",
    tickMajor: "#475569",
    tickMinor: "#cbd5e1",
    hour: "#0f172a",
    minute: "#475569",
    second: "#94a3b8",
    capFill: "#0f172a",
    capStroke: "#ffffffcc",
    glow: "",
  },
  neon: {
    wrapper:
      "bg-slate-900 border border-slate-800 shadow-[0_40px_100px_rgba(14,165,233,0.35)]",
    faceFill: "#0b1220",
    tickMajor: "#38bdf8",
    tickMinor: "#7dd3fc",
    hour: "#e2e8f0",
    minute: "#bae6fd",
    second: "#22d3ee",
    capFill: "#22d3ee",
    capStroke: "#0ea5e9",
    glow: "filter drop-shadow(0 0 8px rgba(34,211,238,0.65))",
  },
  sunset: {
    wrapper:
      "bg-gradient-to-b from-orange-50 to-rose-100 border border-rose-200 shadow-[0_35px_80px_rgba(244,63,94,0.25)]",
    faceFill: "#fff5f5",
    tickMajor: "#fb7185",
    tickMinor: "#fecdd3",
    hour: "#334155",
    minute: "#0f172a",
    second: "#f43f5e",
    capFill: "#f43f5e",
    capStroke: "#fecaca",
    glow: "",
  },
  matrix: {
    wrapper:
      "bg-slate-950 border border-slate-800 shadow-[0_40px_100px_rgba(16,185,129,0.35)]",
    faceFill: "#0a0f16",
    tickMajor: "#34d399",
    tickMinor: "#10b981",
    hour: "#e2e8f0",
    minute: "#a7f3d0",
    second: "#22c55e",
    capFill: "#22c55e",
    capStroke: "#064e3b",
    glow: "filter drop-shadow(0 0 8px rgba(16,185,129,0.65))",
  },
  glass: {
    wrapper:
      "bg-white/10 border border-white/30 backdrop-blur shadow-[0_25px_80px_rgba(0,0,0,0.15)]",
    faceFill: "rgba(255,255,255,0.35)",
    tickMajor: "rgba(170, 115, 115, 0.95)",
    tickMinor: "rgba(255,255,255,0.6)",
    hour: "rgba(127, 97, 97, 0.95)",
    minute: "rgba(92, 25, 25, 0.85)",
    second: "#38bdf8",
    capFill: "rgba(149, 66, 66, 0.9)",
    capStroke: "rgba(255,255,255,0.5)",
    glow: "",
  },
  royal: {
    wrapper:
      "bg-gradient-to-b from-indigo-600 to-indigo-800 border border-indigo-500 shadow-[0_40px_110px_rgba(79,70,229,0.45)]",
    faceFill: "#4338ca",
    tickMajor: "#fbbf24",
    tickMinor: "#fde68a",
    hour: "#fff7ed",
    minute: "#fde68a",
    second: "#f59e0b",
    capFill: "#f59e0b",
    capStroke: "#92400e",
    glow: "",
  },
};

export default function AnalogClock({
  timeZone = DateTime.local().zoneName,
  theme = "classic",
  size = 180,
  smooth = true,
}) {
  const t = THEMES[theme] || THEMES.classic;

  const [now, setNow] = useState(DateTime.local());
  const raf = useRef(null);

  useEffect(() => {
    if (!smooth) {
      const i = setInterval(() => setNow(DateTime.local()), 1000);
      return () => clearInterval(i);
    }
    const loop = () => {
      setNow(DateTime.local());
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [smooth]);

  const dt = useMemo(() => now.setZone(timeZone), [now, timeZone]);

  const seconds = dt.second + dt.millisecond / 1000;
  const minutes = dt.minute + seconds / 60;
  const hours = (dt.hour % 12) + minutes / 60;

  const hourDeg = hours * 30;
  const minDeg = minutes * 6;
  const secDeg = seconds * 6;

  // SVG geometry (kept inside bounds)
  const vb = 100;
  const cx = 50;
  const cy = 50;
  const outerR = 45; // keep safe padding
  const majorLen = 7;
  const minorLen = 4;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative rounded-full ${t.wrapper}`}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox={`0 0 ${vb} ${vb}`}
          width={size}
          height={size}
          className="rounded-full"
          style={{ overflow: "hidden" }}
        >
          {/* face */}
          <circle cx={cx} cy={cy} r={outerR} fill={t.faceFill} />

          {/* ticks (inside the circle, never overflow) */}
          {[...Array(60)].map((_, i) => {
            const rad = (i * 6 * Math.PI) / 180;
            const isMajor = i % 5 === 0;
            const r1 = outerR - 2; // start a bit inside
            const len = isMajor ? majorLen : minorLen;
            const r2 = r1 - len;
            const x1 = cx + r1 * Math.cos(rad);
            const y1 = cy + r1 * Math.sin(rad);
            const x2 = cx + r2 * Math.cos(rad);
            const y2 = cy + r2 * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isMajor ? t.tickMajor : t.tickMinor}
                strokeWidth={isMajor ? 2.4 : 1.3}
                strokeLinecap="round"
              />
            );
          })}

          {/* hour hand */}
          <g transform={`rotate(${hourDeg} ${cx} ${cy})`}>
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - outerR + 20}
              stroke={t.hour}
              strokeWidth="4.8"
              strokeLinecap="round"
            />
          </g>

          {/* minute hand */}
          <g transform={`rotate(${minDeg} ${cx} ${cy})`}>
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - outerR + 12}
              stroke={t.minute}
              strokeWidth="3.4"
              strokeLinecap="round"
            />
          </g>

          {/* second hand + counterweight (contained) */}
          <g transform={`rotate(${secDeg} ${cx} ${cy})`} className={t.glow}>
            <line
              x1={cx}
              y1={cy + 6}
              x2={cx}
              y2={cy - outerR + 8}
              stroke={t.second}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy + 10}
              stroke={t.second}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.7"
            />
          </g>

          {/* center cap */}
          <circle
            cx={cx}
            cy={cy}
            r="3.8"
            fill={t.capFill}
            stroke={t.capStroke}
            strokeWidth="1"
          />
        </svg>
      </div>
      <div className="mt-2 text-xs text-slate-500">
        {dt.toFormat("ccc, HH:mm:ss")}
      </div>
    </div>
  );
}
