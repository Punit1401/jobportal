import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { role, location, experience, industry } = await req.json();
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        if (!role || !location) {
            return NextResponse.json({ error: "Role and Location are required" }, { status: 400 });
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
                        "content": `You are a Global Compensation & Benefits Expert AI. 
            Provide realistic salary benchmarking data based on the provided role, location, and experience.
            Return ONLY a valid JSON object matching this exact schema:
            {
              "currency": "USD/INR/EUR etc.",
              "range": { "low": number, "median": number, "high": number },
              "marketSentiment": "Hot/Stable/Cool",
              "topPayingCompanies": ["Company A", "Company B"],
              "requiredSkillsForTopPay": ["Skill 1", "Skill 2"],
              "locationFactor": "Explanation of how location affects this salary",
              "growthProjection": "Projected growth for this role in the next 3-5 years"
            }`
                    },
                    {
                        "role": "user",
                        "content": `Salary benchmark for: Role: ${role}, Location: ${location}, Experience: ${experience} years, Industry: ${industry || 'Tech'}`
                    }
                ],
                "response_format": { "type": "json_object" }
            }),
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error("Salary Benchmarking API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate salary data" }, { status: 500 });
    }
}
