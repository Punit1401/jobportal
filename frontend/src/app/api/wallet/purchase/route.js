import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Plan from "@/models/Plan";
import Recruiter from "@/models/Recruiter";
import ServiceProvider from "@/models/serviceprovider";
import AdCampaign from "@/models/AdCampaign";
import AdPlan from "@/models/AdPlan";
import StoragePlan from "@/models/StoragePlan";
import Candidate from "@/models/Candidate";
import Coupon from "@/models/Coupon";
import { debitWallet, getOrCreateWallet } from "@/lib/wallet";
import { WALLET_ROLES } from "@/lib/walletCatalog";
import { assertPartnerCanUseFeatures } from "@/lib/checkSubscription";
import { getPartnerAccess, isAdminApproved } from "@/lib/partnerAccess";

function planStorageMb(plan) {
  if (!plan?.storage?.value) return 100;
  return plan.storage.unit === "GB" ? plan.storage.value * 1024 : plan.storage.value;
}

async function getProfile(email, role, session) {
  if (role === "recruiter") return Recruiter.findOne({ email });
  if (role === "serviceprovider") return ServiceProvider.findOne({ email });
  if (role === "candidate" || role === "user") {
    let candidate = await Candidate.findOne({ email });
    if (!candidate) {
      candidate = await Candidate.create({
        userId: session.user.id,
        email: email,
        fullName: session.user.name || ""
      });
    }
    return candidate;
  }
  return null;
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!WALLET_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { type } = body;
    await connectMongo();

    const profile = await getProfile(session.user.email, session.user.role, session);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (type === "subscription") {
      if (!isAdminApproved(profile, session.user.role)) {
        return NextResponse.json(
          { error: "You can purchase a subscription only after admin verification." },
          { status: 403 }
        );
      }

      const plan = await Plan.findById(body.planId);
      if (!plan || !plan.isActive) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      const expectedType = 
        session.user.role === "recruiter" 
          ? "Recruiter" 
          : (session.user.role === "serviceprovider" ? "ServiceProvider" : "Candidate");
          
      if (plan.userType !== expectedType) {
        return NextResponse.json({ error: "Plan not valid for your account" }, { status: 400 });
      }

      let discountAmount = 0;
      if (body.couponCode) {
        const coupon = await Coupon.findOne({ code: body.couponCode.toUpperCase().trim(), isActive: true });
        if (coupon && (coupon.expiryDate ? new Date(coupon.expiryDate) > new Date() : true)) {
          if (coupon.discountType === "Percentage") {
            discountAmount = (plan.price * coupon.discountValue) / 100;
          } else {
            discountAmount = coupon.discountValue;
          }
        }
      }

      const amount = Math.max(0, plan.price - discountAmount);
      let walletBalance = 0;
      let transaction = null;

      if (amount > 0) {
        const result = await debitWallet({
          userId: session.user.id,
          amount,
          purpose: `Subscription: ${plan.title}${body.couponCode ? ` (Coupon: ${body.couponCode.toUpperCase()})` : ""}`,
          metadata: { type: "subscription", planId: plan._id.toString(), couponCode: body.couponCode || null },
        });
        walletBalance = result.wallet.balance;
        transaction = result.transaction;
      } else {
        const wallet = await getOrCreateWallet(session.user.id);
        walletBalance = wallet.balance;
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + plan.duration);

      if (session.user.role === "recruiter") {
        const storageLimit = Math.max(
          profile.subscription?.storageLimit || 100,
          planStorageMb(plan)
        );
        await Recruiter.findOneAndUpdate(
          { email: session.user.email },
          {
            isPaid: true,
            paidAt: new Date(),
            paymentAmount: amount,
            subscription: {
              planId: plan._id,
              status: "Active",
              expiryDate,
              usedJobs: 0,
              usedLeads: 0,
              storageUsed: profile.subscription?.storageUsed || 0,
              storageLimit,
            },
          }
        );
      } else if (session.user.role === "serviceprovider") {
        const storageLimit = Math.max(
          profile.subscription?.storageLimit || 100,
          planStorageMb(plan)
        );
        await ServiceProvider.findOneAndUpdate(
          { email: session.user.email },
          {
            isPaid: true,
            paidAt: new Date(),
            paymentAmount: amount,
            subscription: {
              planId: plan._id,
              status: "Active",
              expiryDate,
              usedJobs: 0,
              usedLeads: 0,
              storageUsed: profile.subscription?.storageUsed || 0,
              storageLimit,
            },
          }
        );
      } else if (session.user.role === "candidate" || session.user.role === "user") {
        await Candidate.findOneAndUpdate(
          { email: session.user.email },
          {
            isPaid: true,
            paidAt: new Date(),
            paymentAmount: amount,
            subscription: {
              planId: plan._id,
              status: "Active",
              expiryDate,
              subUsesUsed: 0
            },
          }
        );
      }

      return NextResponse.json({
        success: true,
        balance: walletBalance,
        transaction,
        message: "Subscription activated",
      });
    }

    const access = getPartnerAccess(profile, session.user.role);
    if ((type === "storage" || type === "advertising") && !access.canUseSystem) {
      return NextResponse.json(
        { error: "Please purchase an active subscription plan first." },
        { status: 403 }
      );
    }

    if (type === "storage") {
      const plan = await StoragePlan.findById(body.planId);
      if (!plan || !plan.isActive) {
        return NextResponse.json({ error: "Invalid or inactive storage plan" }, { status: 400 });
      }

      const { wallet, transaction } = await debitWallet({
        userId: session.user.id,
        amount: plan.price,
        purpose: plan.title,
        metadata: { type: "storage", planId: plan._id.toString(), mb: plan.addedSpaceMB },
      });

      const Model = session.user.role === "recruiter" ? Recruiter : ServiceProvider;
      const updated = await Model.findOneAndUpdate(
        { email: session.user.email },
        { $inc: { purchasedStorageMB: plan.addedSpaceMB } },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        balance: wallet.balance,
        transaction,
        storageLimit: updated.purchasedStorageMB, // This doesn't represent total, just purchased
        message: `${plan.title} added`,
      });
    }

    if (type === "advertising") {
      await assertPartnerCanUseFeatures(session.user.email, session.user.role);

      const adPlan = await AdPlan.findById(body.planId);
      if (!adPlan || !adPlan.isActive) {
        return NextResponse.json({ error: "Advertisement plan not found" }, { status: 404 });
      }

      const expectedAdType =
        session.user.role === "recruiter" ? "Recruiter" : "ServiceProvider";
      if (adPlan.userType !== expectedAdType) {
        return NextResponse.json({ error: "This ad plan is not for your account type" }, { status: 400 });
      }
      if (session.user.role === "recruiter" && !body.jobId) {
        return NextResponse.json({ error: "Please select a job to promote." }, { status: 400 });
      }
      if (session.user.role === "serviceprovider" && !body.serviceId) {
        return NextResponse.json({ error: "Please select a service to promote." }, { status: 400 });
      }

      let discountAmount = 0;
      if (body.couponCode) {
        const coupon = await Coupon.findOne({ code: body.couponCode.toUpperCase().trim(), isActive: true });
        if (coupon && (coupon.expiryDate ? new Date(coupon.expiryDate) > new Date() : true)) {
          if (coupon.discountType === "Percentage") {
            discountAmount = (adPlan.price * coupon.discountValue) / 100;
          } else {
            discountAmount = coupon.discountValue;
          }
        }
      }

      const amount = Math.max(0, adPlan.price - discountAmount);
      const campaignName = body.campaignName?.trim() || adPlan.title;
      let walletBalance = 0;
      let transaction = null;

      if (amount > 0) {
        const result = await debitWallet({
          userId: session.user.id,
          amount,
          purpose: `Ad Plan: ${adPlan.title}${body.couponCode ? ` (Coupon: ${body.couponCode.toUpperCase()})` : ""}`,
          metadata: {
            type: "advertising",
            planId: adPlan._id.toString(),
            campaignName,
            jobId: body.jobId || null,
            serviceId: body.serviceId || null,
            couponCode: body.couponCode || null,
          },
        });
        walletBalance = result.wallet.balance;
        transaction = result.transaction;
      } else {
        const wallet = await getOrCreateWallet(session.user.id);
        walletBalance = wallet.balance;
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (adPlan.duration || 7));

      const campaign = await AdCampaign.create({
        userId: session.user.id,
        recruiterId: session.user.id,
        userRole: session.user.role,
        userEmail: session.user.email,
        userName: session.user.name || "",
        planId: adPlan._id,
        name: campaignName,
        budget: amount,
        amountPaid: amount,
        startDate: new Date(),
        expiresAt,
        status: "Active",
        impressions: 0,
        clicks: 0,
        reach: adPlan.estimatedImpressions || 0,
        jobId: body.jobId || undefined,
        serviceId: body.serviceId || undefined,
      });

      await AdPlan.findByIdAndUpdate(adPlan._id, { $inc: { purchaseCount: 1 } });

      return NextResponse.json({
        success: true,
        balance: walletBalance,
        transaction,
        campaign,
        message: `Advertisement plan "${adPlan.title}" purchased successfully`,
      });
    }

    return NextResponse.json({ error: "Invalid purchase type" }, { status: 400 });
  } catch (error) {
    if (error.code === "INSUFFICIENT_BALANCE") {
      return NextResponse.json(
        { success: false, error: "Insufficient wallet balance. Please add money first." },
        { status: 402 }
      );
    }
    console.error("Wallet purchase:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
