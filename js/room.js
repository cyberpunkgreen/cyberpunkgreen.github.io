// ---------- Masa odası (#masa/<kimlik>) ----------
// Oda bütün ekranı kaplar; site menüsü görünmez. js/auth.js masaya girişi denetler ve mountRoom'u çağırır.
// Oyuncu odaya ilk girişinde kayıtlı karakterlerinden birini seçer ya da kağıtsız girer. Seçilen karakterin kopyası masaya yazılır (tables/{id}/sheets/{kağıt});
// kağıt masaya aittir, Karakter Oluştur'daki kayıttan bağımsızdır, owner alanı onu kimin kullandığını gösterir. GM karakter seçmez.
// GM, Kullanıcılar listesinden birine masadaki bir kağıdı verebilir; oyuncunun eski kağıdı sahipsiz olarak masada kalır.
// Canlı veri (harita, zar, kullanıcılar) Realtime Database'dedir (js/auth.js roomNet); kalıcı veri (kağıtlar) Firestore'dadır.
// #masa/deneme: Deneme Odası. Veri yalnızca bu tarayıcıda durur, Firebase'e yazılmaz; GM ve oyuncu görünümü arasında geçilebilir.
// Zarlar herkesin ekranında 3D atılır (js/roomdice.js); sonuç listeye zar yere inince yazılır.
// AI oyuncular hesap değildir: AI rozetli hesap onları oda içinde geçici kullanıcı olarak ekler (users/drone-…, owner o hesaptır). Kağıt alınca görünen adları kağıttaki ad olur.
// Odanın parçaları: sol üstte Zar, Tur, Kullanıcılar · sağ üstte oda menüsü · sağda araç kutusu ve altta obje çubuğu (js/roomboard.js) · altta çekmece ve kağıt penceresi.

const ROOM_TEXT = {
  tr: {
    addNpcTitle: "NPC Kağıdından Token Ekle", addNpcSearch: "NPC ara…", addNpcNone: "Kayıtlı NPC yok.", addNpcClose: "Kapat", zoomIn: "Yakınlaştır", zoomOut: "Uzaklaştır",
    sheetDel: "Kağıdı Sil", sheetDelAsk: (n) => `“${n}” kağıdı masadan silinsin mi? Masadaki ilerlemesi geri gelmez. Kayıtlı karakterlere ve hazır karakterlere dokunulmaz.`,
    levelUp: "Seviye Atlat", bindTitle: "Kağıt ve Oyuncu Bağla", bindSheet: "Kağıt", bindPlayer: "Oyuncu", bindMag: "Şarjör", bindNone: "Yok", bindChars: "Karakterler", bindNpcs: "NPC'ler", bindHint: "Bağlı oyuncu tokeni taşıyabilir. Şarjör boşsa mermi takip edilmez.", bindSave: "Bağla", bindCancel: "Vazgeç",
    leave: "Masadan Çık", closeTable: "Masayı Kapat", gm: "GM", level: (n) => `${n}. seviye`, soon: "Yakında",
    pickTitle: "Karakterini Seç", pickHint: "Bu masada oynayacağın karakteri seç. Karakterin kopyası masaya geçer; oyun boyunca masadaki kağıt, kayıtlı karakterinden bağımsız ilerler.",
    pickAsk: (n) => `“${n}” ile girilsin mi? Bu masada kağıdın bu karakterin kopyası olur.`, pickYes: "Gir",
    noChars: "Henüz kayıtlı bir karakterin yok. Kağıtsız girebilirsin, GM sana masadan bir kağıt verebilir.", makeChar: "Karakter Oluştur", enterBare: "Kağıtsız Gir",
    dice: "Zar", turns: "Tur", users: "Kullanıcılar", roll: "At", secret: "Gizli At", secretTag: "Gizli", noRolls: "Henüz zar atılmadı.", diceHint: "Sol tık zar ekler, sağ tık çıkarır. En fazla 10 zar.",
    initTag: "İnisiyatif", turnsTitle: "Tur Sırası", round: (n) => `${n}. tur`, next: "Sıradaki", addSheets: "Kağıtları Ekle", rollInit: "İnisiyatif At", sortInit: "Sırala", clearTurns: "Temizle", noTurns: "Sıralama boş.", initLabel: "İnisiyatif", moveUp: "Yukarı", moveDown: "Aşağı", removeTurn: "Çıkar", tokenHint: "Tokenleri sağ tıklayıp Tura Ekle ile de ekleyebilirsin.",
    code: "Oda Kodu", codeHint: "Bu kodu paylaş. Kodu Oyna sayfasına giren üye masaya eklenir.", demoCode: "Deneme Odası'ndaki kod yalnızca görünüm içindir, kimse giremez.", makeCode: "Kod Oluştur", newCode: "Yeni Kod", copy: "Kopyala", copied: "Kopyalandı",
    sheet: (n) => `${n} Karakter Kağıdı`, close: "Kapat", drawer: "Karakter çekmecesi", down: "Azalt", up: "Artır", waitSheet: "Henüz kağıdın yok. GM sana masadan bir kağıt verebilir.",
    viewPlayer: "Oyuncu Gibi Gör", viewGm: "GM Gibi Gör", resetDemo: "Denemeyi Sıfırla", demoTag: "Deneme", sample: "Deneme Karakteri", samplePlayer: "Deneme Oyuncusu",
    menu: "Oda menüsü", tableSheets: "Masadaki Kağıtlar", noSheets: "Masada henüz kağıt yok.", addSheet: "Kağıt Ekle", noSaved: "Eklenecek kayıtlı karakterin yok.", loading: "Yükleniyor…",
    you: "sen", userMenu: "Kullanıcı menüsü", rename: "İsim Değiştir", give: "Kağıt Ver", kick: "Masadan At", sheetNames: "Kağıttaki İsimleri Göster", pickColor: "Renk seç", cancel: "Vazgeç", ok: "Onayla",
    kicked: "GM seni masadan çıkardı.", reenter: "Geri Gir",
    invTitle: "Envanter", invOf: (n) => `${n} Envanteri`, invNone: "Kağıdı olan oyuncu yok.", invMoney: "Para (eddie)", invArmor: "Zırh", invWeapons: "Silahlar", invItems: "Eşyalar", invEmpty: "Boş", invAdd: "Eşya Ekle", invSave: "Onayla", invCancel: "Vazgeç", invRemove: "Çıkar",
    invExisting: "Var Olan Eşya", invCustom: "Özel Eşya", invSearch: "Eşya ara…", invCustomName: "Eşya adı", invAddNow: "Ekle", invCustomNote: "Özel silah ve zırhlar sonra eklenecek. Şimdilik özel eşya Eşyalar bölümüne gider.",
    levelTitle: "Seviye", levelGive: "Seviye Ver", levelTake: "Seviye Al", levelAll: "Tüm Oyunculara", levelNone: "Kağıdı olan oyuncu yok.",
    levelGiveAsk: (n) => `${n} için 1 seviye verilsin mi?`, levelTakeAsk: (n) => `${n} için 1 seviye alınsın mı?`, levelAllGiveAsk: "Bütün oyunculara 1 seviye verilsin mi?", levelAllTakeAsk: "Bütün oyunculardan 1 seviye alınsın mı?",
    addSaved: "Kayıtlı Karakterlerim", addReady: "Hazır Karakter Ekle", noReady: "Henüz hazır karakter yok.",
    aiPanel: "AI Oyuncular", aiName: "Oyuncu adı", aiAdd: "Ekle", aiNone: "Henüz AI oyuncu yok.", aiBadge: "AI",
  },
  en: {
    addNpcTitle: "Add Token From NPC Sheet", addNpcSearch: "Search NPCs…", addNpcNone: "No NPCs saved.", addNpcClose: "Close", zoomIn: "Zoom in", zoomOut: "Zoom out",
    sheetDel: "Delete Sheet", sheetDelAsk: (n) => `Delete the “${n}” sheet from this table? Its progress at the table can't be restored. Saved characters and ready characters aren't affected.`,
    levelUp: "Level Up", bindTitle: "Link Sheet and Player", bindSheet: "Sheet", bindPlayer: "Player", bindMag: "Magazine", bindNone: "None", bindChars: "Characters", bindNpcs: "NPCs", bindHint: "The linked player can move the token. Leave the magazine empty to skip ammo tracking.", bindSave: "Link", bindCancel: "Cancel",
    leave: "Leave Table", closeTable: "Close Table", gm: "GM", level: (n) => `Level ${n}`, soon: "Coming soon",
    pickTitle: "Choose Your Character", pickHint: "Choose the character you'll play at this table. A copy goes to the table; from then on the sheet here moves on separately from your saved character.",
    pickAsk: (n) => `Enter as “${n}”? Your sheet at this table will be a copy of this character.`, pickYes: "Enter",
    noChars: "You have no saved characters yet. You can enter without a sheet, and the GM can give you one from the table.", makeChar: "Create a Character", enterBare: "Enter Without a Sheet",
    dice: "Dice", turns: "Turns", users: "Users", roll: "Roll", secret: "Roll Secretly", secretTag: "Secret", noRolls: "No rolls yet.", diceHint: "Left click adds a die, right click removes one. Up to 10 dice.",
    initTag: "Initiative", turnsTitle: "Turn Order", round: (n) => `Round ${n}`, next: "Next", addSheets: "Add Sheets", rollInit: "Roll Initiative", sortInit: "Sort", clearTurns: "Clear", noTurns: "The order is empty.", initLabel: "Initiative", moveUp: "Up", moveDown: "Down", removeTurn: "Remove", tokenHint: "You can also right click a token and choose Add to Turns.",
    code: "Room Code", codeHint: "Share this code. A member who enters it on the Play page joins the table.", demoCode: "The Test Room's code is for show only, nobody can join with it.", makeCode: "Create Code", newCode: "New Code", copy: "Copy", copied: "Copied",
    sheet: (n) => `${n} Character Sheet`, close: "Close", drawer: "Character drawer", down: "Decrease", up: "Increase", waitSheet: "You don't have a sheet yet. The GM can give you one from the table.",
    viewPlayer: "View as Player", viewGm: "View as GM", resetDemo: "Reset Test", demoTag: "Test", sample: "Test Character", samplePlayer: "Test Player",
    menu: "Room menu", tableSheets: "Table Sheets", noSheets: "No sheets at this table yet.", addSheet: "Add Sheet", noSaved: "You have no saved characters to add.", loading: "Loading…",
    you: "you", userMenu: "User menu", rename: "Rename", give: "Give Sheet", kick: "Kick from Table", sheetNames: "Show Sheet Names", pickColor: "Pick a color", cancel: "Cancel", ok: "Confirm",
    kicked: "The GM removed you from the table.", reenter: "Enter Again",
    invTitle: "Inventory", invOf: (n) => `${n}'s Inventory`, invNone: "No players with a sheet.", invMoney: "Money (eddies)", invArmor: "Armor", invWeapons: "Weapons", invItems: "Items", invEmpty: "Empty", invAdd: "Add Item", invSave: "Confirm", invCancel: "Cancel", invRemove: "Remove",
    invExisting: "Existing Item", invCustom: "Custom Item", invSearch: "Search items…", invCustomName: "Item name", invAddNow: "Add", invCustomNote: "Custom weapons and armor come later. For now a custom item goes to Items.",
    levelTitle: "Level", levelGive: "Give Level", levelTake: "Take Level", levelAll: "All Players", levelNone: "No players with a sheet.",
    levelGiveAsk: (n) => `Give 1 level to ${n}?`, levelTakeAsk: (n) => `Take 1 level from ${n}?`, levelAllGiveAsk: "Give 1 level to all players?", levelAllTakeAsk: "Take 1 level from all players?",
    addSaved: "My Saved Characters", addReady: "Add a Pregenerated Character", noReady: "No pregenerated characters yet.",
    aiPanel: "AI Players", aiName: "Player name", aiAdd: "Add", aiNone: "No AI players yet.", aiBadge: "AI",
  },
};

