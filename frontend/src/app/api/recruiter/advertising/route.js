import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import AdCampaign from "@/models/AdCampaign";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaigns = await AdCampaign.find({ recruiterId: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json({ ok: true, data: campaigns });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, budget, jobId } = await req.json();

    const newCampaign = await AdCampaign.create({
      recruiterId: session.user.id,
      name,
      budget,
      jobId
    });

    return NextResponse.json({ ok: true, data: newCampaign });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
