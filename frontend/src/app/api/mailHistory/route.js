import connectMongo from "@/lib/mongodb";
import { ScheduledMail } from "@/models/Mailing";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongo();
    // Sort by newest first
    const history = await ScheduledMail.find({})
      .sort({ createdAt: -1 });

    return NextResponse.json(history);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}