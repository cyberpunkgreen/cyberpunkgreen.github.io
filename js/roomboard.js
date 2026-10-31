// ---------- Masa haritası (js/room.js kullanır) ----------
// Tek bir canvas: ızgara, objeler (harita, prop, token), savaş sisi. Araç kutusu ve menüler canvas'ın üstünde durur.
// Fare: tekerlek yakınlaştırır · sol tık boş yerde kaydırır (Taşı aracı) ya da toplu seçer (Seç aracı) · orta tuş her zaman kaydırır · sağ tık menü açar.
// Klavye: F gizle · Delete sil · Ctrl+D çoğalt · Esc seçimi bırak · Alt basılıyken snap tersine döner.
// Sis: harita kapalı başlar; GM dörtgen, serbest alan ya da fırçayla açar ve kapatır. Sis işlemleri sırayla uygulanır.
// Durum şimdilik bu tarayıcıda saklanır (localStorage); paylaşılması Realtime Database ile gelecek.

const RB_GRID = 48; // 1 kare, ekranda %100 yakınlıkta
const RB_METERS = 2; // 1 kare = 2 metre
const RB_ZOOM = { min: 0.25, max: 4 };
const RB_LAYERS = ["map", "prop", "token"]; // alttan üste
const RB_COLORS = ["#ff6b6b", "#4dabf7", "#51cf66", "#fcc419", "#cc5de8", "#ff922b", "#20c997", "#f06595"];
const RB_BRUSH = 48; // sis fırçasının dünya birimiyle kalınlığı

const RB_TEXT = {
  tr: {
    move: "Taşı", select: "Seç", fog: "Savaş Sisi", draw: "Çizim (yakında)", text: "Yazı (yakında)", pointer: "Pointer (yakında)", snap: "Snap",
    zoomIn: "Yakınlaştır", zoomOut: "Uzaklaştır", zoomReset: "%100'e dön",
    map: "Harita", prop: "Prop", token: "Token", defaultHidden: "Yeni objeler gizli başlasın",
    hide: "Gizle (F)", show: "Göster (F)", lock: "Kilitle", unlock: "Kilidi Aç", layer: "Katman", duplicate: "Çoğalt", del: "Sil",
    freeOn: "Herkes Taşıyabilsin", freeOff: "Yalnızca GM Taşısın", center: "Görünümü Sıfırla", addToken: "Buraya Token Ekle",
    fogRect: "Dörtgen", fogLasso: "Serbest Alan", fogBrush: "Fırça", fogReveal: "Sisi Aç", fogCover: "Sis Koy", fogAll: "Her Yeri Kapat", fogClear: "Her Yeri Aç", fogPreview: "Oyuncu Gibi Gör",
  },
  en: {
    move: "Move", select: "Select", fog: "Fog of War", draw: "Drawing (coming soon)", text: "Text (coming soon)", pointer: "Pointer (coming soon)", snap: "Snap",
    zoomIn: "Zoom in", zoomOut: "Zoom out", zoomReset: "Back to 100%",
    map: "Map", prop: "Prop", token: "Token", defaultHidden: "New objects start hidden",
    hide: "Hide (F)", show: "Show (F)", lock: "Lock", unlock: "Unlock", layer: "Layer", duplicate: "Duplicate", del: "Delete",
    freeOn: "Everyone Can Move It", freeOff: "Only the GM Moves It", center: "Reset View", addToken: "Add Token Here",
    fogRect: "Rectangle", fogLasso: "Free Area", fogBrush: "Brush", fogReveal: "Reveal", fogCover: "Cover", fogAll: "Cover Everything", fogClear: "Reveal Everything", fogPreview: "View as Player",
  },
};

