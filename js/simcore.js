// ---------- Savaş Simülatörü: motor ----------
// Sayfaya ve veritabanına dokunmaz, ağ kullanmaz: js/simulator.js'in hazırladığı dövüşçülerle savaşı zarla oynatır.
// Harita yerine tek bir hat vardır: pos kare cinsinden konumdur, uzaklık iki dövüşçünün farkıdır. lane yan yana duruşu tutar ve yalnızca alan etkilerinde sayılır.
// Dövüşçü: { name, side: "party" | "foe", hp, sp, spHead, skin: { krom: SP }, headSkin, body, evasion, medicine, netrun, grit, toxin, perf, intim, qhDv, qhBase, ram, init, mastery, move, luck, humanity, implants, chrome: [krom],
//   weapons: [{ name, skill, bonus, n, k, rof, mag, auto, ideal: 0–2, melee, light, two, reach, ref, free, kick, blast, radius, spare, flash, burn, cloud, emp }], grenades: [patlayıcı + qty], spare, medkit, bounce, maxdoc,
//   hacks: [SIM_HACKS + ram, tier, id], hackAction, songs: [SIM_SONGS adı], inspire, refUp, pierceCut, noHack, noEvade, vet, vetDie, tags: Set, ai: { aggr, err, fed } }
//   tags: feat ve krom kimlikleri, specialization özelliklerinin adları
// Seçenekler: { start, reckless, items, cover: null | { rate, partial, full, mats: [malzeme] } }

const SIM_ROUND_CAP = 100; // bu turda bitmeyen savaş sonuçsuz sayılır
const SIM_CARE_ROUNDS = 20; // savaştan sonra düşenler için ayrılan tur
const SIM_WANT = [2, 6, 14]; // ideal mesafedeki hedef uzaklık: Yakın, Orta, Uzak
const SIM_DODGE = { Handgun: 2, "Shoulder Arms": 4, "Heavy Weapons": 6 };
const SIM_COVER_HP = { "cok-zayif": 10, zayif: 15, orta: 25, saglam: 35, "cok-saglam": 50, guclendirilmis: 70 };
const SIM_BLAST_DV = [14, 11, 8]; // merkeze uzaklığa göre patlamadan kaçma
const SIM_GROUND = { elec: "grounding-plate", heat: "heat-regulator" }; // türünün ilk hasarını yarıya indiren krom
// Savaşta işe yarayan quickhack'ler; worth: hedefin bir turluk hasarına oranla değeri. Kalanlar cihaz ya da gizlilik içindir
const SIM_HACKS = {
  shock: { n: 1, kind: "elec" }, "short-circuit": { n: 2, more: true, kind: "elec" }, overheat: { burn: 3 }, contagion: { n: 2, jump: true }, "synapse-burnout": { n: 3, hard: 5, drop: true },
  "reboot-optics": { fx: "blind", t: 1, worth: 0.8 }, "cripple-movement": { fx: "noMove", t: 1, worth: 0.5 }, "reflex-lock": { fx: "noReact", t: 1, worth: 0.3 }, cyberpsychosis: { fx: "mad", t: 2, worth: 3 },
  tag: { tag: 2, worth: 0.5 }, "weapon-glitch": { jam: true, worth: 1 }, "cyberware-malfunction": { malfunction: true, worth: 0.3 }, "ice-breaker": { ice: true, worth: 0.2 }, "system-reset": { sleep: true, worth: 2 }, "detonate-grenade": { blow: true, worth: 2 },
};
// Melodiler: buff dostlara, debuff düşmana. t: süre (tur). ally: dostların, guard: düşmanların, foe: hedefin hasarına oranla değeri
const SIM_SONGS = {
  "D Major": { buff: "aim", t: 2, ally: 0.1 }, "E Major": { buff: "fast", t: 3, ally: 0.02, melee: true }, "A Major": { buff: "sway", t: 2, guard: 0.1 }, "C Major": { buff: "calm", t: 3, guard: 0.1, hurt: true }, "B Major": { buff: "blade", t: 1, ally: 0.3, one: true, melee: true },
  "D Minor": { debuff: "slow", t: 2, foe: 0.05, melee: true }, "E Minor": { debuff: "noReact", t: 2, foe: 0.15 }, "C Minor": { debuff: "noClose", t: 1, foe: 0.05, melee: true }, "G Minor": { debuff: "shaken", t: 2, foe: 0.25 }, "F Minor": { debuff: "dread", t: 2, area: 6, foe: 0.08 },
};

const simD = (n) => 1 + Math.floor(Math.random() * n);
const simDice = (n) => Array.from({ length: n }, () => simD(6));
const simSum = (list) => list.reduce((a, b) => a + b, 0);
const simBand = (cells) => (cells <= 3 ? 0 : cells <= 12 ? 1 : cells <= 50 ? 2 : 3);
const simGap = (a, b) => Math.abs(a.pos - b.pos);
const simNear = (a, b) => Math.max(simGap(a, b), Math.abs(a.lane - b.lane)); // çapraz da 1 kare
const simHas = (f, id) => f.tags.has(id) && !(f.off[id] > 0);
const simOn = (f, k) => f.fx[k] > 0;
const simFx = (f, k, n) => (f.fx[k] = Math.max(f.fx[k] || 0, n));
const simUp = (f) => !f.dead && !f.out && !f.down;
const simHurtBad = (f) => f.hp * 2 < f.hpMax;
const simRivals = (me, b) => b.all.filter((f) => f.side !== me.side && !f.dead && !f.out);
const simCrew = (me, b) => b.all.filter((f) => f !== me && f.side === me.side && simUp(f));
const simFixed = (t) => Object.entries(t.skin).reduce((n, [id, sp]) => n + (t.off[id] > 0 ? 0 : sp), 0);
const simSpare = (me, w) => (w.spare === undefined ? me.spare : w.spare);

// d10: doğal 10 bir d10 ekler, doğal 1 bir d10 çıkarır. edge: 1 avantaj, −1 dezavantaj
function simRoll(edge = 0) {
  const nat = edge ? (edge > 0 ? Math.max : Math.min)(simD(10), simD(10)) : simD(10);
  return { nat, total: nat === 10 ? 10 + simD(10) : nat === 1 ? 1 - simD(10) : nat };
}

function simWound(f) {
  if (simOn(f, "painless") || simOn(f, "berserk")) return 0;
  const halved = simHas(f, "pain-tolerance");
  if (f.hp <= 0) return halved ? -2 : -4;
  if (!simHurtBad(f) || simHas(f, "pain-editor") || simOn(f, "calm")) return 0;
  return halved ? -1 : -2;
}

function simFresh(def) {
  return {
    spHead: 0, headSkin: 0, skin: {}, grit: 0, toxin: 0, perf: 0, intim: 0, implants: 0, chrome: [], songs: [], refUp: 0, pierceCut: 0, ...def,
    hpMax: def.hp, weapons: def.weapons.map((w) => ({ ...w, ammo: w.mag || 0 })), grenades: (def.grenades || []).map((g) => ({ ...g })), hacks: [...(def.hacks || [])],
    pos: 0, lane: 0, cover: null, ride: false, reactOwn: 0, reactOff: 0, dodges: 0, act: 0, bon: 0, stride: 0, down: false, asleep: false, sleep: false, out: false, dead: false, stable: false, marked: false, psycho: false,
    fails: 0, saves: 0, skip: 0, bleed: 0, burn: 0, evaPen: 0, skillPen: 0, meleePen: 0, rangedPen: 0, weak: false, noTwo: false, oneArm: false, noRun: false, rangedDis: false, skull: false, firstSave: true, killed: false, spent: {}, dealt: 0, taken: 0,
    vet: def.vet || 0, vetDie: def.vetDie || 4, rival: null, hand: null, tap: null, stepped: false, steppedLast: false, shielding: false, lastLine: false, fx: {}, off: {}, tagSide: null, broken: null, watch: false, chained: false,
    charges: (def.songs || []).length ? 2 + (def.mastery || 1) + ((def.tags || new Set()).has("amplifier") ? 1 : 0) : 0, playing: [], overload: 0, chain: 2,
  };
}

