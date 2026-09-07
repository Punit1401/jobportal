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
    const totalApps = await Application.countDocuments({ recruiterId: session.user.id, jobId: { $ne: "manual" } });
    const shortlisted = await Application.countDocuments({ recruiterId: session.user.id, status: { $regex: /^shortlisted$/i }, jobId: { $ne: "manual" } });

    // Calculate dynamic weekly performance data based on our portal applications
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const apps = await Application.find({
      recruiterId: session.user.id,
      jobId: { $ne: "manual" },
      appliedAt: { $gte: sevenDaysAgo }
    });

    const performance = [
      { name: "Mon", apps: 0 },
      { name: "Tue", apps: 0 },
      { name: "Wed", apps: 0 },
      { name: "Thu", apps: 0 },
      { name: "Fri", apps: 0 },
      { name: "Sat", apps: 0 },
      { name: "Sun", apps: 0 }
    ];

    apps.forEach(app => {
      const day = new Date(app.appliedAt || app.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      const pDay = performance.find(p => p.name === day);
      if (pDay) pDay.apps += 1;
    });

    return NextResponse.json({
      ok: true,
      stats: { totalJobs, totalApps, shortlisted },
      performance
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
