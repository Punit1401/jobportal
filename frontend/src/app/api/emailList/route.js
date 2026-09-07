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
    const body = await req.json();
    const emailsInput = body.emails || body.contacts || [];

    if (!Array.isArray(emailsInput) || emailsInput.length === 0) {
      return NextResponse.json({ success: false, error: "No emails provided" }, { status: 400 });
    }

    const ops = emailsInput.map((item) => {
      let email = "";
      let name = "";
      let phone = "";
      let source = body.source || "Scraped Bulk Vacancy";

      if (typeof item === "string") {
        email = item.trim().toLowerCase();
      } else if (typeof item === "object" && item !== null) {
        email = (item.email || "").toString().trim().toLowerCase();
        name = (item.name || "").toString().trim();
        phone = (item.phone || "").toString().trim();
        if (item.source) source = item.source;
      }

      if (!email) return null;

      const updateFields = { email };
      if (name) updateFields.name = name;
      if (phone) updateFields.phone = phone;
      if (source) updateFields.source = source;

      return EmailQueue.updateOne(
        { email },
        { $set: updateFields },
        { upsert: true }
      );
    }).filter(Boolean);

    await Promise.all(ops);

    const all = await EmailQueue.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, emailList: all });
  } catch (err) {
    console.error("EmailList POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
