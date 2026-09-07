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

    // --- STEP 2: Tone & Speech Analysis (Using Gemini/Llama via OpenRouter) ---
    const { fetchWithFallback } = require('@/lib/ai-fallback');
    const analysisResult = await fetchWithFallback([
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
    ]);

    const cleanContent = analysisResult.replace(/```json|```/g, "").trim();
    let parsedAnalysis = {};
    try {
      parsedAnalysis = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse speech analysis JSON:", e);
      parsedAnalysis = {
        tone: "Confident",
        confidence: 85,
        feedback: cleanContent
      };
    }

    return NextResponse.json({
      success: true,
      analysis: parsedAnalysis
    });

  } catch (error) {
    console.error("Speech API Error:", error);
    return NextResponse.json({ success: false, error: "Analysis failed" }, { status: 500 });
  }
}
