// Araçlar: sayfa içine yerleşen etkileşimli parçalar.
// İçerikte <div class="tool" data-tool="..."></div> olan yerlere main.js her sayfa açılışında mountTools() ile yerleştirir.

// ---------- Stat dağıtma (point buy) ----------

const POINT_BUY = {
  budget: 29,
  min: 8,
  max: 20, // stat ölçeğinin üst ucu; ayrıca bir point buy sınırı yok, maliyet zaten artıyor
  // Bir stat'ı 8'den o değere çıkarmanın toplam maliyeti.
  // Her adımın maliyeti, ulaşılan değerin modifier'ı kadardır (en az 1): 14–15 ikişer, 16–17 üçer, 18–19 dörder, 20 beş.
  cost: { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9, 16: 12, 17: 15, 18: 19, 19: 23, 20: 28 },
  totalMin: 3, // ekstra bonuslarla birlikte bir stat'ın inebileceği en düşük değer
  stats: [
    { id: "INT", name: { tr: "Zekâ", en: "Intelligence" } },
    { id: "REF", name: { tr: "Refleks", en: "Reflexes" } },
    { id: "DEX", name: { tr: "Çeviklik", en: "Dexterity" } },
    { id: "TECH", name: { tr: "Teknik", en: "Technique" } },
    { id: "COOL", name: { tr: "Soğukkanlılık", en: "Cool" } },
    { id: "WILL", name: { tr: "İrade", en: "Willpower" } },
    { id: "BODY", name: { tr: "Beden", en: "Body" } },
  ],
  // EMP herkeste 10'dan başlar; isteyen point buy puanıyla artırabilir. Skill vermez.
  emp: { id: "EMP", name: { tr: "Empati", en: "Empathy" }, base: 10 },
};

const TOOL_TEXT = {
  tr: {
    left: "Kalan puan",
    stat: "Stat",
    value: "Değer",
    extra: "Ekstra",
    // İngilizce terimler büyük harfe İngilizce kuralıyla çevrilsin ("MODIFIER", "MODİFİER" değil)
    mod: '<span lang="en">Modifier</span>',
    cost: "Harcanan",
    rights: "Yetkinlik puanı",
    totalRights: "Toplam yetkinlik puanı",
    reset: "Sıfırla",
    lower: "Azalt",
    raise: "Artır",
    extraLower: "ekstra azalt",
    extraRaise: "ekstra artır",
    draft: "Taslak",
    bonuses: [
      { id: "hp", label: "Maksimum HP", formula: "10 + 2 × BODY" },
      { id: "wounded", label: "Ağır Yaralı", formula: "HP bu değerin altına inince" },
      { id: "init", label: "İnisiyatif", formula: "d10 + REF modifier" },
      { id: "death", label: "Ölüm Kurtarma Atışı", formula: "d10 + BODY modifier" },
      { id: "rest", label: "Gece Dinlenmesi", formula: "BODY / 2 HP iyileşir" },
      { id: "humanity", label: '<span lang="en">Humanity</span>', formula: "EMP × 10" },
    ],
  },
  en: {
    left: "Points left",
    stat: "Stat",
    value: "Value",
    extra: "Extra",
    mod: "Modifier",
    cost: "Spent",
    rights: "Proficiency points",
    totalRights: "Total proficiency points",
    reset: "Reset",
    lower: "Lower",
    raise: "Raise",
    extraLower: "lower extra",
    extraRaise: "raise extra",
    draft: "Draft",
    bonuses: [
      { id: "hp", label: "Max HP", formula: "10 + 2 × BODY" },
      { id: "wounded", label: "Seriously Wounded", formula: "when HP drops below this" },
      { id: "init", label: "Initiative", formula: "d10 + REF modifier" },
      { id: "death", label: "Death Save", formula: "d10 + BODY modifier" },
      { id: "rest", label: "Night's Rest", formula: "heals BODY / 2 HP" },
      { id: "humanity", label: "Humanity", formula: "EMP × 10" },
    ],
  },
};

function statMod(v) {
  return Math.floor((v - 10) / 2);
}

function fmtMod(m) {
  return (m >= 0 ? "+" : "−") + Math.abs(m);
}

function statCost(id, v) {
  const c = POINT_BUY.cost;
  return id === POINT_BUY.emp.id ? c[v] - c[POINT_BUY.emp.base] : c[v];
}

const PB_ROWS = [...POINT_BUY.stats, POINT_BUY.emp];
const lowestBuy = (id) => (id === POINT_BUY.emp.id ? POINT_BUY.emp.base : POINT_BUY.min);

// Stat dağıtımı ve bonuslar aynı durumu paylaşır: values = point buy ile alınan değer, extras = başka yerlerden gelen bonus.
let pbState = null;
let pbListeners = [];

function loadPointBuy() {
  const state = { values: {}, extras: {} };
  for (const s of PB_ROWS) {
    state.values[s.id] = lowestBuy(s.id);
    state.extras[s.id] = 0;
  }
  try {
    const saved = JSON.parse(localStorage.getItem("cg-pointbuy"));
    if (saved && saved.values) {
      for (const s of PB_ROWS) {
        if (POINT_BUY.cost[saved.values[s.id]] !== undefined) state.values[s.id] = saved.values[s.id];
        if (Number.isInteger(saved.extras && saved.extras[s.id])) state.extras[s.id] = saved.extras[s.id];
      }
    }
  } catch (e) {}
  return state;
}

function pbTotal(id) {
  return pbState.values[id] + pbState.extras[id];
}

function pbChanged() {
  try { localStorage.setItem("cg-pointbuy", JSON.stringify(pbState)); } catch (e) {}
  for (const fn of pbListeners) fn();
}

function mountPointBuy(el, lang) {
  const t = TOOL_TEXT[lang];
  const { values, extras } = pbState;
  const empId = POINT_BUY.emp.id;

  const spent = () => PB_ROWS.reduce((sum, s) => sum + statCost(s.id, values[s.id]), 0);

  function rowHtml(s) {
    const isEmp = s.id === empId;
    return `
      <div class="pb-row${isEmp ? " pb-emp" : ""}" data-stat="${s.id}">
        <div class="pb-stat"><b>${s.id}</b><span>${s.name[lang]}</span></div>
        <div class="pb-stepper">
          <button type="button" class="pb-btn" data-field="buy" data-step="-1" aria-label="${s.id} ${t.lower}">−</button>
          <output class="pb-value"></output>
          <button type="button" class="pb-btn" data-field="buy" data-step="1" aria-label="${s.id} ${t.raise}">+</button>
        </div>
        <div class="pb-stepper pb-extra">
          <button type="button" class="pb-btn pb-btn-sm" data-field="extra" data-step="-1" aria-label="${s.id} ${t.extraLower}">−</button>
          <output class="pb-extra-value"></output>
          <button type="button" class="pb-btn pb-btn-sm" data-field="extra" data-step="1" aria-label="${s.id} ${t.extraRaise}">+</button>
        </div>
        <div class="pb-mod"></div>
        <div class="pb-cost"></div>
        <div class="pb-rights">${isEmp ? "—" : ""}</div>
      </div>`;
  }

  el.innerHTML = `
    <div class="pb">
      <div class="pb-budget">
        <div class="pb-budget-label">${t.left}</div>
        <div class="pb-budget-value"><span class="pb-left"></span> / ${POINT_BUY.budget}</div>
        <div class="pb-bar"><div class="pb-bar-fill"></div></div>
      </div>
      <div class="pb-head">
        <div>${t.stat}</div><div>${t.value}</div><div>${t.extra}</div><div>${t.mod}</div><div>${t.cost}</div><div>${t.rights}</div>
      </div>
      ${PB_ROWS.map(rowHtml).join("")}
      <div class="pb-foot">
        <div>${t.totalRights}: <b class="pb-total-rights"></b></div>
        <button type="button" class="pb-reset">${t.reset}</button>
      </div>
    </div>`;

  function update() {
    const left = POINT_BUY.budget - spent();
    el.querySelector(".pb-left").textContent = left;
    el.querySelector(".pb-bar-fill").style.width = `${(left / POINT_BUY.budget) * 100}%`;
    let rights = 0;

    for (const s of PB_ROWS) {
      const row = el.querySelector(`[data-stat="${s.id}"]`);
      const v = values[s.id];
      const x = extras[s.id];
      const total = v + x;
      const m = statMod(total);

      row.querySelector(".pb-value").textContent = v;
      const xOut = row.querySelector(".pb-extra-value");
      xOut.textContent = fmtMod(x);
      xOut.classList.toggle("zero", x === 0);
      xOut.classList.toggle("neg", x < 0);

      // Ekstra varsa modifier'ın yanında stat'ın toplam değeri de görünür
      row.querySelector(".pb-mod").innerHTML = fmtMod(m) + (x !== 0 ? `<small>${total}</small>` : "");
      row.querySelector(".pb-mod").classList.toggle("neg", m < 0);
      row.querySelector(".pb-cost").textContent = statCost(s.id, v);

      // Yetkinlik puanları yalnızca point buy ile alınan değerden gelir
      if (s.id !== empId) {
        const r = Math.max(0, statMod(v));
        rights += r;
        row.querySelector(".pb-rights").textContent = r;
      }

      // Bir sonraki adım bütçeyi aşıyorsa ya da sınırdaysa düğme kapanır
      const canRaise = v + 1 <= POINT_BUY.max && statCost(s.id, v + 1) - statCost(s.id, v) <= left;
      row.querySelector('[data-field="buy"][data-step="1"]').disabled = !canRaise;
      row.querySelector('[data-field="buy"][data-step="-1"]').disabled = v <= lowestBuy(s.id) || total - 1 < POINT_BUY.totalMin;
      row.querySelector('[data-field="extra"][data-step="-1"]').disabled = total - 1 < POINT_BUY.totalMin;
    }
    el.querySelector(".pb-total-rights").textContent = rights;
    pbChanged();
  }

  el.addEventListener("click", (e) => {
    const btn = e.target.closest(".pb-btn");
    if (btn && !btn.disabled) {
      const id = btn.closest(".pb-row").dataset.stat;
      const target = btn.dataset.field === "extra" ? extras : values;
      target[id] += Number(btn.dataset.step);
      update();
    }
    if (e.target.closest(".pb-reset")) {
      for (const s of PB_ROWS) {
        values[s.id] = lowestBuy(s.id);
        extras[s.id] = 0;
      }
      update();
    }
  });

  update();
}

// ---------- Statlardan gelen değerler ----------

function mountPointBuyBonuses(el, lang) {
  const t = TOOL_TEXT[lang];

  el.innerHTML = `<div class="pb-bonuses">${t.bonuses
    .map((b) => `
      <div class="pb-bonus" data-bonus="${b.id}">
        <div class="pb-bonus-label">${b.label}${b.draft ? ` <span class="draft">${t.draft}</span>` : ""}</div>
        <div class="pb-bonus-value"></div>
        <div class="pb-bonus-formula">${b.formula}</div>
      </div>`)
    .join("")}</div>`;

  function update() {
    const body = pbTotal("BODY");
    const hp = 10 + 2 * body;
    const out = {
      hp,
      wounded: Math.ceil(hp / 2),
      init: `d10 ${fmtMod(statMod(pbTotal("REF")))}`,
      death: `d10 ${fmtMod(statMod(body))}`,
      rest: Math.floor(body / 2),
      humanity: pbTotal("EMP") * 10,
    };
    for (const b of t.bonuses) {
      el.querySelector(`[data-bonus="${b.id}"] .pb-bonus-value`).textContent = out[b.id];
    }
  }

  pbListeners.push(update);
  update();
}


// ---------- Sınıf tablosu ----------
// Tablo soldaki panelde durur; seçili sınıfın açıklaması sayfanın ortasında görünür.
// Başlıklara tıklanarak sıralanır:
//   Sınıf            → A'dan Z'ye → Z'den A'ya → eklenme sırası
//   Önerilen statlar → INT → REF → … → BODY → sıralama yok; seçili stat'ı önerilen sınıflar en üste çıkar
// Bir satıra tıklanınca o sınıf seçilir. Başta eklenme sırasındaki ilk sınıf seçilidir; sıralama değişince seçim değişmez.
// Tabloda aynı anda en fazla 6,5 satır görünür; fazlası tablonun içinde kaydırılır, başlık satırı sabit kalır.

const STAT_ORDER = ["INT", "REF", "DEX", "TECH", "COOL", "WILL", "BODY"];
const CT_VISIBLE_ROWS = 4.5;

const CLASS_TABLE_TEXT = {
  tr: { name: "Sınıf", stats: "Önerilen statlar", core: "Çekirdek feat", sortHint: "Sıralamak için tıkla" },
  en: { name: "Role", stats: "Suggested stats", core: "Core feat", sortHint: "Click to sort" },
};

// Sınıf özetlerini anlatan karakter (60'larında, kromdan hoşlanmayan, sert mizaçlı bir adam)
const CLASS_NARRATOR = "Elias Varga";

let ctSelected = null; // dil değişince de seçili sınıf korunur
let ctFit = null; // açık sayfadaki tablonun yükseklik ayarı
let cardFits = []; // açık sayfadaki kaydırmalı kartlı listelerin yükseklik ayarları
let ctListeners = []; // seçili sınıf değişince güncellenen alanlar (açıklama, envanter)
window.addEventListener("resize", () => {
  if (ctFit) ctFit();
  for (const fit of cardFits) fit();
});

function ensureClassSelected() {
  if (!CLASSES.some((c) => c.id === ctSelected)) ctSelected = CLASSES[0].id;
}

function statChips(c, stat) {
  return c.stats.map((s) => `<span class="ct-chip${s === stat ? " on" : ""}">${s}</span>`).join("");
}

