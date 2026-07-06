import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { ScheduledMail } from "@/models/Mailing";
import MailingList from "@/models/MailingList";
import Recruiter from "@/models/Recruiter";
import { sendMail } from "@/lib/mailer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const recruiter = await Recruiter.findOne({ email: session.user.email });
    if (!recruiter) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });

    const { subject, message, listId, scheduledTime } = await req.json();

    if (!subject || !message || !listId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const list = await MailingList.findById(listId).populate("members");
    if (!list) return NextResponse.json({ error: "Mailing list not found" }, { status: 404 });

    const emails = list.members.map(m => m.email).filter(e => e);

    if (emails.length === 0) {
        return NextResponse.json({ error: "No candidates found in the selected list" }, { status: 400 });
    }

    const isScheduled = !!scheduledTime;
    
    const campaign = await ScheduledMail.create({
      recruiterId: recruiter._id,
      subject,
      message,
      sentEmails: emails,
      recipientsCount: emails.length,
      scheduledTime: isScheduled ? new Date(scheduledTime) : new Date(),
      isSent: false, // Default to false
    });

    // If NOT scheduled, send immediately
    if (!isScheduled) {
        // Send emails in background (don't await all if list is huge, but for now we try)
        // We use individual sending to avoid being marked as spam or hitting single-to limits
        const emailPromises = emails.map(email => 
            sendMail({
                to: email,
                subject: subject,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #4f46e5;">Job Update from Recruiter</h2>
                        <div style="font-size: 16px; line-height: 1.6; color: #333;">
                            ${message.replace(/\n/g, '<br/>')}
                        </div>
                        <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
                        <p style="font-size: 12px; color: #999;">
                            This email was sent to you because you applied for a job on our portal.
                        </p>
                    </div>
                `
            }).catch(err => console.error(`Failed to send to ${email}:`, err))
        );

        // We don't want to wait for ALL emails to finish before responding to user 
        // because it might timeout the request.
        // However, for immediate feedback in dev, we can wait a bit or use a flag.
        Promise.allSettled(emailPromises).then(async () => {
            campaign.isSent = true;
            await campaign.save();
        });
    }

    return NextResponse.json({ ok: true, data: campaign, message: isScheduled ? "Campaign scheduled successfully" : "Campaign started successfully" });
  } catch (err) {
    console.error("Mailer Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
