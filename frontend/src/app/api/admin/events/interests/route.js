import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import EventInterest from "@/models/EventInterest";

export async function GET(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    const query = {};
    if (eventId) query.eventId = eventId;
    query.response = "Interested";

    const interests = await EventInterest.find(query)
      .populate("eventId", "title")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, interests });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
