import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import StorageSettings from "@/models/StorageSettings";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    let settings = await StorageSettings.findOne();
    
    if (!settings) {
      settings = await StorageSettings.create({});
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Fetch StorageSettings Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const body = await req.json();

    let settings = await StorageSettings.findOne();
    if (!settings) {
      settings = new StorageSettings();
    }

    if (body.defaultCandidateSpaceMB !== undefined) settings.defaultCandidateSpaceMB = body.defaultCandidateSpaceMB;
    if (body.defaultRecruiterSpaceMB !== undefined) settings.defaultRecruiterSpaceMB = body.defaultRecruiterSpaceMB;
    if (body.defaultServiceProviderSpaceMB !== undefined) settings.defaultServiceProviderSpaceMB = body.defaultServiceProviderSpaceMB;

    await settings.save();

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Update StorageSettings Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
