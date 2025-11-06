/* components/AnalogClock.jsx */
"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * theme selects the full UI variant:
 * "rail" | "bauhaus" | "rings" | "astral" | "disc" | "compass" | "offset"
 *
 * Back-compat aliases:
 *   classic/minimal/royal -> rail
 *   neon/matrix           -> astral
 *   glass/sunset          -> bauhaus
 *   sector                -> rings
 */

const LEGACY_THEME_ALIAS = {
  classic: "rail",
  minimal: "bauhaus",
  royal: "rings",
  neon: "astral",
  matrix: "disc",
  glass: "compass",
  sunset: "offset",
};

function normalizeVariant(theme) {
  const list = [
    "rail",
    "bauhaus",
    "rings",
    "astral",
    "disc",
    "compass",
    "offset",
  ];
  return list.includes(theme) ? theme : LEGACY_THEME_ALIAS[theme] || "rail";
}

/* ---------------- Mounted (hydration guard) ---------------- */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/* ---------------- Time hook (no conditional calls) ---------------- */
function useZonedTime({ timeZone, smooth, active }) {
  // Always create state so hook order is stable
  const [now, setNow] = useState(() => new Date());
  const raf = useRef(null);
  const interval = useRef(null);

  useEffect(() => {
    // only tick when active (after mount)
    if (!active) return;
    if (smooth) {
      const loop = () => {
        setNow(new Date());
        raf.current = requestAnimationFrame(loop);
      };
      raf.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf.current);
    } else {
      interval.current = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(interval.current);
    }
  }, [active, smooth]);

  // format separately to avoid formatToParts mapping issues in older browsers
  const { h, m, s, ms } = useMemo(() => {
    const fmtH = new Intl.DateTimeFormat("en-US", {
      hour12: false,
      hour: "2-digit",
      timeZone,
    });
    const fmtM = new Intl.DateTimeFormat("en-US", {
      minute: "2-digit",
      timeZone,
    });
    const fmtS = new Intl.DateTimeFormat("en-US", {
      second: "2-digit",
      timeZone,
    });
    const hh = parseInt(fmtH.format(now), 10);
    const mm = parseInt(fmtM.format(now), 10);
    const ss = parseInt(fmtS.format(now), 10);
    return { h: hh, m: mm, s: ss, ms: now.getMilliseconds() };
  }, [now, timeZone]);

  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return { h, m, s, ms, hh, mm, ss };
}