// ---- Reaction ----
const simReactMax = (f) => 1 + (simHas(f, "synaptic-accelerator") ? 1 : 0) + (simOn(f, "apogee") ? 1 : 0);
function simCanReact(f, b) {
  if (!simUp(f) || f.sleep || simOn(f, "noReact") || simOn(f, "mad")) return false;
  return b.now === f ? f.reactOwn < 2 : f.reactOff < simReactMax(f);
}
const simSpend = (f, b) => (b.now === f ? f.reactOwn++ : f.reactOff++);

// ---- Yara ve ölüm ----
function simRaise(t, hp) {
  t.out = t.asleep || t.fails > 0; // bir başarısızlığı olan baygın kalır
  t.down = false;
  t.asleep = false;
  t.hp = hp;
  t.fails = 0;
  t.saves = 0;
  t.marked = true;
}

function simFail(t, b) {
  if (t.fails < 1) {
    t.fails = 1;
    t.asleep = true;
    return;
  }
  const friend = b.all.find((f) => f !== t && f.side === t.side && simHas(f, "nomw") && !f.spent.nomw && simCanReact(f, b) && simGap(f, t) <= 2);
  if (friend) {
    friend.spent.nomw = true;
    simSpend(friend, b);
  } else if (simHas(t, "second-heart") && !t.spent.heart) {
    t.spent.heart = true;
    simRaise(t, simD(6));
  } else {
    t.dead = true;
    t.down = false;
  }
}

// Cyberpsychosis krizi: yalnızca Humanity'si 40 ve altında olan, basamağındaki tetikleyiciyi yaşayan oyuncularda
function simCrisis(f, kind, b) {
  const h = f.humanity;
  if (h === undefined || h > 40 || !simUp(f) || simOn(f, "mad") || (kind === "kill" && h > 20) || (kind === "reflex" && h > 0)) return;
  const anchor = simCrew(f, b).find((a) => simHas(a, "Anchor") && simNear(a, f) <= 2);
  if (simRoll().total + f.grit + (anchor ? anchor.mastery : 0) > (h > 20 ? 8 : h > 0 ? 11 : 15 - h)) return;
  const pull = simCrew(f, b).find((a) => simHas(a, "Pull Back") && !a.spent.pull);
  if (h > 0 || pull) {
    if (h <= 0) pull.spent.pull = true;
    simFx(f, "mad", simD(6));
  } else {
    f.psycho = true;
    f.fx.mad = Infinity;
  }
}

function simHurt(t, n, by, b, kind) {
  if (n <= 0 || t.dead) return;
  const guard = SIM_GROUND[kind];
  if (guard && simHas(t, guard) && !t.spent[guard]) {
    t.spent[guard] = true;
    n = Math.ceil(n / 2);
  }
  t.sleep = false;
  const real = Math.min(simOn(t, "berserk") ? Math.max(0, t.hp - 1) : t.hp, n);
  t.hp -= real;
  t.taken += real;
  b.toSide[t.side] += real;
  if (by) by.dealt += real;
  if (t.hp > 0) {
    const pump = simHas(t, "blood-pump-mk2") ? 6 : simHas(t, "blood-pump-mk1") ? 4 : 0;
    if (pump && simHurtBad(t) && !t.spent.pump) {
      t.spent.pump = true;
      t.hp = Math.min(t.hpMax, t.hp + simD(pump));
    }
    return;
  }
  if (t.side === "foe") {
    t.out = true;
    if (by) {
      by.killed = true;
      simCrisis(by, "kill", b);
    }
    return;
  }
  if (t.down) {
    if (by) simFail(t, b); // zırhı delen yeni isabet
    return;
  }
  t.down = true;
  t.out = false;
  t.fails = t.marked ? 1 : 0;
  t.asleep = t.marked;
  t.saves = 0;
  if (by) by.killed = true;
  b.all.forEach((f) => {
    if (f === t || f.side !== t.side) return;
    if (simHas(f, "ride-or-die")) f.ride = true;
    if (simHas(f, "Last Line") && simGap(f, t) <= 1) f.lastLine = true;
    simCrisis(f, "ally", b);
  });
}

// Kritik yara tabloları: yalnızca savaşı etkileyen yaralar
function simInjury(t, where, b) {
  const roll = where === "limb" && simHas(t, "titanium-bones") ? Math.min(simD(8), simD(8)) : simD(8);
  const halve = () => (t.move = Math.ceil(t.move / 2));
  if (where === "head") {
    if (roll === 1) t.skillPen++;
    else if (roll === 3) t.rangedPen += 2;
    else if (roll === 6) t.skull = true;
    else if (roll === 8) t.rangedDis = true;
  } else if (where === "limb" && simD(2) === 1) {
    if (roll === 1 || roll === 3 || roll === 8) t.oneArm = true;
    else if (roll === 2) t.bleed = Math.max(t.bleed, 8);
    else if (roll === 4) t.weak = true;
    else if (roll === 5) t.meleePen = 2;
    else if (roll === 6) t.hand = null;
    else if (roll === 7) {
      t.meleePen = 2;
      t.rangedPen += 2;
    }
  } else if (where === "limb") {
    if (roll === 1 || roll === 4) halve();
    else if (roll === 2) t.bleed = Math.max(t.bleed, 8);
    else if (roll === 3) t.noRun = true;
    else if (roll === 5) t.move = Math.max(1, t.move - 1);
    else if (roll === 7) t.evaPen = 2;
    else if (roll === 8) {
      halve();
      t.noRun = true;
    }
  } else {
    if (roll === 2) t.meleePen = 2;
    else if (roll === 4) t.noTwo = true;
    else if (roll === 5) t.bleed = 11;
    else if (roll === 6) {
      halve();
      t.noRun = true;
    } else if (roll === 7) {
      t.hpMax = Math.max(1, t.hpMax - 5);
      t.hp = Math.min(t.hp, t.hpMax);
    } else if (roll === 8) {
      t.skip = 1;
      t.evaPen = 2;
    }
  }
  simCrisis(t, "crit", b);
}

function simSave(me, b) {
  const edge = (me.firstSave && simHas(me, "biomonitor-mk2")) || simOn(me, "calm") ? 1 : 0;
  const roll = simRoll(edge);
  me.firstSave = false;
  const total = roll.total + me.body + (simHas(me, "die-hard") ? 1 : 0);
  if (roll.nat !== 1 && total > 5 + me.saves + (me.bleed ? 1 : 0)) me.saves++;
  else simFail(me, b);
}

// ---- Saldırı ----
// aim: kafaya Aimed Shot. Silahın hasarı iki katına çıkar, kafa SP'si işler
function simDamage(me, t, dice, total, b, w, aim) {
  const melee = w.melee;
  if (aim) total = total * 2 + (t.skull ? simD(6) : 0);
  if (!w.blast && simHas(me, "spot-weakness") && (me.spent.spot || 0) < me.mastery) {
    me.spent.spot = (me.spent.spot || 0) + 1;
    total += simD(6);
  }
  const armor = aim ? t.spHead + (t.off["titanium-skin"] > 0 ? 0 : t.headSkin) : t.sp + simFixed(t);
  const blank = simShotgun(w) && simHas(me, "Point Blank") && simGap(me, t) <= 1;
  const sp = melee || blank ? Math.ceil(armor / 2) : armor;
  let through = Math.max(0, total - sp);
  const pair = (v) => dice.filter((x) => x === v).length >= 2;
  const finisher = melee && simHas(me, "Finisher") && !me.spent.finish && simHurtBad(t);
  if (finisher) me.spent.finish = true;
  const crit = (pair(6) || (w.skill === "Handgun" && simHas(me, "Dead Eye") && pair(5)) || finisher) && total > sp;
  if (aim) t.spHead = Math.max(0, t.spHead - 1);
  else if (t.sp > 0) t.sp--;
  if (t.shielding && simHas(t, "Hardened")) through = Math.max(0, through - 1 - t.mastery);
  if (through > 0 && t.pierceCut) through = Math.max(1, through - t.pierceCut);
  if (through > 0 && melee && w.light && simHas(t, "subdermal-plating")) through = Math.max(1, through - 1);
  if (!melee && simHas(t, "Deflect") && t.hand && t.hand.melee && simCanReact(t, b) && (t.spent.deflect || 0) < t.mastery && through > 0) {
    simSpend(t, b);
    t.spent.deflect = (t.spent.deflect || 0) + 1;
    through = Math.ceil(through / 2);
  }
  if (crit) {
    through += 5 + (simHas(me, "overkill") ? me.mastery : 0);
    const spot = simD(6);
    simInjury(t, aim ? "head" : w.blast ? (spot <= 2 ? "head" : spot <= 4 ? "body" : "limb") : "body", b);
  }
  simHurt(t, through, me, b);
}

