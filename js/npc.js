// ---------- Düşmanlar / NPC'ler (GM bölümü) ----------
// Liste sayfası (#gm/dusmanlar-npcler): ekran ortadan ikiye bölünür; solda bütün NPC'ler, sağda seçili NPC'nin kağıdı. GM'ler yalnızca okur.
// NPC Oluştur sayfası (#gm/npc-olustur, düzenlerken #gm/npc-olustur/<kimlik>): yalnızca yöneticiler. Karakter Oluştur gibi adım adım ilerler, üstte canlı NPC kağıdı durur.
// Veri Firestore'da durur (npcs/{id}); okuma ve yazma window.CG_STORE üzerinden yapılır (js/auth.js). Kağıdın kutucukları js/charcreate.js'tendir.
// NPC'lerde sınıf, seviye ve feat yoktur. Skill toplamı bağlı olduğu statın modifier'ı ile elle verilen bonustur.
// NPC: { name, type: NPC_TYPES, alignment: NPC_ALIGNMENTS, group, notes, stats: { INT, … }, hp: elle verilen HP (yoksa BODY'den hesaplanır), skills: { skill kimliği: bonus },
//   resist, vuln, immune: hasar türü adları, passives, actions, bonus, reactions: { name, text } listeleri,
//   netrunning, ram, quickhacks: kimlikler (yalnızca netrunning açıksa), cyberware, items, languages: kimlikler }

const NPC_TEXT = {
  tr: {
    add: "Yeni NPC Ekle", edit: "Düzenle", del: "Sil", search: "NPC ara…", empty: "Henüz NPC yok.", none: "Gösterilecek NPC yok.",
    pick: "Karakter kağıdını görmek için soldan bir NPC seç.", loading: "Yükleniyor…", confirmDel: (n) => `“${n}” silinsin mi?`,
    sheet: "NPC Kağıdı", sheetToggle: "NPC kağıdını aç ya da kapat", steps: "Aşamalar", prev: "Geri", next: "İleri", stage: "Aşama", resetAll: "Sıfırla", confirmReset: "NPC taslağı silinsin mi?", yes: "Sıfırla",
    adminOnly: "NPC oluşturmak yalnızca yöneticilere açıktır.", back: "Listeye Dön",
    name: "Ad", type: "Tip", alignment: "Alignment", group: "Grup", noGroup: "Grup yok", customGroup: "Özel…", customHint: "Grup adı", gangs: "Çeteler", corps: "Şirketler", otherGroups: "Kayıtlı gruplar", notes: "Notlar",
    stats: "Statlar", hp: "Maksimum HP", hpHint: "Boş bırakılırsa BODY'den hesaplanır", humanity: "Humanity", bodySp: "Gövde SP", headSp: "Kafa SP",
    skillBonus: "Skill Bonusları", modifier: "Modifier",
    resist: "Dirençler", vuln: "Zayıflıklar", immune: "Bağışıklıklar", resistHint: "Listeden seç ya da kendin yaz.", customDmg: "Başka bir tür yaz",
    passives: "Pasifler", actions: "Aksiyonlar", bonus: "Bonus Aksiyonlar", reactions: "Reaction'lar", entryName: "Ad", entryText: "Açıklama", addEntry: "Ekle",
    weaponPreset: "Hazır silah", attackBonus: "Saldırı bonusu", addWeapon: "Silahı Ekle", weaponHint: "Silahın saldırı aksiyonu, varsa otomatik ateş ve baskı ateşiyle birlikte eklenir.",
    netrunning: "Netrunning?", netHint: "İşaretlenirse NPC quickhack kullanır.", ram: "Maksimum RAM", quickhacks: "Quickhack'ler",
    gear: "Eşyalar", cyberware: "Cyberware", languages: "Diller", addPick: "Ekle",
    save: "Kaydet", saveNew: "Yeni NPC Olarak Kaydet", confirmSave: (n) => `“${n}” kaydedilsin mi? Mevcut NPC'nin üzerine yazılır.`, confirmNew: (n) => `“${n}” yeni bir NPC olarak kaydedilsin mi? Mevcut NPC olduğu gibi kalır.`, nameNeeded: "Önce NPC'ye bir ad ver.",
    attack: (b, d, r) => `Saldırı ${fmtMod(b)}, ${d} hasar, ROF ${r}`, melee: (b, d, r) => `Yakın dövüş saldırısı ${fmtMod(b)}, ${d} hasar, ROF ${r}.`,
    gun: (mag, range) => `, şarjör ${mag}, ideal mesafe ${range}.`, autoName: "Otomatik Ateş", autoText: (b, n) => `Saldırı ${fmtMod(b)}, 10 mermi harcar, hasar en fazla ×${n}.`,
  },
  en: {
    add: "Add New NPC", edit: "Edit", del: "Delete", search: "Search NPCs…", empty: "No NPCs yet.", none: "No NPCs to show.",
    pick: "Pick an NPC on the left to see their character sheet.", loading: "Loading…", confirmDel: (n) => `Delete “${n}”?`,
    sheet: "NPC Sheet", sheetToggle: "Open or close the NPC sheet", steps: "Stages", prev: "Back", next: "Next", stage: "Stage", resetAll: "Reset", confirmReset: "Delete this NPC draft?", yes: "Reset",
    adminOnly: "Only admins can create NPCs.", back: "Back to List",
    name: "Name", type: "Type", alignment: "Alignment", group: "Group", noGroup: "No group", customGroup: "Custom…", customHint: "Group name", gangs: "Gangs", corps: "Corporations", otherGroups: "Saved groups", notes: "Notes",
    stats: "Stats", hp: "Maximum HP", hpHint: "Left empty, it's worked out from BODY", humanity: "Humanity", bodySp: "Body SP", headSp: "Head SP",
    skillBonus: "Skill Bonuses", modifier: "Modifier",
    resist: "Resistances", vuln: "Vulnerabilities", immune: "Invulnerabilities", resistHint: "Pick from the list or type your own.", customDmg: "Type another kind",
    passives: "Passives", actions: "Actions", bonus: "Bonus Actions", reactions: "Reactions", entryName: "Name", entryText: "Description", addEntry: "Add",
    weaponPreset: "Preset weapon", attackBonus: "Attack bonus", addWeapon: "Add Weapon", weaponHint: "Adds the weapon's attack action, along with autofire and suppressive fire if it has them.",
    netrunning: "Netrunning?", netHint: "If ticked, the NPC uses quickhacks.", ram: "Maximum RAM", quickhacks: "Quickhacks",
    gear: "Gear", cyberware: "Cyberware", languages: "Languages", addPick: "Add",
    save: "Save", saveNew: "Save as New NPC", confirmSave: (n) => `Save “${n}”? This overwrites the existing NPC.`, confirmNew: (n) => `Save “${n}” as a new NPC? The existing NPC stays as it is.`, nameNeeded: "Give the NPC a name first.",
    attack: (b, d, r) => `Attack ${fmtMod(b)}, ${d} damage, ROF ${r}`, melee: (b, d, r) => `Melee attack ${fmtMod(b)}, ${d} damage, ROF ${r}.`,
    gun: (mag, range) => `, magazine ${mag}, ideal range ${range}.`, autoName: "Autofire", autoText: (b, n) => `Attack ${fmtMod(b)}, uses 10 rounds, damage up to ×${n}.`,
  },
};

