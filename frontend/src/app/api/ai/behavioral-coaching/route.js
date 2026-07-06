import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { question, answer } = await req.json();
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        if (!question || !answer) {
            return NextResponse.json({ error: "Both question and answer are required" }, { status: 400 });
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
                        "content": `You are an expert Behavioral Interview Coach. 
            Evaluate the candidate's answer to the provided behavioral question.
            Your analysis must follow the STAR method (Situation, Task, Action, Result) where applicable.
            Return ONLY a valid JSON object matching this exact schema:
            {
              "score": number from 1 to 10 (10 being perfect),
              "feedback": "Overall assessment of the answer",
              "strengths": ["List of things the candidate did well"],
              "improvements": ["List of actionable areas for improvement"],
              "idealAnswerPattern": "A brief outline of how a perfect answer should be structured using STAR"
            }`
                    },
                    {
                        "role": "user",
                        "content": `Question: ${question}\nCandidate's Answer: ${answer}`
                    }
                ],
                "response_format": { "type": "json_object" }
            }),
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error("Behavioral Coaching API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to analyze response" }, { status: 500 });
    }
}
