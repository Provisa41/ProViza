import type { Express } from "express";

let appPromise: Promise<Express> | undefined;

async function getExpressApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = import("../src/app.js").then((m) => m.getApp());
  }
  return appPromise;
}

/** Vercel: отложенная загрузка — /health не трогает бота */
export default async function vercelHandler(
  req: Parameters<Express>[0],
  res: Parameters<Express>[1],
): Promise<void> {
  try {
    const application = await getExpressApp();
    application(req, res);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!res.headersSent) {
      res.status(500).json({
        ok: false,
        error: message,
        hint: "Vercel → Settings → Environment Variables → BOT_TOKEN (Production) → Redeploy",
      });
    }
  }
}