/* ---------------- Shared dial bits ---------------- */
function Ticks({
  cx,
  cy,
  r,
  major = 12,
  minor = 60,
  colorMajor = "#0f172a",
  colorMinor = "#94a3b8",
  lenMajor = 8,
  lenMinor = 4,
  swMajor = 2.2,
  swMinor = 1.2,
  inset = 2,
}) {
  const majors = Array.from({ length: major }, (_, i) => i);
  const minors = Array.from({ length: minor }, (_, i) => i);
  return (
    <>
      {minors.map((i) => {
        const a = (((i * 360) / minor) * Math.PI) / 180;
        const r1 = r - inset;
        const x1 = cx + r1 * Math.cos(a);
        const y1 = cy + r1 * Math.sin(a);
        const x2 = cx + (r1 - lenMinor) * Math.cos(a);
        const y2 = cy + (r1 - lenMinor) * Math.sin(a);
        const isMajor = i % (minor / major) === 0;
        if (isMajor) return null;
        return (
          <line
            key={`n${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={colorMinor}
            strokeWidth={swMinor}
            strokeLinecap="round"
          />
        );
      })}
      {majors.map((i) => {
        const a = (((i * 360) / major) * Math.PI) / 180;
        const r1 = r - inset;
        const x1 = cx + r1 * Math.cos(a);
        const y1 = cy + r1 * Math.sin(a);
        const x2 = cx + (r1 - lenMajor) * Math.cos(a);
        const y2 = cy + (r1 - lenMajor) * Math.sin(a);
        return (
          <line
            key={`m${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={colorMajor}
            strokeWidth={swMajor}
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

function Numbers({ cx, cy, r, color = "#0f172a", fontSize = 6, offset = 14 }) {
  const nums = Array.from({ length: 12 }, (_, i) => i + 1);
  return nums.map((n, i) => {
    const a = (((i + 1) * 30 - 90) * Math.PI) / 180;
    const x = cx + (r - offset) * Math.cos(a);
    const y = cy + (r - offset) * Math.sin(a) + fontSize / 3;
    return (
      <text
        key={n}
        x={x}
        y={y}
        textAnchor="middle"
        fontFamily="ui-sans, system-ui, -apple-system, Segoe UI, Roboto"
        fontSize={fontSize}
        fill={color}
      >
        {n}
      </text>
    );
  });
}

/* ---------------- Deterministic RNG (for Astral) ---------------- */
function makeSeededRand(seedStr = "x") {
  let t = 0;
  for (let i = 0; i < seedStr.length; i++)
    t = (t * 31 + seedStr.charCodeAt(i)) | 0;
  return () => {
    t = (1103515245 * t + 12345) & 0x7fffffff;
    return t / 0x7fffffff;
  };
}

/* ---------------- VARIANTS (7 distinct) ---------------- */

// 1) Rail — Swiss rail style
function FaceRail({ hAng, mAng, sAng, size }) {
  const vb = 100,
    cx = 50,
    cy = 50,
    r = 46;
  return (
    <svg
      viewBox={`0 0 ${vb} ${vb}`}
      width={size}
      height={size}
      className="bg-white rounded-full border border-slate-300 shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
    >
      <circle cx={cx} cy={cy} r={r} fill="#fff" />
      <Ticks
        cx={cx}
        cy={cy}
        r={r}
        colorMajor="#0f172a"
        colorMinor="#cbd5e1"
        lenMajor={9}
        lenMinor={5}
        swMajor={2.6}
        swMinor={1.4}
      />
      <g transform={`rotate(${hAng} ${cx} ${cy})`}>
        <rect
          x={cx - 1.8}
          y={cy - 22}
          width="3.6"
          height="22"
          rx="1.8"
          fill="#0f172a"
        />
      </g>
      <g transform={`rotate(${mAng} ${cx} ${cy})`}>
        <rect
          x={cx - 1.5}
          y={cy - 30}
          width="3"
          height="30"
          rx="1.5"
          fill="#0f172a"
        />
      </g>
      <g transform={`rotate(${sAng} ${cx} ${cy})`}>
        <rect x={cx - 0.8} y={cy - 34} width="1.6" height="34" fill="#ef4444" />
        <circle cx={cx} cy={cy - 34} r="3.8" fill="#ef4444" />
      </g>
      <circle cx={cx} cy={cy} r="2.3" fill="#0f172a" />
    </svg>
  );
}

// 2) Bauhaus — geometric wedges + numerals
function FaceBauhaus({ hAng, mAng, sAng, size }) {
  const vb = 100,
    cx = 50,
    cy = 50,
    r = 46;
  return (
    <svg
      viewBox={`0 0 ${vb} ${vb}`}
      width={size}
      height={size}
      className="rounded-[28px] bg-amber-50 border border-amber-200 shadow-[0_30px_80px_rgba(245,158,11,0.2)]"
    >
      <defs>
        <filter id="soft">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="#fff7ed" />
      <Numbers cx={cx} cy={cy} r={r} color="#334155" fontSize={7} offset={13} />
      <Ticks
        cx={cx}
        cy={cy}
        r={r}
        colorMajor="#475569"
        colorMinor="#e2e8f0"
        lenMajor={7}
        lenMinor={3}
        swMajor={2}
        swMinor={1}
      />
      <g transform={`rotate(${hAng} ${cx} ${cy})`}>
        <path
          d={`M ${cx} ${cy} L ${cx - 4} ${cy - 4} L ${cx} ${cy - 24} L ${
            cx + 4
          } ${cy - 4} Z`}
          fill="#0ea5e9"
          filter="url(#soft)"
        />
      </g>
      <g transform={`rotate(${mAng} ${cx} ${cy})`}>
        <path
          d={`M ${cx} ${cy} L ${cx - 3} ${cy - 6} L ${cx} ${cy - 34} L ${
            cx + 3
          } ${cy - 6} Z`}
          fill="#10b981"
        />
      </g>
      <g transform={`rotate(${sAng} ${cx} ${cy})`}>
        <rect x={cx - 0.9} y={cy - 36} width="1.8" height="36" fill="#f43f5e" />
        <circle cx={cx} cy={cy} r="2.2" fill="#f43f5e" />
      </g>
    </svg>
  );
}

// 3) Rings — HALO (concentric sweep halos with endpoints + mini readout)
function FaceRings({ hFrac, mFrac, sFrac, size }) {
  const vb = 100,
    cx = 50,
    cy = 50,
    r = 46;

  // radii and widths for H/M/S
  const RH = r - 2; // hour radius
  const RM = r - 16; // minute radius
  const RS = r - 30; // second radius
  const WH = 10,
    WM = 8,
    WS = 6;

  // utility for circumference + stroke dash
  const C = (rr) => 2 * Math.PI * rr;
  const dashSetup = (frac, rr) => {
    const c = C(rr);
    return {
      dashArray: c,
      dashOffset: c * (1 - Math.max(0, Math.min(1, frac))),
    };
  };

  // endpoint (cap) position at 12 o’clock origin
  const angleToXY = (deg, rr) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  };
  const [hx, hy] = angleToXY(hFrac * 360, RH);
  const [mx, my] = angleToXY(mFrac * 360, RM);
  const [sx, sy] = angleToXY(sFrac * 360, RS);

  const H = dashSetup(hFrac, RH);
  const M = dashSetup(mFrac, RM);
  const S = dashSetup(sFrac, RS);

  return (
    <svg
      viewBox={`0 0 ${vb} ${vb}`}
      width={size}
      height={size}
      className="bg-transparent"
    >
      <defs>
        <linearGradient id="haloH" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
        <linearGradient id="haloM" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
        <linearGradient id="haloS" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>
        <filter id="haloGlowH">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="haloGlowM">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="haloGlowS">
          <feGaussianBlur stdDeviation="0.9" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* background */}
      <circle cx={cx} cy={cy} r={r} fill="#0b1220" />
      {/* subtle grid (static) */}
      <g opacity="0.06" stroke="#e5e7eb">
        <circle cx={cx} cy={cy} r={r - 8} fill="none" />
        <circle cx={cx} cy={cy} r={r - 22} fill="none" />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} />
      </g>

      {/* tracks */}
      <g strokeLinecap="round" fill="none">
        <circle cx={cx} cy={cy} r={RH} stroke="#0f172a" strokeWidth={WH} />
        <circle cx={cx} cy={cy} r={RM} stroke="#0f172a" strokeWidth={WM} />
        <circle cx={cx} cy={cy} r={RS} stroke="#0f172a" strokeWidth={WS} />
      </g>

      {/* progress sweeps using dasharray; rotate so 0 starts at 12 o'clock */}
      <g
        transform={`rotate(-90 ${cx} ${cy})`}
        strokeLinecap="round"
        fill="none"
      >
        <circle
          cx={cx}
          cy={cy}
          r={RH}
          stroke="url(#haloH)"
          strokeWidth={WH}
          strokeDasharray={H.dashArray}
          strokeDashoffset={H.dashOffset}
          filter="url(#haloGlowH)"
        />
        <circle
          cx={cx}
          cy={cy}
          r={RM}
          stroke="url(#haloM)"
          strokeWidth={WM}
          strokeDasharray={M.dashArray}
          strokeDashoffset={M.dashOffset}
          filter="url(#haloGlowM)"
        />
        <circle
          cx={cx}
          cy={cy}
          r={RS}
          stroke="url(#haloS)"
          strokeWidth={WS}
          strokeDasharray={S.dashArray}
          strokeDashoffset={S.dashOffset}
          filter="url(#haloGlowS)"
        />
      </g>

      {/* endpoints (glowing caps) */}
      <circle cx={hx} cy={hy} r="2.8" fill="#38bdf8" />
      <circle cx={mx} cy={my} r="2.2" fill="#22d3ee" />
      <circle cx={sx} cy={sy} r="1.8" fill="#a5b4fc" />

      {/* center hub + compact readout */}
      <g>
        <circle cx={cx} cy={cy} r="10" fill="#0b1220" stroke="#1f2937" />
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          fontFamily="ui-mono,monospace"
          fontSize="7"
          fill="#93c5fd"
        >
          HALO
        </text>
        <text
          x={cx}
          y={cy + 7}
          textAnchor="middle"
          fontFamily="ui-mono,monospace"
          fontSize="5"
          fill="#94a3b8"
        >
          {String(Math.floor(hFrac * 12) % 12).padStart(2, "0")}:
          {String(Math.floor(mFrac * 60)).padStart(2, "0")}
        </text>
      </g>

      {/* tiny legend */}
      <g
        fontFamily="ui-sans,system-ui"
        fontSize="3.5"
        fill="#e5e7eb"
        opacity="0.7"
      >
        <text x={cx + 27} y={cy - RH + 6}>
          H
        </text>
        <text x={cx + 27} y={cy - RM + 4}>
          M
        </text>
        <text x={cx + 27} y={cy - RS + 2}>
          S
        </text>
      </g>
    </svg>
  );
}

// 4) Astral — deterministic star field, comet seconds
function FaceAstral({ hAng, mAng, sAng, size, seed }) {
  const vb = 100,
    cx = 50,
    cy = 50,
    r = 46;
  const rand = makeSeededRand(seed);
  const stars = Array.from({ length: 28 }, (_, i) => {
    const a = rand() * 2 * Math.PI;
    const rr = 8 + rand() * (r - 14);
    const x = cx + rr * Math.cos(a);
    const y = cy + rr * Math.sin(a);
    const rad = rand() * 0.7 + 0.3;
    return (
      <circle key={i} cx={x} cy={y} r={rad} fill="#e5e7eb" opacity="0.8" />
    );
  });
  return (
    <svg
      viewBox={`0 0 ${vb} ${vb}`}
      width={size}
      height={size}
      className="rounded-full bg-slate-950 border border-slate-800 shadow-[0_35px_100px_rgba(15,23,42,0.6)]"
    >
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <filter id="blur2">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="#0b1220" />
      {stars}
      <Ticks
        cx={cx}
        cy={cy}
        r={r}
        colorMajor="#475569"
        colorMinor="rgba(148,163,184,0.3)"
        lenMajor={10}
        lenMinor={0}
        swMajor={1.6}
        swMinor={0}
        inset={4}
      />
      <g transform={`rotate(${hAng} ${cx} ${cy})`}>
        <rect
          x={cx - 2.2}
          y={cy - 20}
          width="4.4"
          height="20"
          rx="2"
          fill="url(#g1)"
        />
      </g>
      <g transform={`rotate(${mAng} ${cx} ${cy})`}>
        <rect
          x={cx - 1.6}
          y={cy - 30}
          width="3.2"
          height="30"
          rx="1.6"
          fill="#e5e7eb"
        />
      </g>
      <g transform={`rotate(${sAng} ${cx} ${cy})`}>
        <path
          d={`M ${cx} ${cy + 4} L ${cx} ${cy - 34}`}
          stroke="#60a5fa"
          strokeWidth="1.6"
        />
        <circle
          cx={cx}
          cy={cy - 34}
          r="3.2"
          fill="#60a5fa"
          filter="url(#blur2)"
        />
        <circle cx={cx} cy={cy - 34} r="1.7" fill="#93c5fd" />
      </g>
      <circle cx={cx} cy={cy} r="2.4" fill="#e5e7eb" />
    </svg>
  );
}

// 5) Disc — rotating discs + pointer window
function FaceDisc({ hAng, mAng, sAng, size }) {
  const vb = 100,
    cx = 50,
    cy = 50,
    r = 46;
  return (
    <svg
      viewBox={`0 0 ${vb} ${vb}`}
      width={size}
      height={size}
      className="rounded-[20px] bg-white border border-slate-200 shadow-[0_18px_60px_rgba(0,0,0,0.08)]"
    >
      <defs>
        <clipPath id="window">
          <path
            d={`M ${cx - 12} ${
              cy - 46
            } h 24 a 6 6 0 0 1 6 6 v 10 h -36 v -10 a 6 6 0 0 1 6 -6 z`}
          />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="#f8fafc" />
      <g transform={`rotate(${hAng} ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={30} fill="#e2e8f0" />
        <text
          x={cx}
          y={cy - 28}
          textAnchor="middle"
          fontSize="6"
          fill="#0f172a"
          fontFamily="ui-mono,monospace"
        >
          HOUR
        </text>
      </g>
      <g transform={`rotate(${mAng} ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={22} fill="#cbd5e1" />
        <text
          x={cx}
          y={cy - 20}
          textAnchor="middle"
          fontSize="6"
          fill="#0f172a"
          fontFamily="ui-mono,monospace"
        >
          MIN
        </text>
      </g>
      <g transform={`rotate(${sAng} ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={14} fill="#94a3b8" />
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          fontSize="6"
          fill="#0f172a"
          fontFamily="ui-mono,monospace"
        >
          SEC
        </text>
      </g>
      <g clipPath="url(#window)">
        <rect x={cx - 20} y={cy - 48} width="40" height="18" fill="white" />
        <rect x={cx - 20} y={cy - 30} width="40" height="3" fill="#e5e7eb" />
      </g>
      <path d={`M ${cx} ${cy - 46} l -4 8 h 8 z`} fill="#ef4444" />
      <circle cx={cx} cy={cy} r="2.2" fill="#0f172a" />
      <Ticks
        cx={cx}
        cy={cy}
        r={r}
        colorMajor="#64748b"
        colorMinor="#e5e7eb"
        lenMajor={8}
        lenMinor={4}
        swMajor={1.6}
        swMinor={1}
        inset={3}
      />
    </svg>
  );
}

// 6) Compass — cardinal markers + needle hands
function FaceCompass({ hAng, mAng, sAng, size }) {
  const vb = 100,
    cx = 50,
    cy = 50,
    r = 46;
  const cardinals = [
    { t: "N", a: -90 },
    { t: "E", a: 0 },
    { t: "S", a: 90 },
    { t: "W", a: 180 },
  ];
  const label = (txt, ang, rr = r - 10) => {
    const a = (ang * Math.PI) / 180;
    const x = cx + rr * Math.cos(a);
    const y = cy + rr * Math.sin(a) + 3;
    return (
      <text
        key={txt}
        x={x}
        y={y}
        textAnchor="middle"
        fontFamily="ui-sans,system-ui"
        fontSize="8"
        fill="#0f172a"
      >
        {txt}
      </text>
    );
  };
  return (
    <svg
      viewBox={`0 0 ${vb} ${vb}`}
      width={size}
      height={size}
      className="rounded-full bg-white border border-slate-300 shadow-[0_16px_60px_rgba(0,0,0,0.08)]"
    >
      <circle cx={cx} cy={cy} r={r} fill="#f8fafc" stroke="#cbd5e1" />
      <circle cx={cx} cy={cy} r={r - 8} fill="none" stroke="#e2e8f0" />
      <Ticks
        cx={cx}
        cy={cy}
        r={r}
        colorMajor="#0f172a"
        colorMinor="#94a3b8"
        lenMajor={10}
        lenMinor={4}
        swMajor={1.8}
        swMinor={1}
        inset={3}
      />
      {cardinals.map((c) => label(c.t, c.a))}
      <g transform={`rotate(${hAng} ${cx} ${cy})`}>
        <path
          d={`M ${cx} ${cy} L ${cx - 2} ${cy - 2} L ${cx} ${cy - 22} L ${
            cx + 2
          } ${cy - 2} Z`}
          fill="#111827"
        />
      </g>
      <g transform={`rotate(${mAng} ${cx} ${cy})`}>
        <path
          d={`M ${cx} ${cy} L ${cx - 1.8} ${cy - 3} L ${cx} ${cy - 32} L ${
            cx + 1.8
          } ${cy - 3} Z`}
          fill="#334155"
        />
      </g>
      <g transform={`rotate(${sAng} ${cx} ${cy})`}>
        <rect x={cx - 0.8} y={cy - 34} width="1.6" height="34" fill="#dc2626" />
        <circle cx={cx} cy={cy - 34} r="2.2" fill="#dc2626" />
        <rect
          x={cx - 0.6}
          y={cy}
          width="1.2"
          height="8"
          fill="#dc2626"
          opacity="0.8"
        />
      </g>
      <circle cx={cx} cy={cy} r="2.4" fill="#111827" />
    </svg>
  );
}

// 7) Offset — asymmetric dial with cut arc + dot hour markers
function FaceOffset({ hAng, mAng, sAng, size }) {
  const vb = 100,
    cx = 50,
    cy = 50,
    r = 46;
  const dots = Array.from({ length: 12 }, (_, i) => {
    const a = ((i * 30 - 90) * Math.PI) / 180;
    const rr = r - (i % 3 === 0 ? 6 : 10);
    const x = cx + rr * Math.cos(a);
    const y = cy + rr * Math.sin(a);
    return (
      <circle
        key={i}
        cx={x}
        cy={y}
        r={i % 3 === 0 ? 2.3 : 1.6}
        fill={i % 3 === 0 ? "#0f172a" : "#94a3b8"}
      />
    );
  });
  return (
    <svg
      viewBox={`0 0 ${vb} ${vb}`}
      width={size}
      height={size}
      className="rounded-[24px] bg-white border border-slate-200 shadow-[0_22px_70px_rgba(0,0,0,0.08)]"
    >
      <path
        d={`M ${cx - r + 6} ${cy} A ${r - 6} ${r - 6} 0 1 1 ${
          cx + r - 6
        } ${cy}`}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={r - 16} fill="#f8fafc" />
      {dots}
      <g transform={`rotate(${hAng} ${cx} ${cy})`}>
        <rect
          x={cx - 2.4}
          y={cy - 20}
          width="4.8"
          height="20"
          rx="2.4"
          fill="#111827"
        />
      </g>
      <g transform={`rotate(${mAng} ${cx} ${cy})`}>
        <rect
          x={cx - 1.6}
          y={cy - 32}
          width="3.2"
          height="32"
          rx="1.6"
          fill="#334155"
        />
      </g>
      <g transform={`rotate(${sAng} ${cx} ${cy})`}>
        <line
          x1={cx}
          y1={cy + 6}
          x2={cx}
          y2={cy - 34}
          stroke="#ef4444"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>
      <circle cx={cx} cy={cy} r="2.2" fill="#111827" />
    </svg>
  );
}

/* ---------------- Main component (hooks always first, no early return) ---------------- */
export default function AnalogClock({
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  theme = "rail",
  size = 200,
  smooth = true,
  showLabel = true,
}) {
  // Hooks RUN EVERY RENDER, in the same order
  const mounted = useMounted();
  const variant = normalizeVariant(theme);
  const { h, m, s, ms, hh, mm, ss } = useZonedTime({
    timeZone,
    smooth,
    active: mounted, // timers only after mount
  });

  // Compute angles regardless (values won’t tick until mounted)
  const sec = s + (smooth ? ms / 1000 : 0);
  const min = m + sec / 60;
  const hr12 = (h % 12) + min / 60;
  const hAng = hr12 * 30;
  const mAng = min * 6;
  const sAng = sec * 6;

  const hFrac = hr12 / 12;
  const mFrac = min / 60;
  const sFrac = sec / 60;

  const faces = {
    rail: <FaceRail hAng={hAng} mAng={mAng} sAng={sAng} size={size} />,
    bauhaus: <FaceBauhaus hAng={hAng} mAng={mAng} sAng={sAng} size={size} />,
    rings: <FaceRings hFrac={hFrac} mFrac={mFrac} sFrac={sFrac} size={size} />,
    astral: (
      <FaceAstral
        hAng={hAng}
        mAng={mAng}
        sAng={sAng}
        size={size}
        seed={String(timeZone)}
      />
    ),
    disc: <FaceDisc hAng={hAng} mAng={mAng} sAng={sAng} size={size} />,
    compass: <FaceCompass hAng={hAng} mAng={mAng} sAng={sAng} size={size} />,
    offset: <FaceOffset hAng={hAng} mAng={mAng} sAng={sAng} size={size} />,
  };

  // On the server / before mount: render a stable placeholder to avoid hydration mismatch
  const body = mounted ? (
    faces[variant] || faces.rail
  ) : (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-white/50 border border-slate-200"
    />
  );

  return (
    <div className="inline-flex flex-col items-center">
      {body}
      {showLabel && (
        <div className="mt-2 text-xs text-slate-500" suppressHydrationWarning>
          {mounted
            ? new Intl.DateTimeFormat(undefined, {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
                timeZone,
              }).format(new Date()) + ` — ${hh}:${mm}:${ss}`
            : "\u00A0"}
        </div>
      )}
    </div>
  );
}
