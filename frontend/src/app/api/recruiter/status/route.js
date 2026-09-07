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
    const totalApplicantsCount = await Application.countDocuments({ recruiterId: session.user.id, jobId: { $ne: "manual" } });
    const shortlistedCount = await Application.countDocuments({ recruiterId: session.user.id, status: "shortlisted", jobId: { $ne: "manual" } });
    const interviewsCount = await Application.countDocuments({ recruiterId: session.user.id, status: "interview", jobId: { $ne: "manual" } });

    // Calculate dynamic performance metrics
    let profileCompletion = 75; // Default fallback
    if (recruiter) {
      const profileFields = [
        recruiter.companyName, recruiter.designation, recruiter.location, recruiter.logo,
        recruiter.tagline, recruiter.industry, recruiter.website, recruiter.founded,
        recruiter.description, recruiter.contactPersonName, recruiter.contactPersonNumber,
        recruiter.contactPersonEmail, recruiter.ownerName, recruiter.ownerNumber, recruiter.ownerEmail
      ];
      const filledFields = profileFields.filter(Boolean).length;
      profileCompletion = Math.round((filledFields / profileFields.length) * 100) || 75;
    }

    const hiringEfficiency = totalApplicantsCount > 0 ? Math.round((shortlistedCount / totalApplicantsCount) * 100) : 0;
    const reviewedAppsCount = await Application.countDocuments({ recruiterId: session.user.id, status: { $regex: /^(?!Pending$).*$/i }, jobId: { $ne: "manual" } });
    const responseRate = totalApplicantsCount > 0 ? Math.round((reviewedAppsCount / totalApplicantsCount) * 100) : 100;

    const recentActivityRaw = await Application.find({ recruiterId: session.user.id, jobId: { $ne: "manual" } })
      .sort({ appliedAt: -1 })
      .limit(5)
      .lean();

    const jobIds = [...new Set(recentActivityRaw.map(app => app.jobId).filter(Boolean))];
    const jobs = await Job.find({ _id: { $in: jobIds } }, "title").lean();
    const jobMap = jobs.reduce((acc, job) => {
      acc[job._id.toString()] = job.title;
      return acc;
    }, {});

    const recentActivity = recentActivityRaw.map(app => ({
      ...app,
      jobTitle: jobMap[app.jobId] || "Unknown Position"
    }));

    return NextResponse.json({
      ok: true,
      stats: {
        activeJobs: activeJobsCount,
        totalApplicants: totalApplicantsCount,
        shortlisted: shortlistedCount,
        interviews: interviewsCount,
        profileCompletion,
        hiringEfficiency,
        responseRate
      },
      recruiter,
      recentActivity
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
