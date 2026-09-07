import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import BulkVacancy from "@/models/BulkVacancy";
import EmailQueue from "@/models/EmailQueue";
import { createRequire } from "module";

const customRequire = createRequire(import.meta.url);

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    const isAdmin = session && (session.user.role === "admin" || session.user.role === "staff");

    let query = {};
    if (!isAdmin) {
      query = { isApproved: true };
    }

    const vacancies = await BulkVacancy.find(query).sort({ createdAt: -1 });
    return NextResponse.json(vacancies);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const isAdmin = session.user.role === "admin" || session.user.role === "staff";

    // Set expiry to 2 months from now
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 2);

    // Detect fileType if not provided
    let fileType = data.fileType || "image";
    if (data.image && (data.image.startsWith("data:application/pdf") || (data.fileName && data.fileName.endsWith(".pdf")))) {
      fileType = "pdf";
    }

    const vacancy = await BulkVacancy.create({
      ...data,
      fileType,
      expiresAt,
      isApproved: isAdmin ? true : false,
      postedBy: isAdmin ? "Admin" : (session.user.name || session.user.email || "Candidate")
    });

    return NextResponse.json({ success: true, vacancy });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const { id, isApproved } = await req.json();

    let scrapedContacts = [];
    let vacancyDoc = null;

    if (isApproved) {
      vacancyDoc = await BulkVacancy.findById(id);
      if (vacancyDoc && vacancyDoc.image) {
        const isPdf = vacancyDoc.fileType === "pdf" || vacancyDoc.image.startsWith("data:application/pdf") || vacancyDoc.image.includes("%PDF");
        try {
          if (isPdf) {
            console.log(`[Scrape] File is PDF. Running PDF text & AI extraction for vacancy: ${vacancyDoc.title}`);
            scrapedContacts = await scrapeContactsFromPdf(vacancyDoc.image);
          } else {
            console.log(`[Scrape] File is Image. Running Vision AI extraction for vacancy: ${vacancyDoc.title}`);
            scrapedContacts = await scrapeContactsFromImage(vacancyDoc.image);
          }
        } catch (scrapeErr) {
          console.warn("[Scrape] Failed to scrape contacts:", scrapeErr.message);
        }
      }
    }

    const updateData = { isApproved };
    if (scrapedContacts.length > 0) {
      updateData.scrapedContacts = scrapedContacts;

      // Automatically sync scraped contacts into EmailQueue DB
      try {
        const title = vacancyDoc?.title || "Bulk Vacancy";
        const emailOps = scrapedContacts
          .filter(c => c.email && c.email.includes("@"))
          .map(c => {
            const cleanEmail = c.email.trim().toLowerCase();
            return EmailQueue.updateOne(
              { email: cleanEmail },
              {
                $set: {
                  email: cleanEmail,
                  name: c.name || "",
                  phone: c.phone || "",
                  source: `Scraped: ${title}`
                }
              },
              { upsert: true }
            );
          });

        if (emailOps.length > 0) {
          await Promise.all(emailOps);
          console.log(`[Scrape] Saved ${emailOps.length} contacts to EmailQueue DB`);
        }
      } catch (queueErr) {
        console.warn("[Scrape] Failed to sync with EmailQueue:", queueErr.message);
      }
    }

    const vacancy = await BulkVacancy.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ success: true, vacancy });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Scrape contacts from PDF file (base64 or URL)
