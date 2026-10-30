// Araçlar > Karakter Oluştur: karakter kağıdını aşama aşama dolduran araç.
// Sol panelde aşamalar listelenir ("char-steps", "Bu sayfada" panelinin yerinde); sayfada yalnızca seçili aşama görünür ("char-create").
// Her aşamanın başında içi boş bir yuvarlak vardır; aşama tamamlanınca içi dolar. Bütün aşamalar tamamlanınca
// listenin sonuna "Gözden Geçir" eklenir ve orada karakterin bütün bilgileri bir arada görünür.
// Şimdilik iskelet: Profil çalışıyor, diğer aşamalar yer tutucu; "Tamamla" ve kaydetme sonra eklenecek.
// Aşamalar: Profil, Stat Dağıtma, Skill Bonusları, Feat, Quickhack Kütüphanesi (yalnızca Netrunner), Cyberware, Başlangıç Eşyaları.
// Doldurulan taslak yalnızca bu tarayıcıda saklanır (localStorage).

const CC_KEY = "cg-char-draft";

const CC_TEXT = {
  tr: {
    steps: "Aşamalar",
    sheet: "Karakter Kağıdı",
    stage: "Aşama",
    prev: "Geri",
    next: "İleri",
    soon: "Bu aşama yakında eklenecek.",
    willHave: "Bu aşamada:",
    required: "Zorunlu",
    level: "Seviye",
    handle: "Takma Ad",
    role: "Sınıf",
    empty: "—",
    pick: "Seç",
    picked: "Seçildi",
    core: "Çekirdek Feat",
    stats: "Önerilen Statlar",
    notYet: "Henüz doldurulmadı.",
    identity: "Kimlik",
    startLevel: "Başlangıç Seviyesi",
    levelNote: "Şimdilik bütün karakterler 1. seviyeden başlar.",
  },
  en: {
    steps: "Steps",
    sheet: "Character Sheet",
    stage: "Step",
    prev: "Back",
    next: "Next",
    soon: "This step is coming soon.",
    willHave: "In this step:",
    required: "Required",
    level: "Level",
    handle: "Handle",
    role: "Role",
    empty: "—",
    pick: "Choose",
    picked: "Chosen",
    core: "Core Feat",
    stats: "Suggested Stats",
    notYet: "Not filled in yet.",
    identity: "Identity",
    startLevel: "Starting Level",
    levelNote: "For now, every character starts at level 1.",
  },
};

// Profil aşamasının ad ve görünüş alanları; takma ad zorunlu
const CC_PROFILE = [
  { key: "handle", label: { tr: "Takma Ad", en: "Handle" }, hint: { tr: "Sokakta bilinen adı", en: "The name the street knows" }, required: true },
  { key: "name", label: { tr: "Gerçek Adı", en: "Real Name" }, hint: { tr: "Kimliğinde yazan ad", en: "The name on their ID" } },
  { key: "age", label: { tr: "Yaş", en: "Age" }, hint: { tr: "", en: "" }, short: true },
  { key: "look", label: { tr: "Görünüş", en: "Appearance" }, hint: { tr: "Yüzü, giyimi, kromu, ilk bakışta göze çarpan her şey", en: "Face, clothes, chrome, whatever catches the eye first" }, area: true },
  { key: "notes", label: { tr: "Kişilik ve Notlar", en: "Personality & Notes" }, hint: { tr: "Alışkanlıkları, korkuları, kime borçlu olduğu", en: "Habits, fears, who they owe" }, area: true },
];

const CC_MAX_LEVEL = 1; // şimdilik karakterler en fazla 1. seviyeden başlar

