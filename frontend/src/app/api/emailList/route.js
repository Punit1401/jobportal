// frontend/src/app/api/emailList/route.js
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import EmailQueue from "@/models/EmailQueue";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongo();
    const all = await EmailQueue.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, emailList: all });
  } catch (err) {
    console.error("EmailList GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const { emails } = await req.json();

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ success: false, error: "No emails provided" }, { status: 400 });
    }

    const cleaned = emails
      .map((e) => (e || "").toString().trim().toLowerCase())
      .filter(Boolean);

    const ops = cleaned.map((email) =>
      EmailQueue.updateOne({ email }, { $set: { email } }, { upsert: true })
    );

    await Promise.all(ops);

    const all = await EmailQueue.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, emailList: all });
  } catch (err) {
    console.error("EmailList POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
