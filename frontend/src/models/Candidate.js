import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔹 Basic Info
    fullName: String,
    email: String,
    mobile: String,
    dob: String,
    gender: String,
    religion: String,
    motherTongue: String,
    profession: String,
    position: String,
    reference: String,
    Reference: String,

    // 🔹 Address
    pincode: String,
    state: String,
    city: String,
    address: String,

    // reference: String,
    skills: [String],

    // 🔹 Links
    github: String,
    portfolio: String,

    // 🔹 Documents
    resume: String,
    coverLetter: String,
    experienceLetter: String,

    // 🔹 Work Experience
    currentCompanyName: String,
    jobDepartment: String,
    jobIndustry: String,
    jobFromDate: String,
    jobToDate: String,
    jobDescription: String,
    presentEmploymentStatus: String,
    preferredJobTypes: [String],
    placementLocation: String,
    placementPincode: String,
    lastSalary: String,
    expectedSalary: String,
    noticePeriod: String,

    // 🔹 Education
    classXYear: String,
    classXBoard: String,
    classXSchool: String,
    classXPercentage: String,

    classXIIYear: String,
    classXIIBoard: String,
    classXIISchool: String,
    classXIIPercentage: String,

    graduationYear: String,
    graduationUniversity: String,
    graduationInstitute: String,
    graduationSpecialization: String,
    graduationPercentage: String,

    postGraduationYear: String,
    postGraduationUniversity: String,
    postGraduationInstitute: String,
    postGraduationSpecialization: String,
    postGraduationPercentage: String,

    itiYear: String,
    itiUniversity: String,
    itiInstitute: String,
    itiSpecialization: String,
    itiPercentage: String,

    diplomaYear: String,
    diplomaUniversity: String,
    diplomaInstitute: String,
    diplomaSpecialization: String,
    diplomaPercentage: String,

    pgDiplomaYear: String,
    pgDiplomaUniversity: String,
    pgDiplomaInstitute: String,
    pgDiplomaSpecialization: String,
    pgDiplomaPercentage: String,

    internshipDetails: String,
    projectsDetails: String,
    apprenticeDetails: String,
    // models/Candidate.js માં ઉમેરો
    urgentJobBlastCount: { type: Number, default: 0 }, // વર્ષમાં કેટલી વાર વાપર્યું
    lastBlastDate: { type: Date }, // છેલ્લે ક્યારે બ્લાસ્ટ કર્યું
    employmentStatusUpdatedAt: { type: Date, default: Date.now }, // સ્ટેટસ ક્યારે બદલાયું
    // models/Candidate.js
    aiChats: [
      {
        title: String,
        messages: [{ role: String, content: String }],
        updatedAt: { type: Date, default: Date.now }
      }
    ],

    awards: [
      {
        recognition: String,
        year: String,
        field: String,
        affiliation: String,
        level: String,
      },
    ],

    // 🔹 New Array Structures
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    followedCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],

    // 🔹 AI Job Feed — saved aggregated jobs
    savedAggregatedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "AggregatedJob" }],

    // 🔹 Schemes & Benefits — saved schemes
    savedSchemes: [{ type: mongoose.Schema.Types.ObjectId, ref: "GovtResource" }],

    // 🔹 AI Auto-Apply & Application Management (Module 2)
    autoApplyPreferences: {
      industries: [{ type: String }],
      locations: [{ type: String }],
      employmentTypes: [{ type: String }],
      keywords: [{ type: String }],
      minMatchScore: { type: Number, default: 40 },
      enabled: { type: Boolean, default: false },
    },
    // Applications to aggregated/external jobs (internal jobs use the Application model).
    jobApplications: [
      {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "AggregatedJob" },
        status: {
          type: String,
          enum: ["Saved", "Applied", "Viewed", "Interview", "Offer", "Rejected"],
          default: "Applied",
        },
        matchScore: { type: Number },
        mode: { type: String, enum: ["assisted", "one-click"], default: "assisted" },
        coverLetter: { type: String },
        notes: { type: String },
        appliedAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // 🔹 Government Exam dashboard (Module 6)
    savedExams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
    bookmarkedNotifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
    examApplications: [
      {
        examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
        status: {
          type: String,
          enum: ["Interested", "Applied", "Admit Card", "Appeared", "Result", "Selected", "Not Selected"],
          default: "Interested",
        },
        applicationNo: { type: String },
        notes: { type: String },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    examPrep: [
      {
        examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
        progress: { type: Number, min: 0, max: 100, default: 0 },
        checklist: [{ label: String, done: { type: Boolean, default: false } }],
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    downloadHistory: [
      {
        examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
        label: String,
        url: String,
        downloadedAt: { type: Date, default: Date.now },
      },
    ],
    examPreferences: {
      states: [{ type: String }],
      sources: [{ type: String }],
      categories: [{ type: String }],
      emailAlerts: { type: Boolean, default: true },
    },

    workExperiences: [
      {
        currentCompanyName: String,
        designation: String,
        jobDepartment: String,
        jobIndustry: String,
        jobFromDate: String,
        jobToDate: String,
        jobDescription: String,
        presentEmploymentStatus: String,
        lastSalary: String,
        expectedSalary: String,
        noticePeriod: String,
      }
    ],
    formalEducations: [
      {
        type: { type: String },
        year: String,
        university: String,
        institute: String,
        specialization: String,
        percentage: String,
        board: String,
        level: String,
      }
    ],
    nonFormalEducations: [
      {
        type: { type: String },
        year: String,
        university: String,
        institute: String,
        specialization: String,
        percentage: String,
      }
    ],
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    paymentAmount: { type: Number, default: 0 },
    subscription: {
      planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", default: null },
      status: { type: String, enum: ["Active", "Expired", "None"], default: "None" },
      expiryDate: { type: Date, default: null },
      subUsesUsed: { type: Number, default: 0 }
    },
    freeUsesCount: { type: Number, default: 0 },
    freeUses: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Clear the mongoose model if it already exists to ensure schema updates are applied in dev mode
if (mongoose.models.Candidate) {
  delete mongoose.models.Candidate;
}

export default mongoose.model("Candidate", CandidateSchema);
