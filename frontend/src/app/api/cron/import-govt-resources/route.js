import { NextResponse } from "next/server";
import { runGovtResourceImport } from "@/lib/govtfeeds/runImport";

// Scheduled Govt Schemes/Internships/Training refresh.
// Trigger: GET /api/cron/import-govt-resources with Authorization: Bearer <CRON_SECRET>
export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    // Imported as pending so a moderator approves before they go live.
    const stats = await runGovtResourceImport({ perFeedLimit: 20, autoPublish: false });
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Cron Govt Resource Import Error:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
