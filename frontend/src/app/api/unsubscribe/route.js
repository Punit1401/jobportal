import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import ExcelCandidate from "@/models/ExcelCandidate";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();
    const { email } = await req.json();

    // બંને મોડલ્સમાં unsubscribed status અપડેટ કરો
    await Candidate.updateOne({ email }, { $set: { unsubscribed: true } });
    await ExcelCandidate.updateOne({ email }, { $set: { unsubscribed: true } });

    return NextResponse.json({ success: true, message: "Unsubscribed successfully" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}