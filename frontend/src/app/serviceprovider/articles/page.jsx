"use client";

import { useState, useEffect } from "react";
import { 
  FileText, Heart, MessageCircle, Share2, Star,
  Clock, CheckCircle2, XCircle, Loader2, Plus,
  ChevronRight, BarChart3, TrendingUp
} from "lucide-react";
import Link from "next/link";
import ServiceProviderSidebar from "@/components/Serviceprovidersidbar";
import { useSession } from "next-auth/react";

export default function ServiceProviderArticles() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyArticles = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/articles?authorId=${session.user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyArticles();
  }, [session]);

  const stats = {
    total: articles.length,
    approved: articles.filter(a => a.status === 'approved').length,
    likes: articles.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0),
    comments: articles.reduce((acc, curr) => acc + (curr.comments?.length || 0), 0)
  };

  return (
    <div className="flex min-h-screen bg-[#FDFEFF]">
      <ServiceProviderSidebar activePage="articles" />
      <main className="flex-1 p-4 md:p-8 lg:p-12">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                  <FileText size={24} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Published Articles</h1>
              </div>
              <p className="text-slate-500 font-medium italic">Monitor engagement and performance of your expert insights.</p>
            </div>
            
            <Link 
              href="/serviceprovider/articles/new"
              className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
            >
              <Plus size={18} /> Write New Article
            </Link>
          </div>

          {/* Engagement Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             <EngagementCard label="Submissions" value={stats.total} icon={<FileText size={20}/>} color="bg-blue-50 text-blue-600" />
             <EngagementCard label="Total Likes" value={stats.likes} icon={<Heart size={20}/>} color="bg-rose-50 text-rose-600" />
             <EngagementCard label="Comments" value={stats.comments} icon={<MessageCircle size={20}/>} color="bg-indigo-50 text-indigo-600" />
             <EngagementCard label="Live Page" value={stats.approved} icon={<TrendingUp size={20}/>} color="bg-emerald-50 text-emerald-600" />
          </div>

          {/* Articles List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-slate-200" size={48} />
              <p className="mt-4 font-black text-slate-300 uppercase text-xs tracking-widest">Loading Your Library...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {articles.map((article) => (
                <div key={article._id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row gap-6 items-start md:items-center">
                   <div className="w-full md:w-36 h-36 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100">
                      <img src={article.thumbnail || "/placeholder.jpg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   </div>

                   <div className="flex-1 space-y-3 w-full">
                      <div className="flex items-center gap-3">
                         <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                           article.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                           article.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                           'bg-rose-50 text-rose-600 border border-rose-100'
                         }`}>
                           {article.status}
                         </span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{article.category}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{article.title}</h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-slate-400">
                         <div className="flex items-center gap-1.5">
                           <Heart size={14} className={article.likes?.length > 0 ? "fill-rose-500 text-rose-500" : ""} />
                           <span className="text-xs font-bold text-slate-500">{article.likes?.length || 0} Likes</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                           <MessageCircle size={14} className="text-indigo-400" />
                           <span className="text-xs font-bold text-slate-500">{article.comments?.length || 0} Comments</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                           <Star size={14} className="fill-amber-400 text-amber-400" />
                           <span className="text-xs font-bold text-slate-500">{article.averageRating || 0} Rating</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                           <Share2 size={14} className="text-blue-400" />
                           <span className="text-xs font-bold text-slate-500">{article.shareCount || 0} Shares</span>
                         </div>
                      </div>
                   </div>

                   <div className="w-full md:w-auto flex-shrink-0 mt-4 md:mt-0">
                      <Link 
                        href={`/blogs/${article.slug}`}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-50 hover:bg-slate-900 text-slate-800 hover:text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all"
                      >
                        Preview Article
                      </Link>
                   </div>
                </div>
              ))}
            </div>
          )}

          {!loading && articles.length === 0 && (
            <div className="text-center py-40 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
              <FileText size={64} className="mx-auto text-slate-100 mb-6" />
              <h2 className="text-3xl font-black text-slate-900 mb-2">No Articles Yet</h2>
              <p className="text-slate-500 font-medium italic mb-8">Share your first expert insight to start building your authority.</p>
              <Link 
                href="/serviceprovider/articles/new"
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all"
              >
                Write First Article
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

function EngagementCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
       <div>
         <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
         <h2 className="text-3xl font-black text-slate-900">{value}</h2>
       </div>
       <div className={`p-4 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
         {icon}
       </div>
    </div>
  );
}
