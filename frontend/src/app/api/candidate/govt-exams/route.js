import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Exam from "@/models/Exam";

// When an exam has no usable date timeline (e.g. RSS news items), fall back to
// its category to pick a sensible stage.
const CATEGORY_TO_STAGE = {
  "Result": "Result",
  "Answer Key": "Answer Key",
  "Admit Card": "Admit Card",
  "Counselling": "Completed",
  "Document Verification": "Completed",
  "Interview Schedule": "Completed",
  "Application Deadline": "Application Open",
  "Correction Window": "Application Open",
  "Upcoming Exam": "Upcoming",
  "Job Notification": "Upcoming",
};

// Derive the current lifecycle stage of an exam.
// Returns one of: Upcoming | Application Open | Admit Card | Answer Key | Result | Completed
export function computeStage(exam = {}, now = new Date()) {
  const kd = exam.keyDates || {};
  const t = now.setHours ? new Date(now.setHours(0, 0, 0, 0)) : now;
  const d = (v) => (v ? new Date(v) : null);
  const examDate = d(kd.examDate);
  const appStart = d(kd.applicationStart);
  const appEnd = d(kd.applicationEnd);
  const admit = d(kd.admitCardDate);
  const ak = d(kd.answerKeyDate);
  const result = d(kd.resultDate);

  // Date-driven (most reliable, used by the curated calendar).
  if (result && t >= result) return "Result";
  if (ak && t >= ak) return "Answer Key";
  if (examDate && t >= examDate) return "Completed";
  if (admit && t >= admit) return "Admit Card";
  if (appStart && appEnd && t >= appStart && t <= appEnd) return "Application Open";
  if (examDate && t < examDate) return "Upcoming";
  if (appStart && t < appStart) return "Upcoming";

  // No usable dates → fall back to the detected category.
  return CATEGORY_TO_STAGE[exam.category] || "Upcoming";
}

// GET live exams for the user "Govt Exams" page.
// Supports ?category=, ?source=, ?state=, ?stage=, ?q= (keyword search).
export async function GET(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);

    const query = { status: "live" };

    const category = searchParams.get("category");
    if (category && category !== "All") query.category = category;

    const source = searchParams.get("source");
    if (source && source !== "All") query.source = source;

    // Exact state match — "All India" shows national exams; each state is distinct.
    const state = searchParams.get("state");
    if (state && state !== "All") query.state = state;

    const q = searchParams.get("q");
    if (q && q.trim()) query.$text = { $search: q.trim() };

    let exams = await Exam.find(query).lean();

    // Attach computed lifecycle stage to every exam.
    const now = new Date();
    exams = exams.map((e) => ({ ...e, stage: computeStage(e, new Date(now)) }));

    // Optional stage filter (Upcoming / Application Open / Admit Card / Answer Key / Result / Completed).
    const stage = searchParams.get("stage");
    if (stage && stage !== "All") {
      const wanted = stage.split(",").map((s) => s.trim());
      exams = exams.filter((e) => wanted.includes(e.stage));
    }

    // Schedule order: soonest exam date first; exams without a date go last.
    exams.sort((a, b) => {
      const da = a.keyDates?.examDate ? new Date(a.keyDates.examDate).getTime() : Infinity;
      const db = b.keyDates?.examDate ? new Date(b.keyDates.examDate).getTime() : Infinity;
      return da - db;
    });

    return NextResponse.json({ success: true, data: exams });
  } catch (error) {
    console.error("Fetch Govt Exams Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
