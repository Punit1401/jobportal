import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import GovtResource from "@/models/GovtResource";

// Toggle save / unsave a scheme.
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { schemeId } = await req.json();
    if (!schemeId) return NextResponse.json({ success: false, error: "Scheme ID is required" }, { status: 400 });

    await connectMongo();
    let candidate = await Candidate.findOne({ userId: session.user.id });
    if (!candidate) {
      candidate = await Candidate.create({
        userId: session.user.id,
        email: session.user.email,
        fullName: session.user.name,
      });
    }

    if (!candidate.savedSchemes) candidate.savedSchemes = [];
    const isSaved = candidate.savedSchemes.some((id) => id.toString() === schemeId);
    if (isSaved) candidate.savedSchemes = candidate.savedSchemes.filter((id) => id.toString() !== schemeId);
    else candidate.savedSchemes.push(schemeId);
    await candidate.save();

    return NextResponse.json({ success: true, saved: !isSaved, message: isSaved ? "Removed" : "Scheme saved" });
  } catch (error) {
    console.error("Save Scheme Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// List saved schemes.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectMongo();
    const candidate = await Candidate.findOne({ userId: session.user.id })
      .populate({ path: "savedSchemes", model: "GovtResource" })
      .lean();
    if (!candidate) return NextResponse.json({ success: true, savedSchemes: [] });

    return NextResponse.json({ success: true, savedSchemes: (candidate.savedSchemes || []).filter(Boolean) });
  } catch (error) {
    console.error("Get Saved Schemes Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
