import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // If from system/admin
  senderRole: { type: String, enum: ['Admin', 'Recruiter', 'recruiter', 'System', 'user', 'Candidate'], default: 'System' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Info', 'Success', 'Warning', 'JobAlert', 'Campaign', 'JobResponse'], default: 'Info' },
  isRead: { type: Boolean, default: false },
  link: { type: String }, // Optional link to redirect user
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