const ROOM_DIE_SIDES = [4, 6, 8, 10, 20];
const ROOM_LOG_MAX = 5;
const ROOM_POOL_MAX = 10;
const ROOM_MAX_LEVEL = 12;
const ROOM_DEMO_KEY = "cg-demo-room";
const ROOM_DEMO_NET = "cg-demo-net";
const ROOM_DEMO_GM = "deneme-gm";
const ROOM_DEMO_PLAYER = "deneme"; // Deneme Odası'ndaki oyuncu görünümünün kullanıcısı
const roomRole = (id) => (CLASSES.find((c) => c.id === id) || {}).name || "";
const roomRoll = (sides) => 1 + Math.floor(Math.random() * sides);
// Ağır Yaralı olan tüm atışlarına −2 alır, Acı Düzenleyici bunu kaldırır
const roomWound = (hp, max, chrome) => (max && hp > 0 && hp * 2 < max && !chrome.includes("pain-editor") ? -2 : 0);
const roomSheetInit = (s) => ({ parts: [...ccInitParts(s.data), roomWound(s.hp, s.hpMax, (s.data.cyberware || {}).picks || [])], dex: ccWith(s.data, () => ccStatVal("DEX")) || 0 });
const roomNpcInit = (n, ob) => {
  const left = (ob && ob.stats) || {};
  return { parts: [...npcInitParts(n), roomWound(left.hp, left.hpMax, n.cyberware || [])], dex: npcStat(npcFill(n), "DEX") };
};
// İnisiyatif zarı: d10 ve değiştiriciler toplanır, atılan rakamlar parts'ta yazar
function roomInitRoll(base, v) {
  const die = roomRoll(10);
  const mods = v.parts.filter(Boolean);
  return { ...base, dice: `10:${die}`, total: mods.reduce((a, b) => a + b, die), parts: mods.length ? [die, ...mods.map((m) => `${m < 0 ? "−" : "+"} ${Math.abs(m)}`)].join(" ") : "", dex: v.dex };
}
// Tokenin üst sınırları: kağıttan ya da NPC'den
function roomSheetStats(s) {
  const sp = ccSpOf(s.data);
  return { hp: s.hp, hpMax: s.hpMax, spHeadMax: sp.head, spBodyMax: sp.body, ramMax: ccRamOf(s.data), ammoMax: ccMagOf(s.data) };
}
const roomNpcStats = (n) => ({ hpMax: npcHp(npcFill(n)), spHeadMax: n.spHead || 0, spBodyMax: n.spBody || 0, ramMax: n.netrunning ? n.ram : 0, ammoMax: npcMagOf(n) });
const roomRollKey = (r) => `${r.uid}:${r.at}`;
// Bir atıştaki zarlar: "6:3,6:5,20:12" (yüz sayısı:sonuç)
const roomDiceOf = (r) => (r.dice || `${r.sides}:${r.total}`).split(",").map((x) => {
  const [sides, value] = x.split(":").map(Number);
  return { sides, value };
});
function roomDiceLabel(dice) {
  const count = {};
  for (const d of dice) count[d.sides] = (count[d.sides] || 0) + 1;
  return Object.entries(count).map(([sides, n]) => `${n > 1 ? n : ""}d${sides}`).join(" + ");
}
const roomHash = (s) => [...s].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 9973, 7);

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
    getSheet: async () => read().find((x) => x.owner === ROOM_DEMO_PLAYER) || null,
    listSheets: async () => read(),
    async createSheet(c) {
      const sheet = make(c, ROOM_DEMO_PLAYER);
      write([...read(), sheet]);
      return sheet;
    },
    async addSheet(c) {
      const sheet = make(c, null);
      write([...read(), sheet]);
      return sheet;
    },
    update: async (id, patch) => write(read().map((x) => (x.id === id ? { ...x, ...patch } : x))),
    remove: async (id) => write(read().filter((x) => x.id !== id)),
    give: async (id, uid) => write(read().map((x) => (x.id === id ? { ...x, owner: uid } : x.owner === uid ? { ...x, owner: null } : x))),
    watch: () => () => {},
    clear() {
      try {
        localStorage.removeItem(ROOM_DEMO_KEY);
        localStorage.removeItem(ROOM_DEMO_NET);
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
    remove: (id) => s.deleteTableSheet(tableId, id),
    give: (id, uid, controller) => s.giveTableSheet(tableId, id, uid, controller),
    watch: (id, cb) => s.watchTableSheet(tableId, id, cb),
  };
}

