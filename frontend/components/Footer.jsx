import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-slate-700 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4">
        {/* Brand + About + Ads */}
        <div className="grid gap-8 py-10 md:grid-cols-3">
          {/* Brand & About */}
          <div className="flex flex-col items-start text-left">
            <Image
              src="/logo_white.png"
              alt="Time & Date Ultimate"
              width={100}
              height={100}
              className="rounded-xl mb-4"
              priority
            />
            <div>
              <p className="font-semibold text-white text-lg">Time &amp; Date Ultimate</p>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-sm">
                We build fast, precise tools for time — from world clocks and date calculators
                to meeting planners and pro timers. Reliable, minimal, and made for people who
                value accuracy and design.
              </p>
            </div>
          </div>

          {/* Explore Section */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Explore</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                ["Personal Clocks", "/personalize"],
                ["World Clock", "/world-clock"],
                ["Time Difference", "/time-difference"],
                ["Meeting Planner", "/meeting"],
                ["Timers", "/timers"],
                ["Date Calculators", "/date-calculators"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="block rounded-lg border border-slate-700 bg-slate-800/60 p-3 hover:bg-slate-800 hover:text-white transition"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Placeholder Ads Section */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Sponsored</h3>
            <div className="mt-4 grid gap-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-700 overflow-hidden bg-slate-800"
                >
                  <Image
                    src="/ads.png"
                    alt="Ad Space"
                    width={400}
                    height={150}
                    className="object-cover w-full h-32"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-slate-700 py-6 text-xs text-slate-400 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p>© {new Date().getFullYear()} Time &amp; Date Ultimate. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy" className="hover:text-white hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white hover:underline">Terms &amp; Conditions</Link>
            <Link href="/advertising-policy" className="hover:text-white hover:underline">Advertising Policy</Link>
            <Link href="/contact" className="hover:text-white hover:underline">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
