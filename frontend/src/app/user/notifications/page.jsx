"use client";
import React, { useState, useEffect } from 'react';
import UserSidebar from '@/components/UserSidebar';
import { Bell, Trash2, CheckCircle2, AlertCircle, Info, Settings, MoreVertical, X, ExternalLink, Loader2, Briefcase, FileText, Layers, Star, Clock } from 'lucide-react';

export default function UserNotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [sentNotifications, setSentNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("received"); // received or sent
    const [filter, setFilter] = useState("all"); // all or responses
    const [selectedUser, setSelectedUser] = useState(null);
    const [fetchingUser, setFetchingUser] = useState(false);
    const [respondingTo, setRespondingTo] = useState(null);
    const [responseMessage, setResponseMessage] = useState("");
    const [submittingResponse, setSubmittingResponse] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // Fetch Received
            const resRec = await fetch('/api/notifications?type=received');
            const dataRec = await resRec.json();
            if (dataRec.ok) setNotifications(dataRec.data);

            // Fetch Sent
            const resSent = await fetch('/api/notifications?type=sent');
            const dataSent = await resSent.json();
            if (dataSent.ok) {
                // Group by title and message to avoid flooding from broadcasts
                const grouped = [];
                const seen = new Set();
                dataSent.data.forEach(n => {
                    const key = `${n.title}-${n.message}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        grouped.push(n);
                    }
                });
                setSentNotifications(grouped);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markRead = async (id) => {
        try {
            const res = await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
            if (res.ok) {
                setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteNotif = async (id) => {
        try {
            const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setNotifications(notifications.filter(n => n._id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleViewDetails = async (notif) => {
        if (notif.type === 'JobAlert' && notif.senderId) {
            setFetchingUser(true);
            try {
                const res = await fetch(`/api/candidates?id=${notif.senderId}`);
                const data = await res.json();
                if (data.ok && data.data) {
                    setSelectedUser(data.data);
                } else if (notif.link) {
                    window.location.href = notif.link;
                }
            } catch (err) {
                console.error(err);
                if (notif.link) window.location.href = notif.link;
            } finally {
                setFetchingUser(false);
            }
        } else if (notif.link) {
            window.location.href = notif.link;
        }
    };

    const submitResponse = async () => {
        if (!responseMessage.trim()) return;
        setSubmittingResponse(true);
        try {
            const res = await fetch('/api/notifications/response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notificationId: respondingTo._id,
                    message: responseMessage,
                    originalTitle: respondingTo.title,
                    originalMessage: respondingTo.message
                })
            });
            if (res.ok) {
                alert("Response sent successfully!");
                setRespondingTo(null);
                setResponseMessage("");
                fetchNotifications(); // Refresh to show in 'Sent' tab
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmittingResponse(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
            <UserSidebar />
            
            <main className="flex-1 overflow-y-auto pt-20 lg:pt-8 lg:ml-72 transition-all duration-300">
                <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-4xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Notifications</h1>
                            <p className="text-slate-500 font-medium mt-1">Updates from recruiters and admin alerts.</p>
                        </div>
                    </div>

                    {/* Tabs & Filters */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex gap-4 p-2 bg-slate-50 rounded-[24px] w-fit">
                            <button 
                                onClick={() => setViewMode("received")}
                                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${viewMode === "received" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                            >
                                Received
                            </button>
                            <button 
                                onClick={() => setViewMode("sent")}
                                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${viewMode === "sent" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                            >
                                Sent History
                            </button>
                        </div>

                        {viewMode === "received" && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setFilter("all")}
                                    className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}
                                >
                                    All Alerts
                                </button>
                                <button 
                                    onClick={() => setFilter("responses")}
                                    className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === "responses" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"}`}
                                >
                                    Responses Only
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Loading alerts...</div>
                        ) : (viewMode === "received" 
                             ? (filter === "responses" ? notifications.filter(n => n.type === 'JobResponse' || n.title?.toLowerCase().includes('reply')) : notifications)
                             : sentNotifications
                            ).length > 0 ? (viewMode === "received" 
                             ? (filter === "responses" ? notifications.filter(n => n.type === 'JobResponse' || n.title?.toLowerCase().includes('reply')) : notifications)
                             : sentNotifications
                            ).map((notif) => (
                            <div key={notif._id} className={`p-8 rounded-[32px] border transition-all flex items-start gap-6 relative group ${notif.isRead ? 'bg-white border-slate-100' : 'bg-white border-indigo-200 shadow-xl shadow-indigo-100/20'}`}>
                                {!notif.isRead && viewMode === "received" && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-indigo-600 rounded-r-full"></div>}
                                
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                    notif.senderRole === 'Admin' ? 'bg-rose-50 text-rose-500' : 
                                    notif.type === 'JobAlert' ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'
                                }`}>
                                    {viewMode === "sent" ? <Clock size={22} /> : (notif.senderRole === 'Admin' ? <Settings size={22} /> : 
                                     notif.type === 'JobAlert' ? <CheckCircle2 size={22} /> : <Info size={22} />)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                                {viewMode === "received" ? `From ${notif.senderRole}` : `To Admin/Recruiter`}
                                            </span>
                                            <h4 className={`text-lg font-black ${notif.isRead ? 'text-slate-800' : 'text-indigo-900'}`}>{notif.title}</h4>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className={`font-medium whitespace-pre-line ${notif.isRead ? 'text-slate-500' : 'text-slate-700'}`}>{notif.message}</p>
                                    
                                    <div className="mt-6 flex flex-wrap gap-3 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                        {!notif.isRead && viewMode === "received" && <button onClick={() => markRead(notif._id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all">Mark Read</button>}
                                        
                                        {viewMode === "received" && (notif.title?.toLowerCase().includes("no job") || notif.message?.toLowerCase().includes("no job")) ? (
                                            <button 
                                                onClick={() => setRespondingTo(notif)}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2"
                                            >
                                                Response <Bell size={12} />
                                            </button>
                                        ) : notif.link && (
                                            <button 
                                                onClick={() => handleViewDetails(notif)} 
                                                disabled={fetchingUser}
                                                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {fetchingUser ? "Loading..." : <>View Details <ExternalLink size={12} /></>}
                                            </button>
                                        )}
                                        
                                        <button onClick={() => deleteNotif(notif._id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-20 text-center bg-white rounded-[32px] border border-dashed border-slate-200 text-slate-400 font-bold">
                                <Bell size={48} className="mx-auto mb-4 opacity-10" />
                                <p>You're all caught up! No new notifications.</p>
                            </div>
                        )}
                    </div>

                    {/* --- RESPONSE MODAL --- */}
                    {respondingTo && (
                        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
                            <div className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">Send Response</h3>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Re: {respondingTo.title}</p>
                                    </div>
                                    <button onClick={() => setRespondingTo(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={20} /></button>
                                </div>
                                
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-xs text-slate-500 italic font-medium">"{respondingTo.message}"</p>
                                </div>

                                <textarea 
                                    value={responseMessage}
                                    onChange={(e) => setResponseMessage(e.target.value)}
                                    placeholder="Type your reply here..."
                                    rows="5"
                                    className="w-full p-6 bg-slate-50 rounded-3xl border-0 focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium resize-none"
                                />

                                <button 
                                    onClick={submitResponse}
                                    disabled={submittingResponse || !responseMessage.trim()}
                                    className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                                >
                                    {submittingResponse ? "Sending..." : "Submit Response"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- FULL DETAILS SLIDE-OVER --- */}
                    {selectedUser && (
                        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[200] flex justify-end">
                            <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-0 overflow-y-auto animate-in slide-in-from-right duration-300">
                                <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 md:p-6 flex justify-between items-center z-10">
                                    <div>
                                        <h2 className="text-lg md:text-xl font-black text-slate-900">User Profile</h2>
                                        <p className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase">Status: {selectedUser.presentEmploymentStatus || "Immediate Joiner"}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><X size={20} /></button>
                                    </div>
                                </div>

                                <div className="p-4 md:p-8 space-y-8 md:space-y-10 pb-32">
                                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl">
                                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                                            <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-2xl md:text-4xl font-black">
                                                {selectedUser.fullName?.charAt(0)}
                                            </div>
                                            <div className="text-center md:text-left">
                                                <h3 className="text-2xl md:text-3xl font-black mb-1">{selectedUser.fullName}</h3>
                                                <p className="text-indigo-300 font-bold text-base md:text-lg">{selectedUser.profession || selectedUser.currentDesignation || "Job Seeker"}</p>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                                                    <span className="bg-white/10 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold border border-white/10 flex items-center gap-1 uppercase tracking-widest"><Layers size={10} /> {selectedUser.industry || "General"}</span>
                                                    <span className="bg-white/10 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold border border-white/10 flex items-center gap-1 uppercase tracking-widest"><Star size={10} /> {selectedUser.experience || "Fresher"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</p>
                                            <p className="font-bold text-slate-800 break-all text-sm">{selectedUser.email}</p>
                                        </div>
                                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</p>
                                            <p className="font-bold text-slate-800 text-sm">{selectedUser.mobile || 'Not Linked'}</p>
                                        </div>
                                    </div>

                                    {selectedUser.workExperiences?.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-[0.2em]"><Briefcase size={16} /> Work History</div>
                                            {selectedUser.workExperiences.map((exp, i) => (
                                                <div key={i} className="relative border-l-2 border-indigo-100 pl-8 space-y-2">
                                                    <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                                                    <h4 className="text-xl font-black text-slate-800">{exp.companyName}</h4>
                                                    <p className="text-indigo-600 font-black text-xs bg-indigo-50 px-2 py-1 rounded-md inline-block uppercase tracking-wider">{exp.designation}</p>
                                                    <p className="text-slate-400 text-[10px] font-black uppercase mt-1">{exp.fromDate} — {exp.toDate || "Present"}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">Top Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedUser.skills && selectedUser.skills.split(',').map((skill, i) => (
                                                <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl text-[10px] font-black border border-purple-100 uppercase">{skill.trim()}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        {selectedUser.resumeUrl && (
                                            <a href={selectedUser.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-6 bg-indigo-600 rounded-[2rem] text-white hover:bg-indigo-700 transition-all group shadow-xl shadow-indigo-200/50">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-white/20 p-3 rounded-2xl group-hover:scale-110 transition-transform"><FileText size={24} /></div>
                                                    <div>
                                                        <p className="font-black text-lg">Download Resume</p>
                                                        <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Verify Credentials</p>
                                                    </div>
                                                </div>
                                                <ExternalLink size={20} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}