import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than zero"],
    },
    purpose: {
      type: String,
      required: true, // e.g., "Add Money", "Premium Job Apply", "Resume Template"
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    referenceId: {
      type: String, // e.g., Razorpay Payment ID or internal order ID
      unique: true,
      sparse: true, // sparse because some transactions might not have external reference yet
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Any extra data
    }
  },
  { timestamps: true }
);

if (mongoose.models.Transaction) {
  delete mongoose.models.Transaction;
}

export default mongoose.model("Transaction", TransactionSchema);
