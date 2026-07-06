"use client";
import React, { useState, useEffect } from 'react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { Shield, Check, Zap, Star, Crown, ChevronRight, History, CreditCard, Info } from 'lucide-react';

export default function SubscriptionsPage() {
    const [subscription, setSubscription] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const res = await fetch('/api/recruiter/subscriptions');
                const data = await res.json();
                if (data.ok) {
                    setSubscription(data.subscription);
                    setPlans(data.plans);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscription();
    }, []);

    return (
        <div className="flex min-h-screen bg-[#FDFEFF]">
            <RecruiterSidebar activePage="subscriptions" />
            
            <main className="flex-1 p-4 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Subscriptions</h1>
                            <p className="text-slate-500 font-medium mt-1">Manage your recruiter plan and unlock premium hiring features.</p>
                        </div>
                        <button className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-slate-200 hover:-translate-y-1 transition-all">
                            <History size={20} />
                            Billing History
                        </button>
                    </div>

                    {/* Current Plan Card */}
                    <div className="bg-indigo-600 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        <div className="relative z-10 flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md text-indigo-100">
                                <Crown size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">Active Plan</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black leading-tight">{subscription?.planId?.name || "No Active Plan"}</h2>
                            <div className="flex items-center gap-8 text-indigo-100 font-bold">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Next Billing Date</p>
                                    <p className="text-xl">{subscription?.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString() : "N/A"}</p>
                                </div>
                                <div className="w-px h-10 bg-white/20"></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Status</p>
                                    <p className="text-xl text-emerald-400">{subscription?.status || "Inactive"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative z-10 w-full lg:w-96 space-y-4">
                            <button className="w-full py-5 bg-white text-indigo-600 rounded-[24px] font-black shadow-xl hover:scale-105 transition-all">Manage Subscription</button>
                            <button className="w-full py-5 bg-transparent border-2 border-white/30 text-white rounded-[24px] font-black hover:bg-white/10 transition-all">Upgrade to Enterprise</button>
                        </div>
                    </div>

                    {/* Pricing Grid */}
                    <div className="space-y-8">
                        <h3 className="text-2xl font-black text-slate-900 px-2 text-center">Available Plans</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {plans.length > 0 ? plans.map((plan) => (
                                <div key={plan._id} className={`bg-white p-10 rounded-[40px] border shadow-sm flex flex-col justify-between hover:shadow-xl transition-all ${subscription?.planId?._id === plan._id ? 'border-indigo-600 border-4 scale-105 z-10' : 'border-slate-100'}`}>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h4>
                                        <p className="text-slate-400 font-medium text-sm mb-8">{plan.description}</p>
                                        <div className="mb-8">
                                            <span className="text-5xl font-black text-slate-900">₹{plan.price}</span>
                                            <span className="text-slate-400 font-bold ml-2">/ {plan.duration}</span>
                                        </div>
                                        <ul className="space-y-4">
                                            {plan.features?.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                                    <Check size={18} className="text-emerald-500" /> {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <button className={`w-full mt-12 py-5 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all ${subscription?.planId?._id === plan._id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-900 text-white hover:bg-black'}`}>
                                        {subscription?.planId?._id === plan._id ? 'Current Plan' : 'Buy Now'}
                                    </button>
                                </div>
                            )) : (
                                <div className="col-span-3 p-20 text-center text-slate-400 font-bold">No plans available at the moment.</div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
