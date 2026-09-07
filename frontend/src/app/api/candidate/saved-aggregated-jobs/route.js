import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import AggregatedJob from "@/models/AggregatedJob";

// Toggle save / unsave an aggregated job.
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { jobId } = await req.json();
    if (!jobId) return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });

    await connectMongo();
    let candidate = await Candidate.findOne({ userId: session.user.id });
    if (!candidate) {
      candidate = await Candidate.create({
        userId: session.user.id,
        email: session.user.email,
        fullName: session.user.name,
      });
    }

    if (!candidate.savedAggregatedJobs) candidate.savedAggregatedJobs = [];
    const isSaved = candidate.savedAggregatedJobs.some((id) => id.toString() === jobId);

    if (isSaved) {
      candidate.savedAggregatedJobs = candidate.savedAggregatedJobs.filter((id) => id.toString() !== jobId);
    } else {
      candidate.savedAggregatedJobs.push(jobId);
    }
    await candidate.save();

    return NextResponse.json({
      success: true,
      saved: !isSaved,
      message: isSaved ? "Removed from saved jobs" : "Job saved",
    });
  } catch (error) {
    console.error("Save Aggregated Job Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// List the user's saved aggregated jobs (full docs).
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectMongo();
    const candidate = await Candidate.findOne({ userId: session.user.id })
      .populate({ path: "savedAggregatedJobs", model: "AggregatedJob" })
      .lean();
    if (!candidate) return NextResponse.json({ success: true, savedJobs: [] });

    const savedJobs = (candidate.savedAggregatedJobs || []).filter(Boolean);
    return NextResponse.json({ success: true, savedJobs });
  } catch (error) {
    console.error("Get Saved Aggregated Jobs Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
