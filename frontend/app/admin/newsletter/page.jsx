"use client";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { adminSendNewsletter } from "../../../lib/api";

export default function AdminNewsletter(){
  const { token, user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [sending, setSending] = useState(false);

  if (!user || user.role !== "admin") return <div className="card">Forbidden</div>;

  async function sendit(e){
    e.preventDefault(); setResult("");
    if(!subject || !message){ setResult("Subject and message are required"); return; }
    setSending(true);
    try{
      const { data } = await adminSendNewsletter(token, { subject, message });
      setResult(`Sent to ${data.sent} subscribers`);
      setSubject(""); setMessage("");
    } finally { setSending(false); }
  }

  return (
    <form onSubmit={sendit} className="card space-y-3 max-w-lg">
      <div className="text-lg font-semibold">Send Newsletter</div>
      <input className="input" placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} />
      <textarea className="input h-40" placeholder="Message text" value={message} onChange={e=>setMessage(e.target.value)} />
      <button disabled={sending} className="btn-primary">{sending? "Sending…" : "Send"}</button>
      {result && <div className="text-sm">{result}</div>}
    </form>
  );
}