const NPC_TYPES = { insan: { tr: "İnsan", en: "Human" }, drone: { tr: "Drone", en: "Drone" }, robot: { tr: "Robot", en: "Robot" }, ai: { tr: "AI", en: "AI" }, diger: { tr: "Diğer", en: "Other" } };
const NPC_ALIGNMENTS = {
  lg: { tr: "Kanuni İyi", en: "Lawful Good" }, ng: { tr: "Tarafsız İyi", en: "Neutral Good" }, cg: { tr: "Kaotik İyi", en: "Chaotic Good" },
  ln: { tr: "Kanuni Tarafsız", en: "Lawful Neutral" }, n: { tr: "Tam Tarafsız", en: "True Neutral" }, cn: { tr: "Kaotik Tarafsız", en: "Chaotic Neutral" },
  le: { tr: "Kanuni Kötü", en: "Lawful Evil" }, ne: { tr: "Tarafsız Kötü", en: "Neutral Evil" }, ce: { tr: "Kaotik Kötü", en: "Chaotic Evil" },
};
const NPC_DAMAGE = [
  { tr: "Menzilli", en: "Ranged" }, { tr: "Yakın Dövüş", en: "Melee" }, { tr: "Patlama", en: "Explosive" }, { tr: "Ateş", en: "Fire" },
  { tr: "Elektrik", en: "Electric" }, { tr: "Zehir", en: "Poison" }, { tr: "EMP", en: "EMP" }, { tr: "Quickhack", en: "Quickhack" },
];
const NPC_PASSIVES = [
  { name: { tr: "Hacklenemez", en: "Unhackable" }, text: { tr: "Quickhack'lerden etkilenmez.", en: "Isn't affected by quickhacks." } },
  { name: { tr: "Kaçınamaz", en: "Can't Evade" }, text: { tr: "Yakın dövüş saldırılarından, mermilerden ve patlamalardan kaçınmak için Evasion atamaz.", en: "Can't roll Evasion to avoid melee attacks, bullets or explosions." } },
  { name: { tr: "Termal Görüş", en: "Thermal Vision" }, text: { tr: "Canlıları vücut ısılarından görür: loş ışıkta, karanlıkta, dumanda ve siste canlıları görebilir. Cansız şeyleri bu yolla görmez ve siperin arkasını da göremez.", en: "Sees living things by their body heat: it can see living beings in dim light, darkness, smoke and fog. It doesn't see lifeless objects this way, and it can't see what's behind cover." } },
  { name: { tr: "Gece Görüşü", en: "Night Vision" }, text: { tr: "Loş ışıkta ve karanlıkta normal görür.", en: "Sees normally in dim light and darkness." } },
];
const NPC_MAX_STAT = 30;
// Yeni NPC'nin başlangıç RAM'i ve hazır RAM düğmeleri cyberdeck'lerden gelir
const npcDecks = () => ITEMS.filter((it) => it.deck);

// Seçim listeleri: seçenekler, kağıttaki kutucuk
const NPC_PICKS = [
  { key: "quickhacks", label: (t) => t.quickhacks, list: () => QUICKHACKS, name: (q) => `${q.name} (${QH_ROMAN[q.tier]} · ${q.ram} RAM)`, chip: (q, lang) => ccQhChip(q, lang) },
  { key: "cyberware", label: (t) => t.cyberware, list: () => CYBERWARE, name: (x, lang) => x.name[lang], chip: (x, lang) => ccCwChip(x, lang) },
  { key: "items", label: (t) => t.gear, list: () => ITEMS, name: (it, lang) => `${it.name[lang]} (${itemKind(it, lang)})`, chip: (it, lang) => ccKitChip("item", it, lang) },
  { key: "languages", label: (t) => t.languages, list: () => LANGUAGES, name: (l, lang) => l.name[lang], chip: (l, lang) => ccLangChip(l, lang) },
];
const npcPick = (key) => NPC_PICKS.find((p) => p.key === key);
const NPC_ENTRY_LISTS = ["passives", "actions", "bonus", "reactions"];
const NPC_DMG_LISTS = ["resist", "vuln", "immune"];

