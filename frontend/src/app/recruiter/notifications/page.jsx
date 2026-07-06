"use client";
import React, { useState, useEffect } from 'react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { Bell, Check, Trash2, Clock, Users, Briefcase, Settings, MoreVertical, Star, CheckCircle2, Send, Plus, X, Search, ExternalLink, Loader2, Calendar, User, MapPin, CheckCircle, XCircle, GraduationCap, Globe, FileText, Layers, IndianRupee, Rocket } from 'lucide-react';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [sentNotifications, setSentNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("received"); // received or sent
    const [filter, setFilter] = useState("all"); // all or responses
    const [showCompose, setShowCompose] = useState(false);
    
    // Form State
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("Info");
    const [targetType, setTargetType] = useState("All");
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [sending, setSending] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [fetchingUser, setFetchingUser] = useState(false);
    const [respondingTo, setRespondingTo] = useState(null);
    const [responseMessage, setResponseMessage] = useState("");
    const [submittingResponse, setSubmittingResponse] = useState(false);

    const handleViewDetails = async (notif) => {
        if (notif.type === 'JobAlert' && notif.senderId) {
            setFetchingUser(true);
            try {
                const res = await fetch(`/api/candidates?id=${notif.senderId}`);
                const data = await res.json();
                if (data.ok && data.data) {
                    setSelectedUser(data.data);
                } else {
                    // Fallback to link if fetch fails
                    if (notif.link) window.location.href = notif.link;
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
                fetchData(); // Refresh history
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmittingResponse(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        alert(`Status ${newStatus} feature is mainly for job applications.`);
    };

    const fetchData = async () => {
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
                // Group by title and message
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

    const fetchCandidates = async () => {
        try {
            const res = await fetch('/api/recruiter/contacts');
            const data = await res.json();
            if (data.ok) setCandidates(data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchCandidates();
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

    const handleSend = async () => {
        if (!title || !message) return alert("Please fill all fields");
        
        let recipients = [];
        if (targetType === "All") {
            recipients = candidates.map(c => c.userId || c._id); // Assuming _id is userId for candidates in some contexts
            // If candidates list is from the previous fix, _id is Candidate record ID, but we need userId for Notification recipientId.
            // Wait, the Notification model recipientId should probably refer to User ID.
            // Let's check my model.
        } else {
            recipients = selectedRecipients;
        }

        if (recipients.length === 0) return alert("No recipients found");

        setSending(true);
        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientIds: recipients,
                    title,
                    message,
                    type
                })
            });
            if (res.ok) {
                alert("Notification sent successfully!");
                setShowCompose(false);
                setTitle("");
                setMessage("");
                setSelectedRecipients([]);
                fetchData(); // Refresh history
            }
        } catch (error) {
            alert("Error sending notifications");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#FDFEFF]">
            <RecruiterSidebar activePage="notifications" />
            
            <main className="flex-1 p-4 lg:p-10">
                <div className="max-w-4xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Notifications</h1>
                            <p className="text-slate-500 font-medium mt-1">Manage your alerts and broadcast to your candidates.</p>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowCompose(true)}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all"
                            >
                                <Plus size={20} />
                                Compose
                            </button>
                        </div>
                    </div>

                    {/* Tabs & Filters */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex gap-4 p-2 bg-slate-50 rounded-[24px] w-fit">
                            <button 
                                onClick={() => setViewMode("received")}
                                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${viewMode === "received" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                            >
                                Received Alerts
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
                                    All
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
                        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            <Bell size={20} className="text-indigo-600" />
                            {viewMode === "received" ? "Received Alerts" : "Outbox / Sent Messages"}
                        </h2>
                        {(viewMode === "received" 
                             ? (filter === "responses" ? notifications.filter(n => n.type === 'JobResponse' || n.title?.toLowerCase().includes('reply')) : notifications)
                             : sentNotifications
                        ).length > 0 ? (viewMode === "received" 
                             ? (filter === "responses" ? notifications.filter(n => n.type === 'JobResponse' || n.title?.toLowerCase().includes('reply')) : notifications)
                             : sentNotifications
                        ).map((notif) => (
                            <div key={notif._id} className={`p-8 rounded-[40px] border transition-all flex items-start gap-6 relative group ${notif.isRead ? 'bg-white border-slate-100' : 'bg-indigo-50/30 border-indigo-100 shadow-xl shadow-indigo-50/50'}`}>
                                {!notif.isRead && viewMode === "received" && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-indigo-600 rounded-r-full"></div>}
                                
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                                    notif.senderRole === 'Admin' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                                }`}>
                                    {viewMode === "sent" ? <Send size={24} /> : (notif.senderRole === 'Admin' ? <Settings size={24} /> : <Bell size={24} />)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                                {viewMode === "received" ? `From ${notif.senderRole}` : `To ${notif.targetRole || 'Multiple Candidates'}`}
                                            </span>
                                            <h4 className={`text-lg font-black ${notif.isRead ? 'text-slate-800' : 'text-indigo-900'}`}>{notif.title}</h4>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className={`font-medium whitespace-pre-line ${notif.isRead ? 'text-slate-500' : 'text-indigo-700/70'}`}>{notif.message}</p>
                                    
                                    <div className="mt-6 flex flex-wrap gap-3 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                        {!notif.isRead && viewMode === "received" && <button onClick={() => markRead(notif._id)} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">Mark Read</button>}
                                        
                                        {viewMode === "received" && (notif.title?.toLowerCase().includes("no job") || notif.message?.toLowerCase().includes("no job")) ? (
                                            <button 
                                                onClick={() => setRespondingTo(notif)}
                                                className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2"
                                            >
                                                Response <Bell size={12} />
                                            </button>
                                        ) : notif.link && (
                                            <button 
                                                onClick={() => handleViewDetails(notif)} 
                                                disabled={fetchingUser}
                                                className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
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
                            <div className="p-20 text-center text-slate-400 font-bold border-4 border-dashed border-slate-50 rounded-[40px]">No notifications in this category.</div>
                        )}
                    </div>

                    {/* Compose Modal */}
                    {showCompose && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                            <div className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-3xl font-black text-slate-900">Broadcast Notification</h3>
                                    <button onClick={() => setShowCompose(false)} className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Target Audience</label>
                                            <select 
                                                value={targetType}
                                                onChange={(e) => setTargetType(e.target.value)}
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                                            >
                                                <option value="All">All Candidates</option>
                                                <option value="Specific">Specific Candidates</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Alert Type</label>
                                            <select 
                                                value={type}
                                                onChange={(e) => setType(e.target.value)}
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                                            >
                                                <option value="Info">Info</option>
                                                <option value="Success">Success</option>
                                                <option value="Warning">Warning</option>
                                                <option value="JobAlert">Job Alert</option>
                                            </select>
                                        </div>
                                    </div>

                                    {targetType === "Specific" && (
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Select Candidates ({selectedRecipients.length})</label>
                                            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                                {candidates.map(c => (
                                                    <label key={c._id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-600 transition-all">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedRecipients.includes(c.userId || c._id)}
                                                            onChange={(e) => {
                                                                const id = c.userId || c._id;
                                                                if (e.target.checked) setSelectedRecipients([...selectedRecipients, id]);
                                                                else setSelectedRecipients(selectedRecipients.filter(r => r !== id));
                                                            }}
                                                            className="w-5 h-5 rounded border-slate-200 text-indigo-600"
                                                        />
                                                        <span className="font-bold text-slate-700 text-sm">{c.fullName || c.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Notification Title</label>
                                        <input 
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Enter short, punchy title..."
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Message Body</label>
                                        <textarea 
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Write your message here..."
                                            className="w-full h-32 p-6 rounded-3xl bg-slate-50 border border-slate-100 font-medium outline-none focus:ring-2 focus:ring-indigo-600"
                                        />
                                    </div>

                                    <button 
                                        onClick={handleSend}
                                        disabled={sending}
                                        className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                                    >
                                        {sending ? "Sending..." : <><Send size={20} /> Send Notification</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

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
                                        <h2 className="text-lg md:text-xl font-black text-slate-900">Candidate Profile</h2>
                                        <p className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase">Status: {selectedUser.presentEmploymentStatus || "Looking for Job"}</p>
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
