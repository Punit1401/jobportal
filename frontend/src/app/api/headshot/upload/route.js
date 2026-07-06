import { NextResponse } from "next/server";
import StabilityClient from "@/lib/stability";
import Resume from "@/models/Resume";
import connectMongo from "@/lib/mongodb";

export async function POST(req) {
  try {
    await connectMongo();

    const form = await req.formData();
    const file = form.get("file");
    const userId = form.get("userId");
    const style = form.get("style") || "corporate";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!userId) return NextResponse.json({ error: "No userId provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Create client
    const stability = new StabilityClient(process.env.STABILITY_API_KEY);

    const result = await stability.generateHeadshot({
      imageBuffer: buffer,
      prompt: `Professional ${style} corporate headshot, realistic, studio lighting`,
    });

    const images = (result.artifacts || []).map((a) => a.base64);

    const resume = await Resume.findOne({ _id: userId });
    if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

    resume.headshots = resume.headshots || [];
    images.forEach((img) =>
      resume.headshots.push({
        fileUrl: img,
        service: "StabilityAI",
        style,
        createdAt: new Date(),
      })
    );

    await resume.save();

    return NextResponse.json({ ok: true, images });
  } catch (err) {
    console.error("Headshot error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
