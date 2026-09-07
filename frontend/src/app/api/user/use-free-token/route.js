import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    let candidate = await Candidate.findOne({ email: session.user.email });
    if (!candidate) {
      candidate = await Candidate.create({
        userId: session.user.id,
        email: session.user.email,
        fullName: session.user.name || "",
        freeUsesCount: 0,
      });
    }

    let key = "default";
    try {
      const body = await req.json();
      if (body?.pathname) {
        key = body.pathname.toLowerCase().replace(/\//g, "_").replace(/\./g, "_");
      } else if (body?.featureName) {
        key = body.featureName.toLowerCase();
      }
    } catch (e) {
      // Body may be empty
    }

    candidate.freeUses = candidate.freeUses || {};
    const currentCount = candidate.freeUses[key] || 0;

    if (currentCount < 3) {
      candidate.freeUses[key] = currentCount + 1;
      candidate.markModified("freeUses");
      candidate.freeUsesCount = (candidate.freeUsesCount || 0) + 1;
      await candidate.save();
    }

    return NextResponse.json({
      success: true,
      freeUsesCount: candidate.freeUses[key],
      freeUses: candidate.freeUses
    });

  } catch (error) {
    console.error("Error using free token:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
