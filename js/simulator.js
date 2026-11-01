// ---------- Savaş Simülatörü (GM bölümü) ----------
// Sayfa #gm/savas-simulatoru: oyuncu ve NPC kağıtlarından parti ile düşman kurar, savaşı js/simcore.js ile tarayıcıda çalıştırır. AI jetonu harcamaz.
// Kağıtlar okunur, hiçbir şey yazılmaz. Tek seferde en fazla SIM_MAX_RUNS çalıştırma yapılır; aynı kurulumda sonuçlar birikir, kurulum değişince sıfırlanır.
// Kurulum değerleri kağıttan gelir (ccWith, npcFill). Feat ve krom toggle'ı kapalıysa karakter o seçimler olmadan hesaplanır.

const SIM_MAX_PARTY = 4;
const SIM_MAX_RUNS = 10;
const SIM_MAX_FOES = 20;
const SIM_BOUNCE_MAX = 10;
const SIM_COVER_KINDS = [
  { id: "cok-zayif", tr: "Çok zayıf: ahşap masa, alçıpan", en: "Very weak: wooden table, drywall" },
  { id: "zayif", tr: "Zayıf: ahşap kapı, ince metal levha", en: "Weak: wooden door, thin sheet metal" },
  { id: "orta", tr: "Orta: kurşun geçirmez cam, tuğla duvar", en: "Medium: bulletproof glass, brick wall" },
  { id: "saglam", tr: "Sağlam: kalın ahşap, çöp konteyneri", en: "Sturdy: thick wood, dumpster" },
  { id: "cok-saglam", tr: "Çok sağlam: beton duvar, beton bariyer", en: "Very sturdy: concrete wall, barrier" },
  { id: "guclendirilmis", tr: "Güçlendirilmiş: çelik kapı, kasa duvarı", en: "Reinforced: steel door, vault wall" },
];
// Motorun gerçekten işlediği feat ve kromlar; kalanların savaşla ilgili olanları sonuçta listelenir
const SIM_DONE = new Set(["tough", "pain-tolerance", "die-hard", "cover-expert", "lucky", "runner", "professional", "spot-weakness", "second-wind", "killer-instinct", "adrenaline-rush", "overkill", "follow-through", "field-medic", "improvised-kit", "precise-dose", "quick-fix", "nomw", "side-by-side", "ride-or-die", "firewall", "expanded-ram", "blood-pump-mk1", "blood-pump-mk2", "biomonitor-mk1", "biomonitor-mk2", "medscanner", "kerenzikov", "pain-editor", "subdermal-armor", "skin-weave", "titanium-skin", "bone-lace", "blood-recycler", "second-heart", "sandevistan", "sandevistan-mk2", "deck-bridge", "self-ice-mk1", "self-ice-mk2", "self-ice-mk3"]);
const SIM_COMBAT_WORDS = /saldırı|hasar|savaş|HP|Reaction|Evasion|inisiyatif|aksiyon|ROF|zırh/i;

