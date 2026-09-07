import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["Job Fair", "Webinar", "Seminar", "Workshop", "Training", "Other"],
      default: "Other" 
    },
    date: { type: Date, required: true },
    time: { type: String },
    location: { type: String }, // Physical address or "Online"
    meetingLink: { type: String }, // For webinars/online events
    description: { type: String },
    thumbnail: { type: String }, // Image URL
    status: { 
      type: String, 
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming" 
    },
    targetAudience: [{ 
      type: String, 
      enum: ["Candidate", "Recruiter", "ServiceProvider", "All"],
      default: ["All"]
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Or Staff
    }
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
