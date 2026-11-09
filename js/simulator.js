// ---------- Savaş Simülatörü (GM bölümü) ----------
// Sayfa #gm/savas-simulatoru: oyuncu ve NPC kağıtlarından parti ile düşman kurar, savaşı js/simcore.js ile tarayıcıda çalıştırır. AI jetonu harcamaz.
// Kağıtlar okunur, hiçbir şey yazılmaz. Tek seferde en fazla SIM_MAX_RUNS çalıştırma yapılır; aynı kurulumda sonuçlar birikir, kurulum değişince sıfırlanır.
// Kurulum değerleri kağıttan gelir (ccWith, npcFill). Feat, krom ya da specialization toggle'ı kapalıysa karakter o seçimler olmadan hesaplanır.
// Kağıttaki zırhın cezası, kromdan gelen silahlar ve stat artıran krom burada dövüşçüye işlenir; kuralların kendisi js/simcore.js içindedir.

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
// Her feat, krom, specialization özelliği ve quickhack bu iki listeden birindedir. Listede olmayan yeni bir şey sonuçta "Hesaba katılmayanlar"a düşer, sessizce kaybolmaz.
// SIM_DONE: motorun ya da kağıt hesabının işlediği her şey
const SIM_DONE = new Set(["tough", "pain-tolerance", "die-hard", "quick-draw", "cover-expert", "runner", "extra-training", "specialist", "lucky", "iron-stomach", "chrome-tolerance", "light-armor-mastery", "kevlar-armor-mastery", "tactical-armor-mastery", "heavy-armor-mastery", "military-armor-mastery", "free-runner", "brute", "tireless", "iron-mind", "street-fighter", "slippery", "patch-up", "beginner-netrunner", "expanded-ram", "extra-slot", "firewall", "backlash", "double-upload", "overclock", "daisy-chain", "amplifier", "loudspeaker", "hype-man", "stage-presence", "feedback", "double-track", "encore", "riot-starter", "field-medic", "improvised-kit", "precise-dose", "trauma-specialist", "sedative", "quick-fix", "nomw", "painkiller", "adrenaline-shot", "professional", "spot-weakness", "second-wind", "pinning-fire", "run-and-gun", "ammo-discipline", "killer-instinct", "flurry", "adrenaline-rush", "follow-through", "overkill", "seasoned", "make-an-example", "hard-boiled", "backup", "side-by-side", "ride-or-die", "hit-the-dirt",
  "self-ice-mk1", "self-ice-mk2", "self-ice-mk3", "chipware-socket", "biomonitor-mk1", "biomonitor-mk2", "blood-pump-mk1", "blood-pump-mk2", "subdermal-plating", "scratchers", "taser-hand", "stim-gland", "titanium-bones", "subdermal-armor", "medscanner", "kerenzikov", "pain-editor", "standard-wolvers", "standard-monowire", "grounding-plate", "heat-regulator", "skin-weave", "sandevistan", "synaptic-accelerator", "mantis-blades", "gorilla-arms", "kick-pistons", "second-heart", "bone-lace", "optical-camo", "sandevistan-mk2", "berserk", "deck-bridge", "projectile-launch-system", "chain-arm", "linear-frame", "blood-recycler", "titanium-skin", "militech-apogee",
  "toxin-binders", "targeting-optics", "hidden-holster", "grip-enhancers", "big-knucks", "adrenaline-booster", "shock-shell", "sprint-fibers", "coagulator", "reflex-tuner", "neural-coprocessor", "bionic-joints", "evasion-subroutine", "smart-link", "microrotors", "emotion-damper", "tech-coprocessor", "counterstrike-servos", "speed-servos", "ballistic-coprocessor", "emergency-stim", "combat-computer", "reflective-plating", "tactical-uplink", "regenerative-tissue", "cortex-core",
  "Take the Bullet", "Hardened", "Return Fire", "Last Line", "Chosen Foe", "Footwork", "Deflect", "Finisher", "Anchor", "Pull Back", "Hype Train", "Rally", "Standing Ovation", "Ear Splitter", "Black Note", "Dead Air", "Law of the Gun", "Big Iron", "Double Tap", "Dead Eye", "Blowback", "Shadowstep", "Point Blank", "Steady Aim", "Overwatch", "Exhale"]);
