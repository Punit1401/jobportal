// models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, default: "" },
  location: { type: String, default: "" },

  // Job Category (Frontend, Backend, etc)
  jobCategory: {
    type: String,
    enum: [
      "Frontend Developer",
      "Backend Developer",
      "Fullstack Developer",
      "WordPress Developer",
      "MERN Developer",
      "Content Writer",
      "Content Marketer",
      "SEO Specialist",
      "UI/UX Designer",
      "QA Tester"
    ],
    required: true,
    default: "Frontend Developer"
  },

  // Experience Level
  experienceLevel: {
    type: String,
    enum: ["Entry", "Mid", "Senior"],
    default: "Entry"
  },

  // Job Type (Full-time, Part-time, etc)
  type: {
    type: String,
    enum: ["full-time", "part-time", "contract", "freelance"],
    default: "full-time"
  },

  description: { type: String, default: "" },
  requirements: { type: String, default: "" },
  published: { type: Boolean, default: false },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

module.exports = mongoose.models.Job || mongoose.model("Job", JobSchema);
