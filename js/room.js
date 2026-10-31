// ---------- Masa odası (#masa/<kimlik>) ----------
// Oda bütün ekranı kaplar; site menüsü görünmez. js/auth.js masaya girişi denetler ve mountRoom'u çağırır.
// Oyuncu odaya ilk girişinde kayıtlı karakterlerinden birini seçer. Seçilen karakterin kopyası masaya yazılır (tables/{id}/sheets/{kağıt});
// kağıt masaya aittir, Karakter Oluştur'daki kayıttan bağımsızdır, owner alanı onu kimin kullandığını gösterir. GM karakter seçmez.
// #masa/deneme: Deneme Odası. Veri yalnızca bu tarayıcıda durur, Firebase'e yazılmaz; GM ve oyuncu görünümü arasında geçilebilir.
// Odanın parçaları: sol üstte Zar, Tur, Kullanıcılar · sağda araç kutusu · altta karakter çekmecesi ve kağıt penceresi.

const ROOM_TEXT = {
  tr: {
    leave: "Masadan Çık", closeTable: "Masayı Kapat", gm: "GM", level: (n) => `${n}. seviye`, soon: "Yakında",
    pickTitle: "Karakterini Seç", pickHint: "Bu masada oynayacağın karakteri seç. Karakterin kopyası masaya geçer; oyun boyunca masadaki kağıt, kayıtlı karakterinden bağımsız ilerler.",
    pickAsk: (n) => `“${n}” ile girilsin mi? Bu masada kağıdın bu karakterin kopyası olur.`, pickYes: "Gir",
    noChars: "Masaya girmek için kayıtlı bir karakterin olmalı.", makeChar: "Karakter Oluştur",
    dice: "Zar", turns: "Tur", users: "Kullanıcılar", secret: "Gizli At", secretTag: "Gizli", noRolls: "Henüz zar atılmadı.", localRolls: "Şimdilik sonuçlar yalnızca sende görünür.",
    sheet: (n) => `${n} Karakter Kağıdı`, close: "Kapat", drawer: "Karakter çekmecesi", down: "Azalt", up: "Artır",
    viewPlayer: "Oyuncu Gibi Gör", viewGm: "GM Gibi Gör", resetDemo: "Denemeyi Sıfırla", demoTag: "Deneme", sample: "Deneme Karakteri",
  },
  en: {
    leave: "Leave Table", closeTable: "Close Table", gm: "GM", level: (n) => `Level ${n}`, soon: "Coming soon",
    pickTitle: "Choose Your Character", pickHint: "Choose the character you'll play at this table. A copy goes to the table; from then on the sheet here moves on separately from your saved character.",
    pickAsk: (n) => `Enter as “${n}”? Your sheet at this table will be a copy of this character.`, pickYes: "Enter",
    noChars: "You need a saved character to join a table.", makeChar: "Create a Character",
    dice: "Dice", turns: "Turns", users: "Users", secret: "Roll Secretly", secretTag: "Secret", noRolls: "No rolls yet.", localRolls: "For now, results only show up for you.",
    sheet: (n) => `${n} Character Sheet`, close: "Close", drawer: "Character drawer", down: "Decrease", up: "Increase",
    viewPlayer: "View as Player", viewGm: "View as GM", resetDemo: "Reset Test", demoTag: "Test", sample: "Test Character",
  },
};

const ROOM_DIE_SIDES = [4, 6, 8, 10, 20];
const ROOM_LOG_MAX = 12;
const ROOM_DEMO_KEY = "cg-demo-room";
const roomRole = (id) => (CLASSES.find((c) => c.id === id) || {}).name || "";
const roomRoll = (sides) => 1 + Math.floor(Math.random() * sides);

// Zar: d10'da doğal 10 bir d10 ekler, doğal 1 bir d10 çıkarır; ek zar bir daha patlamaz
function roomRollDie(sides) {
  const first = roomRoll(sides);
  if (sides !== 10 || (first !== 10 && first !== 1)) return { sides, first, total: first, extra: null };
  const extra = roomRoll(10);
  return { sides, first, extra, total: first === 10 ? first + extra : first - extra };
}
const roomRollText = (r) => (r.extra == null ? `${r.total}` : `${r.first} ${r.first === 10 ? "+" : "−"} ${r.extra} = ${r.total}`);

