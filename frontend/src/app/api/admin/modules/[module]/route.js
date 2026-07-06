import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import AdminModuleItem from "@/models/AdminModuleItem";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    await connectMongo();
    const { module } = await params;
    const items = await AdminModuleItem.find({ moduleKey: module }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, items });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await connectMongo();
    const { module } = await params;
    const body = await req.json();
    if (!body?.title?.trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const item = await AdminModuleItem.create({
      moduleKey: module,
      title: body.title.trim(),
      description: body.description || "",
      status: body.status || "Active",
      priority: body.priority || "Medium",
      meta: body.meta || {},
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create item" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectMongo();
    const { module } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ success: false, error: "Item id is required" }, { status: 400 });
    }
    if (!body?.title?.trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const item = await AdminModuleItem.findOneAndUpdate(
      { _id: body.id, moduleKey: module },
      {
        $set: {
          title: body.title.trim(),
          description: body.description || "",
          status: body.status || "Active",
          priority: body.priority || "Medium",
          meta: body.meta || {},
        },
      },
      { new: true }
    );

    if (!item) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectMongo();
    const { module } = await params;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Item id is required" }, { status: 400 });
    }

    const deleted = await AdminModuleItem.findOneAndDelete({ _id: id, moduleKey: module });

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete item" }, { status: 500 });
  }
}
