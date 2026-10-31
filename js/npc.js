// ---------- Düşmanlar / NPC'ler (GM bölümü) ----------
// Ekran ortadan ikiye bölünür: solda bütün NPC'lerin listesi, sağda seçili NPC'nin karakter kağıdı.
// Yöneticiler üstteki düğmeyle editörü açıp NPC ekler, kağıttan düzenler ve siler; GM'ler yalnızca okur.
// Veri Firestore'da durur (npcs/{id}); okuma ve yazma window.CG_STORE üzerinden yapılır (js/auth.js).
// Karakter kağıdının kutucukları js/charcreate.js'tendir.
// NPC: { name, kind: NPC_KINDS anahtarı, group, role: sınıf (yoksa null), level, stats: { INT, … }, hp: elle verilen HP (yoksa BODY'den hesaplanır),
//   skills: { skill kimliği: değer }, feats, quickhacks, cyberware, languages, items: kimlik listeleri, notes }

const NPC_TEXT = {
  tr: {
    add: "Yeni NPC Ekle", edit: "Düzenle", del: "Sil", save: "Kaydet", cancel: "Vazgeç", addPick: "Ekle",
    search: "NPC ara…", all: "Hepsi", empty: "Henüz NPC yok.", none: "Gösterilecek NPC yok.", pick: "Karakter kağıdını görmek için soldan bir NPC seç.", loading: "Yükleniyor…",
    titleNew: "Yeni NPC", titleEdit: "NPC'yi Düzenle", name: "Ad", kind: "Tür", group: "Grup", groupHint: "Örn. Maelstrom", noRole: "Yok",
    stats: "Statlar", hpHint: "Boş bırakılırsa BODY'den hesaplanır", bodySp: "Gövde SP", headSp: "Kafa SP", notes: "Notlar",
    nameNeeded: "Ad yazılmalı.", confirmDel: (n) => `“${n}” silinsin mi?`,
  },
  en: {
    add: "Add New NPC", edit: "Edit", del: "Delete", save: "Save", cancel: "Cancel", addPick: "Add",
    search: "Search NPCs…", all: "All", empty: "No NPCs yet.", none: "No NPCs to show.", pick: "Pick an NPC on the left to see their character sheet.", loading: "Loading…",
    titleNew: "New NPC", titleEdit: "Edit NPC", name: "Name", kind: "Type", group: "Group", groupHint: "E.g. Maelstrom", noRole: "None",
    stats: "Stats", hpHint: "Left empty, it's worked out from BODY", bodySp: "Body SP", headSp: "Head SP", notes: "Notes",
    nameNeeded: "A name is required.", confirmDel: (n) => `Delete “${n}”?`,
  },
};

const NPC_KINDS = { dusman: { tr: "Düşman", en: "Enemy" }, npc: { tr: "NPC", en: "NPC" } };
const NPC_MAX_STAT = 30;

// Editördeki listeler: seçenekler, kimlikten bulma ve kağıttaki kutucuk
const NPC_PICKS = [
  { key: "feats", label: (c) => c.feats, en: true, list: () => FEATS, name: (f, lang) => f.name[lang], chip: (f, lang) => ccFeatChip(f, lang) },
  { key: "quickhacks", label: (c) => c.quickhacks, en: true, list: () => QUICKHACKS, name: (q) => q.name, chip: (q, lang) => ccQhChip(q, lang) },
  { key: "cyberware", label: (c) => c.cyberware, en: true, list: () => CYBERWARE, name: (x, lang) => x.name[lang], chip: (x, lang) => ccCwChip(x, lang) },
  { key: "languages", label: (c) => c.languages, list: () => LANGUAGES, name: (l, lang) => l.name[lang], chip: (l, lang) => ccLangChip(l, lang) },
  { key: "items", label: (c) => c.gear, list: () => ITEMS, name: (it, lang) => `${it.name[lang]} (${itemKind(it, lang)})`, chip: (it, lang) => ccKitChip("item", it, lang) },
];

const npcBlank = () => ({
  name: "", kind: "dusman", group: "", role: null, level: 1,
  stats: Object.fromEntries(PB_ROWS.map((s) => [s.id, 10])),
  hp: null, skills: {}, feats: [], quickhacks: [], cyberware: [], languages: [], items: [], notes: "",
});
const npcStat = (n, id) => (n.stats && n.stats[id]) ?? 10;
const npcHp = (n) => n.hp ?? 10 + 2 * npcStat(n, "BODY");
const npcFind = (pick, id) => pick.list().find((x) => x.id === id);
const npcPicked = (n, pick) => (n[pick.key] || []).map((id) => npcFind(pick, id)).filter(Boolean);
const npcHumanity = (n) => npcStat(n, "EMP") * 10 - npcPicked(n, NPC_PICKS[2]).reduce((sum, c) => sum + c.humanity, 0);
// Üstündeki en güçlü zırhın SP'si
const npcSp = (n, slot) => Math.max(0, ...npcPicked(n, NPC_PICKS[4]).filter((it) => it.armor && it.armor.slot === slot).map((it) => ARMOR_TIERS[it.armor.tier].sp));
const npcSub = (n, lang) => [NPC_KINDS[n.kind] ? NPC_KINDS[n.kind][lang] : "", n.group].filter(Boolean).join(" · ");

