import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // bcrypt hash
  name: { type: String },
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
