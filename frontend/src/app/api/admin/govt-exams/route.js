import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Exam from "@/models/Exam";

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);

// Build a slug that's unique within the collection.
async function uniqueSlug(base) {
  let slug = slugify(base) || `exam-${Date.now()}`;
  let n = 1;
  while (await Exam.exists({ slug })) {
    slug = `${slugify(base)}-${n++}`;
  }
  return slug;
}

// GET all exams (admin view — every status).
export async function GET() {
  try {
    await connectMongo();
    const exams = await Exam.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: exams });
  } catch (error) {
    console.error("Admin Fetch Exams Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// POST — create a new exam (defaults to pending for review).
export async function POST(req) {
  try {
    const body = await req.json();
    await connectMongo();

    if (!body.name || !body.conductingAuthority) {
      return NextResponse.json(
        { success: false, error: "Exam name and conducting authority are required." },
        { status: 400 }
      );
    }

    const slug = body.slug ? await uniqueSlug(body.slug) : await uniqueSlug(body.name);

    const exam = await Exam.create({
      ...body,
      slug,
      status: body.status || "pending",
      ingestSource: body.ingestSource || "aiImport",
    });

    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    console.error("Admin Create Exam Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// PUT ?id= — update fields and/or status (single or comma-separated bulk for status).
export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    const body = await req.json();

    if (!idParam) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    await connectMongo();

    if (idParam.includes(",")) {
      const ids = idParam.split(",").map((x) => x.trim()).filter(Boolean);
      await Exam.updateMany({ _id: { $in: ids } }, { status: body.status });
      return NextResponse.json({ success: true, message: `Updated ${ids.length} exams.` });
    }

    const updated = await Exam.findByIdAndUpdate(idParam, body, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Admin Update Exam Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE ?id= — single or comma-separated bulk.
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    await connectMongo();

    if (idParam.includes(",")) {
      const ids = idParam.split(",").map((x) => x.trim()).filter(Boolean);
      await Exam.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({ success: true, message: `Deleted ${ids.length} exams.` });
    }

    await Exam.findByIdAndDelete(idParam);
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Admin Delete Exam Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