const SIM_TEXT = {
  tr: {
    loading: "Yükleniyor…", party: "Parti", foes: "Düşmanlar", addChar: "Karakter seç…", addFoe: "NPC seç…", add: "Ekle", remove: "Çıkar", mine: "Karakterlerim", ready: "Hazır Karakterler",
    emptyParty: "Partiye en az bir karakter ekle.", emptyFoes: "En az bir NPC ekle.", aggr: "Agresiflik", aggrHint: "Kendi turunda düşmanlara zarar vermeye odaklanma.", err: "Hata Payı", errHint: "İyileşmesi gerekirken saldırmayı seçme gibi hatalar.", fed: "Fedakârlık", fedHint: "Takımı için kendini tehlikeye atma.",
    teamAi: "Düşman Takımı", reckless: "Pervasızlık", recklessHint: "Düşmanların yerdeki karakterlere ateş etme ihtimali. Bütün düşmanlar için ortaktır.",
    rules: "Savaş Ayarları", start: "Başlangıç mesafesi (kare)", cover: "Siperleri hesaba kat", coverRate: "Siper bulma şansı (%)", partial: "Kısmi siper", full: "Tam siper", mats: "Siper malzemeleri", items: "İyileştirme eşyaları kullanılsın", bounce: "Savaş başı Bounce Back", feats: "Feat etkileri", chrome: "Krom etkileri",
    runs: "Çalıştırma sayısı", run: "Çalıştır", reset: "Sonuçları Sıfırla", results: "Sonuçlar", done: (n) => `${n} savaş`, swing: (n) => `Kazanma oranı yaklaşık ±${n} puan oynayabilir. Çalıştır'a yeniden basarak sonuçları biriktirebilirsin.`,
    won: "Parti kazandı", lost: "Parti kaybetti", none: "Sonuçsuz", avgRounds: "Ortalama tur", toFoes: "Tur başına düşman HP'sine vuran hasar", toParty: "Tur başına oyuncu HP'sine vuran hasar", alive: "Hayatta kalan", allAlive: (n) => `Hepsi (${n} kişi)`, nobody: "Kimse", some: (n) => `${n} kişi`,
    name: "Karakter", dealt: "Tur başına verdiği", taken: "Tur başına aldığı", died: "Ölüm oranı", skipped: "Hesaba katılmayanlar", skippedHint: "Bu özellikler sonucu değiştirebilir.", noSkip: "Seçilen kağıtlarda hesaba katılmayan özellik yok.", login: "Karakter listesi için giriş yap.",
  },
  en: {
    loading: "Loading…", party: "Party", foes: "Enemies", addChar: "Pick a character…", addFoe: "Pick an NPC…", add: "Add", remove: "Remove", mine: "My Characters", ready: "Pregenerated Characters",
    emptyParty: "Add at least one character to the party.", emptyFoes: "Add at least one NPC.", aggr: "Aggression", aggrHint: "Focus on hurting enemies on their turn.", err: "Error Margin", errHint: "Mistakes like attacking when they should heal.", fed: "Self-Sacrifice", fedHint: "Putting themselves at risk for the team.",
    teamAi: "Enemy Team", reckless: "Recklessness", recklessHint: "The chance enemies shoot at downed characters. Shared by all enemies.",
    rules: "Battle Settings", start: "Starting distance (squares)", cover: "Include cover", coverRate: "Chance to find cover (%)", partial: "Partial cover", full: "Full cover", mats: "Cover materials", items: "Use healing items", bounce: "Bounce Back at start", feats: "Feat effects", chrome: "Chrome effects",
    runs: "Number of runs", run: "Run", reset: "Reset Results", results: "Results", done: (n) => `${n} battles`, swing: (n) => `The win rate can swing by about ±${n} points. Press Run again to add more battles to these results.`,
    won: "Party won", lost: "Party lost", none: "No result", avgRounds: "Average rounds", toFoes: "Damage to enemy HP per round", toParty: "Damage to player HP per round", alive: "Survivors", allAlive: (n) => `Everyone (${n})`, nobody: "Nobody", some: (n) => `${n}`,
    name: "Character", dealt: "Dealt per round", taken: "Taken per round", died: "Death rate", skipped: "Not included", skippedHint: "These features may change the result.", noSkip: "The chosen sheets have no features left out.", login: "Log in to see your characters.",
  },
};

// "3d6+2" → { n: 3, k: 2 }
function simParseDamage(text) {
  const m = /(\d+)d6(?:\s*\+\s*(\d+))?/.exec(text || "");
  return m ? { n: Number(m[1]), k: Number(m[2] || 0) } : { n: 1, k: 0 };
}
const SIM_IDEAL = { yakin: 0, orta: 1, uzak: 2 };
const simSkill = (id) => ccSkillTotal(SKILLS.find((k) => k.id === id));
const simPunchDice = (body) => (body >= 18 ? 4 : body >= 14 ? 3 : body >= 10 ? 2 : 1);

