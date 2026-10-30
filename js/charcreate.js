// Araçlar > Karakter Oluştur: karakter kağıdını aşama aşama dolduran araç.
// Sol panelde aşamalar listelenir ("char-steps", "Bu sayfada" panelinin yerinde); sayfada iki kutu durur ("char-create"):
//   Karakter Kağıdı: seçimler yapıldıkça genişleyip dolan özet. Yeşil çubuğuna basınca kapanır, yalnızca çubuk kalır.
//                    Rengi seçilen sınıfın rengine yumuşak bir geçişle döner (CLASS_COLORS).
//   Aşama: yalnızca seçili aşama; altta Geri / İleri.
// Her aşamanın başında içi boş bir yuvarlak vardır; aşama tamamlanınca içi dolar. Bütün aşamalar tamamlanınca
// listenin sonuna "Gözden Geçir" eklenir. "Tamamla" ve kaydetme sonra eklenecek.
// Aşamalar: Profil, Stat Dağıtma, Skill Bonusları, Feat, Quickhack Kütüphanesi (yalnızca Netrunner), Cyberware, Başlangıç Eşyaları.
// Profil, Stat Dağıtma ve Skill Bonusları çalışıyor; diğerleri yer tutucu.
// Doldurulan taslak yalnızca bu tarayıcıda saklanır (localStorage).

const CC_KEY = "cg-char-draft";
const CC_MAX_LEVEL = 1; // şimdilik karakterler en fazla 1. seviyeden başlar
const CC_ARRAY = [15, 14, 13, 12, 10, 10, 8]; // sabit dizi
const CC_MASTERY_MOD = 1; // 1. seviyede Ustalık modifier'ı
const CC_FEAT_POINTS = 1; // 1. seviyede kazanılan feat puanı
const CC_FEAT_TIER = 1; // 1. seviyede alınabilen en yüksek feat aşaması (2. aşama 4. seviyede açılır)
const CC_START_CW = 2; // karakter oyuna Başlangıç listesinden 2 cyberware ile başlar
const CC_QH_LIBRARY = 3; // Netrunner 1. seviyede kütüphanesine 3 quickhack ekler
const CC_SLOT_CAP = { noral: 3, goz: 2, kol: 2, bacak: 1, dahili: 3, cilt: 1 }; // her bölgenin yuva sayısı (kollar ikisi birden)
const CC_CHIP = "chipware-socket"; // takılırken yetkin olunmayan bir skill'e bağlanan parça
const CC_STATS = POINT_BUY.stats.map((s) => s.id); // INT … BODY (EMP skill vermez)

// Skill'ler, bağlı oldukları stat'a göre (Kural Kitabı > Statlar ve Skill'ler ile aynı sıra). gloss: Türkçe karşılık
const SKILLS = [
  { id: "perception", name: "Perception", gloss: "Algı", stat: "INT" },
  { id: "netrunning", name: "Netrunning", gloss: "", stat: "INT" },
  { id: "lore", name: "Lore", gloss: "Bilgi", stat: "INT" },
  { id: "streetwise", name: "Streetwise", gloss: "Sokak Bilgisi", stat: "INT" },
  { id: "handgun", name: "Handgun", gloss: "Tabancalar", stat: "REF" },
  { id: "shoulder-arms", name: "Shoulder Arms", gloss: "Tüfekler", stat: "REF" },
  { id: "heavy-weapons", name: "Heavy Weapons", gloss: "Ağır Silahlar", stat: "REF" },
  { id: "driving", name: "Driving", gloss: "Sürüş", stat: "REF" },
  { id: "athletics", name: "Athletics", gloss: "Atletizm", stat: "DEX" },
  { id: "stealth", name: "Stealth", gloss: "Gizlilik", stat: "DEX" },
  { id: "evasion", name: "Evasion", gloss: "Kaçınma", stat: "DEX" },
  { id: "melee-weapons", name: "Melee Weapons", gloss: "Dövüş Silahları", stat: "DEX" },
  { id: "hardware", name: "Hardware", gloss: "Donanım", stat: "TECH" },
  { id: "cybertech", name: "Cybertech", gloss: "Siber Teknik", stat: "TECH" },
  { id: "medicine", name: "Medicine", gloss: "Tıp", stat: "TECH" },
  { id: "craft", name: "Craft", gloss: "Zanaat", stat: "TECH" },
  { id: "persuasion", name: "Persuasion", gloss: "İkna", stat: "COOL" },
  { id: "deception", name: "Deception", gloss: "Aldatma", stat: "COOL" },
  { id: "intimidation", name: "Intimidation", gloss: "Gözdağı", stat: "COOL" },
  { id: "performance", name: "Performance", gloss: "Performans", stat: "COOL" },
  { id: "concentration", name: "Concentration", gloss: "Konsantrasyon", stat: "WILL" },
  { id: "insight", name: "Insight", gloss: "Sezgi", stat: "WILL" },
  { id: "mental-resist", name: "Mental Resist", gloss: "Mental Direnç", stat: "WILL" },
  { id: "survival", name: "Survival", gloss: "Hayatta Kalma", stat: "WILL" },
  { id: "brawling", name: "Brawling", gloss: "Kavga", stat: "BODY" },
  { id: "endurance", name: "Endurance", gloss: "Dayanıklılık", stat: "BODY" },
  { id: "resist-toxin", name: "Resist Toxin", gloss: "Toksin Direnci", stat: "BODY" },
  { id: "strength", name: "Strength", gloss: "Güç", stat: "BODY" },
];

