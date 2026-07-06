import connectMongo from "@/lib/mongodb";
import { ScheduledMail } from "@/models/Mailing";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();
    const { subject, message, type, scheduledTime } = await req.json();

    if (!subject || !message || !scheduledTime) {
      return NextResponse.json({ error: "બધી વિગતો ભરવી જરૂરી છે!" }, { status: 400 });
    }

    const newSchedule = await ScheduledMail.create({
      subject,
      message,
      targetType: req.body.type, // 'custom', 'candidate' વગેરે
      userIds: req.body.userIds, // સિલેક્ટ કરેલા IDs
      scheduledTime: new Date(scheduledTime),
      isSent: false // હજુ મોકલાયો નથી
    });

    return NextResponse.json({ success: true, data: newSchedule });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}