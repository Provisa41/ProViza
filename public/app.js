const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  applyTheme(tg.themeParams);
  tg.onEvent("themeChanged", () => applyTheme(tg.themeParams));
}

const initData = tg?.initData ?? "";

const greeting = document.getElementById("user-greeting");
const fileInput = document.getElementById("file-input");
const checkBtn = document.getElementById("check-btn");
const resultEl = document.getElementById("result");
const consultBtn = document.getElementById("consult-btn");
const consultPhone = document.getElementById("consult-phone");
const consultTopic = document.getElementById("consult-topic");
const consultStatus = document.getElementById("consult-status");
const countrySelect = document.getElementById("country-select");
const checkCountrySelect = document.getElementById("check-country-select");
const countryDetail = document.getElementById("country-detail");
const newsFilter = document.getElementById("news-filter");
const newsList = document.getElementById("news-list");

let selectedFile = null;
let countriesCache = [];

function applyTheme(params) {
  if (!params) return;
  const root = document.documentElement;
  if (params.bg_color) root.style.setProperty("--tg-bg", params.bg_color);
  if (params.text_color) root.style.setProperty("--tg-text", params.text_color);
  if (params.button_color) root.style.setProperty("--tg-button", params.button_color);
  if (params.button_text_color) {
    root.style.setProperty("--tg-button-text", params.button_text_color);
  }
  if (params.secondary_bg_color) {
    root.style.setProperty("--tg-secondary", params.secondary_bg_color);
  }
}

function getStartParam() {
  return (
    tg?.initDataUnsafe?.start_param ??
    new URLSearchParams(window.location.search).get("tgWebAppStartParam") ??
    ""
  );
}

function switchTab(name) {
  document.querySelectorAll(".tab").forEach((el) => {
    el.classList.toggle("active", el.dataset.tab === name);
  });
  document.querySelectorAll(".panel").forEach((el) => {
    el.classList.toggle("active", el.id === `panel-${name}`);
  });
}

document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