// Deneme Odası: kağıt bu tarayıcıda durur
function roomDemoStore() {
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(ROOM_DEMO_KEY));
    } catch (e) {
      return null;
    }
  };
  const write = (sheet) => {
    try {
      localStorage.setItem(ROOM_DEMO_KEY, JSON.stringify(sheet));
    } catch (e) {}
  };
  return {
    getSheet: async () => read(),
    async createSheet(c) {
      const sheet = { id: "deneme", owner: "deneme", charId: c.id, name: c.name, role: c.role, level: c.data.seviye || 1, data: c.data, ...ccVitals(c.data) };
      write(sheet);
      return sheet;
    },
    update: async (id, patch) => write({ ...read(), ...patch }),
    watch: () => () => {},
    clear() {
      try {
        localStorage.removeItem(ROOM_DEMO_KEY);
      } catch (e) {}
    },
  };
}

function roomTableStore(tableId) {
  const s = window.CG_STORE;
  return {
    getSheet: () => s.getTableSheet(tableId),
    createSheet: (c) => s.createTableSheet(tableId, c),
    update: (id, patch) => s.updateTableSheet(tableId, id, patch),
    watch: (id, cb) => s.watchTableSheet(tableId, id, cb),
  };
}

// Kayıtlı karakteri olmayan da Deneme Odası'nı deneyebilsin
function roomSampleChar(name) {
  const data = ccBlank().data;
  data.profil = { handle: name };
  data.sinif = "solo";
  data.statlar.method = "dizi";
  Object.assign(data.statlar.dizi, { INT: 10, REF: 15, DEX: 13, TECH: 10, COOL: 12, WILL: 11, BODY: 14 });
  data.skiller = { prof: { handgun: 2, evasion: 1, athletics: 1 }, mastery: "handgun" };
  data.feat = { picks: ["tough"], saved: false };
  data.cyberware = { picks: ["kiroshi-optics-mk1", "subdermal-plating", "biomonitor-mk1"], chipSkill: null, toFeat: false };
  data.esyalar = { picks: { silah: "unity", zirh: "kevlar-yelek", kask: "kevlar-bere" }, instrument: "" };
  return { id: "ornek", name, role: "solo", data };
}

// İlk girişte karakter seçimi
function roomPicker(el, ctx, chars, L, onPick) {
  const t = ROOM_TEXT[L];
  const body = chars.length
    ? `<p class="cc-hint">${t.pickHint}</p>
       <div class="room-chars">${chars.map((c) => `<button type="button" class="room-char" data-char="${c.id}" style="--sheet-color: ${CLASS_COLORS[c.role] || "#fff"}"><b>${ccEsc(c.name)}</b><span>${ccEsc(roomRole(c.role))} · ${t.level((c.data && c.data.seviye) || 1)}</span></button>`).join("")}</div>`
    : `<p class="cc-hint">${t.noChars}</p><a class="cc-btn primary" href="#araclar/karakter-olustur">${t.makeChar}</a>`;
  el.innerHTML = `
    <div class="room room-pick">
      <div class="room-stage" aria-hidden="true"></div>
      <section class="room-panel">
        <p class="room-table">${ccEsc(ctx.name)}</p>
        <h1>${t.pickTitle}</h1>
        ${body}
        <div class="room-panel-foot"><a class="cc-btn" href="${ctx.leaveHref}">${t.leave}</a></div>
      </section>
    </div>`;
  el.querySelector(".room-chars")?.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-char]");
    const c = b && chars.find((x) => x.id === b.dataset.char);
    if (c && (await ccConfirm(t.pickAsk(c.name), L, t.pickYes))) onPick(c);
  });
}

