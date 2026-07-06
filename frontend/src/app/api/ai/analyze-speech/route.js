import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile) {
      return NextResponse.json({ success: false, error: "No audio provided" }, { status: 400 });
    }

    // 1. Convert Audio to Base64 (OpenRouter/Whisper mate)
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    
    // --- STEP 1: Speech to Text (Whisper via OpenRouter) ---
    // Note: Jo tamare direct transcription karvu hoy to Whisper model use karvi.
    // Pachhi tone analysis mate niche no logic use karvo.

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    // --- STEP 2: Tone & Speech Analysis (Using Gemini/Llama via OpenRouter) ---
    // Ahiya aapne assume kariye chiye ke tame text pass karo cho 
    // Pan Mock Interview mate direct Audio Analysis bau costly pade, 
    // Etle best approach e che ke tame text analyze karo.

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001", // Tame tamari pasand ni model rakhi shako
        "messages": [
          {
            "role": "system",
            "content": `You are an expert Speech & Tone Coach. Analyze the user's spoken response for an interview.
            Return a JSON object with:
            {
              "tone": "Confident/Nervous/Professional",
              "confidence": 0-100 number,
              "feedback": "Short 1-2 sentence constructive feedback on their delivery."
            }`
          },
          {
            "role": "user",
            "content": "Analyze this interview answer delivery (simulated from audio)." 
          }
        ],
        "response_format": { "type": "json_object" }
      }),
    });

    const data = await response.json();
    const analysisResult = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({
      success: true,
      analysis: analysisResult
    });

  } catch (error) {
    console.error("Speech API Error:", error);
    return NextResponse.json({ success: false, error: "Analysis failed" }, { status: 500 });
  }
}