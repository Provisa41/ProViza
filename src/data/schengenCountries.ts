import type { CountryInfo, VisaNewsItem, VisaTypeInfo } from "./types.js";

export const SCHENGEN_REGION = "Шенген";

const baseTouristDocs = [
  "Загранпаспорт (≥ 3 мес. после поездки, 2 чистые страницы)",
  "Анкета шенгенской визы + фото 35×45 мм (биометрия)",
  "Медицинская страховка мин. 30 000 € на все дни поездки",
  "Бронь авиабилетов туда-обратно",
  "Бронь отелей / приглашение на весь маршрут",
  "Выписка из банка за 3–6 мес. + остаток на поездку",
  "Справка с работы (должность, зарплата, отпуск) или документы из вуза",
  "Копия внутреннего паспорта",
  "Копии прошлых шенгенских виз (если были)",
];

const baseBusinessDocs = [
  ...baseTouristDocs,
  "Приглашение от компании в ЕС (дата, цель, оплата)",
  "Письмо работодателя о командировке",
  "Выписка по счёту компании (если оплачивает работодатель)",
];

function touristType(extra: string[] = [], notes?: string): VisaTypeInfo {
  return {
    id: "tourist",
    name: "Туристическая C",
    purpose: "Отдых, туризм",
    processing: "10–15 рабочих дней (VFS/TLScontact)",
    documents: [...baseTouristDocs, ...extra],
    notes: notes ?? "Подача в консульство страны основной цели поездки.",
  };
}

function businessType(extra: string[] = []): VisaTypeInfo {
  return {
    id: "business",
    name: "Деловая C",
    purpose: "Встречи, переговоры, конференции",
    processing: "10–20 рабочих дней",
    documents: [...baseBusinessDocs, ...extra],
  };
}

type SchengenDef = {
  id: string;
  flag: string;
  name: string;
  consulateHint: string;
  extraTourist?: string[];
};

const defs: SchengenDef[] = [
  { id: "france", flag: "🇫🇷", name: "Франция", consulateHint: "VFS Global / TLScontact по региону" },
  { id: "italy", flag: "🇮🇹", name: "Италия", consulateHint: "VFS Italy — запись онлайн обязательна" },
  { id: "spain", flag: "🇪🇸", name: "Испания", consulateHint: "BLS Spain — слоты появляются утром" },
  { id: "germany", flag: "🇩🇪", name: "Германия", consulateHint: "VFS Germany — анкета VIDEX для части регионов" },
  { id: "greece", flag: "🇬🇷", name: "Греция", consulateHint: "VFS Greece — сезонный рост очередей летом" },
  { id: "portugal", flag: "🇵🇹", name: "Португалия", consulateHint: "VFS Portugal" },
  { id: "netherlands", flag: "🇳🇱", name: "Нидерланды", consulateHint: "VFS Netherlands" },
  { id: "austria", flag: "🇦🇹", name: "Австрия", consulateHint: "VFS Austria" },
  { id: "czech", flag: "🇨🇿", name: "Чехия", consulateHint: "VFS Czech Republic" },
  { id: "hungary", flag: "🇭🇺", name: "Венгрия", consulateHint: "VFS Hungary — часто более короткие очереди" },
  { id: "poland", flag: "🇵🇱", name: "Польша", consulateHint: "VFS Poland / e-konsulat" },
  { id: "croatia", flag: "🇭🇷", name: "Хорватия", consulateHint: "VFS Croatia (с 2023 в Шенгене)" },
  { id: "finland", flag: "🇫🇮", name: "Финляндия", consulateHint: "VFS Finland" },
  { id: "norway", flag: "🇳🇴", name: "Норвегия", consulateHint: "VFS Norway (не ЕС, в Шенгене)" },
  { id: "switzerland", flag: "🇨🇭", name: "Швейцария", consulateHint: "VFS Switzerland (не ЕС)" },
  { id: "belgium", flag: "🇧🇪", name: "Бельгия", consulateHint: "VFS Belgium" },
  { id: "denmark", flag: "🇩🇰", name: "Дания", consulateHint: "VFS Denmark" },
  { id: "sweden", flag: "🇸🇪", name: "Швеция", consulateHint: "VFS Sweden" },
  { id: "slovenia", flag: "🇸🇮", name: "Словения", consulateHint: "VFS Slovenia" },
  { id: "slovakia", flag: "🇸🇰", name: "Словакия", consulateHint: "VFS Slovakia" },
  { id: "estonia", flag: "🇪🇪", name: "Эстония", consulateHint: "VFS Estonia" },
  { id: "latvia", flag: "🇱🇻", name: "Латвия", consulateHint: "VFS Latvia" },
  { id: "lithuania", flag: "🇱🇹", name: "Литва", consulateHint: "VFS Lithuania" },
  { id: "luxembourg", flag: "🇱🇺", name: "Люксембург", consulateHint: "Через посольство / VFS соседней страны" },
  { id: "malta", flag: "🇲🇹", name: "Мальта", consulateHint: "VFS Malta" },
  { id: "iceland", flag: "🇮🇸", name: "Исландия", consulateHint: "VFS Iceland (мало слотов)" },
  { id: "liechtenstein", flag: "🇱🇮", name: "Лихтенштейн", consulateHint: "Через Швейцарию" },
  { id: "bulgaria", flag: "🇧🇬", name: "Болгария", consulateHint: "В Шенгене с 2024 — VFS Bulgaria" },
  { id: "romania", flag: "🇷🇴", name: "Румыния", consulateHint: "В Шенгене с 2024 — VFS Romania" },
];

