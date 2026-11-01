// ---------- Savaş Simülatörü: motor ----------
// Sayfaya ve veritabanına dokunmaz, ağ kullanmaz: js/simulator.js'in hazırladığı dövüşçülerle savaşı zarla oynatır.
// Harita yerine tek bir hat vardır: pos kare cinsinden konumdur, uzaklık iki dövüşçünün farkıdır. Menzil, siper ve kritik yara kural kitabındaki gibidir.
// Dövüşçü: { name, side: "party" | "foe", hp, sp, spFixed, body, evasion, medicine, netrun, qhDv, ram, init, mastery, move, luck,
//   weapons: [{ name, skill, bonus, n, k, rof, mag, auto, ideal: 0–2, melee }], spare, medkit, bounce, maxdoc, hacks, tags: Set, ai: { aggr, err, fed } }
// Seçenekler: { start, reckless, items, cover: null | { rate, partial, full, mats: [malzeme] } }

const SIM_ROUND_CAP = 100; // bu turda bitmeyen savaş sonuçsuz sayılır
const SIM_CARE_ROUNDS = 20; // savaştan sonra düşenler için ayrılan tur
const SIM_WANT = [2, 6, 14]; // ideal mesafedeki hedef uzaklık: Yakın, Orta, Uzak
const SIM_DODGE = { Handgun: 2, "Shoulder Arms": 4, "Heavy Weapons": 6 };
const SIM_COVER_HP = { "cok-zayif": 10, zayif: 15, orta: 25, saglam: 35, "cok-saglam": 50, guclendirilmis: 70 };
// Hasar veren quickhack'ler; kalanlar hesaba katılmaz
const SIM_HACKS = { shock: { n: 1 }, "short-circuit": { n: 2 }, overheat: { burn: 3 }, contagion: { n: 2 }, "synapse-burnout": { n: 3, hard: 5 } };

const simD = (n) => 1 + Math.floor(Math.random() * n);
const simDice = (n) => Array.from({ length: n }, () => simD(6));
const simSum = (list) => list.reduce((a, b) => a + b, 0);
const simBand = (cells) => (cells <= 3 ? 0 : cells <= 12 ? 1 : cells <= 50 ? 2 : 3);
const simGap = (a, b) => Math.abs(a.pos - b.pos);
const simHas = (f, id) => f.tags.has(id);
const simUp = (f) => !f.dead && !f.out && !f.down;
const simHurtBad = (f) => f.hp * 2 < f.hpMax;

// d10: doğal 10 bir d10 ekler, doğal 1 bir d10 çıkarır. edge: 1 avantaj, −1 dezavantaj
function simRoll(edge = 0) {
  const nat = edge ? (edge > 0 ? Math.max : Math.min)(simD(10), simD(10)) : simD(10);
  return { nat, total: nat === 10 ? 10 + simD(10) : nat === 1 ? 1 - simD(10) : nat };
}

function simWound(f) {
  const halved = simHas(f, "pain-tolerance");
  if (f.hp <= 0) return halved ? -2 : -4;
  if (!simHurtBad(f) || simHas(f, "pain-editor")) return 0;
  return halved ? -1 : -2;
}

function simFresh(def) {
  return {
    ...def, hpMax: def.hp, weapons: def.weapons.map((w) => ({ ...w, ammo: w.mag || 0 })), hacks: [...(def.hacks || [])],
    pos: 0, cover: null, ride: false, reacted: false, dodged: false, down: false, asleep: false, out: false, dead: false, stable: false, marked: false,
    fails: 0, saves: 0, skip: 0, bleed: false, burn: 0, evaPen: 0, firstSave: true, killed: false, spent: {}, dealt: 0, taken: 0,
  };
}

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
  const friend = b.all.find((f) => f !== t && f.side === t.side && simUp(f) && simHas(f, "nomw") && !f.spent.nomw && !f.reacted && simGap(f, t) <= 2);
  if (friend) {
    friend.spent.nomw = true;
    friend.reacted = true;
  } else if (simHas(t, "second-heart") && !t.spent.heart) {
    t.spent.heart = true;
    simRaise(t, simD(6));
  } else {
    t.dead = true;
    t.down = false;
  }
}

function simHurt(t, n, by, b) {
  if (n <= 0 || t.dead) return;
  const real = Math.min(t.hp, n);
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
    if (by) by.killed = true;
    return;
  }
  if (t.down) {
    simFail(t, b); // zırhı delen yeni isabet
    return;
  }
  t.down = true;
  t.out = false;
  t.fails = t.marked ? 1 : 0;
  t.asleep = t.marked;
  t.saves = 0;
  if (by) by.killed = true;
  b.all.forEach((f) => {
    if (f !== t && f.side === t.side && simHas(f, "ride-or-die")) f.ride = true;
  });
}

