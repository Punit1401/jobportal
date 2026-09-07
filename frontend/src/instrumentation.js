// Next.js startup hook. Runs once when the server boots.
// We register the AI scraping cycle here so it runs inside the long-lived
// PM2 process. Guarded so it only runs in the Node.js runtime.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { registerSchedulers } = await import("./lib/scheduler.js");
  registerSchedulers();
}