function mountClassDetail(el, lang) {
  const t = CLASS_TABLE_TEXT[lang];
  ensureClassSelected();

  const show = () => {
    const c = CLASSES.find((x) => x.id === ctSelected);
    el.innerHTML = `
      <div class="ct-detail" aria-live="polite">
        <div class="ct-detail-head">
          <h3>${c.name}</h3>
        </div>
        <div class="ct-detail-meta">
          <div><b>${t.stats}</b><div class="ct-chips">${statChips(c, null)}</div></div>
          <div><b>${t.core}</b><p>${linkTerms(c.core[lang], lang)}</p></div>
        </div>
        <div class="ct-detail-body">
          ${c.quote ? `<blockquote class="ct-quote"><p>“${c.quote[lang]}”</p><cite>- ${CLASS_NARRATOR}</cite></blockquote>` : ""}
          ${c.desc ? c.desc[lang] : c.quote ? "" : `<p class="placeholder">${TEXT[lang].soon}</p>`}
        </div>
      </div>
      ${specBarHtml(c, lang)}
      ${levelTableHtml(c, lang)}`;
    renderSpecFloat(c, lang);
  };
  specFloatShow = show;

  // Specialization düğmesi: seçili olana tıklanırsa kapanır, başka birine tıklanırsa önceki kapanır
  el.addEventListener("click", (e) => {
    const btn = e.target.closest(".spec-btn");
    if (!btn) return;
    const id = btn.dataset.spec;
    ctSpec[ctSelected] = ctSpec[ctSelected] === id ? null : id;
    show();
  });

  ctListeners.push(show);
  show();
}

const MELODY_TEXT = {
  tr: { title: "Melodiler", name: "Melodi", type: "Tür", duration: "Süre", effect: "Etki", placeholder: "Melodi", soon: "Henüz yazılmadı.", draft: "Taslak",
    rule: "Melodi çalmak için bir aksiyon harcarsın ve enstrümanının 1 şarjı gider. Enstrümanın en fazla 2 + Ustalık modifier'ın kadar şarj tutar; prize takılıyken saatte 1 şarj dolar, tam bir gece dinlenmesinde ise tamamen dolar. Melodilerin yalnızca seni duyabilen ve 24 metre (12 kare) içinde olanları etkiler. Buff'lar zar gerektirmez ve en fazla 2 + Ustalık modifier'ın kadar dostu etkiler. Debuff'larda Performance atarsın, hedef de Mental Resist ile karşılık verir; eşitlikte hedef kazanır. Tutmayan bir debuff'ın şarjı da harcanır. Aynı anda yalnızca bir melodin etkide olabilir." },
  en: { title: "Melodies", name: "Melody", type: "Type", duration: "Duration", effect: "Effect", placeholder: "Melody", soon: "Not written yet.", draft: "Draft",
    rule: "Playing a melody takes your action and uses 1 charge from your instrument. Your instrument holds up to 2 + your Mastery modifier charges; while plugged in it regains 1 charge per hour, and it refills completely over a full night's rest. Your melodies only affect those who can hear you within 24 meters (12 squares). Buffs need no roll and affect up to 2 + your Mastery modifier allies. For debuffs, you roll Performance and the target answers with Mental Resist; the target wins ties. A debuff that fails still uses its charge. Only one of your melodies can be in effect at a time." },
};
const MELODIES_PER_SPEC = 7;

const MELODY_PAGES_TEXT = {
  tr: {
    title: "İlave Melodi Sayfaları",
    first: (k) => `Specialization'ının melodi listesinden ${k} melodi seçip öğrenirsin. Öğrendiğin melodileri istediğin zaman çalabilirsin.`,
    more: (k) => `Specialization'ının melodi listesinden ${k} melodi daha seçip öğrenirsin.`,
  },
  en: {
    title: "Extra Melody Pages",
    first: (k) => `You choose and learn ${k} melodies from your specialization's melody list. You can play the melodies you know at any time.`,
    more: (k) => `You choose and learn ${k} more melodies from your specialization's melody list.`,
  },
};

// O seviyede öğrenilen melodi sayısı (CLASSES[].melodyPicks: { seviye: adet })
function melodyPagesHtml(c, level, lang, n) {
  const k = c.melodyPicks && c.melodyPicks[level];
  if (!k) return "";
  const t = MELODY_PAGES_TEXT[lang];
  const first = level === Math.min(...Object.keys(c.melodyPicks).map(Number));
  return `<div class="lv-spec spec-${n}"><h6>${t.title}</h6><p>${first ? t.first(k) : t.more(k)}</p></div>`;
}

// Rockerboy gibi melodisi olan sınıflarda, seçili specialization'ın melodi tablosu (alt başlık o specialization'ın renginde)
function melodyTableHtml(c, spec, lang, n) {
  if (!c.melodies) return "";
  const t = MELODY_TEXT[lang];
  const list = c.melodies[spec.id] || [];
  const rows = Array.from({ length: Math.max(MELODIES_PER_SPEC, list.length) }, (_, i) => {
    const m = list[i];
    return m
      ? `<tr><td>${i + 1}</td><td>${m.name[lang]}</td><td class="mel-${m.type.en.toLowerCase()}">${m.type[lang]}</td><td>${m.duration ? m.duration[lang] : "—"}</td><td>${linkTerms(m.effect[lang], lang)}</td></tr>`
      : `<tr class="ph"><td>${i + 1}</td><td>${t.placeholder} ${i + 1}</td><td>—</td><td>—</td><td>${t.soon}</td></tr>`;
  }).join("");
  return `
    <div class="lv-spec spec-${n} mel">
      <h6>${t.title} ${list.length ? `<span class="draft">${t.draft}</span>` : ""}</h6>
      <p class="mel-rule">${linkTerms(t.rule, lang)}</p>
      <table>
        <thead><tr><th>#</th><th>${t.name}</th><th>${t.type}</th><th>${t.duration}</th><th>${t.effect}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

const SPEC_TEXT = {
  tr: {
    title: "Specialization",
    about: "Specialization, 3. seviyede seçtiğin ve sınıfının içinde belli bir alanda uzmanlaşmanı sağlayan yoldur. Her sınıfın iki specialization'ı vardır ve bunlardan birini seçersin. Seçtiğin specialization sana 3, 5, 8 ve 9. seviyelerde yeni özellikler kazandırır.",
    featTitle: '<span lang="en">Specialization</span> Özelliği', // büyük harfte "SPECIALIZATION" doğru çıksın
    soon: "Henüz yazılmadı.",
    fallback: "Specialization",
    draft: "Taslak",
  },
  en: {
    title: "Specialization",
    about: "A specialization is a path you choose at level 3 that focuses your role in a particular direction. Every role has two specializations, and you choose one of them. Your specialization grants you features at levels 3, 5, 8 and 9.",
    featTitle: "Specialization Feature",
    soon: "Not written yet.",
    fallback: "Specialization",
    draft: "Draft",
  },
};

let ctSpec = {}; // sınıf id → seçili specialization id (her sınıfın seçimi ayrı tutulur)

// Sınıfın specialization'ları; henüz adı konmamışsa iki yer tutucu
// Netrunner: seçili specialization'ın bu seviyede açılan quickhack'leri (3 → II, 7 → III, 10 → IV), specialization renginde ayrı bir kutu.
// 3. seviyede Specialization bölümünün içinde açıklamanın hemen altında, 7 ve 10. seviyede kendi başına gösterilir.
// Specialization seçili değilse gösterilmez. Bu quickhack'ler otomatik gelmez, kütüphaneye eklenebilecekler arasına girer.
const SPEC_QH_TIER = { 3: 2, 7: 3, 10: 4 };
const SPEC_QH_TEXT = {
  tr: { title: `<span lang="en">Specialization Quickhack</span>'leri`, about: "Specialization'ın sayesinde şu quickhack'leri de kütüphanene ekleyebilirsin:" },
  en: { title: "Specialization Quickhacks", about: "Your specialization also lets you add these quickhacks to your library:" },
};

function specQuickhackHtml(c, level, lang) {
  if (c.id !== "netrunner") return ""; // QUICKHACKS'teki specialization id'leri Netrunner'ındır
  const specs = classSpecs(c, lang);
  const s = specs.find((x) => x.id === ctSpec[c.id]);
  if (!s) return "";
  const list = QUICKHACKS.filter((q) => q.spec === s.id && q.tier === SPEC_QH_TIER[level]);
  if (!list.length) return "";
  const n = specs.indexOf(s) + 1;
  const items = list
    .map((q) => `<li><strong lang="en">${q.name}</strong> <span class="qh-meta">(${QH_ROMAN[q.tier]} · ${q.ram} RAM)</span>: ${linkTerms(q.desc[lang], lang)}</li>`)
    .join("");
  return `<div class="lv-spec spec-${n}"><h6 lang="${lang}">${SPEC_QH_TEXT[lang].title}</h6><p>${SPEC_QH_TEXT[lang].about}</p><ul class="lv-qh">${items}</ul></div>`;
}

function classSpecs(c, lang) {
  if (c.specs && c.specs.length) return c.specs;
  const f = SPEC_TEXT[lang].fallback;
  return [
    { id: "a", name: { tr: `${f} 1`, en: `${f} 1` } },
    { id: "b", name: { tr: `${f} 2`, en: `${f} 2` } },
  ];
}

function specButtonsHtml(c, lang) {
  return classSpecs(c, lang)
    .map((s) => {
      const on = ctSpec[c.id] === s.id;
      return `<button type="button" class="spec-btn${on ? " on" : ""}" data-spec="${s.id}" aria-pressed="${on}">${s.name[lang]}</button>`;
    })
    .join("");
}

function specBarHtml(c, lang) {
  return `
    <div class="spec-bar">
      <div class="spec-buttons">${specButtonsHtml(c, lang)}</div>
    </div>`;
}

// Specialization düğmelerinin kayan kopyası: sayfa aşağı kaydırılıp asıl düğmeler yukarıda kalınca,
// seviye kutusunun sağındaki boşlukta, ekranın altında belirir (karşılaştırma için sürekli yukarı çıkmak gerekmesin).
// Sayfa değişince ya da yer yetmeyince gizlenir. Gövdeye bir kez eklenir.
let specFloat = null;
let specFloatShow = null; // açık sınıf detayını yeniden çizen fonksiyon

function renderSpecFloat(c, lang) {
  if (!specFloat) {
    specFloat = document.createElement("div");
    specFloat.className = "spec-float";
    document.body.appendChild(specFloat);
    specFloat.addEventListener("click", (e) => {
      const btn = e.target.closest(".spec-btn");
      if (!btn) return;
      const id = btn.dataset.spec;
      ctSpec[ctSelected] = ctSpec[ctSelected] === id ? null : id;
      if (specFloatShow) specFloatShow();
    });
    window.addEventListener("scroll", updateSpecFloat, { passive: true });
    window.addEventListener("resize", updateSpecFloat);
  }
  specFloat.innerHTML = specButtonsHtml(c, lang);
  updateSpecFloat();
}

function updateSpecFloat() {
  if (!specFloat) return;
  const bar = document.querySelector(".content .spec-bar");
  const levels = document.querySelector(".content .ct-levels");
  if (!bar || !levels) {
    specFloat.classList.remove("show");
    return;
  }
  const b = bar.getBoundingClientRect();
  const l = levels.getBoundingClientRect();
  const content = document.querySelector(".content").getBoundingClientRect();
  const left = l.right + 28;
  const room = Math.min(content.right - 24, window.innerWidth - 72) - left; // içerik alanında ve "yukarı çık" düğmesinin solunda kalsın
  const show = b.bottom < 80 && l.bottom > 160 && room >= 170;
  specFloat.style.left = `${Math.round(left)}px`;
  specFloat.style.width = `${Math.round(Math.min(220, room))}px`;
  specFloat.classList.toggle("show", show);
}

// ---------- Bilgi kutusu (tooltip) ----------
// İçerikte tipRef() ile işaretlenen yazının üstüne imleç gelince, kısa bir beklemeden sonra hızlı bir animasyonla
// açıklamasını gösteren kutu açılır ve imleci takip eder; imleç çıkınca hemen kapanır.
// Dokunmatik ekranda yazıya dokunmak açar, başka bir yere dokunmak kapatır. Kutu gövdeye bir kez eklenir.
// Özellik adlarında yazının rengi ve kutunun çerçevesi bulunduğu yerin --tip-color / --spec-color değişkenlerinden gelir;
// temel terimler (term) metnin kendi renginde kalır, kutuları yeşil çerçevelidir.
const TIP_DELAY = 250; // ms
const tipEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// labelLang: işaretli yazının dili (verilmezse sayfanınki) · titleLang: kutu başlığının dili
function tipRef(label, { text, title = label, labelLang = "", titleLang = "en", term = false }) {
  return `<span class="tip-ref${term ? " tip-term" : ""}" tabindex="0"${labelLang ? ` lang="${labelLang}"` : ""} data-tip="${tipEsc(text)}" data-tip-title="${tipEsc(title)}" data-tip-lang="${titleLang}">${label}</span>`;
}

const tip = { box: null, ref: null, timer: 0, x: 0, y: 0, touch: false, lastType: "mouse", titled: [] };

// Listedeki etiket kutucuğu: açıklaması varsa üstüne gelince bilgi kutusunda açılır
function tagChip(tag, tags, lang) {
  const tg = tags[tag];
  if (!tg.desc) return `<span class="ct-chip tag-${tag}">${tg[lang]}</span>`;
  return `<span class="ct-chip tag-${tag} tip-ref tip-term" tabindex="0" data-tip="${tipEsc(tg.desc[lang])}" data-tip-title="${tipEsc(tg[lang])}" data-tip-lang="${lang}">${tg[lang]}</span>`;
}

// İşaretli yazının üstündeyken çevresindeki kutuların tarayıcı ipucu ("Kapatmak için tıkla" gibi title'lar)
// bilgi kutusunun üstüne çıkmasın diye geçici olarak kaldırılır; imleç çıkınca geri konur.
function tipMuteTitles(ref) {
  for (let el = ref.parentElement; el; el = el.parentElement) {
    if (el.hasAttribute("title")) {
      tip.titled.push([el, el.getAttribute("title")]);
      el.removeAttribute("title");
    }
  }
}

