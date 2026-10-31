// ---------- 3D zar (js/room.js kullanır) ----------
// Sonuç atıştan önce belirlenir; zarlar havada döner, seker ve o yüzler üstte kalacak şekilde durur. Fizik motoru yoktur, herkes aynı sonucu görür.
// d4'te sonucu yüz değil, üstte kalan köşe gösterir. Karşılıklı yüzlerin toplamı sides + 1'dir.
// Boyut masaya göredir: d6'nın bir kenarı 3,25 metredir, harita yakınlaşınca zarlar da büyür. Gövde çok koyu gridir, kenarlar atan kişinin rengindedir.
// three.js yalnızca masaya girince yüklenir. Yüklenemezse, WebGL yoksa, sekme arka plandaysa ya da cihazda hareket azaltılmışsa zar animasyonsuz atılır.

const RD_THREE = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js";
const RD = { ms: 1200, hold: 1800, shrink: 220, wait: 1500, gap: 45 }; // atış, yerde kalma, kaybolma, kütüphaneyi bekleme, zarlar arası gecikme (ms)
const RD_FACE = "Chakra Petch"; // sitenin yazı tipi
const RD_BODY = 0x17181d;
const RD_D6_EDGE = 3.25; // metre
const RD_SIZE = { 4: 0.95, 6: 0.72, 8: 0.8, 10: 0.8, 20: 0.86 }; // d6'ya göre oranlar
const RD_FONT = { 4: 58, 6: 140, 8: 100, 10: 88, 20: 84 };
const RD_GROUPS = 3; // masada aynı anda duran atış
const RD_ROW = 5; // sırada en fazla zar
const RD_STEP = 1.75; // iki zarın arası
const RD_SPOTS = [[0, -0.6], [-4.6, 0.6], [4.6, 0.7]]; // atışların düştüğü yerler