const CC_TEXT = {
  tr: {
    steps: "Aşamalar",
    sheet: "Karakter Kağıdı",
    sheetToggle: "Karakter kağıdını aç ya da kapat",
    stage: "Aşama",
    prev: "Geri",
    next: "İleri",
    soon: "Bu aşama yakında eklenecek.",
    willHave: "Bu aşamada:",
    required: "Zorunlu",
    level: "Seviye",
    handle: "Takma Ad",
    role: "Sınıf",
    pick: "Seç",
    picked: "Seçildi",
    core: "Çekirdek Feat",
    suggested: "Önerilen Statlar",
    notYet: "Henüz doldurulmadı.",
    identity: "Kimlik",
    startLevel: "Başlangıç Seviyesi",
    levelNote: "Şimdilik bütün karakterler 1. seviyeden başlar.",
    // Stat Dağıtma
    pointBuy: "Point Buy",
    array: "Sabit Dizi",
    pointBuyNote: "Statlar 8'den başlar ve puan harcanarak yükseltilir; değer arttıkça bir sonraki adım daha pahalıya gelir. EMP 10'dan başlar ve aynı puanlarla artırılabilir.",
    arrayNote: "Dizideki değerler (15, 14, 13, 12, 10, 10, 8) yedi stata birer kez dağıtılır. EMP 10'da kalır.",
    left: "Kalan puan",
    stat: "Stat",
    value: "Değer",
    mod: '<span lang="en">Modifier</span>',
    cost: "Harcanan",
    points: "Yetkinlik Puanı",
    totalPoints: "Toplam yetkinlik puanı",
    lower: "azalt",
    raise: "artır",
    baseMods: "Skill'lerin temel modifier'ları",
    noValue: "Değer seçilmedi.",
    hp: "Maksimum HP",
    humanity: '<span lang="en">Humanity</span>',
    empNoSkills: "Skill vermez",
    // Skill Bonusları
    statsFirst: "Yetkinlik puanları statlardan gelir. Önce Stat Dağıtma aşamasını tamamla.",
    goStats: "Stat Dağıtma'ya git",
    profNote: "Bir skill'e 1 puan harcanırsa o skill'de Yetkin (+1), 2 puan harcanırsa Çok Yetkin (+2) olunur. Ustalık yalnızca yetkin olunan bir skill'e verilebilir ve o skill'e Ustalık modifier'ını (+1) ekler.",
    pointsLeft: "Kalan yetkinlik puanı",
    mastery: "Ustalık",
    masteryNone: "Seçilmedi",
    base: "Temel",
    prof: "Yetkinlik",
    total: "Toplam",
    proficient: "Yetkin",
    highly: "Çok Yetkin",
    noPoints: "Bu stat yetkinlik puanı vermiyor.",
    giveMastery: "Ustalık ver",
    skills: "Skill'ler",
    gear: "Eşyalar",
    languages: "Diller",
    feats: "Feat'ler",
    quickhacks: "Quickhack'ler",
    cyberware: "Cyberware",
    // Feat
    featHint: "1. seviyede yalnızca 1. aşama feat'ler alınabilir: sınıfının feat'leri ve tarafsız feat'ler. Bir feat'i seçmek için üstüne tıkla; puanı sonraki seviyelere saklamak istersen Puanı Sakla'ya bas.",
    featPoints: "Feat puanı",
    saveFeat: "Puanı Sakla",
    savedState: "saklandı",
    savedChip: "Saklanan puan",
    classFeats: (n) => `${n} Feat'leri`,
    generalFeats: "Tarafsız Feat'ler",
    tierLabel: (n) => `${n}. Aşama`,
    cost: (n) => `${n} puan`,
    featSearch: "Feat ara…",
    noFeats: "Aramaya uyan feat yok.",
    roleFirst: "Hangi feat'lerin alınabileceği sınıfa bağlıdır. Önce Profil'de bir sınıf seç.",
    goProfile: "Profil'e git",
    // Quickhack
    qhHint: "1. seviyede yalnızca I. kademe quickhack'lere erişebilirsin. Bunlardan 3 tanesini seçip kütüphanene ekle. Kütüphanen, cyberdeck'inde hazır tuttuğun quickhack'lerden ayrıdır: hazır quickhack'lerini dinlenirken kütüphanenden seçersin.",
    qhPicked: "Kütüphane",
    qhTier: (n) => `${n}. Kademe`,
    // Cyberware
    cwHint: "Listede Başlangıç etiketi taşıyan parçalardan 2 tanesini seç. Aynı parça iki kez alınamaz. Her parçanın Humanity kaybı maksimum Humanity'den düşülür.",
    cwPicked: "Seçilen",
    cwLoss: '<span lang="en">Humanity</span> kaybı', // büyük harfte "İ" çıkmasın
    maxHumanity: 'Maksimum <span lang="en">Humanity</span>',
    chipSkill: "Bağlı skill",
    chipChoose: "Skill seç",
    chip: "Çip",
    // Sıfırlama
    resetAll: "Sıfırla",
    resetStage: "Bu Aşamayı Sıfırla",
    confirmAll: "Karakter kağıdındaki her şey silinsin mi? Bu geri alınamaz.",
    confirmStage: (name) => `“${name}” aşamasında yaptığın seçimler silinsin mi?`,
    yes: "Sıfırla",
    no: "Vazgeç",
  },
  en: {
    steps: "Steps",
    sheet: "Character Sheet",
    sheetToggle: "Open or close the character sheet",
    stage: "Step",
    prev: "Back",
    next: "Next",
    soon: "This step is coming soon.",
    willHave: "In this step:",
    required: "Required",
    level: "Level",
    handle: "Handle",
    role: "Role",
    pick: "Choose",
    picked: "Chosen",
    core: "Core Feat",
    suggested: "Suggested Stats",
    notYet: "Not filled in yet.",
    identity: "Identity",
    startLevel: "Starting Level",
    levelNote: "For now, every character starts at level 1.",
    pointBuy: "Point Buy",
    array: "Standard Array",
    pointBuyNote: "Stats start at 8 and are raised by spending points; the higher a stat gets, the more the next step costs. EMP starts at 10 and can be raised with the same points.",
    arrayNote: "The array's values (15, 14, 13, 12, 10, 10, 8) are assigned to the seven stats, each once. EMP stays at 10.",
    left: "Points left",
    stat: "Stat",
    value: "Value",
    mod: "Modifier",
    cost: "Spent",
    points: "Proficiency Points",
    totalPoints: "Total proficiency points",
    lower: "lower",
    raise: "raise",
    baseMods: "Base skill modifiers",
    noValue: "No value chosen.",
    hp: "Max HP",
    humanity: "Humanity",
    empNoSkills: "Grants no skills",
    statsFirst: "Proficiency points come from your stats. Finish the Stats step first.",
    goStats: "Go to Stats",
    profNote: "Spending 1 point on a skill makes you Proficient (+1) in it; 2 points make you Highly Proficient (+2). Mastery can only go to a skill you're proficient in, and adds your Mastery modifier (+1) to it.",
    pointsLeft: "Proficiency points left",
    mastery: "Mastery",
    masteryNone: "Not chosen",
    base: "Base",
    prof: "Proficiency",
    total: "Total",
    proficient: "Proficient",
    highly: "Highly Proficient",
    noPoints: "This stat grants no proficiency points.",
    giveMastery: "Give Mastery",
    skills: "Skills",
    gear: "Gear",
    languages: "Languages",
    feats: "Feats",
    quickhacks: "Quickhacks",
    cyberware: "Cyberware",
    featHint: "At level 1 you can only take tier 1 feats: your Role's feats and general feats. Click a feat to choose it; to keep the point for later levels, press Save the Point.",
    featPoints: "Feat points",
    saveFeat: "Save the Point",
    savedState: "saved",
    savedChip: "Saved point",
    classFeats: (n) => `${n} Feats`,
    generalFeats: "General Feats",
    tierLabel: (n) => `Tier ${n}`,
    cost: (n) => `${n} point${n > 1 ? "s" : ""}`,
    featSearch: "Search feats…",
    noFeats: "No feats match your search.",
    roleFirst: "Which feats you can take depends on your Role. Choose a Role in your Profile first.",
    goProfile: "Go to Profile",
    qhHint: "At level 1 you can only access tier I quickhacks. Choose 3 of them and add them to your library. Your library is separate from the quickhacks your cyberdeck holds ready: while resting, you pick your ready quickhacks from your library.",
    qhPicked: "Library",
    qhTier: (n) => `Tier ${n}`,
    cwHint: "Choose 2 pieces with the Starting tag from the list. The same piece can't be taken twice. Each piece's Humanity loss is subtracted from maximum Humanity.",
    cwPicked: "Chosen",
    cwLoss: "Humanity loss",
    maxHumanity: "Max Humanity",
    chipSkill: "Bound skill",
    chipChoose: "Choose a skill",
    chip: "Chip",
    resetAll: "Reset",
    resetStage: "Reset This Step",
    confirmAll: "Erase everything on the character sheet? This can't be undone.",
    confirmStage: (name) => `Erase the choices you made in the “${name}” step?`,
    yes: "Reset",
    no: "Cancel",
  },
};

// Profil aşamasının ad ve görünüş alanları; takma ad zorunlu
const CC_PROFILE = [
  { key: "handle", label: { tr: "Takma Ad", en: "Handle" }, hint: { tr: "Sokakta bilinen adı", en: "The name the street knows" }, required: true },
  { key: "name", label: { tr: "Gerçek Adı", en: "Real Name" }, hint: { tr: "Kimliğinde yazan ad", en: "The name on their ID" } },
  { key: "age", label: { tr: "Yaş", en: "Age" }, hint: { tr: "", en: "" }, short: true },
  { key: "look", label: { tr: "Görünüş", en: "Appearance" }, hint: { tr: "Yüzü, giyimi, kromu, ilk bakışta göze çarpan her şey", en: "Face, clothes, chrome, whatever catches the eye first" }, area: true },
  { key: "notes", label: { tr: "Kişilik ve Notlar", en: "Personality & Notes" }, hint: { tr: "Alışkanlıkları, korkuları, kime borçlu olduğu", en: "Habits, fears, who they owe" }, area: true },
];

