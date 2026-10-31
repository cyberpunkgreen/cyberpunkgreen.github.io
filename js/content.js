// Sayfa içerikleri. Anahtar: "anabaşlık/altbaşlık" (js/main.js içindeki MENU ile aynı id'ler).
//
// intro    : başlığın hemen altındaki giriş metni (soldaki panelde "Giriş" katmanı)
// sections : sayfanın bölümleri; her biri soldaki panelde bir katman olur.
//            body yazılmamışsa yerine "henüz yazılmadı" kutusu çıkar.
//
// Metinler HTML'dir. Kullanılabilecek hazır parçalar:
//   <div class="formula">...</div>                      büyük formül kutusu
//   <div class="example"><b>Örnek</b><p>...</p></div>     örnek kutusu
//   <p class="note">...</p>                              kısa not
//                      henüz kesinleşmemiş kural etiketi
//   <table class="rules">...</table>                     kural tablosu

// Sınıflar. Sıra, sınıfların eklenme sırasıdır (tablonun varsayılan sıralaması).
// specs: iki specialization [{ id, name, summary (kaba açıklama), desc?, features?: { 3: { name, tr, en }, 5: …, 8: …, 9: … } }]; yoksa yer tutucu gösterilir.
//        3. seviye özelliği spec seçimiyle gelen küçük ilavedir; Netrunner'da spec quickhack'leri, Rockerboy'da melodiler bunun yerini tutar.
// extraLanguages: Streetslang dışında bilinen ek dil sayısı (yoksa 0).
// gear: başlangıç envanteri (sol panelde tablonun altındaki kutu).
// quote: sınıfın ilk bölümü, anlatıcının (tools.js içindeki CLASS_NARRATOR) ağzından tek paragraflık özet.
const CLASSES = [
  {
    id: "solo",
    specs: [
      {
        id: "a",
        name: { tr: "Bodyguard", en: "Bodyguard" },
        summary: {
          tr: "Bodyguard'lar kendileri için değil, başkalarını korumak için savaşır. Saldırı tüfeğiyle bir alanı tutar, korudukları kişiyle mermi arasına girer ve o kişi ayakta kaldıkça geri adım atmazlar.",
          en: "Bodyguards don't fight for themselves but to protect others. They hold a position with an assault rifle, step between the bullet and the person they guard, and never fall back while that person is still standing.",
        },
        features: {
          3: { name: "Take the Bullet", tr: "Bitişiğindeki bir dostuna saldırı isabet ettiğinde Reaction'ını harcayıp saldırıyı üstüne alabilirsin. Hasar ve varsa kritik yara dostuna değil sana gelir; bu hasara senin zırhın işler.", en: "When an attack hits an ally adjacent to you, you can spend your Reaction to take the attack yourself. The damage and any critical injury land on you instead of your ally, and your armor applies." },
          5: { name: "Hardened", tr: "Take the Bullet'la üstüne aldığın saldırının hasarı 1 + Ustalık modifier'ın kadar azalır. Bu azalma zırhtan sonra uygulanır.", en: "Damage from an attack you take with Take the Bullet is reduced by 1 + your Mastery modifier. This reduction applies after armor." },
          8: { name: "Return Fire", tr: "Bitişiğindeki bir dostuna menzilli bir saldırı isabet ettiğinde Reaction'ını harcayıp saldırana bir saldırı yapabilirsin. Bunu savaş başına Ustalık modifier'ın kadar kez yapabilirsin.", en: "When a ranged attack hits an ally adjacent to you, you can spend your Reaction to make an attack against the attacker. You can do this a number of times per combat equal to your Mastery modifier." },
          9: { name: "Last Line", tr: "Bitişiğindeki bir dostun Ölümcül Yaralı olduğunda, bir sonraki turunda fazladan bir aksiyon kazanırsın. O turun sonuna kadar sana yapılan saldırılar dezavantajlıdır.", en: "When an ally adjacent to you becomes Mortally Wounded, you gain an extra action on your next turn. Until the end of that turn, attacks against you have disadvantage." },
        },
      },
      {
        id: "b",
        name: { tr: "Duellante", en: "Duellante" },
        summary: {
          tr: "Duellante'ler yakın dövüşün ve çevikliğin ustalarıdır. Kalabalığın içinden bir rakip seçer, mermilerin arasından süzülüp ona ulaşır ve o düşene kadar bırakmazlar.",
          en: "Duellantes are masters of close combat and agility. They pick a single opponent out of the crowd, slip through the bullets to reach them and don't let go until they fall.",
        },
        features: {
          3: { name: "Chosen Foe", tr: "Bonus aksiyonla, görüş alanındaki bir düşmanı rakibin olarak seçebilirsin. O düşman düşene ya da sen başka birini seçene kadar rakibin olarak kalır. Rakibine yaptığın yakın dövüş saldırılarının zarlarına ve onun yakın dövüş saldırılarına karşı attığın Evasion zarlarına +1 eklersin.", en: "As a bonus action, you can choose an enemy you can see as your foe. It stays your foe until it falls or you choose another. You add +1 to your melee attack rolls against your foe and to your Evasion rolls against its melee attacks." },
          5: { name: "Footwork", tr: "Chosen Foe ile seçtiğin rakibine isabet ettirdiğin her yakın dövüş saldırısından sonra bedava 2 metre (1 kare) hareket edebilirsin.", en: "After each melee attack you land on the foe you chose with Chosen Foe, you can move 2 meters (1 square) for free." },
          8: { name: "Deflect", tr: "Elinde bir yakın dövüş silahı varken sana menzilli bir saldırı isabet ederse, Reaction'ını harcayıp saldırının hasarını yarıya indirebilirsin (yukarı yuvarlanır). Bunu savaş başına Ustalık modifier'ın kadar kez yapabilirsin.", en: "When a ranged attack hits you while you're holding a melee weapon, you can spend your Reaction to halve its damage (rounded up). You can do this a number of times per combat equal to your Mastery modifier." },
          9: { name: "Finisher", tr: "Savaş başına bir kez, Ağır Yaralı bir düşmana isabet ettirdiğin yakın dövüş saldırısı kritik yara sayılır. Bunun için hasarın yine hedefin SP'sini geçmesi gerekir.", en: "Once per combat, a melee attack you land on a Seriously Wounded enemy counts as a critical injury. The damage still has to beat the target's SP." },
        },
      },
    ],
    gear: [
      { label: { tr: "Silahlar", en: "Weapons" }, items: { tr: ["Ağır tabancaya kadar bir tabanca ya da Orta menzilli bir ateşli silah", "Orta bir yakın dövüş silahı"], en: ["A pistol up to heavy, or a medium-range firearm", "A medium melee weapon"] } },
      { label: { tr: "Zırh", en: "Armor" }, items: { tr: ["Taktik seviyesine kadar bir zırh", "Taktik seviyesine kadar bir kask"], en: ["Body armor, up to Tactical", "A helmet, up to Tactical"] } },
      { label: { tr: "Ekipman", en: "Gear" }, items: { tr: ["3 yedek şarjör", "450 eddie"], en: ["3 spare magazines", "450 eddies"] } },
    ],
    quote: {
      tr: `Yetmiş birin kışıydı, Watson'da bir barda oturuyordum. İçeri bir Solo girdi. Kimseye bakmadı, kimse de ona bakmadı, öyle bir şey işte. Barmen kahvesini önüne koydu, adam ödemedi, barmen de sesini çıkarmadı. Yarım saat sonra kalktı gitti. Ertesi sabah kanaldan üç ceset çıkardılar. Ben bu tiplerden hep uzak durdum evlat, kollarının içinde ne taşıdıklarını bilemezsin. Ama bir gün başın gerçekten belaya girerse, dua et yanında öyle biri olsun.`,
      en: `Winter of seventy-one, I was sitting in a bar in Watson. A Solo walked in. Didn't look at anybody, nobody looked at him, it was that kind of thing. The bartender set a coffee in front of him, he didn't pay, the bartender didn't say a word. Half an hour later he got up and left. Next morning they pulled three bodies out of the canal. I always kept clear of that type, kid, you never know what they're carrying inside those arms. But if you ever get into real trouble, pray one of them is standing next to you.`,
    },
    name: "Solo",
    stats: ["REF", "DEX", "BODY"],
    core: { tr: "İnisiyatif atışlarına Ustalık modifier'ının iki katını eklersin.", en: "You add twice your Mastery modifier to your initiative rolls." },
  },
  {
    id: "netrunner",
    // Sınıfa özel seviye kazanımları: quickhack kademelerine erişim ve kütüphaneye eklenen quickhack'ler (specialization'dan bağımsız).
    // "specqh": seçili specialization'ın o seviyede açılan quickhack'leri (seçim yoksa gösterilmez).
    // 3. seviyedekiler işarete gerek olmadan Specialization bölümünün içinde, açıklamanın hemen altında gösterilir.
    levels: {
      1: [
        { h: { tr: `<span lang="en">Quickhack</span> Kademesi I`, en: "Quickhack Tier I" }, p: { tr: `I. kademe quickhack'leri kullanabilirsin. Bütün quickhack'ler <a href="#players-guide/netrunning">Oyuncu Rehberi › Netrunning</a> sayfasındadır.`, en: `You can use tier I quickhacks. All quickhacks are on the <a href="#players-guide/netrunning">Player's Guide › Netrunning</a> page.` } },
        { h: { tr: `<span lang="en">Quickhack</span> Kütüphanesi`, en: "Quickhack Library" }, p: { tr: `Erişebildiğin kademelerden 3 quickhack seçip kütüphanene eklersin. Kütüphanen, cyberdeck'inde hazır tuttuğun quickhack'lerden ayrıdır: hazır quickhack'lerini dinlenirken kütüphanenden seçersin.`, en: `You choose 3 quickhacks from the tiers you can access and add them to your library. Your library is separate from the quickhacks your cyberdeck holds ready: while resting, you pick your ready quickhacks from your library.` } },
      ],
      2: [
        { h: { tr: `Ek <span lang="en">Quickhack</span>`, en: "Extra Quickhack" }, p: { tr: `1 quickhack seçip kütüphanene eklersin.`, en: `You choose 1 quickhack and add it to your library.` } },
      ],
      3: [
        { h: { tr: `<span lang="en">Quickhack</span> Kademesi II`, en: "Quickhack Tier II" }, p: { tr: `II. kademe quickhack'leri kullanabilirsin.`, en: `You can use tier II quickhacks.` } },
        { h: { tr: `Ek <span lang="en">Quickhack</span>`, en: "Extra Quickhacks" }, p: { tr: `2 quickhack seçip kütüphanene eklersin.`, en: `You choose 2 quickhacks and add them to your library.` } },
      ],
      5: [
        { h: { tr: `Ek <span lang="en">Quickhack</span>`, en: "Extra Quickhacks" }, p: { tr: `2 quickhack seçip kütüphanene eklersin.`, en: `You choose 2 quickhacks and add them to your library.` } },
      ],
      7: [
        { h: { tr: `<span lang="en">Quickhack</span> Kademesi III`, en: "Quickhack Tier III" }, p: { tr: `III. kademe quickhack'leri kullanabilirsin.`, en: `You can use tier III quickhacks.` } },
        { h: { tr: `Ek <span lang="en">Quickhack</span>`, en: "Extra Quickhack" }, p: { tr: `1 quickhack seçip kütüphanene eklersin.`, en: `You choose 1 quickhack and add it to your library.` } },
        "specqh",
      ],
      9: [
        { h: { tr: `Ek <span lang="en">Quickhack</span>`, en: "Extra Quickhacks" }, p: { tr: `2 quickhack seçip kütüphanene eklersin.`, en: `You choose 2 quickhacks and add them to your library.` } },
      ],
      10: [
        { h: { tr: `<span lang="en">Quickhack</span> Kademesi IV`, en: "Quickhack Tier IV" }, p: { tr: `IV. kademe quickhack'leri kullanabilirsin.`, en: `You can use tier IV quickhacks.` } },
        "specqh",
      ],
      11: [
        { h: { tr: `Ek <span lang="en">Quickhack</span>`, en: "Extra Quickhack" }, p: { tr: `1 quickhack seçip kütüphanene eklersin.`, en: `You choose 1 quickhack and add it to your library.` } },
      ],
    },
    specs: [
      {
        id: "a",
        name: { tr: "Infiltrator", en: "Infiltrator" },
        summary: {
          tr: "Infiltrator'lar kapıdan değil, ağdan girer. Kameraları kör eder, gözleri yanıltır, anıları siler; iş bittiğinde orada olduklarını kimse hatırlamaz. Savaşmaktansa hiç görülmeden girip çıkmayı tercih ederler.",
          en: "Infiltrators come in through the network, not the door. They blind cameras, fool eyes and wipe memories; when the job is done, nobody remembers they were ever there. They'd rather slip in and out unseen than fight.",
        },
        features: {
          5: { name: "Low Footprint", tr: "Gizlilik türündeki quickhack'lerinin RAM maliyeti 1 azalır.", en: "Your Covert quickhacks cost 1 less RAM." },
          8: { name: "Backdoor", tr: "Bir cihaza quickhack yaptığında içinde bir arka kapı bırakırsın. O oturumun sonuna kadar bu cihaza onu görmeden quickhack yapabilirsin ve bu quickhack'lerin RAM maliyeti 1 azalır (en az 1).", en: "When you quickhack a device, you leave a backdoor in it. For the rest of the session, you can quickhack that device without seeing it, and doing so costs 1 less RAM (minimum 1)." },
          9: { name: "Ghost in the Machine", tr: "Oturum başına bir kez, savaş dışında 10 dakika harcayarak bir binanın güvenlik ağına yerleşebilirsin. Bunun için neuroport'unla o ağa bağlı herhangi bir cihaza bağlanman yeter. O binada kaldığın sürece kameraları, kapıları ve alarmları quickhack kullanmadan açıp kapatabilirsin.", en: "Once per session, outside combat, you can spend 10 minutes settling into a building's security network. Plugging your neuroport into any device on that network is enough. While you stay in that building, you can switch its cameras, doors and alarms on and off without using quickhacks." },
        },
      },
      {
        id: "b",
        name: { tr: "Overseer", en: "Overseer" },
        summary: {
          tr: "Overseer'lar savaş alanını tepeden yönetir. Taretler, dronlar, kameralar ve araçlar onların elinde düşmana çevrilen silahlardır. Bir Overseer'ın olduğu yerde düşman kendi makinelerine bile güvenemez.",
          en: "Overseers run the battlefield from above. Turrets, drones, cameras and vehicles become weapons in their hands, turned against the enemy. Wherever an Overseer is at work, the enemy can't even trust its own machines.",
        },
        features: {
          5: { name: "Drone Breaker", tr: "Dronlara, robotlara ve mech'lere yaptığın quickhack atışlarına Ustalık modifier'ını eklersin.", en: "You add your Mastery modifier to quickhack rolls against drones, robots and mechs." },
          8: { name: "Grid Control", tr: "Kameralara, taretlere, kapılara ve alarmlara yaptığın quickhack'lerin RAM maliyeti 1 azalır (en az 1).", en: "Your quickhacks against cameras, turrets, doors and alarms cost 1 less RAM (minimum 1)." },
          9: { name: "Swarm Command", tr: "Savaş başına bir kez, Friendly Mode, Override ya da Puppet'ı aynı anda iki hedefe yapabilirsin. RAM'i yalnızca bir kez ödersin.", en: "Once per combat, you can use Friendly Mode, Override or Puppet on two targets at once, paying the RAM only once." },
        },
      },
    ],
    gear: [
      { label: { tr: "Silahlar", en: "Weapons" }, items: { tr: ["Orta tabancaya kadar bir tabanca", "Hafif bir yakın dövüş silahı"], en: ["A pistol, up to medium", "A light melee weapon"] } },
      { label: { tr: "Zırh", en: "Armor" }, items: { tr: ["Kevlar seviyesine kadar bir zırh", "Kevlar seviyesine kadar bir kask"], en: ["Body armor, up to Kevlar", "A helmet, up to Kevlar"] } },
      { label: { tr: "Ekipman", en: "Gear" }, items: { tr: ["Bir cyberdeck", "2 yedek şarjör", "500 eddie"], en: ["A cyberdeck", "2 spare magazines", "500 eddies"] } },
    ],
    quote: {
      tr: `Torunumun bir arkadaşı vardı, Mika. On dokuz yaşında. Bütün gün odasında, kafasında o kablolar, gözleri kapalı, uyuyor sanırsın. Adamlar ona para verirdi, o da oturduğu yerden kapı açardı, kamera kör ederdi, ne istersen. Bir gece kapısını çaldım, açmadı. Sabah açtık, yine aynı yerde oturuyordu. Doktor "beyni yanmış" dedi, o lafı ilk kez o gün duydum. Şimdi senin ekipte de öyle biri varmış. Söyle ona, ne yapıyorsa yapsın, ama arada bir fişi çekip pencereden dışarı baksın.`,
      en: `My grandson had a friend, Mika. Nineteen. All day in his room, those cables in his head, eyes shut, you'd think he was asleep. People paid him, and from that chair he'd open doors, blind cameras, whatever you wanted. One night I knocked on his door, he didn't answer. In the morning we opened it, he was sitting right where he'd been. The doctor said "his brain burned out", first time I ever heard those words. Now I hear your crew's got one of those. Tell them to do whatever they do, but once in a while pull the plug and look out a window.`,
    },
    name: "Netrunner",
    stats: ["INT", "TECH"],
    core: {
      tr: "Her türden cyberdeck'i kullanabilir ve onun aracılığıyla quickhack yapabilirsin. Quickhack kullanmak senin için bir bonus aksiyondur.",
      en: "You can use any kind of cyberdeck and run quickhacks through it. For you, using a quickhack is a bonus action.",
    },
  },
  {
    id: "medtech",
    specs: [
      {
        id: "a",
        name: { tr: "Ripperdoc", en: "Ripperdoc" },
        summary: {
          tr: "Ripperdoc'lar bedenin sınırlarını kromla aşar. Kol söker, göz takar, sinir uçlarını makineye bağlarlar; ellerinden geçen kimse bir daha eskisi gibi olmaz.",
          en: "Ripperdocs push the body past its limits with chrome. They take off arms, fit new eyes and wire nerve endings into machines; nobody who passes through their hands is ever quite the same.",
        },
        features: {
          3: { name: "Back-Alley Install", tr: "Başlangıç parçalarını ve hafif ya da orta cyberware'leri takıp sökebilirsin. Bu işi savaş dışında, sakin bir yerde ve bir medkitle yaparsın. İş 1 saat sürer ve parçanın ağırlığına göre belirlenen tamir DV'sine karşı Cybertech atarsın. Başarısız olursan bir saat sonra yeniden deneyebilirsin. Kendi kromunu takıp sökemezsin.", en: "You can install and remove starting pieces and light or medium cyberware. You do this outside combat, somewhere quiet, with a medkit. It takes 1 hour, and you roll Cybertech against the repair DV for the piece's weight. If you fail, you can try again an hour later. You can't install or remove your own chrome." },
          5: { name: "Steady Hands", tr: "İleri cyberware'i de takıp sökebilirsin.", en: "You can also install and remove advanced cyberware." },
          8: { name: "Full Conversion", tr: "Ağır cyberware'i de takıp sökebilirsin.", en: "You can also install and remove heavy cyberware." },
          9: { name: "Limit Breaker", tr: "Bir kişinin nöral sistem ve dahili dışındaki vücut bölgelerinden birine fazladan 1 yuva açabilirsin. Bunu her kişiye yalnızca bir kez yapabilirsin. Açılan yuvanın Humanity kaybı 2'dir. İşi savaş dışında, sakin bir yerde ve bir medkitle yaparsın; iş 1 saat sürer ve DV 17'ye karşı Cybertech atarsın.", en: "You can open 1 extra slot in one of a person's body areas other than the neural system and internal. You can do this only once per person. The new slot has a Humanity loss of 2. You do this outside combat, somewhere quiet, with a medkit; it takes 1 hour, and you roll Cybertech against DV 17." },
        },
      },
      {
        id: "b",
        name: { tr: "Exorcist", en: "Exorcist" },
        summary: {
          tr: "Exorcist'ler makinenin içine kaçan insanı geri çeker. Kromu söker, psikozu yatıştırır, kopmak üzere olanı hayata bağlarlar; yanlarında kalan biri insanlığını daha kolay korur.",
          en: "Exorcists pull back the person who slipped into the machine. They strip out chrome, calm psychosis and tie people on the edge back to life; whoever stays near them holds on to their humanity more easily.",
        },
        features: {
          3: { name: "Anchor", tr: "4 metre (2 kare) yakınındaki dostların cyberpsychosis krizinde attıkları Mental Resist atışlarına senin Ustalık modifier'ını ekler.", en: "Allies within 4 meters (2 squares) of you add your Mastery modifier to their Mental Resist rolls in a cyberpsychosis crisis." },
          5: { name: "Read the Chrome", tr: "Birinin Humanity basamağını yalnızca ona bakarak anlayabilirsin.", en: "You can tell someone's Humanity tier just by looking at them." },
          8: { name: "Unplug", tr: "Cyberware sökebilirsin. Bu işi savaş dışında, sakin bir yerde ve bir medkitle yaparsın. İş 1 saat sürer ve parçanın ağırlığına göre belirlenen tamir DV'sine karşı Cybertech atarsın. Parçanın sahibi, söktüğün parçanın Humanity kaybının tamamı kadar Humanity'yi hemen geri kazanır (başkası söktüğünde yalnızca yarısı geri gelir). Kendi kromunu sökemezsin.", en: "You can remove cyberware. You do this outside combat, somewhere quiet, with a medkit. It takes 1 hour, and you roll Cybertech against the repair DV for the piece's weight. The owner immediately regains Humanity equal to the removed piece's full Humanity loss (when anyone else removes it, only half comes back). You can't remove your own chrome." },
          9: { name: "Pull Back", tr: "Oturum başına bir kez, Humanity'si Uçurumda olan bir dostun krizde başarısız olup Cyberpsycho olacakken onu geri çekebilirsin. Dostun Cyberpsycho olmak yerine kısa süreli bir psikoz yaşar.", en: "Once per session, when an ally On the Brink fails a crisis and is about to become a Cyberpsycho, you can pull them back. They go through a short psychosis instead." },
        },
      },
    ],
    gear: [ // fazla medkit ve diğer iyileştirme eşyaları satın alınır
      { label: { tr: "Silahlar", en: "Weapons" }, items: { tr: ["Orta tabancaya kadar bir tabanca", "Hafif bir yakın dövüş silahı"], en: ["A pistol, up to medium", "A light melee weapon"] } },
      { label: { tr: "Zırh", en: "Armor" }, items: { tr: ["Kevlar seviyesine kadar bir zırh", "Kevlar seviyesine kadar bir kask"], en: ["Body armor, up to Kevlar", "A helmet, up to Kevlar"] } },
      { label: { tr: "Ekipman", en: "Gear" }, items: { tr: ["1 medkit", "2 yedek şarjör", "600 eddie"], en: ["1 medkit", "2 spare magazines", "600 eddies"] } },
    ],
    quote: {
      tr: `Bir keresinde omzumda kurşunla Kabuki'de bir garaja girdim. Kadın tek kelime sormadı. Masaya yatırdı, ağzıma bir bez tıktı, yirmi dakikada çıkardı. Eskiden hastanede çalışmış, Trauma Team'e girmeye de uğraşmış galiba, sonra bırakmış. Ya da atmışlar, bilmiyorum, sormadım. Para da istemedi, "sonra getirirsin" dedi. Getirdim. O kroma bulanmış ellerini hiç sevmedim, yalan yok. Ama bir daha vurulursam yine o kapıyı çalarım.`,
      en: `Once I walked into a garage in Kabuki with a bullet in my shoulder. The woman didn't ask a single question. Laid me on the table, stuffed a rag in my mouth, had it out in twenty minutes. Used to work at a hospital, tried to get into Trauma Team too I think, then quit. Or they threw her out, I don't know, I didn't ask. Didn't even want money, said "bring it later". I did. Never liked those chrome-covered hands of hers, I won't lie. But if I get shot again, that's the door I'm knocking on.`,
    },
    name: "Medtech",
    stats: ["TECH", "WILL"],
    core: { tr: "Senin gözetiminde bir gece dinlenen herkes, sen de dahil, iki kat iyileşir.", en: "Everyone who rests for a night under your care, you included, heals double." },
  },
  {
    id: "rockerboy",
    extraLanguages: 1, // Streetslang dışında bilinen ek dil sayısı
    specs: [
      {
        id: "a",
        name: { tr: "Headliner", en: "Headliner" },
        summary: {
          tr: "Headliner'lar afişteki ilk isimdir. Sahneye çıktıklarında bütün ışıklar onlara döner ve kalabalık onlarla birlikte nefes alır. Ekipleri de o kalabalığın bir parçasıdır: onların ritmini duyan herkes daha cesur savaşır ve daha hızlı koşar.",
          en: "Headliners are the first name on the poster. When they take the stage, every light turns to them and the crowd breathes with them. Their crew is part of that crowd too: everyone who hears their rhythm fights more bravely and runs faster.",
        },
        features: {
          5: { name: "Hype Train", tr: "Bir buff melodisi çaldığın turda, melodinin etkilediği dostlarından biri hemen bedava 4 metre (2 kare) hareket edebilir.", en: "On the turn you play a buff melody, one of the allies it affects can immediately move 4 meters (2 squares) for free." },
          8: { name: "Rally", tr: "Savaş başına bir kez, bir bonus aksiyon harcayıp ekibini toparlayabilirsin. Seni duyan bütün dostların 1d6 HP kazanır ve artık baskı ateşi yüzünden sipere kaçmak zorunda kalmaz.", en: "Once per combat, you can spend a bonus action to rally your crew. Every ally who can hear you regains 1d6 HP and no longer has to run for cover because of suppressive fire." },
          9: { name: "Standing Ovation", tr: "Savaş başına bir kez, aksiyonunu harcayıp çalabilirsin. Seni duyan bütün dostların kendi bir sonraki turlarında fazladan bir bonus aksiyon kazanır. Bu çalış şarj harcamaz ve aynı anda tek melodi sınırına girmez.", en: "Once per combat, you can spend your action to play. Every ally who can hear you gains an extra bonus action on their next turn. This doesn't use a charge and doesn't count toward the one-melody-at-a-time limit." },
        },
      },
      {
        id: "b",
        name: { tr: "Noisemaker", en: "Noisemaker" },
        summary: {
          tr: "Noisemaker'lar müziği bir silah gibi kullanır. Kulağı tırmalayan, kasıtlı olarak bozuk çalınan seslerle düşmanlarının aklını karıştırır, onları yavaşlatır ve korkuturlar.",
          en: "Noisemakers use music as a weapon. With grating, deliberately broken sounds they scramble their enemies' minds, slow them down and frighten them.",
        },
        features: {
          5: { name: "Ear Splitter", tr: "Debuff melodine direnen hedef 1d6 hasar alır; zırh bu hasara işlemez.", en: "A target that resists your debuff melody takes 1d6 damage; armor doesn't apply to it." },
          8: { name: "Black Note", tr: "Bir düşman debuff melodine direnemezse, onun bir sonraki turunda bonus aksiyon kullanmasını engelleyebilirsin. Bunu savaş başına Ustalık modifier'ın kadar kez yapabilirsin.", en: "When an enemy fails to resist your debuff melody, you can stop it from using a bonus action on its next turn. You can do this a number of times per combat equal to your Mastery modifier." },
          9: { name: "Dead Air", tr: "Debuff melodilerine karşı atılan Mental Resist atışları dezavantajlıdır.", en: "Mental Resist rolls against your debuff melodies have disadvantage." },
        },
      },
    ],
    // Hangi seviyede kaç melodi öğrenildiği ("İlave Melodi Sayfaları")
    melodyPicks: { 3: 2, 5: 2, 8: 2 },
    // Melodiler (taslak): specialization id → [{ name, type, duration, effect }]. Liste 7'den kısaysa yer tutucu satırla tamamlanır.
    // a = Headliner, buff odaklı (4 buff + debuff listesinden 2 + temaya uymayan 1), b = Noisemaker, debuff odaklı (4 debuff + buff listesinden 2 + temaya uymayan 1).
    // Adlar açık isimle ve yalnızca diyezsiz/bemolsüz notalarla yazılır (Do, Re, Mi, Fa, Sol, La, Si × Majör/Minör).
    melodies: {
      a: [
        { name: { tr: "Re Majör", en: "D Major" }, type: { tr: "Buff", en: "Buff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Dostların saldırı zarlarına +1.", en: "Allies get +1 to attack rolls." } },
        { name: { tr: "Mi Majör", en: "E Major" }, type: { tr: "Buff", en: "Buff" }, duration: { tr: "3 tur", en: "3 rounds" }, effect: { tr: "Dostların hareketi 4 metre (2 kare) artar ve hareketleri fırsat saldırısına yol açmaz.", en: "Allies' movement increases by 4 meters (2 squares), and their movement doesn't provoke opportunity attacks." } },
        { name: { tr: "La Majör", en: "A Major" }, type: { tr: "Buff", en: "Buff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Dostların mermiden kaçarken attığı Evasion zarlarına +2.", en: "Allies get +2 to Evasion rolls when dodging bullets." } },
        { name: { tr: "Do Majör", en: "C Major" }, type: { tr: "Buff", en: "Buff" }, duration: { tr: "3 tur", en: "3 rounds" }, effect: { tr: "Dostlar ölüm kurtarma atışlarını avantajla yapar ve Ağır Yaralı cezası almaz.", en: "Allies make death saves with advantage and ignore the Seriously Wounded penalty." } },
        { name: { tr: "Re Minör", en: "D Minor" }, type: { tr: "Debuff", en: "Debuff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Tek hedef: hareketi yarıya iner.", en: "One target: movement is halved." } },
        { name: { tr: "Mi Minör", en: "E Minor" }, type: { tr: "Debuff", en: "Debuff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Tek hedef: Reaction kullanamaz, mermiden kaçamaz.", en: "One target: can't use Reactions or dodge bullets." } },
        { name: { tr: "Do Minör", en: "C Minor" }, type: { tr: "Debuff", en: "Debuff" }, duration: { tr: "1 tur", en: "1 round" }, effect: { tr: "Tek hedef: Rockerboy'a olan mesafesini kısaltacak şekilde hareket edemez; uzaklaşabilir ya da yerinde kalabilir.", en: "One target: can't move in any way that brings it closer to the Rockerboy; it can move away or stay put." } },
      ],
      b: [
        { name: { tr: "Sol Minör", en: "G Minor" }, type: { tr: "Debuff", en: "Debuff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Tek hedef: saldırı zarlarını dezavantajla atar.", en: "One target: makes attack rolls with disadvantage." } },
        { name: { tr: "Re Minör", en: "D Minor" }, type: { tr: "Debuff", en: "Debuff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Tek hedef: hareketi yarıya iner.", en: "One target: movement is halved." } },
        { name: { tr: "Mi Minör", en: "E Minor" }, type: { tr: "Debuff", en: "Debuff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Tek hedef: Reaction kullanamaz, mermiden kaçamaz.", en: "One target: can't use Reactions or dodge bullets." } },
        { name: { tr: "Fa Minör", en: "F Minor" }, type: { tr: "Debuff", en: "Debuff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Rockerboy'un 12 metre (6 kare) çevresindeki düşmanlar: saldırı ve skill zarlarına −1.", en: "Enemies within 12 meters (6 squares) of the Rockerboy: −1 to attack and skill rolls." } },
        { name: { tr: "Mi Majör", en: "E Major" }, type: { tr: "Buff", en: "Buff" }, duration: { tr: "3 tur", en: "3 rounds" }, effect: { tr: "Dostların hareketi 4 metre (2 kare) artar ve hareketleri fırsat saldırısına yol açmaz.", en: "Allies' movement increases by 4 meters (2 squares), and their movement doesn't provoke opportunity attacks." } },
        { name: { tr: "La Majör", en: "A Major" }, type: { tr: "Buff", en: "Buff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Dostların mermiden kaçarken attığı Evasion zarlarına +2.", en: "Allies get +2 to Evasion rolls when dodging bullets." } },
        { name: { tr: "Si Majör", en: "B Major" }, type: { tr: "Buff", en: "Buff" }, duration: { tr: "1 tur", en: "1 round" }, effect: { tr: "Tek dost: yakın dövüş hasarına +1d6.", en: "One ally: +1d6 to melee damage." } },
      ],
    },
    gear: [
      { label: { tr: "Silahlar", en: "Weapons" }, items: { tr: ["Ağır tabancaya kadar bir tabanca", "Hafif bir yakın dövüş silahı"], en: ["A pistol, up to heavy", "A light melee weapon"] } },
      { label: { tr: "Zırh", en: "Armor" }, items: { tr: ["Kevlar seviyesine kadar bir zırh", "Kevlar seviyesine kadar bir kask"], en: ["Body armor, up to Kevlar", "A helmet, up to Kevlar"] } },
      { label: { tr: "Ekipman", en: "Gear" }, items: { tr: ["Seçilen 1 elektronik enstrüman", "2 yedek şarjör", "500 eddie"], en: ["1 electronic instrument of choice", "2 spare magazines", "500 eddies"] } },
    ],
    quote: {
      tr: `Gürültü. Benim için hepsi gürültü. Gençler toplanıyor, biri sahneye çıkıp bağırıyor, ortalık yıkılıyor. Geçen ay Arasaka'ya küfreden bir çocuk vardı, sesi kısık, gitarı akortsuz. Kolunda krom yoktu en azından, onu sevdim. Kalabalık ona öyle bir bağırıyordu ki... Ertesi hafta ortadan kayboldu tabii. Ama bak, altmış yaşındayım, o gece eve dönerken o kuleye ilk defa korkmadan baktım. Ne demek istediğimi anlıyor musun? Anlamıyorsan boş ver.`,
      en: `Noise. It's all noise to me. Kids gather, somebody climbs on stage and screams, the place comes down. Last month there was a kid cursing Arasaka, voice shot, guitar out of tune. No chrome on his arm at least, I liked that. The crowd was screaming back at him like... Next week he was gone, of course. But listen, I'm sixty years old, and walking home that night I looked up at that tower without being scared for the first time. You get what I mean? If you don't, forget it.`,
    },
    name: "Rockerboy",
    stats: ["COOL", "WILL"],
    core: { tr: "<strong>Inspire.</strong> Bonus aksiyonla, seni duyabilen bir dostuna kendi Luck puanlarını verebilirsin.", en: "<strong>Inspire.</strong> As a bonus action, you can give your own Luck points to an ally who can hear you." },
  },
  {
    id: "lawman",
    specs: [
      {
        id: "a",
        name: { tr: "Justiceiro", en: "Justiceiro" },
        summary: {
          tr: "Justiceiro'lar polisin girmediği yerlere adaleti kendi elleriyle götürür. Bellerinde ağır bir tabanca taşır, korkuyu bir silah gibi kullanır ve bir kez peşine düştükleri suçluyu bırakmazlar.",
          en: "Justiceiros bring justice with their own hands to places the police won't go. They wear a heavy pistol on their hip, use fear like a weapon and never let go of a criminal once they're on the trail.",
        },
        features: {
          3: { name: "Law of the Gun", tr: "Tecrübe Zarlarını Handgun saldırı atışlarına da ekleyebilirsin.", en: "You can also add your Veteran Dice to Handgun attack rolls." },
          5: { name: "Big Iron", tr: "Ağır bir tabancayla ya da handcannon'la attığın hasar zarlarında 1 gelenleri birer kez yeniden atabilirsin.", en: "When you roll damage with a heavy pistol or handcannon, you can reroll each die that shows a 1, once." },
          8: { name: "Double Tap", tr: "Tabancanla aynı turda aynı düşmana ikinci kez isabet ettirirsen, ikinci isabetin hasarına +1d6 eklersin.", en: "If you hit the same enemy a second time in the same turn with your pistol, you add +1d6 to the second hit's damage." },
          9: { name: "Dead Eye", tr: "Tabancayla attığın hasar zarlarında iki ya da daha fazla 5 gelirse bu da kritik yara oluşturur. Bir 5 ile bir 6 bunu sağlamaz; kritik yara için hasarın yine hedefin SP'sini geçmesi gerekir.", en: "When you roll damage with a pistol, two or more 5s also cause a critical injury. A single 5 alongside a 6 doesn't count, and the damage still has to beat the target's SP." },
        },
      },
      {
        id: "b",
        name: { tr: "Detetive", en: "Detetive" },
        summary: {
          tr: "Detetive'ler herkesin gözden kaçırdığını görür. Küçük bir izden ya da tek bir yalandan yola çıkıp gerçeğe ulaşırlar: araştırır, sorgular, gerekirse gözdağı verirler. Çoğu zaman en tehlikeli silahları, sordukları sorulardır.",
          en: "Detetives see what everyone else misses. From a small trace or a single lie they work their way to the truth: they investigate, interrogate and intimidate when they have to. More often than not, their most dangerous weapon is the questions they ask.",
        },
        features: {
          3: { name: "Hunch", tr: "Eklediğin bir Tecrübe Zarında en yüksek sayı gelirse zar harcanmaz. Bu, oturum başına en fazla iki kez olabilir.", en: "If a Veteran Die you add rolls its highest value, it isn't spent. This can happen at most twice per session." },
          5: { name: "Second Look", tr: "Oturum başına bir kez, başarısız olduğun bir Perception ya da Insight atışını yeniden atabilirsin.", en: "Once per session, you can reroll a failed Perception or Insight roll." },
          8: { name: "Liar's Tell", tr: "Oturum başına bir kez, konuştuğun birinin sana yalan söyleyip söylemediğini anında anlarsın.", en: "Once per session, you instantly know whether the person you're talking to is lying to you." },
          9: { name: "Old Habits", tr: "Oturum başına 3 kez, eklediğin Tecrübe Zarı atışı başarıya çeviremezse zar harcanmaz.", en: "Three times per session, if a Veteran Die you add doesn't turn the roll into a success, it isn't spent." },
        },
      },
    ],
    gear: [
      { label: { tr: "Silahlar", en: "Weapons" }, items: { tr: ["Ağır tabancaya kadar bir tabanca ya da Yakın menzilli bir ateşli silah", "Orta bir yakın dövüş silahı"], en: ["A pistol up to heavy, or a close-range firearm", "A medium melee weapon"] } },
      { label: { tr: "Zırh", en: "Armor" }, items: { tr: ["Kevlar seviyesine kadar bir zırh", "Kevlar seviyesine kadar bir kask"], en: ["Body armor, up to Kevlar", "A helmet, up to Kevlar"] } },
      { label: { tr: "Ekipman", en: "Gear" }, items: { tr: ["2 yedek şarjör", "500 eddie"], en: ["2 spare magazines", "500 eddies"] } },
    ],
    quote: {
      tr: `Bunlardan birine yalan söylemeye kalkma, ciddiyim. Eski polis bunlar, çoğu NCPD'den, birkaçı şirket güvenliğinden. Rozet gitmiş, bakış gitmemiş. Bir tanesi bana bir saat boyunca hava durumunu sordu, sonra kalkıp gitti. Ertesi gün aradığı adamı buldu, benim ağzımdan kaçırdığım bir sokak adıyla. Hâlâ hangi sokak olduğunu düşünüyorum. Gözleri de kendi gözleriydi, krom değil, yorgun bir adamın gözleri. Sisteme güvenmezler, içini gördüler çünkü. Sana da güvenmezler. Alınma.`,
      en: `Don't try lying to one of these, I mean it. They're ex-cops, most from the NCPD, a few from corporate security. The badge is gone, the stare isn't. One of them spent an hour asking me about the weather, then got up and left. Next day he found the man he was after, from a street name I let slip. I still wonder which street it was. His eyes were his own, too, no chrome, just a tired man's eyes. They don't trust the system, they've seen the inside of it. They won't trust you either. Don't take it personally.`,
    },
    name: "Lawman",
    stats: ["REF", "COOL"],
    core: {
      tr: "Her oturum 1 + Ustalık modifier'ın kadar Tecrübe Zarın (d4) olur. Bir Perception, Insight ya da Intimidation atışından önce bu zarlardan birini o atışa ekleyebilirsin. Eklediğin zar o oturum için harcanır.",
      en: "Each session you have 1 + your Mastery modifier Veteran Dice (d4). Before a Perception, Insight or Intimidation roll, you can add one of them to it. A die you add is spent for that session.",
    },
  },  {
    id: "nomad",
    extraLanguages: 1, // Streetslang dışında bilinen ek dil sayısı
    specs: [
      {
        id: "a",
        name: { tr: "Bandolero", en: "Bandolero" },
        summary: {
          tr: "Bandolero'lar yolun haydutlarıdır. Göğüslerinde fişeklik, ellerinde pompalı tüfek taşır ve direksiyonun başında doğmuş gibi araç sürerler. Bir konvoyu durdurmak da ondan kaçmak da onların işidir.",
          en: "Bandoleros are bandits of the road. Shells across their chest and a shotgun in hand, they drive like they were born behind the wheel. Stopping a convoy and getting away from one are both their trade.",
        },
        features: {
          3: { name: "Blowback", tr: "Pompalı tüfekle bir hedefe isabet ettirdiğinde, seninle hedef arasında siper ya da engel yoksa onu 2 metre (1 kare) geri itebilirsin. Bunu savaş başına Ustalık modifier'ın kadar kez yapabilirsin.", en: "When you hit a target with a shotgun and there's no cover or obstacle between you, you can push it back 2 meters (1 square). You can do this a number of times per combat equal to your Mastery modifier." },
          5: { name: "Drive-By", tr: "Araç sürerken yaptığın saldırılar dezavantajlı olmaz. İki elle kullanılan silahlarla da ateş edebilirsin; bunu yaptığın turda araç yalnızca düz gidebilir ve Driving atışı yapman gerekir.", en: "Your attacks while driving don't have disadvantage. You can also fire two-handed weapons; on a turn you do, the vehicle can only go straight and you have to make a Driving roll." },
          8: { name: "Road Warrior", tr: "Araç sürerken sana yapılan menzilli saldırıların DV'si 2 artar.", en: "While you're driving, the DV of ranged attacks against you increases by 2." },
          9: { name: "Point Blank", tr: "Pompalı tüfekle bitişiğindeki bir hedefe yaptığın saldırılarda hedefin SP'si yarı sayılır (yukarı yuvarlanır).", en: "When you attack an adjacent target with a shotgun, its SP counts as half (rounded up)." },
        },
      },
      {
        id: "b",
        name: { tr: "Tirador", en: "Tirador" },
        summary: {
          tr: "Tirador'lar çölün sabırlı gözleridir. Açık arazide saatlerce bekler, rüzgârı okur ve işi tek bir atışla bitirirler; hedef onları hiç görmez.",
          en: "Tiradores are the patient eyes of the desert. They wait for hours over open ground, read the wind and finish the job with a single shot; the target never sees them.",
        },
        features: {
          3: { name: "Steady Aim", tr: "Önceki turunda hareket etmediysen ve bu turda henüz hareket etmediysen, ideal mesafesi Uzak ya da Çok uzak olan bir tüfekle yaptığın saldırıların zarlarına +2 eklersin.", en: "If you didn't move on your previous turn and haven't moved yet this turn, you add +2 to your attack rolls with a rifle whose ideal range is Long or Extreme." },
          5: { name: "Overwatch", tr: "Aksiyonunu harcayıp bir yönü gözetleyebilirsin. Bir sonraki turuna kadar o yönde hareket eden ilk düşmana, sıra sende olmasa da bir saldırı yaparsın. Bu saldırı Reaction'ını harcar.", en: "You can spend your action to watch a direction. Until your next turn, you make an attack against the first enemy that moves in that direction, even though it isn't your turn. This attack uses your Reaction." },
          8: { name: "One Shot", tr: "Gafil avlanmış bir hedefe yaptığın ilk saldırı isabet ederse hasarına +2d6 eklersin.", en: "If your first attack against a surprised target hits, you add +2d6 to its damage." },
          9: { name: "Exhale", tr: "Savaş başına bir kez, bir Aimed Shot'ı dezavantajsız yapabilirsin.", en: "Once per combat, you can make an Aimed Shot without disadvantage." },
        },
      },
    ],
    gear: [
      { label: { tr: "Araç", en: "Vehicle" }, items: { tr: ["Basit bir araç: motosiklet ya da kompakt araba"], en: ["A basic vehicle: a motorcycle or a compact car"] } },
      { label: { tr: "Silahlar", en: "Weapons" }, items: { tr: ["Ağır tabancaya kadar bir tabanca ya da bir pompalı tüfek", "Orta bir yakın dövüş silahı"], en: ["A pistol up to heavy, or a shotgun", "A medium melee weapon"] } },
      { label: { tr: "Zırh", en: "Armor" }, items: { tr: ["Kevlar seviyesine kadar bir zırh", "Kevlar seviyesine kadar bir kask"], en: ["Body armor, up to Kevlar", "A helmet, up to Kevlar"] } },
      { label: { tr: "Ekipman", en: "Gear" }, items: { tr: ["2 yedek şarjör", "400 eddie"], en: ["2 spare magazines", "400 eddies"] } },
    ],
    quote: {
      tr: `Şehirden hiç çıkmadın, değil mi evlat? Bir gün çık. Yol boyunca yanmış kasabalar, kumun yuttuğu arabalar görürsün, bir de ufukta bir toz bulutu. O toz bulutu Nomad'lardır. Otuz araçlık bir konvoy; içinde çocuklar, ihtiyarlar, köpekler. Bir keresinde arabam çölün ortasında bozuldu. Durdular, bir saat motorla uğraştılar, çalıştırdılar, para da almadılar. Sadece kimin nesi olduğumu sordular. Şehirde kimse bunu sormaz. Onlarda önce aile gelir, sonra yol, sonra her şey. Bir Nomad'ın arabasına dokunma. Ailesine hiç dokunma.`,
      en: `You've never been out of the city, have you, kid? Go some day. Along the road you'll see burned-out towns, cars swallowed by sand, and a cloud of dust on the horizon. That cloud is Nomads. A convoy thirty vehicles long, with kids, old folks and dogs inside. Once my car broke down in the middle of the desert. They stopped, worked on the engine for an hour, got it running, didn't take a cent. All they asked was who my people were. Nobody in the city asks that. With them it's family first, then the road, then everything else. Don't touch a Nomad's car. Never touch their family.`,
    },
    name: "Nomad",
    stats: ["REF", "BODY"],
    core: {
      tr: "Araç sürerken zorlu arazi Driving atışlarını dezavantajlı yapmaz; yalnızca enkaz bunun dışındadır. Oyuna basit bir araçla, bir motosiklet ya da kompakt bir arabayla başlarsın.",
      en: "Rough terrain doesn't give your Driving rolls disadvantage; only rubble still does. You start the game with a basic vehicle: a motorcycle or a compact car.",
    },
  },
];

// Seviye atlama: tüm sınıflarda ortak olan kazanımlar (1–12).
// Her kazanım bir alt başlık (h) ve altında kısa açıklama (p).
// "core": sınıfın çekirdek feat'i · "spec": specialization seçimi · "specfeat": seçili specialization'ın o seviyedeki özelliği.
const GAIN = {
  feat1: {
    h: { tr: "Ek Feat Puanı", en: "Extra Feat Point" },
    p: { tr: "1 feat puanı kazanırsın. Feat puanlarını biriktirebilirsin.", en: "You gain 1 feat point. You can save your feat points." },
  },
  feat2: {
    h: { tr: "Ek Feat Puanı", en: "Extra Feat Points" },
    p: { tr: "2 feat puanı kazanırsın. Feat puanlarını biriktirebilirsin.", en: "You gain 2 feat points. You can save your feat points." },
  },
  mastery1: {
    h: { tr: "Ustalık", en: "Mastery" },
    p: { tr: "Yetkin ya da çok yetkin olduğun bir skill seçersin. O skill'e Ustalık modifier'ını (+1) eklersin.", en: "You choose a skill you are proficient or highly proficient in. You add your Mastery modifier (+1) to it." },
  },
  prof: {
    h: { tr: "Yetkinlik Puanları", en: "Proficiency Points" },
    p: { tr: "2 yetkinlik puanı kazanırsın. Bir skill'e harcadığın ilk puanla o skill'de yetkin (+1), ikinci puanla çok yetkin (+2) olursun. Bir skill'e en fazla 2 puan harcayabilirsin.", en: "You gain 2 proficiency points. The first point you spend on a skill makes you proficient in it (+1), and the second makes you highly proficient (+2). You can spend at most 2 points on a skill." },
  },
  tier2: {
    h: { tr: "2. Aşama Feat'ler", en: "Tier 2 Feats" },
    p: { tr: "Artık 2. aşama feat'leri de alabilirsin. Her biri 2 feat puanıdır.", en: "You can now take tier 2 feats as well. Each costs 2 feat points." },
  },
  mod2: {
    h: { tr: "Ustalık Modifier'ı", en: "Mastery Modifier" },
    p: { tr: "Ustalık modifier'ın +2'ye yükselir.", en: "Your Mastery modifier rises to +2." },
  },
  stat: {
    h: { tr: "Stat Artışı", en: "Stat Increase" },
    p: { tr: "İki adet +1 stat puanı kazanırsın. İkisini aynı stat'a ya da iki farklı stat'a verebilirsin.", en: "You gain two +1 stat points. You can put both into the same stat or into two different stats." },
  },
  mastery2: {
    h: { tr: "Ek Ustalık", en: "Extra Mastery" },
    p: { tr: "Yetkin ya da çok yetkin olduğun bir skill daha seçersin ve ona da Ustalık modifier'ını eklersin.", en: "You choose another skill you are proficient or highly proficient in and add your Mastery modifier to it as well." },
  },
  crossclass: {
    h: { tr: "Sınıf Dışı Feat'ler", en: "Feats From Another Role" },
    p: {
      tr: "Başka bir sınıf seçersin; artık o sınıfın 1. aşama feat'lerini de alabilirsin. İstersen bunun yerine fazladan 1 feat puanı kazanırsın.",
      en: "You choose another role; from now on you can also take that role's tier 1 feats. If you prefer, you gain 1 extra feat point instead.",
    },
  },
  mod3: {
    h: { tr: "Ustalık Modifier'ı", en: "Mastery Modifier" },
    p: { tr: "Ustalık modifier'ın +3'e yükselir.", en: "Your Mastery modifier rises to +3." },
  },
};

const LEVELS = [
  ["core", GAIN.feat1, GAIN.mastery1],
  [GAIN.feat1],
  ["spec", GAIN.prof],
  [GAIN.feat2, GAIN.tier2],
  ["specfeat", GAIN.mod2],
  [GAIN.feat1, GAIN.crossclass],
  [GAIN.stat, GAIN.prof],
  ["specfeat", GAIN.feat1],
  ["specfeat", GAIN.mastery2],
  [GAIN.feat1],
  [GAIN.mod3],
  [GAIN.feat1],
];

// Temel terimler. Oyun metinlerinde (sınıf ve specialization özellikleri, feat, cyberware, quickhack, eşya, melodi açıklamaları)
// ilk geçtikleri yerde, metnin kendi renginde ve altı noktalı yazılır; üstüne gelince açıklaması açılır (tools.js > linkTerms).
// match: metinde aranan kalıp (RegExp kaynağı, yakalayan grup içermez); kelimenin ekleri de işarete dahil olur ("aksiyonla", "Reaction'ını").
// Liste sırası önemlidir: uzun kalıplar kısalarından önce gelir ("bonus aksiyon" → "aksiyon").
// nameLang: Türkçe metinde de adı İngilizce kalan terimler (büyük harfte "İ" çıkmasın diye).
// İleride Oyuncu Rehberi > Sözlük sayfası da bu listeden yapılabilir.
const TERMS = [
  { id: "bonus-aksiyon", name: { tr: "Bonus Aksiyon", en: "Bonus Action" }, match: { tr: "[Bb]onus aksiyon", en: "[Bb]onus action" },
    desc: { tr: "Silah çekmek ya da siper almak gibi kısa ve hızlı işler için kullanılır. Her karakterin turunda 1 bonus aksiyonu vardır ve bonus aksiyon hiçbir zaman saldırı için kullanılamaz; Netrunner'ın quickhack'leri bunun istisnasıdır.", en: "Used for short, quick things such as drawing a weapon or taking cover. Every character has 1 bonus action on their turn, and it can never be used to attack; a Netrunner's quickhacks are the exception." } },
  { id: "aksiyon", name: { tr: "Aksiyon", en: "Action" }, match: { tr: "[Aa]ksiyon", en: "[Aa]ction" },
    desc: { tr: "Saldırmak, reload yapmak ya da birini stabilize etmek gibi, karakterin turunda yaptığı asıl iştir. Her karakterin turunda 1 aksiyonu vardır.", en: "The main thing a character does on their turn, such as attacking, reloading or stabilizing someone. Every character has 1 action on their turn." } },
  { id: "reaction", name: { tr: "Reaction", en: "Reaction" }, nameLang: "en", match: { tr: "Reaction|Reaksiyon", en: "[Rr]eaction" },
    desc: { tr: "Bir şeye tepki olarak kullanılır, örneğin mermiden kaçmak için. Karakter kendi turunda en fazla 2 Reaction kullanabilir; başkalarının turlarında ise bir sonraki turuna kadar yalnızca 1 Reaction kullanabilir.", en: "Used in response to something, such as dodging a bullet. A character can use up to 2 Reactions on their own turn, but only 1 on other characters' turns until their next turn." } },
  { id: "humanity", name: { tr: "Humanity", en: "Humanity" }, nameLang: "en", match: { tr: "Humanity", en: "Humanity" },
    desc: { tr: "Bir karakterin insanlığı, yani kendisiyle ve çevresindekilerle bağı. Krom taktıkça ve karanlık şeyler yaşadıkça azalır; düştükçe karakter cyberpsychosis krizlerine açık hale gelir.", en: "A character's humanity: their bond with themselves and the people around them. It drops with chrome and dark experiences; the lower it gets, the more open the character is to cyberpsychosis crises." } },
  { id: "kriz", name: { tr: "Cyberpsychosis Krizi", en: "Cyberpsychosis Crisis" }, match: { tr: "[Cc]yberpsychosis kriz", en: "[Cc]yberpsychosis crises|[Cc]yberpsychosis crisis" },
    desc: { tr: "Humanity'si Sınırda, Eşikte ya da Uçurumda olan bir karakterde, basamağındaki bir tetikleyiciyle başlar. Karakter, basamağının kriz DV'sine karşı Mental Resist atar. Sınırda ya da Eşikte başarısız olan 1d6 tur boyunca psikoz yaşar ve GM'in kontrolüne geçer; Uçurumda başarısız olan Cyberpsycho olur.", en: "Starts in a character whose Humanity is On the Edge, At the Threshold or On the Brink, when one of their tier's triggers happens. The character rolls Mental Resist against their tier's crisis DV. Failing On the Edge or At the Threshold means 1d6 rounds of psychosis under the GM's control; failing On the Brink means becoming a Cyberpsycho." } },
  { id: "ustalik", name: { tr: "Ustalık Modifier'ı", en: "Mastery Modifier" }, match: { tr: "Ustalık modifier", en: "Mastery modifier" },
    desc: { tr: "Seviyeyle artan bonus: 1. seviyede +1, 5. seviyede +2, 11. seviyede +3. Ustalığın olduğu skill'lere eklenir; birçok özellik de etkisini ya da kullanım sayısını buna göre belirler.", en: "A bonus that grows with level: +1 at level 1, +2 at level 5, +3 at level 11. It's added to skills you have Mastery in, and many features use it for their effect or number of uses." } },
  { id: "dv", name: { tr: "DV", en: "DV" }, nameLang: "en", match: { tr: "DV", en: "DV" },
    desc: { tr: "Difficulty Value, yani işin zorluğu. d10 + skill toplamı DV'den yüksekse atış başarılı olur; eşitlikte DV kazanır.", en: "Difficulty Value: how hard the task is. The roll succeeds if d10 + skill is higher than the DV; on a tie, the DV wins." } },
  { id: "sp", name: { tr: "SP", en: "SP" }, nameLang: "en", match: { tr: "SP", en: "SP" },
    desc: { tr: "Stopping Power, yani zırhın koruması. Gelen hasardan SP çıkarılır, kalanı HP'den düşer. Zırha gelen her isabet SP'yi 1 düşürür.", en: "Stopping Power: how much the armor protects. SP is subtracted from a hit's damage and the rest goes to HP. Every hit on the armor lowers its SP by 1." } },
  { id: "dezavantaj", name: { tr: "Dezavantaj", en: "Disadvantage" }, match: { tr: "[Dd]ezavantaj", en: "[Dd]isadvantage" },
    desc: { tr: "İki d10 atılır, düşük olan alınır. Aynı atışta avantaj da varsa ikisi birbirini götürür.", en: "Roll two d10s and take the lower. If the same roll also has advantage, the two cancel out." } },
  { id: "avantaj", name: { tr: "Avantaj", en: "Advantage" }, match: { tr: "[Aa]vantaj", en: "[Aa]dvantage" },
    desc: { tr: "İki d10 atılır, yüksek olan alınır. Aynı atışta dezavantaj da varsa ikisi birbirini götürür.", en: "Roll two d10s and take the higher. If the same roll also has disadvantage, the two cancel out." } },
  { id: "kritik-yara", name: { tr: "Kritik Yara", en: "Critical Injury" }, match: { tr: "[Kk]ritik yara", en: "[Cc]ritical injur(?:y|ies)" },
    desc: { tr: "Hasar zarlarında iki ya da daha fazla 6 gelir ve toplam hasar hedefin SP'sini geçerse oluşur. Zırhı yok sayan +5 hasar verilir ve isabet bölgesinin tablosundan bir yara eklenir.", en: "Happens when the damage dice show two or more 6s and the total damage beats the target's SP. It deals +5 damage that ignores armor and adds a wound from the hit location's table." } },
  { id: "agir-yarali", name: { tr: "Ağır Yaralı", en: "Seriously Wounded" }, match: { tr: "Ağır Yaralı", en: "Seriously Wounded" },
    desc: { tr: "HP'si maksimumun yarısının altına inen karakter Ağır Yaralı olur ve tüm atışlarına −2 alır.", en: "A character whose HP drops below half its maximum is Seriously Wounded and takes −2 to all rolls." } },
  { id: "olumcul-yarali", name: { tr: "Ölümcül Yaralı", en: "Mortally Wounded" }, match: { tr: "Ölümcül Yaralı", en: "Mortally Wounded" },
    desc: { tr: "HP'si 0'a inen karakter Ölümcül Yaralı olur. Bilinci açıkken skill atışlarına −4 alır ve hareketi yarıya iner; her turunun başında ölüm kurtarma atışı yapar.", en: "A character whose HP reaches 0 is Mortally Wounded. While conscious, they take −4 to skill rolls and their movement is halved, and they make a death save at the start of each of their turns." } },
  { id: "evasion", name: { tr: "Evasion", en: "Evasion" }, nameLang: "en", match: { tr: "Evasion", en: "Evasion" },
    desc: { tr: "Yakın dövüş saldırılarından ve mermilerden kaçınmak için kullanılan skill.", en: "The skill for avoiding melee attacks and bullets." } },
  { id: "mental-resist", name: { tr: "Mental Resist", en: "Mental Resist" }, nameLang: "en", match: { tr: "Mental Resist", en: "Mental Resist" },
    desc: { tr: "Korkuya, baskıya ve zihinsel etkilere direnmek için kullanılan skill.", en: "The skill for resisting fear, pressure and mental effects." } },
  { id: "aimed-shot", name: { tr: "Aimed Shot", en: "Aimed Shot" }, nameLang: "en", match: { tr: "Aimed Shot", en: "Aimed Shot" },
    desc: { tr: "Kafayı, bir kolu ya da bir bacağı hedefleyen atış. Aksiyon ve bonus aksiyon birlikte harcanır ve dezavantajla atılır.", en: "A shot at the head, an arm or a leg. It uses both the action and the bonus action and is rolled with disadvantage." } },
  { id: "baski-atesi", name: { tr: "Baskı Ateşi", en: "Suppressive Fire" }, match: { tr: "[Bb]askı ateş", en: "[Ss]uppressive fire" },
    desc: { tr: "Otomatik ateş açabilen bir silahla, saldırı yerine 10 mermi harcanarak 10 × 10 metrelik bir alana açılır. Hasar vermez; alanda tam siperde olmayanlar DV 11'e karşı Mental Resist atar, başaramayanlar bir sonraki turunda en yakın sipere, yakında siper yoksa alanın dışına kaçmak zorundadır.", en: "Laid down over a 10 × 10 meter area with an autofire weapon, spending 10 bullets instead of an attack. It deals no damage; everyone in the area who isn't in full cover rolls Mental Resist against DV 11, and those who fail must run for the nearest cover on their next turn, or out of the area if there's no cover nearby." } },
  { id: "gafil", name: { tr: "Gafil Avlanmak", en: "Surprised" }, match: { tr: "[Gg]afil avlan", en: "[Ss]urprised" },
    desc: { tr: "Pusuyu fark edemeyen karakter gafil avlanır. İlk turda aksiyon ve bonus aksiyon kullanamaz, hareketinin yalnızca 1/4'ünü kullanabilir, mermiden kaçamaz ve yakın dövüşte Evasion'ı dezavantajla atar.", en: "A character who fails to notice an ambush is surprised. On the first round they can't use an action or bonus action, can use only 1/4 of their movement, can't dodge bullets and roll Evasion in melee with disadvantage." } },
  { id: "tecrube-zari", name: { tr: "Tecrübe Zarı", en: "Veteran Die" }, match: { tr: "Tecrübe Zar", en: "Veteran Di(?:ce|e)" },
    desc: { tr: "Lawman'in her oturum kullanabildiği d4'lerdir; sayıları 1 + Ustalık modifier'ı kadardır. Bir Perception, Insight ya da Intimidation atışından önce bunlardan biri o atışa eklenebilir; eklenen zar o oturum için harcanır.", en: "The d4s a Lawman can use each session; there are 1 + Mastery modifier of them. One can be added to a Perception, Insight or Intimidation roll before it's made; a die that's added is spent for that session." } },
  { id: "gizli", name: { tr: "Gizli", en: "Concealed" }, match: { tr: "[Gg]izlidir", en: "[Cc]oncealed" },
    desc: { tr: "Gizli bir krom ya da eşya üst aramasında bulunmaz; ancak krom taramasıyla, örneğin Analyze ile fark edilir.", en: "Concealed chrome or gear isn't found in a pat-down; only a chrome scan, such as Analyze, reveals it." } },
  { id: "dusurulemez", name: { tr: "Elden Düşürülemez", en: "Can't Be Disarmed" }, match: { tr: "[Ee]lden düşürülemez", en: "can't be knocked out of the user's hand" },
    desc: { tr: "Kola yapılan Aimed Shot ya da Yırtık Tendon gibi eldekini düşürten etkiler bu silahı düşürtmez.", en: "Effects that make someone drop what they're holding, such as an Aimed Shot to the arm or a Torn Tendon, don't make them drop this weapon." } },
  { id: "ram", name: { tr: "RAM", en: "RAM" }, nameLang: "en", match: { tr: "RAM", en: "RAM" },
    desc: { tr: "Cyberdeck'in quickhack gücü. Her quickhack'in bir RAM maliyeti vardır ve yeterli RAM yoksa quickhack kullanılamaz. RAM, Netrunner'ın her turunun başında 1 dolar; savaş bitince tamamen dolar.", en: "A cyberdeck's quickhack power. Each quickhack has a RAM cost, and a quickhack can't be used without enough RAM. RAM refills by 1 at the start of each of the Netrunner's turns and completely when combat ends." } },
];

// Araç listesi (taslak değerler). Araçların SP'si yoktur, yalnızca HP'si vardır (siperler gibi). speed: savaşta tur başına metre. price: ortalama fiyat (satılmıyorsa null → "-"). cover: içindekilere ve arkasında saklananlara sağladığı siper (none / partial / full).
const VEHICLES = [
  { id: "motosiklet", name: { tr: "Motosiklet", en: "Motorcycle" }, passengers: 2, hp: 40, speed: 60, price: 5000, cover: { inside: "none", behind: "partial" }, desc: { tr: "Şehir trafiğindeki en çevik araç. Dar sokaklara ve araçların arasına girebilir, ama sürücüsünü neredeyse hiç korumaz.", en: "The most agile vehicle in city traffic. It fits down narrow alleys and between cars, but barely protects its rider." } },
  { id: "spor-motosiklet", name: { tr: "Spor motosiklet", en: "Sport bike" }, passengers: 1, hp: 30, speed: 80, price: 15000, cover: { inside: "none", behind: "partial" }, desc: { tr: "Hız için yapılmış hafif bir motosiklet. Kovalamacalarda rakipsizdir, ama bir çarpışmada çok kırılgandır.", en: "A light bike built for speed. It's unmatched in a chase, but very fragile in a crash." } },
  { id: "kompakt", name: { tr: "Kompakt araba", en: "Compact car" }, passengers: 4, hp: 70, speed: 50, price: 10000, cover: { inside: "partial", behind: "full" }, desc: { tr: "Night City sokaklarının sıradan şehir arabası: ucuz, küçük ve park etmesi kolay.", en: "The everyday city car of Night City's streets: cheap, small and easy to park." } },
  { id: "sedan", name: { tr: "Sedan", en: "Sedan" }, passengers: 5, hp: 90, speed: 50, price: 20000, cover: { inside: "partial", behind: "full" }, desc: { tr: "Dört kapılı, dengeli bir araba. Bütün ekibi bir arada taşımak için güvenilir bir seçimdir.", en: "A balanced four-door car. A reliable choice for moving the whole crew." } },
  { id: "spor-araba", name: { tr: "Spor araba", en: "Sports car" }, passengers: 2, hp: 80, speed: 70, price: 75000, cover: { inside: "partial", behind: "full" }, desc: { tr: "Hızlı ve dikkat çekici bir araba. Kaçarken çok işe yarar, ama göze batmadan dolaşmak isteyen için kötü bir seçimdir.", en: "Fast and eye-catching. Great for a getaway, but a poor choice for anyone trying to stay unnoticed." } },
  { id: "pickup", name: { tr: "Pickup", en: "Pickup truck" }, passengers: 3, hp: 100, speed: 45, price: 25000, cover: { inside: "partial", behind: "full" }, desc: { tr: "Arkasında açık kasası olan sağlam bir araç. Kasada yolcu ya da yük taşınabilir.", en: "A sturdy vehicle with an open bed. The bed can carry passengers or cargo." } },
  { id: "van", name: { tr: "Van", en: "Van" }, passengers: 8, hp: 110, speed: 40, price: 30000, cover: { inside: "partial", behind: "full" }, desc: { tr: "Kapalı kasalı, geniş bir araç; ekipman ve kalabalık bir ekip taşımak için idealdir. Penceresiz arka bölmedekiler tam siperdedir.", en: "A roomy vehicle with an enclosed back, ideal for hauling gear and a big crew. Those in the windowless back are in full cover." } },
  { id: "suv", name: { tr: "SUV", en: "SUV" }, passengers: 6, hp: 120, speed: 50, price: 40000, cover: { inside: "partial", behind: "full" }, desc: { tr: "Yüksek ve ağır bir araç. Şehir dışındaki bozuk yollarda da rahat ilerler.", en: "A tall, heavy vehicle. It handles the broken roads outside the city with ease." } },
  { id: "zirhli", name: { tr: "Zırhlı araç", en: "Armored vehicle" }, passengers: 6, hp: 180, speed: 40, price: 150000, cover: { inside: "full", behind: "full" }, desc: { tr: "Şirketlerin ve paralı askerlerin tercih ettiği araç. Mermilere karşı neredeyse bir sığınak kadar güvenlidir.", en: "The vehicle of choice for corporations and mercenaries. Against bullets, it's almost as safe as a bunker." } },
  { id: "kamyon", name: { tr: "Kamyon", en: "Truck" }, passengers: 2, hp: 150, speed: 30, price: 60000, cover: { inside: "partial", behind: "full" }, desc: { tr: "Ağır yük taşıyan büyük bir araç. Yavaştır, ama önüne çıkan her şeyi ezip geçer.", en: "A big vehicle for heavy cargo. Slow, but it flattens anything in its way." } },
  { id: "av", name: { tr: "AV (uçan araç)", en: "AV (aerodyne)" }, passengers: 6, hp: 130, speed: 100, price: null, cover: { inside: "full", behind: "full" }, desc: { tr: "Uçan bir araç. Pahalı ve nadirdir; çoğu şirketlerin ya da Trauma Team gibi kurumların elindedir.", en: "A flying vehicle. Expensive and rare; most are in the hands of corporations or outfits like Trauma Team." } },
];

// Evren > Diller listesi. where: konuşulduğu yerler · nc: Night City'de kimler konuşur.
// Oyuncu Rehberi › Sözlük. kind: "evren" (evren ve sokak) | "kural" (kural terimi). Kural sözlüğüne TERMS'teki terimler de eklenir.
// Sıralama dile göre alfabetik yapılır (js/tools.js, mountGlossary); burada sıra önemli değil.
// nameLang: adın dili Türkçe metinde İngilizceyse "en" (büyük harf ve heceleme için).
const GLOSSARY = [
  // ---------- Evren ve sokak ----------
  { kind: "evren", name: { tr: "Afterlife", en: "Afterlife" }, nameLang: "en", desc: { tr: "Night City'nin en ünlü edgerunner barı. Fixer'lar burada iş dağıtır, ölen efsaneler burada anılır.", en: "Night City's most famous edgerunner bar. Fixers hand out jobs here, and dead legends are remembered here." } },
  { kind: "evren", name: { tr: "Badlands", en: "Badlands" }, nameLang: "en", desc: { tr: "Şehrin dışındaki çöl; Nomad ailelerinin ve haydutların yurdu.", en: "The desert outside the city, home to Nomad families and raiders." } },
  { kind: "evren", name: { tr: "Blackwall", en: "Blackwall" }, nameLang: "en", desc: { tr: "NetWatch'ın çökmüş eski Net'i ve oradaki başıboş yapay zekâları ardına kapattığı duvar.", en: "The wall NetWatch built to seal away the crashed old Net and the rogue AIs inside it." } },
  { kind: "evren", name: { tr: "Borg", en: "Borg" }, nameLang: "en", desc: { tr: "Kromla dolu, yarı makine biri.", en: "Someone so full of chrome they're half machine." } },
  { kind: "evren", name: { tr: "Braindance (BD)", en: "Braindance (BD)" }, nameLang: "en", desc: { tr: "Birinin gördüklerinin, duyduklarının ve hissettiklerinin kaydı. İzleyen kişi bu kaydı kendi beyninde yaşar.", en: "A recording of what someone saw, heard and felt. The viewer lives through it inside their own brain." } },
  { kind: "evren", name: { tr: "Choom", en: "Choom" }, nameLang: "en", desc: { tr: "Arkadaş, kanka.", en: "Friend, buddy." } },
  { kind: "evren", name: { tr: "Corpo", en: "Corpo" }, nameLang: "en", desc: { tr: "Şirket çalışanı; sokakta “satılmış” anlamında da kullanılır.", en: "A corporate employee; on the street it also means a sellout." } },
  { kind: "evren", name: { tr: "Cyberpsycho", en: "Cyberpsycho" }, nameLang: "en", desc: { tr: "Kromun yüzünden aklını kaçırmış, kontrolden çıkmış kişi.", en: "Someone whose chrome has driven them out of their mind and out of control." } },
  { kind: "evren", name: { tr: "Delta", en: "Delta" }, nameLang: "en", desc: { tr: "Tüymek, hızla kaçmak.", en: "To bail, to get out fast." } },
  { kind: "evren", name: { tr: "Eddies (€$)", en: "Eddies (€$)" }, nameLang: "en", desc: { tr: "Eurodolar, Night City'nin parası.", en: "Eurodollars, Night City's money." } },
  { kind: "evren", name: { tr: "Edgerunner", en: "Edgerunner" }, nameLang: "en", desc: { tr: "Yasanın ve şirketlerin kenarında yaşayan, parayla iş yapan profesyonel. Oyuncu karakterleri birer edgerunner'dır.", en: "A professional living on the edge of the law and the corporations, working for pay. The player characters are edgerunners." } },
  { kind: "evren", name: { tr: "Fixer", en: "Fixer" }, nameLang: "en", desc: { tr: "Edgerunner'lara iş bulan, müşteriyle ekip arasında aracılık eden kişi.", en: "A go-between who finds jobs for edgerunners and deals between the client and the crew." } },
  { kind: "evren", name: { tr: "Flatline", en: "Flatline" }, nameLang: "en", desc: { tr: "Öldürmek ya da ölmek.", en: "To kill, or to die." } },
  { kind: "evren", name: { tr: "Ganic", en: "Ganic" }, nameLang: "en", desc: { tr: "Organik, kromsuz.", en: "Organic, unchromed." } },
  { kind: "evren", name: { tr: "Gig", en: "Gig" }, nameLang: "en", desc: { tr: "Fixer'dan gelen iş.", en: "A job that comes through a fixer." } },
  { kind: "evren", name: { tr: "Gonk", en: "Gonk" }, nameLang: "en", desc: { tr: "Salak.", en: "Idiot." } },
  { kind: "evren", name: { tr: "Handcannon", en: "Handcannon" }, nameLang: "en", desc: { tr: "Tabancaların en ağırı; seyrek ama çok sert vurur.", en: "The heaviest kind of pistol; it fires slowly but hits very hard." } },
  { kind: "evren", name: { tr: "Handle", en: "Handle" }, nameLang: "en", desc: { tr: "Sokak adı, lakap.", en: "A street name, an alias." } },
  { kind: "evren", name: { tr: "ICE", en: "ICE" }, nameLang: "en", desc: { tr: "Net'teki güvenlik yazılımı. Öldürücü olanına Black ICE denir.", en: "Security software on the Net. The lethal kind is called Black ICE." } },
  { kind: "evren", name: { tr: "Krom", en: "Chrome" }, desc: { tr: "Cyberware, yani vücuda takılan sibernetik parçalar. Kromu ripperdoc'lar takar.", en: "Cyberware: cybernetic hardware installed in the body. Ripperdocs install it." } },
  { kind: "evren", name: { tr: "MaxTac", en: "MaxTac" }, nameLang: "en", desc: { tr: "NCPD'nin cyberpsycho'larla uğraşan, ağır silahlı özel birimi.", en: "NCPD's heavily armed special unit that deals with cyberpsychos." } },
  { kind: "evren", name: { tr: "NCPD", en: "NCPD" }, nameLang: "en", desc: { tr: "Night City polisi.", en: "The Night City Police Department." } },
  { kind: "evren", name: { tr: "Net", en: "Net" }, nameLang: "en", desc: { tr: "Bilgisayar ağı. Bugünkü Net birbirinden kopuk yerel ağlardan oluşur; netrunner'lar ona beyinleriyle bağlanır.", en: "The computer network. Today's Net is made of separate local networks; netrunners connect to it with their brains." } },
  { kind: "evren", name: { tr: "Netrunner", en: "Netrunner" }, nameLang: "en", desc: { tr: "Net'e beyniyle bağlanan hacker. Aynı zamanda bir sınıf.", en: "A hacker who connects to the Net with their brain. Also a Role." } },
  { kind: "evren", name: { tr: "Neuroport", en: "Neuroport" }, nameLang: "en", desc: { tr: "Kafadaki bağlantı girişi; cyberdeck'e ve cihazlara bağlanmayı sağlar. Herkeste vardır.", en: "The connection port in the head that links a person to cyberdecks and devices. Everyone has one." } },
  { kind: "evren", name: { tr: "Night City", en: "Night City" }, nameLang: "en", desc: { tr: "Oyunun geçtiği, Kaliforniya kıyısındaki özgür şehir. Gerçekte şehri şirketler yönetir.", en: "The free city on the California coast where the game takes place. In truth, the corporations run it." } },
  { kind: "evren", name: { tr: "Nomad", en: "Nomad" }, nameLang: "en", desc: { tr: "Yollarda, konvoylarla yaşayan ailelerin üyesi. Aynı zamanda bir sınıf.", en: "A member of the families that live on the road in convoys. Also a Role." } },
  { kind: "evren", name: { tr: "Nova", en: "Nova" }, nameLang: "en", desc: { tr: "Havalı, harika.", en: "Cool, great." } },
  { kind: "evren", name: { tr: "Preem", en: "Preem" }, nameLang: "en", desc: { tr: "Birinci sınıf, harika.", en: "First-rate, great." } },
  { kind: "evren", name: { tr: "Ripperdoc", en: "Ripperdoc" }, nameLang: "en", desc: { tr: "Krom takan, söken ve yenileyen, çoğu zaman ruhsatsız cerrah.", en: "A surgeon, often unlicensed, who installs, removes and upgrades chrome." } },
  { kind: "evren", name: { tr: "Scavenger", en: "Scavenger" }, nameLang: "en", desc: { tr: "İnsanları kaçırıp kromlarını söken çetenin üyesi.", en: "A member of the gang that kidnaps people and strips out their chrome." } },
  { kind: "evren", name: { tr: "Solo", en: "Solo" }, nameLang: "en", desc: { tr: "Kiralık silah, koruma. Aynı zamanda bir sınıf.", en: "A hired gun, a bodyguard. Also a Role." } },
  { kind: "evren", name: { tr: "Trauma Team", en: "Trauma Team" }, nameLang: "en", desc: { tr: "Abonelerini kurtarmak için silahlı ambulanslarla gelen şirket.", en: "The company that sends armed ambulances to rescue its subscribers." } },

  // ---------- Kural terimleri (TERMS'tekilere ek) ----------
  { kind: "kural", name: { tr: "Ağırlık", en: "Weight" }, desc: { tr: "Kromun Humanity kaybına göre sınıfı: Hafif (0–5), Orta (6–10), İleri (11–15), Ağır (16 ve üstü). Arızalanan kromun tamir DV'sini de belirler.", en: "A chrome piece's class by Humanity loss: Light (0–5), Medium (6–10), Advanced (11–15), Heavy (16 and up). It also sets the repair DV when the chrome breaks down." } },
  { kind: "kural", name: { tr: "Aşama", en: "Feat Tier" }, desc: { tr: "Feat'lerin basamağı. 1. aşama feat 1 feat puanı, 2. aşama feat 2 feat puanı tutar; 2. aşama feat'ler 4. seviyede açılır.", en: "A feat's tier. A tier 1 feat costs 1 feat point and a tier 2 feat costs 2; tier 2 feats open up at level 4." } },
  { kind: "kural", name: { tr: "Başlangıç Etiketi", en: "Starting Tag" }, desc: { tr: "Karakterin oyuna başlarken seçebileceği cyberware ve eşyaları gösteren etiket.", en: "The tag marking the cyberware and items a character can pick when starting the game." } },
  { kind: "kural", name: { tr: "Boğuşma", en: "Grappling" }, desc: { tr: "Bitişikteki birini yakalayıp tutmak. Yakalayan aksiyon harcayıp Brawling atar, hedef Evasion ile karşılık verir.", en: "Grabbing and holding someone adjacent. The grappler spends an action and rolls Brawling; the target answers with Evasion." } },
  { kind: "kural", name: { tr: "Çekirdek Feat", en: "Core Feat" }, desc: { tr: "Her sınıfın 1. seviyede bedava aldığı, sınıfı tanımlayan feat.", en: "The feat every Role gets free at level 1, the one that defines the Role." } },
  { kind: "kural", name: { tr: "Cyberdeck", en: "Cyberdeck" }, nameLang: "en", desc: { tr: "Netrunner'ın quickhack yaptığı cihaz. RAM'ini ve kaç quickhack'i hazır tutabileceğini belirler.", en: "The device a Netrunner quickhacks through. It sets their RAM and how many quickhacks they can keep ready." } },
  { kind: "kural", name: { tr: "EMP", en: "EMP" }, nameLang: "en", desc: { tr: "Empati. Skill vermez; başlangıç Humanity'si EMP × 10'dur.", en: "Empathy. It grants no skills; starting Humanity is EMP × 10." } },
  { kind: "kural", name: { tr: "Feat", en: "Feat" }, nameLang: "en", desc: { tr: "Karakterin özel yetenekleri; feat puanıyla alınır. Sınıf feat'leri ve tarafsız feat'ler vardır.", en: "A character's special abilities, bought with feat points. There are Role feats and general feats." } },
  { kind: "kural", name: { tr: "Feat Puanı", en: "Feat Point" }, desc: { tr: "Feat almak için harcanan puan. Seviye atladıkça kazanılır ve biriktirilebilir.", en: "The points spent to buy feats. They're earned when leveling up and can be saved." } },
  { kind: "kural", name: { tr: "Fırsat Saldırısı", en: "Opportunity Attack" }, desc: { tr: "Bitişikteki bir düşman bitişikten çıkarken Reaction harcanarak yapılan yakın dövüş saldırısı. Ateşli silahla kabza vuruşu yapılır ve yumruk hasarı verilir.", en: "A melee attack made with a Reaction when an adjacent enemy leaves your reach. With a firearm it's a strike with the grip or stock and deals punch damage." } },
  { kind: "kural", name: { tr: "Gece Dinlenmesi", en: "Night's Rest" }, desc: { tr: "8 saat süren dinlenme. Karakter BODY / 2 HP kazanır.", en: "A rest that takes 8 hours. The character regains BODY / 2 HP." } },
  { kind: "kural", name: { tr: "Genel Atış", en: "Stat Check" }, desc: { tr: "Hiçbir skill'e uymayan durumlarda GM'in istediği d10 + stat modifier atışı.", en: "A d10 + stat modifier roll the GM calls for when no skill fits." } },
  { kind: "kural", name: { tr: "GM", en: "GM" }, nameLang: "en", desc: { tr: "Game Master: oyunu yöneten; dünyayı, NPC'leri ve düşmanları canlandıran kişi.", en: "Game Master: the person who runs the game and plays the world, the NPCs and the enemies." } },
  { kind: "kural", name: { tr: "HP", en: "HP" }, nameLang: "en", desc: { tr: "Can puanı: 10 + 2 × BODY. Seviyeyle artmaz.", en: "Hit points: 10 + 2 × BODY. They don't grow with level." } },
  { kind: "kural", name: { tr: "İkonik", en: "Iconic" }, desc: { tr: "Ender bulunan, lüks kalitede eşya. Aynı türden sıradan bir eşyanın bütün özelliklerine ek olarak fazladan özellikleri vardır.", en: "A rare, luxury-grade item. It has every feature of an ordinary item of its kind, plus extra ones." } },
  { kind: "kural", name: { tr: "İmmünsupresan", en: "Immunosuppressant" }, desc: { tr: "Vücudun kromu reddetmesini bastıran ilaç. Bir sonraki gece dinlenmesine kadar cyberpsychosis krizi zarlarını avantajlı yapar; art arda kullanıldıkça etkisi azalır.", en: "A drug that holds back the body's rejection of chrome. Until the next night's rest, cyberpsychosis crisis rolls have advantage; it weakens with use on consecutive days." } },
  { kind: "kural", name: { tr: "İnisiyatif", en: "Initiative" }, desc: { tr: "Savaşta kimin önce oynayacağını belirleyen d10 + REF modifier atışı.", en: "The d10 + REF modifier roll that decides who acts first in combat." } },
  { kind: "kural", name: { tr: "Kademe", en: "Quickhack Tier" }, desc: { tr: "Quickhack'lerin dört basamağı (I–IV). Netrunner I. kademeye 1., II. kademeye 3., III. kademeye 7., IV. kademeye 10. seviyede erişir.", en: "The four tiers of quickhacks (I–IV). A Netrunner reaches tier I at level 1, tier II at 3, tier III at 7 and tier IV at 10." } },
  { kind: "kural", name: { tr: "Karşılıklı Atış", en: "Opposed Roll" }, desc: { tr: "DV yerine karşı tarafın atışına karşı yapılan atış. Yüksek sonuç kazanır.", en: "A roll made against the other side's roll instead of a DV. The higher result wins." } },
  { kind: "kural", name: { tr: "Kritik Zar", en: "Exploding Die" }, desc: { tr: "Doğal 10 gelirse bir d10 daha atılıp eklenir, doğal 1 gelirse bir d10 atılıp çıkarılır. Yalnızca bir kez atılır.", en: "On a natural 10, roll another d10 and add it; on a natural 1, roll a d10 and subtract it. It's only rolled once." } },
  { kind: "kural", name: { tr: "Kütüphane", en: "Quickhack Library" }, desc: { tr: "Netrunner'ın bildiği quickhack'ler. Dinlenirken cyberdeck'te hazır tutulacaklar bunların arasından seçilir.", en: "The quickhacks a Netrunner knows. While resting, the ones to keep ready on the cyberdeck are picked from it." } },
  { kind: "kural", name: { tr: "Luck", en: "Luck" }, nameLang: "en", desc: { tr: "Her oturumun başında dolan puan havuzu. Atıştan önce harcanan her puan atışa +1 ekler.", en: "A pool of points that refills at the start of every session. Each point spent before a roll adds +1 to it." } },
  { kind: "kural", name: { tr: "Melodi", en: "Melody" }, desc: { tr: "Rockerboy'un enstrümanıyla çaldığı, dostları güçlendiren ya da düşmanları zayıflatan şarkılar. Çalmak bir aksiyon ve 1 şarj harcar.", en: "Songs a Rockerboy plays on their instrument to strengthen allies or weaken enemies. Playing one takes an action and 1 charge." } },
  { kind: "kural", name: { tr: "Mermiden Kaçmak", en: "Dodging Bullets" }, desc: { tr: "Ateşli silah saldırısı isabet edecekse Reaction harcayıp Evasion atmak. Normalde tur başına bir kez yapılır.", en: "Spending a Reaction to roll Evasion when a firearm attack would hit. Normally once per round." } },
  { kind: "kural", name: { tr: "Ölüm Kurtarma Atışı", en: "Death Save" }, desc: { tr: "Ölümcül Yaralı karakterin her turunun başında DV 5'e karşı attığı d10 + BODY modifier atışı. Her başarıda DV 1 artar; ikinci başarısızlık ölümdür.", en: "The d10 + BODY modifier roll against DV 5 a Mortally Wounded character makes at the start of each of their turns. The DV rises by 1 with each success; the second failure is death." } },
  { kind: "kural", name: { tr: "Otomatik Ateş", en: "Autofire" }, desc: { tr: "SMG ya da saldırı tüfeğiyle tek seferde 10 mermi harcanarak yapılan saldırı. Hasar, DV'nin geçildiği farkla çarpılır.", en: "An attack with an SMG or assault rifle that spends 10 bullets at once. The damage is multiplied by how much the DV was beaten." } },
  { kind: "kural", name: { tr: "Oturum", en: "Session" }, desc: { tr: "Bir oyun buluşması. “Oturum başına” kullanılan özellikler her oturumda yeniden kullanılabilir.", en: "One game meeting. Features used “per session” can be used again each session." } },
  { kind: "kural", name: { tr: "Point Buy", en: "Point Buy" }, nameLang: "en", desc: { tr: "Statları bir puan bütçesi harcayarak belirleme yöntemi.", en: "A way of setting stats by spending a budget of points." } },
  { kind: "kural", name: { tr: "Quickhack", en: "Quickhack" }, nameLang: "en", desc: { tr: "Netrunner'ın cyberdeck üzerinden, görebildiği bir kişiye ya da cihaza yaptığı hack. RAM harcar.", en: "A hack a Netrunner runs through a cyberdeck on a person or device they can see. It costs RAM." } },
  { kind: "kural", name: { tr: "ROF", en: "ROF" }, nameLang: "en", desc: { tr: "Atış hızı: bir silahla tek aksiyonda yapılabilecek saldırı sayısı.", en: "Rate of fire: how many attacks a weapon can make with one action." } },
  { kind: "kural", name: { tr: "Sabit Dizi", en: "Standard Array" }, desc: { tr: "Statları 15, 14, 13, 12, 10, 10 ve 8 değerlerini dağıtarak belirleme yöntemi.", en: "A way of setting stats by assigning the values 15, 14, 13, 12, 10, 10 and 8." } },
  { kind: "kural", name: { tr: "Siper", en: "Cover" }, desc: { tr: "Saldıranla hedef arasındaki engel. Kısmi siper saldırının DV'sine +2 ekler; tam siperdeki hedefe doğrudan saldırılamaz.", en: "Something between the attacker and the target. Partial cover adds +2 to the attack's DV; a target in full cover can't be attacked directly." } },
  { kind: "kural", name: { tr: "Sınıf", en: "Role" }, desc: { tr: "Karakterin işi: Solo, Netrunner, Medtech, Rockerboy, Lawman ya da Nomad. Çekirdek feat'i, feat havuzunu ve specialization'ları belirler.", en: "A character's line of work: Solo, Netrunner, Medtech, Rockerboy, Lawman or Nomad. It sets the core feat, the feat pool and the specializations." } },
  { kind: "kural", name: { tr: "Skill", en: "Skill" }, nameLang: "en", desc: { tr: "Belirli bir işteki beceri. Her stat'ın altında dört skill vardır.", en: "Ability at a particular kind of task. Each stat has four skills." } },
  { kind: "kural", name: { tr: "Skill Değeri", en: "Skill Value" }, desc: { tr: "Atışta d10'a eklenen sayı: stat modifier + yetkinlik + Ustalık + diğer bonuslar.", en: "The number added to the d10 on a roll: stat modifier + proficiency + Mastery + other bonuses." } },
  { kind: "kural", name: { tr: "Specialization", en: "Specialization" }, nameLang: "en", desc: { tr: "Sınıfın iki dalından biri. 3. seviyede seçilir ve 3, 5, 8 ve 9. seviyelerde özellik verir.", en: "One of a Role's two branches. It's chosen at level 3 and grants features at levels 3, 5, 8 and 9." } },
  { kind: "kural", name: { tr: "Stabilize", en: "Stabilizing" }, desc: { tr: "Ölümcül Yaralı birini kurtarmak: aksiyon harcanır ve DV 8'e karşı Medicine atılır.", en: "Saving a Mortally Wounded character: an action is spent and Medicine is rolled against DV 8." } },
  { kind: "kural", name: { tr: "Stat", en: "Stat" }, nameLang: "en", desc: { tr: "Karakterin temel özellikleri: INT, REF, DEX, TECH, COOL, WILL ve BODY. 3 ile 20 arasında değer alır.", en: "A character's core attributes: INT, REF, DEX, TECH, COOL, WILL and BODY. They range from 3 to 20." } },
  { kind: "kural", name: { tr: "Stat Modifier", en: "Stat Modifier" }, nameLang: "en", desc: { tr: "Stat'tan hesaplanan bonus: (stat − 10) / 2, aşağı yuvarlanır.", en: "The bonus a stat gives: (stat − 10) / 2, rounded down." } },
  { kind: "kural", name: { tr: "Tarafsız Feat", en: "General Feat" }, desc: { tr: "Belirli bir sınıfa ait olmayan, her karakterin alabildiği feat.", en: "A feat that belongs to no Role and is open to every character." } },
  { kind: "kural", name: { tr: "Tur", en: "Round" }, desc: { tr: "Savaşta yaklaşık 3 saniyelik zaman dilimi. Her karakter kendi turunda 1 aksiyon, 1 bonus aksiyon ve 12 metreye kadar hareket kullanır.", en: "About 3 seconds of combat. On their turn, each character gets 1 action, 1 bonus action and up to 12 meters of movement." } },
  { kind: "kural", name: { tr: "Ustalık", en: "Mastery" }, desc: { tr: "Yetkin olunan bir skill'e verilen ve o skill'e Ustalık modifier'ını ekleyen uzmanlık. 1. ve 9. seviyede kazanılır.", en: "Expertise given to a proficient skill, adding the Mastery modifier to it. Gained at levels 1 and 9." } },
  { kind: "kural", name: { tr: "Yetkinlik", en: "Proficiency" }, desc: { tr: "Skill'e harcanan yetkinlik puanlarıyla gelen bonus: yetkin +1, çok yetkin +2.", en: "The bonus from proficiency points spent on a skill: proficient +1, highly proficient +2." } },
  { kind: "kural", name: { tr: "Yuva", en: "Slot" }, desc: { tr: "Bir vücut bölgesine takılabilecek krom sayısı. Örneğin nöral sistemde 3, gözlerde 2 yuva vardır.", en: "How many chrome pieces fit in a body area. For example, the neural system has 3 slots and the eyes have 2." } },
];

const LANGUAGES = [
  { id: "streetslang", name: { tr: "Streetslang", en: "Streetslang" }, where: { tr: "Dünyanın büyük şehirleri", en: "Every major city in the world" }, nc: { tr: "Herkes", en: "Everyone" }, desc: { tr: "Göçmenlerin, çetelerin ve dev şirketlerin getirdiği kültürlerin birbirine karışmasıyla doğan sokak dili. Temeli İngilizcedir; İspanyolca, Japonca ve daha birçok dilden kelime ve deyim içerir. Night City'de herkes Streetslang bilir; ek diller bunun üstüne seçilir.", en: "A street language born from immigrants, gangs and the cultures that giant corporations bring with them, all mixed together. It's built on English, with words and phrases from Spanish, Japanese and many other languages. Everyone in Night City knows Streetslang; extra languages are chosen on top of it." } },
  { id: "ingilizce", name: { tr: "İngilizce", en: "English" }, where: { tr: "Kuzey Amerika, Britanya, Avustralya", en: "North America, Britain, Australia" }, nc: { tr: "Şirketler, NCPD, medya", en: "Corporations, NCPD, the media" }, desc: { tr: "Devlet işlerinin ve iş dünyasının dili. Sözleşmeler, haber yayınları ve resmî belgeler İngilizcedir; Militech gibi Amerikan şirketleri de bu dili konuşur. Sokakta büyüyen biri kelimelerin bir kısmını tanır, ama resmî bir görüşmeyi ya da bir sözleşmeyi takip edebilmek için gerçekten İngilizce bilmek gerekir.", en: "The language of government and the corporate world. Contracts, newscasts and official documents are in English, and American corporations like Militech speak it too. Someone raised on the street recognizes some of the words, but following a formal conversation or a contract takes real English." } },
  { id: "ispanyolca", name: { tr: "İspanyolca", en: "Spanish" }, where: { tr: "Meksika, Orta ve Güney Amerika", en: "Mexico, Central and South America" }, nc: { tr: "Heywood, Valentinos", en: "Heywood, the Valentinos" }, desc: { tr: "Night City'nin en yaygın dillerinden biri. Heywood'daki Latin mahallelerinde ve Valentinos çetesinin arasında en çok duyulan dil budur. Pek çok aile evde İspanyolca konuşur.", en: "One of the most common languages in Night City. It's the language you hear most in Heywood's Latino neighborhoods and among the Valentinos gang. Many families speak Spanish at home." } },
  { id: "japonca", name: { tr: "Japonca", en: "Japanese" }, where: { tr: "Japonya", en: "Japan" }, nc: { tr: "Arasaka, Tyger Claws, Japantown", en: "Arasaka, the Tyger Claws, Japantown" }, desc: { tr: "Arasaka'nın ana dili; şirketin üst kademelerinde Japonca bilmek kapı açar. Westbrook'taki Japantown'ın dükkânlarında, kulüplerinde ve Tyger Claws çetesinin arasında da Japonca konuşulur.", en: "Arasaka's home language; knowing Japanese opens doors in the corporation's upper ranks. It's also spoken in the shops and clubs of Japantown in Westbrook, and among the Tyger Claws gang." } },
  { id: "cince", name: { tr: "Çince (Mandarin)", en: "Chinese (Mandarin)" }, where: { tr: "Çin, Doğu Asya", en: "China, East Asia" }, nc: { tr: "Kang Tao, Çinli topluluklar", en: "Kang Tao, Chinese communities" }, desc: { tr: "Dünyada en çok insanın ana dili olarak konuştuğu dil. Akıllı silahlarıyla tanınan Kang Tao gibi Çinli şirketlerin dilidir; Asya'yla iş yapan herkesin işine yarar.", en: "The native language of more people than any other. It's the language of Chinese corporations like Kang Tao, known for its smart guns, and it's useful to anyone doing business with Asia." } },
  { id: "rusca", name: { tr: "Rusça", en: "Russian" }, where: { tr: "Rusya, Doğu Avrupa", en: "Russia, Eastern Europe" }, nc: { tr: "Scavenger'lar", en: "The Scavengers" }, desc: { tr: "Scavenger çetesinin dili. İnsanları kaçırıp kromlarını söken bu çetenin üyelerinin çoğu Rus kökenlidir; kendi aralarında Rusça konuşur, duvarlara Rusça yazarlar. Rus petrol devi SovOil'in de dilidir.", en: "The language of the Scavengers. Most members of this gang, which kidnaps people and strips out their chrome, are of Russian origin; they speak Russian among themselves and write it on the walls. It's also the language of the Russian oil giant SovOil." } },
  { id: "haiti-kreolcesi", name: { tr: "Haiti Kreolcesi", en: "Haitian Creole" }, where: { tr: "Haiti, Karayipler", en: "Haiti, the Caribbean" }, nc: { tr: "Voodoo Boys, Pacifica", en: "The Voodoo Boys, Pacifica" }, desc: { tr: "Fransızcadan doğmuş bir kreol dil. Haiti sular altında kaldıktan sonra Night City'ye gelen göçmenlerin dilidir. Pacifica'daki Haitili topluluğu koruyan Voodoo Boys çetesi kendi arasında bu dili konuşur.", en: "A creole language that grew out of French. It's the language of the immigrants who came to Night City after Haiti flooded. The Voodoo Boys, who protect Pacifica's Haitian community, speak it among themselves." } },
  { id: "fransizca", name: { tr: "Fransızca", en: "French" }, where: { tr: "Fransa, Avrupa, Afrika", en: "France, Europe, Africa" }, nc: { tr: "Avrupa şirketleri, Haitililer", en: "European corps, Haitians" }, desc: { tr: "Avrupa'nın ve Afrika'nın büyük bir bölümünde konuşulur; Avrupa şirketleriyle iş yapanların işine yarar. Haiti'nin de resmî dillerinden biri olduğu için Haitili göçmenlerin çoğu Fransızcayı da anlar.", en: "Spoken across much of Europe and Africa, and handy for anyone dealing with European corporations. It's also one of Haiti's official languages, so most Haitian immigrants understand it too." } },
  { id: "arapca", name: { tr: "Arapça", en: "Arabic" }, where: { tr: "Orta Doğu, Kuzey Afrika", en: "The Middle East, North Africa" }, nc: { tr: "Orta Doğulu göçmenler", en: "Middle Eastern immigrants" }, desc: { tr: "Orta Doğu ve Kuzey Afrika'nın ortak dili. 1997'deki Mideast Meltdown'da nükleer bir savaş Orta Doğu'nun büyük kısmını yaşanmaz hale getirdi; bölgeden kaçanlar dünyanın dört bir yanına dağıldı, bir kısmı da Night City'ye ulaştı.", en: "The shared language of the Middle East and North Africa. In the Mideast Meltdown of 1997, a nuclear war made much of the Middle East unlivable; those who fled scattered across the globe, and some of them made it to Night City." } },
];

// Evren > Çeteler listesi. territory: bölge · style: tarz · business: işleri.
const LORE_GANGS = [
  { id: "tyger-claws", name: { tr: "Tyger Claws", en: "Tyger Claws" }, territory: { tr: "Westbrook (Japantown, Charter Hill), Watson (Kabuki)", en: "Westbrook (Japantown, Charter Hill), Watson (Kabuki)" }, style: { tr: "Japon kökenli, yakuza düzeni", en: "Japanese roots, yakuza-style order" }, business: { tr: "Kulüpler ve kumarhaneler; uyuşturucu, haraç, insan kaçakçılığı", en: "Clubs and casinos; drugs, protection, human trafficking" }, desc: { tr: ["Japantown'ın neon sokakları onlarındır. Katanaları, sokak motorları ve parlayan dövmeleriyle tanınırlar. Şehirde hiçbir çetenin onlar kadar yasal işletmesi yoktur: barlar, restoranlar, kumarhaneler, braindance kulüpleri. Ama asıl para bu vitrinlerin arkasında döner.", "Arasaka'nın pis işlerini yaptıkları, karşılığında krom ve askerî silah aldıkları söylenir. Liderleri onuru ve işi açık savaştan üstün tutar, ama alt kademeler bu disiplini giderek kaybediyor. Mox'la aralarında kan davası vardır."], en: ["The neon streets of Japantown are theirs. They're known for their katanas, street bikes and glowing tattoos. No other gang in the city runs as many legal businesses: bars, restaurants, casinos, braindance clubs. But the real money moves behind those storefronts.", "They're said to do Arasaka's dirty work in exchange for chrome and military-grade weapons. Their leaders value honor and business over open war, but the lower ranks are steadily losing that discipline. They have a blood feud with the Mox."] } },
  { id: "valentinos", name: { tr: "Valentinos", en: "Valentinos" }, territory: { tr: "Heywood (The Glen, Wellsprings, Vista del Rey)", en: "Heywood (The Glen, Wellsprings, Vista del Rey)" }, style: { tr: "Chicano kültürü, onur yasası", en: "Chicano culture, a code of honor" }, business: { tr: "Araba hırsızlığı ve parça dükkânları; silah ve uyuşturucu kaçakçılığı", en: "Car theft and chop shops; gun and drug running" }, desc: { tr: ["Heywood'un çetesidir ve şehrin en büyük çetelerinden biridir. Üye olmak için Latin kökenli olmak gerekmez, ama kültürü benimsemek şarttır: Santa Muerte dövmeleri, altın kaplama silahlar, lowrider arabalar, mahalle duvarlarındaki anma resimleri.", "Katı bir onur yasaları vardır; ihanetin cezası korkunç bir ölümdür. Mahalleye bu kadar bağlı oldukları için ne NCPD ne de şirketler aralarına sızabilir. 6th Street'le bitmeyen bir bölge savaşı içindedirler."], en: ["Heywood's own gang, and one of the biggest in the city. Members don't have to be Latino, but they do have to embrace the culture: Santa Muerte tattoos, gold-plated guns, lowriders, memorial murals on neighborhood walls.", "They live by a strict code of honor, and betrayal means a gruesome death. Their roots in the neighborhood run so deep that neither the NCPD nor the corporations can get inside. They're locked in an endless turf war with 6th Street."] } },
  { id: "maelstrom", name: { tr: "Maelstrom", en: "Maelstrom" }, territory: { tr: "Watson (Northside, kuzey Kabuki)", en: "Watson (Northside, northern Kabuki)" }, style: { tr: "Krom fanatikleri", en: "Chrome fanatics" }, business: { tr: "Kaçakçılık, suikast, konvoy baskınları, XBD'ler", en: "Smuggling, hits, convoy raids, XBDs" }, desc: { tr: ["Etin bir zayıflık olduğuna inanan bir çete. Yüzlerini metal plakalarla kapatır, kafalarına kümeler halinde kırmızı gözler takarlar. Üyelerinin bir kısmı çoktan cyberpsychosis'e kaymıştır, ama çete bunu umursamaz.", "Üsleri Northside'daki eski bir gıda fabrikasıdır; Totentanz kulübünü de onlar işletir. Kurbanları parçalanmış ya da derisi yüzülmüş halde bulunur."], en: ["A gang that believes flesh is weakness. They hide their faces behind metal plates and cluster red optics across their skulls. Some of their members have already slipped into cyberpsychosis, and the gang doesn't care.", "Their base is an old food plant in Northside, and they also run the Totentanz club. Their victims turn up dismembered or skinned."] } },
  { id: "6th-street", name: { tr: "6th Street", en: "6th Street" }, territory: { tr: "Santo Domingo (Arroyo, Rancho Coronado), Heywood (Vista del Rey)", en: "Santo Domingo (Arroyo, Rancho Coronado), Heywood (Vista del Rey)" }, style: { tr: "Eski askerler, Amerikan vatanseverliği", en: "Ex-soldiers, American patriotism" }, business: { tr: "Silah kaçakçılığı, haraç, araba kaçakçılığı", en: "Arms smuggling, protection, car smuggling" }, desc: { tr: ["Dördüncü Şirket Savaşı'ndan sonra ortaya çıktılar. İlk başta, NCPD'nin çaresizliğinden bıkıp mahallelerini korumak için bir araya gelen gazilerden oluşan bir gruptular; zamanla korudukları insanlardan haraç toplayan bir çeteye dönüştüler.", "Bayrak ve kartal armaları, taktik yelekler ve kamuflaj giyerler; kromları gösterişsiz ve işe yarar türdendir. Kendi bölgelerinin dışına taşmadıkları sürece NCPD onları gayriresmî bir polis gücü olarak görür ve işlerine karışmaz. Valentinos'la savaşları hiç bitmez."], en: ["They appeared after the Fourth Corporate War. At first they were a group of veterans who were fed up with the NCPD's helplessness and banded together to protect their neighborhoods; over time they became a gang that squeezes the very people they protect.", "They wear flag and eagle insignia, tactical vests and camo; their chrome is plain and practical. As long as they stay inside their own turf, the NCPD treats them as unofficial police and leaves them alone. Their war with the Valentinos never ends."] } },
  { id: "animals", name: { tr: "Animals", en: "Animals" }, territory: { tr: "Pacifica; tutuldukları her yer", en: "Pacifica; wherever they're hired" }, style: { tr: "Krom değil, kas ve hormon", en: "Muscle and hormones, not chrome" }, business: { tr: "Fedailik, korumalık, steroid ticareti", en: "Bouncers, bodyguards, steroid dealing" }, desc: { tr: ["Kromdan uzak duran, bedenlerini laboratuvarda büyütülmüş kaslar, özel steroidler ve hayvan hormonlarıyla şişiren dövüşçüler. Sürüler halinde dolaşırlar ve her sürünün başında bir alfa bulunur. Kafes dövüşleri de düzenlerler.", "Pacifica'daki üslerinin dışında kalıcı bir bölgeleri yoktur; şehrin her yerinde fedai, koruma ve kiralık kas olarak çalışırlar. Biri onları tuttuğunda başka çetelerin sınırlarını tanımazlar."], en: ["Brawlers who stay away from chrome and pump their bodies up with vat-grown muscle, custom steroids and animal hormones. They move in packs, each led by an alpha, and they also run cage fights.", "Outside their base in Pacifica they have no permanent turf; they work all over the city as bouncers, bodyguards and hired muscle. Once someone hires them, they ignore other gangs' borders."] } },
  { id: "voodoo-boys", name: { tr: "Voodoo Boys", en: "Voodoo Boys" }, territory: { tr: "Pacifica (Coastview)", en: "Pacifica (Coastview)" }, style: { tr: "Haitili netrunner'lar", en: "Haitian netrunners" }, business: { tr: "Şirket verisi çalmak, netrunning işleri", en: "Stealing corporate data, netrunning jobs" }, desc: { tr: ["Haiti sular altında kaldıktan sonra Pacifica'ya inşaat işçisi olarak gelen göçmenlerden doğan bir çete. 2069'da yatırımcılar bölgeden kaçınca burada kaldılar ve zamanla Pacifica'daki Haitili topluluğun koruyucusu oldular.", "Kapalı ve şüphecidirler; dışarıdan kimseye güvenmezler. Asıl güçleri sokakta değil, Net'tedir: şirket veri bankalarına sızar, hesap boşaltır, veri satarlar. Blackwall'un ötesine ulaşmak istedikleri söylenir; bu yüzden NetWatch'la açık bir savaş içindedirler."], en: ["A gang born from the immigrants who came to Pacifica as construction workers after Haiti flooded. When the investors fled the district in 2069 they stayed, and over time became the protectors of Pacifica's Haitian community.", "They're closed off and suspicious, and trust no outsiders. Their real power isn't on the street but in the Net: they break into corporate databanks, drain accounts and sell data. They're said to want to reach beyond the Blackwall, which puts them in open war with NetWatch."] } },
  { id: "mox", name: { tr: "Mox", en: "Mox" }, territory: { tr: "Watson (Kabuki, Lizzie's Bar)", en: "Watson (Kabuki, Lizzie's Bar)" }, style: { tr: "Seks işçileri, punk'lar, dışlananlar", en: "Sex workers, punks, outcasts" }, business: { tr: "Seks işçilerini korumak, Lizzie's Bar", en: "Protecting sex workers, Lizzie's Bar" }, desc: { tr: ["Şehrin en küçük çetesi. 2067'de, Tyger Claws'ın Kabuki'deki bir kulüpte çalışan bir kadını öldürmesiyle başladı. Kulübün sahibi kadının intikamını aldı; Claws da onu öldürüp kulübü yerle bir etti ve ardından çıkan isyanlar bütün şehre yayıldı.", "Geride kalanlar kulübü Lizzie's Bar adıyla yeniden açtı. Mox, seks işçilerini ve sokakta sahipsiz kalanları korur, karşılığında kazançlarından pay alır. Pembe ve mavi renkleri, punk tarzları ve göze batan kromlarıyla tanınırlar. Tyger Claws'la düşmanlıkları ölümcüldür."], en: ["The smallest gang in the city. It began in 2067, when the Tyger Claws killed a woman working at a club in Kabuki. The club's owner avenged her; the Claws then killed the owner and wrecked the club, and the riots that followed spread across the whole city.", "Those left behind rebuilt the club as Lizzie's Bar. The Mox protect sex workers and anyone else left defenseless on the street, in exchange for a cut. They're known for their pink and blue colors, punk style and showy chrome. Their feud with the Tyger Claws is deadly."] } },
  { id: "scavengers", name: { tr: "Scavengers", en: "Scavengers" }, territory: { tr: "Şehrin her yeri; en çok Pacifica ve Watson", en: "All over the city; mostly Pacifica and Watson" }, style: { tr: "Kural tanımayan sürüler", en: "Lawless packs" }, business: { tr: "İnsan kaçırıp krom ve organ sökmek", en: "Kidnapping people to strip their chrome and organs" }, desc: { tr: ["Night City'nin en çok nefret edilen çetesi. İnsanları kaçırır, kromlarını ve organlarını söker, geriye kalanı yakar ya da kanalizasyona atarlar. Şehirdeki ucuz kaçak kromun büyük kısmı onların elinden geçer.", "Ortak bir liderleri ya da yasaları yoktur; her sürünün başında en vahşi olan durur. Üyelerinin çoğu Rus kökenlidir ve kendi aralarında Rusça konuşur. Herkes onların düşmanıdır."], en: ["The most hated gang in Night City. They kidnap people, strip out their chrome and organs, and burn what's left or dump it in the sewers. Much of the city's cheap black-market chrome passes through their hands.", "They have no shared leader or law; each pack is led by whoever is most savage. Most of their members are of Russian origin and speak Russian among themselves. Everyone is their enemy."] } },
  { id: "wraiths", name: { tr: "Wraiths", en: "Wraiths" }, territory: { tr: "Badlands, şehrin çevresi", en: "The Badlands, the city's outskirts" }, style: { tr: "Nomad yasasını reddeden haydutlar", en: "Raiders who reject nomad law" }, business: { tr: "Yol kesmek, konvoylara ve kamplara baskın", en: "Highway robbery, raids on convoys and camps" }, desc: { tr: ["Nomad ailelerinden kopmuş ya da kovulmuş, hiçbir ailenin yasasını tanımayan haydutlar. Ailelerinden kovulan nomad'lara Raffen Shiv denir; Wraiths bunların en büyük grubudur.", "Badlands'te yol keser, küçük nomad gruplarına, korumasız şirket konvoylarına ve köylere baskın yaparlar. Taşıma işi alıp yükü kendilerine saklamak ya da yolcuları fidye için rehin tutmak gibi oyunları da vardır. Aldecaldos'la kanlı bir savaş içindedirler ve suçları çoğu zaman bütün nomad'ların üstüne kalır."], en: ["Raiders who have broken away from or been thrown out of their nomad families, and who recognize no family's law. Nomads expelled from their families are called Raffen Shiv; the Wraiths are the biggest group of them.", "They rob travelers in the Badlands and raid small nomad groups, poorly guarded corporate convoys and villages. They also take transport jobs and then keep the cargo, or hold the passengers for ransom. They're at bloody war with the Aldecaldos, and their crimes often get pinned on all nomads."] } },
  { id: "barghest", name: { tr: "Barghest", en: "Barghest" }, territory: { tr: "Dogtown (Pacifica)", en: "Dogtown (Pacifica)" }, style: { tr: "Paralı ordu", en: "Private army" }, business: { tr: "Silah ticareti, Dogtown'daki her işten pay", en: "Arms dealing, a cut of every business in Dogtown" }, desc: { tr: ["Bir çeteden çok özel bir ordu. Birleşme Savaşı'nın sonunda bir askerî birlik Pacifica'nın bir parçasını ele geçirdi ve silahlarını hiç bırakmadı. Duvarlarla çevrilen bu bölgeye Dogtown denir.", "Saflarında unutulmuş gaziler, sözleşmesiz paralı askerler ve sokak çocukları vardır; silahları askerî seviyededir. NCPD Dogtown'a giremez. Şehrin bir bölgesini ele geçirip yetkililere karşı tutabilen tek güç onlardır."], en: ["A private army more than a gang. At the end of the Unification War, a military unit seized a piece of Pacifica and never laid down its weapons. That walled-off district is called Dogtown.", "Their ranks are filled with forgotten veterans, mercs without contracts and street kids, and their weapons are military grade. The NCPD can't enter Dogtown. They're the only force to have taken a district of the city and held it against the authorities."] } },
  { id: "aldecaldos", name: { tr: "Aldecaldos", en: "Aldecaldos" }, territory: { tr: "Badlands kampları", en: "Badlands camps" }, style: { tr: "Nomad ailesi", en: "Nomad family" }, business: { tr: "Kaçakçılık, kervan korumak, taşımacılık", en: "Smuggling, caravan escort, transport" }, desc: { tr: ["Aldecaldos bir çete değil, Çöküş yıllarında kurulmuş bir nomad ailesidir. Yolda yaşayan bu kalabalık toplulukta her şeyden önce aile gelir. Kervanları Batı Kıyısı'ndaki Özgür Eyaletler boyunca dolaşır.", "Kaçakçılık yapar, yük ve yolcu taşır, hurdacılık ve tarım işleri alırlar. Şehirdeki fixer'larla ve şirketlerle iş yapmaktan çekinmezler."], en: ["The Aldecaldos aren't a gang but a nomad family, founded during the Collapse. In this big clan that lives on the road, family comes before everything. Their caravans travel across the Free States of the West Coast.", "They smuggle, haul cargo and passengers, and take scavenging and farm work. They have no problem doing business with the city's fixers and corporations."] } },
];

// Evren > Night City bölgeleri. subs: alt bölgeler · control: kimin elinde · notable: öne çıkanlar.
const LORE_DISTRICTS = [
  { id: "city-center", name: { tr: "City Center", en: "City Center" }, subs: { tr: "Corpo Plaza, Downtown", en: "Corpo Plaza, Downtown" }, control: { tr: "Şirket güvenliği, NCPD", en: "Corporate security, NCPD" }, notable: { tr: "Arasaka Kulesi, Memorial Park, şirket merkezleri", en: "Arasaka Tower, Memorial Park, corporate HQs" }, desc: { tr: ["Şehrin ortasında yükselen şirket kalesi. Corpo Plaza'da Arasaka, Militech, Biotechnica, Petrochem ve Kang Tao'nun şehirdeki kuleleri yan yana durur; burası şirketlerin kendi kendilerini yönettiği bir bölgedir. Yeni Arasaka Kulesi, 2023'te nükleer bombayla yıkılan eski kulenin yerinde yükselir. Dibinde, savaşta ölenlerin anısına yapılmış Memorial Park uzanır.", "Downtown şehrin en yeni kısmıdır; ofisler, lüks oteller, pahalı restoranlar ve seçkin kulüplerle doludur. Gece olunca ara sokaklarında sentetik uyuşturucu ve yasa dışı braindance satılır."], en: ["The corporations' fortress, rising in the middle of the city. In Corpo Plaza the Night City towers of Arasaka, Militech, Biotechnica, Petrochem and Kang Tao stand side by side; it's a zone where the corporations govern themselves. The new Arasaka Tower rises on the site of the old one, destroyed by a nuke in 2023. At its foot lies Memorial Park, built in memory of those who died in the war.", "Downtown is the newest part of the city, full of offices, luxury hotels, expensive restaurants and exclusive clubs. After dark, its back alleys sell synthetic drugs and illegal braindances."] } },
  { id: "watson", name: { tr: "Watson", en: "Watson" }, subs: { tr: "Little China, Kabuki, Northside, Arasaka Waterfront", en: "Little China, Kabuki, Northside, Arasaka Waterfront" }, control: { tr: "Tyger Claws, Maelstrom, Mox", en: "Tyger Claws, Maelstrom, Mox" }, notable: { tr: "Afterlife, Kabuki pazarı, Lizzie's Bar", en: "The Afterlife, Kabuki Market, Lizzie's Bar" }, desc: { tr: ["Şehrin yoksul yakası: kalabalık, ucuz ve göçmenlerle dolu. 2040'larda Japon sermayesi bölgeye para akıttı, ama Arasaka 2070'te şehre dönünce bu dönem sona erdi. Kabuki'nin Japon sakinleri gitti, Northside'daki fabrikalar kapandı, Arasaka da boşalan ucuz arazileri satın alıp duvarlarla çevirdi.", "Little China'da restoranlar, tuhaf dükkânlar ve paralı askerlerin barı Afterlife vardır. Kabuki, pazarlarla ve dolandırıcılarla dolu dar sokaklardan oluşan bir labirenttir; Mox'un merkezi Lizzie's Bar da buradadır. Northside'da Maelstrom'un sözü geçer ve NCPD oraya pek girmez. Arasaka Waterfront ise dışarıya kapalı, taretlerle korunan bir Arasaka limanıdır."], en: ["The wrong side of town: crowded, cheap and full of immigrants. In the 2040s Japanese capital poured money into the district, but that era ended when Arasaka returned to the city in 2070. Kabuki's Japanese residents left, Northside's factories shut down, and Arasaka bought up the cheap empty land and walled it off.", "Little China has restaurants, odd little shops and the mercs' bar, the Afterlife. Kabuki is a maze of narrow alleys full of markets and con artists, and home to Lizzie's Bar, the Mox headquarters. In Northside, Maelstrom calls the shots and the NCPD rarely goes in. The Arasaka Waterfront is a closed-off Arasaka port guarded by turrets."] } },
  { id: "westbrook", name: { tr: "Westbrook", en: "Westbrook" }, subs: { tr: "Japantown, Charter Hill, North Oak", en: "Japantown, Charter Hill, North Oak" }, control: { tr: "Tyger Claws, özel güvenlik", en: "Tyger Claws, private security" }, notable: { tr: "Jig-Jig Street, kumarhaneler, North Oak villaları", en: "Jig-Jig Street, casinos, North Oak villas" }, desc: { tr: ["Şehrin en zengin bölgesi; başka yerlerde kazanılan paranın harcandığı yer. Japantown kumarhaneleri, gece hayatı ve şehrin Japon topluluğuyla bilinir; Jig-Jig Street ise genelevler sokağıdır. Geceleri sokaklar Tyger Claws'a aittir.", "Charter Hill, bir gün North Oak'a taşınmayı hayal eden orta kademe şirket çalışanlarının yaşadığı yerdir. North Oak'ın tepelerinde çetelerin giremediği, duvarlarla korunan villalar vardır. Toprağa gömülmek 2040'lardan beri yasak olduğu için şehrin ölüleri de North Oak'taki Columbarium'da saklanır."], en: ["The richest district in the city, where money made elsewhere gets spent. Japantown is known for its casinos, its nightlife and the city's Japanese community; Jig-Jig Street is the red-light strip. At night, the streets belong to the Tyger Claws.", "Charter Hill is where mid-level corporate workers live, dreaming of moving up to North Oak one day. North Oak's hills hold walled villas that no gang can get into. Since burial in the ground has been banned since the 2040s, the city's dead are kept in the Columbarium in North Oak."] } },
  { id: "heywood", name: { tr: "Heywood", en: "Heywood" }, subs: { tr: "Wellsprings, The Glen, Vista del Rey", en: "Wellsprings, The Glen, Vista del Rey" }, control: { tr: "Valentinos, 6th Street", en: "Valentinos, 6th Street" }, notable: { tr: "Belediye binası, mahkemeler, Latin mahalleleri", en: "City Hall, the courts, Latino barrios" }, desc: { tr: ["Night City'nin en büyük yerleşim bölgesi; şehrin başka yerlerinde çalışanların çoğu akşam buraya döner. Bölgenin büyük kısmı kalabalık Latin mahallelerinden oluşur. Sokaklarda Valentinos'un sözü geçer, 6th Street de bölgede iş çevirir.", "The Glen şehrin yönetim merkezidir: belediye binası ve mahkemeler buradadır, sokaklarda da bol bol NCPD devriyesi dolaşır. Wellsprings bölgenin en güvenli kısmıdır. Vista del Rey ise en yoksul kısmıdır; ihmal edilmiş, suçla dolu sokakları Valentinos'un kalesidir."], en: ["Night City's biggest residential district, where much of the city comes home at night. Most of it is made up of crowded Latino barrios. The Valentinos run the streets, and 6th Street does business here too.", "The Glen is the seat of city government: City Hall and the courts are here, and NCPD patrols are everywhere. Wellsprings is the safest part of the district. Vista del Rey is the poorest; its neglected, crime-ridden streets are a Valentinos stronghold."] } },
  { id: "santo-domingo", name: { tr: "Santo Domingo", en: "Santo Domingo" }, subs: { tr: "Arroyo, Rancho Coronado", en: "Arroyo, Rancho Coronado" }, control: { tr: "6th Street", en: "6th Street" }, notable: { tr: "Fabrikalar, santraller, megabinalar", en: "Factories, power plants, megabuildings" }, desc: { tr: ["Şehrin en eski bölgelerinden biridir ve sanayisi burada toplanır. Modern bir sanayi bölgesi olarak planlandı, ama zamanla binlerce insanın sığındığı bir kampa dönüştü. Megabinalarında yoksul işçilerin oturduğu on binlerce küçük daire vardır.", "Arroyo fabrikalar, hurdalıklar ve santrallerle doludur. Rancho Coronado ise bir şirketin kurduğu, birbirinin aynısı evlerden oluşan bir banliyödür. NCPD buraya yetişemediği için sokakları 6th Street tutar."], en: ["One of the city's oldest districts, and the place where its industry is concentrated. It was planned as a modern industrial zone but over time turned into a camp where thousands took shelter. Its megabuildings hold tens of thousands of tiny apartments for poor workers.", "Arroyo is full of factories, junkyards and power plants. Rancho Coronado is a company-built suburb of identical houses. The NCPD can't keep up out here, so 6th Street holds the streets."] } },
  { id: "pacifica", name: { tr: "Pacifica", en: "Pacifica" }, subs: { tr: "Coastview, West Wind Estate, Dogtown", en: "Coastview, West Wind Estate, Dogtown" }, control: { tr: "Voodoo Boys, Scavenger'lar, Barghest", en: "Voodoo Boys, Scavengers, Barghest" }, notable: { tr: "Yarım kalmış tatil köyü, Dogtown'ın duvarları", en: "The unfinished resort, the walls of Dogtown" }, desc: { tr: ["Lüks bir tatil cenneti olarak planlandı ve çoğunlukla Haitili işçilerle inşa edildi. 2069'da savaş korkusuyla yatırımcılar çekilince yarım kaldı. 2070'te inşaatı yeniden başlatmak için yapılan girişim Voodoo Boys'un direnişine takıldı; NCPD'nin tahliyeleri haftalarca süren isyanlara yol açtı.", "Ekim 2072'de bölgedeki polis karakolu kapatıldı ve Pacifica bir Combat Zone ilan edildi. Coastview'da Voodoo Boys güçlüdür; güneydeki West Wind Estate'te Scavenger'lar dolaşır. Pacifica'nın bir parçası olan Dogtown ise Barghest milislerinin duvarlarla çevirdiği, NCPD'nin giremediği bir şehir içinde şehirdir."], en: ["It was planned as a luxury resort and built mostly by Haitian workers. When the investors pulled out in 2069, afraid of the war, it was left half-finished. A 2070 attempt to restart construction ran into resistance from the Voodoo Boys, and the NCPD's evictions set off riots that lasted for weeks.", "In October 2072 the district's police precinct was shut down and Pacifica was declared a Combat Zone. The Voodoo Boys are strong in Coastview; the Scavengers roam West Wind Estate to the south. Dogtown, a part of Pacifica, is a city within the city: walled off by the Barghest militia, closed to the NCPD."] } },
  { id: "badlands", name: { tr: "Badlands", en: "Badlands" }, subs: { tr: "Şehrin dışındaki çöl", en: "The desert outside the city" }, control: { tr: "Nomad aileleri, Wraiths", en: "Nomad families, the Wraiths" }, notable: { tr: "Çöplükler, petrol sahaları, Biotechnica tarlaları", en: "Landfills, oil fields, Biotechnica farms" }, desc: { tr: ["Night City'yi çevreleyen, kuraklıkla çöle dönmüş topraklar. Çöplüklerin, kimyasal atık alanlarının ve yanan petrol sahalarının üstüne asit yağmurları yağar. Şehrin kuralları burada biter.", "Nomad aileleri burada kamp kurar ve yolları en iyi onlar bilir; Wraiths gibi haydutlar ise yolcuları ve konvoyları pusuya düşürür. Biotechnica'nın geniş tarlaları şehrin tükettiği proteinin yarısından fazlasını üretir."], en: ["The land around Night City, turned to desert by drought. Acid rain falls on its landfills, chemical waste zones and burning oil fields. This is where the city's rules end.", "Nomad families make camp here and know the roads better than anyone, while raiders like the Wraiths ambush travelers and convoys. Biotechnica's huge farms grow more than half of the protein the city eats."] } },
];

// Evren > Şirketler listesi. sector: alan · nc: Night City'de.
const LORE_CORPS = [
  { id: "arasaka", name: { tr: "Arasaka", en: "Arasaka" }, sector: { tr: "Güvenlik, bankacılık, silah ve krom", en: "Security, banking, weapons and chrome" }, nc: { tr: "Arasaka Kulesi, Watson limanı, North Oak malikânesi", en: "Arasaka Tower, the Watson docks, the North Oak estate" }, desc: { tr: ["Tokyo merkezli, dünyanın en güçlü şirketlerinden biri. 1915'te kuruldu. Güvenlik ve bankacılık hizmetleri verir; silah, araç ve krom da üretir. Şirketi kurulduğu günden beri aynı aile yönetir.", "Dördüncü Şirket Savaşı'nı kaybetti ve 2023'te ABD'den kovuldu. 2070'te Birleşme Savaşı sırasında Night City'yi koruyunca şehre geri döndü; bugün yeniden inşa ettiği kulesi şehrin en yüksek binasıdır."], en: ["Based in Tokyo, one of the most powerful corporations in the world. Founded in 1915, it provides security services and banking, and makes weapons, vehicles and chrome. The same family has run it since the day it was founded.", "It lost the Fourth Corporate War and was thrown out of the US in 2023. It returned to Night City in 2070 after protecting the city during the Unification War; today its rebuilt tower is the tallest building in the city."] } },
  { id: "militech", name: { tr: "Militech", en: "Militech" }, sector: { tr: "Silah, askerî araç, dron, paralı askerlik", en: "Weapons, military vehicles, drones, private military" }, nc: { tr: "Corpo Plaza'daki ofisler, Badlands'teki tesisler", en: "Offices in Corpo Plaza, facilities in the Badlands" }, desc: { tr: ["Washington merkezli, dünyanın en büyük silah üreticisi ve Arasaka'nın baş rakibi. Dördüncü Şirket Savaşı'nı kazandı, ama savaşın sonunda ABD hükümeti tarafından devletleştirildi. O günden beri şirketle devlet arasındaki çizgi bulanıktır: yönetim kurulunun birçok üyesi aynı zamanda üst düzey askerdir.", "NUSA'nın başkanı, Militech'in eski CEO'sudur. Birleşme Savaşı'nda NUSA ordusu Militech'in silahlarıyla savaştı. Night City'de NCPD'nin teçhizatının büyük kısmı Militech'ten gelir; Arasaka'yla aralarındaki gizli savaş bugün de sürer."], en: ["Based in Washington, the world's biggest weapons maker and Arasaka's chief rival. It won the Fourth Corporate War, but at the end of it the US government nationalized it. Ever since, the line between company and state has been blurry: many of its board members are also senior military officers.", "The NUSA's president is Militech's former CEO. In the Unification War, the NUSA army fought with Militech weapons. In Night City, much of the NCPD's equipment comes from Militech, and its covert war with Arasaka goes on to this day."] } },
  { id: "kang-tao", name: { tr: "Kang Tao", en: "Kang Tao" }, sector: { tr: "Akıllı silahlar, güvenlik", en: "Smart weapons, security" }, nc: { tr: "Corpo Plaza'daki kulesi; şehrin büyük işverenlerinden biri", en: "Its tower in Corpo Plaza; one of the city's big employers" }, desc: { tr: ["Hızla yükselen genç bir Çin şirketi. 2040'larda iflasın eşiğindeki bir devlet silah şirketini eski bir albay devraldı; şirket 2050'de ilk akıllı tabancasını çıkardı ve o günden beri silah sektörünün zirvesine tırmanıyor.", "Uzmanlığı akıllı silahlardır: hedefini kendi bulan güdümlü mermiler atan tabancalar, tüfekler ve pompalılar. Arkasında Çin hükümetinin desteği vardır. Çalışanlarına cömert bir sağlık güvencesi verir, ama karşılığında onlarca yıllık bir sadakat sözleşmesi imzalatır."], en: ["A young Chinese corporation on a fast rise. In the 2040s, a former army colonel took over a state arms company on the verge of bankruptcy; in 2050 it released its first smart pistol, and it has been climbing to the top of the weapons industry ever since.", "Its specialty is smart weapons: pistols, rifles and shotguns that fire guided rounds that find their own target. It has the Chinese government's backing. It gives its employees generous medical coverage, but in return makes them sign a loyalty contract that lasts decades."] } },
  { id: "biotechnica", name: { tr: "Biotechnica", en: "Biotechnica" }, sector: { tr: "Genetik mühendisliği, tarım, yakıt", en: "Genetic engineering, agriculture, fuel" }, nc: { tr: "Badlands'teki seralar ve protein tarlaları", en: "Greenhouses and protein farms in the Badlands" }, desc: { tr: ["İtalyan kökenli genetik mühendisliği devi. 1990'larda benzinin yerini alan tahıl alkolü yakıtı CHOOH2'yi icat etti ve üretim hakkını Petrochem'e verdi. Genetiği değiştirilmiş ürünleri ve protein tarlaları dünyanın büyük kısmını besler.", "Night City'nin yiyeceğinin önemli bir kısmı Biotechnica'dan gelir: Badlands'teki otomatik seraları ve protein tarlaları şehrin tükettiği proteinin yarısından fazlasını üretir."], en: ["An Italian-born genetic engineering giant. In the 1990s it invented CHOOH2, the grain-alcohol fuel that replaced gasoline, and licensed its production to Petrochem. Its engineered crops and protein farms feed much of the world.", "A big share of Night City's food comes from Biotechnica: its automated greenhouses and protein farms in the Badlands grow more than half of the protein the city eats."] } },
  { id: "petrochem", name: { tr: "Petrochem", en: "Petrochem" }, sector: { tr: "Enerji ve yakıt", en: "Energy and fuel" }, nc: { tr: "Şehrin her yerinde onun yakıtı yanar", en: "Its fuel burns all over the city" }, desc: { tr: ["Teksas merkezli, dünyanın en büyük CHOOH2 üreticisi ve Biotechnica'nın en büyük ortağı. Night City'nin kuruluşunu finanse eden üç şirketten biridir.", "İkinci Şirket Savaşı'nda Güney Çin Denizi'ndeki petrol sahaları için SovOil'le savaştı. Bugün dünyanın enerjisinin neredeyse tamamı Petrochem ile SovOil'in elindedir."], en: ["Based in Texas, the world's largest CHOOH2 producer and Biotechnica's biggest partner. It's one of the three corporations that funded Night City's founding.", "In the Second Corporate War it fought SovOil over oil fields in the South China Sea. Today nearly all of the world's energy is in the hands of Petrochem and SovOil."] } },
  { id: "sovoil", name: { tr: "SovOil", en: "SovOil" }, sector: { tr: "Petrol ve yakıt", en: "Oil and fuel" }, nc: { tr: "Şehirde pek görünmez", en: "Barely visible in the city" }, desc: { tr: ["Petrochem'in baş rakibi olan Rus enerji devi. CHOOH2'si daha ucuz ama daha az saftır; Batı Avrupa pazarına hâkimdir."], en: ["The Russian energy giant and Petrochem's archrival. Its CHOOH2 is cheaper but less pure, and it dominates the Western European market."] } },
  { id: "zetatech", name: { tr: "Zetatech", en: "Zetatech" }, sector: { tr: "AV'ler, dronlar, bilgisayar ve krom", en: "AVs, drones, computers and chrome" }, nc: { tr: "Gökyüzündeki AV'lerin ve dronların çoğu", en: "Most of the AVs and drones in the sky" }, desc: { tr: ["Eskiden bilgisayarları ve cyberdeck'leriyle tanınırdı; bugün uçan araçlar (AV), dronlar ve krom üretir. Dördüncü Şirket Savaşı'ndan sonra devlet ihaleleriyle büyüdü.", "Night City'nin gökyüzünde görülen AV'lerin ve dronların çoğu Zetatech yapımıdır. Sokakta en çok bilinen ürünlerinden biri Sandevistan'dır: kullananı öyle hızlandırır ki çevresindeki dünya ağır çekimde akıyormuş gibi görünür."], en: ["It used to be known for its computers and cyberdecks; today it makes flying vehicles (AVs), drones and chrome. It grew on government contracts after the Fourth Corporate War.", "Most of the AVs and drones in Night City's sky are Zetatech-built. One of its best-known products on the street is the Sandevistan, which speeds its user up so much that the world around them seems to move in slow motion."] } },
  { id: "kiroshi", name: { tr: "Kiroshi", en: "Kiroshi" }, sector: { tr: "Göz kromu", en: "Cyberoptics" }, nc: { tr: "Hemen her ripperdoc'un rafında", en: "On almost every ripperdoc's shelf" }, desc: { tr: ["Saat üreticisi olarak başlayan bir Japon şirketi; bugün göz kromunda işinin en iyisi sayılır. Küçük bir şirkettir, ama Night City'deki krom gözlerin çoğu Kiroshi yapımıdır."], en: ["A Japanese company that started out making watches; today it's considered the best in the business for cyberoptics. It's a small company, but most of the chrome eyes in Night City are Kiroshi-made."] } },
  { id: "trauma-team", name: { tr: "Trauma Team", en: "Trauma Team" }, sector: { tr: "Silahlı acil sağlık", en: "Armed emergency medicine" }, nc: { tr: "Zırhlı AV'leri şehrin üstünde dolaşır", en: "Its armored AVs circle over the city" }, desc: { tr: ["Abonelikle çalışan, silahlı bir ambulans şirketi. Abone bir müşteri yaralandığında ekip zırhlı bir AV ile gelir; içinde bir pilot, silahlı korumalar ve sağlıkçılar bulunur. Yalnızca abonelerini kurtarır ve müşteriyi tehdit eden herkese ateş eder.", "Abonelik seviyeleri vardır (Silver, Gold, Platinum); seviye yükseldikçe ekip daha hızlı gelir. Birçok şirket, çalışanlarının sözleşmesine Trauma Team aboneliği ekler. Dördüncü Şirket Savaşı'nda tarafsız kaldı."], en: ["An armed ambulance company that runs on subscriptions. When a subscribing client is hurt, a team arrives in an armored AV, with a pilot, armed guards and medics aboard. It saves only its subscribers and shoots anyone who threatens the client.", "It has subscription tiers (Silver, Gold, Platinum); the higher the tier, the faster the team arrives. Many corporations add a Trauma Team plan to their employees' contracts. It stayed neutral in the Fourth Corporate War."] } },
  { id: "night-corp", name: { tr: "Night Corp", en: "Night Corp" }, sector: { tr: "Altyapı ve kamu hizmetleri", en: "Infrastructure and public utilities" }, nc: { tr: "Yollar, metro, elektrik, su", en: "Roads, metro, power, water" }, desc: { tr: ["Night City'ye en sıkı bağlı şirket. Şehrin kurucusu Richard Night'ın mirasından doğdu; 1998'deki suikastın ardından ailesi şirketi yeniden kurdu. Şehrin yollarını, köprülerini, metrosunu, elektriğini ve suyunu işletir; NCART da onundur.", "Çok gizli bir şirkettir: gerçekte ne kadar büyük olduğunu ve kimin yönettiğini kimse tam bilmez. Burs programları ve hayır işleriyle kendini halka sevdirmeye çalışır."], en: ["The corporation most tightly bound to Night City. It grew out of the legacy of the city's founder, Richard Night, and was refounded by his family after his assassination in 1998. It runs the city's roads, bridges, metro, power and water, and owns NCART too.", "It's a very secretive company: nobody really knows how big it is or who runs it. It tries to show a friendly face through scholarships and charity."] } },
  { id: "network-54", name: { tr: "Network 54", en: "Network 54" }, sector: { tr: "Yayıncılık, haber", en: "Broadcasting, news" }, nc: { tr: "N54 News, şehrin ana haber kanalı", en: "N54 News, the city's main newscast" }, desc: { tr: ["Eski bir ulusal yayın ağı. Haber kanalı N54 News, Night City'de en çok izlenen haber yayınıdır."], en: ["An old national broadcast network. Its news channel, N54 News, is the most-watched newscast in Night City."] } },
  { id: "orbital-air", name: { tr: "Orbital Air", en: "Orbital Air" }, sector: { tr: "Yörünge taşımacılığı", en: "Orbital transport" }, nc: { tr: "Şehrin uzay limanı", en: "The city's spaceport" }, desc: { tr: ["Dünya ile yörünge arasındaki yolculuğun neredeyse tek sahibi. Uzay uçaklarıyla yolcu ve yükü yörüngedeki istasyonlara ve Ay'a taşır. Birinci Şirket Savaşı'nda EBM'yle savaşmıştı."], en: ["It holds a near-monopoly on travel between Earth and orbit. Its spaceplanes carry passengers and cargo to the orbital stations and the Moon. It fought EBM in the First Corporate War."] } },
  { id: "tsunami", name: { tr: "Tsunami Defense Systems", en: "Tsunami Defense Systems" }, sector: { tr: "Üst sınıf silahlar", en: "High-end weapons" }, nc: { tr: "Silah dükkânlarının pahalı raflarında", en: "On gun shops' expensive shelves" }, desc: { tr: ["Gizliliği ve yenilikçiliğiyle bilinen bir Japon silah şirketi. Pahalı, kaliteli ve kendine özgü silahlar üretir."], en: ["A Japanese weapons company known for its secrecy and innovation. It makes expensive, high-quality, distinctive weapons."] } },
  { id: "budget-arms", name: { tr: "Budget Arms", en: "Budget Arms" }, sector: { tr: "Ucuz silahlar", en: "Cheap weapons" }, nc: { tr: "Sokakta en kolay bulunan silahlar", en: "The easiest guns to find on the street" }, desc: { tr: ["Ucuz ve güvenilmez silahlar üreten bir şirket. Sokakta en kolay bulunan silahlar onundur; bazıları birkaç atıştan sonra çöpe atılmak üzere yapılmıştır."], en: ["A company that makes cheap, unreliable guns. Its weapons are the easiest to find on the street; some are made to be thrown away after a few shots."] } },
];

// Oyuncu Rehberi > Netrunning quickhack listesi (taslak; etkilerin sayıları sonra).
// type: QH_TYPES anahtarı · tier: kademe 1–4 · ram: RAM maliyeti · spec: Netrunner specialization id'si (a = Infiltrator, b = Overseer) ya da null.
const QH_TYPES = {
  kesif: { tr: "Keşif", en: "Recon" },
  saldiri: { tr: "Saldırı", en: "Combat" },
  kontrol: { tr: "Kontrol", en: "Control" },
  gizlilik: { tr: "Gizlilik", en: "Covert" },
  cihaz: { tr: "Cihaz", en: "Device" },
};

const QUICKHACKS = [
  { id: "ping", name: "Ping", type: "kesif", tier: 1, ram: 1, spec: null, desc: { tr: "Hedef alınan kişinin ya da cihazın bağlı olduğu ağı tarar. Aynı ağa bağlı bütün düşmanlar, kameralar, taretler ve diğer cihazlar, duvarların arkasında kalanlar da dahil, 2 tur boyunca Netrunner'a işaretli görünür. Ekibin geri kalanı bu işaretleri görmez. İşaretlenenlerin yeri bilinir ama kendileri görülmüş sayılmaz: duvarın ardındakilere quickhack yapmak için yine de görüş gerekir. Ağa bağlı olmayan şeyleri ve kromu olmayan kişileri göstermez.", en: "Scans the network the targeted person or device is connected to. Every enemy, camera, turret and other device on that network, including those behind walls, is marked for the Netrunner for 2 rounds. The rest of the crew doesn't see the marks. The marked targets' positions are known, but they don't count as seen: quickhacking someone behind a wall still requires sight. It doesn't reveal anything off the network, or people with no chrome." } },
  { id: "shock", name: "Shock", type: "saldiri", tier: 1, ram: 2, spec: null, desc: { tr: "Hedef kişinin kromuna küçük bir elektrik yükü gönderir: 1d6 hasar, zırh işlemez. Kromu olmayan bir kişiyi etkilemez.", en: "Sends a small electrical charge through the target's chrome: 1d6 damage, armor doesn't apply. It has no effect on a target without chrome." } },
  { id: "distract", name: "Distract", type: "cihaz", tier: 1, ram: 1, spec: null, desc: { tr: "Görüş alanındaki bir cihazı (ekran, hoparlör, otomat, telefon) aniden çalıştırıp ses ya da görüntüyle dikkat çeker. Yakındaki, henüz alarma geçmemiş düşmanlar 1 tur boyunca oraya bakar ya da oraya doğru yürür; bu sırada ekip gizlenebilir ya da geçip gidebilir. Savaşa girmiş ya da alarma geçmiş düşmanları etkilemez.", en: "Suddenly switches on a device in sight (a screen, a speaker, a vending machine, a phone) to draw attention with sound or images. Nearby enemies who aren't on alert yet look at it or walk toward it for 1 round, giving the crew a chance to hide or slip past. It doesn't affect enemies already in combat or on alert." } },
  { id: "turn-on-off", name: "Turn On/Off", type: "cihaz", tier: 1, ram: 1, spec: null, desc: { tr: "Görüş alanındaki bir cihazı açar ya da kapatır: kamera, ışık, ekran, kapı paneli, alarm hoparlörü. Kapatılan cihaz, biri elle yeniden açana ya da bir güvenlik sistemi onu yeniden başlatana kadar kapalı kalır. Taret ve dron gibi silahlı sistemler bu quickhack'le kapatılamaz.", en: "Switches a device in sight on or off: a camera, a light, a screen, a door panel, an alarm speaker. A device switched off stays off until someone turns it back on by hand or a security system resets it. Armed systems such as turrets and drones can't be switched off this way." } },
  { id: "sonic-shock", name: "Sonic Shock", type: "kontrol", tier: 1, ram: 2, spec: null, desc: { tr: "Hedef kişinin işitme kromunu ya da kulak implantını bozar. Kişi 2 tur boyunca hiçbir şey duymaz: telsizle ya da bağırarak kimseyi çağıramaz, alarmları ve yaklaşan ayak seslerini duymaz. İşitme kromu ya da kulak implantı olmayan bir kişiyi etkilemez.", en: "Scrambles the target's hearing chrome or ear implant. For 2 rounds the target hears nothing: they can't call anyone by radio or by shouting, and they don't hear alarms or approaching footsteps. It has no effect on a target without hearing chrome or an ear implant." } },
  { id: "analyze", name: "Analyze", type: "kesif", tier: 1, ram: 1, spec: null, desc: { tr: "Hedef kişiyi tarar ve Netrunner'a şunları gösterir: kafa ve gövde zırhlarının SP'si, yara durumu (sağlam, Ağır Yaralı ya da Ölümcül Yaralı), taktığı kromlardan biri ve üstünde taşıdığı el bombaları. Hangi kromun ortaya çıkacağını Netrunner seçemez; aynı kişiye tekrar yapılırsa başka bir krom görünür. Kişinin aklından geçenleri ve el bombaları dışında üstünde taşıdıklarını göstermez.", en: "Scans the target and reveals: the SP of their head and body armor, their wound state (unhurt, Seriously Wounded, Mortally Wounded), one of their chrome implants and any grenades they're carrying. The Netrunner can't choose which implant is revealed; using it on the same target again reveals a different one. It doesn't reveal what the target is thinking, or anything they're carrying besides grenades." } },
  { id: "reboot-optics", name: "Reboot Optics", type: "kontrol", tier: 2, ram: 3, spec: null, desc: { tr: "Hedef kişinin göz kromunu yeniden başlatır. Kişi bir sonraki turunun sonuna kadar kör olur. Göz kromu olmayan bir kişiyi etkilemez.", en: "Reboots the target's cyberoptics. The target is blind until the end of their next turn. It has no effect on a target without cyberoptics." } },
  { id: "weapon-glitch", name: "Weapon Glitch", type: "kontrol", tier: 2, ram: 3, spec: null, desc: { tr: "Hedef kişinin elindeki elektronik parçalı bir silahı bozar. Silah tutukluk yapar ve kişi bir aksiyon harcayıp onu düzeltene kadar ateş etmez. Elektroniği olmayan mekanik silahları ve yakın dövüş silahlarını etkilemez.", en: "Glitches a weapon with electronic components in the target's hands. The weapon jams and won't fire until the target spends an action to clear it. It doesn't affect purely mechanical guns or melee weapons." } },
  { id: "cripple-movement", name: "Cripple Movement", type: "kontrol", tier: 2, ram: 2, spec: null, desc: { tr: "Hedef kişinin bacaklarına giden sinir sinyallerini keser. Kişi bir sonraki turunun sonuna kadar yerinden kıpırdayamaz; yine de saldırabilir, aksiyon kullanabilir ve Reaction'la mermiden kaçabilir. Sinir sistemine bağlı bir kromu ya da neuroport'u olmayan kişiyi etkilemez.", en: "Cuts the nerve signals to the target's legs. Until the end of their next turn the target can't move from their spot; they can still attack, take actions and use their Reaction to dodge bullets. It has no effect on a target without a neuroport or other nerve-linked chrome." } },
  { id: "short-circuit", name: "Short Circuit", type: "saldiri", tier: 2, ram: 3, spec: null, desc: { tr: "Hedef kişinin kromuna güçlü bir elektrik akımı verir: 2d6 hasar, zırh işlemez. Kişide üç ya da daha fazla krom varsa hasara 1d6 eklenir. Kromu olmayan bir kişiyi etkilemez.", en: "Sends a powerful electrical surge through the target's chrome: 2d6 damage, armor doesn't apply. If the target has three or more implants, add 1d6. It has no effect on a target without chrome." } },
  { id: "overheat", name: "Overheat", type: "saldiri", tier: 2, ram: 3, spec: null, desc: { tr: "Hedef kişinin kromunu aşırı ısıtır ve kişi alev alır. 3 tur boyunca her turunun başında 1d4 hasar alır; zırh işlemez. Kişi bir aksiyon harcayıp yerde yuvarlanarak ya da alevleri söndürerek etkiyi erkenden bitirebilir. Kromu olmayan bir kişiyi etkilemez.", en: "Overheats the target's chrome and sets them on fire. For 3 rounds they take 1d4 damage at the start of each of their turns; armor doesn't apply. The target can end it early by spending an action to roll on the ground or put the flames out. It has no effect on a target without chrome." } },
  { id: "overload", name: "Overload", type: "cihaz", tier: 2, ram: 2, spec: null, desc: { tr: "Görüş alanındaki bir elektrik kutusunu, terminali ya da prize bağlı bir cihazı aşırı yükleyip patlatır. Cihazın 2 metre (1 kare) çevresindeki herkes 3d6 hasar alır; zırh normal işler. Hedef bir kişi değil, bir cihazdır; yakında patlatılacak bir cihaz yoksa kullanılamaz. Patlayan cihaz bir daha çalışmaz.", en: "Overloads a fuse box, terminal or plugged-in device in sight until it blows. Everyone within 2 meters (1 square) of it takes 3d6 damage; armor works as normal. The target is the device, not a person; without a device to blow nearby, it can't be used. The device never works again." } },
  { id: "remote-activation", name: "Remote Activation", type: "cihaz", tier: 2, ram: 2, spec: null, desc: { tr: "Görüş alanındaki bir mekanizmayı uzaktan çalıştırır: kapıyı açar ya da kapatır, asansörü bir kata gönderir, bariyeri kaldırır, park edilmiş bir aracı çalıştırıp 1 tur boyunca düz sürer. Fiziksel kilidi ya da ayrı bir güvenlik paneli olan kapılar (Hardware gerektirenler) bu quickhack'le açılamaz, askerî araçlar da çalıştırılamaz.", en: "Operates a mechanism in sight remotely: opens or closes a door, sends an elevator to a floor, raises a barrier, or starts a parked vehicle and drives it straight for 1 round. Doors with a physical lock or a separate security panel (the kind that need Hardware) can't be opened this way, and military vehicles can't be started." } },
  { id: "static", name: "Static", type: "kontrol", tier: 2, ram: 2, spec: null, desc: { tr: "Netrunner'ın görebildiği bir noktanın 10 metre (5 kare) çevresindeki bütün kablosuz iletişimi 2 tur boyunca keser: telsizler, telefonlar ve holo çağrılar çalışmaz, alarm dışarıya iletilemez. Alanın dışındakileri etkilemez; yüz yüze konuşmayı ve bağırmayı engellemez.", en: "Cuts all wireless communication within 10 meters (5 squares) of a point the Netrunner can see, for 2 rounds: radios, phones and holo calls stop working, and alarms can't be sent out. It doesn't affect anyone outside the area, and it doesn't stop face-to-face talk or shouting." } },
  { id: "tag", name: "Tag", type: "kesif", tier: 2, ram: 2, spec: null, desc: { tr: "Hedef kişiyi işaretler. 2 tur boyunca Netrunner'ın dostları bu kişiye yaptıkları saldırıların zarlarına +2 alır. Aynı anda yalnızca bir kişi işaretli olabilir; yeni bir Tag eskisini siler.", en: "Marks the target. For 2 rounds, the Netrunner's allies get +2 to attack rolls against them. Only one person can be tagged at a time; a new Tag erases the old one." } },
  { id: "take-control", name: "Take Control", type: "cihaz", tier: 3, ram: 4, spec: null, desc: { tr: "Görüş alanındaki bir taretin ya da kameranın kontrolünü 3 tur boyunca ele geçirir. Taret, Netrunner'ın her turunda seçtiği bir düşmana ateş eder ve Netrunner'ın tarafını hedef almaz. Kamera ise Netrunner'ın gözü olur: kameranın gördüğü kişiler ve cihazlar Netrunner için görülmüş sayılır. Dronlar, mech'ler ve araçlar bu quickhack'le ele geçirilemez.", en: "Takes control of a turret or camera in sight for 3 rounds. The turret fires at a target the Netrunner picks each turn and won't shoot at the Netrunner's side. A camera becomes the Netrunner's eye: people and devices it can see count as seen by the Netrunner. Drones, mechs and vehicles can't be taken over this way." } },
  { id: "cyberware-malfunction", name: "Cyberware Malfunction", type: "kontrol", tier: 3, ram: 4, spec: null, desc: { tr: "Hedef kişinin bir kromunu 1d6 tur boyunca çalışmaz hale getirir. Bu, krom arıza kurallarındaki geçici arıza gibi işler. Netrunner kişinin kromlarını Analyze ya da başka bir yolla öğrenmediyse kapanan krom rastgele seçilir. Kalp, akciğer ya da beyin implantı gibi hayati kromları kapatamaz.", en: "Shuts down one of the target's implants for 1d6 rounds, working like a temporary malfunction from the chrome rules. If the Netrunner hasn't learned the target's chrome through Analyze or another way, the implant is picked at random. It can't shut down vital implants such as an artificial heart, lungs or brain implant." } },
  { id: "contagion", name: "Contagion", type: "saldiri", tier: 3, ram: 4, spec: null, desc: { tr: "Hedef kişiye zehirli bir program yükler: 2d6 hasar, zırh işlemez. Program aynı turda kişinin 6 metre (3 kare) yakınındaki, aynı ağa bağlı başka bir düşmana sıçrar ve ona 1d6 hasar verir. Yalnızca bir kez sıçrar ve aynı kişiye ikinci kez geçmez.", en: "Uploads a poisonous program to the target: 2d6 damage, armor doesn't apply. In the same round it jumps to another enemy on the same network within 6 meters (3 squares) of the target, dealing 1d6 damage. It jumps only once and never hits the same person twice." } },
  { id: "reflex-lock", name: "Reflex Lock", type: "kontrol", tier: 3, ram: 3, spec: null, desc: { tr: "Hedef kişinin refleks sinyallerini kilitler. Kişi bir sonraki turunun sonuna kadar Reaction kullanamaz: mermiden kaçamaz, Reaction gerektiren feat ve kromları kullanamaz. Yakın dövüşteki bedava Evasion atışını etkilemez.", en: "Locks up the target's reflex signals. Until the end of their next turn the target can't use their Reaction: they can't dodge bullets or use feats and chrome that need a Reaction. It doesn't affect the free Evasion roll in melee." } },
  { id: "ice-breaker", name: "ICE Breaker", type: "kontrol", tier: 3, ram: 3, spec: null, desc: { tr: "Düşman bir Netrunner'ın ya da bir güvenlik sisteminin savunmasını kırar. Savaşın sonuna kadar o kişiye ya da sisteme yapılan quickhack atışları avantajlıdır ve Firewall gibi, quickhack'lere karşı savunma bonusları işlemez. Kromu ya da cyberdeck'i olmayan bir kişiyi etkilemez.", en: "Breaks the defenses of an enemy Netrunner or a security system. Until the end of combat, quickhack rolls against that target have advantage, and defensive bonuses against quickhacks such as Firewall don't apply. It has no effect on a target with no chrome or cyberdeck." } },
  { id: "synapse-burnout", name: "Synapse Burnout", type: "saldiri", tier: 4, ram: 6, spec: null, desc: { tr: "Hedef kişinin beynine doğrudan aşırı yük gönderir: 3d6 hasar, zırh işlemez. Kişi Ağır Yaralı ise hasar 5d6 olur. Bu hasarla HP'si 0'a düşen kişi Ölümcül Yaralı olur ve hemen bilincini kaybeder.", en: "Overloads the target's brain directly: 3d6 damage, armor doesn't apply. If the target is Seriously Wounded, the damage is 5d6. A target whose HP drops to 0 from this damage becomes Mortally Wounded and passes out at once." } },
  { id: "detonate-grenade", name: "Detonate Grenade", type: "saldiri", tier: 4, ram: 5, spec: null, desc: { tr: "Hedef kişinin üstünde taşıdığı el bombalarından birini patlatır. Patlama kişinin karesini merkez alır ve patlayıcı kurallarına göre işler. Kişinin kendisi patlamadan kaçmak için Evasion atamaz, çevresindekiler atabilir. Üstünde el bombası olmayan bir kişiye kullanılamaz; Netrunner kişinin el bombası taşıyıp taşımadığını Analyze ile öğrenebilir.", en: "Detonates one of the grenades the target is carrying. The blast is centered on the target's square and follows the explosive rules; the target can't roll Evasion to escape it, though others nearby can. It can't be used on a target without a grenade; the Netrunner can find out with Analyze." } },
  { id: "blackout", name: "Blackout", type: "cihaz", tier: 4, ram: 5, spec: null, desc: { tr: "Netrunner'ın görebildiği bir noktanın 20 metre (10 kare) çevresindeki bütün ışıkları, kameraları, ekranları ve ağa bağlı cihazları 3 tur boyunca kapatır; taretler de susar. Havadaki dronlar düşmez ama kameraları kör olur. Işıklar söndüğü için, alana başka bir ışık ulaşmıyorsa alan kararır.", en: "Shuts off every light, camera, screen and networked device within 20 meters (10 squares) of a point the Netrunner can see, for 3 rounds; turrets go silent too. Drones in the air don't fall, but their cameras go blind. With the lights out, the area goes dark unless another light source reaches it." } },
  { id: "ghost", name: "Ghost", type: "gizlilik", tier: 2, ram: 2, spec: "a", desc: { tr: "Netrunner bir sonraki turunun sonuna kadar kameralara ve göz kromlarına görünmez: kameralar onu kaydetmez, göz kromuyla bakanlar onu göremez. Kromsuz, çıplak gözle bakan biri onu normal görür. Netrunner saldırır ya da başka bir quickhack kullanırsa etki hemen biter.", en: "Until the end of their next turn, the Netrunner is invisible to cameras and cyberoptics: cameras don't record them, and anyone looking through chrome eyes can't see them. Someone looking with unchromed, natural eyes sees them as normal. The effect ends at once if the Netrunner attacks or uses another quickhack." } },
  { id: "scrub", name: "Scrub", type: "gizlilik", tier: 2, ram: 2, spec: "a", desc: { tr: "Savaş dışında, ekibin bulunduğu binanın ya da 50 metre (25 kare) çapındaki bir alanın kamera, kapı ve asansör kayıtlarını siler. Bu sistemlere göre ekip son 1 saat içinde hiç iz bırakmamıştır. İnsanların hafızasını silmez ve o anda canlı izlenen yayınları etkilemez; yalnızca kayıtları siler.", en: "Outside combat, erases the camera, door and elevator logs of the building the crew is in, or of an area 50 meters (25 squares) across. As far as those systems are concerned, the crew left no trace in the past hour. It doesn't erase anyone's memory or affect feeds being watched live; it only wipes the records." } },
  { id: "memory-wipe", name: "Memory Wipe", type: "gizlilik", tier: 3, ram: 3, spec: "a", desc: { tr: "Hedef kişi son 1d6 dakikayı unutur: Netrunner'ı ve ekibi gördüğünü, duyduğunu ya da alarm verdiğini hatırlamaz. Savaşa girmiş ya da hasar almış bir kişiye işlemez. Kişi olanları başka bir yoldan (bir kayıttan, bir arkadaşından) öğrenebilir.", en: "The target forgets the last 1d6 minutes: they don't remember seeing or hearing the Netrunner and the crew, or raising an alarm. It doesn't work on a target that's in combat or has taken damage. The target can still find out what happened some other way (a recording, a friend)." } },
  { id: "false-face", name: "False Face", type: "gizlilik", tier: 3, ram: 3, spec: "a", desc: { tr: "Netrunner, daha önce Analyze ya da bir kamerayla taradığı birinin yüzünü 10 dakika boyunca kendi yüzünün üstüne yerleştirir; ona bakan herkes, kameralar dahil, o yüzü görür. Yalnızca yüz değişir: ses, boy ve kıyafet aynı kalır. Yüzün sahibini iyi tanıyan biri, Netrunner'ın konuşmasından ya da davranışlarından şüphelenebilir.", en: "For 10 minutes, the Netrunner places over their own face the face of someone they've previously scanned with Analyze or a camera; everyone who looks at them, cameras included, sees that face. Only the face changes: voice, height and clothes stay the same. Someone who knows the face's owner well may grow suspicious from the way they talk or act." } },
  { id: "system-reset", name: "System Reset", type: "kontrol", tier: 4, ram: 6, spec: "a", desc: { tr: "Hedef kişinin sinir sistemini yeniden başlatır: kişi ölmez ama sessizce bayılır ve 1 dakika boyunca ayılmaz. Bu sürede hasar alırsa ya da sertçe sarsılırsa hemen uyanır. Ölümcül Yaralı ya da kromu olmayan bir kişiye işlemez.", en: "Reboots the target's nervous system: the target doesn't die, but quietly passes out and stays out for 1 minute. They wake immediately if they take damage or are shaken hard. It doesn't work on a target who is Mortally Wounded or has no chrome." } },
  { id: "vanish", name: "Vanish", type: "gizlilik", tier: 4, ram: 5, spec: "a", desc: { tr: "Netrunner ve 6 metre (3 kare) yakınındaki dostları, Netrunner'ın bir sonraki turunun sonuna kadar kameralara ve göz kromlarına görünmez olur; etki Ghost gibi işler. Saldıran ya da quickhack kullanan kişi için etki hemen biter, diğerleri görünmez kalır.", en: "Until the end of the Netrunner's next turn, the Netrunner and allies within 6 meters (3 squares) are invisible to cameras and cyberoptics, working like Ghost. The effect ends at once for anyone who attacks or uses a quickhack; the others stay hidden." } },
  { id: "camera-mode", name: "Camera Mode", type: "cihaz", tier: 2, ram: 2, spec: "b", desc: { tr: "Netrunner görüş alanındaki bir kameraya bağlanır ve 3 tur boyunca onun gözünden bakar. Kameranın gördüğü kişiler ve cihazlar Netrunner için görülmüş sayılır, yani Netrunner onlara quickhack yapabilir. Kamera hasar alır ya da kapatılırsa bağlantı kopar. Bağlantı sürerken Netrunner başka bir kameraya geçmek için bu quickhack'i yeniden kullanmalıdır.", en: "The Netrunner connects to a camera in sight and sees through it for 3 rounds. People and devices the camera can see count as seen by the Netrunner, so the Netrunner can quickhack them. The link breaks if the camera is damaged or switched off. To switch to another camera, the Netrunner has to use this quickhack again." } },
  { id: "stall", name: "Stall", type: "cihaz", tier: 2, ram: 2, spec: "b", desc: { tr: "Görüş alanındaki bir dronu, tareti ya da aracı Netrunner'ın bir sonraki turunun sonuna kadar durdurur: dron havada asılı kalır, taret ateş etmez, araç yavaşlayıp durur. Hızla giden bir araç bu şekilde durursa sürücüsü kontrolü korumak için Driving atar. İnsanları etkilemez.", en: "Stops a drone, turret or vehicle in sight until the end of the Netrunner's next turn: the drone hangs in the air, the turret holds fire, the vehicle slows to a stop. The driver of a fast-moving vehicle rolls Driving to keep control as it stops. It doesn't affect people." } },
  { id: "friendly-mode", name: "Friendly Mode", type: "cihaz", tier: 3, ram: 4, spec: "b", desc: { tr: "Görüş alanındaki bir taret ya da dron 3 tur boyunca Netrunner'ın tarafını hedef almaz ve her turunda Netrunner'ın düşmanlarından en yakındakine saldırır. Süre dolunca eski sahibinin tarafına döner. Mech'leri ve araçları etkilemez.", en: "For 3 rounds, a turret or drone in sight won't target the Netrunner's side and attacks the nearest of the Netrunner's enemies each turn. When the time is up, it returns to its owner's side. It doesn't affect mechs or vehicles." } },
  { id: "override", name: "Override", type: "cihaz", tier: 3, ram: 4, spec: "b", desc: { tr: "Görüş alanındaki bir aracın kontrolünü 2 tur boyunca ele geçirir: Netrunner aracı durdurabilir, yönünü değiştirebilir ya da bir yere çarptırabilir. Sürücü bu sürede direksiyona hâkim olamaz. Askerî araçları ve AV'leri etkilemez.", en: "Takes control of a vehicle in sight for 2 rounds: the Netrunner can stop it, steer it or crash it into something. The driver has no control during that time. It doesn't affect military vehicles or AVs." } },
  { id: "cyberpsychosis", name: "Cyberpsychosis", type: "kontrol", tier: 4, ram: 7, spec: "b", desc: { tr: "Hedef kişinin kromunu ve sinir sistemini kontrolden çıkarır: kişi 2 tur boyunca dost düşman ayırmadan her turunda en yakınındakine saldırır. Kişide en az üç krom olmalıdır; daha az kromlu birine işlemez. Etki bitince kişi ne yaptığını hatırlar.", en: "Throws the target's chrome and nervous system out of control: for 2 rounds the target attacks whoever is nearest each turn, friend or foe. The target must have at least three implants; it has no effect on anyone with fewer implants. When it wears off, the target remembers what they did." } },
  { id: "puppet", name: "Puppet", type: "cihaz", tier: 4, ram: 6, spec: "b", desc: { tr: "Görüş alanındaki zırhlı bir dronu ya da mech'i 1 tur boyunca kontrol eder: Netrunner onu bir kez hareket ettirir ve ona bir saldırı yaptırır. İnsanları ve kromlu bedenleri etkilemez.", en: "Controls an armored drone or mech in sight for 1 round: the Netrunner makes it move once and attack once. It doesn't affect people or chromed bodies." } },
];

// Oyuncu Rehberi > Cyberware listesi. Her öğe:
// { id, name: { tr, en } (Türkçede sürüm "I / II", İngilizcede "Mk I / Mk II"), slot: CW_SLOTS anahtarı, humanity: Humanity kaybı, price: ortalama fiyat (yoksa null → "-"), tags: CW_TAGS anahtarları,
//   flavor: dünya içi kısa tarif { tr, en }, desc: etki, parça özne olarak yazılır ("…iki katına çıkarır") { tr, en }; uzun etkilerde desc paragraf dizisi olabilir }
// Ağırlık Humanity kaybından gelir (0–5 hafif, 6–10 orta, 11–15 ileri, 16+ ağır).
const CW_SLOTS = {
  noral: { tr: "Nöral sistem", en: "Neural system" },
  goz: { tr: "Gözler", en: "Eyes" },
  kol: { tr: "Kollar", en: "Arms" },
  bacak: { tr: "Bacaklar", en: "Legs" },
  dahili: { tr: "Dahili", en: "Internal" },
  cilt: { tr: "Cilt", en: "Skin" },
};
// Etiketler: listede filtrelenir; birden çok etiket seçilirse yalnızca hepsini taşıyanlar görünür.
const CW_TAGS = {
  // desc: listedeki etiketin üstüne gelince bilgi kutusunda açılan açıklama
  baslangic: { tr: "Başlangıç", en: "Starting", desc: { tr: "Karakter oyuna başlarken bu etiketi taşıyan parçalar arasından seçim yapar.", en: "Characters pick from pieces with this tag when they start the game." } },
  skill: { tr: "Skill", en: "Skill", desc: { tr: "Bir skill'e düz bir bonus verir.", en: "Gives a flat bonus to a skill." } },
  ikonik: { tr: "İkonik", en: "Iconic", desc: { tr: "Ender bulunan, lüks kalitede bir parça. Sıradan karşılığının bütün özelliklerine ek olarak fazladan özellikleri vardır.", en: "A rare, luxury-grade piece. It has every feature of its ordinary version, plus extra ones." } },
  "iki-slot": { tr: "İki Yuva", en: "Two Slots", desc: { tr: "İki kol yuvasını birden kaplar.", en: "Takes up both arm slots." } },
  // Etkinleştirme: parçanın nasıl çalıştırıldığı (pasif parçalarda yok)
  otomatik: { tr: "Otomatik", en: "Automatic", desc: { tr: "Parçanın metnindeki koşul gerçekleşince kendiliğinden devreye girer.", en: "Kicks in on its own when the condition in its text is met." } },
  aksiyon: { tr: "Aksiyon", en: "Action", desc: { tr: "Çalıştırmak için aksiyon harcanır.", en: "Using it takes an action." } },
  "bonus-aksiyon": { tr: "Bonus Aksiyon", en: "Bonus Action", desc: { tr: "Çalıştırmak için bonus aksiyon harcanır.", en: "Using it takes a bonus action." } },
  "tur-ici-reaksiyon": { tr: "Tur İçi Reaction", en: "On-Turn Reaction", desc: { tr: "Kullanıcının kendi turunda, Reaction harcanarak kullanılır.", en: "Used on the user's own turn by spending a Reaction." } },
  "tur-disi-reaksiyon": { tr: "Tur Dışı Reaction", en: "Off-Turn Reaction", desc: { tr: "Başkalarının turlarında, Reaction harcanarak kullanılır.", en: "Used on other characters' turns by spending a Reaction." } },
};
const CYBERWARE = [
  // Başlangıç cyberware'leri (hafif cyberware'lerin daha zayıf hâlleri)
  { id: "self-ice-mk1", name: { tr: "Kişisel ICE I", en: "Self-ICE Mk I" }, slot: "noral", humanity: 2, price: 500, tags: ["baslangic"],
    flavor: { tr: "Beyin sapına yerleştirilen ucuz bir güvenlik duvarı. Gelen her sinyali koklar, tanımadıklarını bir an bekletir; çoğu zaman o bir an yeter.", en: "A cheap firewall seated at the brainstem. It sniffs every incoming signal and holds back the ones it doesn't know for a split second; most of the time, that's enough." },
    desc: { tr: "Kullanıcının quickhack'lere karşı savunma DV'sine +1 ekler.", en: "Adds +1 to the user's defense DV against quickhacks." } },
  { id: "translator-chip", name: { tr: "Çevirmen Çipi", en: "Translator Chip" }, slot: "noral", humanity: 2, price: 500, tags: ["baslangic"],
    flavor: { tr: "Kulak zarının arkasında fısıldayan küçük bir çip. Duyduğunu anında çevirir; aksanları ve küfürleri pek anlamaz ama ana fikri hiç kaçırmaz.", en: "A small chip that whispers from behind the eardrum. It translates what it hears on the spot; accents and swearing trip it up, but it never misses the gist." },
    desc: { tr: "Kullanıcının bilmediği bir dilde konuşulanı kaba hatlarıyla anlamasını sağlar. O dilde konuşturacak kadar etkili değildir.", en: "Lets the user roughly understand what's said in a language they don't know. It isn't good enough to let them speak it." } },
  { id: "chipware-socket", name: { tr: "Beceri Çipi", en: "Chipware Socket" }, slot: "noral", humanity: 2, price: 500, tags: ["baslangic", "skill"],
    flavor: { tr: "Kafatasının arkasındaki yuvaya bir beceri çipi oturtulur. Çip, sahibine bilmediği bir işi biliyormuş gibi yaptırır; o işi gerçekten öğrendiği gün sessizce emekliye ayrılır.", en: "A skill chip seated in a socket at the back of the skull. It lets its owner fake a trade they never learned, and quietly retires the day they really learn it." },
    desc: { tr: "Takıldığında kullanıcının yetkin olmadığı bir skill seçilir. Çip bu skill'e bağlanır ve ona +1 ekler; seçim sonradan değiştirilemez. Kullanıcı ileride bu skill'de yetkin olursa çipin etkisi kalmaz.", en: "When it's installed, a skill the user isn't proficient in is chosen. The chip is bound to that skill and adds +1 to it; the choice can't be changed later. If the user later becomes proficient in that skill, the chip no longer has any effect." } },
  { id: "kiroshi-optics-mk1", name: { tr: "Kiroshi Optik I", en: "Kiroshi Optics Mk I" }, slot: "goz", humanity: 2, price: 500, tags: ["baslangic"],
    flavor: { tr: "Kiroshi'nin en ucuz göz modeli; Night City sokaklarında yürüyenlerin yarısının gözünde bundan var. İrisin çevresinde ince bir ışık halkası döner.", en: "Kiroshi's cheapest optics; half the people walking Night City's streets have a pair. A thin ring of light turns around the iris." },
    desc: { tr: "Uzaktaki ayrıntıları yakınlaştırır: Uzak mesafedeki bir yüz ya da yazı Orta mesafedeymiş gibi görülür.", en: "Zooms in on distant details: a face or writing at Long range can be seen as if it were at Medium range." } },
  { id: "biomonitor-mk1", name: { tr: "Biomonitor I", en: "Biomonitor Mk I" }, slot: "dahili", humanity: 1, price: 500, tags: ["baslangic"],
    flavor: { tr: "Bileğin iç yüzünde, derinin altından yanıp sönen küçük bir ekran ve bir damara bağlı sensör. Kalp atışını, kan basıncını ve kan kaybını durmadan ölçer.", en: "A small screen blinking through the skin of the inner wrist, and a sensor wired into a vein. It never stops measuring heartbeat, blood pressure and blood loss." },
    desc: { tr: "Kullanıcıya HP'sini ve yara durumunu her an gösterir. Kullanıcı Ölümcül Yaralıyken onu stabilize etmeye çalışan kişinin Medicine atışına +1 ekler.", en: "Shows the user their HP and wound state at all times. While the user is Mortally Wounded, it adds +1 to the Medicine roll of whoever tries to stabilize them." } },
  { id: "blood-pump-mk1", name: { tr: "Kan Pompası I", en: "Blood Pump Mk I" }, slot: "dahili", humanity: 2, price: 500, tags: ["baslangic", "otomatik"],
    flavor: { tr: "Kalbin yanına dikilen yardımcı bir pompa. Tansiyon düştüğü anda devreye girer ve damarlara bir avuç sentetik kan basar.", en: "An auxiliary pump stitched in next to the heart. The moment blood pressure drops, it kicks in and pushes a handful of synthetic blood into the veins." },
    desc: { tr: "Oturum başına bir kez, kullanıcının HP'si ilk kez maksimumunun yarısının altına indiğinde kendiliğinden devreye girer ve kullanıcıya 1d4 HP kazandırır.", en: "Once per session, the first time the user's HP drops below half its maximum, it kicks in on its own and restores 1d4 HP to them." } },
  { id: "grafted-muscle-mk1", name: { tr: "Kas Takviyesi I", en: "Grafted Muscle Mk I" }, slot: "dahili", humanity: 2, price: 500, tags: ["baslangic", "skill"],
    flavor: { tr: "Sırt ve omuz kaslarının arasına örülen sentetik lifler. Spor salonu yerine ripperdoc'u seçenlerin kısa yolu.", en: "Synthetic fibers woven between the back and shoulder muscles. The shortcut for those who'd rather see a ripperdoc than hit the gym." },
    desc: { tr: "Bir şeyi kaldırmak, itmek ya da taşımak için atılan Strength atışlarına +1 ekler.", en: "Adds +1 to Strength rolls made to lift, push or carry something." } },
  { id: "independent-air-supply", name: { tr: "Hava Deposu", en: "Independent Air Supply" }, slot: "dahili", humanity: 2, price: 500, tags: ["baslangic"],
    flavor: { tr: "Akciğerlerin altına yerleştirilmiş basınçlı bir oksijen kapsülü. Kanalizasyonda, yangında ya da bir gaz bulutunun içinde yaşamakla ölmek arasındaki farkı o belirler.", en: "A pressurized oxygen capsule set under the lungs. In a sewer, a fire or a gas cloud, it's the difference between living and dying." },
    desc: { tr: "Kullanıcının 10 dakika boyunca nefes almadan kalmasını sağlar: su altında, dumanda ya da zehirli gazda. Kullanıldıktan 8 saat sonra yeniden kullanılabilir.", en: "Lets the user go 10 minutes without breathing: underwater, in smoke or in toxic gas. It can be used again 8 hours after use." } },
  { id: "enhanced-antibodies", name: { tr: "Güçlü Antikorlar", en: "Enhanced Antibodies" }, slot: "dahili", humanity: 2, price: 500, tags: ["baslangic"],
    flavor: { tr: "Kemik iliğine yerleştirilen bir üreteç, kana durmadan tasarım antikorlar salar. Yaralar daha çabuk kapanır, mikroplar tutunacak yer bulamaz.", en: "A generator set in the bone marrow keeps releasing designer antibodies into the blood. Wounds close faster and germs don't stand a chance." },
    desc: { tr: "Kullanıcı tam bir gece dinlendiğinde ona fazladan 2 HP kazandırır.", en: "When the user rests for a full night, it restores 2 extra HP to them." } },
  { id: "subdermal-plating", name: { tr: "Cilt Altı Plaka", en: "Subdermal Plating" }, slot: "cilt", humanity: 2, price: 500, tags: ["baslangic"],
    flavor: { tr: "Derinin hemen altına dizilmiş ince polimer pullar. Dokununca sert, bakınca fark edilmez.", en: "Thin polymer scales laid just under the skin. Hard to the touch, invisible to the eye." },
    desc: { tr: "Kullanıcının yumruklardan ve hafif yakın dövüş silahlarından aldığı hasarı 1 azaltır (hasar en az 1 kalır).", en: "Reduces the damage the user takes from punches and light melee weapons by 1 (minimum 1)." } },
  { id: "tool-hand", name: { tr: "Alet Eli", en: "Tool Hand" }, slot: "kol", humanity: 2, price: 500, tags: ["baslangic"],
    flavor: { tr: "Parmak boğumlarından tornavida, pense ve kesici uçlar çıkar. Tamircilerin ve hırsızların ortak dostu.", en: "Screwdrivers, pliers and cutting tips slide out of the knuckles. A friend to mechanics and thieves alike." },
    desc: { tr: "Kullanıcının alet gerektiren işleri yanında alet olmadan yapabilmesini sağlar. Mekanik kilit açmak için atılan Craft atışlarına +1 ekler.", en: "Lets the user do jobs that need tools without carrying any. Adds +1 to Craft rolls made to open mechanical locks." } },
  { id: "lynx-paws-mk1", name: { tr: "Vaşak Pençesi I", en: "Lynx Paws Mk I" }, slot: "bacak", humanity: 2, price: 500, tags: ["baslangic", "skill"],
    flavor: { tr: "Tabanlara ve topuklara gömülü yumuşak yastıklar adım sesini emer. Çatılarda iş görenlerin ilk kromu budur.", en: "Soft pads set into the soles and heels soak up the sound of footsteps. The first chrome of anyone who works the rooftops." },
    desc: { tr: "Hareket ederken atılan Stealth atışlarına +1 ekler.", en: "Adds +1 to Stealth rolls made while moving." } },

  // Hafif cyberware
  { id: "self-ice-mk2", name: { tr: "Kişisel ICE II", en: "Self-ICE Mk II" }, slot: "noral", humanity: 4, price: 1000, tags: [],
    flavor: { tr: "İlk modelin askerî kökenli kuzeni. Şüpheli sinyalleri tek bir duvar yerine katman katman süzgeçten geçirir; bir Netrunner'ın işini iki kat uzatır.", en: "The military-grade cousin of the Mk I. It runs suspicious signals through layer after layer of filters instead of a single wall, doubling a Netrunner's work." },
    desc: { tr: "Kullanıcının quickhack'lere karşı savunma DV'sine +2 ekler.", en: "Adds +2 to the user's defense DV against quickhacks." } },
  { id: "chipware-socket-mk2", name: { tr: "Beceri Çipi II", en: "Chipware Socket Mk II" }, slot: "noral", humanity: 4, price: 1000, tags: ["skill"],
    flavor: { tr: "Bant genişliği daha yüksek bir yuva. Çip artık yalnızca taklit etmez; kas hafızasına kadar iner.", en: "A socket with more bandwidth. The chip no longer just fakes it; it reaches all the way down into muscle memory." },
    desc: { tr: "Takıldığında kullanıcının yetkin olmadığı bir skill seçilir. Çip bu skill'e bağlanır ve ona +2 ekler; seçim sonradan değiştirilemez. Kullanıcı ileride bu skill'de yetkin olursa çipin etkisi kalmaz.", en: "When it's installed, a skill the user isn't proficient in is chosen. The chip is bound to that skill and adds +2 to it; the choice can't be changed later. If the user later becomes proficient in that skill, the chip no longer has any effect." } },
  { id: "translator-chip-mk2", name: { tr: "Çevirmen Çipi II", en: "Translator Chip Mk II" }, slot: "noral", humanity: 3, price: 750, tags: [],
    flavor: { tr: "Konuşma merkezine bağlanan çift yönlü bir çevirmen. Ses tellerine küçük düzeltmeler yollar; ağızdan çıkan kelimeler biraz mekanik ama anlaşılır.", en: "A two-way translator wired into the speech center. It sends small corrections to the vocal cords; the words come out a little mechanical, but clear." },
    desc: { tr: "Kullanıcının bilmediği dilleri anlamasını ve o dillerde basit cümlelerle konuşmasını sağlar.", en: "Lets the user understand languages they don't know and speak them in simple sentences." } },
  { id: "amplified-hearing", name: { tr: "Güçlendirilmiş İşitme", en: "Amplified Hearing" }, slot: "noral", humanity: 3, price: 750, tags: [],
    flavor: { tr: "İç kulağa eklenen bir mikrofon dizisi ve gürültü süzgeci. Kalabalık bir barda üç masa ötedeki fısıltıyı ayıklar.", en: "A microphone array and noise filter added to the inner ear. In a crowded bar, it picks out a whisper three tables away." },
    desc: { tr: "Sese dayalı Perception atışlarını avantajlı yapar.", en: "Gives advantage on Perception rolls that rely on hearing." } },
  { id: "kiroshi-optics-mk2", name: { tr: "Kiroshi Optik II", en: "Kiroshi Optics Mk II" }, slot: "goz", humanity: 4, price: 1000, tags: [],
    flavor: { tr: "Kiroshi'nin orta sınıf modeli: daha keskin mercek, daha hızlı odak, görüşün köşesinde küçük bir veri katmanı. Her şey biraz daha net.", en: "Kiroshi's mid-range model: a sharper lens, faster focus and a small data overlay in the corner of the eye. Everything is a little clearer." },
    desc: { tr: "Uzaktaki ayrıntıları yakınlaştırır: Uzak mesafedeki bir yüz ya da yazı Orta mesafedeymiş gibi görülür. Görmeye dayalı Perception atışlarına +1 ekler.", en: "Zooms in on distant details: a face or writing at Long range can be seen as if it were at Medium range. Adds +1 to Perception rolls that rely on sight." } },
  { id: "flare-filter-mk1", name: { tr: "Parlama Filtresi I", en: "Flare Filter Mk I" }, slot: "goz", humanity: 3, price: 750, tags: [],
    flavor: { tr: "Retinanın önüne yerleştirilen, kararabilen bir film. Ani bir parlamada kendiliğinden kapanır; tam yetişemese de gözü kurtarır.", en: "A self-darkening film set in front of the retina. It snaps shut at a sudden flash; even when it's a beat late, it saves the eye." },
    desc: { tr: "Flaşın ya da parlak ışığın kullanıcıda yol açtığı geçici körlüğün süresini yarıya indirir (aşağı yuvarlanır).", en: "Halves the duration of temporary blindness that flashes and bright light cause the user (rounded down)." } },
  { id: "scratchers", name: { tr: "Tırnak Bıçakları", en: "Scratchers" }, slot: "kol", humanity: 3, price: 750, tags: [],
    flavor: { tr: "Tırnakların yerini alan, istendiğinde parmak uçlarından kayarak çıkan jilet keskinliğinde bıçaklar. Barda kavga çıktığında kimse ellere bakmaz.", en: "Razor-sharp blades that replace the fingernails and slide out of the fingertips on command. When a bar fight starts, nobody's watching your hands." },
    desc: { tr: "Hafif bir yakın dövüş silahıdır (1d6). Gizlidir ve elden düşürülemez.", en: "It's a light melee weapon (1d6). It's concealed and can't be knocked out of the user's hand." } },
  { id: "taser-hand", name: { tr: "Şok Eli", en: "Taser Hand" }, slot: "kol", humanity: 4, price: 1000, tags: ["tur-ici-reaksiyon"],
    flavor: { tr: "Avuç içine ve parmak boğumlarına gizlenmiş elektrotlar. Doğru yere inen bir yumrukta karşıdakinin sinirleri bir anlığına birbirine girer.", en: "Electrodes hidden in the palm and knuckles. Land a punch in the right spot and the other guy's nerves tie themselves in a knot for a moment." },
    desc: { tr: "Savaş başına bir kez, kullanıcı bir yumruğu isabet ettirdiğinde Reaction'ını harcayıp şoku salabilir: vurulan kişi kendi bir sonraki turunun sonuna kadar Reaction kullanamaz.", en: "Once per combat, when the user lands a punch, they can spend their Reaction to release the shock: the person hit can't use Reactions until the end of their own next turn." } },
  { id: "reinforced-tendons", name: { tr: "Güçlendirilmiş Tendonlar", en: "Reinforced Tendons" }, slot: "bacak", humanity: 4, price: 1000, tags: [],
    flavor: { tr: "Aşil tendonlarının yerine geçen karbon fiber halatlar. Gece bir çatıdan ötekine atlayan gölgelerin sırrı.", en: "Carbon-fiber cables that take the place of the Achilles tendons. The secret of the shadows that leap from roof to roof at night." },
    desc: { tr: "Kullanıcının zıplama mesafesini iki katına çıkarır.", en: "Doubles the user's jumping distance." } },
  { id: "fortified-ankles", name: { tr: "Takviyeli Bilekler", en: "Fortified Ankles" }, slot: "bacak", humanity: 3, price: 750, tags: [],
    flavor: { tr: "Ayak bileklerine ve dizlere eklenen hidrolik amortisörler. Sahibini yüksekten bir kedi gibi yere indirir, ama bir kedi kadar sessiz değil.", en: "Hydraulic shock absorbers added to the ankles and knees. They bring their owner down from a height like a cat, just not as quietly." },
    desc: { tr: "Düşüşlerde ilk 8 metreyi hasarsız kılar (normalde 4 metre).", en: "Makes the first 8 meters of a fall harmless for the user (normally 4 meters)." } },
  { id: "biomonitor-mk2", name: { tr: "Biomonitor II", en: "Biomonitor Mk II" }, slot: "dahili", humanity: 3, price: 750, tags: [],
    flavor: { tr: "İlk modelin ölçtüklerine ek olarak bir ritim düzenleyici taşır. Kalp durmak üzereyken ona son bir tekme atar.", en: "On top of everything the Mk I measures, it carries a rhythm regulator. When the heart is about to stop, it gives it one last kick." },
    desc: { tr: "Kullanıcıya HP'sini ve yara durumunu her an gösterir. Kullanıcı Ölümcül Yaralıyken onu stabilize etmeye çalışan kişinin Medicine atışına +1 ekler ve kullanıcının ilk ölüm kurtarma atışını avantajlı yapar.", en: "Shows the user their HP and wound state at all times. While the user is Mortally Wounded, it adds +1 to the Medicine roll of whoever tries to stabilize them and gives the user advantage on their first death save." } },
  { id: "blood-pump-mk2", name: { tr: "Kan Pompası II", en: "Blood Pump Mk II" }, slot: "dahili", humanity: 4, price: 1000, tags: ["otomatik"],
    flavor: { tr: "Daha büyük bir hazne, daha güçlü bir pompa. Her çatışmadan önce sessizce yeniden dolar.", en: "A bigger reservoir and a stronger pump. It quietly refills before every fight." },
    desc: { tr: "Savaş başına bir kez, kullanıcının HP'si ilk kez maksimumunun yarısının altına indiğinde kendiliğinden devreye girer ve kullanıcıya 1d6 HP kazandırır.", en: "Once per combat, the first time the user's HP drops below half its maximum, it kicks in on its own and restores 1d6 HP to them." } },
  { id: "stim-gland", name: { tr: "Uyarıcı Bez", en: "Stim Gland" }, slot: "dahili", humanity: 5, price: 1500, tags: ["bonus-aksiyon"],
    flavor: { tr: "Böbreküstü bezinin yanına yerleştirilen sentetik bir uyarıcı deposu. Bir düşünceyle boşalır; dünya yavaşlamaz ama bacaklar hızlanır.", en: "A reservoir of synthetic stimulants set beside the adrenal gland. A single thought empties it; the world doesn't slow down, but the legs speed up." },
    desc: { tr: "Savaş başına bir kez, bonus aksiyonla etkinleştirilir. Kullanıcının bir sonraki turunun sonuna kadar hareketini 4 metre (2 kare) artırır ve Athletics atışlarını avantajlı yapar.", en: "Once per combat, it can be activated with a bonus action. Until the end of the user's next turn, it increases their movement by 4 meters (2 squares) and gives them advantage on Athletics rolls." } },
  { id: "titanium-bones", name: { tr: "Titanyum Kemikler", en: "Titanium Bones" }, slot: "dahili", humanity: 5, price: 1500, tags: [],
    flavor: { tr: "Kol ve bacak kemiklerinin içi titanyum bir kafesle örülür. Kemikler yine kırılır, ama nadiren ve hiçbir zaman tamamen.", en: "The inside of the arm and leg bones is laced with a titanium cage. The bones still break, but rarely, and never all the way." },
    desc: { tr: "Kullanıcıya Uzuv tablosundan kritik yara geldiğinde tablo zarı iki kez atılır ve düşük sonuç kullanılır.", en: "When a critical injury is rolled for the user on the Limb table, the die is rolled twice and the lower result is used." } },
  { id: "subdermal-armor", name: { tr: "Cilt Altı Zırh", en: "Subdermal Armor" }, slot: "cilt", humanity: 5, price: 1500, tags: [],
    flavor: { tr: "Gövdeyi saran, derinin altına dökülmüş esnek bir balistik katman. Çıplak gezene bile bir yelek giydirmiş olur.", en: "A flexible ballistic layer poured under the skin of the torso. Even someone walking around shirtless is wearing a vest." },
    desc: { tr: "Kullanıcı zırh giymese bile, gövdesine gelen isabetlerde SP'sine +1 ekler. Bu +1 aşınmaz.", en: "Adds +1 to the user's SP against hits to the body, even if they wear no armor. This +1 never ablates." } },
  { id: "gecko-pads", name: { tr: "Kertenkele Pedleri", en: "Gecko Pads" }, slot: "cilt", humanity: 3, price: 750, tags: [],
    flavor: { tr: "Avuç içlerine ve parmak uçlarına işlenen mikroskobik tutunma tüyleri. Cam bir duvara bile bir an yapışır.", en: "Microscopic gripping hairs worked into the palms and fingertips. They hold on for a moment even to a glass wall." },
    desc: { tr: "Tırmanırken atılan Athletics atışlarını avantajlı yapar.", en: "Gives advantage on Athletics rolls made to climb." } },

  // Hafif cyberware: skill bonusu
  { id: "pheromone-emitter", name: { tr: "Feromon Yayıcı", en: "Pheromone Emitter" }, slot: "dahili", humanity: 4, price: 1000, tags: ["skill"],
    flavor: { tr: "Boyun ve koltuk altı bezlerine yerleştirilen küçük salgı keseleri. Karşıdaki farkına bile varmadan biraz yumuşar.", en: "Tiny scent sacs set into the glands of the neck and armpits. The other person softens a little without ever noticing why." },
    desc: { tr: "Yüz yüze konuşmalarda Persuasion atışlarına +1 ekler.", en: "Adds +1 to Persuasion rolls in face-to-face conversations." } },
  { id: "vocal-stabilizer", name: { tr: "Ses Sabitleyici", en: "Vocal Stabilizer" }, slot: "dahili", humanity: 4, price: 1000, tags: ["skill"],
    flavor: { tr: "Gırtlağa yerleştirilen bir titreşim sönümleyici. Ses titremez, nefes hızlanmaz; yalanlar bile sakin çıkar.", en: "A vibration damper set in the larynx. The voice never shakes and the breath never quickens; even lies come out calm." },
    desc: { tr: "Konuşarak yapılan Deception atışlarına +1 ekler.", en: "Adds +1 to Deception rolls made by talking." } },
  { id: "menace-optics", name: { tr: "Tehdit Optiği", en: "Menace Optics" }, slot: "goz", humanity: 3, price: 750, tags: ["skill"],
    flavor: { tr: "Göz bebeklerini istendiğinde kan kırmızısına çeviren bir lens katmanı. Sokakta tartışmayı kısa kesmenin en kolay yolu.", en: "A lens layer that turns the pupils blood red on command. The easiest way to cut an argument short on the street." },
    desc: { tr: "Yüz yüze yapılan Intimidation atışlarına +1 ekler.", en: "Adds +1 to face-to-face Intimidation rolls." } },
  { id: "micro-expression-reader", name: { tr: "Mimik Okuyucu", en: "Micro-expression Reader" }, slot: "goz", humanity: 4, price: 1000, tags: ["skill"],
    flavor: { tr: "Yüzdeki en küçük kas seğirmesini yakalayıp görüşün köşesine not düşen bir analiz yazılımı. Fixer'ların pazarlık masasına güneş gözlüğüyle oturmasının sebebi budur.", en: "Analysis software that catches the smallest twitch of a facial muscle and notes it in the corner of the eye. It's why fixers come to the bargaining table in sunglasses." },
    desc: { tr: "Kullanıcının yüzünü görebildiği birinin niyetini ya da duygusunu okumak için atılan Insight atışlarına +1 ekler.", en: "Adds +1 to Insight rolls to read the intent or feelings of someone whose face the user can see." } },
  { id: "neon-dermis", name: { tr: "Neon Deri", en: "Neon Dermis" }, slot: "cilt", humanity: 3, price: 750, tags: ["skill"],
    flavor: { tr: "Derinin altına işlenmiş, müzikle ve nabızla birlikte yanıp sönen ışıklı desenler. Sahnede bütün gözleri taşıyanın üstüne çeker.", en: "Glowing patterns worked under the skin that pulse with the music and the heartbeat. On stage, they pull every eye to whoever wears them." },
    desc: { tr: "Performance atışlarına +1 ekler.", en: "Adds +1 to Performance rolls." } },
  { id: "data-library", name: { tr: "Bilgi Bankası", en: "Data Library" }, slot: "noral", humanity: 3, price: 750, tags: ["skill"],
    flavor: { tr: "Hafızaya gömülü, ağa bağlanmadan çalışan sıkıştırılmış bir ansiklopedi. Bir şirketin kuruluş yılı ya da bir silahın kalibresi, soru akla gelir gelmez hazırdır.", en: "A compressed encyclopedia embedded in memory that works without a network connection. A corporation's founding year or a gun's caliber is there the moment the question comes to mind." },
    desc: { tr: "Lore atışlarına +1 ekler.", en: "Adds +1 to Lore rolls." } },
  { id: "gossip-feed", name: { tr: "Dedikodu Akışı", en: "Gossip Feed" }, slot: "noral", humanity: 3, price: 750, tags: ["skill"],
    flavor: { tr: "Sokak forumlarını, korsan yayınları ve fixer kanallarını durmadan tarayıp özetleyen bir abonelik. Bilgi ucuz ama hep taze.", en: "A subscription that keeps scanning street forums, pirate broadcasts and fixer channels and sums them up. The intel is cheap, but always fresh." },
    desc: { tr: "Streetwise atışlarına +1 ekler.", en: "Adds +1 to Streetwise rolls." } },
  { id: "drive-interface", name: { tr: "Sürüş Arayüzü", en: "Drive Interface" }, slot: "noral", humanity: 4, price: 1000, tags: ["skill"],
    flavor: { tr: "Neuroport üzerinden aracın beynine bağlanan bir sürücü yazılımı. Direksiyonu eller değil, sinirler tutar.", en: "Driver software that plugs into the vehicle's brain through the neuroport. It's the nerves holding the wheel, not the hands." },
    desc: { tr: "Driving atışlarına +1 ekler.", en: "Adds +1 to Driving rolls." } },
  { id: "medscanner", name: { tr: "Tıbbi Tarayıcı", en: "Medscanner" }, slot: "kol", humanity: 4, price: 1000, tags: ["skill"],
    flavor: { tr: "Avuç içine gömülü bir tarayıcı. Yaralıya dokunduğu anda nabzı, kan kaybını ve kırıkları gösterir.", en: "A scanner embedded in the palm. The moment it touches a patient, it shows the pulse, the blood loss and the fractures." },
    desc: { tr: "Stabilize etmek ya da tedavi etmek için atılan Medicine atışlarına +1 ekler.", en: "Adds +1 to Medicine rolls made to stabilize or treat someone." } },
  { id: "data-probe", name: { tr: "Veri Ucu", en: "Data Probe" }, slot: "kol", humanity: 3, price: 750, tags: ["skill"],
    flavor: { tr: "İşaret parmağından çıkan ince bir veri ucu. Kapı panellerine, kart okuyuculara ve alarm kutularına doğrudan girer.", en: "A thin data spike that slides out of the index finger and plugs straight into door panels, card readers and alarm boxes." },
    desc: { tr: "Kullanıcının bu uçla doğrudan bağlandığı cihazlarda atılan Hardware atışlarına +1 ekler.", en: "Adds +1 to Hardware rolls on devices the user plugs it into directly." } },

  // Orta cyberware
  { id: "kerenzikov", name: { tr: "Kerenzikov", en: "Kerenzikov" }, slot: "noral", humanity: 8, price: 4000, tags: [],
    flavor: { tr: "Omurilik boyunca uzanan bir sinyal hızlandırıcı. Tehlike anında beyin daha karar vermeden vücut harekete geçer.", en: "A signal booster that runs along the spinal cord. When danger hits, the body moves before the brain has decided." },
    desc: { tr: "Kullanıcının inisiyatif atışlarına +2 ekler. Refleks kromudur.", en: "Adds +2 to the user's initiative rolls. It counts as reflex chrome." } },
  { id: "pain-editor", name: { tr: "Acı Düzenleyici", en: "Pain Editor" }, slot: "noral", humanity: 9, price: 5000, tags: [],
    flavor: { tr: "Acı sinyallerini beyne ulaşmadan süzen bir nöral filtre. Kemik kırıldığında kullanıcı bunu bir bildirimden öğrenir.", en: "A neural filter that screens pain signals before they reach the brain. When a bone breaks, the user finds out from a notification." },
    desc: { tr: "Ağır Yaralı durumunun bütün atışlara getirdiği −2 cezasını kaldırır.", en: "Removes the −2 penalty to all rolls that comes with being Seriously Wounded." } },
  { id: "thermal-optics", name: { tr: "Termal Optik", en: "Thermal Optics" }, slot: "goz", humanity: 6, price: 2500, tags: [],
    flavor: { tr: "Görüşün üstüne bindirilen bir ısı haritası. Karanlık bir koridorda soğuk duvarlar kaybolur, insanlar turuncu birer gölge gibi parlar.", en: "A heat map laid over normal sight. In a dark corridor the cold walls fade away and people glow like orange shadows." },
    desc: { tr: "Canlıları vücut ısılarından gösterir: kullanıcı loş ışıkta, karanlıkta, dumanda ve siste canlıları görebilir. Cansız şeyleri bu yolla göstermez ve siperin arkasını da göstermez.", en: "Shows living things by their body heat: the user can see living beings in dim light, darkness, smoke and fog. It doesn't show lifeless objects this way, and it can't show what's behind cover." } },
  { id: "standard-wolvers", name: { tr: "Standart Wolvers", en: "Standard Wolvers" }, slot: "kol", humanity: 7, price: 3000, tags: [],
    flavor: { tr: "Ön kolun içinden boğumların üstüne kayan üç çelik pençe. Sokak dövüşçülerinin ve çete askerlerinin sadık dostu.", en: "Three steel claws that slide out of the forearm over the knuckles. The trusty friend of street fighters and gang soldiers." },
    desc: { tr: "Orta bir yakın dövüş silahıdır (2d6). Elden düşürülemez.", en: "It's a medium melee weapon (2d6). It can't be knocked out of the user's hand." } },
  { id: "standard-monowire", name: { tr: "Standart Monowire", en: "Standard Monowire" }, slot: "kol", humanity: 8, price: 4000, tags: ["iki-slot"],
    flavor: { tr: "Bileğe sarılı, molekül inceliğinde bir tel. Havada savrulduğunda görünmez; geçtiği yerde ince, kırmızı bir çizgi kalır.", en: "A wire a molecule thin, coiled at the wrist. Whipped through the air it's invisible; all it leaves behind is a thin red line." },
    desc: { tr: "Orta bir yakın dövüş silahıdır (2d6). 4 metreye (2 kare) kadar uzaktaki hedeflere ulaşır.", en: "It's a medium melee weapon (2d6). It reaches targets up to 4 meters (2 squares) away." } },
  { id: "grounding-plate", name: { tr: "Topraklama Plakası", en: "Grounding Plate" }, slot: "dahili", humanity: 6, price: 2500, tags: ["otomatik"],
    flavor: { tr: "Göğüs kafesinin içine yerleştirilen iletken bir plaka. Gelen akımı hayati organlardan uzağa, yere doğru çeker.", en: "A conductive plate set inside the rib cage. It pulls incoming current away from the vital organs and down into the ground." },
    desc: { tr: "Savaş başına bir kez, kullanıcının aldığı ilk elektrik hasarını (Shock, Short Circuit, elektrik çarpması) kendiliğinden yarıya indirir.", en: "Once per combat, automatically halves the first electrical damage the user takes (Shock, Short Circuit, an electric shock)." } },
  { id: "heat-regulator", name: { tr: "Isı Düzenleyici", en: "Heat Regulator" }, slot: "dahili", humanity: 6, price: 2500, tags: ["otomatik"],
    flavor: { tr: "Damarlara bağlanan küçük bir soğutma devresi. Yangının ortasında bile vücut ısısını yerinde tutar.", en: "A small cooling loop plugged into the blood vessels. It holds body temperature steady even in the middle of a fire." },
    desc: { tr: "Savaş başına bir kez, kullanıcının aldığı ilk ateş ya da aşırı ısı hasarını (Overheat dahil) kendiliğinden yarıya indirir.", en: "Once per combat, automatically halves the first fire or extreme heat damage the user takes (including Overheat)." } },
  { id: "skin-weave", name: { tr: "Deri Örgüsü", en: "Skin Weave" }, slot: "cilt", humanity: 8, price: 4000, tags: [],
    flavor: { tr: "Derinin altına örülen kevlar lifleri. Dışarıdan sıradan bir cilt; mermi değdiğinde çelik bir ağ.", en: "Kevlar fibers woven under the skin. From the outside it's ordinary skin; when a bullet hits, it's a steel net." },
    desc: { tr: "Kullanıcı zırh giymese bile, gövdesine gelen isabetlerde SP'sine +2 ekler. Bu +2 aşınmaz.", en: "Adds +2 to the user's SP against hits to the body, even if they wear no armor. This +2 never ablates." } },
  { id: "jump-booster", name: { tr: "Sıçrama Pistonları", en: "Jump Booster" }, slot: "bacak", humanity: 7, price: 3000, tags: [],
    flavor: { tr: "Baldırlara yerleştirilen hidrolik pistonlar. Her adımda hafif bir tıslama; her sıçrayışta çatlayan beton.", en: "Hydraulic pistons set into the calves. A soft hiss with every step; cracked concrete with every jump." },
    desc: { tr: "Kullanıcının zıplama mesafesini üç katına çıkarır ve düşüşlerde ilk 12 metreyi hasarsız kılar.", en: "Triples the user's jumping distance and makes the first 12 meters of a fall harmless for them." } },

  // İleri cyberware
  { id: "sandevistan", name: { tr: "Sandevistan", en: "Sandevistan" }, slot: "noral", humanity: 13, price: 15000, tags: ["bonus-aksiyon"],
    flavor: { tr: "Beynin zaman algısını hızlandıran efsanevi bir sinir kiti. Açıldığında dünya ağır çekime girer; kullanıcı ise girmez.", en: "A legendary neural kit that speeds up the brain's sense of time. When it kicks in, the world goes into slow motion; the user doesn't." },
    desc: { tr: "Savaş başına bir kez, bonus aksiyonla etkinleştirilir. Etkinleştirildiği turda kullanıcıya bir aksiyon daha kazandırır ve kullanıcının bir sonraki turunun sonuna kadar mermiden kaçmak için atılan Evasion atışlarını avantajlı yapar. Refleks kromudur.", en: "Once per combat, it can be activated with a bonus action. On the turn it's activated, it gives the user one extra action, and until the end of the user's next turn it gives them advantage on Evasion rolls to dodge bullets. It counts as reflex chrome." } },
  { id: "synaptic-accelerator", name: { tr: "Sinaps Hızlandırıcı", en: "Synaptic Accelerator" }, slot: "noral", humanity: 12, price: 12500, tags: [],
    flavor: { tr: "Sinir uçlarına yerleştirilen binlerce küçük yükseltici. Kullanıcı bir saldırıya karşılık verirken bir sonrakine çoktan hazırdır.", en: "Thousands of tiny amplifiers set into the nerve endings. While the user answers one attack, they're already set for the next." },
    desc: { tr: "Kullanıcının kendi turunun dışında kullanabileceği Reaction sayısını 1'den 2'ye çıkarır. Refleks kromudur.", en: "Raises the number of Reactions the user can use outside their own turn from 1 to 2. It counts as reflex chrome." } },
  { id: "self-ice-mk3", name: { tr: "Kişisel ICE III", en: "Self-ICE Mk III" }, slot: "noral", humanity: 11, price: 10000, tags: ["tur-disi-reaksiyon"],
    flavor: { tr: "Şirket güvenlik şeflerinin taşıdığı türden bir savunma katmanı. Saldırıyı daha kapıdayken tanır ve kapıyı yüzüne çarpar.", en: "The kind of defense layer corporate security chiefs carry. It recognizes an attack while it's still at the door, and slams the door in its face." },
    desc: { tr: "Kullanıcının quickhack'lere karşı savunma DV'sine +3 ekler. Oturum başına bir kez, kendisine yapılan bir quickhack tuttuğunda kullanıcı Reaction'ını harcayabilir. Bu durumda quickhack tutmamış sayılır.", en: "Adds +3 to the user's defense DV against quickhacks. Once per session, when a quickhack used on the user works, they can spend their Reaction to make it count as having failed." } },
  { id: "kiroshi-optics-mk3", name: { tr: "Kiroshi Optik III", en: "Kiroshi Optics Mk III" }, slot: "goz", humanity: 11, price: 10000, tags: [],
    flavor: { tr: "Kiroshi'nin üst sınıf modeli; keskin nişancıların ve muhabirlerin tercihi. Bir kilometre ötedeki birinin dudaklarını okuyacak kadar net görür.", en: "Kiroshi's high-end model; the choice of snipers and reporters. Sharp enough to read someone's lips a kilometer away." },
    desc: { tr: "Uzak ve Çok uzak mesafedeki ayrıntıları bir adım yakındaymış gibi gösterir. Görmeye dayalı Perception atışlarına +2 ekler.", en: "Shows details at Long and Extreme range as if they were one step closer. Adds +2 to Perception rolls that rely on sight." } },
  { id: "mantis-blades", name: { tr: "Mantis Blades", en: "Mantis Blades" }, slot: "kol", humanity: 13, price: 15000, tags: ["iki-slot"],
    flavor: { tr: "Ön kolların içinde katlı duran, peygamber devesinin kolları gibi açılan iki uzun bıçak. Çıktıklarında çoğu kavga zaten bitmiştir.", en: "Two long blades folded inside the forearms that open like a praying mantis's arms. By the time they're out, most fights are already over." },
    desc: { tr: "Ağır bir yakın dövüş silahıdır (3d6). Gizlidir ve elden düşürülemez.", en: "It's a heavy melee weapon (3d6). It's concealed and can't be knocked out of the user's hand." } },
  { id: "gorilla-arms", name: { tr: "Gorilla Arms", en: "Gorilla Arms" }, slot: "kol", humanity: 12, price: 12500, tags: ["iki-slot"],
    flavor: { tr: "Kas yerine hidrolik, kemik yerine çelik. Bu kollarla bir tokalaşma bile dikkat ister.", en: "Hydraulics for muscle, steel for bone. Even a handshake with these arms takes care." },
    desc: { tr: "Kullanıcının yumruk hasarını, BODY'ye göre belirlenen yumruk hasarı tablosunda iki basamak yükseltir (en fazla 4d6). Kapı kırmak ya da bir şeyi yerinden sökmek gibi işler için atılan Strength atışlarını avantajlı yapar.", en: "Raises the user's punch damage by two steps on the BODY punch damage table (up to 4d6). Gives advantage on Strength rolls for things like breaking down a door or tearing something loose." } },
  { id: "kick-pistons", name: { tr: "Tekme Pistonları", en: "Kick Pistons" }, slot: "bacak", humanity: 11, price: 10000, tags: [],
    flavor: { tr: "Diz ve kalçaya yerleştirilen basınçlı pistonlar. Bir tekmeyle kapı menteşesinden, adam ayaklarından kalkar.", en: "Pressurized pistons set into the knees and hips. One kick takes a door off its hinges and a man off his feet." },
    desc: { tr: "Kullanıcının tekmelerini 3d6 hasar veren yakın dövüş saldırılarına çevirir; tekmeler Brawling ile atılır. İsabet eden bir tekme, vurulan kişiyi 4 metre (2 kare) geri iter. Tekmeler ROF 1'dir.", en: "Turns the user's kicks into melee attacks that deal 3d6 damage; kicks are rolled with Brawling. A kick that hits pushes the person hit back 4 meters (2 squares). Kicks are ROF 1." } },
  { id: "second-heart", name: { tr: "İkinci Kalp", en: "Second Heart" }, slot: "dahili", humanity: 13, price: 15000, tags: ["otomatik"],
    flavor: { tr: "Göğüste sessizce bekleyen yedek bir kalp. Asıl kalp durduğu an atmaya başlar.", en: "A backup heart waiting quietly in the chest. The moment the real one stops, it starts beating." },
    desc: { tr: "Oturum başına bir kez, kullanıcı ikinci ölüm kurtarma başarısızlığını aldığında kendiliğinden devreye girer: o başarısızlık sayılmaz, kullanıcı stabilize olur ve 1d6 HP ile kalır.", en: "Once per session, it kicks in on its own when the user takes their second death save failure: that failure doesn't count, and the user is stabilized with 1d6 HP." } },
  { id: "bone-lace", name: { tr: "Kemik Örgüsü", en: "Bone Lace" }, slot: "dahili", humanity: 12, price: 12500, tags: [],
    flavor: { tr: "Bütün iskeleti saran polimer bir örgü. Kemikler ağırlaşır, beden sertleşir; banyo terazisi artık başka bir sayı gösterir.", en: "A polymer lattice wrapped around the whole skeleton. Heavier bones, a tougher body; the bathroom scale shows a different number now." },
    desc: { tr: "Kullanıcının maksimum HP'sini 8 artırır.", en: "Increases the user's maximum HP by 8." } },
  { id: "optical-camo", name: { tr: "Optik Kamuflaj", en: "Optical Camo" }, slot: "cilt", humanity: 14, price: 17500, tags: ["bonus-aksiyon"],
    flavor: { tr: "Deriye işlenmiş, ışığı kıran bir film. Açıldığında kullanıcı arkasındaki duvarın rengine bürünür ve havada titreşen bir dalgaya dönüşür.", en: "A light-bending film worked into the skin. When it switches on, the user takes on the color of the wall behind them and turns into a shimmer in the air." },
    desc: { tr: "Savaş başına bir kez, bonus aksiyonla etkinleştirilir ve kullanıcıyı bir sonraki turunun sonuna kadar görünmez yapar. Bu sürede kullanıcıya yapılan saldırılar dezavantajlıdır ve kullanıcı görmeye dayalı Perception atışlarıyla fark edilemez. Kullanıcı saldırı yaparsa kamuflaj hemen kapanır.", en: "Once per combat, it can be activated with a bonus action, making the user invisible until the end of their next turn. During that time, attacks against the user have disadvantage, and the user can't be spotted with sight-based Perception rolls. The camo shuts off as soon as the user attacks." } },

  // Ağır cyberware
  { id: "sandevistan-mk2", name: { tr: "Sandevistan II", en: "Sandevistan Mk II" }, slot: "noral", humanity: 18, price: 40000, tags: ["bonus-aksiyon"],
    flavor: { tr: "Askerî sınıf bir Sandevistan. Saniyeler dakikalara uzar; bedelini ise sistem kapandığında beden öder.", en: "A military-grade Sandevistan. Seconds stretch into minutes; the body pays for it when it shuts off." },
    desc: { tr: "Savaş başına bir kez, bonus aksiyonla etkinleştirilir. Etkinleştirildiği turda ve kullanıcının bir sonraki turunda kullanıcıya birer aksiyon daha kazandırır. Bu süre boyunca kullanıcının hareketini iki katına çıkarır ve mermiden kaçmak için atılan Evasion atışlarını avantajlı yapar. Etkisi bitince kullanıcı 1d6 hasar alır (zırh işlemez). Refleks kromudur.", en: "Once per combat, it can be activated with a bonus action. On the turn it's activated and on the user's next turn, it gives the user one extra action. During that time, it doubles their movement and gives them advantage on Evasion rolls to dodge bullets. When the effect ends, the user takes 1d6 damage (armor doesn't apply). It counts as reflex chrome." } },
  { id: "berserk", name: { tr: "Berserk", en: "Berserk" }, slot: "noral", humanity: 17, price: 35000, tags: ["bonus-aksiyon"],
    flavor: { tr: "Acıyı, korkuyu ve aklı aynı anda kapatan bir savaş işletim sistemi. Bittiğinde geride kalan kişi her zaman aynı kişi değildir.", en: "A combat operating system that shuts off pain, fear and reason all at once. When it ends, the person left behind isn't always the same one." },
    desc: { tr: "Savaş başına bir kez, bonus aksiyonla etkinleştirilir ve 3 tur sürer. Bu sürede kullanıcının yakın dövüş hasarına +1d6 ekler, yara cezalarını kaldırır ve HP'sinin 1'in altına düşmesini engeller. Etkisi bitince kullanıcı DV 11'e karşı Mental Resist atar. Başaramazsa kısa süreli bir psikoz yaşar ve 1d6 tur boyunca GM'in kontrolüne geçer.", en: "Once per combat, it can be activated with a bonus action, and it lasts 3 rounds. During that time, it adds +1d6 to the user's melee damage, removes their wound penalties and keeps their HP from dropping below 1. When the effect ends, the user rolls Mental Resist against DV 11. On a failure, they go through a short psychotic break and the GM controls them for 1d6 rounds." } },
  { id: "deck-bridge", name: { tr: "Deck Köprüsü", en: "Deck Bridge" }, slot: "noral", humanity: 16, price: 30000, tags: [],
    flavor: { tr: "Cyberdeck'i beyne doğrudan bağlayan bir köprü. Netrunner ile makine arasındaki son mesafe de kalkar.", en: "A bridge that wires the cyberdeck straight into the brain. The last gap between Netrunner and machine is gone." },
    desc: { tr: "Kullanıcının quickhack atışlarına +2 ekler ve RAM'inin her turunun başında 1 yerine 2 dolmasını sağlar.", en: "Adds +2 to the user's quickhack rolls and makes their RAM refill by 2 instead of 1 at the start of each of their turns." } },
  { id: "clairvoyant-optics", name: { tr: "Durugörü Optiği", en: "Clairvoyant Optics" }, slot: "goz", humanity: 16, price: 30000, tags: [],
    flavor: { tr: "Askerî keşif birliklerinden sızmış bir göz. Duvarlar ince birer perde gibi saydamlaşır; arkalarında ısı lekeleri dolaşır.", en: "An eye leaked from military recon units. Walls turn thin and see-through, with heat blots moving behind them." },
    desc: { tr: "Duvarların ve siperlerin arkasındaki kişileri 12 metreye (6 kare) kadar ısı izlerinden gösterir. Kullanıcı onların yerini bilir, ama onları görmüş sayılmaz.", en: "Shows people behind walls and cover by their heat, up to 12 meters (6 squares) away. The user knows where they are, but doesn't count as seeing them." } },
  { id: "projectile-launch-system", name: { tr: "Mermi Fırlatma Sistemi", en: "Projectile Launch System" }, slot: "kol", humanity: 16, price: 30000, tags: ["aksiyon"],
    flavor: { tr: "Ön kolun içine katlanmış bir mini roketatar. Kol açılır, namlu çıkar; bir saniye sonra odanın yarısı yoktur.", en: "A mini rocket launcher folded into the forearm. The arm opens, a barrel slides out, and a second later half the room is gone." },
    desc: { tr: "Savaş başına iki kez, aksiyonla ateşlenir. Atış Heavy Weapons ile yapılır ve patlayıcı kurallarına göre işler: 4d6 hasar verir, hedeflenen kareyi merkez alan 3 × 3 karelik bir alanı etkiler ve ideal mesafesi Orta'dır.", en: "Twice per combat, it can be fired with an action. The attack is made with Heavy Weapons and follows the explosives rules: it deals 4d6 damage to a 3 × 3 square area centered on the targeted square, and its ideal range is Medium." } },
  { id: "chain-arm", name: { tr: "Testere Kol", en: "Chain Arm" }, slot: "kol", humanity: 17, price: 35000, tags: [],
    flavor: { tr: "Ön kolun yerini alan, motorlu zincir dişlerle kaplı bir bıçak. Çalıştığında bütün sokak duyar.", en: "A blade covered in motorized chain teeth that takes the place of the forearm. When it starts up, the whole street hears it." },
    desc: { tr: "Çok ağır bir yakın dövüş silahıdır (4d6). Elden düşürülemez. Çok gürültülüdür ve gizlice kullanılamaz.", en: "It's a very heavy melee weapon (4d6). It can't be knocked out of the user's hand. It's very loud and can't be used quietly." } },
  { id: "linear-frame", name: { tr: "Destek İskeleti", en: "Linear Frame" }, slot: "dahili", humanity: 18, price: 40000, tags: [],
    flavor: { tr: "Omurgadan bileklere uzanan takviyeli bir iskelet. Taşıyan kişi artık yarı insan, yarı forklift.", en: "A reinforced frame running from the spine to the wrists. Whoever wears it is now half human, half forklift." },
    desc: { tr: "Kullanıcının BODY'sini 2 artırır (en fazla 20). HP, yumruk hasarı ve BODY skill'leri de buna göre yükselir.", en: "Increases the user's BODY by 2 (up to 20). Their HP, punch damage and BODY skills rise to match." } },
  { id: "blood-recycler", name: { tr: "Kan Arıtıcı", en: "Blood Recycler" }, slot: "dahili", humanity: 16, price: 30000, tags: ["bonus-aksiyon"],
    flavor: { tr: "Kaybedilen kanı toplayıp temizleyen ve damara geri basan bir makine. Kullanıcı kanamayı neredeyse hiç fark etmez.", en: "A machine that collects lost blood, cleans it and pumps it back into the veins. The user barely notices the bleeding." },
    desc: { tr: "Savaş başına bir kez, bonus aksiyonla etkinleştirilir ve kullanıcıya 3d6 HP kazandırır.", en: "Once per combat, it can be activated with a bonus action to restore 3d6 HP to the user." } },
  { id: "titanium-skin", name: { tr: "Titanyum Deri", en: "Titanium Skin" }, slot: "cilt", humanity: 17, price: 35000, tags: [],
    flavor: { tr: "Derinin altına dökülmüş ince titanyum levhalar. Mermiler sekip gider, ama suya düşen dibi boylar.", en: "Thin titanium plates poured under the skin. Bullets bounce off, but whoever falls into the water goes straight to the bottom." },
    desc: { tr: "Kullanıcı zırh giymese bile, gövdesine ve kafasına gelen isabetlerde SP'sine +3 ekler. Bu +3 aşınmaz. Ağır bir deridir: kullanıcı yüzemez.", en: "Adds +3 to the user's SP against hits to the body and head, even if they wear no armor. This +3 never ablates. It's a heavy skin: the user can't swim." } },

  // İkonik cyberware
  { id: "militech-apogee", name: { tr: "Militech \"Apogee\" Sandevistan", en: "Militech \"Apogee\" Sandevistan" }, slot: "noral", humanity: 20, price: 100000, tags: ["ikonik", "bonus-aksiyon"],
    flavor: { tr: "Militech'in askerî prototip hattından çıkmış bir Sandevistan. Sokağa nasıl düştüğünü kimse bilmiyor; taşıyanların çoğu da uzun yaşamadı. Açıldığında dünya neredeyse durur; kapandığında faturayı beden öder.", en: "A Sandevistan straight off Militech's military prototype line. Nobody knows how it ended up on the street, and most of the people who carried it didn't live long. When it switches on, the world all but stops; when it shuts off, the body pays the bill." },
    desc: { tr: ["Savaş başına bir kez, bonus aksiyonla etkinleştirilir ve kullanıcının iki turu boyunca etkin kalır. Bu sürede kullanıcıya her turunda bir aksiyon daha kazandırır, kendi turu dışında kullanabileceği Reaction sayısını 1 artırır, hareketini 8 metre (4 kare) ve REF'ini 2 artırır (en fazla 20). REF modifier'ı ve REF skill'leri buna göre yükselir; REF skill'leri ayrıca +1 alır.", "Etkisi bitince kullanıcı 1d6 hasar alır (zırh işlemez) ve 1d4 Humanity kaybeder.", "<strong>Aşırı Yükleme:</strong> Etki bitmek üzereyken kullanıcı onu bir tur daha uzatabilir. Uzatılan her tur, etki bittiğinde fazladan 1d6 hasar ve 1d4 Humanity kaybı getirir.", "Refleks kromudur. Başka bir Sandevistan'la birlikte takılamaz."], en: ["Once per combat, it can be activated with a bonus action, and it stays active for two of the user's turns. During that time, it gives the user one extra action on each of their turns, raises the number of Reactions they can use outside their own turn by 1, and increases their movement by 8 meters (4 squares) and their REF by 2 (up to 20). Their REF modifier and REF skills rise to match, and their REF skills get a further +1.", "When the effect ends, the user takes 1d6 damage (armor doesn't apply) and loses 1d4 Humanity.", "<strong>Overload:</strong> As the effect is about to end, the user can extend it by one more turn. Each extended turn adds another 1d6 damage and 1d4 Humanity loss when the effect ends.", "It counts as reflex chrome. It can't be installed together with another Sandevistan."] } },
];

// Oyuncu Rehberi > Eşyalar listesi: cyberware olmayan neredeyse her eşya. Her öğe:
// { id, name: { tr, en }, type: ITEM_TYPES anahtarı, kind: WEAPON_KINDS anahtarı (silahlarda), price: ortalama fiyat (yoksa null → "-"), tags: ITEM_TAGS anahtarları,
//   weapon: silah bilgileri { skill, damage, rof, mag, auto: otomatik ateş sınırı (yoksa null), range: WEAPON_RANGES anahtarı } (yakın dövüşte yalnızca skill, damage ve rof),
//   armor: zırh bilgileri { slot: ARMOR_SLOTS anahtarı, tier: ARMOR_TIERS anahtarı },
//   blast: patlayıcı bilgileri { skill, damage: hasar (yoksa null), range: WEAPON_RANGES anahtarı, rounds: alanda kaldığı tur (varsa) },
//   med: tıbbi eşya bilgileri { form: { tr, en } (Tür sütununda görünür), use: kullanımı { tr, en } (yoksa null), heal: iyileştirdiği HP (yoksa null) },
//   deck: cyberdeck bilgileri { level: seviye { tr, en }, tier: kademe, ram, ready: hazır quickhack, need: gereken Netrunning değeri (yoksa null), defense: savunma },
//   flavor: dünya içi kısa tarif { tr, en }, desc: etki (varsa), eşya özne olarak yazılır { tr, en }; uzun etkilerde paragraf dizisi olabilir }
// Dükkan Oluşturucu'nun Silahçı ve Eczane türleri bu listeyi kullanır; Restoran yiyecek ve içecekler eklenince açılır.
const ITEM_TYPES = {
  silah: { tr: "Silah", en: "Weapon" },
  zirh: { tr: "Zırh", en: "Armor" },
  patlayici: { tr: "Patlayıcı", en: "Explosive" },
  tibbi: { tr: "Tıbbi", en: "Medical" },
  yiyecek: { tr: "Yiyecek ve İçecek", en: "Food & Drink" },
  cyberdeck: { tr: "Cyberdeck", en: "Cyberdeck" },
  ekipman: { tr: "Ekipman", en: "Gear" },
};
// Etiketler: listede filtrelenir; birden çok etiket seçilirse yalnızca hepsini taşıyanlar görünür.
const ITEM_TAGS = {
  baslangic: { tr: "Başlangıç", en: "Starting", desc: { tr: "Karakter oyuna başlarken bu etiketi taşıyan eşyalar arasından seçim yapar.", en: "Characters pick from items with this tag when they start the game." } },
  ikonik: { tr: "İkonik", en: "Iconic", desc: { tr: "Ender bulunan, lüks kalitede bir eşya. Sıradan karşılığının bütün özelliklerine ek olarak fazladan özellikleri vardır.", en: "A rare, luxury-grade item. It has every feature of its ordinary version, plus extra ones." } },
  "iki-el": { tr: "İki El", en: "Two-Handed", desc: { tr: "Silah iki elle kullanılır. Bu silaha davranırken atış dezavantajlıdır.", en: "The weapon takes two hands to use. Drawing it is rolled with disadvantage." } },
};
// Silah ve patlayıcı türleri: Tür sütununda ve kartta görünür.
const WEAPON_KINDS = {
  "orta-tabanca": { tr: "Orta Tabanca", en: "Medium Pistol" },
  "agir-tabanca": { tr: "Ağır Tabanca", en: "Heavy Pistol" },
  handcannon: { tr: "Handcannon", en: "Handcannon" },
  smg: { tr: "SMG", en: "SMG" },
  "agir-smg": { tr: "Ağır SMG", en: "Heavy SMG" },
  pompali: { tr: "Pompalı", en: "Shotgun" },
  "saldiri-tufegi": { tr: "Saldırı Tüfeği", en: "Assault Rifle" },
  "keskin-nisanci": { tr: "Keskin Nişancı Tüfeği", en: "Sniper Rifle" },
  "bomba-atar": { tr: "Bomba Atar", en: "Grenade Launcher" },
  roketatar: { tr: "Roketatar", en: "Rocket Launcher" },
  "hafif-yakin": { tr: "Hafif Yakın Dövüş", en: "Light Melee" },
  "orta-yakin": { tr: "Orta Yakın Dövüş", en: "Medium Melee" },
  "agir-yakin": { tr: "Ağır Yakın Dövüş", en: "Heavy Melee" },
  "cok-agir-yakin": { tr: "Çok Ağır Yakın Dövüş", en: "Very Heavy Melee" },
  "el-bombasi": { tr: "El Bombası", en: "Grenade" },
  roket: { tr: "Roket", en: "Rocket" },
};
const WEAPON_RANGES = { yakin: { tr: "Yakın", en: "Close" }, orta: { tr: "Orta", en: "Medium" }, uzak: { tr: "Uzak", en: "Long" } };
// Zırh seviyeleri: SP ve ceza buradan gelir; ceza yalnızca gövde zırhında işler, kask ceza vermez.
const ARMOR_TIERS = {
  hafif: { tr: "Hafif", en: "Light", sp: 3 },
  kevlar: { tr: "Kevlar", en: "Kevlar", sp: 5 },
  taktik: { tr: "Taktik", en: "Tactical", sp: 7 },
  agir: { tr: "Ağır", en: "Heavy", sp: 9, penalty: { tr: "Evasion −2, hareket −2 m", en: "Evasion −2, movement −2 m" } },
  askeri: { tr: "Askerî", en: "Military", sp: 11, penalty: { tr: "Evasion −4, hareket −4 m", en: "Evasion −4, movement −4 m" } },
};
const ARMOR_SLOTS = { govde: { tr: "Gövde Zırhı", en: "Body Armor" }, kask: { tr: "Kask", en: "Helmet" } };
const ITEMS = [
  // ---- Ateşli silahlar ----
  { id: "lexington", name: { tr: "M-10AF Lexington", en: "M-10AF Lexington" }, type: "silah", kind: "orta-tabanca", price: 150, tags: ["baslangic"],
    weapon: { skill: "Handgun", damage: "2d6", rof: 2, mag: 12, auto: null, range: "yakin" },
    flavor: { tr: "Militech'in polislere ve özel güvenlik şirketlerine onlarca yıldır sattığı sağlam tabanca. Night City'de neredeyse her çekmeceden bir tane çıkar.", en: "The sturdy pistol Militech has been selling to cops and security firms for decades. Nearly every drawer in Night City has one." } },
  { id: "unity", name: { tr: "Unity", en: "Unity" }, type: "silah", kind: "agir-tabanca", price: 300, tags: ["baslangic"],
    weapon: { skill: "Handgun", damage: "3d6", rof: 2, mag: 8, auto: null, range: "yakin" },
    flavor: { tr: "Elde ağır duran, sert tepen bir tabanca. Bir kavgayı ilk şarjörde bitirmek isteyenlerin tercihi.", en: "A pistol that sits heavy in the hand and kicks hard. The pick of anyone who wants a fight over by the first magazine." } },
  { id: "burya", name: { tr: "RT-46 Burya", en: "RT-46 Burya" }, type: "silah", kind: "handcannon", price: 500, tags: [],
    weapon: { skill: "Handgun", damage: "4d6", rof: 1, mag: 8, auto: null, range: "yakin" },
    flavor: { tr: "Rus yapımı, iri gövdeli bir tabanca. Seri atış yapamaz, ama tek mermisi bile karşısındakini yere sermeye yeter.", en: "A big-framed Russian pistol. It can't fire fast, but a single round is enough to put someone on the ground." } },
  { id: "saratoga", name: { tr: "M221 Saratoga", en: "M221 Saratoga" }, type: "silah", kind: "smg", price: 400, tags: ["baslangic"],
    weapon: { skill: "Handgun", damage: "2d6", rof: 1, mag: 30, auto: 3, range: "yakin" },
    flavor: { tr: "Kısa namlulu, ucuz ve her köşede bulunan bir SMG. Çete savaşlarının ve dar koridorların silahı.", en: "A short-barreled, cheap SMG found on every corner. The gun of gang wars and narrow hallways." } },
  { id: "pulsar", name: { tr: "DS1 Pulsar", en: "DS1 Pulsar" }, type: "silah", kind: "agir-smg", price: 750, tags: ["baslangic"],
    weapon: { skill: "Handgun", damage: "3d6", rof: 1, mag: 40, auto: 3, range: "yakin" },
    flavor: { tr: "Büyük kalibreli, upuzun şarjörlü bir SMG. Sesini duyan sokakta siper arar.", en: "A big-caliber SMG with a very long magazine. Anyone who hears it on the street looks for cover." } },
  { id: "carnage", name: { tr: "Carnage", en: "Carnage" }, type: "silah", kind: "pompali", price: 600, tags: ["baslangic", "iki-el"],
    weapon: { skill: "Shoulder Arms", damage: "5d6", rof: 1, mag: 4, auto: null, range: "yakin" },
    flavor: { tr: "Budget Arms'ın kaba saba pompalısı. Ucuz görünür, ama dar bir koridorda pazarlık kabul etmez.", en: "Budget Arms' crude shotgun. It looks cheap, but in a narrow hallway it doesn't negotiate." } },
  { id: "ajax", name: { tr: "M251s Ajax", en: "M251s Ajax" }, type: "silah", kind: "saldiri-tufegi", price: 1500, tags: ["baslangic", "iki-el"],
    weapon: { skill: "Shoulder Arms", damage: "5d6", rof: 1, mag: 25, auto: 4, range: "orta" },
    flavor: { tr: "Militech'in askerî saldırı tüfeği. Paralı askerlerin, MaxTac'in ve parası yeten her çetenin elinde görülür.", en: "Militech's military assault rifle. It's seen in the hands of mercs, MaxTac and any gang that can afford one." } },
  { id: "nekomata", name: { tr: "Nekomata", en: "Nekomata" }, type: "silah", kind: "keskin-nisanci", price: 2000, tags: ["iki-el"],
    weapon: { skill: "Shoulder Arms", damage: "5d6", rof: 1, mag: 4, auto: null, range: "uzak" },
    flavor: { tr: "Tsunami yapımı, hassas ve pahalı bir keskin nişancı tüfeği. Hedef ne olduğunu anlamadan iş biter.", en: "A precise, expensive Tsunami sniper rifle. The job is done before the target knows what happened." } },
  { id: "cowboy-u56", name: { tr: "Cowboy U-56", en: "Cowboy U-56" }, type: "silah", kind: "bomba-atar", price: 3000, tags: ["iki-el"],
    weapon: { skill: "Heavy Weapons", damage: "5d6", rof: 1, mag: 2, auto: null, range: "orta" },
    flavor: { tr: "Militech'in iki atımlık bomba atarı. Sokakta görülmesi bile bir mahalleyi boşaltmaya yeter.", en: "Militech's two-shot grenade launcher. Just seeing one on the street is enough to empty a block." },
    desc: { tr: "Patlayıcı kurallarına göre işler. Cephanesi el bombasıdır.", en: "Works by the explosive rules. It fires grenades." } },
  { id: "rpg-a", name: { tr: "RPG-A", en: "RPG-A" }, type: "silah", kind: "roketatar", price: 5000, tags: ["iki-el"],
    weapon: { skill: "Heavy Weapons", damage: "8d6", rof: 1, mag: 1, auto: null, range: "orta" },
    flavor: { tr: "Omuzda taşınan, tek atımlık roketatar. Araçlar ve kapılar için yapılmıştır; insanlara fazla bile gelir.", en: "A single-shot, shoulder-carried rocket launcher. It was built for vehicles and doors; for people it's overkill." },
    desc: { tr: "Patlayıcı kurallarına göre işler. Cephanesi RPG-A Roketi'dir.", en: "Works by the explosive rules. It fires RPG-A Rockets." } },
  // ---- Yakın dövüş silahları ----
  { id: "kelebek-bicagi", name: { tr: "Kelebek Bıçağı", en: "Butterfly Knife" }, type: "silah", kind: "hafif-yakin", price: 50, tags: ["baslangic"],
    weapon: { skill: "Melee Weapons", damage: "1d6", rof: 2 },
    flavor: { tr: "Cepte taşınan, bir bilek hareketiyle açılan bıçak. Sokaktaki her çocuğun ilk silahı.", en: "A pocket blade that flicks open with a turn of the wrist. The first weapon of every kid on the street." } },
  { id: "katana", name: { tr: "Katana", en: "Katana" }, type: "silah", kind: "orta-yakin", price: 150, tags: ["baslangic"],
    weapon: { skill: "Melee Weapons", damage: "2d6", rof: 2 },
    flavor: { tr: "Uzun, tek ağızlı bir kılıç. Japantown'ın dükkanlarında da bulunur, Tyger Claws'ın bellerinde de.", en: "A long, single-edged sword. It turns up in Japantown's shops and on Tyger Claws' belts alike." } },
  { id: "yangin-baltasi", name: { tr: "Yangın Baltası", en: "Fire Axe" }, type: "silah", kind: "agir-yakin", price: 400, tags: [],
    weapon: { skill: "Melee Weapons", damage: "3d6", rof: 2 },
    flavor: { tr: "Yangın dolabından sökülüp sokağa inmiş ağır bir balta. Kapıyı da kırar, kemiği de.", en: "A heavy axe pulled out of a fire cabinet and brought to the street. It breaks doors and bones just the same." } },
  { id: "balyoz", name: { tr: "Balyoz", en: "Sledgehammer" }, type: "silah", kind: "cok-agir-yakin", price: 800, tags: ["iki-el"],
    weapon: { skill: "Melee Weapons", damage: "4d6", rof: 1 },
    flavor: { tr: "İki elle savrulan kocaman bir çekiç. Yavaş kalkar, ama indiği yerde iş bırakmaz.", en: "A huge hammer swung with both hands. It comes up slowly, but wherever it lands, the job's done." } },
  // ---- Gövde zırhları ----
  { id: "deri-ceket", name: { tr: "Deri Ceket", en: "Leather Jacket" }, type: "zirh", price: 100, tags: ["baslangic"], armor: { slot: "govde", tier: "hafif" },
    flavor: { tr: "Astarına ince plakalar dikilmiş kalın bir deri ceket. Night City sokaklarının gayriresmî üniforması.", en: "A thick leather jacket with thin plates sewn into the lining. The unofficial uniform of Night City's streets." } },
  { id: "kevlar-yelek", name: { tr: "Kevlar Yelek", en: "Kevlar Vest" }, type: "zirh", price: 300, tags: ["baslangic"], armor: { slot: "govde", tier: "kevlar" },
    flavor: { tr: "Gömleğin altına giyilen ince bir yelek. Dışarıdan bakan, üzerinde zırh olduğunu anlamaz.", en: "A thin vest worn under a shirt. From the outside, nobody can tell it's armor." } },
  { id: "hafif-armorjack", name: { tr: "Hafif Armorjack", en: "Light Armorjack" }, type: "zirh", price: 1000, tags: ["baslangic"], armor: { slot: "govde", tier: "taktik" },
    flavor: { tr: "Kumaşın içine gömülü sert plakalarla yapılmış zırhlı bir ceket. Çoğu edgerunner'ın işe giderken giydiği şey.", en: "An armored jacket with hard plates buried in the fabric. It's what most edgerunners wear to work." } },
  { id: "agir-armorjack", name: { tr: "Ağır Armorjack", en: "Heavy Armorjack" }, type: "zirh", price: 3000, tags: [], armor: { slot: "govde", tier: "agir" },
    flavor: { tr: "Göğsü ve sırtı kalın plakalarla kaplı hantal bir zırh. Giyeni yavaşlatır, ama kurşun yağmurunda ayakta tutar.", en: "Bulky armor with thick plates across the chest and back. It slows the wearer down, but it keeps them standing through a hail of bullets." } },
  { id: "metalgear", name: { tr: "Metalgear", en: "Metalgear" }, type: "zirh", price: 7500, tags: [], armor: { slot: "govde", tier: "askeri" },
    flavor: { tr: "Baştan aşağı metal plakalardan oluşan askerî zırh. Şirket askerlerinin ve MaxTac'in iş kıyafeti; sokakta görülmesi kötüye işarettir.", en: "Military armor made of metal plates from head to toe. The work clothes of corporate soldiers and MaxTac; seeing it on the street is a bad sign." } },
  // ---- Kasklar ----
  { id: "motosiklet-kaski", name: { tr: "Motosiklet Kaskı", en: "Motorcycle Helmet" }, type: "zirh", price: 50, tags: ["baslangic"], armor: { slot: "kask", tier: "hafif" },
    flavor: { tr: "Sert kabuklu, sıradan bir motosiklet kaskı. Asfalt düşünülerek yapılmıştır, ama kurşuna da biraz dayanır.", en: "An ordinary hard-shell motorcycle helmet. It was made with asphalt in mind, but it can take a little lead too." } },
  { id: "kevlar-bere", name: { tr: "Kevlar Bere", en: "Kevlar Beanie" }, type: "zirh", price: 150, tags: ["baslangic"], armor: { slot: "kask", tier: "kevlar" },
    flavor: { tr: "Sıradan bir bere gibi görünür; içindeki kevlar katmanı kafatasını korur.", en: "It looks like an ordinary beanie, but the kevlar layer inside protects the skull." } },
  { id: "devriye-kaski", name: { tr: "Devriye Kaskı", en: "Patrol Helmet" }, type: "zirh", price: 500, tags: ["baslangic"], armor: { slot: "kask", tier: "taktik" },
    flavor: { tr: "NCPD devriyelerinin taktığı siperlikli kask. Yenisi pahalıdır, ama kullanılmışı sokakta elden ele dolaşır.", en: "The visored helmet NCPD patrols wear. New ones are expensive, but used ones pass from hand to hand on the street." } },
  { id: "cevik-kuvvet-kaski", name: { tr: "Çevik Kuvvet Kaskı", en: "Riot Helmet" }, type: "zirh", price: 1500, tags: [], armor: { slot: "kask", tier: "agir" },
    flavor: { tr: "Yüzü de kapatan kalın bir kask. Şişeye, sopaya ve tabanca mermisine göre yapılmıştır.", en: "A thick helmet that covers the face too. It's built for bottles, clubs and pistol rounds." } },
  { id: "metalgear-kask", name: { tr: "Metalgear Kask", en: "Metalgear Helmet" }, type: "zirh", price: 3750, tags: [], armor: { slot: "kask", tier: "askeri" },
    flavor: { tr: "Metalgear takımının tamamen kapalı kaskı. Dünya dar bir görüş şeridine sığar.", en: "The fully sealed helmet of a Metalgear suit. The world shrinks to a narrow visor slit." } },
  // ---- Patlayıcılar ----
  { id: "f-gx-frag", name: { tr: "F-GX Frag", en: "F-GX Frag" }, type: "patlayici", kind: "el-bombasi", price: 100, tags: [], blast: { skill: "Athletics", damage: "5d6", range: "yakin" },
    flavor: { tr: "Pimi çekilince kendi işini kendi gören sıradan bir parça bombası. Sokak kavgalarını bitirmenin en kısa yolu.", en: "An ordinary fragmentation grenade that does its own work once the pin is out. The shortest way to end a street fight." },
    desc: { tr: "Patlayıcı kurallarına göre işler.", en: "Works by the explosive rules." } },
  { id: "x-22-flashbang", name: { tr: "X-22 Flashbang", en: "X-22 Flashbang" }, type: "patlayici", kind: "el-bombasi", price: 150, tags: [], blast: { skill: "Athletics", damage: null, range: "yakin" },
    flavor: { tr: "Patladığında gözü yakan beyaz bir ışık saçar. Krom göz de doğal göz de bir süre işe yaramaz.", en: "It bursts in a white light that burns the eyes. Chrome or natural, they're useless for a while." },
    desc: { tr: "Hasar vermez. Patlamadan kaçınamayan kişi 2 tur boyunca kör olur.", en: "Deals no damage. Anyone who fails to avoid the blast is blinded for 2 rounds." } },
  { id: "char-incendiary", name: { tr: "CHAR Incendiary", en: "CHAR Incendiary" }, type: "patlayici", kind: "el-bombasi", price: 200, tags: [], blast: { skill: "Athletics", damage: "1d4", range: "yakin" },
    flavor: { tr: "Değdiği yere yapışan yanıcı bir yakıt saçar. Kaçanın sırtında yanmaya devam eder.", en: "It sprays a burning fuel that clings to whatever it touches. It keeps burning on the back of anyone who runs." },
    desc: { tr: "Patlamadan kaçınamayan kişi alev alır: 3 tur boyunca her turunun başında 1d4 hasar alır, zırh işlemez. Kişi bir aksiyon harcayıp yerde yuvarlanarak ya da alevleri söndürerek etkiyi erkenden bitirebilir.", en: "Anyone who fails to avoid the blast catches fire: for 3 rounds they take 1d4 damage at the start of each of their turns, ignoring armor. They can spend an action rolling on the ground or putting out the flames to end the effect early." } },
  { id: "m-18-duman", name: { tr: "M-18 Duman", en: "M-18 Smoke" }, type: "patlayici", kind: "el-bombasi", price: 50, tags: [], blast: { skill: "Athletics", damage: null, range: "yakin", rounds: 3 },
    flavor: { tr: "Saniyeler içinde koridoru dolduran kalın, gri bir duman çıkarır. Kaçmak isteyenin en iyi dostu.", en: "It pumps out thick gray smoke that fills a hallway in seconds. The best friend of anyone trying to get away." },
    desc: { tr: "Hasar vermez. Alanı dumanla doldurur: alanın içindekiler ve arkasındakiler görülmez, Karanlık gibi işler.", en: "Deals no damage. It fills the area with smoke: whoever is inside it or behind it can't be seen, as in Darkness." } },
  { id: "molodets-biohaz", name: { tr: "MOLODETS Biohaz", en: "MOLODETS Biohaz" }, type: "patlayici", kind: "el-bombasi", price: 300, tags: [], blast: { skill: "Athletics", damage: "2d6", range: "yakin", rounds: 3 },
    flavor: { tr: "Kapsülünden yeşilimsi, zehirli bir bulut salar. Nefes alan herkes için kötü haber.", en: "Its canister releases a greenish, toxic cloud. Bad news for anyone who breathes." },
    desc: { tr: "Alanı zehirli gazla doldurur. Turuna alanda başlayan kişi Resist Toxin atar (DV 14); başarısız olursa 2d6 hasar alır, zırh işlemez.", en: "It fills the area with toxic gas. Anyone who starts their turn in the area rolls Resist Toxin (DV 14); on a failure they take 2d6 damage, ignoring armor." } },
  { id: "emp-bombasi", name: { tr: "EMP Bombası", en: "EMP Grenade" }, type: "patlayici", kind: "el-bombasi", price: 500, tags: [], blast: { skill: "Athletics", damage: null, range: "yakin" },
    flavor: { tr: "Patlarken güçlü bir elektromanyetik dalga yayar. Kromla dolu bir vücut için kurşundan bile korkutucudur.", en: "It bursts with a strong electromagnetic pulse. For a body full of chrome, it's scarier than a bullet." },
    desc: { tr: "Hasar vermez. Patlamadan kaçınamayan kişinin rastgele bir kromu 1d6 tur boyunca çalışmaz; bu, krom arıza kurallarındaki geçici arıza gibi işler. Kalp, akciğer ya da beyin implantı gibi hayati kromlar etkilenmez. Alandaki kameralar ve ağa bağlı cihazlar 3 tur boyunca kapanır.", en: "Deals no damage. Anyone who fails to avoid the blast has one random implant stop working for 1d6 rounds, like a temporary malfunction from the chrome rules. Vital implants such as an artificial heart, lungs or brain implant aren't affected. Cameras and networked devices in the area shut down for 3 rounds." } },
  { id: "rpg-a-roketi", name: { tr: "RPG-A Roketi", en: "RPG-A Rocket" }, type: "patlayici", kind: "roket", price: 500, tags: [], blast: { skill: "Heavy Weapons", damage: "8d6", range: "orta" },
    flavor: { tr: "RPG-A'nın tek atışlık roketi. Bir kapıdan geçmenin en gürültülü yolu.", en: "The RPG-A's single-shot rocket. The loudest way through a door." },
    desc: { tr: "Yalnızca RPG-A ile atılır. Patlayıcı kurallarına göre işler.", en: "Only the RPG-A can fire it. Works by the explosive rules." } },
  // ---- Tıbbi eşyalar ----
  { id: "bounce-back", name: { tr: "Bounce Back", en: "Bounce Back" }, type: "tibbi", price: 150, tags: [], med: { form: { tr: "Enjektör", en: "Injector" }, use: { tr: "Bonus aksiyon", en: "Bonus action" }, heal: "2d6" },
    flavor: { tr: "Uyluğa basılan küçük bir enjektör. Savaşın ortasında ayakta kalmanın en ucuz yolu.", en: "A small injector pressed to the thigh. The cheapest way to stay standing in the middle of a fight." },
    desc: { tr: "2d6 HP iyileştirir. Ölümcül Yaralı birine kullanılırsa onu stabilize eder; Medicine atışı gerekmez ve kişi 1 HP yerine bu HP ile kalır.", en: "Restores 2d6 HP. Used on a Mortally Wounded character, it stabilizes them; no Medicine roll is needed, and they're left with the restored HP instead of 1." } },
  { id: "maxdoc", name: { tr: "MaxDoc", en: "MaxDoc" }, type: "tibbi", price: 300, tags: [], med: { form: { tr: "İnhaler", en: "Inhaler" }, use: { tr: "Aksiyon", en: "Action" }, heal: "4d6" },
    flavor: { tr: "Ciğerlere çekilen yoğun bir ilaç bulutu. Bounce Back'ten pahalıdır, ama insanı ameliyat masasına kadar götürür.", en: "A dense cloud of medicine drawn into the lungs. It costs more than Bounce Back, but it gets people as far as the operating table." },
    desc: { tr: "4d6 HP iyileştirir. Ölümcül Yaralı birine kullanılırsa onu stabilize eder; Medicine atışı gerekmez ve kişi 1 HP yerine bu HP ile kalır.", en: "Restores 4d6 HP. Used on a Mortally Wounded character, it stabilizes them; no Medicine roll is needed, and they're left with the restored HP instead of 1." } },
  { id: "medkit", name: { tr: "Medkit", en: "Medkit" }, type: "tibbi", price: 100, tags: [], med: { form: { tr: "Alet", en: "Tool" }, use: null, heal: null },
    flavor: { tr: "Bandaj, dikiş seti, damar yolu ve temel cerrahi aletlerle dolu bir çanta. Her Medtech'in omzunda bir tane bulunur.", en: "A bag full of bandages, suture kits, IV lines and basic surgical tools. Every Medtech has one over their shoulder." },
    desc: { tr: "HP kazandırmaz. Stabilize ederken ve ameliyatta kullanılır.", en: "Restores no HP. It's used for stabilizing and surgery." } },
  { id: "immunsupresan", name: { tr: "İmmünsupresan", en: "Immunosuppressant" }, type: "tibbi", price: 250, tags: [], med: { form: { tr: "İlaç", en: "Medicine" }, use: { tr: "Bonus aksiyon", en: "Bonus action" }, heal: null },
    flavor: { tr: "Vücudun kromu reddetmesini bastıran bir doz ilaç. Kromla yaşayanların cebinden eksik olmaz.", en: "A dose of medicine that holds back the body's rejection of chrome. People who live on chrome always keep some in a pocket." },
    desc: { tr: "Bir sonraki tam gece dinlenmesine kadar cyberpsychosis kriz zarlarını avantajlı yapar. Art arda günlerde kullanılırsa etkisi azalır.", en: "Until the next full night's rest, it gives advantage on cyberpsychosis crisis rolls. It weakens when used on consecutive days." } },
  // ---- Cyberdeck'ler ----
  { id: "paraline", name: { tr: "Militech Paraline", en: "Militech Paraline" }, type: "cyberdeck", price: 500, tags: ["baslangic"], deck: { level: { tr: "Basit", en: "Basic" }, tier: "I", ram: 4, ready: 5, need: null, defense: "+0" },
    flavor: { tr: "Militech'in ucuz ve dayanıklı giriş seviyesi cyberdeck'i. Çoğu Netrunner ilk sızmasını bununla yapar.", en: "Militech's cheap, sturdy entry-level cyberdeck. Most Netrunners make their first run on one." } },
  { id: "biodyne-mk1", name: { tr: "BioDyne Mk.1", en: "BioDyne Mk.1" }, type: "cyberdeck", price: 2500, tags: [], deck: { level: { tr: "Standart", en: "Standard" }, tier: "II", ram: 6, ready: 6, need: "+6", defense: "+1" },
    flavor: { tr: "Sokak Netrunner'larının elinde sık görülen sağlam bir deck. Acemiliğini geride bırakanların ilk ciddi yatırımı.", en: "A solid deck often seen in the hands of street Netrunners. The first serious investment of anyone past the beginner stage." } },
  { id: "fuyutsui-mk1", name: { tr: "Fuyutsui Mk.1", en: "Fuyutsui Mk.1" }, type: "cyberdeck", price: 10000, tags: [], deck: { level: { tr: "Kaliteli", en: "Quality" }, tier: "III", ram: 8, ready: 7, need: "+7", defense: "+2" },
    flavor: { tr: "Hızlı ve sessiz çalışan bir cyberdeck. Şirket işlerinden para kazanmaya başlayan Netrunner'ların seçimi.", en: "A fast, quiet cyberdeck. The choice of Netrunners who've started earning from corporate work." } },
  { id: "tetratronic-rippler-mk1", name: { tr: "Tetratronic Rippler Mk.1", en: "Tetratronic Rippler Mk.1" }, type: "cyberdeck", price: 35000, tags: [], deck: { level: { tr: "Üst Düzey", en: "Top-Tier" }, tier: "IV", ram: 10, ready: 8, need: "+8", defense: "+3" },
    flavor: { tr: "Piyasadaki en güçlü seri üretim cyberdeck'lerden biri. Onu kullanabilen Netrunner sayısı, alabilenlerden bile azdır.", en: "One of the strongest mass-produced cyberdecks on the market. Even fewer Netrunners can handle one than can afford one." } },
  // ---- Ekipman ----
  { id: "yedek-sarjor", name: { tr: "Yedek Şarjör", en: "Spare Magazine" }, type: "ekipman", price: 25, tags: [],
    flavor: { tr: "Dolu bir şarjör. Savaşın ortasında herkesin en çok aradığı şey.", en: "A full magazine. The thing everyone wants most in the middle of a fight." },
    desc: { tr: "Reload yapılırken harcanır.", en: "Used up when reloading." } },
  { id: "alet-cantasi", name: { tr: "Alet Çantası", en: "Tool Kit" }, type: "ekipman", price: 100, tags: [],
    flavor: { tr: "Anahtarlar, lehim kalemi, yedek vidalar ve yılların biriktirdiği kir. Bir tamircinin sağ kolu.", en: "Wrenches, a soldering iron, spare screws and years of grime. A mechanic's right hand." },
    desc: { tr: "Craft ile tamirde kullanılır. Alet Çantası olmadan tamir atışları dezavantajlıdır.", en: "Used for repairs with Craft. Without a Tool Kit, repair rolls have disadvantage." } },
  { id: "korsan-icebreaker", name: { tr: "Korsan Icebreaker", en: "Bootleg Icebreaker" }, type: "ekipman", price: 500, tags: [],
    flavor: { tr: "Arka sokak atölyelerinde toplanan kaçak bir devre. Tek bir kapı için yapılmıştır; işi bitince kendini yakar.", en: "An illegal circuit put together in back-alley workshops. It's built for one door; when the job is done, it burns itself out." },
    desc: { tr: "Kullanmak için Hardware atılır. Başarılı olursa bir kapı panelini ya da elektronik kilidi açar. Sonuç ne olursa olsun aşırı ısınıp işe yaramaz hale gelir.", en: "Using it takes a Hardware roll. On a success, it opens a door panel or electronic lock. Whatever the result, it overheats and becomes useless." } },
];

// Ana sayfadaki değişiklik günlüğü. En yeni sürüm en üstte; tarih yazılmaz, kısa tutulur.
// added: "+" satırları · balanced: { dir: "up" (güçlendi) | "down" (zayıfladı) | "mod" (değişti), cat, name } · removed: { cat?, name }
// cat ve name düz metin ya da { tr, en } olabilir.
const CL_FEAT = { tr: "Feat", en: "Feat" };
const CL_QH = { tr: "Quickhack", en: "Quickhack" };
const CL_SPEC = { tr: "Specialization", en: "Specialization" };
const CL_RULE = { tr: "Kural", en: "Rule" };
const CHANGELOG = [
  {
    version: "0.8",
    added: [
      { tr: "Masa: harita, token, savaş sisi, cetvel, çizim ve yazı araçları", en: "Table: map, tokens, fog of war, ruler, drawing and text tools" },
      { tr: "Masa: 3D zarlar ve tur sırası", en: "Table: 3D dice and turn order" },
      { tr: "Masa: tokeni karakter kağıdına ve oyuncuya bağlama", en: "Table: linking a token to a character sheet and a player" },
      { tr: "Masa: tokenlerde mermi takibi", en: "Table: ammo tracking on tokens" },
      { tr: "Masa: haritada geri alma", en: "Table: undo on the map" },
      { tr: "Masa: Karakter Geliştir sayfasıyla seviye atlama", en: "Table: leveling up with the Character Advancement page" },
      { tr: "Masa: GM için seviye ve envanter düzenleme", en: "Table: level and inventory editing for the GM" },
      { tr: "NPC kağıtları ve NPC Oluştur sayfası", en: "NPC sheets and the Create NPC page" },
      { tr: "Hazır Karakterler sayfası", en: "Ready Characters page" },
      { tr: "Silahlar, zırhlar, patlayıcılar, tıbbi eşyalar, cyberdeck'ler ve ekipman", en: "Weapons, armor, explosives, medical items, cyberdecks and gear" },
      { tr: "Eşya, krom ve araç fiyatları", en: "Prices for items, chrome and vehicles" },
      { tr: "Alet Çantası kuralı", en: "Tool Kit rule" },
    ],
    balanced: [
      { dir: "down", cat: CL_QH, name: { tr: "Overheat (alev hasarı 1d4)", en: "Overheat (1d4 fire damage)" } },
      { dir: "mod", cat: CL_RULE, name: { tr: "Yakın dövüş silahlarının ROF'u", en: "Melee weapon ROF" } },
      { dir: "mod", cat: CL_RULE, name: { tr: "Silah hasarı her zaman d6'larla atılır", en: "Weapon damage is always rolled in d6s" } },
      { dir: "mod", cat: CL_RULE, name: { tr: "Çok ağır tabancanın adı Handcannon oldu", en: "Very heavy pistols are now called Handcannons" } },
    ],
    removed: [{ cat: CL_FEAT, name: "Street Rat" }],
  },
  {
    version: "0.7.5",
    added: [
      { tr: "Fırsat saldırısı", en: "Opportunity attacks" },
      { tr: "Zıplama", en: "Jumping" },
      { tr: "Yuvarlama ve mesafe kuralları", en: "Rounding and distance rules" },
      { tr: "Krom söktürmenin Humanity'ye etkisi", en: "How removing chrome affects Humanity" },
      { tr: "Gizli ve Elden Düşürülemez", en: "Concealed and Can't Be Disarmed" },
      { tr: "Taslak değerler kesinleşti (Luck, DV basamakları, zırh cezaları ve diğerleri)", en: "Draft values finalized (Luck, DV steps, armor penalties and more)" },
    ],
    balanced: [
      { dir: "up", cat: { tr: "Melodi", en: "Melody" }, name: { tr: "Mi Majör", en: "E Major" } },
      { dir: "up", cat: CL_FEAT, name: "Beginner Netrunner, Daisy Chain" },
      { dir: "up", cat: CL_SPEC, name: "Unplug" },
      { dir: "up", cat: CL_RULE, name: "Bounce Back, MaxDoc" },
      { dir: "up", cat: CL_RULE, name: { tr: "Başlangıç cyberware'i (3 puan)", en: "Starting cyberware (3 points)" } },
      { dir: "up", cat: { tr: "Cyberware", en: "Cyberware" }, name: "Militech \"Apogee\" Sandevistan" },
      { dir: "down", cat: CL_FEAT, name: "Adrenaline Shot" },
      { dir: "down", cat: { tr: "Sınıf", en: "Role" }, name: { tr: "Lawman (Tecrübe Zarı)", en: "Lawman (Veteran Dice)" } },
      { dir: "down", cat: CL_SPEC, name: "Overwatch, Road Warrior" },
      { dir: "mod", cat: CL_RULE, name: { tr: "Avantaj, kafa isabeti, mermiden kaçmak, siper, patlayıcılar, baskı ateşi, boğuşma, zırh, kritik yara, ölüm kurtarma, kritik zar", en: "Advantage, head hits, dodging bullets, cover, explosives, suppressive fire, grappling, armor, critical injuries, death saves, exploding dice" } },
      { dir: "mod", cat: CL_RULE, name: { tr: "Yetkinlik puanları, Netrunner olmayanların quickhack'leri", en: "Proficiency points, quickhacks for non-Netrunners" } },
      { dir: "mod", cat: CL_FEAT, name: { tr: "Specialist, Kevlar Zırh Ustalığı, Backlash, Encore", en: "Specialist, Kevlar Armor Mastery, Backlash, Encore" } },
      { dir: "mod", cat: CL_SPEC, name: "Deflect, Point Blank, Dead Eye, Big Iron, Finisher, Hardened, Limit Breaker, Standing Ovation" },
      { dir: "mod", cat: { tr: "Cyberware", en: "Cyberware" }, name: { tr: "Gorilla Arms, Tekme Pistonları, Hava Deposu", en: "Gorilla Arms, Kick Pistons, Independent Air Supply" } },
    ],
  },
  {
    version: "0.7.2",
    added: [
      { tr: "Karakter Oluşturma sayfası", en: "Character Creation page" },
      { tr: "Başlarken sayfası", en: "Getting Started page" },
      { tr: "Sözlük sayfası", en: "Glossary page" },
      { tr: "İnisiyatifte eşitlik kuralı", en: "Initiative tie rule" },
      { tr: "Savaş dışında quickhack ve RAM", en: "Quickhacks and RAM outside combat" },
      { tr: "Gece dinlenmesinin süresi (8 saat)", en: "Length of a night's rest (8 hours)" },
      { tr: "Kromu yalnızca ripperdoc'lar takar ve söker", en: "Only ripperdocs install and remove chrome" },
    ],
    balanced: [
      { dir: "up", cat: { tr: "Sınıf", en: "Role" }, name: { tr: "Nomad (çekirdek feat)", en: "Nomad (core feat)" } },
      { dir: "up", cat: CL_QH, name: "Analyze" },
      { dir: "mod", cat: CL_QH, name: "Blackout" },
      { dir: "mod", cat: { tr: "Kritik Yara", en: "Critical Injury" }, name: { tr: "İç Kanama, Derin Kesik", en: "Internal Bleeding, Deep Cut" } },
      { dir: "mod", cat: { tr: "Kural", en: "Rule" }, name: { tr: "Humanity kriz tetikleyicisi", en: "Humanity crisis trigger" } },
    ],
  },
  {
    version: "0.7",
    added: [
      { tr: "44 specialization özelliği", en: "44 specialization features" },
      { tr: "Eşyalar sayfası", en: "Items page" },
      { tr: "Terimler ve özellikler için bilgi kutuları", en: "Tooltips for terms and features" },
    ],
    balanced: [
      { dir: "mod", cat: { tr: "Sınıf", en: "Role" }, name: { tr: "Lawman (Tecrübe Zarı)", en: "Lawman (Veteran Dice)" } },
    ],
  },
  {
    version: "0.6",
    added: [
      { tr: "67 cyberware", en: "67 pieces of cyberware" },
      { tr: "1 feat", en: "1 feat" },
      { tr: "Cyberware sayfası", en: "Cyberware page" },
      { tr: "Dükkan Oluşturucu", en: "Shop Generator" },
      { tr: "Quickhack atışı kuralı", en: "Quickhack roll rule" },
      { tr: "Görüş, ışık ve körlük kuralları", en: "Vision, light and blindness rules" },
      { tr: "Araç hasarı ve tamir kuralları", en: "Vehicle damage and repair rules" },
      { tr: "Zırh tamiri", en: "Armor repair" },
      { tr: "İkonik eşyalar", en: "Iconic items" },
    ],
    balanced: [
      { dir: "up", cat: { tr: "Sınıf", en: "Role" }, name: "Nomad" },
      { dir: "up", cat: CL_FEAT, name: "Firewall" },
      { dir: "up", cat: CL_QH, name: "Reboot Optics" },
      { dir: "mod", cat: CL_QH, name: "Tag" },
      { dir: "mod", cat: CL_QH, name: "Weapon Glitch" },
      { dir: "mod", cat: { tr: "Araç", en: "Vehicle" }, name: { tr: "Bütün araçlar", en: "All vehicles" } },
    ],
    removed: [
      { cat: CL_FEAT, name: "Cover Breaker" },
      { cat: CL_FEAT, name: "Full Auto" },
      { cat: CL_FEAT, name: "Old Fashioned Barter" },
      { cat: CL_FEAT, name: "Built Tough" },
      { name: { tr: "Akıllı silah kuralları", en: "Smart weapon rules" } },
      { name: { tr: "Araçların SP değeri", en: "Vehicle SP" } },
    ],
  },
];

// Sınıf renkleri: sitede yazılmaz; yalnızca feat listesinde o sınıfın feat'lerini boyar (tarafsız feat'ler yeşil kalır).
const CLASS_COLORS = {
  solo: "#ff5f56",      // kan kırmızısı
  netrunner: "#b388ff", // mor
  medtech: "#9fd3f0",   // soluk açık mavi
  rockerboy: "#ff9f43", // sahne turuncusu
  lawman: "#f5c542",    // rozet altını
  nomad: "#d2a679",     // çöl kumu
};

// Oyuncu Rehberi > Feat'ler listesi (taslak). spec: varsa feat'in geldiği specialization ("a" ya da "b").
// cls: "tarafsiz" ya da sınıf id'si · excl: bu feat'i alamayan sınıflar · tier: aşama (1 = 1 puan, 2 = 2 puan) · gloss: Türkçe karşılık (yalnızca TR'de kartta gösterilir).
const FEATS = [
  { id: "tough", name: { tr: "Tough", en: "Tough" }, gloss: "Dayanıklı", cls: "tarafsiz", tier: 1, desc: { tr: "Maksimum HP'n 5 artar.", en: "Your maximum HP increases by 5." } },
  { id: "pain-tolerance", name: { tr: "Pain Tolerance", en: "Pain Tolerance" }, gloss: "Acıya Dayanıklılık", cls: "tarafsiz", tier: 1, desc: { tr: "Yara cezaların yarıya iner: Ağır Yaralı −1, Ölümcül Yaralı −2.", en: "Your wound penalties are halved: Seriously Wounded −1, Mortally Wounded −2." } },
  { id: "die-hard", name: { tr: "Die Hard", en: "Die Hard" }, gloss: "Ölmeye İnat", cls: "tarafsiz", tier: 1, desc: { tr: "Ölüm kurtarma atışlarına +1 eklersin.", en: "You add +1 to your death saves." } },
  { id: "quick-draw", name: { tr: "Quick Draw", en: "Quick Draw" }, gloss: "Hızlı Çekiş", cls: "tarafsiz", tier: 1, desc: { tr: "Aksiyon ya da bonus aksiyon harcamadan silah çekip kılıfına koyabilirsin. Savaş başlamadan silaha davranırken attığın atışlar avantajlıdır.", en: "You can draw and holster a weapon without spending an action or a bonus action. Your rolls to go for a weapon before combat starts have advantage." } },
  { id: "alert", name: { tr: "Alert", en: "Alert" }, gloss: "Tetikte", cls: "tarafsiz", tier: 1, desc: { tr: "Hiçbir zaman gafil avlanmazsın.", en: "You are never surprised." } },
  { id: "cover-expert", name: { tr: "Cover Expert", en: "Cover Expert" }, gloss: "Siper Ustası", cls: "tarafsiz", tier: 1, desc: { tr: "Kısmi siper sana +2 yerine +3 DV verir.", en: "Partial cover gives you +3 DV instead of +2." } },
  { id: "runner", name: { tr: "Runner", en: "Runner" }, gloss: "Koşucu", cls: "tarafsiz", tier: 1, desc: { tr: "Temel hareketin 4 metre (2 kare) artar.", en: "Your base movement increases by 4 meters (2 squares)." } },
  { id: "extra-training", name: { tr: "Extra Training", en: "Extra Training" }, gloss: "Ek Eğitim", cls: "tarafsiz", tier: 1, desc: { tr: "2 yetkinlik puanı kazanırsın. Bir skill'in yetkinlik bonusu yine en fazla +2 olabilir.", en: "You gain 2 proficiency points. A skill's proficiency bonus still can't go above +2." } },
  { id: "specialist", name: { tr: "Specialist", en: "Specialist" }, gloss: "Uzman", cls: "tarafsiz", tier: 1, desc: { tr: "Yetkin olduğun ve Ustalığı olmayan bir skill seçersin; ona Ustalık modifier'ını eklersin.", en: "You choose a skill you're proficient in that doesn't already have Mastery, and add your Mastery modifier to it." } },
  { id: "lucky", name: { tr: "Lucky", en: "Lucky" }, gloss: "Şanslı", cls: "tarafsiz", tier: 1, desc: { tr: "Luck havuzun 2 artar.", en: "Your Luck pool increases by 2." } },
  { id: "iron-stomach", name: { tr: "Iron Stomach", en: "Iron Stomach" }, gloss: "Demir Mide", cls: "tarafsiz", tier: 1, desc: { tr: "Toksinlere ve zehirlere karşı Resist Toxin atışların avantajlıdır.", en: "Your Resist Toxin rolls against toxins and poisons have advantage." } },
  { id: "chrome-tolerance", name: { tr: "Chrome Tolerance", en: "Chrome Tolerance" }, gloss: "Krom Toleransı", cls: "tarafsiz", tier: 1, desc: { tr: "Takılı kromlarının toplam Humanity kaybı, Ustalık modifier'ın × seviyen ÷ 2 kadar azalır (yukarı yuvarlanır). Toplam kayıp 0'ın altına inmez.", en: "The total Humanity loss of your installed chrome is reduced by your Mastery modifier × your level ÷ 2 (rounded up). The total can't go below 0." } },
  { id: "light-armor-mastery", name: { tr: "Hafif Zırh Ustalığı", en: "Light Armor Mastery" }, cls: "tarafsiz", tier: 1, desc: { tr: "Hafif set (hafif gövde zırhı ve hafif kask) giydiğinde Evasion'a +1 eklersin ve hareketin 4 metre (2 kare) artar.", en: "While you wear a light set (light body armor and a light helmet), you add +1 to Evasion and your movement increases by 4 meters (2 squares)." } },
  { id: "kevlar-armor-mastery", name: { tr: "Kevlar Zırh Ustalığı", en: "Kevlar Armor Mastery" }, cls: "tarafsiz", tier: 1, desc: { tr: "Kevlar set giydiğinde Evasion'a +1 eklersin ve Kevlar gövde zırhının SP'si 1 artar (6); kask etkilenmez.", en: "While you wear a Kevlar set, you add +1 to Evasion and your Kevlar body armor's SP increases by 1 (6); the helmet isn't affected." } },
  { id: "tactical-armor-mastery", name: { tr: "Taktik Zırh Ustalığı", en: "Tactical Armor Mastery" }, cls: "tarafsiz", tier: 1, desc: { tr: "Taktik set giydiğinde Evasion'a ve Stealth'e +1 eklersin.", en: "While you wear a tactical set, you add +1 to Evasion and Stealth." } },
  { id: "heavy-armor-mastery", name: { tr: "Ağır Zırh Ustalığı", en: "Heavy Armor Mastery" }, cls: "tarafsiz", tier: 1, desc: { tr: "Ağır gövde zırhı giydiğinde (set gerekmez) zırhın hareket cezası kalkar ve zırhın delindiğinde aldığın HP hasarı 1 azalır (en az 1).", en: "While you wear heavy body armor (no set needed), its movement penalty is removed, and when it's pierced, the HP damage you take is reduced by 1 (minimum 1)." } },
  { id: "military-armor-mastery", name: { tr: "Askerî Zırh Ustalığı", en: "Military Armor Mastery" }, cls: "tarafsiz", tier: 1, desc: { tr: "Askerî gövde zırhı giydiğinde (set gerekmez) zırhın hareket cezası 2 metreye (1 kare) düşer ve SP'si 1 artar (12).", en: "While you wear military body armor (no set needed), its movement penalty drops to 2 meters (1 square) and its SP increases by 1 (12)." } },
  { id: "free-runner", name: { tr: "Free Runner", en: "Free Runner" }, gloss: "Serbest Koşucu", cls: "tarafsiz", tier: 1, desc: { tr: "Athletics +1. Tırmanırken ve engel aşarken tam hızla hareket edersin.", en: "Athletics +1. You move at full speed while climbing and getting over obstacles." } },
  { id: "wheelman", name: { tr: "Wheelman", en: "Wheelman" }, gloss: "Direksiyon Ustası", cls: "tarafsiz", tier: 1, desc: { tr: "Driving +1. Araç sürmek senin için aksiyon yerine bonus aksiyondur.", en: "Driving +1. Driving a vehicle takes you a bonus action instead of an action." } },
  { id: "silver-tongue", name: { tr: "Silver Tongue", en: "Silver Tongue" }, gloss: "Tatlı Dil", cls: "tarafsiz", tier: 1, desc: { tr: "Persuasion +1. Oturum başına bir kez, başarısız bir Persuasion atışını tekrar atabilirsin.", en: "Persuasion +1. Once per session, you can reroll a failed Persuasion roll." } },
  { id: "poker-face", name: { tr: "Poker Face", en: "Poker Face" }, gloss: "Poker Suratı", cls: "tarafsiz", tier: 1, desc: { tr: "Deception +1. Gizlice silaha davranırken Stealth yerine Deception atabilirsin; bu durumda hedefler Perception yerine Insight ile karşılık verir.", en: "Deception +1. When you go for a weapon covertly, you can roll Deception instead of Stealth; the targets then answer with Insight instead of Perception." } },
  { id: "brute", name: { tr: "Brute", en: "Brute" }, gloss: "Kaba Kuvvet", cls: "tarafsiz", tier: 1, desc: { tr: "Strength +1. Yakın dövüş saldırıların sipere ve kapılara iki kat hasar verir.", en: "Strength +1. Your melee attacks deal double damage to cover and doors." } },
  { id: "tireless", name: { tr: "Tireless", en: "Tireless" }, gloss: "Yorulmak Bilmez", cls: "tarafsiz", tier: 1, desc: { tr: "Endurance +1. 4 saatlik dinlenme senin için tam bir gece dinlenmesi sayılır.", en: "Endurance +1. Four hours of rest count as a full night's rest for you." } },
  { id: "iron-mind", name: { tr: "Iron Mind", en: "Iron Mind" }, gloss: "Demir İrade", cls: "tarafsiz", tier: 1, desc: { tr: "Mental Resist +1. Biri sana Intimidation attığında, ona direnmek için attığın atışlar avantajlıdır.", en: "Mental Resist +1. When someone uses Intimidation on you, your rolls to resist it have advantage." } },
  { id: "plug-and-play", name: { tr: "Plug & Play", en: "Plug & Play" }, gloss: "Tak Çalıştır", cls: "tarafsiz", tier: 1, desc: { tr: "Hardware +1. Cihaz kullanmak senin için aksiyon yerine bonus aksiyondur.", en: "Hardware +1. Using a device takes you a bonus action instead of an action." } },
  { id: "street-fighter", name: { tr: "Street Fighter", en: "Street Fighter" }, gloss: "Sokak Dövüşçüsü", cls: "tarafsiz", tier: 1, desc: { tr: "Brawling +1. Yumruğun isabet ederse vurduğun kişiyi 2 metre (1 kare) itebilirsin.", en: "Brawling +1. When your punch hits, you can push the person you hit 2 meters (1 square)." } },
  { id: "slippery", name: { tr: "Slippery", en: "Slippery" }, gloss: "Kaygan", cls: "tarafsiz", tier: 1, desc: { tr: "Evasion +1. Mermiden kaçmayı başarırsan hemen 2 metre (1 kare) hareket edebilirsin; bu hareket normal hareketinden düşmez.", en: "Evasion +1. After you successfully dodge a bullet, you can immediately move 2 meters (1 square); this doesn't count against your normal movement." } },
  { id: "patch-up", name: { tr: "Patch Up", en: "Patch Up" }, gloss: "Pansuman", cls: "tarafsiz", tier: 1, desc: { tr: "Medicine +1. İlk yardım yaparken Medicine atışını dezavantajsız atarsın.", en: "Medicine +1. You roll Medicine without disadvantage when giving first aid." } },
  { id: "mimic", name: { tr: "Mimic", en: "Mimic" }, gloss: "Taklitçi", cls: "tarafsiz", tier: 1, desc: { tr: "Performance +1. Telefonda, interkomda ya da görünmeden başka biri gibi konuşurken Deception atışların avantajlıdır. Yüz yüze konuşurken işe yaramaz.", en: "Performance +1. Your Deception rolls have advantage when you speak as someone else over the phone, over an intercom or while unseen. It doesn't work face to face." } },
  { id: "polyglot", name: { tr: "Polyglot", en: "Polyglot" }, gloss: "Çok Dilli", cls: "tarafsiz", tier: 1, desc: { tr: "Lore +1. İki dil daha bilirsin.", en: "Lore +1. You know two more languages." } },
  { id: "tracker", name: { tr: "Tracker", en: "Tracker" }, gloss: "İz Sürücü", cls: "tarafsiz", tier: 1, desc: { tr: "Survival +1. İz ararken ve iz sürerken atışların avantajlıdır.", en: "Survival +1. You have advantage on rolls to find and follow tracks." } },
  { id: "eavesdropper", name: { tr: "Eavesdropper", en: "Eavesdropper" }, gloss: "Kulak Misafiri", cls: "tarafsiz", tier: 1, desc: { tr: "Concentration +1. Bir sesi ya da konuşmayı dinleyip takip ederken Concentration atışların avantajlıdır.", en: "Concentration +1. Your Concentration rolls to listen in on and follow a sound or a conversation have advantage." } },
  { id: "beginner-netrunner", name: { tr: "Beginner Netrunner", en: "Beginner Netrunner" }, gloss: "Acemi Netrunner", cls: "tarafsiz", excl: ["netrunner"], tier: 1, desc: { tr: "Netrunning +1. I. ve II. kademe cyberdeck'leri (Basit ve Standart) kullanabilirsin; Standart cyberdeck için yine +6 Netrunning değeri gerekir. Kütüphanene I. kademe quickhack'lerden 2 tane eklersin; quickhack kullanmak senin için bir aksiyondur. Netrunner'lar bu feat'i alamaz.", en: "Netrunning +1. You can use tier I and II cyberdecks (Basic and Standard); a Standard cyberdeck still needs a Netrunning value of +6. You add 2 tier I quickhacks to your library; for you, using a quickhack takes an action. Netrunners can't take this feat." } },
  { id: "expanded-ram", name: { tr: "Expanded RAM", en: "Expanded RAM" }, gloss: "Genişletilmiş RAM", cls: "netrunner", tier: 1, desc: { tr: "Kullandığın cyberdeck'in RAM'i 2 artar.", en: "The cyberdeck you use gains 2 RAM." } },
  { id: "extra-slot", name: { tr: "Extra Slot", en: "Extra Slot" }, gloss: "Ek Yuva", cls: "netrunner", tier: 1, desc: { tr: "Cyberdeck'inde 1 quickhack daha hazır tutabilirsin.", en: "You can keep 1 more quickhack ready in your cyberdeck." } },
  { id: "field-prep", name: { tr: "Field Prep", en: "Field Prep" }, gloss: "Saha Hazırlığı", cls: "netrunner", tier: 1, desc: { tr: "Oturum başına bir kez, ekibin dinlenmesini beklemeden hazır quickhack'lerini değiştirebilirsin. Savaş dışında 10 dakika harcarsın ve Ustalık modifier'ın kadar hazır quickhack'ini kütüphanendeki başka quickhack'lerle değiştirirsin.", en: "Once per session, you can change your ready quickhacks without waiting for the crew to rest. You spend 10 minutes outside combat and swap a number of your ready quickhacks equal to your Mastery modifier for others from your library." } },
  { id: "script-library", name: { tr: "Script Library", en: "Script Library" }, gloss: "Kod Kütüphanesi", cls: "netrunner", tier: 1, desc: { tr: "Bu feat'i aldığında kütüphanene 2 quickhack eklersin.", en: "When you take this feat, you add 2 quickhacks to your library." } },
  { id: "firewall", name: { tr: "Firewall", en: "Firewall" }, gloss: "Güvenlik Duvarı", cls: "netrunner", tier: 1, desc: { tr: "Quickhack'lere karşı savunma DV'ne Ustalık modifier'ını eklersin.", en: "You add your Mastery modifier to your defense DV against quickhacks." } },
  { id: "backlash", name: { tr: "Backlash", en: "Backlash" }, gloss: "Geri Tepme", cls: "netrunner", tier: 1, desc: { tr: "Savaş başına bir kez, biri sana quickhack yaptığında Reaction'ını harcayıp hazır quickhack'lerinden birini RAM harcamadan o kişiye yükleyebilirsin. Quickhack atışı normal yapılır; o kişiyi görmen gerekmez.", en: "Once per combat, when someone uses a quickhack on you, you can spend your Reaction to upload one of your ready quickhacks to them without spending RAM. The quickhack roll is made as normal, and you don't need to see them." } },
  { id: "squad-link", name: { tr: "Squad Link", en: "Squad Link" }, gloss: "Ekip Bağlantısı", cls: "netrunner", tier: 1, desc: { tr: "Ping'le işaretlediğin düşmanlar ve cihazlar ekibindeki dostların için de işaretli olur: dostların, işaretli hedefler bir duvarın arkasında olsa bile onların yerini bilir. İşaretler Ping'in süresi boyunca kalır. İşaret yalnızca yeri gösterir; dostların işaretli bir hedefi görmüş sayılmaz.", en: "The enemies and devices you mark with Ping are marked for your allies too: your allies know where the marked targets are, even behind a wall. The marks last as long as the Ping does. A mark only shows where something is; your allies don't count as seeing a marked target." } },
  { id: "double-upload", name: { tr: "Double Upload", en: "Double Upload" }, gloss: "Çift Yükleme", cls: "netrunner", tier: 2, desc: { tr: "Bonus aksiyonla quickhack kullandığın bir turda, aksiyonunu da harcayarak ikinci bir quickhack kullanabilirsin.", en: "On a turn when you use a quickhack with your bonus action, you can also spend your action to use a second quickhack." } },
  { id: "overclock", name: { tr: "Overclock", en: "Overclock" }, gloss: "Hız Aşırtma", cls: "netrunner", tier: 2, desc: { tr: "RAM'in yetmese de quickhack kullanabilirsin: kalan RAM'inin hepsini harcarsın ve 1d6 + 3 × quickhack'in kademesi kadar hasar alırsın. Zırh bu hasara işlemez.", en: "You can use a quickhack even without enough RAM: you spend all your remaining RAM and take 1d6 + 3 × the quickhack's tier in damage. Armor doesn't apply to this damage." } },
  { id: "daisy-chain", name: { tr: "Daisy Chain", en: "Daisy Chain" }, gloss: "Zincirleme", cls: "netrunner", tier: 2, desc: { tr: "Kütüphanene Daisy Chain quickhack'ini eklersin. Daisy Chain yalnızca cyberdeck'inde hazırken çalışır. Savaş başına 2 Reaction puanı vardır; bu puanlar normal Reaction'larından ayrıdır. Daisy Chain turda en fazla bir kez kullanılabilir. Hedefli bir I. ya da II. kademe quickhack yüklerken 1 puan harcarsan quickhack bir kişiye ya da cihaza daha kopyalanır; III. ya da IV. kademe bir quickhack'i kopyalamak 2 puan ister. Kopya, asıl quickhack'in RAM maliyetinin yarısı kadar RAM harcar (aşağı yuvarlanır).", en: "You add the Daisy Chain quickhack to your library. Daisy Chain only works while it's ready in your cyberdeck. It has 2 Reaction points per combat, separate from your normal Reactions, and can be used at most once per round. While you upload a targeted tier I or II quickhack, spending 1 point copies it to one more person or device; copying a tier III or IV quickhack takes 2 points. The copy costs half the original's RAM (rounded down)." } },
  { id: "wallhack", name: { tr: "Wallhack", en: "Wallhack" }, gloss: "Duvar Ardı", cls: "netrunner", tier: 2, desc: { tr: "Bir duvarın ya da başka bir engelin arkasında, 12 metreye (6 kare) kadar uzaktaki bir kişiye ya da cihaza quickhack yapabilirsin. Onu doğrudan görmen gerekmez; Ping gibi başka bir yolla işaretlenmiş olması yeter.", en: "You can quickhack a person or device behind a wall or other obstacle, up to 12 meters (6 squares) away. You don't need to see it directly; it's enough that it's marked some other way, such as by Ping." } },
  { id: "amplifier", name: { tr: "Amplifier", en: "Amplifier" }, gloss: "Amfi", cls: "rockerboy", tier: 1, desc: { tr: "Enstrümanının şarj limiti 1 artar.", en: "Your instrument's charge limit increases by 1." } },
  { id: "fast-charge", name: { tr: "Fast Charge", en: "Fast Charge" }, gloss: "Hızlı Şarj", cls: "rockerboy", tier: 1, desc: { tr: "Enstrümanın prize takılıyken saatte 1 yerine 2 şarj dolar.", en: "While plugged in, your instrument recharges 2 charges per hour instead of 1." } },
  { id: "loudspeaker", name: { tr: "Loudspeaker", en: "Loudspeaker" }, gloss: "Hoparlör", cls: "rockerboy", tier: 1, desc: { tr: "Melodilerinin menzili 24 metreden 36 metreye (18 kare) çıkar.", en: "Your melodies' range increases from 24 meters to 36 meters (18 squares)." } },
  { id: "hype-man", name: { tr: "Hype Man", en: "Hype Man" }, gloss: "Gazlayıcı", cls: "rockerboy", tier: 1, desc: { tr: "Inspire'ı bonus aksiyon yerine Reaction'ınla, bir dostunun atışından hemen önce kullanabilirsin.", en: "You can use Inspire with your Reaction instead of a bonus action, right before an ally's roll." } },
  { id: "stage-presence", name: { tr: "Stage Presence", en: "Stage Presence" }, gloss: "Sahne Duruşu", cls: "rockerboy", tier: 1, desc: { tr: "Debuff melodilerinde eşitlik olursa hedef kişi değil sen kazanırsın.", en: "On your debuff melodies, ties go to you instead of the target." } },
  { id: "fan-base", name: { tr: "Fan Base", en: "Fan Base" }, gloss: "Hayran Kitlesi", cls: "rockerboy", tier: 1, desc: { tr: "Oturum başına bir kez, seni tanıyan bir hayranından bir iyilik isteyebilirsin. İyiliğin büyüklüğü seviyenle artar. Düşük seviyelerde bu bir bilgi ya da bir gece saklanacak bir yer olabilir; yüksek seviyelerde ise açılan bir kapı, ödünç bir araç ya da önemli birine ulaşmanın bir yolu.", en: "Once per session, you can ask a fan who recognizes you for a favor. The size of the favor grows with your level. At low levels it might be a tip or a place to lie low for the night; at high levels, an opened door, a borrowed vehicle or a way to reach someone important." } },
  { id: "feedback", name: { tr: "Feedback", en: "Feedback" }, gloss: "Geri Besleme", cls: "rockerboy", tier: 1, desc: { tr: "Savaş başına bir kez, debuff melodilerinden biri başarısız olduğunda harcadığın şarjı geri kazanırsın.", en: "Once per combat, when one of your debuff melodies fails, you get back the charge you spent on it." } },
  { id: "double-track", name: { tr: "Double Track", en: "Double Track" }, gloss: "Çift Kanal", cls: "rockerboy", tier: 2, desc: { tr: "Aynı anda iki melodin birden etkili olabilir.", en: "Two of your melodies can be in effect at the same time." } },
  { id: "encore", name: { tr: "Encore", en: "Encore" }, gloss: "Bis", cls: "rockerboy", tier: 2, desc: { tr: "Savaş başına bir kez, melodilerinden birinin süresi bittiğinde onu şarj ya da aksiyon harcamadan hemen yeniden başlatabilirsin. Yeniden başlayan melodi bir debuff ise Performance yeniden atılır.", en: "Once per combat, when one of your melodies ends, you can restart it right away without spending a charge or an action. If the restarted melody is a debuff, Performance is rolled again." } },
  { id: "riot-starter", name: { tr: "Riot Starter", en: "Riot Starter" }, gloss: "Kışkırtıcı", cls: "rockerboy", tier: 2, desc: { tr: "Savaş başına bir kez, bir melodiyi aksiyon yerine bonus aksiyonla çalabilirsin.", en: "Once per combat, you can play a melody with a bonus action instead of an action." } },
  { id: "soul-music", name: { tr: "Soul Music", en: "Soul Music" }, gloss: "Ruh Müziği", cls: "rockerboy", tier: 2, desc: { tr: "Oturum başına bir kez, ekip dinlenirken çalarsan sen de seni dinleyen dostların da 1d3 Humanity kazanırsınız.", en: "Once per session, if you play while the crew rests, you and every ally listening gain 1d3 Humanity." } },
  { id: "surgery", name: { tr: "Surgery", en: "Surgery" }, gloss: "Ameliyat", cls: "medtech", tier: 1, desc: { tr: "Ameliyat gerektiren kritik yaraları tedavi edebilirsin. Ameliyatı savaş dışında, sakin bir yerde ve bir medkitle yaparsın. Ameliyat 1 saat sürer ve sonunda DV 14'e karşı Medicine atarsın. Başarılı olursan yara iyileşir. Başarısız olursan yara kalır ve hasta 1d6 hasar alır (zırh işlemez); aynı yara için ertesi gün yeniden denenebilir. Kendini ameliyat edemezsin.", en: "You can treat critical injuries that require surgery. You operate outside combat, somewhere calm, with a medkit. Surgery takes 1 hour, and at the end you roll Medicine against DV 14. On a success, the injury heals. On a failure, the injury remains and the patient takes 1d6 damage (armor doesn't apply); the same injury can be tried again the next day. You can't operate on yourself." } },
  { id: "field-medic", name: { tr: "Field Medic", en: "Field Medic" }, gloss: "Sıhhiyeci", cls: "medtech", tier: 1, desc: { tr: "Birini aksiyon yerine bonus aksiyonla stabilize edebilirsin.", en: "You can stabilize someone with a bonus action instead of an action." } },
  { id: "improvised-kit", name: { tr: "Improvised Kit", en: "Improvised Kit" }, gloss: "Derme Çatma Çanta", cls: "medtech", tier: 1, desc: { tr: "Medkit olmadan stabilize ederken dezavantaj almazsın.", en: "You don't have disadvantage when stabilizing without a medkit." } },
  { id: "precise-dose", name: { tr: "Precise Dose", en: "Precise Dose" }, gloss: "Hassas Doz", cls: "medtech", tier: 1, desc: { tr: "Uyguladığın Bounce Back ve MaxDoc, Ustalık modifier'ın kadar fazladan HP iyileştirir.", en: "The Bounce Back and MaxDoc you administer heal extra HP equal to your Mastery modifier." } },
  { id: "trauma-specialist", name: { tr: "Trauma Specialist", en: "Trauma Specialist" }, gloss: "Travma Uzmanı", cls: "medtech", tier: 1, desc: { tr: "Kritik yaraları tedavi ederken Medicine atışlarına Ustalık modifier'ını eklersin.", en: "You add your Mastery modifier to Medicine rolls when treating critical injuries." } },
  { id: "sedative", name: { tr: "Sedative", en: "Sedative" }, gloss: "Yatıştırıcı", cls: "medtech", tier: 1, desc: { tr: "Bitişiğinde duran ve kısa süreli bir psikoz yaşayan bir dostunu bir aksiyon harcayarak yatıştırmayı deneyebilirsin. DV 11'e karşı Medicine atarsın; başarılı olursan psikoz hemen biter.", en: "You can spend an action to try to calm an adjacent ally who is in a short psychotic break. You roll Medicine against DV 11; on a success, the psychosis ends immediately." } },
  { id: "quick-fix", name: { tr: "Quick Fix", en: "Quick Fix" }, gloss: "Hızlı Müdahale", cls: "medtech", tier: 1, desc: { tr: "Savaş başına bir kez, bir aksiyon harcayarak bitişiğindeki bir dostunu 1d6 + Ustalık modifier'ın kadar HP iyileştirebilirsin. Bu, Ölümcül Yaralı birine işlemez; önce onun stabilize edilmesi gerekir.", en: "Once per combat, you can spend an action to heal an adjacent ally for 1d6 + your Mastery modifier HP. It doesn't work on someone Mortally Wounded; they need to be stabilized first." } },
  { id: "nomw", name: { tr: "NOMW", en: "NOMW" }, gloss: "Benim Nöbetimde Olmaz", cls: "medtech", tier: 2, desc: { tr: "Not On My Watch. Savaş başına bir kez, 4 metre (2 kare) yakınındaki bir dostun ikinci ölüm kurtarma başarısızlığını alacakken Reaction'ını harcayarak bunu engelleyebilirsin. O başarısızlık sayılmaz.", en: "Not On My Watch. Once per combat, when an ally within 4 meters (2 squares) would take their second death save failure, you can spend your Reaction to stop it. That failure doesn't count." } },
  { id: "painkiller", name: { tr: "Painkiller", en: "Painkiller" }, gloss: "Ağrı Kesici", cls: "medtech", tier: 2, desc: { tr: "Savaş başına bir kez, bir aksiyon harcayarak bitişiğindeki bir dostuna ağrı kesici yapabilirsin. Dostunun yara cezaları, Ustalık modifier'ın kadar tur boyunca kalkar.", en: "Once per combat, you can spend an action to give an adjacent ally a painkiller. Their wound penalties are lifted for a number of rounds equal to your Mastery modifier." } },
  { id: "adrenaline-shot", name: { tr: "Adrenaline Shot", en: "Adrenaline Shot" }, gloss: "Adrenalin İğnesi", cls: "medtech", tier: 2, desc: { tr: "Oturum başına Ustalık modifier'ın kadar kez, stabilize ettiğin kişiyi ayakta tutabilirsin: bilinci kapanmaz, 1 HP yerine 1d6 + Ustalık modifier'ın kadar HP ile kalkar ve 3 tur boyunca yara cezalarını yok sayar.", en: "A number of times per session equal to your Mastery modifier, you can keep someone you stabilize on their feet: they don't fall unconscious, they get up with 1d6 + your Mastery modifier HP instead of 1, and they ignore wound penalties for 3 rounds." } },
  { id: "field-hospital", name: { tr: "Field Hospital", en: "Field Hospital" }, gloss: "Sahra Hastanesi", cls: "medtech", tier: 2, desc: { tr: "Gözetiminde tam bir gece dinlenen herkes iki kat iyileşir ve bunun üstüne Medicine modifier'ının iki katı kadar HP daha kazanır.", en: "Everyone who rests a full night under your care heals double and, on top of that, regains extra HP equal to twice your Medicine modifier." } },
  { id: "professional", name: { tr: "Professional", en: "Professional" }, gloss: "Profesyonel", cls: "solo", tier: 1, desc: { tr: "Reload senin için aksiyon yerine bonus aksiyondur.", en: "Reloading takes you a bonus action instead of an action." } },
  { id: "spot-weakness", name: { tr: "Spot Weakness", en: "Spot Weakness" }, gloss: "Zayıf Nokta", cls: "solo", tier: 1, desc: { tr: "Savaş başına Ustalık modifier'ın kadar kez, isabet ettirdiğin bir saldırının hasarına +1d6 ekleyebilirsin.", en: "A number of times per combat equal to your Mastery modifier, you can add +1d6 to the damage of an attack that hits." } },
  { id: "second-wind", name: { tr: "Second Wind", en: "Second Wind" }, gloss: "İkinci Nefes", cls: "solo", tier: 1, desc: { tr: "Oturum başına bir kez, bonus aksiyonla 1d6 + Ustalık modifier'ın kadar HP kazanabilirsin.", en: "Once per session, you can regain 1d6 + your Mastery modifier HP with a bonus action." } },
  { id: "pinning-fire", name: { tr: "Pinning Fire", en: "Pinning Fire" }, gloss: "Sindirme Ateşi", cls: "solo", tier: 1, desc: { tr: "Açtığın baskı ateşine karşı atılan Mental Resist'in DV'si 11 yerine 14 olur.", en: "The Mental Resist DV against your suppressive fire is 14 instead of 11." } },
  { id: "run-and-gun", name: { tr: "Run and Gun", en: "Run and Gun" }, gloss: "Koş ve Vur", cls: "solo", tier: 1, desc: { tr: "Koşmak için aksiyon yerine bonus aksiyon da harcayabilirsin. Bonus aksiyonla koştuğunda 12 yerine 6 metre (3 kare) ilave hareket kazanırsın.", en: "You can also run with your bonus action instead of your action. When you run with a bonus action, you gain 6 meters (3 squares) of extra movement instead of 12." } },
  { id: "ammo-discipline", name: { tr: "Ammo Discipline", en: "Ammo Discipline" }, gloss: "Mermi Disiplini", cls: "solo", tier: 1, desc: { tr: "Baskı ateşi açtığında 10 yerine 6 mermi harcarsın.", en: "When you lay down suppressive fire, you use 6 rounds instead of 10." } },
  { id: "killer-instinct", name: { tr: "Killer Instinct", en: "Killer Instinct" }, gloss: "Av İçgüdüsü", cls: "solo", tier: 1, desc: { tr: "Ağır Yaralı bir düşmana yaptığın saldırı zarlarına +1 eklersin.", en: "You add +1 to your attack rolls against a Seriously Wounded enemy." } },
  { id: "flurry", name: { tr: "Flurry", en: "Flurry" }, gloss: "Seri Darbe", cls: "solo", tier: 2, desc: { tr: "Hafif bir yakın dövüş silahıyla bir aksiyonda iki saldırı yapabilirsin. İkisi de aynı kişiye isabet ederse hasarları toplanır ve zırh bir kez çıkarılır.", en: "You can make two attacks with a light melee weapon in one action. If both hit the same person, their damage is added together and armor is subtracted once." } },
  { id: "adrenaline-rush", name: { tr: "Adrenaline Rush", en: "Adrenaline Rush" }, gloss: "Adrenalin Patlaması", cls: "solo", tier: 2, desc: { tr: "Savaş başına bir kez, kendi turunda bir aksiyon daha kazanabilirsin.", en: "Once per combat, you can gain one extra action on your turn." } },
  { id: "follow-through", name: { tr: "Follow Through", en: "Follow Through" }, gloss: "Sıradaki", cls: "solo", tier: 2, desc: { tr: "Kendi turunda bir düşmanı Ölümcül Yaralı bıraktığında ya da öldürdüğünde, Reaction'ını harcayıp başka bir düşmana bir saldırı yapabilirsin.", en: "When you leave an enemy Mortally Wounded or kill them on your own turn, you can spend your Reaction to make one attack against another enemy." } },
  { id: "overkill", name: { tr: "Overkill", en: "Overkill" }, gloss: "Acımasız", cls: "solo", tier: 2, desc: { tr: "Açtığın kritik yaraların zırhı yok sayan bonus hasarına Ustalık modifier'ını eklersin.", en: "You add your Mastery modifier to the armor-ignoring bonus damage of the critical injuries you cause." } },
  { id: "seasoned", name: { tr: "Seasoned", en: "Seasoned" }, gloss: "Kıdemli", cls: "lawman", tier: 1, desc: { tr: "Oturum başına aldığın Tecrübe Zarı sayısı 1 artar.", en: "You get 1 more Veteran Die per session." } },
  { id: "make-an-example", name: { tr: "Make an Example", en: "Make an Example" }, gloss: "İbret Olsun", cls: "lawman", tier: 1, desc: { tr: "Bir düşmanı Ölümcül Yaralı bıraktığın ya da öldürdüğün turda, bonus aksiyonla seni gören bir kişiye Intimidation atabilirsin; o kişi Mental Resist ile karşılık verir. Kazanırsan o kişinin saldırı zarları, kendi bir sonraki turunun sonuna kadar dezavantajlıdır.", en: "On a turn when you leave an enemy Mortally Wounded or kill them, you can use a bonus action to roll Intimidation against one person who can see you; they answer with Mental Resist. If you win, their attack rolls have disadvantage until the end of their next turn." } },
  { id: "takedown", name: { tr: "Takedown", en: "Takedown" }, gloss: "Etkisiz Hale Getirme", cls: "lawman", tier: 1, desc: { tr: "Birini yakalamak için attığın Brawling atışlarına Ustalık modifier'ını eklersin.", en: "You add your Mastery modifier to Brawling rolls to grab someone." } },
  { id: "crime-scene", name: { tr: "Crime Scene", en: "Crime Scene" }, gloss: "Olay Yeri", cls: "lawman", tier: 1, desc: { tr: "Bir yeri 15 dakika boyunca incelersen, orada attığın Perception atışı avantajlıdır.", en: "If you spend 15 minutes examining a place, your Perception roll there has advantage." } },
  { id: "read-the-room", name: { tr: "Read the Room", en: "Read the Room" }, gloss: "Ortamı Okumak", cls: "lawman", tier: 1, desc: { tr: "Bir yere girdiğinde Tecrübe Zarlarından birini harcayarak Insight atabilirsin. Atış dezavantajlıdır ama harcadığın zar sonuca eklenir. DV 11'e karşı başarılı olursan GM, orada sana karşı en kötü niyeti taşıyan kişiyi söyler.", en: "When you enter a place, you can spend one of your Veteran Dice to roll Insight. The roll has disadvantage, but the die you spent is added to the result. If you succeed against DV 11, the GM tells you who there has the worst intentions toward you." } },
  { id: "interrogator", name: { tr: "Interrogator", en: "Interrogator" }, gloss: "Sorgucu", cls: "lawman", tier: 1, desc: { tr: "Sorgu sırasında Intimidation ve Insight atışlarına Ustalık modifier'ını eklersin. Bu yalnızca gerçek bir sorguda, yani kaçamayan ve senin kontrolünde olan birini konuşturmaya çalışırken işe yarar.", en: "During an interrogation, you add your Mastery modifier to Intimidation and Insight rolls. This only works in a real interrogation: when you're trying to make someone talk who can't get away and is under your control." } },
  { id: "tail", name: { tr: "Tail", en: "Tail" }, gloss: "Takip", cls: "lawman", tier: 1, desc: { tr: "Birini gizlice takip ederken Tecrübe Zarlarından birini harcayarak Stealth atışını avantajlı atabilirsin.", en: "While secretly tailing someone, you can spend one of your Veteran Dice to roll Stealth with advantage." } },
  { id: "hard-boiled", name: { tr: "Hard-Boiled", en: "Hard-Boiled" }, gloss: "Kaşarlanmış", cls: "lawman", tier: 2, desc: { tr: "Tecrübe Zarların d4 yerine d6 olur.", en: "Your Veteran Dice become d6s instead of d4s." } },
  { id: "showdown", name: { tr: "Showdown", en: "Showdown" }, gloss: "Hesaplaşma", cls: "lawman", tier: 2, desc: { tr: "Silaha davranma atışlarına Ustalık modifier'ını eklersin. Davranmayı kazandığın hedeflerden birine, savaş başlamadan önce bir saldırı yapabilirsin.", en: "You add your Mastery modifier to your rolls to go for a weapon. Before combat starts, you can make one attack against one of the targets you beat." } },
  { id: "backup", name: { tr: "Backup", en: "Backup" }, gloss: "Destek", cls: "lawman", tier: 2, desc: { tr: "Savaş başına Ustalık modifier'ın kadar kez, bonus aksiyonla seni duyan bir dostuna seslenebilirsin. Dostun kabul ederse Reaction'ını harcar ve bu turda saldırdığın hedefe normal bir saldırı yapar.", en: "A number of times per combat equal to your Mastery modifier, you can use a bonus action to call out to an ally who can hear you. If they agree, they spend their Reaction to make a normal attack against the target you attacked this turn." } },
  { id: "gut-feeling", name: { tr: "Gut Feeling", en: "Gut Feeling" }, gloss: "Önsezi", cls: "lawman", tier: 2, desc: { tr: "Oturum başına bir kez, Tecrübe Zarlarından birini harcayarak peşinde olduğun iş hakkında GM'e bir soru sorabilirsin. GM kısa ama doğru bir ipucu verir: bir isim, bir yer ya da bir bağlantı.", en: "Once per session, you can spend one of your Veteran Dice to ask the GM a question about the case you're on. The GM gives a short but true clue: a name, a place or a connection." } },
  { id: "grease-monkey", name: { tr: "Grease Monkey", en: "Grease Monkey" }, gloss: "Tamirci", cls: "nomad", tier: 1, desc: { tr: "Araç tamir ederken Craft atışların avantajlıdır.", en: "Your Craft rolls to repair vehicles have advantage." } },
  { id: "mount-up", name: { tr: "Mount Up", en: "Mount Up" }, gloss: "Atla", cls: "nomad", tier: 1, desc: { tr: "Araca binmek ve inmek senin için bedavadır. Hareket eden bir araca atlarken Athletics atışların avantajlıdır.", en: "Getting in and out of a vehicle is free for you. Your Athletics rolls to jump onto a moving vehicle have advantage." } },
  { id: "smuggler", name: { tr: "Smuggler", en: "Smuggler" }, gloss: "Kaçakçı", cls: "nomad", tier: 1, desc: { tr: "Bu feat'i aldığında sana ait bir araç seçersin ve o araca gizli bir bölme eklenir. Bölmeyi bir aramada bulmak için DV 17'ye karşı Perception atmak gerekir. Aracı kaybedersen bölme de onunla gider ve başka bir araca eklenemez.", en: "When you take this feat, you pick a vehicle you own and it gets a hidden compartment. Finding the compartment in a search takes a Perception roll against DV 17. If you lose the vehicle, the compartment goes with it and can't be added to another vehicle." } },
  { id: "badlands-born", name: { tr: "Badlands Born", en: "Badlands Born" }, gloss: "Çorakta Doğmuş", cls: "nomad", tier: 1, desc: { tr: "Yürürken zorlu arazi seni yavaşlatmaz.", en: "Difficult terrain doesn't slow you down while you're on foot." } },
  { id: "scavenger", name: { tr: "Scavenger", en: "Scavenger" }, gloss: "Hurdacı", cls: "nomad", tier: 1, desc: { tr: "Oturum başına bir kez, bir araç enkazı ya da hurdayla dolu bir konteyner gibi bir hurda yığınını 10 dakika didiklersen işe yarar bir şey bulursun: birkaç mermi, bir yedek parça ya da ucuz bir eşya. Ne bulacağına GM karar verir.", en: "Once per session, if you spend 10 minutes picking through scrap, like a wrecked vehicle or a container full of junk, you find something useful: a few rounds, a spare part or a cheap item. The GM decides what you find." } },
  { id: "side-by-side", name: { tr: "Side by Side", en: "Side by Side" }, gloss: "Omuz Omuza", cls: "nomad", tier: 1, desc: { tr: "Bitişiğinde bir dostun varken saldırı zarlarına +1 eklersin.", en: "While an ally is adjacent to you, you add +1 to your attack rolls." } },
  { id: "hotwire", name: { tr: "Hotwire", en: "Hotwire" }, gloss: "Düz Kontak", cls: "nomad", tier: 1, desc: { tr: "Bir aracı anahtarı olmadan 1 dakikada çalıştırabilirsin. Bu, şirket araçlarında ve zırhlı araçlarda işe yaramaz.", en: "You can start a vehicle without its key in 1 minute. This doesn't work on corporate or armored vehicles." } },
  { id: "road-fixer", name: { tr: "Road Fixer", en: "Road Fixer" }, gloss: "Yol Tamircisi", cls: "nomad", tier: 2, desc: { tr: "Oturum başına Ustalık modifier'ın kadar kez, bir aksiyon harcayarak dokunduğun bir aracın 2d6 + Ustalık modifier'ın kadar HP'sini onarabilirsin.", en: "A number of times per session equal to your Mastery modifier, you can spend an action to repair 2d6 + your Mastery modifier HP on a vehicle you touch." } },
  { id: "ride-or-die", name: { tr: "Ride or Die", en: "Ride or Die" }, gloss: "Ölümüne", cls: "nomad", tier: 2, desc: { tr: "Bir dostun Ölümcül Yaralı düştüğünde, kendi bir sonraki turunun sonuna kadar saldırı zarların avantajlıdır.", en: "When an ally drops to Mortally Wounded, your attack rolls have advantage until the end of your next turn." } },
  { id: "scrap-armor", name: { tr: "Scrap Armor", en: "Scrap Armor" }, gloss: "Hurda Zırh", cls: "nomad", tier: 2, desc: { tr: "Oturum başına bir kez, sahada bile, 1 saat harcayıp zırhını hurdayla yamayabilirsin. Zırh, aşınmayla kaybettiği SP'nin Ustalık modifier'ının iki katı kadarını geri kazanır, ama asıl SP'sini geçemez.", en: "Once per session, even in the field, you can spend 1 hour patching your armor with scrap. The armor regains SP lost to ablation equal to twice your Mastery modifier, up to its original SP." } },
  { id: "hit-the-dirt", name: { tr: "Hit the Dirt", en: "Hit the Dirt" }, gloss: "Yere Yat", cls: "nomad", tier: 2, desc: { tr: "Patlamalardan kaçmak için attığın Evasion atışları avantajlıdır. Başarısız olsan bile hasarın yalnızca yarısını alırsın.", en: "Your Evasion rolls to escape explosions have advantage. Even if you fail, you take only half the damage." } },
];

const CONTENT = {
  "players-guide/baslarken": {
    intro: {
      tr: `
        <p>Bu sayfa, Cyberpunk Green'e ilk kez gelenler içindir: oyun nerede geçer, bu kural kitabı nedir, Cyberpunk RED'den nasıl ayrılır ve oynamaya başlamak için neler gerekir.</p>
      `,
      en: `
        <p>This page is for newcomers to Cyberpunk Green: where the game takes place, what this rulebook is, how it differs from Cyberpunk RED and what you need to start playing.</p>
      `,
    },
    sections: [
      {
        id: "night-city",
        label: { tr: "Night City'ye Hoş Geldin", en: "Welcome to Night City" },
        body: {
          tr: `
            <p>Yıl 2076. <span lang="en">Night City</span>, Kaliforniya kıyısında, hiçbir devlete bağlı olmayan özgür bir şehirdir; ama şehri gerçekte şirketler yönetir. Kulelerin tepesinde şirket yöneticileri oturur, sokaklarda çeteler, polis ve kiralık silahlar dolaşır. Reklamların ışığı her köşeye ulaşır, güvenlik pek az yere.</p>
            <p>Oyuncular <strong>edgerunner</strong>'ları canlandırır: yasanın ve şirketlerin kenarında yaşayan, parası ödendiği sürece her işi yapan profesyonelleri. İşleri, yani <span lang="en">gig</span>'leri, <strong>fixer</strong>'lar bulur. Ekip bir şeyi çalar, birini korur, bir paketi teslim eder ya da birini ortadan kaldırır. Para krom getirir, krom güç getirir; ama bedene takılan her parça insanlıktan da bir şey götürür.</p>
            <p>Şehrin tarihi, şirketleri, çeteleri ve sokak dili <a href="#lore/night-city">Evren</a> bölümündedir.</p>
          `,
          en: `
            <p>The year is 2076. Night City is a free city on the California coast, beholden to no nation; in truth, the corporations run it. Corporate executives sit at the tops of the towers, while gangs, cops and hired guns work the streets. Ad light reaches every corner; safety reaches very few.</p>
            <p>The players are <strong>edgerunners</strong>: professionals living on the edge of the law and the corporations, who'll take any job as long as it pays. The jobs, or gigs, come through <strong>fixers</strong>. The crew steals something, protects someone, delivers a package or makes someone disappear. Money buys chrome and chrome buys power, but every piece put into the body takes a little humanity with it.</p>
            <p>The city's history, corporations, gangs and street slang are in the <a href="#lore/night-city">Lore</a> section.</p>
          `,
        },
      },
      {
        id: "kitap",
        label: { tr: "Bu Kural Kitabı", en: "This Rulebook" },
        body: {
          tr: `
            <p>Cyberpunk Green; <span lang="en">Cyberpunk RED</span>, <span lang="en">Cyberpunk Edgerunners Mission Kit</span> ve <span lang="en">D&amp;D 5e</span>'nin harmanlanıp sadeleştirilmesiyle hazırlanmış bir masa üstü rol yapma oyunudur. Hedef, Cyberpunk dünyasını 5e'ye alışkın oyuncuların kolayca öğrenebileceği bir kural setiyle oynamaktır.</p>
            <ul>
              <li><strong>Kural Kitabı:</strong> Atışlar, statlar, karakter oluşturma, seviye atlama, aksiyonlar, savaş, iyileşme ve araçlar.</li>
              <li><strong>Oyuncu Rehberi:</strong> Sınıflar, feat'ler, eşyalar, cyberware ve Netrunning.</li>
              <li><strong>Araçlar:</strong> Stat dağıtma, karakter oluşturma ve dükkan oluşturma araçları.</li>
            </ul>
            <p>Kurallar erken bir sürümdedir ve oynandıkça değişebilir. <span class="draft">Taslak</span> etiketli değerler henüz kesinleşmemiştir.</p>
          `,
          en: `
            <p>Cyberpunk Green is a tabletop roleplaying game built by blending and simplifying Cyberpunk RED, the Cyberpunk Edgerunners Mission Kit and D&amp;D 5e. The goal is to play in the Cyberpunk world with a ruleset that players used to 5e can pick up easily.</p>
            <ul>
              <li><strong>Rulebook:</strong> Rolls, stats, character creation, leveling, actions, combat, healing and vehicles.</li>
              <li><strong>Player's Guide:</strong> Roles, feats, items, cyberware and Netrunning.</li>
              <li><strong>Tools:</strong> Point buy, character creation and shop creation tools.</li>
            </ul>
            <p>The rules are in an early version and may change as they're played. Values marked <span class="draft">Draft</span> aren't final yet.</p>
          `,
        },
      },
      {
        id: "red-farklari",
        label: { tr: "Cyberpunk RED'den Farkları", en: "Differences from Cyberpunk RED" },
        body: {
          tr: `
            <p>RED bilenler için kısaca neyin değiştiği:</p>
            <ul>
              <li><strong>Statlar:</strong> Statlar 5e'deki gibi 3–20 arasıdır ve atışa modifier'larıyla girer. Skill veren yedi stat vardır. <span lang="en">Luck</span> bir stat değil, her oturum dolan bir puan havuzudur; hareket herkeste aynıdır. EMP skill vermez, yalnızca Humanity'yi belirler.</li>
              <li><strong>Atış:</strong> RED'deki gibi d10 atılır ve kritik zar korunur. Atışa stat ayrıca eklenmez: d10 + skill değeri (stat modifier + yetkinlik + Ustalık + bonuslar). Avantaj ve dezavantaj 5e'den gelir.</li>
              <li><strong>Skill'ler:</strong> Her stat'ın altında dört skill, toplam 28 skill vardır. Skill'ler puanla seviyelendirilmez; yetkinlik (+1 / +2) ve Ustalık ile güçlenir.</li>
              <li><strong>Sınıflar ve seviye:</strong> Rol yetenekleri ve gelişim puanları yerine 1–12 arası seviyeler vardır. Her sınıfın bir çekirdek feat'i, kendi feat havuzu ve iki specialization'ı vardır.</li>
              <li><strong>Tur:</strong> 5e'deki gibi her turda 1 aksiyon, 1 bonus aksiyon, hareket ve sınırlı sayıda Reaction kullanılır. Mermiden kaçmak bir Reaction harcar.</li>
              <li><strong>HP:</strong> Yalnızca BODY'den hesaplanır ve seviyeyle artmaz; güç feat'lerden, skill'lerden ve kromdan gelir.</li>
              <li><strong>Humanity:</strong> Humanity kaybı EMP'yi düşürmez. Humanity basamaklara ayrılır; alt basamaklarda belli olaylar cyberpsychosis krizi tetikler.</li>
              <li><strong>Netrunning:</strong> NET mimarisine dalış yoktur. Netrunner savaşın içinde, cyberdeck'i üzerinden insanlara ve cihazlara quickhack yapar; quickhack'ler RAM harcar.</li>
              <li><strong>Krom:</strong> Kromlar Humanity kaybına göre ağırlıklara ayrılır ve her vücut bölgesinde sınırlı yuva vardır. Akıllı silah sistemi yoktur.</li>
              <li><strong>Karakter oluşturma:</strong> Lifepath yoktur; karakterin geçmişini oyuncu kendisi düşünür. Statlar point buy ya da sabit diziyle belirlenir.</li>
              <li><strong>Zaman:</strong> Oyun 2045'te değil, 2076'da geçer.</li>
            </ul>
          `,
          en: `
            <p>For those who know RED, a quick look at what changed:</p>
            <ul>
              <li><strong>Stats:</strong> Stats run from 3 to 20 as in 5e and enter rolls through their modifiers. Seven stats grant skills. Luck isn't a stat but a pool of points that refills every session; movement is the same for everyone. EMP grants no skills and only sets Humanity.</li>
              <li><strong>Rolls:</strong> As in RED, you roll a d10, and exploding dice stay. The stat isn't added to the roll separately: d10 + skill value (stat modifier + proficiency + Mastery + bonuses). Advantage and disadvantage come from 5e.</li>
              <li><strong>Skills:</strong> Each stat has four skills, 28 in all. Skills aren't leveled with points; they grow through proficiency (+1 / +2) and Mastery.</li>
              <li><strong>Roles and levels:</strong> Instead of Role Abilities and Improvement Points there are levels from 1 to 12. Each Role has a core feat, its own feat pool and two specializations.</li>
              <li><strong>Turns:</strong> As in 5e, each turn has 1 action, 1 bonus action, movement and a limited number of Reactions. Dodging bullets costs a Reaction.</li>
              <li><strong>HP:</strong> Comes from BODY alone and doesn't grow with level; power comes from feats, skills and chrome.</li>
              <li><strong>Humanity:</strong> Losing Humanity doesn't lower EMP. Humanity is split into tiers, and in the lower tiers certain events trigger a cyberpsychosis crisis.</li>
              <li><strong>Netrunning:</strong> There are no NET Architecture dives. The Netrunner quickhacks people and devices through a cyberdeck in the middle of combat; quickhacks cost RAM.</li>
              <li><strong>Chrome:</strong> Chrome is split into weights by its Humanity loss, and each body area has a limited number of slots. There's no smartgun system.</li>
              <li><strong>Character creation:</strong> There's no Lifepath; the player works out the character's past themselves. Stats are set with point buy or the standard array.</li>
              <li><strong>Time:</strong> The game is set in 2076, not 2045.</li>
            </ul>
          `,
        },
      },
      {
        id: "gerekenler",
        label: { tr: "Oynamak İçin Gerekenler", en: "What You Need to Play" },
        body: {
          tr: `
            <ul>
              <li>Bir GM ve birkaç oyuncu.</li>
              <li>Zarlar: d10'lar ve d6'lar; Lawman için d4'ler de.</li>
              <li>Her oyuncu için bir karakter kağıdı. <a href="#araclar/karakter-olustur">Araçlar › Karakter Oluştur</a> kağıdı adım adım doldurur.</li>
              <li>Savaş için kareli bir harita. Haritada bir kare 2 metredir.</li>
            </ul>
          `,
          en: `
            <ul>
              <li>A GM and a few players.</li>
              <li>Dice: d10s and d6s, plus d4s for Lawmen.</li>
              <li>A character sheet for each player. <a href="#araclar/karakter-olustur">Tools › Create a Character</a> fills one in step by step.</li>
              <li>A square grid map for combat. One square on the map is 2 meters.</li>
            </ul>
          `,
        },
      },
      {
        id: "nereden",
        label: { tr: "Nereden Başlamalı", en: "Where to Start" },
        body: {
          tr: `
            <p>Oyunu ilk kez öğrenen bir oyuncu için önerilen okuma sırası:</p>
            <ol>
              <li><a href="#rulebook/temel-mekanik">Kural Kitabı › Temel Kurallar</a>: atışlar, DV, avantaj, Humanity.</li>
              <li><a href="#rulebook/karakter-yaratma">Kural Kitabı › Karakter Oluşturma</a>: karakterin adım adım hazırlanışı.</li>
              <li><a href="#players-guide/roller">Oyuncu Rehberi › Sınıflar</a>: sınıfı seçmek için.</li>
              <li><a href="#rulebook/aksiyon-ekonomisi">Kural Kitabı › Aksiyonlar</a> ve <a href="#rulebook/savas">Savaş</a>: ilk çatışmadan önce.</li>
            </ol>
            <p>Bilinmeyen bir kelimeyle karşılaşınca <a href="#players-guide/terimler-sozlugu">Oyuncu Rehberi › Sözlük</a>'e bakılabilir.</p>
          `,
          en: `
            <p>A suggested reading order for a player learning the game:</p>
            <ol>
              <li><a href="#rulebook/temel-mekanik">Rulebook › Core Rules</a>: rolls, DV, advantage, Humanity.</li>
              <li><a href="#rulebook/karakter-yaratma">Rulebook › Character Creation</a>: building a character step by step.</li>
              <li><a href="#players-guide/roller">Player's Guide › Roles</a>: to pick a Role.</li>
              <li><a href="#rulebook/aksiyon-ekonomisi">Rulebook › Action Economy</a> and <a href="#rulebook/savas">Combat</a>: before the first fight.</li>
            </ol>
            <p>When you run into an unfamiliar word, check the <a href="#players-guide/terimler-sozlugu">Player's Guide › Glossary</a>.</p>
          `,
        },
      },
    ],
  },
  "players-guide/terimler-sozlugu": {
    intro: {
      tr: `
        <p>Night City'nin kendine has bir dili vardır; bu kural kitabının da. Aşağıda evrende sık geçen sözler ve kurallarda karşılaşılan terimler kısaca açıklanır. Sokak argosunun daha uzun bir listesi <a href="#lore/edgerunner-hayati">Evren › Edgerunner Hayatı</a> sayfasındaki Sokak Dili bölümündedir.</p>
      `,
      en: `
        <p>Night City has a language of its own, and so does this rulebook. Below are short explanations of words that come up often in the setting and terms found in the rules. A longer list of street slang is in the Street Slang section of the <a href="#lore/edgerunner-hayati">Lore › Edgerunner Life</a> page.</p>
      `,
    },
    sections: [
      { id: "evren", label: { tr: "Evren ve Sokak", en: "Setting and Street" }, tool: "glossary-world" },
      { id: "kurallar", label: { tr: "Kural Terimleri", en: "Rules Terms" }, tool: "glossary-rules" },
    ],
  },
  "players-guide/featler": {
    intro: {
      tr: `
        <p>Sokakta uzun süre ayakta kalanları ötekilerden ayıran şey, yıllar içinde aldıkları eğitim ve öğrendikleri numaralardır. Feat'ler bunları temsil eder. Bazı feat'leri her karakter alabilir; bazıları ise bir sınıfın kendi işinden doğar ve yalnızca o sınıfa açıktır.</p>
      `,
      en: `
        <p>What sets the people who last on the street apart from everyone else is the training they've had and the tricks they've picked up over the years. Feats represent those. Some feats are open to every character; others grow out of a role's own line of work and are open only to that role.</p>
      `,
    },
    sections: [
      {
        id: "feat-puanlari",
        label: { tr: "Feat Puanları", en: "Feat Points" },
        body: {
          tr: `
            <ul>
              <li>Feat'ler <strong>feat puanı</strong> harcanarak alınır. Hangi seviyede kaç feat puanı kazanıldığı <a href="#rulebook/seviye-ilerlemesi">Kural Kitabı › Seviye Atlama</a> ve <a href="#players-guide/roller">Oyuncu Rehberi › Sınıflar</a> sayfalarında yazar.</li>
              <li>Feat puanları hemen harcanmak zorunda değildir; biriktirilebilir.</li>
              <li>Her feat yalnızca bir kez alınabilir.</li>
            </ul>
          `,
          en: `
            <ul>
              <li>Feats are bought with <strong>feat points</strong>. How many feat points each level grants is listed on the <a href="#rulebook/seviye-ilerlemesi">Rulebook › Level Progression</a> and <a href="#players-guide/roller">Player's Guide › Roles</a> pages.</li>
              <li>Feat points don't have to be spent right away; they can be saved up.</li>
              <li>Each feat can be taken only once.</li>
            </ul>
          `,
        },
      },
      {
        id: "feat-turleri",
        label: { tr: "Tarafsız ve Sınıf Feat'leri", en: "General and Role Feats" },
        body: {
          tr: `
            <ul>
              <li><strong>Tarafsız feat'ler</strong> her sınıfa açıktır ve 1 puandır.</li>
              <li><strong>Sınıf feat'leri</strong> yalnızca o sınıfın karakterlerine açıktır. 1. aşama feat'ler 1 puan, 2. aşama feat'ler 2 puandır. 2. aşama feat'ler 4. seviyede açılır.</li>
              <li>Feat'in kendi metninde aksi yazmıyorsa ön koşulu yoktur; 2. aşama bir feat almak için önce aynı sınıftan 1. aşama bir feat almak gerekmez.</li>
              <li>6. seviyede karakter başka bir sınıf seçebilir; o andan sonra o sınıfın 1. aşama feat'lerini de normal maliyetle alabilir. İsterse bunun yerine fazladan 1 feat puanı alır. Başka bir sınıfın 2. aşama feat'leri alınamaz.</li>
              <li>Her sınıfın 1. seviyede bedavaya aldığı bir <strong>çekirdek feat</strong>'i de vardır. Çekirdek feat'ler Sınıflar sayfasında yazar.</li>
            </ul>
          `,
          en: `
            <ul>
              <li><strong>General feats</strong> are open to every role and cost 1 point.</li>
              <li><strong>Role feats</strong> are open only to characters of that role. Tier 1 feats cost 1 point, tier 2 feats cost 2 points. Tier 2 feats open up at level 4.</li>
              <li>Unless a feat's own text says otherwise, it has no prerequisites; taking a tier 2 feat doesn't require taking a tier 1 feat from the same role first.</li>
              <li>At level 6, a character can choose another role; from then on, they can also take that role's tier 1 feats at the normal cost. If they prefer, they take 1 extra feat point instead. Another role's tier 2 feats can't be taken.</li>
              <li>Every role also has a <strong>core feat</strong> it gets for free at level 1. Core feats are listed on the Roles page.</li>
            </ul>
          `,
        },
      },
      {
        id: "feat-listesi",
        label: { tr: "Feat Listesi", en: "Feat List" },
        tool: "feat-table",
      },
    ],
  },

  "players-guide/netrunning": {
    intro: {
      tr: `
        <p>2076'da bir Netrunner'ın en tehlikeli silahı, neuroport'una bağlı cyberdeck'idir. Netrunner'lar cyberdeck'leri aracılığıyla düşmanların kromuna ve çevredeki cihazlara sızar; bir kamerayı kör edebilir ya da bir düşmanın kromunu kendi bedenine karşı çevirebilir. Bu sızmalara <strong><span lang="en">quickhack</span></strong> denir.</p>
      `,
      en: `
        <p>In 2076, a Netrunner's deadliest weapon is the cyberdeck plugged into their neuroport. Netrunners use their cyberdecks to break into enemies' chrome and the devices around them; they can blind a camera or turn an enemy's own chrome against their body. These intrusions are called <strong>quickhacks</strong>.</p>
      `,
    },
    sections: [
      {
        id: "kademeler",
        label: { tr: "Kademeler", en: "Tiers" },
        body: {
          tr: `
            <ul>
              <li>Netrunner için quickhack kullanmak bir <strong>bonus aksiyondur</strong>. Bonus aksiyonla saldırı yapılamaz kuralının istisnası budur: quickhack bir saldırı olsa bile bonus aksiyonla kullanılır.</li>
              <li>Quickhack'in hedefi olan kişinin ya da cihazın Netrunner tarafından <strong>görülüyor</strong> olması gerekir.</li>
              <li>Quickhack'ler dört kademeye ayrılır: <strong>I, II, III ve IV</strong>. I. kademe basit işleri kapsar, IV. kademe en üst düzeydir.</li>
              <li>Netrunner'lar kademelere seviye atladıkça erişir: I. kademe 1. seviyede, II. kademe 3. seviyede, III. kademe 7. seviyede, IV. kademe 10. seviyede açılır.</li>
              <li>Netrunner'ın specialization'ı da kendine özgü quickhack'ler getirir: 3. seviyede II. kademeden, 7. seviyede III. kademeden, 10. seviyede IV. kademeden. Bu quickhack'ler kütüphaneye kendiliğinden girmez; kütüphaneye eklenecek quickhack'ler arasında seçilebilir hale gelir.</li>
              <li>Netrunner olmayan biri bir şekilde cyberdeck kullanabiliyorsa yalnızca I. kademe quickhack'leri, nadir durumlarda da II. kademedekileri kullanabilir. Netrunner olmayan biri için quickhack kullanmak bir aksiyondur.</li>
            </ul>
          `,
          en: `
            <ul>
              <li>For a Netrunner, using a quickhack is a <strong>bonus action</strong>. This is the exception to the rule that a bonus action can't be used to attack: a quickhack is used as a bonus action even when it is an attack.</li>
              <li>The person or device targeted by a quickhack must be <strong>in the Netrunner's sight</strong>.</li>
              <li>Quickhacks are split into four tiers: <strong>I, II, III and IV</strong>. Tier I covers simple tricks; tier IV is the top level.</li>
              <li>Netrunners reach the tiers as they level up: tier I at level 1, tier II at level 3, tier III at level 7, tier IV at level 10.</li>
              <li>A Netrunner's specialization also brings its own quickhacks: from tier II at level 3, tier III at level 7 and tier IV at level 10. These don't go into the library automatically; they become available to choose when quickhacks are added to it.</li>
              <li>Someone who isn't a Netrunner but somehow manages to use a cyberdeck can use only tier I quickhacks, and tier II in rare cases. For someone who isn't a Netrunner, using a quickhack takes an action.</li>
            </ul>
          `,
        },
      },
      {
        id: "kutuphane",
        label: { tr: "Quickhack Kütüphanesi", en: "Quickhack Library" },
        body: {
          tr: `
            <p>Netrunner'ın bildiği quickhack'ler onun <strong>kütüphanesini</strong> oluşturur. Kütüphane, cyberdeck'te hazır tutulan quickhack'lerden ayrıdır: Netrunner dinlenirken hazır quickhack'lerini kütüphanesinden seçer.</p>
            <p>Netrunner 1. seviyede kütüphanesine 3 quickhack ekler; aşağıdaki seviyelerde de yenilerini ekler. Quickhack'ler, Netrunner'ın erişebildiği kademelerden ve kendi specialization'ının quickhack'leri arasından seçilir.</p>
            <table class="rules">
              <thead><tr><th>Seviye</th><th>Yeni <span lang="en">quickhack</span></th><th>Toplam</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>3</td><td>3</td></tr>
                <tr><td>2</td><td>+1</td><td>4</td></tr>
                <tr><td>3</td><td>+2</td><td>6</td></tr>
                <tr><td>5</td><td>+2</td><td>8</td></tr>
                <tr><td>7</td><td>+1</td><td>9</td></tr>
                <tr><td>9</td><td>+2</td><td>11</td></tr>
                <tr><td>11</td><td>+1</td><td>12</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>The quickhacks a Netrunner knows make up their <strong>library</strong>. The library is separate from the quickhacks held ready in the cyberdeck: while resting, the Netrunner picks their ready quickhacks from their library.</p>
            <p>A Netrunner adds 3 quickhacks to their library at level 1 and adds more at the levels below. Quickhacks are chosen from the tiers the Netrunner can access and from their own specialization's quickhacks.</p>
            <table class="rules">
              <thead><tr><th>Level</th><th>New quickhacks</th><th>Total</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>3</td><td>3</td></tr>
                <tr><td>2</td><td>+1</td><td>4</td></tr>
                <tr><td>3</td><td>+2</td><td>6</td></tr>
                <tr><td>5</td><td>+2</td><td>8</td></tr>
                <tr><td>7</td><td>+1</td><td>9</td></tr>
                <tr><td>9</td><td>+2</td><td>11</td></tr>
                <tr><td>11</td><td>+1</td><td>12</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "cyberdeck",
        label: { tr: "Cyberdeck", en: "Cyberdeck" },
        body: {
          tr: `
            <p>Quickhack'ler cyberdeck aracılığıyla kullanılır. Kaliteli bir cyberdeck'in RAM'i daha fazladır ve içinde daha fazla quickhack hazır tutulabilir. Ancak kaliteli bir cyberdeck'i kullanabilmek için daha yüksek bir Netrunning değeri gerekir.</p>
            <table class="rules">
              <thead><tr><th lang="en">Cyberdeck</th><th>Kademe</th><th lang="en">RAM</th><th>Hazır<span class="lbl-full"> <span lang="en">quickhack</span></span></th><th>Gereken<span class="lbl-full"> <span lang="en">Netrunning</span> değeri</span></th><th>Savunma</th></tr></thead>
              <tbody>
                <tr><td>Basit</td><td>I</td><td>4</td><td>5</td><td>—</td><td>+0</td></tr>
                <tr><td>Standart</td><td>II</td><td>6</td><td>6</td><td>+6</td><td>+1</td></tr>
                <tr><td>Kaliteli</td><td>III</td><td>8</td><td>7</td><td>+7</td><td>+2</td></tr>
                <tr><td>Üst düzey</td><td>IV</td><td>10</td><td>8</td><td>+8</td><td>+3</td></tr>
              </tbody>
            </table>
            <p>Tablo ortalama cyberdeck'leri gösterir; ikonik cyberdeck'ler bundan farklı olabilir.</p>
            <p><strong>Hazırlık:</strong> Cyberdeck'te hangi quickhack'lerin hazır tutulacağı yalnızca ekip dinlenirken değiştirilebilir. Netrunner o sırada hazır quickhack'lerini istediği gibi seçer.</p>
          `,
          en: `
            <p>Quickhacks are used through a cyberdeck. A better cyberdeck has more RAM and can hold more quickhacks ready. But using a better cyberdeck takes a higher Netrunning value.</p>
            <table class="rules">
              <thead><tr><th>Cyberdeck</th><th>Tier</th><th>RAM</th><th><span class="lbl-full">Quickhacks ready</span><span class="lbl-short">Ready</span></th><th><span class="lbl-full">Netrunning value needed</span><span class="lbl-short">Needed</span></th><th>Defense</th></tr></thead>
              <tbody>
                <tr><td>Basic</td><td>I</td><td>4</td><td>5</td><td>—</td><td>+0</td></tr>
                <tr><td>Standard</td><td>II</td><td>6</td><td>6</td><td>+6</td><td>+1</td></tr>
                <tr><td>Quality</td><td>III</td><td>8</td><td>7</td><td>+7</td><td>+2</td></tr>
                <tr><td>Top-tier</td><td>IV</td><td>10</td><td>8</td><td>+8</td><td>+3</td></tr>
              </tbody>
            </table>
            <p>The table shows average cyberdecks; iconic cyberdecks can differ.</p>
            <p><strong>Preparation:</strong> Which quickhacks a cyberdeck holds ready can only be changed while the crew is resting. During that time, the Netrunner picks their ready quickhacks however they like.</p>
          `,
        },
      },
      {
        id: "ram",
        label: { tr: "RAM", en: "RAM" },
        body: {
          tr: `
            <ul>
              <li>Her quickhack'in bir <strong>RAM maliyeti</strong> vardır. Quickhack kullanılınca bu kadar RAM harcanır; yeterli RAM yoksa quickhack kullanılamaz.</li>
              <li>Netrunner'ın her turunun başında RAM'i <strong>1</strong> puan dolar.</li>
              <li>Savaş bitince RAM tamamen dolar.</li>
              <li><strong>Savaş dışında</strong> da quickhack'ler RAM harcar ve RAM aynı hızla, her tur (yaklaşık 3 saniye) 1 puan dolar. GM, savaş dışında RAM'i saymak zorunda değildir.</li>
            </ul>
            <div class="example"><b>Örnek</b><p>RAM'i 6 olan bir Netrunner, 4 RAM'lik Take Control'ü kullanıyor ve RAM'i 2'ye düşüyor. Bir sonraki turunun başında RAM'i 3 oluyor.</p></div>
          `,
          en: `
            <ul>
              <li>Every quickhack has a <strong>RAM cost</strong>. Using a quickhack spends that much RAM; without enough RAM, the quickhack can't be used.</li>
              <li>RAM refills by <strong>1</strong> at the start of each of the Netrunner's turns.</li>
              <li>When combat ends, RAM refills completely.</li>
              <li><strong>Outside combat</strong>, quickhacks still cost RAM, and RAM refills at the same pace: 1 point per round (about 3 seconds). The GM doesn't have to track RAM outside combat.</li>
            </ul>
            <div class="example"><b>Example</b><p>A Netrunner with 6 RAM uses Take Control, which costs 4 RAM, dropping to 2 RAM. At the start of their next turn they have 3 RAM.</p></div>
          `,
        },
      },
      {
        id: "quickhack-atisi",
        label: { tr: "Quickhack Atışı", en: "Quickhack Roll" },
        body: {
          tr: `
            <p>Bir kişiye quickhack yapılırken Netrunner atış yapar. Sonuç, kişinin savunma DV'sinden yüksekse quickhack tutar; eşitlikte tutmaz.</p>
            <div class="formula">d10 + Netrunning</div>
            <p><strong>Savunma DV'si:</strong></p>
            <div class="formula">8 + kişinin Netrunning değerinin yarısı (yukarı yuvarlanır) + cyberdeck'inin savunması</div>
            <ul>
              <li>Cyberdeck'in savunması cyberdeck tablosunda yazar. Cyberdeck'i olmayan kişide bu değer 0'dır.</li>
              <li>Feat ya da kromdan gelen bonuslar da savunma DV'sine eklenir.</li>
              <li>Tutmayan quickhack'in RAM'i yine harcanır.</li>
              <li>Netrunner'ın kendine ya da bir dostuna yaptığı quickhack'lerde zar atılmaz.</li>
              <li>Kamera, taret, kapı ya da alarm gibi cihazlara yapılan quickhack'lerde de zar atılmaz; quickhack doğrudan tutar.</li>
              <li>Robot ve dron gibi hedeflerin savunma DV'si kendi değerlerinde yazar.</li>
            </ul>
            <div class="example"><b>Örnek</b><p>Netrunning değeri +5 olan bir Netrunner, bir çete netrunner'ına Short Circuit yapıyor. Çete netrunner'ının Netrunning değeri +3 ve elinde Standart bir cyberdeck var. Savunma DV'si 8 + 2 + 1 = 11. Zarda 7 geliyor: 7 + 5 = 12. Quickhack tutuyor.</p></div>
          `,
          en: `
            <p>When quickhacking a person, the Netrunner rolls. If the result is higher than the person's defense DV, the quickhack works. On a tie, it doesn't.</p>
            <div class="formula">d10 + Netrunning</div>
            <p><strong>Defense DV:</strong></p>
            <div class="formula">8 + half their Netrunning value (rounded up) + their cyberdeck's defense</div>
            <ul>
              <li>A cyberdeck's defense is listed in the cyberdeck table. Someone without a cyberdeck adds 0.</li>
              <li>Bonuses from feats or chrome are also added to the defense DV.</li>
              <li>A quickhack that doesn't work still spends its RAM.</li>
              <li>No roll is made for quickhacks the Netrunner uses on themselves or an ally.</li>
              <li>No roll is made for quickhacks used on devices such as cameras, turrets, doors or alarms either; the quickhack simply works.</li>
              <li>Targets such as robots and drones have their defense DV listed in their own stats.</li>
            </ul>
            <div class="example"><b>Example</b><p>A Netrunner with a Netrunning value of +5 uses Short Circuit on a gang netrunner. The gang netrunner has a Netrunning value of +3 and a Standard cyberdeck. The defense DV is 8 + 2 + 1 = 11. The die shows 7: 7 + 5 = 12. The quickhack works.</p></div>
          `,
        },
      },
      {
        id: "quickhack-listesi",
        label: { tr: "Quickhack Listesi", en: "Quickhack List" },
        tool: "quickhack-table",
      },
    ],
  },

  "players-guide/esyalar": {
    intro: {
      tr: `
        <p>Parası olan bu şehirde her şeyi bulur; asıl iş doğru dükkanı bulmaktır. Cyberware dışındaki eşyalar bu listede toplanır: silahlar, zırhlar, patlayıcılar, tıbbi eşyalar, yiyecek ve içecekler, cyberdeck'ler ve her türlü ekipman. Listedeki fiyatlar ortalama fiyatlardır; gerçek fiyat dükkandan dükkana değişir, ama yine 0 ya da 5 ile biter.</p>
      `,
      en: `
        <p>Anyone with the Eddies can find anything in this city; the real work is finding the right shop. Everything that isn't cyberware is collected in this list: weapons, armor, explosives, medical items, food and drink, cyberdecks and all kinds of gear. Prices in the list are averages; the actual price varies from shop to shop, but it still ends in 0 or 5.</p>
      `,
    },
    sections: [{ id: "liste", label: { tr: "Eşya Listesi", en: "Item List" }, tool: "item-table" }],
  },

  "players-guide/cyberware": {
    intro: {
      tr: `
        <p>Sokakta çoğu insan için beden yalnızca bir başlangıçtır; gerisi bir ripperdoc'un masasında tamamlanır. <strong>Cyberware</strong> (krom), vücuda takılan sibernetik parçalardır. Gözün yerine takılan bir optik de, sinirlere bağlanan bir refleks hızlandırıcı da birer cyberware'dir. Kromu ripperdoc'lar takar.</p>
      `,
      en: `
        <p>For most people on the street, the body is only a starting point; the rest gets finished on a ripperdoc's table. <strong>Cyberware</strong> (chrome) is cybernetic hardware installed in the body: an optic that replaces an eye is cyberware, and so is a reflex booster wired into the nerves. Ripperdocs install chrome.</p>
      `,
    },
    sections: [
      {
        id: "yuvalar",
        label: { tr: "Yuvalar", en: "Slots" },
        body: {
          tr: `
            <p>Her vücut bölgesine sınırlı sayıda cyberware takılabilir. Bir bölgenin yuvaları dolunca oraya yeni bir parça takmak için eskisinin sökülmesi gerekir.</p>
            <table class="rules">
              <thead><tr><th>Bölge</th><th>Yuva</th></tr></thead>
              <tbody>
                <tr><td>Nöral sistem</td><td>3</td></tr>
                <tr><td>Gözler</td><td>2</td></tr>
                <tr><td>Kollar</td><td>Her biri 1</td></tr>
                <tr><td>Bacaklar (çift)</td><td>1</td></tr>
                <tr><td>Dahili</td><td>3</td></tr>
                <tr><td>Cilt / dış görünüş</td><td>1</td></tr>
              </tbody>
            </table>
            <p><strong>Neuroport:</strong> Herkeste bir neuroport vardır. Cyberdeck'e ve cihazlara bağlanmayı sağlar. Yuva kaplamaz ve Humanity kaybı yoktur.</p>
            <p><strong>İki Yuva:</strong> Bu etiketi taşıyan parçalar iki kol yuvasını birden kaplar.</p>
            <p><strong>Sürümler:</strong> Aynı parçanın farklı sürümleri aynı anda takılamaz; üst sürüm alt sürümün yerine takılır. Örneğin Beceri Çipi takılıyken yanına Beceri Çipi II takılamaz.</p>
          `,
          en: `
            <p>Each body area can hold a limited amount of cyberware. Once an area's slots are full, an old piece has to come out before a new one goes in.</p>
            <table class="rules">
              <thead><tr><th>Area</th><th>Slots</th></tr></thead>
              <tbody>
                <tr><td>Neural system</td><td>3</td></tr>
                <tr><td>Eyes</td><td>2</td></tr>
                <tr><td>Arms</td><td>1 each</td></tr>
                <tr><td>Legs (pair)</td><td>1</td></tr>
                <tr><td>Internal</td><td>3</td></tr>
                <tr><td>Skin / appearance</td><td>1</td></tr>
              </tbody>
            </table>
            <p><strong>Neuroport:</strong> Everyone has a neuroport. It's what connects a person to cyberdecks and devices. It takes no slot and has no Humanity loss.</p>
            <p><strong>Two Slots:</strong> Pieces with this tag take up both arm slots.</p>
            <p><strong>Versions:</strong> Different versions of the same piece can't be installed at the same time; a higher version replaces the lower one. For example, Chipware Socket Mk II can't be installed next to a Chipware Socket.</p>
          `,
        },
      },
      {
        id: "humanity-ve-cyberware",
        label: { tr: "Humanity ve Cyberware", en: "Humanity and Cyberware" },
        body: {
          tr: `
            <p>Her cyberware'in sabit bir <strong><span lang="en">Humanity</span> kaybı</strong> vardır. Takılı cyberware'lerin Humanity kayıpları toplanır ve maksimum Humanity'den düşülür. Parça sökülünce onun kaybı artık maksimum Humanity'den düşülmez.</p>
            <div class="formula">Maksimum Humanity = EMP × 10 − takılı cyberware'lerin Humanity kayıpları</div>
            <p>Bir cyberware'in <strong>ağırlığı</strong> Humanity kaybından gelir. Ağırlık, parça arızalandığında tamirin ne kadar zor olduğunu da belirler.</p>
            <table class="rules">
              <thead><tr><th><span lang="en">Humanity</span> kaybı</th><th>Ağırlık</th><th>Tamir DV'si</th></tr></thead>
              <tbody>
                <tr><td>0–5</td><td>Hafif</td><td>8</td></tr>
                <tr><td>6–10</td><td>Orta</td><td>11</td></tr>
                <tr><td>11–15</td><td>İleri</td><td>14</td></tr>
                <tr><td>16 ve üstü</td><td>Ağır</td><td>17</td></tr>
              </tbody>
            </table>
            <p>Humanity düştükçe karakter insanlardan kopar ve cyberpsychosis krizlerine açık hale gelir. Humanity basamakları ve krizler <a href="#rulebook/temel-mekanik">Kural Kitabı › Temel Kurallar</a> sayfasında anlatılır.</p>
          `,
          en: `
            <p>Every piece of cyberware has a fixed <strong>Humanity loss</strong>. The Humanity losses of all installed cyberware are added together and taken off maximum Humanity. Once a piece is removed, its loss no longer counts against maximum Humanity.</p>
            <div class="formula">Maximum Humanity = EMP × 10 − Humanity losses of installed cyberware</div>
            <p>A piece of cyberware's <strong>weight</strong> comes from its Humanity loss. Weight also sets how hard the piece is to repair when it malfunctions.</p>
            <table class="rules">
              <thead><tr><th>Humanity loss</th><th>Weight</th><th>Repair DV</th></tr></thead>
              <tbody>
                <tr><td>0–5</td><td>Light</td><td>8</td></tr>
                <tr><td>6–10</td><td>Medium</td><td>11</td></tr>
                <tr><td>11–15</td><td>Advanced</td><td>14</td></tr>
                <tr><td>16 and up</td><td>Heavy</td><td>17</td></tr>
              </tbody>
            </table>
            <p>As Humanity drops, a character drifts away from people and becomes open to cyberpsychosis crises. Humanity tiers and crises are covered on the <a href="#rulebook/temel-mekanik">Rulebook › Core Rules</a> page.</p>
          `,
        },
      },
      {
        id: "etkinlestirme",
        label: { tr: "Etkinleştirme", en: "Activation" },
        body: {
          tr: `
            <p>Bir parçanın nasıl çalıştırıldığı, listedeki kartında bir etiketle gösterilir:</p>
            <ul>
              <li><strong>Otomatik:</strong> Parçanın metnindeki koşul gerçekleşince kendiliğinden devreye girer.</li>
              <li><strong>Aksiyon:</strong> Çalıştırmak için aksiyon harcanır.</li>
              <li><strong>Bonus Aksiyon:</strong> Çalıştırmak için bonus aksiyon harcanır.</li>
              <li><strong>Tur İçi Reaction:</strong> Kullanıcının kendi turunda, Reaction harcanarak kullanılır.</li>
              <li><strong>Tur Dışı Reaction:</strong> Başkalarının turlarında, Reaction harcanarak kullanılır.</li>
            </ul>
            <p>Bu etiketlerden hiçbirini taşımayan parçalar ya pasiftir ve takılı oldukları sürece çalışır ya da silah kromları gibi sıradan bir silah olarak kullanılır.</p>
          `,
          en: `
            <p>How a piece is switched on is shown by a tag on its card in the list:</p>
            <ul>
              <li><strong>Automatic:</strong> It kicks in on its own when the condition in its text is met.</li>
              <li><strong>Action:</strong> Switching it on takes an action.</li>
              <li><strong>Bonus Action:</strong> Switching it on takes a bonus action.</li>
              <li><strong>On-Turn Reaction:</strong> It is used on the user's own turn by spending a Reaction.</li>
              <li><strong>Off-Turn Reaction:</strong> It is used on other characters' turns by spending a Reaction.</li>
            </ul>
            <p>Pieces with none of these tags are either passive, working for as long as they're installed, or, like weapon chrome, used as an ordinary weapon.</p>
          `,
        },
      },
      {
        id: "baslangic-cyberware",
        label: { tr: "Başlangıç Cyberware'i", en: "Starting Cyberware" },
        body: {
          tr: `
            <p>Karakter oluşturulurken cyberware için <strong>3 puan</strong> verilir. Bu puanlar listede <strong>Başlangıç</strong> etiketi taşıyan parçalara harcanır; her parça 1 puan tutar. Puanların 2'si istenirse <strong>1 feat puanına</strong> çevrilebilir.</p>
          `,
          en: `
            <p>During character creation, a character gets <strong>3 points</strong> for cyberware. They're spent on pieces tagged <strong>Starting</strong> in the list, and each piece costs 1 point. If the player likes, 2 of the points can be converted into <strong>1 feat point</strong>.</p>
          `,
        },
      },
      {
        id: "cyberware-listesi",
        label: { tr: "Cyberware Listesi", en: "Cyberware List" },
        tool: "cyberware-table",
      },
    ],
  },

  "lore/korporasyonlar": {
    intro: {
      tr: `
        <blockquote class="ct-quote"><p>“Kızım Biotechnica'da çalışıyor. Dört yıl oldu, yüzünü en son yılbaşında gördüm, o da ekrandan. Şirketin yurdunda yatıyor, şirketin yemeğini yiyor, şirketin doktoruna gidiyor. Geçen sene terfi aldı, kutladık, sevindim tabii. Sonra bir baktım, sözleşmesinde çocuk yapmadan önce şirketten izin alması gerektiği yazıyor. Bir şey demedim.”</p><cite>- Elias Varga</cite></blockquote>
        <p>Dünyayı artık devletler değil, şirketler yönetir. Bunlar kendi orduları olan, kendi yasalarını koyan ve bir şehri satın alabilecek kadar zengin devlerdir. Night City'de kuleleri şehrin her köşesinden görünür.</p>
      `,
      en: `
        <blockquote class="ct-quote"><p>“My daughter works for Biotechnica. Four years now, and the last time I saw her face was New Year's, on a screen. She sleeps in the company dorm, eats the company food, sees the company doctor. Got a promotion last year, we celebrated, I was glad, sure. Then I looked, and her contract says she has to get the company's permission before having a kid. I didn't say anything.”</p><cite>- Elias Varga</cite></blockquote>
        <p>The world isn't run by states anymore; it's run by corporations: giants with their own armies and their own laws, rich enough to buy a city. In Night City, their towers can be seen from every corner.</p>
      `,
    },
    sections: [
      {
        id: "sirketler-ve-sehir",
        label: { tr: "Şirketler ve Şehir", en: "Corporations and the City" },
        body: {
          tr: `
            <p>Büyük şirketler hiçbir devlete hesap vermez. Kuleleri, kampüsleri ve otelleri adeta yabancı topraktır: içeride NCPD değil, şirket güvenliği kural koyar. Night City'nin bağımsızlığından en kârlı çıkan da onlar oldu: 2070'ten beri şehir NUSA'nın yasalarına bağlı değildir ve şirketler burada diledikleri gibi iş yapar.</p>
            <p>Şirketler birbirleriyle de savaşır. Bazen bu savaş yönetim kurulu odalarında ve borsada, bazen de sokakta, kiralık edgerunner'ların elinde yürür. Night City'deki işlerin büyük kısmı da buradan doğar: bir şirket, rakibine karşı adı hiçbir kayıtta geçmeyecek bir ekip tutar.</p>
          `,
          en: `
            <p>The big corporations answer to no state. Their towers, campuses and hotels are practically foreign soil: inside, corporate security makes the rules, not the NCPD. Nobody gained more from Night City's independence than the corporations: since 2070 the city hasn't been bound by NUSA law, and corporations do business here however they like.</p>
            <p>Corporations also fight each other. Sometimes that war is fought in boardrooms and on the stock market, sometimes on the street, by hired edgerunners. Much of the work in Night City comes from exactly this: a corporation hires a crew against a rival, a crew whose name will never show up on any record.</p>
          `,
        },
      },
      {
        id: "sirket-hayati",
        label: { tr: "Şirket Hayatı", en: "Corpo Life" },
        body: {
          tr: `
            <p>Bir şirkette çalışmak yalnızca maaş demek değildir: ev, okul, sağlık güvencesi ve Trauma Team aboneliği de işle birlikte gelir. Karşılığında şirket, çalışanının hayatının her köşesine karışır; bazı sözleşmeler onlarca yıllık sadakat ister.</p>
            <p>İşini kaybeden her şeyini kaybeder: evini, sigortasını, bir gün kanlar içinde yattığında gelecek ambulansı. Sokakta <strong><span lang="en">corpo</span></strong> kelimesi bu yüzden hem kıskançlıkla hem de küçümsemeyle söylenir.</p>
          `,
          en: `
            <p>Working for a corporation isn't just a paycheck: housing, schooling, medical coverage and a Trauma Team plan come with the job. In return, the company gets into every corner of your life; some contracts demand decades of loyalty.</p>
            <p>Lose the job and you lose everything: the apartment, the insurance, the ambulance that would come the day you're lying in your own blood. That's why, on the street, the word <strong>corpo</strong> is said with envy and contempt at once.</p>
          `,
        },
      },
      {
        id: "sirket-listesi",
        label: { tr: "Şirket Listesi", en: "Corporation List" },
        tool: "corp-table",
      },
    ],
  },

  "lore/night-city": {
    intro: {
      tr: `
        <blockquote class="ct-quote"><p>“Babam bu şehre doksanların sonunda gelmiş, o zamanlar daha Coronado City diyorlarmış. İki yıl kalır, para biriktirir giderim demiş. Elli yıl kaldı, mezarı bile yok, Columbarium'da bir çekmecede duruyor. Ben de gideceğim gideceğim diye altmışıma geldim. Geçen ay otobüs durağında bir adamı soydular, kolunu söküp götürdüler. Tam tepesinde de 'Night City: hayallerin şehri' yazan bir reklam vardı. Reklam hâlâ orada.”</p><cite>- Elias Varga</cite></blockquote>
        <p>Night City, Kuzey Kaliforniya kıyısında, Del Coronado Körfezi'nde kurulmuş bir megakenttir. Yaklaşık yedi milyon insan burada, şirketlerin kuleleriyle çetelerin sokakları arasına sıkışmış halde yaşar. Kimine göre dünyanın en tehlikeli şehridir, kimine göre adını duyurmanın tek yolu.</p>
        <div class="dossier">
          <div><b>Konum</b><span>Del Coronado Körfezi, Kaliforniya</span></div>
          <div><b>Kuruluş</b><span>1994, Coronado City adıyla</span></div>
          <div><b>Durum</b><span>Bağımsız özgür şehir</span></div>
          <div><b>Yönetim</b><span>Belediye başkanı ve meclis</span></div>
          <div><b>Nüfus</b><span>Yaklaşık 7 milyon</span></div>
        </div>
      `,
      en: `
        <blockquote class="ct-quote"><p>“My father came to this city in the late nineties, back when they still called it Coronado City. Said he'd stay two years, save some money and leave. He stayed fifty, and he doesn't even have a grave, he's in a drawer at the Columbarium. Me, I kept saying I'd leave until I hit sixty. Last month they robbed a man at a bus stop, tore his arm off and took it. Right above him there was an ad, 'Night City: City of Dreams.' The ad's still there.”</p><cite>- Elias Varga</cite></blockquote>
        <p>Night City is a megacity on Del Coronado Bay, on the coast of Northern California. Around seven million people live here, squeezed between the corporations' towers and the gangs' streets. To some it's the most dangerous city in the world; to others, the only chance to make a name.</p>
        <div class="dossier">
          <div><b>Location</b><span>Del Coronado Bay, California</span></div>
          <div><b>Founded</b><span>1994, as Coronado City</span></div>
          <div><b>Status</b><span>Independent free city</span></div>
          <div><b>Government</b><span>Mayor and council</span></div>
          <div><b>Population</b><span>About 7 million</span></div>
        </div>
      `,
    },
    sections: [
      {
        id: "ozgur-sehir",
        label: { tr: "Özgür Şehir", en: "A Free City" },
        body: {
          tr: `
            <p>Night City hiçbir devlete bağlı değildir. 2069'da Yeni Amerika Birleşik Devletleri (NUSA), kendinden kopan Özgür Eyaletleri geri almak için savaş açtı. NUSA ordusu şehre yaklaşınca şehir meclisi Arasaka'dan yardım istedi; Arasaka'nın uçak gemisi körfeze girdi ve NUSA geri çekildi.</p>
            <p>Savaşı bitiren Birleşme Antlaşması'yla Night City, ne Kuzey Kaliforniya'ya ne de NUSA'ya bağlı, bağımsız bir özgür şehir oldu. Bedeli de belliydi: yıllar önce ülkeden kovulan Arasaka geri döndü, şehir meclisinde bir koltuk aldı ve kulesini eskisinin yerinde yeniden kurdu. NUSA bu düzeni hiçbir zaman kabullenmedi.</p>
          `,
          en: `
            <p>Night City belongs to no state. In 2069 the New United States of America (NUSA) went to war to take back the Free States that had broken away from it. As the NUSA army closed in on the city, the city council asked Arasaka for help; an Arasaka supercarrier sailed into the bay and the NUSA pulled back.</p>
            <p>The Treaty of Unification ended the war and made Night City an independent free city, part of neither Northern California nor the NUSA. The price was clear: Arasaka, thrown out of the country years before, came back, took a seat on the city council and rebuilt its tower on the site of the old one. The NUSA has never accepted this arrangement.</p>
          `,
        },
      },
      {
        id: "yonetim",
        label: { tr: "Yönetim", en: "Government" },
        body: {
          tr: `
            <p>Şehri bir belediye başkanı ve şehir meclisi yönetir. Bağımsızlıktan beri görevde olan başkan, kimine göre bağımsızlığın kahramanı, kimine göre şehrin en büyük dolandırıcısıdır; hakkındaki rüşvet iddiaları hiç eksik olmaz. Meclisteki koltukların çoğunun arkasında büyük şirketler vardır. Belediye binası Heywood'daki The Glen'dedir.</p>
            <p>Şehrin yollarını, köprülerini, metrosunu, elektriğini ve suyunu Night Corp işletir. Şirket, şehrin kurucusu Richard Night'ın mirasından doğdu; şehrin toplu taşıma sistemi NCART da 2068'den beri onundur. Night Corp'un gerçekte ne kadar büyük olduğunu kimse bilmez.</p>
          `,
          en: `
            <p>The city is run by a mayor and a city council. The mayor who has held office since independence is, to some, the hero of independence and, to others, the city's biggest crook. Bribery accusations follow him everywhere. Most council seats have big corporations behind them. City Hall is in The Glen, in Heywood.</p>
            <p>Night Corp runs the city's roads, bridges, metro, power and water. The company grew out of the legacy of the city's founder, Richard Night, and has owned NCART, the city's transit system, since 2068. Nobody knows how big Night Corp really is.</p>
          `,
        },
      },
      {
        id: "sehirde-hayat",
        label: { tr: "Şehirde Hayat", en: "Life in the City" },
        body: {
          tr: `
            <p>Night City'de zenginle yoksul arasındaki mesafe birkaç sokaktır. Şirket yöneticileri City Center'ın korunaklı kulelerinde ve North Oak'ın villalarında yaşar; geri kalanların çoğu, on binlerce küçük dairenin üst üste yığıldığı dev megabinalara sıkışır.</p>
            <p>Şehrin havası kirlidir: üstünde sürekli bir duman tabakası asılı durur, yağmur hafif asitlidir ve ara sıra tehlikeli asit fırtınaları çıkar. Temiz havayı zenginler oksijen barlarında satın alır. Şehri çevreleyen topraklar kuraklıkla çöle dönmüştür; bu topraklara Badlands denir. Yer darlığı yüzünden toprağa gömülmek 2040'lardan beri yasaktır; ölüler Columbarium'da saklanır.</p>
          `,
          en: `
            <p>In Night City, the distance between rich and poor is a few streets. Corporate executives live in City Center's guarded towers and North Oak's villas; most everyone else is crammed into giant megabuildings, tens of thousands of tiny apartments stacked on top of each other.</p>
            <p>The air is filthy: a layer of smog hangs over the city, the rain is slightly acidic, and every so often a dangerous acid storm rolls in. The rich buy clean air at oxygen bars. The land around the city has been turned to desert by drought; that land is called the Badlands. Space is so tight that burial in the ground has been banned since the 2040s; the dead are kept in the Columbarium.</p>
          `,
        },
      },
      {
        id: "duzenin-bekcileri",
        label: { tr: "Düzenin Bekçileri", en: "Keepers of Order" },
        body: {
          tr: `
            <p><strong><span lang="en">NCPD</span>:</strong> Night City'nin polis teşkilatı. Bütçesi de kadrosu da yetersizdir, şirketlerin etkisi altındadır ve içinde rüşvet yaygındır. Zengin semtlerde ve şirket bölgelerinde güçlüdür, ama bazı bölgeleri tamamen çetelere bırakmıştır. Aranan suçluların başına ödül koyar; bu ödülleri çoğu zaman serbest çalışan edgerunner'lar toplar.</p>
            <p><strong><span lang="en">MaxTac</span>:</strong> NCPD'nin cyberpsycho'larla uğraşan özel birimi; ağır silahlı ve kromla dolu memurlardan oluşur. Bir cyberpsycho'yu yakalamaktan çok öldürmeye gelirler.</p>
            <p><strong><span lang="en">Trauma Team</span>:</strong> Silahlı, özel bir acil sağlık şirketi. Yalnızca abonelerini kurtarır; abone olmayan biri yanı başında ölse bile dönüp bakmaz. Aboneliğin seviyesi ne kadar yüksekse ekip o kadar hızlı gelir. Ekibin işine karışan herkes düşman sayılır.</p>
            <p><strong><span lang="en">NetWatch</span>:</strong> Net'in polisi. Eski Net'i ve içindeki kötücül yapay zekâları Blackwall denen bir duvarın ardına kapatan onlardır. O duvarı aşmaya çalışan ya ölür ya da NetWatch'ın eline düşer.</p>
          `,
          en: `
            <p><strong>NCPD:</strong> Night City's police force. It's short on money and short on people, it's under the corporations' influence, and bribery is everywhere. It's strong in rich and corporate areas, but it has left some districts entirely to the gangs. It puts bounties on wanted criminals, and freelance edgerunners often collect them.</p>
            <p><strong>MaxTac:</strong> The NCPD's special unit for cyberpsychos, made up of heavily armed, heavily chromed officers. They come to kill a cyberpsycho far more often than to capture one.</p>
            <p><strong>Trauma Team:</strong> An armed private emergency medical company. It saves only its subscribers; if someone who isn't a client is dying right next to them, they won't even look. The higher the subscription tier, the faster the team arrives. Anyone who gets in the team's way is treated as hostile.</p>
            <p><strong>NetWatch:</strong> The Net police. They're the ones who sealed the old Net and its rogue AIs behind a wall called the Blackwall. Anyone who tries to cross it either dies or ends up in NetWatch's hands.</p>
          `,
        },
      },
      {
        id: "bolgeler",
        label: { tr: "Bölgeler", en: "Districts" },
        tool: "district-table",
      },
    ],
  },

  "lore/zaman-cizelgesi": {
    intro: {
      tr: `
        <blockquote class="ct-quote"><p>“Tarih mi? Ben sana tarihi anlatayım evlat. Yirmi üçte daha çocuktum, annem beni mutfak masasının altına soktu, camlar içeri patladı. Ondan sonraki yirmi yıl gökyüzü kırmızıydı, gerçekten kırmızı, kimse bunu uydurmuyor. Sonra Arasaka gitti, sonra geri geldi, şimdi kulesi eskisinin yerinde duruyor. Herkes unuttu. Ben unutmadım, o masa hâlâ bizim evde.”</p><cite>- Elias Varga</cite></blockquote>
        <p>Night City'nin bugününü anlamak için dününü bilmek gerekir. Bu sayfa, Amerika'nın çöktüğü 1990'lardan bugüne, yani 2076'ya kadar yaşanan önemli olayları sıralar.</p>
      `,
      en: `
        <blockquote class="ct-quote"><p>“History? Let me tell you about history, kid. In twenty-three I was just a boy, my mother shoved me under the kitchen table and the windows blew in. For twenty years after that the sky was red, really red, nobody's making that up. Then Arasaka left, then it came back, and now its tower stands right where the old one did. Everybody forgot. I didn't, that table's still in our house.”</p><cite>- Elias Varga</cite></blockquote>
        <p>To understand Night City today, you need to know yesterday. This page covers the key events from the 1990s, when America collapsed, up to today, 2076.</p>
      `,
    },
    sections: [
      {
        id: "cokus",
        label: { tr: "Çöküş", en: "The Collapse" },
        body: {
          tr: `
            <p>1990'lar, Amerika'nın dağıldığı ve dünyanın yeni bir düzene geçtiği yıllardır.</p>
            <ul class="timeline">
              <li><span class="year">1990'lar</span><div class="event"><strong>Gang of Four.</strong> NSA, CIA, FBI ve DEA'dan oluşan dörtlü, ABD hükümetini perde arkasından ele geçirir. Washington'u dinlemeyen eyaletler kendilerini Özgür Eyalet ilan etmeye başlar.</div></li>
              <li><span class="year">1992</span><div class="event"><strong>Avrupa yükselir.</strong> Avrupa ortak pazarı kurulur ve ortak para birimi eurodolar doğar. Avrupa ve Japonya ekonomik süper güce dönüşürken ABD geriler.</div></li>
              <li><span class="year">1994</span><div class="event"><strong>Borsa çöker.</strong> ABD'nin piyasaları gizlice yönlendirdiği ortaya çıkınca dünya borsaları birbiri ardına düşer.</div></li>
              <li><span class="year">1996</span><div class="event"><strong>Çöküş.</strong> Yerel yönetimler iflas eder, anayasa askıya alınır, sıkıyönetim ilan edilir. Evini kaybeden milyonlarca Amerikalı yollara düşer; nomad'lar bu insanlardan doğar.</div></li>
              <li><span class="year">1997</span><div class="event"><strong>Mideast Meltdown.</strong> Orta Doğu'da "sınırlı" bir nükleer savaş çıkar ve bölgenin büyük kısmı yaşanmaz hale gelir. Dünyanın petrol arzı yarıya iner.</div></li>
            </ul>
          `,
          en: `
            <p>The 1990s are the years America fell apart and the world moved into a new order.</p>
            <ul class="timeline">
              <li><span class="year">1990s</span><div class="event"><strong>The Gang of Four.</strong> A quartet made up of the NSA, CIA, FBI and DEA takes over the US government from behind the scenes. States that stop obeying Washington begin declaring themselves Free States.</div></li>
              <li><span class="year">1992</span><div class="event"><strong>Europe rises.</strong> The European common market is founded, and with it a common currency, the eurodollar. Europe and Japan become economic superpowers while the US declines.</div></li>
              <li><span class="year">1994</span><div class="event"><strong>The market crashes.</strong> When it comes out that the US had been secretly manipulating the markets, the world's stock markets collapse.</div></li>
              <li><span class="year">1996</span><div class="event"><strong>The Collapse.</strong> Local governments go bankrupt, the Constitution is suspended and martial law is declared. Millions of Americans who lost their homes take to the roads; the nomads are born from them.</div></li>
              <li><span class="year">1997</span><div class="event"><strong>The Mideast Meltdown.</strong> A "limited" nuclear war breaks out in the Middle East and most of the region becomes unlivable. The world's oil supply is cut in half.</div></li>
            </ul>
          `,
        },
      },
      {
        id: "kurulus",
        label: { tr: "Şehrin Doğuşu ve İlk Şirket Savaşları", en: "The City's Birth and the First Corporate Wars" },
        body: {
          tr: `
            <p>Çöküşün ortasında, kıyıda yeni bir şehir yükselir; dünyayı ise artık şirketler arasındaki savaşlar şekillendirir.</p>
            <ul class="timeline">
              <li><span class="year">1994</span><div class="event"><strong>Coronado City kurulur.</strong> Richard Night'ın hayalindeki şehir, Arasaka, EBM ve Petrochem'in parasıyla Del Coronado Körfezi'nde yükselmeye başlar.</div></li>
              <li><span class="year">1998</span><div class="event"><strong>Richard Night öldürülür.</strong> Kurucusunun öldürülmesinin ardından şehrin adı Night City olur. Katil hiç bulunmaz; şehri organize suç ele geçirir.</div></li>
              <li><span class="year">2004</span><div class="event"><strong>Birinci Şirket Savaşı.</strong> EBM ile Orbital Air, bir havayolu şirketinin satın alınması yüzünden karşı karşıya gelir. Savaş çoğunlukla baskınlarla ve Net saldırılarıyla yürür.</div></li>
              <li><span class="year">2008</span><div class="event"><strong>İkinci Şirket Savaşı.</strong> SovOil ile Petrochem, Güney Çin Denizi'ndeki petrol sahaları için savaşır.</div></li>
              <li><span class="year">2009–2011</span><div class="event"><strong>Mafya Savaşı.</strong> Başını Arasaka'nın güçlerinin çektiği şirketler, mafyayı Night City'den temizler. Şehri artık şirketlerin elindeki bir meclis yönetir.</div></li>
              <li><span class="year">2016</span><div class="event"><strong>Üçüncü Şirket Savaşı.</strong> Kısa ve büyük kısmı Net'te geçen bir savaş: kimliği belirsiz saldırganlar dünyanın her yerindeki şirket ağlarını vurur.</div></li>
            </ul>
          `,
          en: `
            <p>In the middle of the Collapse a new city rises on the coast, while wars between corporations start to shape the world.</p>
            <ul class="timeline">
              <li><span class="year">1994</span><div class="event"><strong>Coronado City is founded.</strong> Richard Night's dream city is built on Del Coronado Bay with money from Arasaka, EBM and Petrochem.</div></li>
              <li><span class="year">1998</span><div class="event"><strong>Richard Night is murdered.</strong> After the founder's assassination, the city is renamed Night City. The killer is never found, and organized crime takes over the city.</div></li>
              <li><span class="year">2004</span><div class="event"><strong>The First Corporate War.</strong> EBM and Orbital Air go to war over the purchase of an airline. Most of it is fought with raids and Net attacks.</div></li>
              <li><span class="year">2008</span><div class="event"><strong>The Second Corporate War.</strong> SovOil and Petrochem fight over oil fields in the South China Sea.</div></li>
              <li><span class="year">2009–2011</span><div class="event"><strong>The Mob War.</strong> The corporations, led by Arasaka's forces, clean the mob out of Night City. From then on, the city is run by a council in the corporations' pocket.</div></li>
              <li><span class="year">2016</span><div class="event"><strong>The Third Corporate War.</strong> A short war fought mostly in the Net: unknown attackers hit corporate networks all over the world.</div></li>
            </ul>
          `,
        },
      },
      {
        id: "dorduncu-savas",
        label: { tr: "Dördüncü Şirket Savaşı", en: "The Fourth Corporate War" },
        body: {
          tr: `
            <p>Arasaka ile Militech'in savaşı, Night City'nin kalbinde bir nükleer bombayla son bulur.</p>
            <ul class="timeline">
              <li><span class="year">2021</span><div class="event"><strong>Vekâlet savaşı.</strong> İki deniz teknolojisi şirketi, iflas eden üçüncü bir şirket için kavgaya tutuşur. Biri Militech'i, diğeri Arasaka'yı tutar.</div></li>
              <li><span class="year">2022</span><div class="event"><strong>Açık savaş ve DataKrash.</strong> Gizli çatışma, Arasaka ile Militech arasında dünya çapında bir savaşa döner. Efsanevi bir netrunner bir baskında öldürülür; ölümünden iki hafta sonra bıraktığı virüsler serbest kalır ve Net'in büyük kısmını çökertir.</div></li>
              <li><span class="year">2023</span><div class="event"><strong>Arasaka Kulesi.</strong> 20 Ağustos'ta bir edgerunner ekibi Night City'deki Arasaka Kulesi'ne baskın yapar. Bir nükleer bomba patlar; şehir merkezi yerle bir olur, yüz binlerce insan ölür.</div></li>
              <li><span class="year">2023</span><div class="event"><strong>Arasaka kovulur.</strong> ABD hükümeti Militech'i devletleştirir; Arasaka ülkeden kovulur. Savaş kısa sürede biter, ama yaraları yıllarca kapanmaz.</div></li>
              <li><span class="year">2025</span><div class="event"><strong>Net çöker.</strong> Kötücül yapay zekâlar ve o netrunner'ın virüsleri eski küresel Net'i kullanılmaz hale getirir. Bundan sonra Net, birbirinden kopuk yerel ağlardan ibarettir.</div></li>
            </ul>
          `,
          en: `
            <p>The war between Arasaka and Militech ends with a nuclear bomb in the heart of Night City.</p>
            <ul class="timeline">
              <li><span class="year">2021</span><div class="event"><strong>A proxy war.</strong> Two ocean-tech corporations fight over a third, bankrupt one. One hires Militech, the other hires Arasaka.</div></li>
              <li><span class="year">2022</span><div class="event"><strong>Open war and the DataKrash.</strong> The covert fighting turns into a worldwide war between Arasaka and Militech. A legendary netrunner is killed in a raid; two weeks after his death, the viruses he left behind are released and bring down most of the Net.</div></li>
              <li><span class="year">2023</span><div class="event"><strong>Arasaka Tower.</strong> On August 20th, a crew of edgerunners raids Arasaka Tower in Night City. A nuclear bomb goes off; the city center is flattened and hundreds of thousands die.</div></li>
              <li><span class="year">2023</span><div class="event"><strong>Arasaka is thrown out.</strong> The US government nationalizes Militech, and Arasaka is expelled from the country. The war ends soon after, but its wounds take years to heal.</div></li>
              <li><span class="year">2025</span><div class="event"><strong>The Net collapses.</strong> Rogue AIs and that netrunner's viruses make the old global Net unusable. From now on, the Net is just a set of separate local networks.</div></li>
            </ul>
          `,
        },
      },
      {
        id: "kizil-donem",
        label: { tr: "Kızıl Dönem", en: "The Time of the Red" },
        body: {
          tr: `
            <p>Savaştan sonraki yirmi yıl boyunca nükleer serpinti, yangınlar ve yörüngeden atılan kayalar gökyüzünü kızıla boyar. Dünya kendini yavaş yavaş yeniden kurar.</p>
            <ul class="timeline">
              <li><span class="year">2020'lerin sonu</span><div class="event"><strong>Geri dönüş.</strong> Mülteciler ve nomad'lar terk edilmiş şehirlere geri döner. Night City yıkıntıların içinden yeniden ayağa kalkmaya başlar.</div></li>
              <li><span class="year">2028</span><div class="event"><strong>Yeni şehir.</strong> Night City yeni bir anayasayla bölgelere ayrılır. Ertesi yıl, cyberpsychosis'le savaşmak için MaxTac yeniden kurulur.</div></li>
              <li><span class="year">2030'lar</span><div class="event"><strong>Yeniden inşa.</strong> Banliyöler yeniden yerleşime açılır, yıkıntılar eski körfezi doldurmak için kullanılır. İlk yerel Net'ler kurulur.</div></li>
              <li><span class="year">2030'lar</span><div class="event"><strong>Blackwall.</strong> NetWatch eski Net'i temizlemeye çalışır, başaramayınca onu bir duvarın ardına kapatır. Kötücül yapay zekâlar o duvarın, Blackwall'un ötesinde kalır.</div></li>
              <li><span class="year">2040</span><div class="event"><strong>Megabinalar.</strong> Night Corp şehrin her yerine dev yaşam blokları kurmayı önerir. İlk megabina yükselir.</div></li>
              <li><span class="year">2040'ların sonu</span><div class="event"><strong>Gökyüzü açılır.</strong> Kızıl Dönem kesin bir olayla değil, gökyüzü temizlendikçe ve şehirler toparlandıkça yavaş yavaş sona erer.</div></li>
            </ul>
          `,
          en: `
            <p>For twenty years after the war, nuclear fallout, fires and rocks dropped from orbit paint the sky red. Slowly, the world rebuilds.</p>
            <ul class="timeline">
              <li><span class="year">Late 2020s</span><div class="event"><strong>The return.</strong> Refugees and nomads move back into abandoned cities. Night City starts rising out of its ruins.</div></li>
              <li><span class="year">2028</span><div class="event"><strong>A new city.</strong> Night City is reorganized into districts under a new charter. The following year, MaxTac is founded again to fight cyberpsychosis.</div></li>
              <li><span class="year">2030s</span><div class="event"><strong>Rebuilding.</strong> The suburbs are resettled, and rubble is used to fill in the old bay. The first local Nets go online.</div></li>
              <li><span class="year">2030s</span><div class="event"><strong>The Blackwall.</strong> NetWatch tries to clean up the old Net and, when it fails, seals it off behind a wall. The rogue AIs stay on the other side of that wall: the Blackwall.</div></li>
              <li><span class="year">2040</span><div class="event"><strong>Megabuildings.</strong> Night Corp proposes giant housing blocks across the city. The first megabuilding goes up.</div></li>
              <li><span class="year">Late 2040s</span><div class="event"><strong>The sky clears.</strong> The Time of the Red doesn't end with a single event; it fades as the skies clear and the cities recover.</div></li>
            </ul>
          `,
        },
      },
      {
        id: "sirketlerin-donusu",
        label: { tr: "Şirketlerin Dönüşü", en: "The Corporate Comeback" },
        body: {
          tr: `
            <p>Şehir büyür, para geri gelir; yeni mahalleler doğar, eskileri silinir.</p>
            <ul class="timeline">
              <li><span class="year">2050'ler</span><div class="event"><strong>Şehir değişir.</strong> Watson'daki Çinli topluluk büyüyüp Little China'yı oluşturur. North Oak'taki gecekondular zenginlerin villalarına yer açmak için yıkılır.</div></li>
              <li><span class="year">2060'ların başı</span><div class="event"><strong>Pacifica.</strong> Pacifica'da lüks bir tatil cenneti inşa edilmeye başlanır. Fırtınalarla sular altında kalan Haiti'den kaçan göçmenler, inşaatta çalışmak için bölgeye yerleşir.</div></li>
              <li><span class="year">2067</span><div class="event"><strong>Mox kurulur.</strong> Tyger Claws'ın Kabuki'de bir kulüp sahibini öldürmesinin ardından şehre isyanlar yayılır; Mox bu öfkeden doğar.</div></li>
              <li><span class="year">2068</span><div class="event"><strong>Night Corp ve NCART.</strong> Night Corp şehrin toplu taşıma sistemi NCART'ı satın alır.</div></li>
            </ul>
          `,
          en: `
            <p>The city grows and the money comes back; new neighborhoods are born and old ones are erased.</p>
            <ul class="timeline">
              <li><span class="year">2050s</span><div class="event"><strong>The city changes.</strong> Watson's Chinese community grows into Little China. North Oak's shantytowns are torn down to make room for rich people's villas.</div></li>
              <li><span class="year">Early 2060s</span><div class="event"><strong>Pacifica.</strong> Construction of a luxury resort begins in Pacifica. Migrants fleeing storm-flooded Haiti settle in the district to work on the construction.</div></li>
              <li><span class="year">2067</span><div class="event"><strong>The Mox are born.</strong> After the Tyger Claws kill a club owner in Kabuki, riots spread across the city; the Mox are born from that anger.</div></li>
              <li><span class="year">2068</span><div class="event"><strong>Night Corp and NCART.</strong> Night Corp buys NCART, the city's transit system.</div></li>
            </ul>
          `,
        },
      },
      {
        id: "birlesme-savasi",
        label: { tr: "Birleşme Savaşı", en: "The Unification War" },
        body: {
          tr: `
            <p>Yeni Amerika, kopan eyaletleri geri almak ister. Night City bağımsızlığını Arasaka sayesinde kazanır ve bunun bedelini öder.</p>
            <ul class="timeline">
              <li><span class="year">2069</span><div class="event"><strong>Savaş başlar.</strong> Yeni Amerika Birleşik Devletleri (NUSA), Özgür Eyaletleri yeniden federal yönetime bağlamak ister. Çoğu reddedince NUSA ordusu ve Militech saldırır. Savaş korkusuyla Pacifica'nın yatırımcıları kaçar.</div></li>
              <li><span class="year">2070</span><div class="event"><strong>Arasaka gelir.</strong> NUSA birlikleri Night City'ye yaklaşınca şehir meclisi Arasaka'dan yardım ister. Bir Arasaka uçak gemisi körfeze girer ve NUSA geri çekilir.</div></li>
              <li><span class="year">2070</span><div class="event"><strong>Özgür şehir.</strong> Savaşı bitiren Birleşme Antlaşması'yla Night City bağımsız bir özgür şehir olur. Arasaka'nın ülkedeki yasağı kalkar; şirket şehre döner ve kulesini eskisinin yerinde yeniden kurmaya başlar.</div></li>
              <li><span class="year">2070</span><div class="event"><strong>Dogtown.</strong> Bir askerî birlik savaş bitince silah bırakmaz; Pacifica'nın bir parçasını ele geçirip duvarlarla çevirir. Bu bölgeye Dogtown, orayı tutan milis gücüne de Barghest denir.</div></li>
            </ul>
          `,
          en: `
            <p>The new America wants its breakaway states back. Night City wins its independence thanks to Arasaka, and pays the price.</p>
            <ul class="timeline">
              <li><span class="year">2069</span><div class="event"><strong>The war begins.</strong> The New United States of America (NUSA) wants to bring the Free States back under federal rule. When most refuse, the NUSA army and Militech attack. Afraid of the war, Pacifica's investors flee.</div></li>
              <li><span class="year">2070</span><div class="event"><strong>Arasaka arrives.</strong> As NUSA troops close in on Night City, the city council asks Arasaka for help. An Arasaka supercarrier sails into the bay, and the NUSA pulls back.</div></li>
              <li><span class="year">2070</span><div class="event"><strong>A free city.</strong> The Treaty of Unification ends the war and makes Night City an independent free city. Arasaka's ban from the country is lifted; the corporation returns to the city and begins rebuilding its tower on the site of the old one.</div></li>
              <li><span class="year">2070</span><div class="event"><strong>Dogtown.</strong> A military unit refuses to lay down its arms when the war ends; it seizes a piece of Pacifica and walls it off. The district is called Dogtown, and the militia, the Barghest.</div></li>
            </ul>
          `,
        },
      },
      {
        id: "bugun",
        label: { tr: "Bugün", en: "Today" },
        body: {
          tr: `
            <p>Yıl 2076. Arasaka'nın kulesi yeniden şehrin üstünde yükseliyor, NUSA sınırın öte yanında fırsat kolluyor ve sokakta krom hiç bu kadar ucuz olmamıştı.</p>
            <ul class="timeline">
              <li><span class="year">2072</span><div class="event"><strong>Pacifica terk edilir.</strong> Pacifica'daki polis karakolu kapatılır ve bölge bir Combat Zone ilan edilir.</div></li>
              <li><span class="year">2070'ler</span><div class="event"><strong>Cyberpsychosis.</strong> Kroma bu kadar kolay ulaşılan bir şehirde cyberpsycho vakaları giderek artar. MaxTac'in işi hiç bitmez.</div></li>
              <li><span class="year">Şimdi</span><div class="event"><strong>Night City.</strong> Şirketler kulelerinde, çeteler sokaklarda, edgerunner'lar ikisinin arasında. Hikâye burada başlar.</div></li>
            </ul>
          `,
          en: `
            <p>The year is 2076. Arasaka's tower looms over the city again, the NUSA is biding its time across the border, and chrome on the street has never been cheaper.</p>
            <ul class="timeline">
              <li><span class="year">2072</span><div class="event"><strong>Pacifica is abandoned.</strong> The police precinct in Pacifica is shut down and the district is declared a Combat Zone.</div></li>
              <li><span class="year">2070s</span><div class="event"><strong>Cyberpsychosis.</strong> In a city where chrome is this easy to get, cyberpsycho cases keep rising. MaxTac's work never ends.</div></li>
              <li><span class="year">Now</span><div class="event"><strong>Night City.</strong> The corporations in their towers, the gangs on the streets, the edgerunners in between. This is where the story begins.</div></li>
            </ul>
          `,
        },
      },
    ],
  },

  "lore/edgerunner-hayati": {
    intro: {
      tr: `
        <blockquote class="ct-quote"><p>“Afterlife'a bir kere girdim ben, yetmiş beşte, bir borcu tahsil etmeye. Duvardaki menüde içki adları yazıyor, hepsi ölmüş adamların adı. Barmen kıza sordum, bu listeye nasıl girilir diye. Güldü. Yanımdaki çocuk, yirmisinde yoktu, kolunda yeni krom, gözleri parlıyor, 'bir gün benim adım da orada olacak' dedi. Üç ay sonra adı oradaydı. İçkisini hiç içmedim.”</p><cite>- Elias Varga</cite></blockquote>
        <p>Edgerunner, kuralların dışında yaşayan, para için iş alan, kromla güçlenmiş bir paralı asker ya da sokak profesyonelidir. Bu sayfa bir edgerunner'ın dünyasını anlatır: işin nereden geldiğini, paranın nasıl döndüğünü, kime güvenilip kimden uzak durulacağını.</p>
      `,
      en: `
        <blockquote class="ct-quote"><p>“I went into the Afterlife once, in seventy-five, to collect on a debt. The menu on the wall lists drinks, every one of them named after a dead man. I asked the girl behind the bar how you get on that list. She laughed. The kid next to me, couldn't have been twenty, fresh chrome on his arm, eyes all lit up, said 'one day my name's gonna be up there.' Three months later it was. I never drank it.”</p><cite>- Elias Varga</cite></blockquote>
        <p>An edgerunner is a chromed-up mercenary or street professional who lives outside the rules and takes jobs for money. This page covers an edgerunner's world: where the work comes from, how the money moves, who to trust and who to stay away from.</p>
      `,
    },
    sections: [
      {
        id: "kenarda-yasamak",
        label: { tr: "Kenarda Yaşamak", en: "Living on the Edge" },
        body: {
          tr: `
            <p><span lang="en">Edge</span>, yani kenar, risk alanların ve büyük oynayanların yaşadığı o belirsiz bölgedir: yasanın ve düzenin bittiği çizgi. Edgerunner'ların birkaç yazısız kuralı vardır:</p>
            <ul>
              <li><strong>Tarz özden önemlidir:</strong> Bir işi ne kadar iyi yaptığın değil, yaparken nasıl göründüğün önemlidir.</li>
              <li><strong>Tavır her şeydir:</strong> Tehlikeli düşün, tehlikeli ol.</li>
              <li><strong>Kenarda yaşa:</strong> Riskten kaçan, sokakta adını duyuramaz.</li>
            </ul>
            <p>Sokakta herkesin bir lakabı vardır ve kimse kimsenin gerçek adını sormaz. Bir edgerunner'ın asıl sermayesi ünüdür: adı ne kadar duyulursa o kadar iyi işler gelir, o kadar iyi fixer'lar kapısını çalar. Çoğu edgerunner'ın hayali bir efsane olmaktır; efsanelerin çoğu da genç ölür.</p>
          `,
          en: `
            <p>The Edge is that hazy zone where risk-takers and high rollers live: the edge of the law and of order. Edgerunners have a few unwritten rules:</p>
            <ul>
              <li><strong>Style over substance:</strong> It doesn't matter how well you do something, as long as you look good doing it.</li>
              <li><strong>Attitude is everything:</strong> Think dangerous, be dangerous.</li>
              <li><strong>Live on the Edge:</strong> Anyone who plays it safe never makes a name on the street.</li>
            </ul>
            <p>Everyone on the street has a handle, and nobody asks your real name. An edgerunner's real capital is their reputation: the more people know the name, the better the jobs and the better the fixers who come knocking. Most edgerunners dream of becoming a legend; most legends die young.</p>
          `,
        },
      },
      {
        id: "fixerlar",
        label: { tr: "Fixer'lar ve İşler", en: "Fixers and Gigs" },
        body: {
          tr: `
            <p>Edgerunner'a işi fixer bulur. Fixer, anlaşma yapan, kaçak mal taşıyan, bilgi alıp satan bir aracıdır. Müşteriyle edgerunner arasında durur: işi bulur, ekibi seçer, iki tarafa da kefil olur ve payını alır.</p>
            <p>İş çoğu zaman bir telefonla ya da kısa bir mesajla gelir: bir şeyi çalmak, birini korumak, birini ortadan kaldırmak, bir paketi teslim etmek. Ödeme iş bitince eddies olarak yapılır; temiz ve sessiz bitirilen işe bazen ikramiye eklenir. İşini iyi yapanın ünü artar, ünü artan daha büyük işler alır.</p>
          `,
          en: `
            <p>Fixers find edgerunners their work. A fixer is a dealmaker, smuggler and information broker. They stand between the client and the edgerunner: they find the job, pick the crew, vouch for both sides and take their cut.</p>
            <p>A job usually comes with a call or a short message: steal something, protect someone, make someone disappear, deliver a package. Payment arrives in eddies when the job is done, sometimes with a bonus for a clean, quiet finish. Do the work well and your name grows; grow your name and you get bigger jobs.</p>
          `,
        },
      },
      {
        id: "ripperdoclar",
        label: { tr: "Ripperdoc'lar", en: "Ripperdocs" },
        body: {
          tr: `
            <p>Ripperdoc, krom takan, söken ve yenileyen cerrahtır. Ruhsatlı da olabilir, ruhsatsız da. Şehirde zincir klinikler vardır, ama çoğu edgerunner bir ara sokaktaki arka odaya gider: orada soru sorulmaz, bazen hastayı uyutmaya bile gerek görülmez.</p>
            <p>Krom pahalıdır ve iyisini almak için ün de gerekir. Bir ripperdoc'a borçlu olmak sokakta sıradan bir şeydir. Ucuz kromun bir kısmı Scavenger'ların kurbanlarından sökülmüştür; nereden geldiğini sormamak en iyisidir.</p>
          `,
          en: `
            <p>A ripperdoc is a surgeon who installs, removes and upgrades chrome. They may or may not have a license. The city has chain clinics, but most edgerunners go to a back room off some alley: no questions asked there, and sometimes nobody bothers to put the patient under.</p>
            <p>Chrome is expensive, and the good stuff takes a reputation too. Owing a ripperdoc money is normal on the street. Some of the cheap chrome was pulled out of the Scavengers' victims; better not to ask where it came from.</p>
          `,
        },
      },
      {
        id: "eddies",
        label: { tr: "Eddies", en: "Eddies" },
        body: {
          tr: `
            <p>Night City'nin parası eurodolardır (€$); sokakta herkes ona <strong><span lang="en">eddies</span></strong> der. 1990'larda Avrupa'nın ortak parası olarak doğdu ve sağlamlığı sayesinde dünyanın birçok yerinde resmî para haline geldi. Para dijitaldir ve anında el değiştirir. İşin ücreti, ripperdoc'un faturası, polise verilen rüşvet: hepsi eddies'le ödenir.</p>
          `,
          en: `
            <p>Night City's money is the eurodollar (€$); on the street everyone calls them <strong>eddies</strong>. It was born in the 1990s as Europe's common currency, and its stability made it official money in much of the world. It's digital and changes hands instantly. A job's pay, a ripperdoc's bill, a bribe to a cop: all paid in eddies.</p>
          `,
        },
      },
      {
        id: "afterlife",
        label: { tr: "Afterlife", en: "The Afterlife" },
        body: {
          tr: `
            <p>Afterlife, şehrin paralı askerlerinin barıdır. Watson'da, eski bir morgun içindedir; duvarlarda hâlâ ceset dolaplarının çekmeceleri durur. Afterlife'a girebilmek, sokakta yükselmekte olmanın işaretidir.</p>
            <p>Menüdeki kokteyllerin her biri ölmüş bir efsanenin adını taşır. Listeye girmenin tek yolu ölmektir, mümkünse görkemli bir şekilde.</p>
          `,
          en: `
            <p>The Afterlife is the city's mercenary bar. It's in Watson, inside a former morgue; the body drawers are still in the walls. Getting into the Afterlife is a sign that you're on the rise on the street.</p>
            <p>Every cocktail on the menu is named after a dead legend. The only way onto the list is to die, preferably spectacularly.</p>
          `,
        },
      },
      {
        id: "braindance",
        label: { tr: "Braindance", en: "Braindance" },
        body: {
          tr: `
            <p>Braindance (BD), bir insanın gördüklerinin, duyduklarının ve hissettiklerinin kaydıdır. İzleyen kişi, başına taktığı bir taçla bu kaydı kendi beyninde yaşar; başka birinin anısının içinde dolaşır. BD eğlence, terapi ve askerî eğitim için kullanılır. Kayıtları düzenleyen ustalara BD editörü denir.</p>
            <p>Kara borsada düzenlenmemiş, gerçek şiddet ve ölüm içeren kayıtlar dolaşır; bunlara XBD denir. Bazıları kaydı yapan kişinin ölümüne kadar gider ve izleyeni sarsabilir, hatta öldürebilir. Yoksullar arasında BD bağımlılığı yaygındır: sokakta yatarken başkasının hayatını yaşamak kolaydır.</p>
          `,
          en: `
            <p>A braindance (BD) is a recording of what a person saw, heard and felt. The viewer puts on a wreath and lives the recording inside their own brain, walking around inside someone else's memory. BDs are used for entertainment, therapy and military training. The specialists who edit recordings are called BD editors.</p>
            <p>The black market carries unedited recordings of real violence and death, called XBDs. Some go all the way to the recorder's death and can shake the viewer badly, or even kill them. BD addiction is common among the poor: it's easy to live someone else's life while sleeping in the gutter.</p>
          `,
        },
      },
      {
        id: "siber-psikoz",
        label: { tr: "Cyberpsychosis", en: "Cyberpsychosis" },
        body: {
          tr: `
            <p>Fazla krom ağır bir zihinsel yükle birleşince insan kopabilir: çevresine düşman olan, kimseyi tanımayan bir cyberpsycho'ya dönüşür. Kimin ne kadar kroma dayanabileceği kişiden kişiye değişir; immünsupresanlar bu kaymayı yavaşlatır ama durdurmaz.</p>
            <p>Bir cyberpsycho ortaya çıktığında MaxTac çağrılır ve ekip çoğu zaman öldürmek için gelir. Bazı fixer'lar ise tedavi edilebilecekleri umuduyla cyberpsycho'ları canlı yakalatmak için edgerunner tutar.</p>
            <p class="note">Cyberpsychosis'in oyundaki kuralları <a href="#rulebook/temel-mekanik">Kural Kitabı › Temel Kurallar</a> sayfasının Humanity bölümündedir.</p>
          `,
          en: `
            <p>Too much chrome on top of heavy mental strain can make a person snap: they turn into a cyberpsycho, hostile to everything around them, recognizing no one. How much chrome someone can take differs from person to person; immunosuppressants slow the slide but don't stop it.</p>
            <p>When a cyberpsycho turns up, MaxTac gets called, and the team usually comes to kill. Some fixers hire edgerunners to bring cyberpsychos in alive instead, in the hope that they can be treated.</p>
            <p class="note">The game rules for cyberpsychosis are in the Humanity section of <a href="#rulebook/temel-mekanik">Rulebook › Core Rules</a>.</p>
          `,
        },
      },
      {
        id: "net",
        label: { tr: "Net ve Blackwall", en: "The Net and the Blackwall" },
        body: {
          tr: `
            <p>Eski küresel Net, 2022'de efsanevi bir netrunner'ın bıraktığı virüslerle büyük ölçüde çöktü; serbest kalan yapay zekâlar da birkaç yıl içinde onu tamamen kullanılmaz hale getirdi. NetWatch eski Net'i Blackwall denen bir duvarın ardına kapattı. Bugünkü Net, birbirinden kopuk yerel ağlardan oluşur.</p>
            <p>Netrunner'lar Net'e beyinleriyle bağlanır. Savaşta, bir cyberdeck üzerinden düşmanın kromuna ve çevredeki sistemlere sızarak quickhack yaparlar. Bu iş tehlikelidir: Black ICE denen savunma yazılımları bir netrunner'ın beynini yakabilir. Blackwall'un ötesine geçmeye çalışanların pek azı geri döner.</p>
          `,
          en: `
            <p>Most of the old global Net crashed in 2022 under viruses left behind by a legendary netrunner, and within a few years the AIs that broke loose had made it completely unusable. NetWatch sealed the old Net behind a wall called the Blackwall. Today's Net is made of separate local networks.</p>
            <p>Netrunners connect to the Net with their brains. In combat, they quickhack through a cyberdeck, breaking into enemies' chrome and nearby systems. The work is dangerous: defensive programs called Black ICE can fry a netrunner's brain. Few who try to cross the Blackwall ever come back.</p>
          `,
        },
      },
      {
        id: "sokak-dili",
        label: { tr: "Sokak Dili", en: "Street Slang" },
        body: {
          tr: `
            <p>Night City sokaklarında en sık duyulan sözlerden bazıları:</p>
            <table class="rules">
              <thead><tr><th>Terim</th><th>Anlamı</th></tr></thead>
              <tbody>
                <tr><td lang="en">Choom</td><td>Arkadaş, kanka</td></tr>
                <tr><td lang="en">Preem</td><td>Birinci sınıf, harika</td></tr>
                <tr><td lang="en">Nova</td><td>Havalı, harika</td></tr>
                <tr><td lang="en">Gonk</td><td>Salak</td></tr>
                <tr><td lang="en">Flatline</td><td>Öldürmek ya da ölmek</td></tr>
                <tr><td lang="en">Zero</td><td>Öldürmek</td></tr>
                <tr><td lang="en">Delta</td><td>Tüymek, hızla kaçmak</td></tr>
                <tr><td lang="en">Eddies</td><td>Eurodolar, para</td></tr>
                <tr><td lang="en">Chrome</td><td>Krom, sibernetik parçalar</td></tr>
                <tr><td lang="en">Chippin' in</td><td>İlk kromunu taktırmak; bir ekibe katılmak</td></tr>
                <tr><td lang="en">Ganic</td><td>Organik, kromsuz</td></tr>
                <tr><td lang="en">Borg</td><td>Kromla dolu, yarı makine biri</td></tr>
                <tr><td lang="en">Corpo</td><td>Şirket çalışanı; satılmış</td></tr>
                <tr><td lang="en">Nomad</td><td>Yollarda yaşayan bir klanın üyesi</td></tr>
                <tr><td lang="en">Solo</td><td>Kiralık silah, koruma</td></tr>
                <tr><td lang="en">Netrunner</td><td>Net'e beyniyle bağlanan hacker</td></tr>
                <tr><td lang="en">ICE</td><td>Net'teki güvenlik yazılımı; öldürücü olanı Black ICE</td></tr>
                <tr><td lang="en">Fixer</td><td>Edgerunner'lara iş bulan aracı</td></tr>
                <tr><td lang="en">Gig</td><td>Fixer'dan gelen iş</td></tr>
                <tr><td lang="en">Ripperdoc</td><td>Krom takan, çoğu zaman ruhsatsız cerrah</td></tr>
                <tr><td lang="en">Handle</td><td>Sokak adı, lakap</td></tr>
                <tr><td lang="en">Joytoy</td><td>Seks işçisi</td></tr>
                <tr><td lang="en">BD</td><td>Braindance</td></tr>
                <tr><td lang="en">XBD</td><td>Kara borsa braindance'i</td></tr>
                <tr><td lang="en">Cyberpsycho</td><td>Kromdan aklını kaçırmış biri</td></tr>
                <tr><td lang="en">Screamsheet</td><td>Haber akışı</td></tr>
                <tr><td lang="en">Scop</td><td>Ucuz sentetik yemek</td></tr>
                <tr><td lang="en">Mano</td><td>Kardeşim, birader</td></tr>
                <tr><td lang="en">Gato</td><td>Havalı tip</td></tr>
                <tr><td lang="en">Input / Output</td><td>Sevgili</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>Words you'll hear a lot on Night City's streets:</p>
            <table class="rules">
              <thead><tr><th>Term</th><th>Meaning</th></tr></thead>
              <tbody>
                <tr><td lang="en">Choom</td><td>Friend, pal</td></tr>
                <tr><td lang="en">Preem</td><td>Premium, top quality</td></tr>
                <tr><td lang="en">Nova</td><td>Cool, great</td></tr>
                <tr><td lang="en">Gonk</td><td>Idiot</td></tr>
                <tr><td lang="en">Flatline</td><td>To kill or to die</td></tr>
                <tr><td lang="en">Zero</td><td>To kill</td></tr>
                <tr><td lang="en">Delta</td><td>To get out fast</td></tr>
                <tr><td lang="en">Eddies</td><td>Eurodollars, money</td></tr>
                <tr><td lang="en">Chrome</td><td>Cyberware</td></tr>
                <tr><td lang="en">Chippin' in</td><td>Getting your first chrome; joining a crew</td></tr>
                <tr><td lang="en">Ganic</td><td>Organic, unchromed</td></tr>
                <tr><td lang="en">Borg</td><td>Someone so chromed they're half machine</td></tr>
                <tr><td lang="en">Corpo</td><td>Corporate worker; sellout</td></tr>
                <tr><td lang="en">Nomad</td><td>Member of a clan that lives on the roads</td></tr>
                <tr><td lang="en">Solo</td><td>Hired gun, bodyguard</td></tr>
                <tr><td lang="en">Netrunner</td><td>Hacker who jacks into the Net</td></tr>
                <tr><td lang="en">ICE</td><td>Net security software; the lethal kind is Black ICE</td></tr>
                <tr><td lang="en">Fixer</td><td>Middleman who finds jobs for edgerunners</td></tr>
                <tr><td lang="en">Gig</td><td>A job from a fixer</td></tr>
                <tr><td lang="en">Ripperdoc</td><td>Chrome surgeon, often unlicensed</td></tr>
                <tr><td lang="en">Handle</td><td>Street name</td></tr>
                <tr><td lang="en">Joytoy</td><td>Sex worker</td></tr>
                <tr><td lang="en">BD</td><td>Braindance</td></tr>
                <tr><td lang="en">XBD</td><td>Black-market braindance</td></tr>
                <tr><td lang="en">Cyberpsycho</td><td>Someone driven mad by chrome</td></tr>
                <tr><td lang="en">Screamsheet</td><td>News feed</td></tr>
                <tr><td lang="en">Scop</td><td>Cheap synthetic food</td></tr>
                <tr><td lang="en">Mano</td><td>Brother, bro</td></tr>
                <tr><td lang="en">Gato</td><td>Cool guy</td></tr>
                <tr><td lang="en">Input / Output</td><td>Girlfriend / boyfriend</td></tr>
              </tbody>
            </table>
          `,
        },
      },
    ],
  },

  "lore/ceteler": {
    intro: {
      tr: `
        <blockquote class="ct-quote"><p>“Heywood'da büyüdüm ben. Bizim sokağın köşesinde Valentinos'tan Chuy diye bir çocuk dururdu, on dört yaşında var yoktu. Annem ondan nefret ederdi, ama mahallenin bakkalı bir kere bile soyulmadı, onu da söyleyeyim. Polis mi? Polis bizim sokağa ceset toplamaya gelirdi, o kadar. Sonra Chuy büyüdü, bakkaldan haraç almaya başladı. En son yetmiş üçte gördüm onu, bir kolu metaldi, beni tanımadı bile.”</p><cite>- Elias Varga</cite></blockquote>
        <p>Night City'de devletin ve şirketlerin elinin uzanmadığı her yeri çeteler doldurur. Bazıları bir mahalleyi polisten daha iyi korur, bazıları o mahalleyi kemirerek yaşar; çoğu ikisini birden yapar.</p>
      `,
      en: `
        <blockquote class="ct-quote"><p>“I grew up in Heywood. There was a kid from the Valentinos, Chuy, used to stand on the corner of our street, fourteen if he was a day. My mother hated him, but I'll tell you this, the corner store never got robbed once. The cops? The cops came to our street to pick up bodies, that's it. Then Chuy grew up and started taking a cut from the corner store. Last time I saw him was seventy-three, one of his arms was metal, didn't even recognize me.”</p><cite>- Elias Varga</cite></blockquote>
        <p>In Night City, gangs fill every place the state and the corporations can't reach. Some protect a neighborhood better than the police do, some live by gnawing on it; most do both.</p>
      `,
    },
    sections: [
      {
        id: "cete-polis",
        label: { tr: "Çeteler ve Polis", en: "Gangs and the Police" },
        body: {
          tr: `
            <p>NCPD'nin her çeteyle uğraşacak gücü yoktur, çoğu zaman niyeti de yoktur. 6th Street gibi bazı çeteleri kendi bölgelerinde gayriresmî bir polis gücü gibi görür ve onlara göz yumar. Valentinos gibi mahalleye kök salmış çetelerin arasına sızamaz. Pacifica'yı şirketlerle birlikte terk etmiştir, Dogtown'a ise hiç giremez.</p>
            <p>Bir çetenin bölgesinde o çetenin kuralları geçer. Yabancılar dikkatle izlenir, renkler ve dövmeler kimin hangi çeteden olduğunu gösterir; yanlış ceketle yanlış sokağa girmek başını belaya sokmaya yeter.</p>
          `,
          en: `
            <p>The NCPD doesn't have the strength to deal with every gang, and most of the time it doesn't have the will either. It tolerates some gangs, like 6th Street, as unofficial police on their own turf. It can't get inside gangs rooted deep in their neighborhoods, like the Valentinos. It abandoned Pacifica along with the corporations, and it can't enter Dogtown at all.</p>
            <p>On a gang's turf, that gang's rules apply. Strangers are watched closely, and colors and tattoos show who runs with which gang; walking down the wrong street in the wrong jacket is all it takes to get into trouble.</p>
          `,
        },
      },
      {
        id: "savas-bolgeleri",
        label: { tr: "Savaş Bölgeleri", en: "Combat Zones" },
        body: {
          tr: `
            <p>Devletin ve şirketlerin terk ettiği, çetelerin ve psikopatların eline bırakılmış bölgelere <strong><span lang="en">Combat Zone</span></strong> denir. Polis bu bölgelere girmez; girmek zorunda kalırsa kalabalık ve ağır silahlı girer.</p>
            <p>Bugün bunun en bilinen örneği Pacifica'dır. 2069'daki savaş sırasında yatırımcılar kaçtı; ardından belediye hizmetlerini durdurdu, şirketler bölgeden çekildi ve 2072'de polis karakolu da kapatıldı. Pacifica'nın içindeki Dogtown ise bunun en uç örneğidir: duvarlarla çevrili, kendi ordusu ve kendi yasası olan bir şehir parçası.</p>
          `,
          en: `
            <p>Districts abandoned by the state and the corporations and left to gangs and psychos are called <strong>Combat Zones</strong>. The police don't go in; when they have to, they go in large numbers and heavily armed.</p>
            <p>Today the best-known example is Pacifica. During the war of 2069 the investors fled; after that the city cut its services, the corporations pulled out, and in 2072 the police precinct was shut down too. Dogtown, inside Pacifica, is the extreme case: a walled-off piece of the city with its own army and its own law.</p>
          `,
        },
      },
      {
        id: "nomadlar",
        label: { tr: "Nomad'lar", en: "Nomads" },
        body: {
          tr: `
            <p>Nomad'lar çete değildir. Çöküş yıllarında evini kaybedip yollara düşen insanlardan doğmuş geniş aileler ve klanlardır. Kendi yasaları vardır; taşımacılık, kaçakçılık ve tarım işleriyle geçinirler.</p>
            <p>Şehirliler onlara pek güvenmez, ama Night City'nin dışındaki yolları en iyi onlar bilir. Ailesinden kovulan nomad'a <strong><span lang="en">Raffen Shiv</span></strong> denir; bunlar hiçbir ailenin yasasını tanımayan haydutlardır.</p>
          `,
          en: `
            <p>Nomads aren't gangs. They're large families and clans that grew out of people who lost their homes and took to the roads during the Collapse. They have their own laws and make their living from transport, smuggling and farm work.</p>
            <p>City folk don't trust them much, but nobody knows the roads outside Night City better. A nomad thrown out of their family is called <strong>Raffen Shiv</strong>; they're raiders who recognize no family's law.</p>
          `,
        },
      },
      {
        id: "cete-listesi",
        label: { tr: "Çete Listesi", en: "Gang List" },
        tool: "gang-table",
      },
    ],
  },

  "lore/diller": {
    intro: {
      tr: `
        <p>Night City, dünyanın dört bir yanından gelen insanlarla doludur. Sokakta herkes Streetslang konuşur; ama bir şirketin toplantı odasında, bir çetenin mahallesinde ya da bir göçmen pazarında başka diller duyulur.</p>
        <p>Her karakter Streetslang bilir. Bazı sınıflar ve feat'ler ek dil hakkı verir; bu hakkı olan karakter ek dillerini bu listeden seçer. Listede olmayan bir dil de GM'in onayıyla seçilebilir.</p>
      `,
      en: `
        <p>Night City is full of people from every corner of the world. On the street, everyone speaks Streetslang; but in a corporate boardroom, a gang's neighborhood or an immigrant market, you'll hear other languages.</p>
        <p>Every character knows Streetslang. Some Roles and feats grant extra languages; a character who has them picks them from this list. A language that isn't listed can also be picked with the GM's approval.</p>
      `,
    },
    sections: [
      {
        id: "dil-listesi",
        label: { tr: "Dil Listesi", en: "Language List" },
        tool: "language-table",
      },
    ],
  },

  "rulebook/araclar-kurallar": {
    intro: {
      tr: `
        <p>İşlerin çoğu er ya da geç yola düşer: ya hedefe zamanında varmak ya da peşindekileri atlatmak gerekir. Bu sayfa araç sürmeyi, araçtan ateş etmeyi, araç hasarını ve kovalamacaları anlatır. Genel araç tiplerinin listesi sayfanın sonundadır.</p>
      `,
      en: `
        <p>Sooner or later, most jobs hit the road: the crew has to get somewhere on time, or shake off whoever is on its tail. This page covers driving, shooting from vehicles, vehicle damage and chases. A list of general vehicle types is at the end of the page.</p>
      `,
    },
    sections: [
      {
        id: "surus",
        label: { tr: "Sürüş", en: "Driving" },
        body: {
          tr: `
            <ul>
              <li>Araç sürmek (düz gitmek, dönmek, hızlanmak, yavaşlamak) bir <strong>aksiyondur</strong>. GM, bazı basit sürüş işlerinin bonus aksiyonla yapılabileceğine karar verebilir.</li>
              <li>Keskin bir dönüş, trafiğin arasına dalmak ya da rampadan atlamak gibi tehlikeli bir manevrada <strong>Driving</strong> atılır. DV'yi geçemeyen sürücü aracın kontrolünü kaybeder.</li>
              <li>Badlands'in yolsuz arazisi, enkaz ya da çamur gibi <strong>zorlu arazide</strong> Driving atışları dezavantajlıdır.</li>
              <li>Araç, sürücünün turunda hareket eder. Araca binmek ya da araçtan inmek hareketin yarısını harcar.</li>
            </ul>
          `,
          en: `
            <ul>
              <li>Driving a vehicle (going straight, turning, speeding up, slowing down) takes an <strong>action</strong>. The GM can decide that some simple driving tasks take a bonus action.</li>
              <li>A dangerous maneuver, such as a hard turn, cutting through traffic or jumping a ramp, needs a <strong>Driving</strong> roll. A driver who fails to beat the DV loses control of the vehicle.</li>
              <li>On <strong>rough terrain</strong>, such as the roadless Badlands, rubble or mud, Driving rolls have disadvantage.</li>
              <li>The vehicle moves on the driver's turn. Getting into or out of a vehicle costs half your movement.</li>
            </ul>
          `,
        },
      },
      {
        id: "aractan-ates",
        label: { tr: "Araçtan Ateş", en: "Shooting from a Vehicle" },
        body: {
          tr: `
            <ul>
              <li>Yolcular normal şekilde ateş eder.</li>
              <li>Sürücü yalnızca tek elle kullanılan silahlarla ateş edebilir ve saldırı zarları dezavantajlıdır.</li>
              <li>Sürücü aynı turda hem sürüp hem ateş edecekse sürüşü bonus aksiyonla yapabiliyor olmalıdır (örneğin Wheelman feat'iyle ya da GM'in kararıyla).</li>
            </ul>
          `,
          en: `
            <ul>
              <li>Passengers shoot as normal.</li>
              <li>The driver can only fire one-handed weapons, and their attack rolls have disadvantage.</li>
              <li>To both drive and shoot on the same turn, the driver has to be able to drive with a bonus action (for example with the Wheelman feat, or by the GM's ruling).</li>
            </ul>
          `,
        },
      },
      {
        id: "arac-siper",
        label: { tr: "Araçlar ve Siper", en: "Vehicles as Cover" },
        body: {
          tr: `
            <ul>
              <li>Araç, içindekilere ve arkasında saklananlara siper sağlar. Ne kadar siper sağladığı araç listesinde yazar.</li>
              <li>Siperin HP'si aracın kendi HP'sidir. Sipere isabet eden hasar aracın HP'sinden düşer.</li>
            </ul>
          `,
          en: `
            <ul>
              <li>A vehicle gives cover to the people inside it and to those hiding behind it. How much cover it gives is listed in the vehicle list.</li>
              <li>The cover's HP is the vehicle's own HP. Damage that hits the cover comes off the vehicle's HP.</li>
            </ul>
          `,
        },
      },
      {
        id: "arac-hasari",
        label: { tr: "Araç Hasarı", en: "Vehicle Damage" },
        body: {
          tr: `
            <p>Araçların SP'si yoktur. Araca isabet eden hasar doğrudan <strong>HP</strong>'sinden düşer.</p>
            <ul>
              <li><strong>Ağır Hasarlı:</strong> HP'si maksimumunun yarısının altına inen aracın sağladığı siper bir kademe düşer: tam siper kısmi olur, kısmi siper tamamen kalkar. Bu araçla yapılan Driving atışlarına −2 uygulanır.</li>
              <li><strong>Hurda:</strong> HP'si 0'a düşen araç hurdaya döner ve siper sağlamaz. Fazla hasar içindekilere ya da arkasındakilere gövde isabeti olarak geçer.</li>
              <li><strong>Kaza:</strong> Hareket halindeyken hurdaya dönen bir araçtaki herkes 3d6 hasar alır. Hasar gövde isabeti sayılır; gövde zırhı normal işler.</li>
              <li><strong>Parçalanma:</strong> Araç, aldığı her hasarın yarısı kadar parçalanma biriktirir (yukarı yuvarlanır). Parçalanma giderilene kadar aracın HP'si, maksimum HP'sinden biriken parçalanma çıkarıldığında kalan değeri geçemez.</li>
            </ul>
            <div class="example"><b>Örnek</b><p>HP'si 90 olan bir sedan 40 hasar alıyor. HP'si 50'ye düşüyor ve 20 parçalanma birikiyor. Tamir edilse de HP'si en fazla 70'e çıkar; kalan 20'yi ancak bir tamirci giderebilir.</p></div>
          `,
          en: `
            <p>Vehicles have no SP. Damage that hits a vehicle comes straight off its <strong>HP</strong>.</p>
            <ul>
              <li><strong>Badly Damaged:</strong> When a vehicle drops below half its maximum HP, the cover it gives drops one step: full cover becomes partial, and partial cover is gone. Driving rolls made with it take −2.</li>
              <li><strong>Wrecked:</strong> A vehicle that drops to 0 HP is wrecked and gives no cover. Leftover damage passes to those inside or behind it as a body hit.</li>
              <li><strong>Crash:</strong> If a vehicle is wrecked while moving, everyone in it takes 3d6 damage. The damage counts as a body hit; body armor applies.</li>
              <li><strong>Structural damage:</strong> A vehicle builds up structural damage equal to half of every hit it takes (rounded up). Until the structural damage is fixed, the vehicle's HP can't go above its maximum HP minus its structural damage.</li>
            </ul>
            <div class="example"><b>Example</b><p>A sedan with 90 HP takes 40 damage. Its HP drops to 50 and it builds up 20 structural damage. Even after repairs, its HP only goes back up to 70; only a mechanic can fix the remaining 20.</p></div>
          `,
        },
      },
      {
        id: "arac-tamiri",
        label: { tr: "Tamir", en: "Repairs" },
        body: {
          tr: `
            <ul>
              <li>Araçlar savaşta ya da tehlikeli bir yerde tamir edilemez. Güvenli bir yerde 1 saat çalışıldıktan sonra <strong>Craft</strong> atılır; Alet Çantası olmadan atış dezavantajlıdır. DV 11'dir; zırhlı araçlarda ve AV'lerde DV 14'tür. Başarılı olursa aracın HP'si, parçalanmanın izin verdiği en yüksek değere çıkar. Başarısız olursa 1 saat sonra yeniden denenebilir.</li>
              <li><strong>Parçalanmayı</strong> Craft ile gidermek mümkün değildir; onu yalnızca bir tamirci, para karşılığında giderebilir.</li>
              <li>Araç baştan sona bir tamirciye para karşılığı da onartılabilir.</li>
              <li>Hurdaya dönen bir araç Craft ile onarılamaz. Bir tamircinin onu kurtarıp kurtaramayacağına GM karar verir.</li>
            </ul>
          `,
          en: `
            <ul>
              <li>Vehicles can't be repaired in combat or somewhere dangerous. In a safe place, after 1 hour of work, <strong>Craft</strong> is rolled, with disadvantage without a Tool Kit: DV 11, or DV 14 for armored vehicles and AVs. On a success, the vehicle's HP goes up to the highest value its structural damage allows. On a failure, it can be tried again 1 hour later.</li>
              <li><strong>Structural damage</strong> can't be fixed with Craft. Only a mechanic can fix it, for money.</li>
              <li>A vehicle can also be fully repaired by a mechanic, for money.</li>
              <li>A wrecked vehicle can't be repaired with Craft. The GM decides whether a mechanic can save it.</li>
            </ul>
          `,
        },
      },
      {
        id: "kovalamaca",
        label: { tr: "Kovalamaca", en: "Chases" },
        body: {
          tr: `
            <p>Kovalamacalar GM'in takdirine göre, esnek bir şekilde yürütülür. Aşağıdaki yöntem yalnızca bir örnektir:</p>
            <ul>
              <li>Her tur iki sürücü karşılıklı <strong>Driving</strong> atar.</li>
              <li>Kazanan, aradaki mesafeyi kendi lehine bir adım değiştirir. Mesafe adımları için örneğin menzil basamakları (Yakın, Orta, Uzak, Çok uzak) kullanılabilir.</li>
              <li>Kaçan yeterince uzaklaşırsa kurtulur; kovalayan yeterince yaklaşırsa onu yakalar.</li>
            </ul>
          `,
          en: `
            <p>Chases are run flexibly, at the GM's discretion. The method below is only an example:</p>
            <ul>
              <li>Each round, both drivers make opposed <strong>Driving</strong> rolls.</li>
              <li>The winner shifts the distance between them one step in their own favor. The range steps (Close, Medium, Long, Extreme) can be used as distance steps, for example.</li>
              <li>If the one fleeing gets far enough away, they escape; if the pursuer gets close enough, they catch them.</li>
            </ul>
          `,
        },
      },
      {
        id: "arac-listesi",
        label: { tr: "Araç Listesi", en: "Vehicle List" },
        tool: "vehicle-table",
      },
    ],
  },

  "rulebook/temel-mekanik": {
    intro: {
      tr: `
        <p>Bir işin nasıl biteceğini çoğu zaman iki şey belirler: işi yapanın ne kadar usta olduğu ve o an şansın kimden yana olduğu. Cyberpunk Green'de bu anı tek bir zar belirler: <strong>d10</strong>. Bu sayfa her atışta geçerli olan temel kuralları anlatır: zarın nasıl atıldığını, sonucun neyle karşılaştırıldığını ve sonucu hangi durumların değiştirdiğini.</p>
      `,
      en: `
        <p>How a job ends usually comes down to two things: how good the one doing it is, and whose side luck is on at that moment. In Cyberpunk Green, that moment comes down to a single die: the <strong>d10</strong>. This page covers the basic rules that apply to every roll: how the die is rolled, what the result is compared against, and what can change it.</p>
      `,
    },
    sections: [
      {
        id: "skill-atisi",
        label: { tr: "Skill Atışı", en: "Skill Checks" },
        body: {
          tr: `
            <p>Bir karakter sonucu belirsiz ve önemli bir iş denediğinde GM, hangi skill'in atılacağına ve işin ne kadar zor olduğuna, yani <strong>DV</strong>'ye (Difficulty Value) karar verir. Ardından şu atış yapılır:</p>
            <div class="formula">d10 + Skill <span>vs</span> DV</div>
            <p>Zarın sonucu ile skill değerinin toplamı DV'den <strong>yüksekse</strong> atış başarılı olur. Toplam DV'ye <strong>eşitse</strong> DV kazanır ve atış başarısız olur.</p>
            <div class="example"><b>Örnek</b><p>Bir karakter, kilitli bir kapının arkasındaki konuşmayı dinlemek istiyor. GM bir Perception (Algı) atışı istiyor ve DV'yi 11 olarak belirliyor. Karakterin Perception değeri +4. Zarda 8 geliyor: 8 + 4 = 12. Toplam DV'yi geçtiği için karakter içeride konuşulanları duyuyor.</p></div>
          `,
          en: `
            <p>When a character attempts something important whose outcome is uncertain, the GM decides which skill is rolled and how hard the task is: its <strong>DV</strong> (Difficulty Value). Then this roll is made:</p>
            <div class="formula">d10 + Skill <span>vs</span> DV</div>
            <p>If the die plus the skill value is <strong>higher</strong> than the DV, the roll succeeds. If the total <strong>ties</strong> the DV, the DV wins and the roll fails.</p>
            <div class="example"><b>Example</b><p>A character wants to listen in on a conversation behind a locked door. The GM calls for a Perception roll and sets the DV at 11. The character's Perception is +4. The die shows an 8: 8 + 4 = 12. The total beats the DV, so the character hears what is being said inside.</p></div>
          `,
        },
      },
      {
        id: "skill-degeri",
        label: { tr: "Skill Değeri", en: "Skill Value" },
        body: {
          tr: `
            <p>Karakter kağıdındaki her skill'in tek bir değeri vardır ve atışta zara yalnızca bu değer eklenir. Bu değer şunların toplamıdır:</p>
            <ul>
              <li><strong>Stat modifier'ı:</strong> Skill'in bağlı olduğu stat'tan gelir. Örneğin Stealth (Gizlilik) DEX'e bağlıdır.</li>
              <li><strong>Yetkinlik bonusu:</strong> Karakter o skill'de yetkinse +1, çok yetkinse +2.</li>
              <li><strong>Ustalık:</strong> Karakterin o skill'de Ustalığı varsa Ustalık modifier'ı eklenir. Ustalık yalnızca yetkin ya da çok yetkin olunan skill'lere verilebilir.</li>
              <li><strong>Diğer bonuslar:</strong> Feat'lerden ve kromdan gelen bonuslar.</li>
            </ul>
            <p class="note">Stat modifier'ı zaten skill değerinin içinde olduğu için atışta bir daha eklenmez.</p>
            <p>Yetkinliğin ve Ustalığın nasıl kazanıldığı <a href="#rulebook/statlar-skiller">Kural Kitabı › Statlar ve Skill'ler</a> sayfasında anlatılır.</p>
            <div class="example"><b>Örnek</b><p>Bir karakterin DEX'i 14, yani modifier'ı +2. Karakter Stealth'te çok yetkin (+2) ve bu skill'de Ustalığı var (+1). Stealth değeri 2 + 2 + 1 = <strong>+5</strong>. Gizlenirken d10 + 5 atılır.</p></div>
          `,
          en: `
            <p>Every skill on the character sheet has a single value, and that is the only number added to the die. It is the sum of:</p>
            <ul>
              <li><strong>Stat modifier:</strong> From the stat the skill belongs to. For example, Stealth belongs to DEX.</li>
              <li><strong>Proficiency bonus:</strong> +1 if the character is proficient in the skill, +2 if highly proficient.</li>
              <li><strong>Mastery:</strong> If the character has Mastery in the skill, the Mastery modifier is added. Mastery can only be given to skills the character is proficient or highly proficient in.</li>
              <li><strong>Other bonuses:</strong> Bonuses from feats and chrome.</li>
            </ul>
            <p class="note">The stat modifier is already part of the skill value, so it is not added to the roll again.</p>
            <p>How proficiency and Mastery are gained is covered on the <a href="#rulebook/statlar-skiller">Rulebook › Stats &amp; Skills</a> page.</p>
            <div class="example"><b>Example</b><p>A character has DEX 14, so the modifier is +2. They are highly proficient in Stealth (+2) and have Mastery in it (+1). Their Stealth is 2 + 2 + 1 = <strong>+5</strong>. When sneaking, d10 + 5 is rolled.</p></div>
          `,
        },
      },
      {
        id: "stat-modifier",
        label: { tr: "Stat Modifier", en: "Stat Modifiers" },
        body: {
          tr: `
            <p>Statlar 3 ile 20 arasında bir değer alır. Her stat'ın bir <strong>modifier</strong>'ı vardır ve skill değerlerine bu modifier eklenir. İnisiyatif ve ölüm kurtarma atışı gibi bazı atışlarda da doğrudan stat modifier'ı kullanılır.</p>
            <table class="rules">
              <thead><tr><th>Stat</th><th>Modifier</th></tr></thead>
              <tbody>
                <tr><td>3</td><td>−4</td></tr>
                <tr><td>4–5</td><td>−3</td></tr>
                <tr><td>6–7</td><td>−2</td></tr>
                <tr><td>8–9</td><td>−1</td></tr>
                <tr><td>10–11</td><td>+0</td></tr>
                <tr><td>12–13</td><td>+1</td></tr>
                <tr><td>14–15</td><td>+2</td></tr>
                <tr><td>16–17</td><td>+3</td></tr>
                <tr><td>18–19</td><td>+4</td></tr>
                <tr><td>20</td><td>+5</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>Stats range from 3 to 20. Each stat has a <strong>modifier</strong>, and that modifier goes into skill values. Some rolls, such as initiative and death saves, use a stat modifier directly.</p>
            <table class="rules">
              <thead><tr><th>Stat</th><th>Modifier</th></tr></thead>
              <tbody>
                <tr><td>3</td><td>−4</td></tr>
                <tr><td>4–5</td><td>−3</td></tr>
                <tr><td>6–7</td><td>−2</td></tr>
                <tr><td>8–9</td><td>−1</td></tr>
                <tr><td>10–11</td><td>+0</td></tr>
                <tr><td>12–13</td><td>+1</td></tr>
                <tr><td>14–15</td><td>+2</td></tr>
                <tr><td>16–17</td><td>+3</td></tr>
                <tr><td>18–19</td><td>+4</td></tr>
                <tr><td>20</td><td>+5</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "zorluk",
        label: { tr: "Zorluk (DV)", en: "Difficulty (DV)" },
        body: {
          tr: `
            <p>GM, işin ne kadar zor olduğuna göre aşağıdaki basamaklardan birini seçebilir.</p>
            <table class="rules">
              <thead><tr><th>DV</th><th>Zorluk</th><th>Açıklama</th><th>Örnek</th></tr></thead>
              <tbody>
                <tr><td>5</td><td>Kolay</td><td>Biraz dikkatle hemen herkesin yapabileceği işler.</td><td>Alçak bir çitin üzerinden atlamak.</td></tr>
                <tr><td>8</td><td>Ortalama</td><td>Biraz deneyim isteyen gündelik işler.</td><td>Ağzı sıkı bir barmenden bir isim almak.</td></tr>
                <tr><td>11</td><td>Zor</td><td>Eğitimli birinin bile zorlanabileceği işler.</td><td>Yağmurda kaygan bir çatıdan diğerine atlamak.</td></tr>
                <tr><td>14</td><td>Profesyonel</td><td>Ancak işinin ehli birinin güvenle yapabileceği işler.</td><td>Bir şirket binasının kart okuyucusunu kopyalamak.</td></tr>
                <tr><td>17</td><td>Kahramanca</td><td>En iyilerin bile şansa ihtiyaç duyduğu işler.</td><td>Otoyolda giden bir araçtan diğerine atlamak.</td></tr>
                <tr><td>20</td><td>Efsanevi</td><td>Sokakta hikâyesi anlatılacak işler.</td><td>Bir şirketin güvenlik şefini yalanına inandırmak.</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>The GM can pick one of the steps below, based on how hard the task is.</p>
            <table class="rules">
              <thead><tr><th>DV</th><th>Difficulty</th><th>Description</th><th>Example</th></tr></thead>
              <tbody>
                <tr><td>5</td><td>Easy</td><td>Things almost anyone can do with a little care.</td><td>Hopping over a low fence.</td></tr>
                <tr><td>8</td><td>Average</td><td>Everyday tasks that take a bit of experience.</td><td>Getting a name out of a tight-lipped bartender.</td></tr>
                <tr><td>11</td><td>Hard</td><td>Tasks that can trouble even a trained person.</td><td>Jumping between slick rooftops in the rain.</td></tr>
                <tr><td>14</td><td>Professional</td><td>Tasks only a real pro can do reliably.</td><td>Cloning a corporate building's keycard reader.</td></tr>
                <tr><td>17</td><td>Heroic</td><td>Even the best need some luck.</td><td>Leaping from one car to another on the highway.</td></tr>
                <tr><td>20</td><td>Legendary</td><td>The kind of thing the street tells stories about.</td><td>Selling a lie to a corporation's head of security.</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "karsilikli",
        label: { tr: "Karşılıklı Atış", en: "Opposed Rolls" },
        body: {
          tr: `
            <p>Bir karakter doğrudan başka birine karşı bir şey denediğinde, örneğin yakın dövüşte saldırdığında ya da birini yakalamaya çalıştığında, DV yerine karşı tarafın atışı kullanılır. İşi deneyen kendi skill'iyle atar; karşı taraf da kuralın ya da GM'in belirlediği skill'le karşılık verir. Yüksek sonuç kazanır.</p>
            <div class="example"><b>Örnek</b><p>Bir karakter bıçakla saldırıyor ve Melee Weapons atıyor: 7 + 4 = 11. Saldırıya uğrayan, bedava bir Evasion atışıyla karşılık veriyor: 9 + 2 = 11. Sonuçlar eşit olduğu için savunan kazanıyor ve bıçak boşa savruluyor.</p></div>
          `,
          en: `
            <p>When a character acts directly against someone else, such as attacking them in melee or trying to grab them, the other side's roll takes the place of the DV. The one attempting the action rolls their skill; the other side answers with the skill the rule or the GM calls for. The higher result wins.</p>
            <div class="example"><b>Example</b><p>A character attacks with a knife and rolls Melee Weapons: 7 + 4 = 11. The defender answers with a free Evasion roll: 9 + 2 = 11. The results are tied, so the defender wins and the knife cuts only air.</p></div>
          `,
        },
      },
      {
        id: "kritik-zar",
        label: { tr: "Kritik Zar", en: "Exploding Dice" },
        body: {
          tr: `
            <p>Zarın kendisinde, bonuslar eklenmeden önce görünen sayıya <strong>doğal</strong> sonuç denir. Doğal sonuç 10 ya da 1 olduğunda bir <strong>kritik zar</strong> atılır:</p>
            <ul>
              <li>Doğal <strong>10</strong> gelirse bir d10 daha atılır ve sonucu toplama <strong>eklenir</strong>.</li>
              <li>Doğal <strong>1</strong> gelirse bir d10 daha atılır ve sonucu toplamdan <strong>çıkarılır</strong>.</li>
            </ul>
            <p>Kritik zar yalnızca bir kez atılır. Kritik zarda yeniden 10 ya da 1 gelse bile bir kritik zar daha atılmaz.</p>
            <p>Kritik zar, inisiyatif ve ölüm kurtarma atışları dahil bütün d10 atışlarında geçerlidir.</p>
            <div class="example"><b>Örnek</b><p>Handgun (Tabancalar) değeri +3 olan bir karakter DV 14'e karşı atıyor. Zarda 10 geliyor; bir kritik zar atılıyor ve 6 geliyor. Toplam 10 + 6 + 3 = 19, atış başarılı.</p></div>
          `,
          en: `
            <p>The number shown on the die itself, before any bonuses, is the <strong>natural</strong> result. When the natural result is a 10 or a 1, an <strong>exploding die</strong> is rolled:</p>
            <ul>
              <li>On a natural <strong>10</strong>, another d10 is rolled and <strong>added</strong> to the total.</li>
              <li>On a natural <strong>1</strong>, another d10 is rolled and <strong>subtracted</strong> from the total.</li>
            </ul>
            <p>The extra die is rolled only once. It does not explode again, even if it also shows a 10 or a 1.</p>
            <p>Exploding dice apply to every d10 roll, including initiative and death saves.</p>
            <div class="example"><b>Example</b><p>A character with Handgun +3 rolls against DV 14. The die shows a 10, so another die is rolled and shows a 6. The total is 10 + 6 + 3 = 19, and the roll succeeds.</p></div>
          `,
        },
      },
      {
        id: "avantaj",
        label: { tr: "Avantaj ve Dezavantaj", en: "Advantage & Disadvantage" },
        body: {
          tr: `
            <p>Elverişli bir konum ya da iyi bir hazırlık bir atışı kolaylaştırabilir; kötü bir görüş ya da bir yara onu zorlaştırabilir. Kurallar bu durumları avantaj ve dezavantajla gösterir.</p>
            <ul>
              <li><strong>Avantaj:</strong> iki d10 atılır, yüksek olan alınır.</li>
              <li><strong>Dezavantaj:</strong> iki d10 atılır, düşük olan alınır.</li>
            </ul>
            <p>Avantajlar <strong>üst üste binmez</strong>: bir atışa birden fazla avantaj gelse de atış yine iki d10 ile atılır. Dezavantaj da öyledir.</p>
            <p>Aynı atışta hem avantaj hem dezavantaj varsa <strong>birbirini götürür</strong> ve tek d10 ile normal atılır.</p>
            <p>Kritik zar kuralı <strong>seçilen zar</strong> için geçerlidir. Avantajlı atışta alınan zar 10 ise bir zar daha atılıp eklenir. Dezavantajlı atışta alınan zar 1 ise bir zar daha atılıp çıkarılır.</p>
          `,
          en: `
            <p>Good positioning or careful preparation can make a roll easier; poor visibility or a wound can make it harder. The rules represent this with advantage and disadvantage.</p>
            <ul>
              <li><strong>Advantage:</strong> two d10s are rolled and the higher one is kept.</li>
              <li><strong>Disadvantage:</strong> two d10s are rolled and the lower one is kept.</li>
            </ul>
            <p>Advantages <strong>don't stack</strong>: even if a roll gets advantage from several sources, it's still rolled with two d10s. The same goes for disadvantage.</p>
            <p>If a roll has both advantage and disadvantage, they <strong>cancel out</strong> and a single d10 is rolled as normal.</p>
            <p>The exploding dice rule applies to the <strong>kept die</strong>. With advantage, if the kept die is a 10, another die is rolled and added. With disadvantage, if the kept die is a 1, another die is rolled and subtracted.</p>
          `,
        },
      },
      {
        id: "genel-atis",
        label: { tr: "Genel Atış", en: "Stat Checks" },
        body: {
          tr: `
            <p>Bazı durumlar hiçbir skill'e uymaz. Böyle durumlarda GM isterse skill yerine <strong>stat zarı</strong> atılır; zara yalnızca ilgili stat'ın modifier'ı eklenir:</p>
            <div class="formula">d10 + Stat Modifier <span>vs</span> DV</div>
            <div class="example"><b>Örnek</b><p>Dağınık ipuçlarını birleştirip olayı çözmeye çalışmak bir INT atışıdır. Konuşmanın ortasında silaha hızla davranmak ise bir DEX atışıdır.</p></div>
          `,
          en: `
            <p>Some situations don't fit any skill. In those cases, if the GM wishes, a <strong>stat check</strong> is rolled instead of a skill check; only the relevant stat's modifier is added to the die:</p>
            <div class="formula">d10 + Stat Modifier <span>vs</span> DV</div>
            <div class="example"><b>Example</b><p>Putting scattered clues together to work out what happened is an INT check. Going for a gun in the middle of a conversation is a DEX check.</p></div>
          `,
        },
      },
      {
        id: "luck",
        label: { tr: "Luck", en: "Luck" },
        body: {
          tr: `
            <p>Luck bir stat değildir; her oturumun başında dolan bir puan havuzudur.</p>
            <ul>
              <li>Havuzda <strong>3</strong> puan vardır.</li>
              <li>Atıştan önce istenildiği kadar Luck puanı harcanabilir. Harcanan her puan atışa <strong>+1</strong> ekler.</li>
              <li>Harcanan puanlar bir sonraki oturuma kadar geri gelmez.</li>
            </ul>
          `,
          en: `
            <p>Luck is not a stat; it is a pool of points that refills at the start of each session.</p>
            <ul>
              <li>The pool holds <strong>3</strong> points.</li>
              <li>Before a roll, any number of Luck points can be spent. Each point spent adds <strong>+1</strong> to the roll.</li>
              <li>Spent points do not come back until the next session.</li>
            </ul>
          `,
        },
      },
      {
        id: "atis-sirasi",
        label: { tr: "Adım Adım Atış", en: "A Roll, Step by Step" },
        body: {
          tr: `
            <p>Bir atış baştan sona şu sırayla yapılır:</p>
            <table class="rules text">
              <thead><tr><th>Adım</th><th>Ne yapılır</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>GM, atılacak skill'e ya da stat'a ve DV'ye karar verir. Karşılıklı atışta DV yerine karşı tarafın sonucu kullanılır.</td></tr>
                <tr><td>2</td><td>Luck harcanacaksa zar atılmadan önce harcanır.</td></tr>
                <tr><td>3</td><td>d10 atılır. Avantaj ya da dezavantaj varsa iki d10 atılır ve biri alınır.</td></tr>
                <tr><td>4</td><td>Alınan zar doğal 10 ya da 1 ise kritik zar atılır.</td></tr>
                <tr><td>5</td><td>Zara skill değeri (stat zarında stat modifier'ı), harcanan Luck puanları ve o atışa uygulanan bonus ve cezalar eklenir.</td></tr>
                <tr><td>6</td><td>Toplam DV'den yüksekse atış başarılı olur; DV'ye eşit ya da DV'den düşükse başarısız olur.</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>From start to finish, a roll goes in this order:</p>
            <table class="rules text">
              <thead><tr><th>Step</th><th>What happens</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>The GM decides which skill or stat is rolled and sets the DV. In an opposed roll, the other side's result takes the place of the DV.</td></tr>
                <tr><td>2</td><td>Any Luck to be spent is spent before the die is rolled.</td></tr>
                <tr><td>3</td><td>A d10 is rolled. With advantage or disadvantage, two d10s are rolled and one is kept.</td></tr>
                <tr><td>4</td><td>If the kept die is a natural 10 or 1, an exploding die is rolled.</td></tr>
                <tr><td>5</td><td>The skill value (the stat modifier in a stat check), any Luck spent and any bonuses and penalties that apply to the roll are added to the die.</td></tr>
                <tr><td>6</td><td>If the total is higher than the DV, the roll succeeds; if it ties the DV or falls below it, the roll fails.</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "humanity",
        label: { tr: "Humanity", en: "Humanity" },
        body: {
          tr: `
            <p><strong>Humanity</strong>, bir karakterin insanlığını, yani kendisiyle ve çevresindekilerle kurduğu bağı gösterir. Bedenine takılan her krom parçası ve yaşadığı her karanlık olay bu bağı biraz daha zayıflatır.</p>
            <ul>
              <li>Başlangıç değeri: <strong>EMP × 10</strong>.</li>
              <li><strong>Maksimum Humanity</strong> = EMP × 10 − takılı kromların Humanity kayıplarının toplamı. Humanity hiçbir zaman maksimumu aşamaz.</li>
              <li>Humanity 0'ın altına inebilir.</li>
            </ul>
            <p><strong>Basamaklar</strong></p>
            <table class="rules">
              <thead><tr><th lang="en">Humanity</th><th>Durum</th><th>Etki</th><th>Kriz DV'si</th><th>Tetikleyiciler</th></tr></thead>
              <tbody>
                <tr><td>61 ve üstü</td><td>İnsan</td><td>—</td><td>—</td><td>—</td></tr>
                <tr><td>60–41</td><td>Kopuk</td><td>Insight ve Persuasion zarlarına −1</td><td>—</td><td>—</td></tr>
                <tr><td>40–21</td><td>Sınırda</td><td>Insight ve Persuasion zarlarına −2, Concentration zarlarına −1</td><td>8</td><td>Kritik yara almak, bir dostun Ölümcül Yaralı olması</td></tr>
                <tr><td>20–1</td><td>Eşikte</td><td>Insight ve Persuasion zarları dezavantajlı, Concentration zarlarına −2</td><td>11</td><td>Yukarıdakiler ve birini öldürmek</td></tr>
                <tr><td>0 ve altı</td><td>Uçurumda</td><td>Insight, Persuasion ve Concentration zarları dezavantajlı</td><td>15, 0'ın altındaki her puan için +1</td><td>Yukarıdakiler ve Sandevistan, Kerenzikov gibi refleks kromu kullanmak</td></tr>
              </tbody>
            </table>
            <p class="note">Her basamağın etkisi bir öncekinin yerine geçer, üst üste eklenmez.</p>
            <p><strong>Cyberpsychosis krizi</strong></p>
            <ul>
              <li>Kriz yalnızca karakterin basamağındaki bir <strong>tetikleyiciyle</strong> başlar. Bir basamağa düşmek tek başına tetikleyici değildir.</li>
              <li>Bir tetikleyici yaşandığında, basamağın kriz DV'sine karşı <strong>Mental Resist</strong> atılır.</li>
              <li><strong>Sınırda ya da Eşikte</strong> atış başarısız olursa kısa süreli bir psikoz yaşanır: karakter <strong>1d6 tur</strong> boyunca GM'in kontrolüne geçer.</li>
              <li><strong>Uçurumda</strong> atış başarısız olursa karakter <strong>Cyberpsycho</strong> olur ve kalıcı olarak GM'in kontrolüne geçer.</li>
            </ul>
            <p><strong>Humanity kaybı</strong></p>
            <table class="rules">
              <thead><tr><th>Olay</th><th lang="en">Humanity</th></tr></thead>
              <tbody>
                <tr><td>Krom takmak</td><td>Kromun Humanity kaybı kadar (maksimumu düşürür)</td></tr>
                <tr><td>Küçük travma: korkunç bir şey görmek ya da yapmak</td><td>−1 ile −3 (GM önerisi)</td></tr>
                <tr><td>Ölen bir yoldaş için tören yapmamak</td><td>−6</td></tr>
                <tr><td>Ezeli düşman tarafından yenilmek</td><td>−10</td></tr>
              </tbody>
            </table>
            <p><strong>Humanity kazanımı</strong></p>
            <table class="rules text">
              <thead><tr><th>Olay</th><th lang="en">Humanity</th></tr></thead>
              <tbody>
                <tr><td>Dostlarla kutlama, sevilen biriyle vakit geçirmek gibi iyi bir etkinlik</td><td>+1 ile +3 (GM önerisi), oturum başına bir kez</td></tr>
                <tr><td>Büyük bir hedefi başarmak</td><td>+5 ile +10 (GM önerisi)</td></tr>
                <tr><td>Krom söktürmek</td><td>Maksimum Humanity kromun Humanity kaybı kadar artar; Humanity bunun yarısı kadar artar (Exorcist'in Unplug'ıyla tamamı)</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p><strong>Humanity</strong> measures how human a character still is: their bond with themselves and the people around them. Every piece of chrome installed in their body and every dark thing they live through wears that bond down a little more.</p>
            <ul>
              <li>Starting value: <strong>EMP × 10</strong>.</li>
              <li><strong>Max Humanity</strong> = EMP × 10 − the total Humanity loss of installed chrome. Humanity can never go above the maximum.</li>
              <li>Humanity can drop below 0.</li>
            </ul>
            <p><strong>Tiers</strong></p>
            <table class="rules">
              <thead><tr><th>Humanity</th><th>State</th><th>Effect</th><th>Crisis DV</th><th>Triggers</th></tr></thead>
              <tbody>
                <tr><td>61 and above</td><td>Human</td><td>—</td><td>—</td><td>—</td></tr>
                <tr><td>60–41</td><td>Detached</td><td>−1 to Insight and Persuasion rolls</td><td>—</td><td>—</td></tr>
                <tr><td>40–21</td><td>On the Edge</td><td>−2 to Insight and Persuasion rolls, −1 to Concentration rolls</td><td>8</td><td>Taking a critical injury, an ally becoming Mortally Wounded</td></tr>
                <tr><td>20–1</td><td>At the Threshold</td><td>Insight and Persuasion rolls have disadvantage, −2 to Concentration rolls</td><td>11</td><td>The above, plus killing someone</td></tr>
                <tr><td>0 and below</td><td>On the Brink</td><td>Insight, Persuasion and Concentration rolls have disadvantage</td><td>15, +1 for every point below 0</td><td>The above, plus using reflex chrome like a Sandevistan or Kerenzikov</td></tr>
              </tbody>
            </table>
            <p class="note">Each tier's effect replaces the previous one; they don't stack.</p>
            <p><strong>Cyberpsychosis crisis</strong></p>
            <ul>
              <li>A crisis only starts with a <strong>trigger</strong> from the character's tier. Dropping into a tier is not a trigger on its own.</li>
              <li>When a trigger happens, <strong>Mental Resist</strong> is rolled against the tier's crisis DV.</li>
              <li>If the roll fails <strong>On the Edge or At the Threshold</strong>, the character has a short psychotic break: the GM controls them for <strong>1d6 rounds</strong>.</li>
              <li>If the roll fails <strong>On the Brink</strong>, the character becomes a <strong>Cyberpsycho</strong> and passes to the GM for good.</li>
            </ul>
            <p><strong>Losing Humanity</strong></p>
            <table class="rules">
              <thead><tr><th>Event</th><th>Humanity</th></tr></thead>
              <tbody>
                <tr><td>Installing chrome</td><td>The chrome's Humanity loss (lowers the maximum)</td></tr>
                <tr><td>Minor trauma: seeing or doing something horrific</td><td>−1 to −3 (GM suggestion)</td></tr>
                <tr><td>Not holding a funeral for a fallen comrade</td><td>−6</td></tr>
                <tr><td>Being defeated by a nemesis</td><td>−10</td></tr>
              </tbody>
            </table>
            <p><strong>Regaining Humanity</strong></p>
            <table class="rules text">
              <thead><tr><th>Event</th><th>Humanity</th></tr></thead>
              <tbody>
                <tr><td>A good time, like celebrating with friends or spending time with a loved one</td><td>+1 to +3 (GM suggestion), once per session</td></tr>
                <tr><td>Achieving a major goal</td><td>+5 to +10 (GM suggestion)</td></tr>
                <tr><td>Having chrome removed</td><td>Maximum Humanity rises by the chrome's Humanity loss; Humanity rises by half that (all of it with the Exorcist's Unplug)</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "immunsupresan",
        label: { tr: "İmmünsupresan", en: "Immunosuppressants" },
        body: {
          tr: `
            <p><strong>İmmünsupresan</strong>, vücudun kromu reddetmesini bastıran ve zihnin cyberpsychosis'e doğru kaymasını yavaşlatan bir ilaçtır. Ripperdoc'lardan ve eczanelerden alınır.</p>
            <ul>
              <li>Bir doz almak <strong>bonus aksiyondur</strong>.</li>
              <li>Bir sonraki tam gece dinlenmesine kadar <strong>kriz zarları</strong>, yani cyberpsychosis krizine karşı atılan Mental Resist zarları, <strong>avantajlı</strong> atılır.</li>
            </ul>
            <p><strong>Tolerans:</strong> Vücut ilaca alıştıkça etkisi azalır.</p>
            <table class="rules">
              <thead><tr><th>Kullanım</th><th>Etki</th></tr></thead>
              <tbody>
                <tr><td>1. gün</td><td>Kriz zarları avantajlı</td></tr>
                <tr><td>Ardışık 2. gün</td><td>Kriz zarlarına +2</td></tr>
                <tr><td>Ardışık 3. gün ve sonrası</td><td>Etkisiz</td></tr>
                <tr><td>Bir gün ara verilirse</td><td>Tolerans sıfırlanır</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p><strong>Immunosuppressants</strong> are drugs that hold back the body's rejection of chrome and slow the mind's slide toward cyberpsychosis. They can be bought from ripperdocs and pharmacies.</p>
            <ul>
              <li>Taking a dose is a <strong>bonus action</strong>.</li>
              <li>Until the next full night's rest, <strong>crisis rolls</strong>, the Mental Resist rolls made against a cyberpsychosis crisis, <strong>have advantage</strong>.</li>
            </ul>
            <p><strong>Tolerance:</strong> the drug weakens as the body gets used to it.</p>
            <table class="rules">
              <thead><tr><th>Use</th><th>Effect</th></tr></thead>
              <tbody>
                <tr><td>Day 1</td><td>Crisis rolls have advantage</td></tr>
                <tr><td>2nd day in a row</td><td>+2 to crisis rolls</td></tr>
                <tr><td>3rd day in a row and after</td><td>No effect</td></tr>
                <tr><td>After a day off</td><td>Tolerance resets</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "krom",
        label: { tr: "Krom", en: "Chrome" },
        body: {
          tr: `
            <p><strong>Krom</strong> (cyberware), vücuda takılan sibernetik parçalardır. Kromu yalnızca <strong>ripperdoc</strong>'lar takar ve söker; karakterler onları şehirde bulur. Medtech'lerin Ripperdoc ve Exorcist specialization'ları da özelliklerinde yazdığı ölçüde bu işi yapabilir.</p>
            <p><strong>Yuvalar:</strong> Her vücut bölgesine sınırlı sayıda krom takılabilir.</p>
            <table class="rules">
              <thead><tr><th>Bölge</th><th>Yuva</th></tr></thead>
              <tbody>
                <tr><td>Nöral sistem</td><td>3</td></tr>
                <tr><td>Gözler</td><td>2</td></tr>
                <tr><td>Kollar</td><td>Her biri 1</td></tr>
                <tr><td>Bacaklar (çift)</td><td>1</td></tr>
                <tr><td>Dahili</td><td>3</td></tr>
                <tr><td>Cilt / dış görünüş</td><td>1</td></tr>
              </tbody>
            </table>
            <p><strong>Humanity kaybı ve ağırlık:</strong> Her kromun sabit bir Humanity kaybı vardır. Kromun ağırlığı doğrudan bu kayıptan belirlenir.</p>
            <table class="rules">
              <thead><tr><th><span lang="en">Humanity</span> kaybı</th><th>Ağırlık</th><th>Tamir DV'si</th></tr></thead>
              <tbody>
                <tr><td>0–5</td><td>Hafif</td><td>8</td></tr>
                <tr><td>6–10</td><td>Orta</td><td>11</td></tr>
                <tr><td>11–15</td><td>İleri</td><td>14</td></tr>
                <tr><td>16 ve üstü</td><td>Ağır</td><td>17</td></tr>
              </tbody>
            </table>
            <p>Kromun kendi metninde başka bir şey yazmıyorsa, aktive edilmesi gereken bir kromu çalıştırmak bonus aksiyondur.</p>
            <p><strong>Arıza:</strong> Arızalı krom tamir edilene kadar çalışmaz; pasif ve aktif etkileri durur. Krom takılı kaldığı için Humanity kaybı devam eder.</p>
            <table class="rules">
              <thead><tr><th>Neden</th><th>Arıza</th><th>Düzelmesi</th></tr></thead>
              <tbody>
                <tr><td>Krom bölgeye gelen kritik yara</td><td>Kalıcı</td><td>Tamir gerekir. Yaranın etkisi aynen uygulanır, ama tedavisi Medicine yerine Cybertech'tir.</td></tr>
                <tr><td>Suya düşmek, büyük bir elektrik çarpması gibi durumlar (GM önerisi)</td><td>Kalıcı</td><td>Tamir gerekir</td></tr>
                <tr><td>EMP, quickhack gibi elektronik saldırılar</td><td>Geçici</td><td>1d6 tur sonra kendiliğinden düzelir (GM önerisi)</td></tr>
              </tbody>
            </table>
            <p><strong>Tamir:</strong> Ripperdoc gerekmez. İş bir saat sürer; sonunda kromun ağırlığına göre belirlenen DV'ye karşı <strong>Cybertech</strong> atılır. Başarısız olunursa bir saat sonra yeniden denenebilir.</p>
            <div class="example"><b>Örnek</b><p>Humanity kaybı 4 olan bir krom göz hafif kromdur; arızalanırsa Cybertech DV 8 ile tamir edilir. Humanity kaybı 13 olan bir Sandevistan ileri kromdur; tamiri DV 14 ister.</p></div>
          `,
          en: `
            <p><strong>Chrome</strong> (cyberware) is cybernetic hardware installed in the body. Only <strong>ripperdocs</strong> install and remove chrome; characters find them around the city. The Medtech's Ripperdoc and Exorcist specializations can also do this work, as far as their features allow.</p>
            <p><strong>Slots:</strong> each body area can hold a limited amount of chrome.</p>
            <table class="rules">
              <thead><tr><th>Area</th><th>Slots</th></tr></thead>
              <tbody>
                <tr><td>Neural system</td><td>3</td></tr>
                <tr><td>Eyes</td><td>2</td></tr>
                <tr><td>Arms</td><td>1 each</td></tr>
                <tr><td>Legs (pair)</td><td>1</td></tr>
                <tr><td>Internal</td><td>3</td></tr>
                <tr><td>Skin / appearance</td><td>1</td></tr>
              </tbody>
            </table>
            <p><strong>Humanity loss and weight:</strong> every piece of chrome has a fixed Humanity loss. Its weight comes straight from that loss.</p>
            <table class="rules">
              <thead><tr><th>Humanity loss</th><th>Weight</th><th>Repair DV</th></tr></thead>
              <tbody>
                <tr><td>0–5</td><td>Light</td><td>8</td></tr>
                <tr><td>6–10</td><td>Medium</td><td>11</td></tr>
                <tr><td>11–15</td><td>Advanced</td><td>14</td></tr>
                <tr><td>16 and up</td><td>Heavy</td><td>17</td></tr>
              </tbody>
            </table>
            <p>Unless the chrome's own text says otherwise, activating chrome that needs to be switched on is a bonus action.</p>
            <p><strong>Malfunctions:</strong> malfunctioning chrome doesn't work until repaired; its passive and active effects stop. Since it's still installed, its Humanity loss stays.</p>
            <table class="rules">
              <thead><tr><th>Cause</th><th>Malfunction</th><th>Recovery</th></tr></thead>
              <tbody>
                <tr><td>A critical injury to a chromed area</td><td>Lasting</td><td>Needs repair. The injury's effect applies as normal, but it's treated with Cybertech instead of Medicine.</td></tr>
                <tr><td>Falling into water, a big electric shock and the like (GM suggestion)</td><td>Lasting</td><td>Needs repair</td></tr>
                <tr><td>Electronic attacks such as EMP or quickhacks</td><td>Temporary</td><td>Recovers on its own after 1d6 rounds (GM suggestion)</td></tr>
              </tbody>
            </table>
            <p><strong>Repair:</strong> No ripperdoc is needed. The work takes an hour, and at the end <strong>Cybertech</strong> is rolled against the DV for the chrome's weight. On a failure, it can be tried again an hour later.</p>
            <div class="example"><b>Example</b><p>A cybereye with Humanity loss 4 is light chrome; if it malfunctions, it's repaired with Cybertech against DV 8. A Sandevistan with Humanity loss 13 is advanced chrome; repairing it needs DV 14.</p></div>
          `,
        },
      },
      {
        id: "yuvarlama",
        label: { tr: "Yuvarlama ve Mesafeler", en: "Rounding and Distances" },
        body: {
          tr: `
            <ul>
              <li><strong>Yuvarlama:</strong> Kuralda aksi yazmıyorsa kesirli sonuçlar aşağı yuvarlanır.</li>
              <li><strong>Mesafeler</strong> metreyle verilir, çünkü her masada harita olmayabilir. Haritada oynanıyorsa bir kare 2 metredir; kurallar mesafelerin yanında kare karşılıklarını da verir.</li>
              <li>Patlayıcıların alanı, patlamanın merkezinden ölçülen bir <strong>yarıçapla</strong> verilir; patlama yuvarlak bir alanı etkiler.</li>
            </ul>
          `,
          en: `
            <ul>
              <li><strong>Rounding:</strong> Unless a rule says otherwise, fractions are rounded down.</li>
              <li><strong>Distances</strong> are given in meters, since not every table uses a map. When playing on a map, one square is 2 meters; the rules give the square count alongside distances.</li>
              <li>An explosive's area is given as a <strong>radius</strong> measured from the center of the blast; the blast covers a round area.</li>
            </ul>
          `,
        },
      },
      {
        id: "ikonik",
        label: { tr: "İkonik Eşyalar", en: "Iconic Items" },
        body: {
          tr: `
            <p><strong>İkonik eşyalar</strong> ender bulunan, lüks kalitede eşyalardır; sokakta çoğu zaman adlarıyla anılırlar. Aynı türden sıradan bir eşyanın bütün özelliklerine sahiptirler ve bunların yanında fazladan özellikleri vardır.</p>
            <ul>
              <li>Silahlar, zırhlar ve cyberware ikonik olabilir.</li>
              <li>İkonik bir eşyanın fazladan özellikleri o eşyanın bilgilerinde yazar.</li>
            </ul>
          `,
          en: `
            <p><strong>Iconic items</strong> are rare, luxury-quality items; on the street, they're often known by name. They have every property of an ordinary item of the same kind, plus extra properties of their own.</p>
            <ul>
              <li>Weapons, armor and cyberware can be iconic.</li>
              <li>An iconic item's extra properties are listed in that item's details.</li>
            </ul>
          `,
        },
      },
    ],
  },

  "rulebook/statlar-skiller": {
    intro: {
      tr: `
        <p>Sokakta herkesin iyi olduğu bir iş vardır: biri namlunun ucundaki hedefi kaçırmaz, öteki kalabalığın içinde kimin yalan söylediğini bir bakışta anlar. Bir karakterin neyi ne kadar iyi yaptığını statları ve skill'leri belirler. Statlar karakterin doğuştan getirdiği ya da yıllar içinde geliştirdiği temel yeteneklerdir; skill'ler ise bu yeteneklerle yapılan işlerdir. Atışların çoğunda skill değeri kullanılır.</p>
        <p>Sık karıştırılan iki skill için kısa bir ayrım: <strong>Perception</strong> çevreyi okur, <strong>Insight</strong> insanları okur.</p>
      `,
      en: `
        <p>Everyone on the street is good at something: one never misses what's at the end of the barrel, another can tell at a glance who in the crowd is lying. A character's stats and skills decide what they can do and how well. Stats are the basic abilities a character was born with or built up over the years; skills are the things done with those abilities. Most rolls use a skill value.</p>
        <p>Two skills are easy to mix up: <strong>Perception</strong> reads the surroundings, <strong>Insight</strong> reads people.</p>
      `,
    },
    sections: [
      {
        id: "statlar",
        label: { tr: "Statlar", en: "Stats" },
        body: {
          tr: `
            <p>Her karakterin skill veren yedi stat'ı vardır. Statlar 3 ile 20 arasında bir değer alır ve her birinin altında dört skill bulunur.</p>
            <table class="rules">
              <thead><tr><th>Stat</th><th>Karşılığı</th><th>Kapsamı</th></tr></thead>
              <tbody>
                <tr><td>INT</td><td>Zekâ</td><td>Algı, bilgi, sokak zekâsı ve hacking.</td></tr>
                <tr><td>REF</td><td>Refleks</td><td>Tepki hızı ve el-göz koordinasyonu: ateşli silahlar, sürüş ve inisiyatif.</td></tr>
                <tr><td>DEX</td><td>Çeviklik</td><td>Vücut çevikliği: hareket, gizlilik, kaçınma ve yakın dövüş silahları.</td></tr>
                <tr><td>TECH</td><td>Teknik</td><td>Cihazlar, krom, tıp ve zanaat.</td></tr>
                <tr><td>COOL</td><td>Soğukkanlılık</td><td>Karizma ve baskı altında sakin kalmak: ikna, aldatma, gözdağı ve sahne.</td></tr>
                <tr><td>WILL</td><td>İrade</td><td>Zihinsel güç: odak, sezgi, direnç ve hayatta kalma.</td></tr>
                <tr><td>BODY</td><td>Beden</td><td>Güç ve dayanıklılık. Maksimum HP'yi belirler.</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>Every character has seven stats that grant skills. Stats range from 3 to 20, and each one has four skills under it.</p>
            <table class="rules">
              <thead><tr><th>Stat</th><th>Name</th><th>Covers</th></tr></thead>
              <tbody>
                <tr><td>INT</td><td>Intelligence</td><td>Perception, knowledge, street smarts and hacking.</td></tr>
                <tr><td>REF</td><td>Reflexes</td><td>Reaction speed and hand-eye coordination: firearms, driving and initiative.</td></tr>
                <tr><td>DEX</td><td>Dexterity</td><td>Bodily agility: movement, stealth, evasion and melee weapons.</td></tr>
                <tr><td>TECH</td><td>Technique</td><td>Devices, chrome, medicine and craft.</td></tr>
                <tr><td>COOL</td><td>Cool</td><td>Charisma and keeping calm under pressure: persuasion, deception, intimidation and performance.</td></tr>
                <tr><td>WILL</td><td>Willpower</td><td>Mental strength: focus, intuition, resistance and survival.</td></tr>
                <tr><td>BODY</td><td>Body</td><td>Strength and toughness. Determines max HP.</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "emp",
        label: { tr: "EMP", en: "EMP" },
        body: {
          tr: `
            <p><strong>EMP</strong> (Empati), karakterin başkalarıyla ne kadar bağ kurabildiğini gösterir ve skill vermez. Herkeste <strong>10</strong> ile başlar; karakter oluşturulurken point buy puanlarıyla artırılabilir.</p>
            <p>EMP, karakterin Humanity değerini belirler: başlangıç Humanity'si <strong>EMP × 10</strong>'dur.</p>
          `,
          en: `
            <p><strong>EMP</strong> (Empathy) shows how well a character can connect with other people, and it grants no skills. It starts at <strong>10</strong> for everyone and can be raised with point buy points during character creation.</p>
            <p>EMP determines the character's Humanity: starting Humanity is <strong>EMP × 10</strong>.</p>
          `,
        },
      },
      {
        id: "yetkinlik",
        label: { tr: "Yetkinlik ve Ustalık", en: "Proficiency & Mastery" },
        body: {
          tr: `
            <p>Bir skill'de <strong>yetkin</strong> olan karakter o işi eğitimle ya da tecrübeyle öğrenmiştir. <strong>Ustalık</strong> ise karakterin asıl işini, yıllar geçtikçe daha da keskinleşen becerisini gösterir.</p>
            <ul>
              <li><strong>Yetkinlik puanları:</strong> Karakter oluşturulurken her stat, modifier'ı kadar yetkinlik puanı verir. Bu puanlar yalnızca o stat'ın skill'lerine harcanabilir. Modifier'ı 0 ya da eksi olan stat puan vermez.</li>
              <li>Bir puan harcanan skill'de karakter <strong>yetkin</strong> olur (+1); iki puan harcanan skill'de <strong>çok yetkin</strong> olur (+2). Bir skill'e en fazla iki puan harcanabilir.</li>
              <li>Puanları, karakter oluşturulurken point buy ile alınan değerler belirler. Bir stat sonradan artsa da yeni yetkinlik puanı gelmez.</li>
              <li>3. ve 7. seviyede 2'şer yetkinlik puanı daha kazanılır. Bu puanlar stata bağlı değildir, herhangi bir skill'e harcanabilir; ama bir skill yine en fazla +2 olabilir.</li>
              <li><strong>Ustalık:</strong> 1. seviyede, yetkin ya da çok yetkin olunan bir skill seçilir ve o skill'e <strong>Ustalık modifier'ı</strong> eklenir. 9. seviyede aynı şekilde bir skill daha seçilir.</li>
              <li>Ustalık modifier'ı seviyeyle artar: 1. seviyede +1, 5. seviyede +2, 11. seviyede +3. Ustalık verilen skill'lerin değeri de bununla birlikte artar.</li>
            </ul>
            <div class="example"><b>Örnek</b><p>DEX'i 14 olan bir karakterin DEX modifier'ı +2'dir; DEX ona 2 yetkinlik puanı verir. İkisini de Stealth'e harcayan karakter Stealth'te çok yetkin olur (+2). 1. seviyede Ustalığını da Stealth'e verirse Stealth değeri 2 + 2 + 1 = <strong>+5</strong> olur. 5. seviyede Ustalık modifier'ı +2'ye çıkınca bu değer +6 olur.</p></div>
          `,
          en: `
            <p>A character who is <strong>proficient</strong> in a skill has learned that work through training or experience. <strong>Mastery</strong> marks what the character is truly known for: a skill that only gets sharper over the years.</p>
            <ul>
              <li><strong>Proficiency points:</strong> During character creation, each stat gives proficiency points equal to its modifier. These points can only be spent on that stat's skills. A stat with a modifier of 0 or less gives no points.</li>
              <li>One point spent on a skill makes the character <strong>proficient</strong> in it (+1); two points make them <strong>highly proficient</strong> (+2). No more than two points can be spent on a single skill.</li>
              <li>The points come from the values bought with point buy during character creation. A stat that goes up later grants no new proficiency points.</li>
              <li>2 more proficiency points are gained at level 3, and 2 more at level 7. These aren't tied to a stat and can go to any skill, but a skill still can't go above +2.</li>
              <li><strong>Mastery:</strong> At level 1, a skill the character is proficient or highly proficient in is chosen, and the <strong>Mastery modifier</strong> is added to it. Another skill is chosen the same way at level 9.</li>
              <li>The Mastery modifier grows with level: +1 at level 1, +2 at level 5, +3 at level 11. The skills with Mastery grow along with it.</li>
            </ul>
            <div class="example"><b>Example</b><p>A character with DEX 14 has a DEX modifier of +2, so DEX gives them 2 proficiency points. Spending both on Stealth makes them highly proficient in it (+2). If they also put their level 1 Mastery into Stealth, their Stealth is 2 + 2 + 1 = <strong>+5</strong>. At level 5, when the Mastery modifier rises to +2, it becomes +6.</p></div>
          `,
        },
      },
      {
        id: "int",
        label: { tr: "INT Skill'leri", en: "INT Skills" },
        body: {
          tr: `
            <p>INT (Zekâ) algıyı, bilgiyi, sokak zekâsını ve hacking'i kapsar.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Kullanımı</th></tr></thead>
              <tbody>
                <tr><td>Perception (Algı)</td><td>Çevreyi gözlemek: ipucu bulmak, tehlikeyi ya da saklanan birini fark etmek.</td></tr>
                <tr><td>Netrunning</td><td>Cyberdeck ile NET'e bağlanmak ve sistemlere sızmak.</td></tr>
                <tr><td>Lore (Bilgi)</td><td>Tarih, şirketler, çeteler, bilim gibi konularda bilgi sahibi olmak.</td></tr>
                <tr><td>Streetwise (Sokak Bilgisi)</td><td>Sokağın dilini bilmek: karaborsa, söylentiler, kimin kime çalıştığı.</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>INT (Intelligence) covers perception, knowledge, street smarts and hacking.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Used for</th></tr></thead>
              <tbody>
                <tr><td>Perception</td><td>Reading the surroundings: finding clues, noticing danger or someone hiding.</td></tr>
                <tr><td>Netrunning</td><td>Jacking into the NET with a cyberdeck and breaking into systems.</td></tr>
                <tr><td>Lore</td><td>Knowing about history, corporations, gangs, science and the like.</td></tr>
                <tr><td>Streetwise</td><td>Knowing the street: the black market, rumors, who works for whom.</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "ref",
        label: { tr: "REF Skill'leri", en: "REF Skills" },
        body: {
          tr: `
            <p>REF (Refleks) tepki hızını ve el-göz koordinasyonunu kapsar. Ateşli silahlar, sürüş ve inisiyatif REF'e bağlıdır.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Kullanımı</th></tr></thead>
              <tbody>
                <tr><td>Handgun (Tabancalar)</td><td>Tabanca ve SMG kullanmak.</td></tr>
                <tr><td>Shoulder Arms (Tüfekler)</td><td>Pompalı, saldırı tüfeği ve keskin nişancı tüfeği kullanmak.</td></tr>
                <tr><td>Heavy Weapons (Ağır Silahlar)</td><td>Bomba atar ve roketatar gibi ağır silahları kullanmak.</td></tr>
                <tr><td>Driving (Sürüş)</td><td>Araç kullanmak, kovalamaca ve tehlikeli manevralar.</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>REF (Reflexes) covers reaction speed and hand-eye coordination. Firearms, driving and initiative all depend on it.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Used for</th></tr></thead>
              <tbody>
                <tr><td>Handgun</td><td>Using pistols and SMGs.</td></tr>
                <tr><td>Shoulder Arms</td><td>Using shotguns, assault rifles and sniper rifles.</td></tr>
                <tr><td>Heavy Weapons</td><td>Using heavy weapons such as grenade launchers and rocket launchers.</td></tr>
                <tr><td>Driving</td><td>Driving vehicles, chases and risky maneuvers.</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "dex",
        label: { tr: "DEX Skill'leri", en: "DEX Skills" },
        body: {
          tr: `
            <p>DEX (Çeviklik) vücudun çevikliğini kapsar. Hareket, gizlilik, kaçınma ve yakın dövüş silahları DEX'e bağlıdır.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Kullanımı</th></tr></thead>
              <tbody>
                <tr><td>Athletics (Atletizm)</td><td>Tırmanmak, atlamak, koşmak, yüzmek ve el bombası atmak.</td></tr>
                <tr><td>Stealth (Gizlilik)</td><td>Gizlenmek, sessizce hareket etmek, pusu kurmak.</td></tr>
                <tr><td>Evasion (Kaçınma)</td><td>Yakın dövüş saldırılarından, mermilerden ve patlamalardan kaçınmak.</td></tr>
                <tr><td>Melee Weapons (Dövüş Silahları)</td><td>Bıçak, katana, Mantis Blades gibi yakın dövüş silahlarını kullanmak.</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>DEX (Dexterity) covers bodily agility. Movement, stealth, evasion and melee weapons all depend on it.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Used for</th></tr></thead>
              <tbody>
                <tr><td>Athletics</td><td>Climbing, jumping, running, swimming and throwing grenades.</td></tr>
                <tr><td>Stealth</td><td>Hiding, moving quietly, setting ambushes.</td></tr>
                <tr><td>Evasion</td><td>Avoiding melee attacks, bullets and explosions.</td></tr>
                <tr><td>Melee Weapons</td><td>Using melee weapons such as knives, katanas and Mantis Blades.</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "tech",
        label: { tr: "TECH Skill'leri", en: "TECH Skills" },
        body: {
          tr: `
            <p>TECH (Teknik) cihazları, kromu, tıbbı ve zanaati kapsar.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Kullanımı</th></tr></thead>
              <tbody>
                <tr><td>Hardware (Donanım)</td><td>Elle takılan cihazlarla hack yapmak: kapı panelleri, kart okuyucular, kameralar, alarmlar. Bomba imhası da bu skill'le yapılır. İnsanları ve kromu etkilemez.</td></tr>
                <tr><td>Cybertech (Siber Teknik)</td><td>Kromu anlamak, bakımını ve tamirini yapmak.</td></tr>
                <tr><td>Medicine (Tıp)</td><td>Stabilize etmek, ilk yardım ve tedavi.</td></tr>
                <tr><td>Craft (Zanaat)</td><td>Silah, zırh, mermi ve eşya yapmak, modifiye etmek ve tamir etmek. Mekanik kilitler de bu skill'le açılır. Alet Çantası olmadan tamir atışları dezavantajlıdır.</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>TECH (Technique) covers devices, chrome, medicine and craft.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Used for</th></tr></thead>
              <tbody>
                <tr><td>Hardware</td><td>Hacking with handheld devices: door panels, card readers, cameras, alarms. Bomb disposal also uses this skill. Never affects people or chrome.</td></tr>
                <tr><td>Cybertech</td><td>Understanding, maintaining and repairing chrome.</td></tr>
                <tr><td>Medicine</td><td>Stabilizing, first aid and treatment.</td></tr>
                <tr><td>Craft</td><td>Making, modifying and repairing weapons, armor, ammo and gear. Mechanical locks are also opened with this skill. Without a Tool Kit, repair rolls have disadvantage.</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "cool",
        label: { tr: "COOL Skill'leri", en: "COOL Skills" },
        body: {
          tr: `
            <p>COOL (Soğukkanlılık) karizmayı ve baskı altında sakin kalabilmeyi kapsar. İkna, aldatma, gözdağı ve sahne COOL'a bağlıdır.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Kullanımı</th></tr></thead>
              <tbody>
                <tr><td>Persuasion (İkna)</td><td>İkna etmek, pazarlık yapmak.</td></tr>
                <tr><td>Deception (Aldatma)</td><td>Yalan söylemek, blöf yapmak, kandırmak.</td></tr>
                <tr><td>Intimidation (Gözdağı)</td><td>Korkutmak, tehdit etmek, sindirmek.</td></tr>
                <tr><td>Performance (Performans)</td><td>Sahne, müzik, oyunculuk, taklit.</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>COOL (Cool) covers charisma and keeping calm under pressure. Persuasion, deception, intimidation and performance all depend on it.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Used for</th></tr></thead>
              <tbody>
                <tr><td>Persuasion</td><td>Convincing people, negotiating.</td></tr>
                <tr><td>Deception</td><td>Lying, bluffing, tricking people.</td></tr>
                <tr><td>Intimidation</td><td>Scaring, threatening, cowing people.</td></tr>
                <tr><td>Performance</td><td>Stage, music, acting, impersonation.</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "will",
        label: { tr: "WILL Skill'leri", en: "WILL Skills" },
        body: {
          tr: `
            <p>WILL (İrade) zihinsel gücü kapsar. Odak, sezgi, direnç ve hayatta kalma WILL'e bağlıdır.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Kullanımı</th></tr></thead>
              <tbody>
                <tr><td>Concentration (Konsantrasyon)</td><td>Uzun süren bir işte dikkat dağıtıcılara karşı odağı korumak.</td></tr>
                <tr><td>Insight (Sezgi)</td><td>İnsanları okumak: niyetini, yalanını, duygusunu sezmek.</td></tr>
                <tr><td>Mental Resist (Mental Direnç)</td><td>Korkuya, baskıya ve zihinsel etkilere direnmek. Cyberpsychosis krizlerinde de bu skill atılır.</td></tr>
                <tr><td>Survival (Hayatta Kalma)</td><td>Zor koşullarda yolunu bulmak: iz sürmek, barınak ve yön bulmak.</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>WILL (Willpower) covers mental strength. Focus, intuition, resistance and survival all depend on it.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Used for</th></tr></thead>
              <tbody>
                <tr><td>Concentration</td><td>Keeping focus on a long task despite distractions.</td></tr>
                <tr><td>Insight</td><td>Reading people: sensing their intent, lies and feelings.</td></tr>
                <tr><td>Mental Resist</td><td>Resisting fear, pressure and mental effects. It is also rolled in cyberpsychosis crises.</td></tr>
                <tr><td>Survival</td><td>Getting by in hard conditions: tracking, finding shelter and direction.</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "body",
        label: { tr: "BODY Skill'leri", en: "BODY Skills" },
        body: {
          tr: `
            <p>BODY (Beden) gücü ve dayanıklılığı kapsar ve maksimum HP'yi belirler.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Kullanımı</th></tr></thead>
              <tbody>
                <tr><td>Brawling (Kavga)</td><td>Çıplak elle dövüşmek ve boğuşmak.</td></tr>
                <tr><td>Endurance (Dayanıklılık)</td><td>Yorgunluğa, uykusuzluğa, açlığa ve acıya dayanmak.</td></tr>
                <tr><td>Resist Toxin (Toksin Direnci)</td><td>Zehirlere ve toksinlere direnmek.</td></tr>
                <tr><td>Strength (Güç)</td><td>Kaldırmak, itmek, kapı kırmak.</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>BODY (Body) covers strength and toughness, and determines max HP.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Used for</th></tr></thead>
              <tbody>
                <tr><td>Brawling</td><td>Fighting barehanded and grappling.</td></tr>
                <tr><td>Endurance</td><td>Withstanding fatigue, sleeplessness, hunger and pain.</td></tr>
                <tr><td>Resist Toxin</td><td>Resisting poisons and toxins.</td></tr>
                <tr><td>Strength</td><td>Lifting, pushing, breaking doors.</td></tr>
              </tbody>
            </table>
          `,
        },
      },
    ],
  },

  "players-guide/roller": {
    sidebar: ["class-table", "class-gear"], // soldaki panelde sınıf tablosu ve seçili sınıfın başlangıç envanteri
    tool: "class-detail", // seçili sınıfın açıklaması sayfada
  },

  "oyna/cyberpunk-green": {
    toc: false, // "Bu sayfada" paneli gösterilmez
    intro: {
      tr: `
        <p>GM'ler burada masa oluşturur ve oyuncularını masaya ekler; oyuncular da üyesi oldukları masaları bu sayfada görür. Bir masa, GM'i içeri girdiğinde açılır ve oyuncular ancak o zaman katılabilir. İçeride 5 dakika boyunca kimse kalmazsa masa kendiliğinden kapanır. Masa simülasyonu henüz yapım aşamasındadır.</p>
      `,
      en: `
        <p>GMs create tables here and add their players; players see the tables they belong to on this page. A table opens when its GM enters it, and players can only join once it's open. If nobody is at a table for 5 minutes, it closes on its own. The tabletop simulation is still under construction.</p>
      `,
    },
    tool: "tables", // GM'de Masa Oluştur ve Masalarım, oyuncuda Oyunlarım (js/auth.js)
  },

  "araclar/dukkan-olusturucu": {
    toc: false, // "Bu sayfada" paneli gösterilmez
    // GM'lere ve yöneticilere sol panelde kayıtlı dükkanları (js/auth.js) gösterilir; sayfa başlığı yine görünür
    sidebar: "shop-saves",
    sidebarAccess: "gm",
    keepHeader: true,
    intro: {
      tr: `
        <p>Night City'de her köşe başında bir dükkan vardır ve hiçbirinin rafı her gün aynı değildir. Bu araç, GM'in bir dükkanın o gün neler sattığını hızlıca çıkarabilmesi için hazırlanmıştır. Önce dükkanın türü seçilir; ardından değer aralığı, fiyat aralığı, etiket koşulları ve ürün sayısı ayarlanır. Şimdilik Silahçı, Cyberware ve Eczane dükkanları oluşturulabilir. <span class="draft">Taslak</span></p>
        <p>GM hesapları oluşturdukları dükkanı listenin altından kaydedebilir; kayıtlı dükkanlar soldaki panelden yeniden yüklenir.</p>
      `,
      en: `
        <p>Every corner in Night City has a shop, and no shop's shelves look the same two days running. This tool lets the GM quickly work out what a shop is selling today. First the type of shop is chosen; then the value range, price range, tag conditions and number of products are set. For now, armories, cyberware shops and pharmacies can be generated. <span class="draft">Draft</span></p>
        <p>GM accounts can save a generated shop from below the list; saved shops are loaded again from the panel on the left.</p>
      `,
    },
    sections: [{ id: "dukkan", label: { tr: "Dükkan", en: "Shop" }, tool: "shop-generator" }],
  },

  // Düşmanlar / NPC'ler (js/npc.js): sol panel yok, sayfa ikiye bölünür (liste ve karakter kağıdı)
  "gm/dusmanlar-npcler": {
    toc: false,
    wide: true,
    tool: "npc-book",
  },

  // NPC oluşturma (js/npc.js): Karakter Oluştur gibi; sol panelde aşamalar, sayfada NPC kağıdı ve seçili aşama
  "gm/npc-olustur": {
    sidebar: "npc-steps",
    sidebarAccess: "admin",
    keepHeader: true,
    tool: "npc-create",
  },

  // Karakter oluşturma aracı (js/charcreate.js): sol panelde aşamalar, sayfada yalnızca seçili aşama
  "araclar/karakter-olustur": {
    sidebar: ["char-steps", "char-saves"], // giriş yapanlara aşamaların altında kayıtlı karakterleri (js/auth.js) gösterilir
    roleAware: true,
    keepHeader: true,
    tool: "char-create",
  },

  "araclar/hazir-karakterler": { toc: false, wide: true, roleAware: true, tool: "ready-chars" },

  "araclar/stat-dagitma": {
    toc: false, // "Bu sayfada" paneli gösterilmez
    intro: {
      tr: `
        <p>Statlar point buy ile belirlenir. Her stat <strong>8</strong>'den başlar ve toplam <strong>29</strong> puanlık bir bütçe harcanarak artırılır. Stat yükseldikçe her adımın maliyeti artar; bir stat en fazla 20'ye çıkarılabilir.</p>
        <p>EMP herkeste 10'dan başlar; istenirse aynı bütçeden ve aynı adım maliyetleriyle artırılabilir.</p>
        <p>Point buy ile alınan her stat, modifier'ı kadar <strong>yetkinlik puanı</strong> verir; bu puanlar o stat'ın skill'lerine harcanır. <strong>Ekstra</strong> sütununa point buy dışından gelen artış ve azalışlar, örneğin seviye atlarken kazanılan stat puanları yazılır. Ekstra değerler modifier'ı değiştirir ama yetkinlik puanı vermez.</p>
      `,
      en: `
        <p>Stats are set with point buy. Every stat starts at <strong>8</strong> and is raised by spending from a budget of <strong>29</strong> points. The higher a stat goes, the more each step costs; no stat can go above 20.</p>
        <p>EMP starts at 10 for everyone; if desired, it can be raised from the same budget, with the same cost per step.</p>
        <p>Each stat bought this way gives <strong>proficiency points</strong> equal to its modifier, to be spent on that stat's skills. The <strong>Extra</strong> column is for increases and decreases from outside point buy, such as stat points gained when leveling up. Extra values change the modifier but give no proficiency points.</p>
      `,
    },
    sections: [
      { id: "dagitim", label: { tr: "Dağıtım", en: "Allocation" }, tool: "pointbuy" },
      { id: "bonuslar", label: { tr: "Bonuslar", en: "Bonuses" }, tool: "pointbuy-bonuses" },
      {
        id: "maliyet",
        label: { tr: "Maliyet Tablosu", en: "Cost Table" },
        body: {
          tr: `
            <table class="rules">
              <thead><tr><th>Değer</th><th>Toplam maliyet</th></tr></thead>
              <tbody>
                <tr><td>8</td><td>0</td></tr>
                <tr><td>9</td><td>1</td></tr>
                <tr><td>10</td><td>2</td></tr>
                <tr><td>11</td><td>3</td></tr>
                <tr><td>12</td><td>4</td></tr>
                <tr><td>13</td><td>5</td></tr>
                <tr><td>14</td><td>7</td></tr>
                <tr><td>15</td><td>9</td></tr>
                <tr><td>16</td><td>12</td></tr>
                <tr><td>17</td><td>15</td></tr>
                <tr><td>18</td><td>19</td></tr>
                <tr><td>19</td><td>23</td></tr>
                <tr><td>20</td><td>28</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <table class="rules">
              <thead><tr><th>Value</th><th>Total cost</th></tr></thead>
              <tbody>
                <tr><td>8</td><td>0</td></tr>
                <tr><td>9</td><td>1</td></tr>
                <tr><td>10</td><td>2</td></tr>
                <tr><td>11</td><td>3</td></tr>
                <tr><td>12</td><td>4</td></tr>
                <tr><td>13</td><td>5</td></tr>
                <tr><td>14</td><td>7</td></tr>
                <tr><td>15</td><td>9</td></tr>
                <tr><td>16</td><td>12</td></tr>
                <tr><td>17</td><td>15</td></tr>
                <tr><td>18</td><td>19</td></tr>
                <tr><td>19</td><td>23</td></tr>
                <tr><td>20</td><td>28</td></tr>
              </tbody>
            </table>
          `,
        },
      },
    ],
  },

  "rulebook/karakter-yaratma": {
    intro: {
      tr: `
        <p>Her edgerunner bir yerden gelir: bir çete mahallesinden, bir şirket kulesinin alt katlarından, Badlands'te bir konvoydan. Karakter oluşturmak, o yeri ve o hikâyeyi karakter kağıdına dökmektir. Adımlar aşağıdaki sırayla izlenir.</p>
        <p class="note"><a href="#araclar/karakter-olustur">Araçlar › Karakter Oluştur</a> aynı adımları sırayla izler ve karakter kağıdını adım adım doldurur.</p>
      `,
      en: `
        <p>Every edgerunner comes from somewhere: a gang block, the lower floors of a corporate tower, a convoy out in the Badlands. Creating a character means putting that place and that story onto a character sheet. Follow the steps below in order.</p>
        <p class="note"><a href="#araclar/karakter-olustur">Tools › Create a Character</a> walks through the same steps in order and fills in the character sheet as you go.</p>
      `,
    },
    sections: [
      {
        id: "planla",
        label: { tr: "1. Karakteri Planla", en: "1. Plan the Character" },
        body: {
          tr: `
            <p>İlk adımda ne zar vardır ne sayı. Oyuncu önce karakterinin kim olduğunu düşünür:</p>
            <ul>
              <li><strong>Kim?</strong> Adı, sokaktaki lakabı, yaşı, nasıl göründüğü ve nasıl biri olduğu.</li>
              <li><strong>Geçmişi ne?</strong> Nerede büyüdüğü, onu bugüne getiren olaylar, geride bıraktığı insanlar ve kapanmamış hesaplar.</li>
              <li><strong>Ne işle uğraşıyor?</strong> Sokakta hangi işle hayatta kaldığı ve ekibe ne kattığı.</li>
            </ul>
            <p>Bu cevaplar sonraki adımlara yön verir: hangi sınıfın seçileceğine, hangi statların öne çıkacağına ve hangi skill'lerde yetkin olunacağına.</p>
          `,
          en: `
            <p>The first step has no dice and no numbers. The player starts by thinking about who their character is:</p>
            <ul>
              <li><strong>Who are they?</strong> Their name, their street handle, their age, how they look and what kind of person they are.</li>
              <li><strong>What's their past?</strong> Where they grew up, what brought them here, the people they left behind and the scores still unsettled.</li>
              <li><strong>What do they do?</strong> What work keeps them alive on the street, and what they bring to the crew.</li>
            </ul>
            <p>These answers guide the steps that follow: which Role to pick, which stats to push and which skills to become proficient in.</p>
          `,
        },
      },
      {
        id: "sinif",
        label: { tr: "2. Sınıf", en: "2. Role" },
        body: {
          tr: `
            <p>Sınıf, karakterin sokaktaki işini ve ekipteki yerini belirler. Altı sınıf vardır: <span lang="en">Solo, Netrunner, Medtech, Rockerboy, Lawman</span> ve <span lang="en">Nomad</span>.</p>
            <p>Her sınıf 1. seviyede bir <strong>çekirdek feat</strong> alır. Sınıfların çekirdek feat'leri, feat havuzları, başlangıç envanterleri ve specialization'ları <a href="#players-guide/roller">Oyuncu Rehberi › Sınıflar</a> sayfasındadır. Specialization 3. seviyede seçilir.</p>
          `,
          en: `
            <p>A Role decides what a character does on the street and where they stand in the crew. There are six Roles: Solo, Netrunner, Medtech, Rockerboy, Lawman and Nomad.</p>
            <p>Every Role gets a <strong>core feat</strong> at level 1. Each Role's core feat, feat pool, starting kit and specializations are on the <a href="#players-guide/roller">Player's Guide › Roles</a> page. The specialization is chosen at level 3.</p>
          `,
        },
      },
      {
        id: "statlar",
        label: { tr: "3. Statlar", en: "3. Stats" },
        body: {
          tr: `
            <p>Yedi stat (INT, REF, DEX, TECH, COOL, WILL, BODY) iki yoldan biriyle belirlenir:</p>
            <ul>
              <li><strong>Point buy:</strong> Her stat 8'den başlar ve <strong>29</strong> puanlık bir bütçe harcanarak artırılır. Stat yükseldikçe her adımın maliyeti artar; bir stat en fazla 20 olabilir. Maliyetler <a href="#araclar/stat-dagitma">Araçlar › Stat Dağıtma</a> sayfasında yazar.</li>
              <li><strong>Sabit dizi:</strong> 15, 14, 13, 12, 10, 10 ve 8 değerleri yedi stata birer kez dağıtılır.</li>
            </ul>
            <p><strong>EMP</strong> herkeste 10'dan başlar. Point buy kullanılıyorsa aynı bütçeden ve aynı adım maliyetleriyle artırılabilir; sabit dizide 10'da kalır.</p>
          `,
          en: `
            <p>The seven stats (INT, REF, DEX, TECH, COOL, WILL, BODY) are set in one of two ways:</p>
            <ul>
              <li><strong>Point buy:</strong> Every stat starts at 8 and is raised by spending a budget of <strong>29</strong> points. Each step costs more the higher the stat goes; a stat can be at most 20. The costs are on the <a href="#araclar/stat-dagitma">Tools › Point Buy</a> page.</li>
              <li><strong>Standard array:</strong> The values 15, 14, 13, 12, 10, 10 and 8 are assigned to the seven stats, each once.</li>
            </ul>
            <p><strong>EMP</strong> starts at 10 for everyone. With point buy it can be raised from the same budget at the same step costs; with the standard array it stays at 10.</p>
          `,
        },
      },
      {
        id: "skiller",
        label: { tr: "4. Skill'ler", en: "4. Skills" },
        body: {
          tr: `
            <p>Her stat, modifier'ı kadar <strong>yetkinlik puanı</strong> verir. Bu puanlar yalnızca o stat'ın dört skill'ine harcanabilir. Bir puan harcanan skill'de karakter yetkin (+1), iki puan harcanan skill'de çok yetkin (+2) olur. Modifier'ı 0 ya da eksi olan stat puan vermez.</p>
            <p>Ardından yetkin ya da çok yetkin olunan skill'lerden biri seçilir ve ona <strong>Ustalık</strong> verilir: o skill'e Ustalık modifier'ı (1. seviyede +1) eklenir.</p>
            <p>Ayrıntılar <a href="#rulebook/statlar-skiller">Kural Kitabı › Statlar ve Skill'ler</a> sayfasındadır.</p>
          `,
          en: `
            <p>Each stat grants <strong>proficiency points</strong> equal to its modifier. These points can only be spent on that stat's four skills. One point in a skill makes the character proficient (+1); two points make them highly proficient (+2). A stat with a modifier of 0 or less grants no points.</p>
            <p>Then one skill the character is proficient or highly proficient in is chosen and given <strong>Mastery</strong>: the Mastery modifier (+1 at level 1) is added to that skill.</p>
            <p>The details are on the <a href="#rulebook/statlar-skiller">Rulebook › Stats &amp; Skills</a> page.</p>
          `,
        },
      },
      {
        id: "feat",
        label: { tr: "5. Feat", en: "5. Feat" },
        body: {
          tr: `
            <p>Çekirdek feat'in yanında karakter 1. seviyede <strong>1 feat puanı</strong> kazanır. Bu puanla sınıfının ya da tarafsız havuzun 1. aşama feat'lerinden biri alınabilir. Puan hemen harcanmak zorunda değildir; sonraya saklanabilir. 7. adımdaki cyberware puanlarından 1 feat puanı daha elde edilebilir. Feat'ler <a href="#players-guide/featler">Oyuncu Rehberi › Feat'ler</a> sayfasında listelenir.</p>
          `,
          en: `
            <p>Besides the core feat, a character earns <strong>1 feat point</strong> at level 1. It can buy one tier 1 feat from their Role's pool or from the general pool. The point doesn't have to be spent right away; it can be saved for later. One more feat point can be gained from the cyberware points in step 7. Feats are listed on the <a href="#players-guide/featler">Player's Guide › Feats</a> page.</p>
          `,
        },
      },
      {
        id: "quickhack",
        label: { tr: "6. Quickhack Kütüphanesi", en: "6. Quickhack Library" },
        body: {
          tr: `
            <p>Yalnızca Netrunner'lar için: Netrunner, kütüphanesine I. kademe quickhack'lerden <strong>3</strong> tane ekler. Specialization quickhack'leri 3. seviyede açılır. Kütüphane ve kademeler <a href="#players-guide/netrunning">Oyuncu Rehberi › Netrunning</a> sayfasında anlatılır.</p>
          `,
          en: `
            <p>Netrunners only: the Netrunner adds <strong>3</strong> tier I quickhacks to their library. Specialization quickhacks open up at level 3. The library and the tiers are explained on the <a href="#players-guide/netrunning">Player's Guide › Netrunning</a> page.</p>
          `,
        },
      },
      {
        id: "cyberware",
        label: { tr: "7. Cyberware", en: "7. Cyberware" },
        body: {
          tr: `
            <p>Karakter cyberware için <strong>3 puan</strong> alır. Bu puanlar <a href="#players-guide/cyberware">Oyuncu Rehberi › Cyberware</a> listesinde <strong>Başlangıç</strong> etiketi taşıyan parçalara harcanır; her parça 1 puan tutar. Puanların 2'si istenirse <strong>1 feat puanına</strong> çevrilebilir. Aynı parça iki kez alınamaz ve bir vücut bölgesinin yuva sınırı aşılamaz. Her parçanın Humanity kaybı karakterin maksimum Humanity'sinden düşülür.</p>
          `,
          en: `
            <p>A character gets <strong>3 points</strong> for cyberware. They're spent on pieces tagged <strong>Starting</strong> in the <a href="#players-guide/cyberware">Player's Guide › Cyberware</a> list, and each piece costs 1 point. If the player likes, 2 of the points can be converted into <strong>1 feat point</strong>. The same piece can't be taken twice, and a body area's slot limit can't be exceeded. Each piece's Humanity loss is subtracted from the character's maximum Humanity.</p>
          `,
        },
      },
      {
        id: "esyalar",
        label: { tr: "8. Başlangıç Eşyaları ve Diller", en: "8. Starting Gear and Languages" },
        body: {
          tr: `
            <p>Karakter, sınıfının başlangıç envanterindeki eşyaları alır; her sınıfın envanteri Oyuncu Rehberi › Sınıflar sayfasında yazar.</p>
            <p>Her karakter <span lang="en">Streetslang</span> bilir. Sınıfı ya da feat'leri ek dil hakkı veriyorsa ek dillerini <a href="#lore/diller">Evren › Diller</a> listesinden seçer.</p>
          `,
          en: `
            <p>The character takes the items in their Role's starting kit; each Role's kit is listed on the Player's Guide › Roles page.</p>
            <p>Every character speaks Streetslang. If their Role or feats grant extra languages, they pick them from the <a href="#lore/diller">Lore › Languages</a> list.</p>
          `,
        },
      },
      {
        id: "hesaplar",
        label: { tr: "9. Son Hesaplar", en: "9. Final Numbers" },
        body: {
          tr: `
            <p>Kalan değerler verilen kararlardan hesaplanır:</p>
            <table class="rules text">
              <thead><tr><th>Değer</th><th>Nasıl bulunur</th></tr></thead>
              <tbody>
                <tr><td>HP</td><td>10 + 2 × BODY</td></tr>
                <tr><td><span lang="en">Humanity</span></td><td>EMP × 10 − takılı kromların Humanity kayıpları</td></tr>
                <tr><td>Skill değeri</td><td>Stat modifier + yetkinlik + Ustalık (varsa) + diğer bonuslar</td></tr>
                <tr><td>İnisiyatif</td><td>d10 + REF modifier</td></tr>
                <tr><td>Hareket</td><td>Tur başına 12 metre (6 kare)</td></tr>
                <tr><td><span lang="en">Luck</span></td><td>Oturum başına 3 puan</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>The remaining values follow from the choices made so far:</p>
            <table class="rules text">
              <thead><tr><th>Value</th><th>How it's found</th></tr></thead>
              <tbody>
                <tr><td>HP</td><td>10 + 2 × BODY</td></tr>
                <tr><td>Humanity</td><td>EMP × 10 − the Humanity loss of installed chrome</td></tr>
                <tr><td>Skill value</td><td>Stat modifier + proficiency + Mastery (if any) + other bonuses</td></tr>
                <tr><td>Initiative</td><td>d10 + REF modifier</td></tr>
                <tr><td>Movement</td><td>12 meters (6 squares) per turn</td></tr>
                <tr><td>Luck</td><td>3 points per session</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "seviye",
        label: { tr: "Başlangıç Seviyesi", en: "Starting Level" },
        body: {
          tr: `
            <p>Karakterler genellikle 1. seviyeden başlar. GM isterse oyunu daha yüksek bir seviyeden başlatabilir; bu durumda karakter o seviyeye kadarki bütün seviyelerin kazanımlarını alır. Kazanımlar <a href="#rulebook/seviye-ilerlemesi">Kural Kitabı › Seviye Atlama</a> sayfasında yazar.</p>
          `,
          en: `
            <p>Characters usually start at level 1. The GM can start the game at a higher level; in that case each character gets the gains of every level up to it. The gains are listed on the <a href="#rulebook/seviye-ilerlemesi">Rulebook › Level Progression</a> page.</p>
          `,
        },
      },
    ],
  },
  "rulebook/seviye-ilerlemesi": {
    intro: {
      tr: `
        <p>Sokakta hayatta kalan herkes her işten bir şey öğrenerek çıkar. Cyberpunk Green'de bu birikim seviyelerle gösterilir. Karakterler genellikle 1. seviyede başlar; GM isterse onları daha yüksek bir seviyeden başlatabilir. En yüksek seviye 12'dir.</p>
      `,
      en: `
        <p>Everyone who survives the street walks away from every job having learned something. In Cyberpunk Green, that growth is measured in levels. Characters usually start at level 1, though the GM can start them at a higher level. The highest level is 12.</p>
      `,
    },
    sections: [
      {
        id: "ne-zaman",
        label: { tr: "Ne Zaman Seviye Atlanır", en: "When to Level Up" },
        body: {
          tr: `
            <p>Karakterlerin ne zaman seviye atlayacağına GM karar verir ve hikâyeye uyan yolu seçer:</p>
            <ul>
              <li><strong>Önemli aşamalar:</strong> Hikâyenin önemli bir aşaması tamamlandığında seviye atlanır; büyük bir işin bitmesi ya da ekibin peşindeki bir düşmanın alt edilmesi gibi.</li>
              <li><strong>Oturum sayısı:</strong> Belirli sayıda oturum tamamlandığında, örneğin her üç oturumda bir, seviye atlanır.</li>
            </ul>
          `,
          en: `
            <p>The GM decides when characters level up, choosing whichever way suits the campaign:</p>
            <ul>
              <li><strong>Milestones:</strong> Characters level up when an important stage of the campaign is completed, such as finishing a big job or taking down an enemy who has been hunting the crew.</li>
              <li><strong>Session count:</strong> Characters level up after a set number of sessions, for example every three sessions.</li>
            </ul>
          `,
        },
      },
      {
        id: "kazanimlar",
        label: { tr: "Seviye Atlayınca", en: "On Leveling Up" },
        body: {
          tr: `
            <p>Seviye atlayan karakter yeni yetenekler kazanır. Aşağıdaki tablo bütün sınıflarda ortak olan kazanımları gösterir. Çekirdek feat'in, specialization özelliklerinin ve sınıfa ait diğer ilavelerin ne olduğu <a href="#players-guide/roller">Oyuncu Rehberi › Sınıflar</a> sayfasında, her sınıfın kendi seviye listesinde yazar.</p>
            <table class="rules text">
              <thead><tr><th>Seviye</th><th>Kazanımlar</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Çekirdek feat, 1 feat puanı, 1 Ustalık (Ustalık modifier'ı +1)</td></tr>
                <tr><td>2</td><td>1 feat puanı</td></tr>
                <tr><td>3</td><td>Specialization seçimi, 2 yetkinlik puanı</td></tr>
                <tr><td>4</td><td>2 feat puanı, 2. aşama feat'ler açılır</td></tr>
                <tr><td>5</td><td>Specialization özelliği, Ustalık modifier'ı +2'ye çıkar</td></tr>
                <tr><td>6</td><td>1 feat puanı; ayrıca başka bir sınıfın 1. aşama feat'lerine erişim ya da bunun yerine 1 feat puanı daha</td></tr>
                <tr><td>7</td><td>Stat artışı (iki adet +1 stat puanı), 2 yetkinlik puanı</td></tr>
                <tr><td>8</td><td>Specialization özelliği, 1 feat puanı</td></tr>
                <tr><td>9</td><td>Specialization özelliği, 1 Ustalık daha</td></tr>
                <tr><td>10</td><td>1 feat puanı</td></tr>
                <tr><td>11</td><td>Ustalık modifier'ı +3'e çıkar</td></tr>
                <tr><td>12</td><td>1 feat puanı</td></tr>
              </tbody>
            </table>
            <ul>
              <li>HP seviyeyle artmaz. Karakterin gücü feat'lerden, skill'lerden ve kromdan gelir.</li>
              <li>Feat puanları hemen harcanmak zorunda değildir; biriktirilebilir.</li>
            </ul>
          `,
          en: `
            <p>A character who levels up gains new abilities. The table below shows the gains shared by every role. Each role's core feat, specialization features and other role-specific additions are listed in that role's own level list on the <a href="#players-guide/roller">Player's Guide › Roles</a> page.</p>
            <table class="rules text">
              <thead><tr><th>Level</th><th>Gains</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Core feat, 1 feat point, 1 Mastery (Mastery modifier +1)</td></tr>
                <tr><td>2</td><td>1 feat point</td></tr>
                <tr><td>3</td><td>Choice of specialization, 2 proficiency points</td></tr>
                <tr><td>4</td><td>2 feat points, tier 2 feats open up</td></tr>
                <tr><td>5</td><td>Specialization feature, Mastery modifier rises to +2</td></tr>
                <tr><td>6</td><td>1 feat point, plus access to another role's tier 1 feats or 1 more feat point instead</td></tr>
                <tr><td>7</td><td>Stat increase (two +1 stat points), 2 proficiency points</td></tr>
                <tr><td>8</td><td>Specialization feature, 1 feat point</td></tr>
                <tr><td>9</td><td>Specialization feature, 1 more Mastery</td></tr>
                <tr><td>10</td><td>1 feat point</td></tr>
                <tr><td>11</td><td>Mastery modifier rises to +3</td></tr>
                <tr><td>12</td><td>1 feat point</td></tr>
              </tbody>
            </table>
            <ul>
              <li>HP does not increase with level. A character's power grows through feats, skills and chrome.</li>
              <li>Feat points don't have to be spent right away; they can be saved up.</li>
            </ul>
          `,
        },
      },
    ],
  },

  "rulebook/aksiyon-ekonomisi": {
    intro: {
      tr: `
        <p>Night City'de bir çatışma çoğu zaman birkaç saniye sürer ve kimin ayakta kalacağı o birkaç saniyede belli olur. Bu yüzden savaş, her biri yaklaşık 3 saniyelik <strong>tur</strong>lara bölünür. Her turda karakterler inisiyatif sırasına göre birer kez oynar; sırası gelen karakterin oynadığı bu bölüme o karakterin <strong>turu</strong> denir. Bu sayfa, bir karakterin kendi turunda ve başkalarının turlarında neler yapabileceğini anlatır.</p>
      `,
      en: `
        <p>In Night City, a firefight usually lasts a few seconds, and those few seconds decide who is still standing. That's why combat is split into <strong>rounds</strong> of about 3 seconds each. In each round, characters act once each, in initiative order; the part of the round in which a character acts is that character's <strong>turn</strong>. This page covers what a character can do on their own turn and on everyone else's.</p>
      `,
    },
    sections: [
      {
        id: "tur",
        label: { tr: "Bir Tur", en: "A Turn" },
        body: {
          tr: `
            <p>Her karakter kendi turunda şunları kullanabilir:</p>
            <ul>
              <li><strong>1 aksiyon:</strong> Turdaki asıl iş, örneğin saldırmak, reload yapmak ya da birini stabilize etmek.</li>
              <li><strong>1 bonus aksiyon:</strong> Kısa ve hızlı bir iş, örneğin silah çekmek ya da siper almak.</li>
              <li><strong>Hareket:</strong> 12 metreye (6 kare) kadar.</li>
            </ul>
            <p>Bunlara ek olarak karakter, bir şeye karşılık vermek için <strong>Reaction</strong> kullanabilir. Reaction'ların sayısı sınırlıdır:</p>
            <ul>
              <li>Kendi turunda en fazla <strong>2</strong> Reaction kullanılabilir.</li>
              <li>Kendi turunun dışında, yani başkalarının turlarında, bir sonraki turuna kadar yalnızca <strong>1</strong> Reaction kullanılabilir.</li>
            </ul>
            <p>Bazı feat'ler ve kromlar bu sayıları artırabilir.</p>
          `,
          en: `
            <p>On their own turn, every character can use:</p>
            <ul>
              <li><strong>1 action:</strong> The main thing they do that turn, such as attacking, reloading or stabilizing someone.</li>
              <li><strong>1 bonus action:</strong> Something short and quick, such as drawing a weapon or taking cover.</li>
              <li><strong>Movement:</strong> Up to 12 meters (6 squares).</li>
            </ul>
            <p>On top of that, a character can use <strong>Reactions</strong> to respond to something. The number of Reactions is limited:</p>
            <ul>
              <li>Up to <strong>2</strong> Reactions can be used during the character's own turn.</li>
              <li>Outside their own turn, on other characters' turns, only <strong>1</strong> Reaction can be used until their next turn.</li>
            </ul>
            <p>Some feats and chrome can raise these numbers.</p>
          `,
        },
      },
      {
        id: "aksiyon",
        label: { tr: "Aksiyon", en: "Action" },
        body: {
          tr: `
            <p><strong>Aksiyon</strong>, karakterin turundaki asıl iştir. Zaman ve dikkat isteyen, çatışmanın gidişatını değiştiren hamleler aksiyon harcar. Her karakterin turunda 1 aksiyonu vardır.</p>
            <ul>
              <li><strong>Saldırı</strong> bir aksiyondur. Bu aksiyonla silahın ROF'u kadar saldırı yapılır. Otomatik ateş ve baskı ateşi de normal saldırının yerine, aynı aksiyonla açılır.</li>
              <li>Reload yapmak, birini stabilize etmek, birini yakalamak, araç sürmek ve koşmak da birer aksiyondur.</li>
              <li><strong>Aimed Shot</strong>, aksiyonla bonus aksiyonu birlikte harcar ve dezavantajla atılır.</li>
            </ul>
            <p>Bir işin neye mal olduğu bu sayfanın sonundaki maliyet tablosunda ya da o işin kendi kuralında yazar.</p>
          `,
          en: `
            <p>An <strong>action</strong> is the main thing a character does on their turn. Moves that take time and attention, or that change how the fight goes, cost an action. Every character has 1 action on their turn.</p>
            <ul>
              <li><strong>Attacking</strong> takes an action. With that action, the character makes as many attacks as the weapon's ROF. Autofire and suppressive fire also use that same action, in place of normal attacks.</li>
              <li>Reloading, stabilizing someone, grabbing someone, driving a vehicle and running each take an action as well.</li>
              <li>An <strong>Aimed Shot</strong> uses both the action and the bonus action and is rolled with disadvantage.</li>
            </ul>
            <p>What a task costs is listed in the cost table at the end of this page or in that task's own rule.</p>
          `,
        },
      },
      {
        id: "bonus-aksiyon",
        label: { tr: "Bonus Aksiyon", en: "Bonus Action" },
        body: {
          tr: `
            <p><strong>Bonus aksiyon</strong>, asıl işin yanında yapılan kısa ve hızlı bir iş içindir. Her karakterin turunda 1 bonus aksiyonu vardır.</p>
            <p>Bonus aksiyon <strong>hiçbir zaman saldırı için kullanılamaz.</strong> Bu kuralın istisnası Netrunner'ın quickhack'leridir: Netrunner için quickhack kullanmak, quickhack bir saldırı olsa bile bonus aksiyondur.</p>
            <p>Bonus aksiyonla yapılabilecek işler:</p>
            <ul>
              <li>Silah çekmek ya da değiştirmek</li>
              <li>Enjektör kullanmak</li>
              <li>Krom aktive etmek</li>
              <li>Siper almak</li>
            </ul>
            <p>Bonus aksiyonla yapılan bir iş, o tur bonus aksiyon zaten harcanmışsa aksiyon harcanarak da yapılabilir.</p>
          `,
          en: `
            <p>A <strong>bonus action</strong> is for something short and quick, done alongside the main thing. Every character has 1 bonus action on their turn.</p>
            <p>A bonus action can <strong>never be used to attack.</strong> The exception is the Netrunner's quickhacks: for a Netrunner, using a quickhack is a bonus action, even when the quickhack is an attack.</p>
            <p>Things that can be done as a bonus action:</p>
            <ul>
              <li>Drawing or switching a weapon</li>
              <li>Using an injector</li>
              <li>Activating chrome</li>
              <li>Taking cover</li>
            </ul>
            <p>A bonus-action task can also be done with the action if the bonus action has already been used that turn.</p>
          `,
        },
      },
      {
        id: "reaction",
        label: { tr: "Reaction", en: "Reaction" },
        body: {
          tr: `
            <p><strong>Reaction</strong>, bir şeye karşılık olarak, çoğu zaman başka bir karakterin turunda kullanılır. Bir Reaction'ın ne zaman kullanılabileceğini onu veren kural, feat ya da krom belirtir; bazıları karakterin kendi turunda da kullanılır. En sık kullanılanlar şunlardır:</p>
            <ul>
              <li><strong>Mermiden kaçmak:</strong> Ateşli bir silahla yapılan saldırı isabet edecekse karakter Reaction harcayıp Evasion atabilir. Bu atışa saldıran silaha göre eksi uygulanır; sonuç menzil DV'sinden yüksekse saldırının yeni DV'si olur.</li>
              <li><strong>Patlamadan kaçmak:</strong> Bir patlamanın alanında kalan karakter Reaction harcayıp Evasion atabilir. Başarılı olursa patlamadan tamamen kurtulur.</li>
              <li><strong>Fırsat saldırısı:</strong> Bitişikteki bir düşman bitişikten çıkarsa karakter Reaction harcayıp ona bir yakın dövüş saldırısı yapabilir.</li>
            </ul>
            <p>Kendi turunda en fazla 2, kendi turunun dışında ise bir sonraki turuna kadar yalnızca 1 Reaction kullanılabilir. Mermiden kaçmak normalde <strong>tur başına yalnızca bir kez</strong> yapılabilir. Kendi turunun dışında kullanılabilecek Reaction sayısını artıran kromlar, mermiden kaçma sayısını da aynı kadar artırır.</p>
            <p>Yakın dövüş saldırısına karşı atılan Evasion bedavadır ve Reaction harcamaz. Savunmanın ve patlamaların ayrıntıları <a href="#rulebook/savas">Kural Kitabı › Savaş</a> sayfasındadır.</p>
          `,
          en: `
            <p>A <strong>Reaction</strong> is used in response to something, usually on another character's turn. The rule, feat or chrome that grants a Reaction says when it can be used; some are used on the character's own turn as well. The most common ones are:</p>
            <ul>
              <li><strong>Dodging bullets:</strong> When a firearm attack would hit them, a character can spend a Reaction to roll Evasion. The roll takes a penalty based on the attacking weapon; if the result is higher than the range DV, it becomes the attack's new DV.</li>
              <li><strong>Escaping a blast:</strong> A character caught in an explosion's area can spend a Reaction to roll Evasion. On a success, they escape the blast completely.</li>
              <li><strong>Opportunity attack:</strong> If an adjacent enemy leaves the character's reach, the character can spend a Reaction to make a melee attack against them.</li>
            </ul>
            <p>Up to 2 Reactions can be used during a character's own turn; outside it, only 1 until their next turn. Dodging bullets can normally be done <strong>only once per round</strong>. Chrome that raises the number of Reactions usable outside a character's own turn raises the number of dodges by the same amount.</p>
            <p>Rolling Evasion against a melee attack is free and doesn't use a Reaction. The details of defense and explosions are on the <a href="#rulebook/savas">Rulebook › Combat</a> page.</p>
          `,
        },
      },
      {
        id: "hareket",
        label: { tr: "Hareket", en: "Movement" },
        body: {
          tr: `
            <p>Her karakter kendi turunda <strong>12 metreye (6 kare)</strong> kadar hareket edebilir. Hareket aksiyon harcamaz.</p>
            <ul>
              <li><strong>Koşmak:</strong> Aksiyonunu harcayan karakter o tur 12 metre (6 kare) daha hareket edebilir.</li>
              <li>Zırh, yaralar, feat'ler ve krom bu mesafeyi artırabilir ya da azaltabilir.</li>
            </ul>
            <p>Haritada 1 kare 2 metredir; çapraz hareket de 1 kare sayılır. Zorlu arazi, tırmanma ve düşme kuralları <a href="#rulebook/savas">Kural Kitabı › Savaş</a> sayfasının Harita ve Hareket bölümündedir.</p>
          `,
          en: `
            <p>On their own turn, every character can move up to <strong>12 meters (6 squares)</strong>. Moving doesn't cost an action.</p>
            <ul>
              <li><strong>Running:</strong> A character who spends their action can move 12 more meters (6 squares) that turn.</li>
              <li>Armor, wounds, feats and chrome can raise or lower this distance.</li>
            </ul>
            <p>One square on the map is 2 meters; diagonal movement also counts as 1 square. The rules for difficult terrain, climbing and falling are in the Map &amp; Movement section of the <a href="#rulebook/savas">Rulebook › Combat</a> page.</p>
          `,
        },
      },
      {
        id: "maliyetler",
        label: { tr: "Eylemlerin Maliyeti", en: "Action Costs" },
        body: {
          tr: `
            <p>Savaşta sık yapılan işlerin neye mal olduğu aşağıda toplanmıştır.</p>
            <table class="rules">
              <thead><tr><th>Eylem</th><th>Maliyet</th></tr></thead>
              <tbody>
                <tr><td>Kısa bir şey söylemek</td><td>Bedava</td></tr>
                <tr><td>Yakın dövüş saldırısına karşı Evasion atmak</td><td>Bedava</td></tr>
                <tr><td>Bir dosta bir şey söyleyip cevap almak</td><td>Bonus aksiyon</td></tr>
                <tr><td>Zar gerektiren sosyal hamle (tehdit, blöf)</td><td>Bonus aksiyon</td></tr>
                <tr><td>Boğuşmada tutmaya devam etmek ya da kurtulmaya çalışmak</td><td>Bonus aksiyon</td></tr>
                <tr><td>Quickhack kullanmak (Netrunner)</td><td>Bonus aksiyon</td></tr>
                <tr><td>Saldırı</td><td>Aksiyon</td></tr>
                <tr><td>Otomatik ateş ya da baskı ateşi</td><td>Aksiyon</td></tr>
                <tr><td>Reload</td><td>Aksiyon</td></tr>
                <tr><td>Stabilize etmek</td><td>Aksiyon</td></tr>
                <tr><td>Birini yakalamak (boğuşma)</td><td>Aksiyon</td></tr>
                <tr><td>Araç sürmek</td><td>Aksiyon</td></tr>
                <tr><td>Cihaz kullanmak (Hardware)</td><td>Aksiyon</td></tr>
                <tr><td>Koşmak: 12 metre ilave koşma mesafesi</td><td>Aksiyon</td></tr>
                <tr><td>Aimed Shot</td><td>Aksiyon + Bonus aksiyon, dezavantajlı</td></tr>
                <tr><td>Mermiden kaçmak</td><td>Reaction (normalde tur başına bir kez)</td></tr>
                <tr><td>Patlamadan kaçmak</td><td>Reaction</td></tr>
                <tr><td>Fırsat saldırısı</td><td>Reaction</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>The costs of things commonly done in combat are collected below.</p>
            <table class="rules">
              <thead><tr><th>Task</th><th>Cost</th></tr></thead>
              <tbody>
                <tr><td>Saying something short</td><td>Free</td></tr>
                <tr><td>Rolling Evasion against a melee attack</td><td>Free</td></tr>
                <tr><td>Telling an ally something and getting an answer</td><td>Bonus action</td></tr>
                <tr><td>A social move that needs a roll (threat, bluff)</td><td>Bonus action</td></tr>
                <tr><td>Keeping a hold or trying to break free in a grapple</td><td>Bonus action</td></tr>
                <tr><td>Using a quickhack (Netrunner)</td><td>Bonus action</td></tr>
                <tr><td>Attack</td><td>Action</td></tr>
                <tr><td>Autofire or suppressive fire</td><td>Action</td></tr>
                <tr><td>Reload</td><td>Action</td></tr>
                <tr><td>Stabilizing someone</td><td>Action</td></tr>
                <tr><td>Grabbing someone (grapple)</td><td>Action</td></tr>
                <tr><td>Driving a vehicle</td><td>Action</td></tr>
                <tr><td>Using a device (Hardware)</td><td>Action</td></tr>
                <tr><td>Running: 12 meters of extra running distance</td><td>Action</td></tr>
                <tr><td>Aimed Shot</td><td>Action + Bonus action, with disadvantage</td></tr>
                <tr><td>Dodging bullets</td><td>Reaction (normally once per round)</td></tr>
                <tr><td>Escaping a blast</td><td>Reaction</td></tr>
                <tr><td>Opportunity attack</td><td>Reaction</td></tr>
              </tbody>
            </table>
          `,
        },
      },
    ],
  },

  "rulebook/savas": {
    intro: {
      tr: `
        <p>Cyberpunk Green'de savaş hızlı ve ölümcüldür; en tecrübeli edgerunner bile tek bir kötü kararla yere serilebilir. HP seviyeyle artmaz; bu yüzden hayatta kalmanın asıl yolu zırh, siper ve doğru konumdur. Bu bölüm bir çatışmanın nasıl yürütüldüğünü, ilk inisiyatif zarından son ölüm kurtarma atışına kadar anlatır.</p>
      `,
      en: `
        <p>Combat in Cyberpunk Green is fast and lethal; even the most seasoned edgerunner can be put down by a single bad call. HP does not grow with level, so armor, cover and good positioning are what really keep a character alive. This chapter covers how a fight is run, from the first initiative roll to the last death save.</p>
      `,
    },
    sections: [
      {
        id: "inisiyatif",
        label: { tr: "İnisiyatif", en: "Initiative" },
        body: {
          tr: `
            <p>Silahlar çekildiğinde kimin önce davranacağını refleksler belirler. Savaş başladığında çatışmaya katılan herkes inisiyatif atar:</p>
            <div class="formula">d10 + REF modifier</div>
            <p>Karakterler her turda bu sıraya göre, en yüksek sonuçtan en düşüğe doğru oynar. Bir tur yaklaşık <strong>3 saniye</strong> sürer.</p>
            <p><strong>Eşitlik:</strong> İnisiyatif sonuçları eşit olan karakterlerden DEX'i yüksek olan önce oynar. DEX'ler de eşitse bu karakterler birer d10 atar; yüksek atan önce oynar. Zarlar da eşit gelirse yeniden atılır.</p>
          `,
          en: `
            <p>When the guns come out, reflexes decide who moves first. When combat starts, everyone taking part rolls initiative:</p>
            <div class="formula">d10 + REF modifier</div>
            <p>Each round, characters act in this order, from the highest result to the lowest. A round lasts about <strong>3 seconds</strong>.</p>
            <p><strong>Ties:</strong> Among characters with the same initiative result, the one with the higher DEX goes first. If their DEX is also equal, each of them rolls a d10 and the higher roll goes first. If the dice tie too, they roll again.</p>
          `,
        },
      },
      {
        id: "savunma",
        label: { tr: "Saldırı ve Savunma", en: "Attack & Defense" },
        body: {
          tr: `
            <p>Bir saldırının isabet edip etmediği, saldıranın silahına göre iki farklı yolla belirlenir.</p>
            <p><strong>Yakın dövüş:</strong> Saldıran, yakın dövüş silahıyla saldırıyorsa <strong>Melee Weapons</strong>, yumrukla saldırıyorsa <strong>Brawling</strong> atar. Savunan buna karşı <strong>Evasion</strong> atar; bu atış bedavadır ve Reaction harcamaz. Saldıranın sonucu daha yüksekse saldırı isabet eder. Eşitlikte savunan kazanır.</p>
            <p><strong>Ateşli silahlar:</strong> Saldıran, silahının skill'iyle (Handgun, Shoulder Arms ya da Heavy Weapons) menzile göre belirlenen DV'ye karşı atar. Saldırı zarı atıldıktan sonra saldırı isabet edecekse hedef, isterse <strong>Reaction</strong>'ını harcayıp mermiden kaçmayı deneyebilir: Evasion atar ve bu atışa saldıranın silahına göre aşağıdaki eksi uygulanır. Sonuç menzil DV'sinden yüksekse saldırının yeni DV'si olur.</p>
            <p>Bir karakter mermiden normalde <strong>tur başına yalnızca bir kez</strong> kaçabilir. Kendi turunun dışında kullanılabilecek Reaction sayısını artıran kromlar bu sayıyı da aynı kadar artırır.</p>
            <table class="rules">
              <thead><tr><th>Saldıran silah</th><th><span lang="en">Evasion</span> eksisi</th></tr></thead>
              <tbody>
                <tr><td>Handgun</td><td>−2</td></tr>
                <tr><td>Shoulder Arms</td><td>−4</td></tr>
                <tr><td>Heavy Weapons</td><td>−6</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>Whether an attack hits is decided in one of two ways, depending on the attacker's weapon.</p>
            <p><strong>Melee:</strong> The attacker rolls <strong>Melee Weapons</strong> when attacking with a melee weapon, or <strong>Brawling</strong> when punching. The defender rolls <strong>Evasion</strong> against it; this roll is free and doesn't use a Reaction. If the attacker's result is higher, the attack hits. The defender wins ties.</p>
            <p><strong>Firearms:</strong> The attacker rolls the weapon's skill (Handgun, Shoulder Arms or Heavy Weapons) against a DV set by range. Once the attack is rolled, if it would hit, the target may spend their <strong>Reaction</strong> to try to dodge: they roll Evasion, with the penalty below for the attacker's weapon. If the result is higher than the range DV, it becomes the attack's new DV.</p>
            <p>A character can normally dodge bullets <strong>only once per round</strong>. Chrome that raises the number of Reactions usable outside their own turn raises this number by the same amount.</p>
            <table class="rules">
              <thead><tr><th>Attacking weapon</th><th>Evasion penalty</th></tr></thead>
              <tbody>
                <tr><td>Handgun</td><td>−2</td></tr>
                <tr><td>Shoulder Arms</td><td>−4</td></tr>
                <tr><td>Heavy Weapons</td><td>−6</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "saldiri-cozumu",
        label: { tr: "Saldırının Çözümü", en: "Resolving an Attack" },
        body: {
          tr: `
            <p>Bir saldırı her zaman aynı sırayla çözülür:</p>
            <ul>
              <li><strong>Saldırı zarı:</strong> Saldıran, silahının skill'iyle atar. Sonucun yakın dövüşte hedefin Evasion sonucunu, ateşli silahlarda menzil DV'sini geçmesi gerekir. Siper ve hedefin mermiden kaçma atışı bu DV'yi değiştirebilir.</li>
              <li><strong>İsabet bölgesi:</strong> Aimed Shot yapılmadıysa saldırı gövdeye isabet eder.</li>
              <li><strong>Hasar:</strong> Silahın hasar zarları atılır. Toplamdan isabet alan bölgedeki zırhın SP'si (yakın dövüşte yarısı) çıkarılır ve kalan hasar HP'den düşer. Zırh, delinsin ya da delinmesin, 1 SP aşınır.</li>
              <li><strong>Kritik yara:</strong> Hasar zarlarında iki ya da daha fazla 6 varsa ve hasar SP'yi geçtiyse, hedef zırhı yok sayan 5 hasar daha alır ve isabet bölgesinin tablosundan bir kritik yara atılır.</li>
              <li><strong>Yara durumu:</strong> HP maksimumun yarısının altına indiyse hedef Ağır Yaralı, 0'a indiyse Ölümcül Yaralı olur. Zaten Ölümcül Yaralı olan bir hedefe gelen isabet, ölüm kurtarma atışlarında bir başarısızlık sayılır.</li>
            </ul>
            <div class="example"><b>Örnek</b><p>Shoulder Arms değeri +4 olan bir karakter, ideal mesafede ve kısmi siperin arkasında duran bir hedefe saldırı tüfeğiyle ateş ediyor. DV 8'e siper için 2 ekleniyor ve DV 10 oluyor. Hedef mermiden kaçmayı denemiyor. Zarda 7 geliyor: 7 + 4 = 11, saldırı isabet ediyor ve gövdeye geliyor. 5d6 hasar zarlarında 6, 6, 3, 2 ve 1 geliyor; toplam 18. Hedefin gövde zırhı SP 7 olduğu için HP'ye 11 hasar geçiyor ve zırhın SP'si 6'ya düşüyor. Zarlarda iki 6 olduğu ve hasar SP'yi geçtiği için kritik yara oluşuyor: hedef 5 hasar daha alıyor ve Gövde tablosunda 1d8 atılıyor.</p></div>
          `,
          en: `
            <p>An attack is always resolved in the same order:</p>
            <ul>
              <li><strong>Attack roll:</strong> The attacker rolls their weapon's skill. In melee, the roll has to beat the target's Evasion result; with firearms, it has to beat the range DV. Cover and the target's dodge roll can change that DV.</li>
              <li><strong>Hit location:</strong> Unless an Aimed Shot was made, the attack hits the body.</li>
              <li><strong>Damage:</strong> The weapon's damage dice are rolled. The SP of the armor at the location hit (half of it in melee) is subtracted from the total, and the rest comes off HP. The armor loses 1 SP to ablation, whether it was penetrated or not.</li>
              <li><strong>Critical injury:</strong> If the damage dice show two or more 6s and the damage beat the SP, the target takes 5 more damage that ignores armor, and a critical injury is rolled on the hit location's table.</li>
              <li><strong>Wound state:</strong> If HP drops below half of maximum, the target is Seriously Wounded; at 0, they are Mortally Wounded. A hit on a target who is already Mortally Wounded counts as a death save failure.</li>
            </ul>
            <div class="example"><b>Example</b><p>A character with Shoulder Arms +4 fires an assault rifle at a target who is at the weapon's ideal range and behind partial cover. The DV of 8 goes up by 2 for the cover, to DV 10. The target doesn't try to dodge. The die shows a 7: 7 + 4 = 11, so the attack hits, and it hits the body. The 5d6 damage dice show 6, 6, 3, 2 and 1, for a total of 18. The target's body armor is SP 7, so 11 damage goes through to HP and the armor drops to SP 6. Since the dice show two 6s and the damage beat the SP, it's a critical injury: the target takes 5 more damage and 1d8 is rolled on the Body table.</p></div>
          `,
        },
      },
      {
        id: "harita",
        label: { tr: "Harita ve Hareket", en: "Map & Movement" },
        body: {
          tr: `
            <p>Bir çatışmada doğru yerde durmak, çoğu zaman iyi nişan almak kadar önemlidir. Savaşta mesafeler kare ve metreyle ölçülür:</p>
            <ul>
              <li>Haritada 1 kare <strong>2 metre</strong>dir.</li>
              <li>Her karakter turunda <strong>12 metreye (6 kare)</strong> kadar hareket edebilir; buna temel hareket denir.</li>
              <li>Çapraz gidilen bir kare de 1 kare sayılır.</li>
            </ul>
            <p><strong>Zorlu arazi:</strong> Enkaz, kalabalık, sığ su, kaygan zemin ya da çalılık gibi zorlu arazide her kare <strong>2 kare</strong> hareket harcar.</p>
            <p><strong>Tırmanma:</strong> Tırmanırken her kare için <strong>2 kare</strong> hareket harcanır. Merdiven, ip ya da bol tutamağı olan kolay yüzeylerde zar atılmaz. Zor bir yüzeye tırmanılan her turda <strong>Athletics</strong> atılır:</p>
            <table class="rules">
              <thead><tr><th>Yüzey</th><th>DV</th></tr></thead>
              <tbody>
                <tr><td>Tuğla duvar, çit</td><td>8</td></tr>
                <tr><td>Pürüzsüz duvar, yağmurda kaygan yüzey</td><td>11</td></tr>
                <tr><td>Cam cephe, düz metal</td><td>14</td></tr>
              </tbody>
            </table>
            <p>Atışta başarısız olan karakter o tur ilerleyemez. Zarda doğal 1 gelirse düşer.</p>
            <p><strong>Zıplama:</strong></p>
            <ul>
              <li><strong>Uzun atlama:</strong> Önce en az 4 metre (2 kare) koşan karakter, BODY'sinin üçte biri kadar metre uzağa atlar. Durduğu yerden atlarsa bu mesafenin yarısı kadar atlar.</li>
              <li><strong>Yüksek atlama:</strong> Koşarak atlayan karakter 1 metre + BODY modifier'ı başına 30 santimetre yükseğe atlar. Durduğu yerden atlarsa bunun yarısı kadar atlar.</li>
              <li>Atlanan mesafe karakterin hareketinden düşer.</li>
            </ul>
            <div class="example"><b>Örnek</b><p>BODY'si 15 olan bir karakter koşarak 5 metre, durduğu yerden 2 metre uzağa atlar. BODY modifier'ı +2 olduğu için koşarak 160 santimetre, durduğu yerden 80 santimetre yükseğe atlar.</p></div>
            <p><strong>Düşme:</strong></p>
            <ul>
              <li>İlk <strong>4 metre</strong> (2 kare) hasarsızdır.</li>
              <li>Bundan sonraki her <strong>2 metre</strong> için <strong>1d6</strong> hasar alınır; hasar en fazla <strong>10d6</strong> olur.</li>
              <li>Düşme hasarına zırh işlemez.</li>
              <li>Düşen karakter <strong>DV 11</strong>'e karşı <strong>Athletics</strong> atabilir. Başarılı olursa düşüşü yuvarlanarak karşılar ve hasar yarıya iner.</li>
              <li>Kritik yara kuralı düşmede de geçerlidir. İsabet bölgesi bacak sayılır ve yara Uzuv tablosunun bacak sütunundan belirlenir.</li>
            </ul>
            <div class="example"><b>Örnek</b><p>10 metreden düşen bir karakter, ilk 4 metreden sonraki 6 metre için 3d6 hasar alır. Athletics atışında başarılı olursa hasar yarıya iner.</p></div>
          `,
          en: `
            <p>In a firefight, standing in the right place often matters as much as aiming well. Distances in combat are measured in squares and meters:</p>
            <ul>
              <li>One square on the map is <strong>2 meters</strong>.</li>
              <li>A character can move up to <strong>12 meters (6 squares)</strong> on their turn; this is their base movement.</li>
              <li>Moving one square diagonally also counts as 1 square.</li>
            </ul>
            <p><strong>Difficult terrain:</strong> In difficult terrain such as rubble, crowds, shallow water, slick floors or brush, every square costs <strong>2 squares</strong> of movement.</p>
            <p><strong>Climbing:</strong> While climbing, every square costs <strong>2 squares</strong> of movement. Easy surfaces such as ladders, ropes or walls with plenty of handholds need no roll. On a hard surface, <strong>Athletics</strong> is rolled each turn spent climbing:</p>
            <table class="rules">
              <thead><tr><th>Surface</th><th>DV</th></tr></thead>
              <tbody>
                <tr><td>Brick wall, fence</td><td>8</td></tr>
                <tr><td>Smooth wall, surface slick with rain</td><td>11</td></tr>
                <tr><td>Glass facade, flat metal</td><td>14</td></tr>
              </tbody>
            </table>
            <p>On a failure, no progress is made that turn. On a natural 1, the climber falls.</p>
            <p><strong>Jumping:</strong></p>
            <ul>
              <li><strong>Long jump:</strong> After running at least 4 meters (2 squares), a character jumps a number of meters equal to a third of their BODY. From a standing start, they jump half that distance.</li>
              <li><strong>High jump:</strong> With a running start, a character jumps 1 meter + 30 centimeters per point of BODY modifier. From a standing start, they jump half that.</li>
              <li>The distance jumped comes out of the character's movement.</li>
            </ul>
            <div class="example"><b>Example</b><p>A character with BODY 15 jumps 5 meters with a running start, or 2 meters from a standing start. With a BODY modifier of +2, they clear 160 centimeters with a running start, or 80 centimeters from a standing start.</p></div>
            <p><strong>Falling:</strong></p>
            <ul>
              <li>The first <strong>4 meters</strong> (2 squares) deal no damage.</li>
              <li>After that, every <strong>2 meters</strong> deals <strong>1d6</strong> damage, up to a maximum of <strong>10d6</strong>.</li>
              <li>Armor doesn't apply to falling damage.</li>
              <li>The falling character can roll <strong>Athletics</strong> against <strong>DV 11</strong>. On a success, they roll with the fall and the damage is halved.</li>
              <li>The critical injury rule applies to falls too. The hit location counts as a leg, and the injury is taken from the leg column of the Limb table.</li>
            </ul>
            <div class="example"><b>Example</b><p>A character who falls 10 meters takes 3d6 damage for the 6 meters past the first 4. With a successful Athletics roll, the damage is halved.</p></div>
          `,
        },
      },
      {
        id: "firsat",
        label: { tr: "Fırsat Saldırısı", en: "Opportunity Attacks" },
        body: {
          tr: `
            <p>Bitişikteki bir düşman karakterin yanından uzaklaşıp bitişikten çıkarsa karakter <strong>Reaction</strong> harcayıp ona bir <strong>fırsat saldırısı</strong> yapabilir. Bu, normal bir yakın dövüş saldırısıdır ve hedef Evasion ile karşılık verir.</p>
            <ul>
              <li>Elinde yakın dövüş silahı olan karakter Melee Weapons atar ve silahının hasarını verir.</li>
              <li>Elinde ateşli silah olan karakter silahın kabzasıyla vurur: Brawling atar ve yumruk hasarı verir.</li>
              <li>Eli boş olan karakter yumrukla vurur.</li>
            </ul>
          `,
          en: `
            <p>If an adjacent enemy moves away and leaves the character's reach, the character can spend a <strong>Reaction</strong> to make an <strong>opportunity attack</strong> against them. It's a normal melee attack, and the target answers with Evasion.</p>
            <ul>
              <li>A character holding a melee weapon rolls Melee Weapons and deals the weapon's damage.</li>
              <li>A character holding a firearm strikes with its grip or stock: they roll Brawling and deal punch damage.</li>
              <li>A character with empty hands throws a punch.</li>
            </ul>
          `,
        },
      },
      {
        id: "menzil",
        label: { tr: "Menzil", en: "Range" },
        body: {
          tr: `
            <p>Pompalı tüfek dar bir koridorda, keskin nişancı tüfeği ise iki blok ötedeki bir çatıda işe yarar. Ateşli silahlarla yapılan saldırıların DV'si, hedefin uzaklığına ve silahın ideal mesafesine göre belirlenir. Mesafeler dört basamağa ayrılır:</p>
            <table class="rules">
              <thead><tr><th>Mesafe</th><th>Kare</th><th>Metre</th></tr></thead>
              <tbody>
                <tr><td>Yakın</td><td>1–3</td><td>6 m'ye kadar</td></tr>
                <tr><td>Orta</td><td>4–12</td><td>8–24 m</td></tr>
                <tr><td>Uzak</td><td>13–50</td><td>26–100 m</td></tr>
                <tr><td>Çok uzak</td><td>51+</td><td>100 m+</td></tr>
              </tbody>
            </table>
            <p>Her silahın bir <strong>ideal mesafesi</strong> vardır ve bu mesafe silahın bilgilerinde yazar. İdeal mesafedeki bir hedefe yapılan saldırının DV'si <strong>8</strong>'dir. İdeal mesafeden yakına ya da uzağa doğru her basamakta DV <strong>3</strong> artar: 11, 14, 17.</p>
            <table class="rules">
              <thead><tr><th>Örnek silah</th><th>İdeal mesafe</th></tr></thead>
              <tbody>
                <tr><td>Tabanca, SMG, pompalı</td><td>Yakın</td></tr>
                <tr><td>Saldırı tüfeği</td><td>Orta</td></tr>
                <tr><td>Keskin nişancı tüfeği</td><td>Uzak</td></tr>
              </tbody>
            </table>
            <div class="example"><b>Örnek</b><p>İdeal mesafesi Uzak olan bir keskin nişancı tüfeğiyle ateş eden karakter, Uzak mesafedeki bir hedef için DV 8'e, Orta mesafedeki bir hedef için DV 11'e, Yakın mesafedeki bir hedef için DV 14'e karşı atar.</p></div>
          `,
          en: `
            <p>A shotgun earns its keep in a narrow hallway; a sniper rifle earns it on a rooftop two blocks away. The DV of a ranged attack depends on how far away the target is and on the weapon's ideal range. Distances fall into four bands:</p>
            <table class="rules">
              <thead><tr><th>Distance</th><th>Squares</th><th>Meters</th></tr></thead>
              <tbody>
                <tr><td>Close</td><td>1–3</td><td>up to 6 m</td></tr>
                <tr><td>Medium</td><td>4–12</td><td>8–24 m</td></tr>
                <tr><td>Long</td><td>13–50</td><td>26–100 m</td></tr>
                <tr><td>Extreme</td><td>51+</td><td>100 m+</td></tr>
              </tbody>
            </table>
            <p>Every weapon has an <strong>ideal range</strong>, listed in the weapon's details. An attack against a target at the weapon's ideal range is DV <strong>8</strong>. Each band closer or farther than the ideal range adds <strong>3</strong> to the DV: 11, 14, 17.</p>
            <table class="rules">
              <thead><tr><th>Example weapon</th><th>Ideal range</th></tr></thead>
              <tbody>
                <tr><td>Pistol, SMG, shotgun</td><td>Close</td></tr>
                <tr><td>Assault rifle</td><td>Medium</td></tr>
                <tr><td>Sniper rifle</td><td>Long</td></tr>
              </tbody>
            </table>
            <div class="example"><b>Example</b><p>A character firing a sniper rifle with a Long ideal range rolls against DV 8 for a target at Long range, DV 11 at Medium range and DV 14 at Close range.</p></div>
          `,
        },
      },
      {
        id: "siper",
        label: { tr: "Siper", en: "Cover" },
        body: {
          tr: `
            <p>Sokakta uzun yaşayanlar, ilk kurşun atılmadan nereye eğileceğini bilenlerdir. Saldıranla hedef arasında kalan bir duvar ya da araç, hedefe kısmi ya da tam siper sağlayabilir.</p>
            <ul>
              <li><strong>Kısmi siper:</strong> Hedefin bir kısmı siperin arkasında kalır. Saldırının DV'sine <strong>+2</strong> eklenir. Saldırı yalnızca bu +2 yüzünden ıskalarsa kurşun sipere isabet eder.</li>
              <li><strong>Tam siper:</strong> Hedef tamamen siperin arkasındadır ve görülmez. Ona doğrudan saldırılamaz; saldırı sipere yapılır ve otomatik olarak isabet eder.</li>
              <li>Sipere isabet eden hasar siperin HP'sinden düşer. HP'si 0'a düşen siper yok olur. <strong>Fazla hasar</strong> arkadaki kişiye gövde isabeti olarak geçer; bu hasara gövde zırhı normal işler ve zırh aşınır.</li>
              <li>Siperden geçen hasar kritik yara açmaz.</li>
              <li>Kısmi siperin +2'si, mermiden kaçma sonucu saldırının yeni DV'si olduğunda da eklenir.</li>
              <li>Siper yalnızca menzilli saldırılara karşı işler; yakın dövüşte siper yoktur.</li>
            </ul>
            <table class="rules">
              <thead><tr><th>Malzeme</th><th>Örnek</th><th>HP</th></tr></thead>
              <tbody>
                <tr><td>Çok zayıf</td><td>Ahşap masa, alçıpan, karton kutular</td><td>10</td></tr>
                <tr><td>Zayıf</td><td>Ahşap kapı, ince metal levha</td><td>15</td></tr>
                <tr><td>Orta</td><td>Kurşun geçirmez cam, tuğla duvar</td><td>25</td></tr>
                <tr><td>Sağlam</td><td>Kalın ahşap, çöp konteyneri</td><td>35</td></tr>
                <tr><td>Çok sağlam</td><td>Beton duvar, beton bariyer</td><td>50</td></tr>
                <tr><td>Güçlendirilmiş</td><td>Çelik kapı, kasa dairesi duvarı</td><td>70</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>The ones who last on the street are the ones who know where to duck before the first shot is fired. A wall or a vehicle between the attacker and the target can give the target partial or full cover.</p>
            <ul>
              <li><strong>Partial cover:</strong> Part of the target is behind the cover. The attack's DV goes up by <strong>+2</strong>. If the attack misses only because of that +2, the bullet hits the cover.</li>
              <li><strong>Full cover:</strong> The target is completely behind the cover and can't be seen. They can't be attacked directly; the attack is made against the cover and hits automatically.</li>
              <li>Damage that hits cover comes off the cover's HP. Cover that drops to 0 HP is destroyed. <strong>Excess damage</strong> passes to the person behind it as a body hit; body armor applies to it as normal and is ablated.</li>
              <li>Damage that passes through cover does not cause critical injuries.</li>
              <li>Partial cover's +2 also applies when a dodge result becomes the attack's new DV.</li>
              <li>Cover only works against ranged attacks; there's no cover in melee.</li>
            </ul>
            <table class="rules">
              <thead><tr><th>Material</th><th>Example</th><th>HP</th></tr></thead>
              <tbody>
                <tr><td>Very weak</td><td>Wooden table, drywall, cardboard boxes</td><td>10</td></tr>
                <tr><td>Weak</td><td>Wooden door, thin sheet metal</td><td>15</td></tr>
                <tr><td>Medium</td><td>Bulletproof glass, brick wall</td><td>25</td></tr>
                <tr><td>Sturdy</td><td>Thick wood, dumpster</td><td>35</td></tr>
                <tr><td>Very sturdy</td><td>Concrete wall, concrete barrier</td><td>50</td></tr>
                <tr><td>Reinforced</td><td>Steel door, vault wall</td><td>70</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "gorus",
        label: { tr: "Görüş ve Işık", en: "Vision and Light" },
        body: {
          tr: `
            <p>Night City'nin neonları her yere ulaşmaz. Elektriği kesilmiş bir kat ya da bir ara sokağın dibi, en keskin gözü bile işe yaramaz hale getirebilir. Bir ortamın ne kadar aydınlık olduğuna GM karar verir.</p>
            <table class="rules text">
              <thead><tr><th>Işık</th><th>Etki</th></tr></thead>
              <tbody>
                <tr><td>Loş ışık</td><td>Ay ışığı, uzaktaki bir neon, titreyen bir lamba. Görmeye dayalı Perception atışları dezavantajlıdır.</td></tr>
                <tr><td>Karanlık</td><td>Hiç ışık yoktur. Karanlıktaki kişiler ve nesneler görülmez; onları görerek fark etmek için Perception atılamaz ve onlara yapılan saldırılar dezavantajlıdır.</td></tr>
              </tbody>
            </table>
            <p><strong>Körlük:</strong> Kör bir karakter hiçbir şey göremez; bu yüzden:</p>
            <ul>
              <li>Görmeye dayalı atışlarda otomatik olarak başarısız olur.</li>
              <li>Saldırı zarları dezavantajlıdır.</li>
              <li>Mermiden kaçamaz; yakın dövüşte Evasion'ı dezavantajla atar.</li>
              <li>Görüş gerektiren işleri yapamaz; örneğin quickhack kullanamaz.</li>
            </ul>
            <p><strong>Geçici körlüğün</strong> etkileri aynıdır, yalnızca süresi kısadır; ne kadar süreceği körlüğe yol açan şeyin açıklamasında yazar. Kalıcı körlük ancak krom gözle giderilir.</p>
          `,
          en: `
            <p>Night City's neon doesn't reach everywhere. A floor with the power cut or the far end of a back alley can make even the sharpest eyes useless. The GM decides how well lit a place is.</p>
            <table class="rules text">
              <thead><tr><th>Light</th><th>Effect</th></tr></thead>
              <tbody>
                <tr><td>Dim light</td><td>Moonlight, a distant neon sign, a flickering lamp. Perception rolls that rely on sight have disadvantage.</td></tr>
                <tr><td>Darkness</td><td>No light at all. People and things in darkness can't be seen: no sight-based Perception roll can spot them, and attacks against them have disadvantage.</td></tr>
              </tbody>
            </table>
            <p><strong>Blindness:</strong> A blind character can't see anything.</p>
            <ul>
              <li>They automatically fail any roll that relies on sight.</li>
              <li>Their attack rolls have disadvantage.</li>
              <li>They can't dodge bullets, and they roll Evasion with disadvantage in melee.</li>
              <li>They can't do anything that needs sight; for example, they can't use quickhacks.</li>
            </ul>
            <p><strong>Temporary blindness</strong> has the same effects but doesn't last long; how long it lasts is listed with whatever causes it. Permanent blindness can only be fixed with cybereyes.</p>
          `,
        },
      },
      {
        id: "hasar",
        label: { tr: "Hasar", en: "Damage" },
        body: {
          tr: `
            <p>İsabet eden bir saldırının ne kadar can yaktığını hasar zarları belirler. Silah hasarı her zaman d6'larla atılır. Atılan toplamdan hedefin isabet alan bölgedeki zırhının SP'si çıkarılır ve kalan miktar hedefin HP'sinden düşer. Hasar SP'yi geçemezse HP'ye hasar geçmez.</p>
            <p>Her silahın hasarı silahın bilgilerinde yazar. Aşağıdaki tablolar örnek değerleri gösterir.</p>
            <table class="rules">
              <thead><tr><th lang="en">Skill</th><th>Örnek silah</th><th>Hasar</th></tr></thead>
              <tbody>
                <tr><td>Handgun</td><td>Orta tabanca, SMG</td><td>2d6</td></tr>
                <tr><td>Handgun</td><td>Ağır tabanca, ağır SMG</td><td>3d6</td></tr>
                <tr><td>Handgun</td><td>Handcannon</td><td>4d6</td></tr>
                <tr><td>Shoulder Arms</td><td>Pompalı, saldırı tüfeği, keskin nişancı tüfeği</td><td>5d6</td></tr>
                <tr><td>Athletics</td><td>El bombası</td><td>5d6</td></tr>
                <tr><td>Heavy Weapons</td><td>Bomba atar</td><td>5d6</td></tr>
                <tr><td>Heavy Weapons</td><td>Roketatar</td><td>8d6</td></tr>
              </tbody>
            </table>
            <p>Yakın dövüş silahları dört kademeye ayrılır: Hafif 1d6, Orta 2d6, Ağır 3d6, Çok ağır 4d6.</p>
            <table class="rules">
              <thead><tr><th>Örnek silah</th><th>Kademe</th><th>Hasar</th><th lang="en">ROF</th></tr></thead>
              <tbody>
                <tr><td>Bıçak, muşta</td><td>Hafif</td><td>1d6</td><td>2</td></tr>
                <tr><td>Sopa, kısa kılıç, katana</td><td>Orta</td><td>2d6</td><td>2</td></tr>
                <tr><td>Yangın baltası, ağır balta</td><td>Ağır</td><td>3d6</td><td>2</td></tr>
                <tr><td>Balyoz</td><td>Çok ağır</td><td>4d6</td><td>1</td></tr>
                <tr><td>Mantis Blades</td><td>Ağır</td><td>3d6</td><td>2</td></tr>
                <tr><td>Monowire, Wolvers</td><td>Orta</td><td>2d6</td><td>2</td></tr>
              </tbody>
            </table>
            <p>Yumruk saldırıları <strong>Brawling</strong> ile yapılır ve <strong>yumruk hasarı</strong> BODY'ye göre belirlenir. Yumruklar <strong>ROF 2</strong>'dir: bir aksiyonla iki yumruk atılır.</p>
            <table class="rules">
              <thead><tr><th lang="en">BODY</th><th>Yumruk hasarı</th></tr></thead>
              <tbody>
                <tr><td>3–9</td><td>1d6</td></tr>
                <tr><td>10–13</td><td>2d6</td></tr>
                <tr><td>14–17</td><td>3d6</td></tr>
                <tr><td>18–20</td><td>4d6</td></tr>
              </tbody>
            </table>
            <div class="example"><b>Örnek</b><p>Saldırı tüfeğiyle yapılan bir saldırı isabet ediyor ve 5d6 hasar zarlarından toplam 18 geliyor. Hedefin gövde zırhı SP 7 olduğu için hedef 18 − 7 = 11 HP kaybediyor ve zırhın SP'si 6'ya düşüyor.</p></div>
          `,
          en: `
            <p>The damage dice decide how badly a hit hurts. Weapon damage is always rolled in d6s. The SP of the target's armor at the location that was hit is subtracted from the total, and the rest comes off the target's HP. If the damage doesn't beat the SP, no damage reaches HP.</p>
            <p>Each weapon's damage is listed in that weapon's details. The tables below show example values.</p>
            <table class="rules">
              <thead><tr><th lang="en">Skill</th><th>Example weapon</th><th>Damage</th></tr></thead>
              <tbody>
                <tr><td>Handgun</td><td>Medium pistol, SMG</td><td>2d6</td></tr>
                <tr><td>Handgun</td><td>Heavy pistol, heavy SMG</td><td>3d6</td></tr>
                <tr><td>Handgun</td><td>Handcannon</td><td>4d6</td></tr>
                <tr><td>Shoulder Arms</td><td>Shotgun, assault rifle, sniper rifle</td><td>5d6</td></tr>
                <tr><td>Athletics</td><td>Grenade</td><td>5d6</td></tr>
                <tr><td>Heavy Weapons</td><td>Grenade launcher</td><td>5d6</td></tr>
                <tr><td>Heavy Weapons</td><td>Rocket launcher</td><td>8d6</td></tr>
              </tbody>
            </table>
            <p>Melee weapons come in four tiers: Light 1d6, Medium 2d6, Heavy 3d6, Very heavy 4d6.</p>
            <table class="rules">
              <thead><tr><th>Example weapon</th><th>Tier</th><th>Damage</th><th>ROF</th></tr></thead>
              <tbody>
                <tr><td>Knife, brass knuckles</td><td>Light</td><td>1d6</td><td>2</td></tr>
                <tr><td>Club, short sword, katana</td><td>Medium</td><td>2d6</td><td>2</td></tr>
                <tr><td>Fire axe, heavy axe</td><td>Heavy</td><td>3d6</td><td>2</td></tr>
                <tr><td>Sledgehammer</td><td>Very heavy</td><td>4d6</td><td>1</td></tr>
                <tr><td>Mantis Blades</td><td>Heavy</td><td>3d6</td><td>2</td></tr>
                <tr><td>Monowire, Wolvers</td><td>Medium</td><td>2d6</td><td>2</td></tr>
              </tbody>
            </table>
            <p>Punches use <strong>Brawling</strong>, and <strong>punch damage</strong> depends on BODY. Fists are <strong>ROF 2</strong>: two punches in one action.</p>
            <table class="rules">
              <thead><tr><th>BODY</th><th>Punch damage</th></tr></thead>
              <tbody>
                <tr><td>3–9</td><td>1d6</td></tr>
                <tr><td>10–13</td><td>2d6</td></tr>
                <tr><td>14–17</td><td>3d6</td></tr>
                <tr><td>18–20</td><td>4d6</td></tr>
              </tbody>
            </table>
            <div class="example"><b>Example</b><p>An assault rifle attack hits and the 5d6 damage dice total 18. The target's body armor is SP 7, so the target loses 18 − 7 = 11 HP and the armor drops to SP 6.</p></div>
          `,
        },
      },
      {
        id: "mermi",
        label: { tr: "Mermi ve ROF", en: "Ammo & ROF" },
        body: {
          tr: `
            <p>Her silahın bir <strong>ROF</strong>'u (atış hızı) ve bir <strong>şarjör</strong> kapasitesi vardır.</p>
            <ul>
              <li><strong>ROF:</strong> Silahla bir aksiyonda kaç saldırı yapılabileceğini gösterir. ROF 2 olan bir silahla tek aksiyonda iki saldırı yapılır.</li>
              <li>Her atış şarjörden <strong>1 mermi</strong> harcar.</li>
              <li><strong>Reload</strong> bir aksiyondur ve bir <strong>yedek şarjör</strong> harcar. Şarjör bitmeden reload yapılırsa eski şarjörde kalan mermiler kaybolur.</li>
            </ul>
            <table class="rules">
              <thead><tr><th>Örnek silah</th><th lang="en">ROF</th><th>Şarjör</th><th>Otomatik ateş (en fazla)</th></tr></thead>
              <tbody>
                <tr><td>Orta tabanca</td><td>2</td><td>12</td><td>—</td></tr>
                <tr><td>Ağır tabanca</td><td>2</td><td>8</td><td>—</td></tr>
                <tr><td>Handcannon</td><td>1</td><td>8</td><td>—</td></tr>
                <tr><td>SMG</td><td>1</td><td>30</td><td>×3</td></tr>
                <tr><td>Ağır SMG</td><td>1</td><td>40</td><td>×3</td></tr>
                <tr><td>Saldırı tüfeği</td><td>1</td><td>25</td><td>×4</td></tr>
                <tr><td>Pompalı</td><td>1</td><td>4</td><td>—</td></tr>
                <tr><td>Keskin nişancı tüfeği</td><td>1</td><td>4</td><td>—</td></tr>
                <tr><td>Bomba atar</td><td>1</td><td>2</td><td>—</td></tr>
                <tr><td>Roketatar</td><td>1</td><td>1</td><td>—</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>Every weapon has a <strong>ROF</strong> (rate of fire) and a <strong>magazine</strong> capacity.</p>
            <ul>
              <li><strong>ROF:</strong> how many attacks the weapon can make in one action. A ROF 2 weapon makes two attacks in a single action.</li>
              <li>Every shot uses <strong>1 bullet</strong> from the magazine.</li>
              <li><strong>Reloading</strong> takes an action and uses one <strong>spare magazine</strong>. If a weapon is reloaded before its magazine is empty, the rounds left in the old magazine are lost.</li>
            </ul>
            <table class="rules">
              <thead><tr><th>Example weapon</th><th>ROF</th><th>Magazine</th><th>Autofire (max)</th></tr></thead>
              <tbody>
                <tr><td>Medium pistol</td><td>2</td><td>12</td><td>—</td></tr>
                <tr><td>Heavy pistol</td><td>2</td><td>8</td><td>—</td></tr>
                <tr><td>Handcannon</td><td>1</td><td>8</td><td>—</td></tr>
                <tr><td>SMG</td><td>1</td><td>30</td><td>×3</td></tr>
                <tr><td>Heavy SMG</td><td>1</td><td>40</td><td>×3</td></tr>
                <tr><td>Assault rifle</td><td>1</td><td>25</td><td>×4</td></tr>
                <tr><td>Shotgun</td><td>1</td><td>4</td><td>—</td></tr>
                <tr><td>Sniper rifle</td><td>1</td><td>4</td><td>—</td></tr>
                <tr><td>Grenade launcher</td><td>1</td><td>2</td><td>—</td></tr>
                <tr><td>Rocket launcher</td><td>1</td><td>1</td><td>—</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "otomatik-ates",
        label: { tr: "Otomatik Ateş", en: "Autofire" },
        body: {
          tr: `
            <p>Tetiğe basılı tutmak nişan almanın yerine geçmez; ama iyi bir nişancının elinde tek bir şarjör, bir koridoru boşaltmaya yeter. Otomatik ateş açabilen silahlar (SMG ve saldırı tüfeği gibi), normal bir saldırı yerine tek seferde <strong>10 mermi</strong> harcayarak tek bir otomatik ateş saldırısı yapabilir. Şarjörde 10'dan az mermi varsa otomatik ateş açılamaz; kalan mermiler tek tek atılır.</p>
            <ul>
              <li>Saldırı zarı normal menzil DV'sine karşı atılır.</li>
              <li>Saldırı isabet ederse hasar için <strong>2d6</strong> atılır ve bu toplam, saldırı sonucunun DV'yi <strong>geçtiği miktarla çarpılır</strong>. Atılan zar sayısı artmaz.</li>
              <li>Çarpanın bir <strong>tavanı</strong> vardır ve silaha göre değişir: SMG için en fazla ×3, saldırı tüfeği için en fazla ×4. DV daha fazla geçilse bile çarpan bu tavanı aşmaz.</li>
              <li>Hedefin zırhı (SP), çarpılmış toplam hasardan bir kez çıkarılır.</li>
              <li>2d6'da iki 6 gelirse ve hasar SP'yi geçerse kritik yara oluşur.</li>
            </ul>
            <div class="example"><b>Örnek</b><p>Shoulder Arms değeri +5 olan bir karakter, saldırı tüfeğiyle DV 8'e karşı otomatik ateş açıyor. Zarda 6 geliyor: 6 + 5 = 11, DV 3 farkla geçiliyor. 2d6'da 7 geliyor: 7 × 3 = 21 hasar. Hedefin zırhı SP 7 olduğu için hedef 14 HP kaybediyor.</p></div>
          `,
          en: `
            <p>Holding down the trigger is no substitute for aim, but in a good shooter's hands a single magazine is enough to clear a hallway. Weapons capable of autofire (such as SMGs and assault rifles) can spend <strong>10 bullets</strong> at once, instead of making a normal attack, to make a single autofire attack. If the magazine has fewer than 10 bullets, autofire isn't possible; the remaining rounds are fired one at a time.</p>
            <ul>
              <li>The attack roll is made against the normal range DV.</li>
              <li>If the attack hits, <strong>2d6</strong> is rolled for damage and the total is <strong>multiplied by how much the attack roll beat the DV</strong>. The number of dice doesn't change.</li>
              <li>The multiplier has a <strong>cap</strong> that depends on the weapon: at most ×3 for an SMG, at most ×4 for an assault rifle. Even if the DV is beaten by more, the multiplier never goes past the cap.</li>
              <li>The target's armor (SP) is subtracted once from the multiplied total.</li>
              <li>If the 2d6 shows two 6s and the damage beats the SP, a critical injury happens.</li>
            </ul>
            <div class="example"><b>Example</b><p>A character with Shoulder Arms +5 opens autofire with an assault rifle against DV 8. The die shows a 6: 6 + 5 = 11, beating the DV by 3. The 2d6 shows 7: 7 × 3 = 21 damage. The target's armor is SP 7, so it loses 14 HP.</p></div>
          `,
        },
      },
      {
        id: "baski-atesi",
        label: { tr: "Baskı Ateşi", en: "Suppressive Fire" },
        body: {
          tr: `
            <p>Bazen bir namlunun işi birini vurmak değil, karşı tarafı yere yapıştırmaktır. Otomatik ateş açabilen bir silahla, saldırı yerine <strong>10 mermi</strong> harcanarak baskı ateşi açılabilir. Baskı ateşi hasar vermez; düşmanı siperine sindirmek için açılır.</p>
            <ul>
              <li>Ateş eden, silahının menzili içinde ve görüş hattında bir yer seçer. O noktadaki <strong>10 × 10 metrelik (5 × 5 kare)</strong> alan etkilenir.</li>
              <li>Alanda bulunan ve tam siperde olmayan herkes <strong>DV 11</strong>'e karşı <strong>Mental Resist</strong> atar.</li>
              <li>Atışta başarısız olan kişi, bir sonraki turunda <strong>en yakın sipere kaçmak</strong> zorundadır; yakında siper yoksa alanın dışına kaçar.</li>
            </ul>
          `,
          en: `
            <p>Sometimes the point of a gun isn't to hit anyone, but to keep the other side's heads down. A weapon capable of autofire can spend <strong>10 bullets</strong> on suppressive fire instead of an attack. Suppressive fire deals no damage; its purpose is to pin enemies down.</p>
            <ul>
              <li>The shooter picks a spot within the weapon's range and line of sight. A <strong>10 × 10 meter (5 × 5 square)</strong> area at that spot is affected.</li>
              <li>Everyone in the area who isn't in full cover rolls <strong>Mental Resist</strong> against <strong>DV 11</strong>.</li>
              <li>Anyone who fails must <strong>flee to the nearest cover</strong> on their next turn; if there's no cover nearby, they flee out of the area.</li>
            </ul>
          `,
        },
      },
      {
        id: "patlayicilar",
        label: { tr: "Patlayıcılar", en: "Explosives" },
        body: {
          tr: `
            <p>Bir el bombası kimseyi hedef almaz; düştüğü yerdeki herkesin derdi olur.</p>
            <ul>
              <li><strong>Atış:</strong> Patlayıcıyla bir kişi değil, bir nokta (haritada bir kare) hedeflenir. El bombası atmak için <strong>Athletics</strong>, bomba atar ve roketatar için <strong>Heavy Weapons</strong> atılır. DV, patlayıcının ideal mesafesine göre normal menzil kuralıyla belirlenir.</li>
              <li><strong>Iska:</strong> Patlayıcı yine patlar. Nereye düştüğüne GM karar verir.</li>
              <li><strong>Alan:</strong> Patlama, hedeflenen noktayı merkez alan ve yarıçapı <strong>5 metre (2,5 kare)</strong> olan yuvarlak bir alanı etkiler.</li>
              <li><strong>Hasar:</strong> Hasar bir kez atılır ve alandaki herkes bu tam hasarı alır. Hasar gövde isabeti sayılır; gövde zırhı normal işler.</li>
              <li><strong>Kritik yara:</strong> Patlama kritik yara açarsa yaranın yeri için <strong>1d6</strong> atılır: 1–2 Kafa, 3–4 Gövde, 5–6 Uzuv. Yara o bölgenin tablosundan belirlenir.</li>
              <li><strong>Kaçınma:</strong> Alandaki her kişi Reaction'ını harcayıp <strong>Evasion</strong> atabilir. DV, kişinin patlamanın merkezine ne kadar yakın olduğuna göre aşağıdaki tablodan belirlenir. Başarılı olan kişi patlamadan tamamen kurtulur. Patlamadan kaçarken saldıran silahın Evasion eksisi uygulanmaz.</li>
              <li><strong>Siper:</strong> Tam siperin arkasındaki kişi, patlama siperi yıkmadıkça hasar almaz. Siper yıkılırsa fazla hasar arkadaki kişiye geçer. Kısmi siper patlamaya karşı koruma sağlamaz.</li>
            </ul>
            <table class="rules">
              <thead><tr><th>Merkeze uzaklık</th><th><span lang="en">Evasion</span> DV</th></tr></thead>
              <tbody>
                <tr><td>1 metreye kadar (merkez kare)</td><td>14</td></tr>
                <tr><td>1–3 metre (1 kare)</td><td>11</td></tr>
                <tr><td>3–5 metre (alanın kenarı)</td><td>8</td></tr>
              </tbody>
            </table>
            <table class="rules">
              <thead><tr><th>Örnek patlayıcı</th><th lang="en">Skill</th><th>İdeal mesafe</th><th>Hasar</th></tr></thead>
              <tbody>
                <tr><td>El bombası</td><td>Athletics</td><td>Yakın</td><td>5d6</td></tr>
                <tr><td>Bomba atar</td><td>Heavy Weapons</td><td>Orta</td><td>5d6</td></tr>
                <tr><td>Roketatar</td><td>Heavy Weapons</td><td>Orta</td><td>8d6</td></tr>
              </tbody>
            </table>
            <p>El bombası en fazla Orta mesafeye atılabilir. Bomba atar el bombası, roketatar roket atar. Bu silahlarda reload yine bir aksiyondur; yedek şarjör yerine bomba ya da roket harcar.</p>
            <div class="example"><b>Örnek</b><p>Bir el bombası üç kişilik bir grubun ortasına düşüyor. Patlamanın merkezindeki kişi DV 14'e, merkeze 2 metre uzaklıktaki kişi DV 11'e, 4 metre uzaklıktaki kişi DV 8'e karşı Evasion atıyor. Başaramayanlar 5d6 hasar alıyor.</p></div>
          `,
          en: `
            <p>A grenade doesn't aim at anyone; it becomes the problem of everyone near where it lands.</p>
            <ul>
              <li><strong>Attack:</strong> An explosive targets a spot (a square on a map), not a person. Throwing a grenade uses <strong>Athletics</strong>; grenade launchers and rocket launchers use <strong>Heavy Weapons</strong>. The DV is set by the explosive's ideal range, using the normal range rules.</li>
              <li><strong>Miss:</strong> The explosive still goes off. The GM decides where it lands.</li>
              <li><strong>Area:</strong> The blast covers a round area with a <strong>5 meter (2.5 square)</strong> radius, centered on the targeted spot.</li>
              <li><strong>Damage:</strong> Damage is rolled once, and everyone in the area takes that full damage. The damage counts as a body hit; body armor works as normal.</li>
              <li><strong>Critical injury:</strong> If the blast causes a critical injury, <strong>1d6</strong> is rolled for its location: 1–2 Head, 3–4 Body, 5–6 Limb. The injury is taken from that location's table.</li>
              <li><strong>Evading:</strong> Anyone in the area can spend their Reaction to roll <strong>Evasion</strong>. The DV depends on how close they are to the center of the blast, as shown in the table below. On a success, they escape the blast completely. The attacking weapon's Evasion penalty doesn't apply when escaping a blast.</li>
              <li><strong>Cover:</strong> Someone behind full cover takes no damage unless the blast destroys the cover. If the cover is destroyed, the excess damage passes to the person behind it. Partial cover gives no protection against explosions.</li>
            </ul>
            <table class="rules">
              <thead><tr><th>Distance from center</th><th>Evasion DV</th></tr></thead>
              <tbody>
                <tr><td>Up to 1 meter (center square)</td><td>14</td></tr>
                <tr><td>1–3 meters (1 square)</td><td>11</td></tr>
                <tr><td>3–5 meters (edge of the area)</td><td>8</td></tr>
              </tbody>
            </table>
            <table class="rules">
              <thead><tr><th>Example explosive</th><th>Skill</th><th>Ideal range</th><th>Damage</th></tr></thead>
              <tbody>
                <tr><td>Grenade</td><td>Athletics</td><td>Close</td><td>5d6</td></tr>
                <tr><td>Grenade launcher</td><td>Heavy Weapons</td><td>Medium</td><td>5d6</td></tr>
                <tr><td>Rocket launcher</td><td>Heavy Weapons</td><td>Medium</td><td>8d6</td></tr>
              </tbody>
            </table>
            <p>A grenade can be thrown no farther than Medium range. Grenade launchers fire grenades and rocket launchers fire rockets. Reloading them still takes an action, but it uses a grenade or rocket instead of a spare magazine.</p>
            <div class="example"><b>Example</b><p>A grenade lands in the middle of a group of three. The person at the center rolls Evasion against DV 14, the one 2 meters from the center against DV 11, and the one 4 meters away against DV 8. Anyone who fails takes 5d6 damage.</p></div>
          `,
        },
      },
      {
        id: "bogusma",
        label: { tr: "Boğuşma", en: "Grappling" },
        body: {
          tr: `
            <p>Her kavga silahla çözülmez; bazen iş, karşıdakini yakasından tutup duvara dayamaya kalır. <strong>Yakalama</strong> bir aksiyondur. Hedef bitişikte olmalı ve yakalayanın en az bir eli boş olmalıdır. Yakalayan <strong>Brawling</strong> atar, hedef <strong>Evasion</strong> ile karşılık verir. Yakalayanın sonucu daha yüksekse hedef tutulur; eşitlikte hedef kazanır. Yakalarken atılan Brawling sonucu, ilk turun tutma DV'si olur.</p>
            <p><strong>Tutulurken:</strong></p>
            <ul>
              <li><strong>Tutulan</strong> hareket edemez. Tutan dışındakilere yaptığı saldırıların zarları dezavantajlıdır.</li>
              <li><strong>Tutan</strong>ın bir eli doludur. Hareketi yarıya iner, ama tutulanı yanında sürükleyebilir.</li>
            </ul>
            <p><strong>Her tur:</strong></p>
            <ul>
              <li><strong>Tutan</strong>, kendi turunda tutmaya devam etmek için <strong>bonus aksiyon</strong> harcar ve <strong>Strength</strong> atar. Çıkan sonuç o turun tutma DV'si olur. Bonus aksiyon harcanmazsa tutulan serbest kalır.</li>
              <li><strong>Tutulan</strong>, kendi turunda kurtulmak için <strong>bonus aksiyon</strong> harcar ve <strong>Strength</strong> ya da <strong>Evasion</strong> atar. Tutma DV'sini geçerse kurtulur.</li>
            </ul>
            <p><strong>İnsan kalkanı:</strong> Tutan, tutulanı kalkan gibi kullanabilir. Tutulan, tutana kısmi siper sağlar (+2 DV). Siper yüzünden ıskalayan saldırılar tutulana isabet eder. İnsan kalkanı yakın dövüş saldırılarına karşı işlemez.</p>
          `,
          en: `
            <p>Not every fight is settled with a gun; sometimes it comes down to grabbing the other person by the collar and slamming them into a wall. <strong>Grabbing</strong> takes an action. The target must be adjacent and the grabber needs at least one free hand. The grabber rolls <strong>Brawling</strong>, the target answers with <strong>Evasion</strong>. If the grabber's result is higher, the target is held; the target wins ties. The grab's Brawling result is the hold DV for the first round.</p>
            <p><strong>While grappled:</strong></p>
            <ul>
              <li>The <strong>held</strong> character can't move. Their attacks against anyone other than the holder have disadvantage.</li>
              <li>The <strong>holder</strong> has one hand busy. Their movement is halved, but they can drag the held character along.</li>
            </ul>
            <p><strong>Every round:</strong></p>
            <ul>
              <li>On their turn, the <strong>holder</strong> spends a <strong>bonus action</strong> to keep the hold and rolls <strong>Strength</strong>. The result is that round's hold DV. If no bonus action is spent, the held character goes free.</li>
              <li>On their turn, the <strong>held</strong> character spends a <strong>bonus action</strong> to break free and rolls <strong>Strength</strong> or <strong>Evasion</strong>. Beating the hold DV frees them.</li>
            </ul>
            <p><strong>Human shield:</strong> The holder can use the held character as a shield. The held character gives the holder partial cover (+2 DV). Attacks that miss because of that cover hit the held character. A human shield doesn't work against melee attacks.</p>
          `,
        },
      },
      {
        id: "zirh",
        label: { tr: "Zırh", en: "Armor" },
        body: {
          tr: `
            <p>Bu şehirde sokak giysilerinin çoğu bile birkaç kurşunu durduracak şekilde dikilir; işini ciddiye alan herkes bunun üstüne bir kat daha giyer. Zırhın koruması <strong>SP</strong> (Stopping Power) ile ölçülür. Gövde zırhı ve kafa zırhı (kask) ayrı ayrı giyilir; ikisi de aynı tabloyu kullanır ve her birinin kendi SP'si vardır. Tablodaki cezalar yalnızca gövde zırhından gelir; kask ceza vermez. Bir bölgeye tek zırh giyilir; zırhlar üst üste binmez.</p>
            <table class="rules">
              <thead><tr><th>Zırh</th><th>Örnek</th><th>SP</th><th>Ceza</th></tr></thead>
              <tbody>
                <tr><td>Hafif</td><td>Deri ceket, sokak giysisi</td><td>3</td><td>—</td></tr>
                <tr><td>Kevlar</td><td>Giysi altı kevlar</td><td>5</td><td>—</td></tr>
                <tr><td>Taktik</td><td>Hafif armorjack</td><td>7</td><td>—</td></tr>
                <tr><td>Ağır</td><td>Ağır armorjack</td><td>9</td><td>Evasion −2, hareket −2 m (1 kare)</td></tr>
                <tr><td>Askerî</td><td>Metalgear, askerî zırh</td><td>11</td><td>Evasion −4, hareket −4 m (2 kare)</td></tr>
              </tbody>
            </table>
            <ul>
              <li><strong>Aşınma:</strong> Zırha gelen her isabet, zırh delinsin ya da delinmesin, isabet alan bölgedeki zırhın SP'sini <strong>1</strong> düşürür.</li>
              <li><strong>Yakın dövüş:</strong> Yakın dövüş saldırılarında hedefin SP'sinin yarısı sayılır (yukarı yuvarlanır). Kritik yara kontrolünde de bu yarım SP kullanılır. Kromdan gelen SP bonusları gövde SP'sine eklenir ve yakın dövüşte onlar da yarı sayılır. Aşınma ise zırhın gerçek SP'sinden düşer.</li>
              <li><strong>Tamir:</strong> Zırh sahada tamir edilemez. Güvenli bir yerde 1 saat çalışıldıktan sonra <strong>Craft</strong> atılır; Alet Çantası olmadan atış dezavantajlıdır. DV zırhın seviyesine göre değişir: Hafif ve Kevlar 8, Taktik 11, Ağır ve Askerî 14. Başarılı olunursa zırh asıl SP'sine döner; başarısız olunursa 1 saat sonra yeniden denenebilir. Zırh, para karşılığında bir tamirciye de onartılabilir. SP'si 0'a düşen zırh ise onarılamaz.</li>
            </ul>
            <div class="example"><b>Örnek</b><p>SP'si 11 olan bir zırh yakın dövüşte 6 sayılır. 7 hasarlık bir bıçak darbesinden HP'ye 1 hasar geçer ve zırhın SP'si 10'a düşer.</p></div>
          `,
          en: `
            <p>In this city, even most streetwear is cut to stop a bullet or two, and anyone who takes the job seriously wears another layer on top. Armor's protection is measured in <strong>SP</strong> (Stopping Power). Body armor and head armor (a helmet) are worn separately; both use the same table, and each has its own SP. The penalties in the table only come from body armor; helmets give no penalty. Only one piece of armor is worn per location; armor doesn't stack.</p>
            <table class="rules">
              <thead><tr><th>Armor</th><th>Example</th><th>SP</th><th>Penalty</th></tr></thead>
              <tbody>
                <tr><td>Light</td><td>Leather jacket, streetwear</td><td>3</td><td>—</td></tr>
                <tr><td>Kevlar</td><td>Kevlar under clothing</td><td>5</td><td>—</td></tr>
                <tr><td>Tactical</td><td>Light armorjack</td><td>7</td><td>—</td></tr>
                <tr><td>Heavy</td><td>Heavy armorjack</td><td>9</td><td>Evasion −2, movement −2 m (1 square)</td></tr>
                <tr><td>Military</td><td>Metalgear, military armor</td><td>11</td><td>Evasion −4, movement −4 m (2 squares)</td></tr>
              </tbody>
            </table>
            <ul>
              <li><strong>Ablation:</strong> Every hit on armor, whether it penetrates or not, lowers the SP of the armor at the location hit by <strong>1</strong>.</li>
              <li><strong>Melee:</strong> Against melee attacks, the target's SP counts as half (rounded up). This half SP is also used when checking for a critical injury. SP bonuses from chrome add to body SP and are halved in melee too. Ablation still comes off the armor's real SP.</li>
              <li><strong>Repairs:</strong> Armor can't be repaired in the field. In a safe place, after 1 hour of work, <strong>Craft</strong> is rolled, with disadvantage without a Tool Kit. The DV depends on the armor's level: Light and Kevlar 8, Tactical 11, Heavy and Military 14. On a success, the armor goes back to its original SP; on a failure, it can be tried again 1 hour later. Armor can also be repaired by a mechanic, for money. Armor that drops to SP 0 can't be repaired.</li>
            </ul>
            <div class="example"><b>Example</b><p>Armor with SP 11 counts as 6 in melee. A knife hit for 7 damage puts 1 damage through to HP, and the armor drops to SP 10.</p></div>
          `,
        },
      },
      {
        id: "isabet",
        label: { tr: "İsabet Bölgesi ve Aimed Shot", en: "Hit Location & Aimed Shot" },
        body: {
          tr: `
            <p>Normal saldırılar her zaman <strong>gövdeye</strong> isabet eder. Patlamalar ve siperden geçen hasar da gövde isabeti sayılır; düşmede ise isabet bölgesi bacaktır.</p>
            <p>Belirli bir yeri vurmak isteyen karakter <strong>Aimed Shot</strong> yapar. Aimed Shot için aksiyon ve bonus aksiyon birlikte harcanır ve saldırı zarı dezavantajla atılır. Kafa, bir kol ya da bir bacak hedeflenebilir:</p>
            <table class="rules">
              <thead><tr><th>Bölge</th><th>Zırh</th><th>Etki</th></tr></thead>
              <tbody>
                <tr><td>Kafa</td><td>Kafa SP</td><td>Silahın hasarı ×2; kafa SP'si bu toplamdan çıkarılır</td></tr>
                <tr><td>Kol</td><td>Gövde SP</td><td>Zırhı delerse normal hasar ve hedef elindekini düşürür</td></tr>
                <tr><td>Bacak</td><td>Gövde SP</td><td>Zırhı delerse normal hasar ve hedefin hareketi bir sonraki turunun sonuna kadar yarıya iner</td></tr>
              </tbody>
            </table>
            <p>Kafa isabetinde yalnızca silahın hasarı iki katına çıkar; kritik yaranın +5'i gibi ek hasarlar katlanmaz.</p>
          `,
          en: `
            <p>Normal attacks always hit the <strong>body</strong>. Explosions and damage that passes through cover also count as body hits; in a fall, the hit location is a leg.</p>
            <p>A character who wants to hit a specific spot makes an <strong>Aimed Shot</strong>. An Aimed Shot uses both the action and the bonus action, and the attack roll is made with disadvantage. It can target the head, an arm or a leg:</p>
            <table class="rules">
              <thead><tr><th>Location</th><th>Armor</th><th>Effect</th></tr></thead>
              <tbody>
                <tr><td>Head</td><td>Head SP</td><td>The weapon's damage ×2; head SP is subtracted from that total</td></tr>
                <tr><td>Arm</td><td>Body SP</td><td>If it penetrates, normal damage and the target drops what they are holding</td></tr>
                <tr><td>Leg</td><td>Body SP</td><td>If it penetrates, normal damage and the target's movement is halved until the end of their next turn</td></tr>
              </tbody>
            </table>
            <p>On a head hit only the weapon's damage is doubled; extra damage such as a critical injury's +5 isn't.</p>
          `,
        },
      },
      {
        id: "kritik",
        label: { tr: "Kritik Yara", en: "Critical Injuries" },
        body: {
          tr: `
            <p>Bazı isabetler savaş bittiğinde de geçmez. Kırılan bir kaburga ya da kopan bir tendon, tedavi edilene kadar karakterle birlikte yaşar. Hasar zarlarında <strong>iki ya da daha fazla 6</strong> gelirse ve toplam hasar hedefin SP'sini geçerse <strong>kritik yara</strong> oluşur:</p>
            <ul>
              <li>Hedef, zırhı yok sayan <strong>+5</strong> bonus hasar alır.</li>
              <li>İsabet bölgesinin tablosunda (Gövde, Kafa ya da Uzuv) <strong>1d8</strong> atılır ve çıkan yara karaktere eklenir. Kol ve bacak isabetlerinde Uzuv tablosu kullanılır.</li>
              <li>Yara uygulanamıyorsa zar yeniden atılır. Örneğin kırık bir kol yeniden kırılamaz, kopmuş bir kola yara eklenemez, iki göz de kaybedilmişse göz kaybedilemez.</li>
              <li>Kritik yaralar kendiliğinden iyileşmez; tablodaki tedaviyi gerektirir.</li>
            </ul>
            <p class="note">Kritik yara zarını GM'in atıp sonucu açıklaması önerilir.</p>
            <p><strong>Tedavi:</strong> Tabloda tedavisi Medicine DV 8 ya da DV 11 olarak yazan yaralar, sahada ya da dinlenirken o DV'ye karşı Medicine atılarak iyileştirilebilir. Tedavi 10 dakika sürer; başarısız olunursa aynı yara için bir sonraki dinlenmede bir kez daha denenebilir. Ameliyat gerektiren yaralar için Surgery feat'i olan bir Medtech ya da bir ripperdoc gerekir. Kaybedilen bir göz ya da uzuv ancak krom veya protezle yerine konabilir.</p>
            <p><strong>Gövde</strong></p>
            <table class="rules crit">
              <thead><tr><th>d8</th><th>Yara</th><th>Etki</th><th>Tedavi</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Kırık Kaburgalar</td><td>Strength, Athletics ve Endurance zarlarına −2.</td><td>Medicine DV 11</td></tr>
                <tr><td>2</td><td>Yırtık Kas</td><td>Brawling ve Melee Weapons zarlarına −2.</td><td>Medicine DV 8</td></tr>
                <tr><td>3</td><td>Yabancı Cisim</td><td>Gece dinlenmesinde iyileşme yarıya iner.</td><td>Medicine DV 11</td></tr>
                <tr><td>4</td><td>Kırık Köprücük Kemiği</td><td>İki El silahlarla yapılan saldırıların zarları dezavantajlı.</td><td>Medicine DV 11</td></tr>
                <tr><td>5</td><td>İç Kanama</td><td>Karakter, kanama durdurulana kadar her turunun başında 1 HP kaybeder. Durdurmak için bir aksiyonla Medicine DV 11 atılır.</td><td>Ameliyat</td></tr>
                <tr><td>6</td><td>Çökmüş Akciğer</td><td>Hareket yarıya iner, koşulamaz.</td><td>Ameliyat</td></tr>
                <tr><td>7</td><td>Delinmiş Organ</td><td>Maksimum HP −5.</td><td>Ameliyat</td></tr>
                <tr><td>8</td><td>Omurga Hasarı</td><td>Karakter bir sonraki turunu tamamen kaybeder; sonrasında Evasion zarlarına −2.</td><td>Ameliyat</td></tr>
              </tbody>
            </table>
            <p><strong>Kafa</strong></p>
            <table class="rules crit">
              <thead><tr><th>d8</th><th>Yara</th><th>Etki</th><th>Tedavi</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Beyin Sarsıntısı</td><td>Tüm skill zarlarına −1.</td><td>Medicine DV 8</td></tr>
                <tr><td>2</td><td>Hasarlı Kulak</td><td>Sese dayalı Perception zarları dezavantajlı.</td><td>Medicine DV 8</td></tr>
                <tr><td>3</td><td>Hasarlı Göz</td><td>Perception ve menzilli saldırı zarlarına −2.</td><td>Medicine DV 11</td></tr>
                <tr><td>4</td><td>Kırık Çene</td><td>COOL skill zarları dezavantajlı.</td><td>Medicine DV 11</td></tr>
                <tr><td>5</td><td>Ezilmiş Gırtlak</td><td>Karakter konuşamaz; Endurance zarları dezavantajlı.</td><td>Ameliyat</td></tr>
                <tr><td>6</td><td>Çatlak Kafatası</td><td>Kafaya gelen isabetlerin hasarına +1d6.</td><td>Ameliyat</td></tr>
                <tr><td>7</td><td>Beyin Hasarı</td><td>INT ve WILL skill zarlarına −2.</td><td>Ameliyat</td></tr>
                <tr><td>8</td><td>Kaybedilen Göz</td><td>Perception ve menzilli saldırı zarları dezavantajlı. İki göz de kaybedilirse karakter kör kalır.</td><td>Krom göz</td></tr>
              </tbody>
            </table>
            <p><strong>Uzuv</strong> (etki, isabet alan kola ya da bacağa göre)</p>
            <table class="rules crit">
              <thead><tr><th>d8</th><th>Yara</th><th>Kol</th><th>Bacak</th><th>Tedavi</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Çıkık</td><td>O kol kullanılamaz.</td><td>Hareket yarıya iner.</td><td>Medicine DV 8, bir aksiyon (yerine oturtma)</td></tr>
                <tr><td>2</td><td>Derin Kesik</td><td>Karakter, kanama durdurulana kadar her turunun başında 1 HP kaybeder.</td><td>Karakter, kanama durdurulana kadar her turunun başında 1 HP kaybeder.</td><td>Medicine DV 8, bir aksiyon</td></tr>
                <tr><td>3</td><td>Ezilme</td><td>İki El silahlar kullanılamaz.</td><td>Koşulamaz.</td><td>Medicine DV 8</td></tr>
                <tr><td>4</td><td>Kırık Kemik</td><td>O elle tutulan silahla saldırı zarları dezavantajlı.</td><td>Hareket yarıya iner.</td><td>Medicine DV 11</td></tr>
                <tr><td>5</td><td>Yabancı Cisim</td><td>Brawling ve Melee Weapons zarlarına −2.</td><td>Hareket 2 metre (1 kare) azalır.</td><td>Medicine DV 11</td></tr>
                <tr><td>6</td><td>Yırtık Tendon</td><td>O eldeki şey düşürülür; Strength zarlarına −2.</td><td>Athletics zarları dezavantajlı.</td><td>Ameliyat</td></tr>
                <tr><td>7</td><td>Sinir Hasarı</td><td>O elle yapılan işlerin zarlarına −2.</td><td>Evasion zarlarına −2.</td><td>Ameliyat</td></tr>
                <tr><td>8</td><td>Kopan Uzuv</td><td>Kol ya da el kopmuştur.</td><td>Hareket yarıya iner, koşulamaz.</td><td>Protez ya da krom</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>Some hits don't go away when the fight ends. A broken rib or a torn tendon stays with a character until it is treated. If the damage dice show <strong>two or more 6s</strong> and the total damage beats the target's SP, a <strong>critical injury</strong> happens:</p>
            <ul>
              <li>The target takes <strong>+5</strong> bonus damage that ignores armor.</li>
              <li><strong>1d8</strong> is rolled on the table for the hit location (Body, Head or Limb) and the injury is added to the character. Arm and leg hits use the Limb table.</li>
              <li>If the injury can't be applied, the die is rerolled. For example, a broken arm can't be broken again, a severed arm can't take an injury, and an eye can't be lost when both are already gone.</li>
              <li>Critical injuries don't heal on their own; they need the treatment listed in the table.</li>
            </ul>
            <p class="note">It's recommended that the GM rolls the critical injury die and announces the result.</p>
            <p><strong>Treatment:</strong> Injuries whose treatment in the table is Medicine DV 8 or DV 11 can be treated in the field or during rest with a Medicine roll against that DV. Treatment takes 10 minutes; after a failure, the same injury can be tried once more at the next rest. Injuries that need surgery require a Medtech with the Surgery feat or a ripperdoc. A lost eye or limb can only be replaced with chrome or a prosthetic.</p>
            <p><strong>Body</strong></p>
            <table class="rules crit">
              <thead><tr><th>d8</th><th>Injury</th><th>Effect</th><th>Treatment</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Broken Ribs</td><td>−2 to Strength, Athletics and Endurance rolls.</td><td>Medicine DV 11</td></tr>
                <tr><td>2</td><td>Torn Muscle</td><td>−2 to Brawling and Melee Weapons rolls.</td><td>Medicine DV 8</td></tr>
                <tr><td>3</td><td>Foreign Object</td><td>Healing from a night's rest is halved.</td><td>Medicine DV 11</td></tr>
                <tr><td>4</td><td>Broken Collarbone</td><td>Attack rolls with Two-Handed weapons have disadvantage.</td><td>Medicine DV 11</td></tr>
                <tr><td>5</td><td>Internal Bleeding</td><td>The character loses 1 HP at the start of each of their turns until the bleeding is stopped. Stopping it takes an action and a Medicine roll against DV 11.</td><td>Surgery</td></tr>
                <tr><td>6</td><td>Collapsed Lung</td><td>Movement is halved; no running.</td><td>Surgery</td></tr>
                <tr><td>7</td><td>Punctured Organ</td><td>Max HP −5.</td><td>Surgery</td></tr>
                <tr><td>8</td><td>Spinal Injury</td><td>The character loses their next turn entirely; afterwards, −2 to Evasion rolls.</td><td>Surgery</td></tr>
              </tbody>
            </table>
            <p><strong>Head</strong></p>
            <table class="rules crit">
              <thead><tr><th>d8</th><th>Injury</th><th>Effect</th><th>Treatment</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Concussion</td><td>−1 to all skill rolls.</td><td>Medicine DV 8</td></tr>
                <tr><td>2</td><td>Damaged Ear</td><td>Hearing-based Perception rolls have disadvantage.</td><td>Medicine DV 8</td></tr>
                <tr><td>3</td><td>Damaged Eye</td><td>−2 to Perception and ranged attack rolls.</td><td>Medicine DV 11</td></tr>
                <tr><td>4</td><td>Broken Jaw</td><td>COOL skill rolls have disadvantage.</td><td>Medicine DV 11</td></tr>
                <tr><td>5</td><td>Crushed Windpipe</td><td>The character can't speak; Endurance rolls have disadvantage.</td><td>Surgery</td></tr>
                <tr><td>6</td><td>Cracked Skull</td><td>+1d6 damage from hits to the head.</td><td>Surgery</td></tr>
                <tr><td>7</td><td>Brain Injury</td><td>−2 to INT and WILL skill rolls.</td><td>Surgery</td></tr>
                <tr><td>8</td><td>Lost Eye</td><td>Perception and ranged attack rolls have disadvantage. If both eyes are lost, the character is blind.</td><td>Cybereye</td></tr>
              </tbody>
            </table>
            <p><strong>Limb</strong> (the effect depends on whether the arm or leg was hit)</p>
            <table class="rules crit">
              <thead><tr><th>d8</th><th>Injury</th><th>Arm</th><th>Leg</th><th>Treatment</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Dislocation</td><td>That arm can't be used.</td><td>Movement is halved.</td><td>Medicine DV 8, one action (set it back)</td></tr>
                <tr><td>2</td><td>Deep Cut</td><td>The character loses 1 HP at the start of each of their turns until the bleeding is stopped.</td><td>The character loses 1 HP at the start of each of their turns until the bleeding is stopped.</td><td>Medicine DV 8, one action</td></tr>
                <tr><td>3</td><td>Crushing</td><td>Two-Handed weapons can't be used.</td><td>No running.</td><td>Medicine DV 8</td></tr>
                <tr><td>4</td><td>Broken Bone</td><td>Attack rolls with a weapon held in that hand have disadvantage.</td><td>Movement is halved.</td><td>Medicine DV 11</td></tr>
                <tr><td>5</td><td>Foreign Object</td><td>−2 to Brawling and Melee Weapons rolls.</td><td>Movement is reduced by 2 meters (1 square).</td><td>Medicine DV 11</td></tr>
                <tr><td>6</td><td>Torn Tendon</td><td>Whatever that hand holds is dropped; −2 to Strength rolls.</td><td>Athletics rolls have disadvantage.</td><td>Surgery</td></tr>
                <tr><td>7</td><td>Nerve Damage</td><td>−2 to rolls made with that hand.</td><td>−2 to Evasion rolls.</td><td>Surgery</td></tr>
                <tr><td>8</td><td>Severed Limb</td><td>The arm or hand is gone.</td><td>Movement is halved; no running.</td><td>Prosthetic or chrome</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "yara",
        label: { tr: "HP ve Yara Durumları", en: "HP & Wound States" },
        body: {
          tr: `
            <p>Tecrübe, bir edgerunner'a tehlikeyi önceden sezmeyi öğretir; ama ona kurşuna dayanacak bir beden vermez. Bir karakterin maksimum HP'si BODY'sinden hesaplanır:</p>
            <div class="formula">HP = 10 + 2 × BODY</div>
            <p>HP seviyeyle artmaz. HP düştükçe karakter aşağıdaki yara durumlarına girer.</p>
            <table class="rules">
              <thead><tr><th>Durum</th><th>Ne zaman</th><th>Etkisi</th></tr></thead>
              <tbody>
                <tr><td>Ağır Yaralı</td><td>HP, maksimumun yarısının altına inince</td><td>Tüm atışlara −2</td></tr>
                <tr><td>Ölümcül Yaralı</td><td>HP 0 olunca (HP 0'ın altına inmez)</td><td>Bilinci açıkken skill atışlarına −4, hareket yarıya iner</td></tr>
              </tbody>
            </table>
            <p>Ölümcül Yaralı'nın −4'ü Ağır Yaralı'nın −2'sinin yerine geçer; ikisi toplanmaz.</p>
            <p><strong>Ölüm kurtarma atışı</strong></p>
            <ul>
              <li>Ölümcül Yaralı karakter, stabilize edilene ya da ölene kadar her turunun başında <strong>d10 + BODY modifier</strong> ile <strong>DV 5</strong>'e karşı ölüm kurtarma atışı yapar. Bilinci kapalıyken de bu atışlar sürer. Her başarıda DV 1 artar. Doğal 1 her zaman başarısızdır.</li>
              <li><strong>1. başarısızlık:</strong> Karakter bilincini kaybeder ve kendi turunda hiçbir şey yapamaz.</li>
              <li><strong>2. başarısızlık:</strong> Karakter ölür.</li>
              <li>Ölümcül Yaralı birine gelen ve zırhı delen <strong>yeni bir isabet</strong> otomatik olarak bir başarısızlık sayılır; zırhta kalan isabet sayılmaz.</li>
              <li>Kanaması (İç Kanama ya da Derin Kesik) durdurulmamış Ölümcül Yaralı karakterin ölüm kurtarma DV'si 1 yüksektir. Kanama ayrıca başarısızlık sayılmaz.</li>
            </ul>
            <p>Ölümcül Yaralı bir karakteri kurtarmanın yolu onu stabilize etmektir; nasıl yapılacağı <a href="#rulebook/iyilesme">Kural Kitabı › İyileşme</a> sayfasında yazar.</p>
          `,
          en: `
            <p>Experience teaches an edgerunner to sense trouble coming, but it doesn't give them a body that can take a bullet. A character's maximum HP is worked out from their BODY:</p>
            <div class="formula">HP = 10 + 2 × BODY</div>
            <p>HP does not grow with level. As HP drops, the character enters the wound states below.</p>
            <table class="rules">
              <thead><tr><th>State</th><th>When</th><th>Effect</th></tr></thead>
              <tbody>
                <tr><td>Seriously Wounded</td><td>HP drops below half of maximum</td><td>−2 to all rolls</td></tr>
                <tr><td>Mortally Wounded</td><td>HP reaches 0 (HP never goes below 0)</td><td>While conscious, −4 to skill rolls and movement is halved</td></tr>
              </tbody>
            </table>
            <p>The Mortally Wounded −4 replaces the Seriously Wounded −2; they don't stack.</p>
            <p><strong>Death saves</strong></p>
            <ul>
              <li>At the start of each of their turns, until they are stabilized or die, a Mortally Wounded character makes a death save: <strong>d10 + BODY modifier</strong> against <strong>DV 5</strong>. These rolls continue while they are unconscious. Each success raises the DV by 1. A natural 1 always fails.</li>
              <li><strong>1st failure:</strong> The character falls unconscious and can do nothing on their turn.</li>
              <li><strong>2nd failure:</strong> The character dies.</li>
              <li>A <strong>new hit</strong> that gets through the armor of a Mortally Wounded character counts as an automatic failure; a hit stopped by armor doesn't.</li>
              <li>A Mortally Wounded character whose bleeding (Internal Bleeding or Deep Cut) hasn't been stopped makes death saves at 1 higher DV. The bleeding doesn't count as a failure on its own.</li>
            </ul>
            <p>The way to save a Mortally Wounded character is to stabilize them; how it's done is described on the <a href="#rulebook/iyilesme">Rulebook › Healing</a> page.</p>
          `,
        },
      },
      {
        id: "pusu",
        label: { tr: "Pusu ve Gafil Avlanma", en: "Ambush & Surprise" },
        body: {
          tr: `
            <p>En ölümcül kurşun, kimsenin geldiğini görmediği kurşundur.</p>
            <p><strong>Pusu:</strong> Pusu kuran taraftaki herkes Stealth atar ve <strong>en düşük sonuç</strong> pusunun DV'si olur. NPC'lerden oluşan bir grup için GM tek bir zar atabilir. Pusuya düşürülen taraftaki her karakter bu DV'ye karşı Perception atar; DV'yi geçemeyen karakter gafil avlanır.</p>
            <p><strong>Gafil avlanan karakter ilk turda:</strong></p>
            <ul>
              <li>Aksiyon ve bonus aksiyon kullanamaz.</li>
              <li>Hareketinin yalnızca 1/4'ünü kullanabilir (yukarı yuvarlanır).</li>
              <li>Mermiden kaçamaz.</li>
              <li>Yakın dövüşte Evasion'ı dezavantajla atar.</li>
            </ul>
            <p>Bu kısıtlamalar ilk turun sonunda kalkar. İnisiyatif herkes için normal şekilde atılır; gafil avlanmak yalnızca ilk turu etkiler.</p>
          `,
          en: `
            <p>The deadliest bullet is the one nobody sees coming.</p>
            <p><strong>Ambush:</strong> Everyone on the ambushing side rolls Stealth, and the <strong>lowest result</strong> becomes the ambush DV. For a group of NPCs, the GM can make a single roll. Every character on the ambushed side rolls Perception against that DV; anyone who doesn't beat it is surprised.</p>
            <p><strong>A surprised character, in the first round:</strong></p>
            <ul>
              <li>Cannot use their action or bonus action.</li>
              <li>Can use only 1/4 of their movement (rounded up).</li>
              <li>Cannot dodge bullets.</li>
              <li>Rolls Evasion in melee with disadvantage.</li>
            </ul>
            <p>These restrictions end at the end of the first round. Initiative is rolled normally for everyone; being surprised only affects the first round.</p>
          `,
        },
      },
      {
        id: "davranma",
        label: { tr: "Hızla Silaha Davranma", en: "Quick Draw" },
        body: {
          tr: `
            <p>Pazarlık bozulduğunda ilk silahı çeken, çoğu zaman son sözü de söyleyen olur. Savaş henüz başlamamışken, örneğin karşılıklı bir konuşmanın ortasında silaha davranmak için şu kurallar kullanılır:</p>
            <ul>
              <li>Silaha davranan karakter <strong>d10 + DEX modifier</strong> atar. Onu görebilen her hedef ayrı ayrı <strong>d10 + DEX modifier</strong> ile karşılık verir. Eşitlikte hedef kazanır.</li>
              <li>Silaha yavaşça ve gizlice davranılıyorsa d10 + DEX modifier yerine <strong>Stealth</strong> atılabilir; bu durumda hedefler <strong>Perception</strong> ile karşılık verir.</li>
              <li><strong>Davranan kazanırsa</strong> o hedef gafil avlanmış sayılır.</li>
              <li><strong>Hedef kazanırsa</strong> gafil avlanmaz ve savaş normal inisiyatifle başlar. Hedef davranana bitişikse silahın çekilmesini de engelleyebilir; bu durumda silah kılıfında kalır.</li>
              <li>İki taraf aynı anda davranırsa en yüksek sonuç önce oynar.</li>
              <li><strong>İki El</strong> etiketli bir silaha davranırken atış dezavantajlıdır.</li>
            </ul>
          `,
          en: `
            <p>When a deal goes bad, the first one to draw often gets the last word as well. Before combat has started, for example in the middle of a conversation, these rules are used to go for a weapon:</p>
            <ul>
              <li>The one drawing rolls <strong>d10 + DEX modifier</strong>. Every target who can see them answers separately with <strong>d10 + DEX modifier</strong>. The target wins ties.</li>
              <li>When drawing slowly and quietly, <strong>Stealth</strong> can be rolled instead of d10 + DEX modifier; the targets then answer with <strong>Perception</strong>.</li>
              <li><strong>If the one drawing wins</strong>, that target counts as surprised.</li>
              <li><strong>If the target wins</strong>, they are not surprised and combat starts with normal initiative. A target adjacent to the one drawing can also stop the weapon from being drawn; it then stays in its holster.</li>
              <li>If both sides draw at once, the highest result goes first.</li>
              <li>Drawing a <strong>Two-Handed</strong> weapon is rolled with disadvantage.</li>
            </ul>
          `,
        },
      },
    ],
  },

  "rulebook/iyilesme": {
    intro: {
      tr: `
        <p>Bir yara birkaç saniyede açılır, ama kapanması günler sürer. Savaşın ortasında HP, bazı feat'ler ve kromlar dışında yalnızca tüketilebilir tıbbi eşyalarla geri gelir; asıl iyileşme dinlenerek olur. Bu sayfa Ölümcül Yaralı bir karakteri hayatta tutmayı, gece dinlenmesini ve savaşta iyileşmeyi anlatır.</p>
      `,
      en: `
        <p>A wound opens in seconds but takes days to close. In the middle of combat, apart from some feats and chrome, HP comes back only through medical consumables; real healing happens through rest. This page covers keeping a Mortally Wounded character alive, a night's rest and healing in combat.</p>
      `,
    },
    sections: [
      {
        id: "stabilize",
        label: { tr: "Stabilize", en: "Stabilizing" },
        body: {
          tr: `
            <p>Ölümcül Yaralı bir karakter, ikinci ölüm kurtarma başarısızlığından önce stabilize edilirse hayatta kalır. Stabilize etmek için:</p>
            <ul>
              <li>Bir aksiyon harcanır ve <strong>DV 8</strong>'e karşı <strong>Medicine</strong> atılır.</li>
              <li>Medkit olmadan da stabilize edilebilir. Hastanın henüz hiç başarısızlığı yoksa atış normal yapılır; bir başarısızlığı varsa medkitsiz atış dezavantajlıdır.</li>
              <li>Bilinci açık olan Ölümcül Yaralı bir karakter kendini de stabilize edebilir; bu atış dezavantajlıdır.</li>
              <li>Stabilize edilen karakter <strong>1 HP</strong> ile kalır ve artık Ölümcül Yaralı sayılmaz. Başarısızlıkları silinir ve ölüm kurtarma atışının DV'si yeniden 5 olur.</li>
              <li>Stabilize edilen karakter aynı oturumda yeniden hasar alırsa, bir başarısızlığı işaretlenmiş olarak <strong>yere düşer</strong>. Bu ceza bir sonraki oturumda ya da tam bir gece uykusundan sonra kalkar.</li>
            </ul>
            <p><strong>Baygınlık</strong></p>
            <ul>
              <li>Stabilize edildiğinde bilinci kapalı olan, yani bir ölüm kurtarma başarısızlığı bulunan karakter yaklaşık <strong>6 saat</strong> baygın kalır. Henüz hiç başarısızlığı yokken stabilize edilen karakterin bilinci açık kalır.</li>
              <li>Aldığı her kritik yara bu süreyi <strong>yarım saat</strong>, kafaya aldığı her kritik yara <strong>1 saat</strong> uzatır.</li>
              <li>Baygın bir karakterin ne zaman uyanacağı Medicine atılarak tahmin edilebilir; sonuç ne kadar yüksekse tahmin o kadar kesin olur.</li>
            </ul>
          `,
          en: `
            <p>A Mortally Wounded character survives if they are stabilized before their second death save failure. To stabilize them:</p>
            <ul>
              <li>An action is spent and <strong>Medicine</strong> is rolled against <strong>DV 8</strong>.</li>
              <li>Stabilizing is possible without a medkit too. If the patient has no failures yet, the roll is made as normal; if they have one failure, the roll without a medkit has disadvantage.</li>
              <li>A conscious Mortally Wounded character can also stabilize themselves; this roll has disadvantage.</li>
              <li>A stabilized character is left at <strong>1 HP</strong> and no longer counts as Mortally Wounded. Their failures are cleared and the death save DV goes back to 5.</li>
              <li>If a stabilized character takes damage again in the same session, they <strong>go down</strong> with one failure already marked. This penalty goes away at the next session or after a full night's sleep.</li>
            </ul>
            <p><strong>Unconsciousness</strong></p>
            <ul>
              <li>A character who is unconscious when stabilized, meaning they have a death save failure, stays unconscious for about <strong>6 hours</strong>. A character stabilized before any failure stays conscious.</li>
              <li>Each critical injury they took adds <strong>half an hour</strong>; each critical injury to the head adds <strong>1 hour</strong>.</li>
              <li>A Medicine roll can estimate when an unconscious character will wake up; the higher the result, the more precise the estimate.</li>
            </ul>
          `,
        },
      },
      {
        id: "dinlenme",
        label: { tr: "Gece Dinlenmesi", en: "Night's Rest" },
        body: {
          tr: `
            <p>Vücut asıl olarak uykuda toparlanır. Gece dinlenmesi <strong>8 saat</strong> sürer. Tam bir gece dinlenen karakter şu kadar HP kazanır:</p>
            <div class="formula">BODY / 2 HP</div>
            <p>Sonuç aşağı yuvarlanır.</p>
          `,
          en: `
            <p>The body does most of its mending in sleep. A night's rest takes <strong>8 hours</strong>. A character who rests for a full night regains this much HP:</p>
            <div class="formula">BODY / 2 HP</div>
            <p>The result is rounded down.</p>
          `,
        },
      },
      {
        id: "ilk-yardim",
        label: { tr: "İlk Yardım", en: "First Aid" },
        body: {
          tr: `
            <p>Gece dinlenmesinden önce herhangi bir karakter, kendi yaralarını ya da bir dostunun yaralarını sarmak için <strong>dezavantajlı Medicine</strong> atabilir. Atış başarılı olursa o kişinin o geceki iyileşmesi <strong>iki katına</strong> çıkar. Başarısız olursa kişi normal iyileşir.</p>
            <ul>
              <li>Bir gecede istenildiği kadar kişiye ilk yardım yapılabilir.</li>
              <li>Her kişi için bir gecede <strong>tek deneme</strong> yapılır. Biri başaramazsa başka biri aynı kişi için tekrar deneyemez.</li>
              <li>Atışın DV'si 11'dir.</li>
            </ul>
          `,
          en: `
            <p>Before a night's rest, any character can roll <strong>Medicine with disadvantage</strong> to dress their own wounds or an ally's. On a success, that person's healing for the night is <strong>doubled</strong>. On a failure, they heal normally.</p>
            <ul>
              <li>Any number of people can be given first aid in a night.</li>
              <li>Each person gets <strong>one attempt</strong> per night. If someone fails, no one else can try again for that person.</li>
              <li>The DV is 11.</li>
            </ul>
          `,
        },
      },
      {
        id: "medtech",
        label: { tr: "Medtech Gözetimi", en: "Medtech Care" },
        body: {
          tr: `
            <p>Ekipte bir Medtech varsa yaralar daha hızlı kapanır. Bir Medtech'in gözetiminde gece dinlenen herkes, Medtech'in kendisi de dahil, o gece <strong>iki kat</strong> iyileşir. Bunun için zar atılmaz.</p>
            <p>Medtech gözetimi ve ilk yardım üst üste binmez; gece iyileşmesi en fazla iki kat olur.</p>
          `,
          en: `
            <p>Wounds close faster when the crew has a Medtech. Everyone who rests for the night under a Medtech's care, the Medtech included, heals <strong>double</strong> that night. No roll is needed.</p>
            <p>Medtech care and first aid do not stack; a night's healing is at most doubled.</p>
          `,
        },
      },
      {
        id: "savasta",
        label: { tr: "Savaşta İyileşme", en: "Healing in Combat" },
        body: {
          tr: `
            <p>Bazı feat'ler ve kromlar dışında, savaşın ortasında HP yalnızca tüketilebilir eşyalarla kazanılır.</p>
            <table class="rules">
              <thead><tr><th>Eşya</th><th>Kullanım</th><th>Etki</th></tr></thead>
              <tbody>
                <tr><td>Bounce Back<span class="item-sub">Enjektör</span></td><td>Bonus aksiyon</td><td>2d6 HP</td></tr>
                <tr><td>MaxDoc<span class="item-sub">İnhaler</span></td><td>Aksiyon</td><td>4d6 HP</td></tr>
              </tbody>
            </table>
            <p>Ölümcül Yaralı birine kullanılan Bounce Back ya da MaxDoc onu stabilize eder; Medicine atışı gerekmez. Karakter 1 HP yerine eşyanın verdiği HP ile kalır.</p>
            <p>Medkit bir iyileştirme eşyası değildir; HP kazandırmaz, stabilize ederken ve ameliyatta kullanılan bir alettir.</p>
          `,
          en: `
            <p>Apart from some feats and chrome, HP can only be regained in the middle of combat with consumables.</p>
            <table class="rules">
              <thead><tr><th>Item</th><th>Use</th><th>Effect</th></tr></thead>
              <tbody>
                <tr><td>Bounce Back<span class="item-sub">Injector</span></td><td>Bonus action</td><td>2d6 HP</td></tr>
                <tr><td>MaxDoc<span class="item-sub">Inhaler</span></td><td>Action</td><td>4d6 HP</td></tr>
              </tbody>
            </table>
            <p>Bounce Back or MaxDoc used on a Mortally Wounded character stabilizes them; no Medicine roll is needed. The character is left with the HP the item restores instead of 1.</p>
            <p>A medkit is not a healing item: it restores no HP, and it is a tool used for stabilizing and surgery.</p>
          `,
        },
      },
    ],
  },
};
