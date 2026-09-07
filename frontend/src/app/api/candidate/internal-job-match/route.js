import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import Job from "@/models/Job";
import Application from "@/models/Application";
import { fetchWithFallback } from "@/lib/ai-fallback";

// Build a compact resume/credentials summary from the candidate profile.
function profileSummary(c = {}) {
  const work = (c.workExperiences || [])
    .slice(0, 3)
    .map((w) => `${w.designation || ""} at ${w.currentCompanyName || ""} (${w.jobIndustry || ""})`)
    .filter((s) => s.replace(/[^a-z]/gi, ""))
    .join("; ");
  return [
    c.fullName ? `Name: ${c.fullName}` : "",
    c.profession ? `Profession: ${c.profession}` : "",
    c.designation ? `Designation: ${c.designation}` : "",
    c.skills ? `Skills: ${Array.isArray(c.skills) ? c.skills.join(", ") : c.skills}` : "",
    c.graduationSpecialization ? `Degree: ${c.graduationSpecialization} (${c.graduationPercentage || ""}%)` : "",
    c.presentEmploymentStatus ? `Status: ${c.presentEmploymentStatus}` : "",
    work ? `Experience: ${work}` : "",
  ].filter(Boolean).join("\n");
}

// GET — AI analyzes the user's resume/credentials against all live website jobs,
// returning a match score, fit note, and apply recommendation for each.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectMongo();
    const candidate = await Candidate.findOne({ userId: session.user.id }).lean();
    const summary = profileSummary(candidate || {});

    const jobs = await Job.find({ $or: [{ published: true }, { status: "active" }] })
      .sort({ createdAt: -1 }).limit(40).lean();

    if (jobs.length === 0) return NextResponse.json({ success: true, jobs: [], profileSummary: summary });

    // Already-applied job ids for this user.
    const apps = await Application.find({ userId: session.user.id }).select("jobId").lean();
    const appliedIds = new Set(apps.map((a) => String(a.jobId)));

    // Compact job list for the AI.
    const jobList = jobs.map((j) => ({
      id: String(j._id),
      title: j.title,
      role: `${j.designation || j.profession || ""}`.trim(),
      experience: j.experienceLevel,
      skills: j.skills,
      requirements: (j.requirements || j.description || "").slice(0, 300),
    }));

    let analysis = [];
    try {
      const raw = await fetchWithFallback([
        { role: "system", content:
          "You are an ATS that matches a candidate's resume to job postings. Output ONLY minified JSON array — no markdown." },
        { role: "user", content:
          `CANDIDATE RESUME / CREDENTIALS:\n${summary || "(profile is sparse)"}\n\n` +
          `JOBS (JSON):\n${JSON.stringify(jobList)}\n\n` +
          `For EACH job return an object: {"id": job id, "score": 0-100 fit score, ` +
          `"fit": "one short sentence on why it fits or not", "recommend": boolean (true if a strong/decent fit worth applying)}. ` +
          `Return a JSON array covering every job id.` },
      ], 0.2);
      let s = raw.trim();
      const f = s.match(/```(?:json)?\s*([\s\S]*?)```/i); if (f) s = f[1].trim();
      s = s.slice(s.indexOf("["), s.lastIndexOf("]") + 1);
      analysis = JSON.parse(s);
    } catch (e) {
      // AI failed → return jobs unscored rather than erroring.
      analysis = [];
    }

    const byId = Object.fromEntries(analysis.map((a) => [String(a.id), a]));
    const merged = jobs.map((j) => {
      const a = byId[String(j._id)] || {};
      return {
        _id: j._id, title: j.title, company: j.company || j.companyName,
        location: j.location, experienceLevel: j.experienceLevel, salaryRange: j.salaryRange,
        designation: j.designation, industry: j.industry, recruiterId: j.recruiterId,
        matchScore: typeof a.score === "number" ? a.score : null,
        fit: a.fit || "",
        recommend: !!a.recommend,
        applied: appliedIds.has(String(j._id)),
      };
    }).sort((x, y) => (y.matchScore ?? -1) - (x.matchScore ?? -1));

    return NextResponse.json({ success: true, jobs: merged, profileSummary: summary });
  } catch (error) {
    console.error("Internal Job Match Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