// SIM_NO_FIGHT: savaş dışı işler, aracı ya da cihazı gerektirenler; iki taraf da birbirini görerek başladığı savaşta etkisi yoktur
const SIM_NO_FIGHT = new Set(["Sneak Attack", "Hit and Fade", "wheelman", "silver-tongue", "poker-face", "polyglot", "mimic", "tracker", "eavesdropper", "plug-and-play", "field-prep", "script-library", "squad-link", "fast-charge", "fan-base", "soul-music", "surgery", "field-hospital", "crime-scene", "read-the-room", "interrogator", "tail", "gut-feeling", "grease-monkey", "mount-up", "smuggler", "badlands-born", "scavenger", "hotwire", "road-fixer", "scrap-armor",
  "translator-chip", "translator-chip-mk2", "kiroshi-optics-mk1", "kiroshi-optics-mk2", "kiroshi-optics-mk3", "grafted-muscle-mk1", "independent-air-supply", "enhanced-antibodies", "tool-hand", "lynx-paws-mk1", "amplified-hearing", "flare-filter-mk1", "reinforced-tendons", "fortified-ankles", "gecko-pads", "pheromone-emitter", "vocal-stabilizer", "menace-optics", "micro-expression-reader", "neon-dermis", "data-library", "gossip-feed", "drive-interface", "data-probe", "jump-booster",
  "low-light-optics", "sonar-implant", "radio-link", "radio-scanner", "neural-recorder", "fingerprint-mask",
  "Low Footprint", "Backdoor", "Ghost in the Machine", "Drone Breaker", "Grid Control", "Swarm Command", "Back-Alley Install", "Steady Hands", "Full Conversion", "Limit Breaker", "Read the Chrome", "Unplug", "Hunch", "Second Look", "Liar's Tell", "Old Habits", "Drive-By", "Road Warrior",
  "ping", "distract", "turn-on-off", "sonic-shock", "analyze", "remote-activation", "static", "take-control", "blackout", "scrub", "memory-wipe", "false-face", "camera-mode", "stall", "friendly-mode", "override", "puppet"]);
const SIM_CHROME_WEAPONS = { scratchers: { n: 1, rof: 2, light: true }, "standard-wolvers": { n: 2, rof: 2 }, "standard-monowire": { n: 2, rof: 2, reach: 2 }, "mantis-blades": { n: 3, rof: 2 }, "chain-arm": { n: 4, rof: 1 } };
const SIM_GRENADES = { "f-gx-frag": { n: 5 }, "x-22-flashbang": { flash: true }, "char-incendiary": { burn: 3 }, "molodets-biohaz": { cloud: 3 }, "emp-bombasi": { emp: true } };
const SIM_LAUNCHERS = { "bomba-atar": "f-gx-frag", roketatar: "rpg-a-roketi" }; // cephanesi
const SIM_ARMOR_PENALTY = { agir: { evasion: 2, move: 1 }, askeri: { evasion: 4, move: 2 } };

const SIM_STEPS = { start: [1, 60, 1], coverRate: [0, 100, 10], runs: [1, SIM_MAX_RUNS, 1] }; // en az, en çok, adım

const SIM_TEXT = {
  tr: {
    loading: "Yükleniyor…", party: "Parti", foes: "Düşmanlar", mine: "Karakterlerim", ready: "Hazır Karakterler", charSearch: "Karakter ara…", npcSearch: "NPC ara…", noMatch: "Eşleşen sonuç yok.", remove: "Çıkar", partyHint: `En fazla ${SIM_MAX_PARTY} karakter seç. Her karakterin ayarları altta açılır.`, foesHint: "NPC ekle, aynı NPC'den kaç tane olacağını altta seç.",
    emptyParty: "Partiye en az bir karakter ekle.", emptyFoes: "En az bir NPC ekle.", level: (n) => `${n}. seviye`, lower: "Azalt", raise: "Artır",
    aggr: "Agresiflik", aggrHint: "Kendi turunda düşmana zarar vermeye odaklanma", err: "Hata Payı", errHint: "İyileşmesi gerekirken saldırmak gibi hatalar", fed: "Fedakârlık", fedHint: "Takımı için kendini tehlikeye atma",
    teamAi: "Düşman Takımı", teamHint: "Bu ayarlar bütün düşmanlar için ortaktır.", reckless: "Pervasızlık", recklessHint: "Yerdeki karakterlere ateş etme ihtimali",
    rules: "Savaş Ayarları", start: "Başlangıç mesafesi (kare)", cover: "Siperler", coverRate: "Siper bulma şansı (%)", partial: "Kısmi siper", full: "Tam siper", mats: "Siper malzemeleri", items: "İyileştirme eşyaları", bounce: "Savaş başı Bounce Back", feats: "Feat etkileri", chrome: "Krom etkileri", specs: "Specialization etkileri",
    runs: "Çalıştırma sayısı", run: "Çalıştır", reset: "Sonuçları Sıfırla", results: "Sonuçlar", done: (n) => `${n} savaş`, swing: (n) => `Kazanma oranı yaklaşık ±${n} puan oynayabilir. Yeniden çalıştırınca sonuçlar birikir.`,
    won: "Parti kazandı", lost: "Parti kaybetti", none: "Sonuçsuz", avgRounds: "Ortalama tur", toFoes: "Tur başına düşman HP'sine vuran hasar", toParty: "Tur başına oyuncu HP'sine vuran hasar", psycho: "Cyberpsycho olan", alive: "Hayatta kalan", rate: "Oran", allAlive: (n) => `Hepsi (${n} kişi)`, nobody: "Kimse", some: (n) => `${n} kişi`,
    name: "Karakter", dealt: "Verdiği (tur başına)", taken: "Aldığı (tur başına)", died: "Ölüm", skipped: "Hesaba katılmayanlar", noSkip: "Seçilen kağıtlarda hesaba katılmayan özellik yok.",
  },
  en: {
    loading: "Loading…", party: "Party", foes: "Enemies", mine: "My Characters", ready: "Pregenerated Characters", charSearch: "Search characters…", npcSearch: "Search NPCs…", noMatch: "No matches.", remove: "Remove", partyHint: `Pick up to ${SIM_MAX_PARTY} characters. Each character's settings open below.`, foesHint: "Add NPCs, then choose how many of each below.",
    emptyParty: "Add at least one character to the party.", emptyFoes: "Add at least one NPC.", level: (n) => `Level ${n}`, lower: "Lower", raise: "Raise",
    aggr: "Aggression", aggrHint: "Focus on hurting enemies on their turn", err: "Error Margin", errHint: "Mistakes like attacking when they should heal", fed: "Self-Sacrifice", fedHint: "Putting themselves at risk for the team",
    teamAi: "Enemy Team", teamHint: "These settings are shared by all enemies.", reckless: "Recklessness", recklessHint: "The chance of shooting at downed characters",
    rules: "Battle Settings", start: "Starting distance (squares)", cover: "Cover", coverRate: "Chance to find cover (%)", partial: "Partial cover", full: "Full cover", mats: "Cover materials", items: "Healing items", bounce: "Bounce Back at start", feats: "Feat effects", chrome: "Chrome effects", specs: "Specialization effects",
    runs: "Number of runs", run: "Run", reset: "Reset Results", results: "Results", done: (n) => `${n} battles`, swing: (n) => `The win rate can swing by about ±${n} points. Running again adds to these results.`,
    won: "Party won", lost: "Party lost", none: "No result", avgRounds: "Average rounds", toFoes: "Damage to enemy HP per round", toParty: "Damage to player HP per round", psycho: "Turned Cyberpsycho", alive: "Survivors", rate: "Rate", allAlive: (n) => `Everyone (${n})`, nobody: "Nobody", some: (n) => `${n}`,
    name: "Character", dealt: "Dealt per round", taken: "Taken per round", died: "Death", skipped: "Not included", noSkip: "The chosen sheets have no features left out.",
  },
};

