"use client";

import Link from "next/link";
import {
  UserCircle,
  Clock,
  Ban,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ACCESS_STAGES } from "@/lib/partnerAccess";
import { purchaseFromWallet } from "@/utils/walletClient";
import { useState } from "react";

const COPY = {
  profile_incomplete: {
    icon: UserCircle,
    color: "indigo",
    title: "Complete Your Profile First",
    body: "Fill in your company and KYC details. After admin verifies your profile, you can purchase a subscription and use the platform.",
    cta: "Complete Profile",
  },
  pending_admin: {
    icon: Clock,
    color: "amber",
    title: "Waiting for Admin Verification",
    body: "Your profile has been submitted. Our admin team will review and verify it. You will then be able to choose a subscription plan.",
    cta: "View Profile",
  },
  rejected: {
    icon: Ban,
    color: "red",
    title: "Profile Rejected",
    body: "Your profile was rejected by admin. Please update your details or contact support for help.",
    cta: "View Profile",
  },
  need_subscription: {
    icon: CreditCard,
    color: "indigo",
    title: "Profile Verified — Choose a Subscription Plan",
    body: "Your profile is approved. Purchase a plan using your wallet to unlock job posting, advertising, storage, and other features.",
    cta: "View All Plans",
  },
  subscription_expired: {
    icon: AlertCircle,
    color: "amber",
    title: "Subscription Expired",
    body: "Your plan has expired. Renew your subscription to continue using the platform.",
    cta: "Renew Plan",
  },
};

