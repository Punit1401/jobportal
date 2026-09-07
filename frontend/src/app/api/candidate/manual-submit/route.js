import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import AggregatedJob from "@/models/AggregatedJob";
import GovtResource from "@/models/GovtResource";
import Exam from "@/models/Exam";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type } = body;

    if (!type) return NextResponse.json({ success: false, error: "Type is required" }, { status: 400 });

    await connectMongo();

    if (type === "job") {
      const { title, company, location, employmentType, applyUrl, description, industry, experience } = body;
      if (!title || !applyUrl) return NextResponse.json({ success: false, error: "Title and apply URL are required." }, { status: 400 });

      const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80) + "-" + Date.now();
      await AggregatedJob.create({
        title: title.trim(),
        slug,
        company: (company || "").trim(),
        location: (location || "").trim(),
        employmentType: employmentType || "Full-time",
        industry: (industry || "").trim() || undefined,
        experience: (experience || "").trim() || undefined,
        summary: (description || "").trim() || undefined,
        applyContact: { applyUrl: applyUrl.trim() },
        sourceLabel: "Manual Submission",
        sourceType: "Job Portal",
        status: "pending",
        ingestSource: "manual",
        postedDate: new Date(),
        tags: ["manual-submission"],
      });

      return NextResponse.json({ success: true, message: "Job submitted for review. It will appear once approved by admin." });
    }

    if (type === "exam") {
      const { name, conductingAuthority, applyLink, state, category, applicationEnd, examDate, vacancyCount } = body;
      if (!name || !applyLink) return NextResponse.json({ success: false, error: "Exam name and apply link are required." }, { status: 400 });

      const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80) + "-" + Date.now();
      await Exam.create({
        name: name.trim(),
        slug,
        conductingAuthority: (conductingAuthority || "Government Recruitment").trim(),
        applyLink: applyLink.trim(),
        officialWebsite: applyLink.trim(),
        state: (state || "All India").trim(),
        category: category || "Job Notification",
        keyDates: {
          applicationEnd: applicationEnd ? new Date(applicationEnd) : undefined,
          examDate: examDate ? new Date(examDate) : undefined,
        },
        vacancyCount: vacancyCount ? parseInt(vacancyCount) : undefined,
        status: "pending",
        ingestSource: "manual",
        source: "Other",
        tags: ["manual-submission"],
      });

      return NextResponse.json({ success: true, message: "Exam submitted for review. It will appear once approved by admin." });
    }

    if (type === "scheme" || type === "govt-job") {
      const { title, applyLink, description, eligibility, sector, state } = body;
      if (!title || !applyLink) return NextResponse.json({ success: false, error: "Title and official link are required." }, { status: 400 });

      const categoryMap = { scheme: "Scheme", "govt-job": "Govt Job" };
      await GovtResource.create({
        title: title.trim(),
        description: (description || "").trim() || undefined,
        applyLink: applyLink.trim(),
        eligibility: (eligibility || "Not specified").trim(),
        sector: (sector || "").trim() || undefined,
        state: (state || "All India").trim(),
        category: categoryMap[type] || "Scheme",
        status: "pending",
        source: "community",
        submittedBy: session.user.id,
        relatedSectors: ["manual-submission"],
      });

      return NextResponse.json({ success: true, message: "Submitted for review. It will appear once approved by admin." });
    }

    if (type === "apprenticeship" || type === "training" || type === "internship") {
      const { title, applyLink, description, eligibility, sector, state, organization, duration, stipend, mode } = body;
      if (!title || !applyLink) return NextResponse.json({ success: false, error: "Title and official link are required." }, { status: 400 });

      const catName = type === "internship" ? "Internship" : type === "apprenticeship" ? "Apprenticeship" : "Training";
      const progType = type === "apprenticeship" ? "Apprenticeship" : type === "training" ? "Industrial Training" : "Internship";
      const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80) + "-" + Date.now();

      await Promise.all([
        GovtResource.create({
          title: title.trim(),
          description: (description || "").trim() || undefined,
          applyLink: applyLink.trim(),
          eligibility: (eligibility || "Not specified").trim(),
          sector: (sector || "Skill Development").trim(),
          state: (state || "All India").trim(),
          category: catName,
          status: "pending",
          source: "community",
          submittedBy: session.user.id,
          relatedSectors: ["manual-submission"],
        }),
        Program.create({
          title: title.trim(),
          slug,
          organization: (organization || "Government / PSU").trim(),
          programType: progType,
          sector: (sector || "Skill Development").trim(),
          mode: mode || "Offline",
          duration: (duration || "").trim() || undefined,
          stipend: (stipend || "").trim() || undefined,
          qualification: (eligibility || "Not specified").trim(),
          applyLink: applyLink.trim(),
          status: "pending",
          source: "community",
          ingestSource: "manual",
        }),
      ]);

      return NextResponse.json({ success: true, message: "Submitted for review. It will appear once approved by admin." });
    }

    return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Manual Submit Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
