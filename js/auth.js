// Hesap sistemi (Firebase). Sağ üstteki sekmede "Giriş Yap · Hesap Oluştur"; giriş yapılınca kullanıcı adı ve "Çıkış Yap".
// Kullanıcı adları arka planda iç bir e-posta adresine çevrilir (kullaniciadi@<proje>.firebaseapp.com); şifreleri Firebase hash'leyerek saklar.
// Profil: users/{uid} = { username, usernameLower, accountType: "oyuncu" | "gm", gmApproved, createdAt }.
// Yöneticiler: admins/{uid} belgesi olan hesaplar. Bu liste yalnızca Firebase panelinden yazılabilir (kurallar: Planning/Firestore-Kurallari.txt).

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
  collection,
  query,
  where,
  getDocs,
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

const AUTH_TEXT = {
  tr: {
    login: "Giriş Yap", register: "Hesap Oluştur", logout: "Çıkış Yap", admin: "Yönetim",
    username: "Kullanıcı adı", password: "Şifre", password2: "Şifre (tekrar)",
    usernameHint: "3–20 karakter: İngilizce harf, rakam, _ . -",
    passwordHint: `En az ${MIN_PASSWORD} karakter.`,
    type: "Üyelik türü", player: "Oyuncu", gm: "GM",
    gmHint: "GM hesapları bir site yöneticisi onaylayınca etkinleşir. Şimdilik iki tür arasında fark yok.",
    noAccount: "Hesabın yok mu?", haveAccount: "Zaten hesabın var mı?",
    working: "Bekle…", close: "Kapat",
    badges: { oyuncu: "Oyuncu", gm: "GM", pending: "GM · onay bekliyor", admin: "Yönetici" },
    pendingTitle: "Onay bekleyen GM hesapları", noPending: "Onay bekleyen GM hesabı yok.", approve: "Onayla", approved: "Onaylandı",
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
    login: "Log In", register: "Sign Up", logout: "Log Out", admin: "Admin",
    username: "Username", password: "Password", password2: "Password (again)",
    usernameHint: "3–20 characters: letters, digits, _ . -",
    passwordHint: `At least ${MIN_PASSWORD} characters.`,
    type: "Account type", player: "Player", gm: "GM",
    gmHint: "GM accounts become active once a site admin approves them. For now the two types work the same.",
    noAccount: "No account yet?", haveAccount: "Already have an account?",
    working: "Wait…", close: "Close",
    badges: { oyuncu: "Player", gm: "GM", pending: "GM · awaiting approval", admin: "Admin" },
    pendingTitle: "GM accounts awaiting approval", noPending: "No GM accounts are waiting for approval.", approve: "Approve", approved: "Approved",
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

const T = () => AUTH_TEXT[typeof lang !== "undefined" && lang === "en" ? "en" : "tr"];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

let user = null; // Firebase kullanıcısı
let profile = null; // users/{uid} belgesi
let isAdmin = false;

// ---------- Sağ üstteki sekme ----------

const tab = document.getElementById("auth-tab");

function renderTab() {
  const t = T();
  if (!user) {
    tab.innerHTML = `<button type="button" data-open="login">${t.login}</button><span class="auth-sep">·</span><button type="button" data-open="register">${t.register}</button>`;
  } else {
    const name = profile ? profile.username : user.email.split("@")[0];
    const badge = !profile ? "" : profile.accountType === "gm" ? (profile.gmApproved ? t.badges.gm : t.badges.pending) : t.badges.oyuncu;
    tab.innerHTML =
      `<span class="auth-user">${esc(name)}</span>` +
      (badge ? `<span class="auth-badge${profile && profile.accountType === "gm" && !profile.gmApproved ? " pending" : ""}">${badge}</span>` : "") +
      (isAdmin ? `<span class="auth-badge admin">${t.badges.admin}</span><span class="auth-sep">·</span><button type="button" data-open="admin">${t.admin}</button>` : "") +
      `<span class="auth-sep">·</span><button type="button" data-action="logout">${t.logout}</button>`;
  }
  tab.hidden = false;
}

tab.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.open) openDialog(b.dataset.open);
  else if (b.dataset.action === "logout") signOut(auth);
});

