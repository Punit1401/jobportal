import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { ScheduledMail } from "@/models/Mailing";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectMongo();
        const data = await ScheduledMail.find({ 
            ownerId: session.user.id,
            ownerRole: session.user.role 
        }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
