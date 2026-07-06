import mongoose from "mongoose";

// ૧. ટેમ્પલેટ મોડલ
const MailTemplateSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ownerRole: { type: String, required: true },
  title: String,
  subject: String,
  content: String,
}, { timestamps: true });

// ૨. મેઈલ હિસ્ટ્રી અને શેડ્યુલિંગ મોડલ (Tracking સાથે)
const ScheduledMailSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ownerRole: { type: String, required: true },
  subject: String,
  message: String,
  sentEmails: { type: [String], default: [] }, // ઈમેઈલ લિસ્ટ માટે
  userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // ✅ ટાર્ગેટ ગ્રુપ (e.g., 'all', 'candidate', 'recruiter', 'serviceprovider', 'custom')
  targetType: { type: String, default: 'all' },
  scheduledTime: Date,
  isSent: { type: Boolean, default: false },
  recipientsCount: { type: Number, default: 0 }, 
  opens: { type: Number, default: 0 }           
}, { timestamps: true });

export const MailTemplate = mongoose.models.MailTemplate || mongoose.model("MailTemplate", MailTemplateSchema);
export const ScheduledMail = mongoose.models.ScheduledMail || mongoose.model("ScheduledMail", ScheduledMailSchema);