// Aşamalar. done: aşama tamamlandı mı · when: yalnızca koşul sağlanınca listede · intro: aşamanın başındaki kısa açıklama
// plan: yer tutucu aşamalarda neyin geleceği
const CC_STAGES = [
  {
    id: "profil",
    label: { tr: "Profil", en: "Profile" },
    intro: {
      tr: "Night City'de çoğu insan gerçek adıyla değil, sokağın ona taktığı adla tanınır. Karakterin kim olduğunu, nasıl göründüğünü ve sokakta hangi işi yaptığını, yani sınıfını belirle.",
      en: "In Night City most people go by the name the street gave them, not the one they were born with. Decide who your character is, what they look like and what they do on the street: their Role.",
    },
    done: (d) => !!(d.profil.handle || "").trim() && !!d.sinif && d.seviye >= 1,
    reset: (d) => { d.profil = {}; d.sinif = null; d.seviye = 1; },
    render: ccProfile,
  },
  {
    id: "statlar",
    label: { tr: "Stat Dağıtma", en: "Stats" },
    intro: {
      tr: "Yedi stat, karakterin bedenini ve zihnini sayılara döker. Statlar point buy ya da sabit diziyle belirlenir; EMP herkeste 10'dan başlar. Bir stat'ın adının üstüne gelince, o değerle skill'lerinin temel modifier'ları görünür.",
      en: "Seven stats put your character's body and mind into numbers. They're set with point buy or the standard array; EMP starts at 10 for everyone. Hover a stat's name to see its skills' base modifiers at that value.",
    },
    done: () => ccStatsDone(),
    reset: (d) => { d.statlar = ccBlank().data.statlar; ccTrimSkills(); },
    render: ccStatsStage,
  },
  {
    id: "skiller",
    label: { tr: "Skill Bonusları", en: "Skill Bonuses" },
    intro: {
      tr: "Her stat, modifier'ı kadar yetkinlik puanı verir ve bu puanlar yalnızca o stat'ın skill'lerine harcanır. Puanlar dağıtıldıktan sonra yetkin olunan skill'lerden birine Ustalık verilir.",
      en: "Each stat grants proficiency points equal to its modifier, and they can only be spent on that stat's skills. Once they're spent, one of your proficient skills receives Mastery.",
    },
    done: () => ccSkillsDone(),
    reset: (d) => { d.skiller = { prof: {}, mastery: null }; },
    render: ccSkillsStage,
  },
  {
    id: "feat",
    label: { tr: "Feat", en: "Feat" },
    intro: {
      tr: "Her karakter oyuna 1 feat puanıyla başlar. Puan hemen bir feat'e harcanabilir ya da sonraki seviyelerde daha pahalı bir feat için saklanabilir.",
      en: "Every character starts the game with 1 feat point. It can be spent on a feat right away or saved for a pricier feat at a later level.",
    },
    done: () => ccFeatDone(),
    reset: (d) => { d.feat = { picks: [], saved: false }; },
    render: ccFeatStage,
  },
  {
    id: "quickhack",
    label: { tr: "Quickhack Kütüphanesi", en: "Quickhack Library" },
    when: (d) => d.sinif === "netrunner",
    intro: {
      tr: "Bir Netrunner'ın gücü, cyberdeck'ine yüklediği programlar kadardır. 1. seviyede erişebildiğin kademelerden 3 quickhack seçip kütüphanene eklersin.",
      en: "A Netrunner is only as good as the programs on their cyberdeck. At level 1 you choose 3 quickhacks from the tiers you can access and add them to your library.",
    },
    done: () => ccQhDone(),
    reset: (d) => { d.quickhack = { picks: [] }; },
    render: ccQhStage,
  },
  {
    id: "cyberware",
    label: { tr: "Cyberware", en: "Cyberware" },
    intro: {
      tr: "Karakter oyuna Başlangıç etiketli listeden seçilen 2 cyberware ile başlar. Her parça bir yuva kaplar ve maksimum Humanity'yi düşürür.",
      en: "Characters start the game with 2 cyberware pieces from the Starting list. Each piece takes a slot and lowers maximum Humanity.",
    },
    done: () => ccCwDone(),
    reset: (d) => { d.cyberware = { picks: [], chipSkill: null }; },
    render: ccCwStage,
  },
  {
    id: "esyalar",
    label: { tr: "Başlangıç Eşyaları", en: "Starting Gear" },
    intro: {
      tr: "Karakter sokağa boş elle çıkmaz. Profil'de seçilen sınıfın başlangıç envanterinden silah, zırh ve ekipman seçilir; bilinen diller de burada yazılır.",
      en: "Nobody hits the street empty-handed. Pick weapons, armor and gear from the starting kit of the Role chosen in your Profile; known languages are recorded here too.",
    },
    plan: {
      tr: ["Sınıfın başlangıç envanterinden silah, zırh ve ekipman seçimi", "Diller"],
      en: ["Picking weapons, armor and gear from your Role's starting kit", "Languages"],
    },
    done: () => false,
  },
];

const CC_REVIEW = {
  id: "gozden-gecir",
  label: { tr: "Gözden Geçir", en: "Review" },
  intro: {
    tr: "Karakter kağıdı hazır. Sokağa çıkmadan önce her şeyi son bir kez gözden geçir.",
    en: "The character sheet is ready. Look it over one last time before you hit the street.",
  },
  render: ccReview,
};

// ---------- Taslak ----------

function ccBlank() {
  const buy = {};
  const dizi = {};
  for (const s of PB_ROWS) buy[s.id] = lowestBuy(s.id);
  for (const id of CC_STATS) dizi[id] = null;
  return {
    stage: "profil",
    sheetShown: false,
    data: { profil: {}, sinif: null, seviye: 1, statlar: { method: "pointbuy", buy, dizi }, skiller: { prof: {}, mastery: null }, feat: { picks: [], saved: false }, quickhack: { picks: [] }, cyberware: { picks: [], chipSkill: null } },
  };
}

function ccLoad() {
  const b = ccBlank();
  try {
    const s = JSON.parse(localStorage.getItem(CC_KEY));
    if (s && s.data) {
      const st = s.data.statlar || {};
      return {
        stage: s.stage || b.stage,
        sheetShown: s.sheetShown === true,
        data: {
          ...b.data,
          ...s.data,
          profil: { ...(s.data.profil || {}) },
          statlar: { method: st.method === "dizi" ? "dizi" : "pointbuy", buy: { ...b.data.statlar.buy, ...(st.buy || {}) }, dizi: { ...b.data.statlar.dizi, ...(st.dizi || {}) } },
          skiller: { prof: { ...((s.data.skiller || {}).prof || {}) }, mastery: (s.data.skiller || {}).mastery || null },
          feat: { picks: [...((s.data.feat || {}).picks || [])], saved: !!(s.data.feat || {}).saved },
          quickhack: { picks: [...((s.data.quickhack || {}).picks || [])] },
          cyberware: { picks: [...((s.data.cyberware || {}).picks || [])], chipSkill: (s.data.cyberware || {}).chipSkill || null },
        },
      };
    }
  } catch (e) {}
  return b;
}

let cc = ccLoad();
let ccViews = []; // açık olan görünümler (sol panel ve sayfa); taslak değişince güncellenir

function ccSave() {
  try { localStorage.setItem(CC_KEY, JSON.stringify(cc)); } catch (e) {}
}

const ccEsc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const ccActive = () => CC_STAGES.filter((s) => !s.when || s.when(cc.data));
const ccAllDone = () => ccActive().every((s) => s.done(cc.data));
const ccStages = () => (ccAllDone() ? [...ccActive(), CC_REVIEW] : ccActive());

// Seçili aşama artık listede yoksa (örn. bir aşama yeniden eksik kalınca Gözden Geçir kalkar) ilk eksik aşamaya dönülür
function ccCurrent() {
  const list = ccStages();
  let s = list.find((x) => x.id === cc.stage);
  if (!s) {
    s = list.find((x) => x.done && !x.done(cc.data)) || list[0];
    cc.stage = s.id;
  }
  return s;
}

// full: aşama da yeniden çizilsin mi (yazı yazarken yalnızca sol panel ve karakter kağıdı güncellenir, imleç kaybolmasın)
function ccChanged(full) {
  ccSave();
  for (const v of ccViews) v(full);
}

