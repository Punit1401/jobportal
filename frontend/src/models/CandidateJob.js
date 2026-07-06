import mongoose from "mongoose";

const CandidateJobSchema = new mongoose.Schema({
  postedByEmail: { type: String, required: true }, // આ ફિલ્ડ હોવું જરૂરી છે
  title: { type: String, required: true },
  category: { type: String },
  jobType: { type: String, default: "Full-time" },
  location: { type: String },
  salaryRange: { type: String },
  experienceLevel: { type: String },
  description: { type: String },
  requirements: { type: String },
  deadline: { type: String },
  industry: { type: String },
  profession: { type: String },
  designation: { type: String },
  department: { type: String },
  Reference: { type: String },
  // New Apply Here Fields
  applyLink: { type: String },
  applyEmail: { type: String },
  applyPhone: { type: String },
  applyPersonName: { type: String },
  companyDetails: {
    companyName: { type: String },
    tagline: { type: String },
    industry: { type: String },
    department: { type: String },
    profession: { type: String },
    designation: { type: String },
    website: { type: String },
    email: { type: String },
    mobile: { type: String },

    recruiterType: { type: String },
    companyType: { type: String },
    location: { type: String },
    address: { type: String },
    companySize: { type: String },
    founded: { type: String },
    description: { type: String },
    specialties: { type: String },
    logo: { type: String },
    contactPersonName: { type: String },
    contactPersonNumber: { type: String },
    contactPersonEmail: { type: String },
    ownerName: { type: String },
    ownerEmail: { type: String },
    ownerNumber: { type: String },
  },

  status: { type: String, default: "published" },
  isActive: { type: Boolean, default: true },
  postedAt: { type: Date, default: Date.now }
}, { timestamps: true }); // આનાથી createdAt અને updatedAt ઓટોમેટિક બનશે


export default mongoose.models.CandidateJob || mongoose.model("CandidateJob", CandidateJobSchema);
