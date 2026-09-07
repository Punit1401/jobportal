import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import StoragePlan from "@/models/StoragePlan";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongo();
    const plans = await StoragePlan.find({ isActive: true }).sort({ addedSpaceMB: 1 });
    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error("Fetch StoragePlans Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
