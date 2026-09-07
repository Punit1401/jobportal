import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Event from "@/models/Event";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiterEvents = await Event.find({ recruiterId: session.user.id }).lean();
    
    // Determine the user's role to fetch the correct platform events
    // For Service Provider, it should be "ServiceProvider". For Recruiter, "Recruiter".
    let targetRole = "Recruiter";
    if (session.user.role === "serviceprovider") targetRole = "ServiceProvider";
    else if (session.user.role === "candidate") targetRole = "Candidate";

    // Fetch platform events targeted at this role
    const adminEvents = await Event.find({ 
      targetAudience: { $in: [targetRole, "All"] },
      createdBy: { $exists: true }
    }).lean();

    const allEvents = [...recruiterEvents, ...adminEvents].sort((a, b) => new Date(a.date) - new Date(b.date));

    return NextResponse.json({ ok: true, data: allEvents });
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

    const { title, type, date, location, attendees, description } = await req.json();

    const newEvent = await Event.create({
      recruiterId: session.user.id,
      title,
      type,
      date,
      location,
      attendees,
      description
    });

    return NextResponse.json({ ok: true, data: newEvent });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
