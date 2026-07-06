// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { NextResponse } from "next/server";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// export async function POST(req) {
//   try {
//     const { rawText } = await req.json();
//     if (!rawText) return NextResponse.json({ error: "No text provided" }, { status: 400 });

//     const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

//     const prompt = `
//       Extract Job and Company details from the text below. 
//       Return ONLY a JSON object. No markdown, no backticks.
      
//       Text: "${rawText.substring(0, 5000)}" 

//       Structure:
//       {
//         "job": { 
//           "title": "", 
//           "category": "", 
//           "jobType": "Full-time", 
//           "location": "", 
//           "salaryRange": "", 
//           "experienceLevel": "",
//           "description": "" 
//         },
//         "company": { 
//           "name": "", 
//           "industry": "", 
//           "website": "" 
//         }
//       }
//     `;

//     const result = await model.generateContent(prompt);
//     let text = result.response.text().trim();
    
//     if (text.includes("{")) {
//         text = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
//     }
    
//     return NextResponse.json(JSON.parse(text));
//   } catch (err) {
//     console.error("AI_ERROR:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { rawText } = await req.json();
    if (!rawText) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    const prompt = `Extract ALL Job and Company details from the text below. 
    Return ONLY a valid JSON object. Do not include markdown or backticks.
    
    Text: "${rawText.substring(0, 4000)}" 

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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
      })
    });

    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error?.message || "AI Fetch Failed");

    let aiContent = data.choices[0].message.content.trim();
    
    // ક્લીનિંગ: જો AI માર્કડાઉન મોકલે (```json ... ```) તો તેને દૂર કરવા
    if (aiContent.startsWith("```")) {
      aiContent = aiContent.replace(/```json|```/g, "").trim();
    }

    return NextResponse.json(JSON.parse(aiContent));
  } catch (err) {
    console.error("AI_API_ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}