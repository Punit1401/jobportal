import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Application from "@/models/Application";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    await connectMongo();
    
    // લોગિન યુઝરની ડિટેલ્સ મેળવો
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // યુઝરના ઈમેલ દ્વારા તેની બધી એપ્લિકેશન શોધો
    const apps = await Application.find({ email: session.user.email }).sort({ appliedAt: -1 });

    // Summary ગણતરી કરો
    const summary = {
      total: apps.length,
      approved: apps.filter(a => a.status === "Approved").length,
      pending: apps.filter(a => a.status === "Pending" || !a.status).length,
      rejected: apps.filter(a => a.status === "Rejected").length,
    };

    return NextResponse.json({ 
      ok: true, 
      applications: apps, 
      ...summary 
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}