// Zarın yüzleri: her yüz bir köşe listesi
function rdPolys(T, sides) {
  const triangles = (geo) => {
    const p = geo.getAttribute("position");
    const out = [];
    for (let i = 0; i < p.count; i += 3) out.push([0, 1, 2].map((k) => new T.Vector3().fromBufferAttribute(p, i + k)));
    return out;
  };
  if (sides === 4) return triangles(new T.TetrahedronGeometry(1));
  if (sides === 8) return triangles(new T.OctahedronGeometry(1));
  if (sides === 20) return triangles(new T.IcosahedronGeometry(1));
  if (sides === 6) {
    return [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map(([x, y, z]) => {
      const n = new T.Vector3(x, y, z);
      const u = new T.Vector3(y, z, x);
      const w = n.clone().cross(u);
      return [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([i, j]) => n.clone().addScaledVector(u, i).addScaledVector(w, j));
    });
  }
  // d10: beşgen trapezohedron. h, uçurtma yüzlerin düz olmasını sağlar
  const H = 1.1;
  const c = Math.cos(Math.PI / 5);
  const h = (H * (1 - c)) / (1 + c);
  const ring = [...Array(10)].map((_, i) => new T.Vector3(Math.cos((i * Math.PI) / 5), i % 2 ? -h : h, Math.sin((i * Math.PI) / 5)));
  const at = (i) => ring[(i + 10) % 10];
  return ring.map((_, i) => [new T.Vector3(0, i % 2 ? H : -H, 0), at(i - 1), at(i), at(i + 1)]);
}

// Şekil: geometri, numaralı yüzler ve her sonuç için üste gelecek yön (dir) ile ekranda yukarı bakacak yön (up)
function rdShape(T, sides) {
  const raw = rdPolys(T, sides);
  const reach = Math.max(...raw.flat().map((v) => v.length()));
  const faces = raw.map((list) => {
    let poly = list.map((v) => v.clone().divideScalar(reach));
    const c = poly.reduce((sum, v) => sum.add(v), new T.Vector3()).divideScalar(poly.length);
    const n = new T.Vector3().subVectors(poly[1], poly[0]).cross(new T.Vector3().subVectors(poly[2], poly[0])).normalize();
    if (n.dot(c) < 0) {
      poly = [poly[0], ...poly.slice(1).reverse()];
      n.negate();
    }
    const up = (sides === 6 ? poly[0].clone().add(poly[1]).multiplyScalar(0.5) : poly[0].clone()).sub(c).normalize();
    return { poly, c, n, up };
  });
  const results = {};
  if (sides === 4) {
    const corners = [];
    for (const v of faces.flatMap((f) => f.poly)) if (!corners.some((k) => k.distanceTo(v) < 1e-3)) corners.push(v);
    corners.forEach((v, i) => {
      const other = corners[(i + 1) % 4];
      results[i + 1] = { dir: v.clone().normalize(), up: other.clone().addScaledVector(v, -other.dot(v) / v.dot(v)).normalize() };
    });
    for (const f of faces) f.values = f.poly.map((v) => corners.findIndex((k) => k.distanceTo(v) < 1e-3) + 1);
  } else {
    let low = 1;
    for (const f of faces) {
      if (f.value) continue;
      f.value = low;
      faces.find((g) => g.n.dot(f.n) < -0.999).value = sides + 1 - low;
      low++;
    }
    for (const f of faces) results[f.value] = { dir: f.n, up: f.up };
  }
  const pos = [];
  const nor = [];
  const uv = [];
  const geo = new T.BufferGeometry();
  faces.forEach((f, i) => {
    const right = f.up.clone().cross(f.n);
    const r = 2.04 * Math.max(...f.poly.map((p) => p.distanceTo(f.c)));
    const toUv = (p) => {
      const d = p.clone().sub(f.c);
      return [0.5 + d.dot(right) / r, 0.5 + d.dot(f.up) / r];
    };
    f.uvs = f.poly.map(toUv);
    f.span = r;
    const start = pos.length / 3;
    for (let k = 1; k + 1 < f.poly.length; k++) {
      for (const p of [f.poly[0], f.poly[k], f.poly[k + 1]]) {
        pos.push(p.x, p.y, p.z);
        nor.push(f.n.x, f.n.y, f.n.z);
        uv.push(...toUv(p));
      }
    }
    geo.addGroup(start, pos.length / 3 - start, i);
  });
  geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new T.Float32BufferAttribute(nor, 3));
  geo.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  return { sides, faces, results, geo, points: faces.flatMap((f) => f.poly) };
}

// Yüzün parlayan katmanı: kenarlar atanın renginde, sayılar beyaz; gövde rengini materyal verir
function rdTexture(T, sides, face, color) {
  const S = 256;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const g = cv.getContext("2d");
  g.fillStyle = "#000";
  g.fillRect(0, 0, S, S);
  g.strokeStyle = g.shadowColor = color;
  g.shadowBlur = 14;
  g.lineWidth = (0.09 * S) / face.span;
  g.lineJoin = "round";
  g.beginPath();
  face.uvs.forEach(([u, v], i) => (i ? g.lineTo(S * u, S * (1 - v)) : g.moveTo(S * u, S * (1 - v))));
  g.closePath();
  g.stroke();
  g.shadowBlur = 0;
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `700 ${RD_FONT[sides]}px "${RD_FACE}", sans-serif`;
  if (sides === 4) {
    face.values.forEach((value, i) => {
      const du = face.uvs[i][0] - 0.5;
      const dv = face.uvs[i][1] - 0.5;
      g.save();
      g.translate(S * (0.5 + du * 0.6), S * (0.5 - dv * 0.6));
      g.rotate(Math.atan2(du, dv));
      g.fillText(String(value), 0, 0);
      g.restore();
    });
  } else {
    g.fillText(String(face.value), S / 2, S / 2 + 4);
    if (sides > 6 && (face.value === 6 || face.value === 9)) g.fillRect(S / 2 - 24, S / 2 + RD_FONT[sides] / 2, 48, 7); // 6 ile 9 karışmasın
  }
  const tex = new T.CanvasTexture(cv);
  tex.colorSpace = T.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// value üstte, numarası ekranda dik duracak yönelim
function rdFinal(T, shape, value) {
  const { dir, up } = shape.results[value];
  const y = dir.clone();
  const z = up.clone().negate();
  const x = y.clone().cross(z);
  return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x, y, z)).invert();
}

