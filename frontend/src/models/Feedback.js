import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userType: { type: String, enum: ["candidate", "recruiter", "serviceprovider"], required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    category: { type: String, default: "General" }, // e.g., UI/UX, Service, Bug
    comment: { type: String, required: true },
    status: { type: String, enum: ["pending", "reviewed", "resolved"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
