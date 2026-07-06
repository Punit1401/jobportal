//src/app/api/auth/register/route.js
export const dynamic = "force-dynamic";

import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/EmailOTP";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    await connectMongo();

    const { action, name, email, password, acceptedTerms, otp } = await req.json();

    /* --------------------------------------------------------
       1️⃣ ACTION → REGISTER USER
    -------------------------------------------------------- */
    if (action === "register") {
      if (!name || !email || !password) {
        return Response.json({ error: "All fields are required" }, { status: 400 });
      }

      if (!acceptedTerms) {
        return Response.json({ error: "You must accept Terms & Privacy Policy" }, { status: 400 });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return Response.json({ error: "Email already exists" }, { status: 400 });
      }

      const hashed = await bcrypt.hash(password, 10);

      await User.create({
        name,
        email,
        password: hashed,
        acceptedTerms: true,
        isVerified: false,
        role: "candidate",
      });

      return Response.json({ message: "User registered. Please verify OTP!" });
    }

    /* --------------------------------------------------------
       2️⃣ ACTION → SEND OTP
    -------------------------------------------------------- */
    if (action === "send-otp") {
      if (!email) return Response.json({ error: "Email required" }, { status: 400 });

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

      await OTP.create({ email, otp: otpCode, expiresAt });

      // SEND MAIL
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Your App" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your Email Verification Code",
        html: `
          <h2>Email Verification</h2>
          <h1>${otpCode}</h1>
          <p>OTP valid for <b>2 minutes</b>.</p>
        `
      });

      return Response.json({ message: "OTP sent!" });
    }

    /* --------------------------------------------------------
       3️⃣ ACTION → VERIFY OTP
    -------------------------------------------------------- */
    if (action === "verify-otp") {
      if (!email || !otp)
        return Response.json({ error: "Email & OTP required" }, { status: 400 });

      const record = await OTP.findOne({ email }).sort({ createdAt: -1 });

      if (!record) 
        return Response.json({ error: "OTP not found" }, { status: 400 });

      if (record.otp !== otp)
        return Response.json({ error: "Invalid OTP" }, { status: 400 });

      if (record.expiresAt < new Date())
        return Response.json({ error: "OTP expired" }, { status: 400 });

      await User.findOneAndUpdate({ email }, { isVerified: true });

      return Response.json({ message: "OTP verified successfully!" });
    }

    /* --------------------------------------------------------
       Invalid action
    -------------------------------------------------------- */
    return Response.json({ error: "Invalid action" }, { status: 400 });

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
