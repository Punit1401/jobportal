import mongoose from "mongoose";

/**
 * Exam — the core record for the Government Exam Feed.
 *
 * One Exam document is the single source of truth that powers every module:
 *   • Listing & Search (querying the fields below)
 *   • Individual Exam Detail page (rendering all of them)
 *   • Calendar (the date fields)
 *   • Dashboard "saved exams" / alerts (referenced by id)
 *   • CMS admin (create / edit / approve)
 *
 * Ingestion pipeline writes records as status:"pending"; an admin approves
 * them to status:"live" before they are visible to the public (same gate the
 * existing GovtResource model uses).
 */

// Important dates kept in one nested object so the Calendar module and the
// deadline-reminder cron can query/sort them cleanly.
const KeyDatesSchema = new mongoose.Schema(
  {
    applicationStart: { type: Date },
    applicationEnd: { type: Date }, // Last date to apply
    correctionWindowStart: { type: Date },
    correctionWindowEnd: { type: Date },
    admitCardDate: { type: Date },
    examDate: { type: Date },
    answerKeyDate: { type: Date },
    resultDate: { type: Date },
    interviewDate: { type: Date },
    counsellingDate: { type: Date },
    documentVerificationDate: { type: Date },
  },
  { _id: false }
);

// A downloadable/official document (notification PDF, syllabus PDF, prev. paper).
const AttachmentSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // e.g. "Official Notification", "Syllabus"
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ["notification", "syllabus", "previousPaper", "answerKey", "other"],
      default: "other",
    },
  },
  { _id: false }
);

const ExamSchema = new mongoose.Schema(
  {
    // ---- Identity / SEO ----
    name: { type: String, required: true, trim: true }, // Exam Name
    slug: { type: String, unique: true, required: true, index: true },
    conductingAuthority: { type: String, required: true, trim: true }, // e.g. UPSC, SSC
    advertisementNumber: { type: String, trim: true },
    summary: { type: String, trim: true }, // short description / feed snippet
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },

    // ---- Classification (drives the Search/Filter module) ----
    category: {
      // The feed categories from the spec
      type: String,
      enum: [
        "Job Notification",
        "Upcoming Exam",
        "Admit Card",
        "Result",
        "Answer Key",
        "Counselling",
        "Document Verification",
        "Application Deadline",
        "Correction Window",
        "Interview Schedule",
      ],
      default: "Job Notification",
      index: true,
    },
    source: {
      // Supported sources from the spec
      type: String,
      enum: [
        "UPSC", "SSC", "IBPS", "SBI", "RBI", "Railway", "State PSC",
        "Defence", "Teaching", "Police", "University", "PSU",
        "Apprenticeship", "Skill Mission", "Employment Exchange", "Other",
      ],
      default: "Other",
      index: true,
    },
    department: { type: String, trim: true },
    state: { type: String, trim: true, index: true }, // "All India" or a state name
    tags: [{ type: String, trim: true }],

    // ---- Eligibility ----
    qualification: { type: String, trim: true }, // e.g. "Graduate", "12th Pass"
    eligibilityConditions: { type: String, trim: true },
    ageLimit: { type: String, trim: true }, // free text, e.g. "21-32 years"
    reservationDetails: { type: String, trim: true },
    nationality: { type: String, trim: true, default: "Indian" },
    experience: { type: String, trim: true },
    physicalEligibility: { type: String, trim: true }, // where applicable

    // ---- Vacancy & compensation ----
    vacancyCount: { type: Number },
    salaryStructure: { type: String, trim: true },
    salaryMin: { type: Number }, // for the Salary Range filter
    salaryMax: { type: Number },
    jobLocation: { type: String, trim: true },

    // ---- Selection / exam structure ----
    selectionProcedure: { type: String, trim: true },
    examPattern: { type: String, trim: true },
    negativeMarking: { type: String, trim: true },
    syllabus: { type: String, trim: true }, // rich text / markdown

    // ---- Application logistics ----
    applicationFees: { type: String, trim: true },
    paymentMethods: { type: String, trim: true },
    requiredDocuments: [{ type: String, trim: true }],
    helpdeskInfo: { type: String, trim: true },

    // ---- Links & files ----
    officialWebsite: { type: String, trim: true },
    applyLink: { type: String, trim: true }, // the portal form URL
    attachments: [AttachmentSchema], // notification PDF, syllabus, previous papers

    // ---- Dates ----
    keyDates: { type: KeyDatesSchema, default: () => ({}) },

    // ---- Workflow / lifecycle ----
    status: {
      type: String,
      enum: ["pending", "live", "expired", "rejected", "negative"],
      default: "pending",
      index: true,
    },
    isFeatured: { type: Boolean, default: false }, // Featured exams section (CMS)
    views: { type: Number, default: 0 },

    // ---- Ingestion / dedupe plumbing ----
    ingestSource: {
      // Which adapter produced this record
      type: String,
      enum: ["manual", "rss", "aggregatorApi", "scraper", "aiImport"],
      default: "manual",
    },
    sourceId: { type: String, index: true, sparse: true }, // upstream id for dedupe
    sourceUrl: { type: String, trim: true }, // where we fetched it from
    dedupeHash: { type: String, index: true, sparse: true }, // hash(name+authority+examDate)
    lastSyncedAt: { type: Date },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Full-text search across the most-searched fields (Keyword Search in Module 2).
ExamSchema.index({
  name: "text",
  conductingAuthority: "text",
  department: "text",
  tags: "text",
});

// Common filter combo (live exams sorted by closing date) used by listing + calendar.
ExamSchema.index({ status: 1, "keyDates.applicationEnd": 1 });

export default mongoose.models.Exam || mongoose.model("Exam", ExamSchema);
