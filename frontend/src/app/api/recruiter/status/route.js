import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";
import Application from "@/models/Application";
import Recruiter from "@/models/Recruiter";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiter = await Recruiter.findOne({ userId: session.user.id });
    
    // Stats calculation
    const activeJobsCount = await Job.countDocuments({ recruiterId: session.user.id, status: "active" });
    const totalApplicantsCount = await Application.countDocuments({ recruiterId: session.user.id });
    const shortlistedCount = await Application.countDocuments({ recruiterId: session.user.id, status: "shortlisted" });
    const interviewsCount = await Application.countDocuments({ recruiterId: session.user.id, status: "interview" });

    const recentActivity = await Application.find({ recruiterId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("jobId", "title");

    return NextResponse.json({ 
      ok: true, 
      stats: {
        activeJobs: activeJobsCount,
        totalApplicants: totalApplicantsCount,
        shortlisted: shortlistedCount,
        interviews: interviewsCount
      },
      recruiter,
      recentActivity
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
