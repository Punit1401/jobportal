import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import Job from "@/models/Job";
import Application from "@/models/Application";

// POST { jobIds:[...], matchScores?:{id:score} }
// Auto-applies the user to website (recruiter-posted) jobs by creating
// Application records from their profile. Skips jobs already applied to or with
// an incomplete profile. This is a true one-click apply (our own platform).
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { jobIds, matchScores = {} } = await req.json();
    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json({ success: false, error: "No jobs selected" }, { status: 400 });
    }

    await connectMongo();
    const p = await Candidate.findOne({ userId: session.user.id });
    if (!p) {
      return NextResponse.json({ success: false, error: "Complete your profile before auto-applying." }, { status: 400 });
    }
    if (!p.fullName || !p.email) {
      return NextResponse.json({ success: false, error: "Your profile needs at least a name and email before applying." }, { status: 400 });
    }

    const jobs = await Job.find({ _id: { $in: jobIds } }).lean();
    const already = await Application.find({ userId: session.user.id, jobId: { $in: jobIds.map(String) } }).select("jobId").lean();
    const appliedSet = new Set(already.map((a) => String(a.jobId)));

    const results = [];
    for (const job of jobs) {
      const id = String(job._id);
      if (appliedSet.has(id)) { results.push({ jobId: id, status: "skipped", reason: "Already applied" }); continue; }
      await Application.create({
        jobId: id,
        userId: session.user.id,
        recruiterId: job.recruiterId || "",
        name: p.fullName,
        email: (p.email || "").toLowerCase(),
        role: job.designation || job.title || "Not Specified",
        resumeUrl: p.resume,
        mobile: p.mobile, city: p.city, state: p.state, profession: p.profession,
        graduationUniversity: p.graduationUniversity, graduationSpecialization: p.graduationSpecialization,
        graduationPercentage: p.graduationPercentage, classXIIPercentage: p.classXIIPercentage,
        classXPercentage: p.classXPercentage, presentEmploymentStatus: p.presentEmploymentStatus,
        skills: Array.isArray(p.skills) ? p.skills.join(", ") : p.skills,
        github: p.github, portfolio: p.portfolio,
        matchScore: matchScores[id],
        status: "Pending", appliedAt: new Date(),
      });
      results.push({ jobId: id, status: "applied", title: job.title });
      appliedSet.add(id);
    }

    const appliedCount = results.filter((r) => r.status === "applied").length;
    return NextResponse.json({
      success: true,
      appliedCount,
      results,
      message: `Auto-applied to ${appliedCount} website job(s).`,
    });
  } catch (error) {
    console.error("Auto-Apply Internal Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
