import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import GovtResource from "@/models/GovtResource";
import Program from "@/models/Program";

// GET all resources for Admin
export async function GET() {
  try {
    await connectMongo();
    const resources = await GovtResource.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: resources });
  } catch (error) {
    console.error("Fetch Govt Resources Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// POST new resource manually
export async function POST(req) {
  try {
    const body = await req.json();
    await connectMongo();

    const newResource = await GovtResource.create({
      ...body,
      status: "pending",
    });

    return NextResponse.json({ success: true, data: newResource });
  } catch (error) {
    console.error("Create Govt Resource Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT to approve (make live)
export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    const { status } = await req.json();

    if (!idParam || !status) {
      return NextResponse.json({ success: false, error: "Missing ID or Status" }, { status: 400 });
    }

    await connectMongo();
    if (idParam.includes(",")) {
      const ids = idParam.split(",").map(x => x.trim()).filter(Boolean);
      const resources = await GovtResource.find({ _id: { $in: ids } }).lean();
      const titles = resources.map(r => r.title);
      await GovtResource.updateMany({ _id: { $in: ids } }, { status });
      await Program.updateMany({ $or: [{ _id: { $in: ids } }, { title: { $in: titles } }] }, { status });
      return NextResponse.json({ success: true, message: `Successfully updated ${ids.length} resources.` });
    } else {
      const updated = await GovtResource.findByIdAndUpdate(idParam, { status }, { new: true });
      if (updated) {
        await Program.updateMany({ $or: [{ _id: idParam }, { title: updated.title }] }, { status });
      }
      return NextResponse.json({ success: true, data: updated });
    }
  } catch (error) {
    console.error("Update Govt Resource Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE a resource
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    await connectMongo();
    const ids = idParam.split(",").map(x => x.trim()).filter(Boolean);
    const resources = await GovtResource.find({ _id: { $in: ids } }).lean();
    const titles = resources.map(r => r.title);

    await GovtResource.deleteMany({ _id: { $in: ids } });
    await Program.deleteMany({ $or: [{ _id: { $in: ids } }, { title: { $in: titles } }] });

    return NextResponse.json({ success: true, message: `Successfully deleted ${ids.length} resources.` });
  } catch (error) {
    console.error("Delete Govt Resource Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
