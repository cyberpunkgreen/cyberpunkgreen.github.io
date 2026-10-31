// Hesap sistemi (Firebase). Sağ üstteki sekmede "Giriş Yap · Hesap Oluştur"; giriş yapılınca rozet + kullanıcı adı (profil sayfası) ve "Çıkış Yap".
// Kullanıcı adları arka planda iç bir e-posta adresine çevrilir (kullaniciadi@<proje>.firebaseapp.com); şifreleri Firebase hash'leyerek saklar.
// Veri (kurallar: Planning/Firestore-Kurallari.txt):
//   users/{uid}    gizli: { username, usernameLower, gmStatus: "none" | "pending" | "approved", createdAt } (kişinin kendisi ve yöneticiler okur)
//   profiles/{uid} herkese açık: { username, color, badges, badge, lastPlayed? }
//                  color: isim ve kutu rengi · badges: yöneticinin verdiği rozetler (["vip"]) · badge: takılı rozet (yoksa null)
//                  lastPlayed: son katıldığı oturum (Aktif Oyuncu rozeti için; oturum sistemi gelince yazılacak)
//   feedback/{id}  geri bildirimler: { uid, username, version, text, createdAt } (herkes okur, üyeler yazar, yöneticiler siler)
//   shops/{uid}    GM'lerin kaydettiği dükkanlar: { list: [{ id, name, theme, savedAt, data }] } (yalnızca sahibi okur ve yazar)
//   tables/{id}    masalar: { gm, gmName, name, desc, members: [uid], names: { uid: ad }, open, lastActive, createdAt } (GM'i ve üyeleri okur)
//   tables/{id}/sheets/{kağıt} masadaki karakter kağıtları; owner kağıdı kullanan üyedir (yoksa null), AI oyuncunun kağıdında controller onu yöneten hesaptır
//   readyChars/{id}: hazır karakterler { name, role, data, savedAt } (üyeler okur, yöneticiler yazar; Karakter Oluştur'un son adımından eklenir, Hazır Karakterler sayfasından kaldırılır)
//   tables/{id}.code ve roomCodes/{kod}: { table, gm } oda kodu · tables/{id}/joins/{uid}: { code } kodla katılanın bileti (kurallar kodu buradan doğrular)
//   Realtime Database (kurallar: Planning/Realtime-Database-Kurallari.txt), rooms/{masa}: canlı oda verisi. Kurallar Firestore'u okuyamadığı için GM üyeleri meta'ya yazar.
//     meta: { gm, members: { uid: true } } · objects/{id}: herkesin gördüğü objeler · secret/{id}: gizli objeler (yalnızca GM okur) · fog: { base, shapes: { id: şekil } }
//     users/{uid}: { name, color, online, sheet, ai?, owner? } (AI oyuncular: users/drone-…, owner onları ekleyen hesap) · rolls/{id}: zarlar · settings: { sheetNames } · camera: GM'in çektiği görüş · kick/{uid} · assign/{uid}: kağıdı değişene haber
//     moving/{uid}: { color, items: { obje: { x, y, w, h, rot } } } o an taşınan objeler · turns: oyunculara görünen tur sırası · turnsAll: gizliler dahil bütün sıra (yalnızca GM okur)
//     meta.code: oda kodu. Kodu bilen üye kendini meta/members altına kodla yazabilir.
//   notifications/{uid} bildirimlerin görülme işareti: { seenAt } (görülen en yeni bildirimin zamanı; yalnızca sahibi okur ve yazar)
//   admins/{uid}   yöneticiler; yalnızca Firebase panelinden yazılır.
// Ayrıca profil (#profil/…), yönetim (#yonetim/…) ve geri bildirim (#geri-bildirim) sayfalarını, dükkan oluşturucunun
// sol panelindeki kayıtlı dükkanları dolduran araçları TOOLS'a ekler.

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
  onSnapshot,
  arrayUnion,
  arrayRemove,
  deleteField,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import {
  getDatabase,
  ref as dbRef,
  get as dbGet,
  set as dbSet,
  update as dbUpdate,
  remove as dbRemove,
  push as dbPush,
  onValue,
  onDisconnect,
  query as dbQuery,
  limitToLast,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6fuOnyp_2-qxjDRLRA2vJGpW8qZJUF-M",
  authDomain: "cybergreen-9539c.firebaseapp.com",
  projectId: "cybergreen-9539c",
  storageBucket: "cybergreen-9539c.firebasestorage.app",
  messagingSenderId: "530477870448",
  appId: "1:530477870448:web:6509d9c7361c7510cb73b5",
  databaseURL: "https://cybergreen-9539c-default-rtdb.europe-west1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

const EMAIL_DOMAIN = "cybergreen-9539c.firebaseapp.com";
const USERNAME_RE = /^[A-Za-z0-9_.-]{3,20}$/;
const MIN_PASSWORD = 8;
const MAX_FEEDBACK = 2000;
const CHAR_LIMITS = { member: 3, vip: 6, gm: 8 }; // kaydedilebilecek en fazla karakter; yöneticilerde sınır yok (kurallarda da aynı sınırlar)
const SHOPS_PER_THEME = 10; // bir GM'in her dükkan türü için kaydedebileceği en fazla dükkan (kurallarda toplam 40)
const MAX_TABLES = 10; // bir GM'in en fazla masa sayısı
const MAX_PLAYERS = 12; // bir masadaki en fazla oyuncu (kurallarla aynı)

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
//   admin: yöneticiler (yöneticiler bütün rozetleri takabilir) · gm: onaylı GM'ler (onaylanınca kendiliğinden takılır)
//   vip, ai: yöneticinin verdiği · active: son ACTIVE_DAYS gün içinde bir oturuma katılanlar
//   ai: yapay zekâ hesabı. Odada AI Oyuncular panelini görür ve oda içinde geçici AI oyuncular ekler (bunlar hesap değildir).
// Sıra profildeki sıradır. İkonlar 32×32, arka planı saydam; .bf parçaları adın renginin açık tonuyla dolar.
const BADGES = ["admin", "gm", "vip", "ai", "active"];
const ACTIVE_DAYS = 7;
const BADGE_SVG = {
  // Ban tokmağı: çaprazlama tokmak başı ve sap
  admin:
    '<g transform="translate(-2.6 2.6) rotate(45 16 16)"><rect class="bf" x="7" y="2.5" width="18" height="9" rx="1.5"/>' +
    '<path d="M11 2.5v9M21 2.5v9"/><rect x="14.5" y="11.5" width="3" height="18" rx="1.2"/></g>',
  // d20: altıgen gövde, ortada üst yüz, çevresinde yan yüzler
  gm:
    '<path d="M16 1.5 28.6 8.75v14.5L16 30.5 3.4 23.25V8.75Z"/><path class="bf" d="M16 8l7.6 13H8.4Z"/>' +
    '<path d="M16 1.5V8M3.4 8.75 16 8l12.6.75M3.4 8.75 8.4 21l-5 2.25M8.4 21 16 30.5l7.6-9.5M28.6 8.75 23.6 21l5 2.25"/>',
  // Üç uçlu taç
  vip:
    '<path class="bf" d="M4 24V10l6.5 7L16 6l5.5 11L28 10v14Z"/><rect x="4" y="24.5" width="24" height="4" rx="1"/>' +
    '<circle class="bf" cx="4" cy="8" r="2"/><circle class="bf" cx="16" cy="4" r="2"/><circle class="bf" cx="28" cy="8" r="2"/>',
  // İşlemci çipi
  ai:
    '<rect class="bf" x="8" y="8" width="16" height="16" rx="2"/><path d="M12 8V3M20 8V3M12 29v-5M20 29v-5M8 12H3M8 20H3M29 12h-5M29 20h-5"/>' +
    '<path d="M11.5 20.5 14 12l2.5 8.5M12.4 18h3.2M20 12v8.5"/>',
  // Beş köşeli yıldız
  active: '<path class="bf" d="M16 2.5l3.5 9.7 10.3.3-8.1 6.4 2.8 9.8L16 23l-8.5 5.7 2.8-9.8-8.1-6.4 10.3-.3Z"/>',
};

// titled: imleç üstüne gelince tarayıcının kendi ipucu çıksın mı (profildeki rozet düğmelerinin kendi ipucu var)
const badgeIcon = (id, titled = true) => {
  const name = T().badgeNames[id];
  return `<svg class="ubadge" viewBox="0 0 32 32" role="img" aria-label="${name}">${titled ? `<title>${name}</title>` : ""}${BADGE_SVG[id]}</svg>`;
};
const hasBadge = (p, id) => ((p && p.badges) || []).includes(id);
const hasVip = (p) => hasBadge(p, "vip");
const activeOk = (p) => !!(p && p.lastPlayed && p.lastPlayed.toMillis && Date.now() - p.lastPlayed.toMillis() < ACTIVE_DAYS * 864e5);
// Takılı rozet. Kimin neyi takabileceği yazılırken denetlenir (Firestore kuralları, canWear; yöneticiler her rozeti takabilir),
// burada kayıtlı olan gösterilir. Süresi dolan Aktif Oyuncu ve geri alınan VIP girişte çıkarılır (onAuthStateChanged).
const wornBadge = (p) => (p && BADGE_SVG[p.badge] ? p.badge : null);
// Rozet + (varsa ara kutucuk, örn. hesap listesindeki GM etiketi) + kullanıcı adı; renk dıştaki öğeden gelir
const nameHtml = (name, p, mid = "") => {
  const b = wornBadge(p);
  return `<span class="uname">${b ? badgeIcon(b) : ""}${mid}<span>${esc(name)}</span></span>`;
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
    working: "Bekle…", close: "Kapat", yes: "Evet", no: "Hayır",
    badges: { gm: "GM", pending: "GM · onay bekliyor" },
    // Profil
    profile: "Profil", adminCrumb: "Yönetim", notFound: "Böyle bir kullanıcı bulunamadı.",
    gmRow: "GM", colorRow: "Renk", badgesRow: "Rozetler",
    badgeNames: { admin: "Yönetici Rozeti", gm: "GM Rozeti", vip: "VIP Rozeti", ai: "AI Rozeti", active: "Aktif Oyuncu Rozeti" },
    badgeHints: {
      admin: "Site yöneticilerine verilir.",
      gm: "Onaylı GM hesaplarına verilir.",
      vip: "Site yöneticisi verir.",
      ai: "Yapay zekâ hesapları içindir, site yöneticisi verir.",
      active: `Son ${ACTIVE_DAYS} gün içinde bir oturuma katılanlar takabilir.`,
    },
    gmNone: "GM değil.", gmPending: "GM başvurusu inceleniyor.", gmApproved: "GM hesabı.",
    gmApply: "GM başvurusu yap", gmCancel: "Başvuruyu iptal et",
    approve: "Onayla", reject: "Reddet", gmMake: "GM yap", revoke: "GM yetkisini al",
    vipGrant: "VIP ver", vipRevoke: "VIP'i al", aiGrant: "AI ver", aiRevoke: "AI'ı al",
    joinCode: "Kodla Katıl", codePlaceholder: "Oda kodu", badCode: "Bu kodla bir masa yok.",
    colorNames: { red: "Kırmızı", yellow: "Sarı", blue: "Mavi", green: "Yeşil", white: "Beyaz", orange: "Turuncu", pink: "Pembe", purple: "Mor" },
    // Yönetim
    adminOnly: "Bu sayfa yalnızca yöneticiler içindir.", loading: "Yükleniyor…",
    noAccounts: "Kayıtlı hesap yok.", viewProfile: "Profili gör", noPending: "Onay bekleyen GM başvurusu yok.", approved: "Onaylandı", rejected: "Reddedildi",
    // Kayıtlı dükkanlar
    savedShops: "Kayıtlı Dükkanlar", noShops: "Kayıtlı dükkan yok.", del: "Sil",
    demoRoom: "Deneme Odası",
    savedChars: "Kayıtlı Karakterler", noChars: "Kayıtlı karakter yok.",
    charLoadAsk: (n) => `“${n}” yüklensin mi? Şu anki taslağın yerini alır.`,
    charDeleteAsk: (n) => `“${n}” silinsin mi?`,
    charSaved: (n) => `“${n}” kaydedildi.`,
    charsFull: (n) => `En fazla ${n} karakter kaydedebilirsin. Yer açmak için soldaki listeden birini sil.`,
    loadAsk: (n) => `“${n}” dükkanı yüklensin mi?`,
    deleteAsk: (n) => `“${n}” dükkanı silinsin mi?`,
    overwriteAsk: (n) => `“${n}” adında bir dükkan zaten var. Üzerine yazılsın mı?`,
    shopNameNeeded: "Dükkana bir isim ver.",
    shopsFull: `Bu türde en fazla ${SHOPS_PER_THEME} dükkan kaydedilebilir. Yer açmak için soldaki listeden birini sil.`,
    shopSaved: (n) => `“${n}” kaydedildi.`,
    // Masalar
    createTable: "Masa Oluştur", myTables: "Masalarım", myGames: "Oyunlarım",
    tableName: "Masa adı", tableDesc: "Açıklama", create: "Oluştur",
    tCol: "Masa", playersCol: "Oyuncu", statusCol: "Durum", gmCol: "GM", open: "Açık", closed: "Kapalı",
    noTables: "Henüz masan yok.", noGames: "Henüz bir masaya eklenmedin. Bir GM seni masasına eklediğinde burada görünür.",
    players: "Oyuncular", noPlayers: "Henüz oyuncu yok.", noDesc: "Açıklama yok.",
    addPlayer: "Oyuncu ekle", addPlaceholder: "Kullanıcı adı", add: "Ekle", removePlayer: "Masadan çıkar",
    enter: "Gir", join: "Katıl", joinHint: "GM masayı açınca katılabilirsin.",
    deleteTitle: "Masayı Sil", deleteText: (n) => `Bu işlem geri alınamaz. Silmek için masanın adını yaz: “${n}”`,
    tableNameNeeded: "Masaya bir isim ver.", tooManyTables: `En fazla ${MAX_TABLES} masan olabilir.`, tooManyPlayers: `Bir masada en fazla ${MAX_PLAYERS} oyuncu olabilir.`,
    noSuchUser: "Böyle bir kullanıcı yok. Büyük ve küçük harflere dikkat et.", alreadyIn: "Bu kullanıcı zaten masada.", notSelf: "Kendini oyuncu olarak ekleyemezsin.",
    room: "Masa", roomSoon: "Masa simülasyonu yapım aşamasında. Bu sayfada kaldığın sürece masa açık kalır.",
    leave: "Masadan Çık", closeTable: "Masayı Kapat", backToTables: "Masalara Dön",
    tableGone: "Bu masa bulunamadı ya da üyesi değilsin.", tableClosed: "Masa şu an kapalı. GM açınca katılabilirsin.", memberOnly: "Masalar yalnızca üyelere açıktır.",
    // Geri bildirim
    fbIntro: "Sistemle ilgili gördüğün sorunları, önerilerini ve fikirlerini buraya yazabilirsin.",
    fbVersion: "Sürüm", fbPlaceholder: "Geri bildirimini yaz…", fbSend: "Gönder", fbLogin: "Geri bildirim yazmak için giriş yapmalısın.",
    fbEmpty: "Henüz geri bildirim yok.", fbDelete: "Sil", fbConfirm: "Bu geri bildirim silinsin mi?", fbTooLong: `En fazla ${MAX_FEEDBACK} karakter.`,
    // Bildirimler
    notifs: "Bildirimler", notifsNew: (n) => `Bildirimler (${n} yeni)`, noNotifs: "Henüz Bildirim Yok", justNow: "az önce",
    nFeedback: (name) => `${name} yeni bir geri bildirim yazdı`,
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
    working: "Wait…", close: "Close", yes: "Yes", no: "No",
    badges: { gm: "GM", pending: "GM · awaiting approval" },
    profile: "Profile", adminCrumb: "Admin", notFound: "No such user.",
    gmRow: "GM", colorRow: "Color", badgesRow: "Badges",
    badgeNames: { admin: "Admin Badge", gm: "GM Badge", vip: "VIP Badge", ai: "AI Badge", active: "Active Player Badge" },
    badgeHints: {
      admin: "Given to site admins.",
      gm: "Given to approved GM accounts.",
      vip: "Given by a site admin.",
      ai: "For AI accounts, given by a site admin.",
      active: `Worn by those who joined a session in the last ${ACTIVE_DAYS} days.`,
    },
    gmNone: "Not a GM.", gmPending: "GM application under review.", gmApproved: "GM account.",
    gmApply: "Apply as GM", gmCancel: "Cancel application",
    approve: "Approve", reject: "Reject", gmMake: "Make GM", revoke: "Revoke GM",
    vipGrant: "Grant VIP", vipRevoke: "Revoke VIP", aiGrant: "Grant AI", aiRevoke: "Revoke AI",
    joinCode: "Join with Code", codePlaceholder: "Room code", badCode: "No table has this code.",
    colorNames: { red: "Red", yellow: "Yellow", blue: "Blue", green: "Green", white: "White", orange: "Orange", pink: "Pink", purple: "Purple" },
    adminOnly: "This page is for admins only.", loading: "Loading…",
    noAccounts: "No accounts yet.", viewProfile: "View profile", noPending: "No GM applications waiting for approval.", approved: "Approved", rejected: "Rejected",
    savedShops: "Saved Shops", noShops: "No saved shops.", del: "Delete",
    demoRoom: "Test Room",
    savedChars: "Saved Characters", noChars: "No saved characters.",
    charLoadAsk: (n) => `Load “${n}”? It replaces your current draft.`,
    charDeleteAsk: (n) => `Delete “${n}”?`,
    charSaved: (n) => `“${n}” saved.`,
    charsFull: (n) => `You can save at most ${n} characters. Delete one from the list on the left to make room.`,
    loadAsk: (n) => `Load the shop “${n}”?`,
    deleteAsk: (n) => `Delete the shop “${n}”?`,
    overwriteAsk: (n) => `A shop named “${n}” already exists. Overwrite it?`,
    shopNameNeeded: "Give the shop a name.",
    shopsFull: `At most ${SHOPS_PER_THEME} shops of this type can be saved. Delete one from the list on the left to make room.`,
    shopSaved: (n) => `“${n}” saved.`,
    createTable: "Create Table", myTables: "My Tables", myGames: "My Games",
    tableName: "Table name", tableDesc: "Description", create: "Create",
    tCol: "Table", playersCol: "Players", statusCol: "Status", gmCol: "GM", open: "Open", closed: "Closed",
    noTables: "You don't have any tables yet.", noGames: "You haven't been added to a table yet. It shows up here once a GM adds you to their table.",
    players: "Players", noPlayers: "No players yet.", noDesc: "No description.",
    addPlayer: "Add player", addPlaceholder: "Username", add: "Add", removePlayer: "Remove from table",
    enter: "Enter", join: "Join", joinHint: "You can join once the GM opens the table.",
    deleteTitle: "Delete Table", deleteText: (n) => `This can't be undone. To delete it, type the table's name: “${n}”`,
    tableNameNeeded: "Give the table a name.", tooManyTables: `You can have at most ${MAX_TABLES} tables.`, tooManyPlayers: `A table can have at most ${MAX_PLAYERS} players.`,
    noSuchUser: "No such user. Mind the upper and lower case letters.", alreadyIn: "That user is already at the table.", notSelf: "You can't add yourself as a player.",
    room: "Table", roomSoon: "The tabletop simulation is under construction. The table stays open while you stay on this page.",
    leave: "Leave Table", closeTable: "Close Table", backToTables: "Back to Tables",
    tableGone: "This table doesn't exist or you're not a member.", tableClosed: "The table is closed right now. You can join once the GM opens it.", memberOnly: "Tables are only open to members.",
    fbIntro: "Write any problems you've found, suggestions or ideas about the system here.",
    fbVersion: "Version", fbPlaceholder: "Write your feedback…", fbSend: "Send", fbLogin: "You need to log in to write feedback.",
    fbEmpty: "No feedback yet.", fbDelete: "Delete", fbConfirm: "Delete this feedback?", fbTooLong: `At most ${MAX_FEEDBACK} characters.`,
    notifs: "Notifications", notifsNew: (n) => `Notifications (${n} new)`, noNotifs: "No Notifications Yet", justNow: "just now",
    nFeedback: (name) => `${name} wrote new feedback`,
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

const canGm = () => isAdmin || gmStatusOf(account) === "approved";

function errorText(err) {
  const t = T().errors;
  const code = (err && err.code) || "";
  if (code === "auth/email-already-in-use") return t.taken;
  if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found", "auth/invalid-login-credentials"].includes(code)) return t.wrong;
  if (code === "auth/too-many-requests") return t.tooMany;
  if (code === "auth/network-request-failed" || code === "unavailable") return t.network;
  if (code === "auth/weak-password") return t.password;
  if (code === "permission-denied" || code === "PERMISSION_DENIED") return t.denied;
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
    // Ad sekmede beyaz kalır; yalnızca rozet profil renginde. Adın solunda bildirim zili.
    const worn = wornBadge(profile);
    tab.innerHTML =
      bellHtml() +
      `<button type="button" class="auth-user" data-profile="${esc(name)}">${worn ? `<span style="color: ${colorOf(profile)}">${badgeIcon(worn)}</span>` : ""}${esc(name)}</button>` +
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
  else if (b.dataset.action === "notifs") toggleNotifs();
  else if (b.dataset.profile) location.hash = `#profil/${encodeURIComponent(b.dataset.profile)}`;
  else if (b.dataset.action === "admin") location.hash = inAdmin() ? "" : "#yonetim/hesaplar";
  else if (b.dataset.action === "logout") {
    if (inAdmin()) location.hash = "";
    signOut(auth);
  }
});

window.addEventListener("hashchange", () => {
  if (user) renderTab();
});

// ---------- Bildirimler: sekmede adın solundaki zil ----------
// Zile basınca altında bildirim listesi açılır; açılınca bildirimler görülmüş sayılır ve zildeki sayı söner.
// Görülmemiş bildirimler o açılışta vurgulu kalır. Şimdilik tek tür var: yöneticilere yeni geri bildirim
// (feedback koleksiyonu canlı dinlenir, kişinin kendi yazdıkları hariç); yenisi gelince zil çalar.
// Görülme işareti notifications/{uid} belgesinde ve tarayıcıda durur; kural yayımlanmadıysa tarayıcıdaki kullanılır.

const NOTIF_LIMIT = 20;
const BELL_SVG =
  '<svg class="nf-bell-ic" viewBox="0 0 24 24" aria-hidden="true"><path class="bf" d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.8 2H4.2Z"/>' +
  '<path d="M10 21.2a2 2 0 0 0 4 0M12 3v2"/></svg>';

let notifs = []; // [{ id, kind: "feedback", at (ms), ts, uid, name, text, version }], en yenisi başta
let notifSeen = null; // görülen en yeni bildirimin zamanı (ms); null = hiç işaretlenmemiş
let notifFresh = new Set(); // açık listede yeni diye vurgulananlar
let notifStops = [];
let notifRun = 0; // her oturum değişiminde artar; eski oturumun geç gelen yanıtları yok sayılır
const notifProfs = new Map(); // bildirimdeki kişilerin herkese açık profilleri (ad rengi ve rozet)
let fbFocus = null; // geri bildirim sayfası açılınca gösterilecek yazı

const seenKey = () => `cg-notif-seen:${user.uid}`;
const isUnread = (n) => notifSeen == null || n.at > notifSeen;
const unreadCount = () => notifs.filter(isUnread).length;

const panel = document.createElement("div");
panel.className = "nf-panel";
panel.id = "nf-panel";
panel.hidden = true;
document.body.appendChild(panel);

function bellHtml() {
  const t = T();
  const n = unreadCount();
  return (
    `<button type="button" class="nf-bell${n ? " on" : ""}" data-action="notifs" aria-haspopup="true" aria-controls="nf-panel" ` +
    `aria-expanded="${!panel.hidden}" aria-label="${n ? t.notifsNew(n) : t.notifs}">${BELL_SVG}${n ? `<span class="nf-count">${n > 9 ? "9+" : n}</span>` : ""}</button>`
  );
}

// ring: yeni bildirim geldi, zil sallanır
function renderBell(ring) {
  const b = tab.querySelector(".nf-bell");
  if (!b) return;
  b.outerHTML = bellHtml();
  if (ring) tab.querySelector(".nf-bell").classList.add("ring");
}

function timeAgo(ms) {
  const lng = curLang();
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 60) return T().justNow;
  // "dün" dışında hep sayıyla ("evvelsi gün" değil, "2 gün önce")
  const ago = (n, unit) => new Intl.RelativeTimeFormat(lng, { numeric: n === 1 && unit === "day" ? "auto" : "always" }).format(-n, unit);
  if (s < 3600) return ago(Math.floor(s / 60), "minute");
  if (s < 86400) return ago(Math.floor(s / 3600), "hour");
  if (s < 7 * 86400) return ago(Math.floor(s / 86400), "day");
  return new Date(ms).toLocaleDateString(lng === "tr" ? "tr-TR" : "en-GB");
}

