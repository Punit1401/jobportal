import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req, { params }) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    
    // Ensure the notification belongs to the user
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: session.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) return NextResponse.json({ error: "Notification not found" }, { status: 404 });

    return NextResponse.json({ ok: true, data: notification });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    await Notification.findOneAndDelete({ _id: id, recipientId: session.user.id });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
