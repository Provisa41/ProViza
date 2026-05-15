import type { Bot } from "grammy";
import { createBot } from "./index.js";

let bot: Bot | undefined;
let initPromise: Promise<void> | undefined;

/** Один экземпляр бота для Express и Vercel api/telegram */
export function getBot(): Bot {
  if (!bot) {
    bot = createBot();
  }
  return bot;
}

/** Загружает ctx.me без лишнего getMe() в каждом /start */
export async function ensureBotReady(): Promise<Bot> {
  const instance = getBot();
  if (!initPromise) {
    initPromise = instance.init().catch((err) => {
      initPromise = undefined;
      throw err;
    });
  }
  await initPromise;
  return instance;
}
