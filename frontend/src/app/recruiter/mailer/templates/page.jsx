"use client";
import React, { useState, useEffect } from 'react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { Mail, Plus, Trash2, Edit2, ChevronLeft, Save, FileText, Layout, Layers } from 'lucide-react';
import Link from 'next/link';

export default function MailTemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    
    const [formData, setFormData] = useState({
        id: null,
        title: "",
        subject: "",
        content: ""
    });

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/recruiter/mailer/templates');
            const data = await res.json();
            console.log("Fetched Templates:", data);
            if (data.ok) setTemplates(data.data);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/recruiter/mailer/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.ok) {
                setShowModal(false);
                setFormData({ title: "", subject: "", content: "", id: null });
                fetchTemplates();
                alert("Template saved successfully!");
            } else {
                alert("Error: " + (data.error || "Could not save."));
            }
        } catch (error) {
            alert("Connection error.");
        }
    };

    const handleEdit = (template) => {
        setFormData({ 
            id: template._id,
            title: template.title, 
            subject: template.subject, 
            content: template.content 
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this template?")) return;
        try {
            const res = await fetch('/api/recruiter/mailer/templates', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) fetchTemplates();
        } catch (error) {
            alert("Error deleting template.");
        }
    };

    return (
        <div className="flex min-h-screen bg-[#FDFEFF]">
            <RecruiterSidebar activePage="mailer" />
            
            <main className="flex-1 p-4 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/recruiter/mailer" className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                                <ChevronLeft size={20} />
                            </Link>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mail Templates</h1>
                                <p className="text-slate-500 font-medium mt-1">Manage your reusable email templates.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={fetchTemplates}
                                className="p-4 bg-white border border-slate-100 rounded-[20px] text-slate-400 hover:text-indigo-600 transition-all"
                                title="Refresh"
                            >
                                <Layers size={20} className={loading ? "animate-spin" : ""} />
                            </button>
                            <button 
                                onClick={() => {
                                    setFormData({ title: "", subject: "", content: "", id: null });
                                    setShowModal(true);
                                }}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all"
                            >
                                <Plus size={20} />
                                Create Template
                            </button>
                        </div>
                    </div>

                    {/* Templates Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-bold animate-pulse">Loading templates...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {templates.length > 0 ? templates.map(template => (
                            <div key={template._id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                                        <Layout size={24} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleEdit(template)} 
                                            className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                            title="Edit Template"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(template._id)} 
                                            className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            title="Delete Template"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">{template.title}</h3>
                                <p className="text-slate-400 font-bold text-sm mb-6 line-clamp-1">{template.subject}</p>
                                <div className="p-4 bg-slate-50 rounded-2xl text-slate-600 text-xs font-medium line-clamp-4 mb-6 h-32 overflow-hidden relative">
                                    {template.content}
                                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-50 to-transparent"></div>
                                </div>
                                <Link 
                                    href={`/recruiter/mailer?template=${template._id}`}
                                    className="block w-full py-4 bg-slate-900 text-white text-center rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-100"
                                >
                                    Use This Template
                                </Link>
                            </div>
                        )) : (
                            <div className="md:col-span-2 xl:col-span-3 p-20 text-center text-slate-400 font-bold border-4 border-dashed border-slate-100 rounded-[40px]">
                                <Mail size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No templates found. Create your first email template to save time!</p>
                            </div>
                        )}
                        </div>
                    )}

                    {/* Create/Edit Modal */}
                    {showModal && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                            <div className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl">
                                <h3 className="text-3xl font-black text-slate-900 mb-8">Save Template</h3>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Template Title</label>
                                        <input 
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            placeholder="e.g., Shortlist Welcome Mail"
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Email Subject</label>
                                        <input 
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                            placeholder="Subject line for candidates..."
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Message Body</label>
                                        <textarea 
                                            required
                                            value={formData.content}
                                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                                            className="w-full h-60 p-6 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                            placeholder="Hi {name}, We are happy to inform you..."
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[24px] font-black uppercase tracking-widest">Cancel</button>
                                        <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Save Template</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
