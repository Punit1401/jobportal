import connectMongo from "@/lib/mongodb";
import Recruiter from "@/models/Recruiter";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongo();
    // Query ONLY live and verified recruiters who have a companyName set
    const recruitersList = await Recruiter.find({ 
      companyName: { $exists: true, $ne: "" },
      $or: [{ isApproved: true }, { status: "approved" }],
      isRejected: { $ne: true }
    }).sort({ createdAt: -1 });
    
    // Map Recruiter properties to the format expected by the frontend
    const formattedCompanies = recruitersList.map(r => ({
      _id: r._id.toString(),
      companyName: r.companyName || "",
      logo: r.logo || "",
      industry: r.industry || "",
      tagline: r.tagline || "",
      description: r.description || "",
      city: r.city || r.location || "",
      location: r.location || "",
      website: r.website || "",
      founded: r.founded || "",
      companySize: r.companySize || "11-50 employees",
      address: r.address || "",
    }));

    return NextResponse.json({ success: true, companies: formattedCompanies });
  } catch (err) {
    console.error("Error fetching companies:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch companies" }, { status: 500 });
  }
}
