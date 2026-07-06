import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Recruiter from "@/models/Recruiter";
import Plan from "@/models/Plan";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiter = await Recruiter.findOne({ userId: session.user.id }).populate("subscription.planId");
    const plans = await Plan.find({ type: "recruiter" });

    return NextResponse.json({ ok: true, subscription: recruiter.subscription, plans });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
