"use client";
import React, { useState, useEffect } from 'react';
import RecruiterSidebar from '@/components/RecruiterSidebar';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, History, CreditCard, DollarSign, ChevronRight, TrendingUp, Download, Settings } from 'lucide-react';

export default function WalletPage() {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const res = await fetch('/api/recruiter/wallet');
                const data = await res.json();
                if (data.ok) {
                    setBalance(data.balance);
                    setTransactions(data.transactions);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchWallet();
    }, []);

    const handleAddFunds = () => {
        const amount = prompt("Enter amount to add:");
        if (amount) alert(`Redirecting to secure payment gateway for ₹${amount}...`);
    };

    const handleDownloadStatement = () => {
        alert("Generating your wallet statement. It will be sent to your registered email shortly.");
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <RecruiterSidebar activePage="wallet" />
            
            <main className="flex-1 p-4 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Digital Wallet</h1>
                            <p className="text-slate-500 font-medium mt-1">Manage your funds, advertising budget and subscriptions.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="p-4 bg-white border border-slate-100 rounded-[20px] text-slate-400 hover:text-indigo-600 transition-all">
                                <Settings size={20} />
                            </button>
                            <button 
                                onClick={handleAddFunds}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all"
                            >
                                <Plus size={20} />
                                Add Funds
                            </button>
                        </div>
                    </header>

                    {/* Balance & Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Main Balance Card */}
                        <div className="lg:col-span-2 bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden flex flex-col justify-between min-h-[300px] shadow-2xl">
                            <div className="absolute bottom-0 right-0 p-10 opacity-10">
                                <Wallet size={200} />
                            </div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">Available Balance</p>
                                    <h2 className="text-6xl font-black">₹{balance.toLocaleString()}</h2>
                                </div>
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <TrendingUp size={24} className="text-indigo-400" />
                                </div>
                            </div>
                            
                            <div className="relative z-10 grid grid-cols-2 gap-8 mt-12 pt-10 border-t border-white/5">
                                <div>
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1">Spent this month</p>
                                    <p className="text-2xl font-black">₹0.00</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1">Upcoming Payments</p>
                                    <p className="text-2xl font-black">₹0.00</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Card */}
                        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-6">Linked Method</h3>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group overflow-hidden cursor-pointer">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                                        <CreditCard size={64} />
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white italic font-black">V</div>
                                        <span className="font-bold text-slate-700">Visa ending in 4242</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires 12/28</p>
                                </div>
                            </div>
                            <button className="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 transition-all flex items-center justify-center gap-2">
                                Manage Methods <ChevronRight size={14} />
                            </button>
                        </div>

                    </div>

                    {/* Transactions Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-2xl font-black text-slate-900">Recent Transactions</h3>
                            <button 
                                onClick={handleDownloadStatement}
                                className="flex items-center gap-2 text-indigo-600 font-bold text-sm"
                            >
                                <Download size={16} />
                                Download Statement
                            </button>
                        </div>

                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="divide-y divide-slate-50">
                                {transactions.length > 0 ? transactions.map((t) => (
                                    <div key={t._id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${t.type === 'credit' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'}`}>
                                                {t.type === 'credit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900">{t.description || t.category}</h4>
                                                <p className="text-xs font-bold text-slate-400 mt-1">{new Date(t.createdAt).toLocaleDateString()} • {t.status}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xl font-black ${t.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Transaction ID: {t._id.toString().slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-20 text-center text-slate-400 font-bold">No transactions found.</div>
                                )}
                            </div>
                            <button className="w-full py-6 bg-slate-50/50 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-indigo-600 transition-all flex items-center justify-center gap-2 border-t border-slate-50">
                                View Full History <History size={16} />
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
