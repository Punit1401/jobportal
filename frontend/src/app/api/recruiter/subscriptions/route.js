import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Recruiter from "@/models/Recruiter";
import Plan from "@/models/Plan";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiter = await Recruiter.findOne({ email: session.user.email }).populate("subscription.planId");
    const plans = await Plan.find({
      userType: { $in: ["Recruiter", "recruiter"] },
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    }).sort({ displayOrder: 1 });

    return NextResponse.json({
      ok: true,
      subscription: recruiter?.subscription || null,
      plans,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
