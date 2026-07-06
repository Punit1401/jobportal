import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectMongo();
    const { email } = await req.json();

    if (!email) 
      return NextResponse.json({ message: "Email required" }, { status: 400 });

    // ✅ Check if user is registered
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "This email is not registered with us." },
        { status: 400 }
      );
    }

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpire = Date.now() + 10 * 60 * 1000; // 10 min

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetExpire;
    await user.save();

    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetURL = `${base.replace(/\/$/, "")}/reset-password/${resetToken}`;

    // Configure email transporter (example: Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html = `
      <h2>Password Reset</h2>
      <p>If you requested a password reset, click the link below (valid for 10 minutes):</p>
      <a href="${resetURL}" target="_blank">Reset password</a>
      <p>If you didn't request this, ignore this email.</p>
    `;

    await transporter.sendMail({
      to: email,
      subject: "Reset your password",
      html,
    });

    return NextResponse.json({ message: "Reset link sent to your registered email." });
    
  } catch (error) {
    console.error("Forgot-password error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
