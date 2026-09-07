import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine folder based on file type
    const isImage = file.type?.startsWith("image/") || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const folderName = isImage ? "images" : "videos";

    const uploadDir = path.join(process.cwd(), "public", "uploads", folderName);
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Directory exists
    }

    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${folderName}/${uniqueName}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
