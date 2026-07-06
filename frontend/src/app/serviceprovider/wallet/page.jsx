"use client";
import React, { useState, useEffect } from 'react';
import Serviceprovidersidbar from '@/components/Serviceprovidersidbar.jsx';
import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, Plus, History, DollarSign, PieChart, ShieldCheck, Zap, MoreVertical, Loader2 } from 'lucide-react';

export default function DigitalWalletPage() {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWallet = async () => {
        try {
            const res = await fetch('/api/user/wallet');
            const data = await res.json();
            if (data.success) {
                setBalance(data.balance);
                setTransactions(data.transactions);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    return (
        <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
            <Serviceprovidersidbar activePage="wallet" />
            
            <main className="flex-1 overflow-y-auto pt-20 lg:pt-8 transition-all duration-300 no-scrollbar">
                <div className="p-4 sm:p-6 md:p-8 lg:px-12 max-w-6xl mx-auto space-y-10 pb-20">
                    
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                Digital Wallet
                                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Verified Account</div>
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">Manage your earnings, payouts, and service credits.</p>
                        </div>
                        <button className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-[28px] font-black shadow-2xl shadow-slate-200 hover:-translate-y-1 active:scale-95 transition-all">
                            <Plus size={20} />
                            Add Money
                        </button>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Main Card */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Card Display */}
                            <div className="bg-indigo-600 rounded-[50px] p-10 md:p-14 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-colors"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                                
                                <div className="relative z-10 space-y-12">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-indigo-100 text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-80">Available Balance</p>
                                            <h2 className="text-6xl md:text-7xl font-black tracking-tighter">₹ {balance.toLocaleString()}</h2>
                                        </div>
                                        <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                            <Zap size={32} />
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
                                        <div className="flex gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Holder Name</p>
                                                <p className="font-bold text-lg tracking-wide">PARTNER PRO</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Expiry</p>
                                                <p className="font-bold text-lg tracking-wide">05 / 28</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-12 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                                                <div className="flex -space-x-4">
                                                    <div className="w-6 h-6 bg-rose-500 rounded-full opacity-80"></div>
                                                    <div className="w-6 h-6 bg-amber-500 rounded-full opacity-80"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button className="bg-white p-6 rounded-[32px] border border-slate-100 hover:border-indigo-100 transition-all flex flex-col items-center gap-3 group shadow-sm hover:shadow-xl">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><ArrowUpRight size={20} /></div>
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Send</span>
                                </button>
                                <button className="bg-white p-6 rounded-[32px] border border-slate-100 hover:border-indigo-100 transition-all flex flex-col items-center gap-3 group shadow-sm hover:shadow-xl">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all"><ArrowDownLeft size={20} /></div>
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Receive</span>
                                </button>
                                <button className="bg-white p-6 rounded-[32px] border border-slate-100 hover:border-indigo-100 transition-all flex flex-col items-center gap-3 group shadow-sm hover:shadow-xl">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all"><CreditCard size={20} /></div>
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Pay</span>
                                </button>
                                <button className="bg-white p-6 rounded-[32px] border border-slate-100 hover:border-indigo-100 transition-all flex flex-col items-center gap-3 group shadow-sm hover:shadow-xl">
                                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all"><PieChart size={20} /></div>
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Reports</span>
                                </button>
                            </div>

                        </div>

                        {/* Recent Transactions */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col h-full min-h-[500px]">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                        <History className="text-slate-400" size={24} />
                                        Activity
                                    </h3>
                                    <button className="text-indigo-600 font-black text-xs uppercase tracking-widest">View All</button>
                                </div>

                                {loading ? (
                                    <div className="flex-1 flex flex-col items-center justify-center py-20">
                                        <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Securing Connection...</p>
                                    </div>
                                ) : transactions.length > 0 ? (
                                    <div className="space-y-6 overflow-y-auto no-scrollbar flex-1">
                                        {transactions.map((t, idx) => (
                                            <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${t.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                                    {t.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-900 text-[13px] truncate">{t.description || 'Wallet Transaction'}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className={`font-black text-sm ${t.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                    {t.type === 'credit' ? '+' : '-'} ₹ {t.amount}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
                                        <DollarSign size={48} className="text-slate-200 mb-4" />
                                        <p className="text-slate-400 font-bold italic">No transactions found.</p>
                                    </div>
                                )}
                                
                                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 leading-tight">Your transactions are secured with 256-bit encryption for your safety.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}
