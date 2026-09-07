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

    const { fetchWithFallback } = require('@/lib/ai-fallback');
    const data = await fetchWithFallback([{ "role": "user", "content": prompt }]);trim();
    
    // JSON cleaning
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    const parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : aiContent);

    return NextResponse.json({ success: true, data: parsedData });

  } catch (err) {
    console.error("ATS_API_ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}