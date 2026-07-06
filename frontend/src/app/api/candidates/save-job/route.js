import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import Job from "@/models/Job";

// Toggle Save/Unsave Job
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
    }

    await connectMongo();
    const candidate = await Candidate.findOne({ userId: session.user.id });

    if (!candidate) {
      return NextResponse.json({ success: false, error: "Candidate profile not found" }, { status: 404 });
    }

    // Toggle logic: If job is already saved, remove it. If not, add it.
    const isSaved = candidate.savedJobs.includes(jobId);

    if (isSaved) {
      // Remove
      candidate.savedJobs = candidate.savedJobs.filter((id) => id.toString() !== jobId);
    } else {
      // Add
      candidate.savedJobs.push(jobId);
    }

    await candidate.save();

    return NextResponse.json({ 
      success: true, 
      message: isSaved ? "Job removed from saved list" : "Job saved successfully",
      saved: !isSaved,
      savedJobs: candidate.savedJobs
    });
  } catch (error) {
    console.error("Save Job Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// Fetch all saved jobs for the user
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    // Populate the savedJobs array with actual Job documents
    const candidate = await Candidate.findOne({ userId: session.user.id })
      .populate({
        path: "savedJobs",
        model: "Job",
        select: "title company location type salary maxSalary minSalary experience requiredSkills postedDate status logo"
      })
      .lean();

    if (!candidate) {
      return NextResponse.json({ success: false, error: "Candidate profile not found" }, { status: 404 });
    }

    // Filter out any null jobs (in case a job was deleted from DB but still in array)
    const validSavedJobs = (candidate.savedJobs || []).filter(job => job !== null);

    return NextResponse.json({ success: true, savedJobs: validSavedJobs });
  } catch (error) {
    console.error("Get Saved Jobs Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
