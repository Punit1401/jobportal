"use client";
import React, { useState, useEffect } from 'react';
import Serviceprovidersidbar from '@/components/Serviceprovidersidbar.jsx';
import { Megaphone, Plus, BarChart3, Target, MousePointer2, Eye, TrendingUp, Sparkles, ChevronRight, Loader2, Globe, Layers } from 'lucide-react';

export default function AdvertisingPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch('/api/recruiter/ads'); // Reusing Ads API
            const data = await res.json();
            if (data.success) setCampaigns(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    return (
        <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
            <Serviceprovidersidbar activePage="advertising" />
            
            <main className="flex-1 overflow-y-auto pt-20 lg:pt-8 no-scrollbar">
                <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-7xl mx-auto space-y-12 pb-20">
                    
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Advertising</h1>
                            <p className="text-slate-500 font-medium mt-1">Boost your visibility and attract more clients with targeted ad campaigns.</p>
                        </div>
                        <button className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all"><Plus size={20} /> Create Campaign</button>
                    </header>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm group hover:border-indigo-600 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><Eye size={24} /></div>
                                <TrendingUp className="text-emerald-500" size={16} />
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Impressions</p>
                            <h3 className="text-4xl font-black text-slate-900">42.5K</h3>
                        </div>
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm group hover:border-indigo-600 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><MousePointer2 size={24} /></div>
                                <TrendingUp className="text-emerald-500" size={16} />
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Clicks</p>
                            <h3 className="text-4xl font-black text-slate-900">1.2K</h3>
                        </div>
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm group hover:border-indigo-600 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><Target size={24} /></div>
                                <TrendingUp className="text-emerald-500" size={16} />
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Conv. Rate</p>
                            <h3 className="text-4xl font-black text-slate-900">2.8%</h3>
                        </div>
                        <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl shadow-slate-200">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/10 rounded-2xl"><Layers size={24} /></div>
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Ads</p>
                            <h3 className="text-4xl font-black">{campaigns.length}</h3>
                        </div>
                    </div>

                    {/* Active Campaigns */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end px-2">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Campaigns</h3>
                        </div>

                        {loading ? (
                            <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={32} /></div>
                        ) : campaigns.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {campaigns.map((ad) => (
                                    <div key={ad._id} className="bg-white rounded-[45px] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="space-y-1">
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Live</span>
                                                <h4 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{ad.title}</h4>
                                            </div>
                                            <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><BarChart3 size={18} /></button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-6 mb-8 py-6 border-y border-slate-50">
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impressions</p>
                                                <p className="font-black text-slate-900">12.4K</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CTR</p>
                                                <p className="font-black text-slate-900">1.8%</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Spent</p>
                                                <p className="font-black text-slate-900">₹ 850</p>
                                            </div>
                                        </div>
                                        <button className="w-full py-4 bg-slate-50 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2">View Full Analytics <ChevronRight size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center bg-slate-50/50 rounded-[50px] border-4 border-dashed border-slate-100">
                                <Megaphone size={64} className="mx-auto text-slate-200 mb-6" />
                                <h3 className="text-2xl font-black text-slate-400">No active campaigns.</h3>
                                <p className="text-slate-400 font-bold mt-2">Create your first ad to reach thousands of potential clients.</p>
                            </div>
                        )}
                    </div>

                    {/* Promotion Tools */}
                    <div className="bg-indigo-600 rounded-[50px] p-12 md:p-20 text-white relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                         <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                             <div className="w-24 h-24 bg-white/20 rounded-[32px] flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
                                 <Globe size={40} className="text-white" />
                             </div>
                             <div className="flex-1 space-y-3">
                                 <h3 className="text-4xl font-black tracking-tight">Global Service Promotion</h3>
                                 <p className="text-indigo-100 text-lg font-medium leading-relaxed opacity-80">Our AI-driven placement system ensures your ads appear exactly when and where your target customers are searching for expertise.</p>
                             </div>
                             <button className="bg-white text-indigo-600 px-12 py-5 rounded-[24px] font-black hover:scale-105 transition-all shadow-2xl">Start Promoting</button>
                         </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
