import crypto from "crypto";
import Parser from "rss-parser";
import connectMongo from "../mongodb.js";
import AggregatedJob from "../../models/AggregatedJob.js";
import { JOB_FEED_SOURCES } from "./sources.js";
import {
  classifyIndustry, classifyEmploymentType, classifyQualification,
  detectExperience, extractApplyContact, detectLocation,
} from "./classify.js";
import { fetchAtsJobs } from "./ats.js";

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; JobAggregatorBot/1.0)" },
});

function cleanTitle(raw = "") {
  let t = raw.replace(/\s+/g, " ").trim();
  t = t.replace(/\s+-\s+[^-]{2,40}$/, ""); // strip trailing " - Publisher"
  return t.trim();
}

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 90);

const hashOf = (s) => crypto.createHash("md5").update(s.toLowerCase().trim()).digest("hex");

async function uniqueSlug(base) {
  let slug = slugify(base) || `job-${Date.now()}`;
  let n = 1;
  while (await AggregatedJob.exists({ slug })) slug = `${slugify(base)}-${n++}`;
  return slug;
}

function looksLikeNoise(title) {
  return (
    title.length < 12 ||
    /^how to|^what is|^top \d+|^best |listicle|salary in india$/i.test(title) ||
    /google news/i.test(title)
  );
}

// Try to pull a company name out of "Job Title at Company" / "Company hiring …".
function guessCompany(title, snippet) {
  const at = title.match(/\bat\s+([A-Z][A-Za-z0-9&.\- ]{2,40})/);
  if (at) return at[1].trim();
  const hiring = `${title} ${snippet}`.match(/([A-Z][A-Za-z0-9&.\- ]{2,40})\s+(?:is\s+)?hiring/);
  if (hiring) return hiring[1].trim();
  return "";
}

/**
 * Pull real structured jobs from public company ATS boards (Greenhouse/Lever),
 * India-only → classify → dedupe → save. No API key required.
 * @param {object} opts { autoPublish }
 */
export async function runAtsJobImport({ autoPublish = true } = {}) {
  await connectMongo();
  const stats = { scanned: 0, added: 0, duplicates: 0, skipped: 0, perCompany: {}, errors: [] };

  let items;
  try {
    items = await fetchAtsJobs({ indiaOnly: true });
  } catch (e) {
    stats.errors.push(e.message);
    return stats;
  }

  for (const it of items) {
    stats.scanned++;
    const cName = it.companyMeta?.name || it.company || "Company";
    stats.perCompany[cName] = stats.perCompany[cName] || { added: 0, duplicates: 0 };

    const title = it.title;
    if (!title || !it.applyUrl) { stats.skipped++; continue; }

    // Dedupe on company + title (same role across refreshes).
    const dedupeHash = hashOf(`${cName} ${title}`);
    if (await AggregatedJob.exists({ dedupeHash })) {
      stats.duplicates++; stats.perCompany[cName].duplicates++; continue;
    }

    const blob = `${title} ${it.department || ""} ${it.description || ""}`;
    const { location, state } = detectLocation(`${it.location} ${blob}`);

    try {
      await AggregatedJob.create({
        title,
        slug: await uniqueSlug(`${cName}-${title}`),
        company: cName,
        summary: it.description ? it.description.slice(0, 400) : `${title} at ${cName}`,
        description: it.description || undefined,
        industry: classifyIndustry(blob),
        experience: detectExperience(blob),
        qualification: classifyQualification(blob),
        location: location || it.location,
        state,
        employmentType: classifyEmploymentType(`${it.employmentType || ""} ${blob}`, "Full-time"),
        sourceType: "Company Career Page",
        applyContact: { applyUrl: it.applyUrl },
        postedDate: it.postedDate || new Date(),
        status: autoPublish ? "live" : "pending",
        ingestSource: "scraper",
        sourceId: it.sourceId,
        sourceUrl: it.applyUrl,
        sourceLabel: `${cName} Careers`,
        dedupeHash,
        lastSyncedAt: new Date(),
        tags: ["ats-import"],
      });
      stats.added++; stats.perCompany[cName].added++;
    } catch {
      stats.duplicates++; stats.perCompany[cName].duplicates++;
    }
  }

  return stats;
}

/**
 * Run all enabled RSS job sources → normalize → classify → dedupe → save.
 * @param {object} opts { perFeedLimit, autoPublish }
 */
export async function runJobImport({ perFeedLimit = 25, autoPublish = false } = {}) {
  await connectMongo();
  const stats = { scanned: 0, added: 0, duplicates: 0, skipped: 0, perSource: {}, errors: [] };

  for (const src of JOB_FEED_SOURCES) {
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
      const snippet = (item.contentSnippet || item.content || "").replace(/\s+/g, " ").trim().slice(0, 500);
      const link = item.link || item.guid || "";

      if (looksLikeNoise(title) || !link) {
        stats.skipped++; stats.perSource[src.id].skipped++; continue;
      }

      const dedupeHash = hashOf(title);
      if (await AggregatedJob.exists({ dedupeHash })) {
        stats.duplicates++; stats.perSource[src.id].duplicates++; continue;
      }

      const blob = `${title} ${snippet}`;
      const { location, state } = detectLocation(blob);

      try {
        await AggregatedJob.create({
          title,
          slug: await uniqueSlug(title),
          company: guessCompany(title, snippet),
          summary: snippet || undefined,
          industry: classifyIndustry(blob),
          experience: detectExperience(blob),
          qualification: classifyQualification(blob),
          location,
          state,
          employmentType: classifyEmploymentType(blob, src.sourceType === "Internship Portal" ? "Internship" : "Full-time"),
          sourceType: src.sourceType,
          applyContact: extractApplyContact(blob, link),
          postedDate: item.isoDate ? new Date(item.isoDate) : new Date(),
          status: autoPublish ? "live" : "pending",
          ingestSource: "rss",
          sourceId: item.guid || link,
          sourceUrl: link,
          sourceLabel: src.label,
          dedupeHash,
          lastSyncedAt: new Date(),
          tags: ["feed-import"],
        });
        stats.added++; stats.perSource[src.id].added++;
      } catch {
        stats.duplicates++; stats.perSource[src.id].duplicates++;
      }
    }
  }

  return stats;
}
