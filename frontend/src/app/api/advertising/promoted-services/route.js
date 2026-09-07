import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import AdCampaign from "@/models/AdCampaign";
import AdPlan from "@/models/AdPlan";

export const dynamic = "force-dynamic";

function activeProviderCampaignFilter(now) {
  return {
    status: "Active",
    userRole: "serviceprovider",
    serviceId: { $exists: true, $ne: null },
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gte: now } },
    ],
  };
}

export async function GET() {
  try {
    await connectMongo();
    const now = new Date();

    const campaigns = await AdCampaign.find(activeProviderCampaignFilter(now))
      .sort({ createdAt: -1 })
      .lean();

    const planIds = [
      ...new Set(
        campaigns
          .map((c) => c.planId?.toString())
          .filter((id) => id)
      ),
    ];

    const plans = planIds.length
      ? await AdPlan.find({ _id: { $in: planIds } }).lean()
      : [];
    const planMap = Object.fromEntries(plans.map((p) => [p._id.toString(), p]));

    const seen = new Set();
    const services = [];

    for (const camp of campaigns) {
      const serviceId = camp.serviceId?.toString();
      if (!serviceId || seen.has(serviceId)) continue;
      seen.add(serviceId);
      services.push({
        serviceId,
        planTitle: planMap[camp.planId?.toString()]?.title || camp.name || "Featured",
        campaignName: camp.name,
        sortOrder: services.length,
      });
    }

    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error("GET /api/advertising/promoted-services:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
