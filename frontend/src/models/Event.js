import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    type: { type: String, default: "Interview" }, // Interview, Meeting, Webinar
    date: { type: Date, required: true },
    location: String,
    attendees: [String],
    description: String,
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
