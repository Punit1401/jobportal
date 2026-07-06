// /app/api/users/route.js
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongo();
    const users = await User.find({});
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to fetch users" }), { status: 500 });
  }
}