function notifItem(n) {
  const t = T();
  const p = notifProfs.get(n.uid);
  const snip = n.text.length > 120 ? `${n.text.slice(0, 120).trimEnd()}…` : n.text;
  return `<a class="nf-item${notifFresh.has(n.id) ? " new" : ""}" href="#geri-bildirim" data-fb="${n.id}">
      <span class="nf-text">${t.nFeedback(`<span class="nf-name" style="color: ${colorOf(p)}">${nameHtml(n.name, p)}</span>`)}</span>
      <span class="nf-snip">${esc(snip)}</span>
      <span class="nf-meta">V${esc(n.version)} · ${timeAgo(n.at)}</span>
    </a>`;
}

function renderNotifs() {
  const t = T();
  panel.setAttribute("aria-label", t.notifs);
  panel.innerHTML =
    `<div class="nf-head">${t.notifs}</div>` +
    `<div class="nf-scroll">${notifs.length ? notifs.map(notifItem).join("") : `<p class="nf-empty">${t.noNotifs}</p>`}</div>`;
}

function saveSeen(n) {
  notifSeen = n.at;
  try {
    localStorage.setItem(seenKey(), String(n.at));
  } catch (e) {
    // tarayıcı depolaması kapalıysa yalnızca hesaba yazılır
  }
  setDoc(doc(db, "notifications", user.uid), { seenAt: n.ts }).catch(() => {});
}

