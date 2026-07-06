import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import UserFile from "@/models/UserFile";
import Recruiter from "@/models/Recruiter";
import ServiceProvider from "@/models/serviceprovider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getProfile(email, role) {
    if (role === 'recruiter') return await Recruiter.findOne({ email });
    if (role === 'serviceprovider') return await ServiceProvider.findOne({ email });
    return null;
}

async function updateStorage(email, role, amount) {
    const update = { $inc: { "subscription.storageUsed": amount } };
    if (role === 'recruiter') {
        return await Recruiter.findOneAndUpdate({ email }, update, { new: true });
    }
    if (role === 'serviceprovider') {
        return await ServiceProvider.findOneAndUpdate({ email }, update, { new: true });
    }
}

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId') || null;

    const files = await UserFile.find({ 
        userId: session.user.id,
        parentId: parentId === 'null' ? null : parentId 
    }).sort({ type: 1, name: 1 });

    const profile = await getProfile(session.user.email, session.user.role);
    
    // Improved fallback for partial subscription objects
    const storageInfo = {
        storageUsed: profile?.subscription?.storageUsed ?? 0,
        storageLimit: profile?.subscription?.storageLimit ?? 100
    };

    return NextResponse.json({ ok: true, data: files, storage: storageInfo });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, type, size, url, parentId, mimetype } = await req.json();

    const profile = await getProfile(session.user.email, session.user.role);
    if (!profile) return NextResponse.json({ error: "User profile not found" }, { status: 404 });

    if (type === 'file') {
        const fileSizeMB = size / (1024 * 1024);
        const currentUsed = profile.subscription?.storageUsed || 0;
        const limit = profile.subscription?.storageLimit || 100;

        if (currentUsed + fileSizeMB > limit) {
            return NextResponse.json({ error: "Storage limit exceeded. Please upgrade your plan." }, { status: 400 });
        }

        await updateStorage(session.user.email, session.user.role, fileSizeMB);
    }

    const newFile = await UserFile.create({
      userId: session.user.id,
      name,
      type,
      size: size || 0,
      url: url || "",
      parentId: parentId || null,
      mimetype: mimetype || ""
    });

    return NextResponse.json({ ok: true, data: newFile });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
    try {
        await connectMongo();
        const session = await getServerSession(authOptions);
        if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const file = await UserFile.findById(id);
        if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

        if (file.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        if (file.type === 'file') {
            const fileSizeMB = file.size / (1024 * 1024);
            await updateStorage(session.user.email, session.user.role, -fileSizeMB);
        }

        await UserFile.findByIdAndDelete(id);
        return NextResponse.json({ ok: true, message: "Deleted successfully" });
      } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
}
