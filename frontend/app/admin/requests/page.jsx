"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { adminRequests, adminApproveReq, adminRejectReq, adminUnapproveReq } from "../../../lib/api";

export default function AdminRequests(){
  const { token, user } = useAuth();
  const [rows, setRows] = useState([]);

  if (!user || user.role !== "admin") return <div className="card">Forbidden</div>;

  async function load(){ const { data } = await adminRequests(token); setRows(data.requests||[]); }
  useEffect(()=>{ if(token) load(); }, [token]);

  async function approve(id){ await adminApproveReq(token, id); load(); }
  async function reject(id){ await adminRejectReq(token, id); load(); }
  async function unapprove(id){ await adminUnapproveReq(token, id); load(); }

  return (
    <div className="card">
      <div className="text-lg font-semibold">Upgrade Requests</div>
      <div className="mt-3 grid gap-3">
        {rows.map(r => (
          <div key={r._id} className="border rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.email}</div>
              <div className="text-xs text-slate-500">{r.status} • {new Date(r.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              {r.status === "approved" ? (
                <>
                  <button onClick={()=>unapprove(r._id)} className="btn-muted">Unapprove</button>
                  <button onClick={()=>reject(r._id)} className="btn-primary me-2">Reject</button>
                </>
              ) : r.status === "pending" ? (
                <>
                  <button onClick={()=>approve(r._id)} className="btn-primary">Approve</button>
                  <button onClick={()=>reject(r._id)} className="btn-muted">Reject</button>
                </>
              ) : (
                <button onClick={()=>unapprove(r._id)} className="btn-muted">Re-open</button>
              )}
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-sm text-slate-500">No requests yet.</div>}
      </div>
    </div>
  );
}
