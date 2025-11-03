"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../app/context/AuthContext";

export default function NavBar() {
  const { user, token } = useAuth();
  const loggedIn = !!(user || token);
  const pathname = usePathname();

  const [open, setOpen] = useState(false); // mobile drawer
  const [productsOpen, setProductsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const productsRef = useRef(null);
  const resourcesRef = useRef(null);

  const isActive = (href) => (pathname === href ? "text-slate-900" : "text-slate-700");

  // Close dropdowns on outside click
  useEffect(() => {
    function onClick(e) {
      if (productsRef.current && !productsRef.current.contains(e.target)) setProductsOpen(false);
      if (resourcesRef.current && !resourcesRef.current.contains(e.target)) setResourcesOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2" aria-label="Home">
            <Image
              src="/logo_dark.png"   // 1024x1024 in /public
              alt="Time & Date Ultimate"
              width={28}
              height={28}
              className="rounded-lg"
              priority
            />
            <span className="font-semibold tracking-tight text-slate-900">
              Time&nbsp;&amp;&nbsp;Date&nbsp;Ultimate
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 text-sm">
            {/* Home */}
            <Link href="/" className={`transition hover:text-slate-900 ${isActive("/")}`}>Home</Link>

            {/* Dropdown 1: Products */}
            <div className="relative" ref={productsRef}>
              <button
                onClick={() => {
                  setProductsOpen((s) => !s);
                  setResourcesOpen(false);
                }}
                className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900"
                aria-haspopup="menu"
                aria-expanded={productsOpen}
              >
                Products
                <svg width="14" height="14" viewBox="0 0 24 24" className="mt-[1px]">
                  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              {productsOpen && (
                <div
                  role="menu"
                  className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg p-2"
                >
                  <Link href="/personalize" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Personal Clocks</Link>
                  <Link href="/world-clock" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">World Clock</Link>
                  <Link href="/time-difference" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Time Difference</Link>
                  <Link href="/meeting" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Meeting Planner</Link>
                 
                </div>
              )}
            </div>

            {/* Dropdown 2: Resources */}
            <div className="relative" ref={resourcesRef}>
              <button
                onClick={() => {
                  setResourcesOpen((s) => !s);
                  setProductsOpen(false);
                }}
                className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900"
                aria-haspopup="menu"
                aria-expanded={resourcesOpen}
              >
                Tools
                <svg width="14" height="14" viewBox="0 0 24 24" className="mt-[1px]">
                  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              {resourcesOpen && (
                <div
                  role="menu"
                  className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg p-2"
                > <Link href="/events" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Event Planner</Link>
                  <Link href="/stopwatch" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Stopwatch</Link>
                   <Link href="/timers" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Timers</Link>
                  <Link href="/date-calculators" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">Date Calculators</Link>
                </div>
              )}
            </div>

            {/* Standalone links */}
            <Link href="/newsletter" className={`transition hover:text-slate-900 ${isActive("/newsletter")}`}>Newsletter</Link>
            <Link href="/contact" className={`transition hover:text-slate-900 ${isActive("/contact")}`}>Contact</Link>
          </nav>

          {/* Right: Login/Account */}
          <div className="hidden lg:flex items-center gap-3">
            {!loggedIn ? (
              <Link
                href="/login"
                className="relative inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white
                           bg-gradient-to-r from-slate-900 to-slate-700 shadow-md hover:from-slate-800 hover:to-slate-700
                           ring-2 ring-transparent hover:ring-slate-300 transition"
              >
                <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-slate-900/10 to-slate-700/10 blur-sm"></span>
                <span className="relative">Login / Register</span>
              </Link>
            ) : (
              <Link
                href="/account"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Account
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((s) => !s)}
            className="lg:hidden inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-slate-700"
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`lg:hidden transition-[max-height] duration-300 overflow-hidden border-t border-slate-200 ${open ? "max-h-[80vh]" : "max-h-0"}`}>
        <div className="mx-auto max-w-7xl px-4 py-4 text-sm">
          <Link href="/" className="block py-2 border-b border-slate-100 text-slate-700">Home</Link>

          <details className="group">
            <summary className="cursor-pointer py-2 text-slate-700">Products</summary>
            <nav className="ml-3 grid gap-2">
              <Link href="/personalize" className="py-2 border-b border-slate-100 text-slate-700">Personal Clocks</Link>
              <Link href="/world-clock" className="py-2 border-b border-slate-100 text-slate-700">World Clock</Link>
              <Link href="/time-difference" className="py-2 border-b border-slate-100 text-slate-700">Time Difference</Link>
              <Link href="/meeting" className="py-2 border-b border-slate-100 text-slate-700">Meeting Planner</Link>
              <Link href="/timers" className="py-2 border-b border-slate-100 text-slate-700">Timers</Link>
              <Link href="/date-calculators" className="py-2 border-b border-slate-100 text-slate-700">Date Calculators</Link>
            </nav>
          </details>

          <details className="group mt-2">
            <summary className="cursor-pointer py-2 text-slate-700">Resources</summary>
            <nav className="ml-3 grid gap-2">
              <Link href="/guides/time-zones" className="py-2 border-b border-slate-100 text-slate-700">Time Zone Guide</Link>
              <Link href="/guides/dst" className="py-2 border-b border-slate-100 text-slate-700">Daylight Saving Time</Link>
              <Link href="/guides/iso-8601" className="py-2 border-b border-slate-100 text-slate-700">ISO-8601</Link>
              <Link href="/api" className="py-2 border-b border-slate-100 text-slate-700">Developer API</Link>
            </nav>
          </details>

          <Link href="/newsletter" className="block mt-2 py-2 border-b border-slate-100 text-slate-700">Newsletter</Link>
          <Link href="/contact" className="block py-2 border-b border-slate-100 text-slate-700">Contact</Link>

          {!loggedIn ? (
            <Link
              href="/login"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 font-medium text-white bg-slate-900"
            >
              Login / Register
            </Link>
          ) : (
            <Link
              href="/account"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-slate-700"
            >
              Account
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
