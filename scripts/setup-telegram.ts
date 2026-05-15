/**
 * Run once after deploy: registers webhook and bot menu (BotFather commands still manual once).
 * Usage: npm run setup-telegram
 */
import "dotenv/config";
import { Bot } from "grammy";
import { config, webhookUrl } from "../src/config.js";
import { configureBot } from "../src/bot/index.js";

const bot = new Bot(config.botToken);

await configureBot(bot);
const url = webhookUrl();
await bot.api.setWebhook(url, {
  allowed_updates: ["message", "callback_query"],
  drop_pending_updates: true,
});

const info = await bot.api.getWebhookInfo();
console.log("OK: bot profile + webhook");
console.log("Webhook:", url);
console.log("Mini App:", `${config.webhookBaseUrl}${config.miniAppPath}`);
console.log("Allowed updates:", info.allowed_updates?.join(", ") || "(default)");
console.log("Pending updates:", info.pending_update_count);
