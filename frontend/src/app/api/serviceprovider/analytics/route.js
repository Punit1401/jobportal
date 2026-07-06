import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import ServiceForm from "@/models/serviceform";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Filter by ServiceProvider's email (as used in Inquiry and ServiceForm)
    const totalGigs = await ServiceForm.countDocuments({ providerEmail: session.user.email });
    const totalInquiries = await Inquiry.countDocuments({ providerEmail: session.user.email });
    
    // Performance data (based on real inquiry counts by day of week)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const inquiries = await Inquiry.find({ 
        providerEmail: session.user.email,
        createdAt: { $gte: sevenDaysAgo }
    });

    const performance = [
      { name: "Mon", count: 0 },
      { name: "Tue", count: 0 },
      { name: "Wed", count: 0 },
      { name: "Thu", count: 0 },
      { name: "Fri", count: 0 },
      { name: "Sat", count: 0 },
      { name: "Sun", count: 0 }
    ];

    inquiries.forEach(inq => {
        const day = new Date(inq.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
        const pDay = performance.find(p => p.name === day);
        if (pDay) pDay.count += 1;
    });

    return NextResponse.json({ 
      ok: true, 
      stats: { totalGigs, totalInquiries },
      performance 
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