const npcBlank = () => ({
  name: "", type: "insan", alignment: "n", group: "", notes: "",
  stats: Object.fromEntries(PB_ROWS.map((s) => [s.id, 10])), hp: null, skills: {},
  resist: [], vuln: [], immune: [], passives: [], actions: [], bonus: [], reactions: [],
  netrunning: false, ram: 4, quickhacks: [], cyberware: [], items: [], languages: [],
});
const npcFill = (n) => ({ ...npcBlank(), ...n, stats: { ...npcBlank().stats, ...(n.stats || {}) } });
const npcStat = (n, id) => n.stats[id] ?? 10;
const npcHp = (n) => n.hp ?? 10 + 2 * npcStat(n, "BODY");
const npcSkillTotal = (n, k) => statMod(npcStat(n, k.stat)) + (n.skills[k.id] || 0);
const npcPicked = (n, key) => (n[key] || []).map((id) => npcPick(key).list().find((x) => x.id === id)).filter(Boolean);
const npcHumanity = (n) => npcStat(n, "EMP") * 10 - npcPicked(n, "cyberware").reduce((sum, c) => sum + c.humanity, 0);
// Üstündeki en güçlü zırhın SP'si
const npcSp = (n, slot) => Math.max(0, ...npcPicked(n, "items").filter((it) => it.armor && it.armor.slot === slot).map((it) => ARMOR_TIERS[it.armor.tier].sp));
const npcLabel = (map, key, lang) => (map[key] ? map[key][lang] : "");
const npcSub = (n, lang) => [npcLabel(NPC_TYPES, n.type, lang), n.group].filter(Boolean).join(" · ");

// Kağıt: liste sayfası ve NPC Oluştur aynı kağıdı kullanır
function npcSheet(raw, lang) {
  const n = npcFill(raw);
  const t = NPC_TEXT[lang];
  const c = CC_TEXT[lang];
  const cell = (label, value, cls = "") => `<div class="cc-cell${cls}"><b>${label}</b><span class="${value === "" ? "blank" : ""}">${value === "" ? "&nbsp;" : value}</span></div>`;
  const wide = (label, inner) => (inner ? `<div class="cc-row"><div class="cc-cell wide"><b>${label}</b>${inner}</div></div>` : "");
  const chips = (label, html) => wide(label, html ? `<div class="cc-chips">${html}</div>` : "");
  const words = (label, list) => wide(label, list.length ? `<span>${list.map(ccEsc).join(" · ")}</span>` : "");
  const entries = (label, list) => wide(label, list.length ? `<dl class="npc-entries">${list.map((e) => `<dt>${ccEsc(e.name)}</dt><dd>${linkTerms(ccEsc(e.text), lang)}</dd>`).join("")}</dl>` : "");
  const stats = PB_ROWS.map((s) => {
    const v = npcStat(n, s.id);
    const linked = SKILLS.filter((k) => k.stat === s.id).map((k) => `${k.name} ${fmtMod(npcSkillTotal(n, k))}`);
    const tip = linked.length ? ` tabindex="0" data-tip="${ccEsc(linked.join("\n"))}" data-tip-title="${s.id}" data-tip-lang="en"` : "";
    return `<div class="cc-stat${linked.length ? " tip-ref npc-stat-tip" : ""}"${tip}><b>${s.id}</b><span>${v}</span><small>${fmtMod(statMod(v))}</small></div>`;
  }).join("");
  const hum = npcHumanity(n);
  return `
    <div class="cc-row npc-name">${cell(t.name, ccEsc(n.name))}</div>
    <div class="cc-row cc-row-id">${cell(t.type, npcLabel(NPC_TYPES, n.type, lang))}${cell(t.alignment, npcLabel(NPC_ALIGNMENTS, n.alignment, lang))}${cell(t.group, ccEsc(n.group))}</div>
    <div class="cc-row cc-row-stats">${stats}</div>
    <div class="cc-row npc-derived">${cell(t.hp, String(npcHp(n)))}${cell(c.humanity, `${hum} / ${hum}`)}${cell(t.bodySp, String(npcSp(n, "govde")))}${cell(t.headSp, String(npcSp(n, "kask")))}</div>
    ${words(t.resist, n.resist)}${words(t.vuln, n.vuln)}${words(t.immune, n.immune)}
    ${entries(t.passives, n.passives)}${entries(t.actions, n.actions)}${entries(t.bonus, n.bonus)}${entries(t.reactions, n.reactions)}
    ${n.netrunning ? `<div class="cc-row">${cell(t.ram, String(n.ram), " wide")}</div>` : ""}
    ${n.netrunning ? chips(t.quickhacks, npcPicked(n, "quickhacks").map((q) => ccQhChip(q, lang)).join("")) : ""}
    ${chips(t.cyberware, npcPicked(n, "cyberware").map((x) => ccCwChip(x, lang)).join(""))}
    ${chips(t.gear, npcPicked(n, "items").map((it) => ccKitChip("item", it, lang)).join(""))}
    ${chips(t.languages, npcPicked(n, "languages").map((l) => ccLangChip(l, lang)).join(""))}
    ${n.notes ? `<div class="cc-row"><div class="cc-cell wide"><b>${t.notes}</b><span class="npc-notes">${ccEsc(n.notes)}</span></div></div>` : ""}`;
}

