import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import EventInterest from "@/models/EventInterest";
import User from "@/models/User";
import Recruiter from "@/models/Recruiter";
import ServiceProvider from "@/models/serviceprovider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { eventId, response } = await req.json();
    const userId = session.user.id;
    let userRole = session.user.role;
    if (userRole === "user") {
      userRole = "candidate";
    }

    await connectMongo();

    // Fetch user details based on role
    let userData = { name: session.user.name, email: session.user.email };
    if (userRole === "candidate") {
      const user = await User.findById(userId);
      if (user) userData.phone = user.phone;
    } else if (userRole === "recruiter") {
      const rec = await Recruiter.findById(userId);
      if (rec) userData.phone = rec.phone;
    } else if (userRole === "serviceprovider") {
      const sp = await ServiceProvider.findById(userId);
      if (sp) userData.phone = sp.phone;
    }

    const interest = await EventInterest.findOneAndUpdate(
      { eventId, userId },
      { 
        userRole, 
        response, 
        userData,
        // Update data if they change their mind
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, interest });
  } catch (err) {
    console.error("Interest Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectMongo();
    const myInterests = await EventInterest.find({ userId: session.user.id });
    return NextResponse.json({ success: true, myInterests });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
