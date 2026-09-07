import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { role, location, experience, industry } = await req.json();

        if (!role || !location) {
            return NextResponse.json({ error: "Role and Location are required" }, { status: 400 });
        }

        const { fetchWithFallback } = require('@/lib/ai-fallback');
        const result = await fetchWithFallback([
            {
                "role": "system",
                "content": `You are a Global Compensation & Benefits Expert AI. 
                Provide realistic salary benchmarking data based on the provided role, location, and experience.
                Return ONLY a valid JSON object matching this exact schema:
                {
                  "currency": "USD/INR/EUR etc.",
                  "range": { "low": number, "median": number, "high": number },
                  "progression": [
                    { "year": "Entry", "salary": number },
                    { "year": "Mid (3y)", "salary": number },
                    { "year": "Senior (5y)", "salary": number },
                    { "year": "Lead (10y)", "salary": number }
                  ],
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
        ]);

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error("Salary Benchmarking API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate salary data" }, { status: 500 });
    }
}
