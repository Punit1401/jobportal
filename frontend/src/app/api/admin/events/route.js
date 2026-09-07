import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Event from "@/models/Event";
import EventInterest from "@/models/EventInterest";

export async function GET(req) {
  try {
    await connectMongo();
    
    const url = new URL(req.url);
    const role = url.searchParams.get("role");

    let query = {};
    if (role) {
      let queryRole = role.charAt(0).toUpperCase() + role.slice(1);
      if (role.toLowerCase() === "serviceprovider") {
        queryRole = "ServiceProvider";
      } else if (role.toLowerCase() === "user" || role.toLowerCase() === "candidate") {
        queryRole = "Candidate";
      }
      
      query = { targetAudience: { $in: [queryRole, "All"] } };
    }

    const events = await Event.find(query).sort({ date: 1 });
    return NextResponse.json({ success: true, events });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const data = await req.json();
    const newEvent = await Event.create(data);
    return NextResponse.json({ success: true, event: newEvent });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
