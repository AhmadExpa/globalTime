"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { adminListContacts, adminDeleteContact } from "../../../lib/api";

export default function AdminContacts(){
  const { token, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [q, setQ] = useState("");
  const pages = Math.max(1, Math.ceil(total / limit));

  async function load(){
    const { data } = await adminListContacts(token, { page, limit, q });
    setRows(data.items || []);
    setTotal(data.total || 0);
  }

  useEffect(()=>{ if(token) load(); }, [token, page, limit, q]);

  if (!user || user.role !== "admin") return <div className="card">Forbidden</div>;

  async function del(id){
    if (!confirm("Delete this message?")) return;
    await adminDeleteContact(token, id);
    load();
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold">Contact Messages</h2>
        <div className="flex items-center gap-2">
          <input
            className="input h-9 w-56"
            placeholder="Search name/email/subject…"
            value={q}
            onChange={e=>{ setPage(1); setQ(e.target.value); }}
          />
          <select className="input h-9 w-[86px]"
            value={limit}
            onChange={e=>{ setPage(1); setLimit(Number(e.target.value)); }}>
            {[10,20,50,100].map(n=> <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Subject</th>
              <th className="py-2 pr-3">Topic</th>
              <th className="py-2 pr-3">Received</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(m => (
              <tr key={m._id} className="border-b last:border-0 align-top">
                <td className="py-2 pr-3">
                  <div className="font-medium">{m.name}</div>
                  {m.phone && <div className="text-xs text-slate-500">{m.phone}</div>}
                </td>
                <td className="py-2 pr-3">
                  <a className="text-sky-700 hover:underline" href={`mailto:${m.email}`}>{m.email}</a>
                </td>
                <td className="py-2 pr-3">
                  <div className="font-medium">{m.subject}</div>
                  <div className="text-xs text-slate-600 whitespace-pre-wrap">{m.message}</div>
                </td>
                <td className="py-2 pr-3">{m.topic || '—'}</td>
                <td className="py-2 pr-3 text-xs text-slate-500">{new Date(m.createdAt).toLocaleString()}</td>
                <td className="py-2 pr-3">
                  <button className="btn-muted h-8" onClick={()=>del(m._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length===0 && (
              <tr><td colSpan={6} className="py-6 text-center text-slate-500">No messages.</td></tr>
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
