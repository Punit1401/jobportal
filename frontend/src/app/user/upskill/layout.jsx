"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, ShieldCheck, Sparkles, CreditCard, Wallet, ArrowRight, CheckCircle2 } from "lucide-react";
import { purchaseFromWallet } from "@/utils/walletClient";
import UserSidebar from "@/components/UserSidebar";

export default function CandidateUpskillLayout({ children }) {
  const pathname = usePathname();
  const { data: session, status: authStatus } = useSession();

  const [loading, setLoading] = useState(true);
  const [activeSub, setActiveSub] = useState(null);
  const [candidatePlans, setCandidatePlans] = useState([]);
  const [purchasingId, setPurchasingId] = useState(null);

  // Define route-to-feature mappings
  const checkAccessCategory = () => {
    const path = pathname.toLowerCase();
    
    const learningRoutes = [
      "/user/upskill/learning-path",
      "/user/upskill/ai-tutor",
      "/user/upskill/industry-trends",
      "/user/upskill/skillgapanalysis",
      "/user/upskill/behavioral-coaching",
      "/user/upskill/networking-suggestions",
      "/user/upskill/salary-benchmarking"
    ];

    const interviewRoutes = [
      "/user/upskill/companyinsights",
      "/user/upskill/company-reviews",
      "/user/upskill/fake-job-check",
      "/user/upskill/mock-interview",
      "/user/upskill/assessments"
    ];

    const portfolioRoutes = [
      "/user/upskill/my-website",
      "/user/upskill/portfolio-builder"
    ];

    if (learningRoutes.some(route => path.startsWith(route))) {
      return { key: "Learning Features", label: "Learning & Skill Development" };
    }
    if (interviewRoutes.some(route => path.startsWith(route))) {
      return { key: "Interview Preparation", label: "Interview Preparation & Insights" };
    }
    if (portfolioRoutes.some(route => path.startsWith(route))) {
      return { key: "My Website & Portfolio", label: "My Website & Portfolio Builder" };
    }

    return null; // Unrestricted route
  };

  const activeCategory = null;

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/subscription");
      const data = await res.json();
      if (data.success) {
        setActiveSub(data.active ? data.subscription : null);
        setCandidatePlans(data.plans || []);
      }
    } catch (err) {
      console.error("Failed to load candidate subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && activeCategory) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [session, pathname]);

  const handleSubscribe = async (plan) => {
    const confirmMsg = plan.price === 0 
      ? `Activate free trial for "${plan.title}"?`
      : `Subscribe to "${plan.title}" for ₹${plan.price}? This will be debited from your digital wallet.`;
    if (!confirm(confirmMsg)) return;

    setPurchasingId(plan._id);
    try {
      await purchaseFromWallet({ type: "subscription", planId: plan._id });
      alert("Subscription activated successfully!");
      fetchSubscription();
    } catch (err) {
      if (err.message.includes("balance") || err.message.includes("balance".toUpperCase())) {
        if (confirm("Insufficient balance in your digital wallet. Would you like to go to the Wallet page to add money?")) {
          window.location.href = "/user/wallet";
        }
      } else {
        alert(err.message || "Checkout failed");
      }
    } finally {
      setPurchasingId(null);
    }
  };

  if (authStatus === "loading" || (loading && activeCategory)) {
    return (
      <div className="flex h-screen bg-[#F8FAFC] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  // If page is unrestricted, or user has correct features, render children normally
  const hasAccess =
    !activeCategory ||
    (activeSub &&
      activeSub.plan?.features?.some(
        (f) => f.toLowerCase() === activeCategory.key.toLowerCase()
      ));

  if (hasAccess) {
    return <>{children}</>;
  }

  // Otherwise, render Paywall UI
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <UserSidebar />
      <main className="flex-1 overflow-y-auto pt-20 lg:pt-8 p-4 sm:p-6 md:p-8 lg:px-12 max-w-5xl mx-auto space-y-8 lg:ml-72">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-8 md:p-12 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30">
              <Sparkles size={14} className="text-indigo-300 animate-pulse" />
              <span className="text-xs font-black text-indigo-200 tracking-wider uppercase">Premium Feature Locked</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Unlock Premium Access to <br />
              <span className="text-indigo-400">{activeCategory.label}</span>
            </h1>
            <p className="text-indigo-200/80 font-medium max-w-2xl text-lg leading-relaxed">
              This section contains premium career intelligence tools. Select one of our flexible Candidate plans below using your secure digital wallet to get started.
            </p>
          </div>
        </div>

        {/* Available Candidate Plans */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={22} />
                Available Plans
              </h3>
              <p className="text-slate-400 text-xs font-bold mt-1">Pay-per-use using your secured wallet balance</p>
            </div>
            <Link 
              href="/user/wallet" 
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-xl text-xs hover:bg-indigo-100 transition-all border border-indigo-100"
            >
              <Wallet size={14} /> My Wallet
            </Link>
          </div>

          {candidatePlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {candidatePlans.map((plan) => (
                <div
                  key={plan._id}
                  className={`border rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all ${
                    plan.isPopular ? "border-indigo-500 ring-2 ring-indigo-500/10 relative" : "border-slate-100"
                  }`}
                >
                  {plan.isPopular && (
                    <span className="absolute -top-3 right-6 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                      Best Value
                    </span>
                  )}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-black text-lg text-slate-900">{plan.title}</h4>
                      <p className="text-slate-400 text-xs font-bold capitalize mt-0.5">{plan.planCategory} tier</p>
                    </div>
                    <p className="text-3xl font-black text-indigo-600">
                      {plan.price === 0 ? "Free" : `₹${plan.price}`}
                      <span className="text-sm text-slate-400 font-bold">
                        / {plan.duration} {plan.durationType}
                      </span>
                    </p>
                    <ul className="text-xs font-bold text-slate-500 space-y-2 pt-2">
                      {plan.features?.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    type="button"
                    disabled={purchasingId === plan._id}
                    onClick={() => handleSubscribe(plan)}
                    className="mt-8 w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                  >
                    {purchasingId === plan._id ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      plan.price === 0 ? (
                        <>Activate Free Trial <ArrowRight size={16} /></>
                      ) : (
                        <>Subscribe with Wallet <ArrowRight size={16} /></>
                      )
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <CreditCard className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-500 font-bold">No Candidate plans are configured in the system.</p>
              <p className="text-slate-400 text-sm mt-1">Please ask admin to create subscription plans for Candidates.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
