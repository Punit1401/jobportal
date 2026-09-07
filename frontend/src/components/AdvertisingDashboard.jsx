"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Target,
  TrendingUp,
  Users,
  CheckCircle2,
  Zap,
  Loader2,
  Clock,
  IndianRupee,
} from "lucide-react";
import { purchaseFromWallet } from "@/utils/walletClient";

export default function AdvertisingDashboard({ Sidebar, activePage, role }) {
  const [campaigns, setCampaigns] = useState([]);
  const [plans, setPlans] = useState([]);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ totalImpressions: 0, totalClicks: 0, activeCount: 0 });
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [campaignName, setCampaignName] = useState("");
  const [targets, setTargets] = useState([]);
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [savingTarget, setSavingTarget] = useState(false);

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

  const walletHref = role === "recruiter" ? "/recruiter/wallet" : "/serviceprovider/wallet";
  const adsEndpoint = role === "serviceprovider" ? "/api/serviceprovider/advertising" : "/api/recruiter/advertising";

  const load = async () => {
    try {
      const [adsRes, plansRes, walletRes] = await Promise.all([
        fetch(adsEndpoint),
        fetch("/api/ad-plans"),
        fetch("/api/wallet"),
      ]);
      const adsData = await adsRes.json();
      const plansData = await plansRes.json();
      const walletData = await walletRes.json();

      if (!adsRes.ok) {
        throw new Error(adsData.error || "Failed to load campaigns");
      }
      if (adsData.ok || adsData.success) {
        setCampaigns(adsData.data || []);
        setStats(adsData.stats || { totalImpressions: 0, totalClicks: 0, activeCount: 0 });
      }
      if (plansData.success) setPlans(plansData.plans || []);
      if (walletData.success) setBalance(walletData.balance);
    } catch (error) {
      console.error(error);
      alert(error.message || "Could not load advertising data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const loadTargets = async () => {
    try {
      if (role === "recruiter") {
        const res = await fetch("/api/recruiter/jobs/post");
        const data = await res.json();
        const list = (data.jobs || []).map((j) => ({ id: j._id, label: j.title || "Untitled job" }));
        setTargets(list);
        setSelectedTargetId((prev) => prev || list[0]?.id || "");
      } else {
        const res = await fetch("/api/serviceprovider/serviceform");
        const data = await res.json();
        const list = (data.services || []).map((s) => ({ id: s._id, label: s.title || "Untitled service" }));
        setTargets(list);
        setSelectedTargetId((prev) => prev || list[0]?.id || "");
      }
    } catch (error) {
      console.error(error);
      setTargets([]);
      setSelectedTargetId("");
    }
  };

  useEffect(() => {
    load();
    loadTargets();
  }, []);

  useEffect(() => {
    setCouponCode("");
    setAppliedCoupon(null);
  }, [selectedPlan]);

  const handleBuyPlan = async (plan) => {
    const finalPrice = calculateDiscountedPrice(plan.price);
    if (balance < finalPrice) {
      if (confirm("Insufficient wallet balance. Go to Wallet to add money via Razorpay?")) {
        window.location.href = walletHref;
      }
      return;
    }
    if (!confirm(`Purchase "${plan.title}" for ₹${finalPrice} from your wallet?`)) return;
    if (!selectedTargetId) {
      alert(
        role === "recruiter"
          ? "Please select a job before purchasing an advertisement plan."
          : "Please select a service before purchasing an advertisement plan."
      );
      return;
    }

    setBuyingId(plan._id);
    try {
      const payload = {
        type: "advertising",
        planId: plan._id,
        campaignName: campaignName.trim() || plan.title,
        couponCode: appliedCoupon?.code || undefined,
      };
      if (role === "recruiter") payload.jobId = selectedTargetId;
      if (role === "serviceprovider") payload.serviceId = selectedTargetId;

      await purchaseFromWallet(payload);
      setSelectedPlan(null);
      setCampaignName("");
      alert("Advertisement plan purchased successfully!");
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBuyingId(null);
    }
  };

  const getTargetLabel = (camp) => {
    if (role === "recruiter") return camp.jobId?.title || null;
    return camp.serviceId?.title || null;
  };

  const handleSaveTarget = async () => {
    if (!editingCampaign || !selectedTargetId) return;
    setSavingTarget(true);
    try {
      const payload = { campaignId: editingCampaign._id };
      if (role === "recruiter") payload.jobId = selectedTargetId;
      else payload.serviceId = selectedTargetId;

      const res = await fetch(adsEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Update failed");
      alert("Campaign updated successfully.");
      setEditingCampaign(null);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingTarget(false);
    }
  };

  const statusStyle = (status) => {
    if (status === "Active") return "bg-emerald-50 text-emerald-600";
    if (status === "Expired") return "bg-slate-100 text-slate-500";
    if (status === "Completed") return "bg-blue-50 text-blue-600";
    return "bg-amber-50 text-amber-600";
  };

  return (
    <div className="flex min-h-screen bg-[#FDFEFF]">
      <Sidebar activePage={activePage} />

      <main className="flex-1 p-4 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Advertising</h1>
              <p className="text-slate-500 font-medium mt-1">
                Wallet balance: ₹{balance.toLocaleString("en-IN")}
              </p>
            </div>
          </header>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Target size={32} />} label="Total Impressions" value={stats.totalImpressions} />
                <StatCard icon={<TrendingUp size={32} />} label="Total Clicks" value={stats.totalClicks} />
                <StatCard icon={<Users size={32} />} label="Active Campaigns" value={stats.activeCount} />
              </div>

              <section className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 px-2">Available Ad Plans</h2>
                {plans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <div
                        key={plan._id}
                        className={`bg-white p-8 rounded-[32px] border shadow-sm flex flex-col ${
                          plan.isPopular ? "border-indigo-500 border-2" : "border-slate-100"
                        }`}
                      >
                        {plan.isPopular && (
                          <span className="text-[10px] font-black uppercase text-indigo-600 mb-2">
                            Popular
                          </span>
                        )}
                        <h3 className="text-xl font-black text-slate-900">{plan.title}</h3>
                        <p className="text-slate-500 text-sm mt-2 flex-1">{plan.description}</p>
                        <p className="text-3xl font-black text-indigo-600 mt-4">
                          ₹{plan.price}
                          <span className="text-sm text-slate-400 font-bold">
                            / {plan.duration} {plan.durationType}
                          </span>
                        </p>
                        <ul className="mt-4 space-y-2 text-sm font-bold text-slate-600">
                          {plan.estimatedImpressions > 0 && (
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-emerald-500" />
                              ~{plan.estimatedImpressions.toLocaleString()} impressions
                            </li>
                          )}
                          {plan.estimatedClicks > 0 && (
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-emerald-500" />~
                              {plan.estimatedClicks.toLocaleString()} clicks
                            </li>
                          )}
                          {plan.features?.map((f, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-emerald-500" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          disabled={buyingId === plan._id}
                          onClick={() => {
                            setSelectedPlan(plan);
                            setCampaignName(plan.title);
                          }}
                          className="mt-6 w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm disabled:opacity-50"
                        >
                          {buyingId === plan._id ? (
                            <Loader2 className="animate-spin mx-auto" size={18} />
                          ) : (
                            "Purchase Plan"
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                    <Megaphone className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="font-bold text-slate-500">No advertisement plans available yet.</p>
                    <p className="text-sm text-slate-400 mt-2">Please check back later or contact admin.</p>
                  </div>
                )}
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 px-2">My Campaigns</h2>
                {campaigns.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {campaigns.map((camp) => (
                      <div
                        key={camp._id}
                        className="bg-white p-8 rounded-[40px] border border-slate-100 flex flex-col lg:flex-row items-center gap-6"
                      >
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                          <Megaphone size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h4 className="text-xl font-black text-slate-900">{camp.name}</h4>
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusStyle(
                                camp.displayStatus || camp.status
                              )}`}
                            >
                              {camp.displayStatus || camp.status}
                            </span>
                          </div>
                          <p className="text-slate-500 text-sm font-bold">
                            Plan: {camp.planId?.title || "Custom"} • Paid: ₹
                            {(camp.amountPaid || camp.budget || 0).toLocaleString("en-IN")}
                          </p>
                          <p className="text-slate-500 text-xs font-bold mt-1">
                            Promoting: {getTargetLabel(camp) || "Not selected yet"}
                          </p>
                          {camp.expiresAt && (
                            <p className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-1">
                              <Clock size={12} />
                              {camp.displayStatus === "Expired" ? "Ended" : "Ends"}:{" "}
                              {new Date(camp.expiresAt).toLocaleDateString("en-IN")}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCampaign(camp);
                              setSelectedTargetId(
                                camp.jobId?._id || camp.serviceId?._id || targets[0]?.id || ""
                              );
                            }}
                            className="mt-3 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-black"
                          >
                            {getTargetLabel(camp)
                              ? `Change ${role === "recruiter" ? "Job" : "Service"}`
                              : `Add ${role === "recruiter" ? "Job" : "Service"}`}
                          </button>
                        </div>
                        <div className="flex gap-8 text-center">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Impressions</p>
                            <p className="text-xl font-black">{camp.impressions || 0}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Clicks</p>
                            <p className="text-xl font-black">{camp.clicks || 0}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center text-slate-400 font-bold border-4 border-dashed border-slate-100 rounded-[40px]">
                    No campaigns yet. Purchase a plan above to get started.
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      {selectedPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black mb-2">Confirm Purchase</h3>
            <p className="text-slate-500 text-sm mb-6">
              {selectedPlan.title} —{" "}
              {appliedCoupon ? (
                <>
                  <span className="line-through text-slate-400">₹{selectedPlan.price}</span>{" "}
                  <span className="text-emerald-600 font-bold">₹{calculateDiscountedPrice(selectedPlan.price)}</span>
                </>
              ) : (
                `₹${selectedPlan.price}`
              )}{" "}
              for {selectedPlan.duration} {selectedPlan.durationType}
            </p>
            <label className="text-xs font-black uppercase text-slate-400 block mb-2">
              Apply Coupon
            </label>
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="ENTER COUPON CODE"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full pl-5 pr-20 py-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-indigo-500 uppercase placeholder:text-slate-300 text-sm"
              />
              <button 
                type="button"
                onClick={handleApplyCoupon} 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all"
              >
                {couponLoading ? "..." : "APPLY"}
              </button>
            </div>
            {appliedCoupon && (
              <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider border border-emerald-100 mb-6 text-center">
                🎉 Coupon Applied! {appliedCoupon.discountValue}{appliedCoupon.discountType === "Percentage" ? "%" : "₹"} Off
              </div>
            )}
            <label className="text-xs font-black uppercase text-slate-400 block mb-2">
              Campaign name (optional)
            </label>
            <input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border mb-6 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Campaign name"
            />
            <label className="text-xs font-black uppercase text-slate-400 block mb-2">
              {role === "recruiter" ? "Select job to promote" : "Select service to promote"}
            </label>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border mb-6 font-bold outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">{role === "recruiter" ? "Choose job" : "Choose service"}</option>
              {targets.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="flex-1 py-4 rounded-2xl font-bold bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={buyingId === selectedPlan._id}
                onClick={() => handleBuyPlan(selectedPlan)}
                className="flex-1 py-4 rounded-2xl font-black bg-indigo-600 text-white flex items-center justify-center gap-2"
              >
                {buyingId === selectedPlan._id ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <IndianRupee size={16} /> Pay from Wallet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCampaign && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black mb-2">
              Add {role === "recruiter" ? "Job" : "Service"} to Campaign
            </h3>
            <p className="text-slate-500 text-sm mb-6">{editingCampaign.name}</p>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border mb-6 font-bold outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">{role === "recruiter" ? "Choose job" : "Choose service"}</option>
              {targets.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditingCampaign(null)}
                className="flex-1 py-4 rounded-2xl font-bold bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTarget}
                disabled={savingTarget || !selectedTargetId}
                className="flex-1 py-4 rounded-2xl font-black bg-indigo-600 text-white disabled:opacity-60"
              >
                {savingTarget ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}
