import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { candidateInfo, jobDescription } = body;

    // ૧. ડેટા ચેક કરો
    if (!candidateInfo || !jobDescription) {
      return NextResponse.json({ error: "Candidate info or Job description is missing" }, { status: 400 });
    }

    // ૨. OpenRouter કોલ (Gemini 2.0 Flash વાપરીશું જે વધુ સારું છે)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // OpenRouter માટે જરૂરી
        "X-Title": "Job Portal AI",
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001", 
        "messages": [
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
        ],
        "temperature": 0.7,
      })
    });

    const data = await response.json();

    // ૩. API એરર હેન્ડલિંગ
    if (!response.ok) {
      console.error("OpenRouter API Error:", data);
      throw new Error(data.error?.message || "OpenRouter API Failed");
    }

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("No content received from AI");
    }

    return NextResponse.json({ 
      success: true, 
      coverLetter: data.choices[0].message.content 
    });

  } catch (error) {
    console.error("COVER_LETTER_ERROR:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "AI Generation Failed" 
    }, { status: 500 });
  }
}