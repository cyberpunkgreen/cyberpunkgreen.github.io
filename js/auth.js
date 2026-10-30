// Hesap sistemi (Firebase). Sağ üstteki sekmede "Giriş Yap · Hesap Oluştur"; giriş yapılınca kullanıcı adı (profil), rozetler ve "Çıkış Yap".
// Kullanıcı adları arka planda iç bir e-posta adresine çevrilir (kullaniciadi@<proje>.firebaseapp.com); şifreleri Firebase hash'leyerek saklar.
// Veri (kurallar: Planning/Firestore-Kurallari.txt):
//   users/{uid}    gizli: { username, usernameLower, gmStatus: "none" | "pending" | "approved", createdAt } (kişinin kendisi ve yöneticiler okur)
//   profiles/{uid} herkese açık: { username, color, badges, badge, lastPlayed? }
//                  color: isim ve kutu rengi · badges: yöneticinin verdiği rozetler (["vip"]) · badge: takılı rozet (yoksa null)
//                  lastPlayed: son katıldığı oturum (Aktif Oyuncu rozeti için; oturum sistemi gelince yazılacak)
//   feedback/{id}  geri bildirimler: { uid, username, version, text, createdAt } (herkes okur, üyeler yazar, yöneticiler siler)
//   admins/{uid}   yöneticiler; yalnızca Firebase panelinden yazılır.
// Ayrıca yönetim sayfalarını (#yonetim/…) ve geri bildirim sayfasını (#geri-bildirim) dolduran araçları TOOLS'a ekler.

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6fuOnyp_2-qxjDRLRA2vJGpW8qZJUF-M",
  authDomain: "cybergreen-9539c.firebaseapp.com",
  projectId: "cybergreen-9539c",
  storageBucket: "cybergreen-9539c.firebasestorage.app",
  messagingSenderId: "530477870448",
  appId: "1:530477870448:web:6509d9c7361c7510cb73b5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const EMAIL_DOMAIN = "cybergreen-9539c.firebaseapp.com";
const USERNAME_RE = /^[A-Za-z0-9_.-]{3,20}$/;
const MIN_PASSWORD = 8;
const MAX_FEEDBACK = 2000;

// Profil renkleri; varsayılan yeşil. İsim ve geri bildirim kutuları bu renge boyanır.
const COLORS = {
  red: "#ff5f56",
  yellow: "#f5c542",
  blue: "#5aa9ff",
  green: "#39ff14",
  white: "#f0f0f0",
  orange: "#ff9f43",
  pink: "#ff6fd8",
  purple: "#b388ff",
};
const colorOf = (p) => COLORS[(p && p.color) || "green"] || COLORS.green;

// Rozetler: tek seferde bir rozet takılır, kullanıcı adının başında adın renginde görünür.
//   gm: onaylı GM'ler (onaylanınca kendiliğinden takılır) · admin: yöneticiler
//   active: son ACTIVE_DAYS gün içinde bir oturuma katılanlar · vip: yöneticinin verdiği
// İkonlar 32×32, arka planı saydam; .bf parçaları adın renginin açık tonuyla dolar.
const BADGES = ["gm", "admin", "active", "vip"];
const ACTIVE_DAYS = 7;
const BADGE_SVG = {
  // d20: altıgen gövde, ortada üst yüz, çevresinde yan yüzler
  gm:
    '<path d="M16 1.5 28.6 8.75v14.5L16 30.5 3.4 23.25V8.75Z"/><path class="bf" d="M16 8l7.6 13H8.4Z"/>' +
    '<path d="M16 1.5V8M3.4 8.75 16 8l12.6.75M3.4 8.75 8.4 21l-5 2.25M8.4 21 16 30.5l7.6-9.5M28.6 8.75 23.6 21l5 2.25"/>',
  // Ban tokmağı: çaprazlama tokmak başı ve sap
  admin:
    '<g transform="translate(-2.6 2.6) rotate(45 16 16)"><rect class="bf" x="7" y="2.5" width="18" height="9" rx="1.5"/>' +
    '<path d="M11 2.5v9M21 2.5v9"/><rect x="14.5" y="11.5" width="3" height="18" rx="1.2"/></g>',
  // Beş köşeli yıldız
  active: '<path class="bf" d="M16 2.5l3.5 9.7 10.3.3-8.1 6.4 2.8 9.8L16 23l-8.5 5.7 2.8-9.8-8.1-6.4 10.3-.3Z"/>',
  // Üç uçlu taç
  vip:
    '<path class="bf" d="M4 24V10l6.5 7L16 6l5.5 11L28 10v14Z"/><rect x="4" y="24.5" width="24" height="4" rx="1"/>' +
    '<circle class="bf" cx="4" cy="8" r="2"/><circle class="bf" cx="16" cy="4" r="2"/><circle class="bf" cx="28" cy="8" r="2"/>',
};

