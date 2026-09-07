import { NextResponse } from "next/server";
import { runImport } from "@/lib/feeds/runImport";

// Scheduled feed import. Protect with the same CRON_SECRET bearer the other
// cron jobs use. Configure a scheduler (Vercel cron / external) to hit:
//   GET /api/cron/import-exams   with header  Authorization: Bearer <CRON_SECRET>
export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const stats = await runImport({ perFeedLimit: 25, autoPublish: true });
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Cron Exam Import Error:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
