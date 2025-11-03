"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const DEFAULT_IMAGE = "/abstract.jpg";

export default function AuthPortal({ imageUrl = DEFAULT_IMAGE }) {
  const router = useRouter();
  const { user, login, register, logout, token } = useAuth();

  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Toast state
  const [toasts, setToasts] = useState([]);
  const accent = useMemo(() => "#111827", []); // slate-900

  function pushToast({ title, message, type = "error", timeout = 4200 }) {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, title, message, type }]);
    if (timeout) setTimeout(() => dismissToast(id), timeout);
  }
  function dismissToast(id) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  useEffect(() => {
    // clear inputs when switching tabs
    setEmail("");
    setPassword("");
  }, [mode]);

  async function handleLogin(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const okLogin = await login(email, password);
      if (!okLogin) {
        pushToast({
          title: "Login failed",
          message: "Email or password is incorrect.",
          type: "error",
        });
        return;
      }
      try {
        const t =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken")
            : null;
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/user/me`,
          { headers: { Authorization: `Bearer ${t}` } }
        );
        pushToast({
          title: "Welcome back",
          message: "Signed in successfully.",
          type: "success",
        });
        if (data?.role === "admin") router.push("/admin/users");
        else router.push("/account");
      } catch {
        router.push("/");
      }
    } catch {
      pushToast({
        title: "Server error",
        message: "Could not complete login right now. Try again.",
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const okReg = await register(email, password);
      if (okReg) {
        pushToast({
          title: "Account created",
          message: "You can sign in now.",
          type: "success",
        });
        setMode("login");
      } else {
        pushToast({
          title: "Registration failed",
          message: "Please check your details and try again.",
          type: "error",
        });
      }
    } catch {
      pushToast({
        title: "Server error",
        message: "We hit a problem creating your account.",
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  const panel = {
    hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.35 },
    },
    exit: {
      opacity: 0,
      y: -12,
      filter: "blur(3px)",
      transition: { duration: 0.25 },
    },
  };

  const pill = {
    hover: {
      scale: 1.03,
      transition: { type: "spring", stiffness: 300, damping: 18 },
    },
    tap: { scale: 0.98 },
  };

  // ---------------- Already logged in ----------------
  if (user && token) {
    return (
      <main className="bg-white text-slate-900">
        <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
          {/* Full photo left */}
          <div className="relative h-[40vh] md:h-screen">
            <Image
              src={imageUrl}
              alt="Welcome"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Content right */}
          <div className="flex items-center justify-center p-6 md:p-10">
            <motion.div
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
              initial="hidden"
              animate="show"
              variants={panel}
            >
              <h1 className="mb-2 text-2xl font-semibold">
                You’re already logged in
              </h1>
              <p className="mb-8 text-slate-600">
                Jump back to your dashboard or sign out.
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover="hover"
                  whileTap="tap"
                  variants={pill}
                  onClick={() => router.push("/account")}
                  className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white"
                >
                  Go to Account
                </motion.button>
                <motion.button
                  whileHover="hover"
                  whileTap="tap"
                  variants={pill}
                  onClick={() => {
                    logout();
                    pushToast({
                      title: "Logged out",
                      message: "See you soon!",
                      type: "success",
                    });
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-900"
                >
                  Log out
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        <ToastStack toasts={toasts} onDismiss={dismissToast} accent={accent} />
      </main>
    );
  }

  // ---------------- Login / Register ----------------
  return (
    <main className="bg-white text-slate-900">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
        {/* Full photo left */}
        <div className="relative h-[40vh] md:h-screen">
          <Image
            src={imageUrl}
            alt="Sign in background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Forms right */}
        <div className="flex items-center justify-center p-6 md:p-10">
          <motion.div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            initial="hidden"
            animate="show"
            variants={panel}
          >
            {/* Tabs */}
            <div className="mb-8 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
              {["login", "register"].map((m) => (
                <motion.button
                  key={m}
                  onClick={() => setMode(m)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative w-1/2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                    mode === m
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-transparent text-slate-700 hover:text-slate-900"
                  }`}
                >
                  {m === "login" ? "Sign in" : "Create account"}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.form
                  key="login"
                  onSubmit={handleLogin}
                  variants={panel}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="space-y-4"
                >
                  <Field
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                  />
                  <Field
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                  />

                  <motion.button
                    type="submit"
                    disabled={busy}
                    variants={pill}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-60"
                  >
                    {busy ? "Signing in…" : "Sign in"}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  onSubmit={handleRegister}
                  variants={panel}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="space-y-4"
                >
                  <Field
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                  />
                  <Field
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                  />

                  <motion.button
                    type="submit"
                    disabled={busy}
                    variants={pill}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-60"
                  >
                    {busy ? "Creating…" : "Create account"}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center text-xs text-slate-500">
              Secure and private. No passwords are stored on our servers.
            </div>
          </motion.div>
        </div>
      </div>

      <ToastStack toasts={toasts} onDismiss={dismissToast} accent={accent} />
    </main>
  );
}

/* ----------------------- Reusable bits ----------------------- */

function Field({ label, type, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <motion.input
        whileFocus={{ scale: 1.01 }}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm focus:border-slate-900 focus:outline-none"
        placeholder={label.toLowerCase()}
      />
    </label>
  );
}

// ----------------------- Toasts (animated, no libs) -----------------------
function ToastStack({ toasts, onDismiss, accent = "#111827" }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center md:inset-auto md:right-4 md:top-4 md:block">
      <div className="space-y-3 md:w-[360px]">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ y: -20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto overflow-hidden rounded-xl border shadow-lg ${
                t.type === "error"
                  ? "border-rose-200 bg-rose-50"
                  : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <div className="flex items-start gap-3 p-4">
                <div
                  className={`mt-0.5 h-2.5 w-2.5 rounded-full ${
                    t.type === "error" ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                  style={{
                    boxShadow: `0 0 0 4px ${
                      t.type === "error" ? "#fecaca" : "#bbf7d0"
                    }`,
                  }}
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">
                    {t.title}
                  </div>
                  {t.message && (
                    <div className="mt-0.5 text-sm text-slate-700">
                      {t.message}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDismiss(t.id)}
                  className="rounded-md p-1 text-slate-500 hover:bg-white/60"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
              {/* progress bar */}
              <motion.div
                className="h-1"
                initial={{ width: "100%" }}
                animate={{ width: 0 }}
                transition={{ duration: 4.2, ease: "linear" }}
                style={{
                  backgroundColor: t.type === "error" ? "#f43f5e" : "#10b981",
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
