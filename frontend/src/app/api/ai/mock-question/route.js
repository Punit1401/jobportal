import { NextResponse } from "next/server";
import Bytez from "bytez.js";

const sdk = new Bytez(process.env.BYTEZ_API_KEY);
const model = sdk.model("google/gemini-2.5-pro");

export async function GET() {
  try {
    const prompt = `
Generate a unique behavioral or technical interview question for a software engineer.
Avoid repeating common questions like "Describe yourself briefly".
Only return the question itself in one line, without explanation or reasoning.
`;

    const { output, error } = await model.run([
      { role: "user", content: prompt }
    ]);

    if (error) throw new Error(error.message || "Failed to generate question");

    // Bytez output is usually in output.content
    const rawText = output?.content?.trim();
    if (!rawText) throw new Error("No question generated");

    // Extract the first question inside quotes (common Bytez format)
    const match = rawText.match(/\*\*"(.*?)"\*\*/);
    const question = match ? match[1] : rawText; // fallback to full text if not matched

    return NextResponse.json({ question });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
