import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import ServiceRequest from "@/models/ServiceRequest";
import User from "@/models/User";
import Recruiter from "@/models/Recruiter";
import ServiceProvider from "@/models/serviceprovider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const newRequest = await ServiceRequest.create({
      userId: session.user.id,
      userRole: session.user.role || "candidate",
      userEmail: session.user.email,
      subject,
      message,
    });

    return NextResponse.json({ success: true, request: newRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating service request:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    if (session.user.role === "admin") {
      const requests = await ServiceRequest.find().sort({ createdAt: -1 }).lean();
      
      // Manual population for different collections
      const populatedRequests = await Promise.all(requests.map(async (req) => {
        let userData = null;
        
        // Try User collection
        userData = await User.findById(req.userId).select("name email role").lean();
        
        // Try Recruiter if not found
        if (!userData) {
          const rec = await Recruiter.findById(req.userId).select("fullName email role").lean();
          if (rec) userData = { name: rec.fullName, email: rec.email, role: "recruiter" };
        }
        
        // Try ServiceProvider if still not found
        if (!userData) {
          const sp = await ServiceProvider.findById(req.userId).select("name email role").lean();
          if (sp) userData = { name: sp.name, email: sp.email, role: "serviceprovider" };
        }

        return {
          ...req,
          userId: userData // Replace with the found user data
        };
      }));

      return NextResponse.json({ success: true, requests: populatedRequests }, { status: 200 });
    } else {
      const requests = await ServiceRequest.find({ userId: session.user.id })
        .sort({ createdAt: -1 });
      return NextResponse.json({ success: true, requests }, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching service requests:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
