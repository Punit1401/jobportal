"use client";

import { useState, useEffect } from "react";
import { 
  FileText, CheckCircle2, XCircle, Trash2, 
  Search, Filter, Loader2, Eye,
  ArrowRight, Clock, User, Tag, BadgeCheck
} from "lucide-react";

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/articles?admin=true");
      const data = await res.json();
      if (Array.isArray(data)) setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const [processing, setProcessing] = useState(null); // stores the id being processed

  const handleStatus = async (id, status) => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        // Optimistically update local state
        setArticles(prev => prev.map(a => a._id === id ? { ...a, status } : a));
        // alert(`Article ${status} successfully!`);
      } else {
        alert(`Error: ${data.error || 'Failed to update status'}`);
      }
    } catch (err) {
      console.error("Status Update Error:", err);
      alert("System error. Check console.");
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this article?")) return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles(prev => prev.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const filtered = articles.filter(a => filter === "All" || a.status === filter.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                <FileText size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Content Moderation</h1>
            </div>
            <p className="text-slate-500 font-medium italic">Review and approve expert articles & blogs</p>
          </div>

          <div className="flex gap-2">
            {["All", "Pending", "Approved", "Rejected"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  filter === f 
                  ? "bg-slate-900 text-white shadow-xl" 
                  : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-slate-200" size={48} />
            <p className="mt-4 font-black text-slate-300 uppercase text-xs tracking-widest">Scanning Submissions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filtered.map((article) => (
              <div key={article._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-8 items-center group">
                {/* Thumbnail Preview */}
                <div className="w-full lg:w-48 aspect-video lg:aspect-square rounded-3xl overflow-hidden flex-shrink-0">
                   <img src={article.thumbnail || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=300"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>

                <div className="flex-1 space-y-4">
                   <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        article.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        article.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {article.status}
                      </span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">• {article.category}</span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">• {new Date(article.createdAt).toLocaleDateString()}</span>
                   </div>
                   
                   <div>
                     <h3 className="text-xl font-black text-slate-900">{article.title}</h3>
                     <p className="text-sm text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                        <User size={14} /> By {article.authorName} ({article.authorType})
                     </p>
                   </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:min-w-[400px] justify-end">
                   {article.status !== 'approved' && (
                     <button 
                       onClick={() => handleStatus(article._id, 'approved')}
                       disabled={processing === article._id}
                       className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                     >
                       {processing === article._id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} 
                       Approve
                     </button>
                   )}
                   {article.status !== 'rejected' && (
                     <button 
                       onClick={() => handleStatus(article._id, 'rejected')}
                       disabled={processing === article._id}
                       className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                     >
                       {processing === article._id ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />} 
                       Reject
                     </button>
                   )}
                   <a 
                     href={`/blogs/${article.slug}`} 
                     target="_blank"
                     className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
                   >
                     <Eye size={16} /> View Live
                   </a>
                   <button 
                     onClick={() => handleDelete(article._id)}
                     className="flex-1 lg:flex-none flex items-center justify-center p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-40 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
            <FileText size={64} className="mx-auto text-slate-100 mb-6" />
            <h2 className="text-3xl font-black text-slate-900 mb-2">Queue Clear</h2>
            <p className="text-slate-400 font-medium italic">No content pending for review in this category.</p>
          </div>
        )}

      </div>
    </div>
  );
}