// "3d6+2" → { n: 3, k: 2 }
function simParseDamage(text) {
  const m = /(\d+)d6(?:\s*\+\s*(\d+))?/.exec(text || "");
  return m ? { n: Number(m[1]), k: Number(m[2] || 0) } : { n: 1, k: 0 };
}
const SIM_IDEAL = { yakin: 0, orta: 1, uzak: 2 };
const simKnownHacks = (ids) => ids.filter((id) => SIM_HACKS[id]).map((id) => {
  const { ram, tier } = QUICKHACKS.find((q) => q.id === id);
  return { id, ...SIM_HACKS[id], ram, tier };
});
const simPunchDice = (body) => (body >= 18 ? 4 : body >= 14 ? 3 : body >= 10 ? 2 : 1);

const simSpecOf = (d) => {
  const role = CLASSES.find((c) => c.id === d.sinif);
  return role && role.specs.find((x) => x.id === (d.spec || {}).id);
};

function simCharFighter(entry, s) {
  const raw = ccNormalize({ data: entry.char.data }).data;
  const data = { ...raw, feat: s.feats ? raw.feat : { ...raw.feat, picks: [] }, cyberware: s.chrome ? raw.cyberware : { ...raw.cyberware, picks: [] } };
  return ccWith(data, () => {
    const d = cc.data;
    const tags = new Set([...d.feat.picks, ...d.cyberware.picks]);
    const spec = s.specs ? simSpecOf(d) : null;
    if (spec) specFeatAll(spec).forEach(([lv, f]) => lv <= d.seviye && tags.add(f.name));
    const items = ccInventory(d).items;
    const count = (id) => items.filter((e) => e.id === id).reduce((n, e) => n + (e.qty || 1), 0);
    // Kromun stat artışları (CYBERWARE stat alanı) toplanır, her stat en fazla 20; skill'ler artan modifier'la hesaplanır
    const boost = {};
    d.cyberware.picks.forEach((id) => Object.entries((CYBERWARE.find((c) => c.id === id) || {}).stat || {}).forEach(([k, v]) => (boost[k] = (boost[k] || 0) + v)));
    const statNow = (id) => {
      const v = ccStatOf(d, id);
      return v == null || !boost[id] ? v : Math.max(v, Math.min(20, v + boost[id]));
    };
    const statGain = (id) => (ccStatOf(d, id) == null ? 0 : statMod(statNow(id)) - statMod(ccStatOf(d, id)));
    const baseBody = ccStatOf(d, "BODY");
    const body = statNow("BODY");
    const skillOf = (k) => ccSkillTotal(k) + statGain(k.stat);
    const named = (name) => skillOf(SKILLS.find((k) => k.name === name));
    const byId = (id) => skillOf(SKILLS.find((k) => k.id === id));
    const refSkill = (name) => SKILLS.find((k) => k.name === name).stat === "REF";
    const worn = items.map(ccInvItem).filter((x) => x && x.armor);
    const armorBody = worn.find((x) => x.armor.slot === "govde");
    const armorHead = worn.find((x) => x.armor.slot === "kask");
    const tier = armorBody && armorBody.armor.tier;
    const set = armorHead && armorHead.armor.tier === tier ? tier : null;
    const penalty = SIM_ARMOR_PENALTY[tier] || { evasion: 0, move: 0 };
    const moveCut = tier === "agir" && tags.has("heavy-armor-mastery") ? 0 : tier === "askeri" && tags.has("military-armor-mastery") ? 1 : penalty.move;
    const setBonus = (set === "hafif" && tags.has("light-armor-mastery")) || (set === "kevlar" && tags.has("kevlar-armor-mastery")) || (set === "taktik" && tags.has("tactical-armor-mastery")) ? 1 : 0;
    const weapons = items.map(ccInvItem).filter((x) => x && x.weapon).map((x) => {
      const ammo = SIM_LAUNCHERS[x.kind];
      return { name: x.name.tr, skill: x.weapon.skill, bonus: named(x.weapon.skill), ...simParseDamage(x.weapon.damage), rof: x.weapon.rof, mag: x.weapon.mag || 0, auto: x.weapon.auto || 0, ideal: SIM_IDEAL[x.weapon.range] || 0, melee: !x.weapon.range, light: x.kind === "hafif-yakin", two: (x.tags || []).includes("iki-el"), ref: refSkill(x.weapon.skill), ...(ammo ? { blast: true, spare: count(ammo) } : {}) };
    });
    d.cyberware.picks.forEach((id) => {
      const blade = SIM_CHROME_WEAPONS[id];
      if (blade) weapons.push({ name: CYBERWARE.find((c) => c.id === id).name.tr, skill: "Melee Weapons", bonus: named("Melee Weapons"), k: 0, melee: true, ...blade });
    });
    weapons.push({ name: "Yumruk", skill: "Brawling", bonus: byId("brawling"), n: Math.min(4, simPunchDice(body) + (tags.has("gorilla-arms") ? 2 : 0) + (tags.has("big-knucks") ? 1 : 0)), k: 0, rof: 2, melee: true, light: true, free: true });
    if (tags.has("kick-pistons")) weapons.push({ name: "Tekme", skill: "Brawling", bonus: byId("brawling"), n: 3, k: 0, rof: 1, melee: true, kick: 2 });
    if (tags.has("projectile-launch-system")) weapons.push({ name: "Mermi Fırlatma Sistemi", skill: "Heavy Weapons", bonus: named("Heavy Weapons"), n: 4, k: 0, rof: 1, mag: 2, ideal: 1, blast: true, radius: 1, spare: 0, ref: true });
    const grenades = Object.entries(SIM_GRENADES).filter(([id]) => count(id)).map(([id, g]) => ({ skill: "Athletics", bonus: named("Athletics"), n: 0, k: 0, ideal: 0, blast: true, ...g, qty: count(id) }));
    const sp = ccSpOf(data);
    const skin = Object.fromEntries(Object.entries({ "subdermal-armor": 1, "skin-weave": 2, "titanium-skin": 3 }).filter(([id]) => tags.has(id)));
    const headSkin = tags.has("titanium-skin") ? 3 : 0;
    const deck = ccDeckOf(d);
    const known = d.sinif === "netrunner" || (tags.has("beginner-netrunner") && deck) ? simKnownHacks(d.quickhack.picks || []) : [];
    const hacks = known.sort((x, y) => y.ram - x.ram).slice(0, (deck ? deck.ready : 0) + (tags.has("extra-slot") ? 1 : 0));
    const ram = deck ? deck.ram + (tags.has("expanded-ram") ? 2 : 0) : 0;
    const v = ccVitals(d);
    const chromeLoss = d.cyberware.picks.reduce((n, id) => n + ((CYBERWARE.find((c) => c.id === id) || {}).humanity || 0), 0) * ccLossMult(d);
    const humanity = v.humanity + (tags.has("chrome-tolerance") ? Math.min(chromeLoss, Math.ceil((ccMasteryMod() * d.seviye) / 2)) : 0);
    const netrun = byId("netrunning");
    const netBase = ccSkillTotal(SKILLS.find((k) => k.id === "netrunning"));
    const ref = statNow("REF");
    return {
      name: entry.char.name, side: "party", hp: v.hp + 2 * (body - baseBody) + (tags.has("bone-lace") ? 8 : 0), sp: sp.body - simSum(Object.values(skin)), spHead: sp.head - headSkin, skin, headSkin, body: statMod(body), evasion: byId("evasion") - penalty.evasion + setBonus, medicine: byId("medicine"), netrun: netrun + (tags.has("deck-bridge") ? 2 : 0), qhDv: ccQhDefense() - Math.ceil(netBase / 2) + Math.ceil(netrun / 2), qhBase: 8 + Math.ceil(netrun / 2), ram, ramMax: ram, hackAction: d.sinif !== "netrunner",
      grit: byId("mental-resist"), toxin: byId("resist-toxin"), toxinDie: (ccOriginOf(d).rollBonus || {}).skill === "resist-toxin" ? ccOriginOf(d).rollBonus : null, perf: byId("performance"), intim: byId("intimidation"), humanity, implants: d.cyberware.picks.length, chrome: [...d.cyberware.picks], songs: spec ? (d.spec.melodies || []).filter((m) => SIM_SONGS[m]) : [], inspire: d.sinif === "rockerboy", refUp: statMod(Math.min(20, ref + 2)) - statMod(ref) + 1, pierceCut: tier === "agir" && tags.has("heavy-armor-mastery") ? 1 : 0,
      init: simSum(ccInitParts(data)) + statGain("REF"), mastery: ccMasteryMod(), move: 6 + (tags.has("runner") ? 2 : 0) + (set === "hafif" && tags.has("light-armor-mastery") ? 2 : 0) - moveCut, luck: v.luck, vet: 1 + ccMasteryMod() + (tags.has("seasoned") ? 1 : 0), vetDie: tags.has("hard-boiled") ? 6 : 4, weapons, grenades, spare: count("yedek-sarjor"), medkit: count("medkit") > 0, bounce: s.items ? entry.bounce : 0, maxdoc: s.items ? count("maxdoc") : 0, hacks, tags, ai: { ...entry.ai },
    };
  });
}

