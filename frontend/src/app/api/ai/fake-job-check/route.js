import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { jobData } = await req.json(); // jobData will have title, description, company, email
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        if (!jobData) {
            return NextResponse.json({ error: "Job data is required" }, { status: 400 });
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
                        "content": `Analyze this job posting for potential scams. 
            Check for:
            - Asking for money/security deposit.
            - Sketchy email domains (e.g., @gmail.com for big firms).
            - Unrealistic salary (too high for entry-level).
            - Vague job descriptions with high urgency.
            Return ONLY a valid JSON object matching this exact schema:
            {
              "isSafe": true or false,
              "riskScore": number from 0 to 100 (100 being highly risky),
              "redFlags": ["list of string flags found"],
              "verdict": "string explaining the final verdict briefly"
            }`
                    },
                    {
                        "role": "user",
                        "content": JSON.stringify(jobData)
                    }
                ],
                "response_format": { "type": "json_object" }
            }),
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error("Fake Job API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to analyze job" }, { status: 500 });
    }
}