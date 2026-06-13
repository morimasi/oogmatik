
// Genişletilmiş Dev Kelime Havuzu
// Disleksi dostu kategoriler ve zorluk seviyeleri

export const EMOJI_MAP: Record<string, string> = {
    "🍎": "Elma", "🚗": "Araba", "🏠": "Ev", "⭐": "Yıldız", "🎈": "Balon", "📚": "Kitap", "⚽": "Top", "☀️": "Güneş",
    "🌙": "Ay", "🌲": "Ağaç", "🌺": "Çiçek", "🎁": "Hediye", "⏰": "Saat", "🔑": "Anahtar", "🚲": "Bisiklet", "🎸": "Gitar",
    "👓": "Gözlük", "☂️": "Şemsiye", "🍦": "Dondurma", "🍕": "Pizza", "🍔": "Hamburger", "🍟": "Patates", "🐱": "Kedi",
    "🐶": "Köpek", "🦁": "Aslan", "🐯": "Kaplan", "🚀": "Roket", "🚁": "Helikopter", "🚢": "Gemi", "🚌": "Otobüs",
    "🚑": "Ambulans", "🚒": "İtfaiye", "🚓": "Polis", "🚕": "Taksi", "👑": "Taç", "💎": "Elmas", "💍": "Yüzük",
    "🎓": "Kep", "🧢": "Şapka", "👟": "Ayakkabı", "🦋": "Kelebek", "🐞": "Uğur Böceği", "🐝": "Arı", "🐌": "Salyangoz",
    "🐢": "Kaplumbağa", "🦕": "Dinozor", "🦖": "T-Rex", "🐙": "Ahtapot", "🐠": "Balık", "🐬": "Yunus"
};

