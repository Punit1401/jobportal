export const dynamic = "force-dynamic";

import connectMongo from "@/lib/mongodb";
import OTP from "@/models/EmailOTP"; // તમારું અસ્તિત્વમાં રહેલું મોડલ
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    await connectMongo();

    const { action, email, otp, formData } = await req.json();

    // 1️⃣ ACTION → SEND OTP (Contact Form વેરિફિકેશન માટે)
    if (action === "send-otp") {
      if (!email) return Response.json({ error: "Email required" }, { status: 400 });

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 mins expiry

      await OTP.create({ email, otp: otpCode, expiresAt });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Contact Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verification Code for Contact Form",
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2>Contact Verification</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #4f46e5; letter-spacing: 5px;">${otpCode}</h1>
            <p>This code will expire in 2 minutes.</p>
          </div>
        `
      });

      return Response.json({ message: "OTP sent successfully!" });
    }

    // 2️⃣ ACTION → VERIFY OTP
    if (action === "verify-otp") {
      if (!email || !otp) return Response.json({ error: "Email & OTP required" }, { status: 400 });

      const record = await OTP.findOne({ email }).sort({ createdAt: -1 });

      if (!record) return Response.json({ error: "OTP not found" }, { status: 400 });
      if (record.otp !== otp) return Response.json({ error: "Invalid OTP" }, { status: 400 });
      if (record.expiresAt < new Date()) return Response.json({ error: "OTP expired" }, { status: 400 });

      // વેરિફિકેશન સફળ થયા પછી રેકોર્ડ ડિલીટ કરી શકાય
      await OTP.deleteOne({ _id: record._id });

      return Response.json({ success: true, message: "Email verified!" });
    }

    // 3️⃣ ACTION → SUBMIT FORM (જ્યારે યુઝર વેરિફાઈ થયા પછી ફોર્મ સબમિટ કરે)
    if (action === "submit-form") {
      const { name, subject, message } = formData;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // એડમિનને જાણ કરવા માટે
      await transporter.sendMail({
        from: `"${name}" <${email}>`,
        to: process.env.SMTP_USER, // તમારો પોતાનો ઈમેલ (Admin Email)
        subject: `New Inquiry: ${subject}`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Subject:</b> ${subject}</p>
          <p><b>Message:</b></p>
          <p>${message}</p>
        `
      });

      return Response.json({ message: "Thank you! Your message has been sent." });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 