// /src/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "candidate" },
    acceptedTerms: { type: Boolean, default: false },

    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
     // 🔥 Email verification (OTP)
     isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOTP: {
      type: String,
    },
    verificationOTPExpire: {
      type: Date,
    },

    // 🔥 Email verification (Magic Link Token - optional)
    verificationToken: {
      type: String,
    },
    verificationTokenExpire: {
      type: Date,
    },
    date: { 
      type: Date, 
      default: Date.now 
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
