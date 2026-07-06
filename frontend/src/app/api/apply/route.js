import connectMongo from "@/lib/mongodb";
import Application from "@/models/Application";
import Job from "@/models/Job";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";
//export const config = { api: { bodyParser: false } };

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ message: "Login required" }), { status: 401 });
    }

    const formData = await req.formData();
    const jobId = formData.get("jobId");
    const resumeFile = formData.get("resume");
    const price = Number(formData.get("price"));
    const estimatedDays = Number(formData.get("estimatedDays"));
    const coverLetter = formData.get("coverLetter");

    if (!jobId || !resumeFile || Number.isNaN(price) || Number.isNaN(estimatedDays) || !coverLetter) {
      return new Response(JSON.stringify({ message: "Missing required fields or resume" }), { status: 400 });
    }

    const job = await Job.findById(jobId);
    if (!job) return new Response(JSON.stringify({ message: "Job not found" }), { status: 404 });

    // Prevent duplicate application
    const exists = await Application.findOne({ job: jobId, candidate: session.user.id });
    if (exists) return new Response(JSON.stringify({ message: "Already applied" }), { status: 400 });

    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());

    const app = await Application.create({
      job: job._id,
      candidate: session.user.id,
      name: session.user.name,
      email: session.user.email,
      phone: formData.get("phone") || "",
      linkedIn: formData.get("linkedIn") || "",
      portfolio: formData.get("portfolio") || "",
      price,
      estimatedDays,
      coverLetter,
      attachments: [{
        name: resumeFile.name,
        data: resumeBuffer,
        type: resumeFile.type,
      }],
      jobCategory: job.jobCategory,
      jobType: job.type,
      experienceLevel: job.experienceLevel,
    });

    return new Response(JSON.stringify({ message: "Application submitted", application: app }), { status: 201 });
  } catch (err) {
    console.error("Application error:", err);
    return new Response(JSON.stringify({ message: "Failed to submit application", error: err.message }), { status: 500 });
  }
}
