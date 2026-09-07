"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Lock, Crown, Loader2, ArrowRight, CheckCircle2, Wallet, CreditCard, Sparkles } from "lucide-react";
import Link from "next/link";
import { purchaseFromWallet } from "@/utils/walletClient";

export default function FeatureGuard({ featureName, children }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [freeUsesCount, setFreeUsesCount] = useState(0);
  const [trialAllowed, setTrialAllowed] = useState(false);
  const [subUsesUsed, setSubUsesUsed] = useState(0);
  const [subUseLimit, setSubUseLimit] = useState(0);
  const [candidatePlans, setCandidatePlans] = useState([]);
  const [purchasingId, setPurchasingId] = useState(null);
  const hasConsumed = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") || null;
  const isBypassed = pathname === "/user/govt-schemes" && tab === "Internship";

  // Determine if it's recruiter, service provider or candidate based on URL
  const isRecruiter = pathname?.startsWith("/recruiter");
  const isServiceProvider = pathname?.startsWith("/serviceprovider");
  const isCandidate = pathname?.startsWith("/user");
  
  const roleType = isRecruiter ? "recruiter" : isServiceProvider ? "serviceprovider" : isCandidate ? "user" : null;
  const subscriptionUrl = isCandidate ? "/user/upskill" : `/${roleType}/subscriptions`;

  const fetchSubscription = async () => {
    if (isBypassed) return;
    try {
      const apiPath = "/api/user/subscription";
      const res = await fetch(apiPath);
      if (res.ok) {
        const data = await res.json();
        setCandidatePlans(data.plans || []);
        const pathnameKey = pathname.toLowerCase().replace(/\//g, "_").replace(/\./g, "_");
        const currentCount = data.freeUses?.[pathnameKey] || 0;
        setFreeUsesCount(currentCount);
        setTrialAllowed(currentCount < 3);
        if (data.subscription && data.subscription.status === "Active") {
          setSubUsesUsed(data.subscription.subUsesUsed || 0);
          setSubUseLimit(data.subscription.useLimit || 0);
          const plan = data.subscription.planId || data.subscription.plan;
          const features = plan?.features || [];
          if (features.some(f => f.toLowerCase() === featureName.toLowerCase())) {
            setHasAccess(true);
          } else {
            setHasAccess(false);
          }
        } else {
          setHasAccess(false);
        }
      }
    } catch (err) {
      console.error("Error checking subscription:", err);
    }
  };

  useEffect(() => {
    async function checkAccess() {
      if (isBypassed) {
        setHasAccess(true);
        setLoading(false);
        return;
      }
      if (!roleType) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      try {
        const apiPath = isCandidate ? "/api/user/subscription" : `/api/${roleType}/subscriptions`;
        const res = await fetch(apiPath);
        if (res.ok) {
          const data = await res.json();
          if (isCandidate) {
            setCandidatePlans(data.plans || []);
            const pathnameKey = pathname.toLowerCase().replace(/\//g, "_").replace(/\./g, "_");
            const currentCount = data.freeUses?.[pathnameKey] || 0;
            setFreeUsesCount(currentCount);
            setTrialAllowed(currentCount < 3);
          }
          // Check if subscription exists and is active
          if (data.subscription && data.subscription.status === "Active") {
            setSubUsesUsed(data.subscription.subUsesUsed || 0);
            setSubUseLimit(data.subscription.useLimit || 0);
            const plan = data.subscription.planId || data.subscription.plan;
            // Some APIs return populated planId, some return plan.
            const features = plan?.features || [];
            if (features.some(f => f.toLowerCase() === featureName.toLowerCase())) {
              setHasAccess(true);
            } else {
              setHasAccess(false);
            }
          } else {
            // No active subscription
            setHasAccess(false);
          }
        }
      } catch (err) {
        console.error("Error checking subscription:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [roleType, featureName, isBypassed, pathname]);

  // Handle free trial OR plan limit usage increment
  useEffect(() => {
    if (loading) return;
    if (isBypassed) return;
    if (!isCandidate) return;
    if (hasConsumed.current) return;

    // Case A: Free trial
    if (!hasAccess) {
      if (!trialAllowed) return;
      hasConsumed.current = true;
      async function consumeTrial() {
        try {
          const res = await fetch("/api/user/use-free-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pathname })
          });
          const data = await res.json();
          if (data.success) {
            setFreeUsesCount(data.freeUsesCount);
          }
        } catch (err) { console.error("Failed to consume free usage token:", err); }
      }
      consumeTrial();
    }

    // Case B: Active plan, but it has a useLimit
    if (hasAccess && subUseLimit > 0) {
      if (subUsesUsed >= subUseLimit) return;
      hasConsumed.current = true;
      async function consumePlanUse() {
        try {
          const res = await fetch("/api/user/use-plan-use", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pathname })
          });
          const data = await res.json();
          if (data.success) {
            setSubUsesUsed(data.subUsesUsed);
            // If they reached the limit on this visit, toggle hasAccess immediately
            if (data.subUsesUsed >= subUseLimit) {
              setHasAccess(false);
            }
          }
        } catch (err) { console.error("Failed to consume plan usage:", err); }
      }
      consumePlanUse();
    }
  }, [loading, hasAccess, isBypassed, isCandidate, trialAllowed, subUsesUsed, subUseLimit, pathname]);

  const handleSubscribe = async (plan) => {
    const confirmMsg = plan.price === 0 
      ? `Activate free trial for "${plan.title}"?`
      : `Subscribe to "${plan.title}" for ₹${plan.price}? This will be debited from your digital wallet.`;
    if (!confirm(confirmMsg)) return;

    setPurchasingId(plan._id);
    try {
      await purchaseFromWallet({ type: "subscription", planId: plan._id });
      alert("Subscription activated successfully!");
      await fetchSubscription();
    } catch (err) {
      if (err.message?.includes("balance") || err.message?.includes("BALANCE") || err.message?.toLowerCase()?.includes("insufficient")) {
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-400 font-bold animate-pulse text-sm">Verifying subscription access...</p>
      </div>
    );
  }

  if (!hasAccess && isCandidate && trialAllowed) {
    return (
      <div className="flex flex-col w-full">
        {/* Trial banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 text-white flex flex-col sm:flex-row justify-between items-center gap-3 font-black text-xs uppercase tracking-widest rounded-[2rem] shadow-lg shadow-amber-100 mb-6 mt-4 mx-4 md:mx-8 animate-in slide-in-from-top-4 duration-300 border border-amber-400/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={16} className="animate-pulse text-amber-100" />
            </div>
            <div>
              <p className="font-black">Premium Paid Feature (Trial Active)</p>
              <p className="text-[10px] text-amber-100 font-bold mt-0.5">
                This is a paid feature. You can use it for free up to 3 times total.
              </p>
            </div>
          </div>
          <span className="bg-white text-orange-600 px-4 py-2 rounded-xl border border-white/20 font-black shrink-0 shadow-sm">
            {freeUsesCount} / 3 USES USED
          </span>
        </div>
        {children}
      </div>
    );
  }

  if (!hasAccess) {
    if (isCandidate) {
      return (
        <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-8 md:p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30">
                <Sparkles size={14} className="text-indigo-300 animate-pulse" />
                <span className="text-xs font-black text-indigo-200 tracking-wider uppercase">Premium Feature Locked</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Unlock Premium Access to <br />
                <span className="text-indigo-400">"{featureName}"</span>
              </h1>
              <p className="text-indigo-200/80 font-medium max-w-2xl text-sm leading-relaxed">
                This feature requires a premium candidate subscription. Subscribe to one of our flexible Candidate plans below using your secured digital wallet.
              </p>
            </div>
          </div>

          {/* Available Candidate Plans */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500" size={20} />
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
                        <h4 className="font-black text-base text-slate-900">{plan.title}</h4>
                        <p className="text-slate-400 text-[10px] font-bold capitalize mt-0.5">{plan.planCategory} tier</p>
                      </div>
                      <p className="text-2xl font-black text-indigo-600">
                        {plan.price === 0 ? "Free" : `₹${plan.price}`}
                        <span className="text-xs text-slate-400 font-bold">
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
                      className="mt-8 w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 cursor-pointer"
                    >
                      {purchasingId === plan._id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        plan.price === 0 ? (
                          <>Activate Free Trial <ArrowRight size={14} /></>
                        ) : (
                          <>Subscribe with Wallet <ArrowRight size={14} /></>
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
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center">
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-rose-100">
          <Lock size={40} className="text-rose-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Access Denied</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium leading-relaxed">
          The <span className="font-bold text-slate-700">"{featureName}"</span> feature is not included in your current active plan. Please upgrade your subscription to unlock this premium capability.
        </p>
        <Link href={subscriptionUrl} className="group relative inline-flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 overflow-hidden">
          <Crown size={18} className="relative z-10 text-amber-400" />
          <span className="relative z-10 tracking-wide uppercase">Upgrade Plan</span>
          <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  if (hasAccess && isCandidate && subUseLimit > 0) {
    return (
      <div className="flex flex-col w-full">
        {/* Plan usage banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white flex flex-col sm:flex-row justify-between items-center gap-3 font-black text-xs uppercase tracking-widest rounded-[2rem] shadow-lg shadow-blue-100 mb-6 mt-4 mx-4 md:mx-8 animate-in slide-in-from-top-4 duration-300 border border-blue-400/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-blue-100 animate-pulse" />
            </div>
            <div>
              <p className="font-black text-white">Premium Plan Active</p>
              <p className="text-[10px] text-blue-100 font-bold mt-0.5 normal-case">
                Your current active plan has a limit of {subUseLimit} uses total.
              </p>
            </div>
          </div>
          <span className="bg-white text-blue-600 px-4 py-2 rounded-xl border border-white/20 font-black shrink-0 shadow-sm">
            {subUsesUsed} / {subUseLimit} PLAN USES USED
          </span>
        </div>
        {children}
      </div>
    );
  }

  return children;
}
