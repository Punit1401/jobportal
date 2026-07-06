import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import MailingList from "@/models/MailingList";
import Candidate from "@/models/Candidate";
import Inquiry from "@/models/Inquiry";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        await connectMongo();
        
        // Fetch lists for this owner
        const lists = await MailingList.find({ 
            ownerId: session.user.id,
            ownerRole: session.user.role 
        }).sort({ createdAt: -1 });

        // Populate members based on role
        const populatedLists = await Promise.all(lists.map(async (list) => {
            const listObj = list.toObject();
            if (session.user.role === 'recruiter') {
                listObj.members = await Candidate.find({ _id: { $in: list.members } });
            } else if (session.user.role === 'serviceprovider') {
                listObj.members = await Inquiry.find({ _id: { $in: list.members } });
            }
            return listObj;
        }));

        return NextResponse.json({ ok: true, data: populatedLists });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const { name, candidateIds } = await req.json();
        await connectMongo();

        const newList = await MailingList.create({
            ownerId: session.user.id,
            ownerRole: session.user.role,
            name,
            members: candidateIds || []
        });

        return NextResponse.json({ ok: true, data: newList });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const { listId, candidateIds } = await req.json();
        await connectMongo();

        const updatedList = await MailingList.findOneAndUpdate(
            { _id: listId, ownerId: session.user.id },
            { $addToSet: { members: { $each: candidateIds } } },
            { new: true }
        );

        return NextResponse.json({ ok: true, data: updatedList });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        await connectMongo();
        await MailingList.findOneAndDelete({ _id: id, ownerId: session.user.id });

        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
