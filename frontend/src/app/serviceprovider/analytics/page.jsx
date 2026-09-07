"use client";
import React, { useState } from 'react';
import Serviceprovidersidbar from '@/components/Serviceprovidersidbar.jsx';
import { BarChart3, TrendingUp, TrendingDown, Users, Eye, MousePointer2, Calendar, Download, Filter, ArrowUpRight, ArrowDownRight, Layers, Loader2, Clock } from 'lucide-react';

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [statsData, setStatsData] = useState({ totalGigs: 0, totalInquiries: 0 });
    const [performance, setPerformance] = useState([]);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/serviceprovider/analytics');
            const data = await res.json();
            if (data.ok) {
                setStatsData(data.stats);
                setPerformance(data.performance);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchAnalytics();
    }, []);

    const handleExportReport = () => {
        const csvContent = [
            ["Service Provider Analytics Report"],
            ["Generated On", new Date().toLocaleString()],
            [],
            ["Metric", "Value"],
            ["Active Gigs", statsData.totalGigs],
            ["Total Inquiries", statsData.totalInquiries]
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `service_provider_analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const stats = [
        { label: "Active Gigs", value: statsData.totalGigs, icon: <Layers size={24} /> },
        { label: "Total Inquiries", value: statsData.totalInquiries, icon: <Users size={24} /> }
    ];

    return (
        <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
            <Serviceprovidersidbar activePage="analytics" />

            <main className="flex-1 overflow-y-auto pt-20 lg:pt-8 no-scrollbar">
                <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-7xl mx-auto space-y-12 pb-20">

                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Analytics & Reports</h1>
                            <p className="text-slate-500 font-medium mt-1">Track your performance, growth, and audience engagement.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-4 rounded-[24px] font-black hover:bg-slate-200 transition-all"><Filter size={20} /> Last 30 Days</button>
                            <button onClick={handleExportReport} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-slate-200 hover:-translate-y-1 transition-all"><Download size={20} /> Export Report</button>
                        </div>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300">
                                        {stat.icon}
                                    </div>
                                </div>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{stat.value}</h3>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Charts Placeholder */}
                    <div className="grid grid-cols-1 gap-10">
                        <div className="bg-white rounded-[50px] p-10 border border-slate-100 shadow-sm space-y-8">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3"><Users className="text-indigo-600" size={24} /> Audience Engagement</h3>
                            <div className="h-80 w-full bg-slate-50 rounded-[40px] flex items-end justify-between p-8 gap-3">
                                {performance.length > 0 ? performance.map((p, i) => (
                                    <div key={i} className="flex-1 bg-indigo-100 hover:bg-indigo-600 rounded-full transition-all duration-500 cursor-pointer group relative" style={{ height: `${Math.min(100, (p.count / (Math.max(...performance.map(x => x.count)) || 1)) * 100)}%` }}>
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all">{p.count} Inq</div>
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
