import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";

export const dynamic = "force-dynamic";
import Application from "@/models/Application";
import Candidate from "@/models/Candidate";
import Recruiter from "@/models/Recruiter";
import User from "@/models/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    console.log("contacts API session:", session);
    if (!session || !session.user) {
      console.log("contacts API session is null");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiterEmail = session.user.email.toLowerCase().trim();
    console.log("contacts API recruiter email:", recruiterEmail);
    const recruiter = await Recruiter.findOne({ email: { $regex: new RegExp("^" + recruiterEmail + "$", "i") } });
    if (!recruiter) {
      console.log("contacts API Recruiter not found for:", recruiterEmail);
      return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });
    }
    console.log("contacts API recruiter found:", recruiter._id);

    // Fetch all applications for this recruiter's jobs to identify candidates
    const applications = await Application.find({ recruiterId: recruiter._id });
    console.log("contacts API applications found:", applications.length);

    // Get unique userIds from these applications
    const userIds = [...new Set(applications.map(app => app.userId).filter(id => id))];
    console.log("contacts API unique userIds count:", userIds.length);

    // Fetch Candidate profiles for these userIds
    const candidates = await Candidate.find({ userId: { $in: userIds } });
    console.log("contacts API candidates found:", candidates.length);

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

    console.log("contacts API returning contacts count:", contacts.length);
    return NextResponse.json({ ok: true, data: contacts });
  } catch (err) {
    console.error("contacts API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiterEmail = session.user.email.toLowerCase().trim();
    const recruiter = await Recruiter.findOne({ email: { $regex: new RegExp("^" + recruiterEmail + "$", "i") } });
    if (!recruiter) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });

    const body = await req.json();
    const isArray = Array.isArray(body);
    const contactsToProcess = isArray ? body : [body];

    const results = [];

    for (const item of contactsToProcess) {
      const { name, email, mobile, role, city, state, status } = item;
      if (!name || !email) continue;

      const normalizedEmail = email.trim().toLowerCase();

      // 1. Check if Candidate already exists with this email
      let candidate = await Candidate.findOne({ email: normalizedEmail });

      if (!candidate) {
        // Create a shadow User first since userId is required
        const shadowUser = await User.create({
          email: normalizedEmail,
          role: "user",
          name: name.trim(),
        });

        candidate = await Candidate.create({
          userId: shadowUser._id,
          fullName: name.trim(),
          email: normalizedEmail,
          mobile: String(mobile || "").trim(),
          position: (role || "Candidate").trim(),
          profession: (role || "Candidate").trim(),
          city: String(city || "").trim(),
          state: String(state || "").trim(),
        });
      } else {
        // Update candidate details if they exist
        candidate.fullName = name.trim() || candidate.fullName;
        candidate.mobile = String(mobile || "").trim() || candidate.mobile;
        candidate.position = (role || "Candidate").trim() || candidate.position;
        candidate.profession = (role || "Candidate").trim() || candidate.profession;
        candidate.city = String(city || "").trim() || candidate.city;
        candidate.state = String(state || "").trim() || candidate.state;
        await candidate.save();
      }

      // 2. To link this candidate to the recruiter, we can create an Application entry
      const existingApp = await Application.findOne({
        recruiterId: recruiter._id,
        userId: candidate.userId,
      });

      if (!existingApp) {
        await Application.create({
          jobId: "manual",
          recruiterId: recruiter._id.toString(),
          userId: candidate.userId,
          title: (role || "Candidate").trim(),
          status: status || "Applied",
          fullName: name.trim(),
          email: normalizedEmail,
          mobile: String(mobile || "").trim(),
        });
      } else {
        existingApp.status = status || existingApp.status;
        await existingApp.save();
      }
      results.push(candidate);
    }

    return NextResponse.json({ ok: true, count: results.length });
  } catch (err) {
    console.error("POST /api/recruiter/contacts error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiterEmail = session.user.email.toLowerCase().trim();
    const recruiter = await Recruiter.findOne({ email: { $regex: new RegExp("^" + recruiterEmail + "$", "i") } });
    if (!recruiter) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });

    const body = await req.json();
    const { id, name, email, mobile, role, city, state, status } = body;

    if (!id || !name || !email) {
      return NextResponse.json({ error: "ID, Name and Email are required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Update Candidate profile
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    candidate.fullName = name.trim();
    candidate.email = normalizedEmail;
    candidate.mobile = String(mobile || "").trim();
    candidate.position = (role || "Candidate").trim();
    candidate.profession = (role || "Candidate").trim();
    candidate.city = String(city || "").trim();
    candidate.state = String(state || "").trim();
    await candidate.save();

    // 2. Update shadow User email/name if needed
    const user = await User.findById(candidate.userId);
    if (user) {
      user.name = name.trim();
      user.email = normalizedEmail;
      await user.save();
    }

    // 3. Update Application linking to this Recruiter
    const existingApp = await Application.findOne({
      recruiterId: recruiter._id,
      userId: candidate.userId,
    });

    if (existingApp) {
      existingApp.title = (role || "Candidate").trim();
      existingApp.status = status || "Applied";
      existingApp.fullName = name.trim();
      existingApp.email = normalizedEmail;
      existingApp.mobile = String(mobile || "").trim();
      await existingApp.save();
    } else {
      await Application.create({
        jobId: "manual",
        recruiterId: recruiter._id.toString(),
        userId: candidate.userId,
        title: (role || "Candidate").trim(),
        status: status || "Applied",
        fullName: name.trim(),
        email: normalizedEmail,
        mobile: String(mobile || "").trim(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/recruiter/contacts error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiterEmail = session.user.email.toLowerCase().trim();
    const recruiter = await Recruiter.findOne({ email: { $regex: new RegExp("^" + recruiterEmail + "$", "i") } });
    if (!recruiter) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const singleId = searchParams.get("id");

    let candidateIds = [];

    if (singleId) {
      candidateIds = [singleId];
    } else {
      const body = await req.json();
      candidateIds = body.ids || [];
    }

    if (candidateIds.length === 0) {
      return NextResponse.json({ error: "No contact IDs provided" }, { status: 400 });
    }

    // Find the candidates to retrieve their userIds
    const candidates = await Candidate.find({ _id: { $in: candidateIds } });
    const userIds = candidates.map(c => c.userId);

    // Delete the application links
    await Application.deleteMany({
      recruiterId: recruiter._id,
      userId: { $in: userIds }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/recruiter/contacts error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