function simCharFighter(entry, s) {
  const raw = ccNormalize({ data: entry.char.data }).data;
  const data = { ...raw, feat: s.feats ? raw.feat : { ...raw.feat, picks: [] }, cyberware: s.chrome ? raw.cyberware : { ...raw.cyberware, picks: [] } };
  return ccWith(data, () => {
    const d = cc.data;
    const tags = new Set([...d.feat.picks, ...d.cyberware.picks]);
    const items = ccInventory(d).items;
    const count = (id) => items.filter((e) => e.id === id).reduce((n, e) => n + (e.qty || 1), 0);
    const weapons = items.map(ccInvItem).filter((x) => x && x.weapon).map((x) => {
      const melee = !x.weapon.range;
      return { name: x.name.tr, skill: x.weapon.skill, bonus: ccSkillTotal(SKILLS.find((k) => k.name === x.weapon.skill)), ...simParseDamage(x.weapon.damage), rof: x.weapon.rof, mag: x.weapon.mag || 0, auto: x.weapon.auto || 0, ideal: SIM_IDEAL[x.weapon.range] || 0, melee };
    });
    const body = ccStatOf(d, "BODY");
    weapons.push({ name: "Yumruk", skill: "Brawling", bonus: simSkill("brawling"), n: simPunchDice(body), k: 0, rof: 2, melee: true });
    const sp = ccSpOf(data);
    const fixed = (tags.has("subdermal-armor") ? 1 : 0) + (tags.has("skin-weave") ? 2 : 0) + (tags.has("titanium-skin") ? 3 : 0);
    const deck = ccDeckOf(d);
    const hacks = d.sinif === "netrunner" || deck ? (d.quickhack.picks || []).filter((id) => SIM_HACKS[id]).map((id) => ({ ...SIM_HACKS[id], ram: QUICKHACKS.find((q) => q.id === id).ram })) : [];
    const ram = deck ? deck.ram + (tags.has("expanded-ram") ? 2 : 0) : 0;
    const v = ccVitals(d);
    return {
      name: entry.char.name, side: "party", hp: v.hp + (tags.has("bone-lace") ? 8 : 0), sp: sp.body - fixed, spFixed: fixed, body: statMod(body), evasion: simSkill("evasion"), medicine: simSkill("medicine"), netrun: simSkill("netrunning") + (tags.has("deck-bridge") ? 2 : 0), qhDv: ccQhDefense(), ram, ramMax: ram,
      init: simSum(ccInitParts(data)), mastery: ccMasteryMod(), move: 6 + (tags.has("runner") ? 2 : 0), luck: v.luck, weapons, spare: count("yedek-sarjor"), medkit: count("medkit") > 0, bounce: s.items ? entry.bounce : 0, maxdoc: s.items ? count("maxdoc") : 0, hacks, tags, ai: { ...entry.ai },
    };
  });
}

function simNpcFighter(raw, s) {
  const n = npcFill(raw);
  const total = (id) => npcSkillTotal(n, SKILLS.find((k) => k.id === id));
  const weapons = n.actions.filter((e) => e.attack).map((e) => {
    const a = e.attack;
    return { name: e.name, skill: "Handgun", bonus: a.bonus || 0, ...simParseDamage(a.damage), rof: a.rof || 1, mag: a.mag || 0, auto: a.auto || 0, ideal: SIM_IDEAL[a.range] || 0, melee: a.range === "melee" };
  });
  const body = npcStat(n, "BODY");
  if (!weapons.some((w) => w.melee)) weapons.push({ name: "Yumruk", skill: "Brawling", bonus: total("brawling"), n: simPunchDice(body), k: 0, rof: 2, melee: true });
  const hacks = n.netrunning ? (n.quickhacks || []).filter((id) => SIM_HACKS[id]).map((id) => ({ ...SIM_HACKS[id], ram: QUICKHACKS.find((q) => q.id === id).ram })) : [];
  return {
    name: n.name, side: "foe", hp: n.hp || 10 + 2 * body, sp: n.spBody || 0, spFixed: 0, body: statMod(body), evasion: total("evasion"), medicine: total("medicine"), netrun: n.netrunning ? total("netrunning") : 0, qhDv: npcQhDefense(n), ram: n.ram || 0, ramMax: n.ram || 0,
    init: simSum(npcInitParts(n)), mastery: 1, move: 6, luck: 0, weapons, spare: 2, medkit: false, bounce: 0, maxdoc: 0, hacks, tags: new Set(s.chrome ? n.cyberware || [] : []), ai: { ...s.foeAi },
  };
}

