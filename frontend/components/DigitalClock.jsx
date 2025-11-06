/* components/DigitalClock.jsx */
"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Single input: `theme`
 * The mapping below decides BOTH layout (variant) and palette.
 *
 * Themes → { variant, palette }
 *  classic → tiles / light
 *  minimal → line  / light
 *  royal   → segment / light
 *  neon    → glow  / dark
 *  matrix  → flip  / dark
 *  glass   → capsule / pastel
 *  sunset  → dot   / pastel
 *
 * Notes:
 * - `variant` prop is intentionally ignored so theme fully controls the look.
 * - `seconds` toggles HH:mm vs HH:mm:ss.
 */

const THEME_PRESETS = {
  classic: { variant: "tiles",  palette: "light"  },
  minimal: { variant: "line",   palette: "light"  },
  royal:   { variant: "segment",palette: "light"  },
  neon:    { variant: "glow",   palette: "dark"   },
  matrix:  { variant: "flip",   palette: "dark"   },
  glass:   { variant: "capsule",palette: "pastel" },
  sunset:  { variant: "dot",    palette: "pastel" },
};

const FALLBACK = { variant: "tiles", palette: "light" };

/* -------- stable, SSR-friendly time hook -------- */
function useZonedTime(timeZone) {
  const [now, setNow] = useState(() => new Date());
  const tick = useRef(null);
  useEffect(() => {
    tick.current = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick.current);
  }, []);
  const fH = useMemo(() => new Intl.DateTimeFormat("en-US", { hour12: false, hour: "2-digit", timeZone }), [timeZone]);
  const fM = useMemo(() => new Intl.DateTimeFormat("en-US", { minute: "2-digit", timeZone }), [timeZone]);
  const fS = useMemo(() => new Intl.DateTimeFormat("en-US", { second: "2-digit", timeZone }), [timeZone]);
  return { h: fH.format(now), m: fM.format(now), s: fS.format(now) };
}

/* ---------- 7-segment SVG digit ---------- */
function SegmentDigit({ d, color }) {
  const ON = color || "#22d3ee";
  const OFF = "#1e293b";
  const map = {
    "0":[1,1,1,1,1,1,0],"1":[0,1,1,0,0,0,0],"2":[1,1,0,1,1,0,1],
    "3":[1,1,1,1,0,0,1],"4":[0,1,1,0,0,1,1],"5":[1,0,1,1,0,1,1],
    "6":[1,0,1,1,1,1,1],"7":[1,1,1,0,0,0,0],"8":[1,1,1,1,1,1,1],
    "9":[1,1,1,1,0,1,1]
  };
  const seg = map[d] || [0,0,0,0,0,0,0];
  return (
    <svg viewBox="0 0 54 96" className="w-12 h-20">
      <polygon points="10,6 44,6 38,12 16,12" fill={seg[0]?ON:OFF}/>
      <polygon points="44,6 48,10 48,44 42,38 42,12" fill={seg[1]?ON:OFF}/>
      <polygon points="42,52 48,58 48,92 44,90 42,84" fill={seg[2]?ON:OFF}/>
      <polygon points="10,90 44,90 38,84 16,84" fill={seg[3]?ON:OFF}/>
      <polygon points="6,52 12,58 12,84 10,90 6,86" fill={seg[4]?ON:OFF}/>
      <polygon points="6,10 10,6 12,12 12,38 6,44" fill={seg[5]?ON:OFF}/>
      <polygon points="12,48 42,48 36,54 18,54" fill={seg[6]?ON:OFF}/>
    </svg>
  );
}

/* ---------- 5×7 dot-matrix digit ---------- */
function DotDigit({ ch, on = "#0ea5e9", off = "rgba(148,163,184,0.15)" }) {
  const font = {
    "0":["01110","10001","10011","10101","11001","10001","01110"],
    "1":["00100","01100","00100","00100","00100","00100","01110"],
    "2":["01110","10001","00001","00010","00100","01000","11111"],
    "3":["11110","00001","00001","01110","00001","00001","11110"],
    "4":["00010","00110","01010","10010","11111","00010","00010"],
    "5":["11111","10000","11110","00001","00001","10001","01110"],
    "6":["00110","01000","10000","11110","10001","10001","01110"],
    "7":["11111","00001","00010","00100","01000","01000","01000"],
    "8":["01110","10001","10001","01110","10001","10001","01110"],
    "9":["01110","10001","10001","01111","00001","00010","01100"],
    ":":["00000","00100","00100","00000","00100","00100","00000"],
  };
  const rows = font[ch] || font["0"];
  const gap = 2, dot = 6;
  const w = 5 * dot + 4 * gap, h = 7 * dot + 6 * gap;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-auto">
      {rows.map((row, y) =>
        row.split("").map((px, x) => (
          <circle
            key={`${x}-${y}`}
            cx={x * (dot + gap) + dot / 2}
            cy={y * (dot + gap) + dot / 2}
            r={dot / 2}
            fill={px === "1" ? on : off}
          />
        ))
      )}
    </svg>
  );
}

