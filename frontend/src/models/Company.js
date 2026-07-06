import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    recruiterId: {
      type: String,
      required: true,
      unique: true, 
    },
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    email: { // નવું ઉમેર્યું
      type: String,
      trim: true,
    },
    phone: { // નવું ઉમેર્યું
      type: String,
      trim: true,
    },
    address: { // location ની જગ્યાએ address
      type: String,
      trim: true,
    },
    companySize: {
      type: String,
      enum: [
        "1-10 employees",
        "11-50 employees",
        "51-200 employees",
        "201-500 employees",
        "500+ employees",
      ],
      default: "11-50 employees",
    },
    founded: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String, 
      default: "",
    },
    coverImage: {
      type: String, 
      default: "",
    },
    specialties: {
      type: [String], 
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Company || mongoose.model("Company", CompanySchema);