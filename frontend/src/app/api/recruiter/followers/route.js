export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import Recruiter from "@/models/Recruiter";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "recruiter") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    // Find the recruiter profile using their email
    const recruiter = await Recruiter.findOne({ email: session.user.email });
    if (!recruiter) {
      return NextResponse.json({ success: false, error: "Recruiter profile not found" }, { status: 404 });
    }

    const recruiterId = recruiter._id;

    // Find candidates who have followed this recruiter's company ID
    const followers = await Candidate.find({ followedCompanies: recruiterId })
      .select("fullName email mobile profession skills resume city state currentCompanyName expectedSalary userId")
      .lean();

    return NextResponse.json({ success: true, followers: followers || [] });
  } catch (error) {
    console.error("Fetch Recruiter Followers Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