// ---------- NPC Oluştur ----------
const NPC_DRAFT_KEY = "cg-npc-draft";
const NPC_FRESH = () => ({ id: null, stage: "kimlik", sheetShown: true, data: npcBlank() });
let nb = NPC_FRESH();
let nbViews = [];
let nbGroups = []; // kayıtlı NPC'lerde kullanılan gruplar
let npcJustSaved = null; // kaydedilince liste sayfası bu NPC'yi seçili açar

function nbLoadDraft() {
  try {
    const s = JSON.parse(localStorage.getItem(NPC_DRAFT_KEY));
    if (s && s.data) return { ...NPC_FRESH(), ...s, data: npcFill(s.data) };
  } catch (e) {}
  return NPC_FRESH();
}
// Kayıtlı bir NPC düzenlenirken yarım kalan yeni NPC taslağına dokunulmaz
function nbSave() {
  if (nb.id) return;
  try {
    localStorage.setItem(NPC_DRAFT_KEY, JSON.stringify(nb));
  } catch (e) {}
}
function nbDrop() {
  try {
    localStorage.removeItem(NPC_DRAFT_KEY);
  } catch (e) {}
}
function nbChanged(full) {
  nbSave();
  for (const v of nbViews) v(full);
}
const nbText = (lang) => NPC_TEXT[lang];

// Silah hazır ayarı: saldırı aksiyonu ve varsa otomatik ateş ile baskı ateşi. Reload ve silah çekmek zaten herkesin yapabildiği işlerdir, yazılmaz.
function npcWeaponEntries(it, bonus, lang) {
  const t = nbText(lang);
  const w = it.weapon;
  const name = it.name[lang];
  const note = it.desc ? ` ${it.desc[lang]}` : "";
  if (!w.mag) return [{ name, text: t.melee(bonus, w.damage, w.rof) + note }];
  const suppress = TERMS.find((x) => x.id === "baski-atesi");
  return [
    { name, text: `${t.attack(bonus, w.damage, w.rof)}${t.gun(w.mag, WEAPON_RANGES[w.range][lang])}${note}` },
    ...(w.auto ? [{ name: `${name}: ${t.autoName}`, text: t.autoText(bonus, w.auto) }, { name: `${name}: ${suppress.name[lang]}`, text: suppress.desc[lang] }] : []),
  ];
}

const npcFieldRow = (label, inner, cls = "") => `<label class="cc-field${cls}"><span class="npc-label">${label}</span>${inner}</label>`;
const npcSelect = (key, map, value, lang) => `<select data-f="${key}">${Object.entries(map).map(([k, v]) => `<option value="${k}"${k === value ? " selected" : ""}>${v[lang]}</option>`).join("")}</select>`;

function npcGroupField(lang) {
  const t = nbText(lang);
  const d = nb.data;
  const gangs = LORE_GANGS.map((g) => g.name[lang]);
  const corps = LORE_CORPS.map((g) => g.name[lang]);
  const others = nbGroups.filter((g) => !gangs.includes(g) && !corps.includes(g));
  const known = [...gangs, ...corps, ...others];
  const isCustom = nb.customGroup || (d.group && !known.includes(d.group));
  const opt = (g) => `<option value="${ccEsc(g)}"${!isCustom && d.group === g ? " selected" : ""}>${ccEsc(g)}</option>`;
  const box = (label, list) => (list.length ? `<optgroup label="${label}">${list.map(opt).join("")}</optgroup>` : "");
  return `
    ${npcFieldRow(t.group, `<select data-group><option value="">${t.noGroup}</option>${box(t.gangs, gangs)}${box(t.corps, corps)}${box(t.otherGroups, others)}<option value="__custom"${isCustom ? " selected" : ""}>${t.customGroup}</option></select>`)}
    ${isCustom ? npcFieldRow(t.customHint, `<input type="text" data-f="group" maxlength="40" value="${ccEsc(d.group)}" autocomplete="off">`) : ""}`;
}

function npcStageKimlik(lang) {
  const t = nbText(lang);
  const d = nb.data;
  return `
    <div class="cc-fields">
      ${npcFieldRow(t.name, `<input type="text" data-f="name" maxlength="60" value="${ccEsc(d.name)}" autocomplete="off">`, " wide")}
      ${npcFieldRow(t.type, npcSelect("type", NPC_TYPES, d.type, lang))}
      ${npcFieldRow(t.alignment, npcSelect("alignment", NPC_ALIGNMENTS, d.alignment, lang))}
      ${npcGroupField(lang)}
      ${npcFieldRow(t.notes, `<textarea data-f="notes" rows="3" maxlength="2000">${ccEsc(d.notes)}</textarea>`, " wide")}
    </div>`;
}

