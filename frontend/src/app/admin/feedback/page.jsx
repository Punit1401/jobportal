"use client";

import { useState, useEffect } from "react";
import { 
  MessageSquare, Star, User, Calendar, 
  Search, Filter, Loader2, ArrowRight,
  ChevronRight, BadgeCheck, Clock, Quote
} from "lucide-react";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      if (Array.isArray(data)) setFeedbacks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const filtered = feedbacks.filter(f => {
    const matchesSearch = f.userName.toLowerCase().includes(search.toLowerCase()) || f.comment.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || f.userType === typeFilter;
    return matchesSearch && matchesType;
  });

  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100">
                <MessageSquare size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Feedback</h1>
            </div>
            <p className="text-slate-500 font-medium italic">Monitor user satisfaction and feature suggestions</p>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Rating</p>
              <h3 className="text-2xl font-black text-slate-900">{averageRating}/5.0</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
              <Star size={24} fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Feedback" value={feedbacks.length} color="bg-indigo-50 text-indigo-600" />
          <StatCard label="Candidates" value={feedbacks.filter(f => f.userType === "candidate").length} color="bg-rose-50 text-rose-600" />
          <StatCard label="Recruiters" value={feedbacks.filter(f => f.userType === "recruiter").length} color="bg-emerald-50 text-emerald-600" />
          <StatCard label="Providers" value={feedbacks.filter(f => f.userType === "serviceprovider").length} color="bg-amber-50 text-amber-600" />
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by user or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-8 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700"
            />
          </div>
          <div className="flex gap-2">
            {["All", "candidate", "recruiter", "serviceprovider"].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  typeFilter === type 
                  ? "bg-slate-900 text-white shadow-xl" 
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
              >
                {type === "serviceprovider" ? "Providers" : type}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-slate-200" size={48} />
            <p className="mt-4 font-black text-slate-300 uppercase text-xs tracking-widest">Loading Feedbacks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((item) => (
              <div key={item._id} className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col gap-6 relative overflow-hidden">
                <Quote className="absolute -top-4 -right-4 text-slate-50 w-24 h-24 rotate-12 group-hover:text-indigo-50 transition-colors" />
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                      item.userType === "candidate" ? "bg-rose-500 shadow-rose-100" : 
                      item.userType === "recruiter" ? "bg-emerald-500 shadow-emerald-100" : "bg-amber-500 shadow-amber-100"
                    }`}>
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-none">{item.userName}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                        {item.userType} <ChevronRight size={10} /> {item.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < item.rating ? "fill-amber-400 text-amber-400" : "text-slate-100"} />
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50/80 p-6 rounded-2xl relative z-10 flex-1">
                  <p className="text-slate-600 font-medium italic leading-relaxed">
                    "{item.comment}"
                  </p>
                </div>

                <div className="flex justify-between items-center relative z-10 pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                    Mark as Reviewed <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-40 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
            <MessageSquare size={64} className="mx-auto text-slate-100 mb-6" />
            <h2 className="text-3xl font-black text-slate-900 mb-2">No Feedbacks Found</h2>
            <p className="text-slate-400 font-medium italic">Wait for users to share their experience.</p>
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <h2 className={`text-4xl font-black text-slate-900`}>{value}</h2>
      </div>
      <div className={`p-4 rounded-2xl ${color}`}>
        <BadgeCheck size={28} />
      </div>
    </div>
  );
}