// Sonucu değiştirebilecek ama motorun işlemediği özellikler
function simLeftovers(party, foes, s, lang) {
  const out = new Set();
  party.forEach((entry) => {
    const d = ccNormalize({ data: entry.char.data }).data;
    const note = (list, pick) => list.forEach((id) => {
      const x = pick(id);
      if (x && !SIM_DONE.has(id) && SIM_COMBAT_WORDS.test(x.desc.tr)) out.add(typeof x.name === "string" ? x.name : x.name[lang]);
    });
    if (s.feats) note(d.feat.picks, (id) => FEATS.find((f) => f.id === id));
    if (s.chrome) note(d.cyberware.picks, (id) => CYBERWARE.find((c) => c.id === id));
    (d.quickhack.picks || []).filter((id) => !SIM_HACKS[id]).forEach((id) => out.add((QUICKHACKS.find((q) => q.id === id) || { name: id }).name));
    const role = CLASSES.find((c) => c.id === d.sinif);
    const spec = role && role.specs.find((x) => x.id === (d.spec || {}).id);
    if (spec) out.add(`${spec.name[lang]} (specialization)`);
    (d.spec.melodies || []).forEach((m) => out.add(m));
  });
  foes.forEach((e) => {
    const n = npcFill(e.npc);
    [...(n.passives || []), ...(n.bonus || []), ...(n.reactions || [])].forEach((p) => out.add(`${n.name}: ${p.name}`));
    (n.quickhacks || []).filter((id) => !SIM_HACKS[id]).forEach((id) => out.add(`${n.name}: ${(QUICKHACKS.find((q) => q.id === id) || { name: id }).name}`));
  });
  return [...out];
}

