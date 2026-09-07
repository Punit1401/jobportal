import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import StoragePlan from "@/models/StoragePlan";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const plans = await StoragePlan.find().sort({ addedSpaceMB: 1 });

    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error("Fetch StoragePlans Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const body = await req.json();

    const plan = await StoragePlan.create({
      title: body.title,
      addedSpaceMB: body.addedSpaceMB,
      price: body.price,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Create StoragePlan Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const body = await req.json();

    const plan = await StoragePlan.findByIdAndUpdate(
      body.id,
      {
        title: body.title,
        addedSpaceMB: body.addedSpaceMB,
        price: body.price,
        isActive: body.isActive,
      },
      { new: true }
    );

    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Update StoragePlan Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await connectMongo();
    await StoragePlan.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("Delete StoragePlan Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
