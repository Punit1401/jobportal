// src/app/api/applications/[id]/route.js
import connectMongo from "@/lib/mongodb";
import Application from "@/models/Application";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
//export const config = { api: { bodyParser: false } };

// ---------------- GET - fetch single application ----------------
export async function GET(req, context) {
  try {
    await connectMongo();
    const { id } = await context.params; // ✅ fixed: await params

    const app = await Application.findById(id).populate(
      "job",
      "title jobCategory type experienceLevel"
    );

    if (!app)
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );

    return NextResponse.json(app, { status: 200 });
  } catch (err) {
    console.error("Error fetching application:", err);
    return NextResponse.json(
      { message: "Failed to fetch application", error: err.message },
      { status: 500 }
    );
  }
}

// ---------------- PATCH - update application status ----------------
export async function PATCH(req, context) {
  try {
    await connectMongo();
    const { id } = await context.params; // ✅ fixed: await params

    const body = await req.json();
    const { status } = body;

    if (status && !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const updated = await Application.findByIdAndUpdate(id, body, { new: true });

    if (!updated)
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );

    return NextResponse.json(
      { message: "Application updated", application: updated },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating application:", err);
    return NextResponse.json(
      { message: "Failed to update application", error: err.message },
      { status: 500 }
    );
  }
}

// ---------------- DELETE - delete application ----------------
export async function DELETE(req, context) {
  try {
    await connectMongo();
    const { id } = await context.params; // ✅ fixed: await params

    const deleted = await Application.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );

    // Safely delete uploaded files
    if (deleted.attachments?.length) {
      deleted.attachments.forEach((f) => {
        if (!f?.url) return; // skip if url missing
        const filePath = path.join(process.cwd(), "public", "uploads", path.basename(f.url));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    return NextResponse.json({ message: "Application deleted" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting application:", err);
    return NextResponse.json(
      { message: "Failed to delete application", error: err.message },
      { status: 500 }
    );
  }
}
