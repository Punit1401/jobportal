import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

export const dynamic = "force-dynamic";

// GET messages for a conversation
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    await connectMongo();
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return new Response(JSON.stringify({ error: "conversationId query parameter is required" }), { status: 400 });
    }

    // Verify user is participant in this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404 });
    }

    if (conversation.candidateId.toString() !== userId && conversation.recruiterId.toString() !== userId) {
      return new Response(JSON.stringify({ error: "Access denied" }), { status: 403 });
    }

    // Fetch messages
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean();

    // Mark other user's messages as read
    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, read: false },
      { $set: { read: true } }
    );

    // Reset unread counts in Conversation
    if (conversation.candidateId.toString() === userId) {
      conversation.unreadCountCandidate = 0;
    } else {
      conversation.unreadCountRecruiter = 0;
    }
    await conversation.save();

    return new Response(JSON.stringify({ success: true, messages }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET messages:", error);
    return new Response(JSON.stringify({ error: "Server Error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST to send a message
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    await connectMongo();
    const userId = session.user.id;
    const { conversationId, text } = await req.json();

    if (!conversationId || !text) {
      return new Response(JSON.stringify({ error: "conversationId and text are required" }), { status: 400 });
    }

    // Verify conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404 });
    }

    const isCandidate = conversation.candidateId.toString() === userId;
    const isRecruiter = conversation.recruiterId.toString() === userId;

    if (!isCandidate && !isRecruiter) {
      return new Response(JSON.stringify({ error: "Access denied" }), { status: 403 });
    }

    const senderRole = isCandidate ? "candidate" : "recruiter";

    // Create message
    const message = await Message.create({
      conversationId,
      senderId: userId,
      senderRole,
      text,
      read: false,
    });

    // Update conversation metadata
    conversation.lastMessage = text;
    conversation.lastMessageAt = new Date();

    // Increment unread count for recipient
    if (isCandidate) {
      conversation.unreadCountRecruiter = (conversation.unreadCountRecruiter || 0) + 1;
    } else {
      conversation.unreadCountCandidate = (conversation.unreadCountCandidate || 0) + 1;
    }

    await conversation.save();

    return new Response(JSON.stringify({ success: true, message }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST messages:", error);
    return new Response(JSON.stringify({ error: "Server Error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
