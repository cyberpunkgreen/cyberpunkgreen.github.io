// Karakter Geliştir: GM'in verdiği seviyeyi masada karakter kağıdına işleyen sayfa (kağıt penceresinde js/room.js açar).
// Seviyeler tek tek işlenir. Kazanımlar LEVELS ve sınıfın levels listesinden (js/content.js), bütçeler CC_LEVELS'tan (js/charcreate.js) gelir.
// Seçimler kağıt verisinde durur: statlar.artis: { stat: eklenen puan } · skiller.mastery2 · feat.cross: feat'lerine erişilen sınıf · feat.extra: onun yerine alınan feat puanı
const LU_MAX_STAT = 20;
const LU_EXTRA = "extra"; // Sınıf Dışı Feat'ler kazanımında fazladan feat puanını seçmek

const LU_TEXT = {
  tr: {
    title: "Karakter Geliştir", level: (n) => `${n}. Seviye`, hint: "Bu seviyede kazandıkların aşağıda. Seçimlerini yapıp onayla.", cancel: "Vazgeç", confirm: "Onayla",
    ask: (name, n) => `${name} ${n}. seviyeye geçsin mi? Seçimler bu masadaki kağıda yazılır.`, yes: "Seviye Atlat",
    left: "Kalan", done: "Hazır", sheet: "Karakter Kağıdı",
    profPts: (n) => `${n} yetkinlik puanı`, statPts: (n) => `${n} stat puanı`, pickSpec: "specialization", pickMastery: "ek Ustalık", pickCross: "sınıf dışı feat seçimi",
    pickQh: (n) => `${n} quickhack`, pickMelody: (n) => `${n} melodi`,
    feats: "Feat Seç", featPoints: "Feat puanı", featHint: "Harcamadığın puanlar sonraki seviyelere kalır.", featSearch: "Feat ara…", noFeats: "Aramaya uyan feat yok.",
    classFeats: (n) => `${n} Feat'leri`, crossFeats: (n) => `${n} Feat'leri (1. aşama)`, generalFeats: "Tarafsız Feat'ler",
    skillPts: "Yetkinlik puanı", statPtsLabel: "Stat puanı", qhTitle: "Quickhack Seç", melodyTitle: "Melodi Seç", specTitle: "Specialization Seç", extraFeat: "Fazladan 1 feat puanı",
    masteryPick: "Skill seç", feature: "Specialization özelliği", specQh: "Specialization quickhack'leri havuza eklendi.",
  },
  en: {
    title: "Character Advancement", level: (n) => `Level ${n}`, hint: "This is what you gain at this level. Make your choices and confirm.", cancel: "Cancel", confirm: "Confirm",
    ask: (name, n) => `Move ${name} to level ${n}? The choices are written to this table's sheet.`, yes: "Level Up",
    left: "Left", done: "Ready", sheet: "Character Sheet",
    profPts: (n) => `${n} proficiency point${n > 1 ? "s" : ""}`, statPts: (n) => `${n} stat point${n > 1 ? "s" : ""}`, pickSpec: "specialization", pickMastery: "extra Mastery", pickCross: "feats from another role",
    pickQh: (n) => `${n} quickhack${n > 1 ? "s" : ""}`, pickMelody: (n) => `${n} melod${n > 1 ? "ies" : "y"}`,
    feats: "Pick Feats", featPoints: "Feat points", featHint: "Points you don't spend carry over to later levels.", featSearch: "Search feats…", noFeats: "No feats match your search.",
    classFeats: (n) => `${n} Feats`, crossFeats: (n) => `${n} Feats (tier 1)`, generalFeats: "General Feats",
    skillPts: "Proficiency points", statPtsLabel: "Stat points", qhTitle: "Pick Quickhacks", melodyTitle: "Pick Melodies", specTitle: "Pick a Specialization", extraFeat: "1 extra feat point",
    masteryPick: "Pick a skill", feature: "Specialization feature", specQh: "Specialization quickhacks are added to your pool.",
  },
};

