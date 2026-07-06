import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ ok: true, data: notifications });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Notification.updateMany({ userId: session.user.id, read: false }, { read: true });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
