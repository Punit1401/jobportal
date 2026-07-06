"use client";
import React, { useState, useEffect } from 'react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { Megaphone, Plus, Target, BarChart3, Users, ChevronRight, CheckCircle2, TrendingUp, Zap, Star } from 'lucide-react';

export default function AdvertisingPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await fetch('/api/recruiter/advertising');
                const data = await res.json();
                if (data.ok) setCampaigns(data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    return (
        <div className="flex min-h-screen bg-[#FDFEFF]">
            <RecruiterSidebar activePage="advertising" />
            
            <main className="flex-1 p-4 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Advertising</h1>
                            <p className="text-slate-500 font-medium mt-1">Promote your job posts and reach the top 1% talent.</p>
                        </div>
                        <button className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all">
                            <Plus size={20} />
                            Create Campaign
                        </button>
                    </header>

                    {/* Promo Banner */}
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[40px] p-10 text-white flex flex-col lg:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="relative z-10 flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
                                <Zap size={16} className="text-amber-400" />
                                <span className="text-xs font-black uppercase tracking-widest">Limited Offer</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black leading-tight">Boost your reach by 10x with <span className="text-amber-400 italic font-black">Featured Listing</span></h2>
                            <p className="text-indigo-100 font-medium text-lg max-w-xl">Get 3x more applications and priority placement on candidate dashboards for just ₹99/day.</p>
                            <div className="flex gap-4">
                                <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black hover:scale-105 transition-all">Learn More</button>
                                <button className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-2xl font-black hover:bg-white/10 transition-all">Dismiss</button>
                            </div>
                        </div>
                        <div className="relative z-10 w-full lg:w-96 bg-white/10 rounded-[32px] p-8 border border-white/10 backdrop-blur-xl">
                            <h4 className="text-xl font-black mb-6">Why Advertise?</h4>
                            <div className="space-y-4">
                                {[
                                    "Top row priority placement",
                                    "Social media promotion",
                                    "AI-powered targeting",
                                    "Weekly performance reports"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-amber-400" />
                                        <span className="text-sm font-bold text-indigo-50">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Target size={32} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Impressions</p>
                                <p className="text-3xl font-black text-slate-900">14.7k</p>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <TrendingUp size={32} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Conversion Rate</p>
                                <p className="text-3xl font-black text-slate-900">4.2%</p>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <Users size={32} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Clicks</p>
                                <p className="text-3xl font-black text-slate-900">570</p>
                            </div>
                        </div>
                    </div>

                    {/* Active Campaigns List */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-slate-900 px-2">Your Active Campaigns</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {campaigns.length > 0 ? campaigns.map(camp => (
                                <div key={camp._id} className="bg-white p-8 rounded-[40px] border border-slate-100 hover:border-indigo-100 transition-all flex flex-col lg:flex-row items-center gap-8 group">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                                        <Megaphone size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{camp.name}</h4>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${camp.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {camp.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 font-bold text-sm">Budget: <span className="text-slate-900">₹{camp.budget?.toLocaleString() || 0}</span> • Reach: <span className="text-slate-900">{camp.reach || 0}</span></p>
                                    </div>
                                    <div className="flex gap-10 items-center px-10 border-x border-slate-50">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impressions</p>
                                            <p className="text-xl font-black text-slate-900">{camp.impressions || 0}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clicks</p>
                                            <p className="text-xl font-black text-slate-900">{camp.clicks || 0}</p>
                                        </div>
                                    </div>
                                    <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                                        <BarChart3 size={20} />
                                    </button>
                                </div>
                            )) : (
                                <div className="p-20 text-center text-slate-400 font-bold border-4 border-dashed border-slate-100 rounded-[40px]">No active campaigns found. Start your first promotion today!</div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