function npcStageStatlar(lang) {
  const t = nbText(lang);
  const d = nb.data;
  return `
    <div class="npc-stats">${PB_ROWS.map((s) => `<label><b>${s.id}</b><input type="number" data-stat="${s.id}" min="1" max="${NPC_MAX_STAT}" value="${npcStat(d, s.id)}"></label>`).join("")}</div>
    <div class="cc-fields npc-gap">${npcFieldRow(t.hp, `<input type="number" data-hp min="1" value="${d.hp ?? ""}" placeholder="${ccEsc(t.hpHint)}">`)}</div>
    <h3 class="cc-sub">${t.skillBonus}</h3>
    <div class="npc-pick-row npc-skill-add">
      <select aria-label="${ccEsc(t.skillBonus)}">${SKILLS.map((k) => `<option value="${k.id}">${k.name} (${k.stat})</option>`).join("")}</select>
      <label class="npc-inline">${t.modifier}<input class="npc-value" type="number" min="-20" max="30" value="1"></label>
      <button type="button" class="cc-btn" data-add-skill>${t.addPick}</button>
    </div>
    <ul class="npc-skills">${SKILLS.filter((k) => k.id in d.skills).map((k) => `
      <li data-skill-row="${k.id}">
        <b>${k.name}</b><small>${k.stat} · ${fmtMod(npcSkillTotal(d, k))}</small>
        <div class="npc-stepper"><button type="button" data-skill-step="-1" aria-label="−">−</button><input type="number" data-skill-input value="${d.skills[k.id]}" aria-label="${ccEsc(k.name)}"><button type="button" data-skill-step="1" aria-label="+">+</button></div>
        <button type="button" class="npc-x" data-skill-del aria-label="${t.del}">×</button>
      </li>`).join("")}</ul>`;
}

function npcStageDayanma(lang) {
  const t = nbText(lang);
  const group = (key) => {
    const list = nb.data[key];
    const preset = NPC_DAMAGE.map((x) => x[lang]);
    const all = [...preset, ...list.filter((v) => !preset.includes(v))];
    return `
      <h3 class="cc-sub">${t[key]}</h3>
      <div class="npc-chipset" data-dmg="${key}">
        ${all.map((v) => `<button type="button" class="shop-chip${list.includes(v) ? " on" : ""}" data-dmg-val="${ccEsc(v)}" aria-pressed="${list.includes(v)}">${ccEsc(v)}</button>`).join("")}
      </div>
      <div class="npc-pick-row" data-dmg-add="${key}"><input type="text" maxlength="30" placeholder="${ccEsc(t.customDmg)}" autocomplete="off"><button type="button" class="cc-btn" data-add-dmg>${t.addEntry}</button></div>`;
  };
  return `<p class="cc-hint">${t.resistHint}</p>${NPC_DMG_LISTS.map(group).join("")}`;
}

// Pasif, aksiyon, bonus aksiyon ve reaction listeleri
function npcEntryBlock(key, lang, extra = "") {
  const t = nbText(lang);
  const list = nb.data[key];
  return `
    <h3 class="cc-sub">${t[key]}</h3>
    ${extra}
    <ul class="npc-entrylist">${list.map((e, i) => `<li><div><b>${ccEsc(e.name)}</b><span>${ccEsc(e.text)}</span></div><button type="button" class="npc-x" data-entry-del="${key}" data-i="${i}" aria-label="${t.del}">×</button></li>`).join("")}</ul>
    <div class="npc-pick-row" data-entry-add="${key}">
      <input type="text" class="npc-en" maxlength="50" placeholder="${ccEsc(t.entryName)}" aria-label="${ccEsc(t.entryName)}" autocomplete="off">
      <input type="text" class="npc-et" maxlength="300" placeholder="${ccEsc(t.entryText)}" aria-label="${ccEsc(t.entryText)}" autocomplete="off">
      <button type="button" class="cc-btn" data-add-entry>${t.addEntry}</button>
    </div>`;
}
function npcStageYetenek(lang) {
  const t = nbText(lang);
  const presets = `<div class="npc-chipset">${NPC_PASSIVES.map((p) => {
    const on = nb.data.passives.some((e) => e.name === p.name[lang]);
    return `<button type="button" class="shop-chip${on ? " on" : ""}" data-passive="${ccEsc(p.name[lang])}" aria-pressed="${on}">${p.name[lang]}</button>`;
  }).join("")}</div>`;
  const weapons = ITEMS.filter((it) => it.weapon);
  const weaponRow = `
    <p class="cc-hint">${t.weaponHint}</p>
    <div class="npc-pick-row npc-weapon">
      <select aria-label="${ccEsc(t.weaponPreset)}">${weapons.map((w) => `<option value="${w.id}">${ccEsc(w.name[lang])} (${ccEsc(itemKind(w, lang))})</option>`).join("")}</select>
      <label class="npc-inline">${t.attackBonus}<input class="npc-value" type="number" min="-5" max="30" value="0"></label>
      <button type="button" class="cc-btn" data-add-weapon>${t.addWeapon}</button>
    </div>`;
  return npcEntryBlock("passives", lang, presets) + npcEntryBlock("actions", lang, weaponRow) + npcEntryBlock("bonus", lang) + npcEntryBlock("reactions", lang);
}

function npcPickRow(key, lang) {
  const t = nbText(lang);
  const p = npcPick(key);
  const sorted = [...p.list()].sort((a, b) => ccPlain(p.name(a, lang)).localeCompare(ccPlain(p.name(b, lang)), lang));
  return `
    <div class="npc-pick" data-pick="${key}">
      <h3 class="cc-sub">${p.label(t)}</h3>
      <div class="npc-pick-row"><select aria-label="${ccEsc(ccPlain(p.label(t)))}">${sorted.map((x) => `<option value="${x.id}">${ccEsc(ccPlain(p.name(x, lang)))}</option>`).join("")}</select><button type="button" class="cc-btn" data-add>${t.addPick}</button></div>
      <div class="cc-chips npc-chips">${npcPicked(nb.data, key).map((x) => `<button type="button" class="cc-chip npc-chip" data-del="${x.id}" style="--chip: #39ff14"><b>${ccEsc(ccPlain(p.name(x, lang)))}</b> ×</button>`).join("")}</div>
    </div>`;
}

