import mongoose from "mongoose";

const ContactEnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    source: { type: String, default: "Contact Form" }, // To distinguish from other sources
    status: { 
      type: String, 
      enum: ["New", "Pending", "Resolved", "Spam"],
      default: "New" 
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    }
  },
  { timestamps: true }
);

export default mongoose.models.ContactEnquiry || mongoose.model("ContactEnquiry", ContactEnquirySchema);
