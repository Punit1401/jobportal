"use client";

import { useState } from "react";
import { 
  Send, Loader2, Image as ImageIcon, 
  X, CheckCircle2, AlertCircle, FileText,
  Layout, Type, Tag
} from "lucide-react";
import { motion } from "framer-motion";

export default function ArticleSubmissionForm() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    thumbnail: "",
    category: "Career Advice"
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setFormData({ ...formData, thumbnail: reader.result });
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) setSubmitted(true);
    } catch (err) {
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="bg-emerald-50 border border-emerald-100 p-12 rounded-[3rem] text-center space-y-6">
       <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-100">
         <CheckCircle2 size={40} />
       </div>
       <h2 className="text-3xl font-black text-slate-900">Submitted for Review!</h2>
       <p className="text-slate-600 font-medium italic max-w-md mx-auto">
         Your article has been sent to our editorial team. Once approved, it will be live on the platform journal.
       </p>
       <button 
         onClick={() => setSubmitted(false)}
         className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline pt-4"
       >
         Write Another Article
       </button>
    </div>
  );

  return (
    <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-bl-[6rem] -mr-10 -mt-10 pointer-events-none"></div>
      
      <div className="relative z-10 space-y-10">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-100">
             <FileText size={28} />
           </div>
           <div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Write an Article</h2>
             <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Share your expertise with the community</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
           {/* Thumbnail Upload */}
           <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cover Image</label>
             <div className="flex items-center gap-6">
                <div className="w-40 aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden relative group">
                  {formData.thumbnail ? (
                    <img src={formData.thumbnail} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                       <ImageIcon size={32} />
                       <span className="text-[8px] font-black mt-2">16:9 Ratio</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="flex-1">
                   <p className="text-xs font-bold text-slate-500 italic">"A great cover image increases engagement by up to 40%."</p>
                </div>
             </div>
           </div>

           {/* Title */}
           <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
               <Type size={12}/> Article Title
             </label>
             <input 
               type="text"
               required
               placeholder="Enter a catchy headline..."
               value={formData.title}
               onChange={(e) => setFormData({ ...formData, title: e.target.value })}
               className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-xl text-slate-800 placeholder:text-slate-300"
             />
           </div>

           {/* Category */}
           <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
               <Tag size={12}/> Category
             </label>
             <div className="flex flex-wrap gap-2">
                {["Career Advice", "Hiring Trends", "Skill Development", "Industry News"].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: c })}
                    className={`px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                      formData.category === c 
                      ? "bg-slate-900 text-white shadow-lg" 
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {c}
                  </button>
                ))}
             </div>
           </div>

           {/* Content */}
           <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
               <Layout size={12}/> Body Content
             </label>
             <textarea 
               required
               rows={10}
               placeholder="Write your insights here... Support your points with data or real-world examples."
               value={formData.content}
               onChange={(e) => setFormData({ ...formData, content: e.target.value })}
               className="w-full px-8 py-6 bg-slate-50 rounded-[3rem] border border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-slate-700 italic leading-relaxed"
             />
           </div>

           <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
              <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
              <p className="text-xs font-bold text-amber-700 leading-relaxed">
                By submitting, you agree that your content will be reviewed for quality and authenticity before being published.
              </p>
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
           >
             {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Submit for Approval</>}
           </button>
        </form>
      </div>
    </div>
  );
}
