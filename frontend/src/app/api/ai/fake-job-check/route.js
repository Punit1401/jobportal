import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { jobData } = await req.json(); // jobData will have title, description, company, email
        

        if (!jobData) {
            return NextResponse.json({ error: "Job data is required" }, { status: 400 });
        }

        const { fetchWithFallback } = require('@/lib/ai-fallback');
        const result = await fetchWithFallback([
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
                  "verdict": "string explaining the final verdict briefly",
                  "explanation": "Detailed multi-sentence explanation analyzing the job post, warning signs found, and actionable protective advice for the candidate"
                }`
            },
            {
                "role": "user",
                "content": JSON.stringify(jobData)
            }
        ]);

        let parsedResult = {};
        try {
            const cleanContent = result.replace(/```json/g, "").replace(/```/g, "").trim();
            parsedResult = JSON.parse(cleanContent);
        } catch (e) {
            console.error("Failed to parse AI response as JSON:", result);
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    parsedResult = JSON.parse(jsonMatch[0]);
                } catch (innerError) {
                    console.error("Failed to parse extracted JSON:", innerError);
                }
            }
        }

        return NextResponse.json({ success: true, ...parsedResult });
    } catch (error) {
        console.error("Fake Job API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to analyze job" }, { status: 500 });
    }
}
