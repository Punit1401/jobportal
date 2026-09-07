import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCountCandidate: {
      type: Number,
      default: 0,
    },
    unreadCountRecruiter: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Force delete pre-existing model compilation cache to prevent Mongoose errors in Next.js dev server
if (mongoose.models.Conversation) {
  delete mongoose.models.Conversation;
}

export default mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
