"use client";

import React, { useEffect, useMemo, useState } from "react";
import RecruiterSidebar from "@/components/RecruiterSidebar";
import { Check, Crown, History, Loader2 } from "lucide-react";
import { purchaseFromWallet } from "@/utils/walletClient";

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function PlanMeta({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}

export default function SubscriptionsPage() {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.success) {
        const found = data.coupons.find(c => c.code === couponCode.toUpperCase().trim() && c.isActive);
        if (found) {
          setAppliedCoupon(found);
          alert(`Success! ${found.discountValue}${found.discountType === "Percentage" ? "%" : "₹"} discount applied.`);
        } else {
          alert("Invalid or Expired Coupon.");
        }
      }
    } catch (err) {
      alert("Error validating coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  const calculateDiscountedPrice = (originalPrice) => {
    if (!appliedCoupon) return originalPrice;
    const discount = appliedCoupon.discountType === "Percentage"
        ? (originalPrice * appliedCoupon.discountValue / 100)
        : appliedCoupon.discountValue;
    return Math.max(0, originalPrice - discount);
  };

  const load = async () => {
    try {
      const [subRes, walletRes] = await Promise.all([
        fetch("/api/recruiter/subscriptions"),
        fetch("/api/wallet"),
      ]);
      const subData = await subRes.json();
      const walletData = await walletRes.json();

      if (subData.ok) {
        setSubscription(subData.subscription);
        setPlans(subData.plans || []);
      }
      if (walletData.success) setBalance(walletData.balance);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activePlan = useMemo(() => {
    const plan = subscription?.planId;
    return plan?.title ? plan : null;
  }, [subscription]);

  const activePlanId = activePlan?._id || subscription?.planId?._id || subscription?.planId;
  const jobLimit = activePlan?.limits?.jobLimit || 0;
  const usedJobs = subscription?.usedJobs || 0;
  const remainingJobs = Math.max(jobLimit - usedJobs, 0);

  const handleBuy = async (plan) => {
    const finalPrice = calculateDiscountedPrice(plan.price);
    if (finalPrice > 0 && balance < finalPrice) {
      const go = confirm(`Your wallet balance is ${formatPrice(balance)}. You need ${formatPrice(finalPrice)}. Go to the wallet page to add money via Razorpay?`);
      if (go) window.location.href = "/recruiter/wallet";
      return;
    }
    const confirmMessage = finalPrice === 0
      ? `Activate plan "${plan.title}" for Free?`
      : `Buy the "${plan.title}" plan for ${formatPrice(finalPrice)} from your wallet?`;
    if (!confirm(confirmMessage)) return;

    setBuyingId(plan._id);
    try {
      await purchaseFromWallet({ 
        type: "subscription", 
        planId: plan._id,
        couponCode: appliedCoupon?.code || undefined
      });
      alert("Subscription activated!");
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFEFF]">
      <RecruiterSidebar activePage="subscriptions" />
      <main className="flex-1 p-4 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Subscriptions</h1>
              <p className="text-slate-500 font-medium mt-1">Wallet balance: {formatPrice(balance)}</p>
            </div>
            <a
              href="/recruiter/wallet"
              className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-[24px] font-black"
            >
              <History size={20} />
              Wallet
            </a>
          </div>

          {/* Coupon Input */}
          <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-6 rounded-[32px] border border-slate-100">
            <div className="flex-1 w-full relative">
              <input
                type="text"
                placeholder="ENTER COUPON CODE"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full pl-6 pr-24 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all uppercase placeholder:text-slate-300 text-sm"
              />
              <button 
                type="button"
                onClick={handleApplyCoupon} 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all"
              >
                {couponLoading ? "..." : "APPLY"}
              </button>
            </div>
            {appliedCoupon && (
              <div className="bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider border border-emerald-100 shrink-0">
                🎉 {appliedCoupon.code} Applied ({appliedCoupon.discountValue}{appliedCoupon.discountType === "Percentage" ? "%" : "₹"} Off)
              </div>
            )}
          </div>

          <div className="bg-indigo-600 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                <Crown size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Active Plan</span>
              </div>

              <div>
                <h2 className="text-4xl font-black">{activePlan?.title || "No Active Plan"}</h2>
                <p className="text-indigo-100 mt-2">
                  {activePlan ? `${activePlan.planCategory || "Basic"} plan` : "Choose a plan below"}
                </p>
              </div>

              {activePlan ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  <PlanMeta label="Price" value={`${activePlan.price === 0 ? "Free" : formatPrice(activePlan.price)} / ${activePlan.duration} ${activePlan.durationType}`} />
                  <PlanMeta label="Job Limit" value={`${jobLimit} posts`} />
                  <PlanMeta label="Used / Left" value={`${usedJobs} used · ${remainingJobs} left`} />
                  <PlanMeta label="Storage" value={`${activePlan.storage?.value || 0} ${activePlan.storage?.unit || "GB"}`} />
                  <PlanMeta label="Status" value={subscription?.status || "None"} />
                </div>
              ) : (
                <p className="text-indigo-100">Choose a plan below</p>
              )}

              {activePlan ? (
                <p className="text-indigo-100">
                  Expiry: {subscription?.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString("en-IN") : "N/A"} · Status:{" "}
                  {subscription?.status || "None"}
                </p>
              ) : null}

              {activePlan?.features?.length ? (
                <div className="pt-2">
                  <p className="text-[10px] uppercase tracking-widest font-black text-indigo-100 mb-3">Included Features</p>
                  <div className="flex flex-wrap gap-2">
                    {activePlan.features.slice(0, 6).map((feature, index) => (
                      <span key={index} className="px-3 py-2 rounded-full bg-white/10 text-sm font-bold">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.length > 0 ? (
                plans.map((plan) => (
                  <div
                    key={plan._id}
                    className={`bg-white p-10 rounded-[40px] border shadow-sm flex flex-col ${
                      activePlanId?.toString() === plan._id ? "border-indigo-600 border-4" : "border-slate-100"
                    }`}
                  >
                    <h4 className="text-xl font-black text-slate-900 mb-2">{plan.title}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-3">
                      {plan.planCategory || "Basic"}
                    </p>
                    <p className="text-slate-400 text-sm mb-8">{plan.description}</p>
                    <div className="mb-8">
                      {appliedCoupon && plan.price > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-400 line-through mb-1">{formatPrice(plan.price)}</span>
                          <span className="text-5xl font-black text-emerald-600">{calculateDiscountedPrice(plan.price) === 0 ? "Free" : formatPrice(calculateDiscountedPrice(plan.price))}</span>
                        </div>
                      ) : (
                        <span className="text-5xl font-black">{plan.price === 0 ? "Free" : formatPrice(plan.price)}</span>
                      )}
                      <span className="text-slate-400 font-bold ml-2">
                        / {plan.duration} {plan.durationType}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-6 text-xs font-bold text-slate-600">
                      <PlanMeta label="Job Limit" value={`${plan.limits?.jobLimit || 0}`} />
                      <PlanMeta label="Storage" value={`${plan.storage?.value || 0} ${plan.storage?.unit || "GB"}`} />
                    </div>
                    <ul className="space-y-3 flex-1 mb-8">
                      {plan.features?.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm font-bold text-slate-600">
                          <Check size={16} className="text-emerald-500" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      disabled={activePlanId?.toString() === plan._id || buyingId === plan._id}
                      onClick={() => handleBuy(plan)}
                      className="w-full py-5 rounded-[24px] font-black bg-slate-900 text-white disabled:opacity-50"
                    >
                      {buyingId === plan._id ? (
                        <Loader2 className="animate-spin mx-auto" size={20} />
                      ) : activePlanId?.toString() === plan._id ? (
                        "Current Plan"
                      ) : (
                        plan.price === 0 ? "Activate Free Trial" : "Buy with Wallet"
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <p className="col-span-3 text-center text-slate-400 font-bold py-16">No subscription plans available</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
