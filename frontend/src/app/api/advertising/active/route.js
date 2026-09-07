import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import AdCampaign from "@/models/AdCampaign";
import AdPlan from "@/models/AdPlan";
import Job from "@/models/Job";
import ServiceForm from "@/models/serviceform";

export async function GET() {
  try {
    await connectMongo();

    const now = new Date();
    const campaign = await AdCampaign.findOne({
      status: "Active",
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gte: now } }],
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!campaign) {
      return NextResponse.json({ success: true, campaign: null });
    }

    const isRecruiter = campaign.userRole === "recruiter";
    const [plan, job, service] = await Promise.all([
      campaign.planId ? AdPlan.findById(campaign.planId).lean() : null,
      campaign.jobId ? Job.findById(campaign.jobId).lean() : null,
      campaign.serviceId ? ServiceForm.findById(campaign.serviceId).lean() : null,
    ]);
    const target = isRecruiter ? job : service;

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign._id,
        name: campaign.name,
        userRole: campaign.userRole,
        planTitle: plan?.title || "Featured",
        expiresAt: campaign.expiresAt,
        targetTitle: target?.title || campaign.name,
        targetSubtitle: isRecruiter
          ? `${target?.location || "Recruiter"}`
          : `${target?.providerName || "Service Provider"}${target?.category ? ` • ${target.category}` : ""}`,
        ctaHref: isRecruiter
          ? `/careers${job?._id ? `?jobId=${job._id}` : ""}`
          : "/pages/services",
      },
    });
  } catch (error) {
    console.error("GET /api/advertising/active:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
