import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import Job from "@/models/Job";
import CandidateJob from "@/models/CandidateJob";

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
    // Get candidate's saved job IDs
    const candidate = await Candidate.findOne({ userId: session.user.id })
      .select("savedJobs")
      .lean();

    if (!candidate) {
      return NextResponse.json({ success: false, error: "Candidate profile not found" }, { status: 404 });
    }

    const savedJobIds = candidate.savedJobs || [];

    // Query both collections: recruiter jobs and candidate jobs
    const recruiterJobs = await Job.find({ _id: { $in: savedJobIds } }).lean();
    const candidateJobs = await CandidateJob.find({ _id: { $in: savedJobIds } }).lean();

    // Map and normalize recruiter jobs
    const normalizedRecruiterJobs = recruiterJobs.map((job) => ({
      _id: job._id.toString(),
      title: job.title || "",
      company: job.company || job.companyName || "Verified Employer",
      location: job.location || "",
      type: job.type || job.jobType || "Full-time",
      salary: job.salaryRange || job.salary || "",
      maxSalary: job.maxSalary || null,
      minSalary: job.minSalary || null,
      experience: job.experienceLevel || job.experience || "",
      requiredSkills: job.skills || (job.requirements ? [job.requirements] : []),
      postedDate: job.createdAt || job.postedDate || null,
      status: job.status || "active",
      logo: job.logo || ""
    }));

    // Map and normalize candidate jobs
    const normalizedCandidateJobs = candidateJobs.map((job) => ({
      _id: job._id.toString(),
      title: job.title || "",
      company: job.companyDetails?.companyName || "Candidate Posted Job",
      location: job.location || "",
      type: job.jobType || "Full-time",
      salary: job.salaryRange || "",
      maxSalary: null,
      minSalary: null,
      experience: job.experienceLevel || "",
      requiredSkills: job.requirements ? [job.requirements] : [],
      postedDate: job.postedAt || job.createdAt || null,
      status: job.status || "active",
      logo: job.companyDetails?.logo || ""
    }));

    // Combine both lists
    const combinedJobs = [...normalizedRecruiterJobs, ...normalizedCandidateJobs];

    // Maintain the original save order based on savedJobIds array
    const orderedJobs = savedJobIds
      .map(id => combinedJobs.find(job => job._id === id.toString()))
      .filter(job => !!job);

    return NextResponse.json({ success: true, savedJobs: orderedJobs });
  } catch (error) {
    console.error("Get Saved Jobs Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
