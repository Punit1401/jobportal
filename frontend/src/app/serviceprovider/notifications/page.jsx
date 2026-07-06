"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Serviceprovidersidbar';
import { Bell, Check, Trash2, Clock, Users, Briefcase, Settings, MoreVertical, Star, CheckCircle2, Send, Plus, X, Search } from 'lucide-react';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [sentNotifications, setSentNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("received"); // received or sent
    const [showCompose, setShowCompose] = useState(false);
    
    // Form State
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("Info");
    const [targetType, setTargetType] = useState("All");
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [sending, setSending] = useState(false);

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
            if (dataSent.ok) setSentNotifications(dataSent.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/serviceprovider/contacts');
            const data = await res.json();
            if (data.ok) setCustomers(data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchCustomers();
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
                if (viewMode === "received") {
                    setNotifications(notifications.filter(n => n._id !== id));
                } else {
                    setSentNotifications(sentNotifications.filter(n => n._id !== id));
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSend = async () => {
        if (!title || !message) return alert("Please fill all fields");
        
        let recipients = [];
        if (targetType === "All") {
            recipients = customers.map(c => c.userId).filter(id => id);
        } else {
            recipients = selectedRecipients;
        }

        if (recipients.length === 0) return alert("No recipients with valid User IDs found. Notifications can only be sent to registered users.");

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
                fetchData();
            }
        } catch (error) {
            alert("Error sending notifications");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#FDFEFF]">
            <Sidebar activePage="notifications" />
            
            <main className="flex-1 p-4 lg:p-10">
                <div className="max-w-4xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Notifications</h1>
                            <p className="text-slate-500 font-medium mt-1">Stay updated with system alerts and message your customers.</p>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowCompose(true)}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all"
                            >
                                <Plus size={20} />
                                Broadcast
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 p-2 bg-slate-50 rounded-[24px] w-fit">
                        <button 
                            onClick={() => setViewMode("received")}
                            className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${viewMode === "received" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                        >
                            Inbound Alerts
                        </button>
                        <button 
                            onClick={() => setViewMode("sent")}
                            className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${viewMode === "sent" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                        >
                            Sent History
                        </button>
                    </div>

                    {/* List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            <Bell size={20} className="text-indigo-600" />
                            {viewMode === "received" ? "Recent Alerts" : "Outbox Messages"}
                        </h2>
                        {loading ? (
                             <div className="p-20 text-center text-slate-400 font-bold animate-pulse">Loading...</div>
                        ) : (viewMode === "received" ? notifications : sentNotifications).length > 0 ? (viewMode === "received" ? notifications : sentNotifications).map((notif) => (
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
                                                {viewMode === "received" ? `From ${notif.senderRole}` : `To ${notif.targetRole || 'Multiple Customers'}`}
                                            </span>
                                            <h4 className={`text-lg font-black ${notif.isRead ? 'text-slate-800' : 'text-indigo-900'}`}>{notif.title}</h4>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className={`font-medium ${notif.isRead ? 'text-slate-500' : 'text-indigo-700/70'}`}>{notif.message}</p>
                                    
                                    <div className="mt-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notif.isRead && viewMode === "received" && <button onClick={() => markRead(notif._id)} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">Mark Read</button>}
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
                                    <h3 className="text-3xl font-black text-slate-900">Send Alert</h3>
                                    <button onClick={() => setShowCompose(false)} className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Recipients</label>
                                            <select 
                                                value={targetType}
                                                onChange={(e) => setTargetType(e.target.value)}
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                                            >
                                                <option value="All">All Registered Customers</option>
                                                <option value="Specific">Specific Individuals</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Priority</label>
                                            <select 
                                                value={type}
                                                onChange={(e) => setType(e.target.value)}
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                                            >
                                                <option value="Info">Info</option>
                                                <option value="Success">Success</option>
                                                <option value="Warning">Warning</option>
                                            </select>
                                        </div>
                                    </div>

                                    {targetType === "Specific" && (
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Select Customers ({selectedRecipients.length})</label>
                                            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                                {customers.filter(c => c.userId).map(c => (
                                                    <label key={c._id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-600 transition-all">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedRecipients.includes(c.userId)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedRecipients([...selectedRecipients, c.userId]);
                                                                else setSelectedRecipients(selectedRecipients.filter(r => r !== c.userId));
                                                            }}
                                                            className="w-5 h-5 rounded border-slate-200 text-indigo-600"
                                                        />
                                                        <span className="font-bold text-slate-700 text-sm">{c.fullName || c.name}</span>
                                                    </label>
                                                ))}
                                                {customers.filter(c => c.userId).length === 0 && (
                                                    <p className="text-center text-xs text-slate-400 font-bold">No registered users found.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Subject</label>
                                        <input 
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Enter notification title..."
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Message Content</label>
                                        <textarea 
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Details of the alert..."
                                            className="w-full h-32 p-6 rounded-3xl bg-slate-50 border border-slate-100 font-medium outline-none focus:ring-2 focus:ring-indigo-600"
                                        />
                                    </div>

                                    <button 
                                        onClick={handleSend}
                                        disabled={sending}
                                        className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                                    >
                                        {sending ? "Processing..." : <><Send size={20} /> Broadcast Now</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
