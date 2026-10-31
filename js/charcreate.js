// Araçlar > Karakter Oluştur: karakter kağıdını aşama aşama dolduran araç.
// Sol panelde aşamalar listelenir ("char-steps", "Bu sayfada" panelinin yerinde); sayfada iki kutu durur ("char-create"):
//   Karakter Kağıdı: seçimler yapıldıkça genişleyip dolan özet. Yeşil çubuğuna basınca kapanır, yalnızca çubuk kalır.
//                    Rengi seçilen sınıfın rengine yumuşak bir geçişle döner (CLASS_COLORS).
//   Aşama: yalnızca seçili aşama; altta Geri / İleri.
// Her aşamanın başında içi boş bir yuvarlak vardır; aşama tamamlanınca içi dolar. Bütün aşamalar tamamlanınca
// listenin sonuna "Gözden Geçir" eklenir; altındaki Tamamla ve Kaydet karakteri hesaba yazar (window.CG_STORE, js/auth.js).
// Aşamalar: Profil, Stat Dağıtma, Skill Bonusları, Feat, Quickhack Kütüphanesi (yalnızca Netrunner), Cyberware, Başlangıç Eşyaları.
// Profil, Stat Dağıtma ve Skill Bonusları çalışıyor; diğerleri yer tutucu.
// Doldurulan taslak yalnızca bu tarayıcıda saklanır (localStorage).

