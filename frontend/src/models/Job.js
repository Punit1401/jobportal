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
    companyName: { type: String, default: "" },
    company: { type: String, default: "" },
    title: { type: String, required: true },
    category: { type: String, required: true },
    jobCategory: { type: String, default: "" },
    type: { type: String, default: "" },
    industry: { type: String, required: true },
    profession: { type: String, required: true },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    jobType: { type: String, required: true },
    location: { type: String, required: true },
    vacancies: { type: Number, default: 1 },
    education: { type: String, default: "All education levels" },
    gender: { type: String, default: "All genders" },
    shift: { type: String, default: "Day Shift" },
    workingDays: { type: String, default: "Flexible schedule" },
    published: { type: Boolean, default: true },
    createdBy: { type: String, default: "" },
    salaryRange: {
      type: String,
      required: function () {
        return !this.isFreelance;
      },
    },
    experienceLevel: {
      type: String,
      required: function () {
        return !this.isFreelance;
      },
    },
    description: { type: String, required: true },
    requirements: { type: String },
    skills: { type: [String], default: [] },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ["active", "closed", "draft"], default: "active" },
    isFreelance: { type: Boolean, default: false },
    projectBudget: { type: String },
    budgetType: { type: String, enum: ["Fixed", "Hourly", null], default: null },
    projectDuration: { type: String },
  },
  { timestamps: true }
);

if (mongoose.models.Job) {
  delete mongoose.models.Job;
}

const Job = mongoose.model("Job", JobSchema);

export default Job;
