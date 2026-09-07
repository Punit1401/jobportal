import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import AdCampaign from "@/models/AdCampaign";
import AdPlan from "@/models/AdPlan";

export const dynamic = "force-dynamic";

function activeRecruiterCampaignFilter(now) {
  return {
    status: "Active",
    userRole: "recruiter",
    jobId: { $exists: true, $ne: null },
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gte: now } },
    ],
  };
}

/** Active recruiter ad campaigns → job IDs for careers page (newest campaign first). */
export async function GET() {
  try {
    await connectMongo();
    const now = new Date();

    const campaigns = await AdCampaign.find(activeRecruiterCampaignFilter(now))
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
    const jobs = [];

    for (const camp of campaigns) {
      const jobId = camp.jobId?.toString();
      if (!jobId || seen.has(jobId)) continue;
      seen.add(jobId);
      jobs.push({
        jobId,
        planTitle: planMap[camp.planId?.toString()]?.title || camp.name || "Featured",
        campaignName: camp.name,
        sortOrder: jobs.length,
      });
    }

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error("GET /api/advertising/promoted-jobs:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
