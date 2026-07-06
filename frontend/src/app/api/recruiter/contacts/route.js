import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Application from "@/models/Application";
import Candidate from "@/models/Candidate";
import Recruiter from "@/models/Recruiter";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiter = await Recruiter.findOne({ email: session.user.email });
    if (!recruiter) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });

    // Fetch all applications for this recruiter's jobs to identify candidates
    const applications = await Application.find({ recruiterId: recruiter._id });

    // Get unique userIds from these applications
    const userIds = [...new Set(applications.map(app => app.userId).filter(id => id))];

    // Fetch Candidate profiles for these userIds
    const candidates = await Candidate.find({ userId: { $in: userIds } });

    // Map candidates to the format expected by the frontend
    const contacts = candidates.map(c => ({
      _id: c._id,
      userId: c.userId, // ✅ crucial for notifications
      name: c.fullName || c.name,
      fullName: c.fullName || c.name,
      email: c.email,
      mobile: c.mobile,
      role: c.position || c.profession || "Candidate",
      city: c.city,
      state: c.state,
      status: "Applied",
      profession: c.profession,
      skills: c.skills,
      resumeUrl: c.resume
    }));

    return NextResponse.json({ ok: true, data: contacts });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
