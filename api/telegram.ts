/**
 * Отдельный serverless-маршрут для Telegram webhook.
 * URL: https://ваш-проект.vercel.app/api/telegram
 */
import { webhookCallback } from "grammy";
import { getBot } from "../src/bot/instance.js";

export default webhookCallback(getBot(), "https");
