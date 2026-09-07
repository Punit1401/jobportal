import { NextResponse } from "next/server";
import { fetchWithFallback } from "@/lib/ai-fallback";

// Interviewer-side assistant. Given the latest exchange (or full transcript),
// returns suggested follow-up questions, a score for the candidate's answer,
// and a short evaluation note.
//
// POST { mode, role, question, answer, transcript }
//   mode = "turn"     → analyze one Q&A: { followUps[], score, evaluation }
//   mode = "summary"  → full report from transcript: { summary, strengths[], concerns[], recommendation, overallScore }
export async function POST(req) {
  try {
    const { mode = "turn", role = "", question = "", answer = "", transcript = "" } = await req.json();

    if (mode === "summary") {
      if (!transcript.trim()) {
        return NextResponse.json({ success: false, error: "Transcript is empty." }, { status: 400 });
      }
      const out = await fetchWithFallback([
        { role: "system", content:
          "You are an expert hiring panelist. From the interview transcript, produce a fair candidate evaluation. " +
          "Output ONLY minified JSON — no markdown." },
        { role: "user", content:
          `Role: ${role || "(unspecified)"}\n\nTranscript:\n"""${transcript.slice(0, 12000)}"""\n\n` +
          `Return: {"summary": string, "strengths": string[], "concerns": string[], "recommendation": "Strong Hire"|"Hire"|"Maybe"|"No Hire", "overallScore": 0-100}` },
      ], 0.2);
      return NextResponse.json({ success: true, ...safeJson(out) });
    }

    // mode === "turn"
    if (!question && !answer) {
      return NextResponse.json({ success: false, error: "Provide a question and/or answer." }, { status: 400 });
    }
    const out = await fetchWithFallback([
      { role: "system", content:
        "You are an interviewer's AI co-pilot. Help the INTERVIEWER probe deeper and evaluate fairly. " +
        "Output ONLY minified JSON — no markdown, no commentary." },
      { role: "user", content:
        `Role being interviewed for: ${role || "(unspecified)"}\n` +
        `Interviewer's question: ${question || "(not captured)"}\n` +
        `Candidate's answer: ${answer || "(not captured)"}\n\n` +
        `Return: {"followUps": [3 sharp follow-up questions the interviewer could ask next], ` +
        `"score": 0-100 for the answer, "evaluation": "1-2 sentence note on the answer's strength/weakness"}` },
    ], 0.3);

    return NextResponse.json({ success: true, ...safeJson(out) });
  } catch (error) {
    console.error("Interview Assistant Error:", error);
    return NextResponse.json({ success: false, error: "AI assistant failed. Please try again." }, { status: 500 });
  }
}

function safeJson(raw) {
  let s = (raw || "").trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a !== -1 && b !== -1) s = s.slice(a, b + 1);
  try { return JSON.parse(s); } catch { return { raw: raw }; }
}
