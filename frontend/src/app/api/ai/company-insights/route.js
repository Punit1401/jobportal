import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { companyName } = await req.json();
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        if (!companyName) {
            return NextResponse.json({ error: "Company name is required" }, { status: 400 });
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
                        "content": `You are a Corporate Analyst AI. Provide deep insights into the specified company for a job seeker.
            Return ONLY a valid JSON object matching this exact schema:
            {
              "companyCulture": "Brief overview of work culture",
              "commonInterviewTopics": "What they usually ask in interviews",
              "marketPosition": "Growth & Reputation in the market",
              "employeeRating": 4.5
            }`
                    },
                    {
                        "role": "user",
                        "content": `Provide insights for the company: ${companyName}`
                    }
                ],
                "response_format": { "type": "json_object" }
            }),
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return NextResponse.json({ success: true, insights: result });
    } catch (error) {
        console.error("Insights API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch insights" }, { status: 500 });
    }
}