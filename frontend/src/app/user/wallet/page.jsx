"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownRight, Clock, Loader2, ShieldCheck, IndianRupee, X } from "lucide-react";
import UserSidebar from "@/components/UserSidebar";
import { useRazorpayTopup } from "@/hooks/useRazorpayTopup";

export default function DigitalWalletPage() {
  const { data: session } = useSession();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [amountToAdd, setAmountToAdd] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const { topup, processing: razorpayProcessing } = useRazorpayTopup((data) => {
    setBalance(data.balance);
    // Reload transactions to sync up
    fetchWalletData();
    setShowAddModal(false);
    setAmountToAdd("");
    alert("Money added to wallet successfully!");
  });

  useEffect(() => {
    if (session) {
      fetchWalletData();
    }
  }, [session]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/wallet");
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance);
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Failed to load wallet data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!amountToAdd || isNaN(amountToAdd) || Number(amountToAdd) <= 0) return;
    await topup(amountToAdd);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc]">
      <UserSidebar />
      
      <main className="flex-1 w-full p-4 sm:p-8 lg:p-10 mt-16 lg:mt-0 lg:ml-72 transition-all duration-300">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <WalletIcon className="text-indigo-600" size={32} />
              Digital Wallet
            </h1>
            <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500"/> Secured and encrypted transactions
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Wallet Card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-900/20 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  
                  <p className="text-indigo-200/80 text-sm font-bold tracking-widest uppercase mb-2">Available Balance</p>
                  <h2 className="text-5xl font-black mb-8 tracking-tighter flex items-center">
                    <IndianRupee size={36} className="mr-1 opacity-80" />
                    {balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </h2>
                  
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="w-full bg-white text-indigo-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all active:scale-95 shadow-lg"
                  >
                    <Plus size={20} /> Add Money
                  </button>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="font-black text-slate-800 mb-2">Quick Top-ups</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 2000].map(amt => (
                      <button 
                        key={amt} 
                        onClick={() => { setAmountToAdd(amt.toString()); setShowAddModal(true); }}
                        className="bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold py-3 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all text-sm"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Transactions */}
              <div className="lg:col-span-2">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-full">
                  <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center justify-between">
                    Recent Transactions
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">Last 20</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {transactions.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 flex flex-col items-center">
                        <Clock size={48} className="opacity-20 mb-4" />
                        <p className="font-bold">No transactions yet.</p>
                      </div>
                    ) : (
                      transactions.map((txn) => (
                        <div key={txn._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${txn.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                              {txn.type === 'credit' ? <ArrowDownRight size={24} /> : <ArrowUpRight size={24} />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{txn.purpose}</p>
                              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider flex items-center gap-1">
                                <Clock size={10} /> {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-black text-lg ${txn.type === 'credit' ? 'text-emerald-500' : 'text-slate-800'}`}>
                              {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              {txn.status}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Add Money Modal */}
        <AnimatePresence>
          {showAddModal && (
            <>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]" onClick={() => setShowAddModal(false)} />
              <motion.div 
                initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} 
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white p-8 rounded-[2rem] shadow-2xl z-[201]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-slate-900">Add Money</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-2 bg-slate-50 rounded-xl"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleAddMoney}>
                  <div className="mb-6 relative">
                    <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                    <input 
                      type="number" 
                      autoFocus
                      placeholder="Amount" 
                      min="1"
                      value={amountToAdd}
                      onChange={(e) => setAmountToAdd(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-2xl text-slate-800 focus:border-indigo-500 focus:ring-2 ring-indigo-500/20 transition-all"
                    />
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-xl mb-6 border border-indigo-100 flex gap-3">
                    <ShieldCheck size={24} className="text-indigo-600 shrink-0" />
                    <p className="text-xs font-bold text-indigo-900/70 leading-relaxed">
                      Payments are processed securely via the Razorpay payment gateway with 256-bit encryption.
                    </p>
                  </div>

                  <button 
                    type="submit" 
                    disabled={!amountToAdd || razorpayProcessing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                  >
                    {razorpayProcessing ? <Loader2 className="animate-spin" /> : "Proceed to Pay"}
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
