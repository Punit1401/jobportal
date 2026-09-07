import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import Exam from "@/models/Exam";

// List application-tracking entries with their exam details.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectMongo();
    const candidate = await Candidate.findOne({ userId: session.user.id })
      .populate({ path: "examApplications.examId", model: "Exam" })
      .lean();
    if (!candidate) return NextResponse.json({ success: true, tracking: [] });

    const tracking = (candidate.examApplications || []).filter((a) => a.examId);
    return NextResponse.json({ success: true, tracking });
  } catch (error) {
    console.error("Get Exam Tracking Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// Create or update a tracking entry for an exam.
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { examId, status, applicationNo, notes } = await req.json();
    if (!examId) return NextResponse.json({ success: false, error: "Exam ID is required" }, { status: 400 });

    await connectMongo();
    let candidate = await Candidate.findOne({ userId: session.user.id });
    if (!candidate) {
      candidate = await Candidate.create({
        userId: session.user.id,
        email: session.user.email,
        fullName: session.user.name,
      });
    }

    if (!candidate.examApplications) candidate.examApplications = [];
    const existing = candidate.examApplications.find((a) => a.examId?.toString() === examId);

    if (existing) {
      if (status !== undefined) existing.status = status;
      if (applicationNo !== undefined) existing.applicationNo = applicationNo;
      if (notes !== undefined) existing.notes = notes;
      existing.updatedAt = new Date();
    } else {
      candidate.examApplications.push({ examId, status: status || "Interested", applicationNo, notes });
    }
    await candidate.save();

    return NextResponse.json({ success: true, message: "Tracking updated" });
  } catch (error) {
    console.error("Update Exam Tracking Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// Remove a tracking entry.
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");
    if (!examId) return NextResponse.json({ success: false, error: "Exam ID is required" }, { status: 400 });

    await connectMongo();
    const candidate = await Candidate.findOne({ userId: session.user.id });
    if (!candidate) return NextResponse.json({ success: false, error: "Candidate profile not found" }, { status: 404 });

    candidate.examApplications = (candidate.examApplications || []).filter((a) => a.examId?.toString() !== examId);
    await candidate.save();

    return NextResponse.json({ success: true, message: "Removed from tracking" });
  } catch (error) {
    console.error("Delete Exam Tracking Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