// Fazla hasar arkadaki kişiye gövde isabeti olarak geçer: zırh işler ve aşınır, kritik yara açmaz
function simCoverHit(t, total, me, b) {
  t.cover.hp -= total;
  if (t.cover.hp > 0) return;
  const over = -t.cover.hp;
  t.cover = null;
  const armor = t.sp + simFixed(t);
  if (t.sp > 0) t.sp--;
  simHurt(t, Math.max(0, over - armor), me, b);
}

const simShotgun = (w) => w.skill === "Shoulder Arms" && w.ideal === 0;

// Take the Bullet: bitişikteki Bodyguard isabeti üstüne alır, ne kadar istekli olduğunu Fedakârlık belirler
function simShield(t, b) {
  const guard = b.all.find((f) => f !== t && f.side === t.side && simHas(f, "Take the Bullet") && simCanReact(f, b) && simGap(f, t) <= 1);
  if (!guard || simD(100) > guard.ai.fed) return t;
  simSpend(guard, b);
  guard.shielding = true;
  return guard;
}

// Return Fire: bitişikteki dostu vurulan Bodyguard saldırana karşılık verir
function simReturn(me, t, b) {
  const guard = b.all.find((f) => f !== t && f.side === t.side && simHas(f, "Return Fire") && simCanReact(f, b) && (f.spent.back || 0) < f.mastery && simGap(f, t) <= 1);
  const w = guard && simPlan(guard, me, b);
  if (!w || w.melee || !w.ammo) return;
  simSpend(guard, b);
  guard.spent.back = (guard.spent.back || 0) + 1;
  simFire(guard, w, me, b);
}

function simPush(me, t, b, w) {
  let n = simWound(me) - me.skillPen - (w.melee ? me.meleePen : me.rangedPen);
  if (w.ideal >= 2 && !w.melee && simHas(me, "Steady Aim") && !me.stepped && !me.steppedLast) n += 2;
  if (simHas(me, "killer-instinct") && simHurtBad(t)) n++;
  if (simHas(me, "side-by-side") && simCrew(me, b).some((f) => simGap(f, me) <= 1)) n++;
  if (simOn(me, "aim")) n++;
  if (simOn(me, "dread")) n--;
  if (simOn(t, "tag") && t.tagSide === me.side) n += 2;
  if (simOn(me, "apogee") && w.ref) n += me.refUp;
  return n;
}

function simEdge(me, t, w) {
  const minus = t.lastLine || simOn(t, "camo") || simOn(me, "blind") || simOn(me, "shaken") || me.weak || (w.two && me.noTwo) || (!w.melee && me.rangedDis);
  return (me.ride ? 1 : 0) - (minus ? 1 : 0);
}

function simDodge(me, t, w, dv, guard, b) {
  if (!simCanReact(t, b) || t.noEvade || t.dodges >= simReactMax(t) || simOn(t, "blind")) return dv + guard;
  simSpend(t, b);
  t.dodges++;
  const luck = t.side === "party" && simHurtBad(t) ? t.luck : 0;
  t.luck -= luck;
  const result = simRoll(simOn(t, "dodgeUp") ? 1 : 0).total + t.evasion - (SIM_DODGE[w.skill] || 2) + simWound(t) - t.evaPen - t.skillPen + luck + (simOn(t, "sway") ? 2 : 0);
  if (result <= dv) return dv + guard;
  if (simHas(t, "slippery") && !t.cover) t.pos += t.pos >= me.pos ? 1 : -1;
  return result + guard;
}

// Patlama: hasar bir kez atılır, alandaki herkes kaçmayı dener. Iskada GM'in seçtiği yerin yerine yana sapar
function simBlast(me, w, t, b) {
  const dv = 8 + 3 * Math.abs(simBand(Math.max(1, simGap(me, t))) - w.ideal);
  const radius = w.radius === undefined ? 2 : w.radius;
  const spot = { pos: t.pos, lane: t.lane };
  if (simRoll(simEdge(me, t, w)).total + w.bonus + simPush(me, t, b, w) <= dv) spot.lane += (simD(2) === 1 ? 1 : -1) * simD(3);
  const dice = simDice(w.n || 0);
  const total = simSum(dice) + (w.k || 0);
  b.all.filter((f) => !f.dead && !f.out && simNear(f, spot) <= radius).forEach((f) => {
    let hit = total;
    if (simCanReact(f, b) && !f.noEvade) {
      simSpend(f, b);
      const dirt = simHas(f, "hit-the-dirt");
      if (simRoll(dirt ? 1 : 0).total + f.evasion + simWound(f) - f.evaPen - f.skillPen > SIM_BLAST_DV[simNear(f, spot)]) return;
      if (dirt) hit = Math.ceil(hit / 2);
    }
    if (f.cover && f.cover.full) {
      if (hit) simCoverHit(f, hit, me, b);
      return;
    }
    if (w.flash) simFx(f, "blind", 2);
    if (w.burn) f.burn = w.burn;
    if (w.emp) simBreak(f);
    if (hit) simDamage(me, f, dice, hit, b, w);
  });
  if (w.cloud) b.clouds.push({ ...spot, left: w.cloud, by: me });
}

function simFire(me, w, t, b, aim) {
  me.fx.camo = 0;
  if (w.blast) {
    w.ammo--;
    simBlast(me, w, t, b);
    return;
  }
  const dv = 8 + 3 * Math.abs(simBand(Math.max(1, simGap(me, t))) - w.ideal);
  const guard = t.cover && !t.cover.full ? (simHas(t, "cover-expert") ? 3 : 2) : 0;
  const auto = !aim && w.auto && w.ammo >= 10 && w.bonus + 5.5 - dv - guard >= 2;
  w.ammo -= auto ? 10 : 1;
  if (t.cover && t.cover.full) {
    simCoverHit(t, simSum(simDice(w.n)) + w.k, me, b);
    return;
  }
  const push = simPush(me, t, b, w);
  const luck = me.side === "party" && me.luck > 0 && me.ai.aggr >= 50 && dv + guard - w.bonus - push >= 6 ? 1 : 0;
  me.luck -= luck;
  let total = simRoll(aim && simHas(me, "Exhale") && !me.spent.exhale ? (me.spent.exhale = true, 0) : simEdge(me, t, w) - (aim ? 1 : 0)).total + w.bonus + push + luck;
  // Hype Man: dostunun atışından hemen önce Reaction'la Luck verir
  const hype = me.side === "party" && total <= dv + guard && total + 1 > dv + guard && simCrew(me, b).find((f) => simHas(f, "hype-man") && f.luck > 0 && simCanReact(f, b));
  if (hype) {
    simSpend(hype, b);
    hype.luck--;
    total++;
  }
  // Law of the Gun: Tecrübe Zarı sonuçtan önce eklenir, ıskayı kurtarabilecekse harcanır
  if (w.skill === "Handgun" && simHas(me, "Law of the Gun") && me.vet > 0 && total <= dv + guard && total + me.vetDie > dv + guard) {
    me.vet--;
    total += simD(me.vetDie);
  }
  if (total <= dv + guard) {
    if (total > dv) simCoverHit(t, simSum(simDice(w.n)) + w.k, me, b); // yalnızca siper yüzünden kaçan kurşun sipere gider
    return;
  }
  const need = simDodge(me, t, w, dv, guard, b);
  if (total <= need) return;
  let dice = simDice(auto ? 2 : w.n);
  if (simHas(me, "Big Iron") && w.skill === "Handgun" && w.n >= 3 && !w.auto) dice = dice.map((v) => (v === 1 ? simD(6) : v));
  let extra = 0;
  if (w.skill === "Handgun" && simHas(me, "Double Tap")) {
    if (me.tap === t) extra = simD(6);
    me.tap = t;
  }
  if (simShotgun(w) && simHas(me, "Blowback") && !t.cover && (me.spent.blow || 0) < me.mastery) {
    me.spent.blow = (me.spent.blow || 0) + 1;
    t.pos += t.pos >= me.pos ? 1 : -1;
  }
  const hit = simShield(t, b);
  simDamage(me, hit, dice, (auto ? simSum(dice) * Math.min(total - need, w.auto) : simSum(dice) + w.k) + extra, b, w, aim && hit === t);
  hit.shielding = false;
  simReturn(me, t, b);
}

