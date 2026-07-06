// import { NextResponse } from "next/server";
// import mammoth from "mammoth";
// import { createRequire } from "module";

// const require = createRequire(import.meta.url);
// const pdf = require("pdf-parse-fork");

// export async function POST(req) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file");

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());
//     let extractedText = "";
//     const fileName = file.name.toLowerCase();

//     // ૧. ટેક્સ્ટ એક્સટ્રેક્ટ કરવાનું લોજિક (PDF & DOCX Support)
//     try {
//       if (fileName.endsWith(".pdf")) {
//         const data = await pdf(buffer);
//         extractedText = data.text;
//       } else if (fileName.endsWith(".docx")) {
//         const result = await mammoth.extractRawText({ buffer: buffer });
//         extractedText = result.value;
//       } else {
//         return NextResponse.json({ error: "Only PDF/DOCX formats are supported" }, { status: 400 });
//       }
//     } catch (parseErr) {
//       console.error("Library parsing error:", parseErr);
//       return NextResponse.json({ success: false, error: "Failed to read file format." }, { status: 500 });
//     }

//     if (!extractedText || !extractedText.trim()) {
//       return NextResponse.json({ success: false, error: "File is empty." }, { status: 400 });
//     }

//     // ૨. AI (OpenRouter) કોલ કરો
//     const prompt = `Extract ALL Job and Company details from the text below. 
//     Return ONLY a valid JSON object. Do not include markdown, backticks, or any text before/after the JSON.

//     Text: "${extractedText.substring(0, 5000)}" 

//     Return this exact JSON structure:
//     {
//       "job": { 
//         "title": "", "category": "", "jobType": "Full-time", "location": "", 
//         "salaryRange": "", "experienceLevel": "", "description": "", "requirements": "", 
//         "deadline": "", "industry": "", "profession": "", "designation": "", "department": "" 
//       },
//       "company": { 
//         "companyName": "", "tagline": "", "industry": "", "department": "", 
//         "profession": "", "designation": "", "website": "", "email": "", 
//         "mobile": "", "location": "", "address": "", "companySize": "", 
//         "founded": "", "description": "", "specialties": "",
//         "contactPersonName": "", "contactPersonNumber": "", "contactPersonEmail": "",
//         "ownerName": "", "ownerNumber": "", "ownerEmail": ""
//       }
//     }`;

//     const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
//         "Content-Type": "application/json",
//         "HTTP-Referer": "http://localhost:3000",
//         "X-Title": "Job Portal",
//       },
//       body: JSON.stringify({
//         "model": "google/gemini-2.0-flash-001",
//         "messages": [{ "role": "user", "content": prompt }],
//         "temperature": 0.1,
//         "response_format": { "type": "json_object" }
//       })
//     });

//     const aiData = await aiRes.json();
//     if (!aiRes.ok) throw new Error(aiData.error?.message || "AI Analysis Failed");

//     let aiContent = aiData.choices[0].message.content.trim();

//     // --- JSON Extraction Fix ---
//     let parsedData = {};
//     try {
//       // JSON ના ફોર્મેટને જ પકડવા માટે Regex
//       const startIdx = aiContent.indexOf('{');
//       const endIdx = aiContent.lastIndexOf('}');

//       if (startIdx !== -1 && endIdx !== -1) {
//         const jsonString = aiContent.substring(startIdx, endIdx + 1);
//         parsedData = JSON.parse(jsonString);
//       } else {
//         parsedData = JSON.parse(aiContent);
//       }
//     } catch (jsonErr) {
//       console.error("JSON Clean Error:", jsonErr.message);
//       throw new Error("AI returned invalid JSON format. Please try again.");
//     }

//     return NextResponse.json({
//       success: true,
//       text: extractedText.trim(),
//       aiData: parsedData
//     });

//   } catch (error) {
//     console.error("CRITICAL_ERROR:", error.message);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse-fork");

export async function POST(req) {
  try {
    // --- SAFETY CHECK: Content-Type ચેક ઉમેર્યો જેથી સર્વર ક્રેશ ના થાય ---
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({
        success: false,
        error: "Invalid Content-Type. Please upload a file using FormData."
      }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";
    const fileName = file.name.toLowerCase();

    // ૧. ટેક્સ્ટ એક્સટ્રેક્ટ કરવાનું લોજિક (PDF & DOCX Support)
    try {
      if (fileName.endsWith(".pdf")) {
        const data = await pdf(buffer);
        extractedText = data.text;
      } else if (fileName.endsWith(".docx")) {
        const result = await mammoth.extractRawText({ buffer: buffer });
        extractedText = result.value;
      } else {
        return NextResponse.json({ error: "Only PDF/DOCX formats are supported" }, { status: 400 });
      }
    } catch (parseErr) {
      //console.error("Library parsing error:", parseErr);
      return NextResponse.json({ success: false, error: "Failed to read file format." }, { status: 500 });
    }

    if (!extractedText || !extractedText.trim()) {
      return NextResponse.json({ success: false, error: "File is empty." }, { status: 400 });
    }

    // ૨. AI (OpenRouter) કોલ કરો
    const prompt = `Extract ALL Job and Company details from the text below. 
    Return ONLY a valid JSON object. Do not include markdown, backticks, or any text before/after the JSON.
    
    Text: "${extractedText.substring(0, 5000)}" 

    Return this exact JSON structure:
    {
      "job": { 
        "title": "", "category": "", "jobType": "Full-time", "location": "", 
        "salaryRange": "", "experienceLevel": "", "description": "", "requirements": "", 
        "deadline": "", "industry": "", "profession": "", "designation": "", "department": "" 
      },
      "company": { 
        "companyName": "", "tagline": "", "industry": "", "department": "", 
        "profession": "", "designation": "", "website": "", "email": "", 
        "mobile": "", "location": "", "address": "", "companySize": "", 
        "founded": "", "description": "", "specialties": "",
        "contactPersonName": "", "contactPersonNumber": "", "contactPersonEmail": "",
        "ownerName": "", "ownerNumber": "", "ownerEmail": ""
      }
    }`;

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Job Portal",
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001",
        "messages": [{ "role": "user", "content": prompt }],
        "temperature": 0.1,
        "response_format": { "type": "json_object" }
      })
    });

    const aiData = await aiRes.json();
    if (!aiRes.ok) throw new Error(aiData.error?.message || "AI Analysis Failed");

    let aiContent = aiData.choices[0].message.content.trim();

    // --- JSON Extraction Fix ---
    let parsedData = {};
    try {
      const startIdx = aiContent.indexOf('{');
      const endIdx = aiContent.lastIndexOf('}');

      if (startIdx !== -1 && endIdx !== -1) {
        const jsonString = aiContent.substring(startIdx, endIdx + 1);
        parsedData = JSON.parse(jsonString);
      } else {
        parsedData = JSON.parse(aiContent);
      }
    } catch (jsonErr) {
      //console.error("JSON Clean Error:", jsonErr.message);
      throw new Error("AI returned invalid JSON format. Please try again.");
    }

    return NextResponse.json({
      success: true,
      text: extractedText.trim(),
      aiData: parsedData
    });

  } catch (error) {
    //console.error("CRITICAL_ERROR:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}