// root: .rd-layer kutusunu içeren oda · zoomOf: haritanın yakınlığı. roll(r) zarlar yere inince biter, animasyon yoksa hemen biter
// r: { who, color, total, dice: [{ sides, value }] }
function roomDice3d(root, zoomOf) {
  const layer = root.querySelector(".rd-layer");
  const canvas = layer.querySelector("canvas");
  const shapes = {};
  const looks = {};
  const live = []; // masadaki atışlar
  let T = null;
  let renderer = null;
  let scene = null;
  let camera = null;
  let broken = false;
  let stopped = false;
  let frame = 0;
  let spot = 0;
  let W = 0;
  let H = 0;

  const load = Promise.all([import(RD_THREE), document.fonts.load(`700 96px "${RD_FACE}"`).catch(() => {})]).then(([mod]) => (T = mod)).catch(() => null);

  function setup() {
    if (renderer || broken) return !broken;
    try {
      renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (e) {
      broken = true;
      return false;
    }
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    scene = new T.Scene();
    camera = new T.PerspectiveCamera(30, 1, 0.1, 80);
    camera.position.set(0, 16, 7);
    camera.lookAt(0, 0, 0);
    scene.add(new T.HemisphereLight(0xffffff, 0x3a3c4a, 1.5));
    const sun = new T.DirectionalLight(0xffffff, 2.4);
    sun.position.set(-4, 12, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18 });
    scene.add(sun);
    const floor = new T.Mesh(new T.PlaneGeometry(80, 80), new T.ShadowMaterial({ opacity: 0.35 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    return true;
  }
  function fit() {
    const w = layer.clientWidth;
    const h = layer.clientHeight;
    if (w === W && h === H) return;
    W = w;
    H = h;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  // Sahnenin ölçeği: d6'nın kenarı ekranda haritadaki 3,25 metre kadar olsun
  function unit() {
    const ground = 2 * camera.position.length() * Math.tan((camera.fov * Math.PI) / 360); // ekranın yüksekliği, sahne biriminde
    const edge = (RD_D6_EDGE / RB_METERS) * RB_GRID * zoomOf();
    return (edge * ground) / (H * (2 / Math.sqrt(3)) * RD_SIZE[6]);
  }
  function lookOf(shape, color) {
    const key = `${shape.sides}${color}`;
    looks[key] ||= shape.faces.map((f) => new T.MeshStandardMaterial({ color: RD_BODY, roughness: 0.38, metalness: 0.25, emissive: 0xffffff, emissiveMap: rdTexture(T, shape.sides, f, color) }));
    return looks[key];
  }
  function remove(g) {
    g.dice.forEach((d) => scene.remove(d.mesh));
    if (g.tag) g.tag.remove();
    live.splice(live.indexOf(g), 1);
    if (g.done) g.done();
  }
  function placeTag(g, k) {
    const p = new T.Vector3(g.at.x * k, 0, g.at.z * k).project(camera);
    g.tag.style.left = `${((p.x + 1) / 2) * W}px`;
    g.tag.style.top = `${((1 - p.y) / 2) * H}px`;
  }
  function land(g, now) {
    g.end = now + RD.hold;
    g.tag = document.createElement("span");
    g.tag.className = "rd-tag";
    g.tag.innerHTML = `<i style="color: ${ccEsc(g.color)}">${ccEsc(g.who)}</i> <b>${g.total}</b>`;
    layer.appendChild(g.tag);
    g.done();
    g.done = null;
  }
  const turn = () => new T.Quaternion();
  function tick(now) {
    frame = 0;
    fit();
    const k = unit();
    for (const g of [...live]) {
      g.t0 ??= now;
      const left = g.end == null ? Infinity : g.end - now;
      const fade = left < RD.shrink ? Math.max(0.01, left / RD.shrink) : 1;
      let flying = false;
      for (const d of g.dice) {
        const t = Math.max(0, Math.min(1, (now - g.t0 - d.delay) / RD.ms));
        const e = 1 - (1 - t) ** 3;
        const y = d.rest + (d.size - d.rest) * (1 - e) + 2.6 * (1 - t) ** 1.4 * Math.abs(Math.sin(e * Math.PI * 3));
        d.mesh.position.set(d.from.x + (d.to.x - d.from.x) * e, y, d.from.z + (d.to.z - d.from.z) * e).multiplyScalar(k);
        d.mesh.quaternion.copy(d.q).multiply(turn().setFromAxisAngle(d.axis, d.turn * (1 - e) ** 2));
        d.mesh.scale.setScalar(d.size * k * fade);
        if (t < 1) flying = true;
      }
      if (!flying && g.done) land(g, now);
      if (g.tag) placeTag(g, k);
      if (left <= 0) remove(g);
    }
    renderer.render(scene, camera);
    if (live.length) frame = requestAnimationFrame(tick);
  }
  function start(r, done) {
    fit();
    while (live.length >= RD_GROUPS) remove(live[0]);
    const [cx, cz] = RD_SPOTS[spot++ % RD_SPOTS.length];
    const rows = Math.ceil(r.dice.length / RD_ROW);
    const dice = r.dice.map(({ sides, value }, i) => {
      const shape = (shapes[sides] ||= rdShape(T, sides));
      const size = RD_SIZE[sides];
      const mesh = new T.Mesh(shape.geo, lookOf(shape, r.color));
      mesh.castShadow = true;
      const q = turn().setFromAxisAngle(new T.Vector3(0, 1, 0), (Math.random() - 0.5) * 0.5).multiply(rdFinal(T, shape, value));
      const row = Math.floor(i / RD_ROW);
      const inRow = row < rows - 1 ? RD_ROW : r.dice.length - row * RD_ROW;
      const to = {
        x: cx + (i % RD_ROW - (inRow - 1) / 2) * RD_STEP + (Math.random() - 0.5) * 0.3,
        z: cz + (row - (rows - 1) / 2) * RD_STEP + (Math.random() - 0.5) * 0.3,
      };
      scene.add(mesh);
      return {
        mesh, size, q, to, delay: i * RD.gap, rest: -Math.min(...shape.points.map((v) => v.clone().applyQuaternion(q).y)) * size,
        from: { x: to.x + (Math.random() - 0.5) * 5, z: to.z + 7 },
        axis: new T.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), turn: (3 + Math.random() * 2) * Math.PI * 2,
      };
    });
    live.push({ dice, done, who: r.who, color: r.color, total: r.total, at: { x: cx, z: cz + (rows * RD_STEP) / 2 + 0.25 } });
    if (!frame) frame = requestAnimationFrame(tick);
  }
  return {
    async roll(r) {
      if (stopped || document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      await Promise.race([load, new Promise((ok) => setTimeout(ok, RD.wait))]);
      if (stopped || !T || !setup()) return;
      await new Promise((done) => start(r, done));
    },
    stop() {
      stopped = true;
      cancelAnimationFrame(frame);
      [...live].forEach(remove);
      if (!renderer) return;
      Object.values(looks).flat().forEach((m) => {
        m.emissiveMap.dispose();
        m.dispose();
      });
      Object.values(shapes).forEach((sh) => sh.geo.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