const CC_KEY = "cg-char-draft";
const CC_MAX_LEVEL = 3; // karakterler en fazla 3. seviyeden başlar
// Başlangıç seviyesine göre toplam kazanımlar. feat: feat puanı · qh: Netrunner'ın kütüphanesi · qhTier: erişilen en yüksek kademe · free: istenen skill'e harcanan yetkinlik puanı
const CC_LEVELS = {
  1: { feat: 1, qh: 3, qhTier: 1, free: 0 }, 2: { feat: 2, qh: 4, qhTier: 1, free: 0 }, 3: { feat: 2, qh: 6, qhTier: 2, free: 2 },
  // 4. seviye ve sonrası yalnızca masada seviye atlanarak gelir (js/levelup.js)
  4: { feat: 4, qh: 6, qhTier: 2, free: 2 }, 5: { feat: 4, qh: 8, qhTier: 2, free: 2 }, 6: { feat: 5, qh: 8, qhTier: 2, free: 2 }, 7: { feat: 5, qh: 9, qhTier: 3, free: 2 },
  8: { feat: 6, qh: 9, qhTier: 3, free: 2 }, 9: { feat: 6, qh: 11, qhTier: 3, free: 2 }, 10: { feat: 7, qh: 11, qhTier: 4, free: 2 }, 11: { feat: 7, qh: 12, qhTier: 4, free: 2 }, 12: { feat: 8, qh: 12, qhTier: 4, free: 2 },
};
const CC_SPEC_LEVEL = 3; // specialization bu seviyede seçilir
const CC_ARRAY = [15, 14, 13, 12, 10, 10, 8]; // sabit dizi
const CC_QH_DV = "Quickhack DV";
const CC_ICE = { "self-ice-mk1": 1, "self-ice-mk2": 2, "self-ice-mk3": 3 }; // Kişisel ICE'ın quickhack savunmasına eklediği
const CC_MASTERY_MOD = 1; // 1. seviyede Ustalık modifier'ı; 5. seviyede +2, 11. seviyede +3 olur
const CC_FEAT_TIER = 1; // başlangıç seviyelerinde alınabilen en yüksek feat aşaması (2. aşama 4. seviyede açılır)
const CC_CW_POINTS = 3; // cyberware için 3 puan; Başlangıç listesindeki her parça 1 puan tutar
const CC_CW_TO_FEAT = 2; // bu puanların 2'si 1 feat puanına çevrilebilir
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
    levelNote: "Oyunun hangi seviyeden başlayacağına GM karar verir. Seviye değişince puanlar ve seçimler ona göre güncellenir.",
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
    freePoints: "Serbest yetkinlik puanı",
    freeNote: "3. seviyede kazanılan 2 yetkinlik puanı istenen skill'lere harcanabilir; stat sınırına bağlı değildir.",
    mastery: "Ustalık",
    masteryNone: "Seçilmedi",
    base: "Temel",
    prof: "Yetkinlik",
    total: "Toplam",
    proficient: "Yetkin",
    highly: "Çok Yetkin",
    noPoints: "Bu stat yetkinlik puanı vermiyor.",
    giveMastery: "Ustalık ver",
    skills: '<span lang="en">Skill</span>\'ler',
    gear: "Eşyalar",
    languages: "Diller",
    feats: "Feat'ler",
    quickhacks: '<span lang="en">Quickhack</span>\'ler',
    cyberware: "Cyberware",
    // Feat
    featHint: "Bu seviyede yalnızca 1. aşama feat'ler alınabilir: sınıfının feat'leri ve tarafsız feat'ler. Bir feat'i seçmek için üstüne tıkla; puanı sonraki seviyelere saklamak istersen Puanı Sakla'ya bas.",
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
    qhHint: (n, top) => `${top > 1 ? "I. ve II. kademe quickhack'lere ve specialization'ının II. kademe quickhack'lerine" : "Yalnızca I. kademe quickhack'lere"} erişebilirsin. Bunlardan ${n} tanesini seçip kütüphanene ekle. Kütüphanen, cyberdeck'inde hazır tuttuğun quickhack'lerden ayrıdır: hazır quickhack'lerini dinlenirken kütüphanenden seçersin.`,
    specLabel: '<span lang="en">Specialization</span>',
    specHint: "Sınıfının iki yolundan birini seç. Bu seçim sonraki seviyelerdeki özelliklerini de belirler.",
    specRoleFirst: "Specialization sınıfa bağlıdır. Önce Profil'de bir sınıf seç.",
    specFeature: "3. seviye özelliği",
    melodyTitle: "Melodiler",
    melodyHint: (n) => `Specialization'ının listesinden ${n} melodi seç.`,
    melodyPicked: "Seçilen melodi",
    qhPicked: "Kütüphane",
    qhTier: (n) => `${n}. Kademe`,
    // Diller
    langHint: "Her karakter Streetslang bilir. Sınıfının ve feat'lerinin verdiği ek dil hakkı kadar dil seç.",
    langPicked: "Ek dil hakkı",
    finish: "Tamamla ve Kaydet", finishReady: "Hazır Karakter Olarak Oluştur", readyUpdate: "Hazır Karakteri Güncelle", readyUpdated: (n) => `“${n}” güncellendi.`, readyEdit: "Düzenle", readySwap: "Takma Adla Gerçek Adı Değiştir", readySwapAsk: (a, b) => `Takma ad “${a}”, gerçek ad “${b}” olsun mu?`, readySwapYes: "Değiştir", readySaved: (n) => `“${n}” hazır karakterlere eklendi.`, readyNoName: "Önce karaktere bir takma ad ver.",
    readyMember: "Hazır karakterleri görmek için giriş yap.", readyEmpty: "Henüz hazır karakter yok.", readyPick: "Karakter kağıdını görmek için soldan bir karakter seç.", readyDel: "Siteden Kaldır", readyDelAsk: (n) => `“${n}” hazır karakterlerden kaldırılsın mı? Masalardaki kağıtlar etkilenmez.`,
    finishGuest: "Karakteri kaydetmek için giriş yapmalısın. Taslağın bu tarayıcıda durmaya devam eder.",
    kitHint: "Her satırdan bir eşya seç. Tek seçeneği olan satırlar ve hazır gelen eşyalar kendiliğinden eklenir.",
    kitRoleFirst: "Başlangıç envanteri sınıfa bağlıdır. Önce Profil'de bir sınıf seç.",
    kitFixed: "Hazır Gelenler",
    kitInstrument: "Enstrüman",
    kitInstrumentHint: "Örn. kırmızı bir elektro gitar",
    money: "Para",
    moneyValue: (n) => `${n} eddie`,
    langNc: '<span lang="en">Night City</span>\'de',
    // Cyberware
    cwHint: "Cyberware için 3 puanın var: Başlangıç etiketi taşıyan her parça 1 puan tutar. İstersen 2 puanı 1 feat puanına çevirebilirsin. Aynı parça iki kez alınamaz. Her parçanın Humanity kaybı maksimum Humanity'den düşülür.",
    cwPoints: "Cyberware puanı",
    cwToFeat: "2 Puanı Feat Puanına Çevir",
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
    levelNote: "The GM decides what level the game starts at. When the level changes, points and choices update to match.",
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
    freePoints: "Free proficiency points",
    freeNote: "The 2 proficiency points gained at level 3 can go to any skill; they aren't tied to a stat.",
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
    featHint: "At this level you can only take tier 1 feats: your Role's feats and general feats. Click a feat to choose it; to keep the point for later levels, press Save the Point.",
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
    qhHint: (n, top) => `${top > 1 ? "You can access tier I and II quickhacks, plus your specialization's tier II quickhacks" : "You can only access tier I quickhacks"}. Choose ${n} of them and add them to your library. Your library is separate from the quickhacks your cyberdeck holds ready: while resting, you pick your ready quickhacks from your library.`,
    specLabel: "Specialization",
    specHint: "Pick one of your Role's two paths. This choice also sets your features at later levels.",
    specRoleFirst: "Specializations depend on your Role. Choose a Role in your Profile first.",
    specFeature: "Level 3 feature",
    melodyTitle: "Melodies",
    melodyHint: (n) => `Pick ${n} melodies from your specialization's list.`,
    melodyPicked: "Melodies chosen",
    qhPicked: "Library",
    qhTier: (n) => `Tier ${n}`,
    langHint: "Every character speaks Streetslang. Choose as many languages as your Role and feats allow.",
    langPicked: "Extra languages",
    finish: "Finish & Save", finishReady: "Create as Pregenerated", readyUpdate: "Update Pregenerated Character", readyUpdated: (n) => `“${n}” updated.`, readyEdit: "Edit", readySwap: "Swap Handle and Real Name", readySwapAsk: (a, b) => `Make the handle “${a}” and the real name “${b}”?`, readySwapYes: "Swap", readySaved: (n) => `“${n}” added to pregenerated characters.`, readyNoName: "Give the character a handle first.",
    readyMember: "Log in to see pregenerated characters.", readyEmpty: "No pregenerated characters yet.", readyPick: "Pick a character on the left to see their sheet.", readyDel: "Remove from Site", readyDelAsk: (n) => `Remove “${n}” from pregenerated characters? Sheets at tables aren't affected.`,
    finishGuest: "You need to log in to save your character. Your draft stays in this browser.",
    kitHint: "Pick one item from each row. Rows with a single option and the items that come with your Role are added automatically.",
    kitRoleFirst: "Your starting kit depends on your Role. Pick a Role in your Profile first.",
    kitFixed: "Included",
    kitInstrument: "Instrument",
    kitInstrumentHint: "E.g. a red electric guitar",
    money: "Money",
    moneyValue: (n) => `${n} eddies`,
    langNc: "In Night City",
    cwHint: "You have 3 points for cyberware: each piece with the Starting tag costs 1 point. If you like, you can convert 2 of the points into 1 feat point. The same piece can't be taken twice. Each piece's Humanity loss is subtracted from maximum Humanity.",
    cwPoints: "Cyberware points",
    cwToFeat: "Convert 2 Points to a Feat Point",
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
    label: { tr: '<span lang="en">Skill</span> Bonusları', en: "Skill Bonuses" },
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
      tr: "Karakter oyuna seviyesine göre feat puanıyla başlar: 1. seviyede 1, 2. ve 3. seviyede 2 puan. Puanlar hemen feat'lere harcanabilir ya da sonraki seviyelerde daha pahalı feat'ler için saklanabilir.",
      en: "Characters start with feat points based on their level: 1 point at level 1, 2 points at levels 2 and 3. Points can be spent on feats right away or saved for pricier feats at later levels.",
    },
    done: () => ccFeatDone(),
    reset: (d) => { d.feat = { picks: [], saved: false }; },
    render: ccFeatStage,
  },
  {
    id: "spec",
    label: { tr: '<span lang="en">Specialization</span>', en: "Specialization" },
    when: (d) => d.seviye >= CC_SPEC_LEVEL,
    intro: {
      tr: "3. seviyede karakter, sınıfının iki specialization'ından birini seçer. Bu yol karakterin nasıl savaştığını ve neyle tanındığını belirler.",
      en: "At level 3, a character picks one of their Role's two specializations. That path shapes how they fight and what they're known for.",
    },
    done: () => ccSpecDone(),
    reset: (d) => { d.spec = { role: null, id: null, melodies: [] }; },
    render: ccSpecStage,
  },
  {
    id: "quickhack",
    label: { tr: '<span lang="en">Quickhack</span> Kütüphanesi', en: "Quickhack Library" },
    when: (d) => d.sinif === "netrunner",
    intro: {
      tr: "Bir Netrunner'ın gücü, cyberdeck'ine yüklediği programlar kadardır. Erişebildiğin kademelerden seçtiğin quickhack'ler kütüphanene girer; sayıları seviyene bağlıdır.",
      en: "A Netrunner is only as good as the programs on their cyberdeck. You choose quickhacks from the tiers you can access and add them to your library; how many depends on your level.",
    },
    done: () => ccQhDone(),
    reset: (d) => { d.quickhack = { picks: [] }; },
    render: ccQhStage,
  },
  {
    id: "cyberware",
    label: { tr: "Cyberware", en: "Cyberware" },
    intro: {
      tr: "Karakter cyberware için 3 puanla başlar ve bunları Başlangıç etiketli parçalara harcar. Her parça bir yuva kaplar ve maksimum Humanity'yi düşürür.",
      en: "Characters start with 3 cyberware points to spend on pieces with the Starting tag. Each piece takes a slot and lowers maximum Humanity.",
    },
    done: () => ccCwDone(),
    reset: (d) => {
      d.cyberware = { picks: [], chipSkill: null, toFeat: false };
      ccTrimFeats();
    },
    render: ccCwStage,
  },
  {
    id: "diller",
    label: { tr: "Diller", en: "Languages" },
    when: (d) => ccLangSlots(d) > 0,
    intro: {
      tr: "Sokakta herkes Streetslang konuşur; ama bir şirketin toplantı odasında, bir çetenin mahallesinde ya da bir göçmen pazarında başka diller duyulur. Sınıfın ya da feat'lerin sana ek dil hakkı veriyorsa o dilleri burada seçersin.",
      en: "Everyone on the street speaks Streetslang, but other languages are heard in a corporate boardroom, a gang's block or an immigrant market. If your Role or feats grant extra languages, you choose them here.",
    },
    done: () => ccLangDone(),
    reset: (d) => { d.diller = { picks: [] }; },
    render: ccLangStage,
  },
  {
    id: "esyalar",
    label: { tr: "Başlangıç Eşyaları", en: "Starting Gear" },
    intro: {
      tr: "Karakter sokağa boş elle çıkmaz. Profil'de seçilen sınıfın başlangıç envanterinden silah ve zırh seçilir; ekipman ve para sınıfla birlikte gelir.",
      en: "Nobody hits the street empty-handed. Pick weapons and armor from the starting kit of the Role chosen in your Profile; gear and money come with the Role.",
    },
    done: () => ccKitDone(),
    reset: (d) => { d.esyalar = { picks: {}, instrument: "" }; },
    render: ccKitStage,
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
    charId: null, // hesapta kayıtlı bir karakter düzenleniyorsa onun kimliği
    readyId: null, // yönetici hazır bir karakteri düzenliyorsa onun kimliği
    data: { profil: {}, sinif: null, seviye: 1, statlar: { method: "pointbuy", buy, dizi }, skiller: { prof: {}, mastery: null }, feat: { picks: [], saved: false }, quickhack: { picks: [] }, cyberware: { picks: [], chipSkill: null, toFeat: false }, diller: { picks: [] }, esyalar: { picks: {}, instrument: "" }, spec: { role: null, id: null, melodies: [] } },
  };
}

// Kayıtlı veriyi (tarayıcıdaki taslak ya da hesaptaki karakter) güncel yapıya oturtur
function ccNormalize(s) {
  const b = ccBlank();
  const st = s.data.statlar || {};
  return {
    stage: s.stage || b.stage,
    sheetShown: s.sheetShown === true,
    charId: s.charId || null,
    readyId: s.readyId || null,
    data: {
      ...b.data,
      ...s.data,
      profil: { ...(s.data.profil || {}) },
      statlar: { method: st.method === "dizi" ? "dizi" : "pointbuy", buy: { ...b.data.statlar.buy, ...(st.buy || {}) }, dizi: { ...b.data.statlar.dizi, ...(st.dizi || {}) }, artis: { ...(st.artis || {}) } },
      skiller: { prof: { ...((s.data.skiller || {}).prof || {}) }, mastery: (s.data.skiller || {}).mastery || null, mastery2: (s.data.skiller || {}).mastery2 || null },
      feat: { picks: [...((s.data.feat || {}).picks || [])], saved: !!(s.data.feat || {}).saved, cross: (s.data.feat || {}).cross || null, extra: (s.data.feat || {}).extra || 0 },
      quickhack: { picks: [...((s.data.quickhack || {}).picks || [])] },
      cyberware: { picks: [...((s.data.cyberware || {}).picks || [])], chipSkill: (s.data.cyberware || {}).chipSkill || null, toFeat: !!(s.data.cyberware || {}).toFeat },
      diller: { picks: [...((s.data.diller || {}).picks || [])] },
      esyalar: { picks: { ...((s.data.esyalar || {}).picks || {}) }, instrument: (s.data.esyalar || {}).instrument || "" },
      spec: { role: (s.data.spec || {}).role || null, id: (s.data.spec || {}).id || null, melodies: [...((s.data.spec || {}).melodies || [])] },
    },
  };
}

