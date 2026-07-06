import connectMongo from "@/lib/mongodb";
import Dropdown from "@/models/Dropdown";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongo();
    const data = await Dropdown.find().sort({ type: 1, value: 1 }).lean();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET API Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch dropdowns" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const { type, value } = await req.json();
    
    if (!type || !value) {
      return NextResponse.json({ error: "Type and Value are required" }, { status: 400 });
    }

    const cleanValue = value.trim();
    const existing = await Dropdown.findOne({ type, value: cleanValue });
    if (existing) {
      return NextResponse.json({ error: "This value already exists in this category" }, { status: 400 });
    }

    const newItem = await Dropdown.create({ type, value: cleanValue });
    return NextResponse.json(newItem);
  } catch (error) {
    console.error("POST API Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await Dropdown.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE API Error:", error.message);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}