import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import GovtResource from "@/models/GovtResource";
import Program from "@/models/Program";
import Exam from "@/models/Exam";
import Job from "@/models/Job";
import CandidateJob from "@/models/CandidateJob";
import AggregatedJob from "@/models/AggregatedJob";
import ServiceForm from "@/models/serviceform";

export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing item ID" }, { status: 400 });
    }

    await connectMongo();

    // 1. Find title if item exists in GovtResource or Program
    let targetTitle = null;
    const [gDoc, pDoc] = await Promise.all([
      GovtResource.findById(id).lean(),
      Program.findById(id).lean(),
    ]);

    if (gDoc?.title) targetTitle = gDoc.title;
    if (pDoc?.title) targetTitle = pDoc.title;

    // 2. Mark status: "negative" across ALL collections by ID or matching title
    const titleFilter = targetTitle ? [{ title: targetTitle }] : [];

    await Promise.all([
      GovtResource.updateMany({ $or: [{ _id: id }, ...titleFilter] }, { status: "negative" }),
      Program.updateMany({ $or: [{ _id: id }, ...titleFilter] }, { status: "negative" }),
      Exam.updateMany({ $or: [{ _id: id }, ...(targetTitle ? [{ name: targetTitle }] : [])] }, { status: "negative" }),
      Job.updateMany({ _id: id }, { status: "negative" }),
      CandidateJob.updateMany({ _id: id }, { status: "negative" }),
      AggregatedJob.updateMany({ _id: id }, { status: "negative" }),
      ServiceForm.updateMany({ _id: id }, { status: "negative" }),
    ]);

    return NextResponse.json({ success: true, message: "Item flagged as negative successfully" });
  } catch (error) {
    console.error("Candidate Flag Item Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