const badgeIcon = (id) => {
  const name = T().badgeNames[id];
  return `<svg class="ubadge" viewBox="0 0 32 32" role="img" aria-label="${name}"><title>${name}</title>${BADGE_SVG[id]}</svg>`;
};
const hasVip = (p) => ((p && p.badges) || []).includes("vip");
const activeOk = (p) => !!(p && p.lastPlayed && p.lastPlayed.toMillis && Date.now() - p.lastPlayed.toMillis() < ACTIVE_DAYS * 864e5);
// Takılı rozet; süresi dolmuş Aktif Oyuncu ya da geri alınmış VIP gösterilmez
const wornBadge = (p) => {
  const b = p && p.badge;
  if (!BADGE_SVG[b] || (b === "active" && !activeOk(p)) || (b === "vip" && !hasVip(p))) return null;
  return b;
};
// Rozet + kullanıcı adı; renk dıştaki öğeden gelir
const nameHtml = (name, p) => {
  const b = wornBadge(p);
  return `<span class="uname">${b ? badgeIcon(b) : ""}<span>${esc(name)}</span></span>`;
};

const AUTH_TEXT = {
  tr: {
    login: "Giriş Yap", register: "Hesap Oluştur", logout: "Çıkış Yap", admin: "Yönetim", backToSite: "Siteye Dön",
    username: "Kullanıcı adı", password: "Şifre", password2: "Şifre (tekrar)",
    usernameHint: "3–20 karakter: İngilizce harf, rakam, _ . -",
    passwordHint: `En az ${MIN_PASSWORD} karakter.`,
    type: "Üyelik türü", player: "Oyuncu", gm: "GM",
    gmHint: "GM seçilirse hesap bir GM başvurusuyla açılır; bir site yöneticisi onaylayınca GM olur. Başvuru sonradan profilden de yapılabilir.",
    noAccount: "Hesabın yok mu?", haveAccount: "Zaten hesabın var mı?",
    working: "Bekle…", close: "Kapat",
    badges: { gm: "GM", pending: "GM · onay bekliyor" },
    // Profil
    gmRow: "GM", colorRow: "Renk", badgesRow: "Rozetler", noBadges: "Henüz rozet yok.",
    badgeNames: { gm: "GM Rozeti", admin: "Yönetici Rozeti", active: "Aktif Oyuncu Rozeti", vip: "VIP Rozeti" },
    badgeHints: {
      gm: "Onaylı GM hesaplarına verilir.",
      admin: "Site yöneticilerine verilir.",
      active: `Son ${ACTIVE_DAYS} gün içinde bir oturuma katılınca takılabilir.`,
      vip: "Site yöneticisi verir.",
    },
    badgeWorn: "Takılı · çıkarmak için tıkla", badgeWear: "Takmak için tıkla", badgeNote: "Takılı rozet kullanıcı adının başında görünür.",
    vipGrant: "VIP ver", vipRevoke: "VIP'i geri al",
    gmNone: "GM değil.", gmPending: "GM başvurusu inceleniyor.", gmApproved: "GM hesabı.",
    gmApply: "GM başvurusu yap", gmCancel: "Başvuruyu iptal et",
    gmOtherNone: "GM başvurusu yok.", approve: "Onayla", reject: "Reddet", revoke: "GM yetkisini kaldır",
    colorNames: { red: "Kırmızı", yellow: "Sarı", blue: "Mavi", green: "Yeşil", white: "Beyaz", orange: "Turuncu", pink: "Pembe", purple: "Mor" },
    // Yönetim
    adminOnly: "Bu sayfa yalnızca yöneticiler içindir.", loading: "Yükleniyor…",
    noAccounts: "Kayıtlı hesap yok.", viewProfile: "Profili gör", noPending: "Onay bekleyen GM başvurusu yok.", approved: "Onaylandı", rejected: "Reddedildi",
    // Geri bildirim
    fbIntro: "Sistemle ilgili gördüğün sorunları, önerilerini ve fikirlerini buraya yazabilirsin. En yeni yazılar en üstte durur.",
    fbVersion: "Sürüm", fbPlaceholder: "Geri bildirimini yaz…", fbSend: "Gönder", fbLogin: "Geri bildirim yazmak için giriş yapmalısın.",
    fbEmpty: "Henüz geri bildirim yok.", fbDelete: "Sil", fbConfirm: "Bu geri bildirim silinsin mi?", fbTooLong: `En fazla ${MAX_FEEDBACK} karakter.`,
    errors: {
      username: "Kullanıcı adı 3–20 karakter olmalı; yalnızca İngilizce harf, rakam, _ . - kullanılabilir.",
      password: `Şifre en az ${MIN_PASSWORD} karakter olmalı.`,
      mismatch: "Şifreler aynı değil.",
      taken: "Bu kullanıcı adı alınmış.",
      wrong: "Kullanıcı adı ya da şifre hatalı.",
      tooMany: "Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.",
      network: "Bağlantı kurulamadı. İnternetini kontrol et.",
      denied: "Sunucu bu işleme izin vermedi.",
      other: "Bir şeyler ters gitti",
    },
  },
  en: {
    login: "Log In", register: "Sign Up", logout: "Log Out", admin: "Admin", backToSite: "Back to Site",
    username: "Username", password: "Password", password2: "Password (again)",
    usernameHint: "3–20 characters: letters, digits, _ . -",
    passwordHint: `At least ${MIN_PASSWORD} characters.`,
    type: "Account type", player: "Player", gm: "GM",
    gmHint: "Choosing GM opens the account with a GM application; it becomes a GM once a site admin approves it. You can also apply later from your profile.",
    noAccount: "No account yet?", haveAccount: "Already have an account?",
    working: "Wait…", close: "Close",
    badges: { gm: "GM", pending: "GM · awaiting approval" },
    gmRow: "GM", colorRow: "Color", badgesRow: "Badges", noBadges: "No badges yet.",
    badgeNames: { gm: "GM Badge", admin: "Admin Badge", active: "Active Player Badge", vip: "VIP Badge" },
    badgeHints: {
      gm: "Given to approved GM accounts.",
      admin: "Given to site admins.",
      active: `Can be worn after joining a session in the last ${ACTIVE_DAYS} days.`,
      vip: "Given by a site admin.",
    },
    badgeWorn: "Worn · click to remove", badgeWear: "Click to wear", badgeNote: "Your worn badge appears before your username.",
    vipGrant: "Grant VIP", vipRevoke: "Revoke VIP",
    gmNone: "Not a GM.", gmPending: "GM application under review.", gmApproved: "GM account.",
    gmApply: "Apply as GM", gmCancel: "Cancel application",
    gmOtherNone: "No GM application.", approve: "Approve", reject: "Reject", revoke: "Revoke GM",
    colorNames: { red: "Red", yellow: "Yellow", blue: "Blue", green: "Green", white: "White", orange: "Orange", pink: "Pink", purple: "Purple" },
    adminOnly: "This page is for admins only.", loading: "Loading…",
    noAccounts: "No accounts yet.", viewProfile: "View profile", noPending: "No GM applications waiting for approval.", approved: "Approved", rejected: "Rejected",
    fbIntro: "Write any problems you've found, suggestions or ideas about the system here. The newest posts are at the top.",
    fbVersion: "Version", fbPlaceholder: "Write your feedback…", fbSend: "Send", fbLogin: "You need to log in to write feedback.",
    fbEmpty: "No feedback yet.", fbDelete: "Delete", fbConfirm: "Delete this feedback?", fbTooLong: `At most ${MAX_FEEDBACK} characters.`,
    errors: {
      username: "Usernames must be 3–20 characters, using only letters, digits, _ . -",
      password: `Passwords must be at least ${MIN_PASSWORD} characters.`,
      mismatch: "The passwords don't match.",
      taken: "That username is taken.",
      wrong: "Wrong username or password.",
      tooMany: "Too many attempts. Wait a bit and try again.",
      network: "Couldn't connect. Check your internet connection.",
      denied: "The server didn't allow this.",
      other: "Something went wrong",
    },
  },
};

