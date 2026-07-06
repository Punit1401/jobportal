import mongoose from "mongoose";

const AdminModuleItemSchema = new mongoose.Schema(
  {
    moduleKey: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["Active", "Pending", "Archived"],
      default: "Active",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.AdminModuleItem ||
  mongoose.model("AdminModuleItem", AdminModuleItemSchema);
