import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { candidateInfo, jobDescription } = body;

    if (!candidateInfo || !jobDescription) {
      return NextResponse.json({ error: "Candidate info or Job description is missing" }, { status: 400 });
    }

    const { fetchWithFallback } = require('@/lib/ai-fallback');
    const data = await fetchWithFallback([
      {
        "role": "system",
        "content": "You are a professional career coach. Write a persuasive and professional cover letter."
      },
      {
        "role": "user",
        "content": `Write a professional cover letter for this candidate: ${typeof candidateInfo === 'object' ? JSON.stringify(candidateInfo) : candidateInfo}. 
        The job description is: ${jobDescription}. 
        Keep it professional, highlight key skills, and ensure it's under 300 words.`
      }
    ]);

    return NextResponse.json({ success: true, coverLetter: data });

  } catch (error) {
    console.error("COVER_LETTER_ERROR:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "AI Generation Failed" 
    }, { status: 500 });
  }
}
