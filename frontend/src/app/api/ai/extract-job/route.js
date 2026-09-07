import { NextResponse } from "next/server";
import rateLimit from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    try {
      await limiter.check(5, ip); // Max 5 extractions per minute per IP
    } catch {
      return NextResponse.json({ error: "Too many AI requests. Please try again later." }, { status: 429 });
    }

    const { rawText } = await req.json();
    if (!rawText) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    const prompt = `Extract ALL Job and Company details from the text below. 
    If the text contains multiple job vacancies or positions, extract all of them into the "jobs" array.
    Return ONLY a valid JSON object. Do not include markdown or backticks.
    
    Text: "${rawText.substring(0, 4000)}" 

    Return this exact JSON structure:
    {
      "jobs": [
        { 
          "title": "", "category": "", "jobType": "Full-time", "location": "", 
          "salaryRange": "", "experienceLevel": "", "description": "", "requirements": "", 
          "deadline": "", "industry": "", "profession": "", "designation": "", "department": "",
          "applyLink": "", "applyEmail": "", "applyPhone": "", "applyPersonName": ""
        }
      ],
      "company": { 
        "companyName": "", "tagline": "", "industry": "", "department": "", 
        "profession": "", "designation": "", "website": "", "email": "", 
        "mobile": "", "location": "", "address": "", "companySize": "", 
        "founded": "", "description": "", "specialties": "",
        "contactPersonName": "", "contactPersonNumber": "", "contactPersonEmail": "",
        "ownerName": "", "ownerNumber": "", "ownerEmail": ""
      }
    }`;

    const { fetchWithFallback } = require('@/lib/ai-fallback');
    let aiContent = await fetchWithFallback([{ "role": "user", "content": prompt }], 0.1);

    // Cleaning: If AI sends markdown (```json ... ```), remove it
    if (aiContent.startsWith("```")) {
      aiContent = aiContent.replace(/```json|```/g, "").trim();
    }

    return NextResponse.json(JSON.parse(aiContent));
  } catch (err) {
    console.error("AI_API_ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}