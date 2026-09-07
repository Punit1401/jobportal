import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Admin from "@/models/Admin";
import User from "@/models/User";
import Recruiter from "@/models/Recruiter";
import ServiceProvider from "@/models/serviceprovider";

export async function POST(req) {
  try {
    await connectMongo();
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const normalizedEmail = email.toLowerCase().trim();

    // Check all models to find the role
    const admin = await Admin.findOne({ email: normalizedEmail }).lean();
    if (admin) return NextResponse.json({ role: "admin" });

    const recruiter = await Recruiter.findOne({ email: normalizedEmail }).lean();
    if (recruiter) return NextResponse.json({ role: "recruiter" });

    const sp = await ServiceProvider.findOne({ email: normalizedEmail }).lean();
    if (sp) return NextResponse.json({ role: "serviceprovider" });

    const user = await User.findOne({ email: normalizedEmail }).lean();
    if (user) return NextResponse.json({ role: "user" });

    return NextResponse.json({ role: "user" }); // Default
  } catch (err) {
    console.error("Role Check Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
