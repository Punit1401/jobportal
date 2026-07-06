import mongoose from "mongoose";

const ServiceFormSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    providerName: { type: String, required: true },
    providerMobile: { type: String, required: true },
    providerEmail: { type: String, required: true },
    whatsappNumber: { type: String, required: true }, // આ ખાસ ચેક કરજો
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.ServiceForm || mongoose.model("ServiceForm", ServiceFormSchema);