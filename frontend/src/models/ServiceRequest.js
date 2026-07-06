import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userRole: {
      type: String,
      enum: ["candidate", "recruiter"],
      default: "candidate",
    },
    userEmail: {
      type: String,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    adminReply: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Pending", "Answered", "Closed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.ServiceRequest ||
  mongoose.model("ServiceRequest", serviceRequestSchema);
