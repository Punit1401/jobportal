import { NextResponse } from "next/server";
import { runProgramImport } from "@/lib/programfeeds/runImport";

// Scheduled AI scraping of internship/training/apprenticeship programs.
// Trigger: GET /api/cron/import-programs with Authorization: Bearer <CRON_SECRET>
export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const stats = await runProgramImport({ perSourceLimit: 6, autoPublish: true });
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Cron Program Import Error:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
