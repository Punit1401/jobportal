import mongoose from "mongoose";

const emailQueueSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    phone: { type: String },
    source: { type: String },
    dateAdded: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

if (mongoose.models.EmailQueue) {
  delete mongoose.models.EmailQueue;
}

const EmailQueue = mongoose.models.EmailQueue || mongoose.model("EmailQueue", emailQueueSchema);
export default EmailQueue;
