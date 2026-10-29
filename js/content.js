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
//   <span class="draft">Taslak</span>                    henüz kesinleşmemiş kural etiketi
//   <table class="rules">...</table>                     kural tablosu

// Sınıflar. Sıra, sınıfların eklenme sırasıdır (tablonun varsayılan sıralaması).
// specs: iki specialization [{ id, name, summary (kaba açıklama), desc?, features?: { 5: {tr,en}, 8: …, 9: … } }]; yoksa yer tutucu gösterilir.
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
          tr: "Bodyguard'lar kendileri için değil, başkalarını korumak için savaşır. Mermiyle korudukları kişinin arasına girer, tehlikeyi herkesten önce görür ve o kişi ayakta kaldıkça geri adım atmazlar.",
          en: "Bodyguards don't fight for themselves but to protect others. They step between the bullet and the person they guard, spot danger before anyone else, and never give ground while that person is still standing.",
        },
      },
      {
        id: "b",
        name: { tr: "Duellante", en: "Duellante" },
        summary: {
          tr: "Duellante'ler teke tek dövüşün ustalarıdır. Kalabalığın içinden bir rakip seçer, bütün dikkatlerini ona verir ve o düşene kadar bırakmazlar; silahla da, bıçakla da.",
          en: "Duellantes are masters of the one-on-one fight. They pick a single opponent out of the crowd, give it their full attention and don't let go until it falls; with a gun or with a blade.",
        },
      },
    ],
    gear: [
      { label: { tr: "Silahlar", en: "Weapons" }, items: { tr: ["Ağır tabancaya kadar bir tabanca ya da Orta menzilli bir ateşli silah", "Orta bir yakın dövüş silahı"], en: ["A pistol up to heavy, or a medium-range firearm", "A medium melee weapon"] } },
      { label: { tr: "Zırh", en: "Armor" }, items: { tr: ["Taktik seviyesine kadar bir zırh", "Taktik seviyesine kadar bir kask"], en: ["Body armor, up to Tactical", "A helmet, up to Tactical"] } },
      { label: { tr: "Ekipman", en: "Gear" }, items: { tr: ["3 yedek şarjör", "Bir miktar para"], en: ["3 spare magazines", "Some money"] } },
    ],
    quote: {
      tr: `Yetmiş birin kışıydı, Watson'da bir barda oturuyordum. İçeri bir Solo girdi. Kimseye bakmadı, kimse de ona bakmadı, öyle bir şey işte. Barmen kahvesini önüne koydu, adam ödemedi, barmen de sesini çıkarmadı. Yarım saat sonra kalktı gitti. Ertesi sabah kanaldan üç ceset çıkardılar. Ben bu tiplerden hep uzak durdum evlat, kollarının içinde ne taşıdıklarını bilemezsin. Ama bir gün başın gerçekten belaya girerse, dua et yanında öyle biri olsun.`,
      en: `Winter of seventy-one, I was sitting in a bar in Watson. A Solo walked in. Didn't look at anybody, nobody looked at him, it was that kind of thing. The bartender set a coffee in front of him, he didn't pay, the bartender didn't say a word. Half an hour later he got up and left. Next morning they pulled three bodies out of the canal. I always kept clear of that type, kid, you never know what they're carrying inside those arms. But if you ever get into real trouble, pray one of them is standing next to you.`,
    },
    name: "Solo",
    stats: ["REF", "DEX", "BODY"],
    core: { tr: "İnisiyatife 2 × Ustalık modifier'ı eklenir.", en: "Adds 2 × Mastery modifier to initiative." },
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
      },
      {
        id: "b",
        name: { tr: "Overseer", en: "Overseer" },
        summary: {
          tr: "Overseer'lar savaş alanını tepeden yönetir. Taretler, dronlar, kameralar ve araçlar onların elinde düşmana çevrilen silahlardır. Bir Overseer'ın olduğu yerde düşman kendi makinelerine bile güvenemez.",
          en: "Overseers run the battlefield from above. Turrets, drones, cameras and vehicles become weapons in their hands, turned against the enemy. Wherever an Overseer is at work, the enemy can't even trust its own machines.",
        },
      },
    ],
    gear: [
      { label: { tr: "Silahlar", en: "Weapons" }, items: { tr: ["Orta tabancaya kadar bir tabanca", "Hafif bir yakın dövüş silahı"], en: ["A pistol, up to medium", "A light melee weapon"] } },
      { label: { tr: "Zırh", en: "Armor" }, items: { tr: ["Kevlar seviyesine kadar bir zırh", "Kevlar seviyesine kadar bir kask"], en: ["Body armor, up to Kevlar", "A helmet, up to Kevlar"] } },
      { label: { tr: "Ekipman", en: "Gear" }, items: { tr: ["Bir cyberdeck", "2 yedek şarjör", "Bir miktar para"], en: ["A cyberdeck", "2 spare magazines", "Some money"] } },
    ],
    quote: {
      tr: `Torunumun bir arkadaşı vardı, Mika. On dokuz yaşında. Bütün gün odasında, kafasında o kablolar, gözleri kapalı, uyuyor sanırsın. Adamlar ona para verirdi, o da oturduğu yerden kapı açardı, kamera kör ederdi, ne istersen. Bir gece kapısını çaldım, açmadı. Sabah açtık, yine aynı yerde oturuyordu. Doktor "beyni yanmış" dedi, o lafı ilk kez o gün duydum. Şimdi senin ekipte de öyle biri varmış. Söyle ona, ne yapıyorsa yapsın, ama arada bir fişi çekip pencereden dışarı baksın.`,
      en: `My grandson had a friend, Mika. Nineteen. All day in his room, those cables in his head, eyes shut, you'd think he was asleep. People paid him, and from that chair he'd open doors, blind cameras, whatever you wanted. One night I knocked on his door, he didn't answer. In the morning we opened it, he was sitting right where he'd been. The doctor said "his brain burned out", first time I ever heard those words. Now I hear your crew's got one of those. Tell them to do whatever they do, but once in a while pull the plug and look out a window.`,
    },
    name: "Netrunner",
    stats: ["INT", "TECH"],
    core: {
      tr: "Her türden cyberdeck'e erişim sağlayabilir ve onlar aracılığıyla quickhack kullanabilir. Quickhack kullanmak Netrunner için bir bonus aksiyondur.",
      en: "Can access any kind of cyberdeck and use quickhacks through them. Using a quickhack is a bonus action for a Netrunner.",
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
      },
      {
        id: "b",
        name: { tr: "Exorcist", en: "Exorcist" },
        summary: {
          tr: "Exorcist'ler makinenin içine kaçan insanı geri çeker. Kromu söker, psikozu yatıştırır, kopmak üzere olanı hayata bağlarlar; yanlarında kalan biri insanlığını daha kolay korur.",
          en: "Exorcists pull back the person who slipped into the machine. They strip out chrome, calm psychosis and tie people on the edge back to life; whoever stays near them holds on to their humanity more easily.",
        },
      },
    ],
    gear: [ // iyileştirme eşyaları planlanınca Ekipman'a eklenecek
      { label: { tr: "Silahlar", en: "Weapons" }, items: { tr: ["Orta tabancaya kadar bir tabanca", "Hafif bir yakın dövüş silahı"], en: ["A pistol, up to medium", "A light melee weapon"] } },
      { label: { tr: "Zırh", en: "Armor" }, items: { tr: ["Kevlar seviyesine kadar bir zırh", "Kevlar seviyesine kadar bir kask"], en: ["Body armor, up to Kevlar", "A helmet, up to Kevlar"] } },
      { label: { tr: "Ekipman", en: "Gear" }, items: { tr: ["2 yedek şarjör", "Bir miktar para"], en: ["2 spare magazines", "Some money"] } },
    ],
    quote: {
      tr: `Bir keresinde omzumda kurşunla Kabuki'de bir garaja girdim. Kadın tek kelime sormadı. Masaya yatırdı, ağzıma bir bez tıktı, yirmi dakikada çıkardı. Eskiden hastanede çalışmış, Trauma Team'e girmeye de uğraşmış galiba, sonra bırakmış. Ya da atmışlar, bilmiyorum, sormadım. Para da istemedi, "sonra getirirsin" dedi. Getirdim. O kroma bulanmış ellerini hiç sevmedim, yalan yok. Ama bir daha vurulursam yine o kapıyı çalarım.`,
      en: `Once I walked into a garage in Kabuki with a bullet in my shoulder. The woman didn't ask a single question. Laid me on the table, stuffed a rag in my mouth, had it out in twenty minutes. Used to work at a hospital, tried to get into Trauma Team too I think, then quit. Or they threw her out, I don't know, I didn't ask. Didn't even want money, said "bring it later". I did. Never liked those chrome-covered hands of hers, I won't lie. But if I get shot again, that's the door I'm knocking on.`,
    },
    name: "Medtech",
    stats: ["TECH", "WILL"],
    core: { tr: "Gözetiminde gece dinlenen herkes iki kat iyileşir.", en: "Everyone resting under their care for the night heals double." },
  },
  {
    id: "rockerboy",
    extraLanguages: 1, // Streetslang dışında bilinen ek dil sayısı
    specs: [
      {
        id: "a",
        name: { tr: "Headliner", en: "Headliner" },
        summary: {
          tr: "Headliner'lar afişteki ilk isimdir. Sahneye çıktıklarında bütün ışıklar onlara döner ve kalabalık onlarla birlikte nefes alır. Ekipleri de o kalabalığın bir parçasıdır: onların ritmini duyan herkes biraz daha cesur, biraz daha hızlı ve biraz daha dayanıklı olur.",
          en: "Headliners are the first name on the poster. When they take the stage, every light turns to them and the crowd breathes with them. Their crew is part of that crowd too: everyone who hears their rhythm becomes a little braver, a little faster and a little tougher.",
        },
      },
      {
        id: "b",
        name: { tr: "Noisemaker", en: "Noisemaker" },
        summary: {
          tr: "Noisemaker'lar müziği bir silah gibi kullanır. Kulağı tırmalayan, kasıtlı olarak bozuk çalınan seslerle düşmanlarının aklını karıştırır, onları yavaşlatır ve korkuturlar.",
          en: "Noisemakers use music as a weapon. With grating, deliberately broken sounds they scramble their enemies' minds, slow them down and frighten them.",
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
        { name: { tr: "Mi Majör", en: "E Major" }, type: { tr: "Buff", en: "Buff" }, duration: { tr: "3 tur", en: "3 rounds" }, effect: { tr: "Dostların hareketi +4 metre artar.", en: "Allies' movement increases by 4 meters." } },
        { name: { tr: "La Majör", en: "A Major" }, type: { tr: "Buff", en: "Buff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Dostların mermiden kaçarken attığı Evasion zarlarına +2.", en: "Allies get +2 to Evasion rolls when dodging bullets." } },
        { name: { tr: "Do Majör", en: "C Major" }, type: { tr: "Buff", en: "Buff" }, duration: { tr: "3 tur", en: "3 rounds" }, effect: { tr: "Dostlar ölüm kurtarma zarlarını avantajlı atar ve Ağır Yaralı cezasını almaz.", en: "Allies roll death saves with advantage and ignore the Seriously Wounded penalty." } },
        { name: { tr: "Re Minör", en: "D Minor" }, type: { tr: "Debuff", en: "Debuff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Tek hedef: hareketi yarıya iner.", en: "One target: movement is halved." } },
        { name: { tr: "Mi Minör", en: "E Minor" }, type: { tr: "Debuff", en: "Debuff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Tek hedef: Reaction kullanamaz, mermiden kaçamaz.", en: "One target: can't use Reactions or dodge bullets." } },
        { name: { tr: "Do Minör", en: "C Minor" }, type: { tr: "Debuff", en: "Debuff" }, duration: { tr: "1 tur", en: "1 round" }, effect: { tr: "Tek hedef: Rockerboy'a olan mesafesini kısaltacak şekilde hareket edemez; uzaklaşabilir ya da yerinde kalabilir.", en: "One target: can't move in any way that brings it closer to the Rockerboy; it can move away or stay put." } },
      ],
      b: [
        { name: { tr: "Sol Minör", en: "G Minor" }, type: { tr: "Debuff", en: "Debuff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Tek hedef: saldırı zarları dezavantajlı.", en: "One target: attack rolls have disadvantage." } },
        { name: { tr: "Re Minör", en: "D Minor" }, type: { tr: "Debuff", en: "Debuff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Tek hedef: hareketi yarıya iner.", en: "One target: movement is halved." } },
        { name: { tr: "Mi Minör", en: "E Minor" }, type: { tr: "Debuff", en: "Debuff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Tek hedef: Reaction kullanamaz, mermiden kaçamaz.", en: "One target: can't use Reactions or dodge bullets." } },
        { name: { tr: "Fa Minör", en: "F Minor" }, type: { tr: "Debuff", en: "Debuff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Rockerboy'un 12 metre çevresindeki düşmanlar: saldırı ve skill zarlarına −1.", en: "Enemies within 12 meters of the Rockerboy: −1 to attack and skill rolls." } },
        { name: { tr: "Mi Majör", en: "E Major" }, type: { tr: "Buff", en: "Buff" }, duration: { tr: "3 tur", en: "3 rounds" }, effect: { tr: "Dostların hareketi +4 metre artar.", en: "Allies' movement increases by 4 meters." } },
        { name: { tr: "La Majör", en: "A Major" }, type: { tr: "Buff", en: "Buff" }, duration: { tr: "2 tur", en: "2 rounds" }, effect: { tr: "Dostların mermiden kaçarken attığı Evasion zarlarına +2.", en: "Allies get +2 to Evasion rolls when dodging bullets." } },
        { name: { tr: "Si Majör", en: "B Major" }, type: { tr: "Buff", en: "Buff" }, duration: { tr: "1 tur", en: "1 round" }, effect: { tr: "Tek dost: yakın dövüş hasarına +1d6.", en: "One ally: +1d6 to melee damage." } },
      ],
    },
    gear: [
      { label: { tr: "Silahlar", en: "Weapons" }, items: { tr: ["Ağır tabancaya kadar bir tabanca", "Hafif bir yakın dövüş silahı"], en: ["A pistol, up to heavy", "A light melee weapon"] } },
      { label: { tr: "Zırh", en: "Armor" }, items: { tr: ["Kevlar seviyesine kadar bir zırh", "Kevlar seviyesine kadar bir kask"], en: ["Body armor, up to Kevlar", "A helmet, up to Kevlar"] } },
      { label: { tr: "Ekipman", en: "Gear" }, items: { tr: ["Seçilen 1 elektronik enstrüman", "2 yedek şarjör", "Bir miktar para"], en: ["1 electronic instrument of choice", "2 spare magazines", "Some money"] } },
    ],
    quote: {
      tr: `Gürültü. Benim için hepsi gürültü. Gençler toplanıyor, biri sahneye çıkıp bağırıyor, ortalık yıkılıyor. Geçen ay Arasaka'ya küfreden bir çocuk vardı, sesi kısık, gitarı akortsuz. Kolunda krom yoktu en azından, onu sevdim. Kalabalık ona öyle bir bağırıyordu ki... Ertesi hafta ortadan kayboldu tabii. Ama bak, altmış yaşındayım, o gece eve dönerken o kuleye ilk defa korkmadan baktım. Ne demek istediğimi anlıyor musun? Anlamıyorsan boş ver.`,
      en: `Noise. It's all noise to me. Kids gather, somebody climbs on stage and screams, the place comes down. Last month there was a kid cursing Arasaka, voice shot, guitar out of tune. No chrome on his arm at least, I liked that. The crowd was screaming back at him like... Next week he was gone, of course. But listen, I'm sixty years old, and walking home that night I looked up at that tower without being scared for the first time. You get what I mean? If you don't, forget it.`,
    },
    name: "Rockerboy",
    stats: ["COOL", "WILL"],
    core: { tr: "Bonus aksiyonla kendi Luck puanlarını bir dostuna verebilir.", en: "As a bonus action, can give their own Luck points to an ally." },
  },
  {
    id: "lawman",
    specs: [
      {
        id: "a",
        name: { tr: "Justiceiro", en: "Justiceiro" },
        summary: {
          tr: "Justiceiro'lar polisin girmediği yerlere adaleti kendi elleriyle götürür. Sokağın kurallarını bilir, korkuyu bir silah gibi kullanır ve bir kez peşine düştükleri suçluyu bırakmazlar.",
          en: "Justiceiros carry justice with their own hands into places the police won't go. They know the rules of the street, use fear like a weapon and never let go of a criminal once they're on the trail.",
        },
      },
      {
        id: "b",
        name: { tr: "Detetive", en: "Detetive" },
        summary: {
          tr: "Detetive'ler gözden kaçanı görür. Bir izden, bir yalandan, bir bakıştan yola çıkıp gerçeğe ulaşırlar; çoğu zaman en tehlikeli silahları sorduklarıdır.",
          en: "Detetives see what everyone else misses. From a trace, a lie or a glance they work their way to the truth; more often than not, their most dangerous weapon is the questions they ask.",
        },
      },
    ],
    gear: [
      { label: { tr: "Silahlar", en: "Weapons" }, items: { tr: ["Ağır tabancaya kadar bir tabanca ya da Yakın menzilli bir ateşli silah", "Orta bir yakın dövüş silahı"], en: ["A pistol up to heavy, or a close-range firearm", "A medium melee weapon"] } },
      { label: { tr: "Zırh", en: "Armor" }, items: { tr: ["Kevlar seviyesine kadar bir zırh", "Kevlar seviyesine kadar bir kask"], en: ["Body armor, up to Kevlar", "A helmet, up to Kevlar"] } },
      { label: { tr: "Ekipman", en: "Gear" }, items: { tr: ["2 yedek şarjör", "Bir miktar para"], en: ["2 spare magazines", "Some money"] } },
    ],
    quote: {
      tr: `Bunlardan birine yalan söylemeye kalkma, ciddiyim. Eski polis bunlar, çoğu NCPD'den, birkaçı şirket güvenliğinden. Rozet gitmiş, bakış gitmemiş. Bir tanesi bana bir saat boyunca hava durumunu sordu, sonra kalkıp gitti. Ertesi gün aradığı adamı buldu, benim ağzımdan kaçırdığım bir sokak adıyla. Hâlâ hangi sokak olduğunu düşünüyorum. Gözleri de kendi gözleriydi, krom değil, yorgun bir adamın gözleri. Sisteme güvenmezler, içini gördüler çünkü. Sana da güvenmezler. Alınma.`,
      en: `Don't try lying to one of these, I mean it. They're ex-cops, most from the NCPD, a few from corporate security. The badge is gone, the stare isn't. One of them spent an hour asking me about the weather, then got up and left. Next day he found the man he was after, from a street name I let slip. I still wonder which street it was. His eyes were his own, too, no chrome, just a tired man's eyes. They don't trust the system, they've seen the inside of it. They won't trust you either. Don't take it personally.`,
    },
    name: "Lawman",
    stats: ["REF", "COOL"],
    core: {
      tr: "Oturum başına 1 + Ustalık modifier'ı kadar d4; biri Perception, Insight ya da Intimidation atışına eklenebilir.",
      en: "1 + Mastery modifier d4s per session; one can be added to a Perception, Insight or Intimidation roll.",
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
    p: { tr: "2 yetkinlik puanı kazanırsın. Her puan bir skill'e +1 verir; bir skill en fazla +2 olabilir.", en: "You gain 2 proficiency points. Each point gives +1 to a skill; a skill can go up to +2." },
  },
  tier2: {
    h: { tr: "2. Aşama Feat'ler", en: "Tier 2 Feats" },
    p: { tr: "Artık 2 puanlık feat'leri alabilirsin.", en: "You can now take 2-point feats." },
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

// Araç listesi (taslak değerler). speed: savaşta tur başına metre. cover: içindekilere ve arkasında saklananlara sağladığı siper (none / partial / full).
const VEHICLES = [
  { id: "motosiklet", name: { tr: "Motosiklet", en: "Motorcycle" }, passengers: 2, hp: 30, sp: 5, speed: 60, cover: { inside: "none", behind: "partial" }, desc: { tr: "Şehir trafiğinde en çevik araç. Dar sokaklara ve araçların arasına girebilir, ama sürücüsünü neredeyse hiç korumaz.", en: "The most agile vehicle in city traffic. It fits down narrow alleys and between cars, but barely protects its rider." } },
  { id: "spor-motosiklet", name: { tr: "Spor motosiklet", en: "Sport bike" }, passengers: 1, hp: 25, sp: 3, speed: 80, cover: { inside: "none", behind: "partial" }, desc: { tr: "Hız için yapılmış hafif bir motosiklet. Kovalamacalarda rakipsiz, çarpışmada ise çok kırılgan.", en: "A light bike built for speed. Unmatched in a chase, very fragile in a crash." } },
  { id: "kompakt", name: { tr: "Kompakt araba", en: "Compact car" }, passengers: 4, hp: 45, sp: 7, speed: 50, cover: { inside: "partial", behind: "full" }, desc: { tr: "Night City'nin sıradan şehir arabası. Ucuz, küçük, park etmesi kolay.", en: "Night City's ordinary city car. Cheap, small and easy to park." } },
  { id: "sedan", name: { tr: "Sedan", en: "Sedan" }, passengers: 5, hp: 55, sp: 9, speed: 50, cover: { inside: "partial", behind: "full" }, desc: { tr: "Dört kapılı, dengeli bir araba. Ekibi bir arada taşımak için güvenilir bir seçim.", en: "A balanced four-door car. A reliable choice for moving the whole crew." } },
  { id: "spor-araba", name: { tr: "Spor araba", en: "Sports car" }, passengers: 2, hp: 50, sp: 7, speed: 70, cover: { inside: "partial", behind: "full" }, desc: { tr: "Hızlı ve dikkat çekici. Kaçarken iyi, gizli kalmaya çalışırken kötü.", en: "Fast and eye-catching. Good for getting away, bad for staying unnoticed." } },
  { id: "pickup", name: { tr: "Pickup", en: "Pickup truck" }, passengers: 3, hp: 65, sp: 9, speed: 45, cover: { inside: "partial", behind: "full" }, desc: { tr: "Arkasında açık kasası olan sağlam bir araç. Kasada yolcu ya da yük taşınabilir.", en: "A sturdy vehicle with an open bed. The bed can carry passengers or cargo." } },
  { id: "van", name: { tr: "Van", en: "Van" }, passengers: 8, hp: 70, sp: 9, speed: 40, cover: { inside: "partial", behind: "full" }, desc: { tr: "Kapalı kasalı, geniş bir araç. Ekipman ve kalabalık bir ekip için ideal. Penceresiz arka bölmedekiler tam siperdedir.", en: "A roomy vehicle with an enclosed back. Ideal for gear and a big crew. Those in the windowless back are in full cover." } },
  { id: "suv", name: { tr: "SUV", en: "SUV" }, passengers: 6, hp: 70, sp: 11, speed: 50, cover: { inside: "partial", behind: "full" }, desc: { tr: "Yüksek ve ağır. Şehir dışında ve kötü yollarda da rahat ilerler.", en: "Tall and heavy. Handles rough roads and the Badlands with ease." } },
  { id: "zirhli", name: { tr: "Zırhlı araç", en: "Armored vehicle" }, passengers: 6, hp: 90, sp: 13, speed: 40, cover: { inside: "full", behind: "full" }, desc: { tr: "Şirketlerin ve paralı askerlerin aracı. Mermiye karşı neredeyse bir sığınak.", en: "The vehicle of corporations and mercenaries. Against bullets, it's almost a bunker." } },
  { id: "kamyon", name: { tr: "Kamyon", en: "Truck" }, passengers: 2, hp: 100, sp: 11, speed: 30, cover: { inside: "partial", behind: "full" }, desc: { tr: "Ağır yük taşıyan büyük bir araç. Yavaş, ama önüne çıkan her şeyi ezer.", en: "A big vehicle for heavy cargo. Slow, but it flattens anything in its way." } },
  { id: "av", name: { tr: "AV (uçan araç)", en: "AV (aerodyne)" }, passengers: 6, hp: 80, sp: 11, speed: 100, cover: { inside: "full", behind: "full" }, desc: { tr: "Havada giden araç. Pahalı ve nadir; genellikle şirketlerin ya da Trauma Team gibi kurumların elindedir.", en: "A flying vehicle. Expensive and rare; usually in the hands of corporations or outfits like Trauma Team." } },
];

// Evren > Diller listesi. where: konuşulduğu yerler · nc: Night City'de kimler konuşur.
const LANGUAGES = [
  { id: "streetslang", name: { tr: "Streetslang", en: "Streetslang" }, where: { tr: "Dünyanın büyük şehirleri", en: "Every major city in the world" }, nc: { tr: "Herkes", en: "Everyone" }, desc: { tr: "Göçmenlerin, çetelerin ve dev şirketlerin getirdiği kültürlerin birbirine karışmasıyla doğan sokak dili. Temeli İngilizcedir; İspanyolca, Japonca ve daha birçok dilden kelime ve deyim içerir. Night City'de herkes Streetslang bilir; ek diller bunun üstüne seçilir.", en: "A street language born from immigrants, gangs and the cultures that giant corporations bring with them, all mixed together. It's built on English, with words and phrases from Spanish, Japanese and many other languages. Everyone in Night City knows Streetslang; extra languages are chosen on top of it." } },
  { id: "ingilizce", name: { tr: "İngilizce", en: "English" }, where: { tr: "Kuzey Amerika, Britanya, Avustralya", en: "North America, Britain, Australia" }, nc: { tr: "Şirketler, NCPD, medya", en: "Corporations, NCPD, the media" }, desc: { tr: "Resmî işlerin ve iş dünyasının dili. Sözleşmeler, haber yayınları ve resmî belgeler İngilizcedir; Militech gibi Amerikan şirketleri de bu dili konuşur. Sokakta büyüyen biri bazı kelimeleri tanır, ama resmî bir konuşmayı ya da bir sözleşmeyi takip etmek için İngilizce bilmek gerekir.", en: "The language of official business and the corporate world. Contracts, newscasts and official documents are in English, and American corporations like Militech speak it too. Someone raised on the street recognizes some of the words, but following a formal conversation or a contract takes real English." } },
  { id: "ispanyolca", name: { tr: "İspanyolca", en: "Spanish" }, where: { tr: "Meksika, Orta ve Güney Amerika", en: "Mexico, Central and South America" }, nc: { tr: "Heywood, Valentinos", en: "Heywood, the Valentinos" }, desc: { tr: "Night City'nin en yaygın dillerinden biri. Heywood'daki Latin mahallelerinde ve Valentinos çetesinde en çok duyulan dil budur. Pek çok aile evde İspanyolca konuşur.", en: "One of the most common languages in Night City. It's the language you hear most in Heywood's Latino neighborhoods and among the Valentinos gang. Many families speak Spanish at home." } },
  { id: "japonca", name: { tr: "Japonca", en: "Japanese" }, where: { tr: "Japonya", en: "Japan" }, nc: { tr: "Arasaka, Tyger Claws, Japantown", en: "Arasaka, the Tyger Claws, Japantown" }, desc: { tr: "Arasaka'nın ana dili; şirketin üst kademelerinde Japonca bilmek kapı açar. Westbrook'taki Japantown'ın dükkânlarında, kulüplerinde ve Tyger Claws çetesinin arasında da Japonca konuşulur.", en: "Arasaka's home language; knowing Japanese opens doors in the corporation's upper ranks. It's also spoken in the shops and clubs of Japantown in Westbrook, and among the Tyger Claws gang." } },
  { id: "cince", name: { tr: "Çince (Mandarin)", en: "Chinese (Mandarin)" }, where: { tr: "Çin, Doğu Asya", en: "China, East Asia" }, nc: { tr: "Kang Tao, Çinli topluluklar", en: "Kang Tao, Chinese communities" }, desc: { tr: "Dünyada en çok insanın ana dili. Akıllı silahlarıyla tanınan Kang Tao gibi Çinli şirketlerin dilidir; Asya'yla iş yapan herkesin işine yarar.", en: "The native language of more people than any other. It's the language of Chinese corporations like Kang Tao, known for its smart guns, and it's useful to anyone doing business with Asia." } },
  { id: "rusca", name: { tr: "Rusça", en: "Russian" }, where: { tr: "Rusya, Doğu Avrupa", en: "Russia, Eastern Europe" }, nc: { tr: "Scavenger'lar, SovOil", en: "The Scavengers, SovOil" }, desc: { tr: "Scavenger çetesinin dili. İnsanları kaçırıp kromlarını söken bu çetenin üyelerinin çoğu Rus kökenlidir; kendi aralarında Rusça konuşur, duvarlara Rusça yazarlar. Rus petrol devi SovOil'in de dilidir.", en: "The language of the Scavengers. Most members of this gang, which kidnaps people and strips out their chrome, are of Russian origin; they speak Russian among themselves and write it on the walls. It's also the language of the Russian oil giant SovOil." } },
  { id: "haiti-kreolcesi", name: { tr: "Haiti Kreolcesi", en: "Haitian Creole" }, where: { tr: "Haiti, Karayipler", en: "Haiti, the Caribbean" }, nc: { tr: "Voodoo Boys, Pacifica", en: "The Voodoo Boys, Pacifica" }, desc: { tr: "Fransızcadan doğmuş bir kreol dil. Haiti sular altında kaldıktan sonra Night City'ye gelen göçmenlerin dilidir. Pacifica'yı elinde tutan Voodoo Boys çetesi kendi arasında bu dili konuşur.", en: "A creole language that grew out of French. It's the language of the immigrants who came to Night City after Haiti flooded. The Voodoo Boys, who hold Pacifica, speak it among themselves." } },
  { id: "fransizca", name: { tr: "Fransızca", en: "French" }, where: { tr: "Fransa, Avrupa, Afrika", en: "France, Europe, Africa" }, nc: { tr: "Avrupa şirketleri, Haitililer", en: "European corps, Haitians" }, desc: { tr: "Avrupa'nın ve Afrika'nın büyük bir kısmının dili; Avrupa şirketleriyle iş yapanlar için kullanışlıdır. Haiti'nin de resmî dillerinden biri olduğu için Haitili göçmenlerin çoğu Fransızcayı da anlar.", en: "The language of much of Europe and Africa, handy for anyone dealing with European corporations. It's also one of Haiti's official languages, so most Haitian immigrants understand it too." } },
  { id: "arapca", name: { tr: "Arapça", en: "Arabic" }, where: { tr: "Orta Doğu, Kuzey Afrika", en: "The Middle East, North Africa" }, nc: { tr: "Orta Doğulu göçmenler", en: "Middle Eastern immigrants" }, desc: { tr: "Orta Doğu ve Kuzey Afrika'nın ortak dili. Cyberpunk evreninde Orta Doğu'nun büyük kısmı bir nükleer savaşta yaşanmaz hale geldi; bölgeden kaçanlar dünyanın dört bir yanına, Night City'ye de dağıldı.", en: "The shared language of the Middle East and North Africa. In the Cyberpunk world, much of the Middle East was made unlivable by a nuclear war; those who fled the region scattered across the globe, Night City included." } },
];

// Evren > Çeteler listesi. territory: bölge · style: tarz · business: işleri.
const LORE_GANGS = [
  { id: "tyger-claws", name: { tr: "Tyger Claws", en: "Tyger Claws" }, territory: { tr: "Westbrook (Japantown, Charter Hill), Watson (Kabuki)", en: "Westbrook (Japantown, Charter Hill), Watson (Kabuki)" }, style: { tr: "Japon kökenli, yakuza düzeni", en: "Japanese roots, yakuza-style order" }, business: { tr: "Kulüpler ve kumarhaneler; uyuşturucu, haraç, insan kaçakçılığı", en: "Clubs and casinos; drugs, protection, human trafficking" }, desc: { tr: ["Japantown'ın neon sokaklarının sahibi. Katanaları, sokak motorları ve parlayan dövmeleriyle tanınırlar. Şehirdeki bütün çetelerden daha çok yasal işletmeleri vardır: barlar, restoranlar, kumarhaneler, braindance kulüpleri. Asıl para bu vitrinlerin arkasında döner.", "Arasaka'nın pis işlerini yaptıkları, karşılığında krom ve askerî silah aldıkları söylenir. Liderleri onuru ve işi açık savaştan üstün tutar, ama alt kademeler bu disiplini giderek kaybediyor. Mox'la aralarında kan davası vardır."], en: ["They own the neon streets of Japantown, known for their katanas, street bikes and glowing tattoos. They run more legal businesses than any other gang in the city: bars, restaurants, casinos, braindance clubs. The real money moves behind those storefronts.", "They're said to do Arasaka's dirty work in exchange for chrome and military-grade weapons. Their leaders value honor and business over open war, but the lower ranks are steadily losing that discipline. They have a blood feud with the Mox."] } },
  { id: "valentinos", name: { tr: "Valentinos", en: "Valentinos" }, territory: { tr: "Heywood (The Glen, Wellsprings, Vista del Rey)", en: "Heywood (The Glen, Wellsprings, Vista del Rey)" }, style: { tr: "Chicano kültürü, onur yasası", en: "Chicano culture, a code of honor" }, business: { tr: "Araba hırsızlığı ve parça dükkânları; silah ve uyuşturucu kaçakçılığı", en: "Car theft and chop shops; gun and drug running" }, desc: { tr: ["Heywood'un çetesi ve şehrin en büyüklerinden biri. Latin kökenli olmak şart değildir, ama kültürü benimsemek şarttır: Santa Muerte dövmeleri, altın kaplama silahlar, lowrider arabalar, mahalle duvarlarındaki anma resimleri.", "Katı bir onur yasaları vardır; ihanetin cezası korkunç bir ölümdür. Mahalleye bu kadar bağlı oldukları için ne NCPD ne de şirketler aralarına sızabilir. 6th Street'le bitmeyen bir bölge savaşı içindedirler."], en: ["Heywood's gang, and one of the biggest in the city. Latino heritage isn't required, but embracing the culture is: Santa Muerte tattoos, gold-plated guns, lowriders, memorial murals on neighborhood walls.", "They live by a strict code of honor, and betrayal means a gruesome death. Their roots in the neighborhood run so deep that neither the NCPD nor the corporations can get inside. They're locked in an endless turf war with 6th Street."] } },
  { id: "maelstrom", name: { tr: "Maelstrom", en: "Maelstrom" }, territory: { tr: "Watson (Northside, kuzey Kabuki)", en: "Watson (Northside, northern Kabuki)" }, style: { tr: "Krom fanatikleri", en: "Chrome fanatics" }, business: { tr: "Kaçakçılık, suikast, konvoy baskınları, kara BD'ler", en: "Smuggling, hits, convoy raids, black BDs" }, desc: { tr: ["Etin bir zayıflık olduğuna inanan bir çete. Yüzlerini metal plakalarla kapatır, kafalarına kümeler halinde kırmızı gözler takarlar. Üyelerinin bir kısmı çoktan siber psikoza kaymıştır ve bunu umursamazlar.", "Northside'daki eski bir gıda fabrikasını üs olarak kullanır, Totentanz kulübünü işletirler. Kurbanları parçalanmış ya da derisi yüzülmüş halde bulunur."], en: ["A gang that believes flesh is weakness. They hide their faces behind metal plates and cluster red optics across their skulls. Some of their members have already slipped into cyberpsychosis, and they don't care.", "They use an old food plant in Northside as their base and run the Totentanz club. Their victims turn up dismembered or skinned."] } },
  { id: "6th-street", name: { tr: "6th Street", en: "6th Street" }, territory: { tr: "Santo Domingo (Arroyo), Charter Hill", en: "Santo Domingo (Arroyo), Charter Hill" }, style: { tr: "Eski askerler, Amerikan vatanseverliği", en: "Ex-soldiers, American patriotism" }, business: { tr: "Silah kaçakçılığı, haraç, araba kaçakçılığı", en: "Arms smuggling, protection, car smuggling" }, desc: { tr: ["Dördüncü Şirket Savaşı'ndan sonra, NCPD'nin çaresizliğinden bıkan gazilerin mahallelerini korumak için kurduğu bir grup olarak başladı. Zamanla korudukları insanlardan haraç toplayan bir çeteye dönüştüler.", "Bayraklar, kartallar, taktik yelekler ve kamuflaj giyerler; kromları gösterişsiz ve işe yarar türdendir. NCPD onlara gayriresmî bir polis gibi göz yumar, yeter ki kendi bölgelerinin dışına taşmasınlar. Valentinos'la savaşları hiç bitmez."], en: ["It started after the Fourth Corporate War as a group of veterans, fed up with the NCPD's helplessness, protecting their neighborhoods. Over time they became a gang that squeezes the very people they protect.", "They wear flags, eagles, tactical vests and camo; their chrome is plain and practical. The NCPD tolerates them as unofficial police, as long as they stay inside their own turf. Their war with the Valentinos never ends."] } },
  { id: "animals", name: { tr: "Animals", en: "Animals" }, territory: { tr: "Pacifica; tutuldukları her yer", en: "Pacifica; wherever they're hired" }, style: { tr: "Krom değil, kas ve hormon", en: "Muscle and hormones, not chrome" }, business: { tr: "Fedailik, korumalık, steroid ticareti", en: "Bouncers, bodyguards, steroid dealing" }, desc: { tr: ["Kromdan uzak duran, bedenlerini laboratuvarda büyütülmüş kaslar, özel steroidler ve hayvan hormonlarıyla şişiren dövüşçüler. Sürüler halinde dolaşırlar, her sürünün başında bir alfa vardır ve kafes dövüşleri düzenlerler.", "Kalıcı bir bölgeleri yoktur; şehrin her yerinde fedai, koruma ve kiralık kas olarak çalışırlar. Biri onları tuttuğunda başka çetelerin sınırlarını tanımazlar."], en: ["Brawlers who stay away from chrome and pump their bodies up with vat-grown muscle, custom steroids and animal hormones. They move in packs, each led by an alpha, and they hold cage fights.", "They have no permanent turf; they work all over the city as bouncers, bodyguards and hired muscle. Once someone hires them, they ignore other gangs' borders."] } },
  { id: "voodoo-boys", name: { tr: "Voodoo Boys", en: "Voodoo Boys" }, territory: { tr: "Pacifica (Coastview)", en: "Pacifica (Coastview)" }, style: { tr: "Haitili netrunner'lar", en: "Haitian netrunners" }, business: { tr: "Şirket verisi çalmak, netrunning işleri", en: "Stealing corporate data, netrunning jobs" }, desc: { tr: ["Haiti sular altında kaldıktan sonra Pacifica'ya inşaat işçisi olarak gelen göçmenlerden doğan bir çete. 2069'da yatırımcılar bölgeden kaçınca burada kaldılar ve zamanla Pacifica'daki Haitili topluluğun koruyucusu oldular.", "Kapalı ve şüphecidirler; dışarıdan kimseye güvenmezler. Asıl güçleri sokakta değil Net'tedir: şirket veri bankalarına sızar, hesap boşaltır, veri satarlar. Blackwall'un ötesine ulaşmak istedikleri söylenir; bu yüzden NetWatch'la açık bir savaş içindedirler."], en: ["A gang born from the immigrants who came to Pacifica as construction workers after Haiti flooded. When the investors fled the district in 2069 they stayed, and over time became the protectors of Pacifica's Haitian community.", "They're closed off and suspicious, and trust no outsiders. Their real power isn't on the street but in the Net: they break into corporate databanks, drain accounts and sell data. They're said to want to reach beyond the Blackwall, which puts them in open war with NetWatch."] } },
  { id: "mox", name: { tr: "Mox", en: "Mox" }, territory: { tr: "Watson (Kabuki, Lizzie's Bar)", en: "Watson (Kabuki, Lizzie's Bar)" }, style: { tr: "Seks işçileri, punk'lar, dışlananlar", en: "Sex workers, punks, outcasts" }, business: { tr: "Seks işçilerini korumak, Lizzie's Bar", en: "Protecting sex workers, Lizzie's Bar" }, desc: { tr: ["Şehrin en küçük çetesi. 2067'de, Tyger Claws'ın Kabuki'deki bir kulüpte çalışan bir kadını öldürmesiyle başladı. Kulübün sahibi intikamını aldı, Claws da onu öldürüp kulübü yerle bir etti; ardından çıkan isyanlar bütün şehre yayıldı.", "Geride kalanlar kulübü Lizzie's Bar adıyla yeniden kurdu. Mox, seks işçilerini ve sokakta korunmasız kalanları korur, karşılığında kazançlarından pay alır. Pembe ve mavi renkleri, punk tarzları ve göze batan kromlarıyla tanınırlar. Tyger Claws'la düşmanlıkları ölümcüldür."], en: ["The smallest gang in the city. It began in 2067, when the Tyger Claws killed a woman working at a club in Kabuki. The club's owner took her revenge, the Claws killed her and wrecked the club, and the riots that followed spread across the whole city.", "Those left behind rebuilt the club as Lizzie's Bar. The Mox protect sex workers and anyone else left defenseless on the street, in exchange for a cut. They're known for their pink and blue colors, punk style and showy chrome. Their feud with the Tyger Claws is deadly."] } },
  { id: "scavengers", name: { tr: "Scavengers", en: "Scavengers" }, territory: { tr: "Şehrin her yeri; en çok Pacifica ve Wellsprings", en: "All over the city; mostly Pacifica and Wellsprings" }, style: { tr: "Kural tanımayan sürüler", en: "Lawless packs" }, business: { tr: "İnsan kaçırıp krom ve organ sökmek", en: "Kidnapping people to strip their chrome and organs" }, desc: { tr: ["Night City'nin en çok nefret edilen çetesi. İnsanları kaçırır, kromlarını ve organlarını söker, geriye kalanı yakar ya da kanalizasyona atarlar. Şehirdeki ucuz kaçak kromun büyük kısmı onların elinden geçer.", "Ortak bir liderleri ya da yasaları yoktur; her sürünün başında en vahşi olan durur. Üyelerinin çoğu Rus kökenlidir ve kendi aralarında Rusça konuşur. Herkes onların düşmanıdır."], en: ["The most hated gang in Night City. They kidnap people, strip out their chrome and organs, and burn what's left or dump it in the sewers. Much of the city's cheap black-market chrome passes through their hands.", "They have no shared leader or law; each pack is led by whoever is most savage. Most of their members are of Russian origin and speak Russian among themselves. Everyone is their enemy."] } },
  { id: "wraiths", name: { tr: "Wraiths", en: "Wraiths" }, territory: { tr: "Badlands, şehrin çevresi", en: "The Badlands, the city's outskirts" }, style: { tr: "Nomad yasasını reddeden haydutlar", en: "Raiders who reject nomad law" }, business: { tr: "Yol kesmek, konvoylara ve kamplara baskın", en: "Highway robbery, raids on convoys and camps" }, desc: { tr: ["Nomad ailelerinden kopmuş ya da kovulmuş, hiçbir ailenin yasasını tanımayan haydutlar. Ailelerinden kovulan nomad'lara Raffen Shiv denir; Wraiths bunların en büyük grubudur.", "Badlands'te yol keser, küçük nomad gruplarına, korumasız şirket konvoylarına ve köylere baskın yaparlar. Taşıma işi alıp yükü kendilerine saklamak ya da yolcuları fidye için rehin tutmak gibi oyunları da vardır. Aldecaldos'la kanlı bir savaş içindedirler ve suçları çoğu zaman bütün nomad'ların üstüne kalır."], en: ["Raiders who have broken away from or been thrown out of their nomad families, and who recognize no family's law. Nomads expelled from their families are called Raffen Shiv; the Wraiths are the biggest group of them.", "They rob travelers in the Badlands and raid small nomad groups, poorly guarded corporate convoys and villages. They also take transport jobs and then keep the cargo, or hold the passengers for ransom. They're at bloody war with the Aldecaldos, and their crimes often get pinned on all nomads."] } },
  { id: "barghest", name: { tr: "Barghest", en: "Barghest" }, territory: { tr: "Dogtown (Pacifica)", en: "Dogtown (Pacifica)" }, style: { tr: "Paralı ordu", en: "Private army" }, business: { tr: "Silah ticareti, Dogtown'daki her işten pay", en: "Arms dealing, a cut of every business in Dogtown" }, desc: { tr: ["Bir çeteden çok özel bir ordu. Birleşme Savaşı'nın sonunda bir askerî birlik Pacifica'nın bir parçasını ele geçirdi ve silahlarını hiç bırakmadı. Duvarlarla çevrilen bu bölgeye Dogtown denir.", "Saflarında unutulmuş gaziler, sözleşmesiz paralı askerler ve sokak çocukları vardır; silahları askerî seviyededir. NCPD Dogtown'a giremez. Şehrin bir bölgesini ele geçirip yetkililere karşı tutabilen tek güç onlardır."], en: ["A private army more than a gang. At the end of the Unification War, a military unit seized a piece of Pacifica and never laid down its weapons. That walled-off district is called Dogtown.", "Their ranks are filled with forgotten veterans, mercs without contracts and street kids, and their weapons are military grade. The NCPD can't enter Dogtown. They're the only force to have taken a district of the city and held it against the authorities."] } },
  { id: "aldecaldos", name: { tr: "Aldecaldos", en: "Aldecaldos" }, territory: { tr: "Badlands kampları", en: "Badlands camps" }, style: { tr: "Nomad ailesi", en: "Nomad family" }, business: { tr: "Kaçakçılık, kervan korumak, taşımacılık", en: "Smuggling, caravan escort, transport" }, desc: { tr: ["Bir çete değil, Çöküş yıllarında kurulmuş bir nomad ailesi. Yolda yaşayan geniş bir ailedir ve her şeyden önce aile gelir. Kervanları Batı Kıyısı'ndaki Özgür Eyaletler boyunca dolaşır.", "Kaçakçılık yapar, yük ve yolcu taşır, hurdacılık ve tarım işleri alırlar. Şehirdeki fixer'larla ve şirketlerle iş yapmaktan çekinmezler."], en: ["Not a gang but a nomad family, founded during the Collapse. It's a large family that lives on the road, and family comes before everything. Their caravans travel across the Free States of the West Coast.", "They smuggle, haul cargo and passengers, and take scavenging and farm work. They have no problem doing business with the city's fixers and corporations."] } },
];

// Evren > Night City bölgeleri. subs: alt bölgeler · control: kimin elinde · notable: öne çıkanlar.
const LORE_DISTRICTS = [
  { id: "city-center", name: { tr: "City Center", en: "City Center" }, subs: { tr: "Corpo Plaza, Downtown", en: "Corpo Plaza, Downtown" }, control: { tr: "Şirket güvenliği, NCPD", en: "Corporate security, NCPD" }, notable: { tr: "Arasaka Kulesi, Memorial Park, şirket merkezleri", en: "Arasaka Tower, Memorial Park, corporate HQs" }, desc: { tr: ["Şehrin kalbi ve şirketlerin kalesi. Corpo Plaza'da Arasaka, Militech, Biotechnica, Petrochem ve Kang Tao'nun merkezleri yan yana durur; burası şirketlerin kendi kendini yönettiği bir bölgedir. Yeni Arasaka Kulesi, 2023'te nükleer bombayla yıkılan eski kulenin yerinde yükselir. Dibinde, savaşta ölenler için yapılmış Memorial Park vardır.", "Downtown şehrin en yeni kısmıdır: ofisler, lüks oteller, pahalı restoranlar ve seçkin kulüpler. Gece olunca ara sokaklarında sentetik uyuşturucu ve yasa dışı braindance satılır."], en: ["The heart of the city and the corporations' fortress. In Corpo Plaza the headquarters of Arasaka, Militech, Biotechnica, Petrochem and Kang Tao stand side by side; it's a zone where the corporations govern themselves. The new Arasaka Tower rises on the site of the old one, destroyed by a nuke in 2023. At its foot lies Memorial Park, built for those who died in the war.", "Downtown is the newest part of the city: offices, luxury hotels, expensive restaurants and exclusive clubs. After dark, its back alleys sell synthetic drugs and illegal braindances."] } },
  { id: "watson", name: { tr: "Watson", en: "Watson" }, subs: { tr: "Little China, Kabuki, Northside, Arasaka Waterfront", en: "Little China, Kabuki, Northside, Arasaka Waterfront" }, control: { tr: "Tyger Claws, Maelstrom, Mox", en: "Tyger Claws, Maelstrom, Mox" }, notable: { tr: "Afterlife, Kabuki pazarı, Lizzie's Bar", en: "The Afterlife, Kabuki Market, Lizzie's Bar" }, desc: { tr: ["Şehrin kötü tarafı: kalabalık, ucuz ve göçmenlerle dolu. 2040'larda Japon sermayesi bölgeye para akıttı, ama Arasaka 2070'te şehre dönünce bu düzen çöktü. Kabuki'nin Japon sakinleri gitti, Northside'daki fabrikalar kapandı, Arasaka da boşalan ucuz arazileri satın alıp duvarlarla çevirdi.", "Little China'da restoranlar, tuhaf dükkânlar ve paralı askerlerin barı Afterlife vardır. Kabuki dar sokaklardan, dolandırıcılardan ve pazarlardan oluşan bir labirenttir; Mox'un merkezi Lizzie's Bar da buradadır. Northside'da Maelstrom'un sözü geçer ve NCPD oraya pek girmez. Arasaka Waterfront ise dışarıya kapalı, taretlerle korunan bir Arasaka limanıdır."], en: ["The bad side of town: crowded, cheap and full of immigrants. In the 2040s Japanese capital poured money into the district, but that order collapsed when Arasaka returned to the city in 2070. Kabuki's Japanese residents left, Northside's factories shut down, and Arasaka bought up the cheap empty land and walled it off.", "Little China has restaurants, odd little shops and the mercs' bar, the Afterlife. Kabuki is a maze of narrow alleys, con artists and markets, and home to Lizzie's Bar, the Mox headquarters. In Northside, Maelstrom calls the shots and the NCPD rarely goes in. The Arasaka Waterfront is a closed-off Arasaka port guarded by turrets."] } },
  { id: "westbrook", name: { tr: "Westbrook", en: "Westbrook" }, subs: { tr: "Japantown, Charter Hill, North Oak", en: "Japantown, Charter Hill, North Oak" }, control: { tr: "Tyger Claws, özel güvenlik", en: "Tyger Claws, private security" }, notable: { tr: "Jig-Jig Street, kumarhaneler, North Oak villaları", en: "Jig-Jig Street, casinos, North Oak villas" }, desc: { tr: ["Şehrin en zengin bölgesi; başka yerlerde kazanılan paranın harcandığı yer. Japantown kumarhaneleri, gece hayatı ve şehrin Japon topluluğuyla bilinir; Jig-Jig Street ise genelevler sokağıdır. Geceleri sokaklar Tyger Claws'a aittir.", "Charter Hill, bir gün North Oak'a taşınmayı hayal eden orta kademe şirket çalışanlarının yeridir. North Oak'ın tepelerinde çetelerin giremediği, duvarlarla korunan villalar vardır. Toprağa gömülmek 2040'lardan beri yasak olduğu için şehrin ölüleri de North Oak'taki Columbarium'da saklanır."], en: ["The richest district in the city, where money made elsewhere gets spent. Japantown is known for its casinos, its nightlife and the city's Japanese community; Jig-Jig Street is the red-light strip. At night, the streets belong to the Tyger Claws.", "Charter Hill is where mid-level corporate workers live, dreaming of moving up to North Oak one day. North Oak's hills hold walled villas that no gang can get into. Since burial in the ground has been banned since the 2040s, the city's dead are kept in the Columbarium in North Oak."] } },
  { id: "heywood", name: { tr: "Heywood", en: "Heywood" }, subs: { tr: "Wellsprings, The Glen, Vista del Rey", en: "Wellsprings, The Glen, Vista del Rey" }, control: { tr: "Valentinos, 6th Street", en: "Valentinos, 6th Street" }, notable: { tr: "Belediye binası, mahkemeler, Latin mahalleleri", en: "City Hall, the courts, Latino barrios" }, desc: { tr: ["Night City'nin en büyük yatak odası: büyük Latin mahalleleriyle dolu bir yerleşim bölgesi. Sokaklarda Valentinos'un sözü geçer, 6th Street de bölgede iş çevirir.", "The Glen şehrin yönetim merkezidir; belediye binası, mahkemeler ve yoğun bir NCPD varlığı buradadır. Wellsprings bölgenin en güvenli kısmıdır. Vista del Rey ise en yoksulu: ihmal edilmiş, suçla dolu ve Valentinos'un kalesi."], en: ["Night City's biggest bedroom: a residential district full of large Latino barrios. The Valentinos run the streets, and 6th Street does business here too.", "The Glen is the seat of city government, with City Hall, the courts and a heavy NCPD presence. Wellsprings is the safest part of the district. Vista del Rey is the poorest: neglected, crime-ridden and a Valentinos stronghold."] } },
  { id: "santo-domingo", name: { tr: "Santo Domingo", en: "Santo Domingo" }, subs: { tr: "Arroyo, Rancho Coronado", en: "Arroyo, Rancho Coronado" }, control: { tr: "6th Street", en: "6th Street" }, notable: { tr: "Fabrikalar, santraller, megabinalar", en: "Factories, power plants, megabuildings" }, desc: { tr: ["Şehrin en eski bölgelerinden biri ve sanayisinin kalbi. Modern bir sanayi bölgesi olarak planlandı, ama binlerce insanın sığındığı bir kampa dönüştü. Megabinalarında yoksul işçilerin oturduğu on binlerce küçük daire vardır.", "Arroyo fabrikalar, hurdalıklar ve santrallerle doludur. Rancho Coronado ise bir şirketin kurduğu, birbirinin aynısı evlerden oluşan bir banliyödür. NCPD buraya yetişemediği için sokakları 6th Street tutar."], en: ["One of the city's oldest districts and the heart of its industry. It was planned as a modern industrial zone but turned into a camp where thousands took shelter. Its megabuildings hold tens of thousands of tiny apartments for poor workers.", "Arroyo is full of factories, junkyards and power plants. Rancho Coronado is a company-built suburb of identical houses. The NCPD can't keep up out here, so 6th Street holds the streets."] } },
  { id: "pacifica", name: { tr: "Pacifica", en: "Pacifica" }, subs: { tr: "Coastview, West Wind Estate, Dogtown", en: "Coastview, West Wind Estate, Dogtown" }, control: { tr: "Voodoo Boys, Scavenger'lar, Barghest", en: "Voodoo Boys, Scavengers, Barghest" }, notable: { tr: "Yarım kalmış tatil köyü, Dogtown'ın duvarları", en: "The unfinished resort, the walls of Dogtown" }, desc: { tr: ["Lüks bir tatil cenneti olarak planlandı ve çoğunlukla Haitili işçilerle inşa edildi. 2069'da savaş korkusuyla yatırımcılar çekilince yarım kaldı. 2070'te inşaatı yeniden başlatma girişimi Voodoo Boys'un direnişiyle karşılaştı; NCPD'nin tahliyeleri haftalarca süren isyanlara yol açtı.", "Ekim 2072'de bölgedeki polis karakolu kapatıldı ve Pacifica bir Combat Zone ilan edildi. Coastview'da Voodoo Boys güçlüdür; güneydeki West Wind Estate'te Scavenger'lar dolaşır. Pacifica'nın bir parçası olan Dogtown ise Barghest milislerinin duvarlarla çevirdiği, NCPD'nin giremediği bir şehir içinde şehirdir."], en: ["It was planned as a luxury resort and built mostly by Haitian workers. When the investors pulled out in 2069, afraid of the war, it was left half-finished. A 2070 attempt to restart construction ran into resistance from the Voodoo Boys, and the NCPD's evictions set off riots that lasted for weeks.", "In October 2072 the district's police precinct was shut down and Pacifica was declared a Combat Zone. The Voodoo Boys are strong in Coastview; scavengers roam West Wind Estate to the south. Dogtown, a part of Pacifica, is a city within the city: walled off by the Barghest militia, closed to the NCPD."] } },
  { id: "badlands", name: { tr: "Badlands", en: "Badlands" }, subs: { tr: "Şehrin dışındaki çöl", en: "The desert outside the city" }, control: { tr: "Nomad aileleri, Wraiths", en: "Nomad families, the Wraiths" }, notable: { tr: "Çöplükler, petrol sahaları, Biotechnica tarlaları", en: "Landfills, oil fields, Biotechnica farms" }, desc: { tr: ["Night City'yi çevreleyen, kuraklıkla çöle dönmüş topraklar: çöplükler, kimyasal atık alanları, yanan petrol sahaları ve asit yağmurları. Şehrin kurallarının bittiği yer burasıdır.", "Nomad aileleri kamplarını burada kurar ve yolları en iyi onlar bilir; Wraiths gibi haydutlar da yolculara ve konvoylara pusu kurar. Biotechnica'nın geniş tarlaları şehrin tükettiği proteinin yarısından fazlasını üretir."], en: ["The land around Night City, turned to desert by drought: landfills, chemical waste zones, burning oil fields and acid rain. This is where the city's rules end.", "Nomad families set up their camps here and know the roads better than anyone, while raiders like the Wraiths ambush travelers and convoys. Biotechnica's huge farms grow more than half of the protein the city eats."] } },
];

// Evren > Şirketler listesi. sector: alan · nc: Night City'de.
const LORE_CORPS = [
  { id: "arasaka", name: { tr: "Arasaka", en: "Arasaka" }, sector: { tr: "Güvenlik, bankacılık, silah ve krom", en: "Security, banking, weapons and chrome" }, nc: { tr: "Arasaka Kulesi, Watson limanı, North Oak malikânesi", en: "Arasaka Tower, the Watson docks, the North Oak estate" }, desc: { tr: ["Tokyo merkezli, dünyanın en güçlü şirketlerinden biri. 1915'te kuruldu; güvenlik ve bankacılık hizmeti verir, silah, araç ve krom üretir. Şirketi kurulduğu günden beri aynı aile yönetir.", "Dördüncü Şirket Savaşı'nı kaybetti ve 2023'te ABD'den kovuldu. 2070'te Birleşme Savaşı sırasında Night City'yi koruyunca şehre geri döndü; bugün yeniden inşa ettiği kulesi şehrin en yüksek binasıdır."], en: ["Based in Tokyo, one of the most powerful corporations in the world. Founded in 1915, it provides security services and banking, and makes weapons, vehicles and chrome. The same family has run it since the day it was founded.", "It lost the Fourth Corporate War and was thrown out of the US in 2023. It returned to Night City in 2070 after protecting the city during the Unification War; today its rebuilt tower is the tallest building in the city."] } },
  { id: "militech", name: { tr: "Militech", en: "Militech" }, sector: { tr: "Silah, askerî araç, dron, paralı askerlik", en: "Weapons, military vehicles, drones, private military" }, nc: { tr: "Corpo Plaza'daki ofisler, Badlands'teki tesisler", en: "Offices in Corpo Plaza, facilities in the Badlands" }, desc: { tr: ["Washington merkezli, dünyanın en büyük silah üreticisi ve Arasaka'nın baş rakibi. Dördüncü Şirket Savaşı'nı kazandı, ama savaşın sonunda ABD hükümeti tarafından devletleştirildi. O günden beri şirketle devlet arasındaki çizgi bulanıktır: yönetim kurulunun birçok üyesi aynı zamanda üst düzey askerdir.", "NUSA'nın başkanı, Militech'in eski CEO'sudur. Birleşme Savaşı'nda NUSA ordusu Militech'in silahlarıyla savaştı. Night City'de NCPD'nin teçhizatının büyük kısmı Militech'ten gelir; Arasaka'yla aralarındaki gizli savaş hiç bitmez."], en: ["Based in Washington, the world's biggest weapons maker and Arasaka's chief rival. It won the Fourth Corporate War, but at the end of it the US government nationalized it. Ever since, the line between company and state has been blurry: many of its board members are also senior military officers.", "The NUSA's president is Militech's former CEO. In the Unification War, the NUSA army fought with Militech weapons. In Night City, much of the NCPD's equipment comes from Militech, and its covert war with Arasaka never ends."] } },
  { id: "kang-tao", name: { tr: "Kang Tao", en: "Kang Tao" }, sector: { tr: "Akıllı silahlar, güvenlik", en: "Smart weapons, security" }, nc: { tr: "Corpo Plaza'daki bina; şehrin büyük işverenlerinden", en: "A building in Corpo Plaza; one of the city's big employers" }, desc: { tr: ["Hızla yükselen genç bir Çin şirketi. 2040'larda iflasın eşiğindeki bir devlet silah şirketini eski bir albay devraldı; şirket 2050'de ilk akıllı tabancasını çıkardı ve o günden beri silah sektörünün zirvesine tırmanıyor.", "Uzmanlığı akıllı silahlardır: hedefini kendi bulan güdümlü mermiler atan tabancalar, tüfekler ve pompalılar. Arkasında Çin hükümetinin desteği vardır. Çalışanlarına cömert bir sağlık güvencesi verir, ama karşılığında onlarca yıllık bir sadakat sözleşmesi imzalatır."], en: ["A young Chinese corporation on a fast rise. In the 2040s, a former army colonel took over a state arms company on the verge of bankruptcy; in 2050 it released its first smart pistol, and it has been climbing to the top of the weapons industry ever since.", "Its specialty is smart weapons: pistols, rifles and shotguns that fire guided rounds that find their own target. It has the Chinese government's backing. It gives its employees generous medical coverage, but in return makes them sign a loyalty contract that lasts decades."] } },
  { id: "biotechnica", name: { tr: "Biotechnica", en: "Biotechnica" }, sector: { tr: "Genetik mühendisliği, tarım, yakıt", en: "Genetic engineering, agriculture, fuel" }, nc: { tr: "Badlands'teki seralar ve protein tarlaları", en: "Greenhouses and protein farms in the Badlands" }, desc: { tr: ["İtalyan kökenli genetik mühendisliği devi. 1990'larda benzinin yerini alan tahıl alkolü yakıtı CHOOH2'yi icat etti ve üretim hakkını Petrochem'e verdi. Tasarlanmış ürünleri ve protein tarlaları dünyanın büyük kısmını besler.", "Night City'nin yiyeceğinin önemli bir kısmı Biotechnica'dan gelir: Badlands'teki otomatik seraları ve protein tarlaları şehrin tükettiği proteinin yarısından fazlasını üretir."], en: ["An Italian-born genetic engineering giant. In the 1990s it invented CHOOH2, the grain-alcohol fuel that replaced gasoline, and licensed its production to Petrochem. Its engineered crops and protein farms feed much of the world.", "A big share of Night City's food comes from Biotechnica: its automated greenhouses and protein farms in the Badlands grow more than half of the protein the city eats."] } },
  { id: "petrochem", name: { tr: "Petrochem", en: "Petrochem" }, sector: { tr: "Enerji ve yakıt", en: "Energy and fuel" }, nc: { tr: "Şehrin her yerinde onun yakıtı yanar", en: "Its fuel burns all over the city" }, desc: { tr: ["Teksas merkezli, dünyanın en büyük CHOOH2 üreticisi ve Biotechnica'nın en büyük ortağı. Night City'nin kuruluşunu finanse eden üç şirketten biridir.", "İkinci Şirket Savaşı'nda Güney Çin Denizi'ndeki petrol sahaları için SovOil'le savaştı. Bugün dünyanın enerjisinin neredeyse tamamı Petrochem ile SovOil'in elindedir."], en: ["Based in Texas, the world's largest CHOOH2 producer and Biotechnica's biggest partner. It's one of the three corporations that funded Night City's founding.", "In the Second Corporate War it fought SovOil over oil fields in the South China Sea. Today nearly all of the world's energy is in the hands of Petrochem and SovOil."] } },
  { id: "sovoil", name: { tr: "SovOil", en: "SovOil" }, sector: { tr: "Petrol ve yakıt", en: "Oil and fuel" }, nc: { tr: "Şehirde pek görünmez", en: "Barely visible in the city" }, desc: { tr: ["Petrochem'in baş rakibi olan Rus enerji devi. CHOOH2'si daha ucuz ama daha az saftır; Batı Avrupa pazarına hâkimdir."], en: ["The Russian energy giant and Petrochem's archrival. Its CHOOH2 is cheaper but less pure, and it dominates the Western European market."] } },
  { id: "zetatech", name: { tr: "Zetatech", en: "Zetatech" }, sector: { tr: "AV'ler, dronlar, bilgisayar ve krom", en: "AVs, drones, computers and chrome" }, nc: { tr: "Gökyüzündeki AV'lerin ve dronların çoğu", en: "Most of the AVs and drones in the sky" }, desc: { tr: ["Eskiden bilgisayarları ve cyberdeck'leriyle tanınırdı; bugün uçan araçlar (AV), dronlar ve krom üretir. Dördüncü Şirket Savaşı'ndan sonra devlet ihaleleriyle büyüdü.", "Night City'nin gökyüzünde görülen AV'lerin ve dronların çoğu Zetatech yapımıdır. Sokakta en çok bilinen ürünlerinden biri, kullananın zaman algısını hızlandıran Sandevistan'dır."], en: ["It used to be known for its computers and cyberdecks; today it makes flying vehicles (AVs), drones and chrome. It grew on government contracts after the Fourth Corporate War.", "Most of the AVs and drones in Night City's sky are Zetatech-built. One of its best-known products on the street is the Sandevistan, which speeds up the user's perception of time."] } },
  { id: "kiroshi", name: { tr: "Kiroshi", en: "Kiroshi" }, sector: { tr: "Göz kromu", en: "Cyberoptics" }, nc: { tr: "Hemen her ripperdoc'un rafında", en: "On almost every ripperdoc's shelf" }, desc: { tr: ["Saat üreticisi olarak başlayan bir Japon şirketi; bugün kromlu gözlerde işinin en iyisi sayılır. Küçük bir şirkettir, ama Night City'deki kromlu gözlerin çoğu Kiroshi'dir."], en: ["A Japanese company that started out making watches; today it's considered the best in the business for cyberoptics. It's a small company, but most of the chrome eyes in Night City are Kiroshi."] } },
  { id: "trauma-team", name: { tr: "Trauma Team", en: "Trauma Team" }, sector: { tr: "Silahlı acil sağlık", en: "Armed emergency medicine" }, nc: { tr: "Zırhlı AV'leri şehrin üstünde dolaşır", en: "Its armored AVs circle over the city" }, desc: { tr: ["Abonelikle çalışan, silahlı bir ambulans şirketi. Abone bir müşteri yaralandığında zırhlı bir AV ile gelir: bir pilot, silahlı korumalar ve sağlıkçılar. Yalnızca abonelerini kurtarır ve müşteriyi tehdit eden herkese ateş eder.", "Abonelik seviyeleri vardır (Silver, Gold, Platinum); seviye yükseldikçe ekip daha hızlı gelir. Birçok şirket, çalışanlarının sözleşmesine Trauma Team aboneliği ekler. Dördüncü Şirket Savaşı'nda tarafsız kaldı."], en: ["An armed ambulance company that runs on subscriptions. When a subscribing client is hurt, it arrives in an armored AV: a pilot, armed guards and medics. It saves only its subscribers and shoots anyone who threatens the client.", "It has subscription tiers (Silver, Gold, Platinum); the higher the tier, the faster the team arrives. Many corporations add a Trauma Team plan to their employees' contracts. It stayed neutral in the Fourth Corporate War."] } },
  { id: "night-corp", name: { tr: "Night Corp", en: "Night Corp" }, sector: { tr: "Altyapı ve kamu hizmetleri", en: "Infrastructure and public utilities" }, nc: { tr: "Yollar, metro, elektrik, su", en: "Roads, metro, power, water" }, desc: { tr: ["Night City'ye en sıkı bağlı şirket. Kurucu Richard Night'ın mirasından doğdu; 1998'deki suikastten sonra ailesi tarafından yeniden kuruldu. Şehrin yollarını, köprülerini, metrosunu, elektriğini ve suyunu işletir; NCART da onundur.", "Çok gizli bir şirkettir: gerçekte ne kadar büyük olduğunu ve kimin yönettiğini kimse tam bilmez. Burs programları ve hayır işleriyle iyi bir yüz göstermeye çalışır."], en: ["The corporation most tightly bound to Night City. It grew out of founder Richard Night's legacy and was refounded by his family after his assassination in 1998. It runs the city's roads, bridges, metro, power and water, and owns NCART too.", "It's a very secretive company: nobody really knows how big it is or who runs it. It tries to show a friendly face through scholarships and charity."] } },
  { id: "network-54", name: { tr: "Network 54", en: "Network 54" }, sector: { tr: "Yayıncılık, haber", en: "Broadcasting, news" }, nc: { tr: "N54 News, şehrin ana haber kanalı", en: "N54 News, the city's main newscast" }, desc: { tr: ["Eski bir ulusal yayın ağı. Haber kanalı N54 News, Night City'de en çok izlenen haber yayınıdır."], en: ["An old national broadcast network. Its news channel, N54 News, is the most-watched newscast in Night City."] } },
  { id: "orbital-air", name: { tr: "Orbital Air", en: "Orbital Air" }, sector: { tr: "Yörünge taşımacılığı", en: "Orbital transport" }, nc: { tr: "Şehrin uzay limanı", en: "The city's spaceport" }, desc: { tr: ["Dünya ile yörünge arasındaki yolculuğun neredeyse tek sahibi. Uzay uçaklarıyla yolcu ve yükü yörüngedeki istasyonlara ve Ay'a taşır. Birinci Şirket Savaşı'nda EBM'le savaşmıştı."], en: ["It holds a near-monopoly on travel between Earth and orbit. Its spaceplanes carry passengers and cargo to the orbital stations and the Moon. It fought EBM in the First Corporate War."] } },
  { id: "tsunami", name: { tr: "Tsunami Defense Systems", en: "Tsunami Defense Systems" }, sector: { tr: "Üst sınıf silahlar", en: "High-end weapons" }, nc: { tr: "Silah dükkânlarının pahalı raflarında", en: "On gun shops' expensive shelves" }, desc: { tr: ["Gizliliği ve yenilikçiliğiyle bilinen bir Japon silah şirketi. Pahalı, kaliteli ve kendine özgü silahlar üretir."], en: ["A Japanese weapons company known for its secrecy and innovation. It makes expensive, high-quality, distinctive weapons."] } },
  { id: "budget-arms", name: { tr: "Budget Arms", en: "Budget Arms" }, sector: { tr: "Ucuz silahlar", en: "Cheap weapons" }, nc: { tr: "Sokakta en kolay bulunan silahlar", en: "The easiest guns to find on the street" }, desc: { tr: ["Ucuz ve güvenilmez silahlar üreten bir şirket. Sokakta en kolay bulunan silahlar onundur; bazıları birkaç atıştan sonra atılmak üzere yapılmıştır."], en: ["A company that makes cheap, unreliable guns. Its weapons are the easiest to find on the street; some are made to be thrown away after a few shots."] } },
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
  { id: "ping", name: "Ping", type: "kesif", tier: 1, ram: 1, spec: null, desc: { tr: "Hedef alınan kişinin ya da cihazın bağlı olduğu ağı tarar. Aynı ağa bağlı bütün düşmanlar, kameralar, taretler ve cihazlar 2 tur boyunca yalnızca Netrunner'a işaretli görünür; duvarların arkasındakiler de. Ekibin geri kalanı bu işaretleri görmez. İşaretlenenlerin yeri bilinir ama kendileri görülmüş sayılmaz: duvarın ardındakilere quickhack yapmak için yine de görüş gerekir. Ağa bağlı olmayan şeyleri ve kromu olmayan insanları göstermez.", en: "Scans the network the targeted person or device is connected to. Every enemy, camera, turret and device on that network is marked for the Netrunner alone for 2 rounds, including those behind walls. The rest of the crew doesn't see the marks. The marked targets' positions are known, but they don't count as seen: quickhacking someone behind a wall still requires sight. It doesn't reveal anything off the network, or people with no chrome." } },
  { id: "shock", name: "Shock", type: "saldiri", tier: 1, ram: 2, spec: null, desc: { tr: "Hedefin kromuna küçük bir elektrik yükü gönderir: 1d6 hasar, zırh işlemez. Kromu olmayan bir hedefi etkilemez.", en: "Sends a small electrical charge through the target's chrome: 1d6 damage, armor doesn't apply. It has no effect on a target without chrome." } },
  { id: "distract", name: "Distract", type: "cihaz", tier: 1, ram: 1, spec: null, desc: { tr: "Görüş alanındaki bir cihazı (ekran, hoparlör, otomat, telefon) aniden çalıştırıp ses ya da görüntüyle dikkat çeker. Yakındaki, henüz alarma geçmemiş düşmanlar 1 tur boyunca oraya bakar ya da oraya doğru yürür; bu sırada ekip gizlenebilir ya da geçip gidebilir. Savaşa girmiş ya da alarma geçmiş düşmanları etkilemez.", en: "Suddenly switches on a device in sight (a screen, a speaker, a vending machine, a phone) to draw attention with sound or images. Nearby enemies who aren't on alert yet look at it or walk toward it for 1 round, giving the crew a chance to hide or slip past. It doesn't affect enemies already in combat or on alert." } },
  { id: "turn-on-off", name: "Turn On/Off", type: "cihaz", tier: 1, ram: 1, spec: null, desc: { tr: "Görüş alanındaki bir cihazı açar ya da kapatır: kamera, ışık, ekran, kapı paneli, alarm hoparlörü. Kapatılan cihaz, biri elle yeniden açana ya da bir güvenlik sistemi onu düzeltene kadar kapalı kalır. Taret ve dron gibi silahlı sistemler bu quickhack'le kapatılamaz.", en: "Switches a device in sight on or off: a camera, a light, a screen, a door panel, an alarm speaker. A device switched off stays off until someone turns it back on by hand or a security system resets it. Armed systems such as turrets and drones can't be switched off this way." } },
  { id: "sonic-shock", name: "Sonic Shock", type: "kontrol", tier: 1, ram: 2, spec: null, desc: { tr: "Hedefin işitme kromunu ya da kulak implantını bozar. Hedef 2 tur boyunca hiçbir şey duymaz: telsizle ya da bağırarak kimseyi çağıramaz, alarmları ve yaklaşan ayak seslerini duymaz. İşitmesine bağlı bir kromu olmayan hedefi etkilemez.", en: "Scrambles the target's hearing chrome or ear implant. For 2 rounds the target hears nothing: they can't call anyone by radio or by shouting, and they don't hear alarms or approaching footsteps. It has no effect on a target without hearing-linked chrome." } },
  { id: "analyze", name: "Analyze", type: "kesif", tier: 1, ram: 1, spec: null, desc: { tr: "Hedefi tarar ve üç şeyi öğrenir: kafa ve gövde zırhının SP'sini, yara durumunu (sağlam, Ağır Yaralı, Ölümcül Yaralı) ve taktığı kromlardan birini. Hangi kromun ortaya çıkacağını Netrunner seçemez; aynı hedefe tekrar yapılırsa başka bir krom görünür. Hedefin aklından geçenleri ya da cebindekileri göstermez.", en: "Scans the target and reveals three things: the SP of their head and body armor, their wound state (unhurt, Seriously Wounded, Mortally Wounded) and one of their chrome implants. The Netrunner can't choose which implant is revealed; using it on the same target again reveals a different one. It doesn't reveal what the target is thinking or carrying." } },
  { id: "reboot-optics", name: "Reboot Optics", type: "kontrol", tier: 2, ram: 3, spec: null, desc: { tr: "Hedefin göz kromunu yeniden başlatır. Hedef bir sonraki turunun sonuna kadar kördür: saldırı atışları dezavantajlıdır ve görmeye dayalı Perception atışlarında otomatik olarak başarısız olur. Göz kromu olmayan bir hedefi etkilemez.", en: "Reboots the target's cyberoptics. Until the end of their next turn the target is blind: their attack rolls have disadvantage and they automatically fail Perception rolls that rely on sight. It has no effect on a target without cyberoptics." } },
  { id: "weapon-glitch", name: "Weapon Glitch", type: "kontrol", tier: 2, ram: 3, spec: null, desc: { tr: "Hedefin elindeki elektronik parçalı bir silahı bozar. Silah tutukluk yapar ve hedef bir aksiyon harcayıp onu düzeltene kadar ateş etmez. Akıllı silahlar düzeltilene kadar akıllı özelliklerini de kaybeder. Elektroniği olmayan mekanik silahları ve yakın dövüş silahlarını etkilemez.", en: "Glitches an electronic-component weapon in the target's hands. The weapon jams and won't fire until the target spends an action to clear it. Smart weapons also lose their smart features until cleared. It doesn't affect purely mechanical guns or melee weapons." } },
  { id: "cripple-movement", name: "Cripple Movement", type: "kontrol", tier: 2, ram: 2, spec: null, desc: { tr: "Hedefin bacaklarına giden sinir sinyallerini keser. Hedef bir sonraki turunun sonuna kadar yerinden kıpırdayamaz; yine de saldırabilir, aksiyon kullanabilir ve Reaction'la mermiden kaçabilir. Sinir sistemine bağlı bir kromu ya da neuroport'u olmayan hedefi etkilemez.", en: "Cuts the nerve signals to the target's legs. Until the end of their next turn the target can't move from their spot; they can still attack, take actions and use their Reaction to dodge bullets. It has no effect on a target without a neuroport or other nerve-linked chrome." } },
  { id: "short-circuit", name: "Short Circuit", type: "saldiri", tier: 2, ram: 3, spec: null, desc: { tr: "Hedefin kromuna güçlü bir elektrik akımı verir: 2d6 hasar, zırh işlemez. Hedefte üç ya da daha fazla krom varsa hasara 1d6 eklenir. Kromu olmayan bir hedefi etkilemez.", en: "Sends a powerful electrical surge through the target's chrome: 2d6 damage, armor doesn't apply. If the target has three or more implants, add 1d6. It has no effect on a target without chrome." } },
  { id: "overheat", name: "Overheat", type: "saldiri", tier: 2, ram: 3, spec: null, desc: { tr: "Hedefin kromunu aşırı ısıtır ve hedef alev alır. 3 tur boyunca her turunun başında 1d6 hasar alır; zırh işlemez. Hedef bir aksiyon harcayıp yerde yuvarlanarak ya da üstündekini söndürerek etkiyi erkenden bitirebilir. Kromu olmayan bir hedefi etkilemez.", en: "Overheats the target's chrome and sets them on fire. For 3 rounds they take 1d6 damage at the start of each of their turns; armor doesn't apply. The target can end it early by spending an action to roll on the ground or put the flames out. It has no effect on a target without chrome." } },
  { id: "overload", name: "Overload", type: "cihaz", tier: 2, ram: 2, spec: null, desc: { tr: "Görüş alanındaki bir elektrik kutusunu, terminali ya da prize bağlı bir cihazı aşırı yükleyip patlatır. Cihazın 2 metre (1 kare) çevresindeki herkes 3d6 hasar alır; zırh normal işler. Hedef bir kişi değil cihazdır; yakında patlatılacak bir cihaz yoksa kullanılamaz. Patlayan cihaz bir daha çalışmaz.", en: "Overloads a fuse box, terminal or plugged-in device in sight until it blows. Everyone within 2 meters (1 square) of it takes 3d6 damage; armor works as normal. The target is the device, not a person; without a device to blow nearby, it can't be used. The device never works again." } },
  { id: "remote-activation", name: "Remote Activation", type: "cihaz", tier: 2, ram: 2, spec: null, desc: { tr: "Görüş alanındaki bir mekanizmayı uzaktan çalıştırır: kapıyı açar ya da kapatır, asansörü bir kata gönderir, bariyeri kaldırır, park etmiş bir aracı çalıştırıp bir tur boyunca düz sürer. Fiziksel kilidi ya da ayrı bir güvenlik paneli olan kapılar (Hardware gerektirenler) ve askerî araçlar bu quickhack'le açılamaz.", en: "Operates a mechanism in sight remotely: opens or closes a door, sends an elevator to a floor, raises a barrier, or starts a parked vehicle and drives it straight for one round. Doors with a physical lock or a separate security panel (the kind that need Hardware) and military vehicles can't be opened this way." } },
  { id: "static", name: "Static", type: "kontrol", tier: 2, ram: 2, spec: null, desc: { tr: "Netrunner'ın görebildiği bir noktanın 10 metre (5 kare) çevresinde bütün kablosuz iletişimi 2 tur boyunca keser: telsizler, telefonlar ve holo çağrılar çalışmaz, alarm dışarıya iletilemez. Alanın dışındakileri etkilemez; yüz yüze konuşmayı ve bağırmayı engellemez.", en: "Cuts all wireless communication within 10 meters (5 squares) of a point the Netrunner can see, for 2 rounds: radios, phones and holo calls stop working, and alarms can't be sent out. It doesn't affect anyone outside the area, and it doesn't stop face-to-face talk or shouting." } },
  { id: "tag", name: "Tag", type: "kesif", tier: 2, ram: 2, spec: null, desc: { tr: "Hedefi işaretler. 2 tur boyunca Netrunner'ın dostları bu hedefe yapılan saldırılara +2 alır; akıllı silahlarla yapılan saldırılar ise avantajlıdır. Aynı anda yalnızca bir hedef işaretli olabilir; yeni bir Tag eskisini siler.", en: "Marks the target. For 2 rounds, the Netrunner's allies get +2 on attacks against it, and attacks made with smart weapons have advantage. Only one target can be tagged at a time; a new Tag erases the old one." } },
  { id: "take-control", name: "Take Control", type: "cihaz", tier: 3, ram: 4, spec: null, desc: { tr: "Görüş alanındaki bir taretin ya da kameranın kontrolünü 3 tur boyunca ele geçirir. Taret, Netrunner'ın her turunda seçtiği bir hedefe ateş eder ve sahiplerini hedef almaz. Kamera ise Netrunner'ın gözü olur: kameranın gördüğü hedefler görülmüş sayılır. Dronlar, mech'ler ve araçlar bu quickhack'le ele geçirilemez.", en: "Takes control of a turret or camera in sight for 3 rounds. The turret fires at a target the Netrunner picks each turn and won't shoot at the Netrunner's side. A camera becomes the Netrunner's eye: targets it can see count as seen. Drones, mechs and vehicles can't be taken over this way." } },
  { id: "cyberware-malfunction", name: "Cyberware Malfunction", type: "kontrol", tier: 3, ram: 4, spec: null, desc: { tr: "Hedefin bir kromunu 1d6 tur boyunca çalışmaz hale getirir; krom arıza kurallarındaki geçici arızayla aynı işler. Netrunner hedefin kromlarını Analyze ya da başka bir yolla öğrenmediyse kapanan krom rastgele seçilir. Kalp, akciğer ya da beyin implantı gibi hayati kromları kapatamaz.", en: "Shuts down one of the target's implants for 1d6 rounds, working like a temporary malfunction from the chrome rules. If the Netrunner hasn't learned the target's chrome through Analyze or another way, the implant is picked at random. It can't shut down vital implants such as an artificial heart, lungs or brain implant." } },
  { id: "contagion", name: "Contagion", type: "saldiri", tier: 3, ram: 4, spec: null, desc: { tr: "Hedefe zehirli bir program yükler: 2d6 hasar, zırh işlemez. Program aynı turda hedefin 6 metre (3 kare) yakınındaki, aynı ağa bağlı başka bir düşmana sıçrar ve ona 1d6 hasar verir. Yalnızca bir kez sıçrar ve aynı kişiye ikinci kez geçmez.", en: "Uploads a poisonous program to the target: 2d6 damage, armor doesn't apply. In the same round it jumps to another enemy on the same network within 6 meters (3 squares) of the target, dealing 1d6 damage. It jumps only once and never hits the same person twice." } },
  { id: "reflex-lock", name: "Reflex Lock", type: "kontrol", tier: 3, ram: 3, spec: null, desc: { tr: "Hedefin refleks sinyallerini kilitler. Hedef bir sonraki turunun sonuna kadar Reaction kullanamaz: mermiden kaçamaz, Reaction gerektiren feat ve kromları kullanamaz. Yakın dövüşteki bedava Evasion atışını etkilemez.", en: "Locks up the target's reflex signals. Until the end of their next turn the target can't use their Reaction: they can't dodge bullets or use feats and chrome that need a Reaction. It doesn't affect the free Evasion roll in melee." } },
  { id: "ice-breaker", name: "ICE Breaker", type: "kontrol", tier: 3, ram: 3, spec: null, desc: { tr: "Düşman bir Netrunner'ın ya da bir güvenlik sisteminin savunmasını kırar. Savaşın sonuna kadar o hedefe yapılan quickhack atışları avantajlıdır ve Firewall gibi quickhack'e karşı savunma bonusları işlemez. Kromu ya da cyberdeck'i olmayan bir hedefe etkisizdir.", en: "Breaks the defenses of an enemy Netrunner or a security system. Until the end of combat, quickhack rolls against that target have advantage, and defensive bonuses against quickhacks such as Firewall don't apply. It has no effect on a target with no chrome or cyberdeck." } },
  { id: "synapse-burnout", name: "Synapse Burnout", type: "saldiri", tier: 4, ram: 6, spec: null, desc: { tr: "Hedefin beynine doğrudan aşırı yük gönderir: 3d6 hasar, zırh işlemez. Hedef Ağır Yaralı ise hasar 5d6 olur. Bu hasarla HP'si 0'a düşen hedef Ölümcül Yaralı olur ve bilinci hemen kapanır.", en: "Overloads the target's brain directly: 3d6 damage, armor doesn't apply. If the target is Seriously Wounded, the damage is 5d6. A target whose HP drops to 0 from this damage becomes Mortally Wounded and passes out at once." } },
  { id: "detonate-grenade", name: "Detonate Grenade", type: "saldiri", tier: 4, ram: 5, spec: null, desc: { tr: "Hedefin üstünde taşıdığı el bombalarından birini patlatır. Patlama hedefin karesini merkez alır ve patlayıcı kurallarına göre işler; hedefin kendisi patlamadan kaçmak için Evasion atamaz, çevredekiler atabilir. Üstünde el bombası olmayan bir hedefe kullanılamaz; Netrunner bunu Analyze ile öğrenebilir.", en: "Detonates one of the grenades the target is carrying. The blast is centered on the target's square and follows the explosive rules; the target can't roll Evasion to escape it, though others nearby can. It can't be used on a target without a grenade; the Netrunner can find out with Analyze." } },
  { id: "blackout", name: "Blackout", type: "cihaz", tier: 4, ram: 5, spec: null, desc: { tr: "Netrunner'ın görebildiği bir noktanın 20 metre (10 kare) çevresindeki bütün ışıkları, kameraları, ekranları ve ağa bağlı cihazları 3 tur boyunca kapatır; taretler de susar. Alan karanlığa gömülür: göz kromunda gece görüşü olmayanlar, görmeye dayalı atışları dezavantajlı yapar. Havadaki dronlar düşmez ama kameraları kör olur.", en: "Shuts off every light, camera, screen and networked device within 20 meters (10 squares) of a point the Netrunner can see, for 3 rounds; turrets go silent too. The area is plunged into darkness: anyone without night vision in their cyberoptics makes sight-based rolls with disadvantage. Drones in the air don't fall, but their cameras go blind." } },
  { id: "ghost", name: "Ghost", type: "gizlilik", tier: 2, ram: 2, spec: "a", desc: { tr: "Netrunner bir sonraki turunun sonuna kadar kameralara ve optik kromlara görünmez: kameralar onu kaydetmez, göz kromuyla bakanlar onu göremez. Kromsuz, çıplak gözle bakan biri onu normal görür. Netrunner saldırır ya da başka bir quickhack kullanırsa etki hemen biter.", en: "Until the end of their next turn, the Netrunner is invisible to cameras and cyberoptics: cameras don't record them, and anyone looking through chrome eyes can't see them. Someone looking with unchromed, natural eyes sees them as normal. The effect ends at once if the Netrunner attacks or uses another quickhack." } },
  { id: "scrub", name: "Scrub", type: "gizlilik", tier: 2, ram: 2, spec: "a", desc: { tr: "Savaş dışında, bulunulan binanın ya da 50 metrelik bir alanın kamera kayıtlarını, kapı ve asansör kayıtlarını siler. Ekip son 1 saat içinde o sistemlerde hiç iz bırakmamış olur. İnsanların hafızasını silmez ve o anda canlı izlenen yayınları etkilemez; yalnızca kayıtları siler.", en: "Outside combat, erases the camera, door and elevator logs of the building the crew is in, or of an area 50 meters across. For the past hour, the crew leaves no trace in those systems. It doesn't erase anyone's memory or affect feeds being watched live; it only wipes the records." } },
  { id: "memory-wipe", name: "Memory Wipe", type: "gizlilik", tier: 3, ram: 3, spec: "a", desc: { tr: "Hedef son 1d6 dakikayı unutur: Netrunner'ı ve ekibi gördüğünü, duyduğunu ya da alarm verdiğini hatırlamaz. Savaşa girmiş ya da hasar almış bir hedefe işlemez. Hedef olanları başka bir yoldan (bir kayıttan, bir arkadaşından) öğrenebilir.", en: "The target forgets the last 1d6 minutes: they don't remember seeing or hearing the Netrunner and the crew, or raising an alarm. It doesn't work on a target that's in combat or has taken damage. The target can still find out what happened some other way (a recording, a friend)." } },
  { id: "false-face", name: "False Face", type: "gizlilik", tier: 3, ram: 3, spec: "a", desc: { tr: "Netrunner, daha önce Analyze ya da bir kamerayla taradığı birinin yüzünü 10 dakika boyunca kendi yüzünün üstüne yerleştirir; ona bakan herkes, kameralar dahil, o yüzü görür. Yalnızca yüz değişir: ses, boy ve kıyafet aynı kalır. Yüzün sahibini iyi tanıyan biri konuşmadan ya da davranıştan şüphelenebilir.", en: "For 10 minutes, the Netrunner places over their own face the face of someone they've previously scanned with Analyze or a camera; everyone who looks at them, cameras included, sees that face. Only the face changes: voice, height and clothes stay the same. Someone who knows the face's owner well may grow suspicious from the way they talk or act." } },
  { id: "system-reset", name: "System Reset", type: "kontrol", tier: 4, ram: 6, spec: "a", desc: { tr: "Hedefin sinir sistemini yeniden başlatır: hedef öldürülmeden, sessizce bayılır ve 1 dakika boyunca ayılmaz. Bu sürede hasar alırsa ya da sertçe sarsılırsa hemen uyanır. Ölümcül Yaralı bir hedefe ve kromu olmayan bir hedefe işlemez.", en: "Reboots the target's nervous system: the target quietly passes out without being killed and stays out for 1 minute. They wake immediately if they take damage or are shaken hard. It doesn't work on a Mortally Wounded target or one without chrome." } },
  { id: "vanish", name: "Vanish", type: "gizlilik", tier: 4, ram: 5, spec: "a", desc: { tr: "Netrunner ve 6 metre (3 kare) yakınındaki dostları bir sonraki turunun sonuna kadar kameralara ve optik kromlara görünmez; Ghost gibi işler. Saldıran ya da quickhack kullanan kişi için etki hemen biter, diğerleri görünmez kalır.", en: "Until the end of the Netrunner's next turn, the Netrunner and allies within 6 meters (3 squares) are invisible to cameras and cyberoptics, working like Ghost. The effect ends at once for anyone who attacks or uses a quickhack; the others stay hidden." } },
  { id: "camera-mode", name: "Camera Mode", type: "cihaz", tier: 2, ram: 2, spec: "b", desc: { tr: "Görüş alanındaki bir kameraya bağlanır ve 3 tur boyunca onun gözünden bakar. Kameranın gördüğü hedefler Netrunner için görülmüş sayılır; onlara quickhack yapabilir. Kamera hasar alır ya da kapatılırsa bağlantı kopar. Bağlantı sürerken Netrunner başka bir kameraya geçmek için bu quickhack'i yeniden kullanmalıdır.", en: "Connects to a camera in sight and sees through its eye for 3 rounds. Targets the camera can see count as seen by the Netrunner, so they can be quickhacked. The link breaks if the camera is damaged or switched off. To switch to another camera, the Netrunner has to use this quickhack again." } },
  { id: "stall", name: "Stall", type: "cihaz", tier: 2, ram: 2, spec: "b", desc: { tr: "Görüş alanındaki bir dronu, tareti ya da aracı bir sonraki turunun sonuna kadar durdurur: dron havada asılı kalır, taret ateş etmez, araç yavaşlayıp durur. Hızla giden bir aracın sürücüsü durunca kontrolü korumak için Driving atar. İnsanları etkilemez.", en: "Stops a drone, turret or vehicle in sight until the end of the Netrunner's next turn: the drone hangs in the air, the turret holds fire, the vehicle slows to a stop. The driver of a fast-moving vehicle rolls Driving to keep control as it stops. It doesn't affect people." } },
  { id: "friendly-mode", name: "Friendly Mode", type: "cihaz", tier: 3, ram: 4, spec: "b", desc: { tr: "Görüş alanındaki bir taret ya da dron 3 tur boyunca Netrunner'ın tarafını hedef almaz ve her turunda en yakın düşmana saldırır. Süre dolunca eski sahibinin tarafına döner. Mech'leri ve araçları etkilemez.", en: "For 3 rounds, a turret or drone in sight won't target the Netrunner's side and attacks the nearest enemy each turn. When the time is up, it returns to its owner's side. It doesn't affect mechs or vehicles." } },
  { id: "override", name: "Override", type: "cihaz", tier: 3, ram: 4, spec: "b", desc: { tr: "Görüş alanındaki bir aracın kontrolünü 2 tur boyunca ele geçirir: Netrunner aracı durdurabilir, yönünü değiştirebilir ya da bir yere çarptırabilir. Sürücü bu sürede direksiyona hâkim olamaz. Askerî araçları ve AV'leri etkilemez.", en: "Takes control of a vehicle in sight for 2 rounds: the Netrunner can stop it, steer it or crash it into something. The driver has no control during that time. It doesn't affect military vehicles or AVs." } },
  { id: "cyberpsychosis", name: "Cyberpsychosis", type: "kontrol", tier: 4, ram: 7, spec: "b", desc: { tr: "Hedefin kromunu ve sinir sistemini kontrolden çıkarır: hedef 2 tur boyunca dost düşman ayırmadan her turunda en yakınındaki kişiye saldırır. Hedefte en az üç krom olmalıdır; daha az kromlu bir hedefe işlemez. Etki bitince hedef ne yaptığını hatırlar.", en: "Throws the target's chrome and nervous system out of control: for 2 rounds the target attacks whoever is nearest each turn, friend or foe. The target must have at least three implants; it has no effect on anyone with less chrome. When it wears off, the target remembers what they did." } },
  { id: "puppet", name: "Puppet", type: "cihaz", tier: 4, ram: 6, spec: "b", desc: { tr: "Görüş alanındaki zırhlı bir dronu ya da mech'i bir tur boyunca kontrol eder: Netrunner ona bir hareket ve bir saldırı yaptırır. İnsanları ve kromlu bedenleri etkilemez.", en: "Controls an armored drone or mech in sight for one round: the Netrunner makes it move once and attack once. It doesn't affect people or chromed bodies." } },
];

// Sınıf renkleri: sitede yazılmaz; yalnızca feat listesinde o sınıfın feat'lerini boyar (tarafsız feat'ler yeşil kalır).
const CLASS_COLORS = {
  solo: "#ff5f56",      // kan kırmızısı
  netrunner: "#b388ff", // mor
  medtech: "#9fd3f0",   // soluk açık mavi
  rockerboy: "#ff9f43", // sahne turuncusu
  lawman: "#f5c542",    // rozet altını
};

// Oyuncu Rehberi > Feat'ler listesi (taslak). spec: varsa feat'in geldiği specialization ("a" ya da "b").
// cls: "tarafsiz" ya da sınıf id'si · excl: bu feat'i alamayan sınıflar · tier: aşama (1 = 1 puan, 2 = 2 puan) · gloss: Türkçe karşılık (yalnızca TR'de kartta gösterilir).
const FEATS = [
  { id: "tough", name: { tr: "Tough", en: "Tough" }, gloss: "Dayanıklı", cls: "tarafsiz", tier: 1, desc: { tr: "Maksimum HP'si 5 artar.", en: "Maximum HP increases by 5." } },
  { id: "pain-tolerance", name: { tr: "Pain Tolerance", en: "Pain Tolerance" }, gloss: "Acıya Dayanıklılık", cls: "tarafsiz", tier: 1, desc: { tr: "Yara cezaları yarıya iner: Ağır Yaralı −1, Ölümcül Yaralı −2.", en: "Wound penalties are halved: Seriously Wounded −1, Mortally Wounded −2." } },
  { id: "die-hard", name: { tr: "Die Hard", en: "Die Hard" }, gloss: "Ölmeye İnat", cls: "tarafsiz", tier: 1, desc: { tr: "Ölüm kurtarma atışlarına +1 ekler.", en: "Adds +1 to death saves." } },
  { id: "quick-draw", name: { tr: "Quick Draw", en: "Quick Draw" }, gloss: "Hızlı Çekiş", cls: "tarafsiz", tier: 1, desc: { tr: "Silah çekmek ve kılıfına koymak bedavadır. Hızla silaha davranma atışları avantajlıdır.", en: "Drawing and holstering a weapon is free. Quick draw rolls have advantage." } },
  { id: "alert", name: { tr: "Alert", en: "Alert" }, gloss: "Tetikte", cls: "tarafsiz", tier: 1, desc: { tr: "Hiçbir zaman gafil avlanmaz.", en: "Is never surprised." } },
  { id: "cover-expert", name: { tr: "Cover Expert", en: "Cover Expert" }, gloss: "Siper Ustası", cls: "tarafsiz", tier: 1, desc: { tr: "Kısmi siper +2 yerine +3 DV verir.", en: "Partial cover gives +3 DV instead of +2." } },
  { id: "runner", name: { tr: "Runner", en: "Runner" }, gloss: "Koşucu", cls: "tarafsiz", tier: 1, desc: { tr: "Temel hareketi 4 metre (2 kare) artar.", en: "Base movement increases by 4 meters (2 squares)." } },
  { id: "extra-training", name: { tr: "Extra Training", en: "Extra Training" }, gloss: "Ek Eğitim", cls: "tarafsiz", tier: 1, desc: { tr: "2 yetkinlik puanı kazanır. Bir skill yine en fazla +2 olabilir.", en: "Gains 2 proficiency points. A skill still can't go above +2." } },
  { id: "specialist", name: { tr: "Specialist", en: "Specialist" }, gloss: "Uzman", cls: "tarafsiz", tier: 1, desc: { tr: "Yetkin olduğun bir skill'e Ustalık modifier'ını eklersin.", en: "Adds their Mastery modifier to a skill they're proficient in." } },
  { id: "lucky", name: { tr: "Lucky", en: "Lucky" }, gloss: "Şanslı", cls: "tarafsiz", tier: 1, desc: { tr: "Luck havuzu 2 artar.", en: "Their Luck pool increases by 2." } },
  { id: "iron-stomach", name: { tr: "Iron Stomach", en: "Iron Stomach" }, gloss: "Demir Mide", cls: "tarafsiz", tier: 1, desc: { tr: "Toksinlere, zehirlere ve uyuşturuculara karşı Resist Toxin atışları avantajlıdır.", en: "Resist Toxin rolls against toxins, poisons and drugs have advantage." } },
  { id: "chrome-tolerance", name: { tr: "Chrome Tolerance", en: "Chrome Tolerance" }, gloss: "Krom Toleransı", cls: "tarafsiz", tier: 1, desc: { tr: "Krom takılırken kaybettiği Humanity azalır.", en: "Loses less Humanity when chrome is installed." } },
  { id: "light-armor-mastery", name: { tr: "Hafif Zırh Ustalığı", en: "Light Armor Mastery" }, cls: "tarafsiz", tier: 1, desc: { tr: "Hafif set (hafif gövde zırhı ve kask) giyiliyken Evasion +1 olur ve hareketi 4 metre (2 kare) artar.", en: "While wearing a light set (light body armor and helmet): Evasion +1 and movement increases by 4 meters (2 squares)." } },
  { id: "kevlar-armor-mastery", name: { tr: "Kevlar Zırh Ustalığı", en: "Kevlar Armor Mastery" }, cls: "tarafsiz", tier: 1, desc: { tr: "Kevlar set giyiliyken Evasion +1 olur ve kevların SP'si 1 artar (6).", en: "While wearing a Kevlar set: Evasion +1 and the Kevlar's SP increases by 1 (6)." } },
  { id: "tactical-armor-mastery", name: { tr: "Taktik Zırh Ustalığı", en: "Tactical Armor Mastery" }, cls: "tarafsiz", tier: 1, desc: { tr: "Taktik set giyiliyken Evasion +1 ve Stealth +1 olur.", en: "While wearing a tactical set: Evasion +1 and Stealth +1." } },
  { id: "heavy-armor-mastery", name: { tr: "Ağır Zırh Ustalığı", en: "Heavy Armor Mastery" }, cls: "tarafsiz", tier: 1, desc: { tr: "Ağır gövde zırhı giyiliyken (set gerekmez) ağır zırhın hareket cezası kalkar. Zırh delindiğinde alınan HP hasarı 1 azalır (en az 1).", en: "While wearing heavy body armor (no set needed): heavy armor's movement penalty is removed. When the armor is pierced, HP damage taken is reduced by 1 (minimum 1)." } },
  { id: "military-armor-mastery", name: { tr: "Askerî Zırh Ustalığı", en: "Military Armor Mastery" }, cls: "tarafsiz", tier: 1, desc: { tr: "Askerî gövde zırhı giyiliyken (set gerekmez) askerî zırhın hareket cezası 2 metreye (1 kare) düşer ve SP'si 1 artar (12).", en: "While wearing military body armor (no set needed): military armor's movement penalty drops to 2 meters (1 square) and its SP increases by 1 (12)." } },
  { id: "free-runner", name: { tr: "Free Runner", en: "Free Runner" }, gloss: "Serbest Koşucu", cls: "tarafsiz", tier: 1, desc: { tr: "Athletics +1. Tırmanırken ve engel aşarken tam hızla hareket eder.", en: "Athletics +1. Moves at full speed while climbing and getting over obstacles." } },
  { id: "wheelman", name: { tr: "Wheelman", en: "Wheelman" }, gloss: "Direksiyon Ustası", cls: "tarafsiz", tier: 1, desc: { tr: "Driving +1. Araç sürmek aksiyon yerine bonus aksiyondur.", en: "Driving +1. Driving a vehicle is a bonus action instead of an action." } },
  { id: "silver-tongue", name: { tr: "Silver Tongue", en: "Silver Tongue" }, gloss: "Tatlı Dil", cls: "tarafsiz", tier: 1, desc: { tr: "Persuasion +1. Oturum başına bir kez başarısız bir Persuasion atışını tekrar atar.", en: "Persuasion +1. Once per session, rerolls a failed Persuasion roll." } },
  { id: "poker-face", name: { tr: "Poker Face", en: "Poker Face" }, gloss: "Poker Yüzü", cls: "tarafsiz", tier: 1, desc: { tr: "Deception +1. Gizlice silaha davranırken Stealth yerine Deception atabilir; karşı taraf Insight ile karşılık verir.", en: "Deception +1. When drawing a weapon covertly, can roll Deception instead of Stealth; the other side answers with Insight." } },
  { id: "brute", name: { tr: "Brute", en: "Brute" }, gloss: "Kaba Kuvvet", cls: "tarafsiz", tier: 1, desc: { tr: "Strength +1. Yakın dövüş saldırıları sipere ve kapılara iki kat hasar verir.", en: "Strength +1. Melee attacks deal double damage to cover and doors." } },
  { id: "tireless", name: { tr: "Tireless", en: "Tireless" }, gloss: "Yorulmak Bilmez", cls: "tarafsiz", tier: 1, desc: { tr: "Endurance +1. 4 saatlik dinlenme, tam bir gece dinlenmesi sayılır.", en: "Endurance +1. Four hours of rest count as a full night's rest." } },
  { id: "street-rat", name: { tr: "Street Rat", en: "Street Rat" }, gloss: "Sokak Çocuğu", cls: "tarafsiz", tier: 1, desc: { tr: "Streetwise +1. Karaborsa alımlarında %10 indirim alır.", en: "Streetwise +1. Gets a 10% discount on black market purchases." } },
  { id: "iron-mind", name: { tr: "Iron Mind", en: "Iron Mind" }, gloss: "Demir İrade", cls: "tarafsiz", tier: 1, desc: { tr: "Mental Resist +1. Kendisine yapılan Intimidation atışlarına karşı avantajlıdır.", en: "Mental Resist +1. Has advantage against Intimidation rolls made against them." } },
  { id: "plug-and-play", name: { tr: "Plug & Play", en: "Plug & Play" }, gloss: "Tak Çalıştır", cls: "tarafsiz", tier: 1, desc: { tr: "Hardware +1. Cihaz kullanmak aksiyon yerine bonus aksiyondur.", en: "Hardware +1. Using a device is a bonus action instead of an action." } },
  { id: "street-fighter", name: { tr: "Street Fighter", en: "Street Fighter" }, gloss: "Sokak Dövüşçüsü", cls: "tarafsiz", tier: 1, desc: { tr: "Brawling +1. Yumruğu isabet ederse hedefi 2 metre (1 kare) itebilir.", en: "Brawling +1. When a punch hits, can push the target 2 meters (1 square)." } },
  { id: "slippery", name: { tr: "Slippery", en: "Slippery" }, gloss: "Kaygan", cls: "tarafsiz", tier: 1, desc: { tr: "Evasion +1. Mermiden kaçmayı başarırsa hemen 2 metre (1 kare) hareket edebilir; bu, normal hareketinden sayılmaz.", en: "Evasion +1. After successfully dodging a bullet, can immediately move 2 meters (1 square); this doesn't count against their normal movement." } },
  { id: "patch-up", name: { tr: "Patch Up", en: "Patch Up" }, gloss: "Toparla", cls: "tarafsiz", tier: 1, desc: { tr: "Medicine +1. İlk yardımla dinlenme atışını dezavantajsız atar.", en: "Medicine +1. Makes the first-aid rest roll without disadvantage." } },
  { id: "mimic", name: { tr: "Mimic", en: "Mimic" }, gloss: "Taklitçi", cls: "tarafsiz", tier: 1, desc: { tr: "Performance +1. Telefonda, interkomda ya da görünmeden başka biri gibi konuşurken Deception atışları avantajlıdır. Yüz yüze işe yaramaz.", en: "Performance +1. Deception rolls have advantage when speaking as someone else over the phone, an intercom or while unseen. Doesn't work face to face." } },
  { id: "polyglot", name: { tr: "Polyglot", en: "Polyglot" }, gloss: "Çok Dilli", cls: "tarafsiz", tier: 1, desc: { tr: "Lore +1. İki dil daha bilir.", en: "Lore +1. Knows two more languages." } },
  { id: "tracker", name: { tr: "Tracker", en: "Tracker" }, gloss: "İz Sürücü", cls: "tarafsiz", tier: 1, desc: { tr: "Survival +1. İz ararken ve iz sürerken atışları avantajlıdır.", en: "Survival +1. Has advantage on rolls to find and follow tracks." } },
  { id: "eavesdropper", name: { tr: "Eavesdropper", en: "Eavesdropper" }, gloss: "Kulak Misafiri", cls: "tarafsiz", tier: 1, desc: { tr: "Concentration +1. Bir sesi takip etmek için atılan Concentration atışları avantajlıdır.", en: "Concentration +1. Concentration rolls made to follow a sound have advantage." } },
  { id: "beginner-netrunner", name: { tr: "Beginner Netrunner", en: "Beginner Netrunner" }, gloss: "Acemi Netrunner", cls: "tarafsiz", excl: ["netrunner"], tier: 1, desc: { tr: "Netrunning +1. I. ve II. kademe cyberdeck'leri (Basit ve Standart) kullanabilir; Standart cyberdeck için yine +6 Netrunning modifier'ı gerekir. Netrunner'lar bu feat'i alamaz.", en: "Netrunning +1. Can use tier I and II cyberdecks (Basic and Standard); a Standard cyberdeck still needs a +6 Netrunning modifier. Netrunners can't take this feat." } },
  { id: "expanded-ram", name: { tr: "Expanded RAM", en: "Expanded RAM" }, gloss: "Genişletilmiş RAM", cls: "netrunner", tier: 1, desc: { tr: "Kullandığı cyberdeck'in RAM'i 2 artar.", en: "The cyberdeck they use gains 2 RAM." } },
  { id: "extra-slot", name: { tr: "Extra Slot", en: "Extra Slot" }, gloss: "Ek Yuva", cls: "netrunner", tier: 1, desc: { tr: "Cyberdeck'te 1 quickhack daha hazır tutabilir.", en: "Can hold 1 more quickhack ready in the cyberdeck." } },
  { id: "field-prep", name: { tr: "Field Prep", en: "Field Prep" }, gloss: "Saha Hazırlığı", cls: "netrunner", tier: 1, desc: { tr: "Oturum başına bir kez, dinlenmeyi beklemeden, savaş dışında 10 dakika harcayarak Ustalık modifier'ı kadar hazır quickhack'ini değiştirebilir.", en: "Once per session, without waiting for a rest, can spend 10 minutes outside combat to swap a number of ready quickhacks equal to their Mastery modifier." } },
  { id: "script-library", name: { tr: "Script Library", en: "Script Library" }, gloss: "Kütüphane", cls: "netrunner", tier: 1, desc: { tr: "Kütüphanesine hemen 2 quickhack ekler.", en: "Immediately adds 2 quickhacks to their library." } },
  { id: "firewall", name: { tr: "Firewall", en: "Firewall" }, gloss: "Güvenlik Duvarı", cls: "netrunner", tier: 1, desc: { tr: "Kendisine yapılan quickhack'lere karşı savunurken Ustalık modifier'ını ekler.", en: "Adds their Mastery modifier when defending against quickhacks." } },
  { id: "backlash", name: { tr: "Backlash", en: "Backlash" }, gloss: "Geri Tepme", cls: "netrunner", tier: 1, desc: { tr: "Savaş başına bir kez, kendisine quickhack yapıldığında Reaction harcayıp gönderene hazır quickhack'lerinden birini RAM harcamadan yükler.", en: "Once per combat, when a quickhack is used on them, can spend their Reaction to upload one of their ready quickhacks to the sender without spending RAM." } },
  { id: "squad-link", name: { tr: "Squad Link", en: "Squad Link" }, gloss: "Ekip Bağlantısı", cls: "netrunner", tier: 1, desc: { tr: "Netrunner'ın Ping'le işaretlediği düşmanlar ve cihazlar ekibine de işaretli görünür; dostları onların yerini duvarların arkasından da bilir. İşaretler Ping'le aynı süre kalır. Dostlar için de işaretli olmak görülmek sayılmaz.", en: "The enemies and devices the Netrunner marks with Ping are marked for the whole crew as well; allies know where they are, even behind walls. The marks last as long as the Ping. Being marked still doesn't count as being seen, for allies either." } },
  { id: "double-upload", name: { tr: "Double Upload", en: "Double Upload" }, gloss: "Çift Yükleme", cls: "netrunner", tier: 2, desc: { tr: "Aksiyonunu da harcayarak aynı turda ikinci bir quickhack kullanabilir.", en: "Can spend their action as well to use a second quickhack in the same round." } },
  { id: "overclock", name: { tr: "Overclock", en: "Overclock" }, gloss: "Hız Aşırtma", cls: "netrunner", tier: 2, desc: { tr: "RAM'i yetmediğinde quickhack'i yine de kullanabilir: kalan RAM'inin hepsini harcar ve 1d6 + 3 × quickhack'in kademesi kadar hasar alır. Zırh bu hasara işlemez.", en: "Can use a quickhack even without enough RAM: spends all remaining RAM and takes 1d6 + 3 × the quickhack's tier in damage. Armor doesn't apply to this damage." } },
  { id: "daisy-chain", name: { tr: "Daisy Chain", en: "Daisy Chain" }, gloss: "Zincirleme", cls: "netrunner", tier: 2, desc: { tr: "Kütüphanesine Daisy Chain quickhack'ini ekler. Daisy Chain yalnızca cyberdeck'te hazırsa çalışır. Savaş başına 2 Reaction puanı vardır ve turda yalnızca bir kez çalışır: hedefli bir I ya da II. kademe quickhack yüklenirken 1 puan harcanarak quickhack bir hedefe daha kopyalanır; III ya da IV. kademe için 2 puan birden harcanır. Kopya, orijinalin yarısı kadar RAM harcar (aşağı yuvarlanır).", en: "Adds the Daisy Chain quickhack to their library. Daisy Chain only works while it's ready in the cyberdeck. It has 2 Reaction points per combat and works only once per round: while uploading a targeted tier I or II quickhack, 1 point is spent to copy that quickhack to one more target; tier III or IV takes 2 points at once. The copy costs half the original's RAM (rounded down)." } },
  { id: "wallhack", name: { tr: "Wallhack", en: "Wallhack" }, gloss: "Duvar Ardı", cls: "netrunner", tier: 2, desc: { tr: "Görüşü başka bir yolla (örneğin Ping ile) elde edilmiş, duvarın ya da bir engelin arkasındaki hedefe 12 metreye (6 kare) kadar quickhack yapabilir.", en: "Can quickhack a target behind a wall or other obstacle, up to 12 meters (6 squares) away, as long as they have sight of it some other way (for example, through Ping)." } },
  { id: "amplifier", name: { tr: "Amplifier", en: "Amplifier" }, gloss: "Amfi", cls: "rockerboy", tier: 1, desc: { tr: "Enstrümanın şarj limiti 1 artar.", en: "The instrument's charge limit increases by 1." } },
  { id: "fast-charge", name: { tr: "Fast Charge", en: "Fast Charge" }, gloss: "Hızlı Şarj", cls: "rockerboy", tier: 1, desc: { tr: "Enstrüman prize takılıyken saatte 1 yerine 2 şarj dolar.", en: "While plugged in, the instrument recharges 2 charges per hour instead of 1." } },
  { id: "loudspeaker", name: { tr: "Loudspeaker", en: "Loudspeaker" }, gloss: "Hoparlör", cls: "rockerboy", tier: 1, desc: { tr: "Melodilerin menzili 24 metreden 36 metreye (18 kare) çıkar.", en: "Melodies' range increases from 24 meters to 36 meters (18 squares)." } },
  { id: "hype-man", name: { tr: "Hype Man", en: "Hype Man" }, gloss: "Gazlayıcı", cls: "rockerboy", tier: 1, desc: { tr: "Inspire'ı bonus aksiyon yerine Reaction ile, bir dostun atışından hemen önce kullanabilir.", en: "Can use Inspire with their Reaction instead of a bonus action, right before an ally's roll." } },
  { id: "stage-presence", name: { tr: "Stage Presence", en: "Stage Presence" }, gloss: "Sahne Duruşu", cls: "rockerboy", tier: 1, desc: { tr: "Debuff melodilerinde eşitlikte hedef değil Rockerboy kazanır.", en: "On debuff melodies, ties go to the Rockerboy instead of the target." } },
  { id: "fan-base", name: { tr: "Fan Base", en: "Fan Base" }, gloss: "Hayran Kitlesi", cls: "rockerboy", tier: 1, desc: { tr: "Oturum başına bir kez, Rockerboy'u tanıyan bir hayrandan bir iyilik istenebilir. İyiliğin büyüklüğü Rockerboy'un seviyesiyle artar: düşük seviyelerde bir bilgi ya da bir gece saklanacak bir yer, yüksek seviyelerde açılan bir kapı, ödünç bir araç ya da önemli birine ulaşmak gibi.", en: "Once per session, a fan who recognizes the Rockerboy can be asked for a favor. The favor grows with the Rockerboy's level: at low levels a tip or a place to hide for the night, at high levels an opened door, a borrowed vehicle or a way to reach someone important." } },
  { id: "double-track", name: { tr: "Double Track", en: "Double Track" }, gloss: "Çift Kanal", cls: "rockerboy", tier: 2, desc: { tr: "Aynı anda iki melodi etkide olabilir.", en: "Two melodies can be in effect at the same time." } },
  { id: "encore", name: { tr: "Encore", en: "Encore" }, gloss: "Bis", cls: "rockerboy", tier: 2, desc: { tr: "Savaş başına bir kez, süresi biten bir melodiyi şarj ve aksiyon harcamadan yeniden başlatır.", en: "Once per combat, restarts a melody whose duration just ended, without spending a charge or an action." } },
  { id: "riot-starter", name: { tr: "Riot Starter", en: "Riot Starter" }, gloss: "Kışkırtıcı", cls: "rockerboy", tier: 2, desc: { tr: "Savaş başına bir kez, melodi çalmak aksiyon yerine bonus aksiyon olur.", en: "Once per combat, playing a melody takes a bonus action instead of an action." } },
  { id: "soul-music", name: { tr: "Soul Music", en: "Soul Music" }, gloss: "Ruh Müziği", cls: "rockerboy", tier: 2, desc: { tr: "Oturum başına bir kez, ekip dinlenirken Rockerboy çalarsa onu dinleyen her dost (kendisi dahil) 1d3 Humanity kazanır.", en: "Once per session, if the Rockerboy plays while the crew rests, every ally listening (including the Rockerboy) gains 1d3 Humanity." } },
  { id: "surgery", name: { tr: "Surgery", en: "Surgery" }, gloss: "Ameliyat", cls: "medtech", tier: 1, desc: { tr: "Ameliyat gerektiren kritik yaraları tedavi edebilir. Ameliyat savaş dışında, sakin bir yerde ve medkitle yapılır, 1 saat sürer ve Medicine DV 14 atılır. Başarılı olursa yara iyileşir. Başarısız olursa yara kalır ve hasta 1d6 hasar alır (zırh işlemez); aynı yara için yeniden deneme ertesi gün yapılabilir. Medtech kendini ameliyat edemez.", en: "Can treat critical injuries that require surgery. Surgery is done outside combat, somewhere calm and with a medkit; it takes 1 hour and a Medicine roll against DV 14. On a success, the injury heals. On a failure, the injury remains and the patient takes 1d6 damage (armor doesn't apply); the same injury can be tried again the next day. A Medtech can't operate on themselves." } },
  { id: "field-medic", name: { tr: "Field Medic", en: "Field Medic" }, gloss: "Saha Hekimi", cls: "medtech", tier: 1, desc: { tr: "Stabilize etmek aksiyon yerine bonus aksiyondur.", en: "Stabilizing someone takes a bonus action instead of an action." } },
  { id: "improvised-kit", name: { tr: "Improvised Kit", en: "Improvised Kit" }, gloss: "Doğaçlama Çanta", cls: "medtech", tier: 1, desc: { tr: "Medkit olmadan stabilize ederken dezavantaj yoktur.", en: "No disadvantage when stabilizing without a medkit." } },
  { id: "precise-dose", name: { tr: "Precise Dose", en: "Precise Dose" }, gloss: "Hassas Doz", cls: "medtech", tier: 1, desc: { tr: "Medtech'in uyguladığı Bounce Back ve MaxDoc, Ustalık modifier'ı kadar fazla HP iyileştirir.", en: "Bounce Back and MaxDoc applied by the Medtech heal extra HP equal to their Mastery modifier." } },
  { id: "trauma-specialist", name: { tr: "Trauma Specialist", en: "Trauma Specialist" }, gloss: "Travma Uzmanı", cls: "medtech", tier: 1, desc: { tr: "Kritik yaraları tedavi ederken Medicine atışlarına Ustalık modifier'ını ekler.", en: "Adds their Mastery modifier to Medicine rolls when treating critical injuries." } },
  { id: "sedative", name: { tr: "Sedative", en: "Sedative" }, gloss: "Yatıştırıcı", cls: "medtech", tier: 1, desc: { tr: "Kısa psikoza girmiş, temas mesafesindeki (yanındaki karede) bir dosta aksiyonla Medicine atar, DV 11. Başarılı olursa psikoz hemen biter.", en: "Spends an action to roll Medicine (DV 11) on an ally in short psychosis within touch range (an adjacent square). On a success, the psychosis ends immediately." } },
  { id: "nomw", name: { tr: "NOMW", en: "NOMW" }, gloss: "Benim Nöbetimde Olmaz", cls: "medtech", tier: 2, desc: { tr: "Not On My Watch. Savaş başına bir kez, 4 metre (2 kare) yakınındaki bir dost ölüm kurtarma atışında ikinci başarısızlığını alacakken Reaction harcayıp bunu engeller; o başarısızlık sayılmaz.", en: "Not On My Watch. Once per combat, when an ally within 4 meters (2 squares) would take their second death save failure, can spend their Reaction to stop it; that failure doesn't count." } },
  { id: "painkiller", name: { tr: "Painkiller", en: "Painkiller" }, gloss: "Ağrı Kesici", cls: "medtech", tier: 2, desc: { tr: "Savaş başına bir kez, aksiyonla yanındaki bir dosta uygulanır; dostun yara cezaları Ustalık modifier'ı kadar tur boyunca kalkar.", en: "Once per combat, applied to an adjacent ally with an action; the ally's wound penalties are lifted for a number of rounds equal to the Medtech's Mastery modifier." } },
  { id: "adrenaline-shot", name: { tr: "Adrenaline Shot", en: "Adrenaline Shot" }, gloss: "Adrenalin İğnesi", cls: "medtech", tier: 2, desc: { tr: "Oturum başına Ustalık modifier'ı kadar: stabilize ettiği kişi 1 yerine 1d6 + Ustalık modifier'ı HP ile ayağa kalkar.", en: "A number of times per session equal to their Mastery modifier: someone they stabilize gets back up with 1d6 + Mastery modifier HP instead of 1." } },
  { id: "field-hospital", name: { tr: "Field Hospital", en: "Field Hospital" }, gloss: "Sahra Hastanesi", cls: "medtech", tier: 2, desc: { tr: "Medtech'in gözetiminde tam bir gece dinlenenler iki kat iyileşir ve buna ek olarak Medtech'in Medicine modifier'ının iki katı kadar HP kazanır.", en: "Those who rest a full night under the Medtech's care heal double, plus extra HP equal to twice the Medtech's Medicine modifier." } },
];

const CONTENT = {
  "players-guide/featler": {
    intro: {
      tr: `
        <p>Feat'ler karakterin özel yetenekleridir. Bazıları herkes içindir, bazıları yalnızca belli bir sınıfa aittir.</p>
      `,
      en: `
        <p>Feats are a character's special abilities. Some are for everyone; others belong to a single role.</p>
      `,
    },
    sections: [
      {
        id: "feat-puanlari",
        label: { tr: "Feat Puanları", en: "Feat Points" },
        body: {
          tr: `
            <ul>
              <li>Feat'ler feat puanıyla alınır. Hangi seviyede kaç feat puanı kazanıldığı <a href="#players-guide/roller">Oyuncu Rehberi › Sınıflar</a> sayfasında yazar.</li>
              <li>Feat puanları hemen harcanmak zorunda değildir; biriktirilebilir.</li>
              <li>Her feat yalnızca bir kez alınır.</li>
            </ul>
          `,
          en: `
            <ul>
              <li>Feats are bought with feat points. How many feat points each level grants is listed on the <a href="#players-guide/roller">Player's Guide › Roles</a> page.</li>
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
              <li><strong>Tarafsız feat'ler</strong> herkes içindir ve 1 puandır.</li>
              <li><strong>Sınıf feat'leri</strong> yalnızca o sınıftan alınır. 1. aşama feat'ler 1 puan, 2. aşama feat'ler 2 puandır. 2. aşama feat'ler 4. seviyede açılır.</li>
              <li>6. seviyede karakter başka bir sınıf seçip o sınıfın 1. aşama feat'lerine erişebilir ya da bunun yerine fazladan 1 feat puanı alabilir.</li>
              <li>Her sınıfın 1. seviyede bedava aldığı bir çekirdek feat'i de vardır; çekirdek feat'ler Sınıflar sayfasında yazar.</li>
            </ul>
          `,
          en: `
            <ul>
              <li><strong>General feats</strong> are for everyone and cost 1 point.</li>
              <li><strong>Role feats</strong> can only be taken by that role. Tier 1 feats cost 1 point, tier 2 feats cost 2 points. Tier 2 feats open up at level 4.</li>
              <li>At level 6, a character can choose another role and gain access to its tier 1 feats, or take 1 extra feat point instead.</li>
              <li>Every role also has a core feat it gets for free at level 1; core feats are listed on the Roles page.</li>
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
        <p>Netrunner'lar cyberdeck'leri aracılığıyla düşmanların kromuna ve çevredeki cihazlara sızar. Bu saldırılara <strong><span lang="en">quickhack</span></strong> denir.</p>
      `,
      en: `
        <p>Netrunners use their cyberdecks to break into enemies' chrome and the devices around them. These attacks are called <strong>quickhacks</strong>.</p>
      `,
    },
    sections: [
      {
        id: "kademeler",
        label: { tr: "Kademeler", en: "Tiers" },
        body: {
          tr: `
            <ul>
              <li>Netrunner için quickhack kullanmak bir <strong>bonus aksiyondur</strong>.</li>
              <li>Quickhack yapılacak hedefin <strong>görülüyor</strong> olması gerekir.</li>
              <li>Quickhack'ler dört kademeye ayrılır: <strong>I, II, III ve IV</strong>. I. kademe basit işleri kapsar, IV. kademe en üst düzeydir.</li>
              <li>Netrunner'lar kademelere seviye atladıkça erişir: I. kademe 1. seviyede, II. kademe 3. seviyede, III. kademe 7. seviyede, IV. kademe 10. seviyede açılır.</li>
              <li>Netrunner'ın specialization'ı kendine özel quickhack'ler ekler: 3. seviyede II. kademe, 7. seviyede III. kademe, 10. seviyede IV. kademe.</li>
              <li>Netrunner olmayan biri bir şekilde cyberdeck kullanabiliyorsa yalnızca I. kademe, nadir durumlarda II. kademe quickhack kullanabilir.</li>
            </ul>
          `,
          en: `
            <ul>
              <li>For a Netrunner, using a quickhack is a <strong>bonus action</strong>.</li>
              <li>The target of a quickhack must be <strong>in sight</strong>.</li>
              <li>Quickhacks are split into four tiers: <strong>I, II, III and IV</strong>. Tier I covers simple tricks; tier IV is the top level.</li>
              <li>Netrunners reach the tiers as they level up: tier I at level 1, tier II at level 3, tier III at level 7, tier IV at level 10.</li>
              <li>A Netrunner's specialization adds its own quickhacks: tier II at level 3, tier III at level 7, tier IV at level 10.</li>
              <li>Someone who isn't a Netrunner but somehow manages to use a cyberdeck can use only tier I quickhacks, and tier II in rare cases.</li>
            </ul>
          `,
        },
      },
      {
        id: "kutuphane",
        label: { tr: "Quickhack Kütüphanesi", en: "Quickhack Library" },
        body: {
          tr: `
            <p>Netrunner'ın bildiği quickhack'ler kütüphanesindedir. Kütüphane, cyberdeck'te hazır tutulan quickhack'lerden ayrıdır: Netrunner dinlenirken hazır quickhack'lerini kütüphanesinden seçer.</p>
            <p>Netrunner 1. seviyede kütüphanesine 3 quickhack ekler, bazı seviyelerde de yenilerini ekler. Quickhack'ler erişilebilen kademelerden ve Netrunner'ın specialization'ına ait quickhack'lerden seçilir.</p>
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
            <p>The quickhacks a Netrunner knows are in their library. The library is separate from the quickhacks held ready in the cyberdeck: while resting, the Netrunner picks their ready quickhacks from their library.</p>
            <p>A Netrunner adds 3 quickhacks to their library at level 1 and adds more at certain levels. Quickhacks are chosen from the tiers the Netrunner can access and from their specialization's quickhacks.</p>
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
            <p>Quickhack'ler cyberdeck aracılığıyla kullanılır. Kaliteli bir cyberdeck'in RAM'i daha fazladır ve içinde daha fazla quickhack hazır tutulabilir. Ancak kaliteli bir cyberdeck'i kullanabilmek için daha yüksek bir Netrunning modifier'ı gerekir.</p>
            <table class="rules">
              <thead><tr><th lang="en">Cyberdeck</th><th>Kademe</th><th lang="en">RAM</th><th>Hazır <span lang="en">quickhack</span></th><th>Gereken <span lang="en">Netrunning modifier</span>'ı</th></tr></thead>
              <tbody>
                <tr><td>Basit</td><td>I</td><td>4</td><td>5</td><td>—</td></tr>
                <tr><td>Standart</td><td>II</td><td>6</td><td>6</td><td>+6</td></tr>
                <tr><td>Kaliteli</td><td>III</td><td>8</td><td>7</td><td>+7</td></tr>
                <tr><td>Üst düzey</td><td>IV</td><td>10</td><td>8</td><td>+8</td></tr>
              </tbody>
            </table>
            <p>Tablo ortalama cyberdeck'leri gösterir; ikonik cyberdeck'ler bundan farklı olabilir.</p>
            <p><strong>Hazırlık:</strong> Cyberdeck'te hangi quickhack'lerin hazır tutulacağı yalnızca ekip dinlenirken değiştirilebilir. Netrunner o sırada hazır quickhack'lerini istediği gibi seçer.</p>
          `,
          en: `
            <p>Quickhacks are used through a cyberdeck. A better cyberdeck has more RAM and can hold more quickhacks ready. But using a better cyberdeck takes a higher Netrunning modifier.</p>
            <table class="rules">
              <thead><tr><th>Cyberdeck</th><th>Tier</th><th>RAM</th><th>Quickhacks ready</th><th>Netrunning modifier needed</th></tr></thead>
              <tbody>
                <tr><td>Basic</td><td>I</td><td>4</td><td>5</td><td>—</td></tr>
                <tr><td>Standard</td><td>II</td><td>6</td><td>6</td><td>+6</td></tr>
                <tr><td>Quality</td><td>III</td><td>8</td><td>7</td><td>+7</td></tr>
                <tr><td>Top-tier</td><td>IV</td><td>10</td><td>8</td><td>+8</td></tr>
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
              <li>RAM, Netrunner'ın her turunun başında <strong>1</strong> dolar.</li>
              <li>Savaş bitince RAM tamamen dolar.</li>
            </ul>
            <div class="example"><b>Örnek</b><p>RAM'i 6 olan bir Netrunner 4 RAM'lik Take Control'ü kullanır ve RAM'i 2'ye düşer. Sonraki turunun başında RAM'i 3 olur.</p></div>
          `,
          en: `
            <ul>
              <li>Every quickhack has a <strong>RAM cost</strong>. Using a quickhack spends that much RAM; without enough RAM, the quickhack can't be used.</li>
              <li>RAM refills by <strong>1</strong> at the start of each of the Netrunner's turns.</li>
              <li>When combat ends, RAM refills completely.</li>
            </ul>
            <div class="example"><b>Example</b><p>A Netrunner with 6 RAM uses Take Control, which costs 4 RAM, dropping to 2 RAM. At the start of their next turn they have 3 RAM.</p></div>
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

  "lore/korporasyonlar": {
    intro: {
      tr: `
        <blockquote class="ct-quote"><p>“Kızım Biotechnica'da çalışıyor. Dört yıl oldu, yüzünü en son yılbaşında gördüm, o da ekrandan. Şirketin yurdunda yatıyor, şirketin yemeğini yiyor, şirketin doktoruna gidiyor. Geçen sene terfi aldı, kutladık, sevindim tabii. Sonra bir baktım, sözleşmesinde çocuk yapmadan önce şirketten izin alması gerektiği yazıyor. Bir şey demedim.”</p><cite>- Elias Varga</cite></blockquote>
        <p>Dünyayı devletler değil, şirketler yönetir. Ordusu olan, kendi yasalarını koyan, bir şehri satın alabilecek kadar zengin dev şirketler. Night City'de onların kuleleri her yerden görünür.</p>
      `,
      en: `
        <blockquote class="ct-quote"><p>“My daughter works for Biotechnica. Four years now, and the last time I saw her face was New Year's, on a screen. She sleeps in the company dorm, eats the company food, sees the company doctor. Got a promotion last year, we celebrated, I was glad, sure. Then I looked, and her contract says she has to get the company's permission before having a kid. I didn't say anything.”</p><cite>- Elias Varga</cite></blockquote>
        <p>The world isn't run by states; it's run by corporations. Giant companies with their own armies, their own laws, and enough money to buy a city. In Night City, their towers can be seen from everywhere.</p>
      `,
    },
    sections: [
      {
        id: "sirketler-ve-sehir",
        label: { tr: "Şirketler ve Şehir", en: "Corporations and the City" },
        body: {
          tr: `
            <p>Büyük şirketler hiçbir devlete hesap vermez. Kuleleri, kampüsleri ve otelleri adeta yabancı topraktır: içeride NCPD değil, şirket güvenliği kural koyar. Night City'nin bağımsızlığı da en çok şirketlere yaradı. 2070'ten beri şehir NUSA'nın yasalarına bağlı değildir ve şirketler burada istedikleri gibi iş yapar.</p>
            <p>Şirketler birbirleriyle de savaşır. Bazen bu savaş yönetim kurulu odalarında ve borsada, bazen de sokakta, kiralık edgerunner'ların elinde yürür. Bir şirketin başka bir şirkete karşı tuttuğu ekipler, Night City'deki işlerin büyük kısmının kaynağıdır.</p>
          `,
          en: `
            <p>The big corporations answer to no state. Their towers, campuses and hotels are practically foreign soil: inside, corporate security makes the rules, not the NCPD. Night City's independence served the corporations most of all. Since 2070 the city hasn't been bound by NUSA law, and corporations do business here however they like.</p>
            <p>Corporations also fight each other. Sometimes that war is fought in boardrooms and on the stock market, sometimes on the street, by hired edgerunners. Crews hired by one corporation against another are the source of much of the work in Night City.</p>
          `,
        },
      },
      {
        id: "sirket-hayati",
        label: { tr: "Şirket Hayatı", en: "Corpo Life" },
        body: {
          tr: `
            <p>Bir şirkette çalışmak yalnızca maaş demek değildir: ev, okul, sağlık güvencesi ve Trauma Team aboneliği de işle birlikte gelir. Karşılığında şirket hayatın her köşesine karışır; bazı sözleşmeler onlarca yıllık sadakat ister.</p>
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
        <p>Night City, Kuzey Kaliforniya kıyısında, Del Coronado Körfezi'nde kurulmuş bir megakent. Yaklaşık yedi milyon insan, şirketlerin kuleleriyle çetelerin sokakları arasında sıkışmış halde burada yaşar. Kimine göre dünyanın en tehlikeli şehri, kimine göre adını duyurmak için tek şans.</p>
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
            <p>Şehri bir belediye başkanı ve şehir meclisi yönetir. Bağımsızlıktan beri koltukta oturan başkan, kimine göre bağımsızlığın kahramanı, kimine göre şehrin en büyük dolandırıcısıdır. Hakkındaki rüşvet iddiaları hiç eksik olmaz. Meclisteki koltukların çoğunun arkasında büyük şirketler vardır. Belediye binası Heywood'daki The Glen'dedir.</p>
            <p>Şehrin yollarını, köprülerini, metrosunu, elektriğini ve suyunu Night Corp işletir. Şirket, kurucu Richard Night'ın mirasından doğdu; şehrin toplu taşıma sistemi NCART da 2068'den beri onundur. Night Corp'un gerçekte ne kadar büyük olduğunu kimse bilmez.</p>
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
            <p>Hava kirlidir. Şehrin üstünde duman asılı durur, yağmur hafif asitlidir, ara sıra tehlikeli asit fırtınaları çıkar. Zenginler temiz havayı oksijen barlarında satın alır. Çevredeki topraklar kuraklıkla çöle dönmüştür; şehrin dışına Badlands denir. Yer darlığı yüzünden toprağa gömülmek 2040'lardan beri yasaktır, ölüler Columbarium'da saklanır.</p>
          `,
          en: `
            <p>In Night City, the distance between rich and poor is a few streets. Corporate executives live in City Center's guarded towers and North Oak's villas; most everyone else is crammed into giant megabuildings, tens of thousands of tiny apartments stacked on top of each other.</p>
            <p>The air is dirty. Smog hangs over the city, the rain is slightly acidic, and every so often a dangerous acid storm rolls in. The rich buy clean air at oxygen bars. The land around the city has been turned to desert by drought; the outside is called the Badlands. Space is so tight that burial in the ground has been banned since the 2040s; the dead are kept in the Columbarium.</p>
          `,
        },
      },
      {
        id: "duzenin-bekcileri",
        label: { tr: "Düzenin Bekçileri", en: "Keepers of Order" },
        body: {
          tr: `
            <p><strong><span lang="en">NCPD</span>:</strong> Şehrin polisi. Parası azdır, adamı azdır, şirketlerin etkisi altındadır ve rüşvet yaygındır. Zengin ve şirket bölgelerinde güçlüdür, ama bazı bölgeleri tamamen çetelere bırakmıştır. Aranan suçluların başına ödül koyar; bu ödülleri çoğu zaman serbest çalışanlar toplar.</p>
            <p><strong><span lang="en">MaxTac</span>:</strong> NCPD'nin siber psikoz birimi. Ağır silahlı ve kromla dolu memurlardan oluşur. Bir cyberpsycho'yu yakalamaktan çok öldürmeye gelirler.</p>
            <p><strong><span lang="en">Trauma Team</span>:</strong> Silahlı, özel bir acil sağlık şirketi. Yalnızca abonelerini kurtarır; abone olmayan biri yanı başında ölse bile dönüp bakmaz. Aboneliğin seviyesi ne kadar yüksekse ekip o kadar hızlı gelir. Ekibin işine karışan herkes düşman sayılır.</p>
            <p><strong><span lang="en">NetWatch</span>:</strong> Net'in polisi. Eski Net'i ve içindeki kötücül yapay zekâları Blackwall denen bir duvarın ardına kapatan onlardır. O duvarı aşmaya çalışan ya ölür ya da NetWatch'ın eline düşer.</p>
          `,
          en: `
            <p><strong>NCPD:</strong> The city's police. Short on money, short on people, under the corporations' influence, and bribery is everywhere. Strong in rich and corporate areas, but it has left some districts entirely to the gangs. It puts bounties on wanted criminals, and freelancers often collect them.</p>
            <p><strong>MaxTac:</strong> The NCPD's cyberpsycho unit, made up of heavily armed, heavily chromed officers. They come to kill a cyberpsycho far more often than to capture one.</p>
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
        <p>Night City'nin bugününü anlamak için dünün bilinmesi gerekir. Bu sayfa, Amerika'nın çöktüğü 1990'lardan bugüne, 2070'lerin ortasına kadar olan önemli olayları anlatır.</p>
      `,
      en: `
        <blockquote class="ct-quote"><p>“History? Let me tell you about history, kid. In twenty-three I was just a boy, my mother shoved me under the kitchen table and the windows blew in. For twenty years after that the sky was red, really red, nobody's making that up. Then Arasaka left, then it came back, and now its tower stands right where the old one did. Everybody forgot. I didn't, that table's still in our house.”</p><cite>- Elias Varga</cite></blockquote>
        <p>To understand Night City today, you need to know yesterday. This page covers the key events from the 1990s, when America collapsed, up to today, the mid-2070s.</p>
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
              <li><span class="year">1992</span><div class="event"><strong>Avrupa yükselir.</strong> Avrupa ortak pazarı ve onun parası eurodolar doğar. Avrupa ve Japonya ekonomik süper güce dönüşürken ABD geriler.</div></li>
              <li><span class="year">1994</span><div class="event"><strong>Borsa çöker.</strong> ABD'nin piyasaları gizlice yönlendirdiği ortaya çıkınca dünya borsaları çöker.</div></li>
              <li><span class="year">1996</span><div class="event"><strong>Çöküş.</strong> Yerel yönetimler iflas eder, anayasa askıya alınır, sıkıyönetim ilan edilir. Evini kaybeden milyonlarca Amerikalı yollara düşer; nomad'lar bu insanlardan doğar.</div></li>
              <li><span class="year">1997</span><div class="event"><strong>Mideast Meltdown.</strong> Orta Doğu'da "sınırlı" bir nükleer savaş çıkar ve bölgenin büyük kısmı yaşanmaz hale gelir. Dünyanın petrolü yarıya iner.</div></li>
            </ul>
          `,
          en: `
            <p>The 1990s are the years America fell apart and the world moved into a new order.</p>
            <ul class="timeline">
              <li><span class="year">1990s</span><div class="event"><strong>The Gang of Four.</strong> A quartet made up of the NSA, CIA, FBI and DEA takes over the US government from behind the scenes. States that stop obeying Washington begin declaring themselves Free States.</div></li>
              <li><span class="year">1992</span><div class="event"><strong>Europe rises.</strong> The European common market and its currency, the eurodollar, are born. Europe and Japan become economic superpowers while the US declines.</div></li>
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
              <li><span class="year">1994</span><div class="event"><strong>Coronado City kurulur.</strong> Richard Night'ın hayali olan şehir, Arasaka, EBM ve Petrochem'in parasıyla Del Coronado Körfezi'nde kurulur.</div></li>
              <li><span class="year">1998</span><div class="event"><strong>Richard Night öldürülür.</strong> Kurucunun suikastten sonra şehrin adı Night City olur. Katil hiç bulunmaz; şehri organize suç ele geçirir.</div></li>
              <li><span class="year">2004</span><div class="event"><strong>Birinci Şirket Savaşı.</strong> EBM ile Orbital Air arasında, bir havayolu şirketinin satın alınması yüzünden çıkar. Çoğu baskınlarla ve Net saldırılarıyla yürür.</div></li>
              <li><span class="year">2008</span><div class="event"><strong>İkinci Şirket Savaşı.</strong> SovOil ile Petrochem, Güney Çin Denizi'ndeki petrol sahaları için savaşır.</div></li>
              <li><span class="year">2009–2011</span><div class="event"><strong>Mafya Savaşı.</strong> Şirketler, başta Arasaka'nın güçleri olmak üzere, mafyayı Night City'den temizler. Şehri artık şirketlerin elindeki bir meclis yönetir.</div></li>
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
            <p>Savaştan sonraki yirmi yılda nükleer serpinti, yangınlar ve yörüngeden düşen kayalar gökyüzünü kızıla boyar. Dünya yavaş yavaş yeniden kurulur.</p>
            <ul class="timeline">
              <li><span class="year">2020'lerin sonu</span><div class="event"><strong>Göç.</strong> Mülteciler ve nomad'lar terk edilmiş şehirlere geri döner. Night City yıkıntıların içinden yeniden ayağa kalkmaya başlar.</div></li>
              <li><span class="year">2028</span><div class="event"><strong>Yeni şehir.</strong> Night City yeni bir anayasayla bölgelere ayrılır. Ertesi yıl, siber psikozla savaşmak için MaxTac yeniden kurulur.</div></li>
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
              <li><span class="year">2060'ların başı</span><div class="event"><strong>Pacifica.</strong> Pacifica'da lüks bir tatil cenneti inşa edilmeye başlanır. Fırtınaların yıktığı Haiti'den kaçan işçiler bölgeye yerleşir.</div></li>
              <li><span class="year">2067</span><div class="event"><strong>Mox kurulur.</strong> Tyger Claws'ın Kabuki'de bir kulüp sahibini öldürmesinin ardından şehre isyanlar yayılır; Mox bu öfkeden doğar.</div></li>
              <li><span class="year">2068</span><div class="event"><strong>Night Corp ve NCART.</strong> Night Corp şehrin toplu taşıma sistemi NCART'ı satın alır.</div></li>
            </ul>
          `,
          en: `
            <p>The city grows and the money comes back; new neighborhoods are born and old ones are erased.</p>
            <ul class="timeline">
              <li><span class="year">2050s</span><div class="event"><strong>The city changes.</strong> Watson's Chinese community grows into Little China. North Oak's shantytowns are torn down to make room for rich people's villas.</div></li>
              <li><span class="year">Early 2060s</span><div class="event"><strong>Pacifica.</strong> Construction of a luxury resort begins in Pacifica. Workers fleeing storm-wrecked Haiti settle in the district.</div></li>
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
              <li><span class="year">2070</span><div class="event"><strong>Dogtown.</strong> Bir askerî birlik savaş bitince silah bırakmaz; Pacifica'nın bir parçasını ele geçirip duvarlarla çevirir. Bu bölgeye Dogtown, birliğin milislerine Barghest denir.</div></li>
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
            <p>2070'lerin ortası. Arasaka'nın kulesi yeniden şehrin üstünde yükseliyor, NUSA bekliyor, sokaklarda krom her zamankinden ucuz.</p>
            <ul class="timeline">
              <li><span class="year">2072</span><div class="event"><strong>Pacifica terk edilir.</strong> Pacifica'daki polis karakolu kapatılır ve bölge bir Combat Zone ilan edilir.</div></li>
              <li><span class="year">2070'ler</span><div class="event"><strong>Siber psikoz.</strong> Kroma bu kadar kolay ulaşılan bir şehirde cyberpsycho vakaları giderek artar. MaxTac'in işi hiç bitmez.</div></li>
              <li><span class="year">Şimdi</span><div class="event"><strong>Night City.</strong> Şirketler kulelerinde, çeteler sokaklarda, edgerunner'lar ikisinin arasında. Hikâye burada başlar.</div></li>
            </ul>
          `,
          en: `
            <p>The mid-2070s. Arasaka's tower looms over the city again, the NUSA is waiting, and chrome on the streets is cheaper than ever.</p>
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
        <p>Edgerunner; kuralların dışında yaşayan, para için iş alan, kromla güçlenmiş bir paralı asker ya da sokak profesyonelidir. Bu sayfa bir edgerunner'ın dünyasını anlatır: işin nereden geldiğini, paranın nasıl döndüğünü, kime güvenilip kimden uzak durulacağını.</p>
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
            <p><span lang="en">Edge</span>, risk alanların ve büyük oynayanların yaşadığı belirsiz bölgedir: yasanın ve düzenin kenarı. Edgerunner'ların birkaç yazısız kuralı vardır:</p>
            <ul>
              <li><strong>Tarz her şeydir:</strong> Bir işi ne kadar iyi yaptığın değil, yaparken nasıl göründüğün önemlidir.</li>
              <li><strong>Tavır her şeydir:</strong> Tehlikeli düşün, tehlikeli ol.</li>
              <li><strong>Kenarda yaşa:</strong> Riskten kaçan, sokakta adını duyuramaz.</li>
            </ul>
            <p>Sokakta herkesin bir lakabı vardır ve kimse gerçek adını sormaz. Bir edgerunner'ın asıl sermayesi ünüdür: adı ne kadar duyulursa o kadar iyi işler gelir, o kadar iyi fixer'lar kapısını çalar. Çoğu edgerunner'ın hayali bir efsane olmaktır; efsanelerin çoğu da genç ölür.</p>
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
            <p>Edgerunner'a işi fixer bulur. Fixer; anlaşma yapan, kaçak mal taşıyan, bilgi alıp satan bir aracıdır. Müşteriyle edgerunner arasında durur: işi bulur, ekibi seçer, iki tarafa da kefil olur ve payını alır.</p>
            <p>İş çoğu zaman bir telefonla ya da kısa bir mesajla gelir: bir şeyi çalmak, birini korumak, birini ortadan kaldırmak, bir paketi teslim etmek. Ödeme iş bitince eddies olarak gelir; temiz ve sessiz bitirilen işe bazen ikramiye eklenir. İşini iyi yapanın ünü artar, ünü artan daha büyük işler alır.</p>
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
            <p>Ripperdoc; krom takan, söken ve yenileyen cerrahtır. Ruhsatlı olabilir de olmayabilir de. Şehirde zincir klinikler vardır, ama çoğu edgerunner bir ara sokaktaki arka odaya gider: orada soru sorulmaz, bazen hastayı uyutmaya bile gerek görülmez.</p>
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
            <p>Night City'nin parası eurodolardır (€$); sokakta herkes <strong><span lang="en">eddies</span></strong> der. 1990'larda Avrupa'nın ortak parası olarak doğdu, sağlamlığı yüzünden dünyanın birçok yerinde resmî para oldu. Para dijitaldir ve anında el değiştirir. İşin ücreti, ripperdoc'un faturası, polise verilen rüşvet: hepsi eddies'le ödenir.</p>
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
            <p>Şehrin paralı askerlerinin barı. Watson'da, eski bir morgun içindedir; duvarlarda hâlâ ceset dolaplarının çekmeceleri durur. Afterlife'a girebilmek, sokakta yükselmekte olmanın işaretidir.</p>
            <p>Menüdeki kokteyllerin her biri ölmüş bir efsanenin adını taşır. Listeye girmenin tek yolu ölmektir, mümkünse görkemli bir şekilde.</p>
          `,
          en: `
            <p>The city's mercenary bar. It's in Watson, inside a former morgue; the body drawers are still in the walls. Getting into the Afterlife is a sign that you're on the rise on the street.</p>
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
        label: { tr: "Siber Psikoz", en: "Cyberpsychosis" },
        body: {
          tr: `
            <p>Fazla krom ağır bir zihinsel yükle birleşince insan kopabilir: çevresine düşman olan, kimseyi tanımayan bir cyberpsycho'ya dönüşür. Kimin ne kadar kroma dayanabileceği kişiden kişiye değişir; immünsupresanlar bu kaymayı yavaşlatır ama durdurmaz.</p>
            <p>Bir cyberpsycho ortaya çıktığında MaxTac çağrılır ve MaxTac çoğu zaman öldürmek için gelir. Bazı fixer'lar ise cyberpsycho'ları canlı yakalatmak için edgerunner tutar; belki tedavi edilebilirler diye.</p>
            <p class="note">Oyundaki kuralları için: <a href="#rulebook/temel-mekanik">Kural Kitabı › Temel Kurallar</a>, Humanity bölümü.</p>
          `,
          en: `
            <p>Too much chrome on top of heavy mental strain can make a person snap: they turn into a cyberpsycho, hostile to everything around them, recognizing no one. How much chrome someone can take differs from person to person; immunosuppressants slow the slide but don't stop it.</p>
            <p>When a cyberpsycho turns up, MaxTac gets called, and MaxTac usually comes to kill. Some fixers hire edgerunners to bring cyberpsychos in alive instead, in case they can be treated.</p>
            <p class="note">For the game rules: <a href="#rulebook/temel-mekanik">Rulebook › Core Mechanic</a>, Humanity section.</p>
          `,
        },
      },
      {
        id: "net",
        label: { tr: "Net ve Blackwall", en: "The Net and the Blackwall" },
        body: {
          tr: `
            <p>Eski küresel Net, 2022'de efsanevi bir netrunner'ın bıraktığı virüslerle çöktü; serbest kalan yapay zekâlar onu yaşanmaz hale getirdi. NetWatch eski Net'i Blackwall denen bir duvarın ardına kapattı. Bugünkü Net, birbirinden kopuk yerel ağlardan oluşur.</p>
            <p>Netrunner'lar Net'e beyinleriyle bağlanır. Savaşta, bir cyberdeck üzerinden düşmanın kromuna ve çevredeki sistemlere sızarak quickhack yaparlar. Bu iş tehlikelidir: Black ICE denen savunma yazılımları bir netrunner'ın beynini yakabilir. Blackwall'un ötesine geçmeye çalışanların pek azı geri döner.</p>
          `,
          en: `
            <p>The old global Net collapsed in 2022 under viruses left behind by a legendary netrunner, and the AIs that broke loose made it uninhabitable. NetWatch sealed the old Net behind a wall called the Blackwall. Today's Net is made of separate local networks.</p>
            <p>Netrunners connect to the Net with their brains. In combat, they quickhack through a cyberdeck, breaking into enemies' chrome and nearby systems. The work is dangerous: defensive programs called Black ICE can fry a netrunner's brain. Few who try to cross the Blackwall ever come back.</p>
          `,
        },
      },
      {
        id: "sokak-dili",
        label: { tr: "Sokak Dili", en: "Street Slang" },
        body: {
          tr: `
            <p>Night City sokaklarında sık duyulan kelimeler:</p>
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
            <p>NCPD'nin her çeteyle uğraşacak gücü yoktur, çoğu zaman niyeti de yoktur. 6th Street gibi bazı çetelere kendi bölgelerinde gayriresmî bir polis gibi göz yumar. Valentinos gibi mahalleye kök salmış çetelerin arasına sızamaz. Pacifica'yı şirketlerle birlikte terk etmiştir, Dogtown'a ise hiç giremez.</p>
            <p>Bir çetenin bölgesinde o çetenin kuralları geçer. Yabancılar dikkatle izlenir, renkler ve dövmeler kimin kime ait olduğunu söyler, yanlış sokağa yanlış ceketle girmek yeterince büyük bir hatadır.</p>
          `,
          en: `
            <p>The NCPD doesn't have the strength to deal with every gang, and most of the time it doesn't have the will either. It tolerates some gangs, like 6th Street, as unofficial police on their own turf. It can't get inside gangs rooted deep in their neighborhoods, like the Valentinos. It abandoned Pacifica along with the corporations, and it can't enter Dogtown at all.</p>
            <p>On a gang's turf, that gang's rules apply. Strangers are watched closely, colors and tattoos tell you who belongs to whom, and walking down the wrong street in the wrong jacket is a big enough mistake.</p>
          `,
        },
      },
      {
        id: "savas-bolgeleri",
        label: { tr: "Savaş Bölgeleri", en: "Combat Zones" },
        body: {
          tr: `
            <p>Devletin ve şirketlerin terk ettiği, çetelerin ve psikopatların eline bırakılmış bölgelere <strong><span lang="en">Combat Zone</span></strong> denir. Polis bu bölgelere girmez; girmek zorunda kalırsa kalabalık ve ağır silahlı girer.</p>
            <p>2070'lerde bunun en iyi örneği Pacifica'dır. 2069'daki savaş sırasında yatırımcılar kaçtı, belediye hizmetleri kesti, polis ve şirketler çekildi. Pacifica'nın içindeki Dogtown ise bunun en uç hali: duvarlarla çevrili, kendi ordusu ve kendi yasası olan bir şehir parçası.</p>
          `,
          en: `
            <p>Districts abandoned by the state and the corporations and left to gangs and psychos are called <strong>Combat Zones</strong>. The police don't go in; when they have to, they go in large numbers and heavily armed.</p>
            <p>In the 2070s, the best example is Pacifica. During the war of 2069 the investors fled, the city cut its services, and the police and the corporations pulled out. Dogtown, inside Pacifica, is the extreme version: a walled-off piece of the city with its own army and its own law.</p>
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
        <p>Night City dünyanın dört bir yanından gelen insanlarla dolu. Sokakta herkes Streetslang konuşur; ama bir şirketin toplantı odasında, bir çetenin mahallesinde ya da bir göçmen pazarında başka diller duyulur.</p>
        <p>Her karakter Streetslang bilir. Ek dil hakkı olan karakter dilini bu listeden seçer; listede olmayan bir dil de GM'in onayıyla seçilebilir.</p>
      `,
      en: `
        <p>Night City is full of people from every corner of the world. On the street, everyone speaks Streetslang; but in a corporate boardroom, a gang's neighborhood or an immigrant market, you'll hear other languages.</p>
        <p>Every character knows Streetslang. A character with extra languages picks them from this list; a language that isn't listed can also be picked with the GM's approval.</p>
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
        <p>Night City'de herkes bir yerden bir yere kaçar. Bu sayfa araç sürmeyi, araçtan ateş etmeyi ve kovalamacaları anlatır; en altta genel araç tiplerinin listesi var.</p>
      `,
      en: `
        <p>In Night City, everyone is running from somewhere to somewhere. This page covers driving, shooting from vehicles and chases; at the bottom is a list of general vehicle types.</p>
      `,
    },
    sections: [
      {
        id: "surus",
        label: { tr: "Sürüş", en: "Driving" },
        body: {
          tr: `
            <ul>
              <li>Araç sürmek bir <strong>aksiyondur</strong>.</li>
              <li>Tehlikeli bir manevrada (keskin dönüş, trafiğe dalmak, rampadan atlamak) <strong>Driving</strong> atılır. DV'yi geçemeyen sürücü aracın kontrolünü kaybeder.</li>
            </ul>
          `,
          en: `
            <ul>
              <li>Driving a vehicle takes an <strong>action</strong>.</li>
              <li>A dangerous maneuver (a hard turn, cutting through traffic, jumping a ramp) needs a <strong>Driving</strong> roll. A driver who fails the DV loses control of the vehicle.</li>
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
              <li>Sürücü sadece tek elle kullanılan silahlarla ateş edebilir ve saldırı zarları dezavantajlıdır.</li>
            </ul>
          `,
          en: `
            <ul>
              <li>Passengers shoot as normal.</li>
              <li>The driver can only fire one-handed weapons, and their attack rolls have disadvantage.</li>
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
              <li>Siperin HP'si aracın kendi HP'sidir. Sipere isabet eden hasar önce aracın <strong>SP</strong>'sine çarpar, geçen kısım aracın <strong>HP</strong>'sinden düşer. <span class="draft">Taslak</span></li>
              <li>HP'si 0'a düşen araç hurdaya döner ve artık siper sağlamaz.</li>
            </ul>
          `,
          en: `
            <ul>
              <li>A vehicle gives cover to the people inside it and to those hiding behind it. How much cover it gives is listed in the vehicle list.</li>
              <li>The cover's HP is the vehicle's own HP. Damage that hits the cover first meets the vehicle's <strong>SP</strong>, and whatever gets through comes off the vehicle's <strong>HP</strong>. <span class="draft">Draft</span></li>
              <li>A vehicle that drops to 0 HP is wrecked and no longer gives cover.</li>
            </ul>
          `,
        },
      },
      {
        id: "kovalamaca",
        label: { tr: "Kovalamaca", en: "Chases" },
        body: {
          tr: `
            <p>Kovalamacalar GM'in inisiyatifiyle, esnek şekilde yürütülür. Aşağıdaki yöntem sadece bir fikir vermek içindir:</p>
            <ul>
              <li>Her tur iki sürücü karşılıklı <strong>Driving</strong> atar.</li>
              <li>Kazanan, aradaki mesafeyi bir adım değiştirir. Mesafeler örneğin Yakın, Orta, Uzak ve Çok uzak gibi düşünülebilir.</li>
              <li>Kaçan yeterince uzaklaşırsa kaçar; kovalayan yeterince yaklaşırsa yakalar.</li>
            </ul>
          `,
          en: `
            <p>Chases are run flexibly, at the GM's discretion. The method below is only an idea to work from:</p>
            <ul>
              <li>Each round, both drivers make opposed <strong>Driving</strong> rolls.</li>
              <li>The winner shifts the distance between them by one step. The distances can be thought of as Close, Medium, Long and Extreme, for example.</li>
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
        <p>Cyberpunk Green'de bir karakterin bir işi başarıp başaramadığını tek bir zar belirler: <strong>d10</strong>. Bu sayfa her atışta kullanılan temel kuralları anlatır: zarın nasıl atılacağını, sonucun neyle karşılaştırılacağını ve sonucu değiştiren durumları.</p>
      `,
      en: `
        <p>In Cyberpunk Green, a single die decides whether a character succeeds: the <strong>d10</strong>. This page covers the basic rules used in every roll: how dice are rolled, what the result is compared against, and what can change it.</p>
      `,
    },
    sections: [
      {
        id: "skill-atisi",
        label: { tr: "Skill Atışı", en: "Skill Checks" },
        body: {
          tr: `
            <p>Sonucu belirsiz ve önemli bir şey yapılmaya çalışıldığında, hangi skill'in kullanılacağı ve işin zorluğu, yani <strong>DV</strong> (Difficulty Value) belirlenebilir. Ardından şu atış yapılır:</p>
            <div class="formula">d10 + Skill <span>vs</span> DV</div>
            <p>Toplam DV'den <strong>yüksekse</strong> atış başarılı olur. DV ile <strong>eşitlik</strong> olursa DV kazanır ve atış başarısız olur.</p>
            <div class="example"><b>Örnek</b><p>Bir karakter, kilitli bir kapının arkasındaki konuşmayı dinlemek istiyor. Perception (Algı) atılıyor ve DV 11. Karakterin Perception değeri +4. Zarda 8 geliyor: 8 + 4 = 12. İçeride konuşulanlar duyuluyor.</p></div>
          `,
          en: `
            <p>When something important with an uncertain outcome is attempted, the skill to use and the task's difficulty, the <strong>DV</strong> (Difficulty Value), can be set. Then this roll is made:</p>
            <div class="formula">d10 + Skill <span>vs</span> DV</div>
            <p>If the total is <strong>higher</strong> than the DV, the roll succeeds. On a <strong>tie</strong>, the DV wins and the roll fails.</p>
            <div class="example"><b>Example</b><p>A character wants to listen in on a conversation behind a locked door. A Perception roll is made against DV 11. The character's Perception is +4. The die shows an 8: 8 + 4 = 12. What is said inside can be heard.</p></div>
          `,
        },
      },
      {
        id: "skill-degeri",
        label: { tr: "Skill Değeri", en: "Skill Value" },
        body: {
          tr: `
            <p>Karakter kağıdındaki her skill'in tek bir değeri vardır ve atışta yalnızca bu değer eklenir. Bu değer şunların toplamıdır:</p>
            <ul>
              <li><strong>Stat modifier'ı:</strong> skill'in bağlı olduğu stat'tan gelir. Örneğin Stealth (Gizlilik) DEX'e bağlıdır.</li>
              <li><strong>Yetkinlik bonusu:</strong> skill'de yetkinse +1, çok yetkinse +2.</li>
              <li><strong>Ustalık:</strong> o skill'de Ustalık varsa Ustalık modifier'ı eklenir. Ustalık yalnızca yetkin ya da çok yetkin olunan skill'lere verilebilir.</li>
              <li><strong>Diğer bonuslar:</strong> feat'ler ve krom.</li>
            </ul>
            <p class="note">Stat modifier'ı zaten skill değerinin içinde olduğu için atışta bir daha eklenmez.</p>
            <div class="example"><b>Örnek</b><p>Bir karakterin DEX'i 14, yani modifier'ı +2. Stealth'te çok yetkin (+2) ve Stealth'te Ustalığı var (+1). Stealth değeri: 2 + 2 + 1 = <strong>+5</strong>. Gizlenirken d10 + 5 atılır.</p></div>
          `,
          en: `
            <p>Every skill on the character sheet has a single value, and that is the only number added to the roll. It is the sum of:</p>
            <ul>
              <li><strong>Stat modifier:</strong> from the stat the skill belongs to. For example, Stealth belongs to DEX.</li>
              <li><strong>Proficiency bonus:</strong> +1 if proficient in the skill, +2 if highly proficient.</li>
              <li><strong>Mastery:</strong> if there is Mastery in the skill, the Mastery modifier is added.</li>
              <li><strong>Other bonuses:</strong> feats and chrome.</li>
            </ul>
            <p class="note">The stat modifier is already part of the skill value, so it is not added to the roll again.</p>
            <div class="example"><b>Example</b><p>A character has DEX 14, so the modifier is +2. They are highly proficient in Stealth (+2) and have Mastery in it (+1). Their Stealth is 2 + 2 + 1 = <strong>+5</strong>. When sneaking, d10 + 5 is rolled.</p></div>
          `,
        },
      },
      {
        id: "stat-modifier",
        label: { tr: "Stat Modifier", en: "Stat Modifiers" },
        body: {
          tr: `
            <p>Statlar 3 ile 20 arasında bir değer alır. Her stat'ın bir <strong>modifier</strong>'ı vardır ve skill değerlerine bu modifier eklenir.</p>
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
            <p>Stats range from 3 to 20. Each stat has a <strong>modifier</strong>, and that modifier goes into skill values.</p>
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
            <p>İşin ne kadar zor olduğuna göre aşağıdaki basamaklardan biri seçilebilir. <span class="draft">Taslak</span></p>
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
            <p>One of the steps below can be chosen based on how hard the task is. <span class="draft">Draft</span></p>
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
        id: "kritik-zar",
        label: { tr: "Kritik Zar", en: "Exploding Dice" },
        body: {
          tr: `
            <p>Zarın kendisinde, bonuslar eklenmeden önce gelen sayıya <strong>doğal</strong> sonuç denir.</p>
            <ul>
              <li>Doğal <strong>10</strong> gelirse bir d10 daha atılır ve sonucu <strong>eklenir</strong>.</li>
              <li>Doğal <strong>1</strong> gelirse bir d10 daha atılır ve sonucu <strong>çıkarılır</strong>.</li>
            </ul>
            <p>Ek zar yalnızca bir kez atılır. Ek zarda tekrar 10 ya da 1 gelse bile yeni bir kritik zar atılmaz.</p>
            <div class="example"><b>Örnek</b><p>Handgun (Tabancalar) değeri +3 olan bir karakter DV 14'e karşı atıyor. Zarda 10 geliyor, bir zar daha atılıyor ve 6 geliyor. Toplam: 10 + 6 + 3 = 19.</p></div>
          `,
          en: `
            <p>The number shown on the die itself, before any bonuses, is the <strong>natural</strong> result.</p>
            <ul>
              <li>On a natural <strong>10</strong>, another d10 is rolled and <strong>added</strong>.</li>
              <li>On a natural <strong>1</strong>, another d10 is rolled and <strong>subtracted</strong>.</li>
            </ul>
            <p>The extra die is rolled only once. It does not explode again, even if it also shows a 10 or a 1.</p>
            <div class="example"><b>Example</b><p>A character with Handgun +3 rolls against DV 14. The die shows a 10, another die is rolled and shows a 6. Total: 10 + 6 + 3 = 19.</p></div>
          `,
        },
      },
      {
        id: "avantaj",
        label: { tr: "Avantaj ve Dezavantaj", en: "Advantage & Disadvantage" },
        body: {
          tr: `
            <p>Bazı durumlar atışı kolaylaştırır ya da zorlaştırır.</p>
            <ul>
              <li><strong>Avantaj:</strong> iki d10 atılır, yüksek olan alınır.</li>
              <li><strong>Dezavantaj:</strong> iki d10 atılır, düşük olan alınır.</li>
            </ul>
            <p>Aynı atışta hem avantaj hem dezavantaj varsa <strong>birbirini götürür</strong> ve tek d10 ile normal atılır.</p>
            <p>Kritik zar kuralı <strong>seçilen zar</strong> için geçerlidir. Avantajlı atışta alınan zar 10 ise bir zar daha atılıp eklenir. Dezavantajlı atışta alınan zar 1 ise bir zar daha atılıp çıkarılır.</p>
          `,
          en: `
            <p>Some situations make a roll easier or harder.</p>
            <ul>
              <li><strong>Advantage:</strong> two d10s are rolled and the higher one is kept.</li>
              <li><strong>Disadvantage:</strong> two d10s are rolled and the lower one is kept.</li>
            </ul>
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
            <p>Bazı durumlar hiçbir skill'e uymaz, böyle durumlarda GM isterse skill yerine stat zarı atılabilir:</p>
            <div class="formula">d10 + Stat Modifier <span>vs</span> DV</div>
            <div class="example"><b>Örnek</b><p>Dağınık ipuçlarını birleştirip olayı çözmeye çalışmak bir INT atışıdır. Konuşmanın ortasında silaha hızla davranmak ise bir DEX atışıdır.</p></div>
          `,
          en: `
            <p>Some situations do not fit any skill. In such cases, if the GM wishes, a stat roll can be made instead of a skill roll:</p>
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
            <p>Luck bir stat değil, her oturumun başında dolan bir puan havuzudur. <span class="draft">Taslak</span></p>
            <ul>
              <li>Havuzda <strong>3</strong> puan vardır.</li>
              <li>Atıştan önce istenildiği kadar Luck puanı harcanabilir. Harcanan her puan atışa <strong>+1</strong> ekler.</li>
              <li>Harcanan puanlar bir sonraki oturuma kadar geri gelmez.</li>
            </ul>
          `,
          en: `
            <p>Luck is not a stat. It is a pool of points that refills at the start of each session. <span class="draft">Draft</span></p>
            <ul>
              <li>The pool holds <strong>3</strong> points.</li>
              <li>Before a roll, any number of Luck points can be spent. Each point spent adds <strong>+1</strong> to the roll.</li>
              <li>Spent points do not come back until the next session.</li>
            </ul>
          `,
        },
      },
      {
        id: "humanity",
        label: { tr: "Humanity", en: "Humanity" },
        body: {
          tr: `
            <p><strong>Humanity</strong>, bir karakterin insanlığını, yani kendisiyle ve çevresindekilerle bağını gösterir. Krom taktıkça ve karanlık şeyler yaşadıkça azalır.</p>
            <ul>
              <li>Başlangıç değeri: <strong>EMP × 10</strong>.</li>
              <li><strong>Maksimum Humanity</strong> = EMP × 10 − takılı kromların Humanity kayıplarının toplamı. Humanity hiçbir zaman maksimumu aşamaz.</li>
              <li>Humanity 0'ın altına inebilir.</li>
            </ul>
            <p><strong>Basamaklar</strong></p>
            <table class="rules">
              <thead><tr><th lang="en">Humanity</th><th>Durum</th><th>Etki</th><th>Kriz DV'si</th><th>Tetikleyiciler</th></tr></thead>
              <tbody>
                <tr><td>100–61</td><td>İnsan</td><td>—</td><td>—</td><td>—</td></tr>
                <tr><td>60–41</td><td>Kopuk</td><td>Insight ve Persuasion zarlarına −1</td><td>—</td><td>—</td></tr>
                <tr><td>40–21</td><td>Sınırda</td><td>Insight ve Persuasion zarlarına −2, Concentration zarlarına −1</td><td>8</td><td>Kritik yara almak, bir dostun düşmesi</td></tr>
                <tr><td>20–1</td><td>Eşikte</td><td>Insight ve Persuasion zarları dezavantajlı, Concentration zarlarına −2</td><td>11</td><td>Yukarıdakiler ve birini öldürmek</td></tr>
                <tr><td>0 ve altı</td><td>Uçurumda</td><td>Insight, Persuasion ve Concentration zarları dezavantajlı</td><td>15, 0'ın altındaki her puan için +1</td><td>Yukarıdakiler ve Sandevistan, Kerenzikov gibi refleks kromu kullanmak</td></tr>
              </tbody>
            </table>
            <p class="note">Her basamağın etkisi bir öncekinin yerine geçer, üst üste eklenmez.</p>
            <p><strong>Cyberpsychosis krizi</strong></p>
            <ul>
              <li>Kriz yalnızca karakterin basamağındaki bir <strong>tetikleyiciyle</strong> başlar. Bir basamağa düşmek tek başına tetikleyici değildir.</li>
              <li>Tetikleyici olunca <strong>Mental Resist</strong>, basamağın kriz DV'sine karşı atılır.</li>
              <li><strong>Sınırda ya da Eşikte</strong> başarısız olunursa kısa süreli bir psikoz yaşanır: karakter <strong>1d6 tur</strong> boyunca GM'in kontrolüne geçer.</li>
              <li><strong>Uçurumda</strong> başarısız olunursa karakter <strong>Cyberpsycho</strong> olur ve kalıcı olarak GM'e geçer.</li>
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
            <table class="rules">
              <thead><tr><th>Olay</th><th lang="en">Humanity</th></tr></thead>
              <tbody>
                <tr><td>Dostlarla kutlama, sevilen biriyle vakit geçirmek gibi iyi bir etkinlik</td><td>+1 ile +3 (GM önerisi), oturum başına bir kez</td></tr>
                <tr><td>Büyük bir hedefi başarmak</td><td>+5 ile +10 (GM önerisi)</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p><strong>Humanity</strong> shows a character's humanity: their bond with themselves and the people around them. It drops as they get chrome and live through dark things.</p>
            <ul>
              <li>Starting value: <strong>EMP × 10</strong>.</li>
              <li><strong>Max Humanity</strong> = EMP × 10 − the total Humanity loss of installed chrome. Humanity can never go above the maximum.</li>
              <li>Humanity can drop below 0.</li>
            </ul>
            <p><strong>Tiers</strong></p>
            <table class="rules">
              <thead><tr><th>Humanity</th><th>State</th><th>Effect</th><th>Crisis DV</th><th>Triggers</th></tr></thead>
              <tbody>
                <tr><td>100–61</td><td>Human</td><td>—</td><td>—</td><td>—</td></tr>
                <tr><td>60–41</td><td>Detached</td><td>−1 to Insight and Persuasion rolls</td><td>—</td><td>—</td></tr>
                <tr><td>40–21</td><td>On the Edge</td><td>−2 to Insight and Persuasion rolls, −1 to Concentration rolls</td><td>8</td><td>Taking a critical injury, an ally going down</td></tr>
                <tr><td>20–1</td><td>At the Threshold</td><td>Insight and Persuasion rolls have disadvantage, −2 to Concentration rolls</td><td>11</td><td>The above, plus killing someone</td></tr>
                <tr><td>0 and below</td><td>On the Brink</td><td>Insight, Persuasion and Concentration rolls have disadvantage</td><td>15, +1 for every point below 0</td><td>The above, plus using reflex chrome like a Sandevistan or Kerenzikov</td></tr>
              </tbody>
            </table>
            <p class="note">Each tier's effect replaces the previous one; they don't stack.</p>
            <p><strong>Cyberpsychosis crisis</strong></p>
            <ul>
              <li>A crisis only starts with a <strong>trigger</strong> from the character's tier. Dropping into a tier is not a trigger on its own.</li>
              <li>When triggered, roll <strong>Mental Resist</strong> against the tier's crisis DV.</li>
              <li>On a failure <strong>On the Edge or At the Threshold</strong>, the character has a short psychotic break: the GM controls them for <strong>1d6 rounds</strong>.</li>
              <li>On a failure <strong>On the Brink</strong>, the character becomes a <strong>Cyberpsycho</strong> and passes to the GM for good.</li>
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
            <table class="rules">
              <thead><tr><th>Event</th><th>Humanity</th></tr></thead>
              <tbody>
                <tr><td>A good time, like celebrating with friends or spending time with a loved one</td><td>+1 to +3 (GM suggestion), once per session</td></tr>
                <tr><td>Achieving a major goal</td><td>+5 to +10 (GM suggestion)</td></tr>
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
            <p><strong>İmmünsupresan</strong>, vücudun kromu reddetmesini ve zihnin kromla kopuşunu bastıran bir ilaçtır. Ripperdoc'lardan ve eczanelerden alınır.</p>
            <ul>
              <li>Bir doz almak <strong>bonus aksiyondur</strong>.</li>
              <li>Bir sonraki tam gece dinlenmesine kadar <strong>kriz zarları avantajlı</strong> atılır.</li>
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
            <p><strong>Immunosuppressants</strong> are drugs that suppress the body's rejection of chrome and the mind's drift away from it. They can be bought from ripperdocs and pharmacies.</p>
            <ul>
              <li>Taking a dose is a <strong>bonus action</strong>.</li>
              <li>Until the next full night's rest, <strong>crisis rolls have advantage</strong>.</li>
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
            <p><strong>Krom</strong> (cyberware), vücuda takılan sibernetik parçalardır. Kromu ripperdoc'lar takar.</p>
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
                <tr><td>11 ve üstü</td><td>Ağır</td><td>14</td></tr>
              </tbody>
            </table>
            <p>Aktive edilmesi gereken bir kromu çalıştırmak bonus aksiyondur. <span class="draft">Taslak</span></p>
            <p><strong>Arıza:</strong> Arızalı krom tamir edilene kadar çalışmaz; pasif ve aktif etkileri durur. Krom takılı kaldığı için Humanity kaybı devam eder.</p>
            <table class="rules">
              <thead><tr><th>Neden</th><th>Arıza</th><th>Düzelmesi</th></tr></thead>
              <tbody>
                <tr><td>Krom bölgeye gelen kritik yara</td><td>Kalıcı</td><td>Tamir gerekir. Yaranın etkisi aynen uygulanır, ama tedavisi Medicine yerine Cybertech'tir.</td></tr>
                <tr><td>Suya düşmek, büyük bir elektrik çarpması gibi durumlar (GM önerisi)</td><td>Kalıcı</td><td>Tamir gerekir</td></tr>
                <tr><td>EMP, quickhack gibi elektronik saldırılar</td><td>Geçici</td><td>1d6 tur sonra kendiliğinden düzelir (GM önerisi)</td></tr>
              </tbody>
            </table>
            <p><strong>Tamir:</strong> Ripperdoc gerekmez. Bir saat sürer ve kromun ağırlığına göre DV'ye karşı <strong>Cybertech</strong> atılır. Başarısız olunursa bir saat sonra tekrar denenebilir.</p>
            <div class="example"><b>Örnek</b><p>Humanity kaybı 4 olan bir krom göz hafif kromdur; arızalanırsa Cybertech DV 8 ile tamir edilir. Humanity kaybı 12 olan bir Sandevistan ağır kromdur; tamiri DV 14 ister.</p></div>
          `,
          en: `
            <p><strong>Chrome</strong> (cyberware) is cybernetic hardware installed in the body. Ripperdocs install chrome.</p>
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
                <tr><td>11 and up</td><td>Heavy</td><td>14</td></tr>
              </tbody>
            </table>
            <p>Activating chrome that needs to be switched on is a bonus action. <span class="draft">Draft</span></p>
            <p><strong>Malfunctions:</strong> malfunctioning chrome doesn't work until repaired; its passive and active effects stop. Since it's still installed, its Humanity loss stays.</p>
            <table class="rules">
              <thead><tr><th>Cause</th><th>Malfunction</th><th>Recovery</th></tr></thead>
              <tbody>
                <tr><td>A critical injury to a chromed area</td><td>Lasting</td><td>Needs repair. The injury's effect applies as normal, but it's treated with Cybertech instead of Medicine.</td></tr>
                <tr><td>Falling into water, a big electric shock and the like (GM suggestion)</td><td>Lasting</td><td>Needs repair</td></tr>
                <tr><td>Electronic attacks such as EMP or quickhacks</td><td>Temporary</td><td>Recovers on its own after 1d6 rounds (GM suggestion)</td></tr>
              </tbody>
            </table>
            <p><strong>Repair:</strong> no ripperdoc needed. It takes an hour and a <strong>Cybertech</strong> roll against the DV for the chrome's weight. On a failure, it can be tried again an hour later.</p>
            <div class="example"><b>Example</b><p>A cybereye with Humanity loss 4 is light chrome; if it malfunctions, it's repaired with Cybertech against DV 8. A Sandevistan with Humanity loss 12 is heavy chrome; repairing it needs DV 14.</p></div>
          `,
        },
      },
    ],
  },

  "rulebook/statlar-skiller": {
    intro: {
      tr: `
        <p>Bir karakterin neyi ne kadar iyi yapabildiğini statları ve skill'leri belirler. Statlar karakterin temel yeteneklerini, skill'ler ise bu yeteneklerle yapılan işleri gösterir. Atışlarda skill değeri kullanılır.</p>
        <p><strong>Perception</strong> çevreyi okur, <strong>Insight</strong> insanları okur.</p>
      `,
      en: `
        <p>A character's stats and skills decide what they can do and how well. Stats are the character's basic abilities; skills are the things done with those abilities. Rolls use the skill value.</p>
        <p><strong>Perception</strong> reads the surroundings, <strong>Insight</strong> reads people.</p>
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
            <p><strong>EMP</strong> (Empati) skill vermeyen bir değerdir. Herkeste <strong>10</strong> ile başlar ve karakter oluştururken point buy puanlarıyla artırılabilir.</p>
            <p>EMP, karakterin Humanity değerini belirler.</p>
          `,
          en: `
            <p><strong>EMP</strong> (Empathy) is a value that grants no skills. It starts at <strong>10</strong> for everyone and can be raised with point buy points during character creation.</p>
            <p>EMP determines the character's Humanity.</p>
          `,
        },
      },
      {
        id: "int",
        label: { tr: "INT Skill'leri", en: "INT Skills" },
        body: {
          tr: `
            <p>INT (Zekâ): algı, bilgi, sokak zekâsı ve hacking.</p>
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
            <p>INT (Intelligence): perception, knowledge, street smarts and hacking.</p>
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
            <p>REF (Refleks): tepki hızı ve el-göz koordinasyonu: ateşli silahlar, sürüş ve inisiyatif.</p>
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
            <p>REF (Reflexes): reaction speed and hand-eye coordination: firearms, driving and initiative.</p>
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
            <p>DEX (Çeviklik): vücut çevikliği: hareket, gizlilik, kaçınma ve yakın dövüş silahları.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Kullanımı</th></tr></thead>
              <tbody>
                <tr><td>Athletics (Atletizm)</td><td>Tırmanmak, atlamak, koşmak, yüzmek.</td></tr>
                <tr><td>Stealth (Gizlilik)</td><td>Gizlenmek, sessizce hareket etmek, pusu kurmak.</td></tr>
                <tr><td>Evasion (Kaçınma)</td><td>Yakın dövüş saldırılarından ve mermilerden kaçınmak.</td></tr>
                <tr><td>Melee Weapons (Dövüş Silahları)</td><td>Bıçak, katana, Mantis Blades gibi yakın dövüş silahlarını kullanmak.</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>DEX (Dexterity): bodily agility: movement, stealth, evasion and melee weapons.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Used for</th></tr></thead>
              <tbody>
                <tr><td>Athletics</td><td>Climbing, jumping, running, swimming.</td></tr>
                <tr><td>Stealth</td><td>Hiding, moving quietly, setting ambushes.</td></tr>
                <tr><td>Evasion</td><td>Avoiding melee attacks and bullets.</td></tr>
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
            <p>TECH (Teknik): cihazlar, krom, tıp ve zanaat.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Kullanımı</th></tr></thead>
              <tbody>
                <tr><td>Hardware (Donanım)</td><td>Elle takılan cihazlarla hack yapmak: kapı panelleri, kart okuyucular, kameralar, alarmlar, bomba imha. İnsanlara ve kroma etki etmez.</td></tr>
                <tr><td>Cybertech (Siber Teknik)</td><td>Kromu anlamak, bakımını ve tamirini yapmak.</td></tr>
                <tr><td>Medicine (Tıp)</td><td>Stabilize etmek, ilk yardım ve tedavi.</td></tr>
                <tr><td>Craft (Zanaat)</td><td>Silah, zırh, mermi ve eşya yapmak, modifiye etmek ve tamir etmek. Mekanik kilitler de bu skill'le açılır.</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>TECH (Technique): devices, chrome, medicine and craft.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Used for</th></tr></thead>
              <tbody>
                <tr><td>Hardware</td><td>Hacking with handheld devices: door panels, card readers, cameras, alarms, bomb disposal. Never affects people or chrome.</td></tr>
                <tr><td>Cybertech</td><td>Understanding, maintaining and repairing chrome.</td></tr>
                <tr><td>Medicine</td><td>Stabilizing, first aid and treatment.</td></tr>
                <tr><td>Craft</td><td>Making, modifying and repairing weapons, armor, ammo and gear. Mechanical locks are also opened with this skill.</td></tr>
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
            <p>COOL (Soğukkanlılık): karizma ve baskı altında sakin kalmak: ikna, aldatma, gözdağı ve sahne.</p>
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
            <p>COOL (Cool): charisma and keeping calm under pressure: persuasion, deception, intimidation and performance.</p>
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
            <p>WILL (İrade): zihinsel güç: odak, sezgi, direnç ve hayatta kalma.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Kullanımı</th></tr></thead>
              <tbody>
                <tr><td>Concentration (Konsantrasyon)</td><td>Uzun süren bir işte dikkat dağıtıcılara karşı odağı korumak.</td></tr>
                <tr><td>Insight (Sezgi)</td><td>İnsanları okumak: niyetini, yalanını, duygusunu sezmek.</td></tr>
                <tr><td>Mental Resist (Mental Direnç)</td><td>Korkuya, baskıya ve zihinsel etkilere direnmek.</td></tr>
                <tr><td>Survival (Hayatta Kalma)</td><td>Zor koşullarda yolunu bulmak: iz sürmek, barınak ve yön bulmak.</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>WILL (Willpower): mental strength: focus, intuition, resistance and survival.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Used for</th></tr></thead>
              <tbody>
                <tr><td>Concentration</td><td>Keeping focus on a long task despite distractions.</td></tr>
                <tr><td>Insight</td><td>Reading people: sensing their intent, lies and feelings.</td></tr>
                <tr><td>Mental Resist</td><td>Resisting fear, pressure and mental effects.</td></tr>
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
            <p>BODY (Beden): güç ve dayanıklılık. Maksimum HP'yi belirler.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Kullanımı</th></tr></thead>
              <tbody>
                <tr><td>Brawling (Kavga)</td><td>Çıplak elle dövüşmek.</td></tr>
                <tr><td>Endurance (Dayanıklılık)</td><td>Yorgunluğa, uykusuzluğa, açlığa ve acıya dayanmak.</td></tr>
                <tr><td>Resist Toxin (Toksin Direnci)</td><td>Zehirlere, uyuşturuculara ve toksinlere direnmek.</td></tr>
                <tr><td>Strength (Güç)</td><td>Kaldırmak, itmek, kapı kırmak.</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>BODY (Body): strength and toughness. Determines max HP.</p>
            <table class="rules skills">
              <thead><tr><th lang="en">Skill</th><th>Used for</th></tr></thead>
              <tbody>
                <tr><td>Brawling</td><td>Fighting barehanded.</td></tr>
                <tr><td>Endurance</td><td>Withstanding fatigue, sleeplessness, hunger and pain.</td></tr>
                <tr><td>Resist Toxin</td><td>Resisting poisons, drugs and toxins.</td></tr>
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

  "araclar/stat-dagitma": {
    intro: {
      tr: `
        <p>Statlar point buy ile belirlenir. Her stat <strong>8</strong>'den başlar ve <strong>29</strong> puan harcanarak artırılabilir. Stat yükseldikçe her adımın maliyeti artar. <span class="draft">Taslak</span></p>
        <p>EMP herkeste 10'dan başlar ve istenirse aynı puanlarla artırılabilir.</p>
      `,
      en: `
        <p>Stats are set with point buy. Every stat starts at <strong>8</strong> and can be raised by spending <strong>29</strong> points. The higher a stat goes, the more each step costs. <span class="draft">Draft</span></p>
        <p>EMP starts at 10 for everyone and can be raised with the same points if desired.</p>
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

  "rulebook/seviye-ilerlemesi": {
    intro: {
      tr: `
        <p>Karakterler genelde 1. seviyede başlar; GM isterse daha yüksek bir seviyeden başlatabilir. En yüksek seviye 12'dir.</p>
      `,
      en: `
        <p>Characters usually start at level 1, though the GM can start them at a higher level. The highest level is 12.</p>
      `,
    },
    sections: [
      {
        id: "ne-zaman",
        label: { tr: "Ne Zaman Seviye Atlanır", en: "When to Level Up" },
        body: {
          tr: `
            <p>Seviye atlamanın zamanına GM karar verir. GM, hikâyeye uyan yolu seçer:</p>
            <ul>
              <li><strong>Önemli aşamalar:</strong> Hikâyenin önemli bir aşaması tamamlandığında seviye atlanır. Örneğin büyük bir iş bittiğinde ya da ekibin peşindeki bir düşman alt edildiğinde.</li>
              <li><strong>Oturum sayısı:</strong> Belirli sayıda oturum tamamlandığında seviye atlanır. Örneğin her üç oturumda bir.</li>
            </ul>
          `,
          en: `
            <p>The GM decides when characters level up, choosing whichever way suits the campaign:</p>
            <ul>
              <li><strong>Milestones:</strong> Characters level up when an important stage of the campaign is completed. For example, when a big job is done or an enemy hunting the crew is taken down.</li>
              <li><strong>Session count:</strong> Characters level up after a set number of sessions. For example, every three sessions.</li>
            </ul>
          `,
        },
      },
      {
        id: "kazanimlar",
        label: { tr: "Seviye Atlayınca", en: "On Leveling Up" },
        body: {
          tr: `
            <p>Her seviyede kazanılanlar, <a href="#players-guide/roller">Oyuncu Rehberi › Sınıflar</a> sayfasında her sınıfın kendi seviye listesinde yazar.</p>
            <ul>
              <li>HP seviyeyle artmaz.</li>
              <li>Feat puanları hemen harcanmak zorunda değildir; biriktirilebilir.</li>
            </ul>
          `,
          en: `
            <p>What each level grants is listed on the <a href="#players-guide/roller">Player's Guide › Roles</a> page, in each role's own level list.</p>
            <ul>
              <li>HP does not increase with level.</li>
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
        <p>Savaş turlara bölünür. Her turda her karakter sırası geldiğinde bir kez oynar ve turunda belirli sayıda iş yapabilir.</p>
      `,
      en: `
        <p>Combat is split into rounds. Each round, every character acts once on their turn and can do a set number of things on it.</p>
      `,
    },
    sections: [
      {
        id: "tur",
        label: { tr: "Bir Tur", en: "A Turn" },
        body: {
          tr: `
            <p>Her karakterin turunda şunlar vardır:</p>
            <ul>
              <li><strong>1 Aksiyon:</strong> saldırı, reload, stabilize gibi asıl iş.</li>
              <li><strong>1 Bonus aksiyon:</strong> kısa ve hızlı bir iş.</li>
              <li><strong>Hareket:</strong> 12 metreye (6 kare) kadar yürümek.</li>
              <li><strong>1 Reaction:</strong> başkasının turunda, bir şeye tepki olarak kullanılır. Bir sonraki tura kadar yenilenmez.</li>
            </ul>
            <p>Bonus aksiyon <strong>hiçbir zaman saldırı için kullanılamaz.</strong></p>
          `,
          en: `
            <p>On each character's turn there is:</p>
            <ul>
              <li><strong>1 Action:</strong> the main thing, such as attacking, reloading or stabilizing.</li>
              <li><strong>1 Bonus action:</strong> something short and quick.</li>
              <li><strong>Movement:</strong> walking up to 12 meters (6 squares).</li>
              <li><strong>1 Reaction:</strong> used on someone else's turn, in response to something. It does not come back until the next round.</li>
            </ul>
            <p>A bonus action can <strong>never be used to attack.</strong></p>
          `,
        },
      },
      {
        id: "maliyetler",
        label: { tr: "Eylemlerin Maliyeti", en: "Action Costs" },
        body: {
          tr: `
            <table class="rules">
              <thead><tr><th>Eylem</th><th>Maliyet</th></tr></thead>
              <tbody>
                <tr><td>Kısa bir şey söylemek</td><td>Bedava</td></tr>
                <tr><td>Bir dosta bir şey söyleyip cevap almak</td><td>Bonus aksiyon</td></tr>
                <tr><td>Zar gerektiren sosyal hamle (tehdit, blöf)</td><td>Bonus aksiyon</td></tr>
                <tr><td>Saldırı</td><td>Aksiyon</td></tr>
                <tr><td>Reload</td><td>Aksiyon</td></tr>
                <tr><td>Aimed Shot</td><td>Aksiyon + Bonus aksiyon, dezavantajlı</td></tr>
                <tr><td>Koşmak: 12 metre ilave koşma mesafesi</td><td>Aksiyon <span class="draft">Taslak</span></td></tr>
                <tr><td>Mermiden kaçmak</td><td>Reaction (tur başına bir kez)</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <table class="rules">
              <thead><tr><th>Action</th><th>Cost</th></tr></thead>
              <tbody>
                <tr><td>Saying something short</td><td>Free</td></tr>
                <tr><td>Telling an ally something and getting an answer</td><td>Bonus action</td></tr>
                <tr><td>A social move that needs a roll (threat, bluff)</td><td>Bonus action</td></tr>
                <tr><td>Attack</td><td>Action</td></tr>
                <tr><td>Reload</td><td>Action</td></tr>
                <tr><td>Aimed Shot</td><td>Action + Bonus action, with disadvantage</td></tr>
                <tr><td>Running: 12 meters of extra running distance</td><td>Action <span class="draft">Draft</span></td></tr>
                <tr><td>Dodging bullets</td><td>Reaction (once per round)</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "bonus-aksiyon",
        label: { tr: "Bonus Aksiyonlar", en: "Bonus Actions" },
        body: {
          tr: `
            <p>Bonus aksiyonla yapılabilecek işler: <span class="draft">Taslak</span></p>
            <ul>
              <li>Silah çekmek ya da değiştirmek</li>
              <li>Injector kullanmak</li>
              <li>Krom aktive etmek</li>
              <li>Siper almak</li>
            </ul>
          `,
          en: `
            <p>Things that can be done as a bonus action: <span class="draft">Draft</span></p>
            <ul>
              <li>Drawing or switching a weapon</li>
              <li>Using an injector</li>
              <li>Activating chrome</li>
              <li>Taking cover</li>
            </ul>
          `,
        },
      },
    ],
  },

  "rulebook/savas": {
    intro: {
      tr: `
        <p>Cyberpunk Green'de savaş hızlı ve ölümcüldür. HP seviyeyle artmaz; zırh, siper ve doğru konum hayatta kalmanın asıl yoludur.</p>
      `,
      en: `
        <p>Combat in Cyberpunk Green is fast and lethal. HP does not grow with level; armor, cover and good positioning are what keep a character alive.</p>
      `,
    },
    sections: [
      {
        id: "inisiyatif",
        label: { tr: "İnisiyatif", en: "Initiative" },
        body: {
          tr: `
            <p>Savaş başlarken herkes inisiyatif atar. Turlar en yüksek sonuçtan en düşüğe doğru oynanır. Bir tur yaklaşık <strong>3 saniye</strong> sürer.</p>
            <div class="formula">d10 + REF modifier</div>
          `,
          en: `
            <p>When combat starts, everyone rolls initiative. Turns go from the highest result to the lowest. A round lasts about <strong>3 seconds</strong>.</p>
            <div class="formula">d10 + REF modifier</div>
          `,
        },
      },
      {
        id: "savunma",
        label: { tr: "Savunma", en: "Defense" },
        body: {
          tr: `
            <p><strong>Yakın dövüş:</strong> Saldırana karşı savunan bedava bir Evasion atışı yapar ve iki sonuç karşılaştırılır. Eşitlikte savunan kazanır.</p>
            <p><strong>Ateşli silahlar:</strong> Saldıran, menzile göre belirlenen DV'ye karşı atar. Hedef isterse <strong>Reaction</strong> harcayıp Evasion atabilir. Silaha göre bu atışa eksi uygulanır. Sonuç menzil DV'sinden yüksekse saldırının yeni DV'si olur.</p>
            <p>Reaction tur başına bir kez kullanılabildiği için mermiden kaçmak da <strong>tur başına yalnızca bir kez</strong> yapılabilir.</p>
            <table class="rules">
              <thead><tr><th>Saldıran silah</th><th><span lang="en">Evasion</span> eksisi <span class="draft">Taslak</span></th></tr></thead>
              <tbody>
                <tr><td>Handgun</td><td>−2</td></tr>
                <tr><td>Shoulder Arms</td><td>−4</td></tr>
                <tr><td>Heavy Weapons</td><td>−6</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p><strong>Melee:</strong> The defender makes a free Evasion roll against the attacker, and the two results are compared. The defender wins ties.</p>
            <p><strong>Firearms:</strong> The attacker rolls against a DV set by range. The target may spend their <strong>Reaction</strong> to roll Evasion, with a penalty based on the weapon. If the result is higher than the range DV, it becomes the attack's new DV.</p>
            <p>Since a Reaction can be used only once per round, dodging bullets can also be done <strong>only once per round</strong>.</p>
            <table class="rules">
              <thead><tr><th>Attacking weapon</th><th>Evasion penalty <span class="draft">Draft</span></th></tr></thead>
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
        id: "harita",
        label: { tr: "Harita ve Hareket", en: "Map & Movement" },
        body: {
          tr: `
            <ul>
              <li>Haritada 1 kare <strong>2 metre</strong>dir.</li>
              <li>Herkesin temel hareketi <strong>12 metre</strong>dir (6 kare).</li>
              <li>Çapraz hareket de 1 kare sayılır.</li>
            </ul>
            <p><strong>Zorlu arazi:</strong> Enkaz, kalabalık, sığ su, kaygan zemin ya da çalılık gibi zorlu arazide her kare <strong>2 kare</strong> hareket harcar.</p>
            <p><strong>Tırmanma:</strong> Tırmanırken her kare <strong>2 kare</strong> hareket harcar. Merdiven, ip ya da bol tutunacak yeri olan kolay yüzeylerde zar gerekmez. Zor yüzeylerde <strong>Athletics</strong> atılır:</p>
            <table class="rules">
              <thead><tr><th>Yüzey</th><th>DV</th></tr></thead>
              <tbody>
                <tr><td>Tuğla duvar, çit</td><td>8</td></tr>
                <tr><td>Pürüzsüz duvar, yağmurda kaygan yüzey</td><td>11</td></tr>
                <tr><td>Cam cephe, düz metal</td><td>14</td></tr>
              </tbody>
            </table>
            <p>Başarısız olan o tur ilerleyemez. Doğal 1 gelirse düşer.</p>
            <p><strong>Düşme:</strong></p>
            <ul>
              <li>İlk <strong>4 metre</strong> (2 kare) hasarsızdır.</li>
              <li>Sonrasında her <strong>2 metre</strong> için <strong>1d6</strong> hasar alınır, en fazla <strong>10d6</strong>.</li>
              <li>Düşme hasarında zırh işe yaramaz.</li>
              <li>Düşen kişi <strong>Athletics DV 11</strong> atabilir; başarılı olursa yuvarlanarak düşer ve hasarı yarıya indirir.</li>
              <li>Kritik yara kuralı aynen çalışır; isabet bölgesi bacak sayılır ve Uzuv tablosunda atılır.</li>
            </ul>
            <div class="example"><b>Örnek</b><p>10 metreden düşen biri 3d6 hasar alır. Athletics'te başarılı olursa hasar yarıya iner.</p></div>
          `,
          en: `
            <ul>
              <li>One square on the map is <strong>2 meters</strong>.</li>
              <li>Everyone's base movement is <strong>12 meters</strong> (6 squares).</li>
              <li>Moving diagonally also counts as 1 square.</li>
            </ul>
            <p><strong>Difficult terrain:</strong> in difficult terrain such as rubble, crowds, shallow water, slick floors or brush, every square costs <strong>2 squares</strong> of movement.</p>
            <p><strong>Climbing:</strong> while climbing, every square costs <strong>2 squares</strong> of movement. Easy surfaces like ladders, ropes or surfaces with plenty of handholds need no roll. Hard surfaces need an <strong>Athletics</strong> roll:</p>
            <table class="rules">
              <thead><tr><th>Surface</th><th>DV</th></tr></thead>
              <tbody>
                <tr><td>Brick wall, fence</td><td>8</td></tr>
                <tr><td>Smooth wall, surface slick with rain</td><td>11</td></tr>
                <tr><td>Glass facade, flat metal</td><td>14</td></tr>
              </tbody>
            </table>
            <p>On a failure, no progress is made that turn. On a natural 1, the climber falls.</p>
            <p><strong>Falling:</strong></p>
            <ul>
              <li>The first <strong>4 meters</strong> (2 squares) deal no damage.</li>
              <li>After that, <strong>1d6</strong> damage for every <strong>2 meters</strong>, up to <strong>10d6</strong>.</li>
              <li>Armor doesn't help against falling damage.</li>
              <li>The falling character can roll <strong>Athletics against DV 11</strong>; on a success they roll with the fall and halve the damage.</li>
              <li>The critical injury rule applies as normal; the hit location counts as a leg and is rolled on the Limb table.</li>
            </ul>
            <div class="example"><b>Example</b><p>Someone who falls 10 meters takes 3d6 damage. With a successful Athletics roll, the damage is halved.</p></div>
          `,
        },
      },
      {
        id: "menzil",
        label: { tr: "Menzil", en: "Range" },
        body: {
          tr: `
            <table class="rules">
              <thead><tr><th>Mesafe</th><th>Kare</th><th>Metre</th></tr></thead>
              <tbody>
                <tr><td>Yakın</td><td>1–3</td><td>0–6 m</td></tr>
                <tr><td>Orta</td><td>4–12</td><td>8–24 m</td></tr>
                <tr><td>Uzak</td><td>13–50</td><td>26–100 m</td></tr>
                <tr><td>Çok uzak</td><td>51+</td><td>100 m+</td></tr>
              </tbody>
            </table>
            <p>Her silahın bir <strong>ideal mesafesi</strong> vardır. İdeal mesafede DV <strong>8</strong>'dir. İdeal mesafeden yakına ya da uzağa doğru her adımda DV <strong>3</strong> artar: 11, 14, 17.</p>
            <p>Her silahın ideal mesafesi, o silahın bilgilerinde yazar.</p>
            <table class="rules">
              <thead><tr><th>Örnek silah</th><th>İdeal mesafe</th></tr></thead>
              <tbody>
                <tr><td>Tabanca, SMG, pompalı</td><td>Yakın</td></tr>
                <tr><td>Saldırı tüfeği</td><td>Orta</td></tr>
                <tr><td>Keskin nişancı tüfeği</td><td>Uzak</td></tr>
              </tbody>
            </table>
            <div class="example"><b>Örnek</b><p>İdeal mesafesi Uzak olan bir keskin nişancı tüfeğiyle Uzak mesafedeki bir hedefe DV 8, Orta mesafedekine DV 11, Yakın mesafedekine DV 14.</p></div>
          `,
          en: `
            <table class="rules">
              <thead><tr><th>Distance</th><th>Squares</th><th>Meters</th></tr></thead>
              <tbody>
                <tr><td>Close</td><td>1–3</td><td>0–6 m</td></tr>
                <tr><td>Medium</td><td>4–12</td><td>8–24 m</td></tr>
                <tr><td>Long</td><td>13–50</td><td>26–100 m</td></tr>
                <tr><td>Extreme</td><td>51+</td><td>100 m+</td></tr>
              </tbody>
            </table>
            <p>Every weapon has an <strong>ideal range</strong>. At its ideal range the DV is <strong>8</strong>. Each step closer or farther than the ideal range adds <strong>3</strong> to the DV: 11, 14, 17.</p>
            <p>Each weapon's ideal range is listed in that weapon's details.</p>
            <table class="rules">
              <thead><tr><th>Example weapon</th><th>Ideal range</th></tr></thead>
              <tbody>
                <tr><td>Pistol, SMG, shotgun</td><td>Close</td></tr>
                <tr><td>Assault rifle</td><td>Medium</td></tr>
                <tr><td>Sniper rifle</td><td>Long</td></tr>
              </tbody>
            </table>
            <div class="example"><b>Example</b><p>With a sniper rifle whose ideal range is Long, a target at Long range is DV 8, at Medium range DV 11, at Close range DV 14.</p></div>
          `,
        },
      },
      {
        id: "siper",
        label: { tr: "Siper", en: "Cover" },
        body: {
          tr: `
            <ul>
              <li><strong>Kısmi siper:</strong> Saldırının DV'si <strong>+2</strong> artar. Saldırı bu +2 yüzünden ıskaladıysa kurşun sipere isabet eder.</li>
              <li><strong>Tam siper:</strong> Hedef görünmez. Saldırı sipere yapılır ve otomatik isabet eder.</li>
              <li>HP'si 0'a düşen siper yok olur. <strong>Fazla hasar</strong> arkadaki kişiye gövde isabeti olarak geçer.</li>
              <li>Siperden geçen hasar kritik yara açmaz. <span class="draft">Taslak</span></li>
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
            <ul>
              <li><strong>Partial cover:</strong> The attack's DV goes up by <strong>+2</strong>. If the attack missed because of that +2, the bullet hits the cover.</li>
              <li><strong>Full cover:</strong> The target cannot be seen. The attack is made against the cover and hits automatically.</li>
              <li>Cover that drops to 0 HP is destroyed. <strong>Excess damage</strong> passes to the person behind it as a body hit.</li>
              <li>Damage that passes through cover does not cause critical injuries. <span class="draft">Draft</span></li>
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
        id: "hasar",
        label: { tr: "Hasar", en: "Damage" },
        body: {
          tr: `
            <p>Hasar d6'larla atılır. Hasardan hedefin zırhı (SP) çıkarılır, kalan HP'den düşer.</p>
            <p>Her silahın hasarı, o silahın bilgilerinde yazar.</p>
            <table class="rules">
              <thead><tr><th lang="en">Skill</th><th>Örnek silah</th><th>Hasar</th></tr></thead>
              <tbody>
                <tr><td>Handgun</td><td>Orta tabanca, SMG</td><td>2d6</td></tr>
                <tr><td>Handgun</td><td>Ağır tabanca, ağır SMG</td><td>3d6</td></tr>
                <tr><td>Handgun</td><td>Çok ağır tabanca</td><td>4d6</td></tr>
                <tr><td>Shoulder Arms</td><td>Pompalı, saldırı tüfeği, keskin nişancı tüfeği</td><td>5d6</td></tr>
                <tr><td>Athletics</td><td>El bombası</td><td>5d6</td></tr>
                <tr><td>Heavy Weapons</td><td>Bomba atar</td><td>5d6</td></tr>
                <tr><td>Heavy Weapons</td><td>Roketatar</td><td>8d6</td></tr>
              </tbody>
            </table>
            <p>Yakın dövüş silahları dört kademeye ayrılır: Hafif 1d6, Orta 2d6, Ağır 3d6, Çok ağır 4d6.</p>
            <table class="rules">
              <thead><tr><th>Örnek silah</th><th>Kademe</th><th>Hasar</th></tr></thead>
              <tbody>
                <tr><td>Bıçak, muşta</td><td>Hafif</td><td>1d6</td></tr>
                <tr><td>Sopa, kısa kılıç, katana</td><td>Orta</td><td>2d6</td></tr>
                <tr><td>Balyoz, ağır balta</td><td>Ağır</td><td>3d6</td></tr>
                <tr><td>Mantis Blades</td><td>Ağır</td><td>3d6</td></tr>
                <tr><td>Monowire, Wolvers</td><td>Orta</td><td>2d6</td></tr>
              </tbody>
            </table>
            <p><strong>Yumruk hasarı</strong> BODY'ye göre belirlenir. Yumruklar <strong>ROF 2</strong>'dir: bir aksiyonda iki yumruk atılır.</p>
            <table class="rules">
              <thead><tr><th lang="en">BODY</th><th>Yumruk hasarı</th></tr></thead>
              <tbody>
                <tr><td>3–9</td><td>1d6</td></tr>
                <tr><td>10–13</td><td>2d6</td></tr>
                <tr><td>14–17</td><td>3d6</td></tr>
                <tr><td>18–20</td><td>4d6</td></tr>
              </tbody>
            </table>
            <div class="example"><b>Örnek</b><p>Bir saldırı tüfeği 5d6 hasar veriyor ve zarlardan toplam 18 geliyor. Hedefin zırhı SP 7. Hedef 18 − 7 = 11 HP kaybeder.</p></div>
          `,
          en: `
            <p>Damage is rolled in d6s. The target's armor (SP) is subtracted from the damage, and the rest comes off their HP.</p>
            <p>Each weapon's damage is listed in that weapon's details.</p>
            <table class="rules">
              <thead><tr><th lang="en">Skill</th><th>Example weapon</th><th>Damage</th></tr></thead>
              <tbody>
                <tr><td>Handgun</td><td>Medium pistol, SMG</td><td>2d6</td></tr>
                <tr><td>Handgun</td><td>Heavy pistol, heavy SMG</td><td>3d6</td></tr>
                <tr><td>Handgun</td><td>Very heavy pistol</td><td>4d6</td></tr>
                <tr><td>Shoulder Arms</td><td>Shotgun, assault rifle, sniper rifle</td><td>5d6</td></tr>
                <tr><td>Athletics</td><td>Grenade</td><td>5d6</td></tr>
                <tr><td>Heavy Weapons</td><td>Grenade launcher</td><td>5d6</td></tr>
                <tr><td>Heavy Weapons</td><td>Rocket launcher</td><td>8d6</td></tr>
              </tbody>
            </table>
            <p>Melee weapons come in four tiers: Light 1d6, Medium 2d6, Heavy 3d6, Very heavy 4d6.</p>
            <table class="rules">
              <thead><tr><th>Example weapon</th><th>Tier</th><th>Damage</th></tr></thead>
              <tbody>
                <tr><td>Knife, brass knuckles</td><td>Light</td><td>1d6</td></tr>
                <tr><td>Club, short sword, katana</td><td>Medium</td><td>2d6</td></tr>
                <tr><td>Sledgehammer, heavy axe</td><td>Heavy</td><td>3d6</td></tr>
                <tr><td>Mantis Blades</td><td>Heavy</td><td>3d6</td></tr>
                <tr><td>Monowire, Wolvers</td><td>Medium</td><td>2d6</td></tr>
              </tbody>
            </table>
            <p><strong>Punch damage</strong> depends on BODY. Fists are <strong>ROF 2</strong>: two punches in one action.</p>
            <table class="rules">
              <thead><tr><th>BODY</th><th>Punch damage</th></tr></thead>
              <tbody>
                <tr><td>3–9</td><td>1d6</td></tr>
                <tr><td>10–13</td><td>2d6</td></tr>
                <tr><td>14–17</td><td>3d6</td></tr>
                <tr><td>18–20</td><td>4d6</td></tr>
              </tbody>
            </table>
            <div class="example"><b>Example</b><p>An assault rifle deals 5d6 damage and the dice total 18. The target's armor is SP 7. The target loses 18 − 7 = 11 HP.</p></div>
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
                <tr><td>Çok ağır tabanca</td><td>1</td><td>8</td><td>—</td></tr>
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
              <li><strong>Reloading</strong> takes an action and uses one <strong>spare magazine</strong>. If you reload before the magazine is empty, the rounds left in the old magazine are lost.</li>
            </ul>
            <table class="rules">
              <thead><tr><th>Example weapon</th><th>ROF</th><th>Magazine</th><th>Autofire (max)</th></tr></thead>
              <tbody>
                <tr><td>Medium pistol</td><td>2</td><td>12</td><td>—</td></tr>
                <tr><td>Heavy pistol</td><td>2</td><td>8</td><td>—</td></tr>
                <tr><td>Very heavy pistol</td><td>1</td><td>8</td><td>—</td></tr>
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
            <p>Otomatik ateş açabilen silahlar (SMG, saldırı tüfeği gibi) tek seferde <strong>10 mermi</strong> harcayarak tek bir saldırı yapabilir. Şarjörde 10'dan az mermi varsa otomatik ateş yapılamaz; kalan mermiler tek tek atılır.</p>
            <ul>
              <li>Saldırı zarı normal menzil DV'sine karşı atılır.</li>
              <li>Başarılı olursa <strong>2d6</strong> atılır ve sonuç, saldırı zarının DV'yi <strong>geçtiği miktarla çarpılır</strong>. Zar sayısı artmaz.</li>
              <li>Çarpanın bir <strong>tavanı</strong> vardır ve silaha göre değişir: SMG için en fazla ×3, saldırı tüfeği için en fazla ×4. DV daha fazla geçilse bile çarpan bu tavanı aşmaz.</li>
              <li>Hedefin zırhı (SP), çarpılmış toplam hasardan bir kez çıkarılır.</li>
              <li>2d6'da iki 6 gelirse ve hasar SP'yi geçerse kritik yara oluşur.</li>
            </ul>
            <div class="example"><b>Örnek</b><p>Shoulder Arms değeri +5 olan bir karakter, saldırı tüfeğiyle DV 8'e karşı otomatik ateş açıyor. Zarda 6 geliyor: 6 + 5 = 11, DV 3 farkla geçiliyor. 2d6'da 7 geliyor: 7 × 3 = 21 hasar. Hedefin zırhı SP 7 olduğu için hedef 14 HP kaybediyor.</p></div>
          `,
          en: `
            <p>Weapons capable of autofire (such as SMGs and assault rifles) can spend <strong>10 bullets</strong> at once to make a single attack. If the magazine has fewer than 10 bullets, autofire isn't possible; the remaining rounds are fired one at a time.</p>
            <ul>
              <li>The attack roll is made against the normal range DV.</li>
              <li>On a success, <strong>2d6</strong> is rolled and the result is <strong>multiplied by how much the attack roll beat the DV</strong>. The number of dice doesn't change.</li>
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
            <p>Otomatik ateş açabilen bir silahla, saldırı yerine <strong>10 mermi</strong> harcanarak baskı ateşi açılabilir. Baskı ateşi hasar vermez; amacı düşmanı siperine sindirmektir.</p>
            <ul>
              <li>Ateş eden, silahının menzili içinde ve görüş hattında bir yer seçer. O noktadaki <strong>10 × 10 metrelik</strong> alan etkilenir.</li>
              <li>Alanda olup tam siperde olmayan herkes <strong>Mental Resist</strong> zarı atar, <strong>DV 11</strong>.</li>
              <li>Başarısız olan, bir sonraki turunda <strong>en yakın sipere kaçmak</strong> zorundadır.</li>
            </ul>
          `,
          en: `
            <p>A weapon capable of autofire can spend <strong>10 bullets</strong> on suppressive fire instead of an attack. Suppressive fire deals no damage; its purpose is to pin enemies down.</p>
            <ul>
              <li>The shooter picks a spot within the weapon's range and line of sight. A <strong>10 × 10 meter</strong> area at that spot is affected.</li>
              <li>Everyone in the area who isn't in full cover rolls <strong>Mental Resist</strong> against <strong>DV 11</strong>.</li>
              <li>Anyone who fails must <strong>flee to the nearest cover</strong> on their next turn.</li>
            </ul>
          `,
        },
      },
      {
        id: "patlayicilar",
        label: { tr: "Patlayıcılar", en: "Explosives" },
        body: {
          tr: `
            <ul>
              <li><strong>Atış:</strong> Patlayıcıyla bir kişi değil, bir kare hedeflenir. El bombası atmak için <strong>Athletics</strong>, bomba atar ve roketatar için <strong>Heavy Weapons</strong> atılır. DV menzile göre belirlenir.</li>
              <li><strong>Iska:</strong> Patlayıcı yine patlar. Nereye düştüğüne GM karar verir.</li>
              <li><strong>Alan:</strong> Patlama, hedeflenen kare ortada olmak üzere <strong>5 × 5 karelik</strong> (10 × 10 m) bir alanı etkiler.</li>
              <li><strong>Hasar:</strong> Alandaki herkes tam hasar alır. Hasar gövde isabeti sayılır; gövde zırhı normal işler.</li>
              <li><strong>Kritik yara:</strong> Patlama kritik yara açarsa yaranın yeri için <strong>1d6</strong> atılır: 1–2 Kafa, 3–4 Gövde, 5–6 Uzuv. Yara o bölgenin tablosundan belirlenir.</li>
              <li><strong>Kaçınma:</strong> Alandaki kişi Reaction harcayıp <strong>Evasion</strong> atabilir. Başarılı olursa patlamadan tamamen kurtulur. DV, patlamanın merkezine ne kadar yakın olduğuna göre belirlenir.</li>
              <li><strong>Siper:</strong> Tam siperin arkasındaki kişiye, patlama siperi yıkmadıkça hasar geçmez. Siper yıkılırsa fazla hasar arkadaki kişiye geçer. Kısmi siper patlamaya karşı korumaz.</li>
            </ul>
            <table class="rules">
              <thead><tr><th>Merkeze uzaklık</th><th><span lang="en">Evasion</span> DV</th></tr></thead>
              <tbody>
                <tr><td>Merkez kare</td><td>14</td></tr>
                <tr><td>1 kare</td><td>11</td></tr>
                <tr><td>2 kare (alanın kenarı)</td><td>8</td></tr>
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
            <p>El bombası en fazla Orta mesafeye atılabilir.</p>
            <div class="example"><b>Örnek</b><p>Bir el bombası üç kişilik bir grubun ortasına düşüyor. Merkez karedeki kişi DV 14'e, merkeze 1 kare uzaktaki DV 11'e, alanın kenarındaki DV 8'e karşı Evasion atar. Başaramayanlar 5d6 hasar alır.</p></div>
          `,
          en: `
            <ul>
              <li><strong>Attack:</strong> An explosive targets a square, not a person. Throwing a grenade uses <strong>Athletics</strong>; grenade launchers and rocket launchers use <strong>Heavy Weapons</strong>. The DV is set by range.</li>
              <li><strong>Miss:</strong> The explosive still goes off. The GM decides where it lands.</li>
              <li><strong>Area:</strong> The blast covers a <strong>5 × 5 square</strong> (10 × 10 m) area centered on the targeted square.</li>
              <li><strong>Damage:</strong> Everyone in the area takes full damage. The damage counts as a body hit; body armor works as normal.</li>
              <li><strong>Critical injury:</strong> If the blast causes a critical injury, roll <strong>1d6</strong> for its location: 1–2 Head, 3–4 Body, 5–6 Limb. The injury is taken from that location's table.</li>
              <li><strong>Evading:</strong> Anyone in the area can spend their Reaction to roll <strong>Evasion</strong>. On a success, they escape the blast completely. The DV depends on how close they are to the center of the blast.</li>
              <li><strong>Cover:</strong> Someone behind full cover takes no damage unless the blast destroys the cover. If the cover is destroyed, the excess damage passes to the person behind it. Partial cover gives no protection against explosions.</li>
            </ul>
            <table class="rules">
              <thead><tr><th>Distance from center</th><th>Evasion DV</th></tr></thead>
              <tbody>
                <tr><td>Center square</td><td>14</td></tr>
                <tr><td>1 square</td><td>11</td></tr>
                <tr><td>2 squares (edge of the area)</td><td>8</td></tr>
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
            <p>A grenade can be thrown no farther than Medium range.</p>
            <div class="example"><b>Example</b><p>A grenade lands in the middle of a group of three. The person in the center square rolls Evasion against DV 14, the one 1 square from the center against DV 11, and the one at the edge of the area against DV 8. Anyone who fails takes 5d6 damage.</p></div>
          `,
        },
      },
      {
        id: "bogusma",
        label: { tr: "Boğuşma", en: "Grappling" },
        body: {
          tr: `
            <p><strong>Yakalama</strong> bir aksiyondur. Hedef bitişikte olmalı ve yakalayanın en az bir eli boş olmalıdır. Yakalayan <strong>Brawling</strong> atar, hedef <strong>Evasion</strong> ile karşılık verir. Eşitlikte hedef kazanır.</p>
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
            <p><strong>İnsan kalkanı:</strong> Tutan, tutulanı kalkan gibi kullanabilir. Tutulan, tutana kısmi siper sağlar (+2 DV). Siper yüzünden ıskalayan saldırılar tutulana isabet eder.</p>
          `,
          en: `
            <p><strong>Grabbing</strong> takes an action. The target must be adjacent and the grabber needs at least one free hand. The grabber rolls <strong>Brawling</strong>, the target answers with <strong>Evasion</strong>. The target wins ties.</p>
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
            <p><strong>Human shield:</strong> the holder can use the held character as a shield. The held character gives the holder partial cover (+2 DV). Attacks that miss because of that cover hit the held character.</p>
          `,
        },
      },
      {
        id: "zirh",
        label: { tr: "Zırh", en: "Armor" },
        body: {
          tr: `
            <table class="rules">
              <thead><tr><th>Zırh</th><th>Örnek</th><th>SP</th><th>Ceza</th></tr></thead>
              <tbody>
                <tr><td>Hafif</td><td>Deri ceket, sokak giysisi</td><td>3</td><td>—</td></tr>
                <tr><td>Kevlar</td><td>Giysi altı kevlar</td><td>5</td><td>—</td></tr>
                <tr><td>Taktik</td><td>Hafif armorjack</td><td>7</td><td>—</td></tr>
                <tr><td>Ağır</td><td>Ağır armorjack</td><td>9</td><td>Evasion −2, hareket −2 m (1 kare) <span class="draft">Taslak</span></td></tr>
                <tr><td>Askerî</td><td>Metalgear, askerî zırh</td><td>11</td><td>Evasion −4, hareket −4 m (2 kare) <span class="draft">Taslak</span></td></tr>
              </tbody>
            </table>
            <ul>
              <li><strong>Aşınma:</strong> Zırha gelen her isabet, delinsin ya da delinmesin, SP'yi <strong>1</strong> düşürür.</li>
              <li><strong>Yakın dövüş:</strong> Hedefin SP'si yarı sayılır (yukarı yuvarlanır). Aşınma gerçek SP'den düşer.</li>
              <li>Kafa zırhı (kask) ayrı giyilir ve aynı tabloyu kullanır.</li>
            </ul>
            <div class="example"><b>Örnek</b><p>SP'si 11 olan bir zırh yakın dövüşte 6 sayılır. 7 hasarlık bir bıçak darbesinden HP'ye 1 hasar geçer ve zırhın SP'si 10'a düşer.</p></div>
          `,
          en: `
            <table class="rules">
              <thead><tr><th>Armor</th><th>Example</th><th>SP</th><th>Penalty</th></tr></thead>
              <tbody>
                <tr><td>Light</td><td>Leather jacket, streetwear</td><td>3</td><td>—</td></tr>
                <tr><td>Kevlar</td><td>Kevlar under clothing</td><td>5</td><td>—</td></tr>
                <tr><td>Tactical</td><td>Light armorjack</td><td>7</td><td>—</td></tr>
                <tr><td>Heavy</td><td>Heavy armorjack</td><td>9</td><td>Evasion −2, movement −2 m (1 square) <span class="draft">Draft</span></td></tr>
                <tr><td>Military</td><td>Metalgear, military armor</td><td>11</td><td>Evasion −4, movement −4 m (2 squares) <span class="draft">Draft</span></td></tr>
              </tbody>
            </table>
            <ul>
              <li><strong>Ablation:</strong> Every hit on armor, whether it penetrates or not, lowers its SP by <strong>1</strong>.</li>
              <li><strong>Melee:</strong> The target's SP counts as half (rounded up). Ablation comes off the real SP.</li>
              <li>Head armor (a helmet) is worn separately and uses the same table.</li>
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
            <p>Normal saldırılar her zaman <strong>gövdeye</strong> isabet eder.</p>
            <p><strong>Aimed Shot</strong> aksiyon ve bonus aksiyon birlikte harcanarak, dezavantajla atılır. Kafa, kol ya da bacak hedeflenebilir:</p>
            <table class="rules">
              <thead><tr><th>Bölge</th><th>Zırh</th><th>Zırhı delerse</th></tr></thead>
              <tbody>
                <tr><td>Kafa</td><td>Kafa SP</td><td>Hasar ×2</td></tr>
                <tr><td>Kol</td><td>Gövde SP</td><td>Normal hasar, hedef elindekini düşürür</td></tr>
                <tr><td>Bacak</td><td>Gövde SP</td><td>Normal hasar, hedefin hareketi bir sonraki turunun sonuna kadar yarıya iner</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>Normal attacks always hit the <strong>body</strong>.</p>
            <p>An <strong>Aimed Shot</strong> uses both the action and the bonus action and is rolled with disadvantage. It can target the head, an arm or a leg:</p>
            <table class="rules">
              <thead><tr><th>Location</th><th>Armor</th><th>If it penetrates</th></tr></thead>
              <tbody>
                <tr><td>Head</td><td>Head SP</td><td>Damage ×2</td></tr>
                <tr><td>Arm</td><td>Body SP</td><td>Normal damage, the target drops what they are holding</td></tr>
                <tr><td>Leg</td><td>Body SP</td><td>Normal damage, the target's movement is halved until the end of their next turn</td></tr>
              </tbody>
            </table>
          `,
        },
      },
      {
        id: "kritik",
        label: { tr: "Kritik Yara", en: "Critical Injuries" },
        body: {
          tr: `
            <p>Hasar zarlarında <strong>iki ya da daha fazla 6</strong> gelirse ve toplam hasar hedefin SP'sini geçerse <strong>kritik yara</strong> oluşur:</p>
            <ul>
              <li>Zırhı yok sayan <strong>+5</strong> bonus hasar verilir.</li>
              <li>İsabet bölgesinin tablosunda (Gövde, Kafa ya da Uzuv) <strong>1d8</strong> atılır ve çıkan yara karaktere eklenir.</li>
              <li>Yara mantıken artık eklenemiyorsa (örneğin iki göz de kaybedilmişse ya da aynı kol zaten kopmuşsa) zar yeniden atılır.</li>
              <li>Kritik yaralar kendi kendine geçmez; tablodaki tedaviyi gerektirir.</li>
            </ul>
            <p class="note">Zarın GM tarafından atılıp sonucun söylenmesi önerilir.</p>
            <p><strong>Tedavi türleri:</strong> Medicine DV 8 / DV 11 sahada ya da dinlenirken yapılabilir. Ameliyat için Surgery feat'i olan bir Medtech ya da bir ripperdoc gerekir. Kaybedilen uzuv ya da göz ancak protez veya kromla yerine konur.</p>
            <p><strong>Gövde</strong></p>
            <table class="rules crit">
              <thead><tr><th>d8</th><th>Yara</th><th>Etki</th><th>Tedavi</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Kırık Kaburgalar</td><td>Strength, Athletics ve Endurance zarlarına −2.</td><td>Medicine DV 11</td></tr>
                <tr><td>2</td><td>Yırtık Kas</td><td>Brawling ve Melee Weapons zarlarına −2.</td><td>Medicine DV 8</td></tr>
                <tr><td>3</td><td>Yabancı Cisim</td><td>Gece dinlenmesinde iyileşme yarıya iner.</td><td>Medicine DV 11</td></tr>
                <tr><td>4</td><td>Kırık Köprücük Kemiği</td><td>Two-Handed silahlarla saldırı zarları dezavantajlı.</td><td>Medicine DV 11</td></tr>
                <tr><td>5</td><td>İç Kanama</td><td>Durdurulana kadar her tur sonunda 1 HP kaybedilir. Durdurmak için bir aksiyonla Medicine DV 11 atılır.</td><td>Ameliyat</td></tr>
                <tr><td>6</td><td>Çökmüş Akciğer</td><td>Hareket yarıya iner, koşulamaz.</td><td>Ameliyat</td></tr>
                <tr><td>7</td><td>Delinmiş Organ</td><td>Maksimum HP −5.</td><td>Ameliyat</td></tr>
                <tr><td>8</td><td>Omurga Hasarı</td><td>Bir sonraki tur tamamen kaybedilir; sonrasında Evasion zarlarına −2.</td><td>Ameliyat</td></tr>
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
                <tr><td>5</td><td>Ezilmiş Gırtlak</td><td>Konuşulamaz; Endurance zarları dezavantajlı.</td><td>Ameliyat</td></tr>
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
                <tr><td>2</td><td>Derin Kesik</td><td>Durdurulana kadar her tur 1 HP kaybedilir.</td><td>Durdurulana kadar her tur 1 HP kaybedilir.</td><td>Medicine DV 8, bir aksiyon</td></tr>
                <tr><td>3</td><td>Ezilme</td><td>İki elli silah kullanılamaz.</td><td>Koşulamaz.</td><td>Medicine DV 8</td></tr>
                <tr><td>4</td><td>Kırık Kemik</td><td>O elle tutulan silahla saldırı zarları dezavantajlı.</td><td>Hareket yarıya iner.</td><td>Medicine DV 11</td></tr>
                <tr><td>5</td><td>Yabancı Cisim</td><td>Brawling ve Melee Weapons zarlarına −2.</td><td>Hareket −2 metre.</td><td>Medicine DV 11</td></tr>
                <tr><td>6</td><td>Yırtık Tendon</td><td>Eldeki düşürülür; Strength zarlarına −2.</td><td>Athletics zarları dezavantajlı.</td><td>Ameliyat</td></tr>
                <tr><td>7</td><td>Sinir Hasarı</td><td>O elle yapılan zarlara −2.</td><td>Evasion zarlarına −2.</td><td>Ameliyat</td></tr>
                <tr><td>8</td><td>Kopan Uzuv</td><td>Kol ya da el yoktur.</td><td>Hareket yarıya iner, koşulamaz.</td><td>Protez ya da krom</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>If the damage dice show <strong>two or more 6s</strong> and the total damage beats the target's SP, a <strong>critical injury</strong> happens:</p>
            <ul>
              <li><strong>+5</strong> bonus damage that ignores armor.</li>
              <li>Roll <strong>1d8</strong> on the table for the hit location (Body, Head or Limb) and add the injury to the character.</li>
              <li>If the injury can't logically be added anymore (for example both eyes are already lost, or that arm is already gone), reroll.</li>
              <li>Critical injuries don't heal on their own; they need the treatment listed in the table.</li>
            </ul>
            <p class="note">It's recommended that the GM rolls and announces the result.</p>
            <p><strong>Treatment types:</strong> Medicine DV 8 / DV 11 can be done in the field or during rest. Surgery needs a Medtech with the Surgery feat or a ripperdoc. A lost limb or eye can only be replaced with a prosthetic or chrome.</p>
            <p><strong>Body</strong></p>
            <table class="rules crit">
              <thead><tr><th>d8</th><th>Injury</th><th>Effect</th><th>Treatment</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Broken Ribs</td><td>−2 to Strength, Athletics and Endurance rolls.</td><td>Medicine DV 11</td></tr>
                <tr><td>2</td><td>Torn Muscle</td><td>−2 to Brawling and Melee Weapons rolls.</td><td>Medicine DV 8</td></tr>
                <tr><td>3</td><td>Foreign Object</td><td>Healing from a night's rest is halved.</td><td>Medicine DV 11</td></tr>
                <tr><td>4</td><td>Broken Collarbone</td><td>Attack rolls with Two-Handed weapons have disadvantage.</td><td>Medicine DV 11</td></tr>
                <tr><td>5</td><td>Internal Bleeding</td><td>Lose 1 HP at the end of every round until stopped. Stopping it takes an action and a Medicine roll against DV 11.</td><td>Surgery</td></tr>
                <tr><td>6</td><td>Collapsed Lung</td><td>Movement is halved; no running.</td><td>Surgery</td></tr>
                <tr><td>7</td><td>Punctured Organ</td><td>Max HP −5.</td><td>Surgery</td></tr>
                <tr><td>8</td><td>Spinal Injury</td><td>The next turn is lost entirely; afterwards, −2 to Evasion rolls.</td><td>Surgery</td></tr>
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
                <tr><td>5</td><td>Crushed Windpipe</td><td>Can't speak; Endurance rolls have disadvantage.</td><td>Surgery</td></tr>
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
                <tr><td>2</td><td>Deep Cut</td><td>Lose 1 HP every round until stopped.</td><td>Lose 1 HP every round until stopped.</td><td>Medicine DV 8, one action</td></tr>
                <tr><td>3</td><td>Crushing</td><td>Can't use two-handed weapons.</td><td>No running.</td><td>Medicine DV 8</td></tr>
                <tr><td>4</td><td>Broken Bone</td><td>Attack rolls with a weapon held in that hand have disadvantage.</td><td>Movement is halved.</td><td>Medicine DV 11</td></tr>
                <tr><td>5</td><td>Foreign Object</td><td>−2 to Brawling and Melee Weapons rolls.</td><td>Movement −2 meters.</td><td>Medicine DV 11</td></tr>
                <tr><td>6</td><td>Torn Tendon</td><td>Drops what it's holding; −2 to Strength rolls.</td><td>Athletics rolls have disadvantage.</td><td>Surgery</td></tr>
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
            <div class="formula">HP = 10 + 2 × BODY</div>
            <p>HP seviyeyle artmaz.</p>
            <table class="rules">
              <thead><tr><th>Durum</th><th>Ne zaman</th><th>Etkisi</th></tr></thead>
              <tbody>
                <tr><td>Ağır Yaralı</td><td>HP, maksimumun yarısının altına inince</td><td>Tüm atışlara −2</td></tr>
                <tr><td>Ölümcül Yaralı</td><td>HP 0 olunca (HP 0'ın altına inmez)</td><td>Bilinci açıkken skill atışlarına −4, hareket yarıya iner</td></tr>
              </tbody>
            </table>
            <p><strong>Ölüm kurtarma atışı</strong></p>
            <ul>
              <li>Ölümcül Yaralı karakter her turun başında <strong>d10 + BODY modifier</strong> ile <strong>DV 5</strong>'e karşı atar. Her başarıda DV 1 artar. Doğal 1 her zaman başarısızdır.</li>
              <li><strong>1. başarısızlık:</strong> Karakter bilincini kaybeder ve kendi turunda hiçbir şey yapamaz.</li>
              <li><strong>2. başarısızlık:</strong> Karakter ölür.</li>
              <li>Ölümcül Yaralı birine gelen <strong>yeni bir isabet</strong> otomatik olarak bir başarısızlık sayılır.</li>
            </ul>
          `,
          en: `
            <div class="formula">HP = 10 + 2 × BODY</div>
            <p>HP does not grow with level.</p>
            <table class="rules">
              <thead><tr><th>State</th><th>When</th><th>Effect</th></tr></thead>
              <tbody>
                <tr><td>Seriously Wounded</td><td>HP drops below half of maximum</td><td>−2 to all rolls</td></tr>
                <tr><td>Mortally Wounded</td><td>HP reaches 0 (HP never goes below 0)</td><td>While conscious, −4 to skill rolls and movement is halved</td></tr>
              </tbody>
            </table>
            <p><strong>Death saves</strong></p>
            <ul>
              <li>At the start of each turn, a Mortally Wounded character rolls <strong>d10 + BODY modifier</strong> against <strong>DV 5</strong>. Each success raises the DV by 1. A natural 1 always fails.</li>
              <li><strong>1st failure:</strong> The character falls unconscious and can do nothing on their turn.</li>
              <li><strong>2nd failure:</strong> The character dies.</li>
              <li>A <strong>new hit</strong> on a Mortally Wounded character counts as an automatic failure.</li>
            </ul>
          `,
        },
      },
      {
        id: "pusu",
        label: { tr: "Pusu ve Gafil Avlanma", en: "Ambush & Surprise" },
        body: {
          tr: `
            <p><strong>Pusu:</strong> Pusu kuran taraftaki herkes Stealth atar. <strong>En düşük sonuç</strong> pusunun DV'si olur. Hedefteki her karakter bu DV'ye karşı Perception atar; geçemeyen gafil avlanır.</p>
            <p><strong>Gafil avlanan karakter ilk turda:</strong></p>
            <ul>
              <li>Aksiyon ve bonus aksiyon kullanamaz.</li>
              <li>Hareketinin yalnızca 1/4'ünü kullanabilir (yukarı yuvarlanır).</li>
              <li>Mermiden kaçamaz.</li>
              <li>Yakın dövüşte Evasion'ı dezavantajla atar.</li>
            </ul>
            <p>İlk tur bitince her şey normale döner. İnisiyatif herkes için normal atılır.</p>
          `,
          en: `
            <p><strong>Ambush:</strong> Everyone on the ambushing side rolls Stealth. The <strong>lowest result</strong> becomes the ambush DV. Every character being ambushed rolls Perception against it; those who fail are surprised.</p>
            <p><strong>A surprised character, in the first round:</strong></p>
            <ul>
              <li>Cannot use their action or bonus action.</li>
              <li>Can use only 1/4 of their movement (rounded up).</li>
              <li>Cannot dodge bullets.</li>
              <li>Rolls Evasion in melee with disadvantage.</li>
            </ul>
            <p>After the first round, everything returns to normal. Initiative is rolled normally for everyone.</p>
          `,
        },
      },
      {
        id: "davranma",
        label: { tr: "Hızla Silaha Davranma", en: "Quick Draw" },
        body: {
          tr: `
            <p>Savaş başlamadan, karşılıklı konuşurken silaha davranmak için:</p>
            <ul>
              <li>Davranan <strong>d10 + DEX modifier</strong> atar. Onu görebilen her hedef ayrı ayrı <strong>d10 + DEX modifier</strong> ile karşılık verir. Eşitlikte hedef kazanır.</li>
              <li>Yavaşça ve gizlice davranılıyorsa DEX yerine <strong>Stealth</strong> atılabilir; hedefler de <strong>Perception</strong> ile karşılık verir.</li>
              <li><strong>Davranan kazanırsa</strong> o hedef gafil avlanmış sayılır.</li>
              <li><strong>Hedef kazanırsa</strong> gafil avlanmaz ve savaş normal inisiyatifle başlar. Hedef davranana bitişikse silahın çekilmesini engelleyebilir.</li>
              <li>İki taraf aynı anda davranırsa en yüksek sonuç önce oynar.</li>
              <li><strong>Two-Handed</strong> bir silahla davranmak dezavantajlıdır.</li>
            </ul>
          `,
          en: `
            <p>To go for a weapon before combat starts, in the middle of a conversation:</p>
            <ul>
              <li>The one drawing rolls <strong>d10 + DEX modifier</strong>. Every target who can see them answers separately with <strong>d10 + DEX modifier</strong>. The target wins ties.</li>
              <li>When drawing slowly and quietly, <strong>Stealth</strong> can be rolled instead of DEX; the targets answer with <strong>Perception</strong>.</li>
              <li><strong>If the one drawing wins</strong>, that target counts as surprised.</li>
              <li><strong>If the target wins</strong>, they are not surprised and combat starts with normal initiative. A target adjacent to the one drawing can stop the weapon from being drawn.</li>
              <li>If both sides draw at once, the highest result goes first.</li>
              <li>Drawing a <strong>Two-Handed</strong> weapon is done with disadvantage.</li>
            </ul>
          `,
        },
      },
    ],
  },

  "rulebook/iyilesme": {
    intro: {
      tr: `
        <p>Yaralar yavaş iyileşir. Savaşın ortasında HP yalnızca tüketilebilir eşyalarla geri gelir; asıl iyileşme dinlenerek olur.</p>
      `,
      en: `
        <p>Wounds heal slowly. In the middle of combat, HP comes back only through consumables; real healing happens through rest.</p>
      `,
    },
    sections: [
      {
        id: "stabilize",
        label: { tr: "Stabilize", en: "Stabilizing" },
        body: {
          tr: `
            <p>Ölümcül Yaralı birini kurtarmak için:</p>
            <ul>
              <li>Bir aksiyon harcanır ve <strong>DV 8</strong>'e karşı <strong>Medicine</strong> atılır.</li>
              <li>Medkit yoksa ve hastanın bir başarısızlığı varsa atış dezavantajlıdır.</li>
              <li>Bilinci açık Ölümcül Yaralı biri kendini dezavantajla stabilize edebilir.</li>
              <li>Stabilize olan karakter <strong>1 HP</strong> ile kalır; başarısızlıkları ve ölüm atışı DV'si sıfırlanır.</li>
              <li>Stabilize olan karakter aynı oturumda tekrar hasar alırsa <strong>bir başarısızlıkla</strong> yere düşer. Bu durum bir sonraki oturumda ya da tam bir gece uykusundan sonra geçer.</li>
            </ul>
            <p><strong>Baygınlık</strong></p>
            <ul>
              <li>Stabilize olan karakter ortalama <strong>6 saat</strong> baygın kalır.</li>
              <li>Aldığı her kritik yara bu süreyi <strong>yarım saat</strong>, kafaya aldığı her kritik yara <strong>1 saat</strong> uzatır.</li>
              <li>Baygın birinin ne zaman uyanacağı Medicine atılarak öğrenilebilir. Sonuç ne kadar yüksekse tahmin o kadar kesin olur.</li>
            </ul>
          `,
          en: `
            <p>To save a Mortally Wounded character:</p>
            <ul>
              <li>An action is spent and <strong>Medicine</strong> is rolled against <strong>DV 8</strong>.</li>
              <li>Without a medkit, if the patient has one failure, the roll is made with disadvantage.</li>
              <li>A conscious Mortally Wounded character can stabilize themselves with disadvantage.</li>
              <li>A stabilized character is left at <strong>1 HP</strong>; their failures and death save DV reset.</li>
              <li>If a stabilized character takes damage again in the same session, they go down with <strong>one failure</strong> already marked. This goes away at the next session or after a full night's sleep.</li>
            </ul>
            <p><strong>Unconsciousness</strong></p>
            <ul>
              <li>A stabilized character stays unconscious for about <strong>6 hours</strong>.</li>
              <li>Each critical injury they took adds <strong>half an hour</strong>; each critical injury to the head adds <strong>1 hour</strong>.</li>
              <li>When an unconscious character will wake up can be found out with a Medicine roll. The higher the result, the more precise the estimate.</li>
            </ul>
          `,
        },
      },
      {
        id: "dinlenme",
        label: { tr: "Gece Dinlenmesi", en: "Night's Rest" },
        body: {
          tr: `
            <p>Tam bir gece dinlenen karakter HP kazanır:</p>
            <div class="formula">BODY / 2 HP</div>
            <p>Sonuç aşağı yuvarlanır.</p>
          `,
          en: `
            <p>A character who rests for a full night regains HP:</p>
            <div class="formula">BODY / 2 HP</div>
            <p>Round down.</p>
          `,
        },
      },
      {
        id: "ilk-yardim",
        label: { tr: "İlk Yardım", en: "First Aid" },
        body: {
          tr: `
            <p>Uyumadan önce herhangi biri, kendisine ya da bir dostuna <strong>dezavantajlı Medicine</strong> atabilir. Başarılı olursa o kişinin o geceki iyileşmesi <strong>iki katına</strong> çıkar. Başarısız olursa normal iyileşir.</p>
            <ul>
              <li>Bir gecede istenildiği kadar kişiye ilk yardım yapılabilir.</li>
              <li>Her kişi için bir gecede <strong>tek deneme</strong> yapılır. Biri başaramazsa başka biri aynı kişi için tekrar deneyemez.</li>
              <li>DV 11. <span class="draft">Taslak</span></li>
            </ul>
          `,
          en: `
            <p>Before sleeping, anyone can roll <strong>Medicine with disadvantage</strong> on themselves or an ally. On a success, that person's healing for the night is <strong>doubled</strong>. On a failure, they heal normally.</p>
            <ul>
              <li>Any number of people can be given first aid in a night.</li>
              <li>Each person gets <strong>one attempt</strong> per night. If someone fails, no one else can try again for that person.</li>
              <li>DV 11. <span class="draft">Draft</span></li>
            </ul>
          `,
        },
      },
      {
        id: "medtech",
        label: { tr: "Medtech Gözetimi", en: "Medtech Care" },
        body: {
          tr: `
            <p>Bir Medtech'in gözetiminde dinlenen herkes, Medtech'in kendisi de dahil, o gece <strong>iki kat</strong> iyileşir. Zar gerekmez.</p>
            <p>Medtech gözetimi ve ilk yardım üst üste binmez; gece iyileşmesi en fazla iki kat olur.</p>
          `,
          en: `
            <p>Everyone who rests under a Medtech's care, the Medtech included, heals <strong>double</strong> that night. No roll is needed.</p>
            <p>Medtech care and first aid do not stack; a night's healing is at most doubled.</p>
          `,
        },
      },
      {
        id: "savasta",
        label: { tr: "Savaşta İyileşme", en: "Healing in Combat" },
        body: {
          tr: `
            <p>Savaşın ortasında HP yalnızca tüketilebilir eşyalarla kazanılır. <span class="draft">Taslak</span></p>
            <table class="rules">
              <thead><tr><th>Eşya</th><th>Kullanım</th><th>Etki</th></tr></thead>
              <tbody>
                <tr><td>Bounce Back<span class="item-sub">Enjektör</span></td><td>Bonus aksiyon</td><td>2d6 HP</td></tr>
                <tr><td>MaxDoc<span class="item-sub">İnhaler</span></td><td>Aksiyon</td><td>4d6 HP</td></tr>
              </tbody>
            </table>
          `,
          en: `
            <p>In the middle of combat, HP can only be regained with consumables. <span class="draft">Draft</span></p>
            <table class="rules">
              <thead><tr><th>Item</th><th>Use</th><th>Effect</th></tr></thead>
              <tbody>
                <tr><td>Bounce Back<span class="item-sub">Injector</span></td><td>Bonus action</td><td>2d6 HP</td></tr>
                <tr><td>MaxDoc<span class="item-sub">Inhaler</span></td><td>Action</td><td>4d6 HP</td></tr>
              </tbody>
            </table>
          `,
        },
      },
    ],
  },
};
