import connectMongo from "@/lib/mongodb";
import ServiceProvider from "@/models/serviceprovider";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// 1. GET ALL PROVIDERS
export async function GET() {
  try {
    await connectMongo();
    const providers = await ServiceProvider.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, providers });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. UPDATE STATUS & SEND EMAIL (Recruiter Style)
export async function PUT(req) {
  try {
    await connectMongo();
    const { id, status } = await req.json();

    const isApproved = status === "approved";
    const isRejected = status === "rejected";

    const updatedProvider = await ServiceProvider.findByIdAndUpdate(
      id,
      { status, isApproved, isRejected },
      { new: true }
    );

    if (!updatedProvider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    // --- NODEMAILER SETUP ---
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // --- EMAIL TEMPLATE (Same as Recruiter) ---
    const mailOptions = {
      from: `"Shiven Jobs Admin" <${process.env.SMTP_USER}>`,
      to: updatedProvider.email,
      subject: isApproved 
        ? "Congratulations! Your Account is Approved - Shiven Jobs" 
        : "Update regarding your Account - Shiven Jobs",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: ${isApproved ? '#10b981' : '#ef4444'}; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Account ${isApproved ? 'Approved' : 'Rejected'}</h1>
          </div>
          <div style="padding: 30px; color: #333; line-height: 1.6;">
            <p style="font-size: 18px;">Hello <b>${updatedProvider.fullName}</b>,</p>
            
            ${isApproved 
              ? `<p>We are pleased to inform you that your <b>Service Provider</b> account has been verified and approved by our team.</p>
                 <p>You can now log in to your dashboard and start listing your services like <b>${updatedProvider.serviceCategory}</b>.</p>
                 <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login" style="background-color: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Login to Dashboard</a>
                 </div>`
              : `<p>We regret to inform you that your registration as a Service Provider could not be approved at this time.</p>
                 <p><b>Reason:</b> Document verification failed or incomplete information.</p>
                 <p>If you believe this is a mistake, please reach out to our support team with valid documents.</p>`
            }
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 12px; color: #888; text-align: center;">
              This is an automated message from Shiven Jobs. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: `Provider ${status} and email sent successfully!` 
    });

  } catch (err) {
    console.error("ADMIN_API_ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}