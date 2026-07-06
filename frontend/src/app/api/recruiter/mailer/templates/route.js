import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { MailTemplate } from "@/models/Mailing";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import Recruiter from "@/models/Recruiter";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const recruiter = await Recruiter.findOne({ email: session.user.email });
    if (!recruiter) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });

    const templates = await MailTemplate.find({ recruiterId: recruiter._id }).sort({ createdAt: -1 });
    return NextResponse.json({ ok: true, data: templates });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const recruiter = await Recruiter.findOne({ email: session.user.email });
    if (!recruiter) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });

    const { title, subject, content, id } = await req.json();
    
    let template;
    if (id) {
        // Update existing
        template = await MailTemplate.findOneAndUpdate(
            { _id: id, recruiterId: recruiter._id },
            { title, subject, content },
            { new: true }
        );
    } else {
        // Create new
        template = await MailTemplate.create({ recruiterId: recruiter._id, title, subject, content });
    }

    return NextResponse.json({ ok: true, data: template });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
    // Same as POST with ID for convenience or separate
    return POST(req);
}

export async function DELETE(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const recruiter = await Recruiter.findOne({ email: session.user.email });
    if (!recruiter) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });

    const { id } = await req.json();
    await MailTemplate.deleteOne({ _id: id, recruiterId: recruiter._id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
