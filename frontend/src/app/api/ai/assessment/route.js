import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { skill, level } = await req.json();
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        if (!skill) {
            return NextResponse.json({ error: "Skill or Job Role is required" }, { status: 400 });
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
                        "content": `You are an Technical Interviewer AI. 
            Generate a set of 5 high-quality Multiple Choice Questions (MCQs) for a specific skill or job role.
            Return ONLY a valid JSON object matching this exact schema:
            {
              "testTitle": "Title of the test",
              "questions": [
                {
                  "question": "The question text",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "correctAnswer": "The exact string matching one of the options",
                  "explanation": "Brief explanation of why it is correct"
                }
              ]
            }`
                    },
                    {
                        "role": "user",
                        "content": `Generate a ${level || 'Intermediate'} level assessment test for: ${skill}`
                    }
                ],
                "response_format": { "type": "json_object" }
            }),
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error("Assessment API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate assessment" }, { status: 500 });
    }
}
