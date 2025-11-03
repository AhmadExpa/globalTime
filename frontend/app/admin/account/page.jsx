"use client";
import { useEffect, useState } from "react";
import { adminUpdateAccount } from "../../../lib/api";
import { useAuth } from "../../context/AuthContext"; // same hook you use in admin pages

export default function AdminAccountPage() {
  const { token, user } = useAuth();

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", tone: "neutral" });

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  if (!user || user.role !== "admin") {
    return <div className="rounded-xl border border-slate-200 bg-white/70 p-6">Forbidden</div>;
  }

  function showToast(msg, tone = "neutral") {
    setToast({ open: true, msg, tone });
    setTimeout(() => setToast({ open: false, msg: "", tone: "neutral" }), 3500);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!email && !newPassword) {
      showToast("Nothing to update.", "error");
      return;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        showToast("Password must be at least 8 characters.", "error");
        return;
      }
      if (newPassword !== confirm) {
        showToast("Passwords do not match.", "error");
        return;
      }
      if (!currentPassword) {
        showToast("Current password is required to change your password.", "error");
        return;
      }
    }

    try {
      setLoading(true);
      await adminUpdateAccount(token, {
        email: email || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      showToast("Account updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Update failed.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur">
      <h1 className="text-lg font-semibold text-slate-900">Admin Account</h1>
      <p className="mt-1 text-sm text-slate-600">Update your sign-in email and/or password.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-6 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
          <input
            id="email"
            className="input mt-2"
            type="email"
            placeholder="admin@yourdomain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <p className="mt-1 text-xs text-slate-500">Leave unchanged if you don’t want to update your email.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="currentPassword">
              Current password
            </label>
            <input
              id="currentPassword"
              className="input mt-2"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <p className="mt-1 text-xs text-slate-500">Required if you’re changing your password.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              className="input mt-2"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="confirm">Confirm new password</label>
            <input
              id="confirm"
              className="input mt-2"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            className="btn-muted"
            onClick={() => {
              setEmail(user?.email || "");
              setCurrentPassword("");
              setNewPassword("");
              setConfirm("");
            }}
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Toast */}
      <Toast open={toast.open} msg={toast.msg} tone={toast.tone} />
    </div>
  );
}

function Toast({ open, msg, tone }) {
  if (!open) return null;
  const styles =
    tone === "success"
      ? "bg-emerald-600 text-white"
      : tone === "error"
      ? "bg-rose-600 text-white"
      : "bg-slate-800 text-white";
  return (
    <div className={`fixed bottom-5 right-5 z-50 rounded-xl px-4 py-3 shadow-lg ${styles}`} role="status" aria-live="polite">
      <span className="text-sm">{msg}</span>
    </div>
  );
}