// Sekme sayfayla birlikte kaydığı için pencere de sayfaya göre, sekmenin hemen altına konur
const placeNotifs = () => (panel.style.top = `${tab.offsetTop + tab.offsetHeight + 6}px`);

function openNotifs() {
  notifFresh = new Set(notifs.filter(isUnread).map((n) => n.id));
  renderNotifs();
  panel.hidden = false;
  placeNotifs();
  if (notifFresh.size) saveSeen(notifs[0]);
  renderBell();
}

function closeNotifs() {
  if (panel.hidden) return;
  panel.hidden = true;
  notifFresh = new Set();
  renderBell();
}

const toggleNotifs = () => (panel.hidden ? openNotifs() : closeNotifs());

// Pencere dışına tıklanınca, Esc'ye basınca ya da sayfa değişince kapanır. Zil tıklamada yeniden çizildiği için
// tıklamanın zilden gelip gelmediğine olayın yolundan bakılır.
document.addEventListener("click", (e) => {
  if (!panel.hidden && !e.composedPath().some((x) => x === panel || (x.classList && x.classList.contains("nf-bell")))) closeNotifs();
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || panel.hidden) return;
  closeNotifs();
  const b = tab.querySelector(".nf-bell");
  if (b) b.focus();
});
window.addEventListener("hashchange", closeNotifs);
window.addEventListener("resize", () => !panel.hidden && placeNotifs());

// Geri bildirim bildirimine tıklanınca sayfası açılır ve o yazı gösterilir
panel.addEventListener("click", (e) => {
  const a = e.target.closest("[data-fb]");
  if (!a) return;
  e.preventDefault();
  fbFocus = a.dataset.fb;
  closeNotifs();
  if (location.hash === "#geri-bildirim") rerender();
  else location.hash = "#geri-bildirim";
});

function loadNotifProfs() {
  const missing = [...new Set(notifs.map((n) => n.uid))].filter((u) => !notifProfs.has(u));
  if (!missing.length) return;
  for (const u of missing) notifProfs.set(u, null);
  Promise.all(
    missing.map((u) =>
      getDoc(doc(db, "profiles", u))
        .then((s) => notifProfs.set(u, s.exists() ? s.data() : null))
        .catch(() => {})
    )
  ).then(() => !panel.hidden && renderNotifs());
}

function stopNotifs() {
  notifRun++;
  for (const f of notifStops) f();
  notifStops = [];
  closeNotifs();
  notifs = [];
  notifSeen = null;
}

async function startNotifs() {
  const run = notifRun;
  const uid = user.uid;
  let local = null;
  try {
    local = Number(localStorage.getItem(seenKey())) || null;
  } catch (e) {
    // depolama kapalı
  }
  const remote = await getDoc(doc(db, "notifications", uid))
    .then((s) => {
      const at = s.exists() && s.data().seenAt;
      return at && at.toMillis ? at.toMillis() : null;
    })
    .catch(() => null);
  if (run !== notifRun) return;
  notifSeen = Math.max(local || 0, remote || 0) || null;
  if (!isAdmin) return;
  const unsub = onSnapshot(
    query(collection(db, "feedback"), orderBy("createdAt", "desc"), limit(NOTIF_LIMIT)),
    (snap) => {
      const before = unreadCount();
      notifs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.uid !== uid && p.createdAt && p.createdAt.toMillis)
        .map((p) => ({ id: p.id, kind: "feedback", at: p.createdAt.toMillis(), ts: p.createdAt, uid: p.uid, name: p.username, text: p.text, version: p.version }));
      // Zil ilk kez kurulurken eski geri bildirimler yeni sayılmaz
      if (notifSeen == null && notifs.length) saveSeen(notifs[0]);
      // Pencere açıkken gelen bildirim listede vurgulanır ve hemen görülmüş sayılır
      if (!panel.hidden && unreadCount()) {
        for (const n of notifs.filter(isUnread)) notifFresh.add(n.id);
        saveSeen(notifs[0]);
      }
      loadNotifProfs();
      renderBell(unreadCount() > before);
      if (!panel.hidden) renderNotifs();
    },
    () => {}
  );
  notifStops.push(unsub);
}

// ---------- Giriş ve kayıt pencereleri (arka plan kararır) ----------

const dialog = document.createElement("dialog");
dialog.className = "auth-dialog";
document.body.appendChild(dialog);
let view = null; // "login" | "register"

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

// ---------- Onay penceresi ("… yüklensin mi?") ----------
// Tarayıcının kendi confirm kutusu yerine sitenin pencere görünümü. Evet → true; Hayır, Esc ya da dışarı tıklamak → false.

const confirmBox = document.createElement("dialog");
confirmBox.className = "auth-dialog cg-confirm";
document.body.appendChild(confirmBox);
confirmBox.addEventListener("click", (e) => {
  if (e.target === confirmBox) confirmBox.close();
});

function askConfirm(text) {
  const t = T();
  return new Promise((resolve) => {
    confirmBox.innerHTML = `
      <form class="auth-panel" method="dialog">
        <p class="cg-confirm-text">${esc(text)}</p>
        <div class="cg-confirm-actions">
          <button type="submit" value="no" class="prof-btn">${t.no}</button>
          <button type="submit" value="yes" class="auth-submit">${t.yes}</button>
        </div>
      </form>`;
    confirmBox.returnValue = "";
    confirmBox.addEventListener("close", () => resolve(confirmBox.returnValue === "yes"), { once: true });
    confirmBox.showModal();
    confirmBox.querySelector('[value="yes"]').focus();
  });
}

