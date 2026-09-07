import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const kind = searchParams.get("kind");
    const status = searchParams.get("status");

    const query = { userEmail: session.user.email };
    if (kind) query.kind = kind;
    if (status) query.status = status;

    const sessions = await InterviewSession.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load interview sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const action = body?.action || "session";

    if (action === "schedule") {
      const scheduledAt = body?.scheduledAt ? new Date(body.scheduledAt) : null;

      if (!scheduledAt) {
        return NextResponse.json({ success: false, error: "Scheduled date is required" }, { status: 400 });
      }

      const scheduledSession = await InterviewSession.create({
        userEmail: session.user.email,
        userName: session.user.name || "User",
        kind: "scheduled",
        status: "scheduled",
        role: body?.role || "",
        level: body?.level || "",
        jobDescription: body?.jobDescription || "",
        resumeText: body?.resumeText || "",
        scheduledAt,
        questionsCount: Array.isArray(body?.questions) ? body.questions.length : 0,
        questions: Array.isArray(body?.questions)
          ? body.questions.slice(0, 15).map((item) => ({
              question: item?.question || "",
              bestAnswer: item?.bestAnswer || "",
            }))
          : [],
      });

      return NextResponse.json({ success: true, session: scheduledSession });
    }

    if (action === "update") {
      const { sessionId, speechAnalysis, recording, score, notes, status, questions, scheduledAt } = body || {};

      if (!sessionId) {
        return NextResponse.json({ success: false, error: "sessionId is required" }, { status: 400 });
      }

      const updateData = {};
      if (speechAnalysis) updateData.speechAnalysis = speechAnalysis;
      if (recording) updateData.recording = recording;
      if (typeof score === "number") updateData.score = score;
      if (typeof notes === "string") updateData.notes = notes;
      if (status) updateData.status = status;
      if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);
      if (Array.isArray(questions)) {
        updateData.questions = questions.slice(0, 15).map((item) => ({
          question: item?.question || "",
          bestAnswer: item?.bestAnswer || "",
        }));
        updateData.questionsCount = questions.length;
      }

      const updatedSession = await InterviewSession.findOneAndUpdate(
        { _id: sessionId, userEmail: session.user.email },
        { $set: updateData },
        { new: true }
      );

      if (!updatedSession) {
        return NextResponse.json({ success: false, error: "Interview session not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, session: updatedSession });
    }

    const interviewSession = await InterviewSession.create({
      userEmail: session.user.email,
      userName: session.user.name || "User",
      kind: "session",
      status: body?.status || "in-progress",
      role: body?.role || "",
      level: body?.level || "",
      jobDescription: body?.jobDescription || "",
      resumeText: body?.resumeText || "",
      questionsCount: Array.isArray(body?.questions) ? body.questions.length : 0,
      questions: Array.isArray(body?.questions)
        ? body.questions.slice(0, 15).map((item) => ({
            question: item?.question || "",
            bestAnswer: item?.bestAnswer || "",
          }))
        : [],
    });

    return NextResponse.json({ success: true, session: interviewSession });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save interview session" },
      { status: 500 }
    );
  }
}
