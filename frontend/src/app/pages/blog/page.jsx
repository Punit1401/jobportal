"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, ArrowUpRight, 
  Bookmark, Share2, Sparkles, 
  Search, Hash, Flame, MoveRight
} from 'lucide-react';

const StyledBlogPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ["All", "ATS Mastery", "Interview Prep", "Market Trends", "Career Growth"];

  const posts = [
    {
      id: 1,
      category: "ATS Mastery",
      title: "The 2026 Guide to Invisible Keywords & Resume Ranking",
      excerpt: "Deep dive into how modern ATS systems use semantic search to rank candidates before a human even opens the file.",
      author: "Dr. Aris Thorne",
      date: "Feb 12, 2026",
      readTime: "9 min read",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1200",
      featured: true
    },
    {
      id: 2,
      category: "Interview Prep",
      title: "Mastering the 'Live Build' Interview",
      excerpt: "How to think out loud and structure your logic during high-pressure coding rounds.",
      author: "Sarah Jenkins",
      date: "Feb 10, 2026",
      readTime: "5 min",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      category: "Market Trends",
      title: "The Rise of the 'Fractional' Executive",
      excerpt: "Why top-tier recruiters are pivoting toward part-time leadership roles in 2026.",
      author: "Marcus Vane",
      date: "Feb 08, 2026",
      readTime: "7 min",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-indigo-600 font-bold tracking-[0.2em] text-xs uppercase mb-4"
            >
              <Sparkles size={14} /> Intelligence Hub
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9]"
            >
              Stories for the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">Future Workforce.</span>
            </motion.h1>
          </div>
          
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="flex flex-wrap gap-2"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 border ${
                  activeCategory === cat 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                  : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Featured Card - Glassmorphism Style */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative group mb-24"
        >
          <div className="relative h-[600px] w-full rounded-[3rem] overflow-hidden shadow-2xl">
            <img 
              src={posts[0].image} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt="featured" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
              <div className="max-w-3xl">
                <div className="flex items-center gap-4 mb-6">
                  <span className="bg-indigo-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Featured</span>
                  <span className="text-white/60 text-xs font-bold flex items-center gap-1.5">
                    <Clock size={14} /> {posts[0].readTime}
                  </span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                  {posts[0].title}
                </h2>
                <p className="text-white/70 text-lg mb-8 line-clamp-2 max-w-xl">
                  {posts[0].excerpt}
                </p>
                <button className="flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black hover:bg-indigo-500 hover:text-white transition-all group/btn">
                  Read Full Article <MoveRight className="group-hover/btn:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Article Feed Section */}
        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] flex-1 bg-slate-200" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Fresh Perspectives</h3>
              <div className="h-[1px] flex-1 bg-slate-200" />
            </div>

            {posts.slice(1).map((post, i) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-5 gap-8 group cursor-pointer"
              >
                <div className="md:col-span-2 rounded-[2rem] overflow-hidden h-48 md:h-64 shadow-lg">
                  <img src={post.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                </div>
                <div className="md:col-span-3 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">{post.category}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{post.readTime}</span>
                  </div>
                  <h3 className="text-2xl font-black mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
                      <span className="text-xs font-bold">{post.author}</span>
                    </div>
                    <button className="text-slate-300 hover:text-indigo-600 transition-colors"><Bookmark size={18} /></button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Sidebar / Trending */}
          <aside className="lg:col-span-4">
            <div className="sticky top-32 space-y-12">
              
              {/* Newsletter Widget */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-xl font-black mb-4">Weekly Edge.</h4>
                  <p className="text-slate-400 text-sm mb-6">The latest in ATS algorithms and hiring news, curated for you.</p>
                  <div className="space-y-3">
                    <input type="text" placeholder="Email address" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button className="w-full bg-indigo-500 py-3 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all">Subscribe</button>
                  </div>
                </div>
                <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl" />
              </div>

              {/* Trending List */}
              <div>
                <div className="flex items-center gap-2 mb-8">
                  <Flame size={18} className="text-orange-500" />
                  <h4 className="font-black uppercase tracking-widest text-xs">Trending Now</h4>
                </div>
                <div className="space-y-8">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex gap-4 group cursor-pointer">
                      <span className="text-3xl font-black text-slate-100 group-hover:text-indigo-100 transition-colors">0{item}</span>
                      <div>
                        <h5 className="font-bold text-sm group-hover:text-indigo-600 transition-colors mb-1">Why your LinkedIn profile isn't getting hits in 2026.</h5>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Strategy</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </aside>
        </div>

      </main>
    </div>
  );
};

export default StyledBlogPage;