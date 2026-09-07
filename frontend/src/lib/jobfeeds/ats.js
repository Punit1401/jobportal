// Public ATS (Applicant Tracking System) job-board adapter.
//
// Greenhouse and Lever expose PUBLIC job-board endpoints (the same data that
// powers each company's own "Careers" page) — no API key, no signup. These
// return REAL structured job listings (title, location, company, apply URL).
//
// To add a company: find its ATS board slug and add it to ATS_COMPANIES.
//   Greenhouse: https://boards-api.greenhouse.io/v1/boards/{slug}/jobs
//   Lever:      https://api.lever.co/v0/postings/{slug}?mode=json

export const ATS_COMPANIES = [
  // Greenhouse boards with India roles
  { slug: "databricks", name: "Databricks", ats: "greenhouse" },
  { slug: "phonepe", name: "PhonePe", ats: "greenhouse" },
  { slug: "mongodb", name: "MongoDB", ats: "greenhouse" },
  { slug: "stripe", name: "Stripe", ats: "greenhouse" },
  { slug: "twilio", name: "Twilio", ats: "greenhouse" },
  { slug: "postman", name: "Postman", ats: "greenhouse" },
  { slug: "gitlab", name: "GitLab", ats: "greenhouse" },
  { slug: "groww", name: "Groww", ats: "greenhouse" },
  { slug: "airbnb", name: "Airbnb", ats: "greenhouse" },
  { slug: "samsara", name: "Samsara", ats: "greenhouse" },
  { slug: "druva", name: "Druva", ats: "greenhouse" },
  { slug: "coinbase", name: "Coinbase", ats: "greenhouse" },
  { slug: "scaleai", name: "Scale AI", ats: "greenhouse" },
  { slug: "flexport", name: "Flexport", ats: "greenhouse" },
  { slug: "figma", name: "Figma", ats: "greenhouse" },
  { slug: "cloudflare", name: "Cloudflare", ats: "greenhouse" },
  { slug: "razorpay", name: "Razorpay", ats: "greenhouse" },
  { slug: "cred", name: "CRED", ats: "greenhouse" },
  { slug: "meesho", name: "Meesho", ats: "greenhouse" },
  { slug: "notion", name: "Notion", ats: "greenhouse" },
  { slug: "canva", name: "Canva", ats: "greenhouse" },
  { slug: "zomato", name: "Zomato", ats: "greenhouse" },
  { slug: "swiggy", name: "Swiggy", ats: "greenhouse" },
  { slug: "dream11", name: "Dream11", ats: "greenhouse" },
  { slug: "freshworks", name: "Freshworks", ats: "greenhouse" },
  { slug: "chargebee", name: "Chargebee", ats: "greenhouse" },
  { slug: "browserstack", name: "BrowserStack", ats: "greenhouse" },
  // Lever boards with India roles
  { slug: "atlassian", name: "Atlassian", ats: "lever" },
];

// Keep only India-based roles (these boards are global).
const INDIA_HINTS = /\bindia\b|bengaluru|bangalore|mumbai|pune|hyderabad|chennai|gurugram|gurgaon|noida|new delhi|\bdelhi\b|kolkata|ahmedabad|jaipur|kochi|remote\s*[-–]\s*india/i;

export function isIndiaLocation(loc = "") {
  return INDIA_HINTS.test(loc);
}

async function fetchGreenhouse(company) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${company.slug}/jobs`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Greenhouse ${res.status}`);
  const data = await res.json();
  return (data.jobs || []).map((j) => ({
    title: (j.title || "").trim(),
    company: company.name,
    location: j.location?.name || "",
    applyUrl: j.absolute_url || "",
    postedDate: j.updated_at ? new Date(j.updated_at) : new Date(),
    sourceId: j.id ? `gh_${company.slug}_${j.id}` : undefined,
  }));
}

async function fetchLever(company) {
  const url = `https://api.lever.co/v0/postings/${company.slug}?mode=json`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Lever ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((j) => ({
    title: (j.text || "").trim(),
    company: company.name,
    location: j.categories?.location || "",
    department: j.categories?.team || j.categories?.department || "",
    employmentType: j.categories?.commitment || "",
    description: (j.descriptionPlain || "").slice(0, 1000),
    applyUrl: j.hostedUrl || j.applyUrl || "",
    postedDate: j.createdAt ? new Date(j.createdAt) : new Date(),
    sourceId: j.id ? `lever_${company.slug}_${j.id}` : undefined,
  }));
}

/**
 * Pull India job listings from all configured public ATS boards.
 * @returns {Array} normalized items (India-only)
 */
export async function fetchAtsJobs({ companies = ATS_COMPANIES, indiaOnly = true } = {}) {
  const all = [];
  for (const company of companies) {
    try {
      const items = company.ats === "lever" ? await fetchLever(company) : await fetchGreenhouse(company);
      for (const it of items) {
        if (indiaOnly && !isIndiaLocation(it.location)) continue;
        all.push({ ...it, companyMeta: company });
      }
    } catch (e) {
      console.warn(`[ATS] ${company.ats}/${company.slug} failed: ${e.message}`);
    }
  }
  return all;
}
