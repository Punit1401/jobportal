import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import Exam from "@/models/Exam";

// Toggle save / unsave an exam.
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { examId } = await req.json();
    if (!examId) return NextResponse.json({ success: false, error: "Exam ID is required" }, { status: 400 });

    await connectMongo();
    // Auto-create a minimal profile if the user doesn't have one yet, so saving
    // works even before the candidate completes their full profile.
    let candidate = await Candidate.findOne({ userId: session.user.id });
    if (!candidate) {
      candidate = await Candidate.create({
        userId: session.user.id,
        email: session.user.email,
        fullName: session.user.name,
      });
    }

    if (!candidate.savedExams) candidate.savedExams = [];
    const isSaved = candidate.savedExams.some((id) => id.toString() === examId);

    if (isSaved) {
      candidate.savedExams = candidate.savedExams.filter((id) => id.toString() !== examId);
    } else {
      candidate.savedExams.push(examId);
    }
    await candidate.save();

    return NextResponse.json({
      success: true,
      saved: !isSaved,
      message: isSaved ? "Removed from saved exams" : "Exam saved",
      savedExams: candidate.savedExams,
    });
  } catch (error) {
    console.error("Save Exam Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// List the user's saved exams (full Exam docs).
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectMongo();
    const candidate = await Candidate.findOne({ userId: session.user.id })
      .populate({ path: "savedExams", model: "Exam" })
      .lean();

    // No profile yet → simply no saved exams (not an error).
    if (!candidate) return NextResponse.json({ success: true, savedExams: [] });

    const savedExams = (candidate.savedExams || []).filter(Boolean);
    return NextResponse.json({ success: true, savedExams });
  } catch (error) {
    console.error("Get Saved Exams Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