function ccGo(id) {
  cc.stage = id;
  ccChanged(true);
  const top = document.querySelector(".cc-panel");
  if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- Statlar ve skill'ler ----------

// Stat'ın değeri; sabit dizide henüz seçilmediyse null
function ccStatVal(id) {
  const st = cc.data.statlar;
  if (st.method === "dizi") return id === POINT_BUY.emp.id ? POINT_BUY.emp.base : st.dizi[id];
  return st.buy[id];
}

const ccBuyLeft = () => POINT_BUY.budget - PB_ROWS.reduce((n, s) => n + statCost(s.id, cc.data.statlar.buy[s.id]), 0);

function ccCanRaise(id) {
  const v = cc.data.statlar.buy[id];
  return v + 1 <= POINT_BUY.max && statCost(id, v + 1) - statCost(id, v) <= ccBuyLeft();
}

// Point buy: bütün puanlar harcanınca (ya da kalan puanla hiçbir stat artırılamıyorsa) tamamdır; sabit dizi: yedi stat da seçilince
function ccStatsDone() {
  const st = cc.data.statlar;
  if (st.method === "dizi") return CC_STATS.every((id) => st.dizi[id] != null);
  return ccBuyLeft() === 0 || !PB_ROWS.some((s) => ccCanRaise(s.id));
}

// Stat'ın verdiği yetkinlik puanı (karakter oluştururkenki modifier'ı kadar; negatif ya da 0 puan vermez)
const ccPoints = (stat) => {
  const v = ccStatVal(stat);
  return v == null ? 0 : Math.max(0, statMod(v));
};
const ccProf = (skill) => cc.data.skiller.prof[skill] || 0;
const ccUsed = (stat) => SKILLS.filter((k) => k.stat === stat).reduce((n, k) => n + ccProf(k.id), 0);
const ccPointsLeft = () => CC_STATS.reduce((n, id) => n + ccPoints(id) - ccUsed(id), 0);

function ccSkillsDone() {
  if (!ccStatsDone()) return false;
  if (!CC_STATS.every((id) => ccUsed(id) === ccPoints(id))) return false;
  const anyProf = SKILLS.some((k) => ccProf(k.id) > 0);
  return !anyProf || !!cc.data.skiller.mastery;
}

// Statlar değişince fazla kalan yetkinlik puanları sondan geri alınır; Ustalık'ın skill'i yetkinliğini kaybettiyse Ustalık kalkar
function ccTrimSkills() {
  const sk = cc.data.skiller;
  for (const id of CC_STATS) {
    const list = SKILLS.filter((k) => k.stat === id).reverse();
    let over = ccUsed(id) - ccPoints(id);
    for (const k of list) {
      while (over > 0 && ccProf(k.id) > 0) {
        sk.prof[k.id] -= 1;
        over -= 1;
      }
    }
  }
  if (sk.mastery && !ccProf(sk.mastery)) sk.mastery = null;
}

const ccChipOn = (k) => cc.data.cyberware.picks.includes(CC_CHIP) && cc.data.cyberware.chipSkill === k.id && !ccProf(k.id);
const ccSkillTotal = (k) => {
  const v = ccStatVal(k.stat);
  return (v == null ? 0 : statMod(v)) + ccProf(k.id) + (cc.data.skiller.mastery === k.id ? CC_MASTERY_MOD : 0) + (ccChipOn(k) ? 1 : 0);
};

const ccSkillLabel = (k, lang) => (lang === "tr" && k.gloss ? `${k.name} <span class="cc-gloss">(${k.gloss})</span>` : k.name);

// Onay penceresi: sitedeki öteki onay kutularıyla aynı görünüm; sonuç evet ise true
function ccConfirm(text, lang) {
  const t = CC_TEXT[lang];
  return new Promise((resolve) => {
    const box = document.createElement("dialog");
    box.className = "auth-dialog cg-confirm";
    box.innerHTML = `
      <form class="auth-panel" method="dialog">
        <p class="cg-confirm-text">${ccEsc(text)}</p>
        <div class="cg-confirm-actions">
          <button type="submit" value="no" class="prof-btn">${t.no}</button>
          <button type="submit" value="yes" class="auth-submit">${t.yes}</button>
        </div>
      </form>`;
    document.body.appendChild(box);
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      box.close();
      box.remove();
      resolve(ok);
    };
    box.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      finish(!!e.submitter && e.submitter.value === "yes");
    });
    box.addEventListener("cancel", (e) => {
      e.preventDefault();
      finish(false);
    });
    box.addEventListener("click", (e) => { if (e.target === box) finish(false); }); // dışına tıklamak vazgeçmektir
    box.showModal();
    box.querySelector('[value="no"]').focus();
  });
}

// ---------- Feat'ler ve kağıttaki kutucuklar ----------

let ccFeatQuery = ""; // Feat aşamasındaki arama; aşama yeniden çizilince korunur

// Feat'in rengi Feat listesindekiyle aynı: sınıf feat'leri sınıfın renginde, tarafsızlar sitenin yeşilinde
const ccFeatColor = (f) => (f.cls === "tarafsiz" ? "#39ff14" : CLASS_COLORS[f.cls]);
// Seçilebilen feat'ler: sınıfın ve tarafsız havuzun 1. aşama feat'leri (canTakeFeat: tools.js)
const ccFeatPool = () => (cc.data.sinif ? FEATS.filter((f) => f.tier <= CC_FEAT_TIER && canTakeFeat(f, cc.data.sinif)) : []);
const ccFeatSpent = () => cc.data.feat.picks.reduce((n, id) => n + ((FEATS.find((f) => f.id === id) || {}).tier || 0), 0);
const ccFeatDone = () => !!cc.data.sinif && (ccFeatSpent() === CC_FEAT_POINTS || cc.data.feat.saved);

// Sınıf değişince yeni sınıfın alamayacağı feat'ler bırakılır
function ccTrimFeats() {
  const pool = ccFeatPool();
  cc.data.feat.picks = cc.data.feat.picks.filter((id) => pool.some((f) => f.id === id));
}

// Seçili feat'e tekrar basınca bırakılır; puan yetmiyorsa önceki seçim bırakılıp yenisi alınır (1. seviyede tek puan var)
function ccPickFeat(id) {
  const fd = cc.data.feat;
  if (fd.picks.includes(id)) fd.picks = fd.picks.filter((x) => x !== id);
  else {
    const f = FEATS.find((x) => x.id === id);
    while (fd.picks.length && ccFeatSpent() + f.tier > CC_FEAT_POINTS) fd.picks.shift();
    if (ccFeatSpent() + f.tier <= CC_FEAT_POINTS) {
      fd.picks.push(id);
      fd.saved = false;
    }
  }
  ccChanged(true);
}

// Arama: kartlar yeniden çizilmeden gizlenir; kartı kalmayan grubun başlığı ve boş liste yazısı buna göre
function ccFilterFeats(root) {
  const q = ccFeatQuery.trim().toLocaleLowerCase();
  let any = false;
  for (const grid of root.querySelectorAll(".cf-grid")) {
    let shown = 0;
    for (const c of grid.querySelectorAll(".cf-card")) {
      const ok = !q || c.dataset.search.includes(q);
      c.hidden = !ok;
      if (ok) shown++;
    }
    grid.hidden = !shown;
    grid.previousElementSibling.hidden = !shown;
    if (shown) any = true;
  }
  const empty = root.querySelector(".cf-empty");
  if (empty) empty.hidden = any;
}

// Kağıttaki kutucuk: üstüne gelince bilgi kutusunda açıklaması açılır (tools.js > tip); renk kutunun ve bilgi kutusunun çerçevesi
function ccChip(color, title, text, inner, titleLang = "en") {
  return `<span class="cc-chip tip-ref" tabindex="0" style="--chip: ${color}; --spec-color: ${color}" data-tip="${ccEsc(text)}" data-tip-title="${ccEsc(title)}" data-tip-lang="${titleLang}">${inner}</span>`;
}

// ---- Quickhack: Netrunner 1. seviyede erişebildiği kademelerden (yalnızca I) 3 quickhack'i kütüphanesine ekler.
// Specialization quickhack'leri 3. seviyede açıldığı için burada yok. Renk Netrunning listesindeki gibi: genel quickhack'ler yeşil.
const CC_QH_TIER = 1;
const ccQhPool = () => QUICKHACKS.filter((q) => q.tier <= CC_QH_TIER && !q.spec);
const ccQhPicks = () => cc.data.quickhack.picks.map((id) => QUICKHACKS.find((q) => q.id === id)).filter(Boolean);
const ccQhDone = () => cc.data.quickhack.picks.length === CC_QH_LIBRARY;

function ccPickQh(id) {
  const qd = cc.data.quickhack;
  if (qd.picks.includes(id)) qd.picks = qd.picks.filter((x) => x !== id);
  else if (qd.picks.length < CC_QH_LIBRARY) qd.picks.push(id);
  else return;
  ccChanged(true);
}

// Quickhack kutucuğu: adı, altında kademesi, RAM'i ve türü
function ccQhChip(q, lang) {
  return ccChip("#39ff14", q.name, ccPlain(q.desc[lang]), `<b lang="en">${q.name}</b><small>${QH_ROMAN[q.tier]} · ${q.ram} RAM · ${QH_TYPES[q.type][lang]}</small>`);
}

// ---- Cyberware: Başlangıç listesinden 2 parça; aynı parça iki kez alınmaz, bölgenin yuva sayısı aşılmaz
const ccCwPool = () => CYBERWARE.filter((c) => (c.tags || []).includes("baslangic"));
const ccCwPicks = () => cc.data.cyberware.picks.map((id) => CYBERWARE.find((c) => c.id === id)).filter(Boolean);
const ccCwSlots = (c) => ((c.tags || []).includes("iki-slot") ? 2 : 1);
const ccCwLoss = () => ccCwPicks().reduce((n, c) => n + c.humanity, 0);
const ccCwSlotUsed = (slot) => ccCwPicks().filter((c) => c.slot === slot).reduce((n, c) => n + ccCwSlots(c), 0);
const ccCwFits = (c) => ccCwSlotUsed(c.slot) + ccCwSlots(c) <= (CC_SLOT_CAP[c.slot] || 0);
function ccCwDone() {
  const cw = cc.data.cyberware;
  return cw.picks.length === CC_START_CW && (!cw.picks.includes(CC_CHIP) || !!cw.chipSkill);
}
// Maksimum Humanity: EMP × 10 − takılı cyberware'lerin Humanity kayıpları
const ccMaxHumanity = () => ccStatVal("EMP") * 10 - ccCwLoss();

