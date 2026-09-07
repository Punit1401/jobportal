import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userSkills, jobDescription } = body;

    let skillsArray = [];
    if (Array.isArray(userSkills)) {
      skillsArray = userSkills;
    } else if (typeof userSkills === "string") {
      skillsArray = userSkills.split(",").map(s => s.trim());
    }

    if (skillsArray.length === 0 || !jobDescription) {
      return NextResponse.json({
        success: false,
        error: "Skills are missing from your profile or the job description was not found."
      }, { status: 400 });
    }

    const { fetchWithFallback } = require('@/lib/ai-fallback');
    let aiContent = await fetchWithFallback([
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
          "recommendation": "Short overall advice.",
          "roadmap": [
            { "topic": "Skill Name", "description": "What to learn", "resources": ["Link 1", "Link 2"] }
          ],
          "certifications": [
            { "name": "Cert Name", "provider": "Provider", "importance": "High/Medium" }
          ]
        }

        User Skills: ${skillsArray.join(", ").substring(0, 2000)}
        Job Description: ${jobDescription.substring(0, 4000)}`
      }
    ]);

    if (aiContent.startsWith("```")) {
      aiContent = aiContent.replace(/```json|```/g, "").trim();
    }

    return NextResponse.json({ success: true, analysis: JSON.parse(aiContent) });

  } catch (error) {
    console.error("AI Parsing Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error or Invalid JSON from AI" }, { status: 500 });
  }
}