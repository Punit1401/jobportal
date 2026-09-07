"use client";
import React, { useState } from "react";
import { Building2, Sparkles, TrendingUp, Users, MessageSquare, Star, Loader2, Search, ArrowRight } from "lucide-react";
import UserSidebar from '@/components/UserSidebar';
import FeatureGuard from "@/components/FeatureGuard";

export default function CompanyInsights() {
    const [companyName, setCompanyName] = useState("");
    const [searchedCompany, setSearchedCompany] = useState("");
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const fetchInsights = async (e) => {
        if (e) e.preventDefault();
        if (!companyName.trim()) return;
        
        setLoading(true);
        setInsights(null);
        setSearchedCompany(companyName);
        
        try {
            const res = await fetch("/api/ai/company-insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyName: companyName.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setInsights(data.insights);
            } else {
                alert(data.error || "Could not fetch insights at this moment.");
            }
        } catch (error) {
            alert("Could not fetch insights at this moment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
            <UserSidebar onCollapseChange={setIsSidebarCollapsed} />

            <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8 ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
                <FeatureGuard featureName="Interview Preparation">
                    <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-5xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
                                <Sparkles size={14} className="text-indigo-600" />
                                <span className="text-xs font-bold text-indigo-700 tracking-wider uppercase">AI Powered Analysis</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                Company Insights
                            </h1>
                            <p className="text-slate-500 font-medium mt-3 max-w-2xl text-lg">
                                Research your dream companies before applying. Get AI-driven insights on work culture, interview trends, and market reputation.
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/50">
                        <form onSubmit={fetchInsights} className="relative flex items-center">
                            <Search className="absolute left-6 text-slate-400" size={24} />
                            <input 
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Enter a company name (e.g. Google, Microsoft, TCS)..."
                                className="w-full pl-16 pr-36 py-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-lg font-medium text-slate-800 placeholder:text-slate-400 transition-all outline-none"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading || !companyName.trim()}
                                className="absolute right-3 flex items-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>Analyze <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                <div className="relative bg-white p-4 rounded-full shadow-lg border border-slate-100 mb-6">
                                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-slate-800">Analyzing {searchedCompany}...</h3>
                            <p className="text-slate-500 font-medium mt-2 text-center max-w-sm">
                                Our AI is gathering data about the company's culture, interview processes, and market position.
                            </p>
                        </div>
                    )}

                    {/* Results */}
                    {insights && !loading && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="bg-white border border-slate-100 shadow-2xl shadow-indigo-100/50 rounded-[2.5rem] overflow-hidden">
                                
                                {/* Result Header */}
                                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center">
                                            <Building2 size={32} className="text-indigo-300" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black tracking-tight text-3xl capitalize">{searchedCompany}</h3>
                                            </div>
                                            <p className="text-indigo-200/80 text-sm font-medium">Comprehensive AI Analysis Report</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                                        <div>
                                            <p className="text-xs text-indigo-200 uppercase tracking-widest font-bold mb-1">Employee Rating</p>
                                            <div className="flex items-center gap-1.5">
                                                <Star size={20} className="text-amber-400 fill-amber-400" />
                                                <span className="font-black text-xl">{insights.employeeRating}/5</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Culture */}
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Users size={80} />
                                        </div>
                                        <h4 className="flex items-center gap-3 font-black text-slate-900 uppercase text-sm tracking-widest mb-4">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                                <Users size={20} className="text-indigo-600" />
                                            </div>
                                            Work Culture
                                        </h4>
                                        <p className="text-slate-600 text-base leading-relaxed font-medium relative z-10">
                                            {insights.companyCulture}
                                        </p>
                                    </div>

                                    {/* Interview Topics */}
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <MessageSquare size={80} />
                                        </div>
                                        <h4 className="flex items-center gap-3 font-black text-slate-900 uppercase text-sm tracking-widest mb-4">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                                <MessageSquare size={20} className="text-emerald-600" />
                                            </div>
                                            Interview Focus
                                        </h4>
                                        <p className="text-slate-600 text-base leading-relaxed font-medium relative z-10">
                                            {insights.commonInterviewTopics}
                                        </p>
                                    </div>

                                    {/* Market Position */}
                                    <div className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-violet-50 p-8 rounded-3xl border border-indigo-100/50 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden shadow-inner">
                                        <div className="absolute -right-10 -bottom-10 text-indigo-200/40">
                                            <TrendingUp size={200} />
                                        </div>
                                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-center shrink-0 relative z-10">
                                            <TrendingUp className="text-indigo-600" size={28} />
                                        </div>
                                        <div className="relative z-10">
                                            <h4 className="font-black text-indigo-950 text-lg uppercase tracking-widest mb-3">Market Reputation & Growth</h4>
                                            <p className="text-indigo-800/80 text-base font-medium leading-relaxed">
                                                {insights.marketPosition}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                </FeatureGuard>
            </main>
        </div>
    );
}