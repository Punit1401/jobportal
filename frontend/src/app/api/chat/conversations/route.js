import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import User from "@/models/User";
import Recruiter from "@/models/Recruiter";

export const dynamic = "force-dynamic";

// GET all conversations for the current logged-in user (only live & verified recruiters for candidate)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    await connectMongo();
    const userId = session.user.id;
    const userRole = session.user.role;

    // Retrieve conversations where user is either candidate or recruiter
    const conversations = await Conversation.find({
      $or: [{ candidateId: userId }, { recruiterId: userId }],
    })
      .populate("candidateId", "name email")
      .populate("recruiterId", "fullName email companyName logo isApproved isRejected status")
      .sort({ lastMessageAt: -1 })
      .lean();

    // If candidate viewer, filter to ONLY include conversations with live & verified recruiters
    let validConversations = conversations;
    if (userRole === "user" || userRole === "candidate" || !userRole) {
      validConversations = conversations.filter((conv) => {
        if (!conv.recruiterId) return false;
        const rec = conv.recruiterId;
        const isVerified = (rec.isApproved === true || rec.status === "approved") && rec.isRejected !== true;
        return isVerified;
      });
    }

    return new Response(JSON.stringify({ success: true, conversations: validConversations }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET conversations:", error);
    return new Response(JSON.stringify({ error: "Server Error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST to start a new conversation between Candidate and Recruiter
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    await connectMongo();
    let { candidateId, recruiterId, candidateEmail } = await req.json();

    if (!candidateId && candidateEmail) {
      const user = await User.findOne({ email: candidateEmail.toLowerCase() });
      if (user) {
        candidateId = user._id;
      }
    }

    if (!candidateId || !recruiterId) {
      return new Response(JSON.stringify({ error: "Missing candidateId (or valid email) or recruiterId" }), { status: 400 });
    }

    // Check that target recruiter is live and verified in system
    const recruiter = await Recruiter.findById(recruiterId).lean();
    if (!recruiter || (!recruiter.isApproved && recruiter.status !== "approved") || recruiter.isRejected) {
      return new Response(JSON.stringify({ error: "Only live and verified recruiters can be messaged." }), { status: 400 });
    }

    // Verify existing conversation
    let conversation = await Conversation.findOne({
      candidateId,
      recruiterId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        candidateId,
        recruiterId,
        lastMessage: "Conversation started",
        lastMessageAt: new Date(),
      });
    }

    // Populate and return
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("candidateId", "name email")
      .populate("recruiterId", "fullName email companyName logo isApproved isRejected status")
      .lean();

    return new Response(JSON.stringify({ success: true, conversation: populatedConversation }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST conversations:", error);
    return new Response(JSON.stringify({ error: "Server Error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
