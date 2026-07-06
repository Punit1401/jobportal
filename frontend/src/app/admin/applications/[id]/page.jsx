//src/app/admin/applications/[id]/page.jsx
import connectMongo from "@/lib/mongodb";
import Application from "@/models/Application";

export const DELETE = async (req, { params }) => {
  try {
    await connectMongo();
    const { id } = params;
    const deleted = await Application.findByIdAndDelete(id);
    if (!deleted) return new Response("Application not found", { status: 404 });

    return new Response(JSON.stringify({ message: "Deleted successfully" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to delete", { status: 500 });
  }
};
