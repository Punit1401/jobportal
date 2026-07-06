import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import ServiceRequest from "@/models/ServiceRequest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const { id } = await params;
    const { adminReply } = await req.json();

    if (!adminReply) {
      return NextResponse.json({ error: "Reply is required" }, { status: 400 });
    }

    const request = await ServiceRequest.findByIdAndUpdate(
      id,
      { adminReply, status: "Answered" },
      { new: true }
    );

    if (!request) {
      return NextResponse.json({ error: "Service request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, request }, { status: 200 });
  } catch (error) {
    console.error("Error replying to service request:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
