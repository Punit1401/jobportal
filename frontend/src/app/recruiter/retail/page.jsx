"use client";
import React, { useState, useEffect } from 'react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { ShoppingBag, Zap, Mail, Users, Plus, Star, CheckCircle2, TrendingUp, Sparkles, Loader2, Box } from 'lucide-react';

export default function RetailPurchasePage() {
    const [purchases, setPurchases] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [storagePlans, setStoragePlans] = useState([]);
    const [adPlans, setAdPlans] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [selectedJobIds, setSelectedJobIds] = useState({});
    const [activeCategory, setActiveCategory] = useState("All Items");
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Transactions/Purchases history
            const res = await fetch('/api/recruiter/retail');
            const data = await res.json();
            if (data.ok) setPurchases(data.data);

            // Fetch Wallet Balance
            const walletRes = await fetch('/api/recruiter/wallet');
            const walletData = await walletRes.json();
            if (walletData.ok) setWalletBalance(walletData.balance);

            // Fetch Subscription Plans
            const subRes = await fetch('/api/recruiter/subscriptions');
            const subData = await subRes.json();
            if (subData.ok) setSubscriptionPlans(subData.plans || []);

            // Fetch Storage Plans
            const storageRes = await fetch('/api/storage-plans');
            const storageData = await storageRes.json();
            if (storageData.success) setStoragePlans(storageData.plans || []);

            // Fetch Ad Plans
            const adRes = await fetch('/api/ad-plans');
            const adData = await adRes.json();
            if (adData.success) setAdPlans(adData.plans || []);

            // Fetch Recruiter Jobs
            const jobsRes = await fetch('/api/recruiter/jobs/post');
            const jobsData = await jobsRes.json();
            if (jobsData.success) setJobs(jobsData.jobs || []);
        } catch (error) {
            console.error("Fetch Retail Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePurchase = async (item) => {
        try {
            let payload = { type: item.type, planId: item._id };
            
            if (item.type === 'advertising') {
                const jobId = selectedJobIds[item._id];
                if (!jobId) {
                    alert("Please select a job to promote first.");
                    return;
                }
                payload.jobId = jobId;
            }

            const res = await fetch('/api/wallet/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                alert(`Successfully purchased ${item.title || item.name}!`);
                fetchData(); // Reload wallet balance and transaction logs
            } else {
                alert("Error: " + (data.error || "Could not complete purchase."));
            }
        } catch (error) {
            alert("Connection error.");
        }
    };

    // Grouping all retrieved plans under unified format
    const allItems = [
        ...subscriptionPlans.map(p => ({ ...p, type: 'subscription', priceLabel: `₹${p.price}`, icon: <Star size={24} />, color: "bg-rose-50", text: "text-rose-600", categoryName: "Subscription Plans" })),
        ...storagePlans.map(p => ({ ...p, type: 'storage', priceLabel: `₹${p.price}`, icon: <Box size={24} />, color: "bg-indigo-50", text: "text-indigo-600", categoryName: "Storage Plans" })),
        ...adPlans.map(p => ({ ...p, type: 'advertising', priceLabel: `₹${p.price}`, icon: <Zap size={24} />, color: "bg-amber-50", text: "text-amber-600", categoryName: "Advertisement Plans" })),
    ];

    const categories = ["All Items", "Subscription Plans", "Storage Plans", "Advertisement Plans"];
    const filteredItems = activeCategory === "All Items" 
        ? allItems 
        : allItems.filter(item => item.categoryName === activeCategory);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <RecruiterSidebar activePage="retail" />
            
            <main className="flex-1 p-4 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Retail Purchase</h1>
                            <p className="text-slate-500 font-medium mt-1">Upgrade your space, promote job campaigns, and subscribe to premium plans.</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                            <ShoppingBag className="text-indigo-600" size={20} />
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallet Balance</p>
                                <p className="text-lg font-black text-slate-900">₹{walletBalance.toLocaleString()}</p>
                            </div>
                        </div>
                    </header>

                    {/* Filter/Categories */}
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {categories.map((cat, i) => (
                            <button 
                                key={i} 
                                onClick={() => setActiveCategory(cat)}
                                className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Items Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <Loader2 className="animate-spin text-indigo-600" size={40} />
                            <p className="text-slate-400 font-bold">Loading plans...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {filteredItems.map(item => (
                                <div key={item._id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col justify-between overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50 transition-all"></div>
                                    <div className="relative z-10 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className={`w-14 h-14 ${item.color} ${item.text} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                                {item.icon}
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 mb-2">{item.title}</h3>
                                            <p className="text-slate-400 font-medium text-xs mb-6 leading-relaxed">
                                                {item.type === 'subscription' && (item.description || `${item.duration} ${item.durationType} validity.`)}
                                                {item.type === 'storage' && `${item.addedSpaceMB} MB additional storage space.`}
                                                {item.type === 'advertising' && (item.description || `Advertise for ${item.duration} ${item.durationType} (${item.estimatedImpressions?.toLocaleString() || 0} est. impressions).`)}
                                            </p>
                                            
                                            {/* Dynamic Features List if present */}
                                            {item.features && item.features.length > 0 && (
                                                <ul className="mb-6 space-y-2">
                                                    {item.features.map((feature, idx) => (
                                                        <li key={idx} className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {item.type === 'advertising' && (
                                                <div className="mt-4 mb-6">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Job to Promote</label>
                                                    <select 
                                                        value={selectedJobIds[item._id] || ""}
                                                        onChange={(e) => setSelectedJobIds({ ...selectedJobIds, [item._id]: e.target.value })}
                                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 text-xs transition-all"
                                                    >
                                                        <option value="">Choose a job...</option>
                                                        {jobs.map(job => (
                                                            <option key={job._id} value={job._id}>{job.title}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            <div className="flex items-baseline gap-1 mb-8">
                                                <span className="text-3xl font-black text-slate-900">{item.priceLabel}</span>
                                                <span className="text-slate-400 font-bold text-sm">
                                                    {item.type === 'subscription' ? ` / ${item.duration} ${item.durationType}` : '/ one-time'}
                                                </span>
                                            </div>
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
                            {filteredItems.length === 0 && (
                                <div className="col-span-full py-20 text-center text-slate-400 font-bold">
                                    No purchase packages found in this category.
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
