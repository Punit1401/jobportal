import mongoose from "mongoose";

const AdPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    durationType: { type: String, default: "Days" },
    userType: {
      type: String,
      enum: ["Recruiter", "ServiceProvider"],
      required: true,
    },
    features: [{ type: String }],
    estimatedImpressions: { type: Number, default: 0 },
    estimatedClicks: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

if (mongoose.models.AdPlan) {
  delete mongoose.models.AdPlan;
}

export default mongoose.models.AdPlan || mongoose.model("AdPlan", AdPlanSchema);
