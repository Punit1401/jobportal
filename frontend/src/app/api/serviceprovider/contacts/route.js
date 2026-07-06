import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all inquiries sent to this service provider
    const inquiries = await Inquiry.find({ providerEmail: session.user.email });

    // Identify unique customers from inquiries
    // If they were logged in, they have a userId. If not, we use their email.
    // However, for mailing list, we want to group them by email to avoid duplicates.
    const uniqueEmails = [...new Set(inquiries.map(inq => inq.email).filter(e => e))];
    
    // For each unique email, get the most recent inquiry data or User profile if exists
    const contacts = await Promise.all(uniqueEmails.map(async (email) => {
        const lastInq = await Inquiry.findOne({ email, providerEmail: session.user.email }).sort({ createdAt: -1 });
        const user = await User.findOne({ email });
        
        return {
            _id: lastInq._id, // Use last inquiry ID as reference
            userId: user?._id || null, 
            name: user?.name || lastInq.name,
            fullName: user?.name || lastInq.name,
            email: email,
            mobile: user?.phone || lastInq.phone,
            role: "Customer",
            city: lastInq.city || "N/A",
            status: "Inquired",
            profession: "Inquirer",
            message: lastInq.message
        };
    }));

    return NextResponse.json({ ok: true, data: contacts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
