"use client";
import React, { useState, useEffect } from 'react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { ShoppingBag, Zap, Mail, Target, Users, Plus, Star, ChevronRight, CheckCircle2, TrendingUp, Sparkles, Filter } from 'lucide-react';

export default function RetailPurchasePage() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPurchases = async () => {
        try {
            const res = await fetch('/api/recruiter/retail');
            const data = await res.json();
            if (data.ok) setPurchases(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchases();
    }, []);

    const handlePurchase = async (item) => {
        try {
            const priceValue = parseInt(item.price.replace(/[^0-9]/g, ''));
            const res = await fetch('/api/recruiter/retail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemName: item.name, amount: priceValue }),
            });
            if (res.ok) {
                alert(`Successfully purchased ${item.name}!`);
                fetchPurchases();
            }
        } catch (error) {
            alert("Connection error.");
        }
    };

    const items = [
        { id: 1, name: "100 Email Credits", price: "₹249", icon: <Mail size={24} />, color: "bg-indigo-50", text: "text-indigo-600", desc: "Send 100 bulk emails with tracking." },
        { id: 2, name: "1-Day Featured Spot", price: "₹99", icon: <Zap size={24} />, color: "bg-amber-50", text: "text-amber-600", desc: "Your job at the top for 24 hours." },
        { id: 3, name: "Premium Job Post", price: "₹499", icon: <Star size={24} />, color: "bg-rose-50", text: "text-rose-600", desc: "Unlimited duration and social media push." },
        { id: 4, name: "Candidate Contact Unlock", price: "₹1,499", icon: <Users size={24} />, color: "bg-emerald-50", text: "text-emerald-600", desc: "Unlock contact details for 50 candidates." }
    ];

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <RecruiterSidebar activePage="retail" />
            
            <main className="flex-1 p-4 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Retail Purchase</h1>
                            <p className="text-slate-500 font-medium mt-1">Pay-as-you-go recruitment services and power-ups.</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                            <ShoppingBag className="text-indigo-600" size={20} />
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cart Total</p>
                                <p className="text-lg font-black text-slate-900">₹0.00</p>
                            </div>
                        </div>
                    </header>

                    {/* Filter/Categories */}
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {["All Items", "Email Credits", "Promotions", "Contact Unlocks", "AI Tools"].map((cat, i) => (
                            <button key={i} className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${i === 0 ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                        {items.map(item => (
                            <div key={item.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col justify-between overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50 transition-all"></div>
                                <div className="relative z-10">
                                    <div className={`w-14 h-14 ${item.color} ${item.text} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">{item.name}</h3>
                                    <p className="text-slate-400 font-medium text-xs mb-8 leading-relaxed">{item.desc}</p>
                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-3xl font-black text-slate-900">{item.price}</span>
                                        <span className="text-slate-400 font-bold text-sm">/ item</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handlePurchase(item)}
                                    className="relative z-10 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} />
                                    Purchase Now
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Special Bundle Section */}
                    <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-10">
                        <div className="absolute bottom-0 right-0 p-10 opacity-10">
                            <Sparkles size={150} />
                        </div>
                        <div className="relative z-10 flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
                                <TrendingUp size={16} className="text-indigo-400" />
                                <span className="text-xs font-black uppercase tracking-widest">Growth Bundle</span>
                            </div>
                            <h2 className="text-4xl font-black">All-in-One Hiring Power-up</h2>
                            <p className="text-slate-400 font-medium max-w-xl">500 Email Credits + 1 Week Featured Spot + 25 Candidate Unlocks. Save 40% with this limited time bundle.</p>
                            <div className="flex items-center gap-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black">₹2,999</span>
                                    <span className="text-slate-500 line-through font-bold text-lg">₹4,999</span>
                                </div>
                                <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-indigo-500/20">Buy Bundle</button>
                            </div>
                        </div>
                        <div className="relative z-10 grid grid-cols-2 gap-4 w-full lg:w-fit">
                            {[
                                "40% Discount",
                                "Lifetime Validity",
                                "Priority Support",
                                "AI Matching Incl."
                            ].map((p, i) => (
                                <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-indigo-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{p}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
