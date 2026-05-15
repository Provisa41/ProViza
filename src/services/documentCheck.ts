import { getCountry } from "../data/visaData.js";
import { getSchengenChecklist, isSchengenCountry } from "../data/schengenCountries.js";

export type DocumentCheckResult = {
  score: number;
  summary: string;
  issues: string[];
  checklist: { item: string; suggested: boolean }[];
  countryId?: string;
  countryName?: string;
};

const fileHints: { pattern: RegExp; label: string }[] = [
  { pattern: /passport|паспорт|zagran|загран/i, label: "Загранпаспорт" },
  { pattern: /insurance|страх|policy|полис/i, label: "Страховка" },
  { pattern: /hotel|отель|booking|брон/i, label: "Бронь жилья" },
  { pattern: /flight|авиа|билет|ticket/i, label: "Авиабилеты" },
  { pattern: /bank|выписк|statement|сбер|тиньк|альфа/i, label: "Выписка из банка" },
  { pattern: /work|работ|employment|2ndfl|2-ндфл|справк/i, label: "Справка с работы" },
  { pattern: /photo|фото|jpg|jpeg|png/i, label: "Фото" },
  { pattern: /invite|приглаш/i, label: "Приглашение" },
];

function guessDetectedLabels(fileName: string): Set<string> {
  const detected = new Set<string>();
  for (const h of fileHints) {
    if (h.pattern.test(fileName)) detected.add(h.label);
  }
  return detected;
}

function matchChecklistItem(docLine: string, detected: Set<string>): boolean {
  const lower = docLine.toLowerCase();
  if (lower.includes("паспорт") && [...detected].some((d) => d.includes("паспорт"))) {
    return true;
  }
  if (lower.includes("страхов") && detected.has("Страховка")) return true;
  if ((lower.includes("брон") || lower.includes("отел") || lower.includes("жиль")) && detected.has("Бронь жилья")) {
    return true;
  }
  if ((lower.includes("авиа") || lower.includes("билет") || lower.includes("перелёт")) && detected.has("Авиабилеты")) {
    return true;
  }
  if ((lower.includes("банк") || lower.includes("выписк")) && detected.has("Выписка из банка")) {
    return true;
  }
  if ((lower.includes("работ") || lower.includes("вуз")) && detected.has("Справка с работы")) {
    return true;
  }
  if (lower.includes("фото") && detected.has("Фото")) return true;
  if (lower.includes("приглаш") && detected.has("Приглашение")) return true;
  return false;
}

export function checkDocuments(
  fileName: string,
  countryId?: string,
): DocumentCheckResult {
  const country = countryId ? getCountry(countryId) : undefined;
  const checklistSource =
    country?.visaTypes[0]?.documents ??
    (countryId && isSchengenCountry(countryId) ? getSchengenChecklist(countryId) : []);

  const detected = guessDetectedLabels(fileName);
  const checklist = checklistSource.map((item) => ({
    item,
    suggested: matchChecklistItem(item, detected) || detected.size === 0,
  }));

  const total = checklist.length || 1;
  const matched = checklist.filter((c) => c.suggested).length;
  const score =
    detected.size === 0
      ? 65 + (fileName.length % 25)
      : Math.min(95, Math.round(50 + (matched / total) * 45));

  const issues: string[] = [];
  if (detected.size === 0) {
    issues.push(
      "По имени файла не определён тип документа — переименуйте, напр. passport.pdf, insurance.pdf",
    );
  }
  const missing = checklist.filter((c) => !c.suggested).slice(0, 4);
  if (missing.length && detected.size > 0) {
    issues.push(`Для пакета не хватает (по чек-листу): ${missing.map((m) => m.item.split("(")[0].trim()).join("; ")}`);
  }
  if (score < 80) {
    issues.push("Проверьте читаемость скана и что загружены все страницы");
  }

  const countryLabel = country ? `${country.flag} ${country.name}` : "общий пакет";

  return {
    score,
    summary:
      score >= 85
        ? `Файл «${fileName}» учтён в пакете для ${countryLabel}. Сверьте полный чек-лист перед подачей.`
        : `Предварительная оценка для ${countryLabel}. Дозагрузите недостающие документы из чек-листа.`,
    issues: [...new Set(issues)].slice(0, 5),
    checklist,
    countryId,
    countryName: country?.name,
  };
}
