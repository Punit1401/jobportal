import connectMongo from "@/lib/mongodb";
import { MailTemplate } from "@/models/Mailing";
import { NextResponse } from "next/server";

export async function GET() {
  await connectMongo();
  return NextResponse.json(await MailTemplate.find().sort({ createdAt: -1 }));
}

export async function POST(req) {
  await connectMongo();
  const body = await req.json();
  const newTemp = await MailTemplate.create(body);
  return NextResponse.json(newTemp);
}

export async function DELETE(req) {
  await connectMongo();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await MailTemplate.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}