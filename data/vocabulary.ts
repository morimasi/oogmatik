
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
    "zil", "zor"
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
    "bayrak", "tören", "bayram", "tatil", "yolculuk", "bilet", "bavul", "otel", "kamp", "piknik"
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
    "araştırma", "inceleme", "gözlem", "deney", "analiz", "sentez", "değerlendirme", "sonuç", "çıkarım", "öneri"
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
    "halkla ilişkiler", "kurumsal iletişim", "insan kaynakları", "finansman", "muhasebe", "bütçeleme", "planlama", "projelendirme"
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
