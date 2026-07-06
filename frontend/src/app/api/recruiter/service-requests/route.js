import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import ServiceRequest from "@/models/ServiceRequest";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await ServiceRequest.find({ userId: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json({ ok: true, data: requests });
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

    const { subject, message } = await req.json();

    if (!subject || !message) {
        return NextResponse.json({ error: "Subject and Message are required" }, { status: 400 });
    }

    const newRequest = await ServiceRequest.create({
      userId: session.user.id,
      userRole: "recruiter",
      userEmail: session.user.email,
      subject,
      message
    });

    return NextResponse.json({ ok: true, data: newRequest });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