function tipRestoreTitles() {
  for (const [el, title] of tip.titled) el.setAttribute("title", title);
  tip.titled = [];
}

function tipPlace() {
  const b = tip.box;
  const pad = 12;
  const off = 16;
  const w = b.offsetWidth;
  const h = b.offsetHeight;
  let left = tip.x + off;
  let top = tip.y + off + 4;
  if (left + w > innerWidth - pad) left = tip.x - off - w; // sağa sığmazsa imlecin soluna
  if (top + h > innerHeight - pad) top = tip.y - off - h; // aşağı sığmazsa imlecin üstüne
  b.style.left = `${Math.round(Math.min(Math.max(pad, left), innerWidth - pad - w))}px`;
  b.style.top = `${Math.round(Math.max(pad, top))}px`;
}

function tipShow(ref) {
  if (!tip.box) {
    tip.box = document.createElement("div");
    tip.box.className = "tip-box";
    tip.box.setAttribute("role", "tooltip");
    document.body.appendChild(tip.box);
  }
  const accent = ref.classList.contains("tip-term") ? "" : getComputedStyle(ref).getPropertyValue("--spec-color").trim();
  tip.box.style.setProperty("--tip-accent", accent || "var(--neon)");
  tip.box.innerHTML = `<b lang="${ref.dataset.tipLang || "en"}">${tipEsc(ref.dataset.tipTitle)}</b><p>${tipEsc(ref.dataset.tip)}</p>`;
  tip.ref = ref;
  tip.box.classList.remove("show");
  void tip.box.offsetWidth; // animasyon her açılışta baştan başlasın
  tip.box.classList.add("show");
  tipPlace();
}

function tipHide() {
  clearTimeout(tip.timer);
  tipRestoreTitles();
  tip.ref = null;
  tip.touch = false;
  if (tip.box) tip.box.classList.remove("show");
}

document.addEventListener("pointerdown", (e) => { tip.lastType = e.pointerType; }, true);

document.addEventListener("pointerover", (e) => {
  if (e.pointerType !== "mouse") return;
  const ref = e.target.closest && e.target.closest(".tip-ref");
  if (!ref || ref === tip.ref) return;
  tipHide();
  tip.x = e.clientX;
  tip.y = e.clientY;
  tip.ref = ref;
  tipMuteTitles(ref);
  tip.timer = setTimeout(() => { if (tip.ref === ref && ref.isConnected) tipShow(ref); }, TIP_DELAY);
});

document.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse" || !tip.ref) return;
  tip.x = e.clientX;
  tip.y = e.clientY;
  if (!tip.ref.isConnected) return tipHide(); // sayfa yeniden çizildiyse kutu asılı kalmasın
  if (tip.box && tip.box.classList.contains("show")) tipPlace();
});

document.addEventListener("pointerout", (e) => {
  if (e.pointerType !== "mouse" || !tip.ref) return;
  const ref = e.target.closest && e.target.closest(".tip-ref");
  if (ref === tip.ref && !ref.contains(e.relatedTarget)) tipHide();
});

// Dokunmatik: yazıya dokunmak açar (aynı yazıya tekrar dokunmak kapatır), başka bir yere dokunmak kapatır
document.addEventListener("click", (e) => {
  if (tip.lastType === "mouse") return;
  const ref = e.target.closest(".tip-ref");
  if (ref && ref !== tip.ref) {
    tipHide();
    tip.x = e.clientX;
    tip.y = e.clientY;
    tipShow(ref);
    tip.touch = true;
  } else if (tip.ref) tipHide();
});

// Klavye: yazıya Tab ile gelince açılır
document.addEventListener("focusin", (e) => {
  const ref = e.target.closest && e.target.closest(".tip-ref");
  if (!ref || tip.lastType !== "mouse" || ref.matches(":hover")) return;
  const r = ref.getBoundingClientRect();
  tip.x = r.left;
  tip.y = r.bottom - 8;
  tipShow(ref);
});
document.addEventListener("focusout", (e) => { if (e.target === tip.ref) tipHide(); });

window.addEventListener("scroll", () => { if (tip.ref) tipHide(); }, { passive: true });
window.addEventListener("hashchange", tipHide);

