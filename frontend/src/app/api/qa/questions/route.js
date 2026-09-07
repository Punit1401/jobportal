import connectMongo from "@/lib/mongodb";
import Question from "@/models/Question";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail");
    
    let questions;
    if (userEmail) {
        // Fetch questions only for the specific user
        questions = await Question.find({ userEmail }).sort({ createdAt: -1 });
    } else {
        // Fetch all questions for service providers
        questions = await Question.find().sort({ createdAt: -1 });
    }
    
    return NextResponse.json(
      { success: true, questions },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      }
    );
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();
    const { userEmail, userName, questionText } = body;

    if (!userEmail || !userName || !questionText) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newQuestion = await Question.create({
      userEmail, userName, questionText, answers: []
    });

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
