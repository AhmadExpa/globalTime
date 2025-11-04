"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchDST } from "../../../lib/api";

export default function DSTPage() {
  const [q, setQ] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [sort, setSort] = useState("country"); // country | city | nextChange | offset | time24
  const [dir, setDir] = useState("asc");
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, limit: 100, offset: 0 });
  const [loading, setLoading] = useState(false);

  const params = useMemo(
    () => ({ q, active: activeOnly, sort, dir, limit: 100, offset: 0 }),
    [q, activeOnly, sort, dir]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchDST(params);
        if (!alive) return;
        setRows(data.clocks || []);
        setMeta({ total: data.total, limit: data.limit, offset: data.offset });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [params]);

  const th = (key, label) => (
    <th
      onClick={() => {
        if (sort === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
          setSort(key);
          setDir("asc");
        }
      }}
      className="px-3 py-2 text-left cursor-pointer select-none whitespace-nowrap"
      title="Click to sort"
    >
      {label}{" "}
      <span className="text-xs opacity-60">
        {sort === key ? (dir === "asc" ? "▲" : "▼") : ""}
      </span>
    </th>
  );

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">DST zones & transitions</h1>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search country/city/timezone…"
          className="border rounded-lg px-3 py-2 w-72"
        />
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          <span>Active DST only</span>
        </label>
        {loading && <span className="text-sm opacity-70">Loading…</span>}
        <div className="ml-auto text-sm opacity-70">
          {meta.total} result{meta.total === 1 ? "" : "s"}
        </div>
      </div>

      <div className="overflow-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {th("country", "Region")}
              {th("time24", "Local Time")}
              {th("offset", "Offset")}
              <th className="px-3 py-2 text-left">DST</th>
              {th("nextChange", "Next Change")}
              <th className="px-3 py-2 text-left">Prev Change</th>
              <th className="px-3 py-2 text-left">Timezone</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.timeZone} className="border-t">
                <td className="px-3 py-2">{r.country}</td>
                <td className="px-3 py-2 font-mono">{r.time24}</td>
                <td className="px-3 py-2 font-mono">{r.offset}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                      r.isDST
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {r.isDST ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {r.nextChangeLocal ? (
                    <>
                      <div className="font-mono">{r.nextChangeLocal}</div>
                      <div className="text-xs opacity-70">
                        {r.nextChangeType}
                      </div>
                    </>
                  ) : (
                    <span className="opacity-60">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {r.prevChangeLocal ? (
                    <>
                      <div className="font-mono">{r.prevChangeLocal}</div>
                      <div className="text-xs opacity-70">
                        {r.prevChangeType}
                      </div>
                    </>
                  ) : (
                    <span className="opacity-60">—</span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono">{r.timeZone}</td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr>
                <td
                  className="px-3 py-6 text-center text-sm opacity-70"
                  colSpan={8}
                >
                  Nothing found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs opacity-70">
        Times are computed live from IANA time zones; next/prev changes detect
        offset transitions within ~450 days.
      </p>
    </main>
  );
}
