import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    await connectMongo();
    const candidate = await Candidate.findOne({ userId: session.user.id }, "aiChats");

    if (!candidate || !candidate.aiChats || candidate.aiChats.length === 0) {
      return NextResponse.json({ success: true, sessions: [], history: [] });
    }

    // જો chatId માંગી હોય, તો તે સેશનની મેસેજ હિસ્ટ્રી આપો
    if (chatId) {
      const currentChat = candidate.aiChats.find((c) => c._id.toString() === chatId);
      return NextResponse.json({ success: true, history: currentChat?.messages || [] });
    }

    // સાઇડબાર માટે બધી ચેટ્સનું લિસ્ટ
    const sessions = candidate.aiChats.map((c) => ({
      id: c._id,
      title: c.title,
      updatedAt: c.updatedAt,
    })).sort((a, b) => b.updatedAt - a.updatedAt);

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false }, { status: 401 });

    const { message, history, chatId, isNewChat } = await req.json();
    await connectMongo();

    if (isNewChat) {
      return NextResponse.json({ success: true });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001",
        "messages": [
          {
            "role": "system",
            "content": `You are a professional AI Career Tutor. 
            STRICT PROTOCOL:
            1. ONLY discuss: Coding, Job Interviews, Career Guidance, Resume building, and Technical education.
            2. REJECT: Emotional talks, personal life, relationships, sports, movies, or general chit-chat. 
            3. If a user tries to talk emotionally or off-topic, say: "I am specialized only in Career and Technical guidance. I cannot assist with other topics."
            4. Language: Always detect user language (Gujarati/Hindi/English) and reply in the same.
            5. Character: Stay professional, neutral, and practical. No personal bonding.`
          },
          ...history,
          { "role": "user", "content": message }
        ],
      }),
    });

    const data = await response.json();
    if (!data.choices) throw new Error("AI API Error");

    const reply = data.choices[0].message.content;
    const userMsg = { role: "user", content: message };
    const aiMsg = { role: "assistant", content: reply };

    let finalChatId = chatId;

    if (!chatId) {
      // ૧. નવી ચેટ માટે
      const newChat = {
        title: message.length > 30 ? message.substring(0, 30) + "..." : message,
        messages: [userMsg, aiMsg],
        updatedAt: new Date()
      };

      const updatedCandidate = await Candidate.findOneAndUpdate(
        { userId: session.user.id },
        { $push: { aiChats: newChat } },
        { new: true, upsert: true } // upsert: true ઉમેર્યું જેથી નવો રેકોર્ડ બની જાય
      );

      if (updatedCandidate && updatedCandidate.aiChats) {
        finalChatId = updatedCandidate.aiChats[updatedCandidate.aiChats.length - 1]._id;
      }
    } else {
      // ૨. જૂની ચેટ અપડેટ કરવા માટે
      await Candidate.updateOne(
        { userId: session.user.id, "aiChats._id": chatId },
        {
          $push: { "aiChats.$.messages": { $each: [userMsg, aiMsg] } },
          $set: { "aiChats.$.updatedAt": new Date() }
        }
      );
    }

    return NextResponse.json({ success: true, reply, chatId: finalChatId });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}