export const TR_VOCAB = {
  // --- TEMEL KATEGORİLER ---
  animals: [
    "kedi", "köpek", "aslan", "kaplan", "fil", "zürafa", "ayı", "kurt", "tilki", "tavşan",
    "maymun", "yılan", "balık", "kuş", "ördek", "at", "eşek", "deve", "fare", "sincap",
    "timsah", "leopar", "penguen", "suaygırı", "bukalemun", "flamingo", "kanguru", "gergedan", "kunduz", "yarasa",
    "kartal", "şahin", "doğan", "akbaba", "baykuş", "serçe", "güvercin", "karga", "leylek", "pelikan"
  ],
  
  fruits_veggies: [
    "elma", "armut", "kiraz", "çilek", "muz", "portakal", "kavun", "karpuz", "üzüm", "erik",
    "şeftali", "kayısı", "incir", "nar", "mandalina", "limon", "ananas", "mango", "kivi", "dut",
    "böğürtlen", "kızılcık", "yabanmersini", "ahududu", "greyfurt", "ayva", "muşmula", "yenidünya", "hurma", "zeytin",
    "domates", "salatalık", "biber", "patlıcan", "kabak", "fasulye", "bezelye", "bamya", "ıspanak", "pırasa"
  ],
  
  jobs: [
    "doktor", "öğretmen", "polis", "avukat", "mühendis", "hemşire", "itfaiyeci", "aşçı", "pilot", "asker",
    "terzi", "berber", "şoför", "çiftçi", "marangoz", "ressam", "mimar", "hakim", "savcı", "eczacı",
    "veteriner", "dişçi", "astronot", "biliminsanı", "yazar", "gazeteci", "spiker", "yönetmen", "oyuncu", "şarkıcı"
  ],
  
  school: [
    "kalem", "defter", "silgi", "kitap", "sınıf", "okul", "öğrenci", "öğretmen", "tahta", "tebeşir",
    "sıra", "masa", "teneffüs", "kantin", "sınav", "ödev", "ders", "müzik", "resim", "beden",
    "tarih", "coğrafya", "matematik", "fizik", "kimya", "biyoloji", "edebiyat", "felsefe", "ingilizce", "türkçe"
  ],

  items_household: [
    "masa", "sandalye", "koltuk", "kanepe", "yatak", "dolap", "halı", "perde", "ayna", "lamba",
    "televizyon", "bilgisayar", "telefon", "tablet", "radyo", "saat", "vazo", "tablo", "çerçeve", "kitaplık"
  ],

  vehicles: [
      "araba", "otobüs", "kamyon", "tır", "motosiklet", "bisiklet", "traktör", "itfaiye", "ambulans", "polis arabası",
      "taksi", "dolmuş", "minibüs", "servis", "karavan", "jip", "limuzin", "spor araba", "yarış arabası", "klasik araba"
  ],

  // --- SEVİYELENDİRİLMİŞ KELİME HAVUZLARI ---

  // BAŞLANGIÇ: 1-2 Heceli, somut, görselleştirilebilir, 2-4 harfli.
  easy_words: [
    "at", "ev", "el", "ip", "ot", "su", "un", "ay", "ok", "ak",
    "al", "aş", "aç", "ad", "ağ", "az", "et", "ek", "er", "eş",
    "iç", "iş", "iz", "on", "ön", "öz", "uç", "üs", "kış", "yaz",
    "süt", "top", "kuş", "bal", "baş", "bel", "beş", "bin", "bir",
    "bit", "biz", "bol", "boş", "buz", "can", "cam", "cep", "çan",
    "çam", "çay", "çek", "dil", "din", "diş", "diz", "dün", "düş",
    "fil", "fiş", "gol", "göz", "gül", "gün", "güz", "hak", "hal",
    "han", "hap", "hiç", "kap", "kar", "kaş", "kat", "kaz", "kel",
    "kır", "kız", "kol", "kot", "koy", "koş", "kul", "kum", "küp",
    "kür", "laf", "lal", "laz", "maç", "mal", "mat", "mey", "mor",
    "muz", "nal", "nam", "nar", "naz", "nem", "net", "ney", "not",
    "oda", "ova", "oya", "pak", "pas", "pay", "pek", "pes", "pil",
    "pis", "pot", "poz", "pul", "pus", "raf", "ray", "rol", "rom",
    "ruh", "rus", "sac", "saç", "saf", "sağ", "sal", "sap", "saz",
    "sel", "sen", "ses", "set", "sır", "sis", "siz", "sol", "son",
    "soy", "söz", "suç", "sur", "süs", "şal", "şan", "şef", "şer",
    "şey", "şık", "şok", "şov", "şu", "taç", "tam", "tas", "taş",
    "tat", "tay", "tel", "ten", "tez", "tığ", "tik", "tim", "tip",
    "toz", "tül", "tür", "tüy", "uç", "un", "us", "ün", "üs", "üst",
    "üt", "üç", "va", "var", "vay", "vız", "ya", "yağ", "yan", "yap",
    "yar", "yaş", "yat", "yay", "yaz", "ye", "yel", "yem", "yer",
    "yet", "yıl", "yok", "yol", "yön", "yurt", "yük", "yün", "yüz",
    "zil", "zor",
    "aba", "abi", "acı", "ada", "ağı", "ah", "ana", "ara", "ata", "av",
    "baca", "çaba", "çağ", "çak", "çal", "çap", "çat", "çığ", "çık", "çöl",
    "dam", "dede", "defa", "deha", "dev", "dik", "dip", "don", "dön", "düğ",
    "düz", "ece", "eda", "efe", "evet", "fena", "fiil", "fok", "gaga", "gaz",
    "gıda", "giz", "göç", "gök", "göl", "güç", "hac", "hadi", "hain", "ham",
    "has", "hat", "hava", "haz", "hız", "ılık", "ırk", "ısı", "iki", "ilaç",
    "ilik", "ilk", "iri", "is", "isim", "izin", "için", "kaba", "kafa", "kahve",
    "kale", "kama", "kamu", "kan", "kapı", "kas", "kaya", "kazı", "kene", "kes",
    "kıç", "kıl", "kıt", "kin", "koç", "kod", "kop", "kor", "kök", "kör",
    "kut", "kuyu", "küf", "kül", "küs", "lav", "lif", "lobi", "may", "mem",
    "mis", "mit", "mol", "mut", "ne", "nef", "nin", "nur", "nü", "od",
    "of", "ofis", "okey", "ol", "ora", "oyun", "oğul", "öç", "öd", "öge",
    "öl", "öp", "ör", "örgü", "paça", "pan", "pat", "per", "peş", "pik",
    "pin", "piş", "pol", "pop", "pota", "puf", "ret", "rey", "rit", "rop",
    "rot", "ruj", "rut", "sam", "san", "sar", "sat", "sav", "say", "sık",
    "sın", "sil", "sim", "sin", "sit", "sof", "som", "sop", "sor", "sos",
    "sun", "sus", "süz", "şaf", "şah", "şak", "şap", "şaş", "şiş", "tad",
    "tak", "tan", "tap", "taze", "tek", "tem", "tep", "ter", "tey", "tık",
    "tok", "tom", "tor", "tos", "tur", "tut", "tuz", "tük", "tüm", "tüp",
    "uçak", "ufak", "uğur", "ulu", "um", "ur", "ut", "uzak", "üçer", "ür",
    "ürk", "üz", "vade", "vadi", "vaha", "vefa", "veli", "veya", "vir", "viz",
    "vur", "yad", "yak", "yam", "yas", "yek", "yen", "yık", "yır", "yit",
    "yiv", "yum", "yut", "zam", "zan", "zap", "zat", "zır", "zıt", "zip",
    "sıf"
  ],
  
  // ORTA: 2-3 Heceli, günlük hayatta sık kullanılan, 5-7 harfli.
  medium_words: [
    "araba", "balık", "ceviz", "çorba", "davul", "elmas", "fener", "gemi", "havuç", "ızgara",
    "jilet", "kavun", "limon", "marul", "nişan", "orman", "pilav", "radyo", "sabun", "tabak",
    "uçurtma", "vapur", "yastık", "zeytin", "biber", "çiçek", "dolap", "fırça", "gözlük", "hırka",
    "iskele", "jeton", "kalem", "lamba", "makas", "nokta", "otobüs", "pazar", "reçel", "sakız",
    "telefon", "banyo", "cadde", "daire", "eşarp", "fular", "gazete", "hamur", "ışık", "jandarma",
    "kablo", "lastik", "minder", "numara", "onarım", "paket", "rakam", "saat", "tarak", "vazo",
    "bilgi", "belge", "bulgu", "dergi", "sergi", "sevgi", "saygı", "sorgu", "korku", "tutku",
    "coşku", "baskı", "atkı", "bitki", "etki", "katkı", "tepki", "yetki", "uyku", "duygu",
    "kitap", "defter", "silgi", "kutu", "şişe", "bardak", "kaşık", "çatal", "bıçak", "tabure",
    "sehpa", "halı", "kilim", "perde", "ayna", "resim", "boya", "kağıt", "zımba", "bant",
    "yaprak", "ağaç", "toprak", "yağmur", "bulut", "güneş", "yıldız", "deniz", "kum", "sahil",
    "park", "bahçe", "sokak", "mahalle", "şehir", "kasaba", "köy", "ülke", "vatan", "millet",
    "bayrak", "tören", "bayram", "tatil", "yolculuk", "bilet", "bavul", "otel", "kamp", "piknik",
    "abla", "açlık", "afiş", "ahenk", "ahır", "akıntı", "akort", "aksak", "aktör", "alarm",
    "alay", "alçı", "alet", "alıntı", "alkış", "altın", "ambar", "anason", "anıt", "aralık",
    "arıza", "arşiv", "aşama", "aşı", "atama", "ateş", "atlas", "atlet", "avize", "ayak",
    "ayran", "azot", "bacak", "bakış", "bakla", "balta", "bando", "banka", "basit", "batı",
    "batak", "bedel", "bekçi", "benzin", "beraat", "berrak", "besin", "beste", "beşik",
    "beton", "beyin", "bilek", "bilet", "bina", "birlik", "bitiş", "bodur", "bohça", "boğa",
    "boğum", "bol", "bono", "boru", "boya", "bozuk", "böbrek", "böcek", "bölge",
    "bölük", "bölüm", "börek", "budak", "buluş", "bunak", "bunca", "burun", "butik", "buzul",
    "büfe", "büküm", "bülten", "büyü", "camlı", "canlı", "cari", "caz", "celse", "cember",
    "cenin", "cerrah", "cetvel", "ceza", "cıva", "cilt", "cihet", "cihaz", "cila",
    "cuma", "cumhur", "cübbe", "çadır", "çakal", "çalı", "çamur", "çanak", "çanta", "çapa",
    "çark", "çatı", "çavuş", "çayır", "çekiç", "çelenk", "çelik", "çember", "çene", "çerez",
    "çeşit", "çeşme", "çevre", "çıban", "çıkar", "çıkış", "çılgın", "çıplak", "çırak", "çizgi",
    "çizik", "çoban", "çocuk", "çorap", "çömlek", "çözüm", "çubuk", "çukur", "çünkü",
    "dadı", "daima", "dalgıç", "dalga", "damak", "damar", "damga", "damla", "dans", "dara",
    "darbe", "dari", "dart", "dava", "davet", "dayanak", "dayı", "değer", "değil", "deli",
    "demet", "demir", "denek", "deneme", "denge", "denk", "derece", "deri", "derin",
    "derman", "dernek", "destan", "destek", "deve", "devir", "devre", "devrim",
    "diken", "dikiş", "dikkat", "dilim", "dilsiz", "dinç", "dindar", "dinsel",
    "direk", "diri", "dirsek", "divan", "diyet", "dize", "dizel", "dizin", "dişli", "dolay",
    "dolgu", "dolma", "domuz", "donanım", "donatı", "dost", "doyum", "dönem", "dönüş",
    "döviz", "dudak", "durak", "duvar", "duygu", "duyum", "düdük", "düğme", "düğün", "dümen",
    "dünya", "dürtü", "düşes", "düşkün", "düzen", "düzey", "düzgü", "ebru", "edep", "efendi",
    "efsun", "egoist", "eğitim", "eğlence", "eğri", "ekici", "ekim", "ekin", "ekip", "eklem",
    "ekran", "eksen", "eksi", "eksik", "ekstra", "elci", "eldiven", "eleman", "elçi",
    "elyapım", "emanet", "emek", "emir", "emzik", "enayi", "enerji", "engel", "enlem", "entari",
    "enzim", "epey", "erbaş", "erdem", "erek", "ergen", "erime", "erken", "erzak", "esans",
    "esaret", "esas", "eser", "esinti", "eski", "esmer", "espri", "esrar", "eşit", "eşkâl",
    "eşlik", "eşya", "etek", "etken", "etkin", "etnik", "etraf", "evcil", "evlat", "evli",
    "evrak", "evren", "evrim", "evsiz", "evvel", "eyalet", "eylül", "eyvah", "ezan", "ezgi"
  ],
  
  // ZOR: 3-4 Heceli, daha soyut kavramlar, 8-10 harfli.
  hard_words: [
    "bilgisayar", "televizyon", "buzdolabı", "çamaşır", "bulaşık", "sandalye", "pencere", "kütüphane", "hastane", "postane",
    "pastane", "eczane", "lokanta", "restoran", "sinema", "tiyatro", "stadyum", "fabrika", "atölye", "istasyon",
    "havalimanı", "terminal", "otogar", "iskele", "liman", "bulvar", "meydan", "kavşak", "arkadaşlık", "dostluk",
    "kardeşlik", "barış", "özgürlük", "adalet", "eşitlik", "saygı", "sevgi", "hoşgörü", "sorumluluk", "dürüstlük",
    "çalışkanlık", "yardımlaşma", "dayanışma", "cömertlik", "cesaret", "sabır", "azim", "başarı", "mutluluk", "huzurlu",
    "heyecanlı", "kararlılık", "merhamet", "nezaket", "samimiyet", "sadakat", "fedakarlık", "tevazu", "cumhuriyet", "demokrasi",
    "bağımsızlık", "egemenlik", "hakimiyet", "medeniyet", "uygarlık", "teknoloji", "ekonomi", "politika", "strateji", "yetenek",
    "beceri", "kapasite", "performans", "motivasyon", "konsantrasyon", "organizasyon", "iletişim", "etkileşim", "tartışma", "konuşma",
    "toplantı", "görüşme", "mülakat", "röportaj", "sunum", "konferans", "seminer", "panel", "forum", "çalıştay",
    "araştırma", "inceleme", "gözlem", "deney", "analiz", "sentez", "değerlendirme", "sonuç", "çıkarım", "öneri",
    "abartısız", "abdesthane", "acımasız", "açıklama", "açıkgöz", "ağırbaşlı", "ahenksiz", "akrobasi", "akrobat", "aksaklık",
    "alabalık", "alaturka", "albatros", "alçakgönüllü", "aldatma", "alegori", "alışkanlık", "alıştırma", "alkışlamak", "alternatif",
    "amblem", "anafikir", "anahtar", "anason", "anatomik", "anayasa", "anlaşma", "anlayış", "anons", "anormal",
    "antoloji", "antrenman", "apartman", "argüman", "armoni", "astronomi", "astsubay", "aşırı", "atardamar", "atılım",
    "atmosfer", "atomik", "avukatlık", "aydınlanma", "aydınlatma", "azınlık", "bağdaştırmak", "bağımlılık", "bağışıklık", "bağlantı",
    "baharat", "balans", "balina", "bankamatik", "banknot", "baraj", "basamak", "basınç", "başarısız",
    "başlangıç", "başvuru", "bataklık", "batarya", "bedensel", "beklenmedik", "belediye", "belirsiz", "bellek", "bencil",
    "benzerlik", "bereketli", "beslenme", "besteci",
    "bilinç", "bilinçsiz", "bilmece", "bilsem",
    "birebir", "birincil", "birleşim", "birleşme", "birtakım", "bisiklet", "bitkisel", "biyografi", "biyolojik",
    "bomba", "boncuk", "bonservis", "borsa", "boykot", "bölgesel", "bölünme", "buhran", "bulmaca",
    "buluşma", "bunalım", "bunaltı", "burgaç", "burs", "buzul", "büfe", "bükülme",
    "büyükelçi", "büyüklük", "cafcaflı", "cahil", "cambaz", "canavar", "canlandırma",
    "cebir", "cehennem", "celal", "cemiyet", "cenaze", "cendere", "cenk", "cephe", "cerrahi", "cevher",
    "cevval", "cezai", "cezbedici", "cezve", "cılız", "cımbız", "cıvata", "ciddiyet", "ciğer", "cihan",
    "cilalı", "ciltçi", "ciltli", "cimri", "cinayet", "cinnet", "ciro", "civan", "civar", "civciv",
    "coğrafi", "cunda", "curcuna", "cüda", "cümbüş", "cüret", "cüsseli", "cüzdan", "çabucak", "çağdaş",
    "çağıltı", "çağrı", "çakıl", "çalgı", "çalışma", "çalkantı", "çanakçı", "çangal", "çapraz",
    "çaput", "çardak", "çarpı", "çarpıcı", "çarpım", "çarpışma", "çatışma", "çavdar", "çaydanlık", "çebiç",
    "çedene", "çekici", "çekim", "çekirge", "çekirdek", "çelimli", "çengel", "çentik", "çeper", "çepçevre",
    "çeşitli", "çetin", "çetrefil", "çevik", "çeviri", "çeyiz", "çığlık", "çıkarcı", "çıkarma", "çıkıntı"
  ],

  // UZMAN: 4+ Heceli, akademik, birleşik kelimeler, teknik terimler, 11+ harfli.
  expert_words: [
    "çekoslovakyalılaştıramadıklarımızdanmısınız", "afyonkarahisarlılaştırabildiklerimizdenmişsinizcesine",
    "cumhuriyetperver", "elektromanyetik", "biyokimyasal", "nanoteknoloji", "sürdürülebilirlik", "küreselleşme", "modernizasyon",
    "sanayileşme", "kentleşme", "demokratikleşme", "bireyselleşme", "yabancılaşma", "kurumsallaşma", "yapılandırma", "programlama",
    "geliştirme", "kütüphanecilik", "dokümantasyon", "enformasyon", "telekomünikasyon", "interdisipliner", "multidisipliner",
    "transdisipliner", "biyoçeşitlilik", "ekosistem", "fotosentez", "metabolizma", "organizma", "mikroorganizma", "bakteriyoloji",
    "viroloji", "immünoloji", "antropoloji", "arkeoloji", "sosyoloji", "psikoloji", "felsefe", "epistemoloji",
    "ontoloji", "metafizik", "profesyonellik", "koordinasyon", "rehabilitasyon", "dezenformasyon", "manipülasyon", "spekülasyon",
    "halüsinasyon", "karakteristik", "spesifik", "perspektif", "inisiyatif", "hiyerarşi", "bürokrasi", "matematiksel",
    "istatistiksel", "orijinallik", "yaratıcılık", "üretkenlik", "verimlilik", "etkililik", "kalite", "standart",
    "sertifikasyon", "akreditasyon", "denetim", "gözetim", "rehberlik", "danışmanlık", "mentörlük", "koçluk",
    "liderlik", "yöneticilik", "girişimcilik", "inovasyon", "ar-ge", "ür-ge", "pazarlama", "reklamcılık",
    "halkla ilişkiler", "kurumsal iletişim", "insan kaynakları", "finansman", "muhasebe", "bütçeleme", "planlama", "projelendirme",
    "aidiyet", "akademisyen", "akademisyenlik", "akışkanlık", "alışılagelmiş", "alıştırmalı", "alkolmetre", "alternatör", "anlaşılabilir", "anlaşılmazlık",
    "anlayışsızlık", "antropolojik", "araştırmacılık", "araştırmalı", "arkadaşça", "arkadaşsızlık", "astsubaylık", "aşamalılık", "aşkınlık", "atmosferik",
    "bağımlılık", "bağımsızlaşma", "bağışlanabilir", "bağlantısızlık", "başkanlık", "başlangıçlık", "başvurulabilir", "belediyecilik", "belirsizleşme", "benzersizlik",
    "bereketlilik", "beslenebilir", "beyefendilik", "bilgilendirme", "bilinçlendirme", "bilinçsizlik", "bilinmezlik", "bilgisayarcılık", "bilgisayarlaşma", "biriktirebilme",
    "birleştirilebilir", "bölgeselleşme", "bölünebilirlik", "çalışabilirlik", "çevreleme", "çeşitlendirme", "çeşitlilik", "çılgınlaşma", "çıkarılabilir", "çözümsüzlük",
    "davranışsal", "dayanışmacılık", "dayanıklılık", "değerlendirici", "değiştirilebilir", "değiştirilmezlik", "denetlenebilirlik", "denetleyici", "deneyimleme", "derinlemesine",
    "dertleşme", "devamlılık", "devredilebilir", "dışlanmışlık", "dindarlık", "dirençsizlik", "doğaçlama", "doğrulanabilirlik", "doktorluk", "dolandırıcılık",
    "dostça", "dönüşebilirlik", "dönüşümlülük", "düşüncesizlik", "düşünebilme", "düşünselleşme", "düzenleyicilik", "düzensizleşme", "edebiyatçı", "edebiyatsever",
    "eğitilebilirlik", "eğitimsizlik", "eğlendiricilik", "ekonomikleşme", "ekonomistlik", "elektriklenme", "elektronik", "eleştirebilme", "eleştirel", "eleştirmenlik",
    "engellenebilirlik", "enstrümantasyon", "eşitsizlik", "etkileyicilik", "etkisizleşme", "evrensellik", "eylemsizlik", "farklılaştırma", "faydacılık", "felsefecilik",
    "fenomenoloji", "ferahlatıcı", "fesatlık", "fizyoterapist", "fotoğrafçılık", "gayrimenkul", "geçerlilik", "geçersizlik", "gelenekçilik", "gelişebilirlik",
    "gelişigüzel", "geliştirilebilir", "geliştirici", "genelleme", "genelleştirme", "genetikçi", "gerçekçi", "gerçekleşebilirlik", "gerçekleştirme", "gerilimli",
    "girişimci", "girişimcilik", "görevlendirme", "gösterişçilik", "gösterebilme", "gözlemlenebilir", "gözlemsel", "grafiksel", "güçlendirme", "güçsüzlük",
    "gülünçlük", "güncellenebilir", "güncellik", "gündelikçi", "güvenilirlik", "güvensizlik", "haberleşme", "hafifletici", "hafiflik", "hakkaniyet",
    "hassasiyet", "hastalıklı", "hastanelik", "hatırlatma", "hayalperest", "hayatbilgisi", "hayatiyet", "hayırseverlik", "hazımsızlık", "hazırcevaplık",
    "hazırlayıcı", "hekimlik", "hemşirelik", "heykeltıraş", "hırsızlık", "hızlandırma", "hissizleşme", "hissiyat", "histerik", "hitabet",
    "hokkabazlık", "homojenleşme", "hoşgörüsüz", "hoşnutsuzluk", "hoşnutluk", "hukukçuluk", "hukuksuzluk", "huzursuzluk", "hükümlülük", "hükümsüzlük",
    "hürleşme", "ılımlılaşma", "ılımlılık", "inandırıcılık", "inandırma", "inanılmazlık", "inatçılık", "inatlaşma", "indirgenebilir", "indirgenebilirlik",
    "indirgeyici", "inkarcılık", "inkılapçılık", "insancıllık", "insanlık", "insanüstü", "iradelilik", "iradesizlik", "isabetsizlik", "istatistiksel",
    "isteklilik", "isteksizlik", "istismarcılık", "istisnasızlık", "isyankârlık", "itaatkârlık", "itibarlılık", "itibarsızlık", "işbirlikçilik", "işlevsellik"
  ],

  // DİSLEKSİ İÇİN ÖZEL: Görsel/İşitsel Benzerlik Listeleri
  confusing_words: [
    ["koy", "köy"], ["kar", "kâr"], ["hala", "hâlâ"], ["aşık", "aşık"], ["yar", "yâr"],
    ["baba", "dada"], ["ev", "ve"], ["sap", "pas"], ["kasa", "saka"], ["kitap", "katip"],
    ["masa", "yasa"], ["kel", "kelli"], ["fil", "fili"], ["on", "ön"], ["us", "üs"],
    ["aç", "üç"], ["el", "al"], ["il", "al"], ["et", "at"], ["ot", "at"],
    ["cam", "çam"], ["dağ", "bağ"], ["var", "dar"], ["nar", "zar"], ["far", "gar"],
    ["sarı", "darı"], ["yarı", "karı"], ["arı", "ayı"], ["sal", "şal"], ["kaş", "taş"],
    ["manda", "manav"], ["biber", "berber"], ["kalem", "kelam"], ["resim", "cisim"], ["şaka", "kasa"],
    ["çakı", "açkı"], ["elek", "lek"], ["kek", "ek"], ["kil", "il"], ["mil", "il"]
  ],

  // Eş Anlamlılar (Genişletilmiş)
  synonyms: [
    { word: "siyah", synonym: "kara" }, { word: "beyaz", synonym: "ak" }, { word: "kırmızı", synonym: "al" },
    { word: "okul", synonym: "mektep" }, { word: "öğrenci", synonym: "talebe" }, { word: "öğretmen", synonym: "muallim" },
    { word: "doktor", synonym: "hekim" }, { word: "cevap", synonym: "yanıt" }, { word: "soru", synonym: "sual" },
    { word: "kelime", synonym: "sözcük" }, { word: "cümle", synonym: "tümce" }, { word: "hikaye", synonym: "öykü" },
    { word: "roman", synonym: "betik" }, { word: "şiir", synonym: "nazım" }, { word: "yazar", synonym: "edip" },
    { word: "şair", synonym: "ozan" }, { word: "dil", synonym: "lisan" }, { word: "yıl", synonym: "sene" },
    { word: "yüzyıl", synonym: "asır" }, { word: "zaman", synonym: "vakit" }, { word: "sonbahar", synonym: "güz" },
    { word: "ilkbahar", synonym: "bahar" }, { word: "rüzgar", synonym: "yel" }, { word: "deprem", synonym: "zelzele" },
    { word: "şehir", synonym: "kent" }, { word: "köy", synonym: "karye" }, { word: "ulus", synonym: "millet" },
    { word: "vatan", synonym: "yurt" }, { word: "bayrak", synonym: "sancak" }, { word: "istiklal", synonym: "bağımsızlık" },
    { word: "misafir", synonym: "konuk" }, { word: "hediye", synonym: "armağan" }, { word: "fakir", synonym: "yoksul" },
    { word: "zengin", synonym: "varlıklı" }, { word: "ihtiyar", synonym: "yaşlı" }, { word: "genç", synonym: "toy" }
  ],

  // Zıt Anlamlılar (Genişletilmiş)
  antonyms: [
    { word: "büyük", antonym: "küçük" }, { word: "uzun", antonym: "kısa" }, { word: "şişman", antonym: "zayıf" },
    { word: "güzel", antonym: "çirkin" }, { word: "iyi", antonym: "kötü" }, { word: "doğru", antonym: "yanlış" },
    { word: "çalışkan", antonym: "tembel" }, { word: "zengin", antonym: "fakir" }, { word: "genç", antonym: "yaşlı" },
    { word: "yeni", antonym: "eski" }, { word: "açık", antonym: "kapalı" }, { word: "aşağı", antonym: "yukarı" },
    { word: "ileri", antonym: "geri" }, { word: "içeri", antonym: "dışarı" }, { word: "ön", antonym: "arka" },
    { word: "sağ", antonym: "sol" }, { word: "doğu", antonym: "batı" }, { word: "kuzey", antonym: "güney" },
    { word: "siyah", antonym: "beyaz" }, { word: "karanlık", antonym: "aydınlık" }, { word: "gece", antonym: "gündüz" }
  ],

  colors_detailed: [
      { name: 'KIRMIZI', css: 'red' }, { name: 'MAVİ', css: 'blue' }, { name: 'YEŞİL', css: 'green' }, { name: 'SARI', css: 'yellow' },
      { name: 'TURUNCU', css: 'orange' }, { name: 'MOR', css: 'purple' }, { name: 'PEMBE', css: 'pink' }, { name: 'SİYAH', css: 'black' },
      { name: 'TURKUAZ', css: 'turquoise' }, { name: 'GRİ', css: 'gray' }, { name: 'KAHVERENGİ', css: 'brown' }, { name: 'LACİVERT', css: 'navy' },
      { name: 'BEYAZ', css: '#f0f0f0' }, { name: 'ALTIN', css: 'gold' }, { name: 'GÜMÜŞ', css: 'silver' }, { name: 'BEJ', css: 'beige' },
      { name: 'LİLA', css: 'lavender' }, { name: 'BORDO', css: 'maroon' }, { name: 'ZEYTİN', css: 'olive' }, { name: 'MERCAN', css: 'coral' }
  ],

  homonyms: [
      "yüz", "çay", "düş", "at", "ben", "bin", "dil", "diz", "ekmek", "el", "in", "iç", "kara", "kır", "kız", "ocak", "oy", "pazar", "saç", "satır", "soluk", "sürü", "yaş", "yaz", "yol",
      "bağ", "bel", "boğaz", "dal", "dolu", "hayır", "kaz", "koca", "kurşun", "kuşak", "pay", "saz", "ton", "var", "yat", "gül", "an", "arı", "as"
  ]
};
