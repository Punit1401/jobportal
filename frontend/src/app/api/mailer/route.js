import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { ScheduledMail } from "@/models/Mailing";
import MailingList from "@/models/MailingList";
import Candidate from "@/models/Candidate";
import Inquiry from "@/models/Inquiry";
import { sendMail } from "@/lib/mailer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subject, message, listId, scheduledTime } = await req.json();

    if (!subject || !message || !listId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch the mailing list and verify ownership
    const list = await MailingList.findOne({ _id: listId, ownerId: session.user.id });
    if (!list) return NextResponse.json({ error: "Mailing list not found or access denied" }, { status: 404 });

    // 2. Extract emails based on role
    let emails = [];
    if (session.user.role === 'recruiter') {
        const members = await Candidate.find({ _id: { $in: list.members } });
        emails = members.map(m => m.email).filter(e => e);
    } else if (session.user.role === 'serviceprovider') {
        const members = await Inquiry.find({ _id: { $in: list.members } });
        emails = members.map(m => m.email).filter(e => e);
    }

    if (emails.length === 0) {
        return NextResponse.json({ error: "No recipients found in the selected list" }, { status: 400 });
    }

    const isScheduled = !!scheduledTime;
    
    // 3. Create Campaign Entry
    const campaign = await ScheduledMail.create({
      ownerId: session.user.id,
      ownerRole: session.user.role,
      subject,
      message,
      sentEmails: emails,
      recipientsCount: emails.length,
      scheduledTime: isScheduled ? new Date(scheduledTime) : new Date(),
      isSent: !isScheduled, // If not scheduled, it's starting now
    });

    // 4. If NOT scheduled, send immediately in background
    if (!isScheduled) {
        const emailPromises = emails.map(email => 
            sendMail({
                to: email,
                subject: subject,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #4f46e5;">Message from ${session.user.role === 'recruiter' ? 'Recruiter' : 'Service Provider'}</h2>
                        <div style="font-size: 16px; line-height: 1.6; color: #333;">
                            ${message.replace(/\n/g, '<br/>')}
                        </div>
                        <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
                        <p style="font-size: 12px; color: #999;">
                            This email was sent to you via Shiven Portal.
                        </p>
                    </div>
                `
            }).catch(err => console.error(`Failed to send to ${email}:`, err))
        );

        // Update campaign status after all promises settle
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
