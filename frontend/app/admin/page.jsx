"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { adminStats, adminRequests } from "../../lib/api";

export default function AdminDashboard(){
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [reqs, setReqs] = useState([]);

  useEffect(()=>{ (async()=>{
    if(!token) return;
    const { data: s } = await adminStats(token);
    const { data: r } = await adminRequests(token);
    setStats(s);
    setReqs(r.requests || []);
  })(); }, [token]);

  if (!user || user.role !== "admin") return <div className="card">Forbidden</div>;

  const pending = useMemo(()=> reqs.filter(x=>x.status === "pending").length, [reqs]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers ?? "—"} />
        <StatCard label="Newsletter Subs" value={stats?.totalSubscribers ?? "—"} />
        <StatCard label="Pending Requests" value={pending} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Upgrade Requests</h3>
            <Link href="/admin/requests" className="text-xs text-sky-700 hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {reqs.slice(0,5).map(r=> (
              <div key={r._id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{r.email}</div>
                  <div className="text-xs text-slate-500">{r.status}</div>
                </div>
                <StatusPill status={r.status} />
              </div>
            ))}
            {reqs.length===0 && <div className="text-sm text-slate-500">No requests yet.</div>}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <QuickAction href="/admin/newsletter" title="Send Newsletter" subtitle="Reach your subscribers" />
            <QuickAction href="/admin/users" title="Manage Users" subtitle="Search & view roles" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }){
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
    >
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-slate-900">{value}</div>
    </motion.div>
  );
}

function StatusPill({ status }){
  const map = {
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
    pending: "bg-amber-100 text-amber-800",
  };
  return <span className={`px-2 py-1 rounded-full text-xs ${map[status]||"bg-slate-100 text-slate-700"}`}>{status}</span>;
}

function QuickAction({ title, subtitle, href }){
  return (
    <Link href={href} className="group rounded-xl border border-slate-200 p-4 hover:border-sky-200 hover:bg-sky-50/40 transition flex items-start gap-3">
      <div className="rounded-lg bg-sky-100 p-2">
        <svg className="h-4 w-4 text-sky-700" viewBox="0 0 24 24"><path d="M4 5h6v6H4zM14 5h6v4h-6zM4 15h4v4H4zM12 13h8v6h-8z" fill="currentColor"/></svg>
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
    </Link>
  );
}
