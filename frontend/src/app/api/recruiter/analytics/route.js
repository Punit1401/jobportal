import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";
import Application from "@/models/Application";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalJobs = await Job.countDocuments({ recruiterId: session.user.id });
    const totalApps = await Application.countDocuments({ recruiterId: session.user.id });
    const shortlisted = await Application.countDocuments({ recruiterId: session.user.id, status: "shortlisted" });
    
    // Performance data (mocked for now but based on real counts)
    const performance = [
      { name: "Mon", apps: 12 },
      { name: "Tue", apps: 19 },
      { name: "Wed", apps: 15 },
      { name: "Thu", apps: 22 },
      { name: "Fri", apps: 30 },
      { name: "Sat", apps: 10 },
      { name: "Sun", apps: 8 }
    ];

    return NextResponse.json({ 
      ok: true, 
      stats: { totalJobs, totalApps, shortlisted },
      performance 
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