const curLang = () => (typeof lang !== "undefined" && lang === "en" ? "en" : "tr");
const T = () => AUTH_TEXT[curLang()];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Eski kayıtlarda (accountType / gmApproved) GM durumu bu alanlardan çıkarılır
const gmStatusOf = (d) => (!d ? "none" : d.gmStatus || (d.accountType === "gm" ? (d.gmApproved ? "approved" : "pending") : "none"));

let user = null; // Firebase kullanıcısı
let account = null; // users/{uid}
let profile = null; // profiles/{uid}
let isAdmin = false;
let authReady = false;

function errorText(err) {
  const t = T().errors;
  const code = (err && err.code) || "";
  if (code === "auth/email-already-in-use") return t.taken;
  if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found", "auth/invalid-login-credentials"].includes(code)) return t.wrong;
  if (code === "auth/too-many-requests") return t.tooMany;
  if (code === "auth/network-request-failed" || code === "unavailable") return t.network;
  if (code === "auth/weak-password") return t.password;
  if (code === "permission-denied") return t.denied;
  return `${t.other}${code ? ` (${code})` : ""}.`;
}

// ---------- Sağ üstteki sekme ----------

const tab = document.getElementById("auth-tab");
const inAdmin = () => location.hash.startsWith("#yonetim/");

function renderTab() {
  const t = T();
  if (!user) {
    tab.innerHTML = `<button type="button" data-open="login">${t.login}</button><span class="auth-sep">·</span><button type="button" data-open="register">${t.register}</button>`;
  } else {
    const name = (account && account.username) || user.email.split("@")[0];
    const pending = gmStatusOf(account) === "pending" ? `<span class="auth-badge pending">${t.badges.pending}</span>` : "";
    // Ad sekmede beyaz kalır; yalnızca rozet profil renginde
    const worn = wornBadge(profile);
    tab.innerHTML =
      `<button type="button" class="auth-user" data-profile="${user.uid}">${worn ? `<span style="color: ${colorOf(profile)}">${badgeIcon(worn)}</span>` : ""}${esc(name)}</button>` +
      pending +
      (isAdmin
        ? `<span class="auth-sep">·</span><button type="button" data-action="admin">${inAdmin() ? t.backToSite : t.admin}</button>`
        : "") +
      `<span class="auth-sep">·</span><button type="button" data-action="logout">${t.logout}</button>`;
  }
  tab.hidden = false;
}

