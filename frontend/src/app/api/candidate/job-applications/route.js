import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import AggregatedJob from "@/models/AggregatedJob";

// List tracked job applications (with job details).
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectMongo();
    const candidate = await Candidate.findOne({ userId: session.user.id })
      .populate({ path: "jobApplications.jobId", model: "AggregatedJob" })
      .lean();
    if (!candidate) return NextResponse.json({ success: true, applications: [] });

    const applications = (candidate.jobApplications || [])
      .filter((a) => a.jobId)
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    return NextResponse.json({ success: true, applications });
  } catch (e) {
    console.error("Get Job Applications Error:", e);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// Update a tracked application's status.  POST { jobId, status }
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { jobId, status } = await req.json();
    if (!jobId || !status) return NextResponse.json({ success: false, error: "jobId and status required" }, { status: 400 });

    await connectMongo();
    const candidate = await Candidate.findOne({ userId: session.user.id });
    if (!candidate) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });

    const app = (candidate.jobApplications || []).find((a) => a.jobId?.toString() === jobId);
    if (!app) return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    app.status = status;
    app.updatedAt = new Date();
    await candidate.save();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Update Job Application Error:", e);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// Remove a tracked application.  DELETE ?jobId=
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    if (!jobId) return NextResponse.json({ success: false, error: "jobId required" }, { status: 400 });

    await connectMongo();
    const candidate = await Candidate.findOne({ userId: session.user.id });
    if (!candidate) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    candidate.jobApplications = (candidate.jobApplications || []).filter((a) => a.jobId?.toString() !== jobId);
    await candidate.save();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete Job Application Error:", e);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