// Saldırı zarı, karşısında Evasion
function simSwing(me, w, t, b) {
  me.fx.camo = 0;
  const total = simRoll(simEdge(me, t, w)).total + w.bonus + simPush(me, t, b, w) + (me.rival === t ? 1 : 0);
  if (t.down || t.out || t.sleep || t.noEvade) return total > 0;
  return total > simRoll(simOn(t, "blind") ? -1 : 0).total + t.evasion + simWound(t) - t.evaPen - t.skillPen + (t.rival === me ? 1 : 0);
}

function simLand(me, w, t, b, hits) {
  const dice = simDice(w.n * hits);
  const hit = simShield(t, b);
  simDamage(me, hit, dice, simSum(dice) + w.k * hits + (simOn(me, "berserk") ? simD(6) : 0) + (simOn(me, "blade") ? simD(6) : 0), b, w);
  hit.shielding = false;
  if (w.skill !== "Brawling") {
    if (me.rival === t && simHas(me, "Footwork")) me.stride++;
    return;
  }
  const shove = w.kick || (simHas(me, "street-fighter") ? 1 : 0);
  if (shove && simUp(t)) t.pos += (t.pos >= me.pos ? 1 : -1) * shove;
  if (!w.kick && simHas(me, "taser-hand") && !me.spent.taser && simUp(t) && simCanReact(me, b)) {
    me.spent.taser = true;
    simSpend(me, b);
    simFx(t, "noReact", 1);
  }
}

function simStrike(me, w, t, b) {
  if (simSwing(me, w, t, b)) simLand(me, w, t, b, 1);
}

// Baskı ateşi: çekingen nişancı, düşmanlar kümelendiğinde hasar yerine onları siperine sindirir
function simSuppress(me, w, t, b) {
  const cost = simHas(me, "ammo-discipline") ? 6 : 10;
  if (w.ammo < cost || simD(100) <= me.ai.aggr) return false;
  const caught = simRivals(me, b).filter((f) => simUp(f) && simNear(f, t) <= 2 && !(f.cover && f.cover.full));
  if (caught.length < 2) return false;
  w.ammo -= cost;
  caught.forEach((f) => {
    if (simRoll().total + f.grit <= (simHas(me, "pinning-fire") ? 14 : 11)) simFx(f, "flee", 1);
  });
  return true;
}

// ---- Quickhack ----
function simBreak(t) {
  const list = t.chrome.filter((id) => id !== "second-heart" && !(t.off[id] > 0)); // hayati kromlar kapanmaz
  if (list.length) t.off[list[simD(list.length) - 1]] = simD(6);
}

function simHackWorth(q, me, t, b) {
  if (t.noHack) return 0;
  const threat = simPower(t, me);
  if (q.fx === "mad" && !simCrew(t, b).length) return 0; // yanında vuracak kimse yoksa boşa gider
  if (q.fx === "noMove") return simOn(t, "noMove") || !(t.hand && t.hand.melee) || simGap(me, t) <= 1 ? 0 : q.worth * threat;
  if (q.fx) return simOn(t, q.fx) ? 0 : q.worth * threat;
  if (q.tag) return simOn(t, "tag") ? 0 : q.worth * simCrew(me, b).reduce((n, f) => n + simPower(f, t), 0);
  if (q.jam) return t.hand && !t.hand.melee && !t.hand.jam ? q.worth * threat : 0;
  if (q.malfunction) return t.chrome.length ? q.worth * threat : 0;
  if (q.ice) return t.broken !== me.side && t.netrun > 0 ? q.worth * threat : 0;
  if (q.sleep) return t.sleep || t.down ? 0 : q.worth * threat;
  if (q.blow) return t.grenades.some((g) => g.qty > 0 && g.n) ? q.worth * threat : 0;
  if (q.burn) return t.burn ? 0 : 7;
  return 3.5 * (q.hard && simHurtBad(t) ? q.hard : q.n) + (q.more && t.implants >= 3 ? 3.5 : 0) + (q.jump ? 2 : 0);
}

function simBestHack(me, t, b) {
  const score = (q) => simHackWorth(q, me, t, b);
  const list = me.hacks.filter((q) => score(q) > 0).sort((x, y) => score(y) - score(x) || y.ram - x.ram);
  const pick = list.find((q) => q.ram <= me.ram);
  if (pick) return pick;
  // Overclock: kendine verdiği hasar yüksektir, yalnızca hedefi bitirecekse değer
  return list.length && simHas(me, "overclock") && !simHurtBad(me) && list[0].n && score(list[0]) >= t.hp ? { ...list[0], over: true } : null;
}

function simHackHit(me, q, t, b) {
  if (q.fx) simFx(t, q.fx, q.t);
  if (q.tag) {
    simFx(t, "tag", q.tag);
    t.tagSide = me.side;
  }
  if (q.jam) t.hand.jam = true;
  if (q.malfunction) simBreak(t);
  if (q.ice) t.broken = me.side;
  if (q.sleep) t.sleep = true;
  if (q.burn) t.burn = q.burn;
  if (q.blow) {
    const g = t.grenades.find((x) => x.qty > 0 && x.n);
    g.qty--;
    const free = t.noEvade;
    t.noEvade = true; // patlayan bombayı taşıyan kaçamaz
    simBlast(me, { ...g, bonus: 99 }, t, b);
    t.noEvade = free;
  }
  if (!q.n) return;
  const heavy = q.hard && simHurtBad(t);
  simHurt(t, simSum(simDice(heavy ? q.hard : q.n)) + (q.more && t.implants >= 3 ? simD(6) : 0), me, b, q.kind);
  if (q.drop && t.down && !t.asleep && t.fails < 1) {
    t.fails = 1;
    t.asleep = true;
  }
  if (q.jump) {
    const next = simRivals(me, b).find((f) => f !== t && simUp(f) && !f.noHack && simNear(f, t) <= 3);
    if (next) simHurt(next, simD(6), me, b);
  }
}

function simHack(me, t, q, b, free) {
  if (q.over) {
    me.ram = 0;
    simHurt(me, simD(6) + 3 * (q.tier || 1), null, b);
    if (!simUp(me)) return;
  } else if (!free) me.ram -= q.ram;
  // Daisy Chain: aynı quickhack yarı RAM'le ikinci bir kişiye kopyalanır
  const points = (q.tier || 1) <= 2 ? 1 : 2;
  if (!free && simHas(me, "daisy-chain") && !me.chained && me.chain >= points && Math.floor(q.ram / 2) <= me.ram) {
    const twin = simRivals(me, b).find((f) => f !== t && simUp(f) && simHackWorth(q, me, f, b) > 0);
    if (twin) {
      me.chain -= points;
      me.chained = true;
      me.ram -= Math.floor(q.ram / 2);
      simHack(me, twin, q, b, true);
    }
  }
  const broke = t.broken === me.side;
  const works = simRoll(broke ? 1 : 0).total + me.netrun + simWound(me) - me.skillPen > (broke ? t.qhBase : t.qhDv);
  if (works && simHas(t, "self-ice-mk3") && !t.spent.ice && simCanReact(t, b)) {
    t.spent.ice = true;
    simSpend(t, b);
  } else if (works) simHackHit(me, q, t, b);
  if (simHas(t, "backlash") && !t.spent.lash && simUp(t) && simCanReact(t, b)) {
    const back = t.hacks.map((x) => ({ x, worth: simHackWorth(x, t, me, b) })).sort((x, y) => y.worth - x.worth)[0];
    if (back && back.worth > 0) {
      t.spent.lash = true;
      simSpend(t, b);
      simHack(t, me, back.x, b, true);
    }
  }
}

