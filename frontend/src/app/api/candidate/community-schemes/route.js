import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import GovtResource from "@/models/GovtResource";

// Community submission of a scheme/benefit update. Saved as status:"pending"
// and source:"community" — surfaces in the existing admin moderation queue
// (admin/govt-resources) before it can go live.
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, description, applyLink, eligibility, benefitType, sector, state, category, organization, duration, stipend, mode, qualification } = body;

    if (!title || !applyLink) {
      return NextResponse.json({ success: false, error: "Title and official link are required." }, { status: 400 });
    }

    await connectMongo();
    const submission = await GovtResource.create({
      title: title.trim(),
      description: (description || "").trim(),
      applyLink: applyLink.trim(),
      eligibility: (eligibility || qualification || "Not specified").trim(),
      qualification: (qualification || eligibility || "").trim(),
      benefitType: benefitType || "Other",
      sector: sector || undefined,
      state: state || "All India",
      category: category || "Scheme",
      programType: category || "Internship",
      organization: organization || undefined,
      duration: duration || undefined,
      stipend: stipend || undefined,
      mode: mode || "Offline",
      status: "pending",          // awaits admin moderation
      source: "community",
      submittedBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! Your submission is pending review and will appear once approved.",
      id: submission._id,
    });
  } catch (error) {
    console.error("Community Scheme Submit Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