// Gövde kritik yara tablosu: yalnızca savaşı etkileyenler
function simInjury(t) {
  const roll = simD(8);
  if (roll === 5) t.bleed = true;
  else if (roll === 6) t.move = Math.ceil(t.move / 2);
  else if (roll === 7) {
    t.hpMax = Math.max(1, t.hpMax - 5);
    t.hp = Math.min(t.hp, t.hpMax);
  } else if (roll === 8) {
    t.skip = 1;
    t.evaPen = 2;
  }
}

function simSave(me, b) {
  const roll = simRoll(me.firstSave && simHas(me, "biomonitor-mk2") ? 1 : 0);
  me.firstSave = false;
  const total = roll.total + me.body + (simHas(me, "die-hard") ? 1 : 0);
  if (roll.nat !== 1 && total > 5 + me.saves + (me.bleed ? 1 : 0)) me.saves++;
  else simFail(me, b);
}

// ---- Saldırı ----
function simDamage(me, t, dice, total, b, melee) {
  if (simHas(me, "spot-weakness") && (me.spent.spot || 0) < me.mastery) {
    me.spent.spot = (me.spent.spot || 0) + 1;
    total += simD(6);
  }
  const armor = t.sp + t.spFixed;
  const sp = melee ? Math.ceil(armor / 2) : armor;
  let through = Math.max(0, total - sp);
  const crit = dice.filter((v) => v === 6).length >= 2 && total > sp;
  if (t.sp > 0) t.sp--;
  if (crit) {
    through += 5 + (simHas(me, "overkill") ? me.mastery : 0);
    simInjury(t);
  }
  simHurt(t, through, me, b);
}

// Fazla hasar arkadaki kişiye gövde isabeti olarak geçer: zırh işler ve aşınır, kritik yara açmaz
function simCoverHit(t, total, me, b) {
  t.cover.hp -= total;
  if (t.cover.hp > 0) return;
  const over = -t.cover.hp;
  t.cover = null;
  const armor = t.sp + t.spFixed;
  if (t.sp > 0) t.sp--;
  simHurt(t, Math.max(0, over - armor), me, b);
}

function simPush(me, t, b) {
  let n = simWound(me);
  if (simHas(me, "killer-instinct") && simHurtBad(t)) n++;
  if (simHas(me, "side-by-side") && b.all.some((f) => f !== me && f.side === me.side && simUp(f) && simGap(f, me) <= 1)) n++;
  return n;
}

function simDodge(t, w, dv, guard) {
  if (t.down || t.out || t.reacted || t.dodged) return dv + guard;
  t.reacted = t.dodged = true;
  const luck = t.side === "party" && simHurtBad(t) ? t.luck : 0;
  t.luck -= luck;
  const result = simRoll().total + t.evasion - (SIM_DODGE[w.skill] || 2) + simWound(t) - t.evaPen + luck;
  return result > dv ? result + guard : dv + guard;
}

function simFire(me, w, t, b) {
  const dv = 8 + 3 * Math.abs(simBand(Math.max(1, simGap(me, t))) - w.ideal);
  const guard = t.cover && !t.cover.full ? (simHas(t, "cover-expert") ? 3 : 2) : 0;
  const auto = w.auto && w.ammo >= 10 && w.bonus + 5.5 - dv - guard >= 2;
  w.ammo -= auto ? 10 : 1;
  if (t.cover && t.cover.full) {
    simCoverHit(t, simSum(simDice(w.n)) + w.k, me, b);
    return;
  }
  const push = simPush(me, t, b);
  const luck = me.side === "party" && me.luck > 0 && me.ai.aggr >= 50 && dv + guard - w.bonus - push >= 6 ? 1 : 0;
  me.luck -= luck;
  const total = simRoll(me.ride ? 1 : 0).total + w.bonus + push + luck;
  if (total <= dv + guard) {
    if (total > dv) simCoverHit(t, simSum(simDice(w.n)) + w.k, me, b); // yalnızca siper yüzünden kaçan kurşun sipere gider
    return;
  }
  const need = simDodge(t, w, dv, guard);
  if (total <= need) return;
  const dice = simDice(auto ? 2 : w.n);
  simDamage(me, t, dice, auto ? simSum(dice) * Math.min(total - need, w.auto) : simSum(dice) + w.k, b, false);
}

function simStrike(me, w, t, b) {
  const total = simRoll(me.ride ? 1 : 0).total + w.bonus + simPush(me, t, b);
  const defense = t.down || t.out ? 0 : simRoll().total + t.evasion + simWound(t) - t.evaPen;
  if (total <= defense) return;
  const dice = simDice(w.n);
  simDamage(me, t, dice, simSum(dice) + w.k, b, true);
}

