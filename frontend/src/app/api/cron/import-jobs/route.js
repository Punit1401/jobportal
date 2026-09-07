import { NextResponse } from "next/server";
import { runAtsJobImport, runJobImport } from "@/lib/jobfeeds/runImport";

// Scheduled job aggregation. Protect with the same CRON_SECRET bearer.
// Trigger:  GET /api/cron/import-jobs  with  Authorization: Bearer <CRON_SECRET>
export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const ats = await runAtsJobImport({ autoPublish: true });
    // RSS portals stay off by default (noisy); enable per-source in sources.js.
    const rss = await runJobImport({ perFeedLimit: 25, autoPublish: false });
    return NextResponse.json({ success: true, ats, rss });
  } catch (error) {
    console.error("Cron Job Import Error:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
