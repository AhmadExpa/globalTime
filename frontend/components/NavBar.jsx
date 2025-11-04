"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../app/context/AuthContext";

export default function NavBar() {
  const { user, token } = useAuth();
  const loggedIn = !!(user || token);
  const pathname = usePathname();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // desktop dropdown
  const [mobileOpen, setMobileOpen] = useState({
    products: false,
    tools: false,
  }); // mobile accordions
  const drawerRef = useRef(null);

  const NAV = [
    { label: "Home", href: "/" },
    {
      label: "Products",
      id: "products",
      children: [
        { label: "Personal Clocks", href: "/personalize" },
        { label: "World Clock", href: "/world-clock" },
        { label: "Daylight Saving Time", href: "/dst" },
        { label: "Time Difference", href: "/time-difference" },
        { label: "Meeting Planner", href: "/meeting" },
      ],
    },
    {
      label: "Tools",
      id: "tools",
      children: [
        { label: "Event Planner", href: "/events" },
        { label: "Stopwatch", href: "/stopwatch" },
        { label: "Timers", href: "/timers" },
        { label: "Date Calculators", href: "/date-calculators" },
      ],
    },
    { label: "Newsletter", href: "/newsletter" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href) =>
    href && pathname === href ? "text-slate-900" : "text-slate-600";

  // close desktop dropdowns when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      const roots = document.querySelectorAll("[data-dd-root]");
      let inside = false;
      roots.forEach((el) => {
        if (el.contains(e.target)) inside = true;
      });
      if (!inside) setOpenMenu(null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // lock scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = prev);
    }
  }, [drawerOpen]);

  // esc closes drawer
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const mobileSingles = useMemo(() => {
    const items = [];
    NAV.forEach((i) => {
      if (i.href) items.push({ label: i.label, href: i.href });
    });
    return items;
  }, [NAV]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* ====== DESKTOP: Left brand + Right Ad Banner (NOT sticky) ====== */}
      <div className="w-full bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-1">
          <div className="flex items-center justify-center lg:justify-between gap-4">
            {/* Brand: show on desktop here; hide in sticky header for lg+ */}
            <Link
              href="/"
              className="hidden lg:flex items-center gap-3 flex-shrink-0"
              aria-label="Home"
            >
              <Image
                src="/logo_dark.png"
                alt="Time & Date Ultimate"
                width={28}
                height={28}
                className="rounded-md"
                priority
              />
              <span className="font-semibold tracking-tight text-slate-900">
                Time &amp; Date Ultimate
              </span>
            </Link>

            {/* Ad banner (compact height, responsive) */}
            <div className="relative w-full lg:w-auto lg:flex-1 lg:max-w-[980px] h-[56px] sm:h-[64px] md:h-[72px] lg:h-[80px]">
              <Image
                src="/ads.png"
                alt="Advertisement"
                fill
                className="object-contain object-center"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* ====== Sticky Header ====== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center">
            {/* Mobile brand (hidden on desktop because brand is in ad bar there) */}
            <Link
              href="/"
              className="lg:hidden flex items-center gap-3 mr-auto"
              aria-label="Home"
            >
              <Image
                src="/logo_dark.png"
                alt="Time & Date Ultimate"
                width={24}
                height={24}
                className="rounded-md"
                priority
              />
              <span className="font-semibold text-slate-900">
                Time &amp; Date Ultimate
              </span>
            </Link>

            {/* ====== DESKTOP: Menu on the LEFT ====== */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV.map((item) =>
                item.children ? (
                  <div key={item.label} className="relative" data-dd-root>
                    <button
                      onClick={() =>
                        setOpenMenu((m) =>
                          m === item.label ? null : item.label
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium
                                 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                      aria-haspopup="menu"
                      aria-expanded={openMenu === item.label}
                    >
                      {item.label}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        className={`transition ${
                          openMenu === item.label ? "rotate-180" : ""
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
                    {openMenu === item.label && (
                      <div
                        role="menu"
                        className="absolute left-1/2 z-40 mt-2 w-[320px] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white shadow-xl p-2"
                      >
                        {item.children.map((c) => (
                          <Link
                            key={c.href}
                            href={c.href}
                            className="block rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`rounded-full px-3 py-2 text-sm font-medium hover:bg-slate-100 transition ${isActive(
                      item.href
                    )}`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            {/* Spacer to push auth to far right (desktop) */}
            <div className="hidden lg:block flex-1" />

            {/* ====== DESKTOP: Auth on the RIGHT ====== */}
            <div className="hidden lg:flex items-center">
              {!loggedIn ? (
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition"
                >
                  Login / Register
                </Link>
              ) : (
                <Link
                  href="/account"
                  className="rounded-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 border border-slate-300"
                >
                  Account
                </Link>
              )}
            </div>

            {/* Mobile toggle (unchanged) */}
            <button
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden ml-auto p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
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

        <div className="h-[3px] w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />
      </header>

      {/* ====== Overlay ====== */}
      <div
        aria-hidden={!drawerOpen}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
      />

      {/* ====== Mobile Drawer (unchanged) ====== */}
      <aside
        ref={drawerRef}
        className={`fixed right-0 top-0 z-[61] h-[100dvh] w-[84vw] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Image
              src="/logo_dark.png"
              alt="Logo"
              width={22}
              height={22}
              className="rounded"
            />
            <span className="text-sm font-semibold">
              Browse, compare, calculate — all here
            </span>
          </div>
          <button
            aria-label="Close menu"
            onClick={closeDrawer}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
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
          {mobileSingles.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              onClick={closeDrawer}
              className="block px-3 py-3 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              {i.label}
            </Link>
          ))}

          {/* Products accordion */}
          <div className="rounded-xl bg-slate-50/60">
            <button
              className="w-full flex items-center justify-between px-3 py-3 text-slate-700"
              onClick={() =>
                setMobileOpen((s) => ({ ...s, products: !s.products }))
              }
              aria-expanded={mobileOpen.products}
            >
              <span className="font-medium">Products</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className={`transition ${
                  mobileOpen.products ? "rotate-180" : ""
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
            <div
              className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ${
                mobileOpen.products ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0">
                {NAV.find((n) => n.id === "products").children.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={closeDrawer}
                    className="block px-4 py-2 text-slate-700 hover:bg-white"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Tools accordion */}
          <div className="rounded-xl bg-slate-50/60">
            <button
              className="w-full flex items-center justify-between px-3 py-3 text-slate-700"
              onClick={() => setMobileOpen((s) => ({ ...s, tools: !s.tools }))}
              aria-expanded={mobileOpen.tools}
            >
              <span className="font-medium">Tools</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className={`transition ${mobileOpen.tools ? "rotate-180" : ""}`}
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
            <div
              className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ${
                mobileOpen.tools ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0">
                {NAV.find((n) => n.id === "tools").children.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={closeDrawer}
                    className="block px-4 py-2 text-slate-700 hover:bg-white"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {!loggedIn ? (
            <Link
              href="/login"
              onClick={closeDrawer}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 font-medium text-white bg-slate-900"
            >
              Login / Register
            </Link>
          ) : (
            <Link
              href="/account"
              onClick={closeDrawer}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-slate-700 border border-slate-300"
            >
              Account
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}
