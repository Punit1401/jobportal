// src/app/api/admin/stats/route.js
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import Job from "@/models/Job";
import Application from "@/models/Application";
 // if you have this model

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongo();

    const [usersCount, jobsCount, applicationsCount, ] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
     
    ]);

    return new Response(
      JSON.stringify({
        users: usersCount,
        jobs: jobsCount,
        applications: applicationsCount,
       
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch stats" }), { status: 500 });
  }
}
