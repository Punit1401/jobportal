import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Application from "@/models/Application";
import Candidate from "@/models/Candidate";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const { selectedJobs } = await req.json(); // Array of { jobId, recruiterId, role }

    if (!selectedJobs || !Array.isArray(selectedJobs) || selectedJobs.length === 0) {
      return NextResponse.json({ error: "No jobs selected" }, { status: 400 });
    }

    const userProfile = await Candidate.findOne({ userId: session.user.id });

    if (!userProfile) {
      return NextResponse.json({
        error: "Your profile is incomplete. Please visit the Profile page and fill in the details!"
      }, { status: 400 });
    }

    const results = [];
    for (const job of selectedJobs) {
      // Check if already applied to this job to avoid duplicates
      const existingApp = await Application.findOne({ 
        jobId: job.jobId, 
        userId: session.user.id 
      });

      if (existingApp) {
        results.push({ jobId: job.jobId, status: "skipped", reason: "Already applied" });
        continue;
      }

      const newApp = await Application.create({
        jobId: job.jobId,
        userId: session.user.id,
        recruiterId: job.recruiterId,
        name: userProfile.fullName,
        email: userProfile.email.toLowerCase(),
        role: job.role || "Not Specified",
        resumeUrl: userProfile.resume,
        mobile: userProfile.mobile,
        city: userProfile.city,
        state: userProfile.state,
        profession: userProfile.profession,
        graduationUniversity: userProfile.graduationUniversity,
        graduationSpecialization: userProfile.graduationSpecialization,
        graduationPercentage: userProfile.graduationPercentage,
        classXIIPercentage: userProfile.classXIIPercentage,
        classXPercentage: userProfile.classXPercentage,
        presentEmploymentStatus: userProfile.presentEmploymentStatus,
        currentCompanyName: userProfile.currentCompanyName,
        jobDepartment: userProfile.jobDepartment,
        jobIndustry: userProfile.jobIndustry,
        jobDescription: userProfile.jobDescription,
        jobFromDate: userProfile.jobFromDate,
        jobToDate: userProfile.jobToDate,
        skills: userProfile.skills,
        github: userProfile.github,
        portfolio: userProfile.portfolio,
        status: "Pending",
        appliedAt: new Date()
      });
      results.push({ jobId: job.jobId, status: "success", data: newApp });
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error("Auto-Apply Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
