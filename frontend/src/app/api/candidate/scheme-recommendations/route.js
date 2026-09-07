import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import GovtResource from "@/models/GovtResource";
import { rankSchemes } from "@/lib/schemeMatch";

function ageFromDob(dob) {
  if (!dob) return undefined;
  const d = new Date(dob);
  if (isNaN(d)) return undefined;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

// GET personalized scheme recommendations based on the user's profile.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectMongo();
    const candidate = await Candidate.findOne({ userId: session.user.id }).lean();

    // Build a matching profile from the candidate (gracefully handles missing fields).
    const latestWork = candidate?.workExperiences?.[0] || {};
    const profile = {
      age: ageFromDob(candidate?.dob),
      gender: candidate?.gender,
      state: candidate?.state,
      employmentStatus: candidate?.presentEmploymentStatus || latestWork.presentEmploymentStatus || "",
      isStudent: /student|fresher/i.test(candidate?.presentEmploymentStatus || ""),
    };

    const schemes = await GovtResource.find({ status: "live", category: "Scheme" }).lean();
    const ranked = rankSchemes(schemes, profile).slice(0, 12);

    return NextResponse.json({
      success: true,
      profileUsed: profile,
      recommendations: ranked.map((r) => ({ ...r.scheme, matchScore: r.score, matchReasons: r.reasons, eligible: r.eligible })),
    });
  } catch (error) {
    console.error("Scheme Recommendations Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
