import type { Bot } from "grammy";
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

export function registerBotHandlers(bot: Bot): void {
  registerConsultHandlers(bot);
  bot.command("start", async (ctx) => {
    const startParam = ctx.match?.trim();
    const me = await ctx.api.getMe();
    await ctx.reply(welcomeText, {
      parse_mode: "HTML",
      reply_markup: welcomeInlineKeyboard(me.username),
    });
    await ctx.reply("Меню команд:", { reply_markup: mainReplyKeyboard() });
    if (startParam) {
      await ctx.reply(
        `Параметр deep link: <code>${startParam}</code>`,
        { parse_mode: "HTML" },
      );
    }
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

  bot.command("updates", async (ctx) => {
    await ctx.reply(formatNewsDigestHtml(5), {
      parse_mode: "HTML",
      reply_markup: sectionInlineKeyboard("updates"),
    });
  });

  bot.callbackQuery("cmd:countries", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(countriesIntroText, {
      parse_mode: "HTML",
      reply_markup: countriesListKeyboard(),
    });
  });

  bot.callbackQuery("cmd:updates", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(formatNewsDigestHtml(5), {
      parse_mode: "HTML",
      reply_markup: sectionInlineKeyboard("updates"),
    });
  });

  bot.callbackQuery("cmd:consult", async (ctx) => {
    await ctx.answerCallbackQuery();
    await promptConsult(ctx);
  });

  bot.callbackQuery("countries:list", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(countriesIntroText, {
      parse_mode: "HTML",
      reply_markup: countriesListKeyboard(),
    });
  });

  bot.callbackQuery("region:schengen", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `🇪🇺 <b>Шенген — ${SCHENGEN_REGION}</b>\n\nВыберите страну подачи (основная цель поездки). Для каждой — чек-лист и проверка документов.`,
      { parse_mode: "HTML", reply_markup: schengenListKeyboard() },
    );
  });

  bot.callbackQuery(/^region:(.+)$/, async (ctx) => {
    const region = decodeURIComponent(ctx.match![1]);
    if (region === "schengen") return;
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(`📁 <b>${region}</b>\n\nВыберите страну:`, {
      parse_mode: "HTML",
      reply_markup: regionListKeyboard(region),
    });
  });

  bot.callbackQuery(/^country:(.+)$/, async (ctx) => {
    const countryId = ctx.match![1];
    const text = getCountryDetailText(countryId);
    await ctx.answerCallbackQuery();
    if (!text) {
      await ctx.reply("Страна не найдена.");
      return;
    }
    await ctx.editMessageText(text, {
      parse_mode: "HTML",
      reply_markup: countryDetailKeyboard(countryId),
    });
  });

  bot.callbackQuery(/^news:(.+)$/, async (ctx) => {
    const countryId = ctx.match![1];
    const items = getNews(countryId).slice(0, 4);
    await ctx.answerCallbackQuery();
    if (!items.length) {
      await ctx.reply("Новостей по этой стране пока нет.");
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
    const me = await ctx.api.getMe();
    await ctx.reply("Откройте Mini App:", {
      reply_markup: welcomeInlineKeyboard(me.username),
    });
  });

  bot.on("message", async (ctx, next) => {
    if (ctx.message.text?.startsWith("/")) return next();
    const known = [
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
}
