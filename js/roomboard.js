// ---------- Masa haritası (js/room.js kullanır) ----------
// Tek bir canvas: ızgara, objeler (harita, prop, token), savaş sisi. Araç kutusu ve menüler canvas'ın üstünde durur.
// Fare: tekerlek yakınlaştırır · sol tık boş yerde kaydırır (Taşı aracı) ya da toplu seçer (Seç aracı) · orta tuş her zaman kaydırır · sağ tık menü açar.
// Tek seçili objenin köşeleri boyutlandırır (Shift oranı korur), üstündeki tutamaç döndürür. Cetvel sol tıka basılı tutularak çekilir, kare ortalarına oturur.
// Çizim aracı herkese açıktır: kalem, dörtgen, üçgen (ilk tık sabit köşe, imleç karşı kenarın ortası) ve daire (ilk tık merkez). Çizerken snap yoktur, imlecin yanında metre yazar.
// Çizim obje gibi taşınır ve snap'e uyar; oyuncu kendi çizimini taşıyıp Delete ile silebilir.
// Yazı aracı tıklanan yere yazı objesi koyar; yazı diğer objeler gibi taşınır, döner, kilitlenir ve katmana alınır, seçiliyken üstte biçim çubuğu çıkar.
// Bir kullanıcı obje taşırken obje onun renginde çerçevelenir; konum herkese anlık gider, hedef yeri bırakınca kaydedilir.
// AI Haritası aracı (yalnızca GM): AI oyuncuların resmi değil veriyi okuyabilmesi için harita alanı, duvar, boşluk ve sıvı alanları çizer. Alanlar 1 metreye oturur, adı içine yazılır, obje gibi davranır. Dairede ilk tık merkezdir.
// Klavye: F gizle · Delete sil · Ctrl+D çoğalt · Esc seçimi bırak · Alt basılıyken snap tersine döner.
// Sis: harita kapalı başlar; GM dörtgen, serbest alan ya da fırçayla sis şekilleri çizer. Şekiller sırayla uygulanır; Sürükle aracıyla taşınır ve boyutlandırılır.
// Durum: gerçek masada o.net ile Realtime Database'e yazılır (js/auth.js roomNet), Deneme Odası'nda bu tarayıcıda kalır (localStorage).

const RB_GRID = 48; // 1 kare, ekranda %100 yakınlıkta
const RB_METERS = 2; // 1 kare = 2 metre
const RB_ZOOM = { min: 0.25, max: 4 };
const RB_LAYERS = [1, 2, 3, 4, 5]; // alttan üste
const RB_KIND_LAYER = { map: 1, prop: 2, token: 3, text: 4, draw: 4 }; // yeni objenin başladığı katman
const RB_STROKES = [2, 4, 8]; // kalem kalınlıkları
const RB_FINE = RB_GRID / 2; // AI haritası alanlarının snap'i: 1 metre
const RB_AREAS = {
  floor: { fill: "rgba(92, 104, 130, .55)", line: "#8d9ab8", ink: "#fff", layer: 1 },
  wall: { fill: "rgba(225, 229, 246, .8)", line: "#ffffff", ink: "#1e1f25", layer: 2 },
  void: { fill: "rgba(0, 0, 0, .75)", line: "#ff6b6b", ink: "#fff", layer: 2 },
  liquid: { fill: "rgba(77, 171, 247, .5)", line: "#4dabf7", ink: "#fff", layer: 2 },
};
const RB_FONTS = ["Chakra Petch", "Rajdhani", "Segoe UI", "Georgia", "Consolas", "Impact"];
const RB_TEXT_SIZE = 28; // yeni yazının harf boyu (%100 yakınlıkta)
const RB_MOVE_MS = 100; // taşınan objenin konumu en sık bu aralıkla paylaşılır
const RB_HANDLE = 6; // köşe tutamacının ekrandaki yarı boyu
const RB_ROT_GAP = 26; // döndürme tutamacının üst kenara uzaklığı
const RB_ROT_STEP = 15; // snap açıkken dönme adımı (derece)
const RB_COLORS = ["#ff6b6b", "#4dabf7", "#51cf66", "#fcc419", "#cc5de8", "#ff922b", "#20c997", "#f06595"];
const RB_BRUSH = 48; // sis fırçasının dünya birimiyle kalınlığı