tab.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.open) openDialog(b.dataset.open);
  else if (b.dataset.profile) openProfile(b.dataset.profile);
  else if (b.dataset.action === "admin") location.hash = inAdmin() ? "" : "#yonetim/hesaplar";
  else if (b.dataset.action === "logout") {
    if (inAdmin()) location.hash = "";
    signOut(auth);
  }
});

window.addEventListener("hashchange", () => {
  if (user) renderTab();
});

// ---------- Pencere (arka plan kararır) ----------

const dialog = document.createElement("dialog");
dialog.className = "auth-dialog";
document.body.appendChild(dialog);
let view = null; // "login" | "register" | "profile"
let profileUid = null;

// Pencerenin dışına (karartılmış alana) tıklanınca kapanır; Esc de kapatır
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});

function field(name, label, type, hint, autocomplete) {
  return `<label class="auth-field"><span>${label}</span><input name="${name}" type="${type}" autocomplete="${autocomplete}" required>${hint ? `<small>${hint}</small>` : ""}</label>`;
}

const closeBtn = () => `<button type="button" class="auth-close" data-action="close" aria-label="${T().close}">×</button>`;

function renderDialog() {
  const t = T();
  if (view === "login") {
    dialog.innerHTML = `
      <form class="auth-panel" novalidate>
        ${closeBtn()}
        <h2>${t.login}</h2>
        ${field("username", t.username, "text", "", "username")}
        ${field("password", t.password, "password", "", "current-password")}
        <p class="auth-error" role="alert"></p>
        <button type="submit" class="auth-submit">${t.login}</button>
        <p class="auth-switch">${t.noAccount} <button type="button" data-open="register">${t.register}</button></p>
      </form>`;
  } else if (view === "register") {
    dialog.innerHTML = `
      <form class="auth-panel" novalidate>
        ${closeBtn()}
        <h2>${t.register}</h2>
        ${field("username", t.username, "text", t.usernameHint, "username")}
        ${field("password", t.password, "password", t.passwordHint, "new-password")}
        ${field("password2", t.password2, "password", "", "new-password")}
        <div class="auth-field">
          <span>${t.type}</span>
          <div class="auth-types" role="radiogroup">
            <label><input type="radio" name="type" value="oyuncu" checked><span>${t.player}</span></label>
            <label><input type="radio" name="type" value="gm"><span>${t.gm}</span></label>
          </div>
          <small>${t.gmHint}</small>
        </div>
        <p class="auth-error" role="alert"></p>
        <button type="submit" class="auth-submit">${t.register}</button>
        <p class="auth-switch">${t.haveAccount} <button type="button" data-open="login">${t.login}</button></p>
      </form>`;
  } else if (view === "profile") {
    dialog.innerHTML = `<div class="auth-panel prof">${closeBtn()}<p class="auth-muted">${t.loading}</p></div>`;
    loadProfile(profileUid);
  }
}

function openDialog(which) {
  view = which;
  renderDialog();
  if (!dialog.open) dialog.showModal();
  const first = dialog.querySelector("input");
  if (first) first.focus();
}

function openProfile(uid) {
  profileUid = uid;
  openDialog("profile");
}

dialog.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.action === "close") dialog.close();
  else if (b.dataset.open) openDialog(b.dataset.open);
  else if (b.dataset.gm) setGm(b);
  else if (b.dataset.color) setColor(b.dataset.color);
  else if (b.dataset.badge) setBadge(b);
  else if (b.dataset.vip) setVip(b);
});

dialog.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const t = T();
  const errBox = form.querySelector(".auth-error");
  const submit = form.querySelector(".auth-submit");
  const v = Object.fromEntries(new FormData(form));
  const username = String(v.username || "").trim();
  const showError = (msg) => {
    errBox.textContent = msg;
  };
  showError("");

  if (!USERNAME_RE.test(username)) return showError(t.errors.username);
  if (view === "register") {
    if (String(v.password).length < MIN_PASSWORD) return showError(t.errors.password);
    if (v.password !== v.password2) return showError(t.errors.mismatch);
  }

  const label = submit.textContent;
  submit.disabled = true;
  submit.textContent = t.working;
  const email = `${username.toLowerCase()}@${EMAIL_DOMAIN}`;
  try {
    if (view === "login") {
      await signInWithEmailAndPassword(auth, email, v.password);
    } else {
      const cred = await createUserWithEmailAndPassword(auth, email, v.password);
      const acc = { username, usernameLower: username.toLowerCase(), gmStatus: v.type === "gm" ? "pending" : "none", createdAt: serverTimestamp() };
      const prof = { username, color: "green", badges: [] };
      try {
        const batch = writeBatch(db);
        batch.set(doc(db, "users", cred.user.uid), acc);
        batch.set(doc(db, "profiles", cred.user.uid), prof);
        await batch.commit();
      } catch (err) {
        // Hesap kaydı yazılamadıysa giriş hesabı da geri alınır; kullanıcı adı boşta kalmasın
        await deleteUser(cred.user).catch(() => {});
        throw err;
      }
      account = acc;
      profile = prof;
      renderTab();
    }
    dialog.close();
  } catch (err) {
    showError(errorText(err));
  } finally {
    submit.disabled = false;
    submit.textContent = label;
  }
});

