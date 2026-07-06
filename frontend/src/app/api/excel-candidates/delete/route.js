// src/app/api/excel-candidates/delete/route.js
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import ExcelCandidate from "@/models/ExcelCandidate";

export async function POST(req) {
  try {
    await connectMongo();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await ExcelCandidate.findByIdAndDelete(id);
    return NextResponse.json({ message: "Candidate deleted" });
  } catch (err) {
    console.error("ExcelCandidate delete error:", err);
    return NextResponse.json({ error: err.message || "Delete failed" }, { status: 500 });
  }
}
