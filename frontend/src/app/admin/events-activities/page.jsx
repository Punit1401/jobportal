"use client";
import React, { useEffect, useState } from 'react';
import { 
  Plus, Calendar, MapPin, Users, Mail, Phone, 
  Search, Filter, Edit, Trash2, ChevronRight, 
  CheckCircle2, XCircle, Clock, Video, Info,
  ExternalLink, Download, UserCheck, MessageSquare
} from 'lucide-react';

export default function AdminEventsManager() {
  const [events, setEvents] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("events"); // "events" or "mailing-list"
  const [listFilter, setListFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "", category: "Job Fair", date: "", time: "", 
    location: "", meetingLink: "", description: "", targetAudience: ["All"]
  });

  useEffect(() => {
    fetchEvents();
    fetchInterests();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events');
      const data = await res.json();
      if (data.success) setEvents(data.events);
    } catch (err) { console.error(err); }
  };

  const fetchInterests = async () => {
    try {
      const res = await fetch('/api/admin/events/interests');
      const data = await res.json();
      if (data.success) setInterests(data.interests);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingEvent ? 'PUT' : 'POST';
      const url = editingEvent ? `/api/admin/events/${editingEvent._id}` : '/api/admin/events';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowModal(false);
        setEditingEvent(null);
        setFormData({ title: "", category: "Job Fair", date: "", time: "", location: "", meetingLink: "", description: "", targetAudience: ["All"] });
        fetchEvents();
      }
    } catch (err) { console.error(err); }
  };

  const deleteEvent = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      if (res.ok) fetchEvents();
    } catch (err) { console.error(err); }
  };

  const saveToMailingSystem = () => {
    const currentInterests = interests.filter(i => listFilter === "All" || i.userRole === listFilter);
    if (currentInterests.length === 0) return alert("No users in the current list to save!");
    
    const listName = prompt("Enter a name for this Mailing List (for Mailing System):");
    if (!listName) return;

    // Format users for the Mailing System
    const customList = currentInterests.map(i => ({
      _id: i.userId,
      name: i.userData?.name || "Unknown",
      email: i.userData?.email,
      phone: i.userData?.phone,
      role: i.userRole
    }));

    const newList = {
      id: Date.now(),
      name: listName,
      count: customList.length,
      users: customList
    };

    const savedLists = JSON.parse(localStorage.getItem("permanentSavedLists") || "[]");
    savedLists.push(newList);
    localStorage.setItem("permanentSavedLists", JSON.stringify(savedLists));
    alert("✅ List Saved Successfully to Mailing System!");
  };

  return (
    <div className="min-h-screen bg-[#FDFEFF] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Events & Activities</h1>
            <p className="text-slate-500 font-medium italic">Manage platform events and monitor user interest levels.</p>
          </div>
          <button 
            onClick={() => { setEditingEvent(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            <Plus size={20} /> Create New Event
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 bg-slate-50 p-2 rounded-[24px] w-fit border border-slate-100">
           {["events", "mailing-list"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                 {tab === "events" ? "All Events" : "Interest Mailing List"}
              </button>
           ))}
        </div>

        {activeTab === "events" ? (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map((event) => (
                 <div key={event._id} className="bg-white rounded-[32px] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-indigo-50 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                       <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                          {event.category}
                       </span>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingEvent(event); setFormData(event); setShowModal(true); }} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600"><Edit size={18} /></button>
                          <button onClick={() => deleteEvent(event._id)} className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"><Trash2 size={18} /></button>
                       </div>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-4">{event.title}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                       <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                          <Calendar size={18} className="text-indigo-400" />
                          {new Date(event.date).toLocaleDateString()}
                       </div>
                       <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                          <Clock size={18} className="text-indigo-400" />
                          {event.time || "TBD"}
                       </div>
                       <div className="flex items-center gap-3 text-slate-500 font-medium text-sm col-span-2">
                          <MapPin size={18} className="text-indigo-400" />
                          {event.location || "Online"}
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                       <div className="flex -space-x-3">
                          {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">?</div>)}
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {interests.filter(i => i.eventId?._id === event._id).length} People Interested
                       </span>
                    </div>
                 </div>
              ))}
           </div>
        ) : (
           <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Interest Mailing List</h3>
                    <p className="text-slate-400 text-xs font-medium mt-1 italic">Contact details of users who expressed interest in specific events.</p>
                 </div>
                 <div className="flex gap-2">
                    {["All", "candidate", "recruiter", "serviceprovider"].map(role => (
                        <button key={role} onClick={() => setListFilter(role)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${listFilter === role ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border text-slate-500 hover:bg-slate-50'}`}>
                            {role === "All" ? "All" : role + "s"}
                        </button>
                    ))}
                 </div>
                 <div className="flex gap-2">
                    <button onClick={saveToMailingSystem} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all">
                       <Mail size={16} /> Save to Mailing List
                    </button>
                    <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                       <Download size={16} /> Export CSV
                    </button>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/80">
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Candidate / User</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Info</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Event Title</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Time</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {interests.filter(i => listFilter === "All" || i.userRole === listFilter).map((interest) => (
                          <tr key={interest._id} className="hover:bg-indigo-50/30 transition-colors group">
                             <td className="p-6">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs">
                                      {interest.userData?.name?.charAt(0) || "U"}
                                   </div>
                                   <span className="text-sm font-black text-slate-900">{interest.userData?.name}</span>
                                </div>
                             </td>
                             <td className="p-6">
                                <div className="flex flex-col gap-1">
                                   <div className="flex items-center gap-2 text-slate-500 text-xs font-medium italic"><Mail size={12} /> {interest.userData?.email}</div>
                                   <div className="flex items-center gap-2 text-slate-500 text-xs font-medium italic"><Phone size={12} /> {interest.userData?.phone || "N/A"}</div>
                                </div>
                             </td>
                             <td className="p-6">
                                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                   {interest.userRole}
                                </span>
                             </td>
                             <td className="p-6">
                                <span className="text-xs font-bold text-slate-700">{interest.eventId?.title}</span>
                             </td>
                             <td className="p-6">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                   {new Date(interest.createdAt).toLocaleDateString()}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {/* Modal */}
        {showModal && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                 <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                    <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all"><XCircle size={24} /></button>
                 </div>
                 <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Basic Info Section */}
                    <div className="space-y-6">
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2.5 block">Event Title</label>
                          <input 
                            type="text" 
                            required 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})} 
                            className="w-full px-6 py-4 bg-slate-50 rounded-[20px] border-2 border-transparent focus:border-indigo-500/20 focus:bg-white outline-none font-bold text-slate-900 transition-all placeholder:text-slate-300" 
                            placeholder="E.g. Annual Tech Job Fair 2026" 
                          />
                       </div>

                       <div className="grid grid-cols-2 gap-6">
                          <div>
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2.5 block">Category</label>
                             <select 
                               value={formData.category} 
                               onChange={e => setFormData({...formData, category: e.target.value})} 
                               className="w-full px-6 py-4 bg-slate-50 rounded-[20px] border-2 border-transparent focus:border-indigo-500/20 focus:bg-white outline-none font-bold text-slate-900 appearance-none cursor-pointer"
                             >
                                {["Job Fair", "Webinar", "Seminar", "Workshop", "Training", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
                             </select>
                          </div>
                          <div>
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2.5 block">Date</label>
                             <input 
                               type="date" 
                               required 
                               value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ""} 
                               onChange={e => setFormData({...formData, date: e.target.value})} 
                               className="w-full px-6 py-4 bg-slate-50 rounded-[20px] border-2 border-transparent focus:border-indigo-500/20 focus:bg-white outline-none font-bold text-slate-900 transition-all" 
                             />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-6">
                          <div>
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2.5 block">Start Time</label>
                             <div className="relative">
                                <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                  type="time" 
                                  value={formData.time} 
                                  onChange={e => setFormData({...formData, time: e.target.value})} 
                                  className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-[20px] border-2 border-transparent focus:border-indigo-500/20 focus:bg-white outline-none font-bold text-slate-900 transition-all" 
                                />
                             </div>
                          </div>
                          <div>
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2.5 block">Location / Mode</label>
                             <div className="relative">
                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                  type="text" 
                                  value={formData.location} 
                                  onChange={e => setFormData({...formData, location: e.target.value})} 
                                  className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-[20px] border-2 border-transparent focus:border-indigo-500/20 focus:bg-white outline-none font-bold text-slate-900 transition-all placeholder:text-slate-300" 
                                  placeholder="Ahmedabad or Online" 
                                />
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2.5 block">Target Audience</label>
                       <select 
                          value={formData.targetAudience?.[0] || "All"} 
                          onChange={e => setFormData({...formData, targetAudience: [e.target.value]})} 
                          className="w-full px-6 py-4 bg-slate-50 rounded-[20px] border-2 border-transparent focus:border-indigo-500/20 focus:bg-white outline-none font-bold text-slate-900 appearance-none cursor-pointer"
                       >
                          {["All", "Candidate", "Recruiter", "ServiceProvider"].map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>

                    {/* Media Section */}
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block">Event Banner (Thumbnail)</label>
                       <div className="group relative overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-8 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300">
                          <div className="flex flex-col items-center justify-center gap-4">
                             {formData.thumbnail ? (
                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                                   <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <p className="text-white text-[10px] font-black uppercase tracking-widest">Change Image</p>
                                   </div>
                                </div>
                             ) : (
                                <>
                                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-indigo-500 shadow-sm border border-slate-100">
                                      <Plus size={32} />
                                   </div>
                                   <div className="text-center">
                                      <p className="text-slate-600 font-bold text-sm">Upload Event Banner</p>
                                      <p className="text-slate-400 text-[10px] font-medium mt-1">Recommended: 1200 x 800px (Max 2MB)</p>
                                   </div>
                                </>
                             )}
                             <input 
                               type="file" 
                               accept="image/*" 
                               onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (!file) return;
                                  const uploadFormData = new FormData();
                                  uploadFormData.append("file", file);
                                  const res = await fetch("/api/admin/events/upload", {
                                     method: "POST",
                                     body: uploadFormData
                                  });
                                  const data = await res.json();
                                  if (data.url) setFormData({...formData, thumbnail: data.url});
                               }} 
                               className="absolute inset-0 opacity-0 cursor-pointer"
                             />
                          </div>
                       </div>
                    </div>

                    {/* Description Section */}
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2.5 block">Event Description</label>
                       <textarea 
                         rows="4" 
                         value={formData.description} 
                         onChange={e => setFormData({...formData, description: e.target.value})} 
                         className="w-full px-6 py-4 bg-slate-50 rounded-[24px] border-2 border-transparent focus:border-indigo-500/20 focus:bg-white outline-none font-bold text-slate-900 transition-all placeholder:text-slate-300 resize-none" 
                         placeholder="Describe what the event is about..."
                       ></textarea>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6">
                       <button 
                         type="submit" 
                         className="flex-1 bg-indigo-600 text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                       >
                          {editingEvent ? 'Save Changes' : 'Publish Event'}
                       </button>
                       <button 
                         type="button" 
                         onClick={() => setShowModal(false)} 
                         className="px-8 bg-slate-100 text-slate-600 py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-200 transition-all active:scale-95"
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
