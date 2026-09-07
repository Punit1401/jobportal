import mongoose from "mongoose";

const AdCampaignSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId },
    userRole: { type: String, enum: ["recruiter", "serviceprovider"], required: true },
    userEmail: { type: String, default: "" },
    userName: { type: String, default: "" },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "AdPlan" },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "Paused", "Completed", "Expired"],
      default: "Active",
    },
    budget: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    reach: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceForm" },
  },
  { timestamps: true }
);

export default mongoose.models.AdCampaign || mongoose.model("AdCampaign", AdCampaignSchema);
