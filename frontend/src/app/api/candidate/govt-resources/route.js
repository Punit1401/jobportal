import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import GovtResource from "@/models/GovtResource";

// GET all 'live' resources for Candidates
export async function GET() {
  try {
    await connectMongo();
    // Fetch only approved/live resources
    const resources = await GovtResource.find({ status: "live" }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: resources });
  } catch (error) {
    console.error("Fetch Live Govt Resources Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
