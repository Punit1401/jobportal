import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: String, 
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company", 
      required: true,
    },
    title: { type: String, required: true },
    category: { type: String, required: true },
    industry: { type: String, required: true }, // નવું ફિલ્ડ
    profession: { type: String, required: true }, // નવું ફિલ્ડ
    designation: { type: String, required: true }, // નવું ફિલ્ડ
    department: { type: String, required: true }, // નવું ફિલ્ડ
    jobType: { type: String, required: true },
    location: { type: String, required: true },
    salaryRange: {
      type: String,
      required: function() { return !this.isFreelance; } // જો ફ્રીલાન્સ ના હોય તો જ જરૂરી
    },
    experienceLevel: {
      type: String,
      required: function() { return !this.isFreelance; } // જો ફ્રીલાન્સ ના હોય તો જ જરૂરી
    },
    description: { type: String, required: true },
    requirements: { type: String }, // ટેક્સ્ટ એરિયા માટે
    skills: { type: [String], default: [] }, 
    deadline: { type: Date, required: true },
    status: { type: String, enum: ["active", "closed", "draft"], default: "active" },
    // --- Freelance Specific Fields ---
    isFreelance: { type: Boolean, default: false },
    projectBudget: { type: String }, 
    budgetType: { type: String, enum: ["Fixed", "Hourly", null], default: null },
    projectDuration: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Job || mongoose.model("Job", JobSchema);