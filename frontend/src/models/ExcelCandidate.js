// src/models/ExcelCandidate.js
import mongoose from "mongoose";

const ExcelCandidateSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "" },
    email: { type: String, required: true, unique: true, index: true },
    mobile: { type: String, default: "" },
    dob: { type: String, default: "" },
    profession: { type: String, default: "" },
    position: { type: String, default: "" },
    role: { type: String, default: "" },
    experience: { type: String, default: "" },
    city: { type: String, default: "" },
    reference: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    resume: { type: String, default: "" },

    // NEW fields
    
    unsubscribed: { type: Boolean, default: false },
    mailCount: { type: Number, default: 0 },
    date: { 
      type: Date, 
      default: Date.now 
    },
  },
  { timestamps: true }
);

export default mongoose.models.ExcelCandidate ||
  mongoose.model("ExcelCandidate", ExcelCandidateSchema);
