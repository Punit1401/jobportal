import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { role, level } = await req.json();
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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
            "content": "You are an expert Career Mentor. Create a detailed 5-step learning roadmap for the user's target role. Return ONLY a JSON object."
          },
          {
            "role": "user",
            "content": `Create a learning roadmap for someone who wants to be a ${role} and is currently at ${level} level. 
            Format: { "roadmap": { "steps": [ { "topic": "Name", "description": "Details", "resources": ["Resource 1", "Resource 2"] } ] } }`
          }
        ],
        "response_format": { "type": "json_object" }
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({ success: true, roadmap: result.roadmap });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to generate roadmap" }, { status: 500 });
  }
}