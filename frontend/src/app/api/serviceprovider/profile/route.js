import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import ServiceProvider from "@/models/serviceprovider";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "serviceprovider") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const provider = await ServiceProvider.findOne({ email: session.user.email }).lean();
    
    if (!provider) {
      return NextResponse.json({ error: "Service Provider not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, provider });
  } catch (err) {
    console.error("GET Profile Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
