"use client";

import { useState, useEffect } from "react";
import { 
  Search, Filter, Calendar, User, 
  Heart, MessageCircle, Share2, Star,
  ArrowRight, Loader2, BookOpen, Clock,
  ChevronRight, Sparkles, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function BlogsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const fetchArticles = async () => {
    try {
      const res = await fetch(`/api/articles?category=${category}`);
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
  }, [category]);

  const filtered = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.authorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFEFF]">
      
      {/* Hero Header */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-slate-900">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">
              <Sparkles size={12} /> The Career Journal
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
              Expert <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Insights</span> & <br />
              Career Strategies
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-xl">
              Latest industry news, interview tips, and growth strategies from top recruiters and career experts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Search */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search articles, authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-8 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {["All", "Career Advice", "Hiring Trends", "Skill Development", "Industry News"].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                  category === cat 
                  ? "bg-slate-900 text-white shadow-xl" 
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="mt-4 font-black text-slate-300 uppercase text-xs tracking-widest">Gathering Stories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((article, idx) => (
              <ArticleCard key={article._id} article={article} index={idx} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-40">
            <BookOpen size={64} className="mx-auto text-slate-100 mb-6" />
            <h2 className="text-3xl font-black text-slate-900">No Articles Found</h2>
            <p className="text-slate-400 font-medium italic mt-2">Check back later for new expert insights.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function ArticleCard({ article, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={article.thumbnail || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800"} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur text-[9px] font-black uppercase tracking-tighter rounded-lg shadow-sm">
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex-1 flex flex-col gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-[10px] text-indigo-600">
              {article.authorName.charAt(0)}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{article.authorName}</span>
            <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">{new Date(article.createdAt).toLocaleDateString()}</span>
          </div>
          
          <Link href={`/blogs/${article.slug}`}>
            <h3 className="text-2xl font-black text-slate-900 leading-[1.1] group-hover:text-indigo-600 transition-colors line-clamp-2">
              {article.title}
            </h3>
          </Link>
          
          <p className="text-slate-500 text-sm font-medium line-clamp-3 italic">
            {article.content.substring(0, 150).replace(/<[^>]*>/g, "")}...
          </p>
        </div>

        {/* Footer Stats */}
        <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-400 group/item">
              <Heart size={14} className="group-hover/item:text-rose-500 group-hover/item:fill-rose-500 transition-all" />
              <span className="text-[10px] font-black">{article.likes?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <MessageCircle size={14} />
              <span className="text-[10px] font-black">{article.comments?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-black">{article.averageRating || 0}</span>
            </div>
          </div>
          <Link 
            href={`/blogs/${article.slug}`}
            className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-all group/btn"
          >
            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
