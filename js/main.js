// Menü yapısı: ana başlıklar ve alt başlıklar. Yeni bölüm eklemek için buraya satır eklemek yeterli.
const MENU = [
  {
    id: "lore",
    label: { tr: "Evren", en: "Lore" },
    items: [
      { id: "night-city", label: { tr: "Night City", en: "Night City" } },
      { id: "zaman-cizelgesi", label: { tr: "Tarihçe", en: "Timeline" } },
      { id: "korporasyonlar", label: { tr: "Şirketler", en: "Corporations" } },
      { id: "ceteler", label: { tr: "Çeteler", en: "Gangs" } },
      { id: "edgerunner-hayati", label: { tr: "Edgerunner Hayatı", en: "Edgerunner Life" } },
      { id: "diller", label: { tr: "Diller", en: "Languages" } },
    ],
  },
  {
    id: "rulebook",
    label: { tr: "Kural Kitabı", en: "Rulebook" },
    items: [
      { id: "temel-mekanik", label: { tr: "Temel Kurallar", en: "Core Mechanic" } },
      { id: "statlar-skiller", label: { tr: "Statlar ve Skill'ler", en: "Stats & Skills" } },
      { id: "karakter-yaratma", label: { tr: "Karakter Oluşturma", en: "Character Creation" } },
      { id: "seviye-ilerlemesi", label: { tr: "Seviye Atlama", en: "Level Progression" } },
      { id: "aksiyon-ekonomisi", label: { tr: "Aksiyonlar", en: "Action Economy" } },
      { id: "savas", label: { tr: "Savaş", en: "Combat" } },
      { id: "iyilesme", label: { tr: "İyileşme", en: "Healing" } },
      { id: "araclar-kurallar", label: { tr: "Araçlar", en: "Vehicles" } },
    ],
  },
  {
    id: "players-guide",
    label: { tr: "Oyuncu Rehberi", en: "Player's Guide" },
    items: [
      { id: "baslarken", label: { tr: "Başlarken", en: "Getting Started" } },
      { id: "adim-adim-karakter", label: { tr: "Karakterini Oluştur", en: "Step-by-Step Character" } },
      { id: "terimler-sozlugu", label: { tr: "Sözlük", en: "Glossary" } },
      { id: "hazir-karakterler", label: { tr: "Hazır Karakterler", en: "Pregenerated Characters" } },
      { id: "featler", label: { tr: "Feat'ler", en: "Feats" } },
      { id: "netrunning", label: { tr: "Netrunning", en: "Netrunning" } },
      { id: "cyberware", label: { tr: "Cyberware", en: "Cyberware" } },
      { id: "roller", label: { tr: "Sınıflar", en: "Roles" } },
    ],
  },
  {
    id: "araclar",
    label: { tr: "Araçlar", en: "Tools" },
    items: [
      { id: "stat-dagitma", label: { tr: "Stat Dağıtma", en: "Point Buy" } },
      { id: "dukkan-olusturucu", label: { tr: "Dükkan Oluşturucu", en: "Shop Generator" } },
    ],
  },
];

// Yayınlanan edition'lar, eskiden yeniye. Listenin sonundaki en güncel olandır ve varsayılan olarak seçilir.
const EDITIONS = [
  { id: "0.6", label: "0.6" }, // erken sürüm; eski sürümleri saklamaya V1 ile başlanacak
];

// Sayfa içerikleri (CONTENT) js/content.js dosyasındadır.

// Sayfa metinleri
const TEXT = {
  tr: {
    homeTitle: "Cyberpunk Green",
    homeBody: "Cyberpunk Green; Cyberpunk RED, Edgerunners Mission Kit ve D&D 5e'nin harmanlanıp sistemlerinin sadeleştirilmesiyle ortaya çıkmış bir kural setidir.",
    changelog: "Değişiklik Günlüğü", clAdded: "Eklendi", clBalanced: "Dengelendi", clRemoved: "Kaldırıldı",
    soon: "Bu bölüm henüz yazılmadı.",
    latest: "Güncel",
    motionOn: "Dalgaları kapat",
    motionOff: "Dalgaları aç",
    onThisPage: "Bu sayfada",
    intro: "Giriş",
    toTop: "Başa dön",
  },
  en: {
    homeTitle: "Cyberpunk Green",
    homeBody: "Cyberpunk Green is a ruleset born from blending Cyberpunk RED, the Edgerunners Mission Kit and D&D 5e, and simplifying their systems.",
    changelog: "Changelog", clAdded: "Added", clBalanced: "Balanced", clRemoved: "Removed",
    soon: "This section hasn't been written yet.",
    latest: "Latest",
    motionOn: "Turn waves off",
    motionOff: "Turn waves on",
    onThisPage: "On this page",
    intro: "Introduction",
    toTop: "Back to top",
  },
};

