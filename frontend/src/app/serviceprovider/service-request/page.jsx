"use client";
import React, { useState, useEffect } from 'react';
import Serviceprovidersidbar from '@/components/Serviceprovidersidbar.jsx';
import { HelpCircle, Send, MessageSquare, History, Plus, AlertCircle, CheckCircle2, ChevronRight, Info, Loader2, Clock, X } from 'lucide-react';

export default function ServiceRequestPage() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/service-requests'); 
            const data = await res.json();
            if (data.success) setHistory(data.requests);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleRequest = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await fetch('/api/service-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, message }),
            });
            const data = await res.json();
            if (data.success) {
                alert("Service request submitted successfully!");
                setSubject("");
                setMessage("");
                fetchHistory();
            } else {
                alert(data.error || "Failed to submit request.");
            }
        } catch (error) {
            alert("Connection error.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#FDFEFF]">
            <Serviceprovidersidbar activePage="servicerequest" />
            
            <main className="flex-1 p-4 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Service Request</h1>
                            <p className="text-slate-500 font-medium mt-1">Need help or support? Our expert team is here to assist you.</p>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                        
                        {/* Request Form */}
                        <div className="lg:col-span-3 space-y-8">
                            <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <Plus size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">New Support Request</h3>
                                </div>

                                <form onSubmit={handleRequest} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Query Subject</label>
                                        <input 
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="E.g. Issue with profile / Technical support"
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Detailed Description</label>
                                        <textarea 
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Please describe your issue or request in detail..."
                                            className="w-full h-48 p-6 rounded-3xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 transition-all"
                                            required
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={sending}
                                        className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {sending ? <><Loader2 className="animate-spin" size={20} /> Sending...</> : <><Send size={20} /> Send Request</>}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* History Section */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm min-h-[400px]">
                                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                    <History className="text-slate-400" size={24} />
                                    Request History
                                </h3>
                                
                                {loading ? (
                                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={32} /></div>
                                ) : history.length > 0 ? (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Click to view response</p>
                                        {history.map(item => (
                                            <div 
                                                key={item._id} 
                                                onClick={() => setSelectedRequest(item)}
                                                className={`group cursor-pointer p-5 rounded-[28px] border transition-all hover:scale-[1.02] active:scale-95 ${item.status === 'Answered' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'}`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-bold text-slate-900 text-[13px] group-hover:text-indigo-600 transition-colors truncate pr-4">{item.subject}</h4>
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 ${item.status === 'Answered' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                                    <div className="flex items-center gap-1 text-indigo-600">
                                                        <span>View</span>
                                                        <ChevronRight size={14} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-[32px]">No requests yet.</div>
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </main>

            {/* Response Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="bg-indigo-600 p-8 md:p-10 text-white relative">
                            <button 
                                onClick={() => setSelectedRequest(null)}
                                className="absolute top-8 right-8 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                            <div className="space-y-4">
                                <span className="px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Request Details</span>
                                <h3 className="text-3xl font-black leading-tight">{selectedRequest.subject}</h3>
                                <div className="flex items-center gap-4 text-indigo-100 text-xs font-bold">
                                    <span>ID: #{selectedRequest._id.slice(-6).toUpperCase()}</span>
                                    <span>•</span>
                                    <span>{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 md:p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Message</label>
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <p className="text-slate-600 font-medium leading-relaxed">{selectedRequest.message}</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare size={14} />
                                    Admin Response
                                </label>
                                {selectedRequest.adminReply ? (
                                    <div className="bg-indigo-50 p-8 rounded-[32px] border border-indigo-100 relative">
                                        <div className="absolute -top-4 left-6 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-xs shadow-lg">A</div>
                                        <p className="text-indigo-900 font-bold text-lg leading-relaxed italic">
                                            "{selectedRequest.adminReply}"
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                                        <Clock size={32} className="text-slate-300 mb-3 animate-pulse" />
                                        <p className="text-slate-400 font-bold italic">Waiting for response...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => setSelectedRequest(null)}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
