import crypto from "crypto";
import Parser from "rss-parser";
import connectMongo from "../mongodb.js";
import Exam from "../../models/Exam.js";
import { FEED_SOURCES } from "./sources.js";
import { classifyCategory, classifySource, detectState } from "./classify.js";

const parser = new Parser({ timeout: 15000, headers: { "User-Agent": "Mozilla/5.0 (compatible; ExamFeedBot/1.0)" } });

const NATIONAL_SOURCES = ["UPSC", "SSC", "IBPS", "SBI", "RBI", "Railway", "Defence", "PSU", "Apprenticeship", "Skill Mission"];

const AUTHORITY_MAP = {
  UPSC: "Union Public Service Commission (UPSC)",
  SSC: "Staff Selection Commission (SSC)",
  IBPS: "Institute of Banking Personnel Selection (IBPS)",
  SBI: "State Bank of India (SBI)",
  RBI: "Reserve Bank of India (RBI)",
  Railway: "Railway Recruitment Board (RRB)",
  "State PSC": "State Public Service Commission",
  Defence: "Defence Recruitment",
  Teaching: "Teaching Recruitment Board",
  Police: "Police Recruitment Board",
  University: "Government University",
  PSU: "Public Sector Undertaking",
  Apprenticeship: "Apprenticeship Portal",
  "Skill Mission": "Skill Development Mission",
  "Employment Exchange": "Employment Exchange",
  Other: "Government Recruitment",
};

const OFFICIAL_WEBSITE_MAP = {
  UPSC: "https://upsc.gov.in",
  SSC: "https://ssc.gov.in",
  IBPS: "https://www.ibps.in",
  SBI: "https://sbi.co.in/web/careers",
  RBI: "https://opportunities.rbi.org.in",
  Railway: "https://www.rrbcdg.gov.in",
  Defence: "https://joinindianarmy.nic.in",
  Teaching: "https://www.education.gov.in",
  PSU: "https://www.ncs.gov.in",
  Apprenticeship: "https://www.apprenticeshipindia.gov.in",
  "Skill Mission": "https://www.skillindia.gov.in",
  "Employment Exchange": "https://www.ncs.gov.in",
};

const STATE_PORTAL_MAP = {
  "Andhra Pradesh": "https://psc.ap.gov.in",
  "Assam": "https://apsc.nic.in",
  "Bihar": "https://bpsc.bih.nic.in",
  "Chhattisgarh": "https://psc.cg.gov.in",
  "Delhi": "https://dsssb.delhi.gov.in",
  "Gujarat": "https://gpsc.gujarat.gov.in",
  "Haryana": "https://www.hssc.gov.in",
  "Himachal Pradesh": "https://www.hppsc.hp.gov.in",
  "Jharkhand": "https://www.jpsc.gov.in",
  "Karnataka": "https://kpsc.kar.nic.in",
  "Kerala": "https://www.keralapsc.gov.in",
  "Madhya Pradesh": "https://www.mppsc.mp.gov.in",
  "Maharashtra": "https://www.mpsc.gov.in",
  "Odisha": "https://www.opsc.gov.in",
  "Punjab": "https://ppsc.gov.in",
  "Rajasthan": "https://rpsc.rajasthan.gov.in",
  "Tamil Nadu": "https://www.tnpsc.gov.in",
  "Telangana": "https://www.tspsc.gov.in",
  "Uttar Pradesh": "https://uppsc.up.nic.in",
  "Uttarakhand": "https://ukpsc.gov.in",
  "West Bengal": "https://www.pscwbonline.gov.in",
};

// Google News titles end with " - Publisher"; aggregators add trailing noise.
function cleanTitle(raw = "") {
  let t = raw.replace(/\s+/g, " ").trim();
  t = t.replace(/\s+-\s+[^-]{2,40}$/, ""); // strip trailing " - Publisher"
  return t.trim();
}

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 90);

const hashOf = (s) => crypto.createHash("md5").update(s.toLowerCase().trim()).digest("hex");

async function uniqueSlug(base) {
  let slug = slugify(base) || `exam-${Date.now()}`;
  let n = 1;
  while (await Exam.exists({ slug })) slug = `${slugify(base)}-${n++}`;
  return slug;
}

// Skip obvious non-exam / listicle / "how to" noise.
function looksLikeNoise(title) {
  return (
    title.length < 12 ||
    /^how to|^what is|^top \d+|^best |listicle/i.test(title) ||
    /google news/i.test(title)
  );
}

/**
 * Run all enabled feed sources → normalize → dedupe → save as live exams.
 * @param {object} opts { perFeedLimit, autoPublish }
 * @returns {object} stats
 */
export async function runImport({ perFeedLimit = 25, autoPublish = true } = {}) {
  await connectMongo();

  const stats = { scanned: 0, added: 0, duplicates: 0, skipped: 0, perSource: {}, errors: [] };

  for (const src of FEED_SOURCES) {
    if (!src.enabled || src.kind !== "rss") continue;
    stats.perSource[src.id] = { added: 0, duplicates: 0, skipped: 0 };

    let feed;
    try {
      feed = await parser.parseURL(src.url);
    } catch (e) {
      stats.errors.push(`${src.id}: ${e.message}`);
      continue;
    }

    const items = (feed.items || []).slice(0, perFeedLimit);
    for (const item of items) {
      stats.scanned++;
      const title = cleanTitle(item.title || "");
      const snippet = (item.contentSnippet || item.content || "").replace(/\s+/g, " ").trim().slice(0, 400);
      const link = item.link || item.guid || "";

      if (looksLikeNoise(title) || !link) {
        stats.skipped++; stats.perSource[src.id].skipped++; continue;
      }

      const dedupeHash = hashOf(title);
      if (await Exam.exists({ dedupeHash })) {
        stats.duplicates++; stats.perSource[src.id].duplicates++; continue;
      }

      const blob = `${title} ${snippet}`;
      const source = classifySource(blob);
      const category = classifyCategory(blob);
      // Tag a specific state if detectable, else mark national-board exams "All India".
      const state = detectState(blob) || (NATIONAL_SOURCES.includes(source) ? "All India" : undefined);

      const officialSite = OFFICIAL_WEBSITE_MAP[source]
        || (state && STATE_PORTAL_MAP[state])
        || "https://www.ncs.gov.in";

      try {
        await Exam.create({
          name: title,
          conductingAuthority: AUTHORITY_MAP[source] || AUTHORITY_MAP.Other,
          summary: snippet || undefined,
          category,
          source,
          state,
          applyLink: officialSite,
          officialWebsite: officialSite,
          slug: await uniqueSlug(title),
          status: autoPublish ? "live" : "pending",
          ingestSource: "rss",
          sourceId: item.guid || link,
          sourceUrl: link,
          dedupeHash,
          lastSyncedAt: new Date(),
          tags: ["feed-import"],
        });
        stats.added++; stats.perSource[src.id].added++;
      } catch (e) {
        // Likely a duplicate slug/sourceId race — count as dup, don't crash the run.
        stats.duplicates++; stats.perSource[src.id].duplicates++;
      }
    }
  }

  return stats;
}
