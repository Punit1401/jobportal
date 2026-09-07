import mongoose from "mongoose";

const GovtResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Govt Job", "Scheme", "Internship", "Training", "Apprenticeship"],
      default: "Govt Job",
    },
    description: {
      type: String,
      trim: true,
    },
    eligibility: {
      type: String,
      trim: true,
      default: "Not specified",
    },
    applyLink: {
      type: String,
      required: true,
      trim: true,
    },
    deadline: {
      type: Date,
    },
    sourceId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined if manually added
    },
    status: {
      type: String,
      enum: ["pending", "live", "expired", "negative"],
      default: "pending",
    },

    // ---- Schemes & Benefits Intelligence (Module 4) ----
    // Who the scheme is for — drives AI eligibility matching & recommendations.
    audience: [{
      type: String,
      enum: [
        "Unemployed", "Employed", "Students", "Women", "Farmers", "Senior Citizens",
        "Entrepreneurs", "SC/ST/OBC", "Persons with Disability", "BPL / Low Income",
        "Minorities", "Self-Employed", "All",
      ],
    }],
    benefitType: {
      type: String,
      enum: [
        "Financial Aid", "Loan / Credit", "Subsidy", "Pension", "Insurance",
        "Scholarship", "Skill Training", "Healthcare", "Housing", "Employment Support", "Other",
      ],
      default: "Other",
    },
    benefitAmount: { type: String, trim: true }, // e.g. "₹6,000/year", "Up to ₹10 lakh loan"
    sector: { type: String, trim: true },        // Agriculture, Education, Health, Business…
    state: { type: String, trim: true, default: "All India" },
    minAge: { type: Number },
    maxAge: { type: Number },
    incomeCeiling: { type: String, trim: true }, // e.g. "Family income < ₹2.5L/year"
    documentsRequired: [{ type: String, trim: true }],

    // Source / moderation
    source: { type: String, enum: ["official", "community", "ai-fetch"], default: "official" },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // community submissions
    relatedSectors: [{ type: String, trim: true }], // for job-linked benefit matching
  },
  { timestamps: true }
);

GovtResourceSchema.index({ title: "text", description: "text", sector: "text" });

export default mongoose.models.GovtResource || mongoose.model("GovtResource", GovtResourceSchema);
