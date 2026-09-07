"use client";

import React, { useState, useEffect } from "react";
import { Loader2, HardDrive, Zap } from "lucide-react";
import { purchaseFromWallet } from "@/utils/walletClient";

export default function StoragePlansSection({ onSuccess, walletHref }) {
  const [buying, setBuying] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    fetch("/api/storage-plans")
      .then(res => res.json())
      .then(data => {
        if (data.success) setPlans(data.plans || []);
        setLoadingPlans(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingPlans(false);
      });
  }, []);

  const handleBuy = async (pack) => {
    setBuying(pack._id);
    try {
      const data = await purchaseFromWallet({ type: "storage", planId: pack._id });
      alert(data.message || "Storage upgraded successfully!");
      onSuccess?.(data.storageLimit);
    } catch (e) {
      if (e.message?.includes("Insufficient") && walletHref) {
        if (confirm("Wallet માં પૂરતું બેલેન્સ નથી. શું તમે Wallet રિચાર્જ પેજ પર જવા માંગો છો?")) {
          window.location.href = walletHref;
        }
      } else {
        alert(e.message);
      }
    } finally {
      setBuying(null);
    }
  };

  if (loadingPlans) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (plans.length === 0) {
    return null; // Don't show the section if no plans are available
  }

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
          <HardDrive size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900">Upgrade Storage</h3>
          <p className="text-slate-500 font-bold text-sm">Get more space for your files. Purchases are permanent.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((pack) => (
          <div key={pack._id} className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
              <Zap size={100} className="text-indigo-600" />
            </div>
            
            <div>
              <h4 className="text-2xl font-black text-slate-900 mb-2">{pack.title}</h4>
              <div className="text-indigo-600 font-black text-3xl mb-6">₹{pack.price}</div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-slate-600 font-bold">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  +{pack.addedSpaceMB} MB Space
                </li>
                <li className="flex items-center gap-3 text-slate-600 font-bold">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  Lifetime Access
                </li>
                <li className="flex items-center gap-3 text-slate-600 font-bold">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  Instant Activation
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => handleBuy(pack)}
              disabled={buying === pack._id}
              className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-slate-200 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {buying === pack._id ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : "Purchase Now"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
