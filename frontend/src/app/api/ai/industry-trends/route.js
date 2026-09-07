import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { industry } = await req.json();
    

    const { fetchWithFallback } = require('@/lib/ai-fallback');
    const result = await fetchWithFallback([
          {
            "role": "system",
            "content": `You are a real-time Global Market Data Analyst. 
            IMPORTANT: Provide specific, high-growth skills and roles for the ${industry} sector as of March 2026.
            For each skill and role, provide a 2-3 sentence 'description' explaining why it is in demand and its practical use.
            
            Return ONLY a JSON object with this exact structure:
            { 
              "trends": { 
                "skills": [{ "name": "Skill Name", "growth": 0-100, "description": "Short detail..." }], 
                "marketStatus": "Current Sentiment", 
                "summary": "One unique market insight",
                "roles": [{ "name": "Role Name", "description": "Short detail..." }] 
              } 
            }`
          },
          {
            "role": "user",
            "content": `Fetch and analyze the latest trends for ${industry}.`
          }
        ]);;
    return NextResponse.json({ success: true, trends: result.trends });
  } catch (error) {
    console.error("Trends API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch fresh trends" }, { status: 500 });
  }
}
