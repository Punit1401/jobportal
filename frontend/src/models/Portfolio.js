import mongoose from "mongoose";

const PortfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One portfolio per user
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined if they haven't set it yet
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Username can only contain lowercase letters, numbers, and hyphens"],
    },
    theme: {
      type: String,
      enum: ["modern", "dark"], // Kept for backward compatibility
      default: "modern",
    },
    template: {
      type: String,
      enum: [
        "modern",
        "minimal",
        "creative",
        "seo-pro",
        "business-pro",
        "studio-pro",
        "architecture-pro",
        "interior-pro",
        "developer-pro",
        "it-engineer-pro",
      ],
      default: "modern",
    },
    siteOverrides: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    visibleSections: {
      about: { type: Boolean, default: true },
      experience: { type: Boolean, default: true },
      education: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
    },
    accentColor: {
      type: String,
      default: "indigo", // Tailwind color name like indigo, rose, emerald
    }
  },
  { timestamps: true }
);

if (mongoose.models.Portfolio) {
  delete mongoose.models.Portfolio;
}

export default mongoose.model("Portfolio", PortfolioSchema);