function ccPickCw(id) {
  const cw = cc.data.cyberware;
  if (cw.picks.includes(id)) {
    cw.picks = cw.picks.filter((x) => x !== id);
    if (id === CC_CHIP) cw.chipSkill = null;
  } else {
    const c = CYBERWARE.find((x) => x.id === id);
    if (cw.picks.length >= CC_START_CW || !ccCwFits(c)) return;
    cw.picks.push(id);
  }
  ccChanged(true);
}
const ccEmptyChips = (n) => `<span class="cc-chip empty" aria-hidden="true"></span>`.repeat(n);
const ccPlain = (html) => String(html).replace(/<[^>]+>/g, "");

// Feat kutucuğu: adı ve aşaması, feat'in renginde
function ccFeatChip(f, lang) {
  const t = CC_TEXT[lang];
  return ccChip(ccFeatColor(f), f.name[lang], ccPlain(f.desc[lang]), `<b lang="en">${f.name[lang]}</b><small>${t.tierLabel(f.tier)}</small>`);
}

// Cyberware kutucuğu: ağırlığı, yuvası ve adı, cyberware listesindeki renginde (cwTint: tools.js)
function ccCwChip(c, lang) {
  const w = CW_TEXT[lang].weights[cwWeight(c)];
  const tint = cwTint(c);
  const text = [].concat(c.desc[lang]).map(ccPlain).join("\n");
  return ccChip((tint && tint.color) || "#39ff14", c.name[lang], text, `<small>${w} · ${CW_SLOTS[c.slot][lang]}</small><b>${c.name[lang]}</b>`, lang);
}

// ---------- Sol panel: aşamalar ----------

function mountCharSteps(el, lang) {
  const t = CC_TEXT[lang];
  const draw = () => {
    const cur = ccCurrent();
    el.innerHTML = `
      <div class="cc-steps">
        <div class="toc-head">${t.steps}</div>
        <ul class="toc-list cc-list">
          ${ccStages()
            .map((s, i) => {
              const done = s.done ? s.done(cc.data) : false;
              const review = s === CC_REVIEW;
              return `<li style="--i:${i}"${review ? ` class="cc-review-item"` : ""}>
                <a href="#" data-stage="${s.id}" class="${s.id === cur.id ? "active" : ""}" aria-current="${s.id === cur.id ? "step" : "false"}">
                  <span class="cc-dot${done ? " done" : ""}${review ? " review" : ""}" aria-hidden="true"></span>
                  <span class="label">${s.label[lang]}</span>
                </a>
              </li>`;
            })
            .join("")}
        </ul>
      </div>`;
  };
  el.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-stage]");
    if (!a) return;
    e.preventDefault();
    ccGo(a.dataset.stage);
  });
  ccViews.push(draw);
  draw();
}

// ---------- Sayfa: karakter kağıdı + aşama ----------

function mountCharCreate(el, lang) {
  const t = CC_TEXT[lang];
  ccViews = []; // sayfa yeniden açıldı; sol panel bundan sonra eklenir
  let shownStage = null; // aşama değişince içerik animasyonla gelir, aynı aşamada yeniden çizilince gelmez

  el.innerHTML = `
    <div class="cc">
      <section class="cc-sheet${cc.sheetShown ? "" : " closed"}">
        <button type="button" class="cc-sheet-bar" data-sheet-toggle aria-expanded="${cc.sheetShown}" aria-label="${t.sheetToggle}">
          <span>${t.sheet}</span>
          <svg class="cc-chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        </button>
        <div class="cc-sheet-wrap"><div class="cc-sheet-body"></div></div>
      </section>
      <section class="cc-panel"></section>
      <div class="cc-nav"></div>
    </div>`;
  const sheet = el.querySelector(".cc-sheet");
  const body = el.querySelector(".cc-sheet-body");
  const panel = el.querySelector(".cc-panel");
  const nav = el.querySelector(".cc-nav");

  const draw = (full) => {
    // Kağıdın rengi seçilen sınıfın rengi; değişince CSS'teki geçişle yumuşakça döner
    sheet.style.setProperty("--sheet-color", (cc.data.sinif && CLASS_COLORS[cc.data.sinif]) || "#39ff14");
    body.innerHTML = ccSheetHtml(lang);
    if (!full) return;
    const s = ccCurrent();
    const list = ccStages();
    const i = list.indexOf(s);
    const prev = list[i - 1];
    const next = list[i + 1];
    panel.innerHTML = `
      <div class="cc-stage${s.id !== shownStage ? " enter" : ""}" data-stage="${s.id}">
        <div class="cc-stage-head">
          <h2 class="cc-title">${s.label[lang]}</h2>
          <span class="cc-step">${t.stage} ${String(i + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}</span>
        </div>
        <p class="cc-intro">${s.intro[lang]}</p>
        ${s.render ? s.render(lang) : ccSoon(s, lang)}
      </div>`;
    shownStage = s.id;
    if (s.id === "feat") ccFilterFeats(panel);
    nav.innerHTML = `
      <div class="cc-nav-side">
        <button type="button" class="cc-btn danger" data-reset-all>${t.resetAll}</button>
        ${s.reset ? `<button type="button" class="cc-btn danger" data-reset-stage>${t.resetStage}</button>` : ""}
      </div>
      <div class="cc-nav-side">
        ${prev ? `<button type="button" class="cc-btn" data-go="${prev.id}">‹ ${t.prev}</button>` : ""}
        ${next ? `<button type="button" class="cc-btn primary" data-go="${next.id}">${t.next} ›</button>` : ""}
      </div>`;
  };

  el.addEventListener("click", (e) => {
    const b = (sel) => e.target.closest(sel);
    let x;
    if (b("[data-sheet-toggle]")) {
      cc.sheetShown = !cc.sheetShown;
      sheet.classList.toggle("closed", !cc.sheetShown);
      b("[data-sheet-toggle]").setAttribute("aria-expanded", cc.sheetShown);
      ccSave();
    } else if ((x = b("[data-go]"))) {
      ccGo(x.dataset.go);
    } else if ((x = b("[data-role]"))) {
      cc.data.sinif = cc.data.sinif === x.dataset.role ? null : x.dataset.role;
      ccTrimFeats();
      ccChanged(true);
    } else if ((x = b("[data-feat]")) && !b(".tip-ref")) {
      ccPickFeat(x.dataset.feat); // kartın içindeki terime basmak kartı seçmez
    } else if ((x = b("[data-qh]")) && !b(".tip-ref")) {
      ccPickQh(x.dataset.qh);
    } else if ((x = b("[data-cw]")) && !b(".tip-ref, select, label")) {
      ccPickCw(x.dataset.cw); // kartın içindeki terime ya da skill seçimine basmak kartı seçmez
    } else if (b("[data-feat-save]")) {
      const fd = cc.data.feat;
      fd.saved = !fd.saved;
      if (fd.saved) fd.picks = [];
      ccChanged(true);
    } else if ((x = b("[data-method]"))) {
      cc.data.statlar.method = x.dataset.method;
      ccTrimSkills();
      ccChanged(true);
    } else if ((x = b("[data-stat-step]")) && !x.disabled) {
      cc.data.statlar.buy[x.dataset.stat] += Number(x.dataset.statStep);
      ccTrimSkills();
      ccChanged(true);
    } else if (b("[data-reset-all]")) {
      ccConfirm(t.confirmAll, lang).then((ok) => {
        if (!ok) return;
        const open = cc.sheetShown;
        cc = ccBlank();
        cc.sheetShown = open;
        ccGo("profil");
      });
    } else if (b("[data-reset-stage]")) {
      const s = ccCurrent();
      ccConfirm(t.confirmStage(s.label[lang]), lang).then((ok) => {
        if (!ok || !s.reset) return;
        s.reset(cc.data);
        ccChanged(true);
      });
    } else if ((x = b("[data-prof]")) && !x.disabled) {
      const id = x.dataset.prof;
      const to = Number(x.dataset.to);
      cc.data.skiller.prof[id] = ccProf(id) === to ? to - 1 : to; // dolu son noktaya tekrar basınca bir puan geri alınır
      if (!cc.data.skiller.prof[id] && cc.data.skiller.mastery === id) cc.data.skiller.mastery = null;
      ccChanged(true);
    } else if ((x = b("[data-mastery]")) && !x.disabled) {
      cc.data.skiller.mastery = cc.data.skiller.mastery === x.dataset.mastery ? null : x.dataset.mastery;
      ccChanged(true);
    }
  });

  el.addEventListener("keydown", (e) => {
    const c = e.target.closest("[data-feat], [data-qh], [data-cw]");
    if (c && e.target === c && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      if (c.dataset.feat) ccPickFeat(c.dataset.feat);
      else if (c.dataset.qh) ccPickQh(c.dataset.qh);
      else ccPickCw(c.dataset.cw);
    }
  });

  el.addEventListener("input", (e) => {
    if (e.target.matches("[data-feat-search]")) {
      ccFeatQuery = e.target.value;
      ccFilterFeats(panel);
      return;
    }
    const f = e.target.closest("[data-field]");
    if (f) {
      cc.data.profil[f.dataset.field] = f.value;
      ccChanged(false);
    }
  });

  el.addEventListener("change", (e) => {
    if (e.target.matches("[data-level]")) {
      cc.data.seviye = Number(e.target.value) || 1;
      ccChanged(false);
    } else if (e.target.matches("[data-chip-skill]")) {
      cc.data.cyberware.chipSkill = e.target.value || null;
      ccChanged(true);
    } else if (e.target.matches("[data-dizi]")) {
      cc.data.statlar.dizi[e.target.dataset.dizi] = e.target.value === "" ? null : Number(e.target.value);
      ccTrimSkills();
      ccChanged(true);
    }
  });

  ccViews.push(draw);
  draw(true);
}