// ---------- Profil sayfası: #profil/<ad> (yönetimden açılınca #yonetim/profil/<ad>, üst menü yönetimde kalır) ----------
// Kendi profilinde: GM başvurusu yap / iptal et, renk ve rozet seç.
// Yönetici her profilde (kendisininkinde de): GM verir / alır, başvuruyu onaylar / reddeder, rengi ve takılı rozeti değiştirir, VIP verir / alır.

let shown = null; // açık profil: { uid, own, account, profile, admin (profil sahibi yönetici mi; bilinmiyorsa null) }
let profEl = null; // profil sayfasındaki araç kutusu

const profileName = () => decodeURIComponent(location.hash.replace(/^#(yonetim\/)?profil\//, ""));

async function mountProfile(el) {
  const t = T();
  profEl = el;
  shown = null;
  const name = profileName();
  el.innerHTML = `<div class="crumb">${inAdmin() ? t.adminCrumb : t.profile}</div><h1>${esc(name)}</h1><p class="auth-muted">${t.loading}</p>`;
  if (!authReady) return; // oturum durumu belli olunca sayfa yeniden çizilir
  const fail = (msg) => {
    if (profEl === el) el.querySelector(".auth-muted").outerHTML = msg;
  };
  try {
    const snap = await getDocs(query(collection(db, "profiles"), where("username", "==", name), limit(1)));
    if (profEl !== el) return;
    if (snap.empty) return fail(`<p class="placeholder">${t.notFound}</p>`);
    const uid = snap.docs[0].id;
    const own = !!user && user.uid === uid;
    let acc = own ? account : null;
    let adm = own ? isAdmin : null;
    // Gizli kayıt ve yöneticilik yalnızca yöneticiye açık
    if (!own && isAdmin) {
      const [a, ad] = await Promise.all([getDoc(doc(db, "users", uid)), getDoc(doc(db, "admins", uid)).catch(() => null)]);
      acc = a.exists() ? a.data() : null;
      adm = ad ? ad.exists() : null;
    }
    if (profEl !== el) return;
    shown = { uid, own, account: acc, profile: snap.docs[0].data(), admin: adm };
    renderProfile();
  } catch (err) {
    fail(`<p class="auth-error">${errorText(err)}</p>`);
  }
  el.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || !shown || b.getAttribute("aria-disabled") === "true") return;
    if (b.dataset.gm) setGm(b);
    else if (b.dataset.color) setColor(b);
    else if (b.dataset.badge) setBadge(b);
    else if (b.dataset.grant) setGrant(b);
  });
}

function renderProfile() {
  const t = T();
  const { own, account: acc, profile: p } = shown;
  const manage = isAdmin;
  const edit = own || manage;
  const color = COLORS[p.color] ? p.color : "green";
  const gm = gmStatusOf(acc);
  const worn = wornBadge(p);
  // Profil sahibi yönetici mi: yöneticilerde GM satırı ve VIP düğmesi olmaz (zaten bütün rozetlere sahipler)
  const ownerAdmin = shown.admin === true || (shown.admin == null && worn === "admin");
  const gmBtn = (status, label, neg) => `<button type="button" class="prof-btn${neg ? " neg" : ""}" data-gm="${status}">${label}</button>`;
  let gmHtml = "";
  if (!ownerAdmin && manage) {
    gmHtml =
      gm === "approved"
        ? `<span>${t.gmApproved}</span>${gmBtn("none", t.revoke, true)}`
        : gm === "pending"
          ? `<span>${t.gmPending}</span>${gmBtn("approved", t.approve)}${gmBtn("none", t.reject, true)}`
          : `<span>${t.gmNone}</span>${gmBtn("approved", t.gmMake)}`;
  } else if (!ownerAdmin && own) {
    gmHtml =
      gm === "approved"
        ? `<span>${t.gmApproved}</span>`
        : gm === "pending"
          ? `<span>${t.gmPending}</span>${gmBtn("none", t.gmCancel)}`
          : `<span>${t.gmNone}</span>${gmBtn("pending", t.gmApply)}`;
  }

  const swatches = Object.entries(COLORS)
    .map(
      ([k, hex]) =>
        `<button type="button" class="prof-swatch${k === color ? " on" : ""}" style="--sw: ${hex}"${edit ? ` data-color="${k}"` : " disabled"} title="${t.colorNames[k]}" aria-label="${t.colorNames[k]}" aria-pressed="${k === color}"></button>`
    )
    .join("");

  // Rozetler renk seçer gibi seçilir: takabildiği rozet kendi renginde, takamadığı gri. İmleç üstüne gelince nasıl alındığı yazar.
  // Yönetici rozeti yalnızca yöneticilerin profilinde görünür; yöneticiler bütün rozetleri takabilir.
  const can = (id) =>
    ownerAdmin ||
    (id === "gm" ? (acc ? gm === "approved" : worn === "gm") : id === "vip" || id === "ai" ? hasBadge(p, id) : id === "active" ? activeOk(p) : false);
  const tiles = BADGES.filter((id) => id !== "admin" || ownerAdmin)
    .map((id) => {
      const ok = can(id);
      const on = id === worn;
      return (
        `<button type="button" class="prof-bdg${on ? " on" : ""}${ok ? "" : " locked"}" data-badge="${id}" aria-pressed="${on}"${ok && edit ? "" : ' aria-disabled="true"'}>` +
        `${badgeIcon(id, false)}<span class="prof-tip" role="tooltip"><b>${t.badgeNames[id]}</b>${t.badgeHints[id]}</span></button>`
      );
    })
    .join("");
  const grantBtn = (id, on, off) => `<button type="button" class="prof-btn${hasBadge(p, id) ? " neg" : ""}" data-grant="${id}">${hasBadge(p, id) ? on : off}</button>`;
  const vip = manage && !ownerAdmin ? grantBtn("vip", t.vipRevoke, t.vipGrant) + grantBtn("ai", t.aiRevoke, t.aiGrant) : "";

  const row = (label, body) => `<div class="prof-row"><b>${label}</b>${body}</div>`;
  profEl.innerHTML = `
    <div class="crumb">${inAdmin() ? t.adminCrumb : t.profile}</div>
    <h1 class="prof-title" style="color: ${COLORS[color]}">${nameHtml(p.username, p)}</h1>
    <div class="prof-card">
      ${gmHtml ? row(t.gmRow, `<div class="prof-gm">${gmHtml}</div>`) : ""}
      ${row(t.colorRow, `<div class="prof-swatches">${swatches}</div>`)}
      ${row(t.badgesRow, `<div class="prof-bdgs" style="--uc: ${COLORS[color]}">${tiles}${vip}</div>`)}
      <p class="auth-error" role="alert"></p>
    </div>`;
}

const profError = (err) => {
  const box = profEl && profEl.querySelector(".auth-error");
  if (box) box.textContent = errorText(err);
};

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

// Profilde bir şey değişince sayfa, kendi profiliyse sekme de güncellenir
function afterProfileChange(changes) {
  shown.profile = { ...shown.profile, ...changes };
  if (shown.own) {
    profile = { ...(profile || {}), ...changes };
    renderTab();
  }
  renderProfile();
}

async function setGm(btn) {
  const status = btn.dataset.gm;
  btn.disabled = true;
  try {
    const badge = await writeGm(shown.uid, status);
    shown.account = { ...(shown.account || {}), gmStatus: status };
    if (shown.own) {
      account = { ...(account || {}), gmStatus: status };
      publishRole();
    }
    afterProfileChange(badge === undefined ? {} : { badge });
  } catch (err) {
    btn.disabled = false;
    profError(err);
  }
}

async function setColor(btn) {
  const color = btn.dataset.color;
  try {
    await updateDoc(doc(db, "profiles", shown.uid), { color });
    afterProfileChange({ color });
  } catch (err) {
    profError(err);
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
    profError(err);
  }
}

async function setGrant(btn) {
  const id = btn.dataset.grant;
  const grant = !hasBadge(shown.profile, id);
  const badges = new Set(shown.profile.badges || []);
  if (grant) badges.add(id);
  else badges.delete(id);
  const changes = { badges: [...badges] };
  if (!grant && shown.profile.badge === id) changes.badge = null;
  btn.disabled = true;
  try {
    await updateDoc(doc(db, "profiles", shown.uid), changes);
    afterProfileChange(changes);
  } catch (err) {
    btn.disabled = false;
    profError(err);
  }
}

// ---------- Kayıtlı dükkanlar (yalnızca GM ve yöneticiler) ----------
// Dükkan oluşturucunun sol panelinde her dükkan türü bir satırdır; satıra tıklanınca o türde kaydedilen dükkanlar aşağı açılır.
// Bir dükkana tıklanınca "… yüklensin mi?" sorulur; evet denirse dükkan oluşturucuya yüklenir (window.CG_SHOP_LOAD, js/tools.js).
// Kaydetme düğmesi oluşturulan dükkan listesinin altındadır ve window.CG_STORE.saveShop'u çağırır.
// Bütün dükkanlar tek bir belgede durur (shops/{uid}); böylece liste tek okumayla gelir.

let myShops = null; // [{ id, name, theme, savedAt, data }]; null = henüz okunmadı
const openThemes = new Set(); // sol panelde açık duran dükkan türleri
let redrawShops = null;

async function loadShops() {
  const snap = await getDoc(doc(db, "shops", user.uid));
  myShops = snap.exists() ? snap.data().list || [] : [];
}

async function writeShops(list) {
  await setDoc(doc(db, "shops", user.uid), { list });
  myShops = list;
  if (redrawShops) redrawShops();
}

