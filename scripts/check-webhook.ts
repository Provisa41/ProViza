/**
 * Проверка webhook и последней ошибки Telegram.
 * Usage: npm run check-webhook
 */
import "dotenv/config";
import { Bot } from "grammy";
import { config, webhookUrl } from "../src/config.js";

const bot = new Bot(config.botToken);
const expected = webhookUrl();
const info = await bot.api.getWebhookInfo();

console.log("Expected webhook:", expected);
console.log("Actual webhook:  ", info.url || "(not set)");
console.log("Match:", info.url === expected ? "YES" : "NO — run: npm run setup-telegram");
console.log("Pending updates:", info.pending_update_count);
console.log("Allowed updates:", info.allowed_updates?.join(", ") || "(default)");
if (info.last_error_message) {
  console.log("Last error:", info.last_error_date, info.last_error_message);
}
if (info.ip_address) {
  console.log("Telegram IP:", info.ip_address);
}
