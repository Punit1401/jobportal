import connectMongo from "@/lib/mongodb";
import Question from "@/models/Question";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();
    const { questionId, providerEmail, providerName, answerText } = body;

    if (!questionId || !providerEmail || !providerName || !answerText) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const question = await Question.findById(questionId);
    if (!question) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Add new answer to the answers array
    question.answers.push({
        providerEmail,
        providerName,
        answerText,
        createdAt: new Date()
    });

    await question.save();

    return NextResponse.json({ success: true, question });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to post answer" }, { status: 500 });
  }
}
