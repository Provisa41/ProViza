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

export function welcomeInlineKeyboard(botUsername?: string) {
  const kb = new InlineKeyboard()
    .webApp("🚀 Открыть Pro Visa", miniAppUrl())
    .row()
    .webApp("📄 Проверить документы", miniAppUrl("documents"))
    .row()
    .text("🗺 Страны", "cmd:countries")
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
