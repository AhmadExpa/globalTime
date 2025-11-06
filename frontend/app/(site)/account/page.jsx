"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

// Account Dashboard — Full Dark Mode + Glow Text
// JSX only. Tailwind classes. No external UI libs.

export default function AccountDashboard() {
  const router = useRouter();
  const { user, requestUpgrade, savePreferences, logout } = useAuth();

  const [clockType, setClockType] = useState("analog");
  const [theme, setTheme] = useState("classic");
  const [activeTab, setActiveTab] = useState("overview");
  const [msg, setMsg] = useState("");

  // Redirect admins
  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") router.replace("/admin/users");
  }, [user, router]);

  // Load prefs
  useEffect(() => {
    if (!user) return;
    setClockType(user.preferredClockType || "analog");
    setTheme(user.preferredTheme || "classic");
  }, [user]);

  if (!user) return <div className="min-h-[60vh] grid place-items-center text-slate-400">Please log in.</div>;
  if (user.role === "admin") return null;

  const caps = user.role === "pro"
    ? { clocks: 4, events: 4, timers: Infinity }
    : { clocks: 2, events: 2, timers: 2 };

  const timersLabel = caps.timers === Infinity ? "Unlimited" : String(caps.timers);

  // Example usage (replace with real counts from your app if available)
  const usage = useMemo(() => ({
    clocks: Math.min(1, caps.clocks),
    events: Math.min(1, caps.events),
    timers: user.role === "pro" ? 7 : 1,
  }), [caps.clocks, caps.events, user.role]);

  async function onSavePrefs() {
    const ok = await savePreferences(clockType, theme);
    setMsg(ok ? "Preferences saved" : "Save failed");
    setTimeout(() => setMsg(""), 1800);
  }

  async function onRequestUpgrade() {
    const ok = await requestUpgrade();
    setMsg(ok ? "Upgrade request sent to admin" : "Request failed");
    setTimeout(() => setMsg(""), 2200);
  }

  function doLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        {/* Header */}
        <header className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0d1220] shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex items-start gap-4">
              <Avatar email={user.email} />
              <div>
                <p className="text-xs uppercase tracking-wider text-sky-400">Account</p>
                <h1 className="mt-1 text-2xl font-semibold text-sky-300 md:text-3xl glow-text">
                  Hello, <span className="text-sky-400">{user.email}</span>
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <RoleBadge role={user.role} />
                  <span className="text-xs text-slate-400">Manage preferences, limits, and plan.</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/help" className="btn-subtle">Help</Link>
              <button onClick={doLogout} className="btn-primary">Logout</button>
            </div>
          </div>
        </header>

        {/* Layout */}
        <div className="mt-8 grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="space-y-6">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-sky-400">Your Plan</h3>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">Current</span>
                <span className="rounded-full border border-sky-700 bg-slate-900 px-2 py-1 text-xs text-sky-300">
                  {user.role === "pro" ? "Pro" : "Free"}
                </span>
              </div>
              <div className="mt-4 space-y-4">
                <Usage label="Personal Clocks" value={usage.clocks} cap={caps.clocks} />
                <Usage label="Events / Countdowns" value={usage.events} cap={caps.events} />
                <Usage label="Timers" value={usage.timers} cap={caps.timers} unlimitedLabel="Unlimited" />
              </div>
              {user.role === "free" ? (
                <button onClick={onRequestUpgrade} className="btn-primary mt-5 w-full">Request Upgrade</button>
              ) : (
                <div className="mt-5 rounded-xl border border-emerald-700 bg-emerald-900 px-3 py-2 text-xs text-emerald-300">You are on Pro. Enjoy unlimited timers.</div>
              )}
            </Card>

            <NavCard activeTab={activeTab} onChange={setActiveTab} />
            <Shortcuts />
          </aside>

          {/* Main */}
          <section className="space-y-6">
            {activeTab === "overview" && <Overview caps={caps} timersLabel={timersLabel} />}

            {activeTab === "preferences" && (
              <Card className="p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-sky-300 glow-text">Preferences</h2>
                  <span className="text-xs text-slate-400">Personalize your experience</span>
                </div>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium text-slate-200">Clock Type</div>
                    <div className="mt-2 flex gap-3 text-sm">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="ct" checked={clockType === "analog"} onChange={() => setClockType("analog")} />
                        <span>Analog</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="ct" checked={clockType === "digital"} onChange={() => setClockType("digital")} />
                        <span>Digital</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">Theme</div>
                    <select className="input mt-2 w-full" value={theme} onChange={(e) => setTheme(e.target.value)}>
                      {["classic", "neon", "minimal", "sunset", "matrix", "glass", "royal"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button onClick={onSavePrefs} className="btn-primary">Save Preferences</button>
                  {msg && <div className="text-sm text-sky-300">{msg}</div>}
                </div>
              </Card>
            )}

            {activeTab === "plan" && (
              <Card className="p-5 md:p-6">
                <h2 className="text-lg font-semibold text-sky-300 glow-text">Plan & Limits</h2>
                <p className="mt-1 text-sm text-slate-400">Compare what you have now with Pro.</p>
                <div className="mt-5 grid gap-3">
                  <PlanRow label="Personal Clocks" free="2" pro="4" />
                  <PlanRow label="Events / Countdowns" free="2" pro="4" />
                  <PlanRow label="Timers" free="2" pro="Unlimited" />
                </div>
                {user.role === "free" ? (
                  <button onClick={onRequestUpgrade} className="btn-primary mt-6">Request Upgrade</button>
                ) : (
                  <div className="mt-6 text-sm text-emerald-400">You're already on Pro.</div>
                )}
              </Card>
            )}
          </section>
        </div>
      </div>

      {/* Local styles for glow + buttons/inputs */}
      <style jsx>{`
        .glow-text { text-shadow: 0 0 6px rgba(56,189,248,.6), 0 0 12px rgba(99,102,241,.35); }
        .btn-primary {
          background: linear-gradient(90deg, #38bdf8, #6366f1);
          color: #fff; border-radius: .75rem; padding: .5rem 1rem; font-weight: 500;
          transition: transform .15s ease, box-shadow .2s ease;
        }
        .btn-primary:hover { box-shadow: 0 0 14px rgba(99,102,241,.55); transform: translateY(-1px); }
        .btn-subtle { background:#0b1222; color:#9aa4b2; border:1px solid #1f2a44; border-radius:.75rem; padding:.5rem 1rem; }
        .btn-subtle:hover { background:#0f1730; color:#c9d3df; }
        .input { background:#0f1730; color:#e2e8f0; border:1px solid #1f2a44; border-radius:.5rem; padding:.5rem; }
        .input:focus { outline: none; border-color:#38bdf8; box-shadow:0 0 0 3px rgba(56,189,248,.25); }
      `}</style>
    </div>
  );
}

