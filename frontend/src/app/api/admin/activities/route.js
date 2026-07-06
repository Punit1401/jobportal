// src/app/api/admin/activities/route.js
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import Job from "@/models/Job";
import Application from "@/models/Application";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongo();

    const [recentUsers, recentJobs, recentApplications] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).lean(),
      Job.find().sort({ createdAt: -1 }).limit(5).lean(),
      Application.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const activities = [];

    // Add recent users
    for (const u of recentUsers) {
      activities.push({
        type: "user",
        message: `🧑‍💼 New user ${u.name || "Unnamed"} registered.`,
        createdAt: u.createdAt,
      });
    }

    // Add recent jobs
    for (const j of recentJobs) {
      activities.push({
        type: "job",
        message: `💼 Job "${j.title}" added.`,
        createdAt: j.createdAt,
      });
    }

    // Add recent applications
    for (const a of recentApplications) {
      activities.push({
        type: "application",
        message: `📄 Application submitted by ${a.name || "Unknown"} for "${a.jobTitle || "Job"}".`,
        createdAt: a.createdAt,
      });
    }

    // Sort by newest
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return new Response(JSON.stringify({ activities }), { status: 200 });
  } catch (err) {
    console.error("Error fetching activities:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch activities" }), { status: 500 });
  }
}