function npcStageNet(lang) {
  const t = nbText(lang);
  const d = nb.data;
  const decks = npcDecks();
  return `
    <label class="npc-check"><input type="checkbox" data-net${d.netrunning ? " checked" : ""}> <b>${t.netrunning}</b></label>
    <p class="cc-hint">${t.netHint}</p>
    ${d.netrunning ? `
    <h3 class="cc-sub">${t.ram}</h3>
    <div class="npc-chipset">${decks.map((k) => `<button type="button" class="shop-chip${d.ram === k.deck.ram ? " on" : ""}" data-ram="${k.deck.ram}" aria-pressed="${d.ram === k.deck.ram}">${k.deck.ram} RAM · ${ccEsc(k.deck.level[lang])}</button>`).join("")}<input class="npc-value" type="number" min="1" max="30" value="${d.ram}" data-ram-input aria-label="${ccEsc(t.ram)}"></div>
    ${npcPickRow("quickhacks", lang)}` : ""}`;
}

const npcStageDonanim = (lang) => npcPickRow("cyberware", lang) + npcPickRow("items", lang) + npcPickRow("languages", lang);

const NPC_STAGES = [
  { id: "kimlik", label: { tr: "Kimlik", en: "Identity" }, intro: { tr: "NPC'nin adı, tipi, eğilimi ve bağlı olduğu grup.", en: "The NPC's name, type, alignment and group." }, done: (d) => !!d.name.trim(), render: npcStageKimlik },
  { id: "statlar", label: { tr: "Statlar", en: "Stats" }, intro: { tr: "Statlar, HP ve skill bonusları. Hepsi elle girilir, puan sınırı yoktur.", en: "Stats, HP and skill bonuses. All entered by hand, with no point limit." }, done: () => true, render: npcStageStatlar },
  { id: "dayaniklilik", label: { tr: "Direnç ve Zayıflık", en: "Resistances" }, intro: { tr: "NPC'nin hangi hasarlara dayanıklı ya da zayıf olduğu.", en: "What kinds of damage the NPC resists or is weak to." }, done: (d) => NPC_DMG_LISTS.some((k) => d[k].length), render: npcStageDayanma },
  { id: "yetenek", label: { tr: "Pasif ve Aksiyonlar", en: "Passives & Actions" }, intro: { tr: "NPC'nin savaşta neler yapabildiği.", en: "What the NPC can do in combat." }, done: (d) => NPC_ENTRY_LISTS.some((k) => d[k].length), render: npcStageYetenek },
  { id: "netrunning", label: { tr: "Netrunning", en: "Netrunning" }, intro: { tr: "NPC quickhack kullanıyorsa RAM'i ve quickhack'leri burada seçilir.", en: "If the NPC uses quickhacks, its RAM and quickhacks are set here." }, done: (d) => d.netrunning && d.quickhacks.length > 0, render: npcStageNet },
  { id: "donanim", label: { tr: "Donanım", en: "Equipment" }, intro: { tr: "Cyberware, eşyalar ve diller. Zırhlar SP'yi belirler.", en: "Cyberware, gear and languages. Armor sets SP." }, done: (d) => d.cyberware.length + d.items.length + d.languages.length > 0, render: npcStageDonanim },
];
const NPC_REVIEW = {
  id: "gozden-gecir",
  label: { tr: "Gözden Geçir", en: "Review" },
  intro: { tr: "NPC kağıdı hazır. Üstteki kağıdı son bir kez gözden geçirip kaydet.", en: "The NPC sheet is ready. Look over the sheet above one last time and save." },
  // Düzenlerken iki seçenek var: üzerine kaydet ya da yeni NPC olarak kaydet
  render: (lang) => {
    const t = nbText(lang);
    return `<div class="cc-finish">
      ${nb.id ? `<button type="button" class="cc-btn warn" data-npc-save="new">${t.saveNew}</button>` : ""}
      <button type="button" class="cc-btn primary" data-npc-save="${nb.id ? "same" : "new"}">${t.save}</button>
      <p class="cc-finish-msg err" role="alert"></p>
    </div>`;
  },
};
const nbStages = () => [...NPC_STAGES, NPC_REVIEW];
const nbCurrent = () => nbStages().find((s) => s.id === nb.stage) || NPC_STAGES[0];
function nbGo(id) {
  nb.stage = id;
  if (id === NPC_REVIEW.id) nb.sheetShown = true;
  nbChanged(true);
}

function mountNpcSteps(el, lang) {
  const t = nbText(lang);
  const draw = () => {
    const cur = nbCurrent();
    el.innerHTML = `
      <div class="cc-steps">
        <div class="toc-head">${t.steps}</div>
        <ul class="toc-list cc-list">${nbStages().map((s, i) => {
          const review = s === NPC_REVIEW;
          const done = !review && s.done(nb.data);
          return `<li style="--i:${i}"${review ? ' class="cc-review-item"' : ""}><a href="#" data-stage="${s.id}" class="${s.id === cur.id ? "active" : ""}" aria-current="${s.id === cur.id ? "step" : "false"}"><span class="cc-dot${done ? " done" : ""}${review ? " review" : ""}" aria-hidden="true"></span><span class="label">${s.label[lang]}</span></a></li>`;
        }).join("")}</ul>
      </div>`;
  };
  el.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-stage]");
    if (!a) return;
    e.preventDefault();
    nbGo(a.dataset.stage);
  });
  nbViews.push(draw);
  draw();
}

