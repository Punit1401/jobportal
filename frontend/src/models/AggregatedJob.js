import mongoose from "mongoose";

/**
 * AggregatedJob — externally-sourced jobs collected by the AI Job Aggregation
 * engine (portals, RSS, govt/PSU, internships, company pages, print/OCR).
 *
 * Kept separate from the recruiter-posted `Job` model (which has many required
 * fields tied to the posting form). Imported jobs go in here as status:"pending"
 * → admin approves → "live".
 *
 * Contact policy: applyContact stores ONLY public, posting-level apply
 * information (e.g. a careers@ inbox or apply URL printed on the listing).
 * No harvesting of named individuals' personal contact data.
 */

const ApplyContactSchema = new mongoose.Schema(
  {
    email: { type: String, trim: true },   // public careers@/hr@ inbox if listed
    phone: { type: String, trim: true },   // public office/HR desk number if listed
    applyUrl: { type: String, trim: true },
    contactName: { type: String, trim: true }, // only if published as a desk/role, not a private individual
  },
  { _id: false }
);

const AggregatedJobSchema = new mongoose.Schema(
  {
    // ---- Core ----
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, required: true, index: true },
    company: { type: String, trim: true, default: "" },
    summary: { type: String, trim: true },       // short snippet
    description: { type: String, trim: true },    // full text if extracted

    // ---- Filter fields (match the requested filters) ----
    industry: { type: String, trim: true, index: true },
    experience: { type: String, trim: true },     // e.g. "0-2 years", "Fresher", "5+"
    qualification: { type: String, trim: true },  // e.g. "Graduate", "12th Pass"
    salary: { type: String, trim: true },         // human-readable
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    location: { type: String, trim: true, index: true },
    state: { type: String, trim: true, index: true },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance", "Temporary", "Other"],
      default: "Full-time",
      index: true,
    },

    // ---- Classification / discovery ----
    sourceType: {
      type: String,
      enum: ["Job Portal", "Company Career Page", "Govt/PSU", "Internship Portal", "Newspaper/Print", "Other"],
      default: "Job Portal",
      index: true,
    },
    language: { type: String, trim: true, default: "en" }, // detected content language
    tags: [{ type: String, trim: true }],
    rankScore: { type: Number, default: 0 }, // AI relevance/quality score for ranking

    // ---- Public apply contact (policy-scoped) ----
    applyContact: { type: ApplyContactSchema, default: () => ({}) },

    // ---- Dates ----
    postedDate: { type: Date },
    deadline: { type: Date },

    // ---- Workflow ----
    status: {
      type: String,
      enum: ["pending", "live", "expired", "rejected", "negative"],
      default: "pending",
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },

    // ---- Ingestion / dedupe plumbing ----
    ingestSource: {
      type: String,
      enum: ["rss", "aggregatorApi", "scraper", "ocr", "manual", "aiImport"],
      default: "rss",
    },
    sourceId: { type: String, index: true, sparse: true },
    sourceUrl: { type: String, trim: true },
    sourceLabel: { type: String, trim: true }, // human name of the feed/site
    dedupeHash: { type: String, index: true, sparse: true },
    lastSyncedAt: { type: Date },
  },
  { timestamps: true }
);

// Keyword search across the most-searched fields.
AggregatedJobSchema.index({ title: "text", company: "text", description: "text", tags: "text" });
// Common filter combo.
AggregatedJobSchema.index({ status: 1, sourceType: 1, employmentType: 1 });

export default mongoose.models.AggregatedJob || mongoose.model("AggregatedJob", AggregatedJobSchema);
