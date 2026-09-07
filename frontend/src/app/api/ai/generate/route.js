import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt, systemInstruction } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
    }

    const { fetchWithFallback } = require('@/lib/ai-fallback');
    const messages = [
      { "role": "system", "content": systemInstruction || "You are a helpful AI assistant." },
      { "role": "user", "content": prompt }
    ];
    
    const text = await fetchWithFallback(messages);
    return NextResponse.json({ text });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response: " + error.message },
      { status: 500 }
    );
  }
}
