import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { ScheduledMail } from "@/models/Mailing";
import Recruiter from "@/models/Recruiter";
import Application from "@/models/Application";
import Inquiry from "@/models/Inquiry";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Data Isolation: Filter by ownerId and ownerRole from session
    const campaigns = await ScheduledMail.find({ 
        ownerId: session.user.id,
        ownerRole: session.user.role
    }).sort({ createdAt: -1 }).limit(5);

    // Dynamic stats calculation
    let totalContacts = 0;
    if (session.user.role === "recruiter") {
      const recruiter = await Recruiter.findOne({ email: session.user.email });
      if (recruiter) {
        const applications = await Application.find({ recruiterId: recruiter._id });
        const userIds = [...new Set(applications.map(app => app.userId).filter(id => id))];
        totalContacts = userIds.length;
      }
    } else if (session.user.role === "serviceprovider") {
      const inquiries = await Inquiry.find({ providerEmail: session.user.email });
      const uniqueEmails = [...new Set(inquiries.map(inq => inq.email).filter(e => e))];
      totalContacts = uniqueEmails.length;
    }

    const allCampaigns = await ScheduledMail.find({ 
        ownerId: session.user.id,
        ownerRole: session.user.role
    });
    const totalEmailsSent = allCampaigns.reduce((acc, curr) => acc + (curr.recipientsCount || 0), 0);
    const totalOpens = allCampaigns.reduce((acc, curr) => acc + (curr.opens || 0), 0);
    const openRate = totalEmailsSent > 0 ? Math.round((totalOpens / totalEmailsSent) * 100) : 0;

    return NextResponse.json({ 
      ok: true, 
      data: campaigns,
      stats: {
        totalContacts,
        emailsSent: totalEmailsSent,
        openRate
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
