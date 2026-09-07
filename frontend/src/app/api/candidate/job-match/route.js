import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import AggregatedJob from "@/models/AggregatedJob";
import { rankJobs } from "@/lib/jobMatch";

// GET ranked aggregated jobs scored against the user's preferences + skills.
// ?onlyEligible=1 returns only jobs at/above the user's minMatchScore.
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectMongo();
    const candidate = await Candidate.findOne({ userId: session.user.id }).lean();
    const prefs = candidate?.autoApplyPreferences || {};
    const profile = { skills: candidate?.skills || "" };

    const jobs = await AggregatedJob.find({ status: "live" }).limit(300).lean();
    let ranked = rankJobs(jobs, prefs, profile);

    const { searchParams } = new URL(req.url);
    if (searchParams.get("onlyEligible") === "1") {
      const min = prefs.minMatchScore ?? 40;
      ranked = ranked.filter((r) => r.score >= min);
    }

    // Mark which jobs the user already applied to.
    const appliedIds = new Set((candidate?.jobApplications || []).map((a) => a.jobId?.toString()));

    return NextResponse.json({
      success: true,
      preferencesSet: !!(prefs.industries?.length || prefs.keywords?.length || prefs.locations?.length),
      jobs: ranked.slice(0, 100).map((r) => ({
        ...r.job,
        matchScore: r.score,
        matchReasons: r.reasons,
        matchTips: r.tips,
        applied: appliedIds.has(r.job._id.toString()),
      })),
    });
  } catch (e) {
    console.error("Job Match Error:", e);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