export const schengenCountries: CountryInfo[] = defs.map((d) => ({
  id: d.id,
  flag: d.flag,
  name: d.name,
  region: SCHENGEN_REGION,
  summary: `Шенген C: подача через ${d.consulateHint}. Виза действует во всей зоне Шенгена.`,
  visaTypes: [
    touristType(d.extraTourist, `Центр подачи: ${d.consulateHint}`),
    businessType(d.extraTourist),
  ],
}));

export const schengenNews: VisaNewsItem[] = [
  {
    id: "sgen1",
    countryId: "",
    region: SCHENGEN_REGION,
    date: "2026-05-17",
    title: "Шенген: правило основной цели поездки",
    summary:
      "Подаёте документы в консульство страны, где проведёте больше всего дней. При равных сроках — страна первого въезда.",
    tag: "правила",
  },
  {
    id: "sgen2",
    countryId: "",
    region: SCHENGEN_REGION,
    date: "2026-05-16",
    title: "Страховка 30 000 € — обязательна",
    summary:
      "Полис на все дни поездки, покрытие медицины и репатриации. Для детей — отдельный полис или включение в семейный.",
    tag: "документы",
  },
  {
    id: "sfr1",
    countryId: "france",
    date: "2026-05-15",
    title: "Франция: очереди VFS",
    summary: "Запись в Париж/Ницу — за 3–5 недель. Подавайте пакет за 2 месяца до вылета.",
    tag: "сроки",
  },
  {
    id: "sit1",
    countryId: "italy",
    date: "2026-05-15",
    title: "Италия: слоты VFS Italy",
    summary: "Проверяйте сайт ежедневно утром. Маршрут по городам должен совпадать с бронями.",
    tag: "запись",
  },
  {
    id: "ses1",
    countryId: "spain",
    date: "2026-05-14",
    title: "Испания: BLS и биометрия",
    summary: "Первичная подача с отпечатками. Повторно биометрия может не требоваться (Visa Information System).",
    tag: "подача",
  },
  {
    id: "sde1",
    countryId: "germany",
    date: "2026-05-14",
    title: "Германия: анкета и финансы",
    summary: "Справка с работы с указанием зарплаты. Выписка — движение средств за полгода.",
    tag: "документы",
  },
  {
    id: "sgr1",
    countryId: "greece",
    date: "2026-05-13",
    title: "Греция: летний сезон",
    summary: "Июль–август — пик очередей. Рассмотрите подачу в низкий сезон или раннюю запись.",
    tag: "сроки",
  },
  {
    id: "shu1",
    countryId: "hungary",
    date: "2026-05-12",
    title: "Венгрия: альтернатива для туристов",
    summary: "При поездке в несколько стран Венгрия иногда даёт более ранние слоты — цель поездки должна быть обоснована.",
    tag: "совет",
  },
  {
    id: "spl1",
    countryId: "poland",
    date: "2026-05-11",
    title: "Польша: e-konsulat",
    summary: "Часть категорий записывается через электронную систему. Следите за объявлениями консульства.",
    tag: "запись",
  },
  {
    id: "sch1",
    countryId: "croatia",
    date: "2026-05-10",
    title: "Хорватия: шенген с 2024",
    summary: "Полноценная шенгенская виза. Популярен летний туризм — бронируйте отели заранее.",
    tag: "въезд",
  },
];

export function isSchengenCountry(countryId: string): boolean {
  return defs.some((d) => d.id === countryId);
}

export function getSchengenChecklist(countryId: string): string[] {
  const country = schengenCountries.find((c) => c.id === countryId);
  return country?.visaTypes[0]?.documents ?? baseTouristDocs;
}
