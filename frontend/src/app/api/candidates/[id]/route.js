//src/app/api/candidates/[id]/route.js
import connectMongo from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

export const dynamic = "force-dynamic";

function getIdFromUrl(req) {
  const parts = new URL(req.url).pathname.split("/");
  return parts[parts.length - 1];
}

// ✅ Get candidate by ID
export async function GET(req) {
  try {
    await connectMongo();
    const id = getIdFromUrl(req);
    const candidate = await Candidate.findById(id).lean();
    if (!candidate) return new Response("Not found", { status: 404 });
    return new Response(JSON.stringify(candidate), { status: 200 });
  } catch (error) {
    console.error("❌ GET /api/candidates/[id] error:", error);
    return new Response("Failed to fetch", { status: 500 });
  }
}

// ✅ Update candidate by ID
export async function PUT(req) {
  try {
    await connectMongo();
    const id = getIdFromUrl(req);
    const body = await req.json();
    const updated = await Candidate.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!updated) return new Response("Not found", { status: 404 });
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error("❌ PUT /api/candidates/[id] error:", error);
    return new Response("Failed to update", { status: 500 });
  }
}

// ✅ Delete candidate by ID
export async function DELETE(req) {
  try {
    await connectMongo();
    const id = getIdFromUrl(req);

    const deleted = await Candidate.findByIdAndDelete(id);

    if (!deleted) {
      return new Response(JSON.stringify({ error: "Candidate not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Candidate deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ DELETE /api/candidates/[id] error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete" }), {
      status: 500,
    });
  }
}
