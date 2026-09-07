import crypto from "crypto";
import Parser from "rss-parser";
import connectMongo from "../mongodb.js";
import GovtResource from "../../models/GovtResource.js";

// RSS supplement for the Govt Schemes & Jobs repository. Categorizes each item
// into the GovtResource categories, dedupes, and saves. Curated seeds remain
// the backbone; this keeps the lists fresh daily.
const parser = new Parser({ timeout: 15000, headers: { "User-Agent": "Mozilla/5.0 (compatible; GovtResourceBot/1.0)" } });

const googleNews = (q) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;

const SOURCES = [
  { id: "schemes", category: "Scheme", url: googleNews("government scheme benefit launched apply India") },
  { id: "internships", category: "Internship", url: googleNews("government internship apply students India") },
  { id: "training", category: "Training", url: googleNews("free government skill training certification India") },
  { id: "apprenticeships", category: "Apprenticeship", url: googleNews("apprenticeship India NAPS NATS apply ITI diploma stipend 2026") },
  { id: "apprenticeships-2", category: "Apprenticeship", url: googleNews("government apprenticeship programme India railway DRDO BHEL ONGC apply") },
];

const cleanTitle = (raw = "") =>
  raw.replace(/\s+/g, " ").trim().replace(/\s+-\s+[^-]{2,40}$/, "").trim();

const hashOf = (s) => crypto.createHash("md5").update(s.toLowerCase().trim()).digest("hex");

function looksLikeNoise(t) {
  return t.length < 12 || /^how to|^what is|^top \d+|^best |google news/i.test(t);
}

const SECTOR_RULES = [
  [/farmer|agri|kisan/i, "Agriculture"], [/student|scholar|education/i, "Education"],
  [/health|medical|ayushman/i, "Health"], [/business|loan|mudra|startup|entrepreneur/i, "Business"],
  [/housing|awas/i, "Housing"], [/pension|senior/i, "Social Security"], [/women|mahila/i, "Women Empowerment"],
];
const detectSector = (t = "") => { for (const [re, s] of SECTOR_RULES) if (re.test(t)) return s; return undefined; };

const SCHEME_PORTAL_MAP = [
  [/ayushman|pmjay/i, "https://pmjay.gov.in"],
  [/mudra|pmmy/i, "https://www.mudra.org.in"],
  [/pm\s*kisan|kisan samman/i, "https://pmkisan.gov.in"],
  [/ujjwala/i, "https://www.pmuy.gov.in"],
  [/awas|pmay/i, "https://pmaymis.gov.in"],
  [/sukanya/i, "https://www.india.gov.in/sukanya-samriddhi-yojna"],
  [/stand\s*up|startup|stand-up/i, "https://www.standupmitra.in"],
  [/scholarship|vidyalakshmi/i, "https://www.vidyalakshmi.co.in"],
  [/skill india|pmkvy/i, "https://www.skillindia.gov.in"],
  [/\bNAPS\b|national apprenticeship promotion/i, "https://www.apprenticeshipindia.gov.in"],
  [/\bNATS\b|national apprenticeship training/i, "https://nats.education.gov.in"],
  [/apprentice/i, "https://www.apprenticeshipindia.gov.in"],
  [/ncs|national career/i, "https://www.ncs.gov.in"],
  [/internship/i, "https://internship.aicte-india.org"],
];

function resolveSchemePortal(text = "") {
  for (const [re, url] of SCHEME_PORTAL_MAP) if (re.test(text)) return url;
  return "https://www.myscheme.gov.in";
}

/**
 * Pull govt resources from RSS → categorize → dedupe → save.
 * @param {object} opts { perFeedLimit, autoPublish }
 */
export async function runGovtResourceImport({ perFeedLimit = 20, autoPublish = false } = {}) {
  await connectMongo();
  const stats = { scanned: 0, added: 0, duplicates: 0, skipped: 0, perSource: {}, errors: [] };

  for (const src of SOURCES) {
    stats.perSource[src.id] = { added: 0, duplicates: 0, skipped: 0 };
    let feed;
    try { feed = await parser.parseURL(src.url); }
    catch (e) { stats.errors.push(`${src.id}: ${e.message}`); continue; }

    for (const item of (feed.items || []).slice(0, perFeedLimit)) {
      stats.scanned++;
      const title = cleanTitle(item.title || "");
      const link = item.link || item.guid || "";
      const snippet = (item.contentSnippet || "").replace(/\s+/g, " ").trim().slice(0, 300);

      if (looksLikeNoise(title) || !link) { stats.skipped++; stats.perSource[src.id].skipped++; continue; }

      const sourceId = `gr_${hashOf(title)}`;
      if (await GovtResource.exists({ $or: [{ sourceId }, { title }] })) {
        stats.duplicates++; stats.perSource[src.id].duplicates++; continue;
      }

      const blob = `${title} ${snippet}`;
      const officialLink = resolveSchemePortal(blob);

      try {
        await GovtResource.create({
          title,
          description: snippet || `${src.category} — see official source for details.`,
          eligibility: "See official source",
          applyLink: officialLink,
          category: src.category,
          sector: detectSector(blob),
          status: autoPublish ? "live" : "pending",
          source: "ai-fetch",
          sourceId,
          sourceUrl: link,
          relatedSectors: ["rss-import"],
        });
        stats.added++; stats.perSource[src.id].added++;
      } catch {
        stats.duplicates++; stats.perSource[src.id].duplicates++;
      }
    }
  }
  return stats;
}
