import { InlineKeyboard, Keyboard } from "grammy";
import { miniAppUrl } from "../config.js";

export function mainReplyKeyboard() {
  return new Keyboard()
    .text("📄 Документы")
    .text("🗺 Страны")
    .row()
    .text("🌍 Обновления")
    .text("👤 Консультация")
    .row()
    .text("🛂 Открыть приложение")
    .resized();
}

/** Только callback-кнопки — не падает, если Web App URL ещё не настроен в BotFather */
export function welcomeInlineKeyboardTextOnly() {
  return new InlineKeyboard()
    .text("🗺 Страны", "cmd:countries")
    .text("🌍 Новости", "cmd:updates")
    .row()
    .text("👤 Консультация", "cmd:consult");
}

export function welcomeInlineKeyboard(botUsername?: string, withWebApp = true) {
  const kb = new InlineKeyboard();

  if (withWebApp) {
    kb.webApp("🚀 Открыть Pro Visa", miniAppUrl())
      .row()
      .webApp("📄 Проверить документы", miniAppUrl("documents"))
      .row();
  }

  kb.text("🗺 Страны", "cmd:countries")
    .text("🌍 Новости", "cmd:updates")
    .row()
    .text("👤 Консультация", "cmd:consult");

  if (botUsername) {
    kb.row().url(
      "🔗 Поделиться приложением",
      `https://t.me/${botUsername}/app?startapp=share`,
    );
  }

  return kb;
}

export function sectionInlineKeyboard(
  section: "documents" | "updates" | "consult" | "countries",
) {
  return new InlineKeyboard().webApp(
    "Открыть в приложении",
    miniAppUrl(section),
  );
}
