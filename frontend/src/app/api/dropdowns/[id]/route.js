import connectMongo from "@/lib/mongodb";
import Dropdown from "@/models/Dropdown";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(req, { params }) {
  try {
    await connectMongo();

    // ✅ Next.js 15+ માં params ને await કરવું જરૂરી છે
    const { id } = await params; 

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deletedItem = await Dropdown.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}