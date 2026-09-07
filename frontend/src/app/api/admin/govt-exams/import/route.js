import { NextResponse } from "next/server";
import { runImport } from "@/lib/feeds/runImport";

// POST — admin manually triggers a feed import run from the admin panel.
export async function POST(req) {
  try {
    let opts = {};
    try { opts = await req.json(); } catch { /* no body is fine */ }

    const stats = await runImport({
      perFeedLimit: opts.perFeedLimit ?? 25,
      autoPublish: opts.autoPublish ?? true,
    });

    return NextResponse.json({
      success: true,
      message: `Imported ${stats.added} new exam(s). (${stats.duplicates} duplicates, ${stats.skipped} skipped of ${stats.scanned} scanned)`,
      stats,
    });
  } catch (error) {
    console.error("Exam Feed Import Error:", error);
    return NextResponse.json(
      { success: false, error: "Import failed. " + (error?.message || "") },
      { status: 500 }
    );
  }
}