async function mountNpcCreate(el, lang) {
  const t = nbText(lang);
  nbViews = []; // sayfa yeniden açıldı; sol panel bundan sonra eklenir
  if (!(window.CG_ROLE && window.CG_ROLE.admin)) {
    el.innerHTML = `<p class="placeholder">${t.adminOnly}</p><a class="prof-btn" href="#gm/dusmanlar-npcler">${t.back}</a>`;
    return;
  }
  el.innerHTML = `<p class="cc-hint">${t.loading}</p>`;
  const editId = location.hash.split("/")[2] || null;
  try {
    const list = await window.CG_STORE.listNpcs();
    nbGroups = [...new Set(list.map((n) => n.group).filter(Boolean))];
    const found = editId && list.find((n) => n.id === editId);
    if (editId && found) {
      const { id, ...data } = found;
      nb = { id, stage: "kimlik", sheetShown: true, data: npcFill(data) };
    } else {
      nb = nbLoadDraft();
    }
  } catch (err) {
    el.innerHTML = `<p class="placeholder">${ccEsc(window.CG_STORE.errorText(err))}</p><a class="prof-btn" href="#gm/dusmanlar-npcler">${t.back}</a>`;
    return;
  }
  el.innerHTML = `
    <div class="cc">
      <section class="cc-sheet${nb.sheetShown ? "" : " closed"}">
        <button type="button" class="cc-sheet-bar" data-sheet-toggle aria-expanded="${nb.sheetShown}" aria-label="${t.sheetToggle}">
          <span>${t.sheet}</span>
          <svg class="cc-chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        </button>
        <div class="cc-sheet-wrap"><div class="cc-sheet-body"></div></div>
      </section>
      <section class="cc-panel"></section>
      <div class="cc-nav"></div>
    </div>`;
  const sheet = el.querySelector(".cc-sheet");
  const body = el.querySelector(".cc-sheet-body");
  const panel = el.querySelector(".cc-panel");
  const nav = el.querySelector(".cc-nav");
  let shown = null;

  const draw = (full) => {
    body.innerHTML = npcSheet(nb.data, lang);
    if (!full) return;
    sheet.classList.toggle("closed", !nb.sheetShown);
    el.querySelector("[data-sheet-toggle]").setAttribute("aria-expanded", nb.sheetShown);
    const s = nbCurrent();
    const list = nbStages();
    const i = list.indexOf(s);
    panel.innerHTML = `
      <div class="cc-stage${s.id !== shown ? " enter" : ""}" data-stage="${s.id}">
        <div class="cc-stage-head">
          <h2 class="cc-title">${s.label[lang]}</h2>
          <span class="cc-step">${t.stage} ${String(i + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}</span>
        </div>
        <p class="cc-intro">${s.intro[lang]}</p>
        <div class="npc-edit">${s.render(lang)}</div>
      </div>`;
    shown = s.id;
    const prev = list[i - 1];
    const next = list[i + 1];
    nav.innerHTML = `
      <div class="cc-nav-side">
        ${nb.id ? "" : `<button type="button" class="cc-btn danger" data-npc-reset>${t.resetAll}</button>`}
        <a class="cc-btn" href="#gm/dusmanlar-npcler">${t.back}</a>
      </div>
      <div class="cc-nav-side">
        ${prev ? `<button type="button" class="cc-btn" data-go="${prev.id}">‹ ${t.prev}</button>` : ""}
        ${next ? `<button type="button" class="cc-btn primary" data-go="${next.id}">${t.next} ›</button>` : ""}
      </div>`;
  };
  nbViews.push(draw);

  const addEntry = (key, name, text) => {
    if (!name.trim()) return;
    nb.data[key].push({ name: name.trim(), text: text.trim() });
    nbChanged(true);
  };

  el.addEventListener("click", async (e) => {
    const b = (s) => e.target.closest(s);
    let x;
    if (b("[data-sheet-toggle]")) {
      nb.sheetShown = !nb.sheetShown;
      sheet.classList.toggle("closed", !nb.sheetShown);
      b("[data-sheet-toggle]").setAttribute("aria-expanded", nb.sheetShown);
      nbSave();
    } else if ((x = b("[data-go]"))) {
      nbGo(x.dataset.go);
    } else if (b("[data-npc-reset]")) {
      if (!(await ccConfirm(t.confirmReset, lang, t.yes))) return;
      nb = NPC_FRESH();
      nbDrop();
      nbChanged(true);
    } else if ((x = b("[data-dmg-val]"))) {
      const key = x.closest("[data-dmg]").dataset.dmg;
      const v = x.dataset.dmgVal;
      nb.data[key] = nb.data[key].includes(v) ? nb.data[key].filter((k) => k !== v) : [...nb.data[key], v];
      nbChanged(true);
    } else if (b("[data-add-dmg]")) {
      const row = b("[data-dmg-add]");
      const v = row.querySelector("input").value.trim();
      const key = row.dataset.dmgAdd;
      if (v && !nb.data[key].includes(v)) nb.data[key].push(v);
      nbChanged(true);
    } else if ((x = b("[data-passive]"))) {
      const p = NPC_PASSIVES.find((k) => k.name[lang] === x.dataset.passive);
      const list = nb.data.passives;
      const had = list.some((en) => en.name === p.name[lang]);
      nb.data.passives = had ? list.filter((en) => en.name !== p.name[lang]) : [...list, { name: p.name[lang], text: p.text[lang] }];
      nbChanged(true);
    } else if (b("[data-add-entry]")) {
      const row = b("[data-entry-add]");
      addEntry(row.dataset.entryAdd, row.querySelector(".npc-en").value, row.querySelector(".npc-et").value);
    } else if ((x = b("[data-entry-del]"))) {
      nb.data[x.dataset.entryDel].splice(Number(x.dataset.i), 1);
      nbChanged(true);
    } else if (b("[data-add-weapon]")) {
      const row = b(".npc-weapon");
      const it = ITEMS.find((k) => k.id === row.querySelector("select").value);
      nb.data.actions.push(...npcWeaponEntries(it, Number(row.querySelector(".npc-value").value) || 0, lang));
      nbChanged(true);
    } else if (b("[data-add-skill]")) {
      const row = b(".npc-skill-add");
      const id = row.querySelector("select").value;
      nb.data.skills[id] = (nb.data.skills[id] || 0) + (Number(row.querySelector(".npc-value").value) || 0);
      nbChanged(true);
    } else if ((x = b("[data-skill-step]"))) {
      nb.data.skills[b("[data-skill-row]").dataset.skillRow] += Number(x.dataset.skillStep);
      nbChanged(true);
    } else if (b("[data-skill-del]")) {
      delete nb.data.skills[b("[data-skill-row]").dataset.skillRow];
      nbChanged(true);
    } else if ((x = b("[data-ram]"))) {
      nb.data.ram = Number(x.dataset.ram);
      nbChanged(true);
    } else if (b("[data-add]")) {
      const row = b("[data-pick]");
      const key = row.dataset.pick;
      const id = row.querySelector("select").value;
      if (!nb.data[key].includes(id)) nb.data[key].push(id);
      nbChanged(true);
    } else if ((x = b("[data-del]"))) {
      const key = b("[data-pick]").dataset.pick;
      nb.data[key] = nb.data[key].filter((k) => k !== x.dataset.del);
      nbChanged(true);
    } else if ((x = b("[data-npc-save]"))) {
      const msg = el.querySelector(".cc-finish-msg");
      const name = nb.data.name.trim();
      if (!name) {
        msg.textContent = t.nameNeeded;
        return;
      }
      const asNew = x.dataset.npcSave === "new";
      if (nb.id && !(await ccConfirm(asNew ? t.confirmNew(name) : t.confirmSave(name), lang, asNew ? t.saveNew : t.save, asNew ? "warn" : ""))) return;
      x.disabled = true;
      try {
        const data = { ...nb.data, name, quickhacks: nb.data.netrunning ? nb.data.quickhacks : [] };
        const id = await window.CG_STORE.saveNpc(asNew ? null : nb.id, data);
        if (!nb.id) nbDrop();
        nb = NPC_FRESH();
        npcJustSaved = id;
        location.hash = "#gm/dusmanlar-npcler";
      } catch (err) {
        msg.textContent = window.CG_STORE.errorText(err);
        x.disabled = false;
      }
    }
  });
  el.addEventListener("input", (e) => {
    const x = e.target;
    if (x.matches("[data-f]")) {
      nb.data[x.dataset.f] = x.value;
      nbChanged(false);
    } else if (x.matches("[data-stat]")) {
      nb.data.stats[x.dataset.stat] = Math.max(1, Math.min(NPC_MAX_STAT, Number(x.value) || 1));
      nbChanged(false);
    } else if (x.matches("[data-skill-input]")) {
      nb.data.skills[x.closest("[data-skill-row]").dataset.skillRow] = Number(x.value) || 0;
      nbChanged(false);
    } else if (x.matches("[data-hp]")) {
      nb.data.hp = x.value === "" ? null : Math.max(1, Number(x.value) || 1);
      nbChanged(false);
    } else if (x.matches("[data-ram-input]")) {
      nb.data.ram = Math.max(1, Math.min(30, Number(x.value) || 1));
      nbChanged(false);
    }
  });
  el.addEventListener("change", (e) => {
    const x = e.target;
    if (x.matches("[data-group]")) {
      nb.customGroup = x.value === "__custom";
      nb.data.group = nb.customGroup ? "" : x.value;
      nbChanged(true);
    } else if (x.matches("[data-net]")) {
      nb.data.netrunning = x.checked;
      nbChanged(true);
    }
  });
  nbChanged(true);
}

