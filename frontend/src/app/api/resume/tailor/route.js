// src/app/api/resume/tailor/route.js
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Resume from "@/models/Resume";
import { analyzeResumeGemini } from "@/lib/gemini";
import crypto from "crypto";

function hashText(s) {
  return crypto.createHash("md5").update(s).digest("hex");
}

export async function POST(req) {
  try {
    await connectMongo();

    // -----------------------------------------------------
    // 🔥 SUPER SAFE BODY PARSER → FIXES ALL JSON ERRORS
    // -----------------------------------------------------
    const bodyRaw = await req.text();
    let body = {};
    try {
      body = JSON.parse(bodyRaw);
    } catch (err) {
      console.error("❌ JSON Parse Error:", err, "\nRAW:", bodyRaw);
      return NextResponse.json(
        {
          error: "Invalid JSON sent. Fix frontend body format.",
          raw: bodyRaw,
        },
        { status: 400 }
      );
    }

    const { resumeId, resumeText, jobDescription, format = "onepage", focus = "achievements" } = body;

    if (!jobDescription || (!resumeId && !resumeText)) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    let text = resumeText;
    let resumeDoc = null;

    if (resumeId) {
      resumeDoc = await Resume.findById(resumeId);
      if (!resumeDoc) return NextResponse.json({ error: "Resume not found" }, { status: 404 });
      if (!text) text = resumeDoc.text || "";
    }

    const jdHash = hashText(jobDescription + format + focus);

    // -----------------------------------------------------
    // PROMPT FOR GEMINI
    // -----------------------------------------------------
    const prompt = `
You are a professional resume optimization AI.
Rewrite and tailor the resume to match the job description.

Return ONLY JSON in this format:
{
  "tailored": "Full optimized resume text",
  "bullets": ["bullet1", "bullet2"],
  "keywords": ["keyword1", "keyword2"],
  "notes": "short notes"
}

Job Description:
${jobDescription}

Resume:
${text}

Format: ${format}
Focus: ${focus}
`;

    const aiResponse = await analyzeResumeGemini(prompt);

    // Remove ```json wrapper if Gemini adds it
    const clean = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();

    // -----------------------------------------------------
    // SAFE JSON PARSE
    // -----------------------------------------------------
    let parsed = { tailored: clean, bullets: [], keywords: [], notes: "" };
    try {
      const j = JSON.parse(clean);
      parsed = {
        tailored: j.tailored || clean,
        bullets: j.bullets || [],
        keywords: j.keywords || [],
        notes: j.notes || "",
      };
    } catch {
      console.warn("⚠ AI did not return JSON. Using raw text.");
    }

    // -----------------------------------------------------
    // SAVE TO DB IF RESUME EXISTS
    // -----------------------------------------------------
    if (resumeDoc) {
      resumeDoc.tailoredVersions = resumeDoc.tailoredVersions || [];
      resumeDoc.tailoredVersions.push({
        jdHash,
        jobDescription,
        tailoredText: parsed.tailored,
        bullets: parsed.bullets,
        keywords: parsed.keywords,
        notes: parsed.notes,
        createdAt: new Date(),
      });
      await resumeDoc.save();
    }

    return NextResponse.json({ ok: true, data: parsed });
  } catch (err) {
    console.error("Tailor error:", err);
    return NextResponse.json({ error: "Server failed: " + err.message }, { status: 500 });
  }
}
