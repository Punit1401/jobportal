"use client";
import React, { useState, useEffect } from 'react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { BarChart3, TrendingUp, PieChart, Download, Calendar, Filter, Users, Briefcase, Clock, ChevronDown, CheckCircle2, Target } from 'lucide-react';

export default function AnalyticsPage() {
    const [stats, setStats] = useState({ totalJobs: 0, totalApps: 0, shortlisted: 0 });
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/recruiter/analytics');
                const data = await res.json();
                if (data.ok) {
                    setStats(data.stats);
                    setPerformance(data.performance);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);
    const handleExportReport = () => {
        alert("Generating your comprehensive recruitment analytics report. A download link will be available shortly.");
    };

    return (
        <div className="flex min-h-screen bg-[#FDFEFF]">
            <RecruiterSidebar activePage="analytics" />
            
            <main className="flex-1 p-4 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Analytics & Reports</h1>
                            <p className="text-slate-500 font-medium mt-1">Deep dive into your recruitment performance and hiring data.</p>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={handleExportReport}
                                className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-slate-200 hover:-translate-y-1 transition-all"
                            >
                                <Download size={20} />
                                Export Full Report
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 bg-white px-6 py-3.5 rounded-2xl border border-slate-100 font-bold text-slate-600 cursor-pointer">
                            <Calendar size={18} className="text-indigo-600" />
                            Last 30 Days
                            <ChevronDown size={16} />
                        </div>
                        <div className="flex items-center gap-3 bg-white px-6 py-3.5 rounded-2xl border border-slate-100 font-bold text-slate-600 cursor-pointer">
                            <Filter size={18} className="text-indigo-600" />
                            All Departments
                            <ChevronDown size={16} />
                        </div>
                        <div className="ml-auto text-xs font-black text-slate-400 uppercase tracking-widest italic">Data updated: Just now</div>
                    </div>

                    {/* Big Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {[
                            { label: "Active Jobs", value: stats.totalJobs, change: "+0", icon: <Briefcase />, bg: "bg-indigo-50", text: "text-indigo-600" },
                            { label: "Total Applicants", value: stats.totalApps, change: "+0", icon: <Users />, bg: "bg-emerald-50", text: "text-emerald-600" },
                            { label: "Shortlisted", value: stats.shortlisted, change: "+0", icon: <CheckCircle2 />, bg: "bg-amber-50", text: "text-amber-600" },
                            { label: "Hire Rate", value: stats.totalApps > 0 ? `${((stats.shortlisted / stats.totalApps) * 100).toFixed(1)}%` : "0%", change: "N/A", icon: <TrendingUp />, bg: "bg-rose-50", text: "text-rose-600" }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                <div className={`w-12 h-12 ${stat.bg} ${stat.text} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    {stat.icon}
                                </div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                                    <span className={`text-xs font-black ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        {stat.change}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Visual Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Hiring Pipeline Chart */}
                        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <BarChart3 className="text-indigo-600" size={24} />
                                    Application Funnel
                                </h3>
                                <button className="p-3 bg-slate-50 rounded-xl text-slate-400"><PieChart size={20} /></button>
                            </div>
                            
                            <div className="space-y-6 pt-4">
                                {[
                                    { label: "Applied", value: 1200, color: "bg-slate-200" },
                                    { label: "Screened", value: 850, color: "bg-indigo-300" },
                                    { label: "Interviewed", value: 450, color: "bg-indigo-500" },
                                    { label: "Offered", value: 120, color: "bg-indigo-700" },
                                    { label: "Hired", value: 85, color: "bg-slate-900" }
                                ].map((step, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span className="text-slate-500">{step.label}</span>
                                            <span className="text-slate-900">{step.value}</span>
                                        </div>
                                        <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${step.color} rounded-full transition-all duration-1000`} 
                                                style={{ width: `${(step.value / 1200) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Channels */}
                        <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl space-y-8 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                <TrendingUp size={120} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                                    <Target className="text-indigo-400" size={24} />
                                    Top Talent Channels
                                </h3>
                                <div className="space-y-8">
                                    {[
                                        { name: "Direct Portal", share: 45, icon: <CheckCircle2 className="text-emerald-400" /> },
                                        { name: "LinkedIn Integration", share: 30, icon: <CheckCircle2 className="text-blue-400" /> },
                                        { name: "Employee Referral", share: 15, icon: <CheckCircle2 className="text-amber-400" /> },
                                        { name: "Other Sources", share: 10, icon: <CheckCircle2 className="text-slate-400" /> }
                                    ].map((channel, i) => (
                                        <div key={i} className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                                {channel.icon}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between text-sm font-bold">
                                                    <span>{channel.name}</span>
                                                    <span className="text-indigo-400">{channel.share}%</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 w-[45%]" style={{ width: `${channel.share}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed italic">
                                        "Direct Portal usage has grown by 15% this month, reducing recruitment costs by ₹12,000."
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}
