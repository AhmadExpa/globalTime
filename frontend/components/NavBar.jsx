"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../app/context/AuthContext";

export default function NavBar() {
  const { user, token } = useAuth();
  const loggedIn = !!(user || token);
  const pathname = usePathname();
  const router = useRouter();

  // UI state
  const [dockShadow, setDockShadow] = useState(false);
  const [openMega, setOpenMega] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [query, setQuery] = useState("");

  // refs
  const megaRef = useRef(null);

  // nav data
  const NAV = useMemo(
    () => ({
      primary: [
        { label: "Home", href: "/" },
        { label: "Newsletter", href: "/newsletter" },
        { label: "Contact", href: "/contact" },
      ],
      products: [
        { label: "Personal Clocks", href: "/personalize" },
        { label: "World Clock", href: "/world-clock" },
        { label: "Daylight Saving Time", href: "/dst" },
        { label: "Time Difference", href: "/time-difference" },
        { label: "Meeting Planner", href: "/meeting" },
      ],
      tools: [
        { label: "Event Planner", href: "/events" },
        { label: "Stopwatch", href: "/stopwatch" },
        { label: "Timers", href: "/timers" },
        { label: "Date Calculators", href: "/date-calculators" },
      ],
    }),
    []
  );

  const isActive = (href) =>
    href && pathname === href ? "text-white" : "text-slate-300";

  // scroll elevation for dock
  useEffect(() => {
    const onScroll = () => setDockShadow(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // click-outside to close mega
  useEffect(() => {
    const onClick = (e) => {
      if (!megaRef.current) return;
      if (!megaRef.current.contains(e.target)) setOpenMega(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // keyboard: esc, / for search, enter to open first spotlight result
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpenMega(false);
        setDrawerOpen(false);
        setSpotlightOpen(false);
      }
      if (
        e.key === "/" &&
        !spotlightOpen &&
        document.activeElement?.tagName !== "INPUT"
      ) {
        e.preventDefault();
        setSpotlightOpen(true);
      }
      if (e.key === "Enter" && spotlightOpen) {
        const first = filtered[0];
        if (first?.href) {
          setSpotlightOpen(false);
          router.push(first.href);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // lock scroll when overlays open
  useEffect(() => {
    const anyOpen = drawerOpen || spotlightOpen;
    if (!anyOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [drawerOpen, spotlightOpen]);

  // spotlight dataset
  const allLinks = useMemo(() => {
    return [
      ...NAV.primary,
      ...NAV.products.map((i) => ({ ...i, group: "Products" })),
      ...NAV.tools.map((i) => ({ ...i, group: "Tools" })),
    ];
  }, [NAV]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allLinks;
    const q = query.toLowerCase();
    return allLinks.filter((x) => x.label.toLowerCase().includes(q));
  }, [query, allLinks]);

  return (
    <>
      {/* ===== Top area (dark) ===== */}
      <div className="w-full bg-[#0B0E12] border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-2">
          {/* MOBILE: show [AD], then [Logo Title] [Hamburger] */}
          <div className="md:hidden space-y-2">
            <div className="relative w-full h-[56px]">
              <Image
                src="/ads.png"
                alt="Advertisement"
                fill
                className="object-contain object-center"
                sizes="100vw"
                priority
              />
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2"
                aria-label="Home"
              >
                <Image
                  src="/logo_dark.png"
                  alt="Time & Date Ultimate"
                  width={26}
                  height={26}
                  className="rounded-md"
                  priority
                />
                <span className="font-semibold tracking-tight text-white">
                  Time &amp; Date Ultimate
                </span>
              </Link>

              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                className="p-2 rounded-lg text-slate-200 hover:bg-white/5 active:scale-95 transition transform duration-150"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 6h18M3 12h18M3 18h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* DESKTOP/TABLET header row: logo left, ad center (no extras) */}
          <div className="hidden md:flex items-center justify-between gap-3">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="Home"
            >
              <Image
                src="/logo_dark.png"
                alt="Time & Date Ultimate"
                width={26}
                height={26}
                className="rounded-md"
                priority
              />
              <span className="font-semibold tracking-tight text-white">
                Time &amp; Date Ultimate
              </span>
            </Link>

            <div className="flex-1 max-w-[720px] h-[56px] relative">
              <Image
                src="/ads.png"
                alt="Advertisement"
                fill
                className="object-contain object-center"
                sizes="720px"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== Glassy command dock (desktop only) ===== */}
      <div className="hidden md:block md:sticky top-0 z-50">
        <div className="pointer-events-none">
          <div
            className={[
              "mx-auto max-w-4xl px-4 transition-all duration-300",
              dockShadow ? "translate-y-2" : "translate-y-3",
            ].join(" ")}
          >
            <nav
              className={[
                "pointer-events-auto mx-auto rounded-2xl border",
                "backdrop-blur",
                "bg-[#0B0E12] border-slate-800",
                "shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
                "transition-all duration-300",
                dockShadow ? "shadow-2xl" : "shadow-lg",
              ].join(" ")}
              aria-label="Main"
            >
              <div className="flex h-14 items-center justify-between px-3">
                {/* Left: primary links */}
                <div className="flex items-center gap-1">
                  {NAV.primary.map((i) => (
                    <Link
                      key={i.href}
                      href={i.href}
                      className={[
                        "rounded-xl px-3 py-2 text-sm font-medium transition",
                        "text-slate-100 hover:bg-white/10 hover:translate-y-[-1px] active:translate-y-0",
                        isActive(i.href),
                      ].join(" ")}
                    >
                      {i.label}
                    </Link>
                  ))}
                </div>

                {/* Center: Explore with mega menu */}
                <div className="relative" ref={megaRef}>
                  <button
                    onClick={() => setOpenMega((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={openMega}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 transition active:scale-[0.98]"
                  >
                    Explore
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      className={`transition-transform duration-200 ${
                        openMega ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  {openMega && (
                    <div
                      role="menu"
                      className="absolute left-1/2 top-[110%] -translate-x-1/2 z-50 w-[700px]"
                      style={{ transformOrigin: "50% 0%" }}
                    >
                      {/* Animate INNER wrapper only to avoid horizontal glitch */}
                      <div
                        className="rounded-2xl border border-white/10 bg-[#0B0E12]/95 backdrop-blur-xl shadow-2xl p-4
                                      animate-[fadeIn_0.18s_ease-out] will-change-[transform,opacity]"
                      >
                        <style jsx>{`
                          @keyframes fadeIn {
                            from {
                              opacity: 0;
                              transform: translateY(-4px) scale(0.98);
                            }
                            to {
                              opacity: 1;
                              transform: translateY(0) scale(1);
                            }
                          }
                        `}</style>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <section className="rounded-xl border border-white/5 p-3 bg-white/5">
                            <header className="flex items-center gap-2 pb-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                                P
                              </span>
                              <h3 className="text-sm font-semibold text-white">
                                Products
                              </h3>
                            </header>
                            <ul className="space-y-1">
                              {NAV.products.map((c) => (
                                <li key={c.href}>
                                  <Link
                                    href={c.href}
                                    className="block rounded-lg px-2 py-2 text-slate-200 hover:bg-white/10 transition"
                                    onClick={() => setOpenMega(false)}
                                  >
                                    {c.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </section>

                          <section className="rounded-xl border border-white/5 p-3 bg-white/5">
                            <header className="flex items-center gap-2 pb-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                                T
                              </span>
                              <h3 className="text-sm font-semibold text-white">
                                Tools
                              </h3>
                            </header>
                            <ul className="space-y-1">
                              {NAV.tools.map((c) => (
                                <li key={c.href}>
                                  <Link
                                    href={c.href}
                                    className="block rounded-lg px-2 py-2 text-slate-200 hover:bg-white/10 transition"
                                    onClick={() => setOpenMega(false)}
                                  >
                                    {c.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </section>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Link
                            href="/world-clock"
                            onClick={() => setOpenMega(false)}
                            className="group relative overflow-hidden rounded-xl border border-white/10 p-3 bg-white/5 hover:bg-white/10 transition"
                          >
                            <Image
                              src="/world.png"
                              alt=""
                              width={400}
                              height={220}
                              className="rounded-lg object-cover w-full h-24 opacity-90 group-hover:opacity-100 transition"
                            />
                            <div className="mt-2 text-sm font-semibold text-white">
                              World Clock
                            </div>
                            <p className="text-xs text-slate-300">
                              Track cities at a glance.
                            </p>
                            <span className="absolute right-2 top-2 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-200 border border-white/10">
                              Featured
                            </span>
                          </Link>
                          <Link
                            href="/meeting"
                            onClick={() => setOpenMega(false)}
                            className="group relative overflow-hidden rounded-xl border border-white/10 p-3 bg-white/5 hover:bg-white/10 transition"
                          >
                            <Image
                              src="/planner.jpg"
                              alt=""
                              width={400}
                              height={220}
                              className="rounded-lg object-cover w-full h-24 opacity-90 group-hover:opacity-100 transition"
                            />
                            <div className="mt-2 text-sm font-semibold text-white">
                              Meeting Planner
                            </div>
                            <p className="text-xs text-slate-300">
                              Find overlap painlessly.
                            </p>
                          </Link>
                          <Link
                            href="/timers"
                            onClick={() => setOpenMega(false)}
                            className="group relative overflow-hidden rounded-xl border border-white/10 p-3 bg-white/5 hover:bg-white/10 transition"
                          >
                            <Image
                              src="/timer.jpg"
                              alt=""
                              width={400}
                              height={220}
                              className="rounded-lg object-cover w-full h-24 opacity-90 group-hover:opacity-100 transition"
                            />
                            <div className="mt-2 text-sm font-semibold text-white">
                              Timers
                            </div>
                            <p className="text-xs text-slate-300">
                              Countdowns that matter.
                            </p>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Search + Auth (desktop only) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSpotlightOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10 transition active:scale-[0.98]"
                    aria-label="Open search"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      className="opacity-90"
                    >
                      <path
                        d="M11 19a8 8 0 1 1 5.292-14.01A8 8 0 0 1 11 19Zm8-1-3.5-3.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="hidden lg:inline">Search</span>
                    <kbd className="ml-1 hidden xl:inline rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-slate-200 border border-white/10">
                      /
                    </kbd>
                  </button>

                  {!loggedIn ? (
                    <Link
                      href="/login"
                      className="inline-flex items-center rounded-xl bg-white text-[#0B0E12] px-3 py-2 text-sm font-medium hover:opacity-90 transition active:scale-[0.98]"
                    >
                      Sign in
                    </Link>
                  ) : (
                    <Link
                      href="/account"
                      className="inline-flex items-center rounded-xl border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/10 transition active:scale-[0.98]"
                    >
                      Account
                    </Link>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* ===== Spotlight ===== */}
      <div
        aria-hidden={!spotlightOpen}
        className={`fixed inset-0 z-[70] bg-black/60 transition-opacity duration-200 ${
          spotlightOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSpotlightOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className={[
          "fixed left-1/2 top-24 z-[71] w-[92vw] max-w-xl -translate-x-1/2",
          spotlightOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none",
          "transition-all duration-150",
        ].join(" ")}
      >
        <div className="rounded-2xl border border-white/10 bg-[#0B0E12]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              className="text-slate-200"
            >
              <path
                d="M11 19a8 8 0 1 1 5.292-14.01A8 8 0 0 1 11 19Zm8-1-3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <input
              autoFocus
              placeholder="Search pages, products, tools…"
              className="w-full bg-transparent outline-none py-2 text-sm text-slate-100 placeholder:text-slate-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const first = filtered[0];
                  if (first?.href) {
                    setSpotlightOpen(false);
                    router.push(first.href);
                  }
                }
              }}
            />
            <kbd className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-slate-100 border border-white/10">
              Enter
            </kbd>
          </div>
          <div className="max-h-[50vh] overflow-auto">
            {filtered.length === 0 ? (
              <div className="p-4 text-sm text-slate-300">
                No matches found.
              </div>
            ) : (
              <ul className="divide-y divide-white/5 text-sm">
                {filtered.map((i) => (
                  <li key={i.href}>
                    <Link
                      href={i.href}
                      className="flex items-center justify-between px-3 py-3 hover:bg-white/5 transition"
                      onClick={() => setSpotlightOpen(false)}
                    >
                      <span className="text-slate-100">{i.label}</span>
                      {i.group && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10">
                          {i.group}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ===== Mobile Drawer ===== */}
      <div
        aria-hidden={!drawerOpen}
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-200 ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-[61] h-[100dvh] w-[86vw] max-w-sm bg-[#0B0E12] border-l border-slate-800 shadow-2xl
                    transition-transform duration-300 ease-out ${
                      drawerOpen ? "translate-x-0" : "translate-x-full"
                    }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Image
              src="/logo_dark.png"
              alt="Logo"
              width={22}
              height={22}
              className="rounded"
            />
            <span className="text-sm font-semibold text-white">Browse</span>
          </div>
          <button
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-lg text-slate-200 hover:bg-white/5 active:scale-95 transition transform duration-150"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav className="px-4 py-4 text-[15px] space-y-2">
          {NAV.primary.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              onClick={() => setDrawerOpen(false)}
              className="block px-3 py-3 text-slate-200 hover:bg-white/5 rounded-lg transition"
            >
              {i.label}
            </Link>
          ))}

          <div className="mt-2">
            <h4 className="px-3 py-2 text-xs tracking-wide text-slate-400 uppercase">
              Products
            </h4>
            <div className="rounded-xl bg-white/5 border border-white/10">
              {NAV.products.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  onClick={() => setDrawerOpen(false)}
                  className="block px-4 py-2 text-slate-200 hover:bg-white/10 transition"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-2">
            <h4 className="px-3 py-2 text-xs tracking-wide text-slate-400 uppercase">
              Tools
            </h4>
            <div className="rounded-xl bg-white/5 border border-white/10">
              {NAV.tools.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  onClick={() => setDrawerOpen(false)}
                  className="block px-4 py-2 text-slate-200 hover:bg-white/10 transition"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          {!loggedIn ? (
            <Link
              href="/login"
              onClick={() => setDrawerOpen(false)}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 font-medium text-[#0B0E12] bg-white hover:opacity-90 transition active:scale-[0.98]"
            >
              Login / Register
            </Link>
          ) : (
            <Link
              href="/account"
              onClick={() => setDrawerOpen(false)}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-slate-200 border border-white/15 hover:bg-white/10 transition active:scale-[0.98]"
            >
              Account
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}
