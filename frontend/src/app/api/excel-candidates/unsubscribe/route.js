// src/app/api/excel-candidates/unsubscribe/route.js
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import ExcelCandidate from "@/models/ExcelCandidate";

export async function POST(req) {
  try {
    await connectMongo();

    const { id, action } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    if (!action || !["subscribe", "unsubscribe"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action (use 'subscribe' or 'unsubscribe')" },
        { status: 400 }
      );
    }

    const updateValue = action === "unsubscribe";

    // Use findByIdAndUpdate with { new: true } to return updated document
    const updatedCandidate = await ExcelCandidate.findByIdAndUpdate(
      id,
      { $set: { unsubscribed: updateValue } },
      { new: true }
    );

    if (!updatedCandidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: updateValue
        ? "Unsubscribed successfully"
        : "Subscribed successfully",
      candidate: updatedCandidate,
    });

  } catch (err) {
    console.error("ExcelCandidate subscribe/unsubscribe error:", err);
    return NextResponse.json(
      { error: err.message || "Operation failed" },
      { status: 500 }
    );
  }
}
