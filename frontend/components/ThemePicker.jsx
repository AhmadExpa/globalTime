/* components/ThemePicker.jsx */
"use client";
const THEMES = ["classic", "neon", "minimal", "sunset", "matrix", "glass", "royal"];

export default function ThemePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
      {THEMES.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`capitalize border rounded-xl px-3 py-2 text-xs transition ${
            value === t
              ? "border-sky-500 ring-2 ring-sky-300/60 bg-sky-50"
              : "border-slate-300 bg-white hover:bg-slate-50"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
