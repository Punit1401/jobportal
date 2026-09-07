"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Heart, MessageCircle, Share2, Star, 
  ArrowLeft, Loader2, Send, Bookmark,
  Calendar, User, Tag, ChevronRight,
  Facebook, Twitter, Linkedin, Quote
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

export default function ArticleDetail() {
  const { slug } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [interacting, setInteracting] = useState(false);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/articles/slug/${slug}`);
      const data = await res.json();
      if (data.error) setArticle(null);
      else setArticle(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const handleInteract = async (action, extraData = {}) => {
    if (!session) return alert("Please login to interact!");
    setInteracting(true);
    try {
      const res = await fetch(`/api/articles/${article._id}/interact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extraData })
      });
      const data = await res.json();
      if (data.success) {
        setArticle(data.article);
        if (action === "comment") setComment("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInteracting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  if (!article) return <div>Article not found</div>;

  const isLiked = article.likes?.includes(session?.user?.id);

  return (
    <div className="min-h-screen bg-[#FDFEFF] pb-24">
      {/* Header Image */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img 
          src={article.thumbnail || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200"} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />
        
        <div className="absolute top-10 left-10">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:gap-4 transition-all"
          >
            <ArrowLeft size={16} /> Back to Library
          </button>
        </div>

        <div className="absolute bottom-10 left-0 right-0 px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl">
              {article.category}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
              {article.title}
            </h1>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black">
                   {article.authorName.charAt(0)}
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Author</p>
                   <p className="text-sm font-bold text-slate-900">{article.authorName}</p>
                 </div>
               </div>
               <div className="w-px h-8 bg-slate-200"></div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Published</p>
                 <p className="text-sm font-bold text-slate-900">{new Date(article.createdAt).toLocaleDateString()}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 mt-16">
        
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-12">
          <div 
            className="prose prose-xl prose-indigo max-w-none font-medium text-slate-600 leading-relaxed italic"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Social Interactions */}
          <div className="flex flex-wrap items-center gap-4 py-10 border-y border-slate-100">
            <button 
              onClick={() => handleInteract("like")}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                isLiked ? "bg-rose-500 text-white shadow-xl shadow-rose-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
              }`}
            >
              <Heart size={18} fill={isLiked ? "white" : "none"} />
              {article.likes?.length || 0} Likes
            </button>
            
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl">
              {[1, 2, 3, 4, 5].map((s) => (
                <button 
                  key={s}
                  onClick={() => handleInteract("rate", { rating: s })}
                  className="p-2 transition-transform hover:scale-125"
                >
                  <Star size={20} className={s <= (rating || Math.round(article.averageRating)) ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                </button>
              ))}
              <span className="px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Rate Expert</span>
            </div>

            <button 
              onClick={() => handleInteract("share")}
              className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
            >
              <Share2 size={18} /> Share Insight
            </button>
          </div>

          {/* Comments Section */}
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              Discussion <span className="text-indigo-600">({article.comments?.length || 0})</span>
            </h3>

            <div className="flex gap-4">
               <div className="w-12 h-12 bg-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-slate-400">
                 {session?.user?.name?.charAt(0) || "?"}
               </div>
               <div className="flex-1 space-y-4">
                 <textarea 
                   rows={3}
                   value={comment}
                   onChange={(e) => setComment(e.target.value)}
                   placeholder="Share your thoughts on this insight..."
                   className="w-full px-6 py-4 bg-slate-50 rounded-[2rem] border border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-slate-700 italic"
                 />
                 <button 
                   onClick={() => handleInteract("comment", { content: comment })}
                   disabled={!comment || interacting}
                   className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                 >
                   {interacting ? <Loader2 size={14} className="animate-spin"/> : <Send size={14} />} Post Comment
                 </button>
               </div>
            </div>

            <div className="space-y-6 pt-10">
              {article.comments?.map((c, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">
                    {c.userName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-black text-slate-900 text-sm">{c.userName}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium italic">"{c.content}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-10">
           <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-6 relative overflow-hidden">
              <Quote className="absolute -top-6 -right-6 w-32 h-32 text-white/5 rotate-12" />
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Author Note</p>
              <h4 className="text-xl font-black leading-tight italic">
                "Real career growth happens when experts share their lived experiences."
              </h4>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center font-black">
                   {article.authorName.charAt(0)}
                 </div>
                 <div>
                   <p className="font-black text-sm">{article.authorName}</p>
                   <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">{article.authorType}</p>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-lg font-black text-slate-900">Share with Network</h4>
              <div className="flex gap-4">
                 <button className="flex-1 py-4 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                   <Facebook size={20} />
                 </button>
                 <button className="flex-1 py-4 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all shadow-sm">
                   <Twitter size={20} />
                 </button>
                 <button className="flex-1 py-4 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                   <Linkedin size={20} />
                 </button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
