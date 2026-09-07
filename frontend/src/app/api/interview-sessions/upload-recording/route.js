import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";

// True only when real (non-placeholder) AWS credentials are configured.
function s3Configured() {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME } = process.env;
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !S3_BUCKET_NAME) return false;
  // Reject obvious placeholders (e.g. "AKIAxxxx", "xxxx").
  if (/x{4,}/i.test(AWS_SECRET_ACCESS_KEY) || /x{4,}/i.test(AWS_ACCESS_KEY_ID)) return false;
  if (AWS_SECRET_ACCESS_KEY.length < 30) return false;
  return true;
}

// POST multipart: { recording: <video blob>, sessionId? }
// Uploads the interview recording to S3 and records metadata on the session.
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    if (!s3Configured()) {
      return NextResponse.json({
        success: false,
        code: "S3_NOT_CONFIGURED",
        error: "Cloud storage is not configured. Add real AWS S3 credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME, AWS_REGION) to enable saving recordings.",
      }, { status: 503 });
    }

    const form = await req.formData();
    const file = form.get("recording");
    const sessionId = form.get("sessionId");
    if (!file) return NextResponse.json({ success: false, error: "No recording provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "video/webm";
    const ext = mimeType.includes("mp4") ? "mp4" : "webm";
    const key = `interviews/${session.user.id}/${Date.now()}.${ext}`;

    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

    const s3 = new S3Client({
      region: process.env.AWS_REGION || "ap-south-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }));

    const region = process.env.AWS_REGION || "ap-south-1";
    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

    // Update session recording metadata if a session id was provided.
    if (sessionId) {
      await connectMongo();
      await InterviewSession.findByIdAndUpdate(sessionId, {
        recording: { hasRecording: true, mimeType, size: buffer.length, url, createdAt: new Date() },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, url, key, size: buffer.length });
  } catch (error) {
    console.error("Upload Recording Error:", error);
    return NextResponse.json({ success: false, error: "Upload failed: " + (error?.message || "") }, { status: 500 });
  }
}