function ccLoad() {
  try {
    const s = JSON.parse(localStorage.getItem(CC_KEY));
    if (s && s.data) return ccNormalize(s);
  } catch (e) {}
  return ccBlank();
}

let cc = ccLoad();
let ccViews = []; // açık olan görünümler (sol panel ve sayfa); taslak değişince güncellenir

function ccSave() {
  try { localStorage.setItem(CC_KEY, JSON.stringify(cc)); } catch (e) {}
}

const ccLevel = () => CC_LEVELS[cc.data.seviye] || CC_LEVELS[1];
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
  ccTrimLangs();
  ccTrimKit();
  ccTrimLevel();
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
function ccStatOf(data, id) {
  const st = data.statlar;
  const v = st.method !== "dizi" ? st.buy[id] : id === POINT_BUY.emp.id ? POINT_BUY.emp.base : st.dizi[id];
  return v == null ? v : v + ((st.artis || {})[id] || 0); // artis: seviye atlarken eklenen stat puanları
}
const ccStatVal = (id) => ccStatOf(cc.data, id);

// İnisiyatif: REF modifier'ı, Solo'nun çekirdek feat'i (Ustalık modifier'ının iki katı) ve Kerenzikov
const ccInitMod = (data) => ccWith(data, () => statMod(ccStatVal("REF") ?? 10) + (cc.data.sinif === "solo" ? 2 * ccMasteryMod() : 0) + (cc.data.cyberware.picks.includes("kerenzikov") ? 2 : 0));
// Envanterdeki ilk cyberdeck; RAM'ini Expanded RAM feat'i artırır
const ccDeckOf = (data) => (ccInventory(data).items.map(ccInvItem).find((x) => x && x.deck) || {}).deck;
const ccRamOf = (data) => {
  const deck = ccDeckOf(data);
  return deck ? deck.ram + (((data.feat || {}).picks || []).includes("expanded-ram") ? 2 : 0) : 0;
};
const ccIceOf = (chrome) => chrome.reduce((n, id) => n + (CC_ICE[id] || 0), 0);
// Quickhack savunması: 8 + Netrunning değerinin yarısı (yukarı yuvarlanır) + cyberdeck + Firewall feat'i + Kişisel ICE
function ccQhDefense() {
  const d = cc.data;
  const deck = ccDeckOf(d);
  return 8 + Math.ceil(ccSkillTotal(SKILLS.find((k) => k.id === "netrunning")) / 2) + (deck ? Number(deck.defense) : 0) + (d.feat.picks.includes("firewall") ? ccMasteryMod() : 0) + ccIceOf(d.cyberware.picks);
}
// Tokenin SP'si: giyilen zırh, zırh feat'leri ve SP veren krom
function ccSpOf(raw) {
  return ccWith(raw, () => {
    const worn = ccInventory(cc.data).items.map(ccInvItem).filter((x) => x && x.armor);
    const body = worn.find((x) => x.armor.slot === "govde");
    const head = worn.find((x) => x.armor.slot === "kask");
    const feat = (id) => cc.data.feat.picks.includes(id);
    const chrome = (id, n) => (cc.data.cyberware.picks.includes(id) ? n : 0);
    const sp = (x) => (x ? ARMOR_TIERS[x.armor.tier].sp : 0);
    const kevlar = body && head && body.armor.tier === "kevlar" && head.armor.tier === "kevlar" && feat("kevlar-armor-mastery");
    const military = body && body.armor.tier === "askeri" && feat("military-armor-mastery");
    return { body: sp(body) + (kevlar || military ? 1 : 0) + chrome("subdermal-armor", 1) + chrome("skin-weave", 2) + chrome("titanium-skin", 3), head: sp(head) + chrome("titanium-skin", 3) };
  });
}
const ccHpOf = (data, body) => 10 + 2 * body + (data.feat.picks.includes("tough") ? 5 : 0);

