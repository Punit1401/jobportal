"use client";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import UserSidebar from "@/components/UserSidebar";

export default function MediaFeed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("/api/posts")
      .then(res => res.json())
      .then(data => setPosts(data.posts));
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <UserSidebar />
      <main className="flex-1 p-4 md:p-8 lg:p-12 mt-16 lg:mt-0">
        <div className="max-w-2xl mx-auto space-y-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-[30px] border border-slate-100 shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
                    {post.userName?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 leading-none">{post.userName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Candidate</p>
                  </div>
                </div>
                <button className="text-slate-400"><MoreHorizontal size={20} /></button>
              </div>
              
              <p className="text-slate-700 font-medium leading-relaxed mb-4">
                {post.content}
              </p>

              <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                <button className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-red-500 transition-all">
                  <Heart size={18} /> {post.likes?.length || 0}
                </button>
                <button className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-indigo-600 transition-all">
                  <MessageCircle size={18} /> Comment
                </button>
                <button className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-indigo-600 transition-all">
                  <Share2 size={18} /> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}