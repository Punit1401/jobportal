import { NextResponse } from "next/server";

function buildFallbackPortfolio(userData) {
  const { name = "", role = "", skills = "", experience = "", projects = "" } = userData || {};
  const skillList = skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : [];

  return {
    hero: {
      tagline: `Passionate ${role || "Professional"}`,
      intro: `Hi, I am ${name || "Professional"}. I specialize in ${role || "various domains"} and love solving complex problems.`
    },
    aboutMe: `I am a dedicated ${role || "professional"} with a background in key technologies. ${experience ? `My journey includes: ${experience}.` : ""}`,
    skills: [
      {
        category: "Core Technologies",
        items: skillList.length > 0 ? skillList : ["Problem Solving", "Collaboration", "Tech Adaptability"]
      }
    ],
    projects: [
      {
        title: "Key Project",
        description: projects || "Implemented business logic and optimized system performance.",
        technologies: skillList.slice(0, 3)
      }
    ],
    experience: [
      {
        role: role || "Professional",
        company: "Featured Organization",
        duration: "Present",
        description: experience || "Led technical initiatives and drove project milestones."
      }
    ],
    contactCallToAction: "Let's connect to collaborate on exciting projects!"
  };
}

export async function POST(req) {
    try {
        const { userData } = await req.json();

        if (!userData) {
            return NextResponse.json({ error: "User data is required" }, { status: 400 });
        }

        const { fetchWithFallback } = require('@/lib/ai-fallback');
        
        let content = null;
        try {
            content = await fetchWithFallback([
                {
                    "role": "system",
                    "content": `You are a Professional Portfolio Architect AI. 
        Based on the user's details, generate a comprehensive portfolio structure and content.
        Return ONLY a valid JSON object matching this exact schema:
        {
          "hero": {
            "tagline": "A catchy professional headline",
            "intro": "A short, impactful introduction"
          },
          "aboutMe": "A professional bio (approx 100 words)",
          "skills": [
            { "category": "Core Technologies", "items": ["Skill 1", "Skill 2"] }
          ],
          "projects": [
            {
              "title": "Project Name",
              "description": "Brief description emphasizing impact",
              "technologies": ["Tech 1", "Tech 2"]
            }
          ],
          "experience": [
            {
              "role": "Job Title",
              "company": "Company Name",
              "duration": "Year - Year",
              "description": "Key achievements"
            }
          ],
          "contactCallToAction": "A professional closing statement"
        }`
                },
                {
                    "role": "user",
                    "content": `Generate a portfolio for: ${JSON.stringify(userData)}`
                }
            ]);
        } catch (e) {
            console.warn("fetchWithFallback failed", e);
        }

        if (!content) {
            return NextResponse.json({ success: true, ...buildFallbackPortfolio(userData) });
        }

        let parsedResult;
        try {
            parsedResult = JSON.parse(content);
        } catch (e) {
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsedResult = JSON.parse(jsonMatch[0]);
                } else {
                    throw e;
                }
            } catch (innerErr) {
                return NextResponse.json({ success: true, ...buildFallbackPortfolio(userData) });
            }
        }

        return NextResponse.json({ success: true, ...parsedResult });
    } catch (error) {
        console.error("Portfolio Builder API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate portfolio structure" }, { status: 500 });
    }
}