const RB_ICONS = {
  hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.3l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
  select: '<path d="M4 4l6.5 16 2.3-6.7L19.5 11Z"/><path d="M14 17l4 4"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z"/>',
  pencil: '<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  type: '<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
  pointer: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><circle cx="16" cy="16" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
  swords: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/><path d="M14.5 6.5 18 3h3v3l-3.5 3.5"/><path d="M5 14l4 4"/><path d="M7 17l-3 3"/><path d="M3 19l2 2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M9.9 4.2A10 10 0 0 1 12 4c6.4 0 10 8 10 8a18 18 0 0 1-2.2 3.2"/><path d="M6.6 6.6A18 18 0 0 0 2 12s3.6 8 10 8a10 10 0 0 0 5.4-1.6"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="M2 2l20 20"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.8-1"/>',
  layers: '<path d="M12 2 2 7l10 5 10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  map: '<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/>',
  token: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  dots: '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  rect: '<rect x="4" y="5" width="16" height="14" rx="2"/>',
  lasso: '<path d="M7 22a5 5 0 0 1-2-4"/><path d="M3.3 14A7 7 0 0 1 2 10c0-4.4 4.5-8 10-8s10 3.6 10 8-4.5 8-10 8a12 12 0 0 1-5-1"/><circle cx="5" cy="16" r="2"/>',
  brush: '<path d="m9 12 8.1-8.1a2.8 2.8 0 1 1 4 4L13 16"/><path d="M7 15c-1.7 0-3 1.4-3 3 0 1.3-2.5 1.5-2 2 1.1 1.1 2.5 2 4 2 2.2 0 4-1.8 4-4a3 3 0 0 0-3-3Z"/>',
  magnet: '<path d="M6 3h4v9a2 2 0 0 0 4 0V3h4v9a6 6 0 0 1-12 0Z"/><path d="M6 8h4M14 8h4"/>',
  erase: '<path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l10-10a2 2 0 0 1 2.8 0l5.4 5.4a2 2 0 0 1 0 2.8L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
  fill: '<rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor"/>',
};
// Pencereleri animasyonla açar ve kapatır: kapanırken önce rb-closing oynar, sonra gizlenir
const RB_CLOSE_MS = 140;
function rbShow(box, open) {
  clearTimeout(box.rbTimer);
  if (open) {
    box.classList.remove("rb-closing");
    box.hidden = false;
  } else if (!box.hidden) {
    box.classList.add("rb-closing");
    box.rbTimer = setTimeout(() => {
      box.hidden = true;
      box.classList.remove("rb-closing");
    }, RB_CLOSE_MS);
  }
}
const rbIsOpen = (box) => !box.hidden && !box.classList.contains("rb-closing");

