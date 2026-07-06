import { GoogleGenerativeAI } from "@google/generative-ai";

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeResumeGemini(text) {
  const prompt = `
You are a professional ATS resume analyzer.
Analyze the resume text and give:

1. Improved resume version  
2. Missing important keywords  
3. ATS score (0–100)  
4. Bullet point achievements to add  

Resume:
${text}
`;

  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const result = await model.generateContent(prompt);

  return result.response.text();
}

// ---------------------------------------------------
// NEW: Generate image from prompt (headshot, etc.)
// ---------------------------------------------------
export async function generateImageGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-image-1.0" });

  const result = await model.generateContent(prompt);

  // Gemini may return JSON inside text; try parsing
  try {
    return JSON.parse(result.response.text());
  } catch {
    // fallback: return raw text
    return result.response.text();
  }
}
