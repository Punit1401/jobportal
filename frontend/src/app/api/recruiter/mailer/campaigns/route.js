import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { ScheduledMail } from "@/models/Mailing";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Assuming we add recruiterId to ScheduledMail as well
    const campaigns = await ScheduledMail.find({ recruiterId: session.user.id }).sort({ createdAt: -1 }).limit(5);

    return NextResponse.json({ ok: true, data: campaigns });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
