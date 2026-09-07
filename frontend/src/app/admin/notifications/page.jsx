"use client";
import React, { useState, useEffect } from 'react';
import { Bell, Send, Users, Shield, Plus, Info, CheckCircle2, Trash2, Clock, X, Search, ChevronRight } from 'lucide-react';

export default function AdminNotificationsPage() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [targetRole, setTargetRole] = useState("all");
    const [type, setType] = useState("Info");
    const [sending, setSending] = useState(false);
    const [sentNotifications, setSentNotifications] = useState([]);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingResponses, setLoadingResponses] = useState(true);
    const [activeTab, setActiveTab] = useState("compose"); // compose or responses

    const [industries, setIndustries] = useState(["All"]);
    const [professions, setProfessions] = useState(["All"]);
    const [locations, setLocations] = useState(["All"]);
    const [filterIndustry, setFilterIndustry] = useState("All");
    const [filterProfession, setFilterProfession] = useState("All");
    const [filterLocation, setFilterLocation] = useState("All");

    const fetchSentNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications?type=sent');
            const data = await res.json();
            if (data.ok) {
                // Since broadcasting creates multiple records, we group by title & message for history
                const uniqueSent = [];
                const seen = new Set();
                
                data.data.forEach(n => {
                    const key = `${n.title}-${n.message}-${new Date(n.createdAt).getTime()}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        uniqueSent.push(n);
                    }
                });
                
                setSentNotifications(uniqueSent);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchResponses = async () => {
        setLoadingResponses(true);
        try {
            const res = await fetch('/api/notifications/response');
            const data = await res.json();
            if (data.ok) setResponses(data.data);
        } catch (error) {
            console.error("Error fetching responses:", error);
        } finally {
            setLoadingResponses(false);
        }
    };

    const fetchFilters = async () => {
        try {
            const res = await fetch('/api/notifications?type=filters');
            const data = await res.json();
            if (data.ok) {
                setIndustries(data.industries || ["All"]);
                setProfessions(data.professions || ["All"]);
                setLocations(data.locations || ["All"]);
            }
        } catch (error) {
            console.error("Error fetching filters:", error);
        }
    };

    useEffect(() => {
        fetchSentNotifications();
        fetchResponses();
        fetchFilters();
    }, []);

    const handleSend = async () => {
        if (!title || !message) return alert("Please fill all fields");
        
        setSending(true);
        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetRole,
                    title,
                    message,
                    type,
                    industry: filterIndustry,
                    profession: filterProfession,
                    location: filterLocation
                })
            });
            if (res.ok) {
                alert("Broadcast notification sent successfully!");
                setTitle("");
                setMessage("");
                fetchSentNotifications(); // Refresh history
            } else {
                const data = await res.json();
                alert(data.error || "Failed to send");
            }
        } catch (error) {
            alert("Connection error");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Notification Center</h1>
                    <p className="text-slate-500 font-medium">Broadcast messages and manage user responses.</p>
                </div>
                
                <div className="flex gap-4 p-2 bg-slate-50 rounded-[24px]">
                    <button 
                        onClick={() => setActiveTab("compose")}
                        className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "compose" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                    >
                        Compose
                    </button>
                    <button 
                        onClick={() => setActiveTab("responses")}
                        className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "responses" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                    >
                        Responses ({responses.length})
                    </button>
                </div>
            </div>

            {activeTab === "compose" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* Compose Section */}
                    <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                        <h2 className="text-xl font-black mb-8 flex items-center gap-2 text-indigo-600">
                            <Plus size={24} />
                            New Broadcast
                        </h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Target Audience</label>
                                    <select 
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                        className="w-full p-5 rounded-2xl bg-slate-50 border-0 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="all">Everyone</option>
                                        <option value="candidate">All Candidates</option>
                                        <option value="recruiter">All Recruiters</option>
                                        <option value="serviceprovider">All Service Providers</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Alert Level</label>
                                    <select 
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full p-5 rounded-2xl bg-slate-50 border-0 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="Info">Information</option>
                                        <option value="Warning">Warning</option>
                                        <option value="Success">Success</option>
                                    </select>
                                </div>
                            </div>

                            {/* Industry, Profession, and Location filters */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Industry</label>
                                    <select 
                                        value={filterIndustry}
                                        onChange={(e) => setFilterIndustry(e.target.value)}
                                        className="w-full p-5 rounded-2xl bg-slate-50 border-0 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="All">All Industries</option>
                                        {industries.filter(i => i !== "All").map((i, idx) => (
                                            <option key={idx} value={i}>{i}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Profession</label>
                                    <select 
                                        value={filterProfession}
                                        onChange={(e) => setFilterProfession(e.target.value)}
                                        className="w-full p-5 rounded-2xl bg-slate-50 border-0 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                                        disabled={targetRole === 'recruiter'}
                                    >
                                        <option value="All">All Professions</option>
                                        {professions.filter(p => p !== "All").map((p, idx) => (
                                            <option key={idx} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Location</label>
                                    <select 
                                        value={filterLocation}
                                        onChange={(e) => setFilterLocation(e.target.value)}
                                        className="w-full p-5 rounded-2xl bg-slate-50 border-0 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="All">All Locations</option>
                                        {locations.filter(l => l !== "All").map((l, idx) => (
                                            <option key={idx} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Title</label>
                                <input 
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="E.g. System Maintenance Update"
                                    className="w-full p-5 rounded-2xl bg-slate-50 border-0 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Message Body</label>
                                <textarea 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows="5"
                                    placeholder="Enter the detailed message here..."
                                    className="w-full p-6 rounded-3xl bg-slate-50 border-0 font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                                />
                            </div>

                            <button 
                                onClick={handleSend}
                                disabled={sending}
                                className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {sending ? "Processing..." : <><Send size={20} /> Blast Notification</>}
                            </button>
                        </div>
                    </div>

                    {/* Info & History Preview */}
                    <div className="space-y-8 flex flex-col">
                        <div className="bg-indigo-600 p-10 rounded-[40px] text-white shadow-xl shadow-indigo-100">
                            <h3 className="text-xl font-black mb-6">Quick Guidance</h3>
                            <ul className="space-y-5">
                                <li className="flex gap-4">
                                    <Info size={20} className="text-indigo-200 shrink-0" />
                                    <span className="text-sm font-bold opacity-90 leading-relaxed">Broadcasts are sent in real-time to all users in the selected category.</span>
                                </li>
                                <li className="flex gap-4">
                                    <CheckCircle2 size={20} className="text-indigo-200 shrink-0" />
                                    <span className="text-sm font-bold opacity-90 leading-relaxed">Notifications will appear instantly in the user's notification bell.</span>
                                </li>
                                <li className="flex gap-4">
                                    <Shield size={20} className="text-indigo-200 shrink-0" />
                                    <span className="text-sm font-bold opacity-90 leading-relaxed">Avoid spamming. Use broadcasts for essential system updates only.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex-1">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black text-slate-900">Recent Broadcasts</h3>
                                <button onClick={fetchSentNotifications} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                                    <Clock size={18} />
                                </button>
                            </div>
                            
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <p className="text-center py-10 text-slate-400 font-bold animate-pulse">Synchronizing history...</p>
                                ) : sentNotifications.length > 0 ? sentNotifications.map((notif, idx) => (
                                    <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-indigo-500 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                    <Bell size={18} className="text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm truncate max-w-[150px]">{notif.title}</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Broadcast Sent</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-3">{notif.message}</p>
                                        <div className="mt-4 pt-4 border-t border-slate-200/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all">
                                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Delivery Confirmed</span>
                                            <ChevronRight size={14} className="text-slate-300" />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-20 text-slate-300 font-bold border-2 border-dashed border-slate-100 rounded-3xl">
                                        No broadcast history found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                    <h2 className="text-xl font-black mb-8 flex items-center gap-2 text-emerald-600">
                        <Users size={24} />
                        User Responses
                    </h2>
                    
                    <div className="space-y-6">
                        {loadingResponses ? (
                            <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Fetching replies...</div>
                        ) : responses.length > 0 ? responses.map((res, idx) => (
                            <div key={idx} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-indigo-500 transition-all space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm font-black text-indigo-600">
                                            {res.senderName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900">{res.senderName}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{res.senderRole} • {res.senderEmail}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">
                                        {new Date(res.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                
                                <div className="p-6 bg-white rounded-2xl border border-slate-100">
                                    <p className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest text-[9px]">Reply To: {res.originalTitle}</p>
                                    <p className="text-slate-700 font-medium leading-relaxed">{res.message}</p>
                                </div>

                                <div className="flex gap-4">
                                    <a href={`mailto:${res.senderEmail}`} className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all">Reply via Email</a>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-slate-300 font-bold border-4 border-dashed border-slate-50 rounded-[40px]">
                                No responses received yet.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
