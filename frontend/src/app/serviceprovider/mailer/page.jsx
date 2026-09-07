"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Serviceprovidersidbar';
import FeatureGuard from '@/components/FeatureGuard';
import { Mail, Send, Layers, Users, Clock, History, Plus, ChevronRight, CheckCircle2, AlertCircle, Layout, Loader2 } from 'lucide-react';
import Link from 'next/link';

function AutoMailerPageContent() {
    const [selectedList, setSelectedList] = useState("");
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const [mailingLists, setMailingLists] = useState([]);
    const [recentCampaigns, setRecentCampaigns] = useState([]);
    const [stats, setStats] = useState({ totalContacts: 0, emailsSent: 0, openRate: 0 });
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");

    const searchParams = useSearchParams();
    const templateIdParam = searchParams.get('template');
    const listParam = searchParams.get('list');

    const fetchData = async () => {
        try {
            const listRes = await fetch('/api/mailing-list');
            const listData = await listRes.json();
            if (listData.ok) {
                setMailingLists(listData.data);
                if (listParam) setSelectedList(listParam);
            }

            const tempRes = await fetch('/api/mailer/templates');
            const tempData = await tempRes.json();
            if (tempData.ok) {
                setTemplates(tempData.data);
                if (templateIdParam) {
                    const template = tempData.data.find(t => t._id === templateIdParam);
                    if (template) {
                        setSelectedTemplate(templateIdParam);
                        setSubject(template.subject);
                        setContent(template.content);
                    }
                }
            }

            const campRes = await fetch('/api/mailer/campaigns'); // Needs to be unified too
            const campData = await campRes.json();
            if (campData.ok) {
                setRecentCampaigns(campData.data);
                if (campData.stats) setStats(campData.stats);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTemplateChange = (id) => {
        setSelectedTemplate(id);
        const template = templates.find(t => t._id === id);
        if (template) {
            setSubject(template.subject);
            setContent(template.content);
        }
    };

    const handleSend = async () => {
        if (!selectedList || !subject || !content) return alert("Please fill all fields");
        setSending(true);
        try {
            const res = await fetch('/api/mailer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    subject, 
                    message: content, 
                    listId: selectedList,
                    scheduledTime: scheduledTime || null
                }),
            });
            const data = await res.json();
            if (data.ok) {
                alert("Email campaign launched successfully!");
                setSubject("");
                setContent("");
                fetchData();
            }
        } catch (error) {
            alert("Connection error.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar activePage="mailer" />
            
            <main className="flex-1 p-4 lg:p-10">
                <FeatureGuard featureName="Auto-Mailer System">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Auto-Mailer System</h1>
                            <p className="text-slate-500 font-medium mt-1">Nurture leads and re-engage customers with automated campaigns.</p>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/serviceprovider/mailer/templates" className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3.5 rounded-[20px] font-black border border-indigo-100 hover:bg-indigo-100 transition-all">
                                <Layout size={20} />
                                Templates
                            </Link>
                            <button className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3.5 rounded-[20px] font-black border border-slate-100 shadow-sm hover:bg-slate-50 transition-all">
                                <History size={20} />
                                History
                            </button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Editor */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-[40px] p-8 md:p-10 border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                        <Plus size={20} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">New Campaign</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Audience List</label>
                                            <select 
                                                value={selectedList}
                                                onChange={(e) => setSelectedList(e.target.value)}
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all"
                                            >
                                                <option value="">Choose a list...</option>
                                                {mailingLists.map(list => (
                                                    <option key={list._id} value={list._id}>{list.name} ({list.members?.length || 0} members)</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email Template</label>
                                            <select 
                                                value={selectedTemplate}
                                                onChange={(e) => handleTemplateChange(e.target.value)}
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all"
                                            >
                                                <option value="">Custom Draft</option>
                                                {templates.map(t => (
                                                    <option key={t._id} value={t._id}>{t.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Subject Line</label>
                                        <input 
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="Catchy subject for your customers..."
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email Body</label>
                                        <textarea 
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Write your message here... Use {name} for personalization."
                                            className="w-full h-80 p-8 rounded-3xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Schedule Send</label>
                                        <input 
                                            type="datetime-local"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all"
                                        />
                                    </div>

                                    <button 
                                        onClick={handleSend}
                                        disabled={sending}
                                        className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {sending ? <Layers className="animate-spin" size={20} /> : <Send size={20} />}
                                        {sending ? "Launching..." : (scheduledTime ? "Schedule Campaign" : "Send Now")}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            
                            <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl">
                                <h3 className="text-xl font-black mb-6">Quick Overview</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <Users size={18} className="text-indigo-400" />
                                            <span className="text-sm font-bold">Total Contacts</span>
                                        </div>
                                        <span className="text-xl font-black">{stats.totalContacts.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <Mail size={18} className="text-emerald-400" />
                                            <span className="text-sm font-bold">Emails Sent</span>
                                        </div>
                                        <span className="text-xl font-black">{stats.emailsSent.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <Clock size={18} className="text-amber-400" />
                                            <span className="text-sm font-bold">Open Rate</span>
                                        </div>
                                        <span className="text-xl font-black">{stats.openRate}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                                <h3 className="text-xl font-black text-slate-900 mb-6">Recent Campaigns</h3>
                                <div className="space-y-4">
                                    {recentCampaigns.length > 0 ? recentCampaigns.map(camp => (
                                        <div key={camp._id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-indigo-100 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors truncate pr-2">{camp.subject}</h4>
                                                <CheckCircle2 size={16} className="text-emerald-500" />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(camp.createdAt).toLocaleDateString()}</span>
                                                <span className="text-xs font-bold text-slate-600">{camp.recipientsCount || 0} Recipients</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-6 text-slate-400 font-bold italic">No recent campaigns.</div>
                                    )}
                                </div>
                                <button className="w-full mt-6 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all flex items-center justify-center gap-2">
                                    Full Report <ChevronRight size={14} />
                                </button>
                            </div>

                            <div className="bg-indigo-600 p-8 rounded-[40px] text-white flex gap-4">
                                <AlertCircle className="text-indigo-200 shrink-0" size={24} />
                                <div>
                                    <h4 className="font-black text-sm mb-1">Marketing Tip</h4>
                                    <p className="text-indigo-100 text-xs leading-relaxed">Tuesday and Thursday mornings have the highest email open rates for service inquiries.</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                </FeatureGuard>
            </main>
        </div>
    );
}

export default function AutoMailerPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>}>
            <AutoMailerPageContent />
        </Suspense>
    );
}