function mountShopSaves(el) {
  const t = T();
  const lng = curLang();
  redrawShops = null;
  if (!user || !canGm()) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `<div class="ss"><div class="toc-head">${t.savedShops}</div><div class="ss-body"><p class="auth-muted">${t.loading}</p></div></div>`;
  const body = el.querySelector(".ss-body");
  const chevron = typeof CHEVRON !== "undefined" ? CHEVRON : "";
  const draw = () => {
    if (!body.isConnected) return;
    body.innerHTML = SHOP_THEMES.map((th) => {
      const list = myShops.filter((s) => s.theme === th.id).sort((a, b) => b.savedAt - a.savedAt);
      const open = openThemes.has(th.id);
      return (
        `<div class="ss-theme${open ? " open" : ""}" data-theme="${th.id}">` +
        `<button type="button" class="ss-trigger" aria-expanded="${open}"><span>${th.name[lng]}</span><span class="ss-count">${list.length}</span>${chevron}</button>` +
        `<div class="ss-sub"><ul>${
          list.length
            ? list
                .map(
                  (s) =>
                    `<li><button type="button" class="ss-shop" data-id="${s.id}">${esc(s.name)}</button>` +
                    `<button type="button" class="ss-del" data-del="${s.id}" aria-label="${t.del}" title="${t.del}">×</button></li>`
                )
                .join("")
            : `<li class="ss-empty">${t.noShops}</li>`
        }</ul></div></div>`
      );
    }).join("");
  };
  redrawShops = draw;
  (myShops ? Promise.resolve() : loadShops()).then(draw).catch((err) => (body.innerHTML = `<p class="auth-error">${errorText(err)}</p>`));

  el.addEventListener("click", async (e) => {
    const trig = e.target.closest(".ss-trigger");
    if (trig) {
      const box = trig.parentElement;
      const open = !box.classList.contains("open");
      box.classList.toggle("open", open);
      trig.setAttribute("aria-expanded", open);
      open ? openThemes.add(box.dataset.theme) : openThemes.delete(box.dataset.theme);
      return;
    }
    const pick = e.target.closest(".ss-shop");
    if (pick) {
      const s = myShops.find((x) => x.id === pick.dataset.id);
      if (s && (await askConfirm(t.loadAsk(s.name))) && window.CG_SHOP_LOAD) window.CG_SHOP_LOAD(s.theme, s.data, s.name);
      return;
    }
    const del = e.target.closest(".ss-del");
    if (del) {
      const s = myShops.find((x) => x.id === del.dataset.del);
      if (!s || !(await askConfirm(t.deleteAsk(s.name)))) return;
      try {
        await writeShops(myShops.filter((x) => x !== s));
      } catch (err) {
        alert(errorText(err));
      }
    }
  });
}

// ---------- Kayıtlı karakterler: Araçlar › Karakter Oluştur ----------
// Üyeler 3, VIP'ler 6, GM'ler 8 karakter kaydeder, yöneticilerde sınır yoktur; karakterler sol panelde listelenir.
// Bir karaktere tıklanınca "… yüklensin mi?" sorulur; evet denirse oluşturucuya yüklenir (window.CG_CHAR_LOAD, js/charcreate.js).
// Kaydetme düğmesi Gözden Geçir aşamasındadır ve window.CG_STORE.saveChar'ı çağırır.
// Bütün karakterler tek bir belgede durur (characters/{uid}); böylece liste tek okumayla gelir.

let myChars = null; // [{ id, name, role, savedAt, data }]; null = henüz okunmadı
const charLimit = () => (isAdmin ? Infinity : gmStatusOf(account) === "approved" ? CHAR_LIMITS.gm : hasVip(profile) ? CHAR_LIMITS.vip : CHAR_LIMITS.member);
let redrawChars = null;

async function loadChars() {
  const snap = await getDoc(doc(db, "characters", user.uid));
  myChars = snap.exists() ? snap.data().list || [] : [];
}

async function writeChars(list) {
  await setDoc(doc(db, "characters", user.uid), { list });
  myChars = list;
  if (redrawChars) redrawChars();
}

function mountCharSaves(el) {
  const t = T();
  redrawChars = null;
  if (!user) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `<div class="ss"><div class="toc-head">${t.savedChars}</div><div class="ss-body"><p class="auth-muted">${t.loading}</p></div></div>`;
  const body = el.querySelector(".ss-body");
  const roleName = (c) => (typeof CLASSES !== "undefined" && (CLASSES.find((x) => x.id === c.role) || {}).name) || "";
  const draw = () => {
    if (!body.isConnected) return;
    const rows = [...myChars].sort((a, b) => b.savedAt - a.savedAt).map(
      (c) =>
        `<li><button type="button" class="ss-shop" data-id="${c.id}">${esc(c.name)}<small> · ${esc(roleName(c))}</small></button>` +
        `<button type="button" class="ss-del" data-del="${c.id}" aria-label="${t.del}" title="${t.del}">×</button></li>`
    );
    body.innerHTML = `<div class="ss-theme open"><div class="ss-sub"><ul>${rows.join("") || `<li class="ss-empty">${t.noChars}</li>`}</ul></div></div>`;
  };
  redrawChars = draw;
  (myChars ? Promise.resolve() : loadChars()).then(draw).catch((err) => (body.innerHTML = `<p class="auth-error">${errorText(err)}</p>`));

  el.addEventListener("click", async (e) => {
    const pick = e.target.closest(".ss-shop");
    if (pick) {
      const c = myChars.find((x) => x.id === pick.dataset.id);
      if (c && (await askConfirm(t.charLoadAsk(c.name))) && window.CG_CHAR_LOAD) window.CG_CHAR_LOAD(c);
      return;
    }
    const del = e.target.closest(".ss-del");
    if (del) {
      const c = myChars.find((x) => x.id === del.dataset.del);
      if (!c || !(await askConfirm(t.charDeleteAsk(c.name)))) return;
      try {
        await writeChars(myChars.filter((x) => x !== c));
      } catch (err) {
        alert(errorText(err));
      }
    }
  });
}

// Dükkan oluşturucu (js/tools.js) ve karakter oluşturucu (js/charcreate.js) kaydetmek için bunu çağırır. { ok, msg } döner.
window.CG_STORE = {
  canSaveShops: () => !!user && canGm(),
  canSaveChars: () => !!user,
  errorText,
  // Masa odası (js/room.js): masadaki karakter kağıdı kayıtlı karakterin kopyasıdır ve masaya aittir (tables/{masa}/sheets/{kağıt}).
  // owner: kağıdı kullanan üye (yoksa null); GM kağıtları üyeler arasında değiştirince eski kağıt masada kalır.
  async listChars() {
    if (!myChars) await loadChars();
    return myChars;
  },
  async listReadyChars() {
    const snap = await getDocs(collection(db, "readyChars"));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
  },
  saveReadyChar: ({ id, name, role, data }) => setDoc(doc(db, "readyChars", id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6)), { name, role, data, savedAt: Date.now() }),
  deleteReadyChar: (id) => deleteDoc(doc(db, "readyChars", id)),
  async getTableSheet(tableId) {
    const snap = await getDocs(query(collection(db, `tables/${tableId}/sheets`), where("owner", "==", user.uid), limit(1)));
    return snap.docs.length ? { ...snap.docs[0].data(), id: snap.docs[0].id } : null;
  },
  updateTableSheet: (tableId, sheetId, patch) => updateDoc(doc(db, `tables/${tableId}/sheets`, sheetId), patch),
  watchTableSheet: (tableId, sheetId, cb) => onSnapshot(doc(db, `tables/${tableId}/sheets`, sheetId), (snap) => snap.exists() && cb(snap.data())),
  async listTableSheets(tableId) {
    const snap = await getDocs(collection(db, `tables/${tableId}/sheets`));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
  },
  // owner verilmezse kağıt onu oluşturana aittir; null verilirse masada boşta durur (GM'in eklediği kağıtlar)
  // Oda kodu: yenisi eskisinin yerini alır, eski kod çalışmaz olur. Kod hem Firestore'a (masaya katılma) hem Realtime Database'e (odaya girme) yazılır.
  async setRoomCode(tableId, old) {
    const pick = crypto.getRandomValues(new Uint8Array(6));
    const code = [...pick].map((n) => CODE_LETTERS[n % CODE_LETTERS.length]).join("");
    const batch = writeBatch(db);
    if (old) batch.delete(doc(db, "roomCodes", old));
    batch.set(doc(db, "roomCodes", code), { table: tableId, gm: user.uid });
    batch.update(doc(db, "tables", tableId), { code });
    await batch.commit();
    await dbSet(dbRef(rtdb, `rooms/${tableId}/meta/code`), code);
    return code;
  },
  // Kodla masaya katılır, masanın kimliğini döndürür; kod geçersizse null
  async joinByCode(raw) {
    const code = raw.trim().toUpperCase();
    const snap = await getDoc(doc(db, "roomCodes", code));
    if (!snap.exists()) return null;
    const { table } = snap.data();
    const member = await getDoc(doc(db, "tables", table)).then((d) => d.exists(), () => false); // üyesi olunmayan masa okunamaz
    if (!member) {
      const batch = writeBatch(db);
      batch.set(doc(db, `tables/${table}/joins`, user.uid), { code });
      batch.update(doc(db, "tables", table), { members: arrayUnion(user.uid), [`names.${user.uid}`]: (account && account.username) || user.email.split("@")[0] });
      await batch.commit();
      await dbSet(dbRef(rtdb, `rooms/${table}/meta/members/${user.uid}`), code).catch(() => {}); // oda henüz hiç açılmadıysa GM girince yazılır
    }
    return table;
  },
  // Kağıdı bir üyeye verir; üyenin eski kağıdı sahipsiz olarak masada kalır
  async giveTableSheet(tableId, sheetId, uid, controller = null) {
    const path = `tables/${tableId}/sheets`;
    const had = await getDocs(query(collection(db, path), where("owner", "==", uid)));
    const batch = writeBatch(db);
    had.docs.filter((d) => d.id !== sheetId).forEach((d) => batch.update(doc(db, path, d.id), { owner: null, controller: null }));
    batch.update(doc(db, path, sheetId), { owner: uid, controller });
    await batch.commit();
  },
  roomNet,
  async createTableSheet(tableId, c, owner = user.uid) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const sheet = { owner, charId: c.id, name: c.name, role: c.role, level: c.data.seviye || 1, data: c.data, ...ccVitals(c.data) };
    await setDoc(doc(db, `tables/${tableId}/sheets`, id), sheet);
    return { ...sheet, id };
  },
  // Düşmanlar / NPC'ler (js/npc.js): GM'ler okur, yalnızca yöneticiler yazar (Firestore kuralları)
  async listNpcs() {
    const snap = await getDocs(collection(db, "npcs"));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
  },
  async saveNpc(id, data) {
    const key = id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await setDoc(doc(db, "npcs", key), data);
    return key;
  },
  deleteNpc: (id) => deleteDoc(doc(db, "npcs", id)),
  // Aynı kimlikle kaydedilen karakterin üzerine yazılır; kimlik yoksa ya da silinmişse yeni kayıt açılır
  async saveChar({ id, name, role, data }) {
    const t = T();
    if (!myChars) await loadChars();
    const same = myChars.find((c) => c.id === id);
    if (!same && myChars.length >= charLimit()) return { ok: false, msg: t.charsFull(charLimit()) };
    const entry = { id: same ? same.id : Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, role, savedAt: Date.now(), data };
    await writeChars(same ? myChars.map((c) => (c === same ? entry : c)) : [...myChars, entry]);
    return { ok: true, id: entry.id, msg: t.charSaved(name) };
  },
  async saveShop(name, theme, data) {
    const t = T();
    name = String(name || "").trim();
    if (!name) return { ok: false, msg: t.shopNameNeeded };
    if (!myShops) await loadShops();
    const same = myShops.find((s) => s.theme === theme && s.name.toLowerCase() === name.toLowerCase());
    if (same) {
      if (!(await askConfirm(t.overwriteAsk(name)))) return { ok: false, msg: "" };
    } else if (myShops.filter((s) => s.theme === theme).length >= SHOPS_PER_THEME) {
      return { ok: false, msg: t.shopsFull };
    }
    const entry = { id: same ? same.id : Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, theme, savedAt: Date.now(), data };
    openThemes.add(theme);
    await writeShops(same ? myShops.map((s) => (s === same ? entry : s)) : [...myShops, entry]);
    return { ok: true, msg: t.shopSaved(name) };
  },
};

