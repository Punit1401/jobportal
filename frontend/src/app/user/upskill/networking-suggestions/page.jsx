"use client";
import React, { useState } from "react";
import { Users, Sparkles, MessageSquare, Target, Share2, Loader2, ArrowRight, CheckCircle2, Bookmark, Lightbulb } from "lucide-react";
import UserSidebar from '@/components/UserSidebar';
import FeatureGuard from "@/components/FeatureGuard";

export default function NetworkingSuggestionsPage() {
    const [industry, setIndustry] = useState("");
    const [role, setRole] = useState("");
    const [goal, setGoal] = useState("");
    
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const generateSuggestions = async (e) => {
        if (e) e.preventDefault();
        
        if (!industry || !role) {
            return alert("Please provide both your industry and current/target role.");
        }
        
        setLoading(true);
        setResult(null);
        
        try {
            const res = await fetch("/api/ai/networking-suggestions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ industry, role, goal }),
            });
            const data = await res.json();
            
            if (data.success) {
                setResult(data);
            } else {
                alert(data.error || "Could not generate suggestions.");
            }
        } catch (error) {
            alert("Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
            <UserSidebar onCollapseChange={setIsSidebarCollapsed} />

            <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
                <FeatureGuard featureName="Learning Features">
                    <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-7xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-4">
                                <Users size={14} className="text-blue-600" />
                                <span className="text-xs font-bold text-blue-700 tracking-wider uppercase">AI Networking Assistant</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                Networking Suggestions
                            </h1>
                            <p className="text-slate-500 font-medium mt-3 max-w-2xl text-lg">
                                Unlock hidden career opportunities. Get AI-tailored strategies to build meaningful professional relationships and expand your circle.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Input Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-0">
                                <form onSubmit={generateSuggestions} className="space-y-6">
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Target Area</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Industry *</label>
                                            <input 
                                                type="text"
                                                value={industry}
                                                onChange={(e) => setIndustry(e.target.value)}
                                                placeholder="e.g. Information Technology"
                                                className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Your Role/Goal Role *</label>
                                            <input 
                                                type="text"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                placeholder="e.g. Full Stack Developer"
                                                className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Networking Goal</label>
                                            <input 
                                                type="text"
                                                value={goal}
                                                onChange={(e) => setGoal(e.target.value)}
                                                placeholder="e.g. Find a mentor, Get referrals..."
                                                className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent font-medium text-slate-800 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !industry || !role}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {loading ? (
                                            <><Loader2 size={18} className="animate-spin" /> Gathering Insights...</>
                                        ) : (
                                            <><Sparkles size={18} /> Get Suggestions</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Result Section */}
                        <div className="lg:col-span-3">
                            {loading ? (
                                <div className="bg-white rounded-[2rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/50 h-full flex flex-col items-center justify-center text-center">
                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 bg-blue-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                                        <div className="relative bg-white p-6 rounded-full shadow-lg border border-slate-100">
                                            <Loader2 className="animate-spin text-blue-600" size={48} />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800">Building Your Strategy</h3>
                                    <p className="text-slate-500 font-medium mt-3 max-w-sm">
                                        Analyzing industry trends and connection patterns to suggest the best networking approach...
                                    </p>
                                </div>
                            ) : result ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                                    
                                    {/* Strategy Section */}
                                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                                        <h4 className="flex items-center gap-3 font-black text-slate-900 uppercase text-sm tracking-[0.2em] mb-8">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                                <Target size={18} className="text-indigo-600" />
                                            </div>
                                            Actionable Strategies
                                        </h4>
                                        <div className="grid gap-4">
                                            {result.strategies?.map((strat, i) => (
                                                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all">
                                                    <h5 className="font-black text-slate-800 text-lg mb-2">{strat.title}</h5>
                                                    <p className="text-slate-600 text-sm font-medium leading-relaxed">{strat.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Connections & Platforms */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                                            <h4 className="flex items-center gap-3 font-black text-slate-900 uppercase text-sm tracking-[0.2em] mb-6">
                                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                                    <Share2 size={18} className="text-emerald-600" />
                                                </div>
                                                Who to Connect With
                                            </h4>
                                            <div className="space-y-4">
                                                {result.potentialConnections?.map((conn, i) => (
                                                    <div key={i} className="flex gap-4">
                                                        <div className="mt-1 shrink-0"><CheckCircle2 className="text-emerald-500" size={16} /></div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm">{conn.type}</p>
                                                            <p className="text-slate-500 text-xs mt-0.5">{conn.why}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                                            <h4 className="flex items-center gap-3 font-black text-slate-900 uppercase text-sm tracking-[0.2em] mb-6">
                                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                                    <Bookmark size={18} className="text-blue-600" />
                                                </div>
                                                Top Platforms
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.platforms?.map((plat, i) => (
                                                    <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100">
                                                        {plat}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="mt-8 pt-6 border-t border-slate-100">
                                                <div className="flex items-start gap-3 text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100">
                                                    <Lightbulb size={20} className="shrink-0" />
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">Expert Pro-Tip</p>
                                                        <p className="text-xs font-bold leading-relaxed">{result.proTip}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Templates */}
                                    <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl">
                                        <h4 className="flex items-center gap-3 font-black uppercase text-sm tracking-[0.2em] mb-8 text-indigo-400">
                                            <MessageSquare size={18} /> Outreach Templates
                                        </h4>
                                        <div className="space-y-8">
                                            {result.messageTemplates?.map((item, i) => (
                                                <div key={i} className="space-y-3">
                                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{item.context}</p>
                                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 relative group">
                                                        <pre className="text-slate-300 text-sm font-medium whitespace-pre-wrap leading-relaxed italic">
                                                            "{item.template}"
                                                        </pre>
                                                        <button 
                                                            onClick={() => {navigator.clipboard.writeText(item.template); alert("Template copied!")}}
                                                            className="absolute top-4 right-4 text-[10px] font-black uppercase bg-indigo-600 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            Copy
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-[3rem] p-12 border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-8">
                                        <Users className="text-slate-300" size={48} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-700 mb-3">Your Networking Blueprint</h3>
                                    <p className="text-slate-400 font-medium text-lg max-w-sm mx-auto">
                                        Fill in your industry and target role on the left to unlock AI-generated networking strategies and message templates.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
                </FeatureGuard>
            </main>
        </div>
    );
}
