/**
 * Проверка без загрузки бота — работает даже если BOT_TOKEN не задан.
 * URL: /health (через rewrite) или /api/health
 */
export default function healthHandler(
  _req: unknown,
  res: {
    statusCode?: number;
    setHeader: (k: string, v: string) => void;
    end: (body: string) => void;
  },
): void {
  const hasBotToken = Boolean(process.env.BOT_TOKEN?.trim());
  const hasWebhookBase = Boolean(process.env.WEBHOOK_BASE_URL?.trim());
  const vercelUrl = process.env.VERCEL_URL?.trim();

  res.statusCode = hasBotToken ? 200 : 503;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(
    JSON.stringify({
      ok: hasBotToken,
      service: "provisa",
      checks: {
        BOT_TOKEN: hasBotToken ? "ok" : "missing — add in Vercel → Settings → Environment Variables",
        WEBHOOK_BASE_URL: hasWebhookBase
          ? "ok"
          : vercelUrl
            ? `will use https://${vercelUrl}`
            : "missing — set to https://pro-viza.vercel.app",
      },
    }),
  );
}