// Karakter kağıdı: fiziksel kağıt gibi bütün bölümler baştan durur; boş satırlar seçim yapıldıkça dolar
function ccSheetHtml(lang) {
  const t = CC_TEXT[lang];
  const d = cc.data;
  const p = d.profil;
  const role = CLASSES.find((c) => c.id === d.sinif);
  const cell = (label, value, cls = "") =>
    `<div class="cc-cell${cls}"><b>${label}</b><span class="${value ? "" : "blank"}">${value || "&nbsp;"}</span></div>`;
  const rows = [];

  rows.push(`<div class="cc-row cc-row-id">${cell(t.handle, ccEsc((p.handle || "").trim()))}${cell(t.role, role && role.name)}${cell(t.level, String(d.seviye || 1))}</div>`);
  rows.push(`<div class="cc-row cc-row-id2">${cell(CC_PROFILE[1].label[lang], ccEsc((p.name || "").trim()))}${cell(CC_PROFILE[2].label[lang], ccEsc((p.age || "").trim()))}</div>`);
  rows.push(`<div class="cc-row">${cell(t.core, role && role.core[lang], " wide")}</div>`);

  // Statlar: değer verilmeye başlanana kadar kutular boş
  const st = d.statlar;
  const touched = st.method === "dizi" ? CC_STATS.some((id) => st.dizi[id] != null) : PB_ROWS.some((s) => st.buy[s.id] !== lowestBuy(s.id));
  const stats = PB_ROWS.map((s) => {
    const v = touched ? ccStatVal(s.id) : null;
    return `<div class="cc-stat"><b>${s.id}</b><span class="${v == null ? "blank" : ""}">${v == null ? "&nbsp;" : v}</span><small>${v == null ? "&nbsp;" : fmtMod(statMod(v))}</small></div>`;
  }).join("");
  const body = touched ? ccStatVal("BODY") : null;
  rows.push(`<div class="cc-row cc-row-stats">${stats}</div>`);
  rows.push(`<div class="cc-row cc-row-derived">${cell(t.hp, body == null ? "" : String(10 + 2 * body))}${cell(t.humanity, touched || ccCwLoss() ? String(ccMaxHumanity()) : "")}</div>`);

  // Skill'ler: yetkin olunanlar, toplam değerleriyle
  const prof = SKILLS.filter((k) => ccProf(k.id) > 0 || ccChipOn(k))
    .map((k) => `<span class="cc-skill">${k.name} <b>${fmtMod(ccSkillTotal(k))}</b>${d.skiller.mastery === k.id ? ` <em>${t.mastery}</em>` : ""}${ccChipOn(k) ? ` <em>${t.chip}</em>` : ""}</span>`)
    .join("");
  rows.push(`<div class="cc-row"><div class="cc-cell wide"><b>${t.skills}</b><div class="cc-skills">${prof || "&nbsp;"}</div></div></div>`);

  // Feat'ler, quickhack'ler ve cyberware'ler kutucuk olarak; seçilmeyenler kesik çizgili boş kutu
  const chipsRow = (label, chips) => `<div class="cc-row"><div class="cc-cell wide"><b>${label}</b><div class="cc-chips">${chips}</div></div></div>`;
  const feats = d.feat.picks.map((id) => FEATS.find((f) => f.id === id)).filter(Boolean);
  const featLeft = CC_FEAT_POINTS - ccFeatSpent();
  const saved = d.feat.saved && featLeft > 0
    ? `<span class="cc-chip saved"><small>${t.savedChip}</small><b>${featLeft}</b></span>`
    : ccEmptyChips(featLeft);
  rows.push(chipsRow(t.feats, feats.map((f) => ccFeatChip(f, lang)).join("") + saved));
  if (d.sinif === "netrunner") {
    const qhs = ccQhPicks();
    rows.push(chipsRow(t.quickhacks, qhs.map((q) => ccQhChip(q, lang)).join("") + ccEmptyChips(CC_QH_LIBRARY - qhs.length)));
  }
  const cws = ccCwPicks();
  rows.push(chipsRow(t.cyberware, cws.map((c) => ccCwChip(c, lang)).join("") + ccEmptyChips(CC_START_CW - cws.length)));
  rows.push(`<div class="cc-row cc-row-gear">${cell(t.gear, "")}${cell(t.languages, "")}</div>`);
  return rows.join("");
}

// Yer tutucu aşama: kısa açıklama ve bu aşamada neyin yapılacağı
function ccSoon(s, lang) {
  const t = CC_TEXT[lang];
  return `
    <div class="cc-soon">
      <p><b>${t.willHave}</b></p>
      <ul>${s.plan[lang].map((x) => `<li>${x}</li>`).join("")}</ul>
      <p class="cc-soon-note">${t.soon}</p>
    </div>`;
}

// ---------- Profil ----------

function ccProfile(lang) {
  const t = CC_TEXT[lang];
  const k = cc.data.profil;
  const fields = CC_PROFILE.map((f) => {
    const id = `cc-${f.key}`;
    const input = f.area
      ? `<textarea id="${id}" data-field="${f.key}" rows="3" placeholder="${ccEsc(f.hint[lang])}">${ccEsc(k[f.key])}</textarea>`
      : `<input id="${id}" data-field="${f.key}" type="text" maxlength="${f.short ? 4 : 40}" value="${ccEsc(k[f.key])}" placeholder="${ccEsc(f.hint[lang])}" autocomplete="off">`;
    return `
      <div class="cc-field${f.area ? " wide" : ""}${f.short ? " short" : ""}">
        <label for="${id}">${f.label[lang]}${f.required ? ` <span class="cc-req">${t.required}</span>` : ""}</label>
        ${input}
      </div>`;
  }).join("");
  const roles = CLASSES.map((c) => {
    const on = cc.data.sinif === c.id;
    return `
      <button type="button" class="cc-role${on ? " on" : ""}" data-role="${c.id}" aria-pressed="${on}" style="--role-color: ${CLASS_COLORS[c.id] || "#39ff14"}">
        <span class="cc-role-top"><span class="cc-role-name">${c.name}</span><span class="cc-role-pick">${on ? t.picked : t.pick}</span></span>
        <span class="cc-role-meta"><b>${t.suggested}</b> ${c.stats.join(" · ")}</span>
        <span class="cc-role-core"><b>${t.core}</b> ${c.core[lang]}</span>
      </button>`;
  }).join("");
  const levels = Array.from({ length: CC_MAX_LEVEL }, (_, i) => i + 1)
    .map((n) => `<option value="${n}"${n === cc.data.seviye ? " selected" : ""}>${n}</option>`)
    .join("");
  return `
    <h3 class="cc-sub">${t.identity}</h3>
    <div class="cc-fields">${fields}</div>
    <h3 class="cc-sub">${t.role} <span class="cc-req">${t.required}</span></h3>
    <div class="cc-roles">${roles}</div>
    <h3 class="cc-sub">${t.startLevel}</h3>
    <div class="cc-field cc-level">
      <label for="cc-level">${t.level}</label>
      <select id="cc-level" data-level>${levels}</select>
      <p class="cc-hint">${t.levelNote}</p>
    </div>`;
}

