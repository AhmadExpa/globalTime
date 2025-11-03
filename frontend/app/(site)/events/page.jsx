"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { DateTime } from "luxon";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, FileDown, CalendarClock, Share2, Link, Download
} from "lucide-react";
import {
  fetchEvents,
  createEvent,
  deleteEvent,
  downloadEventPDF,
  downloadEventICS,
  createShareLink,       // <-- use api.js
  disableShareLink,      // <-- optional unshare
} from "../../../lib/api";

async function copyToClipboard(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { return false; }
}

function useCountdown(iso) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(i); }, []);
  const diff = Math.max(0, Math.floor((Date.parse(iso) - Date.now()) / 1000));
  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return { d, h, m, s, diff };
}
function MonoCountdown({ iso, size = "text-3xl" }) {
  const { d, h, m, s } = useCountdown(iso);
  return <div className={`font-mono ${size}`}>{d}d {h}h {m}m {s}s</div>;
}

export default function Events() {
  const { token } = useAuth();

  const [events, setEvents]   = useState([]);
  const [title, setTitle]     = useState("");
  const [target, setTarget]   = useState(DateTime.local().toISO({ suppressMilliseconds: true }) || "");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [bullets, setBullets] = useState("");

  const [errorMsg, setErrorMsg] = useState(null);
  const [notice, setNotice]     = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareBusyId, setShareBusyId] = useState(null);

  async function load() {
    setIsLoading(true);
    try {
      if (token) {
        const { data } = await fetchEvents(token);
        setEvents(data?.events || []);
      } else {
        const raw = sessionStorage.getItem("guestEvents");
        setEvents(raw ? JSON.parse(raw) : []);
      }
    } catch {
      setErrorMsg("Failed to load events.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [token]);

  function saveGuest(updated) { sessionStorage.setItem("guestEvents", JSON.stringify(updated)); }

  async function addEvent() {
    setErrorMsg(null); setNotice(null);
    const t = title.trim();
    if (!t) { setErrorMsg("Title is required."); return; }

    const parsed = DateTime.fromISO(target);
    if (!parsed.isValid) { setErrorMsg("Target date/time is invalid."); return; }

    const targetUTC = parsed.toUTC().toISO({ suppressMilliseconds: true });
    const list = bullets.split("\n").map(s => s.trim()).filter(Boolean);

    if (!token) {
      const cap = 2;
      if (events.length >= cap) { setErrorMsg("Guest limit reached (2). Log in to save more."); return; }
      const newE = {
        _id: "guest-" + Math.random().toString(36).slice(2),
        title: t, targetISO: targetUTC, bgColor, textColor, bullets: list,
      };
      const updated = [newE, ...events];
      setEvents(updated); saveGuest(updated);
      setTitle(""); setBullets(""); setNotice("Event added in guest mode.");
      return;
    }

    try {
      setIsSaving(true);
      await createEvent(token, { title: t, targetISO: targetUTC, bgColor, textColor, bullets: list });
      setTitle(""); setBullets("");
      await load();
      setNotice("Event created.");
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || e?.message || "Failed to create event.");
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(id) {
    setErrorMsg(null); setNotice(null);
    if (!token) {
      const updated = events.filter(x => x._id !== id);
      setEvents(updated); saveGuest(updated); setNotice("Removed."); return;
    }
    try { await deleteEvent(token, id); await load(); setNotice("Removed."); }
    catch { setErrorMsg("Failed to delete event."); }
  }

  const dt = useMemo(() => DateTime.fromISO(target), [target]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events & Countdowns</h1>
          <p className="text-slate-500 text-sm">Create, preview, share.</p>
        </div>
        <CalendarClock className="w-6 h-6 text-slate-400" />
      </div>

      {errorMsg && (
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMsg}</motion.div>
      )}
      {notice && (
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
          className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="rounded-2xl border border-slate-200 p-5 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-slate-500" />
            <div className="text-lg font-semibold">Create Event / Time Announcer</div>
          </div>

          <div className="space-y-3">
            <input className="input" placeholder="Event Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <div>
              <div className="text-sm">Target</div>
              <input
                className="input"
                type="datetime-local"
                value={DateTime.fromISO(target).toFormat("yyyy-LL-dd'T'HH:mm")}
                onChange={(e) => {
                  const v = e.target.value;
                  const parsed = DateTime.fromFormat(v, "yyyy-LL-dd'T'HH:mm");
                  if (parsed.isValid) setTarget(parsed.toISO());
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm">Background</div>
                <input className="input" type="color" value={bgColor} onChange={(e)=>setBgColor(e.target.value)} />
              </div>
              <div>
                <div className="text-sm">Text</div>
                <input className="input" type="color" value={textColor} onChange={(e)=>setTextColor(e.target.value)} />
              </div>
            </div>
            <div>
              <div className="text-sm">Bullets (one per line)</div>
              <textarea className="input h-24" value={bullets} onChange={e=>setBullets(e.target.value)} />
            </div>
            <button onClick={addEvent} className="btn-primary disabled:opacity-50" disabled={isSaving}>
              {isSaving ? "Saving…" : "Add Event"}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="space-y-4">
          <div className="text-sm text-slate-600">Live Styled Preview</div>
          <motion.div layout className="rounded-2xl border border-slate-200 p-6 text-center"
            style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="text-xl font-semibold">{title || "Your Event"}</div>
            <div className="font-mono text-3xl mt-2"><MonoCountdown iso={target} /></div>
          </motion.div>

          <div className="text-sm text-slate-600">PDF Export Preview (clean)</div>
          <div className="rounded-2xl border border-slate-200 p-6 bg-white">
            <div className="text-xl font-semibold">{title || "Your Event"}</div>
            <div className="mt-1 text-sm text-slate-600">Local: {dt.isValid ? dt.toFormat("fff") : "—"}</div>
            <div className="text-sm text-slate-600">UTC: {dt.isValid ? dt.toUTC().toFormat("fff") : "—"}</div>
            {bullets && (
              <ul className="mt-2 list-inside list-disc text-sm">
                {bullets.split("\n").filter(Boolean).map((b, i) => (<li key={i}>{b}</li>))}
              </ul>
            )}
          </div>
        </motion.div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-5 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold">Your Events</div>
          <div className="text-xs text-slate-500">Guests 2 (session) • Free=2 • Pro=4</div>
        </div>

        {isLoading ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : events.length === 0 ? (
          <div className="text-sm text-slate-500">No events yet.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {events.map(e => (
                <motion.div key={e._id} layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                  className="rounded-2xl border overflow-hidden">
                  <div className="p-4 text-center" style={{ backgroundColor: e.bgColor, color: e.textColor }}>
                    <div className="text-base font-semibold truncate">{e.title}</div>
                    <div className="mt-2"><MonoCountdown iso={e.targetISO} /></div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-slate-500">
                      {DateTime.fromISO(e.targetISO).toFormat("fff")} • UTC {DateTime.fromISO(e.targetISO).toUTC().toFormat("HH:mm")}
                    </div>
                    {Array.isArray(e.bullets) && e.bullets.length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-sm text-slate-700">
                        {e.bullets.map((b,i)=>(<li key={i}>{b}</li>))}
                      </ul>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {token && (
                        <button className="btn-muted" onClick={()=>downloadEventPDF(token, e._id)}>
                          <FileDown className="w-4 h-4 mr-1" /> PDF
                        </button>
                      )}
                      {token && (
                        <button className="btn-muted" onClick={()=>downloadEventICS(token, e._id)}>
                          <Download className="w-4 h-4 mr-1" /> ICS
                        </button>
                      )}
                      <button className="btn-muted" onClick={()=>remove(e._id)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                      </button>

                      {token ? (
                        <button
                          className="btn-muted"
                          disabled={shareBusyId === e._id}
                          onClick={async () => {
                            try {
                              setShareBusyId(e._id);
                              const { url } = await createShareLink(token, e._id, { expiresInDays: 30 });
                              const ok = await copyToClipboard(url);
                              setNotice(ok ? "Share link copied to clipboard." : `Share link: ${url}`);
                            } catch (err) {
                              setErrorMsg(err?.message || "Failed to create share link");
                            } finally {
                              setShareBusyId(null);
                            }
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-1" /> Share
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Link className="w-3 h-3" /> Login to share
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