function simHack(me, t, b) {
  const pick = me.hacks.filter((q) => q.ram <= me.ram).sort((x, y) => y.ram - x.ram)[0];
  if (!pick) return false;
  me.ram -= pick.ram;
  if (simRoll().total + me.netrun + simWound(me) <= t.qhDv) return true;
  if (pick.burn) t.burn = pick.burn;
  else simHurt(t, simSum(simDice(pick.hard && simHurtBad(t) ? pick.hard : pick.n)), me, b);
  return true;
}

// ---- Karar ----
function simTarget(me, b) {
  const rivals = b.all.filter((f) => f.side !== me.side && !f.dead && !f.out);
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

function simAfterMove(me, w, gap) {
  const want = w.melee ? 1 : SIM_WANT[w.ideal];
  if (gap > want) return Math.max(want, gap - me.move);
  return !w.melee && simBand(gap) !== w.ideal ? Math.min(want, gap + me.move) : gap;
}

function simPlan(me, t) {
  let best = null;
  let top = -Infinity;
  for (const w of me.weapons) {
    if (!w.melee && !w.ammo && !me.spare) continue;
    const gap = simAfterMove(me, w, simGap(me, t));
    if (w.melee && gap > 1) {
      if (top < -1) best = w; // ulaşılamayan yakın dövüş silahı yalnızca son çaredir
      top = Math.max(top, -1);
      continue;
    }
    const dv = w.melee ? 5.5 + t.evasion : 8 + 3 * Math.abs(simBand(Math.max(1, gap)) - w.ideal);
    const chance = Math.max(0.1, Math.min(0.95, (w.bonus + 5.5 - dv) / 10 + 0.5));
    const hit = Math.max(1, w.n * 3.5 + w.k - (w.melee ? Math.ceil(t.sp / 2) : t.sp));
    const score = chance * hit * (w.rof || 1);
    if (score > top) {
      top = score;
      best = w;
    }
  }
  return best;
}

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
  if (simRoll(edge).total + me.medicine + simWound(me) + bonus > 8) simRaise(t, 1);
}

function simAttack(me, t, b) {
  const w = simPlan(me, t);
  if (!w) return false;
  const gap = simGap(me, t);
  const next = simAfterMove(me, w, gap);
  if (next !== gap) {
    const dir = t.pos > me.pos ? 1 : -1;
    me.pos = t.pos - dir * next;
    if (me.cover) {
      me.cover = null;
      if (b.cover && b.cover.partial) simTakeCover(me, b, false);
    }
  }
  if (w.melee && next > 1) {
    me.pos = t.pos - (t.pos > me.pos ? 1 : -1) * Math.max(1, next - me.move); // koşmak aksiyondur
    return true;
  }
  if (!w.melee && !w.ammo) {
    w.ammo = w.mag;
    me.spare--;
    if (!simHas(me, "professional")) return true;
  }
  for (let i = 0; i < (w.rof || 1); i++) {
    const foe = i && (t.dead || t.out || t.down) ? simTarget(me, b) : t;
    if (!foe || (!w.melee && !w.ammo) || (w.melee && simGap(me, foe) > 1)) break;
    (w.melee ? simStrike : simFire)(me, w, foe, b);
  }
  return true;
}