// ---------- Pencere (arka plan kararır) ----------

const dialog = document.createElement("dialog");
dialog.className = "auth-dialog";
document.body.appendChild(dialog);
let view = null;

// Pencerenin dışına (karartılmış alana) tıklanınca kapanır; Esc de kapatır
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});

function field(name, label, type, hint, autocomplete) {
  return `<label class="auth-field"><span>${label}</span><input name="${name}" type="${type}" autocomplete="${autocomplete}" required>${hint ? `<small>${hint}</small>` : ""}</label>`;
}

function renderDialog() {
  const t = T();
  const closeBtn = `<button type="button" class="auth-close" data-action="close" aria-label="${t.close}">×</button>`;
  if (view === "login") {
    dialog.innerHTML = `
      <form class="auth-panel" novalidate>
        ${closeBtn}
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
        ${closeBtn}
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
  } else if (view === "admin") {
    dialog.innerHTML = `
      <div class="auth-panel auth-admin">
        ${closeBtn}
        <h2>${t.pendingTitle}</h2>
        <ul class="auth-pending"><li class="auth-muted">${t.working}</li></ul>
        <p class="auth-error" role="alert"></p>
      </div>`;
    loadPending();
  }
}

function openDialog(which) {
  view = which;
  renderDialog();
  if (!dialog.open) dialog.showModal();
  const first = dialog.querySelector("input");
  if (first) first.focus();
}

dialog.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.action === "close") dialog.close();
  else if (b.dataset.open) openDialog(b.dataset.open);
  else if (b.dataset.approve) approve(b);
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
      const data = { username, usernameLower: username.toLowerCase(), accountType: v.type === "gm" ? "gm" : "oyuncu", gmApproved: false, createdAt: serverTimestamp() };
      try {
        await setDoc(doc(db, "users", cred.user.uid), data);
      } catch (err) {
        // Profil yazılamadıysa hesap da geri alınır; kullanıcı adı boşta kalmasın
        await deleteUser(cred.user).catch(() => {});
        throw err;
      }
      profile = data;
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

// ---------- Yönetim: onay bekleyen GM hesapları ----------

async function loadPending() {
  const t = T();
  const list = dialog.querySelector(".auth-pending");
  try {
    const snap = await getDocs(query(collection(db, "users"), where("accountType", "==", "gm"), where("gmApproved", "==", false)));
    if (view !== "admin") return;
    list.innerHTML = snap.empty
      ? `<li class="auth-muted">${t.noPending}</li>`
      : snap.docs
          .map((d) => `<li><span>${esc(d.data().username)}</span><button type="button" data-approve="${d.id}">${t.approve}</button></li>`)
          .join("");
  } catch (err) {
    list.innerHTML = "";
    dialog.querySelector(".auth-error").textContent = errorText(err);
  }
}

async function approve(btn) {
  const t = T();
  btn.disabled = true;
  try {
    await updateDoc(doc(db, "users", btn.dataset.approve), { gmApproved: true });
    btn.textContent = t.approved;
  } catch (err) {
    btn.disabled = false;
    dialog.querySelector(".auth-error").textContent = errorText(err);
  }
}

// ---------- Oturum durumu ----------

onAuthStateChanged(auth, async (u) => {
  user = u;
  profile = null;
  isAdmin = false;
  if (u) {
    try {
      const [p, a] = await Promise.all([getDoc(doc(db, "users", u.uid)), getDoc(doc(db, "admins", u.uid))]);
      if (p.exists()) profile = p.data();
      isAdmin = a.exists();
    } catch (err) {
      // Profil okunamazsa kullanıcı adı e-postadan gösterilir
    }
  }
  renderTab();
});

// Firebase oturumu bildirmeden de sekme hemen görünsün (oturum açıksa birazdan kullanıcı adına döner)
renderTab();

// Dil değişince sekme ve açık pencere yeniden yazılır
document.addEventListener("langchange", () => {
  renderTab();
  if (dialog.open) renderDialog();
});