// Aşamalar. done: aşama tamamlandı mı · intro: aşamanın başındaki kısa açıklama · plan: yer tutucu aşamalarda neyin geleceği
const CC_STAGES = [
  {
    id: "profil",
    label: { tr: "Profil", en: "Profile" },
    intro: {
      tr: "Night City'de çoğu insan gerçek adıyla değil, sokağın ona taktığı adla tanınır. Karakterin kim olduğunu, nasıl göründüğünü ve sokakta hangi işi yaptığını, yani sınıfını belirle.",
      en: "In Night City most people go by the name the street gave them, not the one they were born with. Decide who your character is, what they look like and what they do on the street: their Role.",
    },
    done: (d) => !!(d.profil.handle || "").trim() && !!d.sinif && d.seviye >= 1,
    render: ccProfile,
  },
  {
    id: "statlar",
    label: { tr: "Stat Dağıtma", en: "Stats" },
    intro: {
      tr: "Yedi stat, karakterin bedenini ve zihnini sayılara döker. Statlar point buy ya da sabit diziyle belirlenir; EMP herkeste 10'dan başlar.",
      en: "Seven stats put your character's body and mind into numbers. They're set with point buy or the standard array; EMP starts at 10 for everyone.",
    },
    plan: {
      tr: ["Stat Dağıtma aracındaki gibi point buy ya da sabit diziyle yedi stat ve EMP", "Bir stat adının üstüne gelince, o stat'ın o anki değerine göre skill'lerinin temel modifier'ları"],
      en: ["The seven stats and EMP with point buy or the standard array, as in the Stat Distribution tool", "Hovering a stat's name shows its skills' base modifiers at that stat's current score"],
    },
    done: () => false,
  },
  {
    id: "skiller",
    label: { tr: "Skill Bonusları", en: "Skill Bonuses" },
    intro: {
      tr: "Her stat, modifier'ı kadar yetkinlik puanı verir ve bu puanlar o stat'ın skill'lerine harcanır. Ardından yetkin olunan bir skill'e Ustalık verilir.",
      en: "Each stat grants proficiency points equal to its modifier, spent on that stat's skills. Then one proficient skill receives Mastery.",
    },
    plan: {
      tr: ["Yetkinlik puanlarıyla yetkin olunan skill'lerin seçilmesi", "Ustalık'ın yetkin olunan bir skill'e verilmesi"],
      en: ["Choosing proficient skills with proficiency points", "Giving Mastery to a proficient skill"],
    },
    done: () => false,
  },
  {
    id: "feat",
    label: { tr: "Feat", en: "Feat" },
    intro: {
      tr: "Her karakter oyuna 1 feat puanıyla başlar. Puan hemen bir feat'e harcanabilir ya da sonraki seviyelerde daha pahalı bir feat için saklanabilir.",
      en: "Every character starts the game with 1 feat point. It can be spent on a feat right away or saved for a pricier feat at a later level.",
    },
    plan: {
      tr: ["Sınıfın ve tarafsız havuzun 1. aşama feat'lerinden seçim", "Puanı saklama seçeneği"],
      en: ["Choosing from your Role's and the common pool's tier 1 feats", "The option to save the point"],
    },
    done: () => false,
  },
  {
    id: "quickhack",
    label: { tr: "Quickhack Kütüphanesi", en: "Quickhack Library" },
    when: (d) => d.sinif === "netrunner", // yalnızca Netrunner seçilince görünür
    intro: {
      tr: "Bir Netrunner'ın gücü, cyberdeck'ine yüklediği programlar kadardır. 1. seviyede erişebildiğin kademelerden 3 quickhack seçip kütüphanene eklersin.",
      en: "A Netrunner is only as good as the programs on their cyberdeck. At level 1 you choose 3 quickhacks from the tiers you can access and add them to your library.",
    },
    plan: {
      tr: ["I. kademe quickhack'lerden 3 seçim"],
      en: ["Choosing 3 tier I quickhacks"],
    },
    done: () => false,
  },
  {
    id: "cyberware",
    label: { tr: "Cyberware", en: "Cyberware" },
    intro: {
      tr: "Karakter oyuna Başlangıç etiketli listeden seçilen 2 cyberware ile başlar. Her parça bir yuva kaplar ve maksimum Humanity'yi düşürür.",
      en: "Characters start the game with 2 cyberware pieces from the Starting list. Each piece takes a slot and lowers maximum Humanity.",
    },
    plan: {
      tr: ["Başlangıç listesinden 2 parça", "Yuvaların ve Humanity kaybının kağıda işlenmesi"],
      en: ["2 pieces from the Starting list", "Recording slots and Humanity loss on the sheet"],
    },
    done: () => false,
  },
  {
    id: "esyalar",
    label: { tr: "Başlangıç Eşyaları", en: "Starting Gear" },
    intro: {
      tr: "Karakter sokağa boş elle çıkmaz. Profil'de seçilen sınıfın başlangıç envanterinden silah, zırh ve ekipman seçilir; bilinen diller de burada yazılır.",
      en: "Nobody hits the street empty-handed. Pick weapons, armor and gear from the starting kit of the Role chosen in your Profile; known languages are recorded here too.",
    },
    plan: {
      tr: ["Sınıfın başlangıç envanterinden silah, zırh ve ekipman seçimi", "Diller"],
      en: ["Picking weapons, armor and gear from your Role's starting kit", "Languages"],
    },
    done: () => false,
  },
];

const CC_REVIEW = {
  id: "gozden-gecir",
  label: { tr: "Gözden Geçir", en: "Review" },
  intro: {
    tr: "Karakter kağıdı hazır. Sokağa çıkmadan önce her şeyi son bir kez gözden geçir.",
    en: "The character sheet is ready. Look it over one last time before you hit the street.",
  },
  render: ccReview,
};

