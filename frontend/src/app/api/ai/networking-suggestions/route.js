import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { industry, role, goal } = await req.json();
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        if (!industry || !role) {
            return NextResponse.json({ error: "Industry and Role are required" }, { status: 400 });
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
                        "content": `You are a Career Networking Expert AI. 
            Provide actionable networking suggestions for a professional based on their industry and role.
            Return ONLY a valid JSON object matching this exact schema:
            {
              "strategies": [
                { "title": "Strategy Title", "description": "Actionable steps" }
              ],
              "potentialConnections": [
                { "type": "Role/Level", "why": "Why connect with them" }
              ],
              "messageTemplates": [
                { "context": "Inquiry/Connection Request", "template": "The actual message text" }
              ],
              "platforms": ["LinkedIn", "Twitter", "Industry Forums", etc.],
              "proTip": "One advanced networking tip"
            }`
                    },
                    {
                        "role": "user",
                        "content": `Networking suggestions for: Industry: ${industry}, Role: ${role}, Goal: ${goal || 'Expand network'}`
                    }
                ],
                "response_format": { "type": "json_object" }
            }),
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error("Networking Suggestions API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate networking suggestions" }, { status: 500 });
    }
}
