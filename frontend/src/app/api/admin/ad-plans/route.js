import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import AdPlan from "@/models/AdPlan";
import AdCampaign from "@/models/AdCampaign";
import { enrichCampaign } from "@/lib/adCampaign";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    const [plans, purchases] = await Promise.all([
      AdPlan.find({}).sort({ displayOrder: 1, price: 1 }),
      AdCampaign.find({})
        .populate("planId")
        .sort({ createdAt: -1 })
        .limit(200),
    ]);

    const enrichedPurchases = purchases.map((p) => enrichCampaign(p));

    const stats = {
      totalPlans: plans.length,
      activePlans: plans.filter((p) => p.isActive).length,
      totalPurchases: enrichedPurchases.length,
      activeCampaigns: enrichedPurchases.filter((p) => p.displayStatus === "Active").length,
      expiredCampaigns: enrichedPurchases.filter((p) => p.displayStatus === "Expired").length,
      revenue: enrichedPurchases.reduce((sum, p) => sum + (p.amountPaid || p.budget || 0), 0),
    };

    return NextResponse.json({
      success: true,
      plans,
      purchases: enrichedPurchases,
      stats,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const body = await req.json();

    if (!body.title || body.price === undefined || body.price === null || !body.userType) {
      return NextResponse.json({ error: "Title, price and user type are required" }, { status: 400 });
    }

    const plan = await AdPlan.create({
      title: body.title,
      description: body.description || "",
      price: Number(body.price),
      duration: Number(body.duration) || 7,
      durationType: body.durationType || "Days",
      userType: body.userType,
      features: body.features || [],
      estimatedImpressions: Number(body.estimatedImpressions) || 0,
      estimatedClicks: Number(body.estimatedClicks) || 0,
      isActive: body.isActive !== false,
      isPopular: Boolean(body.isPopular),
      displayOrder: Number(body.displayOrder) || 0,
    });

    return NextResponse.json({ success: true, plan }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
    }

    const plan = await AdPlan.findByIdAndUpdate(id, updateData, { new: true });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
    }

    await connectMongo();
    await AdPlan.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Plan deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
