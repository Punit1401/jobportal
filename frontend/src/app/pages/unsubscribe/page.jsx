"use client";
import { useState } from "react";

export default function Unsubscribe() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) setMessage("✅ You have been successfully unsubscribed.");
      else setMessage("❌ Error: Email not found or already unsubscribed.");
    } catch (err) {
      setMessage("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-4xl shadow-xl text-center">
        <h1 className="text-2xl font-black italic mb-4 uppercase tracking-tighter">ShivEn Group</h1>
        <p className="text-slate-500 text-sm mb-6 font-medium">We're sorry to see you go. Enter your email to unsubscribe from our mailing list.</p>
        
        {message ? (
          <div className="p-4 bg-slate-100 rounded-xl font-bold text-slate-700">{message}</div>
        ) : (
          <form onSubmit={handleUnsubscribe} className="space-y-4">
            <input 
              type="email" 
              placeholder="Enter your email address"
              required
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button 
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all"
            >
              {loading ? "Processing..." : "Confirm Unsubscribe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}