const RB_TEXT = {
  tr: {
    move: "Taşı", select: "Seç", fog: "Savaş Sisi", ruler: "Cetvel", draw: "Çizim", drawPen: "Kalem", drawRect: "Dörtgen", drawTri: "Üçgen", drawCircle: "Daire", drawColor: "Kalem Rengi", drawWidth: "Kalınlık", text: "Yazı", pointer: "Pointer (yakında)", snap: "Snap", pull: "Oyuncuları Buraya Getir",
    zoomIn: "Yakınlaştır", zoomOut: "Uzaklaştır", zoomReset: "%100'e dön",
    map: "Harita", prop: "Prop", token: "Token", defaultHidden: "Yeni objeler gizli başlasın",
    hide: "Gizle (F)", show: "Göster (F)", lock: "Kilitle", unlock: "Kilidi Aç", layer: "Katman", duplicate: "Çoğalt", del: "Sil",
    aiTools: "AI Haritası", areaFloor: "Harita Alanı", areaWall: "Duvar", areaVoid: "Uçurum / Delik / Boşluk", areaLiquid: "Su / Lav / Asit", shapeRect: "Kare", shapeCircle: "Daire", areaName: "Alan adı",
    name: "İsim Ver", namePh: "Obje adı", addTurn: "Tura Ekle", bold: "Kalın", italic: "İtalik", underline: "Altı Çizili", textColor: "Yazı Rengi", textFont: "Yazı Tipi", textSize: "Boyut", textPh: "Yazı",
    freeOn: "Herkes Taşıyabilsin", freeOff: "Yalnızca GM Taşısın", center: "Görünümü Sıfırla", addToken: "Buraya Token Ekle",
    fogDrag: "Sürükle", fogRect: "Dörtgen", fogLasso: "Serbest Alan", fogBrush: "Fırça", fogReveal: "Sisi Aç", fogCover: "Sis Koy", fogAll: "Her Yeri Kapat", fogClear: "Her Yeri Aç", fogPreview: "Oyuncu Gibi Gör",
  },
  en: {
    move: "Move", select: "Select", fog: "Fog of War", ruler: "Ruler", draw: "Drawing", drawPen: "Pen", drawRect: "Rectangle", drawTri: "Triangle", drawCircle: "Circle", drawColor: "Pen Color", drawWidth: "Width", text: "Text", pointer: "Pointer (coming soon)", snap: "Snap", pull: "Bring Players Here",
    zoomIn: "Zoom in", zoomOut: "Zoom out", zoomReset: "Back to 100%",
    map: "Map", prop: "Prop", token: "Token", defaultHidden: "New objects start hidden",
    hide: "Hide (F)", show: "Show (F)", lock: "Lock", unlock: "Unlock", layer: "Layer", duplicate: "Duplicate", del: "Delete",
    aiTools: "AI Map", areaFloor: "Map Area", areaWall: "Wall", areaVoid: "Pit / Hole / Void", areaLiquid: "Water / Lava / Acid", shapeRect: "Square", shapeCircle: "Circle", areaName: "Area name",
    name: "Name", namePh: "Object name", addTurn: "Add to Turns", bold: "Bold", italic: "Italic", underline: "Underline", textColor: "Text Color", textFont: "Font", textSize: "Size", textPh: "Text",
    freeOn: "Everyone Can Move It", freeOff: "Only the GM Moves It", center: "Reset View", addToken: "Add Token Here",
    fogDrag: "Drag", fogRect: "Rectangle", fogLasso: "Free Area", fogBrush: "Brush", fogReveal: "Reveal", fogCover: "Cover", fogAll: "Cover Everything", fogClear: "Reveal Everything", fogPreview: "View as Player",
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
  chip: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 7V3M14 7V3M10 21v-4M14 21v-4M7 10H3M7 14H3M21 10h-4M21 14h-4"/>',
  circle: '<circle cx="12" cy="12" r="8"/>',
  wall: '<path d="M3 5h18v14H3Z"/><path d="M3 10h18M3 15h18M9 5v5M15 10v5M9 15v4"/>',
  void: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4" fill="currentColor"/>',
  liquid: '<path d="M12 3s7 7.2 7 12a7 7 0 0 1-14 0c0-4.8 7-12 7-12Z"/>',
  triangle: '<path d="M12 4 21 20H3Z"/>',
  levels: '<path d="m6 11 6-6 6 6"/><path d="m6 19 6-6 6 6"/>',
  bag: '<path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M8 6V5a4 4 0 0 1 8 0v1"/><path d="M8 14h8"/>',
  bold: '<path d="M7 4h7a4 4 0 0 1 0 8H7Z"/><path d="M7 12h8a4 4 0 0 1 0 8H7Z"/>',
  italic: '<path d="M19 4h-9"/><path d="M14 20H5"/><path d="M15 4 9 20"/>',
  underline: '<path d="M6 4v6a6 6 0 0 0 12 0V4"/><path d="M4 20h16"/>',
  key: '<circle cx="8" cy="15" r="5"/><path d="m12 11 8-8"/><path d="m16 7 3 3"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
  focus: '<circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>',
  kebab: '<circle cx="12" cy="5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="19" r="1.6" fill="currentColor"/>',
  sheet: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
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

// Eski kayıtlarda layer obje türünü tutuyordu (map, prop, token)
const rbNormObject = (ob) => (typeof ob.layer === "string" ? { label: "", ...ob, kind: ob.layer, layer: RB_KIND_LAYER[ob.layer] || 2, rot: ob.rot || 0, at: ob.at || 0 } : { rot: 0, at: 0, label: "", ...ob });
const rbFontOf = (ob, px) => `${ob.italic ? "italic " : ""}${ob.bold ? 700 : 500} ${px}px "${ob.font}", sans-serif`;
const rbRad = (deg) => (deg * Math.PI) / 180;
const rbCenter = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
// p noktasını c'nin çevresinde deg derece döndürür
function rbTurn(p, c, deg) {
  const a = rbRad(deg);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a), y: c.y + dx * Math.sin(a) + dy * Math.cos(a) };
}
// Köşeler: 0 sol üst, 1 sağ üst, 2 sağ alt, 3 sol alt
const rbCorners = (b) => [[0, 0], [1, 0], [1, 1], [0, 1]].map(([i, j]) => rbTurn({ x: b.x + i * b.w, y: b.y + j * b.h }, rbCenter(b), b.rot || 0));
function rbBounds(pts) {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}
const rbInside = (w, b) => {
  const p = rbTurn(w, rbCenter(b), -(b.rot || 0));
  return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
};
// Noktaları kutuya ve kutuya göre 0–1 arası x, y dizisine çevirir
function rbFit(points) {
  const box = rbBounds(points);
  const w = box.w || 1;
  const h = box.h || 1;
  const round = (v) => Math.round(v * 1e4) / 1e4;
  return { x: box.x, y: box.y, w, h, pts: points.flatMap((p) => [round((p.x - box.x) / w), round((p.y - box.y) / h)]) };
}
// Çizimin dünyadaki çizgisi (döndürülmeden önce)
function rbSketchLine(ob) {
  if (ob.shape === "rect") return [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]].map(([i, j]) => ({ x: ob.x + i * ob.w, y: ob.y + j * ob.h }));
  if (ob.shape === "ellipse") {
    const mid = rbCenter(ob);
    return [...Array(41)].map((_, i) => ({ x: mid.x + (Math.cos((i * Math.PI) / 20) * ob.w) / 2, y: mid.y + (Math.sin((i * Math.PI) / 20) * ob.h) / 2 }));
  }
  const line = [];
  for (let i = 0; i < ob.pts.length; i += 2) line.push({ x: ob.x + ob.pts[i] * ob.w, y: ob.y + ob.pts[i + 1] * ob.h });
  return ob.shape === "tri" ? [...line, line[0]] : line;
}
const rbSketchHit = (ob, w, reach) => rbNearLine(rbTurn(w, rbCenter(ob), -(ob.rot || 0)), rbSketchLine(ob), reach + ob.stroke / 2);

