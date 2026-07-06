import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'received' or 'sent'
    const userId = session.user.id;

    if (!userId) {
        return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    let query = {};
    try {
        const userObjId = new mongoose.Types.ObjectId(userId);
        if (type === 'sent') {
            query = { senderId: { $in: [userObjId, userId] } };
        } else {
            query = { recipientId: { $in: [userObjId, userId] } };
        }
    } catch (idError) {
        if (type === 'sent') {
            query = { senderId: userId };
        } else {
            query = { recipientId: userId };
        }
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ ok: true, data: notifications });
  } catch (err) {
    console.error("Notification GET Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { recipientIds, targetRole, title, message, type, link } = body;

    let finalRecipientIds = recipientIds || [];

    // Role-based targeting
    if (targetRole) {
        if (targetRole === 'candidate') {
            const users = await User.find({ role: { $in: ['user', 'candidate'] } }).select('_id');
            finalRecipientIds = users.map(u => u._id);
        } else if (targetRole === 'recruiter') {
            const users = await User.find({ role: 'recruiter' }).select('_id');
            finalRecipientIds = users.map(u => u._id);
        } else if (targetRole === 'serviceprovider') {
            const users = await User.find({ role: 'serviceprovider' }).select('_id');
            finalRecipientIds = users.map(u => u._id);
        } else if (targetRole === 'all') {
            const users = await User.find({}).select('_id');
            finalRecipientIds = users.map(u => u._id);
        }
    }

    if (finalRecipientIds.length === 0 || !title || !message) {
      return NextResponse.json({ error: "Missing required fields or recipients" }, { status: 400 });
    }

    // Dynamic Sender Role Labeling
    let senderRoleLabel = "System";
    if (session.user.role === 'admin') senderRoleLabel = "Admin";
    else if (session.user.role === 'recruiter') senderRoleLabel = "Recruiter";
    else if (session.user.role === 'serviceprovider') senderRoleLabel = "ServiceProvider";

    const notifications = finalRecipientIds.map(id => ({
      senderId: new mongoose.Types.ObjectId(session.user.id),
      senderRole: senderRoleLabel,
      recipientId: new mongoose.Types.ObjectId(id),
      title,
      message,
      type: type || 'Info',
      link: link || ''
    }));

    await Notification.insertMany(notifications);

    return NextResponse.json({ ok: true, message: "Notifications sent successfully" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
