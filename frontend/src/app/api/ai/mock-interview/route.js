import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ success: false, error: "Resume and Job Description are required" }, { status: 400 });
    }

    const { fetchWithFallback } = require('@/lib/ai-fallback');
    const content = await fetchWithFallback([
          {
            "role": "system",
            "content": "You are an expert HR Interviewer. Based on the provided Resume and Job Description, generate 10 to 15 highly relevant interview questions. Include a mix of technical, behavioral (STAR method), and situational questions. For each question, provide a detailed 'bestAnswer'. Return ONLY a valid JSON array of objects without any markdown formatting."
          },
          {
            "role": "user",
            "content": `Resume: ${resumeText}\n\nJob Description: ${jobDescription}\n\nReturn format: [{"question": "...", "bestAnswer": "..."}]`
          }
        ]);
    // Clean JSON string from potential markdown backticks
    const cleanContent = content.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(cleanContent);

    return NextResponse.json({ success: true, questions });

  } catch (err) {
    console.error("MOCK_INTERVIEW_ERROR:", err);
    return NextResponse.json({ success: false, error: "Failed to generate interview questions. Please try again." }, { status: 500 });
  }
}
