import connectMongo from "@/lib/mongodb";
import { ScheduledMail } from "@/models/Mailing";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = params; // Mail ID
  
  try {
    await connectMongo();
    // અહીં તમે એવું લોજિક લગાવી શકો કે આ મેઈલ કેટલી વાર ઓપન થયો
    await ScheduledMail.findByIdAndUpdate(id, { $inc: { opens: 1 } });
    
    // એક પારદર્શક 1x1 પિક્સેલ ઈમેજ રિટર્ન કરો
    const buffer = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (err) {
    return new NextResponse("Error", { status: 500 });
  }
}