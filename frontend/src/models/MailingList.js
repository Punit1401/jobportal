import mongoose from "mongoose";

const MailingListSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    ownerRole: { type: String, required: true, enum: ['recruiter', 'serviceprovider', 'admin'] },
    name: { type: String, required: true },
    description: { type: String },
    count: { type: Number, default: 0 },
    type: { type: String, default: 'Custom' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }]
}, { timestamps: true });

// Index for faster lookups
MailingListSchema.index({ ownerId: 1, ownerRole: 1 });

export default mongoose.models.MailingList || mongoose.model("MailingList", MailingListSchema);
