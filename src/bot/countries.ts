import { InlineKeyboard } from "grammy";
import {
  countries,
  formatCountryDocumentsHtml,
  getCountry,
  getCountriesByRegion,
} from "../data/visaData.js";
import { SCHENGEN_REGION } from "../data/schengenCountries.js";
import { miniAppUrl } from "../config.js";

export function countriesListKeyboard() {
  const kb = new InlineKeyboard();
  const byRegion = getCountriesByRegion();

  kb.text(`🇪🇺 ${SCHENGEN_REGION} (29 стран)`, "region:schengen").row();

  const otherRegions = Object.keys(byRegion).filter((r) => r !== SCHENGEN_REGION);
  for (const region of otherRegions) {
    const list = byRegion[region];
    if (list.length === 1) {
      const c = list[0];
      kb.text(`${c.flag} ${c.name}`, `country:${c.id}`);
    } else {
      kb.text(`📁 ${region}`, `region:${encodeURIComponent(region)}`);
    }
  }

  kb.row().webApp("📱 Все страны в приложении", miniAppUrl("countries"));
  return kb;
}

export function schengenListKeyboard() {
  const kb = new InlineKeyboard();
  const schengen = countries.filter((c) => c.region === SCHENGEN_REGION);
  schengen.forEach((c, i) => {
    if (i > 0 && i % 2 === 0) kb.row();
    kb.text(`${c.flag} ${c.name}`, `country:${c.id}`);
  });
  kb.row()
    .text("← Назад", "countries:list")
    .webApp("📋 Проверка в приложении", miniAppUrl("documents"));
  return kb;
}

export function regionListKeyboard(region: string) {
  const kb = new InlineKeyboard();
  const list = countries.filter((c) => c.region === region);
  list.forEach((c, i) => {
    if (i > 0 && i % 2 === 0) kb.row();
    kb.text(`${c.flag} ${c.name}`, `country:${c.id}`);
  });
  kb.row().text("← Назад", "countries:list");
  return kb;
}

export function countryDetailKeyboard(countryId: string) {
  return new InlineKeyboard()
    .webApp("📋 Чек-лист", miniAppUrl(`country-${countryId}`))
    .webApp("🔍 Проверить документ", miniAppUrl(`check-${countryId}`))
    .row()
    .text("← К списку", "countries:list")
    .text("🌍 Новости", `news:${countryId}`);
}

export function getCountryDetailText(countryId: string): string | undefined {
  const country = getCountry(countryId);
  if (!country) return undefined;
  return formatCountryDocumentsHtml(country);
}