// ---- Melodi ----
function simSongWorth(s, me, b) {
  const reach = simHas(me, "loudspeaker") ? 18 : 12;
  const crew = simCrew(me, b).filter((f) => simNear(f, me) <= reach);
  const foes = simRivals(me, b).filter((f) => simUp(f) && simNear(f, me) <= (s.area || reach)).sort((x, y) => simGap(me, x) - simGap(me, y));
  if (!foes.length || (s.buff && !crew.length)) return 0;
  if (s.hurt && !b.all.some((f) => f.side === me.side && (f.down || (simUp(f) && simHurtBad(f))))) return 0;
  if (s.melee && !(s.buff ? crew : foes).some((f) => f.hand && f.hand.melee)) return 0;
  const size = s.one ? 1 : 2 + me.mastery;
  if (s.ally) return s.ally * s.t * crew.slice(0, size).reduce((n, f) => n + simPower(f, foes[0]), 0);
  const hit = (list, friend) => list.reduce((n, f) => n + simPower(f, friend), 0);
  if (s.guard) return (s.guard * s.t * hit(foes, crew[0]) * Math.min(crew.length, size)) / (crew.length + 1);
  return 0.6 * s.foe * s.t * hit(s.area ? foes : foes.slice(0, 1), me); // debuff'ların yaklaşık yarısı tutar
}

function simPlay(me, s, b) {
  const reach = simHas(me, "loudspeaker") ? 18 : 12;
  if (s.buff) {
    const crew = simCrew(me, b).filter((f) => simNear(f, me) <= reach).slice(0, s.one ? 1 : 2 + me.mastery);
    crew.forEach((f) => simFx(f, s.buff, s.t));
    if (crew[0] && simHas(me, "Hype Train")) crew[0].stride += 2;
    return;
  }
  const foes = simRivals(me, b).filter((f) => simUp(f) && simNear(f, me) <= (s.area || reach)).sort((x, y) => simGap(me, x) - simGap(me, y));
  (s.area ? foes : foes.slice(0, 1)).forEach((f) => {
    const mine = simRoll().total + me.perf + simWound(me) - me.skillPen;
    const theirs = simRoll(simHas(me, "Dead Air") ? -1 : 0).total + f.grit;
    if (simHas(me, "stage-presence") ? mine >= theirs : mine > theirs) {
      simFx(f, s.debuff, s.t);
      if (simHas(me, "Black Note") && (me.spent.note || 0) < me.mastery) {
        me.spent.note = (me.spent.note || 0) + 1;
        simFx(f, "noBonus", 1);
      }
      return;
    }
    if (simHas(me, "Ear Splitter")) simHurt(f, simD(6), me, b);
    if (simHas(me, "feedback") && !me.spent.feedback) {
      me.spent.feedback = true;
      me.charges++;
    }
  });
}

// Şarjı ve boş melodi yeri varsa o an en çok işe yarayacak melodiyi seçer
function simPickSong(me, b) {
  if (!me.charges || me.playing.length >= (simHas(me, "double-track") ? 2 : 1)) return null;
  const list = me.songs.map((name) => SIM_SONGS[name]).filter((s) => !me.playing.some((p) => p.s === s));
  const best = list.map((s) => ({ s, worth: simSongWorth(s, me, b) })).sort((x, y) => y.worth - x.worth)[0];
  const foe = simRivals(me, b).find(simUp);
  if (!best || !foe || best.worth <= 0) return null;
  return best.worth > simPower(me, foe) || simD(100) > me.ai.aggr ? best.s : null; // ateş etmekten iyiyse çalar, değilse çekingen olan yine çalar
}

function simSing(me, s, b) {
  me.charges--;
  me.playing.push({ s, left: s.t });
  simPlay(me, s, b);
}

// ---- Karar ----
function simTarget(me, b) {
  const rivals = simRivals(me, b);
  const standing = rivals.filter(simUp);
  const fallen = rivals.filter((f) => f.down);
  if (me.side === "foe" && fallen.length && simD(100) <= b.reckless) return fallen.sort((x, y) => simGap(me, x) - simGap(me, y))[0];
  if (!standing.length) return null;
  if (simD(100) <= me.ai.err) return standing[simD(standing.length) - 1];
  // Fedakâr oyuncu yaralı dostunun önüne geçer, düşmanın ateşini üstüne çeker
  if (me.side === "foe") {
    const trouble = b.all.some((f) => f.side === "party" && (f.down || (simUp(f) && simHurtBad(f))));
    const shield = standing.filter((f) => f.ai.fed >= 60)[0];
    if (trouble && shield && simD(100) <= shield.ai.fed / 2) return shield;
  }
  const order = simD(100) <= me.ai.aggr ? (x, y) => x.hp - y.hp : (x, y) => simGap(me, x) - simGap(me, y);
  return [...standing].sort(order)[0];
}

function simStride(me) {
  if (simOn(me, "noMove")) return 0;
  let m = me.move + me.stride + (simOn(me, "fast") ? 2 : 0) + (simOn(me, "stim") ? 2 : 0) + (simOn(me, "apogee") ? 4 : 0);
  if (simOn(me, "speed") && simHas(me, "sandevistan-mk2")) m *= 2;
  return simOn(me, "slow") ? Math.ceil(m / 2) : m;
}

const simReach = (w) => (w.melee ? w.reach || 1 : 0);

function simAfterMove(me, w, gap) {
  const want = w.melee ? simReach(w) : SIM_WANT[w.ideal];
  const step = simStride(me);
  if (gap > want) return Math.max(want, gap - step);
  return !w.melee && simBand(gap) !== w.ideal ? Math.min(want, gap + step) : gap;
}

const simRisky = (me, t, w, b) => simCrew(me, b).some((f) => simNear(f, t) <= (w.radius === undefined ? 2 : w.radius)) || simNear(me, t) <= (w.radius === undefined ? 2 : w.radius);

// Bir aksiyonda beklenen hasar
function simScore(me, w, t) {
  const sp = t.sp + simFixed(t);
  const gap = simAfterMove(me, w, simGap(me, t));
  const dv = w.melee ? 5.5 + t.evasion : 8 + 3 * Math.abs(simBand(Math.max(1, gap)) - w.ideal);
  const chance = Math.max(0.1, Math.min(0.95, (w.bonus + 5.5 - dv) / 10 + 0.5));
  return chance * Math.max(1, w.n * 3.5 + w.k - (w.melee ? Math.ceil(sp / 2) : sp)) * (w.rof || 1);
}
const simPower = (f, t) => f.weapons.reduce((top, w) => Math.max(top, simScore(f, w, t)), 1);

function simPlan(me, t, b) {
  let best = null;
  let top = -Infinity;
  for (const w of me.weapons) {
    if (w.two && me.oneArm) continue;
    if (!w.melee && !w.ammo && !simSpare(me, w)) continue;
    if (w.blast && simRisky(me, t, w, b)) continue;
    if (w.melee && simAfterMove(me, w, simGap(me, t)) > simReach(w)) {
      if (top < -1) best = w; // ulaşılamayan yakın dövüş silahı yalnızca son çaredir
      top = Math.max(top, -1);
      continue;
    }
    const caught = w.blast ? simRivals(me, b).filter((f) => simNear(f, t) <= (w.radius === undefined ? 2 : w.radius)).length : 1;
    const score = simScore(me, w, t) * caught * (w === me.hand ? 1.15 : 1); // silah değiştirmek bonus aksiyon ister
    if (score > top) {
      top = score;
      best = w;
    }
  }
  return best;
}

