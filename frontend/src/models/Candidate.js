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
    profession: String,
    position: String,
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
    workExperiences: [
      {
        currentCompanyName: String,
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
  },
  { timestamps: true }
);

// Clear the mongoose model if it already exists to ensure schema updates are applied in dev mode
if (mongoose.models.Candidate) {
  delete mongoose.models.Candidate;
}

export default mongoose.model("Candidate", CandidateSchema);