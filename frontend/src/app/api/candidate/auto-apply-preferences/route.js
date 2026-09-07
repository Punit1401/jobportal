import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

async function getOrCreate(session) {
  let candidate = await Candidate.findOne({ userId: session.user.id });
  if (!candidate) {
    candidate = await Candidate.create({
      userId: session.user.id, email: session.user.email, fullName: session.user.name,
    });
  }
  return candidate;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectMongo();
    const candidate = await Candidate.findOne({ userId: session.user.id }).lean();
    return NextResponse.json({
      success: true,
      preferences: candidate?.autoApplyPreferences || { industries: [], locations: [], employmentTypes: [], keywords: [], minMatchScore: 40, enabled: false },
      skills: candidate?.skills || "",
    });
  } catch (e) {
    console.error("Get Auto-Apply Prefs Error:", e);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    await connectMongo();
    const candidate = await getOrCreate(session);
    candidate.autoApplyPreferences = {
      industries: body.industries || [],
      locations: body.locations || [],
      employmentTypes: body.employmentTypes || [],
      keywords: body.keywords || [],
      minMatchScore: typeof body.minMatchScore === "number" ? body.minMatchScore : 40,
      enabled: !!body.enabled,
    };
    await candidate.save();
    return NextResponse.json({ success: true, preferences: candidate.autoApplyPreferences });
  } catch (e) {
    console.error("Save Auto-Apply Prefs Error:", e);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
