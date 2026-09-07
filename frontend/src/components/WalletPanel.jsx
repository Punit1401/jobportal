"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, IndianRupee, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useRazorpayTopup } from "@/hooks/useRazorpayTopup";

export default function WalletPanel({ compact = false }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [spentThisMonth, setSpentThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");

  const loadWallet = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      if (data.success || data.ok) {
        setBalance(data.balance);
        setTransactions(data.transactions || []);
        setSpentThisMonth(data.spentThisMonth || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const { topup, processing } = useRazorpayTopup((data) => {
    setBalance(data.balance);
    setShowModal(false);
    setAmount("");
    loadWallet();
    alert(data.message || "Amount has been added to your wallet!");
  });

  const handleTopup = (e) => {
    e.preventDefault();
    topup(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <>
      <div className={`grid ${compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"} gap-8`}>
        <div className={compact ? "" : "lg:col-span-2"}>
          <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden min-h-[260px] flex flex-col justify-between shadow-2xl">
            <div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">
                Available Balance
              </p>
              <h2 className="text-5xl md:text-6xl font-black flex items-center gap-1">
                <IndianRupee size={36} className="opacity-80" />
                {balance.toLocaleString("en-IN")}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-white/10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">This month spent</p>
                <p className="text-2xl font-black">Rs. {spentThisMonth.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment via</p>
                <p className="text-2xl font-black">Razorpay</p>
              </div>
            </div>
          </div>
        </div>

        {!compact && (
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-4">Add Money</h3>
              <p className="text-slate-500 text-sm mb-6">
                Subscription, Ads and Storage - pay for everything from your wallet balance.
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmount(String(amt));
                      setShowModal(true);
                    }}
                    className="py-3 rounded-xl bg-slate-50 font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100"
                  >
                    Rs. {amt}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-black"
            >
              <Plus size={20} /> Add via Razorpay
            </button>
          </div>
        )}
      </div>

      <div className="mt-10 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="text-xl font-black text-slate-900">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {transactions.length > 0 ? (
            transactions.map((t) => (
              <div key={t._id} className="p-6 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      t.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {t.type === "credit" ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t.purpose}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(t.createdAt).toLocaleString("en-IN")} · {t.status}
                    </p>
                  </div>
                </div>
                <p className={`text-lg font-black ${t.type === "credit" ? "text-emerald-600" : "text-slate-900"}`}>
                  {t.type === "credit" ? "+" : "-"}Rs. {t.amount.toLocaleString("en-IN")}
                </p>
              </div>
            ))
          ) : (
            <p className="p-12 text-center text-slate-400 font-bold">No transactions yet</p>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleTopup} className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Wallet Top-up</h3>
            <p className="text-slate-500 text-sm mb-6">Secure payment via Razorpay</p>
            <input
              type="number"
              min={100}
              max={100000}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (Rs.)"
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold mb-6 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="flex-1 py-4 rounded-2xl font-black bg-indigo-600 text-white flex items-center justify-center gap-2"
              >
                {processing ? <Loader2 className="animate-spin" size={18} /> : "Pay Now"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