function npcSheet(n, lang) {
  const t = NPC_TEXT[lang];
  const c = CC_TEXT[lang];
  const role = CLASSES.find((x) => x.id === n.role);
  const cell = (label, value, cls = "") => `<div class="cc-cell${cls}"><b>${label}</b><span class="${value === "" ? "blank" : ""}">${value === "" ? "&nbsp;" : value}</span></div>`;
  const chipsRow = (label, chips) => (chips ? `<div class="cc-row"><div class="cc-cell wide"><b>${label}</b><div class="cc-chips">${chips}</div></div></div>` : "");
  const stats = PB_ROWS.map((s) => {
    const v = npcStat(n, s.id);
    return `<div class="cc-stat"><b>${s.id}</b><span>${v}</span><small>${fmtMod(statMod(v))}</small></div>`;
  }).join("");
  const skills = Object.entries(n.skills || {})
    .map(([id, v]) => [SKILLS.find((k) => k.id === id), v])
    .filter(([k]) => k)
    .sort(([a], [b]) => a.name.localeCompare(b.name))
    .map(([k, v]) => ccChip("#39ff14", k.name, k.stat, `<b lang="en">${k.name}</b><small>${fmtMod(v)}</small>`))
    .join("");
  const hum = npcHumanity(n);
  return `
    <div class="cc-row cc-row-id">${cell(t.name, ccEsc(n.name))}${cell(c.role, role ? role.name : "")}${cell(c.level, String(n.level || 1))}</div>
    <div class="cc-row cc-row-id2">${cell(t.kind, NPC_KINDS[n.kind] ? NPC_KINDS[n.kind][lang] : "")}${cell(t.group, ccEsc(n.group || ""))}</div>
    <div class="cc-row cc-row-stats">${stats}</div>
    <div class="cc-row cc-row-derived">${cell(c.hp, String(npcHp(n)))}${cell(c.humanity, `${hum} / ${hum}`)}</div>
    <div class="cc-row cc-row-derived">${cell(t.bodySp, String(npcSp(n, "govde")))}${cell(t.headSp, String(npcSp(n, "kask")))}</div>
    ${chipsRow(c.skills, skills)}
    ${NPC_PICKS.map((p) => chipsRow(p.label(c), npcPicked(n, p).map((x) => p.chip(x, lang)).join(""))).join("")}
    ${n.notes ? `<div class="cc-row"><div class="cc-cell wide"><b>${t.notes}</b><span class="npc-notes">${ccEsc(n.notes)}</span></div></div>` : ""}`;
}

