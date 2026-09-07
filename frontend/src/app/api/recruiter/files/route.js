import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import UserFile from "@/models/UserFile";
import Recruiter from "@/models/Recruiter";
import ServiceProvider from "@/models/serviceprovider"; // Import both models
import StorageSettings from "@/models/StorageSettings";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getProfile(email, role) {
    if (role === 'recruiter') return await Recruiter.findOne({ email });
    if (role === 'serviceprovider') return await ServiceProvider.findOne({ email });
    return null;
}

async function updateStorage(email, role, amount) {
    if (role === 'recruiter') {
        return await Recruiter.findOneAndUpdate({ email }, { $inc: { "subscription.storageUsed": amount } });
    }
    if (role === 'serviceprovider') {
        return await ServiceProvider.findOneAndUpdate({ email }, { $inc: { "subscription.storageUsed": amount } });
    }
}

export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');
    const profile = await getProfile(session.user.email, session.user.role);
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const settings = await StorageSettings.findOne() || { defaultRecruiterSpaceMB: 500, defaultServiceProviderSpaceMB: 500 };
    const defaultMB = session.user.role === 'recruiter' ? settings.defaultRecruiterSpaceMB : settings.defaultServiceProviderSpaceMB;
    const limit = defaultMB + (profile.purchasedStorageMB || 0);

    const storageInfo = {
        storageUsed: profile.subscription?.storageUsed || 0,
        storageLimit: limit
    };

    // Fetch files based on parentId
    const query = { userId: session.user.id };
    if (parentId && parentId !== 'null') query.parentId = parentId;
    else query.parentId = null;

    const files = await UserFile.find(query).sort({ createdAt: -1 });

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
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    if (type === 'file') {
        const fileSizeMB = size / (1024 * 1024);
        const currentUsed = profile.subscription?.storageUsed || 0;
        
        const settings = await StorageSettings.findOne() || { defaultRecruiterSpaceMB: 500, defaultServiceProviderSpaceMB: 500 };
        const defaultMB = session.user.role === 'recruiter' ? settings.defaultRecruiterSpaceMB : settings.defaultServiceProviderSpaceMB;
        const limit = defaultMB + (profile.purchasedStorageMB || 0);

        if (currentUsed + fileSizeMB > limit) {
            return NextResponse.json({ error: "Storage limit exceeded. Please upgrade your storage pack." }, { status: 400 });
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

        // Security check: Ensure user owns this file
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