// Kayıtlı karakterin masaya taşınan canlı değerleri
const CC_LUCK = 3; // oturum başına Luck havuzu
function ccVitals(data) {
  const loss = data.cyberware.picks.reduce((n, id) => n + ((CYBERWARE.find((c) => c.id === id) || {}).humanity || 0), 0);
  const hp = ccHpOf(data, ccStatOf(data, "BODY"));
  const humanity = ccStatOf(data, "EMP") * 10 - loss;
  const luck = CC_LUCK + (data.feat.picks.includes("lucky") ? 2 : 0);
  return { hp, hpMax: hp, humanity, humanityMax: humanity, luck, luckMax: luck };
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
// Statın verdiğinden fazla harcanan puanlar serbest puanlardan gelir (3. seviye)
const ccOver = () => CC_STATS.reduce((n, id) => n + Math.max(0, ccUsed(id) - ccPoints(id)), 0);
const ccFreeLeft = () => ccLevel().free - ccOver();
const ccPointsLeft = () => CC_STATS.reduce((n, id) => n + Math.max(0, ccPoints(id) - ccUsed(id)), 0) + ccFreeLeft();

function ccSkillsDone() {
  if (!ccStatsDone()) return false;
  if (ccPointsLeft()) return false;
  const anyProf = SKILLS.some((k) => ccProf(k.id) > 0);
  return !anyProf || !!cc.data.skiller.mastery;
}

// Statlar değişince fazla kalan yetkinlik puanları sondan geri alınır; Ustalık'ın skill'i yetkinliğini kaybettiyse Ustalık kalkar
function ccTrimSkills() {
  const sk = cc.data.skiller;
  for (const id of CC_STATS) {
    const list = SKILLS.filter((k) => k.stat === id).reverse();
    for (const k of list) {
      while (ccFreeLeft() < 0 && ccUsed(id) > ccPoints(id) && ccProf(k.id) > 0) sk.prof[k.id] -= 1;
    }
  }
  if (sk.mastery && !ccProf(sk.mastery)) sk.mastery = null;
}

const ccChipOn = (k) => cc.data.cyberware.picks.includes(CC_CHIP) && cc.data.cyberware.chipSkill === k.id && !ccProf(k.id);
const ccHasMastery = (k) => [cc.data.skiller.mastery, cc.data.skiller.mastery2].includes(k.id);
const ccMasteryMod = () => (cc.data.seviye >= 11 ? 3 : cc.data.seviye >= 5 ? 2 : CC_MASTERY_MOD);
const ccSkillTotal = (k) => {
  const v = ccStatVal(k.stat);
  return (v == null ? 0 : statMod(v)) + ccProf(k.id) + (ccHasMastery(k) ? ccMasteryMod() : 0) + (ccChipOn(k) ? 1 : 0);
};

const ccSkillLabel = (k, lang) => (lang === "tr" && k.gloss ? `${k.name} <span class="cc-gloss">(${k.gloss})</span>` : k.name);

// Onay penceresi: sitedeki öteki onay kutularıyla aynı görünüm; sonuç evet ise true
// tone: "warn" pencereyi ve onay düğmesini sarı yapar
function ccConfirm(text, lang, yesLabel, tone = "") {
  const t = CC_TEXT[lang];
  return new Promise((resolve) => {
    const box = document.createElement("dialog");
    box.className = `auth-dialog cg-confirm ${tone}`.trim();
    box.innerHTML = `
      <form class="auth-panel" method="dialog">
        <p class="cg-confirm-text">${ccEsc(text)}</p>
        <div class="cg-confirm-actions">
          <button type="submit" value="no" class="prof-btn">${t.no}</button>
          <button type="submit" value="yes" class="auth-submit">${yesLabel || t.yes}</button>
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
// Cyberware puanlarından çevrilen feat puanı da sayılır
const ccFeatPoints = () => ccLevel().feat + (cc.data.cyberware.toFeat ? 1 : 0) + (cc.data.feat.extra || 0);
const ccFeatLeft = () => ccFeatPoints() - ccFeatSpent();
const ccFeatDone = () => !!cc.data.sinif && (ccFeatLeft() === 0 || cc.data.feat.saved);

// Sınıf değişince yeni sınıfın alamayacağı feat'ler, çevrilen puan geri alınınca puanı yetmeyen feat'ler bırakılır
function ccTrimFeats() {
  const pool = ccFeatPool();
  const fd = cc.data.feat;
  fd.picks = fd.picks.filter((id) => pool.some((f) => f.id === id));
  while (ccFeatLeft() < 0) fd.picks.pop();
  fd.saved = fd.saved && ccFeatLeft() > 0; // saklanacak puan kalmadıysa işaret de kalkar
}

// Seçili feat'e tekrar basınca bırakılır; puan yetmiyorsa en eski seçim bırakılıp yenisi alınır
function ccPickFeat(id) {
  const fd = cc.data.feat;
  if (fd.picks.includes(id)) fd.picks = fd.picks.filter((x) => x !== id);
  else {
    const f = FEATS.find((x) => x.id === id);
    while (fd.picks.length && f.tier > ccFeatLeft()) fd.picks.shift();
    if (f.tier <= ccFeatLeft()) {
      fd.picks.push(id);
      fd.saved = fd.saved && ccFeatLeft() > 0;
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

// ---- Quickhack: Netrunner erişebildiği kademelerden seviyesine göre 3, 4 ya da 6 quickhack'i kütüphanesine ekler.
// Specialization quickhack'leri 3. seviyede, specialization seçilince listeye girer. Renk Netrunning listesindeki gibi: genel quickhack'ler yeşil.
const ccQhLib = () => ccLevel().qh;
const ccQhPool = () => QUICKHACKS.filter((q) => q.tier <= ccLevel().qhTier && (!q.spec || q.spec === (ccSpec() || {}).id));
const ccQhPicks = () => cc.data.quickhack.picks.map((id) => QUICKHACKS.find((q) => q.id === id)).filter(Boolean);
const ccQhDone = () => cc.data.quickhack.picks.length === ccQhLib();

function ccPickQh(id) {
  const qd = cc.data.quickhack;
  if (qd.picks.includes(id)) qd.picks = qd.picks.filter((x) => x !== id);
  else if (qd.picks.length < ccQhLib()) qd.picks.push(id);
  else return;
  ccChanged(true);
}

// Genel quickhack'ler yeşil, specialization quickhack'leri o specialization'ın renginde
const ccQhColor = (q) => (q.spec ? SPEC_COLORS[CLASSES.find((c) => c.id === "netrunner").specs.findIndex((s) => s.id === q.spec)] : "#39ff14");

// Quickhack kutucuğu: adı, altında kademesi, RAM'i ve türü
function ccQhChip(q, lang) {
  return ccChip(ccQhColor(q), q.name, ccPlain(q.desc[lang]), `<b lang="en">${q.name}</b><small>${QH_ROMAN[q.tier]} · ${q.ram} RAM · ${QH_TYPES[q.type][lang]}</small>`);
}

// ---- Diller: herkes Streetslang bilir; sınıfın ek dil hakkı ve Polyglot (2 dil) kadar dil seçilir
const CC_LANG_BASE = "streetslang";
const ccLangPool = () => LANGUAGES.filter((l) => l.id !== CC_LANG_BASE);
const ccLangSlots = (d = cc.data) => ((CLASSES.find((c) => c.id === d.sinif) || {}).extraLanguages || 0) + (d.feat.picks.includes("polyglot") ? 2 : 0);
const ccLangPicks = () => cc.data.diller.picks.map((id) => LANGUAGES.find((l) => l.id === id)).filter(Boolean);
const ccLangDone = () => cc.data.diller.picks.length === ccLangSlots();

function ccTrimLangs() {
  const ld = cc.data.diller;
  while (ld.picks.length > ccLangSlots()) ld.picks.pop();
}

function ccPickLang(id) {
  const ld = cc.data.diller;
  if (ld.picks.includes(id)) ld.picks = ld.picks.filter((x) => x !== id);
  else if (ld.picks.length < ccLangSlots()) ld.picks.push(id);
  else return;
  ccChanged(true);
}

// Dil kutucuğu: adı; üstüne gelince dilin açıklaması
function ccLangChip(l, lang) {
  return ccChip("#39ff14", l.name[lang], ccPlain([].concat(l.desc[lang]).join(" ")), `<b>${l.name[lang]}</b>`, lang);
}

// ---- Specialization: 3. seviyede seçilir. Rockerboy ayrıca specialization'ının listesinden 2 melodi seçer (CLASSES[].melodyPicks).
const ccRole = () => CLASSES.find((c) => c.id === cc.data.sinif);
function ccSpec() {
  const { role, id } = cc.data.spec;
  const r = ccRole();
  return (r && role === r.id && (r.specs || []).find((x) => x.id === id)) || null;
}
const ccSpecColor = () => SPEC_COLORS[ccRole().specs.indexOf(ccSpec())]; // seçilen specialization'ın rengi
const ccMelodyCount = () => Object.entries((ccRole() || {}).melodyPicks || {}).reduce((n, [lv, k]) => n + (Number(lv) <= cc.data.seviye ? k : 0), 0);
const ccMelodyList = () => {
  const spec = ccSpec();
  return (spec && ((ccRole().melodies || {})[spec.id] || [])) || [];
};
const ccMelodyPicks = () => cc.data.spec.melodies.map((id) => ccMelodyList().find((m) => m.name.en === id)).filter(Boolean);
const ccSpecDone = () => !!ccSpec() && cc.data.spec.melodies.length === ccMelodyCount();

function ccPickSpec(id) {
  const sp = cc.data.spec;
  const same = sp.role === cc.data.sinif && sp.id === id;
  cc.data.spec = same ? { role: null, id: null, melodies: [] } : { role: cc.data.sinif, id, melodies: [] };
  ccChanged(true);
}

function ccPickMelody(id) {
  const sp = cc.data.spec;
  if (sp.melodies.includes(id)) sp.melodies = sp.melodies.filter((x) => x !== id);
  else if (sp.melodies.length < ccMelodyCount()) sp.melodies.push(id);
  else return;
  ccChanged(true);
}

// Seviye ya da sınıf değişince artık geçerli olmayan seçimler bırakılır
const ccLevelOptions = () => Array.from({ length: CC_MAX_LEVEL }, (_, i) => i + 1)
  .map((n) => `<option value="${n}"${n === cc.data.seviye ? " selected" : ""}>${n}</option>`)
  .join("");

function ccTrimLevel() {
  const sp = cc.data.spec;
  if (sp.id && (cc.data.seviye < CC_SPEC_LEVEL || !ccSpec())) cc.data.spec = { role: null, id: null, melodies: [] };
  ccTrimFeats();
  const qd = cc.data.quickhack;
  const pool = ccQhPool();
  qd.picks = qd.picks.filter((id) => pool.some((q) => q.id === id)).slice(0, ccQhLib());
}

// ---- Başlangıç Eşyaları: sınıfların başlangıç envanteri. slots: seçilecek eşyalar (arac: VEHICLES, ötekiler ITEMS kimlikleri),
// fixed: hazır gelenler [kimlik, adet], money: başlangıç parası, instrument: oyuncunun kendi yazdığı enstrüman (Rockerboy).
const CC_KIT_SLOTS = {
  arac: { tr: "Araç", en: "Vehicle" },
  silah: { tr: "Ateşli Silah", en: "Firearm" },
  yakin: { tr: "Yakın Dövüş Silahı", en: "Melee Weapon" },
  zirh: { tr: "Zırh", en: "Body Armor" },
  kask: { tr: "Kask", en: "Helmet" },
};
const CC_KIT_KEVLAR = { zirh: ["deri-ceket", "kevlar-yelek"], kask: ["motosiklet-kaski", "kevlar-bere"] };
const CC_KIT = {
  solo: { slots: { silah: ["lexington", "unity", "ajax"], yakin: ["katana"], zirh: ["deri-ceket", "kevlar-yelek", "hafif-armorjack"], kask: ["motosiklet-kaski", "kevlar-bere", "devriye-kaski"] }, fixed: [["yedek-sarjor", 3]], money: 450 },
  netrunner: { slots: { silah: ["lexington"], yakin: ["kelebek-bicagi"], ...CC_KIT_KEVLAR }, fixed: [["paraline", 1], ["yedek-sarjor", 2]], money: 500 },
  medtech: { slots: { silah: ["lexington"], yakin: ["kelebek-bicagi"], ...CC_KIT_KEVLAR }, fixed: [["medkit", 1], ["yedek-sarjor", 2]], money: 600 },
  rockerboy: { slots: { silah: ["lexington", "unity"], yakin: ["kelebek-bicagi"], ...CC_KIT_KEVLAR }, fixed: [["yedek-sarjor", 2]], money: 500, instrument: true },
  lawman: { slots: { silah: ["lexington", "unity", "saratoga", "pulsar", "carnage"], yakin: ["katana"], ...CC_KIT_KEVLAR }, fixed: [["yedek-sarjor", 2]], money: 500 },
  nomad: { slots: { arac: ["motosiklet", "kompakt"], silah: ["lexington", "unity", "carnage"], yakin: ["katana"], ...CC_KIT_KEVLAR }, fixed: [["yedek-sarjor", 2]], money: 400 },
};
const ccKit = () => CC_KIT[cc.data.sinif];
const ccKitItem = (slot, id) => (slot === "arac" ? VEHICLES : ITEMS).find((x) => x.id === id);
const ccKitSlots = () => Object.keys((ccKit() || {}).slots || {}).sort((a, b) => Object.keys(CC_KIT_SLOTS).indexOf(a) - Object.keys(CC_KIT_SLOTS).indexOf(b));
// Tek seçenekli satırlarda eşya kendiliğinden gelir
function ccKitPick(slot) {
  const opts = ccKit().slots[slot];
  return opts.length === 1 ? opts[0] : cc.data.esyalar.picks[slot] || null;
}
const ccKitDone = () => !!ccKit() && ccKitSlots().every(ccKitPick) && (!ccKit().instrument || !!cc.data.esyalar.instrument.trim());

// Sınıf değişince yeni envanterde olmayan seçimler bırakılır
function ccTrimKit() {
  const { picks } = cc.data.esyalar;
  const kit = ccKit();
  for (const slot of Object.keys(picks)) {
    if (!kit || !(kit.slots[slot] || []).includes(picks[slot])) delete picks[slot];
  }
}

function ccPickKit(slot, id) {
  const { picks } = cc.data.esyalar;
  if (ccKit().slots[slot].length > 1) {
    if (picks[slot] === id) delete picks[slot];
    else picks[slot] = id;
    ccChanged(true);
  }
}

const ccKitDetail = (slot, x, lang) => (slot === "arac" ? `HP ${x.hp} · ${x.speed} m` : [itemKind(x, lang), itemPower(x)].filter((v) => v !== "-").join(" · "));

function ccKitChip(slot, x, lang) {
  return ccChip("#39ff14", x.name[lang], `${ccKitDetail(slot, x, lang)}. ${ccPlain(x.flavor ? x.flavor[lang] : x.desc[lang])}`, `<b>${x.name[lang]}</b>`, lang);
}

// Karakter kağıdı ve Gözden Geçir için: seçilen ve hazır gelen eşyalar { slot, x, qty }
function ccKitList() {
  const kit = ccKit();
  if (!kit) return [];
  const picked = ccKitSlots().filter(ccKitPick).map((slot) => ({ slot, x: ccKitItem(slot, ccKitPick(slot)), qty: 1 }));
  return [...picked, ...kit.fixed.map(([id, qty]) => ({ slot: "fixed", x: ITEMS.find((it) => it.id === id), qty }))];
}
const ccKitName = (e, lang) => `${e.qty > 1 ? `${e.qty} × ` : ""}${e.x.name[lang]}`;

// Masadaki envanter: GM düzenleyince kağıdın data.envanter alanına yazılır, o zamana kadar başlangıç envanteridir.
// { money, items: [{ id: eşya | vehicle: araç | name: özel eşya, qty }] }
function ccInventory(data) {
  if (data.envanter) return data.envanter;
  const kit = CC_KIT[data.sinif];
  if (!kit) return { money: 0, items: [] };
  const picks = (data.esyalar || {}).picks || {};
  const items = [];
  for (const slot of Object.keys(kit.slots)) {
    const id = kit.slots[slot].length === 1 ? kit.slots[slot][0] : picks[slot];
    if (id) items.push(slot === "arac" ? { vehicle: id, qty: 1 } : { id, qty: 1 });
  }
  for (const [id, qty] of kit.fixed) items.push({ id, qty });
  const instrument = ((data.esyalar || {}).instrument || "").trim();
  if (instrument) items.push({ name: instrument, qty: 1 });
  return { money: kit.money, items };
}
const ccInvItem = (e) => (e.vehicle ? VEHICLES.find((x) => x.id === e.vehicle) : e.id ? ITEMS.find((x) => x.id === e.id) : null);
const ccInvName = (e, lang) => {
  const x = ccInvItem(e);
  return `${e.qty > 1 ? `${e.qty} × ` : ""}${x ? x.name[lang] : e.name}`;
};
function ccInvChip(e, lang) {
  const x = ccInvItem(e);
  if (!x) return `<span class="cc-chip" style="--chip: #39ff14"><b>${ccEsc(ccInvName(e, lang))}</b></span>`;
  return ccKitChip(e.vehicle ? "arac" : "fixed", { ...x, name: { [lang]: ccInvName(e, lang) } }, lang);
}

// ---- Cyberware: 3 puan, Başlangıç listesindeki her parça 1 puan; aynı parça iki kez alınmaz, bölgenin yuva sayısı aşılmaz.
// Puanların 2'si 1 feat puanına çevrilebilir (toFeat).
const ccCwPool = () => CYBERWARE.filter((c) => (c.tags || []).includes("baslangic"));
const ccCwPicks = () => cc.data.cyberware.picks.map((id) => CYBERWARE.find((c) => c.id === id)).filter(Boolean);
const ccCwSlots = (c) => ((c.tags || []).includes("iki-slot") ? 2 : 1);
const ccCwLoss = () => ccCwPicks().reduce((n, c) => n + c.humanity, 0);
const ccCwSlotUsed = (slot) => ccCwPicks().filter((c) => c.slot === slot).reduce((n, c) => n + ccCwSlots(c), 0);
const ccCwFits = (c) => ccCwSlotUsed(c.slot) + ccCwSlots(c) <= (CC_SLOT_CAP[c.slot] || 0);
const ccCwPoints = () => CC_CW_POINTS - (cc.data.cyberware.toFeat ? CC_CW_TO_FEAT : 0);
function ccCwDone() {
  const cw = cc.data.cyberware;
  return cw.picks.length === ccCwPoints() && (!cw.picks.includes(CC_CHIP) || !!cw.chipSkill);
}
// Maksimum Humanity: EMP × 10 − takılı cyberware'lerin Humanity kayıpları
const ccMaxHumanity = () => ccStatVal("EMP") * 10 - ccCwLoss();
// Karakter kağıdındaki Humanity: mevcut / maksimum. Yeni karakterde mevcut, maksimuma eşittir.
let ccLiveHumanity = null; // masadaki kağıtta oyun sırasındaki değer
const ccHumanityText = () => ccLiveHumanity ?? `${ccMaxHumanity()} / ${ccMaxHumanity()}`;

function ccPickCw(id) {
  const cw = cc.data.cyberware;
  if (cw.picks.includes(id)) {
    cw.picks = cw.picks.filter((x) => x !== id);
    if (id === CC_CHIP) cw.chipSkill = null;
  } else {
    const c = CYBERWARE.find((x) => x.id === id);
    if (cw.picks.length >= ccCwPoints() || !ccCwFits(c)) return;
    cw.picks.push(id);
  }
  ccChanged(true);
}

// 2 cyberware puanını 1 feat puanına çevirir ya da geri alır; puan azalınca son seçilen parçalar bırakılır
function ccToggleCwFeat() {
  const cw = cc.data.cyberware;
  cw.toFeat = !cw.toFeat;
  while (cw.picks.length > ccCwPoints()) {
    if (cw.picks.pop() === CC_CHIP) cw.chipSkill = null;
  }
  ccTrimFeats();
  ccChanged(true);
}
const ccEmptyChips = (n) => `<span class="cc-chip empty" aria-hidden="true"></span>`.repeat(Math.max(0, n));
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
    } else if ((x = b("[data-dil]")) && !b(".tip-ref")) {
      ccPickLang(x.dataset.dil);
    } else if ((x = b("[data-cc-finish]"))) {
      ccFinish(x, lang);
    } else if ((x = b("[data-cc-ready]"))) {
      ccMakeReady(x, lang);
    } else if ((x = b("[data-kit]")) && !b(".tip-ref")) {
      ccPickKit(x.dataset.kit, x.dataset.kitId);
    } else if ((x = b("[data-spec]")) && !b(".tip-ref")) {
      ccPickSpec(x.dataset.spec);
    } else if ((x = b("[data-melody]")) && !b(".tip-ref")) {
      ccPickMelody(x.dataset.melody);
    } else if (b("[data-cw-feat]")) {
      ccToggleCwFeat();
    } else if (b("[data-feat-save]")) {
      const fd = cc.data.feat;
      fd.saved = !fd.saved;
      if (fd.saved && !ccFeatLeft()) fd.picks.pop(); // saklanacak puan kalmadıysa son seçim bırakılır
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
      ccConfirm(t.confirmStage(ccPlain(s.label[lang])), lang).then((ok) => {
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
    const c = e.target.closest("[data-feat], [data-qh], [data-cw], [data-dil], [data-kit], [data-spec], [data-melody]");
    if (c && e.target === c && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      if (c.dataset.feat) ccPickFeat(c.dataset.feat);
      else if (c.dataset.qh) ccPickQh(c.dataset.qh);
      else if (c.dataset.dil) ccPickLang(c.dataset.dil);
      else if (c.dataset.kit) ccPickKit(c.dataset.kit, c.dataset.kitId);
      else if (c.dataset.spec) ccPickSpec(c.dataset.spec);
      else if (c.dataset.melody) ccPickMelody(c.dataset.melody);
      else ccPickCw(c.dataset.cw);
    }
  });

  el.addEventListener("input", (e) => {
    if (e.target.matches("[data-feat-search]")) {
      ccFeatQuery = e.target.value;
      ccFilterFeats(panel);
      return;
    }
    if (e.target.matches("[data-kit-instrument]")) {
      cc.data.esyalar.instrument = e.target.value;
      ccChanged(false);
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
      ccTrimSkills();
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
// Masadaki kağıt: başka bir karakterin verisiyle aynı kağıdı çizer (js/room.js). humanity: oyundaki Humanity yazısı
// Yardımcılar açık taslağa bakar; başka bir kağıt için kısa süreliğine onun verisine geçilir
function ccWith(data, fn) {
  const keep = cc;
  cc = ccNormalize({ data });
  try {
    return fn();
  } finally {
    cc = keep;
  }
}
function ccSheetOf(data, lang, humanity) {
  ccLiveHumanity = humanity;
  try {
    return ccWith(data, () => ccSheetHtml(lang));
  } finally {
    ccLiveHumanity = null;
  }
}

// Karakterin ateşli silahının şarjörü: silah yuvası envanterin başındadır, silahı yoksa 0
const ccMagOf = (data) => ((ccInventory(data).items.map(ccInvItem).find((x) => x && x.weapon && x.weapon.mag) || {}).weapon || {}).mag || 0;

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
  rows.push(`<div class="cc-row cc-row-derived">${cell(t.hp, body == null ? "" : String(ccHpOf(d, body)))}${cell(t.humanity, touched || ccCwLoss() ? ccHumanityText() : "")}${cell(CC_QH_DV, touched ? String(ccQhDefense()) : "")}${ccRamOf(d) ? cell("RAM", String(ccRamOf(d))) : ""}</div>`);

  // Skill'ler: yetkin olunanlar, toplam değerleriyle
  const prof = SKILLS.filter((k) => ccProf(k.id) > 0 || ccChipOn(k))
    .map((k) => `<span class="cc-skill">${k.name} <b>${fmtMod(ccSkillTotal(k))}</b>${ccHasMastery(k) ? ` <em>${t.mastery}</em>` : ""}${ccChipOn(k) ? ` <em>${t.chip}</em>` : ""}</span>`)
    .join("");
  rows.push(`<div class="cc-row"><div class="cc-cell wide"><b>${t.skills}</b><div class="cc-skills">${prof || "&nbsp;"}</div></div></div>`);

  // Feat'ler, quickhack'ler ve cyberware'ler kutucuk olarak; seçilmeyenler kesik çizgili boş kutu
  const chipsRow = (label, chips) => `<div class="cc-row"><div class="cc-cell wide"><b>${label}</b><div class="cc-chips">${chips}</div></div></div>`;
  const feats = d.feat.picks.map((id) => FEATS.find((f) => f.id === id)).filter(Boolean);
  const featLeft = ccFeatLeft();
  const saved = d.feat.saved && featLeft > 0
    ? `<span class="cc-chip saved"><small>${t.savedChip}</small><b>${featLeft}</b></span>`
    : ccEmptyChips(featLeft);
  rows.push(chipsRow(t.feats, feats.map((f) => ccFeatChip(f, lang)).join("") + saved));
  if (d.sinif === "netrunner") {
    const qhs = ccQhPicks();
    rows.push(chipsRow(t.quickhacks, qhs.map((q) => ccQhChip(q, lang)).join("") + ccEmptyChips(ccQhLib() - qhs.length)));
  }
  if (d.seviye >= CC_SPEC_LEVEL) {
    const spec = ccSpec();
    const gained = spec ? Object.entries(spec.features || {}).filter(([lv]) => Number(lv) <= d.seviye).map(([, f]) => f) : [];
    const color = spec && ccSpecColor();
    const chips = spec
      ? [
          ccChip(color, spec.name[lang], ccPlain(spec.summary[lang]), `<b lang="en">${spec.name[lang]}</b>`),
          ...gained.map((f) => ccChip(color, f.name, ccPlain(f[lang]), `<b lang="en">${f.name}</b><small>${t.specFeature}</small>`)),
          ...ccMelodyPicks().map((m) => ccChip(color, m.name[lang], ccPlain(m.effect[lang]), `<b>${m.name[lang]}</b><small>${m.type[lang]} · ${m.duration[lang]}</small>`, lang)),
        ].join("")
      : ccEmptyChips(1);
    rows.push(chipsRow(t.specLabel, chips + (spec ? ccEmptyChips(ccMelodyCount() - ccMelodyPicks().length) : "")));
  }
  const cws = ccCwPicks();
  rows.push(chipsRow(t.cyberware, cws.map((c) => ccCwChip(c, lang)).join("") + ccEmptyChips(ccCwPoints() - cws.length)));
  const base = LANGUAGES.find((l) => l.id === CC_LANG_BASE);
  const langs = ccLangPicks();
  rows.push(chipsRow(t.languages, [base, ...langs].map((l) => ccLangChip(l, lang)).join("") + ccEmptyChips(ccLangSlots() - langs.length)));
  const kit = ccKit();
  const instrument = (d.esyalar.instrument || "").trim();
  const gear = [...ccKitList().map((e) => ccKitChip(e.slot, { ...e.x, name: { [lang]: ccKitName(e, lang) } }, lang)), ...(kit && instrument ? [`<span class="cc-chip" style="--chip: #39ff14"><b>${ccEsc(instrument)}</b></span>`] : [])];
  const inv = d.envanter; // masada GM'in düzenlediği envanter
  rows.push(chipsRow(t.gear, inv ? inv.items.map((e) => ccInvChip(e, lang)).join("") : gear.join("") + (kit ? "" : ccEmptyChips(4))));
  rows.push(`<div class="cc-row">${cell(t.money, inv ? t.moneyValue(inv.money) : kit ? t.moneyValue(kit.money) : "", " wide")}</div>`);
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
  return `
    <h3 class="cc-sub">${t.identity}</h3>
    <div class="cc-fields">${fields}</div>
    <h3 class="cc-sub">${t.role} <span class="cc-req">${t.required}</span></h3>
    <div class="cc-roles">${roles}</div>
    <h3 class="cc-sub">${t.startLevel}</h3>
    <div class="cc-field cc-level">
      <label for="cc-level">${t.level}</label>
      <select id="cc-level" data-level>${ccLevelOptions()}</select>
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
        <span>${t.hp}: <b>${body == null ? "—" : ccHpOf(cc.data, body)}</b></span>
        <span>${t.humanity}: <b>${ccHumanityText()}</b></span>
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
        const can = on || n - p <= Math.max(0, pts - used) + ccFreeLeft();
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
          <span class="sk-pts${!pts && !used ? " none" : used >= pts ? " full" : ""}">${pts || used ? `${used} / ${pts}` : t.noPoints}</span>
        </div>
        <div class="sk-cols"><div>${t.skills}</div><div>${t.base}</div><div>${t.prof}</div><div>${t.mastery}</div><div>${t.total}</div></div>
        ${rows}
      </div>`;
  }).join("");
  return `
    <p class="cc-hint">${t.profNote}</p>
    ${ccLevel().free ? `<p class="cc-hint">${t.freeNote}</p>` : ""}
    <div class="sk-summary">
      <div><b>${t.pointsLeft}</b><span class="${ccPointsLeft() ? "" : "full"}">${ccPointsLeft()}</span></div>
      ${ccLevel().free ? `<div><b>${t.freePoints}</b><span class="${ccFreeLeft() ? "" : "full"}">${ccFreeLeft()} / ${ccLevel().free}</span></div>` : ""}
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
  const left = ccFeatLeft();
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
      <div><b>${t.featPoints}</b><span class="${left && !saved ? "" : "full"}">${left} / ${ccFeatPoints()}${saved ? ` · ${t.savedState}` : ""}</span></div>
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
  const full = qd.picks.length >= ccQhLib();
  const card = (q) => {
    const on = qd.picks.includes(q.id);
    const off = !on && full;
    return `
      <div class="cf-card cw-card${on ? " on" : ""}${off ? " off" : ""}" role="button" tabindex="0" aria-pressed="${on}" aria-disabled="${off}" data-qh="${q.id}" style="--feat: ${ccQhColor(q)}">
        <div class="cf-top">
          <b lang="en">${q.name}</b>
          <span class="cf-tier">${t.qhTier(q.tier)} · ${q.ram} RAM · ${QH_TYPES[q.type][lang]}</span>
        </div>
        <p class="cf-desc">${linkTerms(q.desc[lang], lang)}</p>
      </div>`;
  };
  return `
    <p class="cc-hint">${t.qhHint(ccQhLib(), ccLevel().qhTier)}</p>
    <div class="sk-summary">
      <div><b>${t.qhPicked}</b><span class="${full ? "full" : ""}">${qd.picks.length} / ${ccQhLib()}</span></div>
    </div>
    <div class="cf-grid">${ccQhPool().map(card).join("")}</div>`;
}

// ---------- Cyberware ----------

function ccCwStage(lang) {
  const t = CC_TEXT[lang];
  const cw = cc.data.cyberware;
  const left = ccCwPoints() - cw.picks.length;
  const full = left <= 0;
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
    <div class="sk-summary cf-summary">
      <div><b>${t.cwPoints}</b><span class="${full ? "full" : ""}">${left} / ${ccCwPoints()}</span></div>
      <div><b>${t.cwLoss}</b><span class="full">${ccCwLoss()}</span></div>
      <div><b>${t.maxHumanity}</b><span class="full">${ccMaxHumanity()}</span></div>
      <button type="button" class="cs-method${cw.toFeat ? " on" : ""}" data-cw-feat aria-pressed="${cw.toFeat}">${t.cwToFeat}</button>
    </div>
    ${groups}`;
}

// ---------- Diller ----------

function ccLangStage(lang) {
  const t = CC_TEXT[lang];
  const ld = cc.data.diller;
  const slots = ccLangSlots();
  const full = ld.picks.length >= slots;
  const card = (l) => {
    const on = ld.picks.includes(l.id);
    const off = !on && full;
    return `
      <div class="cf-card cw-card${on ? " on" : ""}${off ? " off" : ""}" role="button" tabindex="0" aria-pressed="${on}" aria-disabled="${off}" data-dil="${l.id}" style="--feat: #39ff14">
        <div class="cf-top">
          <b>${l.name[lang]}</b>
          <span class="cf-tier">${l.where[lang]}</span>
        </div>
        <p class="cw-flavor">${t.langNc}: ${l.nc[lang]}</p>
        ${[].concat(l.desc[lang]).map((para) => `<p class="cf-desc">${para}</p>`).join("")}
      </div>`;
  };
  return `
    <p class="cc-hint">${t.langHint}</p>
    <div class="sk-summary">
      <div><b>${t.langPicked}</b><span class="${full ? "full" : ""}">${ld.picks.length} / ${slots}</span></div>
    </div>
    <div class="cf-grid">${ccLangPool().map(card).join("")}</div>`;
}

// ---------- Specialization ----------

function ccSpecStage(lang) {
  const t = CC_TEXT[lang];
  const role = ccRole();
  if (!role) return `<p class="cc-hint">${t.specRoleFirst}</p>`;
  const chosen = ccSpec();
  const specCard = (x, i) => {
    const on = chosen === x;
    const f = x.features && x.features[CC_SPEC_LEVEL];
    return `
      <div class="cf-card cw-card${on ? " on" : ""}" role="button" tabindex="0" aria-pressed="${on}" data-spec="${x.id}" style="--feat: ${SPEC_COLORS[i]}">
        <div class="cf-top"><b lang="en">${x.name[lang]}</b></div>
        <p class="cf-desc">${x.summary[lang]}</p>
        ${f ? `<p class="cw-flavor">${t.specFeature}: <span lang="en">${f.name}</span></p><p class="cf-desc">${linkTerms(f[lang], lang)}</p>` : ""}
      </div>`;
  };
  const count = ccMelodyCount();
  const picked = cc.data.spec.melodies;
  const full = picked.length >= count;
  const melodyCard = (m) => {
    const id = m.name.en;
    const on = picked.includes(id);
    const off = !on && full;
    return `
      <div class="cf-card cw-card${on ? " on" : ""}${off ? " off" : ""}" role="button" tabindex="0" aria-pressed="${on}" aria-disabled="${off}" data-melody="${ccEsc(id)}" style="--feat: ${ccSpecColor()}">
        <div class="cf-top">
          <b>${m.name[lang]}</b>
          <span class="cf-tier">${m.type[lang]} · ${m.duration[lang]}</span>
        </div>
        <p class="cf-desc">${linkTerms(m.effect[lang], lang)}</p>
      </div>`;
  };
  return `
    <p class="cc-hint">${t.specHint}</p>
    <div class="cf-grid">${role.specs.map(specCard).join("")}</div>
    ${chosen && count ? `
    <h3 class="cc-sub">${t.melodyTitle}</h3>
    <p class="cc-hint">${t.melodyHint(count)}</p>
    <div class="sk-summary">
      <div><b>${t.melodyPicked}</b><span class="${full ? "full" : ""}">${picked.length} / ${count}</span></div>
    </div>
    <div class="cf-grid">${ccMelodyList().map(melodyCard).join("")}</div>` : ""}`;
}

// ---------- Başlangıç Eşyaları ----------

function ccKitStage(lang) {
  const t = CC_TEXT[lang];
  const kit = ccKit();
  if (!kit) return `<p class="cc-hint">${t.kitRoleFirst}</p>`;
  const card = (slot, id, only) => {
    const x = ccKitItem(slot, id);
    const on = ccKitPick(slot) === id;
    return `
      <div class="cf-card cw-card${on ? " on" : ""}" role="button" tabindex="0" aria-pressed="${on}" aria-disabled="${only}" data-kit="${slot}" data-kit-id="${id}" style="--feat: #39ff14">
        <div class="cf-top">
          <b>${x.name[lang]}</b>
          <span class="cf-tier">${ccKitDetail(slot, x, lang)}</span>
        </div>
        <p class="cf-desc">${x.flavor ? x.flavor[lang] : x.desc[lang]}</p>
      </div>`;
  };
  const groups = ccKitSlots()
    .map((slot) => {
      const opts = kit.slots[slot];
      return `<h3 class="cc-sub">${CC_KIT_SLOTS[slot][lang]}</h3><div class="cf-grid">${opts.map((id) => card(slot, id, opts.length === 1)).join("")}</div>`;
    })
    .join("");
  const fixed = kit.fixed.map(([id, qty]) => ccKitChip("fixed", { ...ITEMS.find((it) => it.id === id), name: { [lang]: ccKitName({ qty, x: ITEMS.find((it) => it.id === id) }, lang) } }, lang)).join("");
  return `
    <p class="cc-hint">${t.kitHint}</p>
    ${groups}
    ${kit.instrument ? `
    <h3 class="cc-sub">${t.kitInstrument}</h3>
    <div class="cc-field wide"><input type="text" data-kit-instrument maxlength="60" value="${ccEsc(cc.data.esyalar.instrument)}" placeholder="${ccEsc(t.kitInstrumentHint)}" aria-label="${ccEsc(t.kitInstrument)}" autocomplete="off"></div>` : ""}
    <h3 class="cc-sub">${t.kitFixed}</h3>
    <div class="cc-chips">${fixed}<span class="cc-chip" style="--chip: #39ff14"><b>${t.moneyValue(kit.money)}</b></span></div>`;
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
      ${row(t.hp, String(ccHpOf(cc.data, ccStatVal("BODY"))))}
      ${row(t.humanity, ccHumanityText())}
      <h3>${CC_STAGES[2].label[lang]}</h3>
      ${row(t.skills, skills)}
      <h3>${CC_STAGES[3].label[lang]}</h3>
      ${row(t.feats, [...cc.data.feat.picks.map((id) => (FEATS.find((f) => f.id === id) || { name: { [lang]: id } }).name[lang]), ...(cc.data.feat.saved ? [`${t.savedChip}: ${ccFeatLeft()}`] : [])].join(" · "))}
      ${ccActive().filter((s) => s.id === "spec").map((s) => `<h3>${s.label[lang]}</h3>${row(t.specLabel, ccSpec() ? ccSpec().name[lang] : "")}${ccMelodyCount() ? row(t.melodyTitle, ccMelodyPicks().map((m) => m.name[lang]).join(" · ")) : ""}`).join("")}
      ${ccActive().filter((s) => s.id === "quickhack").map((s) => `<h3>${s.label[lang]}</h3>${row(t.quickhacks, ccQhPicks().map((q) => q.name).join(" · "))}`).join("")}
      <h3>${t.cyberware}</h3>
      ${row(t.cyberware, ccCwPicks().map((c) => `${c.name[lang]}${c.id === CC_CHIP && cc.data.cyberware.chipSkill ? ` (${(SKILLS.find((k) => k.id === cc.data.cyberware.chipSkill) || {}).name})` : ""}`).join(" · "))}
      ${row(t.cwLoss, String(ccCwLoss()))}
      <h3>${t.languages}</h3>
      ${row(t.languages, ["Streetslang", ...ccLangPicks().map((l) => l.name[lang])].join(" · "))}
      <h3>${t.gear}</h3>
      ${row(t.gear, [...ccKitList().map((e) => ccKitName(e, lang)), ...(ccEsc((cc.data.esyalar.instrument || "").trim()) ? [ccEsc(cc.data.esyalar.instrument.trim())] : [])].join(" · "))}
      ${row(t.money, ccKit() ? t.moneyValue(ccKit().money) : "")}
    </div>
    <div class="cc-field cc-level">
      <label for="cc-level">${t.level}</label>
      <select id="cc-level" data-level>${ccLevelOptions()}</select>
    </div>
    <div class="cc-finish">
      ${cc.readyId ? "" : `<button type="button" class="cc-btn primary" data-cc-finish>${t.finish}</button>`}
      ${window.CG_ROLE && window.CG_ROLE.admin ? `<button type="button" class="cc-btn warn" data-cc-ready>${cc.readyId ? t.readyUpdate : t.finishReady}</button>` : ""}
      <p class="cc-finish-msg" role="status"></p>
    </div>`;
}

// Karakteri hesaba kaydeder; hesapta kayıtlı bir karakter düzenleniyorsa onun üzerine yazar
// Yalnızca yöneticilerde görünür; yazma izni Firestore kurallarındadır
async function ccMakeReady(btn, lang) {
  const t = CC_TEXT[lang];
  const msg = btn.parentElement.querySelector(".cc-finish-msg");
  const show = (text, err) => {
    msg.textContent = text;
    msg.classList.toggle("err", err);
  };
  const name = cc.data.profil.handle.trim();
  if (!name) return show(t.readyNoName, true);
  btn.disabled = true;
  try {
    await window.CG_STORE.saveReadyChar({ id: cc.readyId, name, role: cc.data.sinif, data: JSON.parse(JSON.stringify(cc.data)) });
    show(cc.readyId ? t.readyUpdated(name) : t.readySaved(name), false);
  } catch (err) {
    show(window.CG_STORE.errorText(err), true);
  } finally {
    btn.disabled = false;
  }
}

async function ccFinish(btn, lang) {
  const t = CC_TEXT[lang];
  const msg = btn.parentElement.querySelector(".cc-finish-msg");
  const store = window.CG_STORE;
  const show = (text, err) => {
    msg.textContent = text;
    msg.classList.toggle("err", err);
  };
  if (!store || !store.canSaveChars()) {
    show(t.finishGuest, true);
    return;
  }
  btn.disabled = true;
  try {
    const r = await store.saveChar({ id: cc.charId, name: cc.data.profil.handle.trim(), role: cc.data.sinif, data: JSON.parse(JSON.stringify(cc.data)) });
    show(r.msg, !r.ok);
    if (r.ok) {
      cc.charId = r.id;
      ccSave();
    }
  } catch (err) {
    show(store.errorText(err), true);
  } finally {
    btn.disabled = false;
  }
}

// Hesaptaki karakteri oluşturucuya yükler (js/auth.js, soldaki panel)
window.CG_CHAR_LOAD = (entry) => {
  cc = ccNormalize({ stage: "gozden-gecir", charId: entry.id, data: entry.data });
  ccChanged(true);
};

// Hazır Karakterler sayfası: solda liste, sağda seçili karakterin kağıdı; yönetici siteden kaldırabilir
function mountReadyChars(el, lang) {
  const t = CC_TEXT[lang];
  const role = window.CG_ROLE;
  if (!role || !role.ready) {
    el.innerHTML = `<p class="npc-empty">…</p>`;
    return;
  }
  if (!role.member) {
    el.innerHTML = `<p class="placeholder">${t.readyMember}</p>`;
    return;
  }
  let list = [];
  let selId = null;
  el.innerHTML = `
    <div class="npc-book">
      <div class="npc-left"><ul class="npc-list"><li class="npc-empty">…</li></ul></div>
      <div class="npc-right"><p class="npc-empty">${t.readyPick}</p></div>
    </div>`;
  const listEl = el.querySelector(".npc-list");
  const right = el.querySelector(".npc-right");
  const roleName = (c) => (CLASSES.find((k) => k.id === c.role) || {}).name || "";
  const drawList = () => {
    listEl.innerHTML = list.length
      ? [...list].sort((a, b) => a.name.localeCompare(b.name, lang)).map((c) => `<li><button type="button" class="npc-row${c.id === selId ? " on" : ""}" data-id="${c.id}"><b>${ccEsc(c.name)}</b><small>${ccEsc(roleName(c))} · ${c.data.seviye || 1}</small></button></li>`).join("")
      : `<li class="npc-empty">${t.readyEmpty}</li>`;
  };
  const drawSheet = () => {
    const c = list.find((x) => x.id === selId);
    if (!c) {
      right.innerHTML = `<p class="npc-empty">${t.readyPick}</p>`;
      return;
    }
    const v = ccVitals(ccNormalize({ data: c.data }).data);
    right.innerHTML = `
      ${role.admin ? `<div class="npc-tools"><button type="button" class="cc-btn" data-ready-swap>${t.readySwap}</button><button type="button" class="cc-btn" data-ready-edit>${t.readyEdit}</button><button type="button" class="cc-btn danger" data-ready-del>${t.readyDel}</button></div>` : ""}
      <div class="cc-sheet-body" style="--sheet-color: ${CLASS_COLORS[c.role] || "#fff"}">${ccSheetOf(c.data, lang, `${v.humanity} / ${v.humanityMax}`).replaceAll("#39ff14", "var(--sheet-color)")}</div>`;
  };
  const load = async () => {
    try {
      list = await window.CG_STORE.listReadyChars();
      drawList();
      drawSheet();
    } catch (err) {
      listEl.innerHTML = `<li class="npc-empty err">${ccEsc(window.CG_STORE.errorText(err))}</li>`;
    }
  };
  el.addEventListener("click", async (e) => {
    const row = e.target.closest(".npc-row");
    if (row) {
      selId = row.dataset.id;
      drawList();
      drawSheet();
      return;
    }
    if (e.target.closest("[data-ready-swap]")) {
      const c = list.find((x) => x.id === selId);
      const p = c.data.profil || {};
      const handle = (p.name || "").trim();
      const real = (p.handle || "").trim();
      if (!handle || !(await ccConfirm(t.readySwapAsk(handle, real), lang, t.readySwapYes))) return;
      try {
        await window.CG_STORE.saveReadyChar({ id: c.id, name: handle, role: c.role, data: { ...c.data, profil: { ...p, handle, name: real } } });
        load();
      } catch (err) {
        alert(window.CG_STORE.errorText(err));
      }
      return;
    }
    if (e.target.closest("[data-ready-edit]")) {
      const c = list.find((x) => x.id === selId);
      cc = ccNormalize({ stage: "gozden-gecir", readyId: c.id, data: c.data });
      ccSave();
      location.hash = "#araclar/karakter-olustur";
      return;
    }
    if (!e.target.closest("[data-ready-del]")) return;
    const c = list.find((x) => x.id === selId);
    if (!c || !(await ccConfirm(t.readyDelAsk(c.name), lang, t.readyDel))) return;
    try {
      await window.CG_STORE.deleteReadyChar(c.id);
      selId = null;
      load();
    } catch (err) {
      alert(window.CG_STORE.errorText(err));
    }
  });
  load();
}

TOOLS["ready-chars"] = mountReadyChars;
TOOLS["char-steps"] = mountCharSteps;
TOOLS["char-create"] = mountCharCreate;