let cc = ccLoad();
let ccViews = []; // açık olan görünümler (sol panel ve aşama); taslak değişince güncellenir

function ccLoad() {
  const blank = { stage: "profil", data: { profil: {}, sinif: null, seviye: 1 } };
  try {
    const s = JSON.parse(localStorage.getItem(CC_KEY));
    if (s && s.data) return { stage: s.stage || blank.stage, data: { ...blank.data, ...s.data, profil: { ...(s.data.profil || {}) } } };
  } catch (e) {}
  return blank;
}

function ccSave() {
  try { localStorage.setItem(CC_KEY, JSON.stringify(cc)); } catch (e) {}
}

const ccEsc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const ccActive = () => CC_STAGES.filter((s) => !s.when || s.when(cc.data));
const ccAllDone = () => ccActive().every((s) => s.done(cc.data));
const ccStages = () => (ccAllDone() ? [...ccActive(), CC_REVIEW] : ccActive());

// Seçili aşama artık listede yoksa (örn. bir aşama yeniden eksik kalınca Gözden Geçir kalkar) ilk eksik aşamaya dönülür
function ccCurrent() {
  const list = ccStages();
  let s = list.find((x) => x.id === cc.stage);
  if (!s) {
    s = list.find((x) => x.done && !x.done(cc.data)) || list[0];
    cc.stage = s.id;
  }
  return s;
}

// full: aşama da yeniden çizilsin mi (yazı yazarken yalnızca sol panel ve kağıdın başlığı güncellenir, imleç kaybolmasın)
function ccChanged(full) {
  ccSave();
  for (const v of ccViews) v(full);
}

function ccGo(id) {
  cc.stage = id;
  ccChanged(true);
  const top = document.querySelector(".content");
  if (top && top.getBoundingClientRect().top < 0) window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- Sol panel: aşamalar ----------

function mountCharSteps(el, lang) {
  const t = CC_TEXT[lang];
  const draw = () => {
    const cur = ccCurrent();
    el.innerHTML = `
      <div class="cc-steps">
        <div class="toc-head">${t.steps}</div>
        <ul class="toc-list cc-list">
          ${ccStages()
            .map((s, i) => {
              const done = s.done ? s.done(cc.data) : false;
              const review = s === CC_REVIEW;
              return `<li style="--i:${i}"${review ? ` class="cc-review-item"` : ""}>
                <a href="#" data-stage="${s.id}" class="${s.id === cur.id ? "active" : ""}" aria-current="${s.id === cur.id ? "step" : "false"}">
                  <span class="cc-dot${done ? " done" : ""}${review ? " review" : ""}" aria-hidden="true"></span>
                  <span class="label">${s.label[lang]}</span>
                </a>
              </li>`;
            })
            .join("")}
        </ul>
      </div>`;
  };
  el.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-stage]");
    if (!a) return;
    e.preventDefault();
    ccGo(a.dataset.stage);
  });
  ccViews.push(draw);
  draw();
}

// ---------- Aşama ----------

function mountCharCreate(el, lang) {
  const t = CC_TEXT[lang];
  ccViews = []; // sayfa yeniden açıldı; sol panel bundan sonra eklenir

  const head = () => {
    const role = CLASSES.find((c) => c.id === cc.data.sinif);
    const cell = (label, value) => `<div class="cc-head-cell"><b>${label}</b><span class="${value ? "" : "blank"}">${value ? ccEsc(value) : "&nbsp;"}</span></div>`;
    return cell(t.handle, (cc.data.profil.handle || "").trim()) + cell(t.role, role && role.name) + cell(t.level, String(cc.data.seviye || 1));
  };

  const draw = (full) => {
    const s = ccCurrent();
    const list = ccStages();
    const i = list.indexOf(s);
    if (!full) {
      const h = el.querySelector(".cc-head");
      if (h) h.innerHTML = head();
      return;
    }
    const prev = list[i - 1];
    const next = list[i + 1];
    el.innerHTML = `
      <div class="cc">
        <div class="cc-sheet">
          <div class="cc-sheet-top">
            <span class="cc-sheet-title">${t.sheet}</span>
            <span class="cc-sheet-step">${t.stage} ${String(i + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}</span>
          </div>
          <div class="cc-head">${head()}</div>
          <div class="cc-stage" data-stage="${s.id}">
            <h2 class="cc-title">${s.label[lang]}</h2>
            <p class="cc-intro">${s.intro[lang]}</p>
            ${s.render ? s.render(lang) : ccSoon(s, lang)}
          </div>
        </div>
        <div class="cc-nav">
          ${prev ? `<button type="button" class="cc-btn" data-go="${prev.id}">‹ ${t.prev}</button>` : "<span></span>"}
          ${next ? `<button type="button" class="cc-btn primary" data-go="${next.id}">${t.next} ›</button>` : ""}
        </div>
      </div>`;
  };

  el.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) return ccGo(go.dataset.go);
    const pick = e.target.closest("[data-role]");
    if (pick) {
      cc.data.sinif = cc.data.sinif === pick.dataset.role ? null : pick.dataset.role;
      ccChanged(true);
    }
  });

  el.addEventListener("input", (e) => {
    const f = e.target.closest("[data-field]");
    if (f) {
      cc.data.profil[f.dataset.field] = f.value;
      ccChanged(false);
    }
  });

  el.addEventListener("change", (e) => {
    if (e.target.matches("[data-level]")) {
      cc.data.seviye = Number(e.target.value) || 1;
      ccChanged(false);
    }
  });

  ccViews.push(draw);
  draw(true);
}