// Deneme Odası'nın canlı katmanı: aynı arayüz, masada GM ile bir deneme oyuncusu varmış gibi davranır. Harita bu nesneyi kullanmaz, kendi kaydını tutar.
function roomDemoNet(L) {
  const t = ROOM_TEXT[L];
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(ROOM_DEMO_NET));
    } catch (e) {
      return null;
    }
  };
  const blank = () => ({ turns: {}, turnsAll: {}, users: { [ROOM_DEMO_GM]: { name: t.gm, color: "#eb8aff", online: true }, [ROOM_DEMO_PLAYER]: { name: t.samplePlayer, color: RB_COLORS[1], online: true } }, settings: {} });
  let data = read() || blank();
  let rolls = [];
  const views = { users: new Set(), settings: new Set(), rolls: new Set(), turns: new Set(), turnsAll: new Set() };
  const send = (key) => {
    if (key !== "rolls") {
      try {
        localStorage.setItem(ROOM_DEMO_NET, JSON.stringify(data));
      } catch (e) {}
    }
    const value = key === "rolls" ? rolls : data[key];
    views[key].forEach((cb) => cb(value));
  };
  const watch = (key, cb) => {
    views[key].add(cb);
    cb(key === "rolls" ? rolls : data[key]);
    return () => views[key].delete(cb);
  };
  const noop = () => () => {};
  return {
    gmUid: ROOM_DEMO_GM,
    me: ROOM_DEMO_GM,
    demo: true,
    setView(mode) {
      this.me = mode === "player" ? ROOM_DEMO_PLAYER : ROOM_DEMO_GM;
    },
    reset() {
      data = blank();
      rolls = [];
    },
    claim: async () => {},
    async join(info) {
      data.users[this.me] = { ...data.users[this.me], online: true, sheet: info.sheet };
      send("users");
    },
    leave() {},
    watchUsers: (cb) => watch("users", cb),
    setUser(uid, patch) {
      data.users[uid] = { ...data.users[uid], ...patch };
      send("users");
    },
    watchSettings: (cb) => watch("settings", cb),
    setSettings(patch) {
      data.settings = { ...data.settings, ...patch };
      send("settings");
    },
    roll(r) {
      rolls = [...rolls, r].slice(-ROOM_LOG_MAX);
      send("rolls");
    },
    watchRolls: (cb) => watch("rolls", cb),
    watchTurns: (gm, cb) => watch(gm ? "turnsAll" : "turns", cb),
    saveTurns(all, open) {
      data.turnsAll = all;
      data.turns = open;
      send("turnsAll");
      send("turns");
    },
    makeCode: async () => [...Array(6)].map(() => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join(""),
    kick(uid) {
      data.users[uid] = { ...data.users[uid], online: false };
      send("users");
    },
    addDrone(name) {
      data.users[`drone-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`] = { name, color: "#ffffff", online: true, ai: true, owner: this.me };
      send("users");
    },
    dropUser(uid) {
      delete data.users[uid];
      send("users");
    },
    onKicked: noop,
    notifySheet() {},
    onSheetChange: noop,
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
function roomPicker(el, ctx, chars, L, onPick, onSkip) {
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
        <div class="room-panel-foot"><button type="button" class="cc-btn" data-enter-bare>${t.enterBare}</button><a class="cc-btn" href="${ctx.leaveHref}">${t.leave}</a></div>
      </section>
    </div>`;
  el.querySelector("[data-enter-bare]").addEventListener("click", onSkip);
  el.querySelector(".room-chars")?.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-char]");
    const c = b && chars.find((x) => x.id === b.dataset.char);
    if (c && (await ccConfirm(t.pickAsk(c.name), L, t.pickYes))) onPick(c);
  });
}

// Renk seçici: doygunluk karesi, ton çubuğu, hex kutusu; onDone(hex) onaylanınca, onDone(null) vazgeçilince
function roomHexToHsv(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const v = Math.max(r, g, b);
  const d = v - Math.min(r, g, b);
  const h = !d ? 0 : v === r ? ((g - b) / d + 6) % 6 : v === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s: v ? d / v : 0, v };
}
function roomHsvToHex({ h, s, v }) {
  const ch = (n) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255).toString(16).padStart(2, "0");
  };
  return `#${ch(5)}${ch(3)}${ch(1)}`;
}
function roomColorPicker(box, color, t, onDone) {
  const hsv = roomHexToHsv(color);
  box.innerHTML = `
    <div class="rb-sv"><i></i></div>
    <div class="rb-hue"><i></i></div>
    <input class="rb-hex" type="text" maxlength="7" spellcheck="false" aria-label="${t.pickColor}">
    <div class="rb-color-foot">${rbBtn("data-color-no", "close", t.cancel)}${rbBtn("data-color-ok", "check", t.ok)}</div>`;
  const sv = box.querySelector(".rb-sv");
  const hue = box.querySelector(".rb-hue");
  const hex = box.querySelector(".rb-hex");
  const paint = (typed) => {
    const now = roomHsvToHex(hsv);
    box.style.setProperty("--h", hsv.h);
    box.style.setProperty("--c", now);
    sv.firstElementChild.style.cssText = `left: ${hsv.s * 100}%; top: ${(1 - hsv.v) * 100}%`;
    hue.firstElementChild.style.left = `${(hsv.h / 360) * 100}%`;
    if (!typed) hex.value = now;
  };
  const drag = (area, set) => {
    area.addEventListener("pointerdown", (e) => {
      const move = (ev) => {
        const r = area.getBoundingClientRect();
        set(Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height)));
        paint();
      };
      try {
        area.setPointerCapture(e.pointerId);
      } catch (err) {}
      move(e);
      area.addEventListener("pointermove", move);
      area.addEventListener("pointerup", () => area.removeEventListener("pointermove", move), { once: true });
    });
  };
  drag(sv, (x, y) => {
    hsv.s = x;
    hsv.v = 1 - y;
  });
  drag(hue, (x) => {
    hsv.h = x * 360;
  });
  hex.addEventListener("input", () => {
    if (!/^#[0-9a-f]{6}$/i.test(hex.value)) return;
    Object.assign(hsv, roomHexToHsv(hex.value));
    paint(true);
  });
  box.querySelector("[data-color-no]").addEventListener("click", () => onDone(null));
  box.querySelector("[data-color-ok]").addEventListener("click", () => onDone(roomHsvToHex(hsv)));
  paint();
}

// Odanın kendisi: durum bu kapanışta tutulur, parçalar ayrı ayrı yeniden çizilir. asGm: GM görünümü; oyuncunun kağıdı olmayabilir
function roomShell(el, ctx, sheet, L, store, net, asGm) {
  const t = ROOM_TEXT[L];
  const c = CC_TEXT[L];
  let rolls = [];
  let secretRolls = []; // GM'in gizli attıkları yalnızca kendisinde görünür
  let secret = false;
  let seenRolls = null; // odaya girerken listede olan zarlar yeniden atılmaz
  const flying = new Set(); // havadaki zarlar; sonuç yere inince listeye yazılır
  let pool = []; // atılacak zarların yüz sayıları
  let turns = { round: 1, current: null, list: [] }; // GM'de gizliler dahil bütün sıra, oyuncuda görebildikleri
  let code = ctx.code || "";
  let invSheets = [];
  let invDraft = null; // GM'in düzenlediği envanter: { sheet, money, items }; Onayla'ya kadar kaydedilmez
  let invAddMode = "existing";
  let invSearch = "";
  let levelTake = false; // GM'in seviye paneli: false ver, true al
  let levelSheets = [];
  let viewed = null; // kağıt penceresinde açık olan kağıt
  let sheets = [];
  let users = {};
  let settings = {};
  let renaming = null; // adı değiştirilen kullanıcı
  let giveList = [];
  let saveTimer = null;
  const colorOf = (s) => (s && CLASS_COLORS[s.role]) || "#ffffff";
  const canEdit = (uid) => uid === net.me || asGm || (users[uid] || {}).owner === net.me;
  const nameOf = (uid) => {
    const u = users[uid];
    return !u ? "" : (u.owner || settings.sheetNames) && u.sheet ? u.sheet : u.name; // AI oyuncunun adı kağıt alınca kağıttaki ad olur
  };

  el.innerHTML = `
    <div class="room">
      <div class="rb-host"></div>
      <div class="rb-pill rb-left">
        ${rbBtn('data-room="dice" aria-expanded="false"', "dice", t.dice)}
        ${rbBtn('data-room="turns" aria-expanded="false"', "swords", t.turns)}
        ${rbBtn('data-room="users" aria-expanded="false"', "users", t.users)}
        ${asGm ? rbBtn('data-room="level" aria-expanded="false"', "levels", t.levelTitle) : ""}
        ${asGm ? rbBtn('data-room="inv" aria-expanded="false"', "bag", t.invTitle) : ""}
        ${asGm ? rbBtn('data-room="code" aria-expanded="false"', "key", t.code) : ""}
        ${ctx.isAi ? rbBtn('data-room="ai" aria-expanded="false"', "chip", t.aiPanel) : ""}
      </div>
      <section class="rb-panel room-dice" hidden></section>
      <section class="rb-panel room-turns" hidden></section>
      <section class="rb-panel room-users" hidden></section>
      <section class="rb-panel room-level" hidden></section>
      <section class="rb-panel room-inv" hidden></section>
      <section class="rb-panel room-inv-win" hidden></section>
      <section class="rb-panel room-bind" hidden></section>
      <section class="rb-panel room-npc-win" hidden></section>
      <section class="rb-panel room-inv-add" hidden></section>
      <section class="rb-panel room-code" hidden></section>
      <section class="rb-panel room-ai" hidden></section>
      <div class="rb-ctx room-user-ctx" hidden></div>
      <div class="rb-color" hidden></div>
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
      <div class="rd-layer"><canvas class="rd-canvas"></canvas></div>
      <section class="room-pop" hidden></section>
    </div>`;

  const root = el.querySelector(".room");
  const dice = el.querySelector(".room-dice");
  const usersBox = el.querySelector(".room-users");
  const turnsBox = el.querySelector(".room-turns");
  const codeBox = el.querySelector(".room-code");
  const aiBox = el.querySelector(".room-ai");
  const levelBox = el.querySelector(".room-level");
  const invBox = el.querySelector(".room-inv");
  const invWin = el.querySelector(".room-inv-win");
  const invAdd = el.querySelector(".room-inv-add");
  const leftPanels = { dice, turns: turnsBox, users: usersBox, level: levelBox, inv: invBox, code: codeBox, ai: aiBox };
  const userMenu = el.querySelector(".room-user-ctx");
  const colorBox = el.querySelector(".rb-color");
  const drawer = el.querySelector(".room-drawer");
  const menu = el.querySelector(".rb-menu");
  const pop = el.querySelector(".room-pop");
  const bindWin = el.querySelector(".room-bind");
  const npcWin = el.querySelector(".room-npc-win");
  const board = mountBoard(el.querySelector(".rb-host"), {
    key: roomBoardKey(ctx.id), gm: asGm, lang: L, bottom: el.querySelector(".rb-bottom"), onLeave: ctx.onLeave, net: net.demo ? null : net,
    me: net.me, color: () => (users[net.me] || {}).color || "#ffffff", onObjects: syncTurns, onTurn: addTokens, inTurn: tokenInTurn, onBind: openBind, onSync: tokenLimits, onHp: tokenHp, onSheet: openTokenSheet, onAddNpc: openAddNpc,
  });

  const dice3d = roomDice3d(root, board.cam);
  ctx.onLeave(dice3d.stop);
  const throwDie = (r) => {
    const key = roomRollKey(r);
    flying.add(key);
    dice3d.roll({ ...r, total: r.parts ? `${r.total} (${ccEsc(r.parts)})` : r.total, dice: roomDiceOf(r) }).finally(() => {
      flying.delete(key);
      drawDice();
    });
  };
  const drawDice = () => {
    const list = [...rolls, ...secretRolls].filter((r) => !flying.has(roomRollKey(r))).sort((a, b) => b.at - a.at).slice(0, ROOM_LOG_MAX);
    dice.innerHTML = `
      <div class="room-dice-row">${ROOM_DIE_SIDES.map((s) => {
        const n = pool.filter((k) => k === s).length;
        return `<button type="button" class="room-die${n ? " on" : ""}" data-die="${s}">d${s}${n ? `<i>${n}</i>` : ""}</button>`;
      }).join("")}</div>
      <p class="room-note">${t.diceHint}</p>
      <div class="room-dice-go">
        <button type="button" class="rb-text-btn" data-roll${pool.length ? "" : " disabled"}>${t.roll}${pool.length ? ` (${pool.length})` : ""}</button>
        ${asGm || sheet ? `<button type="button" class="rb-text-btn" data-init-roll${asGm && !turns.list.length ? " disabled" : ""}>${t.rollInit}</button>` : ""}
        ${asGm ? `<button type="button" class="shop-chip${secret ? " on" : ""}" data-room-secret aria-pressed="${secret}">${t.secret}</button>` : ""}
      </div>
      <ul class="room-rolls">${list.length
        ? list.map((r) => {
          const each = roomDiceOf(r);
          return `<li title="${each.map((d) => d.value).join(" + ")}"><span style="color: ${ccEsc(r.color)}">${ccEsc(r.who)}</span><small>${r.init ? t.initTag : roomDiceLabel(each)}${r.secret ? ` · ${t.secretTag}` : ""}</small><b>${r.total}${r.parts ? ` <i>(${ccEsc(r.parts)})</i>` : ""}</b></li>`;
        }).join("")
        : `<li class="room-empty">${t.noRolls}</li>`}</ul>`;
  };
  function rollPool() {
    const each = pool.map((sides) => ({ sides, value: roomRoll(sides) }));
    if (!each.length) return;
    pool = [];
    const r = {
      uid: net.me, who: nameOf(net.me) || ctx.userName, color: (users[net.me] || {}).color || "#ffffff",
      dice: each.map((d) => `${d.sides}:${d.value}`).join(","), total: each.reduce((sum, d) => sum + d.value, 0), at: Date.now(),
    };
    if (secret) {
      secretRolls = [{ ...r, secret: true }, ...secretRolls].slice(0, ROOM_LOG_MAX);
      throwDie(r);
      drawDice();
    } else {
      net.roll(r);
      drawDice();
    }
  }

  // ---- Tur sırası ----
  // GM bütün sırayı tutar; oyuncuya gizli olmayanlar gider (turnsAll yalnızca GM'e açık)
  function publishTurns() {
    const open = turns.list.filter((e) => !e.hidden);
    const current = open.some((e) => e.id === turns.current) ? turns.current : null;
    net.saveTurns(turns, { round: turns.round, current, list: open.map(({ id, name, init, color }) => ({ id, name, init, color })) });
    drawTurns();
  }
  // Token bağlama: kağıt seçilince oyuncusu ve şarjörü kendiliğinden gelir, istenirse değiştirilir
  let bindDraft = null;
  const bindSheetOf = (d) => (d.pick[0] === "s" ? d.list.find((s) => s.id === d.pick.slice(2)) : null);
  const bindNpcOf = (d) => (d.pick[0] === "n" ? d.npcs.find((n) => n.id === d.pick.slice(2)) : null);
  async function openBind(ob) {
    rbShow(bindWin, true);
    bindWin.innerHTML = `<p class="room-empty">${t.loading}</p>`;
    let list;
    let npcs = [];
    try {
      list = await store.listSheets();
    } catch (err) {
      bindWin.innerHTML = `<p class="room-empty">${ccEsc(window.CG_STORE.errorText(err))}</p>`;
      return;
    }
    try {
      npcs = await window.CG_STORE.listNpcs();
    } catch (err) {} // NPC listesi okunamıyorsa yalnızca karakterler görünür
    const pick = ob.sheet ? `s:${ob.sheet}` : ob.npc ? `n:${ob.npc}` : "";
    bindDraft = { ob, list, npcs, pick, start: pick, player: ob.player || "", mag: ob.ammoMax || 0 };
    drawBind();
  }
  function drawBind() {
    const d = bindDraft;
    const opt = (value, label, now) => `<option value="${ccEsc(value)}"${value === now ? " selected" : ""}>${ccEsc(label)}</option>`;
    const players = Object.entries(users).filter(([uid, u]) => uid !== ctx.gmUid && (!u.ai || u.owner));
    bindWin.innerHTML = `
      <h3>${t.bindTitle}</h3>
      <label class="room-bind-row"><span>${t.bindSheet}</span><select data-bind-sheet>
        ${opt("", t.bindNone, d.pick)}
        <optgroup label="${ccEsc(t.bindChars)}">${d.list.map((s) => opt(`s:${s.id}`, s.name, d.pick)).join("")}</optgroup>
        ${d.npcs.length ? `<optgroup label="${ccEsc(t.bindNpcs)}">${d.npcs.map((n) => opt(`n:${n.id}`, n.name, d.pick)).join("")}</optgroup>` : ""}
      </select></label>
      <label class="room-bind-row"><span>${t.bindPlayer}</span><select data-bind-player>${opt("", t.bindNone, d.player)}${players.map(([uid, u]) => opt(uid, u.name, d.player)).join("")}</select></label>
      <label class="room-bind-row"><span>${t.bindMag}</span><input type="number" min="0" max="999" data-bind-mag value="${d.mag || ""}"></label>
      <p class="room-note">${t.bindHint}</p>
      <div class="room-bind-go"><button type="button" class="rb-text-btn" data-bind-cancel>${t.bindCancel}</button><button type="button" class="rb-text-btn" data-bind-save>${t.bindSave}</button></div>`;
  }
  function saveBind() {
    const d = bindDraft;
    const s = bindSheetOf(d);
    const n = bindNpcOf(d);
    const link = {};
    if (s) Object.assign(link, { sheet: s.id, name: s.name });
    if (n) link.npc = n.id;
    if (d.player) link.player = d.player;
    if (d.mag) Object.assign(link, { ammoMax: d.mag, ammo: d.ob.ammoMax ? Math.min(d.ob.ammo, d.mag) : d.mag });
    // Yeni bağlanan token değerlerini kağıttan alır; NPC'lerde statlar gizli başlar
    const base = s ? roomSheetStats(s) : n ? roomNpcStats(n) : null;
    if (base && d.pick !== d.start) Object.assign(link, { stats: rbFullStats(base), bars: !!n, statsHidden: !!n, title: n ? n.name : undefined });
    else Object.assign(link, { stats: d.ob.stats, bars: d.ob.bars, statsHidden: d.ob.statsHidden, title: d.ob.title });
    board.bindToken(d.ob.id, link);
    bindDraft = null;
    rbShow(bindWin, false);
  }
  // NPC kağıdından token: pencere açık kalır, art arda eklenen tokenler yan yana düşer
  let addSpot = null;
  async function openAddNpc(x, y) {
    addSpot = { x, y };
    rbShow(bindWin, true);
    bindWin.innerHTML = `<p class="room-empty">${t.loading}</p>`;
    try {
      roomAddNpcs = (await window.CG_STORE.listNpcs()).sort((a, b) => a.name.localeCompare(b.name, L));
    } catch (err) {
      bindWin.innerHTML = `<p class="room-empty">${ccEsc(window.CG_STORE.errorText(err))}</p>`;
      return;
    }
    bindWin.innerHTML = `
      <h3>${t.addNpcTitle}</h3>
      <input type="search" data-npc-search placeholder="${ccEsc(t.addNpcSearch)}" aria-label="${ccEsc(t.addNpcSearch)}" autocomplete="off">
      <ul class="room-npc-list">${roomAddNpcs.length ? roomAddNpcs.map((n) => `<li><button type="button" data-npc-add="${n.id}"><b>${ccEsc(n.name)}</b><small>${ccEsc(npcSub(n, L))}</small></button></li>`).join("") : `<li class="room-empty">${t.addNpcNone}</li>`}</ul>
      <div class="room-bind-go"><button type="button" class="rb-text-btn" data-bind-cancel>${t.addNpcClose}</button></div>`;
  }
  function addNpcToken(id) {
    const n = roomAddNpcs.find((k) => k.id === id);
    const limits = roomNpcStats(n);
    board.addNpcToken({ npc: n.id, title: n.name, stats: rbFullStats(limits), bars: true, statsHidden: true, ...(limits.ammoMax ? { ammo: limits.ammoMax, ammoMax: limits.ammoMax } : {}) }, addSpot.x, addSpot.y);
    addSpot.x += RB_GRID;
  }
  bindWin.addEventListener("input", (e) => {
    if (!e.target.matches("[data-npc-search]")) return;
    const query = e.target.value.trim().toLocaleLowerCase(L);
    for (const li of bindWin.querySelectorAll(".room-npc-list li")) li.hidden = !li.textContent.toLocaleLowerCase(L).includes(query);
  });
  // Token menüsünden gelenler: üst sınırlar, HP'nin kağıda yazılması, kağıt penceresi
  async function tokenLimits(ob) {
    if (ob.npc) {
      const n = (await window.CG_STORE.listNpcs()).find((k) => k.id === ob.npc);
      return n ? roomNpcStats(n) : null;
    }
    const s = asGm ? (await store.listSheets()).find((k) => k.id === ob.sheet) : findSheet(ob.sheet);
    return s ? roomSheetStats(s) : null;
  }
  function tokenHp(ob) {
    const s = findSheet(ob.sheet);
    if (s) {
      s.hp = ob.stats.hp;
      drawDrawer();
      if (viewed === s) drawPop();
    }
    Promise.resolve(store.update(ob.sheet, { hp: ob.stats.hp })).catch(() => {});
  }
  async function openTokenSheet(ob) {
    if (ob.npc) return openNpcSheet(ob.npc);
    if (!findSheet(ob.sheet) && asGm) sheets = await store.listSheets();
    const s = findSheet(ob.sheet);
    if (!s) return;
    viewed = s;
    leveling = false;
    drawPop();
    rbShow(pop, true);
  }
  // NPC kağıdı penceresi: ekrana sabittir, köşesinden boyutlanır, içindeki kağıt yakınlaştırılıp kaydırılır
  let npcZoom = 1;
  async function openNpcSheet(id) {
    rbShow(npcWin, true);
    npcWin.innerHTML = `<p class="room-empty">${t.loading}</p>`;
    try {
      const n = (await window.CG_STORE.listNpcs()).find((k) => k.id === id);
      npcWin.innerHTML = `
        <header data-npc-drag><b>${ccEsc(n.name)}</b>
          ${rbBtn('data-npc-zoom="-1"', "minus", t.zoomOut)}${rbBtn('data-npc-zoom="1"', "plus", t.zoomIn)}${rbBtn("data-npc-close", "close", t.close)}
        </header>
        <div class="room-npc-body"><div class="npc-sheet cc-sheet-body" style="zoom: ${npcZoom}">${npcSheet(n, L)}</div></div>`;
    } catch (err) {
      npcWin.innerHTML = `<p class="room-empty">${ccEsc(window.CG_STORE.errorText(err))}</p>`;
    }
  }
  npcWin.addEventListener("click", (e) => {
    const x = e.target.closest("[data-npc-zoom]");
    if (x) {
      npcZoom = Math.max(0.6, Math.min(1.8, npcZoom + Number(x.dataset.npcZoom) * 0.1));
      npcWin.querySelector(".npc-sheet").style.zoom = npcZoom;
    } else if (e.target.closest("[data-npc-close]")) rbShow(npcWin, false);
  });
  npcWin.addEventListener("pointerdown", (e) => {
    if (!e.target.closest("[data-npc-drag]") || e.target.closest("button")) return;
    const box = npcWin.getBoundingClientRect();
    const dx = e.clientX - box.left;
    const dy = e.clientY - box.top;
    const home = npcWin.offsetParent.getBoundingClientRect();
    const move = (m) => {
      npcWin.style.transform = "none";
      npcWin.style.left = `${m.clientX - dx - home.left}px`;
      npcWin.style.top = `${m.clientY - dy - home.top}px`;
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  });
  bindWin.addEventListener("click", (e) => {
    const add = e.target.closest("[data-npc-add]");
    if (add) addNpcToken(add.dataset.npcAdd);
    else if (e.target.closest("[data-bind-save]")) saveBind();
    else if (e.target.closest("[data-bind-cancel]")) rbShow(bindWin, false);
  });
  bindWin.addEventListener("change", (e) => {
    const d = bindDraft;
    const x = e.target;
    if (x.matches("[data-bind-mag]")) d.mag = Math.max(0, Math.round(Number(x.value)) || 0);
    else if (x.matches("[data-bind-sheet]")) {
      d.pick = x.value;
      const s = bindSheetOf(d);
      const n = bindNpcOf(d);
      d.mag = s ? ccMagOf(s.data) : n ? npcMagOf(n) : 0;
      if (s && users[s.owner] && s.owner !== ctx.gmUid) d.player = s.owner;
      drawBind();
    } else if (x.matches("[data-bind-player]")) {
      d.player = x.value;
      const own = d.list.find((s) => s.owner === x.value);
      if (!d.pick && own) {
        d.pick = `s:${own.id}`;
        d.mag = ccMagOf(own.data);
      }
      drawBind();
    }
  });

  function tokenInTurn(ob) {
    return turns.list.some((e) => e.ob === ob.id || (ob.sheet && e.sheet === ob.sheet));
  }
  // remove: sağ tık menüsündeki İnisiyatiften Çıkar
  function addTokens(list, remove) {
    if (remove) {
      const out = turns.list.filter((e) => list.some((ob) => e.ob === ob.id || (ob.sheet && e.sheet === ob.sheet)));
      if (out.some((e) => e.id === turns.current)) turns.current = null;
      turns.list = turns.list.filter((e) => !out.includes(e));
      publishTurns();
      return;
    }
    for (const ob of list) {
      const same = turns.list.find((e) => e.ob === ob.id || (ob.sheet && e.sheet === ob.sheet));
      if (same) same.ob = ob.id; // kağıdı sırada olan karakterin tokeni yeni satır açmaz
      else turns.list.push({ id: ob.sheet ? `s${ob.sheet}` : `o${ob.id}`, ob: ob.id, sheet: ob.sheet || null, npc: ob.npc || null, title: ob.title || null, name: ob.label || ob.name, init: null, mod: 0, color: ob.color, hidden: !!ob.hidden });
    }
    publishTurns();
  }
  // Token gizlenirse sırada da gizlenir, silinirse sıradan çıkar, adı değişirse sırada da değişir
  function syncTurns(objects) {
    if (!asGm) return;
    let changed = false;
    turns.list = turns.list.filter((e) => {
      if (!e.ob) return true;
      const ob = objects.find((k) => k.id === e.ob);
      if (!ob) {
        changed = true;
        if (e.sheet) delete e.ob; // token silinse de karakter sırada kalır
        return !!e.sheet;
      }
      const name = ob.label || ob.name;
      if (e.hidden !== !!ob.hidden || e.name !== name || (e.npc || null) !== (ob.npc || null) || (e.title || null) !== (ob.title || null) || (ob.sheet && e.sheet !== ob.sheet)) {
        e.hidden = !!ob.hidden;
        e.name = name;
        e.npc = ob.npc || null;
        e.title = ob.title || null;
        if (ob.sheet) e.sheet = ob.sheet;
        changed = true;
      }
      return true;
    });
    if (changed) publishTurns();
  }
  // Eşitlikte DEX'i yüksek olan, o da eşitse d10'u yüksek olan önce oynar
  const sortTurns = () => turns.list.sort((a, b) => (b.init ?? -99) - (a.init ?? -99) || (b.dex || 0) - (a.dex || 0) || (b.tie || 0) - (a.tie || 0));
  // GM'in düğmesi inisiyatifi boş olanları atar; hepsi doluysa baştan atılır
  async function rollInit() {
    const empty = turns.list.filter((e) => e.init == null);
    const list = empty.length ? empty : turns.list;
    const again = !empty.length;
    let sheetsNow = [];
    let npcs = [];
    try {
      sheetsNow = await store.listSheets();
      if (list.some((e) => e.npc)) npcs = await window.CG_STORE.listNpcs();
    } catch (err) {} // okunamayan satır yalnızca d10 atar
    const now = Date.now();
    list.forEach((e, i) => {
      const s = sheetsNow.find((k) => k.id === e.sheet);
      const n = npcs.find((k) => k.id === e.npc);
      const v = s ? roomSheetInit(s) : n ? roomNpcInit(n, board.state.objects.find((k) => k.id === e.ob)) : { parts: [], dex: 0 };
      const r = roomInitRoll({ uid: net.me, who: e.name, color: e.color, init: e.id, at: now + i }, v);
      Object.assign(e, { init: r.total, dex: v.dex, tie: roomRoll(10) });
      if (!e.hidden) net.roll(r);
      else {
        // Gizli tokenin zarını yalnızca GM görür
        secretRolls = [{ ...r, who: e.title || e.name, secret: true }, ...secretRolls].slice(0, ROOM_LOG_MAX);
        throwDie(r);
      }
    });
    drawDice();
    sortTurns();
    if (again || !turns.current) {
      turns.current = turns.list.length ? turns.list[0].id : null;
      turns.round = 1;
    }
    publishTurns();
  }
  // Oyuncunun düğmesi zarı herkesin önünde atar, GM'in ekranı sonucu tur sırasına yazar
  function rollMyInit() {
    net.roll(roomInitRoll({ uid: net.me, who: sheet.name, color: (users[net.me] || {}).color || "#ffffff", init: sheet.id, at: Date.now() }, roomSheetInit(sheet)));
    drawDice();
  }
  function applyInit(r) {
    let e = turns.list.find((k) => k.sheet === r.init);
    if (!e) {
      e = { id: `s${r.init}`, sheet: r.init, name: r.who, color: r.color, hidden: false };
      turns.list.push(e);
    }
    Object.assign(e, { init: r.total, dex: r.dex || 0, tie: roomRoll(10) });
    sortTurns();
    publishTurns();
  }
  async function addSheets() {
    for (const s of await store.listSheets()) {
      if (!turns.list.some((e) => e.sheet === s.id)) turns.list.push({ id: `s${s.id}`, sheet: s.id, name: s.name, init: null, mod: statMod(ccStatOf(s.data, "REF")), color: colorOf(s), hidden: false });
    }
    publishTurns();
  }
  function turnAction(key, id) {
    const list = turns.list;
    const i = list.findIndex((e) => e.id === id);
    if (key === "up" || key === "down") {
      const j = key === "up" ? i - 1 : i + 1;
      [list[i], list[j]] = [list[j], list[i]];
    } else if (key === "remove") {
      if (turns.current === id) turns.current = null;
      list.splice(i, 1);
    } else if (key === "next") {
      const at = list.findIndex((e) => e.id === turns.current);
      if (at === list.length - 1) turns.round += 1;
      turns.current = list[(at + 1) % list.length].id;
    } else if (key === "roll") {
      rollInit();
      return;
    } else if (key === "sort") {
      sortTurns();
    } else if (key === "clear") {
      turns = { round: 1, current: null, list: [] };
    }
    publishTurns();
  }
  function drawTurns() {
    const has = turns.list.length > 0;
    const foot = (key, label) => `<button type="button" class="rb-text-btn" data-turn="${key}"${has ? "" : " disabled"}>${label}</button>`;
    turnsBox.innerHTML = `
      <div class="rb-users-head"><b>${t.turnsTitle}</b><small class="room-round">${t.round(turns.round)}</small>${asGm ? foot("next", t.next) : ""}</div>
      <ul class="rb-users">${has ? turns.list.map((e, i) => `
        <li data-entry="${ccEsc(e.id)}" class="${e.id === turns.current ? "on" : ""}${e.hidden ? " off" : ""}">
          <i class="rb-dot" style="--c: ${ccEsc(e.color)}"></i>
          <span class="rb-user-name">${ccEsc(asGm && e.title ? `${e.title} ${e.name.replace(/^\D+/, "")}` : e.name)}</span>
          ${asGm ? `<input type="number" class="room-init" data-turn-init value="${e.init ?? ""}" aria-label="${t.initLabel}">
            ${rbBtn('data-turn="up"', "up", t.moveUp, false, i === 0)}${rbBtn('data-turn="down"', "down", t.moveDown, false, i === turns.list.length - 1)}${rbBtn('data-turn="remove"', "close", t.removeTurn)}`
            : `<b class="room-init-val">${e.init ?? ""}</b>`}
        </li>`).join("") : `<li class="room-empty">${t.noTurns}</li>`}</ul>
      ${!asGm && sheet ? `<div class="room-turn-foot"><button type="button" class="rb-text-btn" data-init-roll>${t.rollInit}</button></div>` : ""}
      ${asGm ? `<div class="room-turn-foot"><button type="button" class="rb-text-btn" data-turn-sheets>${t.addSheets}</button>${foot("roll", t.rollInit)}${foot("sort", t.sortInit)}${foot("clear", t.clearTurns)}</div><p class="room-note">${t.tokenHint}</p>` : ""}`;
  }

  // ---- Envanter: GM oyuncuyu seçer, eşyaları ve parayı düzenler, Onayla ile masadaki kağıda yazar ----
  async function loadInv() {
    invBox.innerHTML = `<p class="room-empty">${t.loading}</p>`;
    try {
      invSheets = (await store.listSheets()).filter((s) => s.owner);
      invBox.innerHTML = `
        <div class="rb-users-head"><b>${t.invTitle}</b></div>
        <ul class="rb-users">${invSheets.length ? invSheets.map((s) => `<li><button type="button" class="room-inv-pick" data-inv-open="${s.id}" style="--c: ${colorOf(s)}"><b>${ccEsc(s.name)}</b>${users[s.owner] ? `<small>${ccEsc(users[s.owner].name)}</small>` : ""}</button></li>`).join("") : `<li class="room-empty">${t.invNone}</li>`}</ul>`;
    } catch (err) {
      invBox.innerHTML = `<p class="room-empty">${ccEsc(window.CG_STORE.errorText(err))}</p>`;
    }
  }
  const invGroup = (e) => {
    const x = e.id && ITEMS.find((k) => k.id === e.id);
    return x && x.type === "zirh" ? "armor" : x && x.type === "silah" ? "weapons" : "items";
  };
  function drawInv() {
    const s = invDraft.sheet;
    const rows = (key) => {
      const list = invDraft.items.map((e, i) => [e, i]).filter(([e]) => invGroup(e) === key);
      return list.length ? list.map(([e, i]) => `<li><span class="rb-user-name">${ccEsc(ccInvName(e, L))}</span>${rbBtn(`data-inv-del="${i}"`, "close", t.invRemove)}</li>`).join("") : `<li class="room-empty">${t.invEmpty}</li>`;
    };
    invWin.innerHTML = `
      <div class="rb-users-head"><b>${ccEsc(t.invOf(s.name))}</b></div>
      <label class="room-inv-money">${t.invMoney}<input type="number" min="0" data-inv-money value="${invDraft.money}"></label>
      <h4>${t.invArmor}</h4><ul class="rb-users">${rows("armor")}</ul>
      <h4>${t.invWeapons}</h4><ul class="rb-users">${rows("weapons")}</ul>
      <h4>${t.invItems}</h4><ul class="rb-users">${rows("items")}</ul>
      <div class="room-inv-foot">
        <button type="button" class="rb-text-btn" data-inv-add>${t.invAdd}</button>
        <span></span>
        <button type="button" class="rb-text-btn" data-inv-cancel>${t.invCancel}</button>
        <button type="button" class="rb-text-btn room-inv-ok" data-inv-save>${t.invSave}</button>
      </div>
      <p class="room-empty" data-inv-msg></p>`;
  }
  function openInv(id) {
    const s = invSheets.find((k) => k.id === id);
    const inv = ccInventory(s.data);
    invDraft = { sheet: s, money: inv.money, items: inv.items.map((e) => ({ ...e })) };
    drawInv();
    rbShow(invWin, true);
  }
  // Aynı eşya adetle birikir
  function addInvItem(entry) {
    const same = invDraft.items.find((e) => (entry.id ? e.id === entry.id : e.name === entry.name));
    if (same) same.qty += 1;
    else invDraft.items.push({ ...entry, qty: 1 });
    rbShow(invAdd, false);
    drawInv();
  }
  function drawInvList() {
    const list = invAdd.querySelector(".room-inv-list");
    if (!list) return;
    const q = invSearch.trim().toLocaleLowerCase(L);
    const found = ITEMS.filter((x) => !q || x.name[L].toLocaleLowerCase(L).includes(q));
    list.innerHTML = found.map((x) => `<li><button type="button" data-inv-item="${x.id}"><span>${ccEsc(x.name[L])}</span><small>${ccEsc(itemKind(x, L))}</small></button></li>`).join("");
  }
  function drawInvAdd() {
    const tab = (key, label) => `<button type="button" class="room-inv-tab${invAddMode === key ? " on" : ""}" data-inv-tab="${key}">${label}</button>`;
    invAdd.innerHTML = `
      <div class="room-inv-tabs">${tab("existing", t.invExisting)}${tab("custom", t.invCustom)}${rbBtn("data-inv-add-close", "close", t.close)}</div>
      ${invAddMode === "existing"
        ? `<input type="search" class="room-inv-search" data-inv-search value="${ccEsc(invSearch)}" placeholder="${t.invSearch}" aria-label="${t.invSearch}"><ul class="room-inv-list"></ul>`
        : `<form class="room-inv-custom"><input type="text" maxlength="60" placeholder="${t.invCustomName}" aria-label="${t.invCustomName}" autocomplete="off"><button type="submit" class="rb-text-btn">${t.invAddNow}</button></form><p class="room-note">${t.invCustomNote}</p>`}`;
    drawInvList();
  }
  async function saveInv() {
    const s = invDraft.sheet;
    const data = { ...s.data, envanter: { money: Math.max(0, Math.round(invDraft.money) || 0), items: invDraft.items } };
    try {
      await store.update(s.id, { data });
    } catch (err) {
      invWin.querySelector("[data-inv-msg]").textContent = window.CG_STORE.errorText(err);
      return;
    }
    s.data = data;
    const open = findSheet(s.id);
    if (open) open.data = data;
    board.setMag(s.id, ccMagOf(data));
    invDraft = null;
    rbShow(invWin, false);
    rbShow(invAdd, false);
    if (viewed && viewed.id === s.id) drawPop();
  }

  // ---- Seviye: GM verir ya da alır, her işlem onay ister. Oyuncu seçimlerini sonra kağıda yazar. ----
  function drawLevels() {
    const canChange = (s) => (levelTake ? s.level > 1 : s.level < ROOM_MAX_LEVEL);
    const step = levelTake ? "−1" : "+1";
    levelBox.innerHTML = `
      <div class="rb-users-head"><b>${t.levelTitle}</b></div>
      <button type="button" class="room-level-mode${levelTake ? " take" : ""}" data-level-mode aria-pressed="${levelTake}">${levelTake ? t.levelTake : t.levelGive}</button>
      <button type="button" class="room-level-all${levelTake ? " take" : ""}" data-level-all${levelSheets.some(canChange) ? "" : " disabled"}>${t.levelAll}</button>
      <ul class="rb-users">${levelSheets.length ? levelSheets.map((s) => `<li data-level-sheet="${s.id}">
        <span class="rb-user-name">${ccEsc(s.name)}${users[s.owner] ? ` <small>(${ccEsc(users[s.owner].name)})</small>` : ""}</span>
        <small class="room-level-now">${t.level(s.level)}</small>
        <button type="button" class="rb-text-btn room-level-one${levelTake ? " take" : ""}" data-level-one${canChange(s) ? "" : " disabled"} aria-label="${levelTake ? t.levelTake : t.levelGive}">${step}</button>
      </li>`).join("") : `<li class="room-empty">${t.levelNone}</li>`}</ul>`;
  }
  async function loadLevels() {
    levelBox.innerHTML = `<p class="room-empty">${t.loading}</p>`;
    try {
      levelSheets = (await store.listSheets()).filter((s) => s.owner);
      drawLevels();
    } catch (err) {
      levelBox.innerHTML = `<p class="room-empty">${ccEsc(window.CG_STORE.errorText(err))}</p>`;
    }
  }
  async function changeLevels(list, ask) {
    const step = levelTake ? -1 : 1;
    const targets = list.filter((s) => (levelTake ? s.level > 1 : s.level < ROOM_MAX_LEVEL));
    if (!targets.length || !(await ccConfirm(ask, L, levelTake ? t.levelTake : t.levelGive))) return;
    try {
      await Promise.all(targets.map((s) => store.update(s.id, { level: s.level + step })));
      targets.forEach((s) => (s.level += step));
      drawLevels();
    } catch (err) {
      levelBox.insertAdjacentHTML("beforeend", `<p class="room-empty">${ccEsc(window.CG_STORE.errorText(err))}</p>`);
    }
  }

  // ---- AI oyuncular: yalnızca AI rozetli hesap görür ----
  function drawAi() {
    const own = Object.entries(users).filter(([, u]) => u.owner === net.me);
    aiBox.innerHTML = `
      <div class="rb-users-head"><b>${t.aiPanel}</b></div>
      <form class="room-ai-add"><input type="text" maxlength="20" placeholder="${t.aiName}" aria-label="${t.aiName}" autocomplete="off"><button type="submit" class="rb-text-btn">${t.aiAdd}</button></form>
      <ul class="rb-users">${own.length ? own.map(([uid, u]) => `<li data-user="${uid}"><i class="rb-dot" style="--c: ${ccEsc(u.color)}"></i><span class="rb-user-name">${ccEsc(nameOf(uid))}</span>${rbBtn("data-ai-drop", "close", t.kick)}</li>`).join("") : `<li class="room-empty">${t.aiNone}</li>`}</ul>`;
  }

  // ---- Oda kodu ----
  function drawCode(msg = "") {
    codeBox.innerHTML = `
      <div class="rb-users-head"><b>${t.code}</b></div>
      ${code ? `<output class="room-code-value">${code}</output>` : ""}
      <p class="room-note">${ctx.demo ? t.demoCode : t.codeHint}</p>
      <div class="room-turn-foot">
        ${code ? `<button type="button" class="rb-text-btn" data-code-copy>${t.copy}</button>` : ""}
        <button type="button" class="rb-text-btn" data-code-new>${code ? t.newCode : t.makeCode}</button>
      </div>
      ${msg ? `<p class="room-note">${ccEsc(msg)}</p>` : ""}`;
  }

  // ---- Kullanıcılar ----
  const drawUsers = () => {
    if (renaming) return; // yazılan isim yeniden çizimle silinmesin
    // AI hesabının kendisi listede görünmez, yalnızca eklediği oyuncular görünür
    const rows = Object.entries(users).filter(([uid, u]) => u.online && (uid === net.me || !u.ai || u.owner)).sort(([a], [b]) => (b === ctx.gmUid) - (a === ctx.gmUid));
    usersBox.innerHTML = `
      <div class="rb-users-head"><b>${t.users}</b>${asGm ? rbBtn("data-sheet-names", "sheet", t.sheetNames, !!settings.sheetNames) : ""}</div>
      <ul class="rb-users">${rows.map(([uid, u]) => {
        const mine = canEdit(uid);
        return `<li data-user="${uid}">
          <button type="button" class="rb-dot" style="--c: ${ccEsc(u.color)}" data-user-color aria-label="${t.pickColor}"${mine ? "" : " disabled"}></button>
          ${u.ai ? `<em class="rb-ai" title="${t.aiBadge}">${rbIcon("chip")}</em>` : ""}
          <span class="rb-user-name">${ccEsc(nameOf(uid))}${uid === net.me ? ` <small>(${t.you})</small>` : ""}</span>
          ${uid === ctx.gmUid ? `<em class="rb-gm">GM</em>` : ""}
          ${mine ? rbBtn("data-user-menu", "kebab", t.userMenu) : ""}
        </li>`;
      }).join("")}</ul>`;
  };
  const openUserMenu = (uid, x, y) => {
    const items = [["rename", t.rename, "pencil"]];
    if (!asGm && uid !== net.me) items.push(["kick", t.kick, "close"]); // AI hesabı kendi oyuncusunu çıkarır
    if (asGm && uid !== net.me) items.push(["give", t.give, "sheet"], ["kick", t.kick, "close"]);
    userMenu.dataset.uid = uid;
    userMenu.innerHTML = items.map(([key, label, icon]) => `<button type="button" data-user-do="${key}">${rbIcon(icon)}<span>${label}</span></button>`).join("");
    placeUserMenu(x, y);
  };
  const placeUserMenu = (x, y) => {
    const box = root.getBoundingClientRect();
    userMenu.style.left = `${Math.min(x - box.left, box.width - 230)}px`;
    userMenu.style.top = `${y - box.top}px`;
    rbShow(userMenu, true);
  };
  // GM çekmecedeki kağıda sağ tıklar; silince bağlı token boşa çıkar, kağıt tur sırasından düşer, sahibine haber gider
  const openSheetMenu = (id, x, y) => {
    userMenu.innerHTML = `<button type="button" data-sheet-del="${id}">${rbIcon("trash")}<span>${t.sheetDel}</span></button>`;
    placeUserMenu(x, y);
  };
  async function deleteSheet(id) {
    rbShow(userMenu, false);
    const s = findSheet(id);
    if (!s || !(await ccConfirm(t.sheetDelAsk(s.name), L, t.sheetDel))) return;
    try {
      await store.remove(id);
    } catch (err) {
      drawer.innerHTML = `<p class="room-empty">${ccEsc(window.CG_STORE.errorText(err))}</p>`;
      return;
    }
    sheets = sheets.filter((k) => k.id !== id);
    levelSheets = levelSheets.filter((k) => k.id !== id);
    invSheets = invSheets.filter((k) => k.id !== id);
    if (viewed === s) {
      viewed = null;
      leveling = false;
      rbShow(pop, false);
    }
    board.dropSheet(id);
    const gone = turns.list.find((e) => e.sheet === id);
    if (gone) {
      if (turns.current === gone.id) turns.current = null;
      turns.list = turns.list.filter((e) => e !== gone);
      publishTurns();
    }
    if (s.owner && users[s.owner]) {
      if (users[s.owner].owner) net.setUser(s.owner, { sheet: null });
      else net.notifySheet(s.owner);
    }
    if (rbIsOpen(drawer)) drawDrawer();
    if (rbIsOpen(levelBox)) drawLevels();
    if (rbIsOpen(invBox)) loadInv();
  }
  const startRename = (uid) => {
    const span = usersBox.querySelector(`[data-user="${uid}"] .rb-user-name`);
    if (!span) return;
    renaming = uid;
    span.innerHTML = `<input class="rb-name-input" type="text" maxlength="30" value="${ccEsc(users[uid].name)}" aria-label="${t.rename}">`;
    const input = span.firstElementChild;
    input.focus();
    input.select();
    let done = false;
    const finish = (save) => {
      if (done) return;
      done = true;
      renaming = null;
      const name = input.value.trim();
      if (save && name && name !== users[uid].name) net.setUser(uid, { name });
      drawUsers();
    };
    input.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") finish(true);
      if (e.key === "Escape") finish(false);
    });
    input.addEventListener("blur", () => finish(true));
  };
  const showGiveList = async (uid) => {
    userMenu.innerHTML = `<p class="room-empty">${t.loading}</p>`;
    try {
      giveList = await store.listSheets();
    } catch (err) {
      userMenu.innerHTML = `<p class="room-empty">${ccEsc(window.CG_STORE.errorText(err))}</p>`;
      return;
    }
    userMenu.innerHTML = giveList.length
      ? giveList.map((s) => `<button type="button" data-give="${s.id}"${s.owner === uid ? ' class="on"' : ""}><span>${ccEsc(s.name)}</span><small>${s.owner ? ccEsc(nameOf(s.owner)) : ccEsc(roomRole(s.role))}</small></button>`).join("")
      : `<p class="room-empty">${t.noSheets}</p>`;
  };
  const giveSheet = async (id, uid) => {
    const s = giveList.find((x) => x.id === id);
    if (!s || s.owner === uid) return rbShow(userMenu, false);
    const takes = users[uid] || {};
    try {
      await store.give(id, uid, takes.owner || null);
    } catch (err) {
      userMenu.innerHTML = `<p class="room-empty">${ccEsc(window.CG_STORE.errorText(err))}</p>`;
      return;
    }
    rbShow(userMenu, false);
    const tell = (who, sheetName) => ((users[who] || {}).owner ? net.setUser(who, { sheet: sheetName }) : net.notifySheet(who));
    tell(uid, s.name.slice(0, 60));
    if (s.owner) tell(s.owner, null);
    if (rbIsOpen(drawer)) loadSheets();
  };
  const openColor = (uid, dot) => {
    const r = dot.getBoundingClientRect();
    const box = root.getBoundingClientRect();
    colorBox.style.left = `${r.left - box.left}px`;
    colorBox.style.top = `${r.bottom - box.top + 8}px`;
    roomColorPicker(colorBox, users[uid].color, t, (hex) => {
      rbShow(colorBox, false);
      if (hex) net.setUser(uid, { color: hex });
    });
    rbShow(colorBox, true);
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
    if (!asGm) {
      drawer.innerHTML = sheet ? `<button type="button" class="room-sheet-btn" data-open-sheet="${sheet.id}">${ccEsc(t.sheet(sheet.name))}</button>${vitals(sheet)}` : `<p class="room-empty">${t.waitSheet}</p>`;
      return;
    }
    drawer.innerHTML = `
      <div class="rb-drawer-head"><b>${t.tableSheets}</b><button type="button" class="rb-text-btn" data-add-sheet>${t.addSheet}</button></div>
      <ul class="rb-sheets">${sheets.length
        ? sheets.map((s) => `<li><button type="button" data-open-sheet="${s.id}" style="--sheet-color: ${colorOf(s)}"><b>${ccEsc(s.name)}</b><span>${ccEsc(roomRole(s.role))} · ${t.level(s.level)}${s.owner && users[s.owner] ? ` · ${ccEsc(nameOf(s.owner))}` : ""}</span><small>HP ${s.hp} / ${s.hpMax}</small></button></li>`).join("")
        : `<li class="room-empty">${t.noSheets}</li>`}</ul>
      <div class="rb-addlist" hidden></div>`;
  };
  const loadSheets = async () => {
    if (!asGm) return;
    drawer.innerHTML = `<p class="room-empty">${t.loading}</p>`;
    try {
      sheets = await store.listSheets();
      drawDrawer();
    } catch (err) {
      drawer.innerHTML = `<p class="room-empty">${ccEsc(window.CG_STORE.errorText(err))}</p>`;
    }
  };
  let leveling = false; // kağıt penceresinde Karakter Geliştir sayfası açık
  const closeLevelUp = () => {
    leveling = false;
    drawPop();
  };
  async function saveLevelUp(s, data) {
    const v = ccVitals(data);
    const patch = { data, hp: Math.max(0, s.hp + v.hpMax - s.hpMax), hpMax: v.hpMax, humanity: s.humanity + v.humanityMax - s.humanityMax, humanityMax: v.humanityMax, luck: Math.max(0, s.luck + v.luckMax - s.luckMax), luckMax: v.luckMax };
    try {
      await store.update(s.id, patch);
    } catch (err) {
      pop.querySelector(".lu-foot span").textContent = window.CG_STORE.errorText(err);
      return;
    }
    Object.assign(s, patch);
    drawDrawer();
    closeLevelUp();
  }
  const openLevelUp = () => {
    const s = viewed;
    leveling = true;
    pop.innerHTML = `<div class="lu-page"></div>`;
    ccLevelUp(pop.firstElementChild, s, L, (data) => saveLevelUp(s, data), closeLevelUp);
  };
  const drawPop = () => {
    if (!viewed || leveling) return;
    pop.style.setProperty("--sheet-color", colorOf(viewed));
    pop.innerHTML = `
      <header><b>${ccEsc(viewed.name)}</b><span>${ccEsc(roomRole(viewed.role))} · ${t.level(viewed.level)}</span>${viewed.level > (viewed.data.seviye || 1) ? `<button type="button" class="room-level-up" data-level-up>${t.levelUp}</button>` : ""}<button type="button" class="room-pop-close" data-close-sheet aria-label="${t.close}">${rbIcon("close")}</button></header>
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
    if (key === "hp") board.setHp(s.id, next);
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
  // Sol üstteki pencereler aynı yerde açılır, biri açılınca ötekiler kapanır
  const toggleLeft = (name, btn) => {
    for (const [key, box] of Object.entries(leftPanels)) if (key !== name && rbIsOpen(box)) toggle(box, el.querySelector(`[data-room="${key}"]`));
    toggle(leftPanels[name], btn);
    if (name === "code") drawCode();
    if (name === "level" && rbIsOpen(levelBox)) loadLevels();
    if (name === "inv" && rbIsOpen(invBox)) loadInv();
  };

  root.addEventListener("pointerdown", (e) => {
    if (rbIsOpen(colorBox) && !e.target.closest(".rb-color")) rbShow(colorBox, false);
    if (rbIsOpen(userMenu) && !e.target.closest(".room-user-ctx") && !e.target.closest("[data-user-menu]")) rbShow(userMenu, false);
  });
  root.addEventListener("input", (e) => {
    if (e.target.matches("[data-inv-money]")) invDraft.money = Number(e.target.value) || 0;
    if (e.target.matches("[data-inv-search]")) {
      invSearch = e.target.value;
      drawInvList();
    }
  });
  root.addEventListener("submit", (e) => {
    if (e.target.matches(".room-inv-custom")) {
      e.preventDefault();
      const name = e.target.firstElementChild.value.trim();
      if (name) addInvItem({ name });
      return;
    }
    if (!e.target.matches(".room-ai-add")) return;
    e.preventDefault();
    const name = e.target.firstElementChild.value.trim();
    if (name) net.addDrone(name);
  });
  root.addEventListener("change", (e) => {
    if (!e.target.matches("[data-turn-init]")) return;
    const entry = turns.list.find((k) => k.id === e.target.closest("[data-entry]").dataset.entry);
    entry.init = e.target.value === "" ? null : Number(e.target.value);
    publishTurns();
  });
  root.addEventListener("contextmenu", (e) => {
    const die = e.target.closest("[data-die]");
    if (die) {
      e.preventDefault();
      const at = pool.lastIndexOf(Number(die.dataset.die));
      if (at >= 0) pool.splice(at, 1);
      drawDice();
      return;
    }
    const held = asGm && e.target.closest(".rb-sheets [data-open-sheet]");
    if (held) {
      e.preventDefault();
      openSheetMenu(held.dataset.openSheet, e.clientX, e.clientY);
      return;
    }
    const row = e.target.closest("[data-user]");
    if (!row) return;
    e.preventDefault();
    if (canEdit(row.dataset.user)) openUserMenu(row.dataset.user, e.clientX, e.clientY);
  });
  root.addEventListener("click", async (e) => {
    const b = (sel) => e.target.closest(sel);
    let x;
    if ((x = b("[data-room]")) && leftPanels[x.dataset.room]) {
      toggleLeft(x.dataset.room, x);
    } else if ((x = b('[data-room="menu"]'))) {
      toggle(menu, x);
    } else if ((x = b('[data-room="drawer"]'))) {
      toggle(drawer, x);
      if (rbIsOpen(drawer)) loadSheets();
    } else if ((x = b("[data-die]"))) {
      if (pool.length < ROOM_POOL_MAX) pool.push(Number(x.dataset.die));
      drawDice();
    } else if (b("[data-roll]")) {
      rollPool();
    } else if ((x = b("[data-turn]"))) {
      turnAction(x.dataset.turn, (b("[data-entry]") || {}).dataset?.entry);
    } else if (b("[data-init-roll]")) {
      if (asGm) rollInit();
      else rollMyInit();
    } else if (b("[data-turn-sheets]")) {
      addSheets();
    } else if (b("[data-code-copy]")) {
      navigator.clipboard.writeText(code).then(() => drawCode(t.copied), () => {});
    } else if ((x = b("[data-code-new]"))) {
      x.disabled = true;
      try {
        code = await net.makeCode(code);
        ctx.code = code;
        drawCode();
      } catch (err) {
        drawCode(window.CG_STORE.errorText(err));
      }
    } else if (b("[data-room-secret]")) {
      secret = !secret;
      drawDice();
    } else if ((x = b("[data-inv-open]"))) {
      openInv(x.dataset.invOpen);
    } else if ((x = b("[data-inv-del]"))) {
      const e = invDraft.items[Number(x.dataset.invDel)];
      e.qty -= 1;
      if (e.qty < 1) invDraft.items.splice(Number(x.dataset.invDel), 1);
      drawInv();
    } else if (b("[data-inv-add]")) {
      invAddMode = "existing";
      invSearch = "";
      drawInvAdd();
      rbShow(invAdd, true);
    } else if ((x = b("[data-inv-tab]"))) {
      invAddMode = x.dataset.invTab;
      drawInvAdd();
    } else if (b("[data-inv-add-close]")) {
      rbShow(invAdd, false);
    } else if ((x = b("[data-inv-item]"))) {
      addInvItem({ id: x.dataset.invItem });
    } else if (b("[data-inv-cancel]")) {
      invDraft = null;
      rbShow(invWin, false);
      rbShow(invAdd, false);
    } else if (b("[data-inv-save]")) {
      saveInv();
    } else if (b("[data-level-up]")) {
      openLevelUp();
    } else if (b("[data-level-mode]")) {
      levelTake = !levelTake;
      drawLevels();
    } else if (b("[data-level-all]")) {
      changeLevels(levelSheets, levelTake ? t.levelAllTakeAsk : t.levelAllGiveAsk);
    } else if ((x = b("[data-level-one]"))) {
      const s = levelSheets.find((k) => k.id === b("[data-level-sheet]").dataset.levelSheet);
      changeLevels([s], (levelTake ? t.levelTakeAsk : t.levelGiveAsk)(s.name));
    } else if (b("[data-ai-drop]")) {
      net.dropUser(b("[data-user]").dataset.user);
    } else if (b("[data-sheet-names]")) {
      net.setSettings({ sheetNames: !settings.sheetNames });
    } else if ((x = b("[data-user-color]"))) {
      openColor(b("[data-user]").dataset.user, x);
    } else if ((x = b("[data-user-menu]"))) {
      const r = x.getBoundingClientRect();
      openUserMenu(b("[data-user]").dataset.user, r.left, r.bottom + 4);
    } else if ((x = b("[data-user-do]"))) {
      const uid = userMenu.dataset.uid;
      const key = x.dataset.userDo;
      if (key === "give") return showGiveList(uid);
      rbShow(userMenu, false);
      if (key === "rename") startRename(uid);
      else if (key === "kick") (users[uid].owner ? net.dropUser(uid) : net.kick(uid));
    } else if ((x = b("[data-give]"))) {
      giveSheet(x.dataset.give, userMenu.dataset.uid);
    } else if ((x = b("[data-open-sheet]"))) {
      viewed = findSheet(x.dataset.openSheet);
      leveling = false;
      drawPop();
      rbShow(pop, true);
    } else if ((x = b("[data-sheet-del]"))) {
      deleteSheet(x.dataset.sheetDel);
    } else if (b("[data-close-sheet]")) {
      viewed = null;
      rbShow(pop, false);
    } else if ((x = b("[data-vital]"))) {
      setVital(x.dataset.sheet, x.dataset.vital, Number(x.dataset.step));
    } else if (b("[data-add-sheet]")) {
      const box = drawer.querySelector(".rb-addlist");
      rbShow(box, !rbIsOpen(box));
      if (!rbIsOpen(box)) return;
      const [saved, ready] = await Promise.all([window.CG_STORE.listChars().catch(() => []), window.CG_STORE.listReadyChars().catch(() => [])]);
      const stock = ctx.demo ? [...ready, roomSampleChar(t.sample)] : ready;
      roomAddList = [...saved, ...stock];
      const rows = (list, empty) => (list.length ? list.map((k) => `<button type="button" data-add-char="${k.id}" style="--sheet-color: ${CLASS_COLORS[k.role] || "#fff"}">${ccEsc(k.name)}<small>${ccEsc(roomRole(k.role))}</small></button>`).join("") : `<p class="room-empty">${empty}</p>`);
      box.innerHTML = `<b class="rb-add-head">${t.addSaved}</b>${rows(saved, t.noSaved)}<b class="rb-add-head">${t.addReady}</b>${rows(stock, t.noReady)}`;
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
      net.reset();
      ctx.view("gm");
    }
  });

  drawDice();
  drawTurns();
  if (!asGm) drawDrawer();
  ctx.onLeave(() => net.leave());
  ctx.onLeave(net.watchRolls((list) => {
    const fresh = seenRolls ? list.filter((r) => !seenRolls.has(roomRollKey(r))) : [];
    seenRolls = new Set(list.map(roomRollKey));
    rolls = list;
    fresh.forEach(throwDie);
    if (asGm) fresh.filter((r) => r.init && r.uid !== net.me).forEach(applyInit);
    drawDice();
  }, ROOM_LOG_MAX));
  ctx.onLeave(net.watchTurns(asGm, (v) => {
    turns = { round: (v && v.round) || 1, current: (v && v.current) || null, list: Object.values((v && v.list) || {}) };
    drawTurns();
    drawDice();
  }));
  ctx.onLeave(net.watchUsers((map) => {
    users = map;
    drawUsers();
    if (ctx.isAi) drawAi();
    if (asGm && rbIsOpen(drawer)) drawDrawer();
  }));
  ctx.onLeave(net.watchSettings((value) => {
    settings = value;
    drawUsers();
  }));
  ctx.onLeave(net.onKicked(ctx.kicked));
  if (!asGm) ctx.onLeave(net.onSheetChange(() => ctx.view("player", false))); // GM kağıdı değiştirdi
  net.join({ name: ctx.userName, color: RB_COLORS[roomHash(net.me) % RB_COLORS.length], sheet: sheet ? sheet.name : null, ai: !!ctx.isAi }).catch(ctx.fail);
  // Kağıt başka yerden değişirse (GM ya da başka sekme) sayaçlar güncellenir
  if (sheet) ctx.onLeave(store.watch(sheet.id, (next) => {
    Object.assign(sheet, { hp: next.hp, hpMax: next.hpMax, humanity: next.humanity, humanityMax: next.humanityMax, luck: next.luck, luckMax: next.luckMax, level: next.level, data: next.data });
    drawDrawer();
    if (viewed === sheet) drawPop();
  }));
}
let roomAddList = [];
let roomAddNpcs = [];

