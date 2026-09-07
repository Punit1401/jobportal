import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectMongo();
    const { rating, comment, category } = await req.json();

    if (!rating || !comment) {
      return NextResponse.json({ error: "Rating and comment are required" }, { status: 400 });
    }

    const feedback = await Feedback.create({
      userId: session.user.id,
      userName: session.user.name,
      userType: session.user.role,
      rating,
      comment,
      category: category || "General"
    });

    return NextResponse.json({ success: true, feedback });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    // Check if user is admin (you might need a more robust admin check)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
    return NextResponse.json(feedbacks);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
