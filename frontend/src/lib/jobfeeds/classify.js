// Deterministic, fast classification of a raw job item into the AggregatedJob
// filter fields. No AI call needed for bulk ingest (AI is used later for deep
// enrichment / ranking). Keeps cost at zero for the high-volume path.

const INDUSTRY_RULES = [
  [/software|developer|\bIT\b|programmer|engineer|devops|data scien|full.?stack|frontend|backend/i, "IT / Software"],
  [/bank|finance|account|audit|\bCA\b|loan|insurance|nbfc/i, "Banking / Finance"],
  [/teacher|teaching|professor|lecturer|faculty|education|\bTET\b/i, "Education"],
  [/doctor|nurse|medical|hospital|pharma|health|clinic/i, "Healthcare"],
  [/sales|marketing|business develop|\bBDM\b|telecalling/i, "Sales / Marketing"],
  [/civil|mechanical|electrical|construction|site engineer|\bAE\b\b/i, "Engineering / Core"],
  [/police|army|navy|defence|constable|\bSI\b/i, "Defence / Police"],
  [/driver|delivery|logistics|warehouse|supply chain/i, "Logistics"],
  [/\bHR\b|recruit|talent acquisition|admin/i, "HR / Admin"],
  [/designer|\bUX\b|\bUI\b|graphic|creative/i, "Design"],
  [/customer support|\bBPO\b|call center|call centre|telecaller/i, "BPO / Support"],
  [/retail|store|cashier|merchandis/i, "Retail"],
];

const TYPE_RULES = [
  [/internship|intern\b/i, "Internship"],
  [/part.?time/i, "Part-time"],
  [/contract|contractual/i, "Contract"],
  [/freelance/i, "Freelance"],
  [/temporary|temp\b/i, "Temporary"],
  [/full.?time|permanent|regular/i, "Full-time"],
];

const QUALIFICATION_RULES = [
  [/\bph\.?d\b|doctorate/i, "PhD"],
  [/post.?grad|\bPG\b|\bM\.?(tech|sc|com|a|ba|ca)\b|master/i, "Post Graduate"],
  [/graduate|bachelor|\bB\.?(tech|sc|com|a|ba|ca|e)\b|\bany degree\b/i, "Graduate"],
  [/diploma|\bITI\b|polytechnic/i, "Diploma / ITI"],
  [/12th|intermediate|\bHSC\b|higher secondary/i, "12th Pass"],
  [/10th|matric|\bSSC\b|secondary/i, "10th Pass"],
];

export function classifyIndustry(text = "") {
  for (const [re, v] of INDUSTRY_RULES) if (re.test(text)) return v;
  return "Other";
}

export function classifyEmploymentType(text = "", fallback = "Full-time") {
  for (const [re, v] of TYPE_RULES) if (re.test(text)) return v;
  return fallback;
}

export function classifyQualification(text = "") {
  for (const [re, v] of QUALIFICATION_RULES) if (re.test(text)) return undefined ?? v; // first match
  return undefined;
}

// Experience: pull a year range / fresher hint from text.
export function detectExperience(text = "") {
  if (/fresher|no experience|entry.?level|0\s*-?\s*1\s*year/i.test(text)) return "Fresher / Entry";
  const m = text.match(/(\d{1,2})\s*[-–to]+\s*(\d{1,2})\s*year/i);
  if (m) return `${m[1]}-${m[2]} years`;
  const plus = text.match(/(\d{1,2})\+?\s*year/i);
  if (plus) return `${plus[1]}+ years`;
  return undefined;
}

// Public apply-contact extraction — ONLY posting-level public info.
// Returns { email, phone, applyUrl } where present. Never extracts named
// individuals' private data; only generic inboxes / desks shown on the listing.
const GENERIC_INBOX = /\b((careers?|jobs?|hr|recruit(ment)?|hiring|apply|info|contact)@[a-z0-9.-]+\.[a-z]{2,})\b/i;

export function extractApplyContact(text = "", link = "") {
  const out = {};
  const email = text.match(GENERIC_INBOX);
  if (email) out.email = email[1].toLowerCase();
  // Indian phone (10-digit, optional +91) — only if clearly published on the listing.
  const phone = text.match(/(?:\+?91[-\s]?)?[6-9]\d{9}\b/);
  if (phone) out.phone = phone[0];
  if (link) out.applyUrl = link;
  return out;
}

// Reuse the same Indian-state detection idea for job location → state.
const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];
const CITY_TO_STATE = {
  Mumbai: "Maharashtra", Pune: "Maharashtra", Nagpur: "Maharashtra",
  Bengaluru: "Karnataka", Bangalore: "Karnataka", Mysore: "Karnataka",
  Chennai: "Tamil Nadu", Coimbatore: "Tamil Nadu",
  Hyderabad: "Telangana", Kolkata: "West Bengal", Ahmedabad: "Gujarat", Surat: "Gujarat",
  Jaipur: "Rajasthan", Lucknow: "Uttar Pradesh", Noida: "Uttar Pradesh", Patna: "Bihar",
  Kochi: "Kerala", Bhopal: "Madhya Pradesh", Indore: "Madhya Pradesh", Chandigarh: "Punjab",
  Gurgaon: "Haryana", Gurugram: "Haryana", "New Delhi": "Delhi",
};

export function detectLocation(text = "") {
  for (const [city, state] of Object.entries(CITY_TO_STATE)) {
    if (new RegExp(`\\b${city}\\b`, "i").test(text)) return { location: city, state };
  }
  for (const s of STATES) if (new RegExp(s, "i").test(text)) return { location: s, state: s };
  return { location: undefined, state: undefined };
}
