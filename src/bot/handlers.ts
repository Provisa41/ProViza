import type { Bot, Context } from "grammy";
import {
  consultText,
  countriesIntroText,
  documentsText,
  updatesText,
  welcomeText,
} from "./copy.js";
import { formatNewsDigestHtml, getNews } from "../data/visaData.js";
import {
  countriesListKeyboard,
  countryDetailKeyboard,
  getCountryDetailText,
  regionListKeyboard,
  schengenListKeyboard,
} from "./countries.js";
import { SCHENGEN_REGION } from "../data/schengenCountries.js";
import {
  mainReplyKeyboard,
  sectionInlineKeyboard,
  welcomeInlineKeyboard,
} from "./keyboards.js";
import { promptConsult, registerConsultHandlers } from "./consult.js";
import { safeEditOrReply } from "./callbackHelpers.js";

async function replyWelcome(ctx: Context): Promise<void> {
  const username = ctx.me?.username;
  try {
    await ctx.reply(welcomeText, {
      parse_mode: "HTML",
      reply_markup: welcomeInlineKeyboard(username, true),
    });
  } catch (err) {
    console.error("start: webApp keyboard failed, fallback:", err);
    await ctx.reply(welcomeText, {
      parse_mode: "HTML",
      reply_markup: welcomeInlineKeyboard(username, false),
    });
  }
}

export function registerBotHandlers(bot: Bot): void {
  bot.command("start", async (ctx) => {
    const startParam = ctx.match?.trim();
    await replyWelcome(ctx);
    await ctx.reply("Меню команд:", { reply_markup: mainReplyKeyboard() });
    if (startParam) {
      await ctx.reply(
        `Параметр deep link: <code>${startParam}</code>`,
        { parse_mode: "HTML" },
      );
    }
  });

  bot.hears("🚀 Старт", async (ctx) => {
    await replyWelcome(ctx);
    await ctx.reply("Меню команд:", { reply_markup: mainReplyKeyboard() });
  });
  
  bot.command("documents", async (ctx) => {
    await ctx.reply(documentsText, {
      parse_mode: "HTML",
      reply_markup: sectionInlineKeyboard("documents"),
    });
  });

  bot.command("countries", async (ctx) => {
    await ctx.reply(countriesIntroText, {
      parse_mode: "HTML",
      reply_markup: countriesListKeyboard(),
    });
  });

  bot.hears("🚀 Старт", async (ctx) => {
    await replyWelcome(ctx);
    await ctx.reply("Меню команд:", { reply_markup: mainReplyKeyboard() });
  });

  bot.callbackQuery("cmd:countries", async (ctx) => {
    await safeEditOrReply(ctx, countriesIntroText, {
      reply_markup: countriesListKeyboard(),
    });
  });

  bot.callbackQuery("cmd:updates", async (ctx) => {
    await safeEditOrReply(ctx, formatNewsDigestHtml(5), {
      reply_markup: sectionInlineKeyboard("updates"),
    });
  });

  bot.callbackQuery("cmd:consult", async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    try {
      await promptConsult(ctx);
    } catch (err) {
      console.error("cmd:consult error:", err);
      await ctx.reply(consultText, { parse_mode: "HTML" }).catch(() => {});
    }
  });

  bot.callbackQuery("countries:list", async (ctx) => {
    await safeEditOrReply(ctx, countriesIntroText, {
      reply_markup: countriesListKeyboard(),
    });
  });

  bot.callbackQuery("region:schengen", async (ctx) => {
    await safeEditOrReply(
      ctx,
      `🇪🇺 <b>Шенген — ${SCHENGEN_REGION}</b>\n\nВыберите страну подачи (основная цель поездки). Для каждой — чек-лист и проверка документов.`,
      { reply_markup: schengenListKeyboard() },
    );
  });

  bot.callbackQuery(/^region:(.+)$/, async (ctx) => {
    const region = decodeURIComponent(ctx.match![1]);
    await safeEditOrReply(ctx, `📁 <b>${region}</b>\n\nВыберите страну:`, {
      reply_markup: regionListKeyboard(region),
    });
  });

  bot.callbackQuery(/^country:(.+)$/, async (ctx) => {
    const countryId = ctx.match![1];
    const text = getCountryDetailText(countryId);
    if (!text) {
      await ctx.answerCallbackQuery({ text: "Страна не найдена" });
      return;
    }
    await safeEditOrReply(ctx, text, {
      reply_markup: countryDetailKeyboard(countryId),
    });
  });

  bot.callbackQuery(/^news:(.+)$/, async (ctx) => {
    const countryId = ctx.match![1];
    const items = getNews(countryId).slice(0, 4);
    await ctx.answerCallbackQuery().catch(() => {});

    if (!items.length) {
      await ctx.reply("Новостей по этой стране пока нет.", {
        reply_markup: countryDetailKeyboard(countryId),
      });
      return;
    }

    const lines = items.flatMap((n) => [
      `<b>${n.title}</b> (${n.date})`,
      n.summary,
      "",
    ]);
    await ctx.reply(lines.join("\n"), {
      parse_mode: "HTML",
      reply_markup: countryDetailKeyboard(countryId),
    });
  });

  bot.hears("📄 Документы", (ctx) =>
    ctx.reply(documentsText, {
      parse_mode: "HTML",
      reply_markup: sectionInlineKeyboard("documents"),
    }),
  );

  bot.hears("🗺 Страны", (ctx) =>
    ctx.reply(countriesIntroText, {
      parse_mode: "HTML",
      reply_markup: countriesListKeyboard(),
    }),
  );

  bot.hears("🌍 Обновления", (ctx) =>
    ctx.reply(formatNewsDigestHtml(5), {
      parse_mode: "HTML",
      reply_markup: sectionInlineKeyboard("updates"),
    }),
  );

  bot.hears("👤 Консультация", (ctx) => promptConsult(ctx));

  bot.hears("🛂 Открыть приложение", async (ctx) => {
    await ctx.reply("Откройте Mini App:", {
      reply_markup: welcomeInlineKeyboard(ctx.me?.username, true),
    });
  });

  bot.on("callback_query:data", async (ctx) => {
    console.warn("Unhandled callback:", ctx.callbackQuery.data);
    await ctx.answerCallbackQuery({ text: "Обновите чат: /start" });
  });

  bot.on("message", async (ctx, next) => {
    if (ctx.message.text?.startsWith("/")) return next();
    const known = [
      "🚀 Старт",
      "📄 Документы",
      "🗺 Страны",
      "🌍 Обновления",
      "👤 Консультация",
      "🛂 Открыть приложение",
    ];
    if (known.includes(ctx.message.text ?? "")) return next();
    await ctx.reply(
      "Команды: /countries /documents /updates /consult — или кнопки меню.",
      { reply_markup: mainReplyKeyboard() },
    );
  });

  registerConsultHandlers(bot);
}
