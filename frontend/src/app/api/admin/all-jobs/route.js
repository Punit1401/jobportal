import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job"; 
import CandidateJob from "@/models/CandidateJob"; 
import ServiceForm from "@/models/serviceform";
import Company from "@/models/Company"; // Populate માટે જરૂરી

export async function GET() {
  try {
    await connectMongo();

    // ૧. Recruiter Jobs (With Company Population)
    const recruiterJobs = await Job.find({}).populate("companyId").lean();
    
    // ૨. Candidate Jobs
    const candidateJobs = await CandidateJob.find({}).lean();

    // ૩. Service Provider Services
    const serviceJobs = await ServiceForm.find({}).lean();

    const formattedRecruiterJobs = recruiterJobs.map(job => ({
      ...job,
      postedByRole: "recruiter",
      // Frontend expects companyDetails for consistency
      companyDetails: {
        companyName: job.companyId?.name || "Unknown Company",
        email: job.companyId?.email || "N/A",
        mobile: job.companyId?.phone || "N/A",
      }
    }));

    const formattedCandidateJobs = candidateJobs.map(job => ({
      ...job,
      postedByRole: "candidate"
    }));

    const formattedServiceJobs = serviceJobs.map(service => ({
      ...service,
      _id: service._id,
      title: service.title,
      postedByRole: "serviceprovider",
      email: service.providerEmail,
      phone: service.providerMobile,
      salaryRange: `₹${service.price}`,
      location: "Service",
      experienceLevel: service.category,
      jobType: "Gig/Service",
      status: service.status === "active" ? "published" : "draft",
      companyDetails: {
        companyName: service.providerName,
        email: service.providerEmail,
        mobile: service.providerMobile,
      }
    }));

    const allJobs = [
      ...formattedRecruiterJobs, 
      ...formattedCandidateJobs, 
      ...formattedServiceJobs
    ];

    allJobs.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : 0;
      const dateB = b.createdAt ? new Date(b.createdAt) : 0;
      return dateB - dateA;
    });

    return NextResponse.json(allJobs, { status: 200 });
  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // ૧. Recruiter collection
    let deletedJob = await Job.findByIdAndDelete(id);

    // ૨. Candidate collection
    if (!deletedJob) {
      deletedJob = await CandidateJob.findByIdAndDelete(id);
    }

    // ૩. ServiceProvider collection
    if (!deletedJob) {
      deletedJob = await ServiceForm.findByIdAndDelete(id);
    }

    if (!deletedJob) {
      return NextResponse.json({ error: "Job not found in any collection" }, { status: 404 });
    }

    return NextResponse.json({ message: "Job deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}