// ---------- Masalar: Oyna › Cyberpunk Green ----------
// GM'ler (ve yöneticiler) "Masa Oluştur" ile masa açar, altında "Masalarım"ı görür; oyuncular üyesi oldukları masaları "Oyunlarım"da görür.
// Listeler açılır kartlı tablodur (en fazla 4,5 satır). Kartta açıklama, oyuncular ve düğmeler durur:
// GM'de Gir / Sil ve oyuncu ekle / çıkar; oyuncuda Katıl (yalnızca masa açıkken).
// Masa, GM girince açılır. İçerideki herkes dakikada bir "buradayım" yazar; 5 dakika boyunca kimse yazmazsa masa kapanmış sayılır.

const TABLE_IDLE_MS = 5 * 60 * 1000;
const TABLE_BEAT_MS = 60 * 1000;
const PLAY_PAGE = "#oyna/cyberpunk-green";
const CODE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // karışan harf ve rakamlar yok
const tableOpen = (tb) => !!(tb.open && tb.lastActive && tb.lastActive.toMillis && Date.now() - tb.lastActive.toMillis() < TABLE_IDLE_MS);

let tableStops = []; // masa listelerinin canlı dinleyicileri ve zamanlayıcıları
function stopTables() {
  for (const f of tableStops) f();
  tableStops = [];
}
let beatTimer = null; // masa sayfasındaki "buradayım" zamanlayıcısı
function stopBeat() {
  clearInterval(beatTimer);
  beatTimer = null;
}
window.addEventListener("hashchange", () => {
  if (location.hash !== PLAY_PAGE) stopTables();
  if (!location.hash.startsWith("#masa/")) stopBeat();
});

// Masa oluşturma ve silme pencereleri
const tableBox = document.createElement("dialog");
tableBox.className = "auth-dialog";
document.body.appendChild(tableBox);
tableBox.addEventListener("click", (e) => {
  if (e.target === tableBox || e.target.closest('[data-action="close"]')) tableBox.close();
});

function openCreateTable(count) {
  const t = T();
  tableBox.innerHTML = `
    <form class="auth-panel" novalidate>
      ${closeBtn()}
      <h2>${t.createTable}</h2>
      <label class="auth-field"><span>${t.tableName}</span><input name="name" type="text" maxlength="40" autocomplete="off" required></label>
      <label class="auth-field"><span>${t.tableDesc}</span><textarea name="desc" maxlength="500" rows="4"></textarea></label>
      <p class="auth-error" role="alert"></p>
      <button type="submit" class="auth-submit">${t.create}</button>
    </form>`;
  const form = tableBox.querySelector("form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = form.querySelector(".auth-error");
    const name = form.elements.name.value.trim();
    if (!name) return (err.textContent = t.tableNameNeeded);
    if (count >= MAX_TABLES) return (err.textContent = t.tooManyTables);
    const btn = form.querySelector(".auth-submit");
    btn.disabled = true;
    try {
      await addDoc(collection(db, "tables"), {
        gm: user.uid,
        gmName: (account && account.username) || user.email.split("@")[0],
        name,
        desc: form.elements.desc.value.trim(),
        members: [],
        names: {},
        open: false,
        lastActive: null,
        createdAt: serverTimestamp(),
      });
      tableBox.close();
    } catch (ex) {
      err.textContent = errorText(ex);
      btn.disabled = false;
    }
  });
  tableBox.showModal();
  form.elements.name.focus();
}

// Yanlışlıkla silinmesin diye masanın adı aynen yazılmadan Sil düğmesi açılmaz
function openDeleteTable(tb) {
  const t = T();
  tableBox.innerHTML = `
    <form class="auth-panel" novalidate>
      ${closeBtn()}
      <h2>${t.deleteTitle}</h2>
      <p class="cg-confirm-text">${t.deleteText(esc(tb.name))}</p>
      <label class="auth-field"><span>${t.tableName}</span><input name="name" type="text" autocomplete="off"></label>
      <p class="auth-error" role="alert"></p>
      <button type="submit" class="auth-submit tb-danger" disabled>${t.del}</button>
    </form>`;
  const form = tableBox.querySelector("form");
  const btn = form.querySelector(".auth-submit");
  form.elements.name.addEventListener("input", () => (btn.disabled = form.elements.name.value.trim() !== tb.name));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (btn.disabled) return;
    btn.disabled = true;
    try {
      // Masanın karakter kağıtları masayla birlikte gider
      const sheets = await getDocs(collection(db, `tables/${tb.id}/sheets`));
      await Promise.all(sheets.docs.map((d) => deleteDoc(doc(db, `tables/${tb.id}/sheets`, d.id))));
      const joins = await getDocs(collection(db, `tables/${tb.id}/joins`));
      await Promise.all(joins.docs.map((d) => deleteDoc(doc(db, `tables/${tb.id}/joins`, d.id))));
      if (tb.code) await deleteDoc(doc(db, "roomCodes", tb.code));
      await dbRemove(dbRef(rtdb, `rooms/${tb.id}`)).catch(() => {}); // hiç açılmamış masanın canlı verisi yoktur
      await deleteDoc(doc(db, "tables", tb.id));
      tableBox.close();
    } catch (ex) {
      form.querySelector(".auth-error").textContent = errorText(ex);
      btn.disabled = false;
    }
  });
  tableBox.showModal();
  form.elements.name.focus();
}