// ---------- Stat Dağıtma ----------
// Stat Dağıtma aracındaki gibi; stat adının üstüne gelince bilgi kutusunda o değerle skill'lerin temel modifier'ları görünür.

function ccStatsStage(lang) {
  const t = CC_TEXT[lang];
  const st = cc.data.statlar;
  const dizi = st.method === "dizi";
  const left = ccBuyLeft();

  // Bir stat'ın bilgi kutusu: o değerle bağlı skill'lerin temel modifier'ları
  const statTip = (s) => {
    const v = ccStatVal(s.id);
    const skills = SKILLS.filter((k) => k.stat === s.id);
    if (s.id === POINT_BUY.emp.id) return tipRef(s.id, { text: t.empNoSkills, title: `${s.id} · ${s.name[lang]}`, titleLang: "en", term: true });
    const text = v == null ? t.noValue : skills.map((k) => `${k.name}${lang === "tr" && k.gloss ? ` (${k.gloss})` : ""} ${fmtMod(statMod(v))}`).join("\n");
    return tipRef(s.id, { text, title: `${s.id} ${v == null ? "" : v} · ${t.baseMods.replace(/<[^>]+>/g, "")}`, titleLang: lang, term: true });
  };

  // Sabit dizi: her değer dizideki sayısı kadar kullanılabilir
  const diziSelect = (id) => {
    const cur = st.dizi[id];
    const opts = [...new Set(CC_ARRAY)]
      .map((v) => {
        const total = CC_ARRAY.filter((x) => x === v).length;
        const used = CC_STATS.filter((o) => o !== id && st.dizi[o] === v).length;
        const off = used >= total && cur !== v;
        return `<option value="${v}"${cur === v ? " selected" : ""}${off ? " disabled" : ""}>${v}</option>`;
      })
      .join("");
    return `<select class="cs-select" data-dizi="${id}" aria-label="${id}"><option value=""${cur == null ? " selected" : ""}>—</option>${opts}</select>`;
  };

  const rows = PB_ROWS.map((s) => {
    const isEmp = s.id === POINT_BUY.emp.id;
    const v = ccStatVal(s.id);
    const m = v == null ? null : statMod(v);
    let input;
    if (dizi) input = isEmp ? `<output class="pb-value cs-fixed">${v}</output>` : diziSelect(s.id);
    else {
      const b = st.buy[s.id];
      input = `
        <div class="pb-stepper">
          <button type="button" class="pb-btn" data-stat="${s.id}" data-stat-step="-1" aria-label="${s.id} ${t.lower}"${b <= lowestBuy(s.id) ? " disabled" : ""}>−</button>
          <output class="pb-value">${b}</output>
          <button type="button" class="pb-btn" data-stat="${s.id}" data-stat-step="1" aria-label="${s.id} ${t.raise}"${ccCanRaise(s.id) ? "" : " disabled"}>+</button>
        </div>`;
    }
    return `
      <div class="cs-row${isEmp ? " cs-emp" : ""}">
        <div class="cs-stat"><b>${statTip(s)}</b><span>${s.name[lang]}</span></div>
        <div>${input}</div>
        <div class="cs-mod${m != null && m < 0 ? " neg" : ""}">${m == null ? "—" : fmtMod(m)}</div>
        ${dizi ? "" : `<div class="cs-cost">${statCost(s.id, st.buy[s.id])}</div>`}
        <div class="cs-points">${isEmp ? "—" : ccPoints(s.id)}</div>
      </div>`;
  }).join("");

  const body = ccStatVal("BODY");
  const total = CC_STATS.reduce((n, id) => n + ccPoints(id), 0);
  return `
    <div class="cs-methods" role="group">
      <button type="button" class="cs-method${dizi ? "" : " on"}" data-method="pointbuy" aria-pressed="${!dizi}">${t.pointBuy}</button>
      <button type="button" class="cs-method${dizi ? " on" : ""}" data-method="dizi" aria-pressed="${dizi}">${t.array}</button>
    </div>
    <p class="cc-hint cs-note">${dizi ? t.arrayNote : t.pointBuyNote}</p>
    ${dizi ? "" : `
    <div class="pb-budget cs-budget">
      <div class="pb-budget-label">${t.left}</div>
      <div class="pb-budget-value"><span class="pb-left">${left}</span> / ${POINT_BUY.budget}</div>
      <div class="pb-bar"><div class="pb-bar-fill" style="width: ${(left / POINT_BUY.budget) * 100}%"></div></div>
    </div>`}
    <div class="cs-table${dizi ? " dizi" : ""}">
      <div class="cs-head"><div>${t.stat}</div><div>${t.value}</div><div>${t.mod}</div>${dizi ? "" : `<div>${t.cost}</div>`}<div>${t.points}</div></div>
      ${rows}
    </div>
    <div class="cs-foot">
      <div class="cs-derived">
        <span>${t.hp}: <b>${body == null ? "—" : 10 + 2 * body}</b></span>
        <span>${t.humanity}: <b>${ccMaxHumanity()}</b></span>
        <span>${t.totalPoints}: <b>${total}</b></span>
      </div>
    </div>`;
}

// ---------- Skill Bonusları ----------

function ccSkillsStage(lang) {
  const t = CC_TEXT[lang];
  if (!ccStatsDone()) {
    return `<div class="cc-soon"><p>${t.statsFirst}</p><button type="button" class="cc-btn" data-go="statlar">${t.goStats}</button></div>`;
  }
  const mastery = SKILLS.find((k) => k.id === cc.data.skiller.mastery);
  const groups = CC_STATS.map((id) => {
    const s = POINT_BUY.stats.find((x) => x.id === id);
    const v = ccStatVal(id);
    const pts = ccPoints(id);
    const used = ccUsed(id);
    const rows = SKILLS.filter((k) => k.stat === id).map((k) => {
      const p = ccProf(k.id);
      const pip = (n) => {
        const on = p >= n;
        const can = on || used - p + n <= pts;
        return `<button type="button" class="sk-pip${on ? " on" : ""}" data-prof="${k.id}" data-to="${n}" aria-pressed="${on}" aria-label="${k.name}: ${n === 1 ? t.proficient : t.highly}"${can ? "" : " disabled"}></button>`;
      };
      const isM = cc.data.skiller.mastery === k.id;
      return `
        <div class="sk-row${p ? " prof" : ""}">
          <div class="sk-name">${ccSkillLabel(k, lang)}</div>
          <div class="sk-base">${fmtMod(statMod(v))}</div>
          <div class="sk-pips">${pip(1)}${pip(2)}<span class="sk-level">${p === 2 ? t.highly : p === 1 ? t.proficient : ""}</span></div>
          <div><button type="button" class="sk-mastery${isM ? " on" : ""}" data-mastery="${k.id}" aria-pressed="${isM}" aria-label="${k.name}: ${t.giveMastery}"${p ? "" : " disabled"}>◆</button></div>
          <div class="sk-total">${fmtMod(ccSkillTotal(k))}</div>
        </div>`;
    }).join("");
    return `
      <div class="sk-group">
        <div class="sk-group-head">
          <span><b>${id}</b> ${s.name[lang]} <span class="sk-statval">${v} (${fmtMod(statMod(v))})</span></span>
          <span class="sk-pts${!pts ? " none" : used === pts ? " full" : ""}">${pts ? `${used} / ${pts}` : t.noPoints}</span>
        </div>
        <div class="sk-cols"><div>${t.skills}</div><div>${t.base}</div><div>${t.prof}</div><div>${t.mastery}</div><div>${t.total}</div></div>
        ${rows}
      </div>`;
  }).join("");
  return `
    <p class="cc-hint">${t.profNote}</p>
    <div class="sk-summary">
      <div><b>${t.pointsLeft}</b><span class="${ccPointsLeft() ? "" : "full"}">${ccPointsLeft()}</span></div>
      <div><b>${t.mastery}</b><span class="${mastery ? "full" : ""}">${mastery ? `${mastery.name} (+${CC_MASTERY_MOD})` : t.masteryNone}</span></div>
    </div>
    <div class="sk-groups">${groups}</div>`;
}

// ---------- Feat ----------

