import connectMongo from "@/lib/mongodb";
import { MailTemplate } from "@/models/Mailing";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function GET() {
  await connectMongo();
  return NextResponse.json(await MailTemplate.find().sort({ createdAt: -1 }));
}

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    let ownerId = session?.user?.id || session?.user?._id;
    if (!ownerId || !mongoose.isValidObjectId(ownerId)) {
      ownerId = new mongoose.Types.ObjectId("000000000000000000000000");
    }

    const body = await req.json();
    const newTemp = await MailTemplate.create({
      ...body,
      ownerId,
      ownerRole: "admin"
    });
    return NextResponse.json(newTemp);
  } catch (error) {
    console.error("Save Template Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save template" }, { status: 500 });
  }
}

export async function DELETE(req) {
  await connectMongo();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await MailTemplate.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

export async function PUT(req) {
  try {
    await connectMongo();
    const body = await req.json();
    const { id, title, subject, content } = body;

    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    const updatedTemp = await MailTemplate.findByIdAndUpdate(id, {
      title,
      subject,
      content
    }, { new: true });

    if (!updatedTemp) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, template: updatedTemp });
  } catch (error) {
    console.error("Update Template Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update template" }, { status: 500 });
  }
}