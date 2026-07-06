import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import CandidateJob from "@/models/CandidateJob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 1. GET ALL OR USER JOBS
export async function GET(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const isPublic = searchParams.get("public") === "true";

    // CAREERS PAGE માટે (જાહેરમાં બધી જોબ્સ બતાવવા)
    if (isPublic) {
      const publicJobs = await CandidateJob.find({
        isActive: true,
        status: "published"
      }).sort({ createdAt: -1 });
      return NextResponse.json(publicJobs);
    }

    // DASHBOARD માટે (લોગિન કરેલ યુઝરની પોતાની જોબ્સ)
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase().trim();

    // ફિલ્ટર: માત્ર લોગિન યુઝરના ઈમેલ સાથે મેચ થતી જોબ્સ
    const jobs = await CandidateJob.find({
      postedByEmail: userEmail
    }).sort({ createdAt: -1 });

    console.log(`Found ${jobs.length} jobs for user: ${userEmail}`);
    return NextResponse.json(jobs);
  } catch (err) {
    console.error("GET Error:", err);
    return NextResponse.json({ error: "Fetch error" }, { status: 500 });
  }
}

// 2. CREATE NEW JOB
export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const userEmail = session.user.email.toLowerCase().trim();

    // નવી જોબ ક્રિએટ કરતી વખતે ઈમેલ ફરજિયાત એડ કરવો
    const newJob = await CandidateJob.create({
      ...body,
      postedByEmail: userEmail,
      status: "published",
      isActive: true,
      postedAt: new Date()
    });

    console.log("New job created by:", userEmail);
    return NextResponse.json({ message: "Saved!", data: newJob }, { status: 201 });
  } catch (err) {
    console.error("POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 3. UPDATE JOB (PUT)
export async function PUT(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { _id, ...updateData } = body;
    const userEmail = session.user.email.toLowerCase().trim();

    // Security: ખાતરી કરો કે યુઝર માત્ર પોતાની જોબ જ એડિટ કરે છે
    const updatedJob = await CandidateJob.findOneAndUpdate(
      { _id: _id, postedByEmail: userEmail },
      { ...updateData },
      { new: true }
    );

    if (!updatedJob) {
      return NextResponse.json({ error: "Job not found or unauthorized access" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated!", data: updatedJob });
  } catch (err) {
    console.error("PUT Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 4. DELETE JOB
export async function DELETE(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userEmail = session.user.email.toLowerCase().trim();

    // Security: માત્ર પોતાની જોબ જ ડીલીટ થઈ શકે
    const deletedJob = await CandidateJob.findOneAndDelete({
      _id: id,
      postedByEmail: userEmail
    });

    if (!deletedJob) {
      return NextResponse.json({ error: "Job not found or unauthorized access" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully!" });
  } catch (err) {
    console.error("DELETE Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}