// Oyun metnini bilgi kutularıyla işaretler: önce verilen özellik adları (feats: [{ name, tr, en }], örneğin aynı
// specialization'ın diğer özellikleri; renkli yazılır), sonra TERMS'teki temel terimler (metnin kendi renginde).
// Her ad ve terim bir metinde yalnızca ilk geçtiği yerde işaretlenir. Etiketlerin, bağlantıların ve zaten işaretli
// yazıların içine dokunulmaz; tek geçişte değiştirilir ki eklenen açıklamaların içindeki adlar yeniden işaretlenmesin.
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function linkTerms(html, lang, feats = []) {
  if (!html) return html;
  const entries = [
    ...feats.filter((g) => g.name).map((g) => ({ key: `f:${g.name}`, src: reEsc(g.name), ref: (m) => tipRef(m, { text: g[lang], title: g.name, labelLang: "en" }) })),
    ...TERMS.map((x) => ({
      key: x.id,
      src: `(?:${x.match[lang]})(?:'\\p{L}+|\\p{L}*)`, // kelimenin ekleri de işarete dahil
      ref: (m) => tipRef(m, { text: x.desc[lang], title: x.name[lang], titleLang: x.nameLang || lang, term: true }),
    })),
  ];
  const re = new RegExp(`(?<![\\p{L}'])(?:${entries.map((e) => `(${e.src})`).join("|")})`, "gu");
  const used = new Set();
  let skipUntil = ""; // içine dokunulmayan etiketin kapanışı
  return html
    .split(/(<[^>]*>)/)
    .map((part) => {
      if (part.startsWith("<")) {
        if (skipUntil && part.startsWith(skipUntil)) skipUntil = "";
        else if (!skipUntil && /^<span class="tip-ref/.test(part)) skipUntil = "</span";
        else if (!skipUntil && /^<a[\s>]/.test(part)) skipUntil = "</a";
        return part;
      }
      if (skipUntil) return part;
      return part.replace(re, (m, ...groups) => {
        const e = entries[groups.findIndex((g, i) => i < entries.length && g !== undefined)];
        if (!e || used.has(e.key)) return m;
        used.add(e.key);
        return e.ref(m);
      });
    })
    .join("");
}

// Bir specialization özelliğinin açıklaması: aynı specialization'ın diğer özellikleri ve temel terimler işaretlenir
const linkSpecFeature = (f, spec, lang) => linkTerms(f[lang], lang, Object.values(spec.features || {}).filter((g) => g !== f));

const LEVEL_TEXT = {
  tr: { title: "Seviye Atlama", level: "Seviye", core: "Çekirdek Feat" },
  en: { title: "Level Progression", level: "Level", core: "Core Feat" },
};

// Seçili sınıfın seviye kazanımları (açıklama kutusunun altında): her seviye bir başlık, altında kazanımlar satır satır.
// Temel kazanımlar her sınıfta aynı (LEVELS); sınıfa özel ekler ileride CLASSES[].levels ile eklenebilir.
// Her kazanım kendi alt başlığı ve açıklamasıyla gösterilir.
function levelTableHtml(c, lang) {
  const t = LEVEL_TEXT[lang];
  const st = SPEC_TEXT[lang];
  const sub = (h, body, cls = "", hLang = lang) =>
    `<div class="lv-sub${cls}"><h5 lang="${hLang}">${h}</h5>${body}</div>`;
  // Specialization'a ait, kendi başına duran kutu (yeşil çizgisiz bir alt bölüm içinde, aralıklar diğer kazanımlarla aynı)
  const bare = (html) => (html ? `<div class="lv-sub lv-sub-bare">${html}</div>` : "");
  // Seçili specialization'ın o seviyedeki özelliği: başlık özelliğin adı (taslak etiketli), altında açıklaması.
  // Bölüm specialization'ın rengini alır; bu renk hangi specialization'a ait olduğunu gösterir.
  // Özellik yazılmamışsa başlık "Specialization Özelliği" olur. Adlar İngilizce (büyük harfte "İ" çıkmasın diye lang="en").
  // Açıklamada adı geçen diğer özellikler ve temel terimler bilgi kutusuyla işaretlenir (linkTerms).
  const featSub = (f, n, spec) =>
    f
      ? sub(`${f.name} <span class="draft">${st.draft}</span>`, `<p>${linkSpecFeature(f, spec, lang)}</p>`, ` spec-sub spec-${n}`, "en")
      : sub(st.featTitle, `<p class="muted">${st.soon}</p>`, ` spec-sub spec-${n}`, lang === "tr" ? "tr" : "en");

  const blocks = LEVELS.map((gains, i) => {
    const extra = (c.levels && c.levels[i + 1]) || [];
    const parts = [...gains, ...extra].map((g) => {
      if (g === "core") return sub(t.core, `<p>${linkTerms(c.core[lang], lang)}</p>`);
      if (g === "spec") {
        // Specialization: kısa açıklama, altında specialization'lar kendi renkli alt başlıklarıyla.
        // Hiçbiri seçili değilse ikisi de burada (yalnızca 3. seviyede) görünür; biri seçiliyse sadece o,
        // ve bölümün çizgisi ile başlığı o specialization'ın rengini alır.
        // Seçili specialization'ın ekleri (melodi sayfaları, melodi tablosu, quickhack'ler) bölümün içinde değil,
        // altında kendi başlarına durur. Adlar İngilizce (büyük harfte "İ" çıkmasın diye lang="en").
        const specs = classSpecs(c, lang);
        const shown = specs.filter((s) => !ctSpec[c.id] || s.id === ctSpec[c.id]);
        const nested = shown
          .map((s) => {
            const n = specs.indexOf(s) + 1;
            const text = s.desc ? s.desc[lang] : s.summary ? `<p>${s.summary[lang]}</p>` : `<p class="muted">${st.soon}</p>`;
            return `<div class="lv-spec spec-${n}"><h6 lang="en">${s.name[lang]}</h6>${text}</div>`;
          })
          .join("");
        // 3. seviye özelliği yalnızca yazılmışsa çıkar (Netrunner'da quickhack'ler, Rockerboy'da melodiler onun yerini tutar).
        const chosen = specs.find((s) => s.id === ctSpec[c.id]);
        const n = chosen ? specs.indexOf(chosen) + 1 : 0;
        const f = chosen && chosen.features && chosen.features[i + 1];
        const extras = chosen
          ? (f ? featSub(f, n, chosen) : "") + bare(melodyPagesHtml(c, i + 1, lang, n)) + bare(melodyTableHtml(c, chosen, lang, n)) + bare(specQuickhackHtml(c, i + 1, lang))
          : "";
        return sub(st.title, `<p>${st.about}</p>${nested}`, chosen ? ` spec-sub spec-${n}` : "", "en") + extras;
      }
      if (g === "specfeat") {
        // Seçili specialization'ın bu seviyedeki özelliği; seçim yoksa bu alt başlık hiç gösterilmez.
        // Bölüm specialization'ın rengini alır; melodi sayfaları bölümün altında kendi başına durur.
        const specs = classSpecs(c, lang);
        const chosen = specs.find((s) => s.id === ctSpec[c.id]);
        if (!chosen) return "";
        const n = specs.indexOf(chosen) + 1;
        return featSub(chosen.features && chosen.features[i + 1], n, chosen) + bare(melodyPagesHtml(c, i + 1, lang, n));
      }
      if (g === "specqh") return bare(specQuickhackHtml(c, i + 1, lang));
      return sub(g.h[lang], `<p>${linkTerms(g.p[lang], lang)}</p>`);
    }).join("");
    return `
      <div class="lv-block">
        <h4>${t.level} ${i + 1}</h4>
        ${parts}
      </div>`;
  }).join("");
  return `
    <div class="ct-detail ct-levels">
      <h3>${t.title}</h3>
      ${blocks}
    </div>`;
}

const GEAR_TEXT = {
  tr: { title: "Başlangıç Envanteri", draft: "Taslak", languages: "Diller", extraLang: "Seçilen 1 dil" },
  en: { title: "Starting Gear", draft: "Draft", languages: "Languages", extraLang: "1 language of choice" },
};

// Seçili sınıfın başlangıç envanteri (sol panelde, sınıf tablosunun altında)
function mountClassGear(el, lang) {
  const t = GEAR_TEXT[lang];
  ensureClassSelected();

  const show = () => {
    const c = CLASSES.find((x) => x.id === ctSelected);
    // Her başlığın altında eşyalar alt alta
    const group = (label, items) => `<div class="gear-group"><b>${label}</b><ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul></div>`;
    // Diller: herkes Streetslang bilir; sınıfın ek dil hakkı kadar "Seçilen 1 dil" satırı eklenir
    const langs = ["Streetslang", ...Array.from({ length: c.extraLanguages || 0 }, () => t.extraLang)];
    const rows = (c.gear || []).map((g) => group(g.label[lang], g.items[lang])).join("") + group(t.languages, langs);
    el.innerHTML = `
      <div class="gear">
        <div class="gear-head">
          <span>${t.title}</span>
          <span class="draft">${t.draft}</span>
        </div>
        <div class="gear-class">${c.name}</div>
        ${rows || `<p class="placeholder">${TEXT[lang].soon}</p>`}
      </div>`;
  };
  ctListeners.push(show);
  show();
}

function mountClassTable(el, lang) {
  const t = CLASS_TABLE_TEXT[lang];
  let nameSort = 0; // 0 = eklenme sırası, 1 = A→Z, -1 = Z→A
  let statIdx = -1; // -1 = stat sıralaması yok
  ensureClassSelected();

  el.innerHTML = `
    <div class="ct-wrap">
      <table class="ct">
        <thead>
          <tr>
            <th><button type="button" class="ct-sort" data-col="name" title="${t.sortHint}">${t.name}<span class="ct-ind"></span></button></th>
            <th><button type="button" class="ct-sort" data-col="stats" title="${t.sortHint}">${t.stats}<span class="ct-ind"></span></button></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>`;

  const wrap = el.querySelector(".ct-wrap");
  const tbody = el.querySelector("tbody");

  // Görünen alanı 4,5 satıra göre ayarla (satır yükseklikleri metne göre değişebilir)
  function fitHeight() {
    const rows = tbody.rows;
    if (rows.length <= CT_VISIBLE_ROWS) {
      wrap.style.maxHeight = "";
      return;
    }
    let h = el.querySelector("thead").offsetHeight;
    const full = Math.floor(CT_VISIBLE_ROWS);
    for (let i = 0; i < full; i++) h += rows[i].offsetHeight;
    h += rows[full].offsetHeight * (CT_VISIBLE_ROWS - full);
    wrap.style.maxHeight = `${Math.round(h)}px`;
  }

  function render() {
    const stat = statIdx >= 0 ? STAT_ORDER[statIdx] : null;
    let rows = CLASSES.map((c, i) => ({ c, i }));

    if (nameSort !== 0) {
      rows.sort((a, b) => nameSort * a.c.name.localeCompare(b.c.name, lang));
    }
    if (stat) {
      // Seçili stat'ı olanlar üste; kendi aralarında eklenme sırası korunur
      rows.sort((a, b) => (b.c.stats.includes(stat) - a.c.stats.includes(stat)) || a.i - b.i);
    }

    tbody.innerHTML = rows
      .map(({ c }) => {
        const cls = [stat && !c.stats.includes(stat) ? "dim" : "", c.id === ctSelected ? "selected" : ""].join(" ").trim();
        return `<tr class="${cls}" data-id="${c.id}" tabindex="0" aria-selected="${c.id === ctSelected}">
          <td class="ct-name">${c.name}</td>
          <td><div class="ct-chips">${statChips(c, stat)}</div></td>
        </tr>`;
      })
      .join("");

    const [nameInd, statInd] = el.querySelectorAll(".ct-ind");
    nameInd.textContent = nameSort === 1 ? "A→Z" : nameSort === -1 ? "Z→A" : "";
    statInd.textContent = stat || "";
    el.querySelector('[data-col="name"]').classList.toggle("active", nameSort !== 0);
    el.querySelector('[data-col="stats"]').classList.toggle("active", !!stat);
    fitHeight();
  }

  function select(id) {
    ctSelected = id;
    for (const tr of tbody.rows) {
      const on = tr.dataset.id === id;
      tr.classList.toggle("selected", on);
      tr.setAttribute("aria-selected", on);
    }
    for (const fn of ctListeners) fn();
  }

  el.addEventListener("click", (e) => {
    const btn = e.target.closest(".ct-sort");
    if (btn) {
      if (btn.dataset.col === "name") {
        statIdx = -1;
        nameSort = nameSort === 0 ? 1 : nameSort === 1 ? -1 : 0;
      } else {
        nameSort = 0;
        statIdx = statIdx + 1 >= STAT_ORDER.length ? -1 : statIdx + 1;
      }
      render();
      return;
    }
    const tr = e.target.closest("tbody tr");
    if (tr) select(tr.dataset.id);
  });

  el.addEventListener("keydown", (e) => {
    const tr = e.target.closest("tbody tr");
    if (tr && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      select(tr.dataset.id);
    }
  });

  ctFit = fitHeight;
  render();
}


// ---------- Açılır kartlı liste (araçlar, diller) ----------
// Başlıklara tıklanarak sıralanır: metin → A'dan Z'ye → Z'den A'ya → varsayılan; sayı → büyükten küçüğe → küçükten büyüğe → varsayılan.
// Bir satıra tıklanınca satır kaybolur ve yerinde kayarak açılan bir bilgi kartına dönüşür.
// Karta tıklanınca yeniden satıra döner. Aynı anda tek satır açık kalır.
// cols: [{ key, label, text, en, asc, ind, value(item), cell(item) }] · asc: sayı sütunu ilk tıklamada küçükten büyüğe sıralanır · ind: [artan, azalan] gösterge metni
// items: dizi ya da (filtreli liste için) dizi döndüren fonksiyon · card(item): kartın içeriği · t: { sortHint, close, draft?, empty? }
// rowTint(item): satırın rengi { color, spec, cls } (yoksa null). color ad/parlama/kartı boyar; spec verilirse
// açılan kartın sağdaki %25'lik kısmı o renge döner; cls satıra ve karta ek sınıf verir (örn. "iconic").
// Dönen { render } ile tablo dışarıdan (örn. filtre değişince) yeniden çizilir.

// maxRows verilirse tablo en fazla o kadar satır gösterir (10,5 gibi buçuklu: yarım satır kaydırılabileceğini belli eder).
function mountCardTable(el, lang, { items, cols, card, t, cls = "", maxRows = 0, rowTint = null }) {
  let sortKey = null;
  let sortDir = 0; // metin: 1 = A→Z, -1 = Z→A · sayı: -1 = büyükten küçüğe, 1 = küçükten büyüğe
  let openId = null;

  const head = cols
    .map((c) => `<th><button type="button" class="ct-sort" data-col="${c.key}" title="${t.sortHint}"${c.en ? ' lang="en"' : ""}>${c.label}<span class="ct-ind"></span></button></th>`)
    .join("");

  el.innerHTML = `
    ${t.draft ? `<p class="vt-note"><span class="draft">${t.draft}</span></p>` : ""}
    <div class="ct-wrap vt ${cls}">
      <table class="ct">
        <thead><tr>${head}</tr></thead>
        <tbody></tbody>
      </table>
    </div>`;

  const tbody = el.querySelector("tbody");
  const wrap = el.querySelector(".ct-wrap");

  // Sıralama göstergesi: [artan, azalan]. Telefonda tablo dar kalsın diye yalnızca ok gösterilir.
  const narrow = matchMedia("(max-width: 760px)");
  const indLabels = (c) => (narrow.matches ? ["↑", "↓"] : c.ind || (c.text ? ["A→Z", "Z→A"] : ["↑", "↓"]));

  // Satırlar tek satırlık ve eşit yükseklikte; açık kart satır sayılmaz: kart açıkken görünen alan kartın boyu kadar uzar
  function fit() {
    if (!maxRows) return;
    const rows = [...tbody.querySelectorAll(".vt-row")];
    const closed = rows.find((r) => !r.classList.contains("open"));
    if (rows.length <= maxRows || !closed) {
      wrap.style.maxHeight = "";
      return;
    }
    const card = tbody.querySelector(".vt-detail.open .vt-inner");
    wrap.style.maxHeight = `${Math.round(el.querySelector("thead").offsetHeight + closed.offsetHeight * maxRows + (card ? card.scrollHeight : 0))}px`;
  }
  if (maxRows) {
    cardFits.push(fit);
    if (document.fonts) document.fonts.ready.then(fit);
  }

  function render() {
    let rows = (typeof items === "function" ? items() : items).map((item, i) => ({ item, i }));
    if (sortKey) {
      const col = cols.find((c) => c.key === sortKey);
      rows.sort((a, b) => {
        const x = col.text ? col.value(a.item).localeCompare(col.value(b.item), lang) : col.value(a.item) - col.value(b.item);
        return sortDir * x || a.i - b.i;
      });
    }
    tbody.innerHTML = rows
      .map(({ item }) => {
        const open = item.id === openId;
        const tint = rowTint ? rowTint(item) : null;
        const tc = !tint ? "" : ` tinted${tint.spec ? " spec-tinted" : ""}${tint.cls ? ` ${tint.cls}` : ""}`;
        const ts = !tint ? "" : ` style="--tint: ${tint.color}${tint.spec ? `; --spec: ${tint.spec}` : ""}"`;
        const cells = cols.map((c, i) => `<td${i === 0 ? ' class="ct-name"' : ""}>${c.cell ? c.cell(item) : c.value(item)}</td>`).join("");
        return `
          <tr class="vt-row${tc}${open ? " open" : ""}"${ts} data-id="${item.id}" tabindex="0" aria-expanded="${open}">${cells}</tr>
          <tr class="vt-detail${tc}${open ? " open" : ""}"${ts} data-for="${item.id}">
            <td colspan="${cols.length}"><div class="vt-slide"><div class="vt-inner">
              <div class="vt-card" title="${t.close}">${card(item)}</div>
            </div></div></td>
          </tr>`;
      })
      .join("");
    if (!rows.length && t.empty) tbody.innerHTML = `<tr class="ct-empty"><td colspan="${cols.length}">${t.empty}</td></tr>`;

    for (const c of cols) {
      const btn = el.querySelector(`[data-col="${c.key}"]`);
      const on = sortKey === c.key;
      btn.classList.toggle("active", on);
      btn.querySelector(".ct-ind").textContent = !on ? "" : indLabels(c)[sortDir === 1 ? 0 : 1];
    }
    fit();
  }

  function toggle(id) {
    openId = openId === id ? null : id;
    for (const tr of tbody.querySelectorAll(".vt-row")) {
      const on = tr.dataset.id === openId;
      tr.classList.toggle("open", on);
      tr.setAttribute("aria-expanded", on);
    }
    for (const tr of tbody.querySelectorAll(".vt-detail")) tr.classList.toggle("open", tr.dataset.for === openId);
    if (!maxRows) return;
    fit();
    // Açılan kart kaydırılan listenin dışında kalmasın; kayarak açılması bitince görünür yere getirilir
    const detail = openId && tbody.querySelector(`.vt-detail.open[data-for="${CSS.escape(openId)}"]`);
    if (detail) setTimeout(() => detail.scrollIntoView({ block: "nearest", behavior: "smooth" }), 320);
  }

  el.addEventListener("click", (e) => {
    const btn = e.target.closest(".ct-sort");
    if (btn) {
      const col = cols.find((c) => c.key === btn.dataset.col);
      const first = col.text || col.asc ? 1 : -1;
      if (sortKey !== col.key) {
        sortKey = col.key;
        sortDir = first;
      } else if (sortDir === first) {
        sortDir = -sortDir;
      } else {
        sortKey = null;
        sortDir = 0;
      }
      render();
      return;
    }
    // Kartın içindeki düğmeler, kutular ve bağlantılar kartı kapatmaz (örn. masa kartındaki Gir / Sil)
    if (e.target.closest(".vt-card button, .vt-card input, .vt-card textarea, .vt-card a, .vt-card form, .vt-card .tip-ref")) return;
    const tr = e.target.closest(".vt-row");
    if (tr) toggle(tr.dataset.id);
    const detail = e.target.closest(".vt-detail.open");
    if (detail) toggle(detail.dataset.for);
  });

  el.addEventListener("keydown", (e) => {
    const tr = e.target.closest(".vt-row");
    if (tr && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      toggle(tr.dataset.id);
    }
  });

  // Sıralama göstergesi çıkınca sütunlar kaymasın: her başlığa, göstergenin en geniş hâli kadar yer baştan ayrılır
  function reserveSort() {
    for (const c of cols) {
      const btn = el.querySelector(`[data-col="${c.key}"]`);
      const ind = btn.querySelector(".ct-ind");
      const was = { active: btn.classList.contains("active"), text: ind.textContent };
      btn.style.minWidth = "";
      btn.classList.remove("active");
      ind.textContent = "";
      const width = () => btn.getBoundingClientRect().width;
      let w = width();
      btn.classList.add("active");
      for (const label of indLabels(c)) {
        ind.textContent = label;
        w = Math.max(w, width());
      }
      btn.classList.toggle("active", was.active);
      ind.textContent = was.text;
      if (w) btn.style.minWidth = `${Math.ceil(w)}px`;
    }
  }
  // Ekran telefon genişliğine girip çıkınca gösterge biçimi değişir; yalnızca o zaman yeniden çizilir
  let wasNarrow = narrow.matches;
  cardFits.push(() => {
    if (narrow.matches !== wasNarrow) {
      wasNarrow = narrow.matches;
      render();
    }
    reserveSort();
  });
  if (document.fonts) document.fonts.ready.then(reserveSort);

  render();
  reserveSort();
  return { render };
}


// ---------- Araç tablosu ----------
// Kartta: yolcu, HP, hız, içindekilere ve arkasındakilere sağladığı siper, açıklama.

const VEHICLE_TEXT = {
  tr: { name: "Araç tipi", passengers: "Yolcu", hp: "HP", speed: '<span class="lbl-full">Hız (tur başına)</span><span class="lbl-short">Hız</span>', m: "m", priceCol: '<span class="lbl-full">Ort. Fiyat</span><span class="lbl-short">Fiyat</span>', draft: "Taslak", sortHint: "Sıralamak için tıkla", close: "Kapatmak için tıkla",
    levels: { none: "Yok", partial: "Kısmi", full: "Tam" },
    card: { passengers: "Yolcu sınırı", hp: "HP", speed: "Hız", price: "Ort. Fiyat", coverIn: "İçindekilere siper", coverBehind: "Arkasındakilere siper", desc: "Açıklama" } },
  en: { name: "Vehicle type", passengers: "Passengers", hp: "HP", speed: '<span class="lbl-full">Speed (per round)</span><span class="lbl-short">Speed</span>', m: "m", priceCol: '<span class="lbl-full">Avg. Price</span><span class="lbl-short">Price</span>', draft: "Draft", sortHint: "Click to sort", close: "Click to close",
    levels: { none: "None", partial: "Partial", full: "Full" },
    card: { passengers: "Passenger limit", hp: "HP", speed: "Speed", price: "Avg. Price", coverIn: "Cover for those inside", coverBehind: "Cover for those behind it", desc: "Description" } },
};

function mountVehicleTable(el, lang) {
  const t = VEHICLE_TEXT[lang];
  mountCardTable(el, lang, {
    items: VEHICLES,
    t,
    cols: [
      { key: "name", label: t.name, text: true, value: (v) => v.name[lang] },
      { key: "passengers", label: t.passengers, value: (v) => v.passengers },
      { key: "hp", label: t.hp, en: true, value: (v) => v.hp },
      { key: "speed", label: t.speed, value: (v) => v.speed, cell: (v) => `${v.speed} ${t.m}` },
      { key: "price", label: t.priceCol, value: (v) => v.price ?? 0, cell: (v) => cwPrice(v, lang) },
    ],
    card: (v) => `
      <h4>${v.name[lang]}</h4>
      <div class="vt-stats vt-three">
        <div><b>${t.card.passengers}</b><span>${v.passengers}</span></div>
        <div><b lang="en">${t.card.hp}</b><span>${v.hp}</span></div>
        <div><b>${t.card.speed}</b><span>${v.speed} ${t.m}</span></div>
        <div class="vt-wide"><b>${t.card.price}</b><span>${cwPrice(v, lang)}</span></div>
        <div class="vt-wide"><b>${t.card.coverIn}</b><span class="lv-${v.cover.inside}">${t.levels[v.cover.inside]}</span></div>
        <div class="vt-wide"><b>${t.card.coverBehind}</b><span class="lv-${v.cover.behind}">${t.levels[v.cover.behind]}</span></div>
      </div>
      <b class="vt-desc-label">${t.card.desc}</b>
      <p>${v.desc[lang]}</p>`,
  });
}


// ---------- Metin kartlı listeler (Evren: diller, bölgeler, şirketler, çeteler) ----------
// fields: kartta kutu olarak gösterilen alanlar; col: true olanlar tabloda da sütun olur.
// desc: kartın altındaki açıklama (tek metin ya da paragraf dizisi).

const LORE_TEXT = {
  tr: { desc: "Açıklama", sortHint: "Sıralamak için tıkla", close: "Kapatmak için tıkla" },
  en: { desc: "Description", sortHint: "Click to sort", close: "Click to close" },
};

const LORE_TABLES = {
  "language-table": {
    items: () => LANGUAGES,
    name: { tr: "Dil", en: "Language" },
    fields: [
      { key: "where", col: true, label: { tr: "Konuşulduğu yerler", en: "Spoken in" } },
      { key: "nc", col: true, label: { tr: `<span lang="en">Night City'de</span>`, en: "In Night City" } },
    ],
  },
  "district-table": {
    items: () => LORE_DISTRICTS,
    name: { tr: "Bölge", en: "District" },
    fields: [
      { key: "subs", col: true, label: { tr: "Alt bölgeler", en: "Subdistricts" } },
      { key: "control", col: true, label: { tr: "Kimin elinde", en: "Who holds it" } },
      { key: "notable", label: { tr: "Öne çıkanlar", en: "Notable" } },
    ],
  },
  "corp-table": {
    items: () => LORE_CORPS,
    name: { tr: "Şirket", en: "Corporation" },
    fields: [
      { key: "sector", col: true, label: { tr: "Alan", en: "Sector" } },
      { key: "nc", col: true, label: { tr: `<span lang="en">Night City'de</span>`, en: "In Night City" } },
    ],
  },
  "gang-table": {
    items: () => LORE_GANGS,
    name: { tr: "Çete", en: "Gang" },
    fields: [
      { key: "territory", col: true, label: { tr: "Bölge", en: "Territory" } },
      { key: "style", col: true, label: { tr: "Tarz", en: "Style" } },
      { key: "business", label: { tr: "İşleri", en: "Business" } },
    ],
  },
};

function mountTextCardTable(el, lang, cfg) {
  const t = LORE_TEXT[lang];
  const fields = cfg.fields.map((f) => ({ ...f, label: f.label[lang] }));
  const cols = [
    { key: "name", label: cfg.name[lang], text: true, value: (x) => x.name[lang] },
    ...fields.filter((f) => f.col).map((f) => ({ key: f.key, label: f.label, text: true, value: (x) => x[f.key][lang] })),
  ];
  mountCardTable(el, lang, {
    items: cfg.items(),
    t,
    cls: "lt",
    cols,
    card: (x) => `
      <h4>${x.name[lang]}</h4>
      <div class="vt-stats vt-text" style="--cols: ${fields.length}">
        ${fields.map((f) => `<div><b>${f.label}</b><span>${x[f.key][lang]}</span></div>`).join("")}
      </div>
      <b class="vt-desc-label">${t.desc}</b>
      ${[].concat(x.desc[lang]).map((p) => `<p>${p}</p>`).join("")}`,
  });
}

// ---------- Aranabilir, filtrelenebilir kartlı liste (quickhack'ler, feat'ler) ----------
// Üstte arama kutusu ve açılır filtre menüleri. Filtre seçenekleri toggle'lanır; başta hiçbiri seçili değildir ve her şey görünür.
// Bir filtrede seçenek seçilince o filtre koşul olur: yalnızca seçilen seçeneklere uyan öğeler görünür.
// Arama, öğenin adında ve açıklamasında geçen metne bakar. Liste açılır kartlı tablodur;
// en fazla 16,5 satır görünür, gerisi kaydırılır.
// cfg: { items, t, filters: [{ key, label, en, opts: [{ val, text }], value(item) }], text(item), cols, card, onChange(key, api) }
// Ters filtre (neg: true, kırmızı): başta hiçbir seçenek seçili değildir; test(item, seçilenler) öğenin görünüp görünmeyeceğine karar verir.

const LIST_VISIBLE_ROWS = 16.5;

// Açık filtre menüsü, dışına tıklanınca ya da Esc'e basılınca kapanır (sayfa başına değil, bir kez bağlanır)
document.addEventListener("click", (e) => {
  for (const f of document.querySelectorAll(".fl-filter.open")) if (!f.contains(e.target)) setFilterOpen(f, false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") for (const f of document.querySelectorAll(".fl-filter.open")) setFilterOpen(f, false);
});

function setFilterOpen(f, open) {
  f.classList.toggle("open", open);
  f.querySelector(".fl-filter-btn").setAttribute("aria-expanded", open);
}

function mountFilterList(el, lang, cfg) {
  const { t, filters } = cfg;
  const norm = (s) => s.toLocaleLowerCase(lang === "tr" ? "tr" : "en");
  const on = Object.fromEntries(filters.map((f) => [f.key, new Set(f.initial || [])]));
  let query = "";

  const pass = (x) =>
    filters.every((f) => (f.test ? f.test(x, on[f.key]) : !on[f.key].size || on[f.key].has(f.value(x)))) && (!query || norm(cfg.text(x)).includes(query));

  el.innerHTML = `
    <div class="fl-tools">
      <input type="search" class="fl-search" placeholder="${t.search}" aria-label="${t.search}">
      ${filters
        .map(
          (f) => `
        <div class="fl-filter${f.neg ? " neg" : ""}" data-filter="${f.key}">
          <button type="button" class="fl-filter-btn" aria-expanded="false"><span${f.en ? ' lang="en"' : ""}>${f.label}</span><span class="fl-count"></span><span class="fl-caret"></span></button>
          <div class="fl-menu">${f.opts
            .map((o) => {
              const sel = on[f.key].has(o.val);
              return `<button type="button" class="fl-opt${sel ? " on" : ""}" data-val="${o.val}" aria-pressed="${sel}">${o.text}</button>`;
            })
            .join("")}</div>
        </div>`
        )
        .join("")}
    </div>
    <div class="fl-list"></div>`;

  const table = mountCardTable(el.querySelector(".fl-list"), lang, {
    items: () => cfg.items.filter(pass),
    t,
    cls: "fl",
    maxRows: LIST_VISIBLE_ROWS,
    cols: cfg.cols,
    card: cfg.card,
    rowTint: cfg.rowTint,
  });

  el.querySelector(".fl-search").addEventListener("input", (e) => {
    query = norm(e.target.value.trim());
    table.render();
  });

  // Butondaki sayaç: seçili seçenek sayısı (hiçbiri seçili değilse boş)
  function refreshBox(key) {
    const box = el.querySelector(`.fl-filter[data-filter="${key}"]`);
    const size = on[key].size;
    box.classList.toggle("partial", size > 0);
    box.querySelector(".fl-count").textContent = size ? String(size) : "";
  }

  // Bir seçeneği açar ya da kapatır (kullanıcı tıklayınca ya da başka bir filtre onu değiştirince)
  function setOpt(key, val, active) {
    active ? on[key].add(val) : on[key].delete(val);
    const opt = el.querySelector(`.fl-filter[data-filter="${key}"] .fl-opt[data-val="${val}"]`);
    opt.classList.toggle("on", active);
    opt.setAttribute("aria-pressed", active);
    refreshBox(key);
  }
  const api = { on, setOpt };

  for (const box of el.querySelectorAll(".fl-filter")) {
    const key = box.dataset.filter;
    box.querySelector(".fl-filter-btn").addEventListener("click", () => {
      const open = !box.classList.contains("open");
      for (const other of el.querySelectorAll(".fl-filter.open")) setFilterOpen(other, false);
      setFilterOpen(box, open);
    });
    box.querySelector(".fl-menu").addEventListener("click", (e) => {
      const opt = e.target.closest(".fl-opt");
      if (!opt) return;
      setOpt(key, opt.dataset.val, !on[key].has(opt.dataset.val));
      if (cfg.onChange) cfg.onChange(key, opt.dataset.val, api);
      table.render();
    });
  }
}


// ---------- Quickhack listesi (Oyuncu Rehberi > Netrunning) ----------
// Filtreler: Kademe, Specialization, Tür. Sütunlar: Quickhack, Tür, Kademe, Specialization ("-" yoksa).

const QH_TEXT = {
  tr: { name: "Quickhack", type: "Tür", tier: "Kademe", spec: "Specialization", ram: "RAM", desc: "Etki", search: "Quickhack ara…", none: "Yok", empty: "Gösterilecek quickhack yok.", draft: "Taslak", sortHint: "Sıralamak için tıkla", close: "Kapatmak için tıkla" },
  en: { name: "Quickhack", type: "Type", tier: "Tier", spec: "Specialization", ram: "RAM", desc: "Effect", search: "Search quickhacks…", none: "None", empty: "No quickhacks to show.", draft: "Draft", sortHint: "Click to sort", close: "Click to close" },
};

const QH_ROMAN = ["", "I", "II", "III", "IV"];

// Specialization renkleri (1. camgöbeği, 2. pembe); CSS'teki spec-1 / spec-2 ile aynı
const SPEC_COLORS = ["#2ee6ff", "#ff4fd8"];

function mountQuickhackTable(el, lang) {
  const t = QH_TEXT[lang];
  const specs = CLASSES.find((c) => c.id === "netrunner").specs;
  const specName = (q) => (q.spec ? specs.find((s) => s.id === q.spec).name[lang] : "-");
  // Telefonda başlık kısa yazılır ("Spec"), tablo daha dar olur
  const specLabel = `<span class="lbl-full">${t.spec}</span><span class="lbl-short">Spec</span>`;
  mountFilterList(el, lang, {
    items: QUICKHACKS,
    t,
    text: (q) => `${q.name} ${q.desc[lang]}`,
    // Specialization quickhack'leri o specialization'ın renginde (Infiltrator camgöbeği, Overseer pembe); genel olanlar yeşil
    rowTint: (q) => (q.spec ? { color: SPEC_COLORS[specs.findIndex((s) => s.id === q.spec)] } : null),
    filters: [
      { key: "tier", label: t.tier, value: (q) => String(q.tier), opts: [1, 2, 3, 4].map((v) => ({ val: String(v), text: QH_ROMAN[v] })) },
      { key: "spec", label: specLabel, en: true, value: (q) => q.spec || "none", opts: [{ val: "none", text: t.none }, ...specs.map((s) => ({ val: s.id, text: s.name[lang] }))] },
      { key: "type", label: t.type, value: (q) => q.type, opts: Object.entries(QH_TYPES).map(([k, v]) => ({ val: k, text: v[lang] })) },
    ],
    cols: [
      { key: "name", label: t.name, text: true, en: true, value: (q) => q.name },
      { key: "type", label: t.type, text: true, value: (q) => QH_TYPES[q.type][lang] },
      { key: "tier", label: t.tier, asc: true, ind: ["I→IV", "IV→I"], value: (q) => q.tier, cell: (q) => QH_ROMAN[q.tier] },
      { key: "spec", label: specLabel, text: true, en: true, value: (q) => specName(q) },
    ],
    card: (q) => `
      <h4 lang="en">${q.name}</h4>
      <div class="vt-stats vt-text" style="--cols: 4">
        <div><b>${t.type}</b><span>${QH_TYPES[q.type][lang]}</span></div>
        <div><b>${t.tier}</b><span>${QH_ROMAN[q.tier]}</span></div>
        <div><b lang="en">${t.spec}</b><span>${specName(q)}</span></div>
        <div><b lang="en">${t.ram}</b><span>${q.ram}</span></div>
      </div>
      <b class="vt-desc-label">${t.desc}</b>
      <p>${linkTerms(q.desc[lang], lang)}</p>`,
  });
}


// ---------- Feat listesi (Oyuncu Rehberi > Feat'ler) ----------
// Filtreler: Sınıf (Tarafsız + sınıflar), Aşama ve kırmızı ters filtre "Alamadıklarını Gizle" (seçilen sınıfların alamadığı feat'ler gizlenir).
// Sınıf filtresinde tek bir sınıf seçiliyse ters filtrede o sınıf kendiliğinden seçilir; durum değişince geri alınır.
// Bir sınıf tarafsız feat'leri (excl'de değilse) ve kendi feat'lerini alabilir; diğer sınıfların feat'leri 6. seviyedeki sınıf dışı kurala kalır.
const canTakeFeat = (f, clsId) => (f.cls === "tarafsiz" ? !(f.excl || []).includes(clsId) : f.cls === clsId);

const FEAT_TEXT = {
  tr: { name: "Feat", cls: "Sınıf", tier: "Aşama", hide: "Alamadıklarını Gizle", cost: "Maliyet", points: (n) => `${n} puan`, general: "Tarafsız", desc: "Etki", search: "Feat ara…", empty: "Gösterilecek feat yok.", draft: "Taslak", sortHint: "Sıralamak için tıkla", close: "Kapatmak için tıkla" },
  en: { name: "Feat", cls: "Role", tier: "Tier", hide: "Hide Unavailable", cost: "Cost", points: (n) => `${n} point${n > 1 ? "s" : ""}`, general: "General", desc: "Effect", search: "Search feats…", empty: "No feats to show.", draft: "Draft", sortHint: "Click to sort", close: "Click to close" },
};

function mountFeatTable(el, lang) {
  const t = FEAT_TEXT[lang];
  const clsName = (f) => (f.cls === "tarafsiz" ? t.general : CLASSES.find((c) => c.id === f.cls).name);
  let autoHide = null; // tek sınıf seçilince ters filtrede kendiliğinden seçilen sınıf
  mountFilterList(el, lang, {
    items: FEATS,
    t,
    text: (f) => `${f.name[lang]} ${f.gloss || ""} ${f.desc[lang]}`,
    // Sınıf feat'leri sınıfın gizli renginde; bir specialization'dan geliyorsa açılan kartın sağı o specialization'ın renginde
    rowTint: (f) => {
      if (f.cls === "tarafsiz") return null;
      const c = CLASSES.find((x) => x.id === f.cls);
      const i = f.spec && c.specs ? c.specs.findIndex((s) => s.id === f.spec) : -1;
      return { color: CLASS_COLORS[f.cls], spec: i >= 0 ? SPEC_COLORS[i] : null };
    },
    filters: [
      { key: "cls", label: t.cls, value: (f) => f.cls, opts: [{ val: "tarafsiz", text: t.general }, ...CLASSES.map((c) => ({ val: c.id, text: c.name }))] },
      { key: "tier", label: t.tier, value: (f) => String(f.tier), opts: [1, 2].map((v) => ({ val: String(v), text: String(v) })) },
      { key: "hide", label: t.hide, neg: true, initial: [], test: (f, sel) => [...sel].every((c) => canTakeFeat(f, c)), opts: CLASSES.map((c) => ({ val: c.id, text: c.name })) },
    ],
    onChange: (key, val, api) => {
      if (key === "hide") {
        if (val === autoHide) autoHide = null; // kullanıcı elle değiştirdi, artık otomatik sayılmaz
        return;
      }
      if (key !== "cls") return;
      const chosen = CLASSES.filter((c) => api.on.cls.has(c.id));
      const single = chosen.length === 1 ? chosen[0].id : null;
      if (autoHide && autoHide !== single) {
        api.setOpt("hide", autoHide, false);
        autoHide = null;
      }
      if (single && !api.on.hide.has(single)) {
        api.setOpt("hide", single, true);
        autoHide = single;
      }
    },
    cols: [
      { key: "name", label: t.name, text: true, en: true, value: (f) => f.name[lang] },
      { key: "cls", label: t.cls, text: true, value: (f) => clsName(f) },
      { key: "tier", label: t.tier, asc: true, ind: ["1→2", "2→1"], value: (f) => f.tier },
    ],
    card: (f) => `
      <h4${f.gloss ? ' lang="en"' : ""}>${f.name[lang]}${lang === "tr" && f.gloss ? ` <small lang="tr" class="ft-gloss">(${f.gloss})</small>` : ""}</h4>
      <div class="vt-stats vt-text" style="--cols: 3">
        <div><b>${t.cls}</b><span>${clsName(f)}</span></div>
        <div><b>${t.tier}</b><span>${f.tier}</span></div>
        <div><b>${t.cost}</b><span>${t.points(f.tier)}</span></div>
      </div>
      <b class="vt-desc-label">${t.desc}</b>
      <p>${linkTerms(f.desc[lang], lang)}</p>`,
  });
}

// ---------- Cyberware listesi (Oyuncu Rehberi > Cyberware) ----------
// Filtreler: Yuva, Ağırlık, Etiket (birden çok etiket seçilirse hepsini taşıyanlar görünür). Sütunlar: Cyberware, Yuva, Ağırlık, ortalama fiyat ("-" henüz yoksa).
// Ağırlık Humanity kaybından gelir: 0–5 hafif, 6–10 orta, 11–15 ileri, 16+ ağır.
const CW_TEXT = {
  tr: { name: "Cyberware", slot: "Yuva", weight: "Ağırlık", price: "Ort. Fiyat", priceCol: '<span class="lbl-full">Ort. Fiyat</span><span class="lbl-short">Fiyat</span>', tags: "Etiket", humanity: '<span lang="en">Humanity</span> kaybı', desc: "Etki", search: "Cyberware ara…", empty: "Gösterilecek cyberware yok.", sortHint: "Sıralamak için tıkla", close: "Kapatmak için tıkla",
    weights: ["", "Hafif", "Orta", "İleri", "Ağır"], ind: ["Hafif→Ağır", "Ağır→Hafif"] },
  en: { name: "Cyberware", slot: "Slot", weight: "Weight", price: "Avg. Price", priceCol: '<span class="lbl-full">Avg. Price</span><span class="lbl-short">Price</span>', tags: "Tags", humanity: "Humanity loss", desc: "Effect", search: "Search cyberware…", empty: "No cyberware to show.", sortHint: "Click to sort", close: "Click to close",
    weights: ["", "Light", "Medium", "Advanced", "Heavy"], ind: ["Light→Heavy", "Heavy→Light"] },
};

const cwWeight = (c) => (c.humanity <= 5 ? 1 : c.humanity <= 10 ? 2 : c.humanity <= 15 ? 3 : 4);

// Satır renkleri: başlangıç parçaları soluk gri-yeşil, orta mavi, ileri pembemsi mor, ağır kırmızı (hafifler sitenin yeşilinde);
// ikonik parçalar "iconic" sınıfını alır: açılan kartın sağı sarı geçiş ve altıgen deseni, kapalı satırın sağ ucu altıgenler (CSS).
const CW_START_COLOR = "#a3b8a0";
const CW_WEIGHT_COLORS = ["", null, "#5aa9ff", "#da7bea", "#ff4d5e"];
function cwTint(c) {
  const tags = c.tags || [];
  const color = tags.includes("baslangic") ? CW_START_COLOR : CW_WEIGHT_COLORS[cwWeight(c)];
  const iconic = tags.includes("ikonik");
  if (!color && !iconic) return null;
  return { color: color || "var(--neon)", cls: iconic ? "iconic" : "" };
}

const cwPrice = (c, lang) => (c.price == null ? "-" : c.price.toLocaleString(lang));

// Cyberware'in açılan kartı (liste ve Dükkan Oluşturucu ortak kullanır)
function cwCard(c, lang) {
  const t = CW_TEXT[lang];
  return `
      <h4>${c.name[lang]}${lang === "tr" && c.name.en !== c.name.tr ? ` <small lang="en" class="ft-gloss">(${c.name.en})</small>` : ""}</h4>
      <div class="vt-stats vt-text" style="--cols: 4">
        <div><b>${t.slot}</b><span>${CW_SLOTS[c.slot][lang]}</span></div>
        <div><b>${t.weight}</b><span>${t.weights[cwWeight(c)]}</span></div>
        <div><b>${t.humanity}</b><span>${c.humanity}</span></div>
        ${c.pct === undefined
          ? `<div><b>${t.price}</b><span>${cwPrice(c, lang)}</span></div>`
          : `<div><b>${SHOP_TEXT[lang].shopPriceCard}</b><span>${shopPriceCell(c, lang)}</span></div>`}
      </div>
      ${c.flavor ? `<p class="vt-flavor">${c.flavor[lang]}</p>` : ""}
      <b class="vt-desc-label">${t.desc}</b>
      ${[].concat(c.desc[lang]).map((para) => `<p>${linkTerms(para, lang)}</p>`).join("")}
      ${c.tags && c.tags.length ? `<div class="vt-tags">${c.tags.map((tag) => tagChip(tag, CW_TAGS, lang)).join("")}</div>` : ""}`;
}

function mountCyberwareTable(el, lang) {
  const t = CW_TEXT[lang];
  mountFilterList(el, lang, {
    items: CYBERWARE,
    t,
    text: (c) => `${c.name.tr} ${c.name.en} ${c.flavor ? c.flavor[lang] : ""} ${[].concat(c.desc[lang]).join(" ")}`,
    rowTint: cwTint,
    filters: [
      { key: "slot", label: t.slot, value: (c) => c.slot, opts: Object.entries(CW_SLOTS).map(([k, v]) => ({ val: k, text: v[lang] })) },
      { key: "weight", label: t.weight, value: (c) => String(cwWeight(c)), opts: [1, 2, 3, 4].map((v) => ({ val: String(v), text: t.weights[v] })) },
      { key: "tag", label: t.tags, test: (c, sel) => [...sel].every((tag) => (c.tags || []).includes(tag)), opts: Object.entries(CW_TAGS).map(([k, v]) => ({ val: k, text: v[lang] })) },
    ],
    cols: [
      { key: "name", label: t.name, text: true, en: true, value: (c) => c.name[lang] },
      { key: "slot", label: t.slot, text: true, value: (c) => CW_SLOTS[c.slot][lang] },
      { key: "weight", label: t.weight, asc: true, ind: t.ind, value: (c) => cwWeight(c), cell: (c) => t.weights[cwWeight(c)] },
      { key: "price", label: t.priceCol, value: (c) => c.price ?? 0, cell: (c) => cwPrice(c, lang) },
    ],
    card: (c) => cwCard(c, lang),
  });
}


// ---------- Eşya listesi (Oyuncu Rehberi > Eşyalar) ----------
// Filtreler: Tür, Skill, Etiket (birden çok etiket seçilirse hepsini taşıyanlar görünür). Sütunlar: Eşya, Tür (silahlarda silah türü), Hasar, ortalama fiyat ("-" henüz yoksa).
const ITEM_TEXT = {
  tr: { name: "Eşya", type: "Tür", price: "Ort. Fiyat", priceCol: CW_TEXT.tr.priceCol, skill: "Skill", damage: "Hasar", rof: "ROF", mag: "Şarjör", auto: "Otomatik Ateş", range: "İdeal Mesafe", tags: "Etiket", desc: "Etki", search: "Eşya ara…", empty: "Gösterilecek eşya yok.", sortHint: "Sıralamak için tıkla", close: "Kapatmak için tıkla" },
  en: { name: "Item", type: "Type", price: "Avg. Price", priceCol: CW_TEXT.en.priceCol, skill: "Skill", damage: "Damage", rof: "ROF", mag: "Magazine", auto: "Autofire", range: "Ideal Range", tags: "Tags", desc: "Effect", search: "Search items…", empty: "No items to show.", sortHint: "Click to sort", close: "Click to close" },
};

const itemKind = (it, lang) => (it.kind ? WEAPON_KINDS[it.kind] : ITEM_TYPES[it.type])[lang];

// Eşyanın açılan kartı (liste ve ileride Dükkan Oluşturucu ortak kullanır)
function itemCard(it, lang) {
  const t = ITEM_TEXT[lang];
  const w = it.weapon;
  const box = (label, value, en = false) => `<div><b${en ? ' lang="en"' : ""}>${label}</b><span${en ? ' lang="en"' : ""}>${value}</span></div>`;
  const boxes = [
    box(t.type, itemKind(it, lang)),
    ...(w ? [box(t.skill, w.skill, true), box(t.damage, w.damage)] : []),
    ...(w && w.rof ? [box(t.rof, w.rof, true), box(t.mag, w.mag), box(t.auto, w.auto ? `×${w.auto}` : "—"), box(t.range, WEAPON_RANGES[w.range][lang])] : []),
    box(t.price, cwPrice(it, lang)),
  ];
  return `
      <h4>${it.name[lang]}${lang === "tr" && it.name.en !== it.name.tr ? ` <small lang="en" class="ft-gloss">(${it.name.en})</small>` : ""}</h4>
      <div class="vt-stats vt-text" style="--cols: ${Math.min(boxes.length, 4)}">
        ${boxes.join("")}
      </div>
      ${it.flavor ? `<p class="vt-flavor">${it.flavor[lang]}</p>` : ""}
      ${it.desc ? `<b class="vt-desc-label">${t.desc}</b>
      ${[].concat(it.desc[lang]).map((para) => `<p>${linkTerms(para, lang)}</p>`).join("")}` : ""}
      ${it.tags && it.tags.length ? `<div class="vt-tags">${it.tags.map((tag) => tagChip(tag, ITEM_TAGS, lang)).join("")}</div>` : ""}`;
}

function mountItemTable(el, lang) {
  const t = ITEM_TEXT[lang];
  mountFilterList(el, lang, {
    items: ITEMS,
    t,
    text: (it) => `${it.name.tr} ${it.name.en} ${itemKind(it, lang)} ${it.flavor ? it.flavor[lang] : ""} ${it.desc ? [].concat(it.desc[lang]).join(" ") : ""}`,
    rowTint: (it) => ((it.tags || []).includes("ikonik") ? { color: "var(--neon)", cls: "iconic" } : null),
    filters: [
      { key: "type", label: t.type, value: (it) => it.type, opts: Object.entries(ITEM_TYPES).map(([k, v]) => ({ val: k, text: v[lang] })) },
      { key: "skill", label: t.skill, en: true, value: (it) => it.weapon?.skill, opts: [...new Set(ITEMS.filter((it) => it.weapon).map((it) => it.weapon.skill))].map((v) => ({ val: v, text: v })) },
      { key: "tag", label: t.tags, test: (it, sel) => [...sel].every((tag) => (it.tags || []).includes(tag)), opts: Object.entries(ITEM_TAGS).map(([k, v]) => ({ val: k, text: v[lang] })) },
    ],
    cols: [
      { key: "name", label: t.name, text: true, value: (it) => it.name[lang] },
      { key: "type", label: t.type, text: true, value: (it) => itemKind(it, lang) },
      { key: "damage", label: t.damage, value: (it) => parseInt(it.weapon?.damage) || 0, cell: (it) => it.weapon?.damage ?? "-" },
      { key: "price", label: t.priceCol, value: (it) => it.price ?? 0, cell: (it) => cwPrice(it, lang) },
    ],
    card: (it) => itemCard(it, lang),
  });
}


// ---------- Dükkan Oluşturucu (Araçlar) ----------
// 1) Dükkanın türü seçilir; ayarlar ancak ondan sonra açılır. Şimdilik yalnızca cyberware dükkanı çalışır.
// 2) Değer aralığı: tek hat üzerinde iki tutamaçlı kaydırıcı; tutamaçlar birbirini iter.
// 3) Etiket koşulları: en az bir eşya / hiçbir eşya / bütün eşyalar. Yuvalar da etiket gibi seçilebilir.
// 4) Ürün sayısı ve çoklu stok. "Dükkanı Oluştur" rastgele bir envanter çıkarır.

const SHOP_TEXT = {
  tr: {
    theme: "Dükkan türü", soon: "Yakında", range: "Değer aralığı", loLabel: "Alt sınır", hiLabel: "Üst sınır",
    conds: "Etiket koşulları", tags: "Etiket", slots: "Yuva",
    least: "En az bir eşya bu etiketlere sahip olsun", leastHint: "Birden fazla etiket seçilirse her birinden en az bir eşya konmaya çalışılır.",
    none: "Hiçbir eşya bu etiketlere sahip olmasın", all: "Bütün eşyalar bu etiketlere sahip olsun",
    count: "Ürün sayısı", lower: "Azalt", raise: "Artır",
    multi: "Aynı üründen birden fazla adet", multiNote: (a, b) => `Her üründen ${a}–${b} adet bulunur.`,
    go: "Dükkanı Oluştur", again: "Yeniden Oluştur",
    items: (n) => `${n} ürün`,
    short: (n) => `Bu ayarlara uyan yalnızca ${n} eşya var; hepsi dükkana kondu.`,
    missing: (list) => `Şu etiketler için uygun eşya bulunamadı: ${list}.`,
    tooFew: "Ürün sayısı, \"en az bir eşya\" koşullarının hepsine yetmedi.",
    stock: "Stok", empty: "Bu ayarlarla dükkana konacak eşya bulunamadı.", sortHint: "Sıralamak için tıkla", close: "Kapatmak için tıkla",
    priceRange: "Fiyat aralığı", priceHint: "Her ürünün fiyatı, ortalama fiyattan bu aralıkta rastgele bir yüzde kadar sapar. Kaydırıcıdaki basamaklar yaklaşıktır; −13,5% gibi ara değerler de çıkabilir.",
    shopPrice: "Fiyat", shopPriceCard: "Dükkan Fiyatı", about: "yaklaşık",
    saveName: "Dükkan adı", save: "Dükkanı Kaydet",
  },
  en: {
    theme: "Shop type", soon: "Coming soon", range: "Value range", loLabel: "Lower bound", hiLabel: "Upper bound",
    conds: "Tag conditions", tags: "Tag", slots: "Slot",
    least: "At least one item has these tags", leastHint: "If several tags are picked, the shop tries to stock at least one item of each.",
    none: "No item has these tags", all: "Every item has these tags",
    count: "Number of products", lower: "Decrease", raise: "Increase",
    multi: "More than one in stock", multiNote: (a, b) => `Each product has ${a}–${b} in stock.`,
    go: "Generate Shop", again: "Generate Again",
    items: (n) => `${n} product${n === 1 ? "" : "s"}`,
    short: (n) => `Only ${n} items match these settings; all of them are in the shop.`,
    missing: (list) => `No suitable item was found for these tags: ${list}.`,
    tooFew: "The number of products wasn't enough for every \"at least one item\" condition.",
    stock: "Stock", empty: "No items match these settings.", sortHint: "Click to sort", close: "Click to close",
    priceRange: "Price range", priceHint: "Each product's price deviates from the average price by a random percentage within this range. The steps on the slider are approximate; in-between values such as −13.5% can come up too.",
    shopPrice: "Price", shopPriceCard: "Shop Price", about: "about",
    saveName: "Shop name", save: "Save Shop",
  },
};

// Dükkan türleri. Hazır olan türün: tiers (kaydırıcı basamakları), items(), tier(eşya) → basamak sırası,
// keys(eşya) → etiket ve yuva anahtarları, options(lang) → seçilebilecek etiketler, stock: [en az, en çok], table(lang).
const SHOP_THEMES = [
  { id: "armory", name: { tr: "Silahçı", en: "Armory" }, ready: false },
  {
    id: "cyberware",
    name: { tr: "Cyberware", en: "Cyberware" },
    ready: true,
    tiers: { tr: ["Başlangıç", "Hafif", "Orta", "İleri", "Ağır"], en: ["Starting", "Light", "Medium", "Advanced", "Heavy"] },
    items: () => CYBERWARE,
    tier: (c) => ((c.tags || []).includes("baslangic") ? 0 : cwWeight(c)),
    keys: (c) => [...(c.tags || []).map((tag) => `tag:${tag}`), `slot:${c.slot}`],
    options: (lang) => [
      ...Object.entries(CW_TAGS).map(([k, v]) => ({ group: "tags", key: `tag:${k}`, text: v[lang] })),
      ...Object.entries(CW_SLOTS).map(([k, v]) => ({ group: "slots", key: `slot:${k}`, text: v[lang] })),
    ],
    stock: [1, 2],
    table: (lang) => {
      const t = CW_TEXT[lang];
      return {
        cols: [
          { key: "name", label: t.name, text: true, en: true, value: (c) => c.name[lang] },
          { key: "slot", label: t.slot, text: true, value: (c) => CW_SLOTS[c.slot][lang] },
          { key: "weight", label: t.weight, asc: true, ind: t.ind, value: (c) => cwWeight(c), cell: (c) => t.weights[cwWeight(c)] },
          { key: "qty", label: SHOP_TEXT[lang].stock, value: (c) => c.qty },
          { key: "price", label: SHOP_TEXT[lang].shopPrice, value: (c) => c.shopPrice ?? c.pct, cell: (c) => shopPriceCell(c, lang) },
        ],
        card: (c) => cwCard(c, lang),
        rowTint: cwTint,
      };
    },
  },
  { id: "pharmacy", name: { tr: "Eczane", en: "Pharmacy" }, ready: false },
  { id: "restaurant", name: { tr: "Restoran", en: "Restaurant" }, ready: false },
];

// Fiyat kaydırıcısının basamakları (yüzde). Gerçek sapma iki tutamaç arasında rastgele, küsuratlı bir değerdir.
const SHOP_PCTS = [-15, -13, -11, -9, -7, -5, -3, -1, 0, 1, 3, 5, 7, 9, 11, 13, 15];

function fmtPct(p, lang) {
  if (!p) return "0%";
  return `${p < 0 ? "−" : "+"}${Math.abs(p).toLocaleString(lang === "tr" ? "tr" : "en", { maximumFractionDigits: 1 })}%`;
}

// Dükkan fiyatı ve yanında yüzde: ucuzsa yeşil, pahalıysa kırmızı. Fiyat henüz yoksa "-" yazar.
function shopPriceCell(c, lang) {
  const cls = c.pct < 0 ? "down" : c.pct > 0 ? "up" : "";
  return `${cwPrice({ price: c.shopPrice }, lang)} <span class="shop-pct ${cls}">${fmtPct(c.pct, lang)}</span>`;
}

// Dükkan fiyatı: eşyanın fiyatı varsa sapmayla birlikte en yakın 5'in katına yuvarlanır (0 ya da 5 ile biter)
const shopPriceOf = (it, pct) => (it.price == null ? null : Math.round((it.price * (1 + pct / 100)) / 5) * 5);
const shopEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const shopPick = (list) => list[Math.floor(Math.random() * list.length)];
const shopRoll = ([a, b]) => a + Math.floor(Math.random() * (b - a + 1));

// Seçilen ayarlara göre envanter çıkarır: önce "en az bir" etiketleri karşılanır, kalan yer rastgele doldurulur.
function generateShop(theme, st) {
  let pool = theme.items().filter((it) => {
    const tier = theme.tier(it);
    if (tier < st.lo || tier > st.hi) return false;
    const keys = theme.keys(it);
    return ![...st.none].some((k) => keys.includes(k)) && [...st.all].every((k) => keys.includes(k));
  });
  const chosen = [];
  const missing = [];
  let tooFew = false;
  const take = (it) => {
    chosen.push(it);
    pool = pool.filter((x) => x !== it);
  };
  // Etiketler karışık sırayla ele alınır; birden çok etiketi taşıyan bir eşya hepsini birden karşılayabilir
  for (const k of [...st.least].sort(() => Math.random() - 0.5)) {
    if (chosen.some((it) => theme.keys(it).includes(k))) continue;
    const cands = pool.filter((it) => theme.keys(it).includes(k));
    if (!cands.length) missing.push(k);
    else if (chosen.length >= st.count) tooFew = true;
    else take(shopPick(cands));
  }
  while (chosen.length < st.count && pool.length) take(shopPick(pool));
  const pLo = SHOP_PCTS[st.price.lo];
  const pHi = SHOP_PCTS[st.price.hi];
  const priced = (it) => {
    const pct = Math.round((pLo + Math.random() * (pHi - pLo)) * 10) / 10;
    return { pct, shopPrice: shopPriceOf(it, pct) };
  };
  return {
    rows: chosen.map((it) => ({ ...it, qty: st.multi ? shopRoll(theme.stock) : 1, ...priced(it) })),
    short: chosen.length < st.count,
    missing,
    tooFew,
  };
}

// Tek hat üzerinde iki tutamaçlı kaydırıcı. Basamaklara oturur; bir tutamaç ötekini geçince onu da iter.
function mountShopRange(el, labels, v, t, onChange, minor = () => false) {
  const max = labels.length - 1;
  el.innerHTML = `
    <div class="shop-range">
      <div class="shop-track"></div>
      <div class="shop-fill"></div>
      <div class="shop-thumb" data-k="lo" role="slider" tabindex="0" aria-label="${t.loLabel}" aria-valuemin="0" aria-valuemax="${max}"></div>
      <div class="shop-thumb" data-k="hi" role="slider" tabindex="0" aria-label="${t.hiLabel}" aria-valuemin="0" aria-valuemax="${max}"></div>
    </div>
    <div class="shop-stops">${labels
      .map((l, i) => `<button type="button" class="shop-stop${i === 0 ? " first" : i === max ? " last" : ""}${minor(i) ? " minor" : ""}" data-i="${i}" style="--f: ${i / max}">${l}</button>`)
      .join("")}</div>`;
  const box = el.querySelector(".shop-range");
  const thumbs = { lo: box.querySelector('[data-k="lo"]'), hi: box.querySelector('[data-k="hi"]') };

  function update() {
    box.style.setProperty("--flo", v.lo / max);
    box.style.setProperty("--fhi", v.hi / max);
    for (const k of ["lo", "hi"]) {
      thumbs[k].style.setProperty("--f", v[k] / max);
      thumbs[k].setAttribute("aria-valuenow", v[k]);
      thumbs[k].setAttribute("aria-valuetext", labels[v[k]]);
    }
    for (const s of el.querySelectorAll(".shop-stop")) s.classList.toggle("on", +s.dataset.i >= v.lo && +s.dataset.i <= v.hi);
  }
  function set(k, i) {
    i = Math.max(0, Math.min(max, i));
    if (k === "lo") {
      v.lo = i;
      if (v.hi < i) v.hi = i;
    } else {
      v.hi = i;
      if (v.lo > i) v.lo = i;
    }
    update();
    onChange();
  }
  // Bir basamağa en yakın tutamaç; eşitse basamağın hangi tarafta kaldığına bakılır
  const nearest = (i) => {
    const dl = Math.abs(i - v.lo);
    const dh = Math.abs(i - v.hi);
    return dl < dh ? "lo" : dh < dl ? "hi" : i < v.lo ? "lo" : "hi";
  };
  const indexAt = (x) => {
    const r = box.getBoundingClientRect();
    const pad = thumbs.lo.offsetWidth / 2;
    return Math.round(((x - r.left - pad) / (r.width - 2 * pad)) * max);
  };

  let active = null;
  let pending = false; // iki tutamaç üst üsteyken hangisinin tutulduğu ilk harekette anlaşılır
  let startX = 0;
  box.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const th = e.target.closest(".shop-thumb");
    startX = e.clientX;
    try {
      box.setPointerCapture(e.pointerId);
    } catch (err) {} // bazı ortamlarda yakalama desteklenmez; sürükleme yine çalışır
    if (th && v.lo === v.hi) {
      pending = true;
      th.focus();
      return;
    }
    active = th ? th.dataset.k : nearest(indexAt(e.clientX));
    thumbs[active].focus();
    if (!th) set(active, indexAt(e.clientX));
  });
  box.addEventListener("pointermove", (e) => {
    if (pending) {
      const dx = e.clientX - startX;
      if (Math.abs(dx) < 4) return;
      active = dx < 0 ? "lo" : "hi";
      pending = false;
    }
    if (active) set(active, indexAt(e.clientX));
  });
  const stop = () => {
    active = null;
    pending = false;
  };
  box.addEventListener("pointerup", stop);
  box.addEventListener("pointercancel", stop);
  for (const k of ["lo", "hi"]) {
    thumbs[k].addEventListener("keydown", (e) => {
      const step = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
      if (step) set(k, v[k] + step);
      else if (e.key === "Home") set(k, 0);
      else if (e.key === "End") set(k, max);
      else return;
      e.preventDefault();
    });
  }
  el.querySelector(".shop-stops").addEventListener("click", (e) => {
    const s = e.target.closest(".shop-stop");
    if (s) set(nearest(+s.dataset.i), +s.dataset.i);
  });
  update();
}

