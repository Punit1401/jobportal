"use client";

import { useState } from "react";
import { Star, Send, Loader2, CheckCircle2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a rating");
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, category }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      alert("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] text-center space-y-4"
      >
        <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-black text-slate-900">Thank You!</h3>
        <p className="text-slate-600 font-medium italic">"Your feedback helps us build a better experience for everyone."</p>
        <button 
          onClick={() => { setSubmitted(false); setRating(0); setComment(""); }}
          className="text-emerald-600 font-black text-xs uppercase tracking-widest pt-4 hover:underline"
        >
          Send Another Feedback
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
      
      <div className="relative z-10 space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Share Your Thoughts</h2>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Rate our platform & services</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Overall Satisfaction</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-all active:scale-90"
                >
                  <Star 
                    size={36} 
                    className={`transition-all duration-300 ${
                      (hoverRating || rating) >= star 
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] scale-110" 
                        : "text-slate-200 hover:text-slate-300"
                    }`} 
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-[10px] font-black text-amber-500 uppercase italic">
                {rating === 5 ? "Exceptional!" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Needs Improvement" : "Poor Experience"}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Feedback Category</label>
            <div className="flex flex-wrap gap-2">
              {["General", "UI/UX Design", "Job Matching", "Service Quality", "Feature Suggestion"].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    category === cat 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Detailed Feedback</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked or what we can improve..."
              className="w-full px-6 py-4 rounded-[2rem] bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 italic"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Feedback</>}
          </button>
        </form>
      </div>
    </div>
  );
}
