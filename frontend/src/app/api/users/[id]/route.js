// /app/api/users/[id]/route.js
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// GET single user
export async function GET(req, { params }) {
  const { id } = await params;

  try {
    await connectMongo();
    const user = await User.findById(id);
    if (!user)
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to fetch user" }), { status: 500 });
  }
}

// DELETE user
export async function DELETE(req, { params }) {
  const { id } = await params;

  try {
    await connectMongo();
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted)
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    return new Response(JSON.stringify({ message: "Deleted successfully" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to delete user" }), { status: 500 });
  }
}

// UPDATE user
export async function PUT(req, { params }) {
  const { id } = await params;

  try {
    await connectMongo();
    const body = await req.json();
    const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });
    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to update user" }), { status: 500 });
  }
}