// ---------- Profil penceresi ----------
// Kendi profilinde: GM başvurusu yap / iptal et, renk seç. Yönetici başka birinin profilinde: GM başvurusunu onayla / reddet.

let shown = null; // açık profilin verisi { uid, account, profile }

async function loadProfile(uid) {
  try {
    const [a, p] = await Promise.all([getDoc(doc(db, "users", uid)), getDoc(doc(db, "profiles", uid))]);
    if (view !== "profile" || profileUid !== uid) return;
    shown = { uid, account: a.exists() ? a.data() : null, profile: p.exists() ? p.data() : null };
    renderProfile();
  } catch (err) {
    const panel = dialog.querySelector(".prof");
    if (panel) panel.innerHTML = `${closeBtn()}<p class="auth-error">${errorText(err)}</p>`;
  }
}

function renderProfile() {
  const t = T();
  const own = user && shown.uid === user.uid;
  const name = (shown.profile && shown.profile.username) || (shown.account && shown.account.username) || "?";
  const color = (shown.profile && shown.profile.color) || "green";
  const gm = gmStatusOf(shown.account);
  let gmHtml = "";
  if (own) {
    gmHtml =
      gm === "approved"
        ? `<span>${t.gmApproved}</span>`
        : gm === "pending"
          ? `<span>${t.gmPending}</span><button type="button" class="prof-btn" data-gm="none">${t.gmCancel}</button>`
          : `<span>${t.gmNone}</span><button type="button" class="prof-btn" data-gm="pending">${t.gmApply}</button>`;
  } else if (isAdmin) {
    gmHtml =
      gm === "approved"
        ? `<span>${t.gmApproved}</span><button type="button" class="prof-btn neg" data-gm="none">${t.revoke}</button>`
        : gm === "pending"
          ? `<span>${t.gmPending}</span><button type="button" class="prof-btn" data-gm="approved">${t.approve}</button><button type="button" class="prof-btn neg" data-gm="none">${t.reject}</button>`
          : `<span>${t.gmOtherNone}</span>`;
  }
  const swatches = Object.entries(COLORS)
    .filter(([k]) => own || k === color)
    .map(
      ([k, hex]) =>
        `<button type="button" class="prof-swatch${k === color ? " on" : ""}" style="--sw: ${hex}"${own ? ` data-color="${k}"` : " disabled"} title="${t.colorNames[k]}" aria-label="${t.colorNames[k]}" aria-pressed="${k === color}"></button>`
    )
    .join("");
  dialog.querySelector(".prof").innerHTML = `
    ${closeBtn()}
    <h2 style="color: ${COLORS[color] || COLORS.green}">${nameHtml(name, shown.profile)}</h2>
    ${gmHtml ? `<div class="prof-row"><b>${t.gmRow}</b><div class="prof-gm">${gmHtml}</div></div>` : ""}
    <div class="prof-row"><b>${t.colorRow}</b><div class="prof-swatches">${swatches}</div></div>
    <div class="prof-row"><b>${t.badgesRow}</b>${badgesHtml(own, gm)}</div>
    <p class="auth-error" role="alert"></p>`;
}

// Kendi profilinde dört rozetin hepsi görünür: takılı, takılabilir ya da kilitli (koşuluyla).
// Başkasının profilinde yalnızca sahip olduğu bilinen rozetler görünür. Yönetici her profilde VIP verip geri alabilir.
function badgesHtml(own, gm) {
  const t = T();
  const p = shown.profile;
  const worn = wornBadge(p);
  const can = {
    gm: gm === "approved",
    admin: own ? isAdmin : worn === "admin",
    active: activeOk(p),
    vip: hasVip(p),
  };
  const ids = own ? BADGES : BADGES.filter((id) => can[id]);
  const tiles = ids
    .map((id) => {
      const inner = `${badgeIcon(id)}<span><b>${t.badgeNames[id]}</b>`;
      if (!own) return `<div class="prof-bdg${id === worn ? " on" : ""}">${inner}</span></div>`;
      if (!can[id]) return `<div class="prof-bdg locked">${inner}<small>${t.badgeHints[id]}</small></span></div>`;
      const on = id === worn;
      return `<button type="button" class="prof-bdg${on ? " on" : ""}" data-badge="${id}" aria-pressed="${on}">${inner}<small>${on ? t.badgeWorn : t.badgeWear}</small></span></button>`;
    })
    .join("");
  const vip = isAdmin
    ? `<button type="button" class="prof-btn${can.vip ? " neg" : ""}" data-vip="${can.vip ? "revoke" : "grant"}">${can.vip ? t.vipRevoke : t.vipGrant}</button>`
    : "";
  return (
    `<div class="prof-badges" style="--uc: ${colorOf(p)}">${tiles || `<span class="auth-muted">${t.noBadges}</span>`}` +
    `${own ? `<small class="prof-note">${t.badgeNote}</small>` : ""}${vip ? `<div>${vip}</div>` : ""}</div>`
  );
}