// Sipere girmek 2 metre (1 kare) hareket ya da bonus aksiyondur; Shinobi'nin Shadowstep'iyle bedavadır
const simCoverFree = (me) => simHas(me, "Shadowstep");
function simTakeCover(me, b, wantFull) {
  const c = b.cover;
  if (!c || simD(100) > c.rate) return false;
  const full = wantFull ? c.full : !c.partial;
  if (full && !c.full) return false;
  me.cover = { hp: SIM_COVER_HP[c.mats[simD(c.mats.length) - 1]], full };
  return true;
}

function simHeal(me, target, kind) {
  const extra = simHas(me, "precise-dose") ? me.mastery : 0;
  const amount = (kind === "maxdoc" ? simSum(simDice(4)) : simSum(simDice(2))) + extra;
  me[kind]--;
  if (target.down) simRaise(target, amount);
  else target.hp = Math.min(target.hpMax, target.hp + amount);
}

function simStabilize(me, t, b) {
  const kit = b.all.some((f) => f.side === me.side && f.medkit);
  const edge = !kit && t.fails > 0 && !simHas(me, "improvised-kit") ? -1 : 0;
  const bonus = (simHas(t, "biomonitor-mk1") || simHas(t, "biomonitor-mk2") ? 1 : 0) + (simHas(me, "medscanner") ? 1 : 0);
  if (simRoll(edge).total + me.medicine + simWound(me) - me.skillPen + bonus <= 8) return;
  if (simHas(me, "adrenaline-shot") && (me.spent.shot || 0) < me.mastery) {
    me.spent.shot = (me.spent.shot || 0) + 1;
    t.fails = 0;
    t.asleep = false;
    simRaise(t, simD(6) + me.mastery);
    simFx(t, "painless", 3);
  } else simRaise(t, 1);
}

function simStopBleed(me, t) {
  if (simRoll().total + me.medicine + simWound(me) + (simHas(me, "trauma-specialist") ? me.mastery : 0) > t.bleed) t.bleed = 0;
}

// Fırsat saldırısı ve Overwatch hareket ederken işler
function simGo(me, to, b) {
  if (to === me.pos) return;
  if (!simOn(me, "fast")) {
    for (const f of b.all) {
      if (f.side === me.side || !simCanReact(f, b) || simGap(f, me) > 1 || Math.abs(f.pos - to) <= 1 || simD(100) > f.ai.aggr) continue;
      const w = f.hand && f.hand.melee ? f.hand : f.weapons.find((x) => x.melee && x.skill === "Brawling" && !x.kick);
      if (!w) continue;
      simSpend(f, b);
      simStrike(f, w, me, b);
    }
  }
  const eye = b.all.find((f) => f.side !== me.side && f.watch && simCanReact(f, b));
  if (eye) {
    eye.watch = false;
    simSpend(eye, b);
    if (eye.hand && eye.hand.ammo) simFire(eye, eye.hand, me, b);
  }
  if (simUp(me)) me.pos = to;
}

// Kafaya Aimed Shot: dezavantajlı tek atış, gövdeden belirgin biçimde daha çok hasar verecekse
function simAimWorth(me, w, t) {
  if (w.melee || w.blast || w.auto || !me.bon || t.down || t.cover || simOn(me, "blind")) return false;
  const gain = (w.n * 3.5 + w.k) * 2 - (t.spHead + t.headSkin);
  const plain = (w.rof || 1) * Math.max(1, w.n * 3.5 + w.k - t.sp - simFixed(t));
  return gain * 0.7 > plain * 1.2 && simD(100) <= me.ai.aggr;
}

function simThrow(me, t, b) {
  const g = me.grenades.find((x) => x.qty > 0);
  if (!g || t.down || simGap(me, t) > 12 || simRisky(me, t, g, b)) return false;
  if (simRivals(me, b).filter((f) => simUp(f) && simNear(f, t) <= 2).length < (g.n ? 2 : 3) || (g.flash && simOn(t, "blind"))) return false;
  g.qty--;
  me.fx.camo = 0;
  simBlast(me, g, t, b);
  return true;
}

function simAttack(me, t, b) {
  const w = simPlan(me, t, b);
  if (!w) return false;
  if (w !== me.hand) {
    const was = me.hand;
    me.hand = w;
    if (was && !w.free && !simHas(me, "quick-draw")) {
      if (me.bon) me.bon--;
      else return true; // bonus aksiyon kalmadıysa iş aksiyona düşer
    }
  }
  if (w.jam) {
    w.jam = false;
    return true;
  }
  if (me.side === "party" && w.melee && me.bon && simAfterMove(me, w, simGap(me, t)) > simReach(w)) {
    if (simHas(me, "stim-gland") && !me.spent.stim) {
      me.spent.stim = true;
      me.bon--;
      simFx(me, "stim", 2);
    } else if (simHas(me, "run-and-gun")) {
      me.bon--;
      me.stride += 3;
    }
  }
  const gap = simGap(me, t);
  let next = me.hold && !w.melee ? gap : simAfterMove(me, w, gap);
  if (simOn(me, "noClose") && next < gap) next = gap;
  if (next !== gap) {
    me.stepped = true;
    const dir = t.pos > me.pos ? 1 : -1;
    simGo(me, t.pos - dir * next, b);
    if (!simUp(me)) return false;
    if (me.cover) {
      me.cover = null;
      if (b.cover && b.cover.partial) simTakeCover(me, b, false);
    }
  }
  if (w.melee && next > simReach(w)) {
    if (!me.noRun) simGo(me, t.pos - (t.pos > me.pos ? 1 : -1) * Math.max(simReach(w), next - simStride(me)), b); // koşmak aksiyondur
    return simUp(me);
  }
  if (!w.melee && !w.ammo) {
    w.ammo = w.mag;
    if (w.spare === undefined) me.spare--;
    else w.spare--;
    if (!simHas(me, "professional") || !me.bon) return true;
    me.bon--;
  }
  if (w.auto && !w.melee && simSuppress(me, w, t, b)) return true;
  if (simAimWorth(me, w, t)) {
    me.bon--;
    simFire(me, w, t, b, true);
    return true;
  }
  if (w.melee && w.light && simHas(me, "flurry")) {
    const hits = [simSwing(me, w, t, b), simSwing(me, w, t, b)].filter(Boolean).length; // iki isabet tek hasar sayılır, zırh bir kez çıkar
    if (hits) simLand(me, w, t, b, hits);
    return true;
  }
  for (let i = 0; i < (w.rof || 1); i++) {
    const foe = i && (t.dead || t.out || t.down) ? simTarget(me, b) : t;
    if (!foe || (!w.melee && !w.ammo) || (w.melee && simGap(me, foe) > simReach(w))) break;
    (w.melee ? simStrike : simFire)(me, w, foe, b);
    if (!simUp(me)) return false;
  }
  return true;
}

// Psikozdaki karakter dost düşman ayırmadan en yakınındakine saldırır
function simRage(me, b) {
  const t = b.all.filter((f) => f !== me && simUp(f)).sort((x, y) => simNear(me, x) - simNear(me, y))[0];
  if (!t) return;
  me.act = me.bon = 0;
  simAttack(me, t, b);
}

