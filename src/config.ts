import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function resolveWebhookBaseUrl(): string {
  const explicit = process.env.WEBHOOK_BASE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;
  throw new Error(
    "Set WEBHOOK_BASE_URL (e.g. https://your-project.vercel.app) or deploy on Vercel",
  );
}

function parseAdminChatId(): number | undefined {
  const raw = process.env.ADMIN_CHAT_ID?.trim();
  if (!raw) return undefined;
  const id = Number(raw);
  if (!Number.isFinite(id)) {
    console.warn(
      "ADMIN_CHAT_ID is not a number — consult leads will not be forwarded. Fix in Vercel env.",
    );
    return undefined;
  }
  return id;
}

export const config = {
  get botToken() {
    return required("BOT_TOKEN");
  },
  webhookBaseUrl: resolveWebhookBaseUrl(),
  webhookSecret: process.env.WEBHOOK_SECRET ?? "provisa-webhook",
  miniAppPath: process.env.MINI_APP_PATH ?? "/app",
  port: Number(process.env.PORT ?? 3000),
  isDev: process.env.NODE_ENV !== "production",
  /** Your Telegram user/chat ID — consult leads are sent here */
  adminChatId: parseAdminChatId(),
};

export function miniAppUrl(startapp?: string): string {
  const base = `${config.webhookBaseUrl}${config.miniAppPath}`;
  if (!startapp) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}tgWebAppStartParam=${encodeURIComponent(startapp)}`;
}

/** Публичный URL webhook для Telegram (отдельный Vercel-маршрут api/telegram.ts) */
export function webhookUrl(): string {
  return `${config.webhookBaseUrl}/api/telegram`;
}

/** Устаревший путь — оставлен для совместимости на Express */
export function legacyWebhookPath(): string {
  return `/${config.webhookSecret}`;
}
