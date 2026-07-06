import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Response from "@/models/Response";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { notificationId, message, originalTitle, originalMessage } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const newResponse = await Response.create({
      notificationId,
      senderId: session.user.id,
      senderName: session.user.name,
      senderEmail: session.user.email,
      senderRole: session.user.role,
      message,
      originalTitle,
      originalMessage
    });

    // --- NOTIFY ORIGINAL SENDER ---
    try {
      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        console.error("Invalid notificationId format:", notificationId);
      } else {
        const originalNotif = await Notification.findById(new mongoose.Types.ObjectId(notificationId));
        
        if (originalNotif && originalNotif.senderId) {
          const recipientId = typeof originalNotif.senderId === 'string' 
            ? new mongoose.Types.ObjectId(originalNotif.senderId) 
            : originalNotif.senderId;

          // Use direct collection access to bypass Mongoose enum validation if model is cached with old schema
          const notificationCollection = mongoose.connection.collection('notifications');
          
          const replyNotifData = {
            senderId: new mongoose.Types.ObjectId(session.user.id),
            senderRole: session.user.role === 'recruiter' ? 'Recruiter' : 'Candidate',
            recipientId: recipientId,
            title: `Reply to: ${originalNotif.title || 'Notification'}`,
            message: message,
            type: "JobResponse",
            link: session.user.role === 'recruiter' ? `/recruiter/candidate` : "/user/notifications",
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await notificationCollection.insertOne(replyNotifData);
          console.log("Reply notification inserted with recipientId:", recipientId);
        } else {
          console.warn("Original notification not found or missing senderId for reply");
        }
      }
    } catch (notifError) {
      console.error("Error sending reply notification:", notifError);
    }

    return NextResponse.json({ ok: true, data: newResponse });
  } catch (err) {
    console.error("Response API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
    try {
        await connectMongo();
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const responses = await Response.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ ok: true, data: responses });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
