// ---------- Masa odası (#masa/<kimlik>) ----------
// Oda bütün ekranı kaplar; site menüsü görünmez. js/auth.js masaya girişi denetler ve mountRoom'u çağırır.
// Oyuncu odaya ilk girişinde kayıtlı karakterlerinden birini seçer. Seçilen karakterin kopyası masaya yazılır (tables/{id}/sheets/{kağıt});
// kağıt masaya aittir, Karakter Oluştur'daki kayıttan bağımsızdır, owner alanı onu kimin kullandığını gösterir. GM karakter seçmez.
// #masa/deneme: Deneme Odası. Veri yalnızca bu tarayıcıda durur, Firebase'e yazılmaz; GM ve oyuncu görünümü arasında geçilebilir.
// Odanın parçaları: sol üstte Zar, Tur, Kullanıcılar · sağ üstte oda menüsü · sağda araç kutusu ve altta obje çubuğu (js/roomboard.js) · altta çekmece ve kağıt penceresi.

const ROOM_TEXT = {
  tr: {
    leave: "Masadan Çık", closeTable: "Masayı Kapat", gm: "GM", level: (n) => `${n}. seviye`, soon: "Yakında",
    pickTitle: "Karakterini Seç", pickHint: "Bu masada oynayacağın karakteri seç. Karakterin kopyası masaya geçer; oyun boyunca masadaki kağıt, kayıtlı karakterinden bağımsız ilerler.",
    pickAsk: (n) => `“${n}” ile girilsin mi? Bu masada kağıdın bu karakterin kopyası olur.`, pickYes: "Gir",
    noChars: "Masaya girmek için kayıtlı bir karakterin olmalı.", makeChar: "Karakter Oluştur",
    dice: "Zar", turns: "Tur", users: "Kullanıcılar", secret: "Gizli At", secretTag: "Gizli", noRolls: "Henüz zar atılmadı.", localRolls: "Şimdilik sonuçlar yalnızca sende görünür.",
    sheet: (n) => `${n} Karakter Kağıdı`, close: "Kapat", drawer: "Karakter çekmecesi", down: "Azalt", up: "Artır",
    viewPlayer: "Oyuncu Gibi Gör", viewGm: "GM Gibi Gör", resetDemo: "Denemeyi Sıfırla", demoTag: "Deneme", sample: "Deneme Karakteri",
    menu: "Oda menüsü", tableSheets: "Masadaki Kağıtlar", noSheets: "Masada henüz kağıt yok.", addSheet: "Kağıt Ekle", noSaved: "Eklenecek kayıtlı karakterin yok.", loading: "Yükleniyor…",
  },
  en: {
    leave: "Leave Table", closeTable: "Close Table", gm: "GM", level: (n) => `Level ${n}`, soon: "Coming soon",
    pickTitle: "Choose Your Character", pickHint: "Choose the character you'll play at this table. A copy goes to the table; from then on the sheet here moves on separately from your saved character.",
    pickAsk: (n) => `Enter as “${n}”? Your sheet at this table will be a copy of this character.`, pickYes: "Enter",
    noChars: "You need a saved character to join a table.", makeChar: "Create a Character",
    dice: "Dice", turns: "Turns", users: "Users", secret: "Roll Secretly", secretTag: "Secret", noRolls: "No rolls yet.", localRolls: "For now, results only show up for you.",
    sheet: (n) => `${n} Character Sheet`, close: "Close", drawer: "Character drawer", down: "Decrease", up: "Increase",
    viewPlayer: "View as Player", viewGm: "View as GM", resetDemo: "Reset Test", demoTag: "Test", sample: "Test Character",
    menu: "Room menu", tableSheets: "Table Sheets", noSheets: "No sheets at this table yet.", addSheet: "Add Sheet", noSaved: "You have no saved characters to add.", loading: "Loading…",
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

// Deneme Odası: kağıtlar bu tarayıcıda durur
function roomDemoStore() {
  const read = () => {
    try {
      const v = JSON.parse(localStorage.getItem(ROOM_DEMO_KEY));
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  };
  const write = (list) => {
    try {
      localStorage.setItem(ROOM_DEMO_KEY, JSON.stringify(list));
    } catch (e) {}
  };
  const make = (c, owner) => ({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), owner, charId: c.id, name: c.name, role: c.role, level: c.data.seviye || 1, data: c.data, ...ccVitals(c.data) });
  return {
    getSheet: async () => read().find((x) => x.owner === "deneme") || null,
    listSheets: async () => read(),
    async createSheet(c) {
      const sheet = make(c, "deneme");
      write([...read(), sheet]);
      return sheet;
    },
    async addSheet(c) {
      const sheet = make(c, null);
      write([...read(), sheet]);
      return sheet;
    },
    update: async (id, patch) => write(read().map((x) => (x.id === id ? { ...x, ...patch } : x))),
    watch: () => () => {},
    clear() {
      try {
        localStorage.removeItem(ROOM_DEMO_KEY);
        localStorage.removeItem(roomBoardKey("deneme"));
      } catch (e) {}
    },
  };
}

function roomTableStore(tableId) {
  const s = window.CG_STORE;
  return {
    getSheet: () => s.getTableSheet(tableId),
    listSheets: () => s.listTableSheets(tableId),
    createSheet: (c) => s.createTableSheet(tableId, c),
    addSheet: (c) => s.createTableSheet(tableId, c, null),
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
  let viewed = null; // kağıt penceresinde açık olan kağıt
  let sheets = [];
  let saveTimer = null;
  const colorOf = (s) => (s && CLASS_COLORS[s.role]) || "#ffffff";

  el.innerHTML = `
    <div class="room">
      <div class="rb-host"></div>
      <div class="rb-pill rb-left">
        ${rbBtn('data-room="dice" aria-expanded="false"', "dice", t.dice)}
        ${rbBtn("", "swords", `${t.turns} (${t.soon})`, false, true)}
        ${rbBtn("", "users", `${t.users} (${t.soon})`, false, true)}
      </div>
      <section class="rb-panel room-dice" hidden></section>
      <div class="rb-pill rb-menu-btn">${rbBtn('data-room="menu" aria-expanded="false"', "dots", t.menu)}</div>
      <nav class="rb-panel rb-menu" hidden>
        <p class="rb-menu-title">${ccEsc(ctx.name)}${ctx.demo ? ` <small>${t.demoTag}</small>` : ""}</p>
        ${ctx.demo ? `<button type="button" data-room-view>${asGm ? t.viewPlayer : t.viewGm}</button><button type="button" data-room-reset>${t.resetDemo}</button>` : ""}
        <a href="${ctx.leaveHref}">${t.leave}</a>
        ${ctx.isGm && !ctx.demo ? `<button type="button" class="neg" data-close-table>${t.closeTable}</button>` : ""}
      </nav>
      <section class="rb-panel room-drawer" hidden style="--sheet-color: ${colorOf(sheet)}"></section>
      <div class="rb-pill rb-bottom" style="--sheet-color: ${colorOf(sheet)}">
        ${rbBtn('data-room="drawer" aria-expanded="false"', "up", t.drawer)}
      </div>
      <section class="room-pop" hidden></section>
    </div>`;

  const root = el.querySelector(".room");
  const dice = el.querySelector(".room-dice");
  const drawer = el.querySelector(".room-drawer");
  const menu = el.querySelector(".rb-menu");
  const pop = el.querySelector(".room-pop");
  mountBoard(el.querySelector(".rb-host"), { key: roomBoardKey(ctx.id), gm: asGm, lang: L, bottom: el.querySelector(".rb-bottom"), onLeave: ctx.onLeave });

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
  const vitals = (s) => {
    const row = (key, label, max) => `
      <div class="room-vital">
        <b>${label}</b>
        <div>
          <button type="button" data-vital="${key}" data-sheet="${s.id}" data-step="-1" aria-label="${t.down}">−</button>
          <output>${s[key]} / ${max}</output>
          <button type="button" data-vital="${key}" data-sheet="${s.id}" data-step="1" aria-label="${t.up}">+</button>
        </div>
      </div>`;
    return `<div class="room-vitals">${row("hp", "HP", s.hpMax)}${row("humanity", c.humanity, s.humanityMax)}${row("luck", "Luck", s.luckMax)}</div>`;
  };
  // Çekmece: oyuncuda kendi kağıdı, GM'de masadaki kağıtlar
  const drawDrawer = () => {
    if (sheet) {
      drawer.innerHTML = `<button type="button" class="room-sheet-btn" data-open-sheet="${sheet.id}">${ccEsc(t.sheet(sheet.name))}</button>${vitals(sheet)}`;
      return;
    }
    drawer.innerHTML = `
      <div class="rb-drawer-head"><b>${t.tableSheets}</b><button type="button" class="rb-text-btn" data-add-sheet>${t.addSheet}</button></div>
      <ul class="rb-sheets">${sheets.length
        ? sheets.map((s) => `<li><button type="button" data-open-sheet="${s.id}" style="--sheet-color: ${colorOf(s)}"><b>${ccEsc(s.name)}</b><span>${ccEsc(roomRole(s.role))} · ${t.level(s.level)}</span><small>HP ${s.hp} / ${s.hpMax}</small></button></li>`).join("")
        : `<li class="room-empty">${t.noSheets}</li>`}</ul>
      <div class="rb-addlist" hidden></div>`;
  };
  const loadSheets = async () => {
    if (sheet) return;
    drawer.innerHTML = `<p class="room-empty">${t.loading}</p>`;
    try {
      sheets = await store.listSheets();
      drawDrawer();
    } catch (err) {
      drawer.innerHTML = `<p class="room-empty">${ccEsc(window.CG_STORE.errorText(err))}</p>`;
    }
  };
  const drawPop = () => {
    if (!viewed) return;
    pop.style.setProperty("--sheet-color", colorOf(viewed));
    pop.innerHTML = `
      <header><b>${ccEsc(viewed.name)}</b><span>${ccEsc(roomRole(viewed.role))} · ${t.level(viewed.level)}</span><button type="button" class="room-pop-close" data-close-sheet aria-label="${t.close}">${rbIcon("close")}</button></header>
      ${vitals(viewed)}
      <div class="cc-sheet-body">${ccSheetOf(viewed.data, L, `${viewed.humanity} / ${viewed.humanityMax}`).replaceAll("#39ff14", "var(--sheet-color)")}</div>`;
  };
  const findSheet = (id) => (sheet && sheet.id === id ? sheet : sheets.find((s) => s.id === id));
  const setVital = (id, key, step) => {
    const s = findSheet(id);
    const hi = s[`${key}Max`];
    const lo = key === "humanity" ? -Infinity : 0; // Humanity 0'ın altına inebilir
    const next = Math.max(lo, Math.min(hi, s[key] + step));
    if (next === s[key]) return;
    s[key] = next;
    drawDrawer();
    if (viewed === s) drawPop();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => store.update(s.id, { hp: s.hp, humanity: s.humanity, luck: s.luck }), 400); // art arda tıklamalar tek yazma olsun
  };
  const toggle = (box, btn) => {
    const open = !rbIsOpen(box);
    rbShow(box, open);
    btn.setAttribute("aria-expanded", open);
    btn.classList.toggle("on", open);
  };

  root.addEventListener("click", async (e) => {
    const b = (sel) => e.target.closest(sel);
    let x;
    if ((x = b('[data-room="dice"]'))) {
      toggle(dice, x);
    } else if ((x = b('[data-room="menu"]'))) {
      toggle(menu, x);
    } else if ((x = b('[data-room="drawer"]'))) {
      toggle(drawer, x);
      if (rbIsOpen(drawer)) loadSheets();
    } else if ((x = b("[data-die]"))) {
      rolls = [{ ...roomRollDie(Number(x.dataset.die)), who: sheet ? sheet.name : t.gm, secret }, ...rolls].slice(0, ROOM_LOG_MAX);
      drawDice();
    } else if (b("[data-room-secret]")) {
      secret = !secret;
      drawDice();
    } else if ((x = b("[data-open-sheet]"))) {
      viewed = findSheet(x.dataset.openSheet);
      drawPop();
      rbShow(pop, true);
    } else if (b("[data-close-sheet]")) {
      viewed = null;
      rbShow(pop, false);
    } else if ((x = b("[data-vital]"))) {
      setVital(x.dataset.sheet, x.dataset.vital, Number(x.dataset.step));
    } else if (b("[data-add-sheet]")) {
      const box = drawer.querySelector(".rb-addlist");
      rbShow(box, !rbIsOpen(box));
      if (!rbIsOpen(box)) return;
      const saved = await window.CG_STORE.listChars().catch(() => []);
      const chars = ctx.demo ? [...saved, roomSampleChar(t.sample)] : saved;
      roomAddList = chars;
      box.innerHTML = chars.length ? chars.map((k) => `<button type="button" data-add-char="${k.id}" style="--sheet-color: ${CLASS_COLORS[k.role] || "#fff"}">${ccEsc(k.name)}<small>${ccEsc(roomRole(k.role))}</small></button>`).join("") : `<p class="room-empty">${t.noSaved}</p>`;
    } else if ((x = b("[data-add-char]"))) {
      const k = roomAddList.find((v) => v.id === x.dataset.addChar);
      if (k) {
        await store.addSheet(k);
        loadSheets();
      }
    } else if (b("[data-room-view]")) {
      ctx.view(asGm ? "player" : "gm");
    } else if (b("[data-room-reset]")) {
      store.clear();
      ctx.view("gm");
    }
  });

  drawDice();
  if (sheet) drawDrawer();
  // Kağıt başka yerden değişirse (GM ya da başka sekme) sayaçlar güncellenir
  if (sheet) ctx.onLeave(store.watch(sheet.id, (next) => {
    Object.assign(sheet, { hp: next.hp, humanity: next.humanity, luck: next.luck });
    drawDrawer();
    if (viewed === sheet) drawPop();
  }));
}
let roomAddList = [];

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
