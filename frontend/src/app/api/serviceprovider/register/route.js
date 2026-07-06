export const dynamic = "force-dynamic";
import connectMongo from "@/lib/mongodb";
import ServiceProvider from "@/models/serviceprovider";
import OTP from "@/models/EmailOTP"; 
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises"; 
import path from "path";

export async function POST(req) {
  try {
    await connectMongo();
    const contentType = req.headers.get("content-type") || "";
    let action, email, data;

    // ✅ JSON અને FormData બંને માટે ડેટા હેન્ડલિંગ
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      action = formData.get("action");
      
      // --- 🚀 FILE UPLOAD LOGIC START ---
      if (action === "upload") {
        const file = formData.get("file");
        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");
        const filePath = path.join(process.cwd(), "public/uploads", filename);

        await writeFile(filePath, buffer);
        return NextResponse.json({ success: true, url: `/uploads/${filename}` });
      }
      // --- 🚀 FILE UPLOAD LOGIC END ---

      email = formData.get("email");
      data = Object.fromEntries(formData.entries());
    } else {
      const json = await req.json();
      action = json.action;
      email = json.email;
      data = json;
    }

    // 1. Send OTP
    if (action === "send-otp") {
      if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
      await OTP.deleteMany({ email });
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 
      await OTP.create({ email, otp: otpCode, expiresAt });
      
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"Shiven Jobs" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verification Code - Shiven Jobs",
        html: `<h2>Email Verification</h2><p>Your OTP code is: <b>${otpCode}</b></p>`
      });
      return NextResponse.json({ message: "OTP sent successfully!" });
    }

    // 2. Verify OTP
    if (action === "verify-otp") {
      const { otp } = data; 
      const record = await OTP.findOne({ email }).sort({ createdAt: -1 });
      if (!record || record.otp !== otp) return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 });
      return NextResponse.json({ message: "Verified successfully!" });
    }

    // 3. Register
    if (action === "register") {
      const { fullName, password, username, mobile } = data;

      const existing = await ServiceProvider.findOne({ $or: [{ email }, { username }] });
      if (existing) return NextResponse.json({ error: "User already exists" }, { status: 400 });

      const hashedPassword = await bcrypt.hash(password, 10);

      await ServiceProvider.create({
        fullName,
        username,
        email,
        mobile,
        password: hashedPassword,
        isVerified: true,
        status: "pending",
        role: "serviceprovider",
      });

      await OTP.deleteMany({ email });
      return NextResponse.json({ success: true, message: "Registered! Now please complete your profile." });
    }
  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ UPDATED PUT METHOD TO SAVE DOCUMENTS
export async function PUT(req) {
  try {
    await connectMongo();
    const data = await req.json();
    
    const { 
      email, 
      fullName, 
      providerName, 
      serviceCategory, 
      experience, 
      location, 
      mobile, 
      whatsappNumber,
      // KYC Fields
      aadharNumber,
      panNumber,
      gstNumber,
      aadharDoc,
      panDoc,
      gstDoc
    } = data;

    if (!email) return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });

    const updatedUser = await ServiceProvider.findOneAndUpdate(
      { email: email },
      { 
        $set: { 
          fullName, 
          providerName, 
          serviceCategory, 
          experience, 
          location, 
          mobile, 
          whatsappNumber,
          aadharNumber,
          panNumber,
          gstNumber,
          aadharDoc,
          panDoc,
          gstDoc
        } 
      },
      { new: true }
    );

    if (!updatedUser) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Update Error:", err);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}