// Odanın kendisi: durum bu kapanışta tutulur, parçalar ayrı ayrı yeniden çizilir
function roomShell(el, ctx, sheet, L, store) {
  const t = ROOM_TEXT[L];
  const c = CC_TEXT[L];
  const asGm = !sheet;
  let rolls = [];
  let secret = false;
  let drawerOpen = false;
  let sheetOpen = false;
  let saveTimer = null;
  const color = () => (sheet && CLASS_COLORS[sheet.role]) || "#ffffff";
  const tool = (key, label) => `<button type="button" class="room-tool" ${key ? `data-room="${key}" aria-expanded="false"` : `disabled title="${t.soon}"`}>${label}</button>`;

  el.innerHTML = `
    <div class="room">
      <div class="room-stage" aria-hidden="true"></div>
      <div class="room-left">
        <div class="room-buttons">${tool("dice", t.dice)}${tool(null, t.turns)}${tool(null, t.users)}</div>
        <section class="room-box room-dice" hidden></section>
      </div>
      <p class="room-name"><b>${ccEsc(ctx.name)}</b>${ctx.demo ? `<span>${t.demoTag}</span>` : ""}</p>
      <aside class="room-tools">
        ${ctx.demo ? `<button type="button" class="cc-btn primary" data-room-view>${asGm ? t.viewPlayer : t.viewGm}</button><button type="button" class="cc-btn" data-room-reset>${t.resetDemo}</button>` : ""}
        <a class="cc-btn" href="${ctx.leaveHref}">${t.leave}</a>
        ${ctx.isGm && !ctx.demo ? `<button type="button" class="cc-btn danger" data-close-table>${t.closeTable}</button>` : ""}
      </aside>
      ${sheet ? `<div class="room-drawer" style="--sheet-color: ${color()}">
        <button type="button" class="room-drawer-tab" data-room-drawer aria-expanded="false" aria-label="${t.drawer}"><span aria-hidden="true">▲</span></button>
        <div class="room-drawer-body" hidden></div>
      </div>
      <section class="room-pop" hidden style="--sheet-color: ${color()}"></section>` : `<div class="room-bar"><b>${t.gm}</b></div>`}
    </div>`;

  const dice = el.querySelector(".room-dice");
  const drawer = el.querySelector(".room-drawer-body");
  const pop = el.querySelector(".room-pop");

  const drawDice = () => {
    dice.innerHTML = `
      <div class="room-dice-row">${ROOM_DIE_SIDES.map((s) => `<button type="button" class="room-die" data-die="${s}">d${s}</button>`).join("")}</div>
      ${asGm ? `<button type="button" class="shop-chip${secret ? " on" : ""}" data-room-secret aria-pressed="${secret}">${t.secret}</button>` : ""}
      <ul class="room-rolls">${rolls.length
        ? rolls.map((r) => `<li><span>${ccEsc(r.who)}</span><small>d${r.sides}${r.secret ? ` · ${t.secretTag}` : ""}</small><b>${roomRollText(r)}</b></li>`).join("")
        : `<li class="room-empty">${t.noRolls}</li>`}</ul>
      ${ctx.demo ? "" : `<p class="room-note">${t.localRolls}</p>`}`;
  };

  // HP, Humanity ve Luck: çekmecede ve kağıt penceresinde aynı sayaçlar
  const vitals = () => {
    const row = (key, label, max) => `
      <div class="room-vital">
        <b>${label}</b>
        <div>
          <button type="button" data-vital="${key}" data-step="-1" aria-label="${t.down}">−</button>
          <output>${sheet[key]} / ${max}</output>
          <button type="button" data-vital="${key}" data-step="1" aria-label="${t.up}">+</button>
        </div>
      </div>`;
    return `<div class="room-vitals">${row("hp", "HP", sheet.hpMax)}${row("humanity", c.humanity, sheet.humanityMax)}${row("luck", "Luck", sheet.luckMax)}</div>`;
  };
  const drawDrawer = () => {
    if (!sheet) return;
    drawer.innerHTML = `
      <button type="button" class="room-sheet-btn" data-room-sheet>${ccEsc(t.sheet(sheet.name))}</button>
      ${vitals()}`;
  };
  const drawPop = () => {
    if (!sheet) return;
    pop.innerHTML = `
      <header><b>${ccEsc(sheet.name)}</b><span>${ccEsc(roomRole(sheet.role))} · ${t.level(sheet.level)}</span><button type="button" class="room-pop-close" data-room-sheet aria-label="${t.close}">×</button></header>
      ${vitals()}
      <div class="cc-sheet-body">${ccSheetOf(sheet.data, L, `${sheet.humanity} / ${sheet.humanityMax}`).replaceAll("#39ff14", "var(--sheet-color)")}</div>`;
  };
  const drawAll = () => {
    drawDrawer();
    if (sheetOpen) drawPop();
  };

  const setVital = (key, step) => {
    const hi = sheet[`${key}Max`];
    const lo = key === "humanity" ? -Infinity : 0; // Humanity 0'ın altına inebilir
    const next = Math.max(lo, Math.min(hi, sheet[key] + step));
    if (next === sheet[key]) return;
    sheet = { ...sheet, [key]: next };
    drawAll();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => store.update(sheet.id, { hp: sheet.hp, humanity: sheet.humanity, luck: sheet.luck }), 400); // art arda tıklamalar tek yazma olsun
  };

  el.querySelector(".room").addEventListener("click", (e) => {
    const b = (sel) => e.target.closest(sel);
    let x;
    if ((x = b('[data-room="dice"]'))) {
      dice.hidden = !dice.hidden;
      x.setAttribute("aria-expanded", !dice.hidden);
      x.classList.toggle("on", !dice.hidden);
    } else if ((x = b("[data-die]"))) {
      const who = sheet ? sheet.name : t.gm;
      rolls = [{ ...roomRollDie(Number(x.dataset.die)), who, secret }, ...rolls].slice(0, ROOM_LOG_MAX);
      drawDice();
    } else if (b("[data-room-secret]")) {
      secret = !secret;
      drawDice();
    } else if ((x = b("[data-room-drawer]"))) {
      drawerOpen = !drawerOpen;
      drawer.hidden = !drawerOpen;
      x.setAttribute("aria-expanded", drawerOpen);
      x.classList.toggle("on", drawerOpen);
    } else if (b("[data-room-sheet]")) {
      sheetOpen = !sheetOpen;
      pop.hidden = !sheetOpen;
      if (sheetOpen) drawPop();
    } else if ((x = b("[data-vital]"))) {
      setVital(x.dataset.vital, Number(x.dataset.step));
    } else if (b("[data-room-view]")) {
      ctx.view(asGm ? "player" : "gm");
    } else if (b("[data-room-reset]")) {
      store.clear();
      ctx.view("gm");
    }
  });

  drawDice();
  drawDrawer();
  // Kağıt başka yerden değişirse (GM ya da başka sekme) sayaçlar güncellenir
  if (sheet) ctx.onLeave(store.watch(sheet.id, (next) => {
    sheet = { ...sheet, hp: next.hp, humanity: next.humanity, luck: next.luck };
    drawAll();
  }));
}

