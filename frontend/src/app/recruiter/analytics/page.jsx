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
        const csvContent = [
            ["Recruitment Analytics Report"],
            ["Generated On", new Date().toLocaleString()],
            [],
            ["Metric", "Value"],
            ["Active Jobs", stats.totalJobs],
            ["Total Applicants", stats.totalApps],
            ["Shortlisted Applicants", stats.shortlisted],
            ["Hire Rate", stats.totalApps > 0 ? `${((stats.shortlisted / stats.totalApps) * 100).toFixed(1)}%` : "0%"]
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `recruitment_analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                    <div className="grid grid-cols-1 gap-8">

                        {/* Weekly Applicant Performance */}
                        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <BarChart3 className="text-indigo-600" size={24} />
                                Weekly Applicant Activity
                            </h3>
                            <div className="h-80 w-full bg-slate-50 rounded-[40px] flex items-end justify-between p-8 gap-3">
                                {performance.length > 0 ? performance.map((p, i) => (
                                    <div key={i} className="flex-1 bg-indigo-100 hover:bg-indigo-600 rounded-full transition-all duration-500 cursor-pointer group relative" style={{ height: `${Math.min(100, (p.apps / (Math.max(...performance.map(x => x.apps)) || 1)) * 100)}%` }}>
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all">{p.apps} apps</div>
                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400">{p.name}</span>
                                    </div>
                                )) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic">No data for this week</div>
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}
