// import mongoose from "mongoose";

// const applicationSchema = new mongoose.Schema(
//   {
//     job: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Job",
//       required: true,
//     },
//     candidate: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//     },
//     phone: String,
//     linkedIn: String,
//     portfolio: String,
//     price: Number,
//     estimatedDays: Number,
//     coverLetter: String,

//     // ✅ FIXED: Properly structured attachments array
//     attachments: [
//       {
//         name: { type: String, required: true },
//         url: { type: String, required: true },
//         data: { type: Buffer },
//         type: { type: String }
//       }
//     ],

//     jobCategory: String,
//     jobType: String,
//     experienceLevel: String,

//     status: {
//       type: String,
//       enum: ["pending", "approved", "rejected"],
//       default: "pending",
//     },
//     adminNote: {
//       type: String,
//       default: "",
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,   // <-- DEFAULT DATE-TIME
//     },
//   },
//   { timestamps: true }
// );

// // ✅ FIX: Force schema reload to avoid Vercel/Mongoose model cache issues
// if (mongoose.models.Application) {
//   delete mongoose.connection.models["Application"];
// }

// export default mongoose.model("Application", applicationSchema);
import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: String, required: true },
  recruiterId: { type: String, required: true },
  userId: { type: String }, // આ ફિલ્ડ ઉમેરવું જરૂરી છે કારણ કે તમે API માં વાપરો છો
  name: String,
  email: String,
  role: String,
  resumeUrl: String,
  mobile: String,
  city: String,
  state: String,
  profession: String,
  
  // Education
  graduationUniversity: String,
  graduationSpecialization: String,
  graduationPercentage: String,
  classXIIPercentage: String,
  classXPercentage: String,
  
  // Work Experience
  presentEmploymentStatus: String,
  currentCompanyName: String,
  jobDepartment: String,
  jobIndustry: String,
  jobDescription: String,
  jobFromDate: String,
  jobToDate: String,
  
  // Skills & Socials
  skills: mongoose.Schema.Types.Mixed, 
  github: String,
  portfolio: String,
  // --- Freelance & Bidding Details ---
  bidAmount: { type: Number }, // કેન્ડિડેટ દ્વારા ભરેલી રકમ
  timeline: { type: String },  // કેટલા સમયમાં પ્રોજેક્ટ પૂરો કરશે (e.g. "5 Days")
  projectName: { type: String }, // પ્રોજેક્ટનું નામ જેના માટે બીડ કરી છે
  projectBrief: { type: String }, // કેન્ડિડેટનો પ્રોજેક્ટ વિશેનો શોર્ટ મેસેજ કે પ્રપોઝલ

  status: { type: String, default: "Pending" },
  appliedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Application || mongoose.model("Application", ApplicationSchema);