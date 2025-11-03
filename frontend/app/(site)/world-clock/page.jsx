'use client';
import { useEffect, useState } from 'react';
import { worldClock } from '../../../lib/api';

export default function WorldClockPage() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');

  useEffect(()=>{ (async()=>{
    const { data } = await worldClock();
    setRows(data.clocks || []);
  })() }, []);

  const filtered = rows.filter(r => r.country.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="text-lg font-semibold">World Clock (195)</div>
        <input className="input mt-3" placeholder="Search country..." value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      <div className="card overflow-x-auto">
        <table className="min-w-[800px] w-full text-sm">
          <thead><tr className="text-slate-500">
            <th className="text-left py-2 pr-2">Country</th>
            <th className="text-left py-2 pr-2">Local Time (24h)</th>
            <th className="text-left py-2 pr-2">Local Time (12h)</th>
            <th className="text-left py-2 pr-2">UTC Offset</th>
            <th className="text-left py-2 pr-2">Sunrise / Sunset</th>
            <th className="text-left py-2 pr-2">IANA Zone</th>
          </tr></thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="py-2 pr-2">{r.country}</td>
                <td className="py-2 pr-2 font-mono">{r.time24}</td>
                <td className="py-2 pr-2 font-mono">{r.time12}</td>
                <td className="py-2 pr-2">{r.offset}</td>
                <td className="py-2 pr-2">{r.sunriseLocal} / {r.sunsetLocal}</td>
                <td className="py-2 pr-2 text-xs text-slate-500">{r.timeZone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
