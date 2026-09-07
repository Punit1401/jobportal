import { NextResponse } from "next/server";
import { fetchWithFallback } from "@/lib/ai-fallback";

// POST { text } — raw notification text pasted by the admin.
// Returns structured Exam fields extracted by AI (admin reviews before saving).
export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 30) {
      return NextResponse.json(
        { success: false, error: "Please paste the notification text (at least a few sentences)." },
        { status: 400 }
      );
    }

    const system = {
      role: "system",
      content:
        "You are a data-extraction engine for Indian government exam notifications. " +
        "You output ONLY valid minified JSON — no markdown, no commentary, no code fences.",
    };

    const user = {
      role: "user",
      content: `Extract the following fields from this government exam/recruitment notification.
Return a SINGLE JSON object with EXACTLY these keys. Use null (not "") when a value is genuinely not present. Dates MUST be ISO format "YYYY-MM-DD" or null. Numbers must be plain integers (no commas).

{
  "name": string,
  "conductingAuthority": string,
  "advertisementNumber": string|null,
  "category": one of ["Job Notification","Upcoming Exam","Admit Card","Result","Answer Key","Counselling","Document Verification","Application Deadline","Correction Window","Interview Schedule"],
  "source": one of ["UPSC","SSC","IBPS","SBI","RBI","Railway","State PSC","Defence","Teaching","Police","University","PSU","Apprenticeship","Skill Mission","Employment Exchange","Other"],
  "department": string|null,
  "state": string|null,
  "qualification": string|null,
  "eligibilityConditions": string|null,
  "ageLimit": string|null,
  "reservationDetails": string|null,
  "nationality": string|null,
  "experience": string|null,
  "vacancyCount": integer|null,
  "salaryStructure": string|null,
  "jobLocation": string|null,
  "selectionProcedure": string|null,
  "examPattern": string|null,
  "negativeMarking": string|null,
  "syllabus": string|null,
  "applicationFees": string|null,
  "paymentMethods": string|null,
  "requiredDocuments": string[]|null,
  "helpdeskInfo": string|null,
  "officialWebsite": string|null,
  "applyLink": string|null,
  "keyDates": {
    "applicationStart": date|null,
    "applicationEnd": date|null,
    "correctionWindowEnd": date|null,
    "admitCardDate": date|null,
    "examDate": date|null,
    "answerKeyDate": date|null,
    "resultDate": date|null,
    "interviewDate": date|null
  }
}

Pick "category" based on what the notification is primarily about (e.g. a result announcement => "Result"). Infer "source" from the conducting authority. Do not invent data.

NOTIFICATION TEXT:
"""
${text.slice(0, 12000)}
"""`,
    };

    const raw = await fetchWithFallback([system, user], 0.1);

    // Strip any stray code fences / prose the model may add.
    let jsonStr = raw.trim();
    const fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) jsonStr = fence[1].trim();
    const first = jsonStr.indexOf("{");
    const last = jsonStr.lastIndexOf("}");
    if (first !== -1 && last !== -1) jsonStr = jsonStr.slice(first, last + 1);

    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { success: false, error: "AI returned an unreadable response. Try again or edit manually." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Exam AI Extract Error:", error);
    return NextResponse.json(
      { success: false, error: "AI extraction failed. Please try again." },
      { status: 500 }
    );
  }
}
