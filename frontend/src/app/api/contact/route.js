import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import ContactEnquiry from "@/models/ContactEnquiry";
import EmailOTP from "@/models/EmailOTP";
import { sendMail } from "@/lib/mailer";

export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();
    const { action, email } = body;

    if (action === "send-otp") {
      if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await EmailOTP.findOneAndUpdate(
        { email },
        { otp, expiresAt },
        { upsert: true, new: true }
      );

      await sendMail({
        to: email,
        subject: "Contact Form Verification OTP",
        html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Verification Code</h2>
          <p>Your OTP for the contact form is: <b style="font-size: 24px; color: #111;">${otp}</b></p>
          <p>This code will expire in 5 minutes.</p>
        </div>`
      });

      return NextResponse.json({ success: true, message: "OTP sent" });
    }

    if (action === "verify-otp") {
      const { otp } = body;
      const otpDoc = await EmailOTP.findOne({ email, otp });

      if (!otpDoc || otpDoc.expiresAt < new Date()) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
      }

      // We don't delete yet, it will be deleted by TTL or we can delete after form submission
      return NextResponse.json({ success: true, message: "Email verified" });
    }

    if (action === "submit-form") {
      const { formData } = body;
      const { name, mobile, subject, message } = formData;

      if (!name || !email || !message) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const enquiry = await ContactEnquiry.create({
        name,
        email,
        phone: mobile,
        subject,
        message,
        source: "Contact Us Form"
      });

      // Cleanup OTP
      await EmailOTP.deleteOne({ email });

      return NextResponse.json({ success: true, message: "Enquiry submitted successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (err) {
    console.error("Contact API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}