// GM durumunu yazar. Onaylanan GM'nin takılı rozeti yoksa GM rozeti takılır; yetkisi kalkınca GM rozeti çıkarılır.
// Takılan rozeti döndürür (değişmediyse undefined).
async function writeGm(uid, status) {
  const pref = doc(db, "profiles", uid);
  const snap = await getDoc(pref);
  const prof = snap.exists() ? snap.data() : null;
  let badge;
  if (prof && status === "approved" && !wornBadge(prof)) badge = "gm";
  if (prof && status !== "approved" && prof.badge === "gm") badge = null;
  const batch = writeBatch(db);
  batch.update(doc(db, "users", uid), { gmStatus: status });
  if (badge !== undefined) batch.update(pref, { badge });
  await batch.commit();
  return badge;
}

// Kendi profilinde açık rozet ve renk değişince sekme, açık geri bildirim/hesap sayfaları da güncellenir
function afterProfileChange(changes) {
  shown.profile = { ...(shown.profile || {}), ...changes };
  if (user && shown.uid === user.uid) {
    profile = { ...(profile || {}), ...changes };
    renderTab();
  }
  renderProfile();
  if (location.hash === "#geri-bildirim" || location.hash === "#yonetim/hesaplar") rerender();
}

async function setGm(btn) {
  const status = btn.dataset.gm;
  btn.disabled = true;
  try {
    const badge = await writeGm(shown.uid, status);
    shown.account = { ...(shown.account || {}), gmStatus: status };
    if (user && shown.uid === user.uid) {
      account = { ...(account || {}), gmStatus: status };
      publishRole();
    }
    afterProfileChange(badge === undefined ? {} : { badge });
    if (location.hash === "#yonetim/gm") rerender();
  } catch (err) {
    btn.disabled = false;
    dialog.querySelector(".auth-error").textContent = errorText(err);
  }
}

async function setColor(color) {
  try {
    await updateDoc(doc(db, "profiles", shown.uid), { color });
    afterProfileChange({ color });
  } catch (err) {
    dialog.querySelector(".auth-error").textContent = errorText(err);
  }
}

// Takılı rozete yeniden tıklanınca çıkarılır
async function setBadge(btn) {
  const badge = btn.dataset.badge === wornBadge(shown.profile) ? null : btn.dataset.badge;
  btn.disabled = true;
  try {
    await updateDoc(doc(db, "profiles", shown.uid), { badge });
    afterProfileChange({ badge });
  } catch (err) {
    btn.disabled = false;
    dialog.querySelector(".auth-error").textContent = errorText(err);
  }
}

async function setVip(btn) {
  const grant = btn.dataset.vip === "grant";
  const badges = new Set((shown.profile && shown.profile.badges) || []);
  if (grant) badges.add("vip");
  else badges.delete("vip");
  const changes = { badges: [...badges] };
  if (!grant && shown.profile && shown.profile.badge === "vip") changes.badge = null;
  btn.disabled = true;
  try {
    await updateDoc(doc(db, "profiles", shown.uid), changes);
    afterProfileChange(changes);
  } catch (err) {
    btn.disabled = false;
    dialog.querySelector(".auth-error").textContent = errorText(err);
  }
}

// ---------- Sayfalar: yönetim ve geri bildirim (TOOLS'a eklenir, js/main.js çizer) ----------

const rerender = () => {
  if (typeof renderContent === "function") renderContent();
};
const ourPage = () => location.hash.startsWith("#yonetim/") || location.hash === "#geri-bildirim";

// Rol bilgisi js/main.js'e verilir: GM bölümü menüde yalnızca onaylı GM'lere ve yöneticilere görünür.
// Bu yalnızca görünürlüktür; GM'lere özel veri gelince Firestore kurallarıyla da korunacak.
function publishRole() {
  const next = { ready: authReady, gm: gmStatusOf(account) === "approved", admin: isAdmin };
  const prev = window.CG_ROLE;
  window.CG_ROLE = next;
  if (prev && prev.ready === next.ready && prev.gm === next.gm && prev.admin === next.admin) return;
  if (typeof renderMenu === "function") renderMenu();
  if (location.hash.startsWith("#gm/")) rerender();
}

// Hesaba tıklanınca imlecin yanında açılan küçük menü ("Profili gör")
const ctx = document.createElement("div");
ctx.className = "ctx-menu";
ctx.hidden = true;
document.body.appendChild(ctx);
function openCtx(x, y, uid) {
  ctx.innerHTML = `<button type="button" data-uid="${uid}">${T().viewProfile}</button>`;
  ctx.hidden = false;
  ctx.style.left = `${Math.min(x, window.innerWidth - ctx.offsetWidth - 8)}px`;
  ctx.style.top = `${Math.min(y, window.innerHeight - ctx.offsetHeight - 8)}px`;
}
ctx.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  ctx.hidden = true;
  openProfile(b.dataset.uid);
});
document.addEventListener("click", (e) => {
  if (!ctx.hidden && !ctx.contains(e.target) && !e.target.closest(".adm-user")) ctx.hidden = true;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") ctx.hidden = true;
});
window.addEventListener("scroll", () => (ctx.hidden = true), { passive: true });