function simAct(me, b) {
  if (simOn(me, "mad")) {
    simRage(me, b);
    return;
  }
  const a = me.ai;
  const slip = simD(100) <= a.err; // hata payı: iyileşmek ya da dostuna gitmek yerine saldırır
  me.act = 1 + (simOn(me, "speed") ? 1 : 0);
  me.bon = (simOn(me, "noBonus") ? 0 : 1) + (simOn(me, "cheer") ? 1 : 0);
  const eager = simD(100) <= a.aggr;
  if (simHas(me, "adrenaline-rush") && !me.spent.rush && eager) {
    me.spent.rush = true;
    me.act++;
  }
  const kit = ["militech-apogee", "sandevistan-mk2", "sandevistan"].find((id) => simHas(me, id));
  if (kit && !me.spent.sandy && eager && me.bon) {
    me.spent.sandy = true;
    me.act++;
    me.bon--;
    if (kit !== "militech-apogee") simFx(me, "dodgeUp", 2);
    if (kit !== "sandevistan") simFx(me, "speed", 2);
    if (kit === "militech-apogee") simFx(me, "apogee", 2);
    simCrisis(me, "reflex", b);
  } else if (me.fx.apogee === 1 && eager && !simHurtBad(me)) { // Aşırı Yükleme
    me.overload++;
    me.fx.apogee++;
    me.fx.speed++;
  }
  if (simOn(me, "mad")) return;
  if (simHas(me, "berserk") && !me.spent.berserk && me.bon && (simHurtBad(me) || (eager && me.hand && me.hand.melee))) {
    me.spent.berserk = true;
    me.bon--;
    simFx(me, "berserk", 3);
  }
  if (me.lastLine) me.act++;
  if (simHas(me, "Rally") && !me.spent.rally && me.bon && !slip) {
    const crew = b.all.filter((f) => f.side === me.side && simUp(f));
    if (crew.filter(simHurtBad).length >= 2) {
      me.spent.rally = true;
      me.bon--;
      crew.forEach((f) => {
        f.hp = Math.min(f.hpMax, f.hp + simD(6));
        f.fx.flee = 0;
      });
    }
  }
  if (simHurtBad(me) && !slip) {
    if (simHas(me, "second-wind") && !me.spent.wind && me.bon) {
      me.spent.wind = true;
      me.hp = Math.min(me.hpMax, me.hp + simD(6) + me.mastery);
      me.bon--;
    } else if (simHas(me, "blood-recycler") && !me.spent.blood && me.bon) {
      me.spent.blood = true;
      me.hp = Math.min(me.hpMax, me.hp + simSum(simDice(3)));
      me.bon--;
    }
    if (me.bon && me.bounce > 0) {
      simHeal(me, me, "bounce");
      me.bon--;
    } else if (me.act && me.maxdoc > 0 && me.hp * 4 < me.hpMax) {
      simHeal(me, me, "maxdoc");
      me.act--;
    }
  }
  if (me.bleed && !slip && me.act && me.medicine >= 3) {
    simStopBleed(me, me);
    me.act--;
  }
  if (!slip && me.side === "party") {
    const friend = b.all.filter((f) => f !== me && f.side === me.side && f.down).sort((x, y) => simGap(me, x) - simGap(me, y))[0];
    if (friend && simGap(me, friend) <= simStride(me) * 2 && simD(100) <= 40 + a.fed * 0.6) {
      simGo(me, friend.pos, b);
      if (!simUp(me)) return;
      me.cover = null;
      if (me.bon && me.bounce > 0) {
        simHeal(me, friend, "bounce");
        me.bon--;
      } else if (me.bon && simHas(me, "field-medic")) {
        simStabilize(me, friend, b);
        me.bon--;
      } else if (me.act) {
        simStabilize(me, friend, b);
        me.act--;
      }
    }
    const near = (f) => simGap(f, me) <= simStride(me);
    const hurt = b.all.find((f) => f !== me && f.side === me.side && simUp(f) && simHurtBad(f) && near(f));
    if (hurt && me.act && simHas(me, "quick-fix") && !me.spent.fix) {
      me.spent.fix = true;
      simGo(me, hurt.pos, b);
      if (!simUp(me)) return;
      hurt.hp = Math.min(hurt.hpMax, hurt.hp + simD(6) + me.mastery);
      me.act--;
    }
    if (hurt && me.act && simHas(me, "painkiller") && !me.spent.pain) {
      me.spent.pain = true;
      simGo(me, hurt.pos, b);
      if (!simUp(me)) return;
      simFx(hurt, "painless", me.mastery);
      me.act--;
    }
    const mad = simHas(me, "sedative") && b.all.find((f) => f !== me && f.side === me.side && simOn(f, "mad") && !f.psycho && near(f));
    if (mad && me.act) {
      simGo(me, mad.pos, b);
      if (!simUp(me)) return;
      if (simRoll().total + me.medicine + simWound(me) > 11) mad.fx.mad = 0;
      me.act--;
    }
    const cut = me.medicine >= 3 && b.all.find((f) => f !== me && f.side === me.side && simUp(f) && f.bleed && near(f));
    if (cut && me.act) {
      simGo(me, cut.pos, b);
      if (!simUp(me)) return;
      simStopBleed(me, cut);
      me.act--;
    }
  }
  // Rockerboy dostuna Luck verir, melodi çalar
  if (me.inspire && me.bon && me.luck > 1) {
    const dry = simCrew(me, b).find((f) => f.side === "party" && f.luck < 1);
    if (dry) {
      me.luck--;
      dry.luck++;
      me.bon--;
    }
  }
  if (simHas(me, "Standing Ovation") && !me.spent.ovation && me.act && simCrew(me, b).length >= 2) {
    me.spent.ovation = true;
    me.act--;
    simCrew(me, b).forEach((f) => simFx(f, "cheer", 1));
  }
  const song = simPickSong(me, b);
  if (song && me.bon && simHas(me, "riot-starter") && !me.spent.riot) {
    me.spent.riot = true;
    me.bon--;
    simSing(me, song, b);
  } else if (song && me.act) {
    me.act--;
    simSing(me, song, b);
  }
  // Bodyguard Ağır Yaralı dostunun yanına geçer, ne kadar sık yaptığını Fedakârlık belirler
  if (simHas(me, "Take the Bullet") && simD(100) <= a.fed) {
    const ward = b.all.filter((f) => f !== me && f.side === me.side && simUp(f) && simHurtBad(f) && simGap(f, me) <= simStride(me)).sort((x, y) => x.hp - y.hp)[0];
    if (ward) {
      if (me.pos !== ward.pos) me.cover = null;
      simGo(me, ward.pos, b);
      if (!simUp(me)) return;
      me.hold = true;
    }
  }
  // Çekingen ve yaralı olan geri çekilir, tam siper varsa arkasına geçip o tur ateş etmez. Baskı ateşi yiyen de kaçar
  const scared = simOn(me, "flee") || (simHurtBad(me) && a.aggr < 40 && a.fed < 60);
  if (scared) {
    const away = b.all.find((f) => f.side !== me.side && simUp(f));
    if (away) simGo(me, me.pos + (me.pos > away.pos ? 1 : -1) * simStride(me), b);
    if (!simUp(me)) return;
    me.cover = null;
    me.hold = true;
    if (simHas(me, "optical-camo") && !me.spent.camo && me.bon) {
      me.spent.camo = true;
      me.bon--;
      simFx(me, "camo", 2);
      return; // kamuflaj saldırınca kapanır
    }
    if ((me.bon || simCoverFree(me)) && simTakeCover(me, b, true)) {
      if (!simCoverFree(me)) me.bon--; // hareketini kaçmaya harcadı, siper bonus aksiyonla
      return;
    }
  } else if (me.cover && me.cover.full) {
    me.cover = null; // ateş etmek için siperden çıkar
  }
  if (!me.cover && simD(100) > a.aggr * 0.7 && b.cover && b.cover.partial) {
    if (simTakeCover(me, b, false) && !simCoverFree(me)) me.stride--; // 2 metre (1 kare) hareket
  }
  const t = simTarget(me, b);
  if (!t) return;
  if (me.hacks.length && !t.down && !simOn(me, "blind")) {
    const q = simBestHack(me, t, b);
    if (q && !me.hackAction && me.bon) {
      simHack(me, t, q, b);
      me.bon--;
      if (!simUp(me)) return;
      const again = me.act && simHas(me, "double-upload") && (t.dead || t.out ? null : simBestHack(me, t, b));
      if (again && !again.over && simHackWorth(again, me, t, b) > simPower(me, t)) {
        simHack(me, t, again, b);
        me.act--;
      }
    } else if (q && me.hackAction && me.act && simHackWorth(q, me, t, b) > simPower(me, t)) {
      simHack(me, t, q, b);
      me.act--;
    }
    if (!simUp(me)) return;
  }
  if (me.bon && simHas(me, "Chosen Foe") && me.rival !== t) {
    const w = simPlan(me, t, b);
    if (w && w.melee) {
      me.rival = t;
      me.bon--;
    }
  }
  while (me.act > 0) {
    me.act--;
    const foe = t.dead || t.out || (t.down && me.side === "party") ? simTarget(me, b) : t;
    if (!foe) break;
    if (simThrow(me, foe, b)) continue;
    const hand = me.hand;
    if (simHas(me, "Overwatch") && hand && !hand.melee && hand.ammo && foe.cover && foe.cover.full) { // vuramadığı hedefin çıkmasını bekler
      me.watch = true;
      continue;
    }
    if (!simAttack(me, foe, b)) break;
    if (me.bon && simHas(me, "backup") && (me.spent.backup || 0) < me.mastery && simUp(foe)) {
      const pal = simCrew(me, b).find((f) => simCanReact(f, b) && f.hand && !f.hand.melee && f.hand.ammo);
      if (pal) {
        me.bon--;
        me.spent.backup = (me.spent.backup || 0) + 1;
        simSpend(pal, b);
        simFire(pal, pal.hand, foe, b);
      }
    }
  }
  if (!simUp(me)) return;
  if (me.killed && me.bon && simHas(me, "make-an-example")) {
    const seen = simRivals(me, b).find(simUp);
    if (seen) {
      me.bon--;
      if (simRoll().total + me.intim + simWound(me) > simRoll().total + seen.grit) simFx(seen, "shaken", 1);
    }
  }
  if (me.killed && simHas(me, "follow-through") && simCanReact(me, b)) {
    const next = simTarget(me, b);
    simSpend(me, b);
    if (next) {
      const w = simPlan(me, next, b);
      if (w && w.melee && simGap(me, next) <= simReach(w)) simStrike(me, w, next, b);
      else if (w && !w.melee && w.ammo) simFire(me, w, next, b);
    }
  }
}