export default function DigitalClock({
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  theme = "classic",       // single source of truth
  // variant is intentionally ignored to keep mapping strict
  variant,                 // kept only for backward compatibility (ignored)
  seconds = true,
}) {
  const { h, m, s } = useZonedTime(timeZone);
  const str = seconds ? `${h}:${m}:${s}` : `${h}:${m}`;
  const tz = Intl.DateTimeFormat(undefined, { timeZoneName: "short", timeZone }).format(new Date());

  const preset = THEME_PRESETS[theme] || FALLBACK;
  const { variant: v, palette } = preset;

  // palettes
  const light  = "bg-white text-slate-900 border-slate-300";
  const dark   = "bg-slate-900 text-cyan-200 border-slate-800";
  const pastel = "bg-rose-50 text-slate-900 border-rose-200";
  const base   = palette === "dark" ? dark : palette === "pastel" ? pastel : light;
  const accent = palette === "dark" ? "text-cyan-300" : "text-sky-600";

  /* ---------------- tiles (classic) ---------------- */
  if (v === "tiles") {
    const tileBg =
      palette === "dark" ? "bg-white/5 border-white/10"
      : palette === "pastel" ? "bg-white/70 border-black/10"
      : "bg-slate-50 border-slate-200";
    return (
      <div className={`flex gap-2 ${base} border rounded-2xl p-2 shadow-[0_18px_60px_rgba(0,0,0,0.08)]`}>
        {str.split("").map((c, i) => (
          <div key={i} className={`min-w-12 h-16 grid place-items-center rounded-xl border ${tileBg}`}>
            <span className="font-mono text-3xl" suppressHydrationWarning>{c}</span>
          </div>
        ))}
        <div className="self-end text-[10px] opacity-60 pl-1 pb-1">{tz}</div>
      </div>
    );
  }

  /* ---------------- line (minimal) ---------------- */
  if (v === "line") {
    return (
      <div className={`text-center ${base} border rounded-xl px-4 py-3`}>
        <div className="font-mono text-4xl tracking-tight inline-block" suppressHydrationWarning>
          {str}
        </div>
        <div className="h-1 mt-2 rounded bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300" />
        <div className="text-[11px] opacity-60 mt-1">{tz}</div>
      </div>
    );
  }

  /* ---------------- segment (royal) ---------------- */
  if (v === "segment") {
    const chars = str.padEnd(seconds ? 8 : 5).split("");
    const segColor = palette === "dark" ? "#22d3ee" : "#0284c7";
    return (
      <div className={`inline-flex items-center gap-2 border rounded-xl px-4 py-3 ${base}`}>
        <SegmentDigit d={chars[0]} color={segColor} />
        <SegmentDigit d={chars[1]} color={segColor} />
        <div className="text-4xl font-mono" suppressHydrationWarning>:</div>
        <SegmentDigit d={chars[3]} color={segColor} />
        <SegmentDigit d={chars[4]} color={segColor} />
        {seconds && <>
          <div className="text-4xl font-mono" suppressHydrationWarning>:</div>
          <SegmentDigit d={chars[6]} color={segColor} />
          <SegmentDigit d={chars[7]} color={segColor} />
        </>}
      </div>
    );
  }

  /* ---------------- glow (neon) ---------------- */
  if (v === "glow") {
    return (
      <div className={`rounded-2xl border p-6 text-center ${base} shadow-[0_30px_100px_rgba(0,0,0,0.4)]`}>
        <div className="text-5xl font-mono tracking-tight drop-shadow-[0_0_10px_rgba(34,211,238,0.7)] text-cyan-400" suppressHydrationWarning>
          {str}
        </div>
        <div className="text-xs opacity-70 mt-1">{tz}</div>
      </div>
    );
  }

  /* ---------------- flip (matrix) ---------------- */
  if (v === "flip") {
    return (
      <div className={`flex border ${base} rounded-xl shadow-[0_25px_70px_rgba(0,0,0,0.15)] overflow-hidden`}>
        {str.split("").map((c,i)=>(
          <div key={i} className="relative w-14 h-20 grid place-items-center border-r border-black/10 bg-black/5">
            <div className="absolute top-0 w-full h-1/2 bg-black/10 border-b border-black/20" />
            <div className="text-4xl font-mono" suppressHydrationWarning>{c}</div>
          </div>
        ))}
      </div>
    );
  }

  /* ---------------- capsule (glass) ---------------- */
  if (v === "capsule") {
    const parts = seconds ? [["HRS", h], ["MIN", m], ["SEC", s]] : [["HRS", h], ["MIN", m]];
    return (
      <div className={`flex items-stretch gap-2 ${base} border rounded-2xl p-2 shadow-[0_25px_70px_rgba(0,0,0,0.08)]`}>
        {parts.map(([lab,val])=>(
          <div key={lab} className="px-4 py-3 rounded-full bg-black/5 border border-black/10">
            <div className={`text-[10px] uppercase tracking-wider ${accent}`}>{lab}</div>
            <div className="font-mono text-3xl -mt-0.5" suppressHydrationWarning>{val}</div>
          </div>
        ))}
        <div className="ml-auto self-end text-[10px] opacity-60 pr-1">{tz}</div>
      </div>
    );
  }

  /* ---------------- dot (sunset) ---------------- */
  if (v === "dot") {
    return (
      <div className={`inline-flex items-center gap-2 border rounded-xl px-4 py-3 ${base}`}>
        {str.split("").map((c,i)=>(
          <DotDigit key={i} ch={c} on={palette==="dark"?"#22d3ee":"#0ea5e9"} />
        ))}
        <div className="text-[10px] opacity-60 ml-2">{tz}</div>
      </div>
    );
  }

  // hard fallback
  return (
    <div className={`rounded-2xl border p-4 text-center ${base}`}>
      <div className="text-3xl font-mono" suppressHydrationWarning>{str}</div>
      <div className="text-xs opacity-70 mt-1">{tz}</div>
    </div>
  );
}
