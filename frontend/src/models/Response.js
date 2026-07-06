import mongoose from "mongoose";

const ResponseSchema = new mongoose.Schema({
  notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: { type: String },
  senderEmail: { type: String },
  senderRole: { type: String },
  message: { type: String, required: true },
  originalTitle: { type: String },
  originalMessage: { type: String },
}, { timestamps: true });

export default mongoose.models.Response || mongoose.model("Response", ResponseSchema);
