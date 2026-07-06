import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { userData } = await req.json();
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        if (!userData) {
            return NextResponse.json({ error: "User data is required" }, { status: 400 });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    {
                        "role": "system",
                        "content": `You are a Professional Portfolio Architect AI. 
            Based on the user's details, generate a comprehensive portfolio structure and content.
            Return ONLY a valid JSON object matching this exact schema:
            {
              "hero": {
                "tagline": "A catchy professional headline",
                "intro": "A short, impactful introduction"
              },
              "aboutMe": "A professional bio (approx 100 words)",
              "skills": [
                { "category": "Frontend", "items": ["React", "Tailwind"] }
              ],
              "projects": [
                {
                  "title": "Project Name",
                  "description": "Brief description emphasizing impact",
                  "technologies": ["Tech 1", "Tech 2"]
                }
              ],
              "experience": [
                {
                  "role": "Job Title",
                  "company": "Company Name",
                  "duration": "Year - Year",
                  "description": "Key achievements"
                }
              ],
              "contactCallToAction": "A professional closing statement"
            }`
                    },
                    {
                        "role": "user",
                        "content": `Generate a portfolio for: ${JSON.stringify(userData)}`
                    }
                ],
                "response_format": { "type": "json_object" }
            }),
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error("Portfolio Builder API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate portfolio structure" }, { status: 500 });
    }
}
