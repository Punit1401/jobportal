import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { resumeText, jobDescription, mode } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: "Missing Resume or Job Description" }, { status: 400 });
    }

    let prompt = "";

    // If mode is 'tailor', use a different prompt logic
    if (mode === 'tailor') {
      prompt = `
        You are a professional resume optimizer. 
        Compare the following Resume and Job Description (JD).
        
        Tasks:
        1. Write a high-impact, 3-sentence professional summary for the top of the resume that specifically highlights experience relevant to this JD.
        2. Identify 5-8 missing keywords/skills from the JD that are not in the resume but the candidate likely has.

        Resume: "${resumeText.substring(0, 4000)}"
        JD: "${jobDescription.substring(0, 4000)}"

        Return ONLY a JSON object with this structure:
        {
          "tailoredSummary": "...",
          "keywordsToAdd": ["keyword1", "keyword2", "keyword3"]
        }
      `;
    } else {
      // Standard ATS Score Logic (Existing)
      prompt = `
        You are an expert ATS (Applicant Tracking System) analyzer.
        Compare the Resume against the Job Description (JD).
        
        Resume: "${resumeText.substring(0, 4000)}"
        JD: "${jobDescription.substring(0, 4000)}"

        Return ONLY a JSON object with this structure:
        {
          "score": 85, 
          "summary": "Short 2 line summary of the match",
          "missingKeywords": ["React", "AWS", "Docker"],
          "suggestions": ["Add more detail about cloud experience", "Include specific metrics"]
        }
      `;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "ATS Score Analyzer",
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001", 
        "messages": [{ "role": "user", "content": prompt }],
        "temperature": 0.3,
        "response_format": { "type": "json_object" }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenRouter Error:", data);
      throw new Error(data.error?.message || "AI Fetch Failed");
    }

    let aiContent = data.choices[0].message.content.trim();
    
    // JSON ક્લીનિંગ
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    const parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : aiContent);

    return NextResponse.json({ success: true, data: parsedData });

  } catch (err) {
    console.error("ATS_API_ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}