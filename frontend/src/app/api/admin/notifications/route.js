import connectMongo from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// ✅ POST — create new notification
export async function POST(req) {
  try {
    await connectMongo();
    const { userId, title, message } = await req.json();

    if (!userId || !title || !message) {
      return Response.json({ error: "All fields required" }, { status: 400 });
    }

    const newNote = await Notification.create({
      user: userId,
      title,
      message,
    });

    return Response.json({ success: true, notification: newNote });
  } catch (err) {
    console.error("Notification Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ✅ GET — get all users (for dropdown)
export async function GET() {
  try {
    await connectMongo();
    const users = await User.find({}, "_id name email");
    return Response.json({ users });
  } catch (err) {
    console.error("User fetch error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
