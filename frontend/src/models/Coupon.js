import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ["Percentage", "Fixed"], default: "Percentage" },
    description: String,
    discountValue: { type: Number, required: true },
    maxRedemptions: { type: Number, default: null }, // Null એટલે Unlimited
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);