async function apiGet(path) {
  const res = await fetch(path);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

async function apiPost(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
    },
    body: JSON.stringify({ initData, ...body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

function buildGroupedOptions(list) {
  const byRegion = {};
  for (const c of list) {
    if (!byRegion[c.region]) byRegion[c.region] = [];
    byRegion[c.region].push(c);
  }
  const regions = Object.keys(byRegion).sort((a, b) => {
    if (a === "Шенген") return -1;
    if (b === "Шенген") return 1;
    return a.localeCompare(b, "ru");
  });
  return regions
    .map(
      (region) => `
    <optgroup label="${region}">
      ${byRegion[region]
        .map((c) => `<option value="${c.id}">${c.flag} ${c.name}</option>`)
        .join("")}
    </optgroup>
  `,
    )
    .join("");
}

function fillCountrySelects(list) {
  const grouped = buildGroupedOptions(list);
  const head = '<option value="">— выберите страну —</option>';
  countrySelect.innerHTML = head + grouped;
  checkCountrySelect.innerHTML =
    '<option value="">— выберите страну —</option>' + grouped;
  newsFilter.innerHTML = '<option value="">Все страны</option>' + grouped;
}

function setSelectedCountry(id) {
  if (!id) return;
  countrySelect.value = id;
  checkCountrySelect.value = id;
  newsFilter.value = id;
}

function renderCountryDetail(country) {
  if (!country) {
    countryDetail.innerHTML = "Выберите страну, чтобы увидеть чек-лист документов.";
    countryDetail.classList.add("muted");
    return;
  }
  countryDetail.classList.remove("muted");
  const types = country.visaTypes
    .map(
      (vt) => `
    <article class="visa-type">
      <h3>${vt.name}</h3>
      <p class="visa-meta">${vt.purpose} · ${vt.processing}</p>
      <ul class="checklist">${vt.documents.map((d) => `<li>${d}</li>`).join("")}</ul>
      ${vt.notes ? `<p class="visa-note">${vt.notes}</p>` : ""}
    </article>
  `,
    )
    .join("");
  const special =
    country.specialRequirements?.length > 0
      ? `
    <section class="special-req">
      <h3>⚠️ Особые требования</h3>
      <ul>${country.specialRequirements.map((r) => `<li>${r}</li>`).join("")}</ul>
    </section>
  `
      : "";

  countryDetail.innerHTML = `
    <p class="country-summary">${country.flag} <strong>${country.name}</strong> — ${country.summary}</p>
    ${types}
    ${special}
    <p class="badge">Справочно · уточняйте в консульстве</p>
  `;
}

async function loadCountryDetail(id) {
  if (!id) {
    renderCountryDetail(null);
    return;
  }
  countryDetail.textContent = "Загрузка…";
  const data = await apiGet(`/api/countries/${id}`);
  renderCountryDetail(data.country);
}

function newsFlag(n) {
  if (n.countryId) {
    const c = countriesCache.find((x) => x.id === n.countryId);
    return c?.flag ?? "•";
  }
  if (n.region === "Шенген") return "🇪🇺";
  return "🌍";
}

function renderNews(items) {
  if (!items.length) {
    newsList.innerHTML = "<p>Новостей по выбранному фильтру нет.</p>";
    return;
  }
  newsList.classList.remove("muted");
  newsList.innerHTML = items
    .map(
      (n) => `
        <article class="news-card">
          <p class="news-meta">${newsFlag(n)} ${n.date}${n.tag ? ` · #${n.tag}` : ""}</p>
          <h3>${n.title}</h3>
          <p>${n.summary}</p>
        </article>
      `,
    )
    .join("");
}

async function loadNews(countryId = "") {
  newsList.textContent = "Загрузка…";
  const q = countryId ? `?country=${encodeURIComponent(countryId)}` : "";
  const data = await apiGet(`/api/news${q}`);
  renderNews(data.news);
}

function resolveStartTab(start) {
  if (["documents", "updates", "consult", "countries"].includes(start)) return start;
  if (start.startsWith("country-")) return "countries";
  if (start.startsWith("check-")) return "documents";
  return "countries";
}

function resolveCountryFromStart(start) {
  if (start.startsWith("country-")) return start.replace("country-", "");
  if (start.startsWith("check-")) return start.replace("check-", "");
  return "";
}

async function bootstrap() {
  if (!initData) {
    greeting.textContent = "Откройте через Telegram Mini App";
  } else {
    try {
      const session = await apiPost("/api/auth/session", {});
      const user = session.user;
      greeting.textContent = user
        ? `Привет, ${user.first_name}!`
        : "Сессия подтверждена";
    } catch {
      greeting.textContent = "Не удалось проверить сессию";
    }
  }

  try {
    const { countries } = await apiGet("/api/countries");
    countriesCache = countries;
    fillCountrySelects(countries);
    await loadNews();
  } catch (err) {
    countrySelect.innerHTML = "<option>Ошибка загрузки</option>";
    newsList.textContent = err.message;
  }

  const start = getStartParam();
  switchTab(resolveStartTab(start));

  const countryId = resolveCountryFromStart(start);
  if (countryId) {
    setSelectedCountry(countryId);
    await loadCountryDetail(countryId);
    if (start.startsWith("check-")) await loadNews(countryId);
  }
}

function onCountryChange(id) {
  setSelectedCountry(id);
  loadCountryDetail(id).catch((err) => {
    countryDetail.textContent = err.message;
  });
  if (id) loadNews(id).catch(() => {});
}

countrySelect?.addEventListener("change", () => onCountryChange(countrySelect.value));

checkCountrySelect?.addEventListener("change", () => {
  if (checkCountrySelect.value) onCountryChange(checkCountrySelect.value);
});

newsFilter?.addEventListener("change", () => {
  loadNews(newsFilter.value).catch((err) => {
    newsList.textContent = err.message;
  });
});

fileInput?.addEventListener("change", () => {
  selectedFile = fileInput.files?.[0] ?? null;
  const hasCountry = !!checkCountrySelect?.value;
  checkBtn.disabled = !selectedFile || !hasCountry;
});

checkCountrySelect?.addEventListener("change", () => {
  checkBtn.disabled = !selectedFile || !checkCountrySelect.value;
});

checkBtn?.addEventListener("click", async () => {
  if (!selectedFile || !checkCountrySelect?.value) return;
  checkBtn.disabled = true;
  resultEl.classList.add("hidden");
  try {
    const data = await apiPost("/api/documents/check", {
      fileName: selectedFile.name,
      countryId: checkCountrySelect.value,
    });
    const checklistHtml = data.checklist?.length
      ? `<ul class="check-verify">${data.checklist
          .map(
            (c) =>
              `<li class="${c.suggested ? "ok" : "miss"}">${c.suggested ? "✓" : "○"} ${c.item}</li>`,
          )
          .join("")}</ul>`
      : "";
    const specialHtml = data.specialRequirements?.length
      ? `<section class="special-req"><h4>Особые требования</h4><ul>${data.specialRequirements
          .map((r) => `<li>${r}</li>`)
          .join("")}</ul></section>`
      : "";
    resultEl.innerHTML = `
      <p class="score">Готовность: <strong>${data.score}%</strong></p>
      <p>${data.summary}</p>
      ${checklistHtml}
      ${specialHtml}
      ${
        data.issues?.length
          ? `<ul class="issues">${data.issues.map((i) => `<li>${i}</li>`).join("")}</ul>`
          : ""
      }
      <p class="badge">Демо: переименуйте файл (passport.pdf, insurance.pdf…) для точнее</p>
    `;
    resultEl.classList.remove("hidden");
    tg?.HapticFeedback?.notificationOccurred("success");
  } catch (err) {
    resultEl.innerHTML = `<p class="error">${err.message}</p>`;
    resultEl.classList.remove("hidden");
    tg?.HapticFeedback?.notificationOccurred("error");
  } finally {
    checkBtn.disabled = !selectedFile || !checkCountrySelect?.value;
  }
});

consultBtn?.addEventListener("click", async () => {
  consultStatus.textContent = "Отправка…";
  try {
    const data = await apiPost("/api/consult/request", {
      topic: consultTopic?.value ?? "",
      phone: consultPhone?.value?.trim() ?? "",
    });
    consultStatus.textContent = data.message;
    consultTopic.value = "";
    if (consultPhone) consultPhone.value = "";
    tg?.HapticFeedback?.notificationOccurred("success");
  } catch (err) {
    consultStatus.textContent = err.message;
    tg?.HapticFeedback?.notificationOccurred("error");
  }
});

bootstrap();
