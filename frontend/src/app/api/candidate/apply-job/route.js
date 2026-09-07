import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import AggregatedJob from "@/models/AggregatedJob";

// POST { jobIds:[...], matchScores?:{id:score} }
// Records assisted applications to aggregated/external jobs and returns the
// official apply URLs so the user completes the application themselves
// (no bot submission — ToS-safe). Skips already-applied jobs.
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { jobIds, matchScores = {} } = await req.json();
    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json({ success: false, error: "No jobs selected" }, { status: 400 });
    }

    await connectMongo();
    let candidate = await Candidate.findOne({ userId: session.user.id });
    if (!candidate) {
      candidate = await Candidate.create({
        userId: session.user.id, email: session.user.email, fullName: session.user.name,
      });
    }
    if (!candidate.jobApplications) candidate.jobApplications = [];

    const jobs = await AggregatedJob.find({ _id: { $in: jobIds }, status: "live" }).lean();
    const applied = [];
    const alreadyDone = new Set(candidate.jobApplications.map((a) => a.jobId?.toString()));

    for (const job of jobs) {
      const id = job._id.toString();
      if (alreadyDone.has(id)) continue;
      candidate.jobApplications.push({
        jobId: job._id,
        status: "Applied",
        mode: "assisted",
        matchScore: matchScores[id],
        appliedAt: new Date(),
      });
      applied.push({
        jobId: id,
        title: job.title,
        company: job.company,
        applyUrl: job.applyContact?.applyUrl || job.sourceUrl,
      });
    }
    await candidate.save();

    return NextResponse.json({
      success: true,
      appliedCount: applied.length,
      applied, // includes applyUrl so the client opens each official application
      message: `Tracked ${applied.length} application(s). Complete each on the official site.`,
    });
  } catch (e) {
    console.error("Apply Job Error:", e);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
