"use client";
import React, { useState } from 'react';
import Serviceprovidersidbar from '@/components/Serviceprovidersidbar.jsx';
import { ShoppingBag, Search, Filter, Star, ShoppingCart, ArrowRight, Heart, Tag, ShieldCheck, Box, Zap, Loader2, Sparkles, Plus } from 'lucide-react';

export default function RetailPurchasePage() {
    const products = [
        { id: 1, name: "HD Conference Camera", category: "Hardware", price: "₹ 12,500", rating: 4.8, img: "📷" },
        { id: 2, name: "Premium Podcast Mic", category: "Audio", price: "₹ 8,200", rating: 4.9, img: "🎙️" },
        { id: 3, name: "LED Studio Lighting Kit", category: "Hardware", price: "₹ 5,400", rating: 4.7, img: "💡" },
        { id: 4, name: "Expert Course Template", category: "Digital", price: "₹ 2,999", rating: 4.9, img: "📚" },
        { id: 5, name: "Pro Service Contract Pack", category: "Legal", price: "₹ 1,500", rating: 4.6, img: "📄" },
        { id: 6, name: "High-Speed SSD 1TB", category: "Hardware", price: "₹ 6,800", rating: 4.8, img: "💾" },
    ];

    return (
        <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
            <Serviceprovidersidbar activePage="retail" />
            
            <main className="flex-1 overflow-y-auto pt-20 lg:pt-8 no-scrollbar">
                <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-7xl mx-auto space-y-12 pb-20">
                    
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Expert Marketplace</h1>
                            <p className="text-slate-500 font-medium mt-1">Professional equipment and digital assets to upgrade your service quality.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="relative p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                                <ShoppingCart size={24} />
                                <span className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">0</span>
                            </button>
                        </div>
                    </header>

                    {/* Promo Banner */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[50px] p-10 md:p-16 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 bg-white/20 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
                                    <Tag size={16} className="text-amber-300" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exclusive Partner Discount</span>
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">Upgrade your studio. <br /> Get 20% Off.</h3>
                                <p className="text-indigo-100 font-medium text-lg opacity-80">Redeem your service provider points for exclusive hardware and digital tools.</p>
                                <button className="bg-white text-indigo-600 px-10 py-5 rounded-[24px] font-black hover:scale-105 transition-all shadow-2xl">Claim Offer Now</button>
                            </div>
                            <div className="hidden md:flex justify-center relative">
                                 <div className="w-64 h-64 bg-white/10 rounded-[60px] flex items-center justify-center text-8xl backdrop-blur-sm border border-white/20 rotate-12 animate-float">🎙️</div>
                                 <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/20 rounded-[40px] flex items-center justify-center text-6xl backdrop-blur-sm border border-white/20 -rotate-12 animate-float-delayed">📷</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col md:flex-row gap-6">
                         <div className="flex-1 relative">
                             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                             <input type="text" placeholder="Search equipment, templates, and more..." className="w-full pl-14 pr-6 py-5 rounded-[28px] bg-white border border-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-indigo-600 font-bold transition-all" />
                         </div>
                         <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                             {["All Items", "Hardware", "Digital", "Legal", "Software"].map((cat, i) => (
                                 <button key={i} className={`px-8 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${i === 0 ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-600'}`}>{cat}</button>
                             ))}
                         </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white rounded-[50px] p-4 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col">
                                <div className="bg-slate-50 rounded-[40px] aspect-square flex items-center justify-center text-8xl relative overflow-hidden group-hover:bg-slate-100 transition-colors">
                                    <div className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-2xl text-slate-300 hover:text-rose-500 transition-all cursor-pointer opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"><Heart size={20} /></div>
                                    <span className="group-hover:scale-110 transition-transform duration-500">{product.img}</span>
                                </div>
                                <div className="p-8 space-y-6 flex-1 flex flex-col">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{product.category}</span>
                                            <div className="flex items-center gap-1 text-amber-500 text-xs font-black">
                                                <Star size={12} fill="currentColor" /> {product.rating}
                                            </div>
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 leading-tight truncate">{product.name}</h4>
                                    </div>
                                    <div className="mt-auto flex items-center justify-between gap-4">
                                        <span className="text-3xl font-black text-slate-900 tracking-tighter">{product.price}</span>
                                        <button className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100"><Plus size={24} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Trust Banner */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
                        <div className="bg-emerald-50/50 p-8 rounded-[40px] border border-emerald-100 flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-200/50"><ShieldCheck size={32} /></div>
                            <div><h5 className="font-black text-slate-900 text-lg">Verified Goods</h5><p className="text-slate-500 text-xs font-medium">Quality tested for professionals.</p></div>
                        </div>
                        <div className="bg-indigo-50/50 p-8 rounded-[40px] border border-indigo-100 flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-200/50"><Zap size={32} /></div>
                            <div><h5 className="font-black text-slate-900 text-lg">Instant Asset Access</h5><p className="text-slate-500 text-xs font-medium">Immediate digital downloads.</p></div>
                        </div>
                        <div className="bg-amber-50/50 p-8 rounded-[40px] border border-amber-100 flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-lg shadow-amber-200/50"><Box size={32} /></div>
                            <div><h5 className="font-black text-slate-900 text-lg">Global Shipping</h5><p className="text-slate-500 text-xs font-medium">Delivered to your studio door.</p></div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