/* ----------------- Components ----------------- */
function Card({ className = "", children }) {
  return (
    <div className={"rounded-2xl border border-slate-800 bg-[#0d1220] shadow-[0_8px_30px_rgba(0,0,0,0.6)] " + className}>
      {children}
    </div>
  );
}

function Avatar({ email }) {
  const letter = (email || "?").charAt(0).toUpperCase();
  return (
    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-xl font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
      {letter}
    </div>
  );
}

function RoleBadge({ role }) {
  const map = {
    free: { bg: "bg-slate-900", text: "text-slate-300", label: "Free Account" },
    pro: { bg: "bg-emerald-900", text: "text-emerald-300", label: "Pro Account" },
    admin: { bg: "bg-purple-900", text: "text-purple-300", label: "Admin" },
  };
  const s = map[role] || map.free;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${s.bg} ${s.text} border border-white/10`}>{s.label}</span>
  );
}

function Usage({ label, value, cap, unlimitedLabel }) {
  const isUnlimited = cap === Infinity;
  const pct = isUnlimited ? 100 : Math.min(100, Math.round((value / cap) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span>{isUnlimited ? `${value} / ${unlimitedLabel || "Unlimited"}` : `${value} / ${cap}`}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500" style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}

function NavCard({ activeTab, onChange }) {
  const items = [
    { id: "overview", label: "Overview" },
    { id: "preferences", label: "Preferences" },
    { id: "plan", label: "Plan & Limits" },
  ];
  return (
    <Card className="p-2">
      <nav className="flex flex-col">
        {items.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`text-left rounded-xl px-3 py-2 text-sm transition ${activeTab === t.id ? "bg-sky-950 text-sky-300" : "text-slate-300 hover:bg-slate-900"}`}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </Card>
  );
}

function Shortcuts() {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-sky-400">Quick Shortcuts</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-300">
        <li><Link className="text-sky-400 hover:text-sky-300" href="/personalize">Personal Clocks</Link></li>
        <li><Link className="text-sky-400 hover:text-sky-300" href="/events">Events / Countdowns</Link></li>
        <li><Link className="text-sky-400 hover:text-sky-300" href="/timers">Timers</Link></li>
        <li><Link className="text-sky-400 hover:text-sky-300" href="/settings/security">Security</Link></li>
      </ul>
    </Card>
  );
}

function Overview({ caps, timersLabel }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Personal Clocks" value={`${caps.clocks}`} href="/personalize" />
        <StatCard title="Events / Countdowns" value={`${caps.events}`} href="/events" />
        <StatCard title="Timers" value={timersLabel} href="/timers" />
      </div>
      <Card className="p-5 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-sky-300 glow-text">What’s included</h2>
          <Link href="/docs/limits" className="text-xs text-sky-400 hover:text-sky-300">See details</Link>
        </div>
        <div className="mt-4 grid gap-2 text-sm">
          <PlanRow label="Personal Clocks" free="2" pro="4" />
          <PlanRow label="Events / Countdowns" free="2" pro="4" />
          <PlanRow label="Timers" free="2" pro="Unlimited" />
        </div>
      </Card>
    </>
  );
}

function StatCard({ title, value, href }) {
  return (
    <Link href={href} className="group block rounded-2xl border border-slate-800 bg-[#0d1220] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition hover:shadow-[0_16px_50px_rgba(0,0,0,0.9)]">
      <div className="text-xs uppercase tracking-wide text-sky-400">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-sky-200 glow-text">{value}</div>
      <div className="mt-2 inline-flex items-center gap-2 text-xs text-sky-400">
        Open
        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none">
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    </Link>
  );
}

function PlanRow({ label, free, pro }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
      <div className="text-slate-100">{label}</div>
      <div className="flex items-center gap-3 text-xs">
        <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-200 border border-slate-700">Free: {free}</span>
        <span className="rounded-full bg-emerald-900 px-2 py-1 text-emerald-200 border border-emerald-700">Pro: {pro}</span>
      </div>
    </div>
  );
}
