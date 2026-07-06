import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { MailTemplate } from "@/models/Mailing";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    try {
        await connectMongo();
        const session = await getServerSession(authOptions);
        if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const data = await MailTemplate.find({ 
            ownerId: session.user.id,
            ownerRole: session.user.role 
        }).sort({ createdAt: -1 });

        return NextResponse.json({ ok: true, data });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectMongo();
        const session = await getServerSession(authOptions);
        if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { title, subject, content, id } = await req.json();

        let template;
        if (id) {
            // Update existing template
            template = await MailTemplate.findOneAndUpdate(
                { _id: id, ownerId: session.user.id },
                { title, subject, content },
                { new: true }
            );
        } else {
            // Create new template
            template = await MailTemplate.create({
                ownerId: session.user.id,
                ownerRole: session.user.role,
                title,
                subject,
                content
            });
        }

        return NextResponse.json({ ok: true, data: template });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectMongo();
        const session = await getServerSession(authOptions);
        if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await req.json();
        
        // Ownership check during deletion
        const result = await MailTemplate.deleteOne({ 
            _id: id, 
            ownerId: session.user.id 
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ ok: false, error: "Template not found or access denied" }, { status: 404 });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