function simNpcFighter(raw, s) {
  const n = npcFill(raw);
  const total = (id) => npcSkillTotal(n, SKILLS.find((k) => k.id === id));
  const weapons = n.actions.filter((e) => e.attack).map((e) => {
    const a = e.attack;
    const melee = a.range === "melee";
    const dice = simParseDamage(a.damage);
    // NPC kağıdında skill yazmaz: tabancalar Yakın menzilli ve 5d6'nın altındadır, kalanı tüfektir
    return { name: e.name, skill: melee ? "Melee Weapons" : a.range === "yakin" && dice.n < 5 ? "Handgun" : "Shoulder Arms", bonus: a.bonus || 0, ...dice, rof: a.rof || 1, mag: a.mag || 0, auto: a.auto || 0, ideal: SIM_IDEAL[a.range] || 0, melee, light: melee && dice.n === 1 };
  });
  const body = npcStat(n, "BODY");
  const preset = (i) => n.passives.some((p) => Object.values(NPC_PASSIVES[i].name).includes(p.name));
  const chrome = s.chrome ? n.cyberware || [] : [];
  if (!weapons.some((w) => w.melee)) weapons.push({ name: "Yumruk", skill: "Brawling", bonus: total("brawling"), n: Math.min(4, simPunchDice(body) + (chrome.includes("big-knucks") ? 1 : 0)), k: 0, rof: 2, melee: true, light: true, free: true });
  const netrun = n.netrunning ? total("netrunning") : 0;
  return {
    name: n.name, side: "foe", hp: n.hp || 10 + 2 * body, sp: n.spBody || 0, spHead: n.spHead || 0, body: statMod(body), evasion: total("evasion"), medicine: total("medicine"), netrun, qhDv: npcQhDefense(n), qhBase: 8 + Math.ceil(netrun / 2), ram: n.ram || 0, ramMax: n.ram || 0,
    grit: total("mental-resist"), toxin: total("resist-toxin"), perf: total("performance"), intim: total("intimidation"), implants: chrome.length, chrome: [...chrome], noHack: preset(0), noEvade: preset(1),
    init: simSum(npcInitParts(n)), mastery: 1, move: 6, luck: 0, weapons, spare: 2, medkit: false, bounce: 0, maxdoc: 0, hacks: n.netrunning ? simKnownHacks(n.quickhacks || []) : [], tags: new Set(chrome), ai: { ...s.foeAi },
  };
}

