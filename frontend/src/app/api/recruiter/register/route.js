// // src/app/api/recruiter/register/route.js
// export const dynamic = "force-dynamic";

// import connectMongo from "@/lib/mongodb";
// import Recruiter from "@/models/Recruiter";
// import OTP from "@/models/EmailOTP";
// import bcrypt from "bcryptjs";
// import nodemailer from "nodemailer";

// export async function GET(req) {  
//   try {
//     await connectMongo();
//     const { searchParams } = new URL(req.url);
//     const action = searchParams.get("action");
//     const email = searchParams.get("email");

//     if (action === "get-profile") {
//       if (!email) return Response.json({ error: "Email required" }, { status: 400 });
//       const data = await Recruiter.findOne({ email: email.toLowerCase().trim() });
//       return Response.json({ data: data });
//     }
//     return Response.json({ error: "Invalid action" }, { status: 400 });
//   } catch (err) {
//     return Response.json({ error: err.message }, { status: 500 });
//   }
// }

// export async function POST(req) {
//   try {
//     await connectMongo();
//     const body = await req.json();

//     // Only these fields from your frontend form
//     const { 
//       action, 
//       email, 
//       otp, 
//       password, 
//       fullName, 
//       username, 
//       mobile, 
//       companyName 
//     } = body;

//     const sanitizedEmail = email?.toLowerCase().trim();

//     // --- Action: Send OTP ---
//     if (action === "send-otp") {
//       const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
//       await OTP.deleteMany({ email: sanitizedEmail });
//       await OTP.create({ email: sanitizedEmail, otp: otpCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
//       });

//       await transporter.sendMail({
//         from: `"Shiven Jobs" <${process.env.SMTP_USER}>`,
//         to: sanitizedEmail,
//         subject: "Verification Code",
//         html: `<h1>${otpCode}</h1>`
//       });
//       return Response.json({ message: "OTP sent!" });
//     }

//     // --- Action: Verify OTP ---
//     if (action === "verify-otp") {
//       const record = await OTP.findOne({ email: sanitizedEmail }).sort({ createdAt: -1 });
//       if (!record || record.otp !== otp) return Response.json({ error: "Invalid OTP" }, { status: 400 });
//       return Response.json({ message: "Verified" });
//     }

//     // --- Action: Register ---
//     if (action === "register") {
//       const existing = await Recruiter.findOne({ $or: [{ email: sanitizedEmail }, { username }] });
//       if (existing) return Response.json({ error: "User already exists" }, { status: 400 });

//       const hashed = await bcrypt.hash(password, 10);

//       // We only provide what is in your form. 
//       // IMPORTANT: If the model still fails, you MUST go to /models/Recruiter.js 
//       // and remove "required: true" from gstNumber, location, and registrationType.
//       const newRecruiter = await Recruiter.create({
//         fullName,
//         username,
//         email: sanitizedEmail,
//         mobile,
//         companyName,
//         password: hashed,
//         registrationType: "company", // 'Company' (Capital) ને બદલે 'company' (Small)
//         isEmailVerified: true,
//         isApproved: false,
//         status: "pending",
//         role: "recruiter"
//       });

//       await OTP.deleteMany({ email: sanitizedEmail });
//       return Response.json({ message: "Registered successfully!", data: newRecruiter });
//     }

//     return Response.json({ error: "Invalid action" }, { status: 400 });
//   } catch (err) {
//     // This will tell us exactly which field is still causing trouble
//     return Response.json({ error: "Server error: " + err.message }, { status: 500 });
//   }
// }

// src/app/api/recruiter/register/route.js
export const dynamic = "force-dynamic";

import connectMongo from "@/lib/mongodb";
import Recruiter from "@/models/Recruiter";
import OTP from "@/models/EmailOTP";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function GET(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const email = searchParams.get("email");

    if (action === "get-profile") {
      if (!email) return Response.json({ error: "Email required" }, { status: 400 });
      const data = await Recruiter.findOne({ email: email.toLowerCase().trim() });
      return Response.json({ data: data });
    }
    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();

    const {
      action,
      email,
      otp,
      password,
      fullName,
      username,
      mobile,
      companyName
    } = body;

    const sanitizedEmail = email?.toLowerCase().trim();

    // --- Action: Send OTP ---
    if (action === "send-otp") {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await OTP.deleteMany({ email: sanitizedEmail });
      await OTP.create({ email: sanitizedEmail, otp: otpCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: `"Shiven Jobs" <${process.env.SMTP_USER}>`,
        to: sanitizedEmail,
        subject: "Verification Code",
        html: `<h1>${otpCode}</h1>`
      });
      return Response.json({ message: "OTP sent!" });
    }

    // --- Action: Verify OTP ---
    if (action === "verify-otp") {
      const record = await OTP.findOne({ email: sanitizedEmail }).sort({ createdAt: -1 });
      if (!record || record.otp !== otp) return Response.json({ error: "Invalid OTP" }, { status: 400 });
      return Response.json({ message: "Verified" });
    }

    // --- Action: Update Profile ---
    if (action === "update-profile") {
      if (!sanitizedEmail) return Response.json({ error: "Email required" }, { status: 400 });

      // action ને અલગ કરો અને બાકીનો બધો જ ડેટા (Text + Files) updateData માં લો
      const { action: _, email: __, ...updateData } = body;

      const updated = await Recruiter.findOneAndUpdate(
        { email: sanitizedEmail },
        { $set: updateData }, // $set વાપરવાથી જે ફિલ્ડ મોકલ્યા હશે તે જ અપડેટ થશે
        { new: true, runValidators: false } // validation ઓફ કરો જો મોડેલમાં પ્રશ્ન હોય તો
      );

      if (!updated) return Response.json({ error: "Recruiter not found" }, { status: 404 });
      return Response.json({ message: "Profile Updated!", data: updated });
    }

    // --- Action: Register ---
    if (action === "register") {
      const existing = await Recruiter.findOne({ $or: [{ email: sanitizedEmail }, { username }] });
      if (existing) return Response.json({ error: "User already exists" }, { status: 400 });

      const hashed = await bcrypt.hash(password, 10);

      const newRecruiter = await Recruiter.create({
        fullName,
        username,
        email: sanitizedEmail,
        mobile,
        companyName,
        password: hashed,
        registrationType: "company",
        isEmailVerified: true,
        isApproved: false,
        status: "pending",
        role: "recruiter"
      });

      await OTP.deleteMany({ email: sanitizedEmail });
      return Response.json({ message: "Registered successfully!", data: newRecruiter });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: "Server error: " + err.message }, { status: 500 });
  }
}