// Bir sonraki seviyenin kazanımları ve ondan doğan seçimler
function luGains(data) {
  const level = (data.seviye || 1) + 1;
  const role = CLASSES.find((c) => c.id === data.sinif);
  const gains = [...(LEVELS[level - 1] || []), ...((role && role.levels && role.levels[level]) || [])];
  return {
    level, role, gains,
    prof: gains.includes(GAIN.prof) ? 2 : 0,
    stat: gains.includes(GAIN.stat) ? 2 : 0,
    spec: gains.includes("spec"),
    mastery2: gains.includes(GAIN.mastery2),
    cross: gains.includes(GAIN.crossclass),
    melodies: (role && role.melodyPicks && role.melodyPicks[level]) || 0,
    qh: role && role.id === "netrunner" ? CC_LEVELS[level].qh - CC_LEVELS[level - 1].qh : 0,
  };
}

// host: sayfanın çizileceği kutu · onSave(data): onaylanan kağıt verisi · onClose: vazgeçildi
function ccLevelUp(host, sheet, lang, onSave, onClose) {
  const t = LU_TEXT[lang];
  const c = CC_TEXT[lang];
  const base = ccNormalize({ data: JSON.parse(JSON.stringify(sheet.data)) }).data;
  const g = luGains(base);
  const d = JSON.parse(JSON.stringify(base));
  d.seviye = g.level;
  ccFeatQuery = "";
  const read = (fn) => ccWith(d, fn);
  const baseFeats = new Set(base.feat.picks);
  const baseQh = new Set(base.quickhack.picks);
  const baseMelodies = new Set(base.spec.melodies);
  const profLeft = () => g.prof - Object.keys(d.skiller.prof).reduce((n, id) => n + (d.skiller.prof[id] || 0) - (base.skiller.prof[id] || 0), 0);
  const statLeft = () => g.stat - Object.values(d.statlar.artis).reduce((n, v) => n + v, 0) + Object.values(base.statlar.artis).reduce((n, v) => n + v, 0);
  const qhLeft = () => g.qh - d.quickhack.picks.filter((id) => !baseQh.has(id)).length;
  const melodyLeft = () => (d.spec.id ? g.melodies - d.spec.melodies.filter((id) => !baseMelodies.has(id)).length : 0);
  const featPool = () => FEATS.filter((f) => !baseFeats.has(f.id) && ((f.tier <= (g.level >= 4 ? 2 : 1) && canTakeFeat(f, d.sinif)) || (f.tier === 1 && f.cls === d.feat.cross)));
  // Sınıf dışı seçim değişince artık alınamayan ya da puanı yetmeyen yeni feat'ler bırakılır
  const trimFeats = () => {
    const pool = featPool();
    d.feat.picks = d.feat.picks.filter((id) => baseFeats.has(id) || pool.some((f) => f.id === id));
    while (read(ccFeatLeft) < 0 && d.feat.picks.length > baseFeats.size) d.feat.picks.pop();
  };
  const todo = () => [
    profLeft() > 0 && t.profPts(profLeft()),
    statLeft() > 0 && t.statPts(statLeft()),
    g.spec && !d.spec.id && t.pickSpec,
    melodyLeft() > 0 && t.pickMelody(melodyLeft()),
    g.mastery2 && !d.skiller.mastery2 && t.pickMastery,
    g.cross && !d.feat.cross && !d.feat.extra && t.pickCross,
    qhLeft() > 0 && t.pickQh(qhLeft()),
  ].filter(Boolean);

  const info = (head, text) => `<div class="lu-gain"><h4>${head}</h4><p>${text}</p></div>`;
  const summary = (label, left, total) => `<div class="sk-summary"><div><b>${label}</b><span class="${left ? "" : "full"}">${left} / ${total}</span></div></div>`;
  const stepper = (attr, value, can, hi) => `<span class="lu-step"><button type="button" ${attr}="-1"${can < 0 ? "" : " disabled"} aria-label="−">−</button><i>${value}</i><button type="button" ${attr}="1"${hi ? "" : " disabled"} aria-label="+">+</button></span>`;

  function profBox() {
    const left = profLeft();
    return `${summary(t.skillPts, left, g.prof)}<ul class="lu-skills">${SKILLS.map((k) => {
      const now = d.skiller.prof[k.id] || 0;
      return `<li data-skill="${k.id}"><b lang="en">${k.name}</b><small>${k.stat}</small>${stepper("data-prof", now, (base.skiller.prof[k.id] || 0) - now, left > 0 && now < 2)}</li>`;
    }).join("")}</ul>`;
  }
  function statBox() {
    const left = statLeft();
    return `${summary(t.statPtsLabel, left, g.stat)}<div class="lu-stats">${PB_ROWS.map((s) => {
      const v = ccStatOf(d, s.id);
      return `<div data-stat="${s.id}"><b>${s.id}</b>${stepper("data-raise", v, ccStatOf(base, s.id) - v, left > 0 && v < LU_MAX_STAT)}</div>`;
    }).join("")}</div>`;
  }
  function specBox() {
    return `<h3 class="cc-sub">${t.specTitle}</h3><div class="cf-grid">${g.role.specs.map((s, i) => {
      const on = d.spec.id === s.id;
      return `<div class="cf-card${on ? " on" : ""}" role="button" tabindex="0" aria-pressed="${on}" data-spec="${s.id}" style="--feat: ${SPEC_COLORS[i]}"><div class="cf-top"><b lang="en">${s.name[lang]}</b></div><p class="cf-desc">${s.summary[lang]}</p></div>`;
    }).join("")}</div>`;
  }
  function melodyBox() {
    const list = read(ccMelodyList).filter((m) => !baseMelodies.has(m.name.en));
    const full = melodyLeft() <= 0;
    return `<h3 class="cc-sub">${t.melodyTitle}</h3>${summary(t.melodyTitle, melodyLeft(), g.melodies)}<div class="cf-grid">${list.map((m) => {
      const on = d.spec.melodies.includes(m.name.en);
      const off = !on && full;
      return `<div class="cf-card${on ? " on" : ""}${off ? " off" : ""}" role="button" tabindex="0" aria-pressed="${on}" data-melody="${ccEsc(m.name.en)}" style="--feat: ${read(ccSpecColor)}"><div class="cf-top"><b>${m.name[lang]}</b><span class="cf-tier">${m.type[lang]} · ${m.duration[lang]}</span></div><p class="cf-desc">${linkTerms(m.effect[lang], lang)}</p></div>`;
    }).join("")}</div>`;
  }
  function masteryBox() {
    const list = SKILLS.filter((k) => d.skiller.prof[k.id] > 0 && k.id !== d.skiller.mastery);
    return `<label class="lu-field"><span>${t.masteryPick}</span><select data-mastery2><option value=""></option>${list.map((k) => `<option value="${k.id}"${k.id === d.skiller.mastery2 ? " selected" : ""}>${k.name}</option>`).join("")}</select></label>`;
  }
  function crossBox() {
    const chip = (id, label, on) => `<button type="button" class="shop-chip${on ? " on" : ""}" data-cross="${id}" aria-pressed="${on}">${label}</button>`;
    return `<div class="lu-chips">${CLASSES.filter((r) => r.id !== d.sinif).map((r) => chip(r.id, r.name, d.feat.cross === r.id)).join("")}${chip(LU_EXTRA, t.extraFeat, !!d.feat.extra)}</div>`;
  }
  function qhBox() {
    const pool = read(ccQhPool).filter((q) => !baseQh.has(q.id));
    const full = qhLeft() <= 0;
    return `<h3 class="cc-sub">${t.qhTitle}</h3>${summary(t.qhTitle, qhLeft(), g.qh)}<div class="cf-grid">${pool.map((q) => {
      const on = d.quickhack.picks.includes(q.id);
      const off = !on && full;
      return `<div class="cf-card cw-card${on ? " on" : ""}${off ? " off" : ""}" role="button" tabindex="0" aria-pressed="${on}" data-qh="${q.id}" style="--feat: ${ccQhColor(q)}"><div class="cf-top"><b lang="en">${q.name}</b><span class="cf-tier">${c.qhTier(q.tier)} · ${q.ram} RAM · ${QH_TYPES[q.type][lang]}</span></div><p class="cf-desc">${linkTerms(q.desc[lang], lang)}</p></div>`;
    }).join("")}</div>`;
  }
  function featBox() {
    const left = read(ccFeatLeft);
    const pool = featPool();
    const taken = (f) => d.feat.picks.includes(f.id);
    if (left <= 0 && !pool.some(taken)) return "";
    const card = (f) => {
      const on = taken(f);
      const off = !on && f.tier > left;
      const search = `${f.name.tr} ${f.name.en} ${f.gloss || ""} ${ccPlain(f.desc[lang])}`.toLocaleLowerCase();
      return `<div class="cf-card${on ? " on" : ""}${off ? " off" : ""}" role="button" tabindex="0" aria-pressed="${on}" data-feat="${f.id}" data-search="${ccEsc(search)}" style="--feat: ${ccFeatColor(f)}"><div class="cf-top"><span><b lang="en">${f.name[lang]}</b>${lang === "tr" && f.gloss ? ` <span class="cc-gloss">(${f.gloss})</span>` : ""}</span><span class="cf-tier">${c.tierLabel(f.tier)} · ${c.cost(f.tier)}</span></div><p class="cf-desc">${linkTerms(f.desc[lang], lang)}</p></div>`;
    };
    const group = (title, color, list) => (list.length ? `<h3 class="cc-sub colored" style="--sub: ${color}">${title}</h3><div class="cf-grid">${list.map(card).join("")}</div>` : "");
    const cross = CLASSES.find((r) => r.id === d.feat.cross);
    return `
      <h3 class="cc-sub">${t.feats}</h3>
      <p class="cc-hint">${t.featHint}</p>
      ${summary(t.featPoints, left, read(ccFeatPoints) - base.feat.picks.reduce((n, id) => n + ((FEATS.find((f) => f.id === id) || {}).tier || 0), 0))}
      <input type="search" class="cf-search" data-feat-search placeholder="${t.featSearch}" value="${ccEsc(ccFeatQuery)}" autocomplete="off" aria-label="${t.featSearch}">
      ${group(c.classFeats ? c.classFeats(g.role.name) : t.classFeats(g.role.name), CLASS_COLORS[g.role.id], pool.filter((f) => f.cls === g.role.id))}
      ${cross ? group(t.crossFeats(cross.name), CLASS_COLORS[cross.id], pool.filter((f) => f.cls === cross.id)) : ""}
      ${group(t.generalFeats, "#39ff14", pool.filter((f) => f.cls === "tarafsiz"))}
      <p class="cc-hint cf-empty" hidden>${t.noFeats}</p>`;
  }

  // Kazanımlar LEVELS sırasıyla; seçim gerektirenlerin hemen altında seçici durur
  function gainsHtml() {
    const spec = read(ccSpec);
    return g.gains.map((x) => {
      if (x === "core") return "";
      if (x === "spec") return g.role ? specBox() : "";
      if (x === "specqh") return info(c.specLabel, t.specQh);
      if (x === "specfeat") {
        const f = spec && spec.features && spec.features[g.level];
        return f ? info(`<span lang="en">${f.name}</span>`, f[lang]) : "";
      }
      const body = x === GAIN.prof ? profBox() : x === GAIN.stat ? statBox() : x === GAIN.mastery2 ? masteryBox() : x === GAIN.crossclass ? crossBox() : "";
      return info(x.h[lang], x.p[lang]) + body;
    }).join("");
  }

  function draw() {
    const box = host.closest(".room-pop") || host;
    const top = box.scrollTop;
    const left = todo();
    host.innerHTML = `
      <header><b>${t.title}</b><span>${ccEsc(sheet.name)} · ${t.level(g.level)}</span></header>
      <p class="cc-hint">${t.hint}</p>
      ${gainsHtml()}
      ${g.role && melodyLeft() + (d.spec.melodies.length - baseMelodies.size) > 0 ? melodyBox() : ""}
      ${g.qh ? qhBox() : ""}
      ${g.role ? featBox() : ""}
      <h3 class="cc-sub">${t.sheet}</h3>
      <div class="cc-sheet-body">${ccSheetOf(d, lang, `${sheet.humanity} / ${sheet.humanityMax}`).replaceAll("#39ff14", "var(--sheet-color)")}</div>
      <footer class="lu-foot">
        <span class="${left.length ? "" : "full"}">${left.length ? `${t.left}: ${left.join(", ")}` : t.done}</span>
        <button type="button" class="cc-btn" data-lu-cancel>${t.cancel}</button>
        <button type="button" class="cc-btn" data-lu-ok${left.length ? " disabled" : ""}>${t.confirm}</button>
      </footer>`;
    ccFilterFeats(host);
    box.scrollTop = top;
  }

  const toggle = (list, id, full) => {
    if (list.includes(id)) list.splice(list.indexOf(id), 1);
    else if (!full) list.push(id);
  };
  host.addEventListener("click", async (e) => {
    const b = (s) => e.target.closest(s);
    let x;
    if (b("[data-lu-cancel]")) {
      onClose();
    } else if (b("[data-lu-ok]")) {
      if (todo().length || !(await ccConfirm(t.ask(sheet.name, g.level), lang, t.yes))) return;
      d.feat.saved = read(ccFeatLeft) > 0;
      onSave(d);
    } else if ((x = b("[data-prof]"))) {
      const id = b("[data-skill]").dataset.skill;
      d.skiller.prof[id] = (d.skiller.prof[id] || 0) + Number(x.dataset.prof);
      if (!d.skiller.prof[id]) delete d.skiller.prof[id];
      draw();
    } else if ((x = b("[data-raise]"))) {
      const id = b("[data-stat]").dataset.stat;
      d.statlar.artis[id] = (d.statlar.artis[id] || 0) + Number(x.dataset.raise);
      if (!d.statlar.artis[id]) delete d.statlar.artis[id];
      draw();
    } else if ((x = b("[data-spec]"))) {
      d.spec = d.spec.id === x.dataset.spec ? { role: null, id: null, melodies: [] } : { role: d.sinif, id: x.dataset.spec, melodies: [] };
      d.quickhack.picks = d.quickhack.picks.filter((id) => baseQh.has(id) || read(ccQhPool).some((q) => q.id === id));
      draw();
    } else if ((x = b("[data-melody]"))) {
      toggle(d.spec.melodies, x.dataset.melody, melodyLeft() <= 0);
      draw();
    } else if ((x = b("[data-qh]"))) {
      toggle(d.quickhack.picks, x.dataset.qh, qhLeft() <= 0);
      draw();
    } else if ((x = b("[data-cross]"))) {
      const id = x.dataset.cross;
      const same = id === LU_EXTRA ? d.feat.extra : d.feat.cross === id;
      d.feat.cross = same || id === LU_EXTRA ? null : id;
      d.feat.extra = !same && id === LU_EXTRA ? 1 : 0;
      trimFeats();
      draw();
    } else if ((x = b("[data-feat]"))) {
      const f = FEATS.find((k) => k.id === x.dataset.feat);
      toggle(d.feat.picks, f.id, f.tier > read(ccFeatLeft));
      draw();
    }
  });
  host.addEventListener("input", (e) => {
    if (!e.target.matches("[data-feat-search]")) return;
    ccFeatQuery = e.target.value;
    ccFilterFeats(host);
  });
  host.addEventListener("change", (e) => {
    if (!e.target.matches("[data-mastery2]")) return;
    d.skiller.mastery2 = e.target.value || null;
    draw();
  });
  draw();
}