function ccFeatStage(lang) {
  const t = CC_TEXT[lang];
  const role = CLASSES.find((c) => c.id === cc.data.sinif);
  if (!role) return `<div class="cc-soon"><p>${t.roleFirst}</p><button type="button" class="cc-btn" data-go="profil">${t.goProfile}</button></div>`;
  const pool = ccFeatPool();
  const left = CC_FEAT_POINTS - ccFeatSpent();
  const saved = cc.data.feat.saved;
  const card = (f) => {
    const on = cc.data.feat.picks.includes(f.id);
    const search = `${f.name.tr} ${f.name.en} ${f.gloss || ""} ${ccPlain(f.desc[lang])}`.toLocaleLowerCase();
    return `
      <div class="cf-card${on ? " on" : ""}" role="button" tabindex="0" aria-pressed="${on}" data-feat="${f.id}" data-search="${ccEsc(search)}" style="--feat: ${ccFeatColor(f)}">
        <div class="cf-top">
          <span><b lang="en">${f.name[lang]}</b>${lang === "tr" && f.gloss ? ` <span class="cc-gloss">(${f.gloss})</span>` : ""}</span>
          <span class="cf-tier">${t.tierLabel(f.tier)} · ${t.cost(f.tier)}</span>
        </div>
        <p class="cf-desc">${linkTerms(f.desc[lang], lang)}</p>
      </div>`;
  };
  const group = (title, color, list) =>
    list.length ? `<h3 class="cc-sub colored" style="--sub: ${color}">${title}</h3><div class="cf-grid">${list.map(card).join("")}</div>` : "";
  return `
    <p class="cc-hint">${t.featHint}</p>
    <div class="sk-summary cf-summary">
      <div><b>${t.featPoints}</b><span class="${left && !saved ? "" : "full"}">${left} / ${CC_FEAT_POINTS}${saved ? ` · ${t.savedState}` : ""}</span></div>
      <button type="button" class="cs-method${saved ? " on" : ""}" data-feat-save aria-pressed="${saved}">${t.saveFeat}</button>
    </div>
    <input type="search" class="cf-search" data-feat-search placeholder="${t.featSearch}" value="${ccEsc(ccFeatQuery)}" autocomplete="off" aria-label="${t.featSearch}">
    ${group(t.classFeats(role.name), CLASS_COLORS[role.id], pool.filter((f) => f.cls === role.id))}
    ${group(t.generalFeats, "#39ff14", pool.filter((f) => f.cls === "tarafsiz"))}
    <p class="cc-hint cf-empty" hidden>${t.noFeats}</p>`;
}

// ---------- Quickhack Kütüphanesi ----------

function ccQhStage(lang) {
  const t = CC_TEXT[lang];
  const qd = cc.data.quickhack;
  const full = qd.picks.length >= CC_QH_LIBRARY;
  const card = (q) => {
    const on = qd.picks.includes(q.id);
    const off = !on && full;
    return `
      <div class="cf-card cw-card${on ? " on" : ""}${off ? " off" : ""}" role="button" tabindex="0" aria-pressed="${on}" aria-disabled="${off}" data-qh="${q.id}" style="--feat: #39ff14">
        <div class="cf-top">
          <b lang="en">${q.name}</b>
          <span class="cf-tier">${t.qhTier(q.tier)} · ${q.ram} RAM · ${QH_TYPES[q.type][lang]}</span>
        </div>
        <p class="cf-desc">${linkTerms(q.desc[lang], lang)}</p>
      </div>`;
  };
  return `
    <p class="cc-hint">${t.qhHint}</p>
    <div class="sk-summary">
      <div><b>${t.qhPicked}</b><span class="${full ? "full" : ""}">${qd.picks.length} / ${CC_QH_LIBRARY}</span></div>
    </div>
    <div class="cf-grid">${ccQhPool().map(card).join("")}</div>`;
}

// ---------- Cyberware ----------

function ccCwStage(lang) {
  const t = CC_TEXT[lang];
  const cw = cc.data.cyberware;
  const full = cw.picks.length >= CC_START_CW;
  const card = (c) => {
    const on = cw.picks.includes(c.id);
    const off = !on && (full || !ccCwFits(c));
    const w = CW_TEXT[lang].weights[cwWeight(c)];
    const tint = cwTint(c);
    // Beceri Çipi seçiliyse yetkin olunmayan skill'lerden biri bağlanır
    const chip = on && c.id === CC_CHIP
      ? `<label class="cw-chip-skill"><span>${t.chipSkill}</span>
          <select class="cs-select" data-chip-skill>
            <option value="">${t.chipChoose}</option>
            ${SKILLS.filter((k) => !ccProf(k.id)).map((k) => `<option value="${k.id}"${cw.chipSkill === k.id ? " selected" : ""}>${k.name}</option>`).join("")}
          </select></label>`
      : "";
    return `
      <div class="cf-card cw-card${on ? " on" : ""}${off ? " off" : ""}" role="button" tabindex="0" aria-pressed="${on}" aria-disabled="${off}" data-cw="${c.id}" style="--feat: ${(tint && tint.color) || "#39ff14"}">
        <div class="cf-top">
          <b>${c.name[lang]}</b>
          <span class="cf-tier">${w} · ${CW_SLOTS[c.slot][lang]} · ${t.cwLoss} ${c.humanity}</span>
        </div>
        ${c.flavor ? `<p class="cw-flavor">${c.flavor[lang]}</p>` : ""}
        ${[].concat(c.desc[lang]).map((para) => `<p class="cf-desc">${linkTerms(para, lang)}</p>`).join("")}
        ${chip}
      </div>`;
  };
  const groups = Object.keys(CW_SLOTS)
    .map((slot) => {
      const list = ccCwPool().filter((c) => c.slot === slot);
      return list.length ? `<h3 class="cc-sub">${CW_SLOTS[slot][lang]}</h3><div class="cf-grid">${list.map(card).join("")}</div>` : "";
    })
    .join("");
  return `
    <p class="cc-hint">${t.cwHint}</p>
    <div class="sk-summary">
      <div><b>${t.cwPicked}</b><span class="${full ? "full" : ""}">${cw.picks.length} / ${CC_START_CW}</span></div>
      <div><b>${t.cwLoss}</b><span class="full">${ccCwLoss()}</span></div>
      <div><b>${t.maxHumanity}</b><span class="full">${ccMaxHumanity()}</span></div>
    </div>
    ${groups}`;
}

// ---------- Gözden Geçir ----------

function ccReview(lang) {
  const t = CC_TEXT[lang];
  const k = cc.data.profil;
  const role = CLASSES.find((c) => c.id === cc.data.sinif);
  const row = (label, value) => `<div class="cc-review-row"><b>${label}</b><span>${value ? value : t.notYet}</span></div>`;
  const stats = PB_ROWS.map((s) => `${s.id} ${ccStatVal(s.id)} (${fmtMod(statMod(ccStatVal(s.id)))})`).join(" · ");
  const skills = SKILLS.filter((x) => ccProf(x.id) > 0).map((x) => `${x.name} ${fmtMod(ccSkillTotal(x))}${cc.data.skiller.mastery === x.id ? ` (${t.mastery})` : ""}`).join(" · ");
  return `
    <div class="cc-review">
      <h3>${CC_STAGES[0].label[lang]}</h3>
      ${CC_PROFILE.map((f) => row(f.label[lang], ccEsc((k[f.key] || "").trim()))).join("")}
      ${row(t.role, role && role.name)}
      ${row(t.startLevel, String(cc.data.seviye || 1))}
      <h3>${CC_STAGES[1].label[lang]}</h3>
      ${row(t.stat, stats)}
      ${row(t.hp, String(10 + 2 * ccStatVal("BODY")))}
      ${row(t.humanity, String(ccMaxHumanity()))}
      <h3>${CC_STAGES[2].label[lang]}</h3>
      ${row(t.skills, skills)}
      <h3>${CC_STAGES[3].label[lang]}</h3>
      ${row(t.feats, cc.data.feat.picks.map((id) => (FEATS.find((f) => f.id === id) || { name: { [lang]: id } }).name[lang]).join(" · ") || (cc.data.feat.saved ? `${t.savedChip}: ${CC_FEAT_POINTS - ccFeatSpent()}` : ""))}
      ${ccActive().filter((s) => s.id === "quickhack").map((s) => `<h3>${s.label[lang]}</h3>${row(t.quickhacks, ccQhPicks().map((q) => q.name).join(" · "))}`).join("")}
      <h3>${t.cyberware}</h3>
      ${row(t.cyberware, ccCwPicks().map((c) => `${c.name[lang]}${c.id === CC_CHIP && cc.data.cyberware.chipSkill ? ` (${(SKILLS.find((k) => k.id === cc.data.cyberware.chipSkill) || {}).name})` : ""}`).join(" · "))}
      ${row(t.cwLoss, String(ccCwLoss()))}
      ${ccActive().filter((s) => s.id === "esyalar").map((s) => `<h3>${s.label[lang]}</h3><p class="cc-review-empty">${t.notYet}</p>`).join("")}
    </div>`;
}

TOOLS["char-steps"] = mountCharSteps;
TOOLS["char-create"] = mountCharCreate;
