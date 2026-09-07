import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import Resume from "@/models/Resume";
import Application from "@/models/Application";

function isPresent(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}

function calculateProfileStrength(candidate) {
  if (!candidate) return 0;

  const sections = [
    { weight: 18, fields: ["fullName", "email", "mobile", "city", "state"] },
    { weight: 12, fields: ["profession", "position", "gender", "dob"] },
    { weight: 20, fields: ["skills"] },
    { weight: 12, fields: ["resume"] },
    { weight: 14, fields: ["workExperiences"] },
    { weight: 14, fields: ["formalEducations", "nonFormalEducations"] },
    { weight: 10, fields: ["github", "portfolio", "address"] },
  ];

  const score = sections.reduce((total, section) => {
    const filled = section.fields.filter((field) => isPresent(candidate[field])).length;
    return total + (filled / section.fields.length) * section.weight;
  }, 0);

  return Math.min(100, Math.round(score));
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    const candidate =
      (await Candidate.findOne({
        $or: [
          { email: session.user.email },
          { userId: session.user.id?.toString() },
        ],
      }).lean()) || null;

    const latestResume =
      (await Resume.findOne({
        $or: [
          { userId: session.user.email },
          { userId: session.user.id?.toString() },
        ],
      }).sort({ createdAt: -1 }).lean()) ||
      (await Resume.findOne().sort({ createdAt: -1 }).lean());

    const applications = await Application.find({
      email: session.user.email,
    }).lean();

    const totalApplications = applications.length;
    const approvedApplications = applications.filter((app) =>
      String(app.status || "").toLowerCase().includes("approved")
    ).length;

    const interviewSuccessRate = totalApplications
      ? Math.round((approvedApplications / totalApplications) * 100)
      : 0;

    const profileStrengthScore = calculateProfileStrength(candidate);
    const resumePerformanceScore = Number(latestResume?.atsScore || 0);

    const profileCompletionFields = [
      candidate?.fullName,
      candidate?.email,
      candidate?.mobile,
      candidate?.city,
      candidate?.state,
      candidate?.profession,
      candidate?.position,
      candidate?.skills?.length,
      candidate?.resume,
    ].filter(Boolean).length;

    return NextResponse.json({
      success: true,
      data: {
        profileStrengthScore,
        resumePerformanceScore,
        interviewSuccessRate,
        profileCompletionFields,
        totalApplications,
        approvedApplications,
        resumeLastAnalyzedAt: latestResume?.createdAt || null,
        comparisonLinks: {
          salary: "/user/upskill/salary-benchmarking",
          skills: "/user/upskill/SkillGapAnalysis",
          trends: "/user/upskill/industry-trends",
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load career insights" },
      { status: 500 }
    );
  }
}