// Alt menünün kapanmadan önce beklediği süre (ms). İmleç kısa süreliğine dışarı kaysa bile menü açık kalır.
const CLOSE_DELAY = 300;

const CAN_HOVER = window.matchMedia("(hover: hover)");

let lang = loadLang();
let edition = loadEdition();

const menuList = document.getElementById("menu-list");
const editionMenu = document.getElementById("edition-menu");
const content = document.getElementById("content");

function loadLang() {
  // Adres ?lang=en ya da ?lang=tr içeriyorsa o dil açılır (link paylaşırken işe yarar).
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (fromUrl === "tr" || fromUrl === "en") return fromUrl;
  try {
    const saved = localStorage.getItem("cg-lang");
    if (saved === "tr" || saved === "en") return saved;
  } catch (e) {}
  return "tr";
}

// Varsayılan en güncel edition. Adres ?v=0.6 gibi bir değer içeriyorsa o edition açılır.
function loadEdition() {
  const fromUrl = new URLSearchParams(location.search).get("v");
  const found = EDITIONS.find((e) => e.id === fromUrl);
  return (found || EDITIONS[EDITIONS.length - 1]).id;
}

function saveLang(value) {
  try { localStorage.setItem("cg-lang", value); } catch (e) {}
}

const CHEVRON =
  '<svg class="chevron" viewBox="0 0 16 16" aria-hidden="true">' +
  '<path d="M2 5l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>';

function renderMenu() {
  menuList.innerHTML = "";
  for (const section of MENU) {
    const li = document.createElement("li");
    li.className = "menu-item";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "menu-trigger";
    trigger.setAttribute("aria-expanded", "false");
    // İki dildeki başlık üst üste aynı hücreye konur, yalnızca seçili dil görünür.
    // Böylece başlığın genişliği uzun olana göre sabitlenir ve dil değişince menü kaymaz.
    const labels = Object.keys(section.label)
      .map((l) => `<span lang="${l}"${l === lang ? "" : ' class="ghost" aria-hidden="true"'}>${section.label[l]}</span>`)
      .join("");
    trigger.innerHTML = `<span class="tlabel">${labels}</span>${CHEVRON}`;

    // Alt menü: dış kutu açılma animasyonunu, iç liste köşesi kesik paneli taşır.
    const sub = document.createElement("div");
    sub.className = "submenu";
    const list = document.createElement("ul");
    list.className = "submenu-list";
    section.items.forEach((item, i) => {
      const subLi = document.createElement("li");
      subLi.style.setProperty("--i", i);
      const a = document.createElement("a");
      a.href = `#${section.id}/${item.id}`;
      a.innerHTML =
        `<span class="idx">${String(i + 1).padStart(2, "0")}</span>` +
        `<span class="label">${item.label[lang]}</span>`;
      subLi.appendChild(a);
      list.appendChild(subLi);
    });
    sub.appendChild(list);

    li.append(trigger, sub);
    menuList.appendChild(li);
    bindMenuItem(li, trigger);
  }
  renderDrawer();
}

// ---------- Telefon menüsü ----------
// Dar ekranda üst menü gizlenir; sol üstteki düğme soldan bir panel açar, arka plan kararır.
// Panelde başlığa dokununca alt başlıklar diğer başlıkları aşağı iterek açılır.
// Bir alt başlık seçilince, karartıya dokununca ya da Esc'e basılınca panel kapanır.

const drawerList = document.getElementById("drawer-list");
const navToggle = document.getElementById("nav-toggle");
const DRAWER_MEDIA = window.matchMedia("(max-width: 860px)");

