import mongoose from "mongoose";

const EventInterestSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userRole: {
      type: String,
      enum: ["candidate", "recruiter", "serviceprovider"],
      required: true,
    },
    response: {
      type: String,
      enum: ["Interested", "Not Interested"],
      required: true,
    },
    // Captured data at the time of interest (for mailing list)
    userData: {
      name: String,
      email: String,
      phone: String,
    }
  },
  { timestamps: true }
);

// Prevent duplicate entries for the same user and event
EventInterestSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.models.EventInterest || mongoose.model("EventInterest", EventInterestSchema);
