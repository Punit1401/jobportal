import mongoose from "mongoose";

/**
 * Program — Internship Programs, Industrial Training Programs, and
 * Apprenticeships. A dedicated module separate from the Govt Schemes & Jobs
 * repository, with program-specific fields (duration, stipend, mode).
 */
const ProgramSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, required: true, index: true },

    programType: {
      type: String,
      enum: ["Internship", "Industrial Training", "Apprenticeship"],
      required: true,
      index: true,
    },

    organization: { type: String, trim: true },   // company / institute / department
    description: { type: String, trim: true },
    sector: { type: String, trim: true, index: true }, // IT, Mechanical, Finance, Healthcare…

    duration: { type: String, trim: true },        // e.g. "3 months", "6 months", "1 year"
    stipend: { type: String, trim: true },         // e.g. "₹15,000/month", "Unpaid", "Performance based"
    mode: { type: String, enum: ["Online", "Offline", "Hybrid"], default: "Offline" },

    location: { type: String, trim: true },
    state: { type: String, trim: true, default: "All India", index: true },

    qualification: { type: String, trim: true },   // e.g. "B.Tech", "Diploma", "Any Graduate"
    eligibility: { type: String, trim: true },
    skills: [{ type: String, trim: true }],

    applyLink: { type: String, required: true, trim: true },
    deadline: { type: Date },

    status: { type: String, enum: ["pending", "live", "expired", "negative"], default: "live", index: true },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },

    // Source / ingestion plumbing (for future auto-import + dedupe)
    source: { type: String, enum: ["official", "community", "ai-fetch"], default: "official" },
    ingestSource: { type: String, enum: ["manual", "rss", "scraper", "aiImport"], default: "manual" },
    sourceId: { type: String, index: true, sparse: true },
    sourceUrl: { type: String, trim: true },
    dedupeHash: { type: String, index: true, sparse: true },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

ProgramSchema.index({ title: "text", organization: "text", sector: "text", skills: "text" });
ProgramSchema.index({ status: 1, programType: 1 });

export default mongoose.models.Program || mongoose.model("Program", ProgramSchema);