// Sis taslağını saklanan biçime çevirir: x, y, w, h şeklin kutusudur; serbest alan ve fırçada pts, kutuya göre 0–1 arası x, y dizisidir
function rbFogShape(d) {
  const base = { id: d.id, at: d.at, mode: d.mode, shape: d.shape };
  if (d.shape === "rect") {
    const box = rbBounds([d.a, d.b]);
    return box.w && box.h ? { ...base, ...box } : null;
  }
  if (d.pts.length < (d.shape === "lasso" ? 3 : 2)) return null;
  return { ...base, ...rbFit(d.pts) };
}
function rbFogPts(s) {
  const pts = [];
  for (let i = 0; i < s.pts.length; i += 2) pts.push({ x: s.x + s.pts[i] * s.w, y: s.y + s.pts[i + 1] * s.h });
  return pts;
}
function rbInPoly(w, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a.y > w.y !== b.y > w.y && w.x < ((b.x - a.x) * (w.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
function rbNearLine(w, pts, r) {
  return pts.slice(1).some((b, i) => {
    const a = pts[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const k = Math.max(0, Math.min(1, ((w.x - a.x) * dx + (w.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(w.x - (a.x + k * dx), w.y - (a.y + k * dy)) <= r;
  });
}

// o: { key: kayıt anahtarı, gm: GM görünümü mü, lang, bottom: alt çubuk, onLeave(fn), net: canlı masa (Deneme Odası'nda yok),
//      color(): kullanıcının rengi, onObjects(list): objeler değişince, onTurn(list): GM objeyi tura eklemek isteyince }
function mountBoard(host, o) {
  const t = RB_TEXT[o.lang];
  const save0 = (() => {
    try {
      return JSON.parse(localStorage.getItem(o.key));
    } catch (e) {
      return null;
    }
  })();
  const st = { objects: [], fog: { base: true, shapes: [] }, defaultHidden: false, snap: true, ...(save0 || {}) };
  st.objects = st.objects.map(rbNormObject);
  if (!st.fog.shapes) st.fog = { base: st.fog.base, shapes: [] };
  const cam = { x: 0, y: 0, zoom: 1 };
  let tool = "move";
  let fogShape = "rect";
  let fogMode = "reveal";
  let fogSel = null; // Sürükle aracıyla seçili sis şeklinin kimliği
  let preview = false;
  let sel = new Set();
  let act = null; // sürmekte olan fare işi
  let dirty = true;
  let saveTimer = null;
  let alive = true;
  const waiting = []; // sürükleme sırasında gelen uzaktan değişiklikler, bitince uygulanır
  let sketchShape = "pen"; // Çizim aracının şekli
  let sketchColor = null; // seçilmezse kullanıcının rengi
  let sketchWidth = RB_STROKES[1];
  let areaKind = "floor"; // AI Haritası aracının kalemi
  let areaShape = "rect";
  let areaName = "";
  let movers = {}; // başkalarının o an taşıdığı objeler: kimlik → { x, y, w, h, rot, color }
  let sentAt = 0;
  let sending = false;
  const textStyle = { color: "#ffffff", font: RB_FONTS[0], size: RB_TEXT_SIZE, bold: false, italic: false, underline: false }; // yeni yazılar son biçimle başlar

  host.innerHTML = `
    <canvas class="rb-canvas"></canvas>
    <div class="rb-pill rb-tools">
      ${rbBtn('data-rbtool="move"', "hand", t.move, true)}
      ${rbBtn('data-rbtool="select"', "select", t.select)}
      ${o.gm ? rbBtn('data-rbtool="fog"', "cloud", t.fog) : ""}
      ${o.gm ? rbBtn('data-rbtool="ai"', "chip", t.aiTools) : ""}
      ${rbBtn('data-rbtool="ruler"', "ruler", t.ruler)}
      <i class="rb-sep"></i>
      ${rbBtn('data-rbtool="draw"', "pencil", t.draw)}
      ${o.gm ? rbBtn('data-rbtool="text"', "type", t.text) : rbBtn("", "type", t.text, false, true)}
      ${rbBtn("", "pointer", t.pointer, false, true)}
      <i class="rb-sep"></i>
      ${rbBtn("data-snap", "magnet", t.snap, st.snap)}
      ${o.gm ? rbBtn("data-pull", "focus", t.pull) : ""}
    </div>
    <div class="rb-pill rb-fogbar" hidden></div>
    <div class="rb-pill rb-aibar" hidden></div>
    <div class="rb-pill rb-drawbar" hidden></div>
    <div class="rb-pill rb-textbar" hidden></div>
    <div class="rb-color" hidden></div>
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
  const aibar = host.querySelector(".rb-aibar");
  const drawbar = host.querySelector(".rb-drawbar");
  const textbar = host.querySelector(".rb-textbar");
  const colorBox = host.querySelector(".rb-color");
  const ctxMenu = host.querySelector(".rb-ctx");
  const zoomVal = host.querySelector(".rb-zoomval");
  let W = 0;
  let H = 0;
  let dpr = 1;

  // Canlı masada objeler ve sis Realtime Database'dedir; tarayıcıda yalnızca kişinin kendi ayarları kalır
  const saveNow = () => {
    try {
      localStorage.setItem(o.key, JSON.stringify(o.net ? { snap: st.snap, defaultHidden: st.defaultHidden } : st));
    } catch (e) {}
  };
  const persist = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 250);
  };
  const touch = () => {
    dirty = true;
    persist();
  };
  const saveObjects = (list) => {
    touch();
    if (o.net) list.forEach((ob) => (o.gm ? o.net.putObject(ob) : ob.kind === "draw" ? o.net.putOwn(ob) : o.net.moveObject(ob)));
    if (o.onObjects) o.onObjects(st.objects);
  };
  const saveFogShape = (s) => {
    touch();
    if (o.net) o.net.putFogShape(s);
  };
  const toWorld = (sx, sy) => ({ x: sx / cam.zoom + cam.x, y: sy / cam.zoom + cam.y });
  const toScreen = (x, y) => ({ x: (x - cam.x) * cam.zoom, y: (y - cam.y) * cam.zoom });
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const gmView = () => o.gm && !preview;
  const visible = (ob) => gmView() || !ob.hidden;
  const mine = (ob) => ob.kind === "draw" && ob.owner === o.me;
  const canMove = (ob) => !ob.locked && (o.gm || ob.free || mine(ob));
  const touches = (ob, w) => (ob.kind === "draw" ? rbSketchHit(ob, w, 8 / cam.zoom) : rbInside(w, ob));
  const ordered = () => [...st.objects].sort((a, b) => a.layer - b.layer || a.at - b.at);
  const hit = (w) => ordered().reverse().find((ob) => visible(ob) && touches(ob, w));
  const selected = () => st.objects.filter((ob) => sel.has(ob.id));
  const snapOn = (e) => st.snap !== !!(e && e.altKey);
  const snapV = (v, step = RB_GRID) => Math.round(v / step) * step;
  const stepOf = (ob) => (ob.kind === "area" ? RB_FINE : RB_GRID);
  const fine = (w, e) => (snapOn(e) ? { x: snapV(w.x, RB_FINE), y: snapV(w.y, RB_FINE) } : w);
  const cellCenter = (w) => ({ x: (Math.floor(w.x / RB_GRID) + 0.5) * RB_GRID, y: (Math.floor(w.y / RB_GRID) + 0.5) * RB_GRID });
  const fogSelected = () => st.fog.shapes.find((s) => s.id === fogSel);
  const lookAt = (v) => {
    cam.zoom = v.zoom;
    cam.x = v.x - W / 2 / v.zoom;
    cam.y = v.y - H / 2 / v.zoom;
    dirty = true;
  };

  function addObject(kind, wx, wy) {
    const size = kind === "map" ? [RB_GRID * 20, RB_GRID * 14] : kind === "prop" ? [RB_GRID * 2, RB_GRID * 2] : [RB_GRID, RB_GRID];
    const same = st.objects.filter((x) => x.kind === kind).length + 1;
    const ob = {
      id: newId(), kind, layer: RB_KIND_LAYER[kind], name: `${t[kind]} ${same}`, label: "", color: kind === "map" ? "#3b3e4a" : kind === "prop" ? "#6b7280" : RB_COLORS[(same - 1) % RB_COLORS.length],
      x: snapV(wx - size[0] / 2), y: snapV(wy - size[1] / 2), w: size[0], h: size[1], rot: 0, hidden: st.defaultHidden, locked: false, free: false, at: Date.now(),
    };
    st.objects.push(ob);
    sel = new Set([ob.id]);
    saveObjects([ob]);
    syncBar();
  }

  const areaBox = (s) => (areaShape === "ellipse" ? { x: s.a.x - s.r, y: s.a.y - s.r, w: s.r * 2, h: s.r * 2 } : rbBounds([s.a, s.b]));
  function addArea(box) {
    const ob = {
      id: newId(), kind: "area", area: areaKind, shape: areaShape, layer: RB_AREAS[areaKind].layer, name: "", label: areaName.trim(), color: RB_AREAS[areaKind].line,
      ...box, rot: 0, hidden: st.defaultHidden, locked: false, free: false, at: Date.now(),
    };
    st.objects.push(ob);
    saveObjects([ob]);
  }

  // Çizim taslağı: dünyadaki şekil ve metre yazısı
  function sketchOf(s) {
    const meters = (v) => Math.round((v / RB_GRID) * RB_METERS);
    const dist = Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y);
    if (s.shape === "pen") return { line: s.pts, text: `${meters(s.pts.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - s.pts[i].x, p.y - s.pts[i].y), 0))} m` };
    if (s.shape === "rect") {
      const box = rbBounds([s.a, s.b]);
      return { ...box, text: `${meters(box.w)} × ${meters(box.h)} m` };
    }
    if (s.shape === "ellipse") return { x: s.a.x - dist, y: s.a.y - dist, w: dist * 2, h: dist * 2, text: `${meters(dist)} m` };
    const nx = dist ? -(s.b.y - s.a.y) / dist : 0;
    const ny = dist ? (s.b.x - s.a.x) / dist : 0;
    const half = dist / 2;
    return { line: [s.a, { x: s.b.x + nx * half, y: s.b.y + ny * half }, { x: s.b.x - nx * half, y: s.b.y - ny * half }], text: `${meters(dist)} m` };
  }
  function addSketch(s) {
    const shape = sketchOf(s);
    const body = shape.line ? rbFit(shape.line) : { x: shape.x, y: shape.y, w: shape.w, h: shape.h };
    if (body.w < 2 && body.h < 2) return;
    const ob = {
      id: newId(), kind: "draw", shape: s.shape, layer: RB_KIND_LAYER.draw, name: "", label: "", color: sketchColor || o.color(), stroke: sketchWidth, owner: o.me,
      ...body, rot: 0, hidden: o.gm && st.defaultHidden, locked: false, free: false, at: Date.now(),
    };
    st.objects.push(ob);
    saveObjects([ob]);
  }

  // Yazı kutusu yazıya göre büyür
  function fitText(ob) {
    const lines = ob.text.split("\n");
    c.save();
    c.font = rbFontOf(ob, ob.size);
    ob.w = Math.max(RB_GRID / 2, Math.max(...lines.map((line) => c.measureText(line).width)) + 8);
    c.restore();
    ob.h = lines.length * ob.size * 1.25;
  }
  function addText(w) {
    const ob = {
      id: newId(), kind: "text", layer: RB_KIND_LAYER.text, name: "", label: "", text: t.textPh, ...textStyle,
      x: w.x, y: w.y, w: 0, h: 0, rot: 0, hidden: st.defaultHidden, locked: false, free: false, at: Date.now(),
    };
    fitText(ob);
    st.objects.push(ob);
    sel = new Set([ob.id]);
    saveObjects([ob]);
    pickTool("move"); // boş yere tıklamak yeni yazı açmasın, seçimi bıraksın
    const input = textbar.querySelector("[data-text]");
    input.focus();
    input.select();
  }

  // Taşınan objeler herkese anlık gider; bırakınca asıl yer kaydedilir. Gizli obje paylaşılmaz.
  const movingNow = () => (!act || act.onFog ? [] : act.drag ? (act.moved ? act.drag.map((d) => d.ob) : []) : act.resize ? [act.resize] : act.rotate ? [act.rotate] : []);
  function sendMoving() {
    const now = performance.now();
    if (!o.net || now - sentAt < RB_MOVE_MS) return;
    const list = movingNow().filter((ob) => !ob.hidden);
    if (!list.length) return;
    sentAt = now;
    sending = true;
    o.net.setMoving(Object.fromEntries(list.map(({ id, x, y, w, h, rot }) => [id, { x, y, w, h, rot }])), o.color());
  }
  function applyMovers(map) {
    movers = {};
    for (const [uid, m] of Object.entries(map)) {
      if (uid === o.net.me) continue;
      for (const [id, v] of Object.entries(m.items || {})) movers[id] = { ...v, color: m.color };
    }
    dirty = true;
  }
  const placed = (ob) => (movers[ob.id] ? { ...ob, ...movers[ob.id], color: ob.color } : ob);

  // ---- Uzaktan gelen değişiklikler ----
  const busy = () => act && !act.pan && !act.ruler && !act.marquee;
  const remote = (fn) => (busy() ? waiting.push(fn) : fn());
  const endAct = () => {
    act = null;
    dirty = true;
    if (sending) {
      sending = false;
      o.net.setMoving(null);
    }
    waiting.splice(0).forEach((fn) => fn());
  };
  function applyObjects(map) {
    const old = new Map(st.objects.map((ob) => [ob.id, ob]));
    st.objects = Object.values(map).map((raw) => (old.has(raw.id) ? Object.assign(old.get(raw.id), raw) : rbNormObject(raw)));
    const gone = [...sel].filter((id) => !map[id]);
    if (gone.length) {
      gone.forEach((id) => sel.delete(id));
      syncBar();
    }
    dirty = true;
    if (o.onObjects) o.onObjects(st.objects);
  }
  function applyFog(val) {
    st.fog = { base: !val || val.base !== false, shapes: Object.values((val && val.shapes) || {}).sort((a, b) => a.at - b.at) };
    if (fogSel && !fogSelected()) {
      fogSel = null;
      if (tool === "fog") drawFogBar();
    }
    dirty = true;
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
    c.strokeStyle = "rgba(225, 229, 246, .2)";
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
    const mid = rbCenter(ob);
    const p = toScreen(mid.x, mid.y);
    const w = ob.w * cam.zoom;
    const h = ob.h * cam.zoom;
    c.save();
    c.translate(p.x, p.y);
    c.rotate(rbRad(ob.rot || 0));
    c.globalAlpha = ob.hidden ? 0.45 : 1;
    if (ob.kind === "draw") {
      c.strokeStyle = ob.color;
      c.lineWidth = ob.stroke * cam.zoom;
      c.lineCap = c.lineJoin = "round";
      c.beginPath();
      rbSketchLine({ ...ob, x: -ob.w / 2, y: -ob.h / 2, rot: 0 }).forEach((pt, i) => (i ? c.lineTo(pt.x * cam.zoom, pt.y * cam.zoom) : c.moveTo(pt.x * cam.zoom, pt.y * cam.zoom)));
      c.stroke();
      c.restore();
      return;
    }
    if (ob.kind === "area") {
      const look = RB_AREAS[ob.area];
      c.beginPath();
      if (ob.shape === "ellipse") c.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      else c.rect(-w / 2, -h / 2, w, h);
      c.fillStyle = look.fill;
      c.fill();
      c.strokeStyle = look.line;
      c.lineWidth = 2;
      c.stroke();
      if (ob.label) {
        c.fillStyle = look.ink;
        c.font = `700 ${Math.max(10, 14 * cam.zoom)}px "Chakra Petch", sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(ob.label, 0, 0);
      }
      c.restore();
      return;
    }
    if (ob.kind === "text") {
      const size = ob.size * cam.zoom;
      c.font = rbFontOf(ob, size);
      c.fillStyle = ob.color;
      c.textAlign = "left";
      c.textBaseline = "middle";
      ob.text.split("\n").forEach((line, i) => {
        const y = -h / 2 + (i + 0.5) * size * 1.25;
        c.fillText(line, -w / 2 + 4 * cam.zoom, y);
        if (ob.underline) c.fillRect(-w / 2 + 4 * cam.zoom, y + size * 0.48, c.measureText(line).width, Math.max(1, size * 0.07));
      });
      c.restore();
      return;
    }
    if (ob.kind === "token") {
      c.beginPath();
      c.ellipse(0, 0, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2);
    } else {
      roundRect(c, -w / 2, -h / 2, w, h, 10 * cam.zoom);
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
    const px = Math.max(10, (ob.kind === "token" ? 18 : 15) * cam.zoom);
    c.font = `700 ${px}px "Chakra Petch", sans-serif`;
    const label = ob.kind === "token" ? ob.name.replace(/\D+/g, "").slice(0, 2) || ob.name.slice(0, 2) : ob.name;
    c.fillText(label, 0, 0);
    if (ob.locked) {
      c.font = `700 ${Math.max(10, 12 * cam.zoom)}px sans-serif`;
      c.fillText("●", w / 2 - 9 * cam.zoom, -h / 2 + 10 * cam.zoom);
    }
    c.restore();
  }
  // İsim objenin görselinin üstünde yazar; sis onu da örter
  function drawLabel(ob) {
    const box = rbBounds(rbCorners(ob));
    const p = toScreen(box.x + box.w / 2, box.y);
    c.font = `700 ${Math.max(11, 14 * cam.zoom)}px "Chakra Petch", sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    const w = c.measureText(ob.label).width + 14;
    const h = Math.max(18, 22 * cam.zoom);
    c.globalAlpha = ob.hidden ? 0.6 : 1;
    c.fillStyle = "rgba(30, 31, 37, .9)";
    roundRect(c, p.x - w / 2, p.y - h - 6, w, h, 7);
    c.fill();
    c.fillStyle = "#fff";
    c.fillText(ob.label, p.x, p.y - h / 2 - 5);
    c.globalAlpha = 1;
  }
  // Obje taşıyan kullanıcının rengindeki çerçeve
  function drawFrame(ob, color) {
    c.strokeStyle = color;
    c.lineWidth = 3;
    if (ob.kind !== "token") return outline(ob);
    const mid = rbCenter(ob);
    const p = toScreen(mid.x, mid.y);
    c.beginPath();
    c.ellipse(p.x, p.y, (ob.w * cam.zoom) / 2 + 2, (ob.h * cam.zoom) / 2 + 2, 0, 0, Math.PI * 2);
    c.stroke();
  }
  function applyFogShape(s) {
    f.globalCompositeOperation = s.mode === "reveal" ? "destination-out" : "source-over";
    f.fillStyle = f.strokeStyle = "#101116";
    if (s.shape === "rect") {
      const a = toScreen(s.x, s.y);
      f.fillRect(a.x, a.y, s.w * cam.zoom, s.h * cam.zoom);
      return;
    }
    f.beginPath();
    rbFogPts(s).forEach((pt, i) => {
      const p = toScreen(pt.x, pt.y);
      i ? f.lineTo(p.x, p.y) : f.moveTo(p.x, p.y);
    });
    if (s.shape === "lasso") {
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
    st.fog.shapes.forEach(applyFogShape);
    const draft = act && act.fog && rbFogShape(act.fog);
    if (draft) applyFogShape(draft);
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = gmView() ? 0.5 : 1;
    c.drawImage(fogCv, 0, 0);
    c.restore();
  }
  function selectionBox() {
    const pts = selected().filter(visible).flatMap(rbCorners);
    return pts.length ? rbBounds(pts) : null;
  }
  // Köşe tutamaçları: tek seçili obje ya da Sürükle aracıyla seçili sis şekli; döndürme yalnızca objelerde
  function handleTarget() {
    if (tool === "fog") return fogShape === "drag" ? fogSelected() || null : null;
    if (!gmView()) return null;
    const list = selected();
    return list.length === 1 && !list[0].locked ? list[0] : null;
  }
  function rotateHandle(b) {
    const [a, d] = rbCorners(b).map((p) => toScreen(p.x, p.y));
    const ang = rbRad(b.rot || 0);
    return { from: { x: (a.x + d.x) / 2, y: (a.y + d.y) / 2 }, x: (a.x + d.x) / 2 + Math.sin(ang) * RB_ROT_GAP, y: (a.y + d.y) / 2 - Math.cos(ang) * RB_ROT_GAP };
  }
  function handleAt(sx, sy) {
    const b = handleTarget();
    if (!b) return null;
    const near = (p) => Math.hypot(p.x - sx, p.y - sy) <= RB_HANDLE + 4;
    const corner = rbCorners(b).map((p) => toScreen(p.x, p.y)).findIndex(near);
    if (corner >= 0) return { b, corner };
    return tool !== "fog" && near(rotateHandle(b)) ? { b, rotate: true } : null;
  }
  function outline(b) {
    c.beginPath();
    rbCorners(b).forEach((pt, i) => {
      const p = toScreen(pt.x, pt.y);
      i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y);
    });
    c.closePath();
    c.stroke();
  }
  function drawHandles(b) {
    c.fillStyle = "#fff";
    c.strokeStyle = "#1e1f25";
    c.lineWidth = 2;
    for (const pt of rbCorners(b)) {
      const p = toScreen(pt.x, pt.y);
      roundRect(c, p.x - RB_HANDLE, p.y - RB_HANDLE, RB_HANDLE * 2, RB_HANDLE * 2, 3);
      c.fill();
      c.stroke();
    }
    if (tool === "fog") return;
    const r = rotateHandle(b);
    c.strokeStyle = "#fff";
    c.beginPath();
    c.moveTo(r.from.x, r.from.y);
    c.lineTo(r.x, r.y);
    c.stroke();
    c.strokeStyle = "#1e1f25";
    c.beginPath();
    c.arc(r.x, r.y, RB_HANDLE + 1, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  }
  // Çapraz da 1 kare sayılır (Kural Kitabı › Savaş)
  const rulerMeters = ({ a, b }) => (Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) / RB_GRID) * RB_METERS;
  function drawRuler(r) {
    const p = toScreen(r.a.x, r.a.y);
    const q = toScreen(r.b.x, r.b.y);
    c.strokeStyle = c.fillStyle = "#fff";
    c.lineWidth = 2;
    c.setLineDash([8, 6]);
    c.beginPath();
    c.moveTo(p.x, p.y);
    c.lineTo(q.x, q.y);
    c.stroke();
    c.setLineDash([]);
    for (const k of [p, q]) {
      c.beginPath();
      c.arc(k.x, k.y, 5, 0, Math.PI * 2);
      c.fill();
    }
    const text = `${rulerMeters(r)} m`;
    c.font = '700 15px "Chakra Petch", sans-serif';
    c.textAlign = "center";
    c.textBaseline = "middle";
    const w = c.measureText(text).width + 20;
    const x = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, q.x + w / 2 + 12));
    const y = Math.max(18, q.y - 18);
    c.fillStyle = "rgba(30, 31, 37, .95)";
    roundRect(c, x - w / 2, y - 14, w, 28, 10);
    c.fill();
    c.fillStyle = "#fff";
    c.fillText(text, x, y + 1);
  }
  function drawSketchDraft(s) {
    const shape = sketchOf(s);
    const line = shape.line ? (s.shape === "tri" ? [...shape.line, shape.line[0]] : shape.line) : rbSketchLine({ ...shape, shape: s.shape });
    c.save();
    c.strokeStyle = sketchColor || o.color();
    c.lineWidth = sketchWidth * cam.zoom;
    c.lineCap = c.lineJoin = "round";
    c.beginPath();
    line.forEach((pt, i) => {
      const p = toScreen(pt.x, pt.y);
      i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y);
    });
    c.stroke();
    c.font = '700 14px "Chakra Petch", sans-serif';
    c.textAlign = "center";
    c.textBaseline = "middle";
    const q = toScreen(s.b.x, s.b.y);
    const w = c.measureText(shape.text).width + 18;
    c.fillStyle = "rgba(30, 31, 37, .95)";
    roundRect(c, q.x + 10, q.y - 34, w, 26, 9);
    c.fill();
    c.fillStyle = "#fff";
    c.fillText(shape.text, q.x + 10 + w / 2, q.y - 20);
    c.restore();
  }
  // Çizilen alanın taslağı ve metre olarak boyutu
  function drawAreaDraft(s) {
    const box = areaBox(s);
    const b = s.b;
    const p = toScreen(box.x, box.y);
    const look = RB_AREAS[areaKind];
    c.save();
    c.fillStyle = look.fill;
    c.strokeStyle = look.line;
    c.lineWidth = 2;
    c.beginPath();
    if (areaShape === "ellipse") c.ellipse(p.x + (box.w * cam.zoom) / 2, p.y + (box.h * cam.zoom) / 2, (box.w * cam.zoom) / 2, (box.h * cam.zoom) / 2, 0, 0, Math.PI * 2);
    else c.rect(p.x, p.y, box.w * cam.zoom, box.h * cam.zoom);
    c.fill();
    c.stroke();
    const meters = (v) => Math.round((v / RB_GRID) * RB_METERS * 10) / 10;
    const text = areaShape === "ellipse" ? `${meters(s.r)} m` : `${meters(box.w)} × ${meters(box.h)} m`;
    c.font = '700 14px "Chakra Petch", sans-serif';
    c.textAlign = "center";
    c.textBaseline = "middle";
    const q = toScreen(b.x, b.y);
    const w = c.measureText(text).width + 18;
    c.fillStyle = "rgba(30, 31, 37, .95)";
    roundRect(c, q.x + 10, q.y - 34, w, 26, 9);
    c.fill();
    c.fillStyle = "#fff";
    c.fillText(text, q.x + 10 + w / 2, q.y - 20);
    c.restore();
  }
  function draw() {
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = "#2b2c32";
    c.fillRect(0, 0, W, H);
    drawGrid();
    const shown = ordered().filter(visible).map(placed);
    shown.forEach(drawObject);
    shown.filter((ob) => ob.label && ob.kind !== "area").forEach(drawLabel);
    shown.filter((ob) => movers[ob.id]).forEach((ob) => drawFrame(ob, movers[ob.id].color));
    movingNow().filter(visible).forEach((ob) => drawFrame(ob, o.color()));
    drawFog();
    const box = selectionBox();
    if (box) {
      const list = selected().filter(visible);
      const p = toScreen(box.x, box.y);
      c.strokeStyle = "#fff";
      c.lineWidth = 2;
      if (list.length === 1) outline(list[0]);
      else {
        roundRect(c, p.x - 3, p.y - 3, box.w * cam.zoom + 6, box.h * cam.zoom + 6, 10);
        c.stroke();
      }
      if (rbIsOpen(objbar)) {
        objbar.style.left = `${Math.max(90, Math.min(W - 90, p.x + (box.w * cam.zoom) / 2))}px`;
        objbar.style.top = `${Math.min(H - 56, p.y + box.h * cam.zoom + 18)}px`;
      }
    }
    if (tool === "fog" && fogShape === "drag" && fogSelected()) {
      c.strokeStyle = "#fff";
      c.lineWidth = 2;
      c.setLineDash([6, 5]);
      outline(fogSelected());
      c.setLineDash([]);
    }
    const handles = handleTarget();
    if (handles) drawHandles(handles);
    if (act && act.ruler) drawRuler(act.ruler);
    if (act && act.area) drawAreaDraft(act.area);
    if (act && act.sketch) drawSketchDraft(act.sketch);
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
      rbShow(textbar, false);
      rbShow(colorBox, false);
      dirty = true;
      return;
    }
    const hidden = list.every((ob) => ob.hidden);
    const locked = list.every((ob) => ob.locked);
    drawTextBar();
    objbar.innerHTML = `
      ${rbBtn("data-obj=hide", hidden ? "eye" : "eyeOff", hidden ? t.show : t.hide, hidden)}
      ${rbBtn("data-obj=lock", locked ? "lock" : "unlock", locked ? t.unlock : t.lock, locked)}
      ${rbBtn("data-obj=name", "type", t.name)}
      ${rbBtn("data-obj=layer", "layers", t.layer)}
      ${rbBtn("data-obj=duplicate", "copy", t.duplicate)}
      ${rbBtn("data-obj=delete", "trash", t.del)}
      <div class="rb-layers" hidden>${[...RB_LAYERS].reverse().map((k) => `<button type="button" data-layer="${k}"${list.every((ob) => ob.layer === k) ? ' class="on"' : ""}>${k}</button>`).join("")}</div>
      <div class="rb-namebox" hidden><input type="text" maxlength="30" value="${ccEsc(list.length === 1 ? list[0].label : "")}" placeholder="${t.namePh}" aria-label="${t.name}"></div>`;
    rbShow(objbar, true);
    dirty = true;
  }
  // Tek seçili yazının biçim çubuğu
  function drawTextBar() {
    const list = selected();
    const ob = list.length === 1 && list[0].kind === "text" && tool !== "fog" ? list[0] : null;
    rbShow(textbar, !!ob);
    if (!ob) return;
    const on = (key) => rbBtn(`data-text-style="${key}"`, key, t[key], ob[key]);
    textbar.innerHTML = `
      <textarea data-text rows="1" maxlength="300" aria-label="${t.text}">${ccEsc(ob.text)}</textarea>
      <button type="button" class="rb-dot" data-text-color style="--c: ${ccEsc(ob.color)}" title="${t.textColor}" aria-label="${t.textColor}"></button>
      ${on("bold")}${on("italic")}${on("underline")}
      <i class="rb-sep"></i>
      <select data-text-font aria-label="${t.textFont}">${RB_FONTS.map((f) => `<option${f === ob.font ? " selected" : ""}>${f}</option>`).join("")}</select>
      <input type="number" data-text-size min="8" max="300" value="${Math.round(ob.size)}" aria-label="${t.textSize}" title="${t.textSize}">`;
  }
  function textObject() {
    const list = selected();
    return list.length === 1 && list[0].kind === "text" ? list[0] : null;
  }
  // Biçim değişince hem seçili yazıya hem sonraki yazılara uygulanır
  function setTextStyle(key, value) {
    const ob = textObject();
    if (!ob) return;
    ob[key] = value;
    textStyle[key] = value;
    fitText(ob);
    saveObjects([ob]);
  }
  function openName() {
    const box = objbar.querySelector(".rb-namebox");
    if (!box) return;
    rbShow(box, true);
    box.firstElementChild.focus();
    box.firstElementChild.select();
  }
  function objAction(a) {
    const list = selected();
    if (!list.length) return;
    if (a === "hide") {
      const to = !list.every((ob) => ob.hidden);
      list.forEach((ob) => (ob.hidden = to));
      saveObjects(list);
    } else if (a === "lock") {
      const to = !list.every((ob) => ob.locked);
      list.forEach((ob) => (ob.locked = to));
      saveObjects(list);
    } else if (a === "free") {
      const to = !list.every((ob) => ob.free);
      list.forEach((ob) => (ob.free = to));
      saveObjects(list);
    } else if (a === "duplicate") {
      const copies = list.map((ob) => ({ ...ob, id: newId(), x: ob.x + RB_GRID, y: ob.y + RB_GRID, at: Date.now() }));
      st.objects.push(...copies);
      sel = new Set(copies.map((ob) => ob.id));
      saveObjects(copies);
    } else if (a === "delete") {
      st.objects = st.objects.filter((ob) => !sel.has(ob.id));
      sel = new Set();
      touch();
      if (o.net) list.forEach(o.gm ? o.net.delObject : o.net.delOwn);
      if (o.onObjects) o.onObjects(st.objects);
    }
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
    endAct();
    if (ob && o.gm) {
      if (!sel.has(ob.id)) sel = new Set([ob.id]);
      syncBar();
      const list = selected();
      const hidden = list.every((x) => x.hidden);
      const locked = list.every((x) => x.locked);
      const free = list.every((x) => x.free);
      openMenu(e.offsetX, e.offsetY, [
        ["name", t.name, "type"],
        ...(list.some((x) => x.kind === "token") ? [["turn", t.addTurn, "swords"]] : []),
        ["free", free ? t.freeOff : t.freeOn, "hand"],
        ["hide", hidden ? t.show : t.hide, hidden ? "eye" : "eyeOff"],
        ["lock", locked ? t.unlock : t.lock, locked ? "lock" : "unlock"],
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

  const fogHit = (w) => [...st.fog.shapes].reverse().find((s) => {
    if (s.shape === "rect") return rbInside(w, s);
    const pts = rbFogPts(s);
    return s.shape === "lasso" ? rbInPoly(w, pts) : rbNearLine(w, pts, RB_BRUSH / 2);
  });
  const panFrom = (e) => ({ pan: true, sx: e.offsetX, sy: e.offsetY, cx: cam.x, cy: cam.y });

  cv.addEventListener("pointerdown", (e) => {
    rbShow(ctxMenu, false);
    if (e.button === 2) return;
    try {
      cv.setPointerCapture(e.pointerId);
    } catch (err) {}
    const w = toWorld(e.offsetX, e.offsetY);
    if (e.button === 1) {
      act = panFrom(e);
      return;
    }
    if (tool === "draw") {
      act = { sketch: { shape: sketchShape, a: w, b: w, pts: [w] } };
      if (sel.size) {
        sel = new Set();
        syncBar();
      }
      return;
    }
    if (tool === "ai") {
      const a = fine(w, e);
      act = { area: { a, b: a, r: 0 } };
      if (sel.size) {
        sel = new Set();
        syncBar();
      }
      return;
    }
    if (tool === "ruler") {
      const a = cellCenter(w);
      act = { ruler: { a, b: a } };
      dirty = true;
      return;
    }
    const handle = handleAt(e.offsetX, e.offsetY);
    if (handle) {
      const b = handle.b;
      const onFog = tool === "fog";
      act = handle.rotate ? { rotate: b, moved: false } : { resize: b, corner: handle.corner, onFog, from: { w: b.w, h: b.h, size: b.size }, anchor: rbCorners(b)[(handle.corner + 2) % 4], moved: false };
      return;
    }
    if (tool === "fog") {
      if (fogShape === "drag") {
        const s = fogHit(w);
        fogSel = s ? s.id : null;
        drawFogBar();
        dirty = true;
        act = s ? { drag: [{ ob: s, x: s.x, y: s.y }], wx: w.x, wy: w.y, moved: false, onFog: true } : panFrom(e);
        return;
      }
      const base = { id: newId(), at: Date.now(), mode: fogMode, shape: fogShape };
      if (fogShape === "rect") {
        const a = snapOn(e) ? { x: snapV(w.x), y: snapV(w.y) } : w;
        act = { fog: { ...base, a, b: a } };
      } else {
        act = { fog: { ...base, pts: [w] } };
      }
      return;
    }
    const ob = hit(w);
    if (tool === "text" && gmView() && !(ob && ob.kind === "text")) {
      addText(w);
      return;
    }
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
    act = tool === "select" ? { box: true, sx: e.offsetX, sy: e.offsetY, marquee: { x: e.offsetX, y: e.offsetY, w: 0, h: 0 } } : panFrom(e);
  });

  // Karşı köşe yerinde kalır; snap açıksa çekilen köşe ızgaraya oturur (döndürülmüş objede boyut kare katlarına)
  function doResize(a, p, e) {
    const b = a.resize;
    const rot = b.rot || 0;
    const sx = a.corner === 1 || a.corner === 2 ? 1 : -1;
    const sy = a.corner >= 2 ? 1 : -1;
    const isText = b.kind === "text"; // yazının boyu köşeden büyür, ızgaraya oturmaz
    const snap = snapOn(e) && !isText;
    const step = stepOf(b);
    const d = rbTurn(snap && !rot ? { x: snapV(p.x, step), y: snapV(p.y, step) } : p, a.anchor, -rot);
    const lo = snap ? step : RB_GRID / 4;
    let w = Math.max(lo, (d.x - a.anchor.x) * sx);
    let h = Math.max(lo, (d.y - a.anchor.y) * sy);
    if (e.shiftKey || b.kind === "token" || isText) {
      const k = Math.max(w / a.from.w, h / a.from.h);
      w = a.from.w * k;
      if (snap) w = Math.max(step, snapV(w, step));
      h = (w * a.from.h) / a.from.w;
    } else if (snap && rot) {
      w = Math.max(step, snapV(w, step));
      h = Math.max(step, snapV(h, step));
    }
    if (isText) b.size = (a.from.size * w) / a.from.w;
    const mid = rbTurn({ x: a.anchor.x + (sx * w) / 2, y: a.anchor.y + (sy * h) / 2 }, a.anchor, rot);
    b.w = w;
    b.h = h;
    b.x = mid.x - w / 2;
    b.y = mid.y - h / 2;
  }
  function doRotate(a, p, e) {
    const mid = rbCenter(a.rotate);
    let deg = (Math.atan2(p.y - mid.y, p.x - mid.x) * 180) / Math.PI + 90;
    if (snapOn(e)) deg = Math.round(deg / RB_ROT_STEP) * RB_ROT_STEP;
    a.rotate.rot = ((deg % 360) + 360) % 360;
  }

  cv.addEventListener("pointermove", (e) => {
    if (!act) {
      const h = handleAt(e.offsetX, e.offsetY);
      cv.style.cursor = h ? (h.rotate ? "alias" : h.corner % 2 ? "nesw-resize" : "nwse-resize") : tool === "ruler" ? "crosshair" : "";
      return;
    }
    const w = toWorld(e.offsetX, e.offsetY);
    if (act.pan) {
      cam.x = act.cx - (e.offsetX - act.sx) / cam.zoom;
      cam.y = act.cy - (e.offsetY - act.sy) / cam.zoom;
    } else if (act.ruler) {
      act.ruler.b = cellCenter(w);
    } else if (act.area) {
      act.area.b = fine(w, e);
      const r = Math.hypot(w.x - act.area.a.x, w.y - act.area.a.y);
      act.area.r = snapOn(e) ? snapV(r, RB_FINE) : r;
    } else if (act.sketch) {
      const s = act.sketch;
      s.b = w;
      if (s.shape === "pen" && Math.hypot(w.x - s.pts.at(-1).x, w.y - s.pts.at(-1).y) >= 4) s.pts.push(w);
    } else if (act.resize) {
      act.moved = true;
      doResize(act, w, e);
    } else if (act.rotate) {
      act.moved = true;
      doRotate(act, w, e);
    } else if (act.drag) {
      act.moved = true;
      const snap = snapOn(e);
      for (const d of act.drag) {
        const x = d.x + w.x - act.wx;
        const y = d.y + w.y - act.wy;
        d.ob.x = snap ? snapV(x, stepOf(d.ob)) : x;
        d.ob.y = snap ? snapV(y, stepOf(d.ob)) : y;
      }
    } else if (act.marquee) {
      act.marquee = { x: Math.min(act.sx, e.offsetX), y: Math.min(act.sy, e.offsetY), w: Math.abs(e.offsetX - act.sx), h: Math.abs(e.offsetY - act.sy) };
    } else if (act.fog) {
      if (act.fog.shape === "rect") act.fog.b = snapOn(e) ? { x: snapV(w.x), y: snapV(w.y) } : w;
      else if (Math.hypot(w.x - act.fog.pts.at(-1).x, w.y - act.fog.pts.at(-1).y) >= 6) act.fog.pts.push(w);
    }
    sendMoving();
    dirty = true;
  });
  cv.addEventListener("pointerup", () => {
    const a = act;
    if (!a) return;
    act = null;
    if (a.drag && a.moved) {
      if (a.onFog) a.drag.forEach((d) => saveFogShape(d.ob));
      else saveObjects(a.drag.map((d) => d.ob));
    } else if (a.resize && a.moved) {
      if (a.onFog) saveFogShape(a.resize);
      else saveObjects([a.resize]);
      if (a.resize.kind === "text") drawTextBar();
    } else if (a.rotate && a.moved) {
      saveObjects([a.rotate]);
    } else if (a.marquee) {
      const p = toWorld(a.marquee.x, a.marquee.y);
      const q = toWorld(a.marquee.x + a.marquee.w, a.marquee.y + a.marquee.h);
      sel = new Set(st.objects.filter((ob) => {
        const b = rbBounds(rbCorners(ob));
        return visible(ob) && !ob.locked && b.x < q.x && b.x + b.w > p.x && b.y < q.y && b.y + b.h > p.y;
      }).map((ob) => ob.id));
      syncBar();
    } else if (a.sketch) {
      addSketch(a.sketch);
    } else if (a.area) {
      const box = areaBox(a.area);
      if (box.w && box.h) addArea(box);
    } else if (a.fog) {
      const s = rbFogShape(a.fog);
      if (s) {
        st.fog.shapes.push(s);
        saveFogShape(s);
      }
    }
    endAct();
  });
  cv.addEventListener("pointercancel", endAct);

  // ---- Araçlar ----
  function drawFogBar() {
    fogbar.innerHTML = `
      ${rbBtn('data-fog="drag"', "hand", t.fogDrag, fogShape === "drag")}
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
      ${rbBtn("data-fogpreview", preview ? "eyeOff" : "eye", t.fogPreview, preview)}
      ${rbBtn("data-fogdel", "trash", t.del, false, !fogSel)}`;
  }
  function pickTool(name) {
    tool = name;
    for (const k of host.querySelectorAll("[data-rbtool]")) k.classList.toggle("on", k.dataset.rbtool === name);
    if (tool !== "fog") fogSel = null;
    if (tool === "fog") drawFogBar();
    if (tool === "ai") drawAiBar();
    if (tool === "draw") drawDrawBar();
    rbShow(fogbar, tool === "fog");
    rbShow(aibar, tool === "ai");
    rbShow(drawbar, tool === "draw");
    if (tool !== "fog" && preview) preview = false;
    syncBar();
    dirty = true;
  }
  function drawDrawBar() {
    const pen = (key, icon, label) => rbBtn(`data-draw="${key}"`, icon, label, sketchShape === key);
    drawbar.innerHTML = `
      ${pen("pen", "pencil", t.drawPen)}${pen("rect", "rect", t.drawRect)}${pen("tri", "triangle", t.drawTri)}${pen("ellipse", "circle", t.drawCircle)}
      <i class="rb-sep"></i>
      <button type="button" class="rb-dot" data-draw-color style="--c: ${ccEsc(sketchColor || o.color())}" title="${t.drawColor}" aria-label="${t.drawColor}"></button>
      ${RB_STROKES.map((v) => `<button type="button" class="rb-stroke${v === sketchWidth ? " on" : ""}" data-draw-width="${v}" title="${t.drawWidth}" aria-label="${t.drawWidth} ${v}"><i style="height: ${v}px"></i></button>`).join("")}`;
  }
  function drawAiBar() {
    const pen = (key, icon, label) => rbBtn(`data-area="${key}"`, icon, label, areaKind === key);
    aibar.innerHTML = `
      ${pen("floor", "map", t.areaFloor)}${pen("wall", "wall", t.areaWall)}${pen("void", "void", t.areaVoid)}${pen("liquid", "liquid", t.areaLiquid)}
      <i class="rb-sep"></i>
      ${rbBtn('data-areashape="rect"', "rect", t.shapeRect, areaShape === "rect")}
      ${rbBtn('data-areashape="ellipse"', "circle", t.shapeCircle, areaShape === "ellipse")}
      <i class="rb-sep"></i>
      <input type="text" class="rb-area-name" maxlength="30" value="${ccEsc(areaName)}" placeholder="${t.areaName}" aria-label="${t.areaName}">`;
  }
  function deleteFogShape() {
    if (!fogSel) return;
    st.fog.shapes = st.fog.shapes.filter((s) => s.id !== fogSel);
    if (o.net) o.net.delFogShape(fogSel);
    fogSel = null;
    touch();
    drawFogBar();
  }
  function resetFog(base) {
    st.fog = { base, shapes: [] };
    fogSel = null;
    touch();
    if (o.net) o.net.resetFog(base);
    drawFogBar();
  }
  host.addEventListener("click", (e) => {
    const b = (s) => e.target.closest(s);
    let x;
    if ((x = b("[data-rbtool]"))) {
      pickTool(x.dataset.rbtool);
    } else if ((x = b("[data-snap]"))) {
      st.snap = !st.snap;
      x.classList.toggle("on", st.snap);
      persist();
    } else if ((x = b("[data-pull]"))) {
      const v = { ...toWorld(W / 2, H / 2), zoom: cam.zoom, at: Date.now() };
      if (o.net) o.net.pullCamera(v);
      else {
        st.pull = v;
        persist();
      }
      x.classList.add("on");
      setTimeout(() => x.classList.remove("on"), 400);
    } else if ((x = b("[data-zoom]"))) {
      const d = Number(x.dataset.zoom);
      setZoom(d ? cam.zoom * (d > 0 ? 1.25 : 0.8) : 1);
    } else if ((x = b("[data-fog]"))) {
      fogShape = x.dataset.fog;
      if (fogShape !== "drag") fogSel = null;
      drawFogBar();
      dirty = true;
    } else if ((x = b("[data-draw]"))) {
      sketchShape = x.dataset.draw;
      drawDrawBar();
    } else if ((x = b("[data-draw-width]"))) {
      sketchWidth = Number(x.dataset.drawWidth);
      drawDrawBar();
    } else if ((x = b("[data-draw-color]"))) {
      const r = x.getBoundingClientRect();
      const box = host.getBoundingClientRect();
      colorBox.style.left = `${r.left - box.left}px`;
      colorBox.style.top = `${r.bottom - box.top + 8}px`;
      roomColorPicker(colorBox, sketchColor || o.color(), ROOM_TEXT[o.lang], (hex) => {
        rbShow(colorBox, false);
        if (hex) {
          sketchColor = hex;
          drawDrawBar();
        }
      });
      rbShow(colorBox, true);
    } else if ((x = b("[data-area]"))) {
      areaKind = x.dataset.area;
      drawAiBar();
    } else if ((x = b("[data-areashape]"))) {
      areaShape = x.dataset.areashape;
      drawAiBar();
    } else if ((x = b("[data-fogmode]"))) {
      fogMode = x.dataset.fogmode;
      drawFogBar();
    } else if (b("[data-fogall]")) {
      resetFog(true);
    } else if (b("[data-fogclear]")) {
      resetFog(false);
    } else if (b("[data-fogdel]")) {
      deleteFogShape();
    } else if (b("[data-fogpreview]")) {
      preview = !preview;
      drawFogBar();
      syncBar();
    } else if (b('[data-obj="layer"]')) {
      const row = objbar.querySelector(".rb-layers");
      rbShow(row, !rbIsOpen(row));
    } else if (b('[data-obj="name"]')) {
      openName();
    } else if ((x = b("[data-text-style]"))) {
      const ob = textObject();
      if (ob) {
        setTextStyle(x.dataset.textStyle, !ob[x.dataset.textStyle]);
        drawTextBar();
      }
    } else if ((x = b("[data-text-color]"))) {
      const ob = textObject();
      if (ob) {
        const r = x.getBoundingClientRect();
        const box = host.getBoundingClientRect();
        colorBox.style.left = `${r.left - box.left}px`;
        colorBox.style.top = `${r.bottom - box.top + 8}px`;
        roomColorPicker(colorBox, ob.color, ROOM_TEXT[o.lang], (hex) => {
          rbShow(colorBox, false);
          if (hex) {
            setTextStyle("color", hex);
            drawTextBar();
          }
        });
        rbShow(colorBox, true);
      }
    } else if ((x = b("[data-obj]"))) {
      objAction(x.dataset.obj);
    } else if ((x = b("[data-layer]"))) {
      const list = selected();
      list.forEach((ob) => (ob.layer = Number(x.dataset.layer)));
      saveObjects(list);
      syncBar();
    } else if ((x = b("[data-menu]"))) {
      const key = x.dataset.menu;
      rbShow(ctxMenu, false);
      if (key === "addToken") addObject("token", Number(ctxMenu.dataset.x), Number(ctxMenu.dataset.y));
      else if (key === "center") {
        cam.x = cam.y = 0;
        cam.zoom = 1;
        dirty = true;
      } else if (key === "name") openName();
      else if (key === "turn") o.onTurn(selected().filter((ob) => ob.kind === "token"));
      else objAction(key);
    }
  });
  host.addEventListener("input", (e) => {
    const x = e.target;
    const ob = textObject();
    if (x.matches(".rb-area-name")) {
      areaName = x.value;
    } else if (x.matches("[data-text]") && ob) {
      ob.text = x.value || " ";
      fitText(ob);
      dirty = true;
    } else if (x.matches("[data-text-size]") && Number(x.value) >= 8) {
      setTextStyle("size", Math.min(300, Number(x.value)));
    }
  });
  host.addEventListener("change", (e) => {
    const x = e.target;
    const ob = textObject();
    if (x.matches("[data-text]") && ob) {
      saveObjects([ob]);
    } else if (x.matches("[data-text-font]")) {
      setTextStyle("font", x.value);
    } else if (x.matches(".rb-namebox input")) {
      const list = selected();
      list.forEach((k) => (k.label = x.value.trim()));
      saveObjects(list);
      syncBar();
    }
  });
  host.addEventListener("keydown", (e) => {
    if (!e.target.matches(".rb-namebox input")) return;
    if (e.key === "Enter") e.target.blur();
    if (e.key === "Escape") rbShow(e.target.parentElement, false);
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
      fogSel = null;
      if (tool === "fog") drawFogBar();
      rbShow(ctxMenu, false);
      syncBar();
    } else if (k === "delete" && fogSel) {
      deleteFogShape();
    } else if (k === "delete" && sel.size && !o.gm && selected().every(mine)) {
      objAction("delete"); // oyuncu yalnızca kendi çizimini siler
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
    saveNow();
  });
  resize();
  if (o.net) {
    o.onLeave(o.net.watchBoard(o.gm, (map) => remote(() => applyObjects(map)), (val) => remote(() => applyFog(val))));
    o.onLeave(o.net.watchMoving(applyMovers));
    if (!o.gm) o.onLeave(o.net.onCamera(lookAt));
  } else if (!o.gm && st.pull) {
    lookAt(st.pull);
  }
  requestAnimationFrame(loop);
  return { state: st, cam, activity: () => act, meters: rulerMeters, movers: () => movers };
}

// Oyuncu Gibi Gör ile GM arasında geçerken harita aynı kayıttan yeniden kurulur
const roomBoardKey = (id) => `cg-board:${id}`;
