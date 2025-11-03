"use client";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminListUsers } from "../../../lib/api";

export default function AdminUsers(){
  const { token, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState("");
  const pages = Math.max(1, Math.ceil(total / limit));

  useEffect(()=>{ (async()=>{
    if(!token) return;
    const { data } = await adminListUsers(token, { page, limit, q });
    setRows(data.items || []);
    setTotal(data.total || 0);
  })(); }, [token, page, limit, q]);

  if (!user || user.role !== "admin") return <div className="card">Forbidden</div>;

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold">Users</h2>
        <div className="flex items-center gap-2">
          <input
            className="input h-9 w-56"
            placeholder="Search email or role…"
            value={q}
            onChange={e=>{ setPage(1); setQ(e.target.value); }}
          />
          <select className="input h-9 w-[86px]" value={limit} onChange={e=>{ setPage(1); setLimit(Number(e.target.value)); }}>
            {[10,20,50].map(n=> <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Preferences</th>
              <th className="py-2 pr-3">Role</th>
              <th className="py-2 pr-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u, i)=> (
              <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.02 }} className="border-b last:border-0">
                <td className="py-2 pr-3 font-medium">{u.email}</td>
                <td className="py-2 pr-3 text-slate-600">
                  <div className="flex flex-wrap gap-2">
                    <span className="badge">Clock: {u.preferredClockType || "—"}</span>
                    <span className="badge">Theme: {u.preferredTheme || "—"}</span>
                  </div>
                </td>
                <td className="py-2 pr-3">
                  <RoleBadge role={u.role} />
                </td>
                <td className="py-2 pr-3 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleString()}</td>
              </motion.tr>
            ))}
            {rows.length===0 && (
              <tr><td colSpan={4} className="py-6 text-center text-slate-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-slate-500">Total: {total}</div>
        <div className="flex items-center gap-1">
          <button className="btn-muted h-8" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
          <span className="text-sm px-2">{page} / {pages}</span>
          <button className="btn-muted h-8" disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))}>Next</button>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }){
  const styles = {
    free: "bg-slate-100 text-slate-700",
    pro: "bg-emerald-100 text-emerald-700",
    admin: "bg-purple-100 text-purple-700",
  }[role] || "bg-slate-100 text-slate-700";
  return <span className={`badge ${styles}`}>{role}</span>;
}