// Sonucu değiştirebilecek ama savaşta oynanmayanlar: pusu ve boğuşma isteyenler, kağıttan okunamayan NPC yetenekleri, kuralı yazılmamış dirençler
function simLeftovers(party, foes, s, lang) {
  const out = new Set();
  const left = (id) => !SIM_DONE.has(id) && !SIM_NO_FIGHT.has(id);
  const hackName = (id) => (QUICKHACKS.find((q) => q.id === id) || { name: id }).name;
  party.forEach((entry) => {
    const d = ccNormalize({ data: entry.char.data }).data;
    const note = (list, pick) => list.filter(left).forEach((id) => {
      const x = pick(id);
      if (x) out.add(x.name[lang]);
    });
    if (s.feats) note(d.feat.picks, (id) => FEATS.find((f) => f.id === id));
    if (s.chrome) note(d.cyberware.picks, (id) => CYBERWARE.find((c) => c.id === id));
    (d.quickhack.picks || []).filter((id) => !SIM_HACKS[id] && left(id)).forEach((id) => out.add(hackName(id)));
    const spec = s.specs ? simSpecOf(d) : null;
    if (spec) specFeatAll(spec).forEach(([lv, f]) => lv <= d.seviye && left(f.name) && out.add(f.name));
    ccInventory(d).items.filter((e) => e.id === "m-18-duman").forEach((e) => out.add(ccInvItem(e).name[lang]));
  });
  foes.forEach((e) => {
    const n = npcFill(e.npc);
    const handled = NPC_PASSIVES.flatMap((p) => Object.values(p.name));
    [...n.passives.filter((p) => !handled.includes(p.name)), ...n.actions.filter((a) => !a.attack), ...n.bonus, ...n.reactions].forEach((p) => out.add(`${n.name}: ${p.name}`));
    [...n.resist, ...n.vuln, ...n.immune].forEach((word) => out.add(`${n.name}: ${word}`));
    (n.quickhacks || []).filter((id) => !SIM_HACKS[id] && left(id)).forEach((id) => out.add(`${n.name}: ${hackName(id)}`));
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
    start: 8, cover: false, coverRate: 70, partial: true, full: false, mats: new Set(["cok-saglam"]), items: false, feats: true, chrome: true, specs: true,
    foeAi: { aggr: 60, err: 5, fed: 30 }, reckless: 20, runs: SIM_MAX_RUNS,
  };
  const party = [];
  const foes = [];
  let chars = [];
  let npcs = [];
  let tally = null;
  let mark = "";
  let reveal = ""; // yeni açılan toggle'ın altındakiler kısa bir animasyonla gelir

  const newAi = () => ({ aggr: 50, err: 3, fed: 50 });
  const slider = (key, label, value, max, hint) => `<label class="sim-slide"><span class="sim-label">${label}<small>${hint}</small></span><input class="sim-range" type="range" min="0" max="${max}" value="${value}" data-sim="${key}" aria-label="${ccEsc(label)}"><span class="shop-readout">${value}</span></label>`;
  const chip = (key, label, on) => `<button type="button" class="shop-chip${on ? " on" : ""}" data-sim-chip="${key}" aria-pressed="${on}">${label}</button>`;
  const stepper = (key, value, label) => `<div class="sim-step"><span class="sim-label">${label}</span><div class="pb-stepper" data-sim-step="${key}"><button type="button" class="pb-btn" data-d="-1" aria-label="${t.lower}">−</button><output class="pb-value">${value}</output><button type="button" class="pb-btn" data-d="1" aria-label="${t.raise}">+</button></div></div>`;

  // Arama kutusu: yazdıkça eşleşenler açılır listede görünür, liste en fazla 6 satır yükseklikte kayar
  const finder = (id, hint) => `<div class="fl-filter sim-find" data-sim-find="${id}"><input type="search" class="fl-search" placeholder="${ccEsc(hint)}" aria-label="${ccEsc(hint)}" autocomplete="off"><div class="fl-menu sim-menu"></div></div>`;
  const option = (key, value, name, tag, on, off, color) => `<button type="button" class="fl-opt${on ? " on" : ""}" data-sim-${key}="${value}" aria-pressed="${on}"${off ? " disabled" : ""}${color ? ` style="--opt: ${color}"` : ""}><b>${ccEsc(name)}</b><small>${ccEsc(tag)}</small></button>`;
  function options(id, q) {
    const has = (name) => !q || name.toLocaleLowerCase(lang).includes(q);
    const byName = (x, y) => x.name.localeCompare(y.name, lang);
    if (id === "npc") return [...npcs].filter((n) => has(n.name)).sort(byName).map((n) => option("npc", n.id, n.name, n.cr ? `CR ${n.cr}` : "", foes.some((e) => e.npc === n)));
    return [...chars].filter((c) => has(c.name)).sort((x, y) => (x.from === y.from ? byName(x, y) : x.from === "mine" ? -1 : 1)).map((c) => {
      const on = party.some((e) => e.char === c);
      const d = c.data || {};
      const cls = CLASSES.find((k) => k.id === (c.role || d.sinif));
      return option("char", chars.indexOf(c), c.name, `${cls ? `${cls.name} · ` : ""}${t.level(d.seviye || 1)} · ${c.from === "mine" ? t.mine : t.ready}`, on, !on && party.length >= SIM_MAX_PARTY, cls && CLASS_COLORS[cls.id]);
    });
  }
  function openFinder(box) {
    const q = box.querySelector("input").value.trim().toLocaleLowerCase(lang);
    box.querySelector(".sim-menu").innerHTML = options(box.dataset.simFind, q).join("") || `<p class="shop-hint">${t.noMatch}</p>`;
    box.classList.add("open");
  }
  const drop = (key) => `<button type="button" class="cc-btn danger" data-sim-drop="${key}">${t.remove}</button>`;
  const partyRow = (e, i) => `<div class="shop-cond"><div class="sim-head"><p class="shop-cond-title">${ccEsc(e.char.name)}</p>${drop(`p${i}`)}</div>
    ${slider(`p${i}.aggr`, t.aggr, e.ai.aggr, 100, t.aggrHint)}${slider(`p${i}.err`, t.err, e.ai.err, 10, t.errHint)}${slider(`p${i}.fed`, t.fed, e.ai.fed, 100, t.fedHint)}
    ${s.items ? `<div class="${reveal === "items" ? "sim-in" : ""}">${stepper(`p${i}.bounce`, e.bounce, t.bounce)}</div>` : ""}</div>`;
  const foeRow = (e, i) => `<div class="shop-cond neg"><div class="sim-head">${stepper(`f${i}.qty`, e.qty, ccEsc(e.npc.name))}${drop(`f${i}`)}</div></div>`;

  function draw() {
    el.innerHTML = `<div class="shop sim">
      <div class="shop-block"><b class="shop-h">${t.party}</b><p class="shop-hint">${t.partyHint}</p>${finder("char", t.charSearch)}${party.map(partyRow).join("")}</div>
      <div class="shop-block"><b class="shop-h">${t.foes}</b><p class="shop-hint">${t.foesHint}</p>${finder("npc", t.npcSearch)}${foes.map(foeRow).join("")}
        <div class="shop-cond neg"><p class="shop-cond-title">${t.teamAi}</p><p class="shop-hint">${t.teamHint}</p>${slider("foe.aggr", t.aggr, s.foeAi.aggr, 100, t.aggrHint)}${slider("foe.err", t.err, s.foeAi.err, 10, t.errHint)}${slider("foe.fed", t.fed, s.foeAi.fed, 100, t.fedHint)}${slider("reckless", t.reckless, s.reckless, 100, t.recklessHint)}</div></div>
      <div class="shop-block"><b class="shop-h">${t.rules}</b>${stepper("start", s.start, t.start)}
        <div class="shop-chips sim-chips">${chip("feats", t.feats, s.feats)}${chip("chrome", t.chrome, s.chrome)}${chip("specs", t.specs, s.specs)}${chip("items", t.items, s.items)}${chip("cover", t.cover, s.cover)}</div>
        ${s.cover ? `<div class="shop-cond${reveal === "cover" ? " sim-in" : ""}"><p class="shop-cond-title">${t.cover}</p><div class="shop-chips">${chip("partial", t.partial, s.partial)}${chip("full", t.full, s.full)}</div>${stepper("coverRate", s.coverRate, t.coverRate)}<p class="shop-cond-title sim-gap">${t.mats}</p><div class="shop-chips">${SIM_COVER_KINDS.map((k) => chip(`mat.${k.id}`, `${k[lang]} · ${SIM_COVER_HP[k.id]} HP`, s.mats.has(k.id))).join("")}</div></div>` : ""}</div>
      <div class="shop-block shop-last"><div class="shop-count"><b class="shop-h">${t.runs}</b><div class="pb-stepper" data-sim-step="runs"><button type="button" class="pb-btn" data-d="-1" aria-label="${t.lower}">−</button><output class="pb-value">${s.runs}</output><button type="button" class="pb-btn" data-d="1" aria-label="${t.raise}">+</button></div></div>
        ${tally ? `<button type="button" class="cc-btn danger" data-sim-reset>${t.reset}</button>` : ""}<button type="button" class="shop-go" data-sim-run>${t.run}</button></div>
      <p class="shop-note" data-sim-warn hidden></p><div class="shop-result sim-result">${tally ? results() : ""}</div>
    </div>`;
    reveal = "";
  }

  function results() {
    const n = tally.runs;
    const fix = (v, digits) => v.toFixed(digits).replace(".", lang === "tr" ? "," : ".");
    const pct = (v) => `%${fix((100 * v) / n, 1)}`;
    const size = tally.alive.length - 1;
    const alive = tally.alive.map((v, i) => [i === size ? t.allAlive(size) : i ? t.some(i) : t.nobody, v]).reverse();
    const left = simLeftovers(party, foes, s, lang);
    const rows = (list) => list.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("");
    return `<p class="shop-summary">${t.results} · ${t.done(n)}</p>
      <table class="rules shop-table"><tbody>${rows([[t.won, pct(tally.won)], [t.lost, pct(tally.lost)], ...(tally.none ? [[t.none, pct(tally.none)]] : []), [t.avgRounds, fix(tally.rounds / n, 1)], [t.toFoes, fix(tally.toFoes / tally.rounds, 1)], [t.toParty, fix(tally.toParty / tally.rounds, 1)], ...(tally.psycho ? [[t.psycho, pct(tally.psycho)]] : [])])}</tbody></table>
      <table class="rules shop-table"><thead><tr><th>${t.alive}</th><th>${t.rate}</th></tr></thead><tbody>${rows(alive.map(([k, v]) => [k, pct(v)]))}</tbody></table>
      <table class="rules shop-table"><thead><tr><th>${t.name}</th><th>${t.dealt}</th><th>${t.taken}</th><th>${t.died}</th></tr></thead><tbody>${party.map((e, i) => `<tr><td>${ccEsc(e.char.name)}</td><td>${fix(tally.chars[i].dealt / tally.rounds, 1)}</td><td>${fix(tally.chars[i].taken / tally.rounds, 1)}</td><td>${pct(tally.chars[i].died)}</td></tr>`).join("")}</tbody></table>
      <p class="shop-hint sim-gap">${t.swing(Math.round(98 / Math.sqrt(n)))}</p>
      ${left.length ? `<p class="shop-note">${t.skipped}: ${left.map(ccEsc).join(", ")}.</p>` : `<p class="shop-hint">${t.noSkip}</p>`}`;
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
    tally = simRun(partyDefs, foeDefs, { start: s.start, reckless: s.reckless, cover }, s.runs, tally);
    draw();
  }

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function setValue(key, value) {
    const m = /^([pf])(\d+)\.(\w+)$/.exec(key);
    if (m) {
      const row = (m[1] === "p" ? party : foes)[Number(m[2])];
      if (m[3] === "bounce") row.bounce = value;
      else if (m[3] === "qty") row.qty = value;
      else row.ai[m[3]] = value;
    } else if (key.startsWith("foe.")) s.foeAi[key.slice(4)] = value;
    else s[key] = value;
  }
  function stepValue(key, d) {
    const [lo, hi, step] = key.endsWith(".bounce") ? [0, SIM_BOUNCE_MAX, 1] : key.endsWith(".qty") ? [1, SIM_MAX_FOES, 1] : SIM_STEPS[key];
    const m = /^([pf])(\d+)\.(\w+)$/.exec(key);
    const now = m ? (m[1] === "p" ? party : foes)[Number(m[2])][m[3]] : s[key];
    const next = clamp(now + d * step, lo, hi);
    setValue(key, next);
    return next;
  }
  function pickChar(c) {
    const at = party.findIndex((e) => e.char === c);
    if (at >= 0) party.splice(at, 1);
    else if (party.length < SIM_MAX_PARTY) {
      const bag = ccInventory(ccNormalize({ data: c.data }).data).items.find((i) => i.id === "bounce-back");
      party.push({ char: c, ai: newAi(), bounce: bag ? bag.qty || 1 : 0 });
    }
    tally = null;
    draw();
  }
  function pickNpc(n) {
    const at = foes.findIndex((e) => e.npc === n);
    if (at >= 0) foes.splice(at, 1);
    else foes.push({ npc: n, qty: 1 });
    tally = null;
    draw();
  }

  el.addEventListener("input", (e) => {
    const x = e.target;
    const box = x.closest("[data-sim-find]");
    if (box) openFinder(box);
    else if (x.dataset.sim) {
      setValue(x.dataset.sim, Number(x.value));
      x.nextElementSibling.textContent = x.value;
    }
  });
  function press(target) {
    const b = (q) => target.closest(q);
    let x;
    if ((x = b("[data-sim-char]"))) pickChar(chars[Number(x.dataset.simChar)]);
    else if ((x = b("[data-sim-npc]"))) pickNpc(npcs.find((n) => n.id === x.dataset.simNpc));
    else if ((x = b("[data-sim-chip]"))) {
      const key = x.dataset.simChip;
      if (key.startsWith("mat.")) s.mats.has(key.slice(4)) ? s.mats.delete(key.slice(4)) : s.mats.add(key.slice(4));
      else {
        s[key] = !s[key];
        reveal = s[key] ? key : "";
      }
      draw();
    } else if ((x = b("[data-sim-drop]"))) {
      const key = x.dataset.simDrop;
      (key[0] === "p" ? party : foes).splice(Number(key.slice(1)), 1);
      tally = null;
      draw();
    } else if ((x = b("[data-sim-step] .pb-btn"))) {
      const box = x.closest("[data-sim-step]");
      box.querySelector("output").textContent = stepValue(box.dataset.simStep, Number(x.dataset.d));
    } else if (b("[data-sim-run]")) run();
    else if (b("[data-sim-reset]")) {
      tally = null;
      draw();
    }
  }
  el.addEventListener("click", (e) => press(e.target));
  el.addEventListener("focusin", (e) => {
    if (e.target.matches("[data-sim-find] input")) openFinder(e.target.closest("[data-sim-find]"));
  });
  el.addEventListener("focusout", (e) => {
    const box = e.target.closest("[data-sim-find]");
    if (box && !box.contains(e.relatedTarget)) box.classList.remove("open");
  });
  el.addEventListener("mousedown", (e) => {
    if (e.target.closest(".sim-menu")) e.preventDefault(); // tıklarken kutu odağı kaybedip listeyi kapatmasın
  });
  el.addEventListener("keydown", (e) => {
    const box = e.target.closest("[data-sim-find]");
    if (!box || !e.target.matches("input")) return;
    if (e.key === "Escape") e.target.blur();
    if (e.key === "Enter") {
      e.preventDefault();
      const first = box.querySelector(".fl-opt:not([disabled])");
      if (first) press(first);
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
