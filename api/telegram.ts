/**
 * Telegram webhook (Vercel). URL: {WEBHOOK_BASE_URL}/api/telegram
 */
import { webhookCallback } from "grammy";
import { ensureBotReady, getBot } from "../src/bot/instance.js";

export const config = {
  maxDuration: 30,
};

const handleUpdate = webhookCallback(getBot(), "https");

export default async function telegramWebhook(
  ...args: Parameters<typeof handleUpdate>
): Promise<ReturnType<typeof handleUpdate>> {
  try {
    await ensureBotReady();
    return await handleUpdate(...args);
  } catch (err) {
    console.error("api/telegram error:", err);
    throw err;
  }
}
