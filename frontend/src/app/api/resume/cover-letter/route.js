// src/app/api/resume/cover-letter/route.js
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

    // ---- READ FORMDATA (FILE + TEXT) ----
    const form = await req.formData();

    const file = form.get("file"); // optional
    const resumeId = form.get("resumeId"); // optional
    const resumeTextClient = form.get("resumeText") || ""; // from client text box
    const jobDescription = form.get("jobDescription");
    const tone = form.get("tone") || "formal";
    const length = form.get("length") || "short";

    if (!jobDescription)
      return NextResponse.json({ error: "Job description missing" }, { status: 400 });

    // ---- PROCESS RESUME TEXT ----
    let finalResumeText = "";

    // 1) If user uploaded a file
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      finalResumeText = buffer.toString();
    }
    // 2) If user pasted text
    else if (resumeTextClient) {
      finalResumeText = resumeTextClient;
    }
    // 3) If resume ID is given
    else if (resumeId) {
      const doc = await Resume.findById(resumeId);
      finalResumeText = doc?.text || "";
    }

    if (!finalResumeText)
      return NextResponse.json(
        { error: "Resume text not provided" },
        { status: 400 }
      );

    const jdHash = hashText(jobDescription + tone + length);

    // ---- AI PROMPT ----
    const prompt = `
You are a senior career coach. Write a professional cover letter.

Tone: ${tone}
Length: ${length}

Job Description:
${jobDescription}

Resume:
${finalResumeText}

Respond ONLY with the cover letter text.
`;

    // ---- CALL GEMINI ----
    const coverText = await analyzeResumeGemini(prompt);

    // ---- SAVE TO DB IF resumeId EXISTS ----
    if (resumeId) {
      const resumeDoc = await Resume.findById(resumeId);
      if (resumeDoc) {
        resumeDoc.coverLetters = resumeDoc.coverLetters || [];
        resumeDoc.coverLetters.push({
          jdHash,
          tone,
          coverText,
          createdAt: new Date(),
        });
        await resumeDoc.save();
      }
    }

    return NextResponse.json({ ok: true, coverText });
  } catch (err) {
    console.error("Cover letter error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
