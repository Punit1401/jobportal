// src/app/api/user/profile/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    await connectMongo();

    const candidate = await Candidate.findOne({ userId: session.user.id }).lean();

    if (!candidate) {
      return new Response(JSON.stringify({ message: "Profile not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(candidate), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    return new Response(JSON.stringify({ message: "Server Error", error: error.message }), {
      status: 500,
    });
  }
}