export default function PartnerOnboarding({ access, role, plans = [], onRefresh }) {
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

  if (!access || access.stage === ACCESS_STAGES.ACTIVE) return null;

  const copy = COPY[access.stage];
  if (!copy) return null;

  const Icon = copy.icon;
  const profileHref = access.profileUrl;
  const subsHref = access.subscriptionsUrl;
  const walletHref = access.walletUrl;

  const ctaHref =
    access.stage === ACCESS_STAGES.PROFILE_INCOMPLETE ||
    access.stage === ACCESS_STAGES.REJECTED ||
    access.stage === ACCESS_STAGES.PENDING_ADMIN
      ? profileHref
      : subsHref;

  const colorMap = {
    indigo: "bg-indigo-600 text-white",
    amber: "bg-amber-50 border-amber-100 text-amber-900",
    red: "bg-red-50 border-red-100 text-red-900",
  };

  const isColoredBanner = copy.color === "indigo";
  const showPlans =
    access.stage === ACCESS_STAGES.NEED_SUBSCRIPTION ||
    access.stage === ACCESS_STAGES.SUBSCRIPTION_EXPIRED;

  const handleBuy = async (plan) => {
    const finalPrice = calculateDiscountedPrice(plan.price);
    if (!confirm(`Purchase "${plan.title}" for ₹${finalPrice} from your wallet?`)) return;
    setBuyingId(plan._id);
    try {
      await purchaseFromWallet({ 
        type: "subscription", 
        planId: plan._id,
        couponCode: appliedCoupon?.code || undefined
      });
      alert("Subscription activated! You can now use the platform.");
      onRefresh?.();
    } catch (e) {
      if (e.message?.includes("Insufficient") && walletHref) {
        if (confirm("Insufficient wallet balance. Go to Wallet to add money via Razorpay?")) {
          window.location.href = walletHref;
        }
      } else {
        alert(e.message);
      }
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="space-y-8 mb-12">
      <div
        className={`rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          isColoredBanner ? colorMap.indigo : `${colorMap[copy.color]} border`
        }`}
      >
        <div className="flex gap-5 items-start">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              isColoredBanner ? "bg-white/20" : "bg-white"
            }`}
          >
            <Icon size={28} className={isColoredBanner ? "text-white" : "text-current"} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">{copy.title}</h2>
            <p
              className={`mt-2 max-w-2xl font-medium text-sm md:text-base ${
                isColoredBanner ? "text-indigo-100" : "opacity-80"
              }`}
            >
              {copy.body}
            </p>
            {access.stage === ACCESS_STAGES.PENDING_ADMIN && (
              <p
                className={`mt-3 text-xs font-bold uppercase tracking-widest ${
                  isColoredBanner ? "text-indigo-200" : "text-amber-700"
                }`}
              >
                Job posting and other features unlock after verification and subscription
              </p>
            )}
          </div>
        </div>
        {copy.cta && (
          <Link
            href={ctaHref}
            className={`shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm ${
              isColoredBanner
                ? "bg-white text-indigo-600 hover:scale-105 transition-transform"
                : "bg-slate-900 text-white"
            }`}
          >
            {copy.cta} <ArrowRight size={18} />
          </Link>
        )}
      </div>

      {showPlans && (
        <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" size={22} />
            Available Subscription Plans
          </h3>
          <p className="text-slate-500 text-sm mb-8">
            Select a plan below. Limits for jobs, leads, and storage depend on your chosen plan.
          </p>

          {/* Coupon Input */}
          <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-6 rounded-[24px] border border-slate-100 mb-8">
            <div className="flex-1 w-full relative">
              <input
                type="text"
                placeholder="ENTER COUPON CODE"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full pl-6 pr-24 py-4 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all uppercase placeholder:text-slate-300 text-sm"
              />
              <button 
                type="button"
                onClick={handleApplyCoupon} 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-[10px] font-black hover:bg-indigo-700 transition-all"
              >
                {couponLoading ? "..." : "APPLY"}
              </button>
            </div>
            {appliedCoupon && (
              <div className="bg-emerald-50 text-emerald-600 px-5 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider border border-emerald-100 shrink-0">
                🎉 {appliedCoupon.code} Applied ({appliedCoupon.discountValue}{appliedCoupon.discountType === "Percentage" ? "%" : "₹"} Off)
              </div>
            )}
          </div>

          {plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className="border border-slate-100 rounded-3xl p-6 flex flex-col hover:border-indigo-200 transition-all"
                >
                  <h4 className="font-black text-lg text-slate-900">{plan.title}</h4>
                  <div className="mt-2 flex flex-col">
                    {appliedCoupon && plan.price > 0 ? (
                      <>
                        <span className="text-xs font-bold text-slate-400 line-through mb-1">₹{plan.price}</span>
                        <span className="text-3xl font-black text-emerald-600">₹{calculateDiscountedPrice(plan.price)}</span>
                      </>
                    ) : (
                      <span className="text-3xl font-black text-indigo-600">₹{plan.price}</span>
                    )}
                    <span className="text-sm text-slate-400 font-bold mt-1">
                      / {plan.duration} {plan.durationType}
                    </span>
                  </div>
                  <ul className="text-xs font-bold text-slate-600 mt-4 space-y-1 flex-1">
                    {plan.limits?.jobLimit > 0 && <li>• {plan.limits.jobLimit} Job posts</li>}
                    {plan.limits?.leadLimit > 0 && <li>• {plan.limits.leadLimit} Leads / services</li>}
                    {plan.storage?.value > 0 && (
                      <li>
                        • {plan.storage.value} {plan.storage.unit} Storage
                      </li>
                    )}
                    {plan.features?.slice(0, 4).map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={buyingId === plan._id}
                    onClick={() => handleBuy(plan)}
                    className="mt-6 w-full py-3 rounded-2xl bg-indigo-600 text-white font-black text-sm disabled:opacity-50"
                  >
                    {buyingId === plan._id ? (
                      <Loader2 className="animate-spin mx-auto" size={18} />
                    ) : (
                      "Buy with Wallet"
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-500 font-bold">No subscription plans are available yet.</p>
              <p className="text-slate-400 text-sm mt-2">Please contact admin or try again later.</p>
            </div>
          )}

          <p className="text-center mt-6 text-sm text-slate-500">
            Low balance?{" "}
            <Link href={walletHref} className="text-indigo-600 font-bold hover:underline">
              Add money to Wallet
            </Link>{" "}
            via Razorpay
          </p>
        </div>
      )}
    </div>
  );
}
