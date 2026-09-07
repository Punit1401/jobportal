"use client";

import { useState, useEffect } from "react";
import { 
  Search, Filter, Calendar, Briefcase, 
  ChevronRight, Loader2, Image as ImageIcon, FileText,
  ArrowRight, Download, Share2, Info, Eye, X
} from "lucide-react";
import Footer from "@/components/Footer";

export default function BulkVacanciesGallery() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedVacancy, setSelectedVacancy] = useState(null);

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const res = await fetch("/api/admin/bulk-vacancies");
        const data = await res.json();
        setVacancies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVacancies();
  }, []);

  const filtered = vacancies.filter(v => {
    const matchesType = typeFilter === "All" || v.type === typeFilter;
    const matchesSearch = (v.title || "").toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDownload = (vacancy) => {
    if (!vacancy || !vacancy.image) return;
    const isPdf = vacancy.fileType === "pdf" || vacancy.image.startsWith("data:application/pdf") || vacancy.image.includes("%PDF");
    const link = document.createElement("a");
    link.href = vacancy.image;
    link.download = `${vacancy.title.replace(/\s+/g, "_")}${isPdf ? ".pdf" : ".png"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = (vacancy) => {
    if (navigator.share) {
      navigator.share({
        title: vacancy.title,
        text: `Check out this job vacancy alert: ${vacancy.title}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Vacancy link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-white to-indigo-50 font-sans overflow-hidden">
      
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-100/30 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600/10 text-indigo-600 rounded-full border border-indigo-100 backdrop-blur-sm">
            <Briefcase size={16} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Live Job Alerts</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
            Bulk <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Vacancies</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Latest recruitment notifications for Govt & Private sectors. 
            Direct image & PDF document alerts updated daily.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[3rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] mb-16 space-y-6 md:space-y-0 md:flex items-center gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search vacancies by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-bold text-slate-700 shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {["All", "Govt", "Pvt"].map(cat => (
              <button
                key={cat}
                onClick={() => setTypeFilter(cat)}
                className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                  typeFilter === cat 
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105" 
                  : "bg-white text-slate-500 border border-slate-100 hover:border-indigo-200"
                }`}
              >
                {cat} Jobs
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="relative w-20 h-20">
               <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-8 font-black text-slate-400 uppercase text-xs tracking-[0.3em]">Synchronizing Database...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((v, idx) => {
              const isPdf = v.fileType === "pdf" || (v.image && (v.image.startsWith("data:application/pdf") || v.image.includes("%PDF")));
              return (
                <div 
                  key={v._id} 
                  className="group relative bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-700 hover:-translate-y-4 cursor-pointer"
                  onClick={() => setSelectedVacancy(v)}
                >
                  {/* File Container */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-50 flex items-center justify-center">
                    {isPdf ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-6 group-hover:scale-105 transition-transform duration-700 text-center">
                        <FileText size={72} className="text-red-500 mb-3 animate-pulse" />
                        <span className="text-xs font-black uppercase text-slate-200 tracking-wider line-clamp-2 px-4">
                          {v.fileName || v.title + ".pdf"}
                        </span>
                        <span className="mt-3 px-4 py-1.5 bg-red-600/90 text-white text-[10px] font-black uppercase rounded-full tracking-widest shadow-lg">
                          PDF Document Alert
                        </span>
                      </div>
                    ) : (
                      <img 
                        src={v.image} 
                        alt={v.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                    )}
                    
                    {/* Badge */}
                    <div className="absolute top-6 left-6 z-10">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md ${
                        v.type === "Govt" ? "bg-amber-400/90 text-white" : "bg-emerald-500/90 text-white"
                      }`}>
                        {v.type} VACANCY
                      </span>
                    </div>

                    {/* Overlay Tools */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8 z-10">
                      <div className="flex gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedVacancy(v); }} 
                          className="flex-1 bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all transform translate-y-10 group-hover:translate-y-0 duration-700 flex items-center justify-center gap-2"
                        >
                          <Eye size={16} /> {isPdf ? "View PDF" : "View Poster"}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDownload(v); }}
                          className="p-4 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white hover:text-slate-900 transition-all transform translate-y-10 group-hover:translate-y-0 duration-700 delay-75"
                          title="Download File"
                        >
                          <Download size={20} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleShare(v); }}
                          className="p-4 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white hover:text-slate-900 transition-all transform translate-y-10 group-hover:translate-y-0 duration-700 delay-100"
                          title="Share Link"
                        >
                          <Share2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                      <Calendar size={14} />
                      Posted on {new Date(v.createdAt).toLocaleDateString()}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                      {v.title}
                    </h3>
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Info size={14} />
                        <span className="text-[10px] font-bold uppercase italic">
                          Expires in {Math.max(0, Math.ceil((new Date(v.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)))} days
                        </span>
                      </div>
                      <ArrowRight className="text-indigo-600 transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>

                  {/* Index Number Decorative */}
                  <div className="absolute -bottom-4 -right-4 text-8xl font-black text-slate-50 pointer-events-none group-hover:text-indigo-50/50 transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-40 bg-white/40 rounded-[4rem] border-2 border-dashed border-slate-100">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <ImageIcon size={40} className="text-slate-200" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">No Vacancies Found</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
              We couldn't find any job alerts matching your criteria. 
              Try adjusting your filters or check back later for new updates.
            </p>
            <button 
              onClick={() => { setTypeFilter("All"); setSearch(""); }}
              className="text-indigo-600 font-black uppercase text-xs tracking-widest flex items-center gap-2 mx-auto hover:gap-4 transition-all"
            >
              Reset Filters <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* FULL VACANCY DETAILS & PDF / IMAGE MODAL */}
        {selectedVacancy && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
              
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1 rounded-full text-xs font-black uppercase text-white ${
                    selectedVacancy.type === "Govt" ? "bg-amber-500" : "bg-emerald-500"
                  }`}>
                    {selectedVacancy.type} VACANCY
                  </span>
                  <h3 className="text-xl font-black text-slate-900 line-clamp-1">
                    {selectedVacancy.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedVacancy(null)}
                  className="text-slate-400 hover:text-slate-900 font-black text-2xl p-2 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="bg-slate-100 rounded-2xl overflow-hidden min-h-[350px] max-h-[65vh] flex items-center justify-center relative">
                  {selectedVacancy.fileType === "pdf" || (selectedVacancy.image && (selectedVacancy.image.startsWith("data:application/pdf") || selectedVacancy.image.includes("%PDF"))) ? (
                    <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-slate-900 text-white p-4 space-y-3">
                      <div className="flex items-center justify-between w-full px-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                          <FileText className="text-red-400" size={18} /> {selectedVacancy.fileName || selectedVacancy.title + ".pdf"}
                        </span>
                        <button
                          onClick={() => handleDownload(selectedVacancy)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-lg transition-colors"
                        >
                          <Download size={14} /> Download PDF Document
                        </button>
                      </div>
                      <iframe
                        src={selectedVacancy.image}
                        className="w-full h-full rounded-xl border border-slate-700 bg-white"
                        title="PDF Document Preview"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-full flex flex-col items-center">
                      <img
                        src={selectedVacancy.image}
                        alt={selectedVacancy.title}
                        className="w-full h-full object-contain max-h-[60vh] rounded-xl"
                      />
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleDownload(selectedVacancy)}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl uppercase tracking-wider flex items-center gap-2 shadow-lg transition-colors"
                        >
                          <Download size={16} /> Download High-Res Poster
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Disclaimer Footer */}
        <div className="mt-32 p-10 bg-slate-900 rounded-[3rem] text-center space-y-4 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] relative z-10">Important Notice</p>
          <h4 className="text-white text-xl font-black relative z-10">Direct Document & Image Verification</h4>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed relative z-10 italic">
            "All vacancies shown above are based on official recruitment PDF documents and newspaper posters. 
            Candidates are advised to verify details from official department websites before applying."
          </p>
        </div>

      </div>
    </div>
  );
}
