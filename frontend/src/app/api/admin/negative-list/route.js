import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import GovtResource from "@/models/GovtResource";
import Program from "@/models/Program";
import Exam from "@/models/Exam";
import Job from "@/models/Job";
import CandidateJob from "@/models/CandidateJob";
import AggregatedJob from "@/models/AggregatedJob";
import ServiceForm from "@/models/serviceform";

// GET all flagged / negative items across all modules
export async function GET() {
  try {
    await connectMongo();

    const [resources, programs, exams, jobs, candidateJobs, serviceJobs, aggJobs] = await Promise.all([
      GovtResource.find({ status: "negative" }).lean(),
      Program.find({ status: "negative" }).lean(),
      Exam.find({ status: "negative" }).lean(),
      Job.find({ status: "negative" }).lean(),
      CandidateJob.find({ status: "negative" }).lean(),
      ServiceForm.find({ status: "negative" }).lean(),
      AggregatedJob.find({ status: "negative" }).lean(),
    ]);

    const formattedPrograms = programs.map((p) => ({
      _id: p._id,
      title: p.title,
      moduleType: "Internship / Program",
      category: p.programType || "Program",
      source: p.organization || "Community",
      link: p.applyLink || "#",
      flaggedAt: p.updatedAt || p.createdAt,
      collectionType: "Program",
    }));

    const formattedResources = resources.map((r) => ({
      _id: r._id,
      title: r.title,
      moduleType: "Govt Scheme / Resource",
      category: r.category,
      source: r.source || "Official",
      link: r.applyLink || "#",
      flaggedAt: r.updatedAt || r.createdAt,
      collectionType: "GovtResource",
    }));

    const formattedExams = exams.map((e) => ({
      _id: e._id,
      title: e.name,
      moduleType: "Govt Exam",
      category: e.category,
      source: e.source || "Official Board",
      link: e.officialWebsite || e.applyLink || "#",
      flaggedAt: e.updatedAt || e.createdAt,
      collectionType: "Exam",
    }));

    const formattedJobs = [
      ...jobs.map((j) => ({
        _id: j._id,
        title: j.title,
        moduleType: "Job (Recruiter)",
        category: j.jobType || "Job",
        source: j.companyName || j.company || "Recruiter",
        link: "#",
        flaggedAt: j.updatedAt || j.createdAt,
        collectionType: "Job",
      })),
      ...candidateJobs.map((j) => ({
        _id: j._id,
        title: j.title,
        moduleType: "Job (Candidate)",
        category: j.jobType || "Job",
        source: j.companyDetails?.companyName || "Candidate",
        link: "#",
        flaggedAt: j.updatedAt || j.createdAt,
        collectionType: "CandidateJob",
      })),
      ...serviceJobs.map((s) => ({
        _id: s._id,
        title: s.title,
        moduleType: "Service Provider",
        category: s.category || "Service",
        source: s.providerName || "Service Provider",
        link: "#",
        flaggedAt: s.updatedAt || s.createdAt,
        collectionType: "ServiceForm",
      })),
      ...aggJobs.map((a) => ({
        _id: a._id,
        title: a.title,
        moduleType: "Aggregated Job",
        category: a.employmentType || "Aggregated",
        source: a.company || a.sourceLabel || "Aggregated Feed",
        link: a.sourceUrl || "#",
        flaggedAt: a.updatedAt || a.createdAt,
        collectionType: "AggregatedJob",
      })),
    ];

    const allFlagged = [...formattedResources, ...formattedPrograms, ...formattedExams, ...formattedJobs];
    allFlagged.sort((a, b) => new Date(b.flaggedAt) - new Date(a.flaggedAt));

    return NextResponse.json({ success: true, data: allFlagged });
  } catch (error) {
    console.error("Fetch Flagged Items Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE flagged item permanently by ID & collection type
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    const typeParam = searchParams.get("type");

    if (!idParam) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    await connectMongo();
    const ids = idParam.split(",").map((x) => x.trim()).filter(Boolean);

    if (typeParam === "GovtResource") {
      await GovtResource.deleteMany({ _id: { $in: ids } });
    } else if (typeParam === "Program") {
      await Program.deleteMany({ _id: { $in: ids } });
    } else if (typeParam === "Exam") {
      await Exam.deleteMany({ _id: { $in: ids } });
    } else if (typeParam === "Job") {
      await Job.deleteMany({ _id: { $in: ids } });
    } else if (typeParam === "CandidateJob") {
      await CandidateJob.deleteMany({ _id: { $in: ids } });
    } else if (typeParam === "ServiceForm") {
      await ServiceForm.deleteMany({ _id: { $in: ids } });
    } else if (typeParam === "AggregatedJob") {
      await AggregatedJob.deleteMany({ _id: { $in: ids } });
    } else {
      // Fallback search across all collections
      await Promise.all([
        GovtResource.deleteMany({ _id: { $in: ids } }),
        Program.deleteMany({ _id: { $in: ids } }),
        Exam.deleteMany({ _id: { $in: ids } }),
        Job.deleteMany({ _id: { $in: ids } }),
        CandidateJob.deleteMany({ _id: { $in: ids } }),
        ServiceForm.deleteMany({ _id: { $in: ids } }),
        AggregatedJob.deleteMany({ _id: { $in: ids } }),
      ]);
    }

    return NextResponse.json({ success: true, message: `Successfully deleted ${ids.length} flagged item(s).` });
  } catch (error) {
    console.error("Delete Flagged Item Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT restore flagged item back to live/active
export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    const typeParam = searchParams.get("type");

    if (!idParam) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    await connectMongo();
    const ids = idParam.split(",").map((x) => x.trim()).filter(Boolean);

    if (typeParam === "GovtResource") {
      await GovtResource.updateMany({ _id: { $in: ids } }, { status: "live" });
    } else if (typeParam === "Program") {
      await Program.updateMany({ _id: { $in: ids } }, { status: "live" });
    } else if (typeParam === "Exam") {
      await Exam.updateMany({ _id: { $in: ids } }, { status: "live" });
    } else if (typeParam === "Job" || typeParam === "CandidateJob") {
      await Job.updateMany({ _id: { $in: ids } }, { status: "active" });
      await CandidateJob.updateMany({ _id: { $in: ids } }, { status: "active" });
    } else if (typeParam === "ServiceForm") {
      await ServiceForm.updateMany({ _id: { $in: ids } }, { status: "active" });
    } else if (typeParam === "AggregatedJob") {
      await AggregatedJob.updateMany({ _id: { $in: ids } }, { status: "live" });
    } else {
      await Promise.all([
        GovtResource.updateMany({ _id: { $in: ids } }, { status: "live" }),
        Program.updateMany({ _id: { $in: ids } }, { status: "live" }),
        Exam.updateMany({ _id: { $in: ids } }, { status: "live" }),
        Job.updateMany({ _id: { $in: ids } }, { status: "active" }),
        CandidateJob.updateMany({ _id: { $in: ids } }, { status: "active" }),
        ServiceForm.updateMany({ _id: { $in: ids } }, { status: "active" }),
        AggregatedJob.updateMany({ _id: { $in: ids } }, { status: "live" }),
      ]);
    }

    return NextResponse.json({ success: true, message: `Successfully restored ${ids.length} item(s).` });
  } catch (error) {
    console.error("Restore Flagged Item Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
