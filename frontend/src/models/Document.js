import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    type: { type: String, default: "PDF" }, // PDF, DOCX, IMG
    size: String,
    url: String,
    category: { type: String, default: "Resume" }, // Resume, JD, Contract
  },
  { timestamps: true }
);

export default mongoose.models.Document || mongoose.model("Document", DocumentSchema);
