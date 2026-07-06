import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";

export const dynamic = "force-dynamic";

// GET all jobs
export async function GET() {
  try {
    await connectMongo();
    const jobs = await Job.find().sort({ createdAt: -1 });
    return new Response(JSON.stringify(jobs), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to fetch jobs" }), { status: 500 });
  }
}

// POST (Add new job)
export async function POST(req) {
  try {
    await connectMongo();
    const data = await req.json();

    // Basic validation
    if (!data.title || !data.jobCategory || !data.experienceLevel || !data.type) {
      return new Response(JSON.stringify({ message: "Title, category, experience, and type are required" }), { status: 400 });
    }

    const job = await Job.create({
      title: data.title,
      company: data.company || "",
      location: data.location || "Remote",
      jobCategory: data.jobCategory,
      experienceLevel: data.experienceLevel,
      type: data.type,
      description: data.description || "",
      requirements: data.requirements || "",
      published: data.published || false,
      createdBy: data.userId || null,
    });

    return new Response(JSON.stringify(job), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
}

// PUT (Update job)
export async function PUT(req) {
  try {
    await connectMongo();
    const { id, ...data } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ message: "Job ID is required" }), { status: 400 });
    }

    const job = await Job.findByIdAndUpdate(
      id,
      {
        ...data,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!job) {
      return new Response(JSON.stringify({ message: "Job not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(job), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
}

// DELETE job
export async function DELETE(req) {
  try {
    await connectMongo();
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ message: "Job ID is required" }), { status: 400 });
    }

    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      return new Response(JSON.stringify({ message: "Job not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
}