// ctx: { id, name, isGm, demo, leaveHref }
async function mountRoom(el, ctx) {
  const L = typeof lang !== "undefined" && lang === "en" ? "en" : "tr";
  const store = ctx.demo ? roomDemoStore() : roomTableStore(ctx.id);
  const stops = [];
  ctx.onLeave = (stop) => stops.push(stop);
  const leave = () => {
    stops.splice(0).forEach((stop) => stop());
    window.removeEventListener("hashchange", leave);
  };
  window.addEventListener("hashchange", leave);
  const fail = (err) => {
    el.innerHTML = `
      <div class="room room-pick">
        <div class="room-stage" aria-hidden="true"></div>
        <section class="room-panel">
          <p class="room-table">${ccEsc(ctx.name)}</p>
          <p class="cc-hint">${ccEsc(window.CG_STORE.errorText(err))}</p>
          <div class="room-panel-foot"><a class="cc-btn" href="${ctx.leaveHref}">${ROOM_TEXT[L].leave}</a></div>
        </section>
      </div>`;
  };
  const enterAsPlayer = async () => {
    try {
      const sheet = await store.getSheet();
      if (sheet) return roomShell(el, ctx, sheet, L, store);
      const saved = await window.CG_STORE.listChars();
      const chars = ctx.demo ? [...saved, roomSampleChar(ROOM_TEXT[L].sample)] : saved;
      roomPicker(el, ctx, chars, L, async (c) => {
        try {
          roomShell(el, ctx, await store.createSheet(c), L, store);
        } catch (err) {
          fail(err);
        }
      });
    } catch (err) {
      fail(err);
    }
  };
  ctx.view = (mode) => {
    stops.splice(0).forEach((stop) => stop());
    return mode === "player" ? enterAsPlayer() : roomShell(el, ctx, null, L, store);
  };
  return ctx.isGm ? roomShell(el, ctx, null, L, store) : enterAsPlayer();
}
