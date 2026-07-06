import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import UserFile from "@/models/UserFile";
import fs from "fs";
import path from "path";

const MAX_STORAGE_BYTES = 50 * 1024 * 1024; // 50 MB

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectMongo();
    const files = await UserFile.find({ userId: session.user.id }).sort({ createdAt: -1 });

    // Calculate total size
    const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);

    return NextResponse.json({ success: true, files, totalSize, maxStorage: MAX_STORAGE_BYTES });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectMongo();
    const formData = await req.formData();
    const action = formData.get("action");

    if (action === "create-folder") {
      const name = formData.get("name");
      const parentId = formData.get("parentId") || null;
      if (!name) return NextResponse.json({ error: "Folder name is required" }, { status: 400 });

      const newFolder = await UserFile.create({
        userId: session.user.id,
        name,
        type: "folder",
        parentId: parentId === "null" ? null : parentId,
      });
      return NextResponse.json({ success: true, file: newFolder });
    }

    if (action === "upload-file") {
      const file = formData.get("file");
      const parentId = formData.get("parentId") || null;

      if (!file || typeof file !== "object") return NextResponse.json({ error: "File is required" }, { status: 400 });

      // Check storage limit securely
      const allFiles = await UserFile.find({ userId: session.user.id });
      const currentStorage = allFiles.reduce((acc, f) => acc + (f.size || 0), 0);
      
      if (currentStorage + file.size > MAX_STORAGE_BYTES) {
        return NextResponse.json({ error: "Storage limit exceeded! You can only store up to 50MB." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name);
      // Secure filename generation
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
      const uploadDir = path.join(process.cwd(), "public/uploads/user_files");
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = `/uploads/user_files/${fileName}`;
      fs.writeFileSync(path.join(process.cwd(), `public${filePath}`), buffer);

      const newFile = await UserFile.create({
        userId: session.user.id,
        name: file.name,
        type: "file",
        size: file.size,
        url: filePath,
        parentId: parentId === "null" ? null : parentId,
        mimetype: file.type,
      });

      return NextResponse.json({ success: true, file: newFile });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("File API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "File ID is required" }, { status: 400 });

    await connectMongo();
    
    // Function to recursively find all children
    const findChildrenIds = async (parentId) => {
      const children = await UserFile.find({ parentId });
      let ids = children.map(c => c._id);
      for (let child of children) {
        if (child.type === "folder") {
          ids = [...ids, ...(await findChildrenIds(child._id))];
        }
      }
      return ids;
    };

    // Ensure user can only delete their OWN files (Security check)
    const targetFile = await UserFile.findOne({ _id: id, userId: session.user.id });
    if (!targetFile) return NextResponse.json({ error: "File not found or unauthorized" }, { status: 404 });

    let idsToDelete = [targetFile._id];
    if (targetFile.type === "folder") {
      idsToDelete = [...idsToDelete, ...(await findChildrenIds(targetFile._id))];
    }

    // Delete local files
    const filesToDelete = await UserFile.find({ _id: { $in: idsToDelete }, type: "file" });
    for (let file of filesToDelete) {
      if (file.url) {
        const fullPath = path.join(process.cwd(), "public", file.url);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    // Delete from DB
    await UserFile.deleteMany({ _id: { $in: idsToDelete } });

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
