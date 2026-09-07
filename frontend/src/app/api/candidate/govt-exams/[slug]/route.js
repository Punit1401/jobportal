import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Exam from "@/models/Exam";

// GET a single live exam by slug for the detail page.
export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    await connectMongo();

    const exam = await Exam.findOne({ slug, status: "live" }).lean();

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    // Best-effort view counter (non-blocking on failure).
    Exam.updateOne({ slug }, { $inc: { views: 1 } }).catch(() => {});

    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    console.error("Fetch Exam Detail Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