function adminGuard(el) {
  const t = T();
  if (!authReady) {
    el.innerHTML = `<p class="auth-muted">${t.loading}</p>`;
    return false;
  }
  if (!isAdmin) {
    el.innerHTML = `<p class="placeholder">${t.adminOnly}</p>`;
    return false;
  }
  return true;
}

async function mountAdminAccounts(el) {
  const t = T();
  if (!adminGuard(el)) return;
  el.innerHTML = `<p class="auth-muted">${t.loading}</p>`;
  try {
    const [snap, profSnap] = await Promise.all([getDocs(collection(db, "users")), getDocs(collection(db, "profiles"))]);
    const profs = Object.fromEntries(profSnap.docs.map((d) => [d.id, d.data()]));
    const rows = snap.docs.map((d) => ({ uid: d.id, ...d.data() })).sort((a, b) => (a.usernameLower || "").localeCompare(b.usernameLower || ""));
    el.innerHTML = rows.length
      ? `<ul class="adm-list">${rows
          .map((r) => {
            const gm = gmStatusOf(r);
            const tag = gm === "approved" ? `<span class="auth-badge">${t.badges.gm}</span>` : gm === "pending" ? `<span class="auth-badge pending">${t.badges.pending}</span>` : "";
            const p = profs[r.uid];
            return `<li><button type="button" class="adm-user" data-uid="${r.uid}" style="--uc: ${colorOf(p)}">${nameHtml(r.username, p)}</button>${tag}</li>`;
          })
          .join("")}</ul>`
      : `<p class="auth-muted">${t.noAccounts}</p>`;
    el.addEventListener("click", (e) => {
      const b = e.target.closest(".adm-user");
      if (b) openCtx(e.clientX + 4, e.clientY + 4, b.dataset.uid);
    });
  } catch (err) {
    el.innerHTML = `<p class="auth-error">${errorText(err)}</p>`;
  }
}

async function mountAdminGm(el) {
  const t = T();
  if (!adminGuard(el)) return;
  el.innerHTML = `<p class="auth-muted">${t.loading}</p>`;
  try {
    const snap = await getDocs(query(collection(db, "users"), where("gmStatus", "==", "pending")));
    el.innerHTML = snap.empty
      ? `<p class="auth-muted">${t.noPending}</p>`
      : `<ul class="adm-list">${snap.docs
          .map(
            (d) =>
              `<li><button type="button" class="adm-user" data-uid="${d.id}">${esc(d.data().username)}</button>` +
              `<span class="adm-actions"><button type="button" class="prof-btn" data-set="approved" data-uid="${d.id}">${t.approve}</button>` +
              `<button type="button" class="prof-btn neg" data-set="none" data-uid="${d.id}">${t.reject}</button></span></li>`
          )
          .join("")}</ul><p class="auth-error" role="alert"></p>`;
    el.addEventListener("click", async (e) => {
      const u = e.target.closest(".adm-user");
      if (u) return openCtx(e.clientX + 4, e.clientY + 4, u.dataset.uid);
      const b = e.target.closest("[data-set]");
      if (!b) return;
      const actions = b.parentElement;
      for (const x of actions.querySelectorAll("button")) x.disabled = true;
      try {
        const badge = await writeGm(b.dataset.uid, b.dataset.set);
        if (user && b.dataset.uid === user.uid) {
          account = { ...(account || {}), gmStatus: b.dataset.set };
          if (badge !== undefined) profile = { ...(profile || {}), badge };
          publishRole();
          renderTab();
        }
        actions.innerHTML = `<span class="auth-muted">${b.dataset.set === "approved" ? t.approved : t.rejected}</span>`;
      } catch (err) {
        for (const x of actions.querySelectorAll("button")) x.disabled = false;
        el.querySelector(".auth-error").textContent = errorText(err);
      }
    });
  } catch (err) {
    el.innerHTML = `<p class="auth-error">${errorText(err)}</p>`;
  }
}

