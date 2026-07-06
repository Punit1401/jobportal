"use client";
import React, { useState } from 'react';
import Serviceprovidersidbar from '@/components/Serviceprovidersidbar.jsx';
import { Star, CheckCircle2, ShieldCheck, Zap, Layers, CreditCard, ArrowRight, X, Clock, HelpCircle } from 'lucide-react';

export default function SubscriptionsPage() {
    const plans = [
        {
            name: "Basic",
            price: "Free",
            desc: "For individual experts starting their digital journey.",
            features: ["5 Service Listings", "Basic Analytics", "100MB Cloud Storage", "Email Support"],
            isPopular: false,
            color: "slate"
        },
        {
            name: "Pro Partner",
            price: "₹ 999",
            period: "/month",
            desc: "Most popular for growing service providers and teams.",
            features: ["Unlimited Listings", "Advanced AI Features", "1GB Cloud Storage", "Priority Support", "Custom Branding", "Ads Management"],
            isPopular: true,
            color: "indigo"
        },
        {
            name: "Enterprise",
            price: "Custom",
            desc: "Bespoke solutions for large organizations and agencies.",
            features: ["Everything in Pro", "Dedicated Account Manager", "White-label Solution", "API Access", "Custom Integration"],
            isPopular: false,
            color: "slate"
        }
    ];

    return (
        <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
            <Serviceprovidersidbar activePage="subscriptions" />
            
            <main className="flex-1 overflow-y-auto pt-20 lg:pt-8 no-scrollbar">
                <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-7xl mx-auto space-y-12 pb-20">
                    
                    {/* Header */}
                    <header className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 bg-indigo-50 px-6 py-2 rounded-full border border-indigo-100">
                            <Star size={16} className="text-indigo-600" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Premium Plans</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">Choose the perfect <span className="text-indigo-600">Growth Plan.</span></h1>
                        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Scale your service business with powerful tools and features tailored to your needs.</p>
                    </header>

                    {/* Current Plan Alert */}
                    <div className="bg-slate-900 rounded-[40px] p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/5 backdrop-blur-md">
                                <Zap size={32} className="text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Current Active Plan</p>
                                <h3 className="text-3xl font-black">Basic Plan <span className="text-sm font-bold text-slate-400 ml-2">(Trial)</span></h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                             <div className="text-right hidden md:block">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Billing Date</p>
                                 <p className="font-bold text-sm">June 15, 2026</p>
                             </div>
                             <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Manage Billing</button>
                        </div>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {plans.map((plan, idx) => (
                            <div key={idx} className={`bg-white rounded-[50px] p-10 border ${plan.isPopular ? 'border-indigo-600 shadow-2xl shadow-indigo-100 ring-4 ring-indigo-50' : 'border-slate-100 shadow-sm'} relative group transition-all hover:-translate-y-2`}>
                                {plan.isPopular && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200">Most Popular</div>
                                )}
                                
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h4>
                                        <p className="text-slate-400 font-medium text-sm leading-relaxed">{plan.desc}</p>
                                    </div>
                                    
                                    <div className="flex items-baseline gap-1">
                                        <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{plan.price}</h3>
                                        <span className="text-slate-400 font-bold text-sm uppercase">{plan.period}</span>
                                    </div>

                                    <button className={`w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all shadow-xl ${plan.isPopular ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-100'}`}>Get Started Now</button>

                                    <div className="space-y-4 pt-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Key Features</p>
                                        {plan.features.map((feature, fidx) => (
                                            <div key={fidx} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                                <CheckCircle2 size={18} className="text-indigo-600 shrink-0" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </main>
        </div>
    );
}
