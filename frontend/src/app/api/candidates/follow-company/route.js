import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import Recruiter from "@/models/Recruiter";

// Toggle Follow/Unfollow Company
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = await req.json();
    if (!companyId) {
      return NextResponse.json({ success: false, error: "Company ID is required" }, { status: 400 });
    }

    await connectMongo();

    // Verify target recruiter is live & approved in system
    const recruiter = await Recruiter.findById(companyId);
    if (!recruiter || (!recruiter.isApproved && recruiter.status !== "approved") || recruiter.isRejected) {
      return NextResponse.json({ success: false, error: "Only live and verified recruiters can be followed." }, { status: 400 });
    }

    const candidate = await Candidate.findOne({ userId: session.user.id });

    if (!candidate) {
      return NextResponse.json({ success: false, error: "Candidate profile not found" }, { status: 404 });
    }

    // Initialize array if not present
    if (!candidate.followedCompanies) {
      candidate.followedCompanies = [];
    }

    const isFollowing = candidate.followedCompanies.includes(companyId);

    if (isFollowing) {
      // Remove (Unfollow)
      candidate.followedCompanies = candidate.followedCompanies.filter((id) => id.toString() !== companyId);
    } else {
      // Add (Follow)
      candidate.followedCompanies.push(companyId);
    }

    await candidate.save();

    return NextResponse.json({ 
      success: true, 
      message: isFollowing ? "Unfollowed company successfully" : "Followed company successfully",
      following: !isFollowing,
      followedCompanies: candidate.followedCompanies
    });
  } catch (error) {
    console.error("Follow Company Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// Fetch all followed companies for the user (only live & verified recruiters)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    
    const candidate = await Candidate.findOne({ userId: session.user.id })
      .populate({
        path: "followedCompanies",
        model: "Recruiter",
        select: "companyName logo tagline industry website companySize address description founded isApproved isRejected status"
      })
      .lean();

    if (!candidate) {
      return NextResponse.json({ success: false, error: "Candidate profile not found" }, { status: 404 });
    }

    const validFollowedCompanies = (candidate.followedCompanies || [])
      .filter(comp => comp !== null && (comp.isApproved === true || comp.status === "approved") && comp.isRejected !== true)
      .map(comp => ({
        _id: comp._id,
        name: comp.companyName || "Verified Employer",
        logo: comp.logo || "",
        tagline: comp.tagline || "",
        industry: comp.industry || "General",
        website: comp.website || "",
        companySize: comp.companySize || "11-50 employees",
        address: comp.address || "",
        description: comp.description || "",
        founded: comp.founded || "",
        recruiterId: comp._id.toString()
      }));

    return NextResponse.json({ success: true, followedCompanies: validFollowedCompanies });
  } catch (error) {
    console.error("Get Followed Companies Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
