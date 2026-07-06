import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import Candidate from "@/models/Candidate";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectMongo();

    // Fetch Candidate Profile (for the data)
    const candidate = await Candidate.findOne({ userId: session.user.id }).lean();
    if (!candidate) return NextResponse.json({ error: "Profile not found. Please complete your profile first." }, { status: 404 });

    // Fetch or Create Portfolio Config
    let portfolio = await Portfolio.findOne({ userId: session.user.id }).lean();
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: session.user.id });
    }

    return NextResponse.json({ success: true, portfolio, candidate });
  } catch (error) {
    console.error("Portfolio GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { username, theme, template, isPublished, visibleSections, accentColor } = body;

    await connectMongo();

    // Check if username is taken by someone else
    if (username) {
      const existing = await Portfolio.findOne({ username, userId: { $ne: session.user.id } });
      if (existing) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }
    }

    const updated = await Portfolio.findOneAndUpdate(
      { userId: session.user.id },
      { $set: { username, theme, template, isPublished, visibleSections, accentColor } },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, portfolio: updated });
  } catch (error) {
    console.error("Portfolio POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
