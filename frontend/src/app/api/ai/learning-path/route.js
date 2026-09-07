import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { role, level } = await req.json();
    

    const { fetchWithFallback } = require('@/lib/ai-fallback');
    const result = await fetchWithFallback([
          {
            "role": "system",
            "content": "You are an expert Career Mentor. Create a detailed 5-step learning roadmap AND a role transition timeline for the user's target role. Return ONLY a JSON object."
          },
          {
            "role": "user",
            "content": `Create a learning roadmap and role transition timeline for someone who wants to be a ${role} and is currently at ${level} level. 
            Format: { 
              "roadmap": { "steps": [ { "topic": "Name", "description": "Details", "resources": ["Resource 1", "Resource 2"] } ] },
              "timeline": [ { "title": "Role Title (e.g. Junior)", "duration": "Timeline (e.g. 0-2 Years)", "description": "Key focus area" } ] 
            }`
          }
        ]);;

    return NextResponse.json({ success: true, roadmap: result.roadmap, timeline: result.timeline });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to generate roadmap" }, { status: 500 });
  }
}
