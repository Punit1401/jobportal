import mongoose from "mongoose";

const StoragePlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    addedSpaceMB: { type: Number, required: true },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (mongoose.models.StoragePlan) {
  delete mongoose.models.StoragePlan;
}

export default mongoose.model("StoragePlan", StoragePlanSchema);
