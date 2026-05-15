import type { Bot } from "grammy";
import { createBot } from "./index.js";

let bot: Bot | undefined;

/** Один экземпляр бота для Express и Vercel api/telegram */
export function getBot(): Bot {
  if (!bot) {
    bot = createBot();
  }
  return bot;
}
