import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true }, // MUST be a future Date
  },
  { timestamps: true }
);

// ⭐ TTL Index — delete EXACTLY when expiresAt time reaches
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.EmailOTP ||
  mongoose.model("EmailOTP", otpSchema);