function mountTables(el, lng) {
  const t = T();
  stopTables();
  if (!authReady) {
    el.innerHTML = `<p class="auth-muted">${t.loading}</p>`;
    return;
  }
  if (!user) {
    el.innerHTML = `<p class="placeholder">${t.memberOnly}</p>`;
    return;
  }
  const gm = canGm();
  // GM'de Oyunlarım yalnızca başka bir GM'in masasına eklendiyse görünür
  el.innerHTML = `
    <form class="tb-join">
      <input type="text" name="code" maxlength="6" placeholder="${t.codePlaceholder}" aria-label="${t.codePlaceholder}" autocomplete="off" spellcheck="false">
      <button type="submit" class="prof-btn">${t.joinCode}</button>
      <p class="auth-error" role="alert"></p>
    </form>
    ${gm ? `<div class="tb-block" data-block="mine">
      <div class="tb-top">
        <button type="button" class="shop-go tb-create">${t.createTable}</button>
        <a class="prof-btn" href="#masa/deneme">${t.demoRoom}</a>
      </div>
      <h2 class="tb-title">${t.myTables}</h2>
      <div class="tb-list"><p class="auth-muted">${t.loading}</p></div>
    </div>` : ""}
    <div class="tb-block" data-block="games"${gm ? " hidden" : ""}>
      <h2 class="tb-title">${t.myGames}</h2>
      <div class="tb-list"><p class="auth-muted">${t.loading}</p></div>
    </div>`;

  const joinForm = el.querySelector(".tb-join");
  joinForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = joinForm.querySelector(".auth-error");
    msg.textContent = "";
    if (!joinForm.elements.code.value.trim()) return;
    try {
      const table = await window.CG_STORE.joinByCode(joinForm.elements.code.value);
      if (table) location.hash = `#masa/${table}`;
      else msg.textContent = t.badCode;
    } catch (err) {
      msg.textContent = errorText(err);
    }
  });

  const lists = { mine: [], games: [] };
  const status = (tb) => `<span class="tb-status${tableOpen(tb) ? " on" : ""}">${tableOpen(tb) ? t.open : t.closed}</span>`;
  const desc = (tb) => `<p class="tb-desc">${tb.desc ? esc(tb.desc) : `<span class="auth-muted">${t.noDesc}</span>`}</p>`;
  const players = (tb, editable) => {
    const ids = tb.members || [];
    if (!ids.length) return `<p class="auth-muted">${t.noPlayers}</p>`;
    return `<ul class="tb-players">${ids
      .map(
        (u) =>
          `<li><span>${esc((tb.names || {})[u] || "?")}</span>${
            editable ? `<button type="button" class="tb-x" data-remove="${u}" data-table="${tb.id}" aria-label="${t.removePlayer}" title="${t.removePlayer}">×</button>` : ""
          }</li>`
      )
      .join("")}</ul>`;
  };
  const nameCol = { key: "name", label: t.tCol, text: true, value: (tb) => tb.name, cell: (tb) => esc(tb.name) };
  const statusCol = { key: "status", label: t.statusCol, value: (tb) => +tableOpen(tb), cell: status };
  const config = {
    mine: {
      empty: t.noTables,
      cols: [nameCol, { key: "players", label: t.playersCol, value: (tb) => (tb.members || []).length }, statusCol],
      card: (tb) => `
        <h4>${esc(tb.name)}</h4>
        ${desc(tb)}
        <b class="vt-desc-label">${t.players}</b>
        ${players(tb, true)}
        <form class="tb-add" data-table="${tb.id}">
          <input name="player" type="text" maxlength="20" placeholder="${t.addPlaceholder}" aria-label="${t.addPlayer}" autocomplete="off">
          <button type="submit" class="prof-btn">${t.add}</button>
        </form>
        <p class="auth-error" data-msg="${tb.id}" role="alert"></p>
        <div class="tb-actions">
          <button type="button" class="auth-submit" data-enter="${tb.id}">${t.enter}</button>
          <button type="button" class="prof-btn neg" data-delete="${tb.id}">${t.del}</button>
        </div>`,
    },
    games: {
      empty: t.noGames,
      cols: [nameCol, { key: "gm", label: t.gmCol, text: true, value: (tb) => tb.gmName, cell: (tb) => esc(tb.gmName) }, statusCol],
      card: (tb) => `
        <h4>${esc(tb.name)}</h4>
        ${desc(tb)}
        <div class="vt-stats vt-text" style="--cols: 2">
          <div><b>${t.gmCol}</b><span>${esc(tb.gmName)}</span></div>
          <div><b>${t.statusCol}</b><span>${status(tb)}</span></div>
        </div>
        <b class="vt-desc-label">${t.players}</b>
        ${players(tb, false)}
        <div class="tb-actions">
          <button type="button" class="auth-submit" data-join="${tb.id}"${tableOpen(tb) ? "" : " disabled"}>${t.join}</button>
          ${tableOpen(tb) ? "" : `<span class="auth-muted">${t.joinHint}</span>`}
        </div>`,
    },
  };

  const listen = (key, q) => {
    const block = el.querySelector(`[data-block="${key}"]`);
    if (!block) return;
    const box = block.querySelector(".tb-list");
    const cfg = config[key];
    let table = null;
    let pending = false;
    // Kartta yazı yazılırken liste yeniden çizilmez; kutudan çıkınca çizilir
    const draw = () => {
      const a = document.activeElement;
      if (table && box.contains(a) && a.matches("input, textarea")) {
        pending = true;
        return;
      }
      pending = false;
      if (!table) {
        table = mountCardTable(box, lng, {
          items: () => lists[key],
          cols: cfg.cols,
          card: cfg.card,
          maxRows: 4.5,
          t: { sortHint: SHOP_TEXT[lng].sortHint, close: SHOP_TEXT[lng].close, empty: cfg.empty },
        });
      } else table.render();
    };
    box.addEventListener("focusout", () => pending && setTimeout(draw, 0));
    const unsub = onSnapshot(
      q,
      (snap) => {
        lists[key] = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => tableOpen(b) - tableOpen(a) || a.name.localeCompare(b.name, lng));
        if (key === "games" && gm) block.hidden = !lists.games.length;
        draw();
      },
      (err) => (box.innerHTML = `<p class="auth-error">${errorText(err)}</p>`)
    );
    const timer = setInterval(() => table && draw(), 30000); // açık / kapalı durumu zamanla da değişir
    tableStops.push(unsub, () => clearInterval(timer));
  };
  if (gm) listen("mine", query(collection(db, "tables"), where("gm", "==", user.uid)));
  listen("games", query(collection(db, "tables"), where("members", "array-contains", user.uid)));

  el.addEventListener("click", async (e) => {
    if (e.target.closest(".tb-create")) return openCreateTable(lists.mine.length);
    const b = e.target.closest("[data-enter], [data-join], [data-delete], [data-remove]");
    if (!b) return;
    if (b.dataset.enter || b.dataset.join) location.hash = `#masa/${b.dataset.enter || b.dataset.join}`;
    else if (b.dataset.delete) openDeleteTable(lists.mine.find((x) => x.id === b.dataset.delete));
    else if (b.dataset.remove) {
      b.disabled = true;
      try {
        await updateDoc(doc(db, "tables", b.dataset.table), { members: arrayRemove(b.dataset.remove), [`names.${b.dataset.remove}`]: deleteField() });
        syncRoomMember(b.dataset.table, b.dataset.remove, null);
      } catch (err) {
        b.disabled = false;
        const msg = el.querySelector(`[data-msg="${b.dataset.table}"]`);
        if (msg) msg.textContent = errorText(err);
      }
    }
  });

  // Oyuncu ekleme: kullanıcı adı herkese açık profillerde aranır
  el.addEventListener("submit", async (e) => {
    const form = e.target.closest(".tb-add");
    if (!form) return;
    e.preventDefault();
    const tb = lists.mine.find((x) => x.id === form.dataset.table);
    const msg = el.querySelector(`[data-msg="${form.dataset.table}"]`);
    const input = form.elements.player;
    const name = input.value.trim();
    msg.textContent = "";
    if (!tb || !name) return;
    if ((tb.members || []).length >= MAX_PLAYERS) return (msg.textContent = t.tooManyPlayers);
    const btn = form.querySelector("button");
    btn.disabled = true;
    try {
      const snap = await getDocs(query(collection(db, "profiles"), where("username", "==", name), limit(1)));
      const found = snap.docs[0];
      if (!found) msg.textContent = t.noSuchUser;
      else if (found.id === user.uid) msg.textContent = t.notSelf;
      else if ((tb.members || []).includes(found.id)) msg.textContent = t.alreadyIn;
      else {
        await updateDoc(doc(db, "tables", tb.id), { members: arrayUnion(found.id), [`names.${found.id}`]: found.data().username });
        syncRoomMember(tb.id, found.id, true);
        input.value = "";
        input.blur();
      }
    } catch (err) {
      msg.textContent = errorText(err);
    } finally {
      btn.disabled = false;
    }
  });
}

// Masa sayfası (#masa/<kimlik>): masa simülasyonu gelene kadar yer tutucu. GM girince masa açılır;
// içeride kalan herkes dakikada bir "buradayım" yazar. Masa kapanırsa (GM kapattı ya da 5 dakika kimse kalmadı) sayfa bunu söyler.
// Oda hiç açılmadıysa meta yoktur, yazma reddedilir; GM girince üye listesinin tamamı yazılır
const syncRoomMember = (tableId, uid, value) => dbSet(dbRef(rtdb, `rooms/${tableId}/meta/members/${uid}`), value).catch(() => {});

// Odanın canlı katmanı (js/room.js ve js/roomboard.js kullanır). Deneme Odası'nda bunun yerine roomDemoNet çalışır.
function roomNet(tableId) {
  const at = (p) => dbRef(rtdb, p ? `rooms/${tableId}/${p}` : `rooms/${tableId}`);
  const me = user.uid;
  const warn = (err) => console.warn("room:", err && err.code);
  // Gizli statlar objeden ayrılıp yalnızca GM'in okuduğu yola gider
  const splitStats = (ob) => {
    if (!ob.statsHidden) return [ob, null];
    const open = { ...ob };
    const stats = {};
    for (const key of ["stats", "ammo", "ammoMax", "bars", "title"]) {
      if (open[key] !== undefined) stats[key] = open[key];
      delete open[key];
    }
    return [open, stats];
  };
  const watch = (q, cb) => onValue(q, (snap) => cb(snap.val()), warn);
  // İlk değer atlanır, yalnızca gerçekten değişince bildirilir
  const changes = (q, cb) => {
    let last;
    return watch(q, (value) => {
      const text = JSON.stringify(value);
      if (last !== undefined && value != null && text !== last) cb(value);
      last = text;
    });
  };
  let stopConn = null;
  const mine = `users/${me}`;
  return {
    me,
    claim: (members, code) => dbSet(at("meta"), { gm: me, code: code || null, members: Object.fromEntries(members.map((uid) => [uid, true])) }),
    async join(info) {
      const cur = (await dbGet(at(mine))).val() || {};
      await dbSet(at(mine), { name: cur.name || info.name, color: cur.color || info.color, online: true, sheet: info.sheet && info.sheet.slice(0, 60), ai: info.ai || null });
      stopConn = onValue(dbRef(rtdb, ".info/connected"), (snap) => {
        if (!snap.val()) return;
        onDisconnect(at(`${mine}/online`)).set(false).catch(warn);
        onDisconnect(at(`moving/${me}`)).remove().catch(warn);
        dbSet(at(`${mine}/online`), true).catch(warn);
      });
    },
    leave() {
      if (!stopConn) return;
      stopConn();
      stopConn = null;
      onDisconnect(at(`${mine}/online`)).cancel().catch(warn);
      dbSet(at(`${mine}/online`), false).catch(warn);
    },
    watchUsers: (cb) => watch(at("users"), (value) => cb(value || {})),
    setUser: (uid, patch) => dbUpdate(at(`users/${uid}`), patch).catch(warn),
    addDrone: (name) => dbSet(at(`users/drone-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`), { name, color: "#ffffff", online: true, ai: true, owner: me }).catch(warn),
    dropUser: (uid) => dbRemove(at(`users/${uid}`)).catch(warn),
    watchSettings: (cb) => watch(at("settings"), (value) => cb(value || {})),
    setSettings: (patch) => dbUpdate(at("settings"), patch).catch(warn),
    roll: (r) => dbPush(at("rolls"), r).catch(warn),
    setMoving: (items, color) => (items ? dbSet(at(`moving/${me}`), { color, items }) : dbRemove(at(`moving/${me}`))).catch(warn),
    watchMoving: (cb) => watch(at("moving"), (value) => cb(value || {})),
    watchTurns: (gm, cb) => watch(at(gm ? "turnsAll" : "turns"), cb),
    saveTurns: (all, open) => dbUpdate(at(), { turnsAll: all, turns: open }).catch(warn),
    makeCode: (old) => window.CG_STORE.setRoomCode(tableId, old),
    watchRolls: (cb, count) => watch(dbQuery(at("rolls"), limitToLast(count)), (value) => cb(Object.values(value || {}))),
    kick: (uid) => dbSet(at(`kick/${uid}`), Date.now()).catch(warn),
    // Önceki atılmadan kalan işaret silinir; atılan kullanıcı geri girebilir
    onKicked(cb) {
      let stop = null;
      let off = false;
      dbRemove(at(`kick/${me}`)).catch(warn).finally(() => {
        if (!off) stop = watch(at(`kick/${me}`), (value) => value && cb());
      });
      return () => {
        off = true;
        if (stop) stop();
      };
    },
    notifySheet: (uid) => dbSet(at(`assign/${uid}`), Date.now()).catch(warn),
    onSheetChange: (cb) => changes(at(`assign/${me}`), cb),

    // Harita: gizli objeler ayrı yolda durur, oyuncuya hiç gelmez
    watchBoard(gm, onObjects, onFog) {
      let open = {};
      let hidden = {};
      let stats = {};
      let queued = false;
      const send = () => {
        if (queued) return;
        queued = true;
        queueMicrotask(() => {
          queued = false;
          const all = { ...open, ...hidden };
          for (const id of Object.keys(stats)) if (all[id]) all[id] = { ...all[id], ...stats[id] };
          onObjects(all);
        });
      };
      const stops = [
        watch(at("objects"), (value) => {
          open = value || {};
          send();
        }),
        watch(at("fog"), onFog),
      ];
      if (gm) stops.push(watch(at("secret"), (value) => {
        hidden = value || {};
        send();
      }), watch(at("secretStats"), (value) => {
        stats = value || {};
        send();
      }));
      return () => stops.forEach((stop) => stop());
    },
    putObject(ob) {
      const [open, stats] = splitStats(ob);
      return dbUpdate(at(), { [`objects/${ob.id}`]: ob.hidden ? null : open, [`secret/${ob.id}`]: ob.hidden ? open : null, [`secretStats/${ob.id}`]: stats }).catch(warn);
    },
    moveObject: (ob) => dbUpdate(at(`objects/${ob.id}`), { x: ob.x, y: ob.y }).catch(warn),
    setAmmo: (ob) => dbUpdate(at(`objects/${ob.id}`), { ammo: ob.ammo }).catch(warn),
    setStats: (ob) => dbUpdate(at(`objects/${ob.id}`), { stats: ob.stats || null, bars: !!ob.bars }).catch(warn),
    putOwn: (ob) => dbSet(at(`objects/${ob.id}`), ob).catch(warn), // oyuncunun kendi çizimi
    delOwn: (ob) => dbRemove(at(`objects/${ob.id}`)).catch(warn),
    delObject: (ob) => dbUpdate(at(), { [`objects/${ob.id}`]: null, [`secret/${ob.id}`]: null, [`secretStats/${ob.id}`]: null }).catch(warn),
    putFogShape: (s) => dbSet(at(`fog/shapes/${s.id}`), s).catch(warn),
    delFogShape: (id) => dbRemove(at(`fog/shapes/${id}`)).catch(warn),
    resetFog: (base) => dbSet(at("fog"), { base }).catch(warn),
    pullCamera: (v) => dbSet(at("camera"), v).catch(warn),
    onCamera: (cb) => changes(at("camera"), cb),
  };
}