const rbIcon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${RB_ICONS[name]}</svg>`;
const rbBtn = (attrs, icon, label, on = false, off = false) =>
  `<button type="button" class="rb-btn${on ? " on" : ""}" ${attrs} title="${label}" aria-label="${label}"${off ? " disabled" : ""}>${rbIcon(icon)}</button>`;

// o: { key: kayıt anahtarı, gm: GM görünümü mü, lang, bottom: alt çubuk, onLeave(fn) }
function mountBoard(host, o) {
  const t = RB_TEXT[o.lang];
  const save0 = (() => {
    try {
      return JSON.parse(localStorage.getItem(o.key));
    } catch (e) {
      return null;
    }
  })();
  const st = { objects: [], fog: { base: true, ops: [] }, defaultHidden: false, snap: true, ...(save0 || {}) };
  const cam = { x: 0, y: 0, zoom: 1 };
  let tool = "move";
  let fogShape = "rect";
  let fogMode = "reveal";
  let preview = false;
  let sel = new Set();
  let act = null; // sürmekte olan fare işi
  let dirty = true;
  let saveTimer = null;
  let alive = true;

  host.innerHTML = `
    <canvas class="rb-canvas"></canvas>
    <div class="rb-pill rb-tools">
      ${rbBtn('data-rbtool="move"', "hand", t.move, true)}
      ${rbBtn('data-rbtool="select"', "select", t.select)}
      ${o.gm ? rbBtn('data-rbtool="fog"', "cloud", t.fog) : ""}
      <i class="rb-sep"></i>
      ${rbBtn("", "pencil", t.draw, false, true)}
      ${rbBtn("", "type", t.text, false, true)}
      ${rbBtn("", "pointer", t.pointer, false, true)}
      <i class="rb-sep"></i>
      ${rbBtn("data-snap", "magnet", t.snap, st.snap)}
    </div>
    <div class="rb-pill rb-fogbar" hidden></div>
    <div class="rb-pill rb-zoom">
      ${rbBtn('data-zoom="-1"', "minus", t.zoomOut)}
      <button type="button" class="rb-zoomval" data-zoom="0" title="${t.zoomReset}">100%</button>
      ${rbBtn('data-zoom="1"', "plus", t.zoomIn)}
      <i class="rb-sep"></i>
      <span class="rb-scale">${RB_METERS} m</span>
    </div>
    <div class="rb-pill rb-objbar" hidden></div>
    <div class="rb-ctx" hidden></div>`;
  if (o.gm) {
    o.bottom.insertAdjacentHTML("beforeend", `
      <i class="rb-sep"></i>
      ${rbBtn('data-add="map"', "map", t.map)}
      ${rbBtn('data-add="prop"', "box", t.prop)}
      ${rbBtn('data-add="token"', "token", t.token)}
      <i class="rb-sep"></i>
      ${rbBtn("data-default-hidden", st.defaultHidden ? "eyeOff" : "eye", t.defaultHidden, st.defaultHidden)}`);
  }

  const cv = host.querySelector("canvas");
  const c = cv.getContext("2d");
  const fogCv = document.createElement("canvas");
  const f = fogCv.getContext("2d");
  const objbar = host.querySelector(".rb-objbar");
  const fogbar = host.querySelector(".rb-fogbar");
  const ctxMenu = host.querySelector(".rb-ctx");
  const zoomVal = host.querySelector(".rb-zoomval");
  let W = 0;
  let H = 0;
  let dpr = 1;

  const persist = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(o.key, JSON.stringify(st));
      } catch (e) {}
    }, 250);
  };
  const touch = () => {
    dirty = true;
    persist();
  };
  const toWorld = (sx, sy) => ({ x: sx / cam.zoom + cam.x, y: sy / cam.zoom + cam.y });
  const toScreen = (x, y) => ({ x: (x - cam.x) * cam.zoom, y: (y - cam.y) * cam.zoom });
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const gmView = () => o.gm && !preview;
  const visible = (ob) => gmView() || !ob.hidden;
  const canMove = (ob) => !ob.locked && (o.gm || ob.free);
  const ordered = () => st.objects.map((ob, i) => [ob, i]).sort(([a, i], [b, j]) => RB_LAYERS.indexOf(a.layer) - RB_LAYERS.indexOf(b.layer) || i - j).map(([ob]) => ob);
  const hit = (w) => ordered().reverse().find((ob) => visible(ob) && w.x >= ob.x && w.x <= ob.x + ob.w && w.y >= ob.y && w.y <= ob.y + ob.h);
  const selected = () => st.objects.filter((ob) => sel.has(ob.id));
  const snapOn = (e) => st.snap !== !!(e && e.altKey);
  const snapV = (v) => Math.round(v / RB_GRID) * RB_GRID;

  function addObject(kind, wx, wy) {
    const size = kind === "map" ? [RB_GRID * 20, RB_GRID * 14] : kind === "prop" ? [RB_GRID * 2, RB_GRID * 2] : [RB_GRID, RB_GRID];
    const same = st.objects.filter((x) => x.layer === kind).length + 1;
    const ob = {
      id: newId(), layer: kind, name: `${t[kind]} ${same}`, color: kind === "map" ? "#3b3e4a" : kind === "prop" ? "#6b7280" : RB_COLORS[(same - 1) % RB_COLORS.length],
      x: snapV(wx - size[0] / 2), y: snapV(wy - size[1] / 2), w: size[0], h: size[1], hidden: st.defaultHidden, locked: false, free: false,
    };
    st.objects.push(ob);
    sel = new Set([ob.id]);
    touch();
    syncBar();
  }

  // ---- Çizim ----
  function resize() {
    W = host.clientWidth;
    H = host.clientHeight;
    dpr = window.devicePixelRatio || 1;
    for (const k of [cv, fogCv]) {
      k.width = W * dpr;
      k.height = H * dpr;
    }
    dirty = true;
  }
  function drawGrid() {
    const g = RB_GRID * cam.zoom;
    c.strokeStyle = "rgba(225, 229, 246, .4)";
    c.lineWidth = 2;
    c.beginPath();
    for (let x = ((-cam.x * cam.zoom) % g + g) % g; x < W; x += g) {
      c.moveTo(Math.round(x), 0);
      c.lineTo(Math.round(x), H);
    }
    for (let y = ((-cam.y * cam.zoom) % g + g) % g; y < H; y += g) {
      c.moveTo(0, Math.round(y));
      c.lineTo(W, Math.round(y));
    }
    c.stroke();
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }
  function drawObject(ob) {
    const p = toScreen(ob.x, ob.y);
    const w = ob.w * cam.zoom;
    const h = ob.h * cam.zoom;
    c.save();
    c.globalAlpha = ob.hidden ? 0.45 : 1;
    if (ob.layer === "token") {
      c.beginPath();
      c.arc(p.x + w / 2, p.y + h / 2, w / 2 - 2, 0, Math.PI * 2);
    } else {
      roundRect(c, p.x, p.y, w, h, 10 * cam.zoom);
    }
    c.fillStyle = ob.color;
    c.fill();
    c.lineWidth = 2;
    c.strokeStyle = "rgba(255, 255, 255, .7)";
    if (ob.hidden) c.setLineDash([6, 5]);
    c.stroke();
    c.setLineDash([]);
    c.fillStyle = "#fff";
    c.textAlign = "center";
    c.textBaseline = "middle";
    const px = Math.max(10, (ob.layer === "token" ? 18 : 15) * cam.zoom);
    c.font = `700 ${px}px Rajdhani, sans-serif`;
    const label = ob.layer === "token" ? ob.name.replace(/\D+/g, "").slice(0, 2) || ob.name.slice(0, 2) : ob.name;
    c.fillText(label, p.x + w / 2, p.y + h / 2);
    if (ob.locked) {
      c.font = `700 ${Math.max(10, 12 * cam.zoom)}px sans-serif`;
      c.fillText("●", p.x + w - 9 * cam.zoom, p.y + 10 * cam.zoom);
    }
    c.restore();
  }
  function applyFogOp(op) {
    f.globalCompositeOperation = op.mode === "reveal" ? "destination-out" : "source-over";
    f.fillStyle = f.strokeStyle = "#101116";
    if (op.shape === "rect") {
      const a = toScreen(op.a.x, op.a.y);
      const b = toScreen(op.b.x, op.b.y);
      f.fillRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(a.x - b.x), Math.abs(a.y - b.y));
      return;
    }
    f.beginPath();
    op.pts.forEach((pt, i) => {
      const s = toScreen(pt.x, pt.y);
      i ? f.lineTo(s.x, s.y) : f.moveTo(s.x, s.y);
    });
    if (op.shape === "lasso") {
      f.closePath();
      f.fill();
    } else {
      f.lineWidth = RB_BRUSH * cam.zoom;
      f.lineCap = f.lineJoin = "round";
      f.stroke();
    }
  }
  function drawFog() {
    f.setTransform(dpr, 0, 0, dpr, 0, 0);
    f.globalCompositeOperation = "source-over";
    f.clearRect(0, 0, W, H);
    if (st.fog.base) {
      f.fillStyle = "#101116";
      f.fillRect(0, 0, W, H);
    }
    for (const op of st.fog.ops) applyFogOp(op);
    if (act && act.fog) applyFogOp(act.fog);
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = gmView() ? 0.5 : 1;
    c.drawImage(fogCv, 0, 0);
    c.restore();
  }
  function selectionBox() {
    const list = selected().filter(visible);
    if (!list.length) return null;
    const x = Math.min(...list.map((ob) => ob.x));
    const y = Math.min(...list.map((ob) => ob.y));
    return { x, y, w: Math.max(...list.map((ob) => ob.x + ob.w)) - x, h: Math.max(...list.map((ob) => ob.y + ob.h)) - y };
  }
  function draw() {
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = "#2b2c32";
    c.fillRect(0, 0, W, H);
    drawGrid();
    ordered().filter(visible).forEach(drawObject);
    drawFog();
    const box = selectionBox();
    if (box) {
      const p = toScreen(box.x, box.y);
      c.strokeStyle = "#fff";
      c.lineWidth = 2;
      roundRect(c, p.x - 3, p.y - 3, box.w * cam.zoom + 6, box.h * cam.zoom + 6, 10);
      c.stroke();
      if (rbIsOpen(objbar)) {
        objbar.style.left = `${Math.max(90, Math.min(W - 90, p.x + (box.w * cam.zoom) / 2))}px`;
        objbar.style.top = `${Math.min(H - 56, p.y + box.h * cam.zoom + 12)}px`;
      }
    }
    if (act && act.marquee) {
      const m = act.marquee;
      c.fillStyle = "rgba(255, 255, 255, .1)";
      c.strokeStyle = "#fff";
      c.lineWidth = 1;
      c.fillRect(m.x, m.y, m.w, m.h);
      c.strokeRect(m.x, m.y, m.w, m.h);
    }
    zoomVal.textContent = `${Math.round(cam.zoom * 100)}%`;
  }
  function loop() {
    if (!alive) return;
    if (dirty) {
      dirty = false;
      draw();
    }
    requestAnimationFrame(loop);
  }

  // ---- Seçim çubuğu: objenin altında ----
  function syncBar() {
    const list = selected();
    rbShow(ctxMenu, false);
    if (!list.length || !o.gm || preview) {
      rbShow(objbar, false);
      dirty = true;
      return;
    }
    const hidden = list.every((ob) => ob.hidden);
    const locked = list.every((ob) => ob.locked);
    objbar.innerHTML = `
      ${rbBtn("data-obj=hide", hidden ? "eye" : "eyeOff", hidden ? t.show : t.hide, hidden)}
      ${rbBtn("data-obj=lock", locked ? "unlock" : "lock", locked ? t.unlock : t.lock, locked)}
      ${rbBtn("data-obj=layer", "layers", t.layer)}
      ${rbBtn("data-obj=duplicate", "copy", t.duplicate)}
      ${rbBtn("data-obj=delete", "trash", t.del)}
      <div class="rb-layers" hidden>${RB_LAYERS.map((k) => `<button type="button" data-layer="${k}"${list.every((ob) => ob.layer === k) ? ' class="on"' : ""}>${t[k]}</button>`).join("")}</div>`;
    rbShow(objbar, true);
    dirty = true;
  }
  function objAction(a) {
    const list = selected();
    if (!list.length) return;
    if (a === "hide") {
      const to = !list.every((ob) => ob.hidden);
      list.forEach((ob) => (ob.hidden = to));
    } else if (a === "lock") {
      const to = !list.every((ob) => ob.locked);
      list.forEach((ob) => (ob.locked = to));
    } else if (a === "free") {
      const to = !list.every((ob) => ob.free);
      list.forEach((ob) => (ob.free = to));
    } else if (a === "duplicate") {
      const copies = list.map((ob) => ({ ...ob, id: newId(), x: ob.x + RB_GRID, y: ob.y + RB_GRID }));
      st.objects.push(...copies);
      sel = new Set(copies.map((ob) => ob.id));
    } else if (a === "delete") {
      st.objects = st.objects.filter((ob) => !sel.has(ob.id));
      sel = new Set();
    }
    touch();
    syncBar();
  }

  // ---- Sağ tık menüsü ----
  function openMenu(sx, sy, items) {
    ctxMenu.innerHTML = items.map(([key, label, icon]) => `<button type="button" data-menu="${key}">${rbIcon(icon)}<span>${label}</span></button>`).join("");
    rbShow(ctxMenu, true);
    ctxMenu.style.left = `${Math.min(sx, W - 230)}px`;
    ctxMenu.style.top = `${Math.min(sy, H - items.length * 40 - 12)}px`;
  }
  cv.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const w = toWorld(e.offsetX, e.offsetY);
    const ob = hit(w);
    act = null;
    if (ob && o.gm) {
      if (!sel.has(ob.id)) sel = new Set([ob.id]);
      syncBar();
      const list = selected();
      const hidden = list.every((x) => x.hidden);
      const locked = list.every((x) => x.locked);
      const free = list.every((x) => x.free);
      openMenu(e.offsetX, e.offsetY, [
        ["free", free ? t.freeOff : t.freeOn, "hand"],
        ["hide", hidden ? t.show : t.hide, hidden ? "eye" : "eyeOff"],
        ["lock", locked ? t.unlock : t.lock, locked ? "unlock" : "lock"],
        ["duplicate", t.duplicate, "copy"],
        ["delete", t.del, "trash"],
      ]);
    } else if (o.gm) {
      ctxMenu.dataset.x = w.x;
      ctxMenu.dataset.y = w.y;
      openMenu(e.offsetX, e.offsetY, [["addToken", t.addToken, "token"], ["center", t.center, "map"]]);
    } else {
      openMenu(e.offsetX, e.offsetY, [["center", t.center, "map"]]);
    }
  });

  // ---- Fare ----
  const setZoom = (z, sx = W / 2, sy = H / 2) => {
    const w = toWorld(sx, sy);
    cam.zoom = Math.max(RB_ZOOM.min, Math.min(RB_ZOOM.max, z));
    cam.x = w.x - sx / cam.zoom;
    cam.y = w.y - sy / cam.zoom;
    dirty = true;
  };
  cv.addEventListener("wheel", (e) => {
    e.preventDefault();
    setZoom(cam.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12), e.offsetX, e.offsetY);
  }, { passive: false });

  cv.addEventListener("pointerdown", (e) => {
    rbShow(ctxMenu, false);
    if (e.button === 2) return;
    try {
      cv.setPointerCapture(e.pointerId);
    } catch (err) {}
    const w = toWorld(e.offsetX, e.offsetY);
    if (e.button === 1) {
      act = { pan: true, sx: e.offsetX, sy: e.offsetY, cx: cam.x, cy: cam.y };
      return;
    }
    if (tool === "fog") {
      act = { fog: fogShape === "rect" ? { mode: fogMode, shape: "rect", a: w, b: w } : { mode: fogMode, shape: fogShape, pts: [w] } };
      return;
    }
    const ob = hit(w);
    if (ob) {
      if (e.shiftKey) {
        sel.has(ob.id) ? sel.delete(ob.id) : sel.add(ob.id);
      } else if (!sel.has(ob.id)) {
        sel = new Set([ob.id]);
      }
      syncBar();
      const moving = selected().filter(canMove);
      if (moving.length) act = { drag: moving.map((m) => ({ ob: m, x: m.x, y: m.y })), wx: w.x, wy: w.y, moved: false };
      return;
    }
    if (!e.shiftKey && sel.size) {
      sel = new Set();
      syncBar();
    }
    act = tool === "select" ? { box: true, sx: e.offsetX, sy: e.offsetY, marquee: { x: e.offsetX, y: e.offsetY, w: 0, h: 0 } } : { pan: true, sx: e.offsetX, sy: e.offsetY, cx: cam.x, cy: cam.y };
  });
  cv.addEventListener("pointermove", (e) => {
    if (!act) return;
    const w = toWorld(e.offsetX, e.offsetY);
    if (act.pan) {
      cam.x = act.cx - (e.offsetX - act.sx) / cam.zoom;
      cam.y = act.cy - (e.offsetY - act.sy) / cam.zoom;
    } else if (act.drag) {
      act.moved = true;
      for (const d of act.drag) {
        d.ob.x = d.x + w.x - act.wx;
        d.ob.y = d.y + w.y - act.wy;
      }
    } else if (act.marquee) {
      act.marquee = { x: Math.min(act.sx, e.offsetX), y: Math.min(act.sy, e.offsetY), w: Math.abs(e.offsetX - act.sx), h: Math.abs(e.offsetY - act.sy) };
    } else if (act.fog) {
      if (act.fog.shape === "rect") act.fog.b = w;
      else act.fog.pts.push(w);
    }
    dirty = true;
  });
  cv.addEventListener("pointerup", (e) => {
    if (!act) return;
    if (act.drag && act.moved) {
      if (snapOn(e)) {
        for (const d of act.drag) {
          d.ob.x = snapV(d.ob.x);
          d.ob.y = snapV(d.ob.y);
        }
      }
      touch();
    } else if (act.marquee) {
      const a = toWorld(act.marquee.x, act.marquee.y);
      const b = toWorld(act.marquee.x + act.marquee.w, act.marquee.y + act.marquee.h);
      sel = new Set(st.objects.filter((ob) => visible(ob) && !ob.locked && ob.x < b.x && ob.x + ob.w > a.x && ob.y < b.y && ob.y + ob.h > a.y).map((ob) => ob.id));
      act = null;
      syncBar();
    } else if (act.fog) {
      st.fog.ops.push(act.fog);
      touch();
    }
    act = null;
    dirty = true;
  });

  // ---- Araçlar ----
  function drawFogBar() {
    fogbar.innerHTML = `
      ${rbBtn('data-fog="rect"', "rect", t.fogRect, fogShape === "rect")}
      ${rbBtn('data-fog="lasso"', "lasso", t.fogLasso, fogShape === "lasso")}
      ${rbBtn('data-fog="brush"', "brush", t.fogBrush, fogShape === "brush")}
      <i class="rb-sep"></i>
      ${rbBtn('data-fogmode="reveal"', "eye", t.fogReveal, fogMode === "reveal")}
      ${rbBtn('data-fogmode="cover"', "cloud", t.fogCover, fogMode === "cover")}
      <i class="rb-sep"></i>
      ${rbBtn("data-fogall", "fill", t.fogAll)}
      ${rbBtn("data-fogclear", "erase", t.fogClear)}
      <i class="rb-sep"></i>
      ${rbBtn("data-fogpreview", preview ? "eyeOff" : "eye", t.fogPreview, preview)}`;
  }
  host.addEventListener("click", (e) => {
    const b = (s) => e.target.closest(s);
    let x;
    if ((x = b("[data-rbtool]"))) {
      tool = x.dataset.rbtool;
      for (const k of host.querySelectorAll("[data-rbtool]")) k.classList.toggle("on", k === x);
      if (tool === "fog") drawFogBar();
      rbShow(fogbar, tool === "fog");
      if (tool !== "fog" && preview) {
        preview = false;
        syncBar();
      }
    } else if ((x = b("[data-snap]"))) {
      st.snap = !st.snap;
      x.classList.toggle("on", st.snap);
      persist();
    } else if ((x = b("[data-zoom]"))) {
      const d = Number(x.dataset.zoom);
      setZoom(d ? cam.zoom * (d > 0 ? 1.25 : 0.8) : 1);
    } else if ((x = b("[data-fog]"))) {
      fogShape = x.dataset.fog;
      drawFogBar();
    } else if ((x = b("[data-fogmode]"))) {
      fogMode = x.dataset.fogmode;
      drawFogBar();
    } else if (b("[data-fogall]")) {
      st.fog = { base: true, ops: [] };
      touch();
    } else if (b("[data-fogclear]")) {
      st.fog = { base: false, ops: [] };
      touch();
    } else if (b("[data-fogpreview]")) {
      preview = !preview;
      drawFogBar();
      syncBar();
    } else if (b('[data-obj="layer"]')) {
      const row = objbar.querySelector(".rb-layers");
      rbShow(row, !rbIsOpen(row));
    } else if ((x = b("[data-obj]"))) {
      objAction(x.dataset.obj);
    } else if ((x = b("[data-layer]"))) {
      selected().forEach((ob) => (ob.layer = x.dataset.layer));
      touch();
      syncBar();
    } else if ((x = b("[data-menu]"))) {
      const key = x.dataset.menu;
      rbShow(ctxMenu, false);
      if (key === "addToken") addObject("token", Number(ctxMenu.dataset.x), Number(ctxMenu.dataset.y));
      else if (key === "center") {
        cam.x = cam.y = 0;
        cam.zoom = 1;
        dirty = true;
      } else objAction(key);
    }
  });
  o.bottom.addEventListener("click", (e) => {
    const b = (s) => e.target.closest(s);
    let x;
    if ((x = b("[data-add]"))) {
      const w = toWorld(W / 2, H / 2);
      addObject(x.dataset.add, w.x, w.y);
    } else if ((x = b("[data-default-hidden]"))) {
      st.defaultHidden = !st.defaultHidden;
      x.classList.toggle("on", st.defaultHidden);
      x.innerHTML = rbIcon(st.defaultHidden ? "eyeOff" : "eye");
      persist();
    }
  });

  const onKey = (e) => {
    if (!alive || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return;
    const k = e.key.toLowerCase();
    if (k === "escape") {
      sel = new Set();
      rbShow(ctxMenu, false);
      syncBar();
    } else if (!o.gm || !sel.size) {
      return;
    } else if (k === "f") {
      objAction("hide");
    } else if (k === "delete") {
      objAction("delete");
    } else if (k === "d" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      objAction("duplicate");
    }
  };
  window.addEventListener("keydown", onKey);
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  o.onLeave(() => {
    alive = false;
    ro.disconnect();
    window.removeEventListener("keydown", onKey);
    clearTimeout(saveTimer);
    try {
      localStorage.setItem(o.key, JSON.stringify(st));
    } catch (e) {}
  });
  resize();
  requestAnimationFrame(loop);
  return { state: st, cam };
}

// Oyuncu Gibi Gör ile GM arasında geçerken harita aynı kayıttan yeniden kurulur
const roomBoardKey = (id) => `cg-board:${id}`;
