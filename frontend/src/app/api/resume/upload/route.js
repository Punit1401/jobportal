export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Resume from "@/models/Resume";
import mammoth from "mammoth";
import { analyzeResumeGemini } from "@/lib/gemini";

// -----------------------------
// PDF Parsing
// -----------------------------
async function extractPDF(buffer) {
  try {
    const pdfParse = require("pdf-parse").default || require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text?.trim() || "";
  } catch (err) {
    console.warn("PDF parsing failed:", err);
    return "";
  }
}

// -----------------------------
// DOCX Parsing
// -----------------------------
async function extractDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value?.trim() || "";
  } catch (err) {
    console.warn("DOCX parsing failed:", err);
    return "";
  }
}

// -----------------------------
// Generic text extraction
// -----------------------------
async function extractText(buffer, filename) {
  const ext = filename.split(".").pop().toLowerCase();

  let text = "";
  if (ext === "pdf") text = await extractPDF(buffer);
  else if (ext === "docx") text = await extractDOCX(buffer);
  else text = buffer.toString("utf-8");

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// -----------------------------
// ATS Calculation (FIXED LOGIC)
// -----------------------------
function calculateATS(resumeText, jobDescription) {
  if (!jobDescription || !jobDescription.trim())
    return { score: 0, missingKeywords: [] };

  // Stopwords - આ શબ્દોને કીવર્ડ તરીકે નહીં ગણવામાં આવે
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "but", "is", "if", "then", "else", "when", "at", "from", "by", "for", "with", "in", "on", "to", "be", "it", "of", "as", "are", "you", "your", "we", "our", "their", "this", "that", "shall", "be", "will", "have", "has", "can", "should", "must", "etc", "please", "note", "job", "description", "seeking", "skilled", "experienced", "provide", "ensure"
  ]);

  // Clean and Tokenize
  const resumeWords = new Set(
    resumeText.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !stopWords.has(w))
  );

  const jdWordsAll = jobDescription.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !stopWords.has(w));
  
  // Get Unique Keywords from JD
  const jdWordsUnique = Array.from(new Set(jdWordsAll));

  // Find missing and matched
  const missingKeywords = jdWordsUnique.filter((w) => !resumeWords.has(w));
  const matchedKeywords = jdWordsUnique.filter((w) => resumeWords.has(w));

  // ATS Score Calculation
  // જોબ ડિસ્ક્રિપ્શનના મહત્વના કીવર્ડ્સ કેટલા મેચ થાય છે તેના આધારે સ્કોર
  const score = jdWordsUnique.length > 0 
    ? (matchedKeywords.length / jdWordsUnique.length) * 100 
    : 0;

  return { 
    score: Math.round(score), 
    missingKeywords: missingKeywords.slice(0, 15) // માત્ર ટોચના 15 કીવર્ડ્સ બતાવશે
  };
}

// -----------------------------
// POST Route
// -----------------------------
export async function POST(req) {
  try {
    await connectMongo();

    const form = await req.formData();
    const file = form.get("file");
    const userId = form.get("userId") || null;
    const jobDescription = form.get("jobDescription") || "";

    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractText(buffer, file.name);

    if (!text)
      return NextResponse.json(
        {
          error: "Unable to extract text. Upload a text-based PDF, DOCX, or TXT.",
        },
        { status: 400 }
      );

    // -----------------------------
    // Gemini AI Analysis
    // -----------------------------
    let aiSuggestions = "";
    try {
      aiSuggestions = await analyzeResumeGemini(text);
    } catch (apiErr) {
      console.error("Gemini Error:", apiErr);
      aiSuggestions = "AI Analysis is currently unavailable due to quota limits. Please try again later.";
    }

    // -----------------------------
    // ATS Score Calculation
    // -----------------------------
    const atsResult = calculateATS(text, jobDescription);

    // -----------------------------
    // Save to DB
    // -----------------------------
    const saved = await Resume.create({
      userId,
      originalName: file.name,
      text,
      aiSuggestions,
      atsScore: atsResult.score,
      missingKeywords: atsResult.missingKeywords,
    });

    return NextResponse.json({ ok: true, data: saved });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}