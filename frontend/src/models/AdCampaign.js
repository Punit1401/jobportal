import mongoose from "mongoose";

const AdCampaignSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: String,
    status: { type: String, default: "Active" }, // Active, Paused, Completed
    budget: Number,
    reach: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  },
  { timestamps: true }
);

export default mongoose.models.AdCampaign || mongoose.model("AdCampaign", AdCampaignSchema);
