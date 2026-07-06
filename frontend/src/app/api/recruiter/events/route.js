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

    const events = await Event.find({ recruiterId: session.user.id }).sort({ date: 1 });

    return NextResponse.json({ ok: true, data: events });
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
