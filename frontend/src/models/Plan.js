// import mongoose from "mongoose";

// const PlanSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   userType: { type: String, enum: ["Recruiter", "ServiceProvider"], required: true },
//   price: { type: Number, required: true },
//   discountPercentage: { type: Number, default: 0 },
//   currency: { type: String, default: "INR" },
//   duration: { type: Number, required: true }, // e.g., 30
//   durationType: { type: String, enum: ["Days", "Months", "Years"], default: "Days" },
//   storageLimit: { type: Number, default: 0 }, // GB માં

//   // --- Limitations & Features ---
//   features: {
//     canPostJobs: { type: Boolean, default: false },
//     jobLimit: { type: Number, default: 0 }, // Recruiters માટે
//     canAccessLeads: { type: Boolean, default: false },
//     leadLimit: { type: Number, default: 0 }, // Service Providers માટે
//     bulkEmail: { type: Boolean, default: false },
//     excelExport: { type: Boolean, default: false },
//     customDomain: { type: Boolean, default: false },
//     supportType: { type: String, default: "Email" }, // Email, Chat, Priority
//   },

//   isPopular: { type: Boolean, default: false },
//   isActive: { type: Boolean, default: true },
//   displayOrder: { type: Number, default: 0 },
//   description: { type: String },
// }, { timestamps: true });

// export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  planCategory: {
    type: String,
    enum: ["Basic", "Standard", "Premium", "Enterprise"],
    default: "Basic"
  },
  userType: { type: String, enum: ["Recruiter", "ServiceProvider", "Candidate"], required: true },
  price: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  currency: { type: String, default: "INR" },
  duration: { type: Number, required: true },
  durationType: { type: String, default: "Days" },
  // --- ADDED LIMITS OBJECT ---
  limits: {
    jobLimit: { type: Number, default: 0 }, // Recruiter માટે
    leadLimit: { type: Number, default: 0 }, // ServiceProvider માટે
    useLimit: { type: Number, default: 0 } // Candidate માટે
  },
  storage: {
    value: { type: Number, default: 0 },
    unit: { type: String, default: "GB" }
  },
  features: [{ type: String }],
  isPopular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  description: { type: String }
}, { timestamps: true });

// Clear the mongoose model if it already exists to ensure schema updates are applied in dev mode
if (mongoose.models.Plan) {
  delete mongoose.models.Plan;
}

export default mongoose.model("Plan", PlanSchema);