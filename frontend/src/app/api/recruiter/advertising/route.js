import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectMongo from "@/lib/mongodb";
import AdCampaign from "@/models/AdCampaign";
import AdPlan from "@/models/AdPlan";
import Job from "@/models/Job";
import ServiceForm from "@/models/serviceform";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { enrichCampaign } from "@/lib/adCampaign";

function buildOwnerQuery(session) {
  const conditions = [{ userEmail: session.user.email }];
  const id = session.user.id;

  if (id && mongoose.Types.ObjectId.isValid(id)) {
    const oid = new mongoose.Types.ObjectId(id);
    conditions.push({ userId: oid }, { recruiterId: oid });
    // Some older records may store string ids
    conditions.push({ userId: id }, { recruiterId: id });
  }

  return { $or: conditions };
}

async function attachTargets(campaigns) {
  const jobIds = [
    ...new Set(
      campaigns
        .map((c) => c.jobId?.toString())
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
    ),
  ];
  const serviceIds = [
    ...new Set(
      campaigns
        .map((c) => c.serviceId?.toString())
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
    ),
  ];
  const planIds = [
    ...new Set(
      campaigns
        .map((c) => c.planId?.toString())
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
    ),
  ];

  const [jobs, services, plans] = await Promise.all([
    jobIds.length ? Job.find({ _id: { $in: jobIds } }).lean() : [],
    serviceIds.length ? ServiceForm.find({ _id: { $in: serviceIds } }).lean() : [],
    planIds.length ? AdPlan.find({ _id: { $in: planIds } }).lean() : [],
  ]);

  const jobMap = Object.fromEntries(jobs.map((j) => [j._id.toString(), j]));
  const serviceMap = Object.fromEntries(services.map((s) => [s._id.toString(), s]));
  const planMap = Object.fromEntries(plans.map((p) => [p._id.toString(), p]));

  return campaigns.map((camp) => ({
    ...camp,
    planId: camp.planId ? planMap[camp.planId.toString()] || camp.planId : null,
    jobId: camp.jobId ? jobMap[camp.jobId.toString()] || null : null,
    serviceId: camp.serviceId ? serviceMap[camp.serviceId.toString()] || null : null,
  }));
}

export async function GET() {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!["recruiter", "serviceprovider"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rawCampaigns = await AdCampaign.find(buildOwnerQuery(session))
      .sort({ createdAt: -1 })
      .lean();

    const campaignsWithRefs = await attachTargets(rawCampaigns);
    const enriched = [];

    for (const camp of campaignsWithRefs) {
      const item = enrichCampaign(camp);
      if (item.displayStatus === "Expired" && camp.status !== "Expired") {
        await AdCampaign.findByIdAndUpdate(camp._id, { status: "Expired" });
        item.status = "Expired";
      }
      enriched.push(item);
    }

    const stats = {
      totalImpressions: enriched.reduce((s, c) => s + (c.impressions || 0), 0),
      totalClicks: enriched.reduce((s, c) => s + (c.clicks || 0), 0),
      activeCount: enriched.filter((c) => c.displayStatus === "Active").length,
    };

    return NextResponse.json({ ok: true, success: true, data: enriched, stats });
  } catch (err) {
    console.error("GET /api/recruiter/advertising:", err);
    return NextResponse.json({ error: err.message || "Failed to load campaigns" }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Purchase an ad plan via /api/wallet/purchase (type: advertising)" },
    { status: 400 }
  );
}

export async function PUT(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!["recruiter", "serviceprovider"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { campaignId, jobId, serviceId } = await req.json();
    if (!campaignId) {
      return NextResponse.json({ error: "Campaign id is required" }, { status: 400 });
    }
    if (session.user.role === "recruiter" && !jobId) {
      return NextResponse.json({ error: "Please select a job" }, { status: 400 });
    }
    if (session.user.role === "serviceprovider" && !serviceId) {
      return NextResponse.json({ error: "Please select a service" }, { status: 400 });
    }

    const campaign = await AdCampaign.findOne({
      _id: campaignId,
      ...buildOwnerQuery(session),
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (session.user.role === "recruiter") {
      campaign.jobId = jobId;
      campaign.serviceId = undefined;
    } else {
      campaign.serviceId = serviceId;
      campaign.jobId = undefined;
    }
    await campaign.save();

    return NextResponse.json({ success: true, message: "Campaign target updated." });
  } catch (err) {
    console.error("PUT /api/recruiter/advertising:", err);
    return NextResponse.json({ error: err.message || "Update failed" }, { status: 500 });
  }
}
