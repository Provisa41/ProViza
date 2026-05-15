import type { Context } from "grammy";
import type { InlineKeyboard } from "grammy";

type ReplyMarkup = Parameters<Context["reply"]>[1];

/** Всегда снимает «часики» с кнопки, затем редактирует или шлёт новое сообщение */
export async function safeEditOrReply(
  ctx: Context,
  text: string,
  options?: {
    reply_markup?: InlineKeyboard;
    parse_mode?: "HTML" | "Markdown";
  },
): Promise<void> {
  await ctx.answerCallbackQuery().catch(() => {});

  const markup = options?.reply_markup;
  const parseMode = options?.parse_mode ?? "HTML";

  try {
    if (ctx.callbackQuery?.message) {
      await ctx.editMessageText(text, {
        parse_mode: parseMode,
        reply_markup: markup,
      });
      return;
    }
  } catch (err) {
    console.warn("editMessageText failed, fallback to reply:", err);
  }

  const replyOpts: ReplyMarkup = { parse_mode: parseMode };
  if (markup) replyOpts.reply_markup = markup;
  await ctx.reply(text, replyOpts);
}
