import { NextResponse } from "next/server";

const GEMINI_KEY = process.env.GEMINI_API_KEY;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

function extractFeedback(data) {
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    data?.candidates?.[0]?.content?.[0]?.text ||
    data?.candidates?.[0]?.output?.[0]?.text ||
    data?.candidates?.[0]?.message?.content?.[0]?.text ||
    data?.candidates?.[0]?.text ||
    null
  );
}

export async function POST(req) {
  try {
    const { question, answer } = await req.json();

    const prompt = `
You are an interview coach. Give short, simple, direct feedback on the candidate’s answer.

RULES:
- Do NOT generate long reports, headings, sections, or formatted evaluation.
- If the answer is good, praise briefly and explain how it could be even stronger.
- If the answer is weak or incomplete, correct it clearly and explain how to improve it.
- Keep feedback between 2–5 sentences maximum.
- Talk directly to the user (“Your answer is…”).
- Do NOT rewrite the entire answer unless necessary.
- No extra explanation about interview structure.

Question: ${question}
Candidate Answer: ${answer}

Give your feedback:
`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
   

    const feedback = extractFeedback(data);

    if (!feedback) {
      return NextResponse.json({
        feedback:
          "⚠️ Gemini returned empty content. Try improving the prompt or check your API key limits.",
      });
    }

    return NextResponse.json({ feedback });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
