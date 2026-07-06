// src/app/api/excel-candidates/list/route.js
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import ExcelCandidate from "@/models/ExcelCandidate";

export async function GET() {
  try {
    await connectMongo();

    // Fetch all candidates sorted by creation date (latest first)
    const candidates = await ExcelCandidate.find({})
      .sort({ createdAt: -1 })
      .select(
        "fullName email mobile dob profession position role experience city reference linkedin portfolio skills resume unsubscribed mailCount"
      ); // <-- Include unsubscribed & mailCount explicitly

    return NextResponse.json(candidates);
  } catch (err) {
    console.error("ExcelCandidate list error:", err);
    return NextResponse.json(
      { error: "Failed to load candidates" },
      { status: 500 }
    );
  }
}
