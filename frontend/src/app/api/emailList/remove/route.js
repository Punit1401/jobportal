// frontend/src/app/api/emailList/remove/route.js
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import EmailQueue from "@/models/EmailQueue";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectMongo();
    const { email } = await req.json();
    if (!email) return NextResponse.json({ success: false, error: "Email required" }, { status: 400 });

    // Remove only when user registers
    await EmailQueue.deleteOne({ email: email.toString().trim().toLowerCase() });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("EmailList remove error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