// ---------- Liste sayfası ----------
function mountNpcBook(el, lang) {
  const t = nbText(lang);
  const admin = !!(window.CG_ROLE && window.CG_ROLE.admin);
  let list = null;
  let selId = npcJustSaved;
  npcJustSaved = null;
  let query = "";
  el.innerHTML = `
    ${admin ? `<div class="npc-top"><a class="cc-btn primary" href="#gm/npc-olustur">${t.add}</a></div>` : ""}
    <div class="npc-book">
      <div class="npc-left">
        <input type="search" class="fl-search npc-search" placeholder="${t.search}" aria-label="${t.search}">
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
      .filter((n) => !query || norm(`${n.name} ${n.group || ""}`).includes(query))
      .sort((a, b) => a.name.localeCompare(b.name, lang));
    listEl.innerHTML = rows.length
      ? rows.map((n) => `<li><button type="button" class="npc-row${n.id === selId ? " on" : ""}" data-id="${n.id}" aria-pressed="${n.id === selId}"><b>${ccEsc(n.name)}</b><small>${ccEsc(npcSub(n, lang))}</small><span>HP ${npcHp(npcFill(n))}</span></button></li>`).join("")
      : `<li class="npc-empty">${list.length ? t.none : t.empty}</li>`;
  };
  const drawSheet = () => {
    const n = list && list.find((x) => x.id === selId);
    right.innerHTML = n
      ? `${admin ? `<div class="npc-tools"><a class="cc-btn" href="#gm/npc-olustur/${n.id}">${t.edit}</a><button type="button" class="cc-btn danger" data-npc-del>${t.del}</button></div>` : ""}
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
TOOLS["npc-create"] = mountNpcCreate;
TOOLS["npc-steps"] = mountNpcSteps;