async function scrapeContactsFromPdf(pdfData) {
  try {
    let pdfParseFn = null;
    try {
      const pdfModule = customRequire("pdf-parse-fork");
      pdfParseFn = pdfModule.default || pdfModule;
    } catch (e1) {
      try {
        const pdfModule = customRequire("pdf-parse");
        pdfParseFn = pdfModule.default || pdfModule;
      } catch (e2) {
        console.warn("[Scrape] Could not load PDF parser:", e2.message);
      }
    }

    let pdfText = "";
    if (pdfParseFn) {
      if (pdfData.startsWith("data:application/pdf;base64,")) {
        const base64Data = pdfData.replace(/^data:application\/pdf;base64,/, "");
        const pdfBuffer = Buffer.from(base64Data, "base64");
        const parsedPdf = await pdfParseFn(pdfBuffer);
        pdfText = parsedPdf.text || "";
      } else if (pdfData.startsWith("http")) {
        const res = await fetch(pdfData);
        const arrayBuffer = await res.arrayBuffer();
        const pdfBuffer = Buffer.from(arrayBuffer);
        const parsedPdf = await pdfParseFn(pdfBuffer);
        pdfText = parsedPdf.text || "";
      }
    }

    if (!pdfText.trim()) {
      console.warn("[Scrape] PDF text extraction yielded empty string, falling back to Vision AI");
      return await scrapeContactsFromImage(pdfData);
    }

    console.log(`[Scrape] PDF text extracted (${pdfText.length} chars). Analyzing with AI...`);

    // Send extracted PDF text to AI text completion model
    const textModels = [
      "meta-llama/llama-3.3-70b-instruct",
      "google/gemma-4-31b-it",
      "openai/gpt-4o-mini"
    ];

    const prompt = `You are a data extraction AI. Extract ALL contact information from this PDF text.
Extract: Full Name, Phone Number, Email Address.

PDF TEXT:
${pdfText.slice(0, 8000)}

IMPORTANT RULES:
- Extract every person/contact/recruiter you can find in the text
- Phone numbers may be in any format (with or without country code)
- If a field is not visible, use empty string ""
- Return ONLY valid JSON array, no markdown, no code blocks, no explanation

Response format (MUST be valid JSON array):
[{"name":"John Doe","phone":"9876543210","email":"john@example.com"}]

If no contacts found, return: []`;

    for (const model of textModels) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
            "X-Title": "Shivengroup Portal",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
          })
        });

        const data = await response.json();
        if (response.ok && data.choices?.[0]?.message?.content) {
          let rawText = data.choices[0].message.content.trim();
          rawText = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
          const parsed = JSON.parse(rawText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const contacts = parsed.map(c => ({
              name: (c.name || "").trim(),
              phone: (c.phone || c.phoneNumber || c.mobile || "").toString().trim(),
              email: (c.email || c.emailAddress || "").trim()
            })).filter(c => c.name || c.phone || c.email);

            if (contacts.length > 0) {
              console.log(`[Scrape] Extracted ${contacts.length} contacts from PDF using ${model}`);
              return contacts;
            }
          }
        }
      } catch (err) {
        console.warn(`[Scrape] PDF text AI model ${model} error:`, err.message);
      }
    }

    // Fallback: Regex extraction from PDF text if AI returns empty
    const emailMatches = Array.from(new Set(pdfText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []));
    const phoneMatches = Array.from(new Set(pdfText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/g) || []));

    const regexContacts = [];
    const maxLen = Math.max(emailMatches.length, phoneMatches.length);
    for (let i = 0; i < maxLen; i++) {
      if (emailMatches[i] || phoneMatches[i]) {
        regexContacts.push({
          name: "Contact " + (i + 1),
          phone: phoneMatches[i] || "",
          email: emailMatches[i] || ""
        });
      }
    }

    if (regexContacts.length > 0) {
      console.log(`[Scrape] Extracted ${regexContacts.length} contacts via Regex fallback from PDF`);
      return regexContacts;
    }

    return [];
  } catch (pdfErr) {
    console.warn("[Scrape] PDF parse error:", pdfErr.message);
    return [];
  }
}

// Scrape contacts from Image using Vision AI
async function scrapeContactsFromImage(imageData) {
  const visionModels = [
    "google/gemini-2.5-flash",
    "openai/gpt-4o-mini",
    "meta-llama/llama-4-maverick",
  ];

  const prompt = `You are a data extraction AI. Analyze this image and extract ALL contact information visible in it.
Extract: Full Name, Phone Number, Email Address.

IMPORTANT RULES:
- Extract every person/contact you can find in the image
- Phone numbers may be in any format (with or without country code)
- If a field is not visible, use empty string ""
- Return ONLY valid JSON array, no markdown, no code blocks, no explanation

Response format (MUST be valid JSON array):
[{"name":"John Doe","phone":"9876543210","email":"john@example.com"}]

If no contacts found, return: []`;

  let lastError = null;

  for (const model of visionModels) {
    try {
      console.log(`[Scrape] Trying vision model: ${model}`);

      const messages = [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageData.startsWith("data:") ? imageData : imageData,
              }
            }
          ]
        }
      ];

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
          "X-Title": "Shivengroup Portal",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.1,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Vision API failed");
      }

      let rawText = data.choices[0].message.content.trim();
      rawText = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

      const parsed = JSON.parse(rawText);

      if (Array.isArray(parsed)) {
        const contacts = parsed.map(c => ({
          name: (c.name || "").trim(),
          phone: (c.phone || c.phoneNumber || c.mobile || c.contact || "").toString().trim(),
          email: (c.email || c.emailAddress || "").trim()
        })).filter(c => c.name || c.phone || c.email);

        console.log(`[Scrape] Extracted ${contacts.length} contacts using ${model}`);
        return contacts;
      }

      return [];
    } catch (error) {
      console.warn(`[Scrape] Model ${model} failed:`, error.message);
      lastError = error;
    }
  }

  console.warn("[Scrape] All vision models failed. Last error:", lastError?.message);
  return [];
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const { id } = await req.json();
    await BulkVacancy.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