// ctx: { id, name, isGm, isAi, demo, leaveHref, userName, gmUid, members, code }
async function mountRoom(el, ctx) {
  const L = typeof lang !== "undefined" && lang === "en" ? "en" : "tr";
  const t = ROOM_TEXT[L];
  const store = ctx.demo ? roomDemoStore() : roomTableStore(ctx.id);
  const net = ctx.demo ? roomDemoNet(L) : window.CG_STORE.roomNet(ctx.id);
  if (ctx.demo) ctx.gmUid = net.gmUid;
  const stops = [];
  ctx.onLeave = (stop) => stops.push(stop);
  const stopAll = () => stops.splice(0).forEach((stop) => stop());
  const leave = () => {
    stopAll();
    window.removeEventListener("hashchange", leave);
  };
  window.addEventListener("hashchange", leave);
  ctx.stop = leave;
  const notice = (text, extra = "") => {
    el.innerHTML = `
      <div class="room room-pick">
        <div class="room-stage" aria-hidden="true"></div>
        <section class="room-panel">
          <p class="room-table">${ccEsc(ctx.name)}</p>
          <p class="cc-hint">${ccEsc(text)}</p>
          <div class="room-panel-foot">${extra}<a class="cc-btn" href="${ctx.leaveHref}">${t.leave}</a></div>
        </section>
      </div>`;
  };
  const fail = (err) => {
    stopAll();
    notice(window.CG_STORE.errorText(err));
  };
  ctx.fail = fail;
  ctx.kicked = () => {
    leave();
    notice(t.kicked, `<button type="button" class="cc-btn primary" data-reenter>${t.reenter}</button>`);
    el.querySelector("[data-reenter]").addEventListener("click", () => mountRoom(el, ctx));
  };
  const enterAsPlayer = async (pick = true) => {
    try {
      const sheet = await store.getSheet();
      if (sheet || !pick) return roomShell(el, ctx, sheet, L, store, net, false);
      const saved = await window.CG_STORE.listChars();
      const chars = ctx.demo ? [...saved, roomSampleChar(t.sample)] : saved;
      roomPicker(el, ctx, chars, L, async (c) => {
        try {
          roomShell(el, ctx, await store.createSheet(c), L, store, net, false);
        } catch (err) {
          fail(err);
        }
      }, () => roomShell(el, ctx, null, L, store, net, false));
    } catch (err) {
      fail(err);
    }
  };
  ctx.view = (mode, pick) => {
    stopAll();
    if (net.setView) net.setView(mode);
    return mode === "player" ? enterAsPlayer(pick) : roomShell(el, ctx, null, L, store, net, true);
  };
  if (!ctx.isGm) return enterAsPlayer();
  try {
    await net.claim(ctx.members || [], ctx.code);
  } catch (err) {
    return fail(err);
  }
  return roomShell(el, ctx, null, L, store, net, true);
}
