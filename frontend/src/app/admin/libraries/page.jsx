"use client";
import React, { useEffect, useState } from 'react';
import { 
  Plus, Search, Video, FileText, Play, Edit2, Trash2, 
  ExternalLink, CheckCircle2, XCircle, RotateCcw, 
  Filter, MoreVertical, LayoutGrid, List, AlertCircle, Loader2
} from 'lucide-react';

export default function AdminLibraryManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Active",
    priority: "Medium",
    category: "All",
    videoUrl: "",
    thumbnail: "",
  });

  const categories = ["All", "Candidates", "Recruiters", "Service Providers"];
  const endpoint = "/api/admin/modules/libraries";

  useEffect(() => {
    fetchItems();
  }, []);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingVideo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/libraries/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, videoUrl: data.url }));
        alert("Video uploaded successfully!");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading file");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingThumbnail(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/libraries/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, thumbnail: data.url }));
        alert("Thumbnail uploaded successfully!");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading file");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title || "",
        description: item.description || "",
        status: item.status || "Active",
        priority: item.priority || "Medium",
        category: item.meta?.category || "All",
        videoUrl: item.meta?.videoUrl || "",
        thumbnail: item.meta?.thumbnail || "",
      });
    } else {
      setEditingItem(null);
      setForm({
        title: "",
        description: "",
        status: "Active",
        priority: "Medium",
        category: "All",
        videoUrl: "",
        thumbnail: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        meta: {
          category: form.category,
          videoUrl: form.videoUrl,
          thumbnail: form.thumbnail
        }
      };

      if (editingItem) payload.id = editingItem._id;

      const res = await fetch(endpoint, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchItems();
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
      fetchItems();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === "All" || item.meta?.category === activeCategory;
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                   <Video size={24} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Knowledge Library Admin</h1>
             </div>
             <p className="text-slate-500 font-medium">Create and manage guidance videos, tutorials and training resources.</p>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-[20px] font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={18} /> Add New Resource
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-5 rounded-[32px] border border-slate-200 shadow-sm mb-8 flex flex-wrap items-center gap-6">
           <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Search by title or description..."
                className="w-full pl-14 pr-4 py-3.5 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {categories.map(cat => (
                 <button
                   key={cat}
                   onClick={() => setActiveCategory(cat)}
                   className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                     activeCategory === cat ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'
                   }`}
                 >
                   {cat}
                 </button>
              ))}
           </div>

           <div className="flex border-l border-slate-100 pl-6 gap-2">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <List size={20} />
              </button>
              <button onClick={fetchItems} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all ml-2">
                 <RotateCcw size={20} />
              </button>
           </div>
        </div>

        {/* Content Area */}
        {loading ? (
           <div className="py-40 flex flex-col items-center gap-4">
              <Loader2 size={48} className="animate-spin text-indigo-600" />
              <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Loading Resources...</p>
           </div>
        ) : filteredItems.length === 0 ? (
           <div className="py-40 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
              <div className="inline-flex p-10 bg-slate-50 rounded-full text-slate-200 mb-6">
                 <AlertCircle size={64} />
              </div>
              <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">No Resources Found</h3>
              <p className="text-slate-300 font-medium mt-2">Try adjusting your filters or add your first resource.</p>
           </div>
        ) : viewMode === "grid" ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map(item => (
                 <ResourceCard key={item._id} item={item} onEdit={handleOpenModal} onDelete={handleDelete} />
              ))}
           </div>
        ) : (
           <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                       <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Resource</th>
                       <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Audience</th>
                       <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                       <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredItems.map(item => (
                       <tr key={item._id} className="hover:bg-slate-50/50 transition-all">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                   <Video size={20} />
                                </div>
                                <div>
                                   <p className="font-bold text-slate-900">{item.title}</p>
                                   <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
                                {item.meta?.category || "All"}
                             </span>
                          </td>
                          <td className="px-8 py-5">
                             <div className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase ${item.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {item.status === 'Active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                {item.status}
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex justify-end gap-2">
                                <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                   <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(item._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                                   <Trash2 size={16} />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}

        {/* Modal Overlay */}
        {isModalOpen && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                 <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <div>
                       <h2 className="text-2xl font-black text-slate-900">{editingItem ? "Edit Resource" : "Add New Resource"}</h2>
                       <p className="text-slate-500 text-sm font-medium">Fill in the details for the guidance video</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                       <Plus size={20} className="rotate-45" />
                    </button>
                 </div>

                 <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2 md:col-span-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource Title</label>
                          <input 
                            required
                            type="text"
                            placeholder="e.g. How to complete your KYC"
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm"
                            value={form.title}
                            onChange={e => setForm({...form, title: e.target.value})}
                          />
                       </div>

                       <div className="space-y-2 md:col-span-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                          <textarea 
                            placeholder="Briefly describe what this video covers..."
                            rows={3}
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm resize-none"
                            value={form.description}
                            onChange={e => setForm({...form, description: e.target.value})}
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                          <select 
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-black text-xs uppercase"
                            value={form.category}
                            onChange={e => setForm({...form, category: e.target.value})}
                          >
                             {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                          <select 
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-black text-xs uppercase"
                            value={form.status}
                            onChange={e => setForm({...form, status: e.target.value})}
                          >
                             <option value="Active">Active</option>
                             <option value="Inactive">Inactive</option>
                             <option value="Pending">Pending Review</option>
                          </select>
                       </div>

                       <div className="space-y-2 md:col-span-2">
                           <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Video Resource (Upload File or Link)</label>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="relative group">
                                 <input 
                                   type="file" 
                                   accept="video/*"
                                   onChange={handleVideoUpload}
                                   className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                 />
                                 <div className={`w-full py-4 px-6 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${uploadingVideo ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 group-hover:border-indigo-300'}`}>
                                    {uploadingVideo ? (
                                       <Loader2 size={18} className="animate-spin text-indigo-600" />
                                    ) : (
                                       <Plus size={18} className="text-slate-400 group-hover:text-indigo-600" />
                                    )}
                                    <span className="text-xs font-bold text-slate-500">{uploadingVideo ? 'Uploading Video...' : 'Upload Video File'}</span>
                                 </div>
                              </div>
                              <div className="relative">
                                 <Video className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                 <input 
                                   type="text"
                                   placeholder="Or paste Video URL (YouTube/Vimeo)"
                                   className="w-full pl-14 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm"
                                   value={form.videoUrl}
                                   onChange={e => setForm({...form, videoUrl: e.target.value})}
                                 />
                              </div>
                           </div>
                           {form.videoUrl && (
                              <p className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                                 <CheckCircle2 size={12} /> Resource Linked: {form.videoUrl}
                              </p>
                           )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                           <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Thumbnail Image (Upload File or Link)</label>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="relative group">
                                 <input 
                                   type="file" 
                                   accept="image/*"
                                   onChange={handleThumbnailUpload}
                                   className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                 />
                                 <div className={`w-full py-4 px-6 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${uploadingThumbnail ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 group-hover:border-indigo-300'}`}>
                                    {uploadingThumbnail ? (
                                       <Loader2 size={18} className="animate-spin text-indigo-600" />
                                    ) : (
                                       <Plus size={18} className="text-slate-400 group-hover:text-indigo-600" />
                                    )}
                                    <span className="text-xs font-bold text-slate-500">{uploadingThumbnail ? 'Uploading Image...' : 'Upload Image File'}</span>
                                 </div>
                              </div>
                              <div className="relative">
                                 <input 
                                   type="text"
                                   placeholder="Or paste Image URL"
                                   className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm"
                                   value={form.thumbnail}
                                   onChange={e => setForm({...form, thumbnail: e.target.value})}
                                 />
                              </div>
                           </div>
                           {form.thumbnail && (
                              <p className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                                 <CheckCircle2 size={12} /> Thumbnail Linked: {form.thumbnail}
                              </p>
                           )}
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                       <button 
                         type="submit"
                         disabled={saving}
                         className="flex-1 bg-indigo-600 text-white py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                       >
                          {saving ? "Saving Changes..." : editingItem ? "Update Resource" : "Create Resource"}
                       </button>
                       <button 
                         type="button" 
                         onClick={() => setIsModalOpen(false)}
                         className="px-8 bg-slate-100 text-slate-500 py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                       >
                          Cancel
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}

function ResourceCard({ item, onEdit, onDelete }) {
  return (
    <div className="group bg-white rounded-[40px] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all hover:-translate-y-2 flex flex-col h-full">
       <div className="relative aspect-video bg-slate-900">
          {item.meta?.thumbnail ? (
             <img src={item.meta.thumbnail} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <Video size={40} className="text-slate-700" />
             </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm bg-black/20">
             <a href={item.meta?.videoUrl} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                <Play size={24} fill="currentColor" />
             </a>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
             <button 
               onClick={() => onEdit(item)}
               className="p-2 bg-white/90 backdrop-blur rounded-xl text-slate-600 hover:text-indigo-600 shadow-lg transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
             >
                <Edit2 size={16} />
             </button>
             <button 
               onClick={() => onDelete(item._id)}
               className="p-2 bg-white/90 backdrop-blur rounded-xl text-slate-600 hover:text-rose-600 shadow-lg transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75"
             >
                <Trash2 size={16} />
             </button>
          </div>
          <div className="absolute bottom-4 left-4">
             <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-lg">
                {item.meta?.category || "General"}
             </span>
          </div>
       </div>

       <div className="p-8 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
             <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">{item.title}</h3>
          </div>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 line-clamp-2 flex-1">
             {item.description}
          </p>
          
          <div className="flex items-center justify-between pt-6 border-t border-slate-50">
             <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${item.status === 'Active' ? 'text-emerald-500' : 'text-slate-300'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                {item.status}
             </div>
             <a href={item.meta?.videoUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <ExternalLink size={16} />
             </a>
          </div>
       </div>
    </div>
  );
}