async function mountTableRoom(el) {
  const t = T();
  stopBeat();
  const id = location.hash.slice("#masa/".length);
  const head = `<div class="crumb">${t.room}</div>`;
  const back = `<div class="tb-actions"><a class="prof-btn" href="${PLAY_PAGE}">${t.backToTables}</a></div>`;
  const userName = () => (account && account.username) || user.email.split("@")[0];
  el.innerHTML = `${head}<p class="auth-muted">${t.loading}</p>`;
  if (!authReady) return; // oturum durumu belli olunca sayfa yeniden çizilir
  if (!user) {
    el.innerHTML = `${head}<p class="placeholder">${t.memberOnly}</p>`;
    return;
  }
  // Deneme Odası: masa kaydı yoktur, veri bu tarayıcıda kalır (js/room.js)
  if (id === "deneme") {
    mountRoom(el, { id, name: t.demoRoom, isGm: true, isAi: hasBadge(profile, "ai"), demo: true, leaveHref: PLAY_PAGE, userName: userName() });
    return;
  }
  const ref = doc(db, "tables", id);
  let tb = null;
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) tb = snap.data();
  } catch (err) {
    // üyesi olunmayan masa okunamaz
  }
  if (!tb) {
    el.innerHTML = `${head}<p class="placeholder">${t.tableGone}</p>${back}`;
    return;
  }
  const closedView = () => (el.innerHTML = `${head}<h1>${esc(tb.name)}</h1><p class="placeholder">${t.tableClosed}</p>${back}`);
  const isGm = tb.gm === user.uid;
  if (!isGm && !tableOpen(tb)) return closedView();
  const ping = () => updateDoc(ref, isGm ? { open: true, lastActive: serverTimestamp() } : { lastActive: serverTimestamp() });
  try {
    await ping();
  } catch (err) {
    return closedView();
  }
  const room = { id, name: tb.name, isGm, isAi: hasBadge(profile, "ai"), leaveHref: PLAY_PAGE, userName: userName(), gmUid: tb.gm, members: tb.members || [], code: tb.code || "" };
  mountRoom(el, room);
  beatTimer = setInterval(() => {
    if (location.hash !== `#masa/${id}`) return stopBeat();
    ping().catch(() => {
      stopBeat();
      room.stop();
      closedView();
    });
  }, TABLE_BEAT_MS);
  el.addEventListener("click", async (e) => {
    if (!e.target.closest("[data-close-table]")) return;
    stopBeat();
    await updateDoc(ref, { open: false }).catch(() => {});
    location.hash = PLAY_PAGE;
  });
}

// ---------- Sayfalar: yönetim ve geri bildirim (TOOLS'a eklenir, js/main.js çizer) ----------

const rerender = () => {
  if (typeof renderContent === "function") renderContent();
};
const ourPage = () =>
  location.hash.startsWith("#yonetim/") || location.hash.startsWith("#profil/") || location.hash.startsWith("#masa/") || location.hash === "#geri-bildirim";

// Rol bilgisi js/main.js'e verilir: Oyna bölümü yalnızca üyelere; GM bölümü ve GM'lere özel paneller yalnızca onaylı GM'lere ve yöneticilere görünür.
// Bu yalnızca görünürlüktür; veri Firestore kurallarıyla korunur.
function publishRole() {
  const next = { ready: authReady, member: !!user, gm: gmStatusOf(account) === "approved", admin: isAdmin };
  const prev = window.CG_ROLE;
  window.CG_ROLE = next;
  if (prev && ["ready", "member", "gm", "admin"].every((k) => prev[k] === next[k])) return;
  if (typeof roleChanged === "function") roleChanged();
}

// Hesaba tıklanınca imlecin yanında açılan küçük menü ("Profili gör")
const ctx = document.createElement("div");
ctx.className = "ctx-menu";
ctx.hidden = true;
document.body.appendChild(ctx);
function openCtx(x, y, name) {
  ctx.innerHTML = `<button type="button" data-name="${esc(name)}">${T().viewProfile}</button>`;
  ctx.hidden = false;
  ctx.style.left = `${Math.min(x, window.innerWidth - ctx.offsetWidth - 8)}px`;
  ctx.style.top = `${Math.min(y, window.innerHeight - ctx.offsetHeight - 8)}px`;
}
ctx.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  ctx.hidden = true;
  location.hash = `#yonetim/profil/${encodeURIComponent(b.dataset.name)}`;
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
            // GM etiketi rozetle kullanıcı adının arasında durur
            const tag = gm === "approved" ? `<span class="auth-badge">${t.badges.gm}</span>` : gm === "pending" ? `<span class="auth-badge pending">${t.badges.pending}</span>` : "";
            const p = profs[r.uid];
            return `<li><button type="button" class="adm-user" data-name="${esc(r.username)}" style="--uc: ${colorOf(p)}">${nameHtml(r.username, p, tag)}</button></li>`;
          })
          .join("")}</ul>`
      : `<p class="auth-muted">${t.noAccounts}</p>`;
    el.addEventListener("click", (e) => {
      const b = e.target.closest(".adm-user");
      if (b) openCtx(e.clientX + 4, e.clientY + 4, b.dataset.name);
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
              `<li><button type="button" class="adm-user" data-name="${esc(d.data().username)}">${esc(d.data().username)}</button>` +
              `<span class="adm-actions"><button type="button" class="prof-btn" data-set="approved" data-uid="${d.id}">${t.approve}</button>` +
              `<button type="button" class="prof-btn neg" data-set="none" data-uid="${d.id}">${t.reject}</button></span></li>`
          )
          .join("")}</ul><p class="auth-error" role="alert"></p>`;
    el.addEventListener("click", async (e) => {
      const u = e.target.closest(".adm-user");
      if (u) return openCtx(e.clientX + 4, e.clientY + 4, u.dataset.name);
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
    if (d && (await askConfirm(t.fbConfirm))) {
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
              return `<article class="fb-post" data-id="${p.id}" style="--uc: ${colorOf(profs[p.uid])}">
                <header><span class="fb-name">${nameHtml(p.username, profs[p.uid])}</span><span class="fb-ver">V${esc(p.version)}</span><span class="fb-date">${date}</span>${
                  isAdmin ? `<button type="button" class="fb-del" data-delete="${p.id}">${t.fbDelete}</button>` : ""
                }</header>
                <p>${esc(p.text)}</p>
              </article>`;
            })
            .join("")
        : `<p class="auth-muted">${t.fbEmpty}</p>`;
      // Bildirimden gelindiyse o yazıya gidilir ve yazı kısa bir süre parlar
      const focus = fbFocus && list.querySelector(`[data-id="${CSS.escape(fbFocus)}"]`);
      fbFocus = null;
      if (focus) {
        focus.classList.add("fb-focus");
        focus.scrollIntoView({ block: "center" });
      }
      // Yönetici sayfayı açınca bütün geri bildirimleri görmüş olur; zil söner
      if (isAdmin && unreadCount()) {
        saveSeen(notifs[0]);
        renderBell();
      }
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
  TOOLS["profile"] = mountProfile;
  TOOLS["shop-saves"] = mountShopSaves;
  TOOLS["char-saves"] = mountCharSaves;
  TOOLS["tables"] = mountTables;
  TOOLS["table-room"] = mountTableRoom;
  // Bu dosya sayfadan sonra yüklendiği için açık sayfa bizimse yeniden çizilir
  if (ourPage()) rerender();
}

// ---------- Oturum durumu ----------

onAuthStateChanged(auth, async (u) => {
  stopTables();
  stopBeat();
  stopNotifs();
  user = u;
  account = null;
  profile = null;
  isAdmin = false;
  myShops = null;
  myChars = null;
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
      // Hiç rozet seçmemiş hesaplarda varsayılan: yöneticiye Yönetici rozeti, onaylı GM'ye GM rozeti
      if (profile && !("badge" in profile)) {
        const def = isAdmin ? "admin" : gmStatusOf(account) === "approved" ? "gm" : null;
        if (def) {
          await updateDoc(doc(db, "profiles", u.uid), { badge: def })
            .then(() => (profile.badge = def))
            .catch(() => {});
        }
      }
      // Hakkı biten rozet çıkarılır: süresi dolan Aktif Oyuncu, geri alınan VIP (yöneticiler hariç)
      if (profile && !isAdmin && ((profile.badge === "active" && !activeOk(profile)) || (profile.badge === "vip" && !hasVip(profile)))) {
        await updateDoc(doc(db, "profiles", u.uid), { badge: null })
          .then(() => (profile.badge = null))
          .catch(() => {});
      }
    } catch (err) {
      // Kayıt okunamazsa kullanıcı adı e-postadan gösterilir
    }
  }
  authReady = true;
  renderTab();
  publishRole();
  if (ourPage()) rerender();
  if (u) startNotifs();
});

// Firebase oturumu bildirmeden de sekme hemen görünsün (oturum açıksa birazdan kullanıcı adına döner)
renderTab();

// Dil değişince sekme ve açık pencere yeniden yazılır
document.addEventListener("langchange", () => {
  renderTab();
  if (dialog.open) renderDialog();
  if (!panel.hidden) renderNotifs();
});
