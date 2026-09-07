// In-process scheduler for the AI scraping cycle (exams + jobs).
//
// Registered once at server startup via instrumentation.js. The app runs as a
// long-lived single-instance PM2 process, so node-cron fires reliably and
// without duplication.
//
// Schedules (IST assumed on the server; override with env CRON_TZ):
//   • Exam feed import   — daily 02:00
//   • Job ATS aggregation — daily 03:00
//   • Expiry sweep        — daily 04:00 (hide stale jobs / past exams)
//
// Each run is also reachable on-demand via the /api/cron/* routes.
import cron from "node-cron";

let registered = false;

const TZ = process.env.CRON_TZ || "Asia/Kolkata";

async function safe(label, fn) {
  const started = Date.now();
  try {
    const result = await fn();
    console.log(`[scheduler] ${label} ✓ (${Math.round((Date.now() - started) / 1000)}s)`,
      result ? JSON.stringify(pickStats(result)) : "");
  } catch (e) {
    console.error(`[scheduler] ${label} ✗`, e.message);
  }
}

function pickStats(r) {
  const { scanned, added, duplicates, skipped } = r || {};
  return { scanned, added, duplicates, skipped };
}

// Mark stale aggregated jobs (not seen in the last 30 days) as expired, and
// expire exams whose key dates are all in the past.
async function expirySweep() {
  const connectMongo = (await import("./mongodb.js")).default;
  const AggregatedJob = (await import("../models/AggregatedJob.js")).default;
  const Exam = (await import("../models/Exam.js")).default;
  await connectMongo();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const jobsRes = await AggregatedJob.updateMany(
    { status: "live", lastSyncedAt: { $lt: cutoff } },
    { status: "expired" }
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examsRes = await Exam.updateMany(
    {
      status: "live",
      "keyDates.applicationEnd": { $lt: today },
      $or: [
        { "keyDates.examDate": { $lt: today } },
        { "keyDates.examDate": { $exists: false } },
      ],
      "keyDates.resultDate": { $exists: false },
    },
    { status: "expired" }
  );

  return { jobsExpired: jobsRes.modifiedCount, examsExpired: examsRes.modifiedCount };
}

export function registerSchedulers() {
  if (registered) return;
  registered = true;

  // Run all imports immediately on boot so data is available right away.
  setTimeout(() => runAllImportsNow(), 5000);

  // Daily exam feed import — 02:00
  cron.schedule("0 2 * * *", async () => {
    const { runImport } = await import("./feeds/runImport.js");
    await safe("exam-import", () => runImport({ perFeedLimit: 25, autoPublish: true }));
  }, { timezone: TZ });

  // Daily job aggregation (company ATS boards) — 03:00
  cron.schedule("0 3 * * *", async () => {
    const { runAtsJobImport } = await import("./jobfeeds/runImport.js");
    await safe("job-import", () => runAtsJobImport({ autoPublish: true }));
  }, { timezone: TZ });

  // Daily expiry sweep — 04:00
  cron.schedule("0 4 * * *", async () => {
    await safe("expiry-sweep", expirySweep);
  }, { timezone: TZ });

  // Daily Govt Schemes/Internships/Training refresh — 05:00
  cron.schedule("0 5 * * *", async () => {
    const { runGovtResourceImport } = await import("./govtfeeds/runImport.js");
    await safe("govt-resource-import", () => runGovtResourceImport({ perFeedLimit: 20, autoPublish: false }));
  }, { timezone: TZ });

  // Daily AI-scraped Internship/Industrial Training/Apprenticeship programs — 06:00
  cron.schedule("0 6 * * *", async () => {
    const { runProgramImport } = await import("./programfeeds/runImport.js");
    await safe("program-import", () => runProgramImport({ perSourceLimit: 6, autoPublish: true }));
  }, { timezone: TZ });

  console.log(`[scheduler] registered exam/job/scheme/program import + expiry cycle (tz=${TZ})`);
}

async function runAllImportsNow() {
  console.log("[scheduler] running initial import on boot...");

  const { runAtsJobImport, runJobImport } = await import("./jobfeeds/runImport.js");
  await safe("boot-job-ats", () => runAtsJobImport({ autoPublish: true }));
  await safe("boot-job-rss", () => runJobImport({ perFeedLimit: 25, autoPublish: true }));

  const { runImport } = await import("./feeds/runImport.js");
  await safe("boot-exam-import", () => runImport({ perFeedLimit: 25, autoPublish: true }));

  const { runGovtResourceImport } = await import("./govtfeeds/runImport.js");
  await safe("boot-govt-resource", () => runGovtResourceImport({ perFeedLimit: 20, autoPublish: true }));

  const { runProgramImport } = await import("./programfeeds/runImport.js");
  await safe("boot-program-import", () => runProgramImport({ perSourceLimit: 6, autoPublish: true }));

  console.log("[scheduler] initial boot import complete.");
}