function mountShopGenerator(el, lang) {
  const t = SHOP_TEXT[lang];
  const st = { theme: null, lo: 0, hi: 0, price: { lo: 5, hi: 11 }, least: new Set(), none: new Set(), all: new Set(), count: 6, multi: false };
  el.innerHTML = `
    <div class="shop">
      <div class="shop-block">
        <b class="shop-h">${t.theme}</b>
        <div class="shop-themes">${SHOP_THEMES.map(
          (th) => `<button type="button" class="shop-theme" data-theme="${th.id}"${th.ready ? "" : " disabled"}>${th.name[lang]}${th.ready ? "" : `<small>${t.soon}</small>`}</button>`
        ).join("")}</div>
      </div>
      <div class="shop-setup" hidden></div>
      <div class="shop-result"></div>
    </div>`;
  const setup = el.querySelector(".shop-setup");
  const result = el.querySelector(".shop-result");
  let goBtn = null;

  // Hiçbiri koşulu ile diğer ikisi çelişir: biri açılınca öbüründeki aynı etiket kapanır
  const groups = ["least", "none", "all"];
  function toggleChip(group, key) {
    const on = !st[group].has(key);
    on ? st[group].add(key) : st[group].delete(key);
    if (on) for (const g of group === "none" ? ["least", "all"] : ["none"]) st[g].delete(key);
    for (const g of groups) {
      const chip = setup.querySelector(`.shop-cond[data-group="${g}"] .shop-chip[data-key="${key}"]`);
      chip.classList.toggle("on", st[g].has(key));
      chip.setAttribute("aria-pressed", st[g].has(key));
    }
  }

  function renderSetup() {
    const th = st.theme;
    const opts = th.options(lang);
    const chips = (g) =>
      ["tags", "slots"]
        .map(
          (grp) => `<div class="shop-chips"><span class="shop-chips-label">${t[grp]}</span>${opts
            .filter((o) => o.group === grp)
            .map((o) => `<button type="button" class="shop-chip${st[g].has(o.key) ? " on" : ""}" data-key="${o.key}" aria-pressed="${st[g].has(o.key)}">${o.text}</button>`)
            .join("")}</div>`
        )
        .join("");
    setup.innerHTML = `
      <div class="shop-block">
        <b class="shop-h">${t.range}</b>
        <div class="shop-range-wrap"></div>
      </div>
      <div class="shop-block">
        <b class="shop-h">${t.priceRange} <span class="shop-readout"></span></b>
        <p class="shop-hint">${t.priceHint}</p>
        <div class="shop-range-wrap wide shop-price-range"></div>
      </div>
      <div class="shop-block">
        <b class="shop-h">${t.conds}</b>
        <div class="shop-cond" data-group="least"><p class="shop-cond-title">${t.least}</p><p class="shop-hint">${t.leastHint}</p>${chips("least")}</div>
        <div class="shop-cond neg" data-group="none"><p class="shop-cond-title">${t.none}</p>${chips("none")}</div>
        <div class="shop-cond" data-group="all"><p class="shop-cond-title">${t.all}</p>${chips("all")}</div>
      </div>
      <div class="shop-block shop-last">
        <div class="shop-count">
          <b class="shop-h">${t.count}</b>
          <div class="pb-stepper">
            <button type="button" class="pb-btn" data-step="-1" aria-label="${t.lower}">−</button>
            <output class="pb-value shop-count-value">${st.count}</output>
            <button type="button" class="pb-btn" data-step="1" aria-label="${t.raise}">+</button>
          </div>
        </div>
        <div class="shop-multi">
          <button type="button" class="shop-chip shop-multi-btn${st.multi ? " on" : ""}" aria-pressed="${st.multi}">${t.multi}</button>
          <span class="shop-hint">${t.multiNote(th.stock[0], th.stock[1])}</span>
        </div>
        <button type="button" class="shop-go">${t.go}</button>
      </div>`;
    mountShopRange(setup.querySelector(".shop-range-wrap"), th.tiers[lang], st, t, () => {});
    const readout = setup.querySelector(".shop-readout");
    const showPrice = () => {
      const a = fmtPct(SHOP_PCTS[st.price.lo], lang);
      const b = fmtPct(SHOP_PCTS[st.price.hi], lang);
      readout.textContent = `(${t.about} ${a === b ? a : `${a} … ${b}`})`;
    };
    // Telefonda yalnızca −15, −11, −7, −3, 0, +3, +7, +11, +15 yazılır
    mountShopRange(setup.querySelector(".shop-price-range"), SHOP_PCTS.map((p) => fmtPct(p, lang)), st.price, t, showPrice, (i) => i % 2 === 1);
    showPrice();
    for (const cond of setup.querySelectorAll(".shop-cond")) {
      cond.addEventListener("click", (e) => {
        const chip = e.target.closest(".shop-chip");
        if (chip) toggleChip(cond.dataset.group, chip.dataset.key);
      });
    }
    const countOut = setup.querySelector(".shop-count-value");
    for (const b of setup.querySelectorAll(".shop-count .pb-btn")) {
      b.addEventListener("click", () => {
        st.count = Math.max(1, Math.min(30, st.count + +b.dataset.step));
        countOut.textContent = st.count;
      });
    }
    const multiBtn = setup.querySelector(".shop-multi-btn");
    multiBtn.addEventListener("click", () => {
      st.multi = !st.multi;
      multiBtn.classList.toggle("on", st.multi);
      multiBtn.setAttribute("aria-pressed", st.multi);
    });
    goBtn = setup.querySelector(".shop-go");
    goBtn.addEventListener("click", generate);
  }

  let last = null; // ekrandaki dükkan; kaydedilirken bundan anlık görüntü alınır

  function generate() {
    showResult(generateShop(st.theme, st), "");
  }

  // Oluşturulan (ya da yüklenen) dükkanı gösterir. GM'ler için listenin altında isim kutusu ve "Dükkanı Kaydet" durur.
  function showResult(res, name) {
    const th = st.theme;
    last = res;
    const tiers = th.tiers[lang];
    const range = st.lo === st.hi ? tiers[st.lo] : `${tiers[st.lo]} – ${tiers[st.hi]}`;
    const label = (k) => (th.options(lang).find((o) => o.key === k) || { text: k }).text;
    const notes = [
      res.short ? t.short(res.rows.length) : "",
      res.missing.length ? t.missing(res.missing.map(label).join(", ")) : "",
      res.tooFew ? t.tooFew : "",
    ].filter(Boolean);
    const canSave = window.CG_STORE && window.CG_STORE.canSaveShops();
    result.innerHTML = `
      <p class="shop-summary">${th.name[lang]} · ${range} · ${t.items(res.rows.length)}</p>
      ${notes.map((n) => `<p class="shop-note">${n}</p>`).join("")}
      <div class="shop-table"></div>
      ${
        canSave
          ? `<form class="shop-save">
              <input type="text" name="shopname" maxlength="40" placeholder="${t.saveName}" aria-label="${t.saveName}" value="${shopEsc(name)}">
              <button type="submit" class="shop-go">${t.save}</button>
              <p class="shop-save-msg" role="status"></p>
            </form>`
          : ""
      }`;
    const tbl = th.table(lang);
    mountCardTable(result.querySelector(".shop-table"), lang, { items: res.rows, t, cols: tbl.cols, card: tbl.card, rowTint: tbl.rowTint });
    if (goBtn) goBtn.textContent = t.again;
    const form = result.querySelector(".shop-save");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = form.querySelector("button");
        const msg = form.querySelector(".shop-save-msg");
        btn.disabled = true;
        msg.textContent = "";
        try {
          const r = await window.CG_STORE.saveShop(form.elements.shopname.value, th.id, snapshot());
          msg.textContent = r.msg;
          msg.classList.toggle("err", !r.ok);
        } catch (err) {
          msg.textContent = window.CG_STORE.errorText(err);
          msg.classList.add("err");
        } finally {
          btn.disabled = false;
        }
      });
    }
    result.classList.remove("show");
    void result.offsetWidth; // animasyon her oluşturmada yeniden başlasın
    result.classList.add("show");
  }

  // Kaydedilen veri: ayarlar ve ürünler (yalnızca kimlik, stok, fiyat sapması; eşya bilgisi yüklenirken listeden gelir)
  function snapshot() {
    return {
      settings: {
        lo: st.lo, hi: st.hi, price: { ...st.price },
        least: [...st.least], none: [...st.none], all: [...st.all],
        count: st.count, multi: st.multi,
      },
      rows: last.rows.map((r) => ({ id: r.id, qty: r.qty, pct: r.pct })),
      short: last.short, missing: last.missing, tooFew: last.tooFew,
    };
  }

  // Tür seçilince ayarlar o türe göre sıfırlanır (apply verilirse sıfırlamanın yerine o ayarlar kurulur)
  function pickTheme(th, apply) {
    for (const x of el.querySelectorAll(".shop-theme")) x.classList.toggle("on", x.dataset.theme === th.id);
    if (st.theme === th && !apply) return;
    st.theme = th;
    st.lo = 0;
    st.hi = th.tiers[lang].length - 1;
    for (const g of groups) st[g].clear();
    if (apply) apply();
    renderSetup();
    result.innerHTML = "";
    setup.hidden = false;
    setup.classList.remove("show");
    void setup.offsetWidth;
    setup.classList.add("show");
  }

  el.querySelector(".shop-themes").addEventListener("click", (e) => {
    const b = e.target.closest(".shop-theme");
    if (!b || b.disabled) return;
    pickTheme(SHOP_THEMES.find((x) => x.id === b.dataset.theme));
  });

  // Kayıtlı dükkanı yükler (js/auth.js, soldaki panel). Listeden çıkarılmış eşyalar atlanır; fiyatlar güncel fiyattan hesaplanır.
  window.CG_SHOP_LOAD = (themeId, data, name) => {
    const th = SHOP_THEMES.find((x) => x.id === themeId && x.ready);
    if (!th || !el.isConnected) return;
    const s = data.settings || {};
    const clamp = (v, max, d) => (Number.isInteger(v) ? Math.max(0, Math.min(max, v)) : d);
    pickTheme(th, () => {
      const top = th.tiers[lang].length - 1;
      st.lo = clamp(s.lo, top, 0);
      st.hi = Math.max(st.lo, clamp(s.hi, top, top));
      const p = s.price || {};
      const pTop = SHOP_PCTS.length - 1;
      st.price = { lo: clamp(p.lo, pTop, 5), hi: Math.max(clamp(p.lo, pTop, 5), clamp(p.hi, pTop, 11)) };
      for (const g of groups) st[g] = new Set(s[g] || []);
      st.count = clamp(s.count, 30, 6) || 1;
      st.multi = !!s.multi;
    });
    const byId = new Map(th.items().map((it) => [it.id, it]));
    const rows = (data.rows || [])
      .filter((r) => byId.has(r.id))
      .map((r) => ({ ...byId.get(r.id), qty: r.qty, pct: r.pct, shopPrice: shopPriceOf(byId.get(r.id), r.pct) }));
    showResult({ rows, short: !!data.short, missing: data.missing || [], tooFew: !!data.tooFew }, name);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

const TOOLS = {
  pointbuy: mountPointBuy,
  "pointbuy-bonuses": mountPointBuyBonuses,
  "class-table": mountClassTable,
  "class-detail": mountClassDetail,
  "class-gear": mountClassGear,
  "vehicle-table": mountVehicleTable,
  "quickhack-table": mountQuickhackTable,
  "feat-table": mountFeatTable,
  "cyberware-table": mountCyberwareTable,
  "item-table": mountItemTable,
  "shop-generator": mountShopGenerator,
};

for (const [name, cfg] of Object.entries(LORE_TABLES)) TOOLS[name] = (el, lang) => mountTextCardTable(el, lang, cfg);

// ---------- Sözlük (Oyuncu Rehberi › Sözlük) ----------
// Evren ve sokak sözleri GLOSSARY'den; kural terimleri GLOSSARY ve TERMS'ten gelir. Dile göre alfabetik sıralanır.
// Türkçede adı İngilizcesinden farklı olan terimin altında İngilizce adı küçük ve gri yazar.

const GLOSSARY_TEXT = {
  tr: { term: "Terim", meaning: "Anlamı" },
  en: { term: "Term", meaning: "Meaning" },
};

function mountGlossary(el, lang, kind) {
  const t = GLOSSARY_TEXT[lang];
  const plain = (s) => String(s).replace(/<[^>]+>/g, "");
  const coll = new Intl.Collator(lang === "tr" ? "tr" : "en", { sensitivity: "base" });
  const rows = [...GLOSSARY.filter((g) => g.kind === kind), ...(kind === "kural" ? TERMS : [])].sort((a, b) =>
    coll.compare(plain(a.name[lang]), plain(b.name[lang]))
  );
  const name = (g) => {
    const other = lang === "tr" && plain(g.name.en) !== plain(g.name.tr) ? `<small lang="en">${g.name.en}</small>` : "";
    return `<td${g.nameLang && lang === "tr" ? ` lang="${g.nameLang}"` : ""}>${g.name[lang]}${other}</td>`;
  };
  el.innerHTML = `
    <table class="rules text glossary">
      <thead><tr><th>${t.term}</th><th>${t.meaning}</th></tr></thead>
      <tbody>${rows.map((g) => `<tr>${name(g)}<td>${g.desc[lang]}</td></tr>`).join("")}</tbody>
    </table>`;
}

TOOLS["glossary-world"] = (el, lang) => mountGlossary(el, lang, "evren");
TOOLS["glossary-rules"] = (el, lang) => mountGlossary(el, lang, "kural");

// reset: yeni sayfa açılırken paylaşılan araç durumu sıfırlanır (sol panel için false)
function mountTools(root, lang, reset = true) {
  if (reset) {
    pbListeners = [];
    pbState = loadPointBuy();
    ctListeners = [];
    ctFit = null;
    cardFits = [];
  }
  for (const el of root.querySelectorAll("[data-tool]")) {
    const mount = TOOLS[el.dataset.tool];
    if (mount) mount(el, lang);
  }
  updateSpecFloat(); // sınıf sayfasından çıkılınca kayan specialization düğmeleri gizlensin
}
