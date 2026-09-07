import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Recruiter from "@/models/Recruiter";
import MailingList from "@/models/MailingList";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const recruiter = await Recruiter.findOne({ email: session.user.email });
    if (!recruiter) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });

    // Return custom lists. We removed the auto-generated dynamic lists for a cleaner UX as requested.
    const customLists = await MailingList.find({ ownerId: recruiter._id, ownerRole: "recruiter" }).populate('members');

    return NextResponse.json({ ok: true, data: customLists });
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

    const { name, type, candidateIds } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const newList = await MailingList.create({
      ownerId: recruiter._id,
      ownerRole: "recruiter",
      name,
      type: type || "Custom",
      members: candidateIds || [],
      count: candidateIds ? candidateIds.length : 0
    });

    return NextResponse.json({ ok: true, data: newList });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const recruiter = await Recruiter.findOne({ email: session.user.email });
    if (!recruiter) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });

    const { listId, candidateIds } = await req.json();
    if (!listId || !candidateIds) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const list = await MailingList.findOneAndUpdate(
      { _id: listId, ownerId: recruiter._id, ownerRole: "recruiter" },
      { $addToSet: { members: { $each: candidateIds } } },
      { new: true }
    );

    if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });

    list.count = list.members.length;
    await list.save();

    return NextResponse.json({ ok: true, data: list });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const recruiter = await Recruiter.findOne({ email: session.user.email });
    if (!recruiter) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });

    const { id, name } = await req.json();
    if (!id || !name) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const list = await MailingList.findOneAndUpdate(
      { _id: id, ownerId: recruiter._id, ownerRole: "recruiter" },
      { name },
      { new: true }
    );

    if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });

    return NextResponse.json({ ok: true, data: list });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const recruiter = await Recruiter.findOne({ email: session.user.email });
    if (!recruiter) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all");

    if (clearAll === "true") {
        await MailingList.deleteMany({ ownerId: recruiter._id, ownerRole: "recruiter" });
        return NextResponse.json({ ok: true, message: "All lists cleared" });
    }

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await MailingList.findOneAndDelete({ _id: id, ownerId: recruiter._id, ownerRole: "recruiter" });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
