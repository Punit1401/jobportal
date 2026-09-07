import mongoose from "mongoose";

const InterviewSessionSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    kind: {
      type: String,
      enum: ["scheduled", "session"],
      default: "session",
    },
    role: { type: String, default: "" },
    level: { type: String, default: "" },
    jobDescription: { type: String, default: "" },
    resumeText: { type: String, default: "" },
    questionsCount: { type: Number, default: 0 },
    scheduledAt: { type: Date },
    status: {
      type: String,
      enum: ["draft", "scheduled", "in-progress", "completed", "cancelled"],
      default: "draft",
    },
    questions: [
      {
        question: { type: String },
        bestAnswer: { type: String },
      },
    ],
    recording: {
      hasRecording: { type: Boolean, default: false },
      mimeType: { type: String, default: "" },
      size: { type: Number, default: 0 },
      url: { type: String, default: "" },
      createdAt: { type: Date },
    },
    speechAnalysis: {
      tone: { type: String, default: "" },
      confidence: { type: Number, default: 0 },
      feedback: { type: String, default: "" },
    },
    score: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.InterviewSession ||
  mongoose.model("InterviewSession", InterviewSessionSchema);