// Yer tutucu aşama: kısa açıklama ve bu aşamada neyin yapılacağı
function ccSoon(s, lang) {
  const t = CC_TEXT[lang];
  return `
    <div class="cc-soon">
      <p><b>${t.willHave}</b></p>
      <ul>${s.plan[lang].map((x) => `<li>${x}</li>`).join("")}</ul>
      <p class="cc-soon-note">${t.soon}</p>
    </div>`;
}

// Profil: kimlik alanları, sınıf seçimi ve başlangıç seviyesi; her biri kağıtta ayrı bir bölüm
function ccProfile(lang) {
  const t = CC_TEXT[lang];
  const k = cc.data.profil;
  const fields = CC_PROFILE.map((f) => {
    const id = `cc-${f.key}`;
    const input = f.area
      ? `<textarea id="${id}" data-field="${f.key}" rows="3" placeholder="${ccEsc(f.hint[lang])}">${ccEsc(k[f.key])}</textarea>`
      : `<input id="${id}" data-field="${f.key}" type="text" maxlength="${f.short ? 4 : 40}" value="${ccEsc(k[f.key])}" placeholder="${ccEsc(f.hint[lang])}" autocomplete="off">`;
    return `
      <div class="cc-field${f.area ? " wide" : ""}${f.short ? " short" : ""}">
        <label for="${id}">${f.label[lang]}${f.required ? ` <span class="cc-req">${t.required}</span>` : ""}</label>
        ${input}
      </div>`;
  }).join("");
  const roles = CLASSES.map((c) => {
    const on = cc.data.sinif === c.id;
    return `
      <button type="button" class="cc-role${on ? " on" : ""}" data-role="${c.id}" aria-pressed="${on}">
        <span class="cc-role-top"><span class="cc-role-name">${c.name}</span><span class="cc-role-pick">${on ? t.picked : t.pick}</span></span>
        <span class="cc-role-meta"><b>${t.stats}</b> ${c.stats.join(" · ")}</span>
        <span class="cc-role-core"><b>${t.core}</b> ${c.core[lang]}</span>
      </button>`;
  }).join("");
  const levels = Array.from({ length: CC_MAX_LEVEL }, (_, i) => i + 1)
    .map((n) => `<option value="${n}"${n === cc.data.seviye ? " selected" : ""}>${n}</option>`)
    .join("");
  return `
    <h3 class="cc-sub">${t.identity}</h3>
    <div class="cc-fields">${fields}</div>
    <h3 class="cc-sub">${t.role} <span class="cc-req">${t.required}</span></h3>
    <div class="cc-roles">${roles}</div>
    <h3 class="cc-sub">${t.startLevel}</h3>
    <div class="cc-field cc-level">
      <label for="cc-level">${t.level}</label>
      <select id="cc-level" data-level>${levels}</select>
      <p class="cc-hint">${t.levelNote}</p>
    </div>`;
}

function ccReview(lang) {
  const t = CC_TEXT[lang];
  const k = cc.data.profil;
  const role = CLASSES.find((c) => c.id === cc.data.sinif);
  const row = (label, value) => `<div class="cc-review-row"><b>${label}</b><span>${value ? ccEsc(value) : t.notYet}</span></div>`;
  return `
    <div class="cc-review">
      <h3>${CC_STAGES[0].label[lang]}</h3>
      ${CC_PROFILE.map((f) => row(f.label[lang], (k[f.key] || "").trim())).join("")}
      ${row(t.role, role && role.name)}
      ${row(t.startLevel, String(cc.data.seviye || 1))}
      ${ccActive().slice(1).map((s) => `<h3>${s.label[lang]}</h3><p class="cc-review-empty">${t.notYet}</p>`).join("")}
    </div>`;
}

TOOLS["char-steps"] = mountCharSteps;
TOOLS["char-create"] = mountCharCreate;
