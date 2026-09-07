import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { industry, role, goal } = await req.json();
        

        if (!industry || !role) {
            return NextResponse.json({ error: "Industry and Role are required" }, { status: 400 });
        }

        const { fetchWithFallback } = require('@/lib/ai-fallback');
    const result = await fetchWithFallback([
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
                ]);;

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error("Networking Suggestions API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate networking suggestions" }, { status: 500 });
    }
}