function renderDrawer() {
  drawerList.innerHTML = MENU.map(
    (section) => `
      <li class="drawer-item">
        <button type="button" class="drawer-trigger" aria-expanded="false"><span>${section.label[lang]}</span>${CHEVRON}</button>
        <div class="drawer-sub">
          <ul>${section.items
            .map((item, i) => {
              const href = `#${section.id}/${item.id}`;
              return (
                `<li><a href="${href}"${href === location.hash ? ' class="active"' : ""}>` +
                `<span class="idx">${String(i + 1).padStart(2, "0")}</span><span class="label">${item.label[lang]}</span></a></li>`
              );
            })
            .join("")}</ul>
        </div>
      </li>`
  ).join("");
}

function setDrawer(open) {
  if (open) {
    // Açık sayfanın başlığı açık gelsin
    for (const item of drawerList.querySelectorAll(".drawer-item")) {
      if (item.querySelector("a.active")) setDrawerItem(item, true);
    }
  }
  document.body.classList.toggle("drawer-open", open);
  navToggle.setAttribute("aria-expanded", open);
}

function setDrawerItem(item, open) {
  item.classList.toggle("open", open);
  item.querySelector(".drawer-trigger").setAttribute("aria-expanded", open);
}

navToggle.addEventListener("click", () => setDrawer(!document.body.classList.contains("drawer-open")));
document.getElementById("drawer-backdrop").addEventListener("click", () => setDrawer(false));

drawerList.addEventListener("click", (e) => {
  const trigger = e.target.closest(".drawer-trigger");
  if (trigger) {
    const item = trigger.closest(".drawer-item");
    setDrawerItem(item, !item.classList.contains("open"));
    return;
  }
  if (e.target.closest("a")) setDrawer(false);
});

DRAWER_MEDIA.addEventListener("change", () => setDrawer(false));

function renderEditionMenu() {
  const current = EDITIONS.find((e) => e.id === edition);
  const latest = EDITIONS[EDITIONS.length - 1];
  editionMenu.innerHTML = "";

  const li = document.createElement("li");
  li.className = "menu-item";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "menu-trigger";
  trigger.setAttribute("aria-expanded", "false");
  trigger.innerHTML = `<span>${current.label}</span>${CHEVRON}`;

  const sub = document.createElement("div");
  sub.className = "submenu";
  const list = document.createElement("ul");
  list.className = "submenu-list";
  // En yeni edition en üstte
  [...EDITIONS].reverse().forEach((ed, i) => {
    const subLi = document.createElement("li");
    subLi.style.setProperty("--i", i);
    const a = document.createElement("a");
    a.href = "#";
    a.dataset.edition = ed.id;
    a.classList.toggle("active", ed.id === edition);
    a.innerHTML =
      `<span class="label">${ed.label}</span>` +
      (ed === latest ? `<span class="tag">${TEXT[lang].latest}</span>` : "");
    a.addEventListener("click", (e) => {
      e.preventDefault();
      setEdition(ed.id);
    });
    subLi.appendChild(a);
    list.appendChild(subLi);
  });
  sub.appendChild(list);

  li.append(trigger, sub);
  editionMenu.appendChild(li);
  bindMenuItem(li, trigger);
}

function setEdition(value) {
  edition = value;
  renderEditionMenu();
  renderContent();
}

function allMenuItems() {
  return document.querySelectorAll(".menu-item");
}

function openItem(li) {
  for (const other of allMenuItems()) {
    if (other !== li) closeItem(other);
  }
  clearTimeout(li._closeTimer);
  li.classList.add("open");
  li.querySelector(".menu-trigger").setAttribute("aria-expanded", "true");
}

function closeItem(li) {
  clearTimeout(li._closeTimer);
  li.classList.remove("open");
  li.querySelector(".menu-trigger").setAttribute("aria-expanded", "false");
}

function bindMenuItem(li, trigger) {
  // Fare: üstüne gelince aç, ayrılınca kısa bir gecikmeyle kapat.
  // Başlık ve alt menü aynı <li> içinde olduğu için aralarında gezinmek menüyü kapatmaz.
  li.addEventListener("mouseenter", () => openItem(li));
  li.addEventListener("mouseleave", () => {
    li._closeTimer = setTimeout(() => closeItem(li), CLOSE_DELAY);
  });

  // Dokunmatik ekran ve klavye: tıklayınca aç/kapat.
  // Faresi olan cihazda menü zaten üstüne gelince açıldığı için tıklama onu kapatmaz.
  trigger.addEventListener("click", () => {
    if (li.classList.contains("open") && !CAN_HOVER.matches) closeItem(li);
    else openItem(li);
  });

  // Klavyeyle menüden çıkınca kapat.
  li.addEventListener("focusout", (e) => {
    if (!li.contains(e.relatedTarget)) closeItem(li);
  });

  // Bir alt başlık seçilince menüyü kapat.
  li.querySelector(".submenu").addEventListener("click", (e) => {
    if (e.target.closest("a")) closeItem(li);
  });
}

function closeAll() {
  for (const li of allMenuItems()) closeItem(li);
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".menu-item")) closeAll();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAll();
    setDrawer(false);
  }
});

// İçerik değişirken eski metin hafifçe yukarı kayarak söner, yenisi sırayla aşağıdan belirir.
const LEAVE_TIME = 180;
let swapTimer = null;

// sidebar: sol panelde "Bu sayfada" listesi yerine gösterilecek aracın adı (örn. sınıf tablosu); false ise sol panel boş kalır
function showContent(html, sidebar) {
  clearTimeout(swapTimer);
  if (!content.hasChildNodes()) {
    putContent(html, sidebar);
    return;
  }
  content.classList.remove("entering");
  content.classList.add("leaving");
  swapTimer = setTimeout(() => putContent(html, sidebar), LEAVE_TIME);
}

function putContent(html, sidebar) {
  content.classList.remove("leaving", "entering");
  toc.classList.remove("entering");
  content.innerHTML = html;
  mountTools(content, lang);
  window.scrollTo(0, 0);
  buildToc(sidebar);
  void content.offsetWidth; // animasyonun baştan oynaması için
  content.classList.add("entering");
  toc.classList.add("entering");
}

// ---------- Sol panel: sayfadaki katmanlar ----------
// İlk katman "Giriş"tir (sayfanın başı, başlığın altındaki kısım); ardından bölüm başlıkları (h2)
// listelenir. Sayfa başlığının kendisi bir katman değildir. Okunan bölüm vurgulanır;
// bir katmana tıklanınca sayfa yumuşakça oraya kayar.

const toc = document.getElementById("toc");
let tocTargets = [];

function buildToc(sidebar) {
  document.querySelector(".layout").classList.toggle("side-tool", !!sidebar);
  // Sayfa "Bu sayfada" panelini istemiyorsa (CONTENT'te toc: false, örn. araçlar) sol panel boş kalır
  if (sidebar === false) {
    tocTargets = [];
    toc.innerHTML = "";
    return;
  }
  if (sidebar) {
    tocTargets = [];
    // Birden fazla araç verilebilir; her biri ayrı bir kutuda alt alta durur
    toc.innerHTML = `<div class="side-stack">${[].concat(sidebar)
      .map((name) => `<div class="toc-panel side-panel"><div class="tool" data-tool="${name}"></div></div>`)
      .join("")}</div>`;
    mountTools(toc, lang, false);
    return;
  }

  const title = content.querySelector("h1");
  const headings = [...content.querySelectorAll("h2[id]")];
  tocTargets = [title, ...headings].filter(Boolean);

  const items = tocTargets
    .map((el, i) => {
      const label = i === 0 ? TEXT[lang].intro : el.textContent;
      return `<li style="--i:${i}">` +
        `<a href="#" data-target="${i}">` +
        `<span class="idx">${String(i + 1).padStart(2, "0")}</span>` +
        `<span class="label">${label}</span></a></li>`;
    })
    .join("");

  toc.innerHTML =
    `<div class="toc-panel">` +
    `<div class="toc-head">${TEXT[lang].onThisPage}</div>` +
    `<ul class="toc-list">${items}</ul>` +
    `</div>`;
  updateTocActive();
}

toc.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-target]");
  if (!a) return;
  e.preventDefault();
  const i = Number(a.dataset.target);
  if (i === 0) window.scrollTo({ top: 0, behavior: "smooth" });
  else tocTargets[i].scrollIntoView({ behavior: "smooth", block: "start" });
});

function updateTocActive() {
  // Barın biraz altındaki çizgiyi geçen son başlık, okunan katmandır
  const line = document.querySelector(".topbar").offsetHeight + 90;
  let active = 0;
  tocTargets.forEach((el, i) => {
    if (i > 0 && el.getBoundingClientRect().top <= line) active = i;
  });
  // Sayfanın en altına gelindiyse son katman seçili olsun
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
    active = tocTargets.length - 1;
  }
  toc.querySelectorAll("a[data-target]").forEach((a) => {
    a.classList.toggle("active", Number(a.dataset.target) === active);
  });

  // Panel kaydırılabilecek kadar uzunsa, okunan katman panelde görünür kalsın
  const list = toc.querySelector(".toc-list");
  const current = toc.querySelector("a.active");
  if (list && current && list.scrollHeight > list.clientHeight) {
    const top = current.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    if (top < list.scrollTop + 30) list.scrollTop = top - 30;
    else if (top > list.scrollTop + list.clientHeight - 50) list.scrollTop = top - list.clientHeight + 50;
  }
}

let tocTick = false;
window.addEventListener("scroll", () => {
  if (tocTick) return;
  tocTick = true;
  requestAnimationFrame(() => {
    tocTick = false;
    updateTocActive();
  });
}, { passive: true });

// Değişiklik günlüğü kutuları (CHANGELOG, content.js). Her sürüm ayrı bir kutu.
function changelogHtml() {
  const t = TEXT[lang];
  const txt = (x) => (typeof x === "string" ? x : x[lang]);
  const line = (cls, mark, e) =>
    `<li class="${cls}"><span class="cl-mark">${mark}</span><span>${e.cat ? `<span class="cl-cat">(${txt(e.cat)})</span> - ` : ""}${txt(e.name)}</span></li>`;
  const MARK = { up: "▲", down: "▼", mod: "~" };
  const group = (title, items) => (items && items.length ? `<div class="cl-group"><b>${title}</b><ul>${items.join("")}</ul></div>` : "");
  return (
    `<h2 class="cl-title">${t.changelog}</h2><div class="changelog">` +
    CHANGELOG.map(
      (v) =>
        `<article class="cl-box"><h3 class="cl-version">V${v.version}</h3>` +
        group(t.clAdded, (v.added || []).map((a) => `<li class="cl-add"><span class="cl-mark">+</span><span>${txt(a)}</span></li>`)) +
        group(t.clBalanced, (v.balanced || []).map((b) => line(`cl-${b.dir}`, MARK[b.dir], b))) +
        group(t.clRemoved, (v.removed || []).map((r) => line("cl-rem", "−", r))) +
        `</article>`
    ).join("") +
    `</div>`
  );
}

function renderContent() {
  const [sectionId, itemId] = location.hash.slice(1).split("/");
  const section = MENU.find((s) => s.id === sectionId);
  const item = section && section.items.find((i) => i.id === itemId);

  for (const a of [...menuList.querySelectorAll(".submenu a"), ...drawerList.querySelectorAll("a")]) {
    a.classList.toggle("active", a.getAttribute("href") === location.hash);
  }

  if (!item) {
    // Ana sayfa: başlık, kısa tanıtım ve değişiklik günlüğü; "Bu sayfada" paneli yok
    showContent(
      `<h1>${TEXT[lang].homeTitle}</h1>` +
      `<p class="home-lead">${TEXT[lang].homeBody}</p>` +
      changelogHtml(),
      false
    );
    return;
  }

  const page = CONTENT[`${section.id}/${item.id}`] || {};
  const soon = `<p class="placeholder">${TEXT[lang].soon}</p>`;
  const sections = page.sections || [];
  // page.tool: başlığın hemen altına, girişin parçası olarak yerleşen araç (örn. sınıf tablosu)
  const topTool = page.tool ? `<div class="tool" data-tool="${page.tool}"></div>` : "";
  const intro = page.intro ? `<div class="intro">${page.intro[lang]}</div>` : sections.length || topTool ? "" : soon;
  const body =
    intro +
    topTool +
    sections
      .map((sec) =>
        `<section class="doc-section">` +
        `<h2 id="${sec.id}">${sec.label[lang]}</h2>` +
        (sec.tool ? `<div class="tool" data-tool="${sec.tool}"></div>` : sec.body ? sec.body[lang] : soon) +
        `</section>`)
      .join("");

  // Sol panelinde araç olan sayfalarda (örn. Sınıflar) üst başlık gösterilmez
  const header = page.sidebar ? "" : `<div class="crumb">${section.label[lang]}</div><h1>${item.label[lang]}</h1>`;
  showContent(header + body, page.toc === false ? false : page.sidebar);
}

// ---------- Başa dön düğmesi ----------
// Sayfa biraz aşağı kaydırılınca sağ altta belirir, tıklanınca yumuşakça en üste çıkarır.

const toTop = document.getElementById("to-top");
const TO_TOP_AFTER = 400; // bu kadar piksel aşağı inince görünür

function updateToTop() {
  toTop.classList.toggle("show", window.scrollY > TO_TOP_AFTER);
}

toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
window.addEventListener("scroll", updateToTop, { passive: true });

function setLang(value) {
  lang = value;
  saveLang(value);
  document.documentElement.lang = value;
  for (const btn of document.querySelectorAll(".lang-btn")) {
    btn.classList.toggle("active", btn.dataset.lang === value);
  }
  renderMenu();
  renderEditionMenu();
  renderContent();
  updateMotionButton();
  toTop.setAttribute("aria-label", TEXT[value].toTop);
  toTop.title = TEXT[value].toTop;
}

for (const btn of document.querySelectorAll(".lang-btn")) {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
}

window.addEventListener("hashchange", renderContent);

// ---------- Dalga düğmesi ----------
// Yalnızca üst bardaki dalgaları açıp kapatır; menü geçişleri her zaman çalışır.

const motionBtn = document.getElementById("motion-btn");
let motion = loadMotion();

// Kayıtlı bir seçim yoksa, işletim sisteminde "hareketi azalt" açıksa dalgalar kapalı başlar.
function loadMotion() {
  try {
    const saved = localStorage.getItem("cg-motion");
    if (saved === "on") return true;
    if (saved === "off") return false;
  } catch (e) {}
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function updateMotionButton() {
  const label = motion ? TEXT[lang].motionOn : TEXT[lang].motionOff;
  motionBtn.setAttribute("aria-pressed", String(motion));
  motionBtn.setAttribute("aria-label", label);
  motionBtn.title = label;
}

function setMotion(value) {
  motion = value;
  try { localStorage.setItem("cg-motion", value ? "on" : "off"); } catch (e) {}
  document.documentElement.classList.toggle("waves-off", !value);
  updateMotionButton();
  value ? startWaves() : stopWaves();
}

motionBtn.addEventListener("click", () => setMotion(!motion));

// ---------- Üst bardaki dalgalar ----------
// Barın sağ tarafında minik yeşil noktalardan bir ızgara var. Ara ara sağdan sola yavaş bir
// dalga geçer: dalganın içinde birkaç tepe vardır, tepeye denk gelen noktalar büyüyüp parlar
// ve su yüzeyi gibi hafifçe yukarı aşağı oynar; tepelerin kıvrımı da dalga ilerlerken değişir.
// Izgara ortaya doğru solar, logoya ulaşmaz.

const wavesCanvas = document.getElementById("waves");
const wavesCtx = wavesCanvas.getContext("2d");

const DOTS = {
  gap: 8,           // noktalar arası mesafe (px)
  size: 0.8,        // noktanın normal yarıçapı
  peak: 1.8,        // tepede yarıçap
  baseAlpha: 0.2,   // normal parlaklık
  peakAlpha: 0.95,  // tepede parlaklık
  lift: 2.5,        // dalga geçerken noktaların yukarı aşağı oynama miktarı (px)
  fadeStart: 0.3,   // ızgaranın tamamen söndüğü nokta, genişliğe oranla
  speed: 60,        // dalga grubunun ilerleme hızı (px/sn)
  band: 130,        // dalga grubunun genişliği (px)
  crest: 56,        // tepeler arası mesafe (px)
  ripple: 0.5,      // tepelerin kendi akış hızı (tur/sn)
  every: [2, 3.5],  // iki dalga arası bekleme (sn); gruplar üst üste biner, akış kesilmez
};

let wavesFrame = null;
let wavesW = 0;
let wavesH = 0;
let pulses = [];
let nextPulse = 0;
let lastTime = null;

function resizeWaves() {
  const dpr = window.devicePixelRatio || 1;
  wavesW = wavesCanvas.clientWidth;
  wavesH = wavesCanvas.clientHeight;
  wavesCanvas.width = Math.round(wavesW * dpr);
  wavesCanvas.height = Math.round(wavesH * dpr);
  wavesCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function newPulse(born, startX) {
  // Her grubun gücü biraz farklı olsun ki akış tekdüze görünmesin
  return { born, startX, seed: Math.random() * Math.PI * 2, power: 0.6 + Math.random() * 0.4 };
}

function spawnPulse(t) {
  pulses.push(newPulse(t, wavesW + DOTS.band * 1.5));
  const [min, max] = DOTS.every;
  nextPulse = t + min + Math.random() * (max - min);
}

// Sayfa açıldığında (ya da dalgalar yeniden açıldığında) ekran boş başlamasın:
// yol boyunca zaten ilerlemekte olan dalgalar hazır gelir.
function warmStart(t) {
  const start = wavesW * DOTS.fadeStart;
  const startX = wavesW + DOTS.band * 1.5;
  const [min, max] = DOTS.every;
  const spacing = DOTS.speed * (min + max) / 2;
  for (let target = startX - spacing * Math.random(); target > start - DOTS.band; target -= spacing) {
    pulses.push(newPulse(t - (startX - target) / DOTS.speed, startX));
  }
  nextPulse = t + min;
}

function drawWaves(time) {
  const t = time / 1000;
  if (lastTime === null) warmStart(t);
  // Sekme arka plandayken geçen süre dalgaları birikmesin
  else if (t - lastTime > 1) nextPulse = Math.max(nextPulse, t + 0.5);
  lastTime = t;
  if (t >= nextPulse) spawnPulse(t);

  const start = wavesW * DOTS.fadeStart;
  const live = pulses.map((p) => {
    const age = t - p.born;
    return {
      center: p.startX - age * DOTS.speed,
      strength: Math.min(1, age / 1.2) * p.power, // doğarken yavaşça güçlenir
      seed: p.seed,
    };
  });
  pulses = pulses.filter((p, i) => live[i].center > start - DOTS.band * 2);

  const ctx = wavesCtx;
  ctx.clearRect(0, 0, wavesW, wavesH);

  const k = (Math.PI * 2) / DOTS.crest;
  const w = Math.PI * 2 * DOTS.ripple * t;

  for (let row = DOTS.gap / 2; row < wavesH; row += DOTS.gap) {
    const v = row / wavesH;
    for (let x = wavesW - DOTS.gap / 2; x > start; x -= DOTS.gap) {
      const fade = Math.min(1, (x - start) / (wavesW * 0.35));

      // Boşta bile ızgara çok hafif nefes alır
      let glow = 0.06 * (0.5 + 0.5 * Math.sin(x * 0.045 + row * 0.11 + t * 0.6));
      let lift = 0;

      for (const p of live) {
        const d = (x - p.center) / DOTS.band;
        const env = Math.exp(-d * d) * p.strength;
        if (env < 0.01) continue;
        // Tepelerin kıvrımı yükseklik ve zamanla değişir
        const phase = x * k + w + Math.sin(v * Math.PI * 1.3 + t * 0.8 + p.seed) * 1.4;
        const crest = Math.pow(0.5 + 0.5 * Math.sin(phase), 2);
        glow = Math.max(glow, env * crest);
        lift += env * Math.cos(phase) * DOTS.lift;
      }

      const r = DOTS.size + (DOTS.peak - DOTS.size) * glow;
      const alpha = (DOTS.baseAlpha + (DOTS.peakAlpha - DOTS.baseAlpha) * glow) * fade;
      if (alpha < 0.02) continue;
      ctx.fillStyle = `rgba(57, 255, 20, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, row + lift, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  wavesFrame = requestAnimationFrame(drawWaves);
}

function startWaves() {
  if (wavesFrame !== null) return;
  pulses = [];
  lastTime = null;
  wavesFrame = requestAnimationFrame(drawWaves);
}

function stopWaves() {
  if (wavesFrame !== null) cancelAnimationFrame(wavesFrame);
  wavesFrame = null;
}

resizeWaves();
window.addEventListener("resize", resizeWaves);

setLang(lang);
setMotion(motion);
