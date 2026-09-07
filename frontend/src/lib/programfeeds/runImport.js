import crypto from "crypto";
import Parser from "rss-parser";
import connectMongo from "../mongodb.js";
import Program from "../../models/Program.js";
import { fetchWithFallback } from "../ai-fallback.js";

// AI-powered ingestion for Internship / Industrial Training / Apprenticeship.
// Each scraped item is passed through the AI to extract structured program
// fields and classify its type — "scraping done with AI".
const parser = new Parser({ timeout: 15000, headers: { "User-Agent": "Mozilla/5.0 (compatible; ProgramBot/1.0)" } });

const googleNews = (q) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;

const SOURCES = [
  { id: "internship", hint: "Internship", url: googleNews("internship program apply students stipend India") },
  { id: "industrial-training", hint: "Industrial Training", url: googleNews("industrial training vocational training program India") },
  { id: "apprenticeship", hint: "Apprenticeship", url: googleNews("apprenticeship NAPS apply trade India") },
];

const cleanTitle = (raw = "") => raw.replace(/\s+/g, " ").trim().replace(/\s+-\s+[^-]{2,40}$/, "").trim();
const hashOf = (s) => crypto.createHash("md5").update(s.toLowerCase().trim()).digest("hex");
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 90);
async function uniqueSlug(base) {
  let slug = slugify(base) || `program-${Date.now()}`; let n = 1;
  while (await Program.exists({ slug })) slug = `${slugify(base)}-${n++}`;
  return slug;
}

// AI extraction: structure one raw item into Program fields, or reject it.
async function aiExtract(title, snippet, typeHint) {
  const raw = await fetchWithFallback([
    { role: "system", content:
      "You extract Indian internship / industrial-training / apprenticeship program details from a short news/listing snippet. " +
      "Output ONLY minified JSON. No markdown." },
    { role: "user", content:
      `Snippet title: "${title}"\nSnippet text: "${(snippet || "").slice(0, 500)}"\nLikely type hint: ${typeHint}\n\n` +
      `Return: {"isProgram": boolean (true only if this is a real internship/training/apprenticeship opportunity, not generic news), ` +
      `"programType": one of ["Internship","Industrial Training","Apprenticeship"], ` +
      `"title": cleaned program name, "organization": string|null, "sector": string|null, ` +
      `"duration": string|null, "stipend": string|null, "mode": one of ["Online","Offline","Hybrid"], ` +
      `"qualification": string|null, "eligibility": string|null, "description": one-line summary}` },
  ], 0.2);

  let s = (raw || "").trim();
  const f = s.match(/```(?:json)?\s*([\s\S]*?)```/i); if (f) s = f[1].trim();
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a !== -1 && b !== -1) s = s.slice(a, b + 1);
  try { return JSON.parse(s); } catch { return null; }
}

/**
 * Run the AI program scraping pipeline.
 * @param {object} opts { perSourceLimit, autoPublish }
 */
export async function runProgramImport({ perSourceLimit = 6, autoPublish = true } = {}) {
  await connectMongo();
  const stats = { scanned: 0, added: 0, duplicates: 0, rejected: 0, errors: [], perSource: {} };

  for (const src of SOURCES) {
    stats.perSource[src.id] = { added: 0, duplicates: 0, rejected: 0 };
    let feed;
    try { feed = await parser.parseURL(src.url); }
    catch (e) { stats.errors.push(`${src.id}: ${e.message}`); continue; }

    for (const item of (feed.items || []).slice(0, perSourceLimit)) {
      stats.scanned++;
      const title = cleanTitle(item.title || "");
      const link = item.link || item.guid || "";
      const snippet = (item.contentSnippet || "").replace(/\s+/g, " ").trim();
      if (title.length < 12 || !link) { stats.rejected++; stats.perSource[src.id].rejected++; continue; }

      const dedupeHash = hashOf(title);
      if (await Program.exists({ dedupeHash })) { stats.duplicates++; stats.perSource[src.id].duplicates++; continue; }

      let ex;
      try { ex = await aiExtract(title, snippet, src.hint); }
      catch (e) { stats.errors.push(`AI: ${e.message}`); continue; }

      if (!ex || ex.isProgram === false) { stats.rejected++; stats.perSource[src.id].rejected++; continue; }

      try {
        await Program.create({
          title: ex.title || title,
          slug: await uniqueSlug(ex.title || title),
          programType: ["Internship", "Industrial Training", "Apprenticeship"].includes(ex.programType) ? ex.programType : src.hint,
          organization: ex.organization || undefined,
          sector: ex.sector || undefined,
          duration: ex.duration || undefined,
          stipend: ex.stipend || undefined,
          mode: ["Online", "Offline", "Hybrid"].includes(ex.mode) ? ex.mode : "Offline",
          qualification: ex.qualification || undefined,
          eligibility: ex.eligibility || undefined,
          description: ex.description || snippet || undefined,
          applyLink: link,
          status: autoPublish ? "live" : "pending",
          source: "ai-fetch",
          ingestSource: "aiImport",
          sourceId: item.guid || link,
          sourceUrl: link,
          dedupeHash,
          tags: ["ai-import"],
        });
        stats.added++; stats.perSource[src.id].added++;
      } catch { stats.duplicates++; stats.perSource[src.id].duplicates++; }
    }
  }
  return stats;
}
