import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { companyName } = await req.json();


        if (!companyName) {
            return NextResponse.json({ error: "Company name is required" }, { status: 400 });
        }

        const { fetchWithFallback } = require('@/lib/ai-fallback');
        const result = await fetchWithFallback([
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
        ]);;

        return NextResponse.json({ success: true, insights: result });
    } catch (error) {
        console.error("Insights API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch insights" }, { status: 500 });
    }
}
