import connectMongo from "@/lib/mongodb";
import Recruiter from "@/models/Recruiter";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
export const revalidate = 0; // This will prevent API caching and always provide fresh data
export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (email) {
      const recruiter = await Recruiter.findOne({ email });
      if (!recruiter) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true, recruiter });
    }

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- Change here: Will only show recruiters whose profiles are filled ---
    const recruiters = await Recruiter.find({
      $or: [
        { gstNo: { $exists: true, $ne: "" } },
        { panNo: { $exists: true, $ne: "" } },
        { logo: { $exists: true, $ne: null } }
      ]
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, recruiters });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectMongo();
    const { id, status, isRejected } = await req.json();

    let updateData = isRejected 
      ? { isApproved: false, isRejected: true, status: "rejected" }
      : { isApproved: status, isRejected: false, status: status ? "approved" : "pending" };

    const updated = await Recruiter.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // --- Email Logic ---
    let subject = "";
    let htmlContent = "";

    if (updated.status === "approved") {
      subject = "Account Approved - Shiven Jobs 🎉";
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: auto; color: #334155;">
          <h2 style="color: #4F46E5; margin-bottom: 20px;">Hello ${updated.fullName},</h2>
          <p style="font-size: 16px; line-height: 1.6;">Congratulations! Your recruiter profile for <b>${updated.companyName}</b> has been successfully <b>approved</b> by our admin team.</p>
          <p style="font-size: 16px; line-height: 1.6;">You can now access your dashboard to post new job openings and manage candidates.</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.NEXTAUTH_URL}/login" 
               style="background-color: #4F46E5; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
               Login to Your Dashboard
            </a>
          </div>

          <p style="font-size: 14px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            Best Regards,<br/>
            <strong>Team Shiven Jobs</strong>
          </p>
        </div>`;
    } else if (updated.status === "rejected") {
      subject = "Update regarding your Recruiter Account";
      htmlContent = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #fee2e2; border-radius: 10px; max-width: 600px; margin: auto;">
          <h2 style="color: #ef4444;">Hello ${updated.fullName},</h2>
          <p>We reviewed your application for <b>${updated.companyName}</b>, but unfortunately, we cannot approve your account at this time due to incomplete or invalid documentation.</p>
          <p>Please contact support if you think this is a mistake.</p>
          <p style="margin-top: 20px; font-size: 12px; color: #64748b;">Team Shiven Jobs</p>
        </div>`;
    }

    if (subject) {
      try {
        await transporter.sendMail({
          from: `"Shiven Jobs" <${process.env.SMTP_USER}>`,
          to: updated.email,
          subject,
          html: htmlContent,
        });
      } catch (emailErr) {
        console.warn("Failed to send recruiter verification email:", emailErr.message);
      }
    }

    return NextResponse.json({ success: true, updatedRecruiter: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete recruiter by id
export async function DELETE(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await Recruiter.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Recruiter deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}