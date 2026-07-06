export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Company from "@/models/Company";

export async function GET(req, { params }) {
  try {
    await connectMongo();

    // ✅ Next.js 15 મુજબ params ને await કરવું જરૂરી છે
    const resolvedParams = await params;
    const id = resolvedParams.id; 

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // ડેટાબેઝમાંથી કંપની શોધો (email અને phone કાઢી નાખ્યા છે)
    const company = await Company.findOne({ recruiterId: id }).select("-email -phone");

    if (!company) {
      return NextResponse.json({ error: "Company profile not found", data: null }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: company });

  } catch (err) {
    console.error("GET_RECRUITER_PUBLIC_ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}