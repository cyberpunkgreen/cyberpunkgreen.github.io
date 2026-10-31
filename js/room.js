// ---------- Masa odası (#masa/<kimlik>) ----------
// Oda bütün ekranı kaplar; site menüsü görünmez. js/auth.js masaya girişi denetler ve mountRoom'u çağırır.
// Oyuncu odaya ilk girişinde kayıtlı karakterlerinden birini seçer. Seçilen karakterin kopyası masaya yazılır (tables/{id}/sheets/{uid});
// bundan sonra masadaki kağıt Karakter Oluştur'daki kayıttan bağımsızdır. GM karakter seçmez.
// Sıradaki adımlar: alt çekmece ve karakter kağıdı, zar, harita, GM araçları, çizim, Seviye Atlat.

const ROOM_TEXT = {
  tr: {
    leave: "Masadan Çık", closeTable: "Masayı Kapat", gm: "GM", level: (n) => `${n}. seviye`, loading: "Yükleniyor…",
    pickTitle: "Karakterini Seç", pickHint: "Bu masada oynayacağın karakteri seç. Karakterin kopyası masaya geçer; oyun boyunca masadaki kağıt, kayıtlı karakterinden bağımsız ilerler.",
    pickAsk: (n) => `“${n}” ile girilsin mi? Bu masada kağıdın bu karakterin kopyası olur.`, pickYes: "Gir",
    noChars: "Masaya girmek için kayıtlı bir karakterin olmalı.", makeChar: "Karakter Oluştur",
  },
  en: {
    leave: "Leave Table", closeTable: "Close Table", gm: "GM", level: (n) => `Level ${n}`, loading: "Loading…",
    pickTitle: "Choose Your Character", pickHint: "Choose the character you'll play at this table. A copy goes to the table; from then on the sheet here moves on separately from your saved character.",
    pickAsk: (n) => `Enter as “${n}”? Your sheet at this table will be a copy of this character.`, pickYes: "Enter",
    noChars: "You need a saved character to join a table.", makeChar: "Create a Character",
  },
};

const roomRole = (id) => (CLASSES.find((c) => c.id === id) || {}).name || "";

// Odanın iskeleti: harita alanı, sol üstte masa adı, sağda araç kutusu, altta karakter çubuğu
function roomShell(el, ctx, sheet, lang) {
  const t = ROOM_TEXT[lang];
  el.innerHTML = `
    <div class="room">
      <div class="room-stage" aria-hidden="true"></div>
      <div class="room-corner"><b>${ccEsc(ctx.name)}</b></div>
      <aside class="room-tools">
        <a class="cc-btn" href="${ctx.leaveHref}">${t.leave}</a>
        ${ctx.isGm ? `<button type="button" class="cc-btn danger" data-close-table>${t.closeTable}</button>` : ""}
      </aside>
      <div class="room-bar">${sheet ? `<b>${ccEsc(sheet.name)}</b><span>${ccEsc(roomRole(sheet.role))} · ${t.level(sheet.level)}</span>` : `<b>${t.gm}</b>`}</div>
    </div>`;
}

// İlk girişte karakter seçimi
function roomPicker(el, ctx, chars, lang, onPick) {
  const t = ROOM_TEXT[lang];
  const body = chars.length
    ? `<p class="cc-hint">${t.pickHint}</p>
       <div class="room-chars">${chars.map((c) => `<button type="button" class="cf-card cw-card room-char" data-char="${c.id}" style="--feat: #39ff14"><b>${ccEsc(c.name)}</b><span class="cf-tier">${ccEsc(roomRole(c.role))} · ${t.level((c.data && c.data.seviye) || 1)}</span></button>`).join("")}</div>`
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
    if (c && (await ccConfirm(t.pickAsk(c.name), lang, t.pickYes))) onPick(c);
  });
}

// ctx: { id, name, isGm, leaveHref }
async function mountRoom(el, ctx) {
  const lang = localStorage.getItem("cg-lang") === "en" ? "en" : document.documentElement.lang === "en" ? "en" : "tr";
  const store = window.CG_STORE;
  const fail = (err) => {
    el.innerHTML = `<p class="placeholder">${ccEsc(store.errorText(err))}</p>`;
  };
  if (ctx.isGm) return roomShell(el, ctx, null, lang);
  try {
    const sheet = await store.getTableSheet(ctx.id);
    if (sheet) return roomShell(el, ctx, sheet, lang);
    const chars = await store.listChars();
    roomPicker(el, ctx, chars, lang, async (c) => {
      try {
        roomShell(el, ctx, await store.createTableSheet(ctx.id, c), lang);
      } catch (err) {
        fail(err);
      }
    });
  } catch (err) {
    fail(err);
  }
}