// Süreler kendi turunun sonunda düşer
const SIM_ENDS = {
  berserk(f, b) {
    if (simRoll().total + f.grit <= 11) simFx(f, "mad", simD(6));
  },
  speed(f, b) {
    simHurt(f, simSum(simDice(1 + f.overload)), null, b);
    if (f.humanity !== undefined && simHas(f, "militech-apogee")) f.humanity -= (1 + f.overload) * simD(4);
  },
};

function simTick(f, b) {
  for (const k of Object.keys(f.fx)) if (f.fx[k] > 0 && --f.fx[k] === 0 && SIM_ENDS[k]) SIM_ENDS[k](f, b);
  for (const k of Object.keys(f.off)) if (f.off[k] > 0) f.off[k]--;
  f.playing = f.playing.filter((p) => {
    if (--p.left > 0) return true;
    if (simHas(f, "encore") && !f.spent.encore && simUp(f)) { // şarj harcamadan yeniden başlar
      f.spent.encore = true;
      p.left = p.s.t;
      simPlay(f, p.s, b);
      return true;
    }
    return false;
  });
}

function simTurn(me, b) {
  if (me.dead || me.out) return;
  b.now = me;
  me.reactOwn = me.reactOff = me.dodges = 0;
  me.killed = me.watch = me.chained = false;
  me.tap = null;
  me.stride = 0;
  me.stepped = me.hold = false;
  if (me.burn > 0) {
    me.burn--;
    simHurt(me, simD(4), null, b, "heat");
  }
  if (me.bleed && me.hp > 0) simHurt(me, 1, null, b);
  for (const c of b.clouds) {
    if (me.dead || me.out || simNear(me, c) > 2) continue;
    const extra = me.toxinDie ? simD(me.toxinDie.die) - me.toxinDie.minus : 0; // Kobay kökeni
    if (simRoll(simHas(me, "iron-stomach") ? 1 : 0).total + me.toxin + extra <= 14) simHurt(me, simSum(simDice(2)), c.by, b);
  }
  if (me.dead || me.out) return;
  if (me.down) {
    simSave(me, b);
    if (me.down && !me.asleep) {
      if (me.bounce > 0) simHeal(me, me, "bounce"); // bilinci açık ölümcül yaralı kendine bakar
      else if (me.maxdoc > 0) simHeal(me, me, "maxdoc");
      else {
        const kit = b.all.some((f) => f.side === me.side && f.medkit);
        if (simRoll(simHas(me, "improvised-kit") && kit ? 0 : -1).total + me.medicine + simWound(me) > 8) simRaise(me, 1);
      }
    }
  } else if (me.skip > 0) me.skip--;
  else if (!me.sleep) {
    if (me.hacks.length) me.ram = Math.min(me.ramMax, me.ram + (simHas(me, "deck-bridge") ? 2 : 1));
    simAct(me, b);
    me.ride = false; // Ride or Die kendi turunun sonuna kadar sürer
    me.lastLine = false;
    me.steppedLast = me.stepped;
  }
  if (!me.dead) simTick(me, b);
}

// Kazanan parti düşenleri ayağa kaldırmaya çalışır; ölüm kurtarma atışları sürer
function simAftercare(b) {
  const party = b.all.filter((f) => f.side === "party");
  for (let i = 0; i < SIM_CARE_ROUNDS && party.some((f) => f.down); i++) {
    for (const me of party.filter(simUp)) {
      const t = party.find((f) => f.down);
      if (!t) break;
      if (me.bounce > 0) simHeal(me, t, "bounce");
      else if (me.maxdoc > 0) simHeal(me, t, "maxdoc");
      else simStabilize(me, t, b);
    }
    party.filter((f) => f.down).forEach((f) => simSave(f, b));
  }
  party.filter((f) => f.down).forEach((f) => (f.dead = true));
}

// Tek savaş. Sonuç: { won: true | false | null, rounds, alive, toFoes, toParty, fighters }
function simBattle(partyDefs, foeDefs, opts) {
  const b = { reckless: opts.reckless, cover: opts.cover, toSide: { party: 0, foe: 0 }, all: [], clouds: [], now: null };
  const party = partyDefs.map((d) => simFresh(d));
  const foes = foeDefs.map((d) => simFresh(d));
  foes.forEach((f) => (f.pos = opts.start));
  party.forEach((f, i) => (f.lane = i * 2));
  foes.forEach((f, i) => (f.lane = i * 2));
  b.all = [...party, ...foes];
  b.all.forEach((f) => (f.hand = simPlan(f, f.side === "party" ? foes[0] : party[0], b)));
  const order = b.all.map((f) => ({ f, at: simRoll().total + f.init })).sort((x, y) => y.at - x.at).map((e) => e.f);
  let won = null;
  let rounds = 0;
  while (rounds < SIM_ROUND_CAP && won === null) {
    rounds++;
    b.clouds = b.clouds.filter((c) => c.left-- > 0);
    for (const me of order) {
      simTurn(me, b);
      if (foes.every((f) => f.out)) won = true;
      else if (party.every((f) => f.dead || f.down || f.out)) won = false;
      if (won !== null) break;
    }
  }
  if (won) simAftercare(b);
  if (won === false) {
    party.forEach((f) => {
      if (f.down || (f.out && simD(100) <= opts.reckless)) f.dead = true;
    });
  }
  return { won, rounds, alive: party.filter((f) => !f.dead).length, toFoes: b.toSide.foe, toParty: b.toSide.party, fighters: party };
}

// Çok savaşın birikmiş sonucu: tally önceki turu sürdürür
function simRun(partyDefs, foeDefs, opts, count, tally) {
  const sum = tally || { runs: 0, won: 0, lost: 0, none: 0, rounds: 0, toFoes: 0, toParty: 0, psycho: 0, alive: Array(partyDefs.length + 1).fill(0), chars: partyDefs.map(() => ({ dealt: 0, taken: 0, died: 0 })) };
  for (let i = 0; i < count; i++) {
    const r = simBattle(partyDefs, foeDefs, opts);
    sum.runs++;
    sum[r.won === true ? "won" : r.won === false ? "lost" : "none"]++;
    sum.rounds += r.rounds;
    sum.toFoes += r.toFoes;
    sum.toParty += r.toParty;
    sum.alive[r.alive]++;
    r.fighters.forEach((f, n) => {
      sum.chars[n].dealt += f.dealt;
      sum.chars[n].taken += f.taken;
      if (f.dead) sum.chars[n].died++;
      if (f.psycho) sum.psycho++;
    });
  }
  return sum;
}
