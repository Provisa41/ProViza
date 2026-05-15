import "dotenv/config";
import { Bot } from "grammy";
import { config, webhookUrl } from "../src/config.js";

const bot = new Bot(config.botToken);

const url = webhookUrl();
await bot.api.setWebhook(url, {
  allowed_updates: ["message", "callback_query"],
  drop_pending_updates: true,
});
console.log("Webhook set to:", url);
