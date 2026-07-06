import mongoose from "mongoose";

const emailQueueSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    dateAdded: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const EmailQueue = mongoose.models.EmailQueue || mongoose.model("EmailQueue", emailQueueSchema);
export default EmailQueue;
