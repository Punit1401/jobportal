import mongoose from "mongoose";

const InquirySchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceForm' },
  providerEmail: { type: String, required: true }, 
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  serviceTitle: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: "new", enum: ["new", "replied", "urgent"] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Inquiry || mongoose.model("Inquiry", InquirySchema);