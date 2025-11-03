"use client";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Account() {
  const { user, requestUpgrade, savePreferences, logout } = useAuth();
  const [clockType, setClockType] = useState("analog");
  const [theme, setTheme] = useState("classic");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  // Redirect by role
  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") router.replace("/admin/users");
  }, [user, router]);

  useEffect(() => {
    if (user) {
      setClockType(user.preferredClockType || "analog");
      setTheme(user.preferredTheme || "classic");
    }
  }, [user]);

  // While redirecting or unauthenticated
  if (!user) return <div className="card">Please log in.</div>;
  if (user.role === "admin") return null; // pro users should see this page

  // Role caps for quick reference (no hook needed)
  const caps =
    user.role === "pro"
      ? { clocks: 4, events: 4, timers: Infinity }
      : { clocks: 2, events: 2, timers: 2 };

  const timersLabel = caps.timers === Infinity ? "Unlimited" : String(caps.timers);

  async function save() {
    const ok = await savePreferences(clockType, theme);
    setMsg(ok ? "Saved ✓" : "Failed");
    setTimeout(() => setMsg(""), 1500);
  }

  async function upgrade() {
    const ok = await requestUpgrade();
    setMsg(ok ? "Upgrade request sent to admin" : "Failed");
    setTimeout(() => setMsg(""), 2000);
  }

  return (
    <div className="space-y-6">
      {/* HERO / HEADER */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-blue-50 p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500">
              Account
            </div>
            <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-slate-900">
              Welcome back, <span className="text-sky-700">{user.email}</span>
            </h1>
            <div className="mt-2 inline-flex items-center gap-2">
              <RoleBadge role={user.role} />
              <span className="text-xs text-slate-500">
                Manage your preferences, theme, and upgrade options.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="btn-primary"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Subtle decorative background */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-100 blur-[60px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -bottom-16 h-44 w-44 rounded-full bg-blue-100 blur-[50px]"
        />
      </section>

      {/* QUICK CARDS */}
      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard
          title="Personal Clocks"
          value={`${caps.clocks}`}
          caption={`You can save up to ${caps.clocks} clock${caps.clocks === 1 ? "" : "s"}`}
          href="/personalize"
        />
        <InfoCard
          title="Events / Countdowns"
          value={`${caps.events}`}
          caption={`Create up to ${caps.events} event${caps.events === 1 ? "" : "s"}`}
          href="/events"
        />
        <InfoCard
          title="Timers"
          value={timersLabel}
          caption={
            caps.timers === Infinity
              ? "Create unlimited timers"
              : `Create up to ${caps.timers} timer${caps.timers === 1 ? "" : "s"}`
          }
          href="/timers"
        />
      </section>

      {/* MAIN GRID */}
      <section className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
        {/* Preferences */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Preferences</h2>
            <span className="text-xs text-slate-500">
              Personalize your experience
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700">
                Clock Type
              </div>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="ct"
                    checked={clockType === "analog"}
                    onChange={() => setClockType("analog")}
                  />
                  <span>Analog</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="ct"
                    checked={clockType === "digital"}
                    onChange={() => setClockType("digital")}
                  />
                  <span>Digital</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700">Theme</div>
              <select
                className="input"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                {["classic", "neon", "minimal", "sunset", "matrix", "glass", "royal"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={save} className="btn-primary">
              Save Preferences
            </button>
            {msg && <div className="text-sm">{msg}</div>}
          </div>
        </div>

        {/* Upgrade panel */}
        <div className="card">
          {user.role === "free" ? (
            <div className="badge">Upgrade to Pro</div>
          ) : (
            <h2 className="text-lg font-semibold">Upgraded Account (PRO)</h2>
          )}

          <p className="mt-1 text-sm text-slate-600">
            Get up to <strong>4 personal clocks</strong>,{" "}
            <strong>4 events</strong>, and <strong>unlimited timers</strong>.
          </p>

          <div className="mt-4 grid gap-2 text-sm">
            <FeatureLine label="Personal Clocks" free="2" pro="4" />
            <FeatureLine label="Events / Countdowns" free="2" pro="4" />
            <FeatureLine label="Timers" free="2" pro="Unlimited" />
          </div>

          {user.role === "free" ? (
            <>
              <button onClick={upgrade} className="btn-primary mt-4">
                Request Upgrade
              </button>
              <div className="mt-4 text-xs text-slate-500">
                Admin reviews your request in the Requests panel.
              </div>
            </>
          ) : (
            <div className="badge mt-4">You are already Pro</div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- Small UI helpers (inline to keep it drop-in) ---------- */

function RoleBadge({ role }) {
  const styles =
    {
      free: "bg-slate-100 text-slate-700",
      pro: "bg-emerald-100 text-emerald-700",
      admin: "bg-purple-100 text-purple-700",
    }[role] || "bg-slate-100 text-slate-700";

  const text =
    role === "free" ? "Free Account" : role === "pro" ? "Pro Account" : "Admin";
  return <span className={`badge ${styles}`}>{text}</span>;
}

function InfoCard({ title, value, caption, href }) {
  return (
    <Link
      href={href}
      className="card group transition hover:shadow-[0_24px_64px_rgba(0,0,0,0.08)]"
    >
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-3xl font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{caption}</div>
      <div className="mt-3 inline-flex items-center gap-2 text-xs text-sky-700">
        Open
        <svg
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    </Link>
  );
}

function FeatureLine({ label, free, pro }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
      <div className="text-slate-700">{label}</div>
      <div className="flex items-center gap-3 text-xs">
        <span className="badge bg-slate-100 text-slate-700">Free: {free}</span>
        <span className="badge bg-emerald-100 text-emerald-700">
          Pro: {pro}
        </span>
      </div>
    </div>
  );
}
