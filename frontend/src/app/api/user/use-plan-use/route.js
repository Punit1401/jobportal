import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    const candidate = await Candidate.findOne({ email: session.user.email });
    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    if (candidate.subscription && candidate.subscription.status === "Active") {
      candidate.subscription.subUsesUsed = (candidate.subscription.subUsesUsed || 0) + 1;
      await candidate.save();
    }

    return NextResponse.json({
      success: true,
      subUsesUsed: candidate.subscription?.subUsesUsed || 0
    });
  } catch (err) {
    console.error("Failed to consume plan usage:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
