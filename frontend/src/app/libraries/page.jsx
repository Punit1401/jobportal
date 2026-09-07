"use client";
import React, { useEffect, useState } from 'react';
import { Play, Search, Filter, Loader2, Video, FileText, ChevronRight, Layout, ArrowRight, X } from 'lucide-react';
import UserSidebar from '@/components/UserSidebar';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import ServiceProviderSidebar from '@/components/Serviceprovidersidbar'; // Assuming this name
import { useSession } from "next-auth/react";

export default function KnowledgeLibrary() {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const userRole = session?.user?.role || "candidate";

  useEffect(() => {
    fetchLibraryItems();
  }, []);

  const fetchLibraryItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/modules/libraries');
      const data = await res.json();
      if (data.success) {
        setItems(data.items.filter(i => i.status === 'Active'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Role-based filtering logic
  const filteredItems = items.filter(item => {
    const itemCategory = item.meta?.category || "All";
    
    let isRoleMatch = false;
    if (userRole === "admin" || userRole === "staff") {
      isRoleMatch = true; // Admin sees everything
    } else if (userRole === "candidate" || userRole === "user") {
      isRoleMatch = itemCategory === "Candidates" || itemCategory === "All";
    } else if (userRole === "recruiter") {
      isRoleMatch = itemCategory === "Recruiters" || itemCategory === "All";
    } else if (userRole === "serviceprovider") {
      isRoleMatch = itemCategory === "Service Providers" || itemCategory === "All";
    }

    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return isRoleMatch && matchesSearch;
  });

  const handlePlay = (item) => {
    const url = item.meta?.videoUrl;
    if (!url) return;

    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
        window.open(url, '_blank');
    } else {
        setSelectedVideo(item);
    }
  };

  // ✅ Sidebar selection based on role
  const renderSidebar = () => {
    if (userRole === "recruiter") return <RecruiterSidebar onCollapseChange={setIsSidebarCollapsed} />;
    if (userRole === "serviceprovider") return <ServiceProviderSidebar onCollapseChange={setIsSidebarCollapsed} />;
    return <UserSidebar onCollapseChange={setIsSidebarCollapsed} />;
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#FDFEFF] overflow-hidden">
      {renderSidebar()}

      <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${
        (userRole === "recruiter" || userRole === "serviceprovider")
          ? "p-4 sm:p-6 md:p-8 lg:p-12 w-full overflow-x-hidden"
          : (isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72")
      }`}>

        <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-7xl mx-auto">
          
          <header className="mb-10 flex justify-between items-end border-b border-slate-100 pb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Knowledge Library</h1>
              <p className="text-slate-500 font-medium">Resources curated specifically for <span className="text-indigo-600 font-bold uppercase tracking-wider">{userRole}</span> profile.</p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                <Video size={14} /> {filteredItems.length} Available Resources
              </div>
            </div>
          </header>

          {/* Search */}
          <div className="mb-10 max-w-2xl">
             <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search in your guidance library..."
                  className="w-full pl-14 pr-4 py-4.5 bg-slate-50 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white font-medium text-sm transition-all border border-transparent focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 size={48} className="animate-spin text-indigo-600" />
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Preparing your library...</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.map(item => (
                   <div key={item._id} className="group bg-white rounded-[40px] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 transition-all hover:-translate-y-2">
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                         {item.meta?.thumbnail ? (
                            <img src={item.meta.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                               <Video size={48} className="text-white opacity-40" />
                            </div>
                         )}
                         <div className="absolute inset-0 flex items-center justify-center">
                            <button 
                              onClick={() => handlePlay(item)}
                              className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:scale-110 transition-all hover:bg-indigo-600 shadow-2xl"
                            >
                               <Play size={28} fill="currentColor" />
                            </button>
                         </div>
                         <div className="absolute bottom-4 left-4">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-lg">
                               {item.meta?.category}
                            </span>
                         </div>
                      </div>

                      <div className="p-8">
                         <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                         <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 line-clamp-2">
                            {item.description || "Learn how to use our platform more effectively with this step-by-step guidance video."}
                         </p>
                         
                         <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                               <FileText size={14} /> Guide
                            </div>
                            <button 
                              onClick={() => handlePlay(item)}
                              className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:gap-3 transition-all"
                            >
                               Watch Now <ArrowRight size={14} />
                            </button>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          )}

          {!loading && filteredItems.length === 0 && (
             <div className="py-40 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                <div className="inline-flex p-10 bg-white rounded-full text-slate-200 mb-6 shadow-sm">
                   <Video size={64} />
                </div>
                <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">No resources found</h3>
                <p className="text-slate-300 font-medium mt-2">We haven't added specific guides for your role yet. Check back soon!</p>
             </div>
          )}
        </div>
      </main>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
           <button 
             onClick={() => setSelectedVideo(null)}
             className="absolute top-6 right-6 p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-[210] hover:rotate-90"
           >
              <X size={32} />
           </button>
           
           <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-white/10">
              <video 
                src={selectedVideo.meta?.videoUrl} 
                controls 
                autoPlay 
                className="w-full h-full"
              />
           </div>

           <div className="mt-8 text-center max-w-2xl">
              <h2 className="text-3xl font-black text-white mb-2">{selectedVideo.title}</h2>
              <p className="text-slate-400 font-medium">{selectedVideo.description}</p>
           </div>
        </div>
      )}
    </div>
  );
}
