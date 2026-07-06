import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    userId: String,
  originalName: String,
  text: String,
  aiSuggestions: String,
  atsScore: Number,
  missingKeywords: [String],
  tailoredVersions: [{
    jdHash: String,         // hash of jobDescription to avoid duplicates
    jobDescription: String,
    tailoredText: String,
    createdAt: Date
  }],
  coverLetters: [{
    jdHash: String,
    tone: String,
    coverText: String,
    createdAt: Date
  }],
  headshots: [{
    fileUrl: String,
    service: String,
    metadata: Object,
    createdAt: Date
  }],
  },
  { timestamps: true }
);

export default mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);
