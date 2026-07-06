// //src/models/Recruiter.js
// import mongoose from "mongoose";

// const RecruiterSchema = new mongoose.Schema(
//   {
//     /* =============================
//        🔐 ACCOUNT DETAILS
//     ============================= */
//     fullName: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     username: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     password: {
//       type: String,
//       required: true,
//     },

//     mobile: {
//       type: String,
//       required: true,
//     },

//     role: {
//       type: String,
//       default: "recruiter",
//     },

//     /* =============================
//        🏢 COMPANY DETAILS
//     ============================= */
//     companyName: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     designation: {
//       type: String,
//       required: true,
//     },

//     location: {
//       type: String,
//       required: true,
//     },

//     /* =============================
//        📂 FILE UPLOADS (PATHS)
//     ============================= */
//     companyLogo: {
//       type: String,
//       default: null, // /uploads/logo.png
//     },

//     businessLicense: {
//       type: String,
//       default: null,
//     },

//     gstProof: {
//       type: String,
//       default: null,
//     },

//     /* =============================
//        🔐 VERIFICATION & STATUS
//     ============================= */
//     isEmailVerified: {
//       type: Boolean,
//       default: false,
//     },

//     isApproved: {
//       type: Boolean,
//       default: false, // Admin approval
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// /* =============================
//    ✅ SAFE EXPORT (Next.js)
// ============================= */
// export default mongoose.models.Recruiter ||
//   mongoose.model("Recruiter", RecruiterSchema);
// import mongoose from "mongoose";

// const RecruiterSchema = new mongoose.Schema(
//   {
//     fullName: { type: String, required: true, trim: true },
//     username: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     password: { type: String, required: true },
//     mobile: { type: String, required: true },
//     role: { type: String, default: "recruiter" },

//     companyName: { type: String, required: true, trim: true },
//     gstNumber: { type: String, required: true },
//     designation: { type: String, required: true },
//     location: { type: String, required: true },
//     address: { type: String, required: false },
//     city: { type: String, default: "" },
//     state: { type: String, default: "" },
//     pincode: { type: String, default: "" },
//     country: { type: String, default: "" },

//     registrationType: { type: String, enum: ['company', 'individual'], default: 'company' },
//     aadharNumber: { type: String, default: null },
//     panNumber: { type: String, default: null },

//     companyLogo: { type: String, default: null },
//     businessLicense: { type: String, default: null },
//     gstProof: { type: String, default: null },
//     aadharProof: { type: String, default: null }, 
//     panProof: { type: String, default: null },    

//     // --- પ્રોફાઇલ પેજ માટે નવા ફિલ્ડ્સ (ઉમેર્યા છે) ---
//     tagline: { type: String, default: "" },
//     industry: { type: String, default: "" },
//     website: { type: String, default: "" },
//     founded: { type: String, default: "" },
//     description: { type: String, default: "" },
//     profession: {
//       type: String,
//       default: ""
//     },
//     department: {
//       type: String,
//       default: ""
//     },
//     designation: { type: String, default: "" },
//     specialties: { type: [String], default: [] },
//     companySize: { type: String, default: "11-50 employees" },
//     logo: { type: String, default: null }, // પ્રોફાઇલ પિક્ચર/લોગો માટે

//     // ✅ આ નવા ફિલ્ડ્સ ઉમેરો
//     contactPersonName: { type: String, default: "" },
//     contactPersonNumber: { type: String, default: "" },
//     contactPersonEmail: { type: String, default: "" },
//     ownerName: { type: String, default: "" },
//     ownerNumber: { type: String, default: "" },
//     ownerEmail: { type: String, default: "" },

//     isEmailVerified: { type: Boolean, default: false },
//     isApproved: { type: Boolean, default: false },
//     isRejected: { type: Boolean, default: false }, 
//     status: { type: String, default: "pending" },  
//   },
//   { timestamps: true }
// );

import mongoose from "mongoose";

const RecruiterSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    role: { type: String, default: "recruiter" },
    companyName: { type: String, required: true, trim: true },

    // --- Profile Text Fields (Updated to match your frontend) ---
    gstNo: { type: String, default: "" },
    aadharNo: { type: String, default: "" },
    panNo: { type: String, default: "" },
    companyLicense: { type: String, default: "" }, // License number

    designation: { type: String, default: "" },
    location: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    country: { type: String, default: "" },
    recruiterType: { type: String }, // Placement Agency / Client
    companyType: { type: String },
    // --- File Proofs (Base64 Strings) ---
    // ફ્રન્ટએન્ડ માંથી જે નામ આવે છે તે જ અહીં રાખ્યા છે
    logo: { type: String, default: null },
    gstFile: { type: String, default: null },
    licenseFile: { type: String, default: null },
    aadharFile: { type: String, default: null },
    panFile: { type: String, default: null },

    registrationType: { type: String, enum: ['company', 'individual'], default: 'company' },

    tagline: { type: String, default: "" },
    industry: { type: String, default: "" },
    website: { type: String, default: "" },
    founded: { type: String, default: "" },
    description: { type: String, default: "" },
    profession: { type: String, default: "" },
    department: { type: String, default: "" },
    specialties: { type: [String], default: [] },
    companySize: { type: String, default: "11-50 employees" },

    contactPersonName: { type: String, default: "" },
    contactPersonNumber: { type: String, default: "" },
    contactPersonEmail: { type: String, default: "" },
    ownerName: { type: String, default: "" },
    ownerNumber: { type: String, default: "" },
    ownerEmail: { type: String, default: "" },

    // --- પેમેન્ટ અને એકાઉન્ટ એક્ટિવેશન ફિલ્ડ્સ (આ ઉમેરો) ---
    isPaid: { type: Boolean, default: false },        // પેમેન્ટ સ્ટેટસ
    paymentId: { type: String, default: null },       // Razorpay Payment ID (પુરાવા માટે)
    orderId: { type: String, default: null },         // Razorpay Order ID
    paidAt: { type: Date, default: null },            // પેમેન્ટ ક્યારે કર્યું તેની તારીખ
    paymentAmount: { type: Number, default: 0 },      // કેટલી રકમ ચૂકવી છે

    // --- નવું ઉમેરેલું: સબ્સ્ક્રિપ્શન અને લિમિટેશન લોજિક ---
    subscription: {
      planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", default: null },
      status: { type: String, enum: ["Active", "Expired", "None"], default: "None" },
      expiryDate: { type: Date, default: null },

      // લિમિટ ટ્રેકિંગ
      usedJobs: { type: Number, default: 0 },
      usedLeads: { type: Number, default: 0 },
      storageUsed: { type: Number, default: 0 }, // MB માં
      storageLimit: { type: Number, default: 100 } // MB માં (Default 100MB)
    },
    isEmailVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isRejected: { type: Boolean, default: false },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Recruiter || mongoose.model("Recruiter", RecruiterSchema);