// Editör: yeni NPC ya da var olanın kopyası üzerinde çalışır; kaydedilince onSaved(kimlik) çağrılır
function npcEditor(source, lang, onSaved) {
  const t = NPC_TEXT[lang];
  const c = CC_TEXT[lang];
  const n = source ? JSON.parse(JSON.stringify({ ...npcBlank(), ...source })) : npcBlank();
  const box = document.createElement("dialog");
  box.className = "auth-dialog npc-dialog";
  const sorted = (list, name) => [...list].sort((a, b) => name(a, lang).localeCompare(name(b, lang), lang));
  const options = (list, name) => sorted(list, name).map((x) => `<option value="${x.id}">${ccEsc(ccPlain(name(x, lang)))}</option>`).join("");
  const pickRow = (key, label, opts, extra = "") => `
    <div class="npc-pick" data-pick="${key}">
      <b class="npc-label">${label}</b>
      <div class="npc-pick-row"><select aria-label="${ccEsc(ccPlain(label))}">${opts}</select>${extra}<button type="button" class="cc-btn" data-add>${t.addPick}</button></div>
      <div class="cc-chips npc-chips"></div>
    </div>`;
  box.innerHTML = `
    <form class="npc-form" method="dialog" novalidate>
      <h3 class="cc-title">${source ? t.titleEdit : t.titleNew}</h3>
      <div class="npc-fields">
        <label class="npc-field wide"><b class="npc-label">${t.name}</b><input name="name" type="text" maxlength="60" value="${ccEsc(n.name)}" autocomplete="off"></label>
        <label class="npc-field"><b class="npc-label">${t.kind}</b><select name="kind">${Object.entries(NPC_KINDS).map(([k, v]) => `<option value="${k}"${n.kind === k ? " selected" : ""}>${v[lang]}</option>`).join("")}</select></label>
        <label class="npc-field"><b class="npc-label">${t.group}</b><input name="group" type="text" maxlength="40" value="${ccEsc(n.group)}" placeholder="${ccEsc(t.groupHint)}" autocomplete="off"></label>
        <label class="npc-field"><b class="npc-label">${c.role}</b><select name="role"><option value="">${t.noRole}</option>${CLASSES.map((x) => `<option value="${x.id}"${n.role === x.id ? " selected" : ""}>${x.name}</option>`).join("")}</select></label>
        <label class="npc-field"><b class="npc-label">${c.level}</b><input name="level" type="number" min="1" max="12" value="${n.level || 1}"></label>
      </div>
      <b class="npc-label">${t.stats}</b>
      <div class="npc-stats">${PB_ROWS.map((s) => `<label><b>${s.id}</b><input name="stat-${s.id}" type="number" min="1" max="${NPC_MAX_STAT}" value="${npcStat(n, s.id)}"></label>`).join("")}</div>
      <label class="npc-field"><b class="npc-label">${c.hp}</b><input name="hp" type="number" min="1" value="${n.hp ?? ""}" placeholder="${ccEsc(t.hpHint)}"></label>
      ${pickRow("skills", c.skills, options(SKILLS, (k) => k.name), `<input class="npc-value" type="number" min="-5" max="20" value="1" aria-label="${ccEsc(ccPlain(c.skills))}">`)}
      ${NPC_PICKS.map((p) => pickRow(p.key, p.label(c), options(p.list(), p.name))).join("")}
      <label class="npc-field wide"><b class="npc-label">${t.notes}</b><textarea name="notes" rows="4" maxlength="2000">${ccEsc(n.notes)}</textarea></label>
      <p class="cc-finish-msg err npc-msg" role="alert"></p>
      <div class="npc-actions">
        <button type="button" class="cc-btn" data-cancel>${t.cancel}</button>
        <button type="submit" class="cc-btn primary">${t.save}</button>
      </div>
    </form>`;
  document.body.appendChild(box);
  const form = box.querySelector("form");
  const msg = box.querySelector(".npc-msg");
  const closeBox = () => {
    if (box.open) box.close();
    box.remove();
  };

  // Seçilenler kutucuk olur; × ile çıkarılır
  const drawPicks = () => {
    for (const row of box.querySelectorAll(".npc-pick")) {
      const key = row.dataset.pick;
      const pick = NPC_PICKS.find((p) => p.key === key);
      const chips = key === "skills"
        ? Object.entries(n.skills).map(([id, v]) => [id, `${(SKILLS.find((k) => k.id === id) || { name: id }).name} ${fmtMod(v)}`])
        : n[key].map((id) => [id, ccPlain(pick.name(npcFind(pick, id) || { name: { [lang]: id } }, lang))]);
      row.querySelector(".npc-chips").innerHTML = chips.map(([id, label]) => `<button type="button" class="cc-chip npc-chip" data-del="${id}" style="--chip: #39ff14"><b>${ccEsc(label)}</b> ×</button>`).join("");
    }
  };
  drawPicks();

  box.addEventListener("click", (e) => {
    const row = e.target.closest(".npc-pick");
    if (e.target.closest("[data-cancel]")) {
      closeBox();
    } else if (row && e.target.closest("[data-add]")) {
      const id = row.querySelector("select").value;
      const key = row.dataset.pick;
      if (key === "skills") n.skills[id] = Number(row.querySelector(".npc-value").value) || 0;
      else if (!n[key].includes(id)) n[key].push(id);
      drawPicks();
    } else if (row && e.target.closest("[data-del]")) {
      const id = e.target.closest("[data-del]").dataset.del;
      const key = row.dataset.pick;
      if (key === "skills") delete n.skills[id];
      else n[key] = n[key].filter((x) => x !== id);
      drawPicks();
    }
  });

  const num = (v, lo, hi, d) => (v === "" || !Number.isFinite(Number(v)) ? d : Math.max(lo, Math.min(hi, Math.round(Number(v)))));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = form.elements;
    const name = f.name.value.trim();
    if (!name) {
      msg.textContent = t.nameNeeded;
      f.name.focus();
      return;
    }
    const data = {
      ...n,
      name,
      kind: f.kind.value,
      group: f.group.value.trim(),
      role: f.role.value || null,
      level: num(f.level.value, 1, 12, 1),
      stats: Object.fromEntries(PB_ROWS.map((s) => [s.id, num(f[`stat-${s.id}`].value, 1, NPC_MAX_STAT, 10)])),
      hp: num(f.hp.value, 1, 9999, null),
      notes: f.notes.value.trim(),
    };
    delete data.id;
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    try {
      const id = await window.CG_STORE.saveNpc(source ? source.id : null, data);
      closeBox();
      onSaved(id);
    } catch (err) {
      msg.textContent = window.CG_STORE.errorText(err);
    } finally {
      btn.disabled = false;
    }
  });
  box.addEventListener("close", closeBox);
  box.showModal();
  form.elements.name.focus();
}

function mountNpcBook(el, lang) {
  const t = NPC_TEXT[lang];
  const admin = !!(window.CG_ROLE && window.CG_ROLE.admin);
  let list = null;
  let selId = null;
  let query = "";
  let kind = null;
  el.innerHTML = `
    ${admin ? `<div class="npc-top"><button type="button" class="cc-btn primary" data-npc-new>${t.add}</button></div>` : ""}
    <div class="npc-book">
      <div class="npc-left">
        <input type="search" class="fl-search npc-search" placeholder="${t.search}" aria-label="${t.search}">
        <div class="npc-kinds">${[[null, t.all], ...Object.entries(NPC_KINDS).map(([k, v]) => [k, v[lang]])].map(([k, label]) => `<button type="button" class="shop-chip${k ? "" : " on"}" data-kind="${k || ""}">${label}</button>`).join("")}</div>
        <ul class="npc-list"><li class="npc-empty">${t.loading}</li></ul>
      </div>
      <div class="npc-right"><p class="npc-empty">${t.pick}</p></div>
    </div>`;
  const listEl = el.querySelector(".npc-list");
  const right = el.querySelector(".npc-right");
  const norm = (s) => s.toLocaleLowerCase(lang === "tr" ? "tr" : "en");

  const drawList = () => {
    if (!list) return;
    const rows = list
      .filter((n) => (!kind || n.kind === kind) && (!query || norm(`${n.name} ${n.group || ""}`).includes(query)))
      .sort((a, b) => a.name.localeCompare(b.name, lang));
    listEl.innerHTML = rows.length
      ? rows.map((n) => `<li><button type="button" class="npc-row${n.id === selId ? " on" : ""}" data-id="${n.id}" aria-pressed="${n.id === selId}"><b>${ccEsc(n.name)}</b><small>${ccEsc(npcSub(n, lang))}</small><span>HP ${npcHp(n)}</span></button></li>`).join("")
      : `<li class="npc-empty">${list.length ? t.none : t.empty}</li>`;
  };
  const drawSheet = () => {
    const n = list && list.find((x) => x.id === selId);
    right.innerHTML = n
      ? `${admin ? `<div class="npc-tools"><button type="button" class="cc-btn" data-npc-edit>${t.edit}</button><button type="button" class="cc-btn danger" data-npc-del>${t.del}</button></div>` : ""}
         <div class="npc-sheet cc-sheet-body">${npcSheet(n, lang)}</div>`
      : `<p class="npc-empty">${t.pick}</p>`;
  };
  const load = async (id) => {
    try {
      list = await window.CG_STORE.listNpcs();
      if (id !== undefined) selId = id;
      drawList();
      drawSheet();
    } catch (err) {
      listEl.innerHTML = `<li class="npc-empty err">${ccEsc(window.CG_STORE.errorText(err))}</li>`;
    }
  };

  el.addEventListener("input", (e) => {
    if (!e.target.matches(".npc-search")) return;
    query = norm(e.target.value.trim());
    drawList();
  });
  el.addEventListener("click", async (e) => {
    const b = (sel) => e.target.closest(sel);
    let x;
    if ((x = b(".npc-row"))) {
      selId = x.dataset.id;
      drawList();
      drawSheet();
      if (getComputedStyle(el.querySelector(".npc-book")).gridTemplateColumns.split(" ").length === 1) right.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if ((x = b("[data-kind]"))) {
      kind = x.dataset.kind || null;
      for (const c of el.querySelectorAll("[data-kind]")) c.classList.toggle("on", c === x);
      drawList();
    } else if (b("[data-npc-new]")) {
      npcEditor(null, lang, load);
    } else if (b("[data-npc-edit]")) {
      npcEditor(list.find((n) => n.id === selId), lang, load);
    } else if (b("[data-npc-del]")) {
      const n = list.find((m) => m.id === selId);
      if (!n || !(await ccConfirm(t.confirmDel(n.name), lang, t.del))) return;
      try {
        await window.CG_STORE.deleteNpc(n.id);
        load(null);
      } catch (err) {
        alert(window.CG_STORE.errorText(err));
      }
    }
  });
  load();
}

TOOLS["npc-book"] = mountNpcBook;