async function mountFeedback(el) {
  const t = T();
  const lng = curLang();
  const versions = typeof EDITIONS !== "undefined" ? [...EDITIONS].reverse() : [];
  const current = typeof edition !== "undefined" ? edition : versions.length ? versions[0].id : "";
  const form = user
    ? `<form class="fb-form" style="--uc: ${colorOf(profile)}">
        <textarea name="text" maxlength="${MAX_FEEDBACK}" placeholder="${t.fbPlaceholder}" required></textarea>
        <div class="fb-form-row">
          <label class="fb-version"><span>${t.fbVersion}</span><select name="version">${versions
            .map((v) => `<option value="${v.id}"${v.id === current ? " selected" : ""}>V${v.label}</option>`)
            .join("")}</select></label>
          <button type="submit" class="auth-submit">${t.fbSend}</button>
        </div>
        <p class="auth-error" role="alert"></p>
      </form>`
    : `<p class="fb-login">${t.fbLogin} <button type="button" data-open="login">${t.login}</button> · <button type="button" data-open="register">${t.register}</button></p>`;
  el.innerHTML = `<p class="fb-intro">${t.fbIntro}</p>${authReady ? form : ""}<div class="fb-list"><p class="auth-muted">${t.loading}</p></div>`;

  el.addEventListener("click", async (e) => {
    const o = e.target.closest("[data-open]");
    if (o) return openDialog(o.dataset.open);
    const d = e.target.closest("[data-delete]");
    if (d && confirm(t.fbConfirm)) {
      d.disabled = true;
      try {
        await deleteDoc(doc(db, "feedback", d.dataset.delete));
        d.closest(".fb-post").remove();
      } catch (err) {
        d.disabled = false;
        alert(errorText(err));
      }
    }
  });
  const f = el.querySelector(".fb-form");
  if (f) {
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = f.text.value.trim();
      const errBox = f.querySelector(".auth-error");
      errBox.textContent = "";
      if (!text) return;
      if (text.length > MAX_FEEDBACK) return (errBox.textContent = t.fbTooLong);
      const btn = f.querySelector("button[type=submit]");
      btn.disabled = true;
      try {
        await addDoc(collection(db, "feedback"), {
          uid: user.uid,
          username: account ? account.username : user.email.split("@")[0],
          version: f.version.value,
          text,
          createdAt: serverTimestamp(),
        });
        f.text.value = "";
        loadPosts();
      } catch (err) {
        errBox.textContent = errorText(err);
      } finally {
        btn.disabled = false;
      }
    });
  }

  const list = el.querySelector(".fb-list");
  async function loadPosts() {
    try {
      const snap = await getDocs(query(collection(db, "feedback"), orderBy("createdAt", "desc"), limit(100)));
      const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Yazanların güncel renkleri herkese açık profillerden gelir
      const uids = [...new Set(posts.map((p) => p.uid))];
      const profs = Object.fromEntries(
        await Promise.all(uids.map(async (u) => [u, await getDoc(doc(db, "profiles", u)).then((s) => (s.exists() ? s.data() : null)).catch(() => null)]))
      );
      list.innerHTML = posts.length
        ? posts
            .map((p) => {
              const date = p.createdAt && p.createdAt.toDate ? p.createdAt.toDate().toLocaleDateString(lng === "tr" ? "tr-TR" : "en-GB") : "";
              return `<article class="fb-post" style="--uc: ${colorOf(profs[p.uid])}">
                <header><span class="fb-name">${nameHtml(p.username, profs[p.uid])}</span><span class="fb-ver">V${esc(p.version)}</span><span class="fb-date">${date}</span>${
                  isAdmin ? `<button type="button" class="fb-del" data-delete="${p.id}">${t.fbDelete}</button>` : ""
                }</header>
                <p>${esc(p.text)}</p>
              </article>`;
            })
            .join("")
        : `<p class="auth-muted">${t.fbEmpty}</p>`;
    } catch (err) {
      list.innerHTML = `<p class="auth-error">${errorText(err)}</p>`;
    }
  }
  loadPosts();
}

if (typeof TOOLS !== "undefined") {
  TOOLS["admin-hesaplar"] = mountAdminAccounts;
  TOOLS["admin-gm"] = mountAdminGm;
  TOOLS["feedback"] = mountFeedback;
  // Bu dosya sayfadan sonra yüklendiği için açık sayfa bizimse yeniden çizilir
  if (ourPage()) rerender();
}

// ---------- Oturum durumu ----------

onAuthStateChanged(auth, async (u) => {
  user = u;
  account = null;
  profile = null;
  isAdmin = false;
  if (u) {
    try {
      const [a, p, adm] = await Promise.all([getDoc(doc(db, "users", u.uid)), getDoc(doc(db, "profiles", u.uid)), getDoc(doc(db, "admins", u.uid))]);
      if (a.exists()) account = a.data();
      if (p.exists()) profile = p.data();
      isAdmin = adm.exists();
      // Eski kayıtlar: GM durumu yeni alana taşınır, herkese açık profil yoksa açılır
      if (account && !account.gmStatus && gmStatusOf(account) !== "approved") {
        const st = gmStatusOf(account);
        await updateDoc(doc(db, "users", u.uid), { gmStatus: st }).catch(() => {});
        account.gmStatus = st;
      }
      if (account && !profile) {
        profile = { username: account.username, color: "green", badges: [] };
        await setDoc(doc(db, "profiles", u.uid), profile).catch(() => {});
      }
      // Hiç rozet seçmemiş hesaplarda varsayılan: onaylı GM'ye GM rozeti, yöneticiye Yönetici rozeti
      if (profile && !("badge" in profile)) {
        const def = gmStatusOf(account) === "approved" ? "gm" : isAdmin ? "admin" : null;
        if (def) {
          await updateDoc(doc(db, "profiles", u.uid), { badge: def })
            .then(() => (profile.badge = def))
            .catch(() => {});
        }
      }
    } catch (err) {
      // Kayıt okunamazsa kullanıcı adı e-postadan gösterilir
    }
  }
  authReady = true;
  renderTab();
  publishRole();
  if (ourPage()) rerender();
});

// Firebase oturumu bildirmeden de sekme hemen görünsün (oturum açıksa birazdan kullanıcı adına döner)
renderTab();

// Dil değişince sekme ve açık pencere yeniden yazılır
document.addEventListener("langchange", () => {
  renderTab();
  if (dialog.open) renderDialog();
});
