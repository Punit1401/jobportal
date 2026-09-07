import mongoose from "mongoose";

const BulkVacancySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["Govt", "Pvt"], required: true },
    image: { type: String, required: true }, // Image or PDF URL / Base64
    fileType: { type: String, enum: ["image", "pdf"], default: "image" },
    postedBy: { type: String, default: "Admin" },
    expiresAt: { type: Date, required: true }, // Auto-delete date
    isApproved: { type: Boolean, default: true },
    scrapedContacts: [{
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" }
    }],
  },
  { timestamps: true }
);

if (mongoose.models.BulkVacancy) {
  delete mongoose.models.BulkVacancy;
}

// TTL Index to delete document when expiresAt date is reached
BulkVacancySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.BulkVacancy || mongoose.model("BulkVacancy", BulkVacancySchema);
