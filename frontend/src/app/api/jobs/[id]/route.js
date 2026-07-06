// src/app/api/jobs/route.js
export const dynamic = "force-dynamic";

import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const exp = searchParams.get("experienceLevel");

    const filter = {};
    if (type && type !== "All") filter.type = type;
    if (exp && exp !== "All") filter.experienceLevel = exp;

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();
    return new Response(JSON.stringify(jobs), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