function simAct(me, b) {
  const a = me.ai;
  const slip = simD(100) <= a.err; // hata payı: iyileşmek ya da dostuna gitmek yerine saldırır
  let actions = 1;
  let bonus = 1;
  const eager = simD(100) <= a.aggr;
  if (simHas(me, "adrenaline-rush") && !me.spent.rush && eager) {
    me.spent.rush = true;
    actions++;
  }
  if ((simHas(me, "sandevistan") || simHas(me, "sandevistan-mk2")) && !me.spent.sandy && eager) {
    me.spent.sandy = true;
    actions++;
    bonus--;
  }
  if (simHurtBad(me) && !slip) {
    if (simHas(me, "second-wind") && !me.spent.wind && bonus) {
      me.spent.wind = true;
      me.hp = Math.min(me.hpMax, me.hp + simD(6) + me.mastery);
      bonus--;
    } else if (simHas(me, "blood-recycler") && !me.spent.blood && bonus) {
      me.spent.blood = true;
      me.hp = Math.min(me.hpMax, me.hp + simSum(simDice(3)));
      bonus--;
    }
    if (bonus && me.bounce > 0) {
      simHeal(me, me, "bounce");
      bonus--;
    } else if (actions && me.maxdoc > 0 && me.hp * 4 < me.hpMax) {
      simHeal(me, me, "maxdoc");
      actions--;
    }
  }
  if (!slip && me.side === "party") {
    const friend = b.all.filter((f) => f !== me && f.side === me.side && f.down).sort((x, y) => simGap(me, x) - simGap(me, y))[0];
    if (friend && simGap(me, friend) <= me.move * 2 && simD(100) <= 40 + a.fed * 0.6) {
      me.pos = friend.pos;
      me.cover = null;
      if (bonus && me.bounce > 0) {
        simHeal(me, friend, "bounce");
        bonus--;
      } else if (bonus && simHas(me, "field-medic")) {
        simStabilize(me, friend, b);
        bonus--;
      } else if (actions) {
        simStabilize(me, friend, b);
        actions--;
      }
    }
    const hurt = b.all.find((f) => f !== me && f.side === me.side && simUp(f) && simHurtBad(f) && simGap(f, me) <= me.move);
    if (hurt && actions && simHas(me, "quick-fix") && !me.spent.fix) {
      me.spent.fix = true;
      me.pos = hurt.pos;
      hurt.hp = Math.min(hurt.hpMax, hurt.hp + simD(6) + me.mastery);
      actions--;
    }
  }
  // Çekingen ve yaralı olan geri çekilir, tam siper varsa arkasına geçip o tur ateş etmez
  const scared = simHurtBad(me) && a.aggr < 40 && a.fed < 60;
  if (scared) {
    const away = b.all.find((f) => f.side !== me.side && simUp(f));
    if (away) me.pos += (me.pos > away.pos ? 1 : -1) * me.move;
    me.cover = null;
    if (bonus && simTakeCover(me, b, true) && me.cover.full) return;
  } else if (me.cover && me.cover.full) {
    me.cover = null; // ateş etmek için siperden çıkar
  }
  if (bonus && !me.cover && simD(100) > a.aggr * 0.7 && b.cover && b.cover.partial) {
    if (simTakeCover(me, b, false)) bonus--;
  }
  const t = simTarget(me, b);
  if (!t) return;
  if (bonus && me.hacks.length && !t.down && simHack(me, t, b)) bonus--;
  for (; actions > 0; actions--) {
    const foe = t.dead || t.out || (t.down && me.side === "party") ? simTarget(me, b) : t;
    if (!foe || !simAttack(me, foe, b)) break;
  }
  if (me.killed && simHas(me, "follow-through") && !me.reacted) {
    const next = simTarget(me, b);
    me.reacted = true;
    if (next) {
      const w = simPlan(me, next);
      if (w && w.melee && simGap(me, next) <= 1) simStrike(me, w, next, b);
      else if (w && !w.melee && w.ammo) simFire(me, w, next, b);
    }
  }
}

function simTurn(me, b) {
  if (me.dead || me.out) return;
  me.reacted = me.dodged = me.killed = false;
  if (me.burn > 0) {
    me.burn--;
    simHurt(me, simD(4), null, b);
  }
  if (me.bleed && me.hp > 0) simHurt(me, 1, null, b);
  if (me.dead || me.out) return;
  if (me.down) {
    simSave(me, b);
    if (!me.down || me.asleep) return;
    if (me.bounce > 0) simHeal(me, me, "bounce"); // bilinci açık ölümcül yaralı kendine bakar
    else if (me.maxdoc > 0) simHeal(me, me, "maxdoc");
    else {
      const kit = b.all.some((f) => f.side === me.side && f.medkit);
      if (simRoll(simHas(me, "improvised-kit") && kit ? 0 : -1).total + me.medicine + simWound(me) > 8) simRaise(me, 1);
    }
    return;
  }
  if (me.skip > 0) {
    me.skip--;
    return;
  }
  if (me.hacks.length) me.ram = Math.min(me.ramMax, me.ram + (simHas(me, "deck-bridge") ? 2 : 1));
  simAct(me, b);
  me.ride = false; // Ride or Die kendi turunun sonuna kadar sürer
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
  const b = { reckless: opts.reckless, cover: opts.cover, toSide: { party: 0, foe: 0 }, all: [] };
  const party = partyDefs.map((d) => simFresh(d));
  const foes = foeDefs.map((d) => simFresh(d));
  foes.forEach((f) => (f.pos = opts.start));
  b.all = [...party, ...foes];
  const order = b.all.map((f) => ({ f, at: simRoll().total + f.init })).sort((x, y) => y.at - x.at).map((e) => e.f);
  let won = null;
  let rounds = 0;
  while (rounds < SIM_ROUND_CAP && won === null) {
    rounds++;
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
  const sum = tally || { runs: 0, won: 0, lost: 0, none: 0, rounds: 0, toFoes: 0, toParty: 0, alive: Array(partyDefs.length + 1).fill(0), chars: partyDefs.map(() => ({ dealt: 0, taken: 0, died: 0 })) };
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
    });
  }
  return sum;
}
