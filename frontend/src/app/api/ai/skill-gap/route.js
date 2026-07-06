import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userSkills, jobDescription } = body;

    // 🔹 ડેટા વેલિડેશન: જો skills સ્ટ્રિંગ હોય તો એરેમાં ફેરવો, જો એરે હોય તો એમનેમ રાખો
    let skillsArray = [];
    if (Array.isArray(userSkills)) {
      skillsArray = userSkills;
    } else if (typeof userSkills === "string") {
      skillsArray = userSkills.split(",").map(s => s.trim());
    }

    // જો હજુ પણ ડેટા ખાલી હોય
    if (skillsArray.length === 0 || !jobDescription) {
      return NextResponse.json({
        success: false,
        error: "તમારી પ્રોફાઇલમાં સ્કીલ્સ ખૂટે છે અથવા જોબ ડિસ્ક્રિપ્શન મળ્યું નથી."
      }, { status: 400 });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    const fetchAI = async (modelName) => {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Skill Gap Analysis",
        },
        body: JSON.stringify({
          "model": modelName,
          "messages": [
            {
              "role": "user",
              "content": `You are a Career Coach AI. Compare the User's Skills with the Job Description. 
              Identify Match Percentage, Missing Skills, and Existing Skills.
              Return ONLY a valid JSON object. Do not include markdown formatting or backticks.
              Required JSON structure:
              {
                "matchPercentage": 85,
                "existingSkills": ["React", "Node.js"],
                "missingSkills": ["Docker", "AWS"],
                "recommendation": "Short advice on how to bridge the gap."
              }

              User Skills: ${skillsArray.join(", ").substring(0, 2000)}
              Job Description: ${jobDescription.substring(0, 4000)}`
            }
          ],
          "temperature": 0.1,
        }),
      });
      return { response, data: await response.json() };
    };

    let { response, data } = await fetchAI("google/gemini-2.0-flash-001");

    // જો 429 (Rate Limit) અથવા 504 (Timeout) આવે તો બીજા મોડેલ પર Fallback કરો
    if (!response.ok && data.error && (data.error.code === 429 || data.error.code === 504)) {
      console.warn("Primary AI failed (429/504), falling back to gemini-1.5-flash...");
      const fallback = await fetchAI("google/gemini-1.5-flash");
      response = fallback.response;
      data = fallback.data;
    }

    if (!response.ok || !data.choices || data.choices.length === 0) {
      console.error("OpenRouter Response Error:", data);
      return NextResponse.json({ success: false, error: "AI failed to respond properly.", details: data }, { status: 500 });
    }

    let aiContent = data.choices[0].message.content.trim();
    
    // ક્લીનિંગ: જો AI માર્કડાઉન મોકલે (```json ... ```) તો તેને દૂર કરવા
    if (aiContent.startsWith("```")) {
      aiContent = aiContent.replace(/```json|```/g, "").trim();
    }

    return NextResponse.json({ success: true, analysis: JSON.parse(aiContent) });

  } catch (error) {
    console.error("AI Parsing Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error or Invalid JSON from AI" }, { status: 500 });
  }
}