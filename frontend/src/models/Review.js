import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  targetId: { type: String, required: true }, // જેની પ્રોફાઈલ પર રિવ્યુ દેખાશે (Email અથવા ID)
  reviewerId: { type: String, required: true }, // જે રિવ્યુ આપે છે (તેનો Email અથવા ID)
  reviewerName: { type: String, required: true }, // રિવ્યુ આપનારનું નામ
  targetType: { 
    type: String, 
    enum: ["provider", "recruiter"], 
    required: true 
  }, // કોને રેટિંગ મળ્યું?
  rating: { type: Number, required: true, min: 1, max: 5 }, // 1 થી 5 સ્ટાર
  comment: { type: String, required: true, trim: true },
}, { timestamps: true });

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
export default Review;