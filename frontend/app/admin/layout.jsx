"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import "../globals.css";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: DashIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/requests", label: "Requests", icon: RequestsIcon },
  { href: "/admin/newsletter", label: "Newsletter", icon: MailIcon },
  { href: "/admin/contacts", label: "Contacts", icon: ChatIcon },
  { href: "/admin/account", label: "Account", icon: SettingsIcon }
];

export default function AdminRoot({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") router.replace("/login");
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="card">Forbidden</div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 backdrop-blur bg-white/70">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-xl hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <MenuIcon />
            </button>
            <Link href="/admin" className="font-semibold tracking-tight">
              Time & Date Ultimate — Admin
            </Link>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="hidden md:inline text-slate-600">{user.email}</span>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="btn-primary h-8 px-3"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl grid md:grid-cols-[240px_1fr] gap-6 py-6 px-4">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block">
          <Sidebar pathname={pathname} />
        </aside>

        {/* Sidebar (mobile drawer) */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              className="fixed inset-0 z-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="relative h-full w-[280px] bg-white border-r border-slate-200 p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold">Admin</div>
                  <button
                    className="p-2 rounded-xl hover:bg-slate-100"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <XIcon />
                  </button>
                </div>
                <Sidebar pathname={pathname} />
              </motion.div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </section>
      </div>
    </div>
  );
}

function Sidebar({ pathname }) {
  return (
    <div className="card h-fit sticky top-20">
      <div className="font-semibold mb-3">Admin</div>
      <nav className="text-sm space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-lg px-2 py-2 transition ${
                active
                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                  : "hover:bg-slate-50 border border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/* Inline icons */
function MenuIcon(props){ return (<svg {...props} viewBox="0 0 24 24" className={`h-5 w-5 ${props.className||""}`}><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>); }
function XIcon(props){ return (<svg {...props} viewBox="0 0 24 24" className={`h-5 w-5 ${props.className||""}`}><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>); }
function DashIcon(props){ return (<svg {...props} viewBox="0 0 24 24" className={`h-4 w-4 ${props.className||""}`}><path d="M4 5h6v6H4zM14 5h6v4h-6zM4 15h4v4H4zM12 13h8v6h-8z" fill="currentColor"/></svg>); }
function UsersIcon(props){ return (<svg {...props} viewBox="0 0 24 24" className={`h-4 w-4 ${props.className||""}`}><path d="M16 11c1.657 0 3-1.79 3-4s-1.343-4-3-4-3 1.79-3 4 1.343 4 3 4zM8 11c1.657 0 3-1.79 3-4S9.657 3 8 3 5 4.79 5 7s1.343 4 3 4zM8 13c-3.314 0-6 2.239-6 5v1h8v-1c0-1.657.672-3.157 1.757-4.243C10.803 13.29 9.45 13 8 13zm8 0c-1.451 0-2.804.29-3.757.757A6.96 6.96 0 0 1 14 18v1h8v-1c0-2.761-2.686-5-6-5z" fill="currentColor"/></svg>); }
function RequestsIcon(props){ return (<svg {...props} viewBox="0 0 24 24" className={`h-4 w-4 ${props.className||""}`}><path d="M4 4h16v12H5.5L4 17.5V4zM8 9h8M8 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>); }
function MailIcon(props){ return (<svg {...props} viewBox="0 0 24 24" className={`h-4 w-4 ${props.className||""}`}><path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" fill="none"/></svg>); }
function ChatIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${props.className || ""}`}
    >
      <path
        d="M4 5h16v10H6l-2 3v-3H4V5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M8 9h8M8 12h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${props.className || ""}`}
    >
      <path
        d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.94-1.06l1.43 1.43-1.94 1.94-1.43-1.43a7.95 7.95 0 0 1-1.9.78l-.29 2.04h-2.74l-.29-2.04a7.95 7.95 0 0 1-1.9-.78l-1.43 1.43-1.94-1.94 1.43-1.43a7.95 7.95 0 0 1-.78-1.9L4 12.29V9.55l2.04-.29a7.95 7.95 0 0 1 .78-1.9L5.39 5.93l1.94-1.94 1.43 1.43a7.95 7.95 0 0 1 1.9-.78L11.55 2h2.9l.29 2.04a7.95 7.95 0 0 1 1.9.78l1.43-1.43 1.94 1.94-1.43 1.43a7.95 7.95 0 0 1 .78 1.9L22 11.55v2.9l-2.06-.01a7.95 7.95 0 0 1-.78 1.9z"
        fill="currentColor"
      />
    </svg>
  );
}