function mountBattleSim(el, lang) {
  const t = SIM_TEXT[lang];
  const role = window.CG_ROLE;
  if (!role || !role.ready) {
    el.innerHTML = `<p class="npc-empty">${t.loading}</p>`;
    return;
  }
  const s = {
    start: 8, cover: false, coverRate: 70, partial: true, full: false, mats: new Set(["cok-saglam"]), items: false, feats: true, chrome: true,
    foeAi: { aggr: 60, err: 5, fed: 30 }, reckless: 20, runs: SIM_MAX_RUNS,
  };
  const party = [];
  const foes = [];
  let chars = [];
  let npcs = [];
  let tally = null;
  let mark = "";

  const newAi = () => ({ aggr: 50, err: 3, fed: 50 });
  const slider = (key, label, value, max, hint) => `<label class="sim-slide" title="${ccEsc(hint || "")}"><span>${label}</span><input type="range" min="0" max="${max}" value="${value}" data-sim="${key}"><b>${value}</b></label>`;
  const toggle = (key, label, on) => `<label class="sim-toggle"><input type="checkbox" data-sim="${key}"${on ? " checked" : ""}><span>${label}</span></label>`;
  const number = (key, label, value, min, max) => `<label class="sim-num"><span>${label}</span><input type="number" min="${min}" max="${max}" value="${value}" data-sim="${key}"></label>`;

  function partyRow(e, i) {
    return `<li class="sim-row"><div class="sim-head"><b>${ccEsc(e.char.name)}</b><button type="button" class="cc-btn" data-sim-drop="party:${i}">${t.remove}</button></div>
      ${slider(`p${i}.aggr`, t.aggr, e.ai.aggr, 100, t.aggrHint)}${slider(`p${i}.err`, t.err, e.ai.err, 10, t.errHint)}${slider(`p${i}.fed`, t.fed, e.ai.fed, 100, t.fedHint)}
      ${s.items ? number(`p${i}.bounce`, t.bounce, e.bounce, 0, SIM_BOUNCE_MAX) : ""}</li>`;
  }
  function foeRow(e, i) {
    return `<li class="sim-row"><div class="sim-head"><b>${ccEsc(e.npc.name)}</b>${number(`f${i}.qty`, "×", e.qty, 1, SIM_MAX_FOES)}<button type="button" class="cc-btn" data-sim-drop="foes:${i}">${t.remove}</button></div></li>`;
  }
  const picker = (id, hint, groups) => `<div class="sim-pick"><select data-sim-pick="${id}"><option value="">${hint}</option>${groups}</select><button type="button" class="cc-btn" data-sim-add="${id}">${t.add}</button></div>`;
  const charOptions = () => [["mine", t.mine], ["ready", t.ready]].map(([k, label]) => {
    const rows = chars.filter((c) => c.from === k);
    return rows.length ? `<optgroup label="${label}">${rows.map((c) => `<option value="${chars.indexOf(c)}">${ccEsc(c.name)}</option>`).join("")}</optgroup>` : "";
  }).join("");

  function draw() {
    el.innerHTML = `<div class="sim">
      <section class="sim-box"><h3>${t.party}</h3>${party.length < SIM_MAX_PARTY ? picker("char", t.addChar, charOptions()) : ""}<ul class="sim-list">${party.map(partyRow).join("")}</ul></section>
      <section class="sim-box"><h3>${t.foes}</h3>${picker("npc", t.addFoe, [...npcs].sort((a, b) => a.name.localeCompare(b.name, lang)).map((n) => `<option value="${n.id}">${ccEsc(n.name)}</option>`).join(""))}<ul class="sim-list">${foes.map(foeRow).join("")}</ul>
        <h4>${t.teamAi}</h4>${slider("foe.aggr", t.aggr, s.foeAi.aggr, 100, t.aggrHint)}${slider("foe.err", t.err, s.foeAi.err, 10, t.errHint)}${slider("foe.fed", t.fed, s.foeAi.fed, 100, t.fedHint)}${slider("reckless", t.reckless, s.reckless, 100, t.recklessHint)}</section>
      <section class="sim-box"><h3>${t.rules}</h3>${number("start", t.start, s.start, 1, 60)}
        ${toggle("feats", t.feats, s.feats)}${toggle("chrome", t.chrome, s.chrome)}${toggle("items", t.items, s.items)}${toggle("cover", t.cover, s.cover)}
        ${s.cover ? `<div class="sim-sub">${toggle("partial", t.partial, s.partial)}${toggle("full", t.full, s.full)}${number("coverRate", t.coverRate, s.coverRate, 0, 100)}<h4>${t.mats}</h4>${SIM_COVER_KINDS.map((k) => toggle(`mat.${k.id}`, `${k[lang]} (${SIM_COVER_HP[k.id]} HP)`, s.mats.has(k.id))).join("")}</div>` : ""}</section>
      <section class="sim-box"><div class="sim-go">${number("runs", t.runs, s.runs, 1, SIM_MAX_RUNS)}<button type="button" class="cc-btn primary" data-sim-run>${t.run}</button>${tally ? `<button type="button" class="cc-btn" data-sim-reset>${t.reset}</button>` : ""}</div><p class="npc-empty err" data-sim-warn hidden></p><div data-sim-out>${tally ? results() : ""}</div></section>
    </div>`;
  }

  function results() {
    const n = tally.runs;
    const pct = (v) => `%${((100 * v) / n).toFixed(1).replace(".", lang === "tr" ? "," : ".")}`;
    const num = (v) => v.toFixed(1).replace(".", lang === "tr" ? "," : ".");
    const size = tally.alive.length - 1;
    const alive = tally.alive.map((v, i) => [i === size ? t.allAlive(size) : i ? t.some(i) : t.nobody, v]).reverse();
    const left = simLeftovers(party, foes, s, lang);
    return `<h3>${t.results} · ${t.done(n)}</h3>
      <table class="rules text sim-table"><tbody>
        <tr><td>${t.won}</td><td>${pct(tally.won)}</td></tr><tr><td>${t.lost}</td><td>${pct(tally.lost)}</td></tr>${tally.none ? `<tr><td>${t.none}</td><td>${pct(tally.none)}</td></tr>` : ""}
        <tr><td>${t.avgRounds}</td><td>${num(tally.rounds / n)}</td></tr><tr><td>${t.toFoes}</td><td>${num(tally.toFoes / tally.rounds)}</td></tr><tr><td>${t.toParty}</td><td>${num(tally.toParty / tally.rounds)}</td></tr>
      </tbody></table>
      <h4>${t.alive}</h4><table class="rules text sim-table"><tbody>${alive.map(([k, v]) => `<tr><td>${k}</td><td>${pct(v)}</td></tr>`).join("")}</tbody></table>
      <table class="rules sim-table"><thead><tr><th>${t.name}</th><th>${t.dealt}</th><th>${t.taken}</th><th>${t.died}</th></tr></thead><tbody>${party.map((e, i) => `<tr><td>${ccEsc(e.char.name)}</td><td>${num(tally.chars[i].dealt / tally.rounds)}</td><td>${num(tally.chars[i].taken / tally.rounds)}</td><td>${pct(tally.chars[i].died)}</td></tr>`).join("")}</tbody></table>
      <p class="sim-note">${t.swing(Math.round(98 / Math.sqrt(n)))}</p>
      <h4>${t.skipped}</h4><p class="sim-note">${left.length ? `${t.skippedHint} ${left.map(ccEsc).join(", ")}.` : t.noSkip}</p>`;
  }

  // Ayar değişince eski sonuçlar yeni kurulumla karışmaz
  const setup = () => JSON.stringify([party.map((e) => [e.char.name, e.ai, e.bounce]), foes.map((e) => [e.npc.id, e.qty]), { ...s, mats: [...s.mats], runs: 0 }]);
  function run() {
    const warn = el.querySelector("[data-sim-warn]");
    const problem = !party.length ? t.emptyParty : !foes.length ? t.emptyFoes : "";
    warn.hidden = !problem;
    warn.textContent = problem;
    if (problem) return;
    const now = setup();
    if (now !== mark) tally = null;
    mark = now;
    const cover = s.cover && s.mats.size && (s.partial || s.full) ? { rate: s.coverRate, partial: s.partial, full: s.full, mats: [...s.mats] } : null;
    const partyDefs = party.map((e) => simCharFighter(e, s));
    const foeDefs = foes.flatMap((e) => Array.from({ length: e.qty }, () => simNpcFighter(e.npc, s)));
    tally = simRun(partyDefs, foeDefs, { start: s.start, reckless: s.reckless, cover }, Math.max(1, Math.min(SIM_MAX_RUNS, s.runs)), tally);
    draw();
  }

  function setValue(key, input) {
    const value = input.type === "checkbox" ? input.checked : Number(input.value);
    if (input.type === "range") input.nextElementSibling.textContent = value;
    const m = /^([pf])(\d+)\.(\w+)$/.exec(key);
    if (m) {
      const row = (m[1] === "p" ? party : foes)[Number(m[2])];
      if (m[3] === "bounce") row.bounce = Math.max(0, Math.min(SIM_BOUNCE_MAX, value));
      else if (m[3] === "qty") row.qty = Math.max(1, Math.min(SIM_MAX_FOES, value));
      else row.ai[m[3]] = value;
    } else if (key.startsWith("foe.")) s.foeAi[key.slice(4)] = value;
    else if (key.startsWith("mat.")) value ? s.mats.add(key.slice(4)) : s.mats.delete(key.slice(4));
    else s[key] = value;
    if (["cover", "items"].includes(key)) draw();
  }

  el.addEventListener("change", (e) => {
    const key = e.target.dataset && e.target.dataset.sim;
    if (key) setValue(key, e.target);
  });
  el.addEventListener("input", (e) => {
    const key = e.target.dataset && e.target.dataset.sim;
    if (key && e.target.type === "range") setValue(key, e.target);
  });
  el.addEventListener("click", (e) => {
    const b = (q) => e.target.closest(q);
    let x;
    if ((x = b("[data-sim-add]"))) {
      const kind = x.dataset.simAdd;
      const value = el.querySelector(`[data-sim-pick="${kind}"]`).value;
      if (!value) return;
      if (kind === "char" && party.length < SIM_MAX_PARTY) {
        const char = chars[Number(value)];
        const bag = ccInventory(ccNormalize({ data: char.data }).data).items.find((i) => i.id === "bounce-back");
        party.push({ char, ai: newAi(), bounce: bag ? bag.qty || 1 : 0 });
      }
      if (kind === "npc") {
        const had = foes.find((f) => f.npc.id === value);
        if (had) had.qty = Math.min(SIM_MAX_FOES, had.qty + 1);
        else foes.push({ npc: npcs.find((n) => n.id === value), qty: 1 });
      }
      draw();
    } else if ((x = b("[data-sim-drop]"))) {
      const [list, i] = x.dataset.simDrop.split(":");
      (list === "party" ? party : foes).splice(Number(i), 1);
      tally = null;
      draw();
    } else if (b("[data-sim-run]")) run();
    else if (b("[data-sim-reset]")) {
      tally = null;
      draw();
    }
  });

  el.innerHTML = `<p class="npc-empty">${t.loading}</p>`;
  (async () => {
    const store = window.CG_STORE;
    const [mine, ready, list] = await Promise.all([store.canSaveChars() ? store.listChars() : [], store.listReadyChars(), store.listNpcs()]);
    chars = [...mine.map((c) => ({ ...c, from: "mine" })), ...ready.map((c) => ({ ...c, from: "ready" }))];
    npcs = list;
    draw();
  })().catch((err) => {
    el.innerHTML = `<p class="npc-empty err">${ccEsc(window.CG_STORE.errorText(err))}</p>`;
  });
}
TOOLS["battle-sim"] = mountBattleSim;
