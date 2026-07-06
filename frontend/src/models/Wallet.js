import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One wallet per user
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Balance cannot be negative"], // Security: Prevent negative balance
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["active", "frozen"],
      default: "active",
    }
  },
  { timestamps: true }
);

if (mongoose.models.Wallet) {
  delete mongoose.models.Wallet;
}

export default mongoose.model("Wallet", WalletSchema);
