import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import Plan from "@/models/Plan";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    // 1. Fetch Candidate profile
    let candidate = await Candidate.findOne({ email: session.user.email }).populate("subscription.planId");

    // 2. Fetch all Candidate plans
    const plans = await Plan.find({ userType: "Candidate", isActive: true }).sort({ price: 1 });

    if (!candidate) {
      candidate = await Candidate.create({
        userId: session.user.id,
        email: session.user.email,
        fullName: session.user.name || "",
        freeUsesCount: 0,
      });
    }

    const sub = candidate.subscription;
    const plan = sub?.planId;

    if (!plan || sub.status !== "Active") {
      return NextResponse.json({ success: true, active: false, subscription: null, plans, freeUsesCount: candidate.freeUsesCount || 0, freeUses: candidate.freeUses || {} });
    }

    // Check expiry
    if (sub.expiryDate && new Date() > new Date(sub.expiryDate)) {
      return NextResponse.json({ success: true, active: false, reason: "expired", subscription: null, plans, freeUsesCount: candidate.freeUsesCount || 0, freeUses: candidate.freeUses || {} });
    }

    // Check use limit
    if (plan.limits?.useLimit > 0 && (sub.subUsesUsed || 0) >= plan.limits.useLimit) {
      return NextResponse.json({ success: true, active: false, reason: "limit_reached", subscription: null, plans, freeUsesCount: candidate.freeUsesCount || 0, freeUses: candidate.freeUses || {} });
    }

    return NextResponse.json({
      success: true,
      active: true,
      subscription: {
        status: sub.status,
        expiryDate: sub.expiryDate,
        subUsesUsed: sub.subUsesUsed || 0,
        useLimit: plan.limits?.useLimit || 0,
        plan: {
          title: plan.title,
          planCategory: plan.planCategory,
          price: plan.price,
          features: plan.features || []
        }
      },
      plans,
      freeUsesCount: candidate.freeUsesCount || 0,
      freeUses: candidate.freeUses || {}
    });

  } catch (error) {
    console.error("Subscription check error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
