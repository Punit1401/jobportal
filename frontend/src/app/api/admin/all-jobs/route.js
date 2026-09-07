import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import mongoose from "mongoose";
import Job from "@/models/Job"; 
import CandidateJob from "@/models/CandidateJob"; 
import ServiceForm from "@/models/serviceform";
import AggregatedJob from "@/models/AggregatedJob";
import Company from "@/models/Company"; // Required for Population
import Recruiter from "@/models/Recruiter";

export async function GET() {
  try {
    await connectMongo();

    // 1. Recruiter Jobs (With Company Population)
    const recruiterJobs = await Job.find({}).populate("companyId").lean();
    
    // 2. Candidate Jobs
    const candidateJobs = await CandidateJob.find({}).lean();

    // 3. Service Provider Services
    const serviceJobs = await ServiceForm.find({}).lean();

    // 4. Aggregated Jobs
    const aggregatedJobs = await AggregatedJob.find({}).lean();

    const formattedRecruiterJobs = [];
    for (const job of recruiterJobs) {
      let recruiter = null;
      if (job.recruiterId) {
        recruiter = await Recruiter.findOne({ 
          $or: [
            { _id: mongoose.isValidObjectId(job.recruiterId) ? job.recruiterId : new mongoose.Types.ObjectId() },
            { userId: job.recruiterId },
            { username: job.recruiterId }
          ] 
        }).lean();
        if (!recruiter && mongoose.isValidObjectId(job.recruiterId)) {
          recruiter = await Recruiter.findById(job.recruiterId).lean();
        }
      }

      const email = recruiter?.email || job.companyId?.email || "N/A";
      const mobile = recruiter?.mobile || job.companyId?.phone || "N/A";
      const companyName = recruiter?.companyName || job.companyId?.name || "Unknown Company";

      formattedRecruiterJobs.push({
        ...job,
        postedByRole: "recruiter",
        companyDetails: {
          companyName,
          email,
          mobile,
        }
      });
    }

    const formattedCandidateJobs = candidateJobs.map(job => ({
      ...job,
      postedByRole: "candidate",
      companyDetails: {
        companyName: job.companyDetails?.companyName || "Candidate Job",
        email: job.companyDetails?.email || job.postedByEmail || "N/A",
        mobile: job.companyDetails?.mobile || job.applyPhone || "N/A",
      }
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
      status: service.status === "active" ? "published" : service.status === "negative" ? "negative" : "draft",
      companyDetails: {
        companyName: service.providerName,
        email: service.providerEmail,
        mobile: service.providerMobile,
      }
    }));

    const formattedAggregatedJobs = aggregatedJobs.map(aggJob => ({
      ...aggJob,
      _id: aggJob._id,
      title: aggJob.title,
      postedByRole: "candidate",
      email: aggJob.applyContact?.email || "N/A",
      phone: aggJob.applyContact?.phone || "N/A",
      salaryRange: aggJob.salary || "Not Specified",
      location: aggJob.location || "Remote",
      experienceLevel: aggJob.experience || "N/A",
      jobType: aggJob.employmentType || "Full-time",
      status: aggJob.status === "live" ? "published" : aggJob.status === "negative" ? "negative" : aggJob.status,
      companyDetails: {
        companyName: aggJob.company || aggJob.sourceLabel || "Aggregated Job",
        email: aggJob.applyContact?.email || "N/A",
        mobile: aggJob.applyContact?.phone || "N/A",
      }
    }));

    const allJobs = [
      ...formattedRecruiterJobs, 
      ...formattedCandidateJobs, 
      ...formattedServiceJobs,
      ...formattedAggregatedJobs
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

    // 1. Recruiter collection
    let deletedJob = await Job.findByIdAndDelete(id);

    // 2. Candidate collection
    if (!deletedJob) {
      deletedJob = await CandidateJob.findByIdAndDelete(id);
    }

    // 3. ServiceProvider collection
    if (!deletedJob) {
      deletedJob = await ServiceForm.findByIdAndDelete(id);
    }

    // 4. AggregatedJob collection
    if (!deletedJob) {
      deletedJob = await AggregatedJob.findByIdAndDelete(id);
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

export async function PUT(req) {
  try {
    await connectMongo();
    const body = await req.json();
    const { id, title, companyName, location, salaryRange, experienceLevel, description, jobType, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Build update payload
    const updateObj = {};
    if (title !== undefined) updateObj.title = title;
    if (companyName !== undefined) updateObj.companyName = companyName;
    if (location !== undefined) updateObj.location = location;
    if (salaryRange !== undefined) updateObj.salaryRange = salaryRange;
    if (experienceLevel !== undefined) updateObj.experienceLevel = experienceLevel;
    if (description !== undefined) updateObj.description = description;
    if (jobType !== undefined) updateObj.jobType = jobType;
    if (status !== undefined) updateObj.status = status;

    // 1. Check Job collection
    let updatedJob = await Job.findByIdAndUpdate(id, updateObj, { new: true });

    // 2. Check CandidateJob collection
    if (!updatedJob) {
      updatedJob = await CandidateJob.findByIdAndUpdate(id, {
        ...updateObj,
        ...(companyName ? { "companyDetails.companyName": companyName } : {})
      }, { new: true });
    }

    // 3. Check ServiceForm collection
    if (!updatedJob) {
      updatedJob = await ServiceForm.findByIdAndUpdate(id, {
        ...(title ? { title } : {}),
        ...(salaryRange ? { price: parseFloat(salaryRange.replace(/[^0-9.]/g, "")) || 0 } : {}),
        ...(experienceLevel ? { category: experienceLevel } : {}),
        ...(status ? { status: status === "published" ? "active" : status === "negative" ? "negative" : "draft" } : {}),
        ...(companyName ? { providerName: companyName } : {})
      }, { new: true });
    }

    // 4. Check AggregatedJob collection
    if (!updatedJob) {
      updatedJob = await AggregatedJob.findByIdAndUpdate(id, {
        ...(status ? { status: status === "active" ? "live" : status } : {}),
        ...(title ? { title } : {}),
        ...(companyName ? { company: companyName } : {}),
        ...(location ? { location } : {}),
        ...(description ? { description } : {})
      }, { new: true });
    }

    if (!updatedJob) {
      return NextResponse.json({ error: "Job not found in any collection" }, { status: 404 });
    }

    return NextResponse.json({ message: "Job updated successfully", job: updatedJob }, { status: 200 });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}