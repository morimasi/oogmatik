
// Genişletilmiş Dev Kelime Havuzu
// Disleksi dostu kategoriler ve zorluk seviyeleri

export const TR_VOCAB = {
  // --- TEMEL KATEGORİLER ---
  animals: [
    "kedi", "köpek", "aslan", "kaplan", "fil", "zürafa", "ayı", "kurt", "tilki", "tavşan",
    "maymun", "yılan", "balık", "kuş", "ördek", "at", "eşek", "deve", "fare", "sincap",
    "timsah", "leopar", "penguen", "suaygırı", "bukalemun", "flamingo", "kanguru", "gergedan", "kunduz", "yarasa",
    "kartal", "şahin", "doğan", "akbaba", "baykuş", "serçe", "güvercin", "karga", "leylek", "pelikan",
    "yunus", "balina", "köpekbalığı", "ahtapot", "yengeç", "ıstakoz", "midye", "denizanası", "mercan", "sünger",
    "arı", "karınca", "kelebek", "sinek", "böcek", "örümcek", "akrep", "çekirge", "uğurböceği", "tırtıl",
    "lama", "alpaka", "panda", "koala", "tembelhayvan", "öküz", "manda", "keçi", "koyun", "kuzu",
    "horoz", "tavuk", "hindi", "kaz", "bıldırcın", "keklik", "sülün", "devekuşu", "emu", "kivi",
    "porsuk", "gelincik", "su samuru", "kirpi", "köstebek", "iguana", "kertenkele", "solucan", "salyangoz", "ceylan",
    "geyik", "karaca", "vaşak", "çakal", "sırtlan", "zebra", "goril", "şempanze", "orangutan", "lemur",
    "rakun", "kokarca", "armadillo", "karıncayiyen", "tapir", "okapi", "bizon", "yaban domuzu", "martı", "albatros",
    "papağan", "kanarya", "muhabbet kuşu", "bülbül", "saka", "iskete", "turna", "balıkçıl", "karabatak", "denizatı",
    "vatoz", "kalamar", "mürekkepbalığı", "denizyıldızı", "sivrisinek", "yusufçuk", "peygamberdevesi", "kene", "pire", "tahtakurusu",
    "bukalemun", "semender", "kurbağa", "kaplumbağa", "tarantula", "çita", "puma", "jaguar", "panter", "vaşak",
    "kunduz", "su samuru", "mirket", "firavun faresi", "çöl faresi", "hamster", "gine domuzu", "saka kuşu", "ebabil", "arı kuşu"
  ],
  
  fruits_veggies: [
    "elma", "armut", "kiraz", "çilek", "muz", "portakal", "kavun", "karpuz", "üzüm", "erik",
    "şeftali", "kayısı", "incir", "nar", "mandalina", "limon", "ananas", "mango", "kivi", "dut",
    "böğürtlen", "kızılcık", "yabanmersini", "ahududu", "greyfurt", "ayva", "muşmula", "yenidünya", "hurma", "zeytin",
    "domates", "salatalık", "biber", "patlıcan", "kabak", "fasulye", "bezelye", "bamya", "ıspanak", "pırasa",
    "lahana", "karnabahar", "brokoli", "marul", "maydanoz", "dereotu", "nane", "roka", "tere", "fesleğen",
    "soğan", "sarımsak", "patates", "havuç", "turp", "pancar", "şalgam", "kereviz", "enginar", "yerelması",
    "semizotu", "madımak", "ısırgan", "ebegümeci", "kuşkonmaz", "mantar", "mısır", "balkabağı", "avokado", "hindistancevizi",
    "kestane", "fındık", "fıstık", "ceviz", "badem", "leblebi", "çekirdek", "kabak çekirdeği", "kaju", "yerfıstığı",
    "kuru üzüm", "kuru kayısı", "kuru incir", "dut kurusu", "iğde", "alıç", "kuşburnu", "keçiboynuzu", "börülce", "bakla",
    "barbunya", "mercimek", "nohut", "pirinç", "bulgur", "yulaf", "çavdar", "arpa", "buğday", "irmik",
    "kekik", "kimyon", "karabiber", "pul biber", "nane", "sumak", "tarçın", "zencefil", "zerdeçal", "karanfil"
  ],
  
  jobs: [
    "doktor", "öğretmen", "polis", "avukat", "mühendis", "hemşire", "itfaiyeci", "aşçı", "pilot", "asker",
    "terzi", "berber", "şoför", "çiftçi", "marangoz", "ressam", "mimar", "hakim", "savcı", "eczacı",
    "veteriner", "dişçi", "astronot", "biliminsanı", "yazar", "gazeteci", "spiker", "yönetmen", "oyuncu", "şarkıcı",
    "müzisyen", "besteci", "heykeltıraş", "fotoğrafçı", "grafiker", "yazılımcı", "teknisyen", "tamirci", "elektrikçi", "tesisatçı",
    "kaptan", "hostes", "makinist", "vatman", "biletçi", "tezgahtar", "kasiyer", "garson", "komi", "bulaşıkçı",
    "bahçıvan", "kapıcı", "güvenlik", "temizlikçi", "dadı", "bakıcı", "psikolog", "sosyolog", "arkeolog", "tarihçi",
    "kurye", "postacı", "bankacı", "muhasebeci", "sekreter", "resepsiyonist", "rehber", "çevirmen", "editör", "eleştirmen",
    "kuaför", "makyöz", "stilist", "model", "manken", "sporcu", "antrenör", "hakem", "teknik direktör", "menajer",
    "emlakçı", "sigortacı", "reklamcı", "pazarlamacı", "satış danışmanı", "insan kaynakları", "lojistik", "gümrükçü", "madenci", "balıkçı",
    "kuyumcu", "saatçi", "ayakkabıcı", "mobilyacı", "fırıncı", "pastacı", "kasap", "manav", "bakkal", "marketçi"
  ],
  
  school: [
    "kalem", "defter", "silgi", "kitap", "sınıf", "okul", "öğrenci", "öğretmen", "tahta", "tebeşir",
    "sıra", "masa", "teneffüs", "kantin", "sınav", "ödev", "ders", "müzik", "resim", "beden",
    "tarih", "coğrafya", "matematik", "fizik", "kimya", "biyoloji", "edebiyat", "felsefe", "ingilizce", "türkçe",
    "laboratuvar", "kütüphane", "müdür", "nöbetçi", "zil", "koridor", "bahçe", "tören", "bayrak", "istiklal",
    "kırtasiye", "çanta", "suluk", "beslenme", "servis", "kolej", "üniversite", "fakülte", "kampüs", "diploma",
    "proje", "sunum", "karne", "not", "sözlü", "yazılı", "etkinlik", "kulüp", "gezi", "mezuniyet",
    "cetvel", "pergel", "gönye", "açıölçer", "hesap makinesi", "bilgisayar", "tablet", "projeksiyon", "harita", "küre",
    "pano", "dolap", "askı", "çöp kutusu", "tebeşir", "kalemtıraş", "uçlu kalem", "tükenmez kalem", "boya kalemi", "pastel boya",
    "sulu boya", "fırça", "palet", "tuval", "not defteri", "ajanda", "takvim", "saat", "pano", "harita",
    "deney", "mikroskop", "teleskop", "beher", "tüp", "element", "formül", "problem", "çözüm", "cevap"
  ],

  items_household: [
    "masa", "sandalye", "koltuk", "kanepe", "yatak", "dolap", "halı", "perde", "ayna", "lamba",
    "televizyon", "bilgisayar", "telefon", "tablet", "radyo", "saat", "vazo", "tablo", "çerçeve", "kitaplık",
    "battaniye", "yastık", "yorgan", "çarşaf", "havlu", "bornoz", "sabun", "şampuan", "diş fırçası", "macun",
    "tarak", "fırça", "toka", "ayakkabı", "terlik", "şemsiye", "çanta", "cüzdan", "anahtar", "gözlük",
    "ütü", "süpürge", "kova", "paspas", "bez", "deterjan", "sünger", "mandal", "ip", "iğne",
    "iplik", "makas", "düğme", "fermuar", "mezura", "cetvel", "kalem", "kağıt", "zarf", "bant",
    "yapıştırıcı", "zımba", "ataş", "dosya", "klasör", "hesap makinesi", "pil", "fener", "mum", "kibrit",
    "çakmak", "küllük", "kumanda", "priz", "fiş", "kablo", "adaptör", "şarj", "kulaklık", "hoparlör"
  ],

  kitchen_food: [
    "tabak", "çatal", "kaşık", "bıçak", "bardak", "sürahi", "tencere", "tava", "kepçe", "süzgeç",
    "rende", "çırpıcı", "oklava", "merdane", "fırın", "ocak", "buzdolabı", "bulaşık makinesi", "mikrodalga", "tost makinesi",
    "çaydanlık", "cezve", "kase", "tepsi", "sofra", "örtü", "peçete", "tuzluk", "biberlik", "yağdanlık",
    "ekmek", "peynir", "zeytin", "yumurta", "bal", "reçel", "tereyağı", "kaymak", "süt", "yoğurt",
    "çorba", "pilav", "makarna", "börek", "dolma", "sarma", "köfte", "kebap", "döner", "lahmacun",
    "pide", "pizza", "hamburger", "sandviç", "tost", "salata", "cacık", "turşu", "helva", "baklava",
    "sütlaç", "kazandibi", "künefe", "kek", "pasta", "kurabiye", "poğaça", "simit", "açma", "çörek",
    "mantı", "güllaç", "aşure", "muhallebi", "puding", "dondurma", "çikolata", "şeker", "sakız", "lokum",
    "kahve", "çay", "ayran", "meyve suyu", "limonata", "şerbet", "boza", "sahlep", "su", "soda"
  ],

  sports: [
    "futbol", "basketbol", "voleybol", "tenis", "yüzme", "koşu", "güreş", "boks", "halter", "judo",
    "karate", "tekvando", "jimnastik", "atletizm", "okçuluk", "eskrim", "binicilik", "kürek", "yelken", "sörf",
    "kayak", "buz pateni", "hokey", "golf", "bilardo", "bowling", "dart", "masa tenisi", "badminton", "hentbol",
    "top", "kale", "pota", "file", "raket", "krampon", "forma", "şort", "eşofman", "madalya",
    "kupa", "stadyum", "salon", "havuz", "pist", "saha", "hakem", "antrenör", "taraftar", "skor",
    "maç", "devre", "set", "sayı", "gol", "faul", "penaltı", "korner", "ofsayt", "taç",
    "kupa", "lig", "şampiyon", "turnuva", "olimpiyat", "rekor", "derece", "final", "yarı final", "çeyrek final"
  ],

  clothing: [
    "gömlek", "pantolon", "etek", "elbise", "ceket", "mont", "kaban", "palto", "kazak", "hırka",
    "yelek", "tişört", "şort", "eşofman", "pijama", "iç çamaşırı", "çorap", "ayakkabı", "bot", "çizme",
    "sandalet", "terlik", "şapka", "bere", "atkı", "eldiven", "kemer", "kravat", "papyon", "fular",
    "şal", "mendil", "gözlük", "saat", "kolye", "küpe", "bilezik", "yüzük", "toka", "çanta",
    "cüzdan", "bavul", "şemsiye", "düğme", "fermuar", "yaka", "cep", "kol", "paça", "astar",
    "kadife", "ipek", "pamuk", "yün", "keten", "saten", "kot", "deri", "kürk", "naylon"
  ],

  body_health: [
    "baş", "göz", "kulak", "burun", "ağız", "diş", "dil", "dudak", "yanak", "çene",
    "boyun", "omuz", "kol", "dirsek", "bilek", "el", "parmak", "tırnak", "göğüs", "sırt",
    "bel", "karın", "göbek", "kalça", "bacak", "diz", "ayak", "topuk", "deri", "saç",
    "beyin", "kalp", "akciğer", "mide", "bağırsak", "karaciğer", "böbrek", "damar", "kan", "kemik",
    "kas", "eklem", "hastalık", "sağlık", "ilaç", "hap", "şurup", "iğne", "aşı", "doktor",
    "hemşire", "hastane", "ambulans", "yara", "bandaj", "sargı", "ateş", "öksürük", "nezle", "grip",
    "baş ağrısı", "karın ağrısı", "diş ağrısı", "vitamin", "mineral", "protein", "kalori", "diyet", "spor", "egzersiz"
  ],

  nature_space: [
    "dağ", "tepe", "ova", "yayla", "vadi", "kanyon", "uçurum", "mağara", "deniz", "okyanus",
    "göl", "nehir", "ırmak", "dere", "çay", "pınar", "kaynak", "şelale", "çağlayan", "körfez",
    "yarımada", "ada", "kıta", "orman", "koru", "çalılık", "bozkır", "çöl", "vaha", "kutup",
    "buzul", "volkan", "yanardağ", "deprem", "sel", "çığ", "fırtına", "kasırga", "hortum", "şimşek",
    "gökkuşağı", "bulut", "sis", "dolu", "kırağı", "çiy", "toprak", "kum", "kaya", "taş",
    "gezegen", "yıldız", "güneş", "ay", "dünya", "mars", "venüs", "jüpiter", "satürn", "uranüs",
    "neptün", "plüton", "galaksi", "evren", "uzay", "boşluk", "karanlık", "ışık", "hız", "yıl",
    "uydu", "roket", "mekik", "astronot", "teleskop", "krater", "meteor", "kuyrukluyıldız", "yörünge", "atmosfer",
    "kuzey", "güney", "doğu", "batı", "pusula", "harita", "atlas", "küre", "enlem", "boylam"
  ],

  verbs: [
    "koşmak", "yürümek", "oturmak", "kalkmak", "yatmak", "uyumak", "uyanmak", "yemek", "içmek", "yazmak",
    "okumak", "çizmek", "boyamak", "silmek", "kesmek", "yapıştırmak", "bakmak", "görmek", "duymak", "dinlemek",
    "koklamak", "tatmak", "dokunmak", "hissetmek", "sevmek", "gülmek", "ağlamak", "kızmak", "korkmak", "şaşırmak",
    "düşünmek", "anlamak", "bilmek", "öğrenmek", "öğretmek", "sormak", "cevaplamak", "söylemek", "konuşmak", "anlatmak",
    "bağırmak", "fısıldamak", "susmak", "durmak", "gitmek", "gelmek", "girmek", "çıkmak", "inmek", "binmek",
    "açmak", "kapatmak", "almak", "vermek", "tutmak", "atmak", "yakalamak", "bırakmak", "taşımak", "götürmek",
    "getirmek", "başlamak", "bitirmek", "kazanmak", "kaybetmek", "oynamak", "çalışmak", "dinlenmek", "gezmek", "eğlenmek",
    "aramak", "bulmak", "saklamak", "gizlemek", "göstermek", "izlemek", "seyretmek", "beklemek", "özlemek", "hatırlamak",
    "unutmak", "inanmak", "güvenmek", "yardım etmek", "paylaşmak", "kutlamak", "dans etmek", "şarkı söylemek", "resim yapmak", "spor yapmak",
    "yüzmek", "uçmak", "tırmanmak", "atlamak", "zıplamak", "sürünmek", "yuvarlanmak", "dönmek", "sallanmak", "titremek",
    "pişirmek", "temizlemek", "yıkamak", "ütülemek", "süpürmek", "silkelemek", "kırmak", "dökmek", "saçmak", "toplamak",
    "saymak", "ölçmek", "tartmak", "hesaplamak", "çözmek", "kurmak", "bozmak", "tamir etmek", "yapmak", "etmek"
  ],

  adjectives: [
    "büyük", "küçük", "uzun", "kısa", "geniş", "dar", "kalın", "ince", "ağır", "hafif",
    "yeni", "eski", "taze", "bayat", "sıcak", "soğuk", "ılık", "serin", "ıslak", "kuru",
    "sert", "yumuşak", "düz", "eğri", "yamuk", "yuvarlak", "kare", "üçgen", "açık", "koyu",
    "parlak", "mat", "canlı", "solgun", "güzel", "çirkin", "iyi", "kötü", "temiz", "kirli",
    "düzenli", "dağınık", "hızlı", "yavaş", "güçlü", "zayıf", "cesur", "korkak", "mutlu", "üzgün",
    "kızgın", "sakin", "dolu", "boş", "pahalı", "ucuz", "zengin", "fakir", "kolay", "zor",
    "akıllı", "aptal", "çalışkan", "tembel", "dürüst", "yalancı", "cömert", "cimri", "kibar", "kaba",
    "sessiz", "gürültülü", "kalabalık", "tenha", "derin", "sığ", "yüksek", "alçak", "uzak", "yakın",
    "önemli", "önemsiz", "gerekli", "gereksiz", "faydalı", "zararlı", "sağlıklı", "hasta", "yorgun", "dinç",
    "aç", "tok", "susuz", "uykulu", "şaşkın", "meraklı", "endişeli", "heyecanlı", "sabırlı", "aceleci"
  ],

  technology: [
    "bilgisayar", "tablet", "telefon", "internet", "uygulama", "oyun", "kod", "yazılım", "donanım", "ekran",
    "klavye", "fare", "yazıcı", "tarayıcı", "hoparlör", "kulaklık", "kamera", "mikrofon", "pil", "şarj",
    "kablo", "wifi", "bluetooth", "robot", "yapay zeka", "veri", "dosya", "klasör", "sifre", "hesap",
    "mesaj", "arama", "video", "fotoğraf", "paylaşım", "beğeni", "yorum", "takip", "bildirim", "güncelleme",
    "uydu", "roket", "uzay", "teknoloji", "bilim", "icat", "keşif", "deney", "laboratuvar", "mühendis"
  ],

  emotions: [
    "mutlu", "üzgün", "kızgın", "korkmuş", "şaşkın", "heyecanlı", "endişeli", "sakin", "yorgun", "enerjik",
    "gururlu", "utangaç", "kıskanç", "sevgi", "nefret", "özlem", "pişmanlık", "umut", "hayal kırıklığı", "merak",
    "cesaret", "korku", "sevinç", "keder", "öfke", "huzur", "stres", "panik", "rahatlama", "memnuniyet",
    "yalnızlık", "dostluk", "güven", "şüphe", "hayranlık", "tiksinti", "acıma", "şefkat", "merhamet", "minnet"
  ],
  
  vehicles: [
      "araba", "otobüs", "kamyon", "tır", "motosiklet", "bisiklet", "traktör", "itfaiye", "ambulans", "polis arabası",
      "taksi", "dolmuş", "minibüs", "servis", "karavan", "jip", "limuzin", "spor araba", "yarış arabası", "klasik araba",
      "tren", "tramvay", "metro", "hızlı tren", "lokomotif", "vagon", "teleferik", "füniküler", "monoray",
      "uçak", "helikopter", "jet", "planör", "balon", "zeplin", "drone", "roket", "uzay mekiği", "paraşüt",
      "gemi", "vapur", "yat", "yelkenli", "tekne", "sandal", "kano", "kayık", "bot", "denizaltı", "feribot", "şilep", "tanker"
  ],

  // --- ÖZEL PEDAGOJİK LİSTELER ---

  // Okuması kolay, hecelemesi basit kelimeler (Başlangıç seviyesi için)
  easy_words: [
    "at", "ev", "el", "ip", "ot", "su", "un", "ay", "ok", "ak",
    "al", "aş", "aç", "ad", "ağ", "az", "et", "ek", "er", "eş",
    "iç", "is", "iş", "iz", "od", "on", "oy", "öç", "ön", "öz",
    "uç", "us", "uz", "üç", "ün", "üs", "üst", "alt", "ana", "ara",
    "bal", "baş", "bel", "beş", "bin", "bir", "bit", "biz", "bol", "boş",
    "can", "cam", "cem", "cep", "cins", "çan", "çam", "çap", "çay", "çek",
    "dil", "din", "diş", "diz", "don", "dut", "dün", "düş", "fil", "fiş",
    "gol", "göz", "gri", "gül", "gün", "güz", "hak", "hal", "han", "hap",
    "kapı", "masa", "kedi", "fare", "sarı", "mavi", "sayı", "yazı", "kutu", "boru",
    "çatı", "koyun", "keçi", "baba", "anne", "dede", "nene", "abla", "abi", "bebe"
  ],
  
  // 2-3 Heceli, ünsüz kümesi içermeyen veya basit kelimeler (Orta seviye)
  medium_words: [
    "araba", "balık", "ceviz", "çorba", "davul", "elmas", "fener", "gemi", "havuç", "ızgara",
    "jilet", "kavun", "limon", "marul", "nişan", "orman", "pilav", "radyo", "sabun", "tabak",
    "uçurtma", "vapur", "yastık", "zeytin", "biber", "çiçek", "dolap", "fırça", "gözlük", "hırka",
    "iskele", "jeton", "kalem", "lamba", "makas", "nokta", "otobüs", "pazar", "reçel", "sakız",
    "telefon", "banyo", "cadde", "daire", "eşarp", "fular", "gazete", "hamur", "ışık", "jandarma",
    "kablo", "lastik", "minder", "numara", "onarım", "paket", "rakam", "saat", "tarak", "vazo",
    "bilgi", "belge", "bulgu", "dergi", "sergi", "sevgi", "saygı", "sorgu", "korku", "tutku",
    "coşku", "baskı", "atkı", "bitki", "etki", "katkı", "tepki", "yetki", "uyku", "duygu"
  ],
  
  // Soyut, uzun, ünsüz kümeleri içeren kelimeler (Zor seviye)
  hard_words: [
    "bilgisayar", "televizyon", "buzdolabı", "çamaşır", "bulaşık", "sandalye", "pencere", "kütüphane", "hastane", "postane",
    "pastane", "eczane", "lokanta", "restoran", "sinema", "tiyatro", "stadyum", "fabrika", "atölye", "istasyon",
    "havalimanı", "terminal", "otogar", "iskele", "liman", "cadde", "sokak", "bulvar", "meydan", "kavşak",
    "arkadaşlık", "dostluk", "kardeşlik", "barış", "özgürlük", "adalet", "eşitlik", "saygı", "sevgi", "hoşgörü",
    "sorumluluk", "dürüstlük", "çalışkanlık", "yardımlaşma", "dayanışma", "cömertlik", "cesaret", "sabır", "azim", "başarı",
    "mutluluk", "huzurlu", "heyecanlı", "kararlılık", "merhamet", "nezaket", "samimiyet", "sadakat", "fedakarlık", "tevazu",
    "cumhuriyet", "demokrasi", "bağımsızlık", "egemenlik", "hakimiyet", "medeniyet", "uygarlık", "teknoloji", "ekonomi", "politika",
    "strateji", "yetenek", "beceri", "kapasite", "performans", "motivasyon", "konsantrasyon", "organizasyon", "iletişim", "etkileşim"
  ],

  // Akademik, çok uzun, yabancı kökenli veya telaffuzu zor kelimeler (Uzman seviyesi)
  expert_words: [
    "muvaffakiyet", "çekoslovakyalılaştıramadıklarımızdanmısınız", "afyonkarahisarlılaştırabildiklerimizdenmişsinizcesine",
    "cumhuriyetperver", "elektromanyetik", "biyokimyasal", "nanoteknoloji", "sürdürülebilirlik", "küreselleşme", "modernizasyon",
    "sanayileşme", "kentleşme", "demokratikleşme", "bireyselleşme", "yabancılaşma", "kurumsallaşma", "yapılandırma", "programlama", "geliştirme",
    "laboratuvar", "kütüphanecilik", "dokümantasyon", "enformasyon", "telekomünikasyon", "interdisipliner", "multidisipliner", "transdisipliner",
    "biyoçeşitlilik", "ekosistem", "fotosentez", "metabolizma", "organizma", "mikroorganizma", "bakteriyoloji", "viroloji", "immünoloji",
    "antropoloji", "arkeoloji", "sosyoloji", "psikoloji", "felsefe", "mantık", "epistemoloji", "ontoloji", "metafizik",
    "profesyonellik", "koordinasyon", "organizasyon", "rehabilitasyon", "dezenformasyon", "manipülasyon", "spekülasyon", "halüsinasyon",
    "karakteristik", "spesifik", "perspektif", "inisiyatif", "hiyerarşi", "bürokrasi", "aritmetik", "geometrik", "matematiksel", "istatistiksel"
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
    { word: "zengin", synonym: "varlıklı" }, { word: "ihtiyar", synonym: "yaşlı" }, { word: "genç", synonym: "toy" },
    { word: "güçlü", synonym: "kuvvetli" }, { word: "zayıf", synonym: "cılız" }, { word: "şişman", synonym: "kilolu" },
    { word: "ince", synonym: "zayıf" }, { word: "kalın", synonym: "kaba" }, { word: "uzun", synonym: "boylu" },
    { word: "kısa", synonym: "bodur" }, { word: "güzel", synonym: "hoş" }, { word: "çirkin", synonym: "nahoş" },
    { word: "iyi", synonym: "güzel" }, { word: "kötü", synonym: "fena" }, { word: "doğru", synonym: "gerçek" },
    { word: "yanlış", synonym: "hata" }, { word: "yalan", synonym: "uydurma" },
    { word: "hatıra", synonym: "anı" }, { word: "sebep", synonym: "neden" }, { word: "sonuç", synonym: "netice" },
    { word: "amaç", synonym: "gaye" }, { word: "araç", synonym: "vasıta" }, { word: "uçak", synonym: "tayyare" },
    { word: "lider", synonym: "önder" }, { word: "savaş", synonym: "harp" }, { word: "barış", synonym: "sulh" },
    { word: "hayat", synonym: "yaşam" }, { word: "tabiat", synonym: "doğa" }, { word: "nefes", synonym: "soluk" },
    { word: "kafa", synonym: "baş" }, { word: "kalp", synonym: "yürek" }, { word: "elbise", synonym: "giysi" },
    { word: "ayakkabı", synonym: "pabuç" }, { word: "yemek", synonym: "aş" }, { word: "isim", synonym: "ad" },
    { word: "uyarı", synonym: "ikaz" }, { word: "çağrı", synonym: "davet" }, { word: "sınav", synonym: "imtihan" },
    { word: "harf", synonym: "ses" }, { word: "hece", synonym: "seslem" }, { word: "tane", synonym: "adet" },
    { word: "fark", synonym: "ayrım" }, { word: "biçim", synonym: "şekil" }, { word: "örnek", synonym: "misal" },
    { word: "ilgi", synonym: "alaka" }, { word: "ilişki", synonym: "münasebet" }, { word: "fikir", synonym: "düşünce" },
    { word: "görüş", synonym: "kanaat" }, { word: "duygu", synonym: "his" }, { word: "akıl", synonym: "us" },
    { word: "zekâ", synonym: "anlak" }, { word: "bellek", synonym: "hafıza" }, { word: "anı", synonym: "hatıra" }
  ],

  // Zıt Anlamlılar (Genişletilmiş)
  antonyms: [
    { word: "büyük", antonym: "küçük" }, { word: "uzun", antonym: "kısa" }, { word: "şişman", antonym: "zayıf" },
    { word: "güzel", antonym: "çirkin" }, { word: "iyi", antonym: "kötü" }, { word: "doğru", antonym: "yanlış" },
    { word: "çalışkan", antonym: "tembel" }, { word: "zengin", antonym: "fakir" }, { word: "genç", antonym: "yaşlı" },
    { word: "yeni", antonym: "eski" }, { word: "açık", antonym: "kapalı" }, { word: "aşağı", antonym: "yukarı" },
    { word: "ileri", antonym: "geri" }, { word: "içeri", antonym: "dışarı" }, { word: "ön", antonym: "arka" },
    { word: "sağ", antonym: "sol" }, { word: "doğu", antonym: "batı" }, { word: "kuzey", antonym: "güney" },
    { word: "siyah", antonym: "beyaz" }, { word: "karanlık", antonym: "aydınlık" }, { word: "gece", antonym: "gündüz" },
    { word: "sabah", antonym: "akşam" }, { word: "yaz", antonym: "kış" }, { word: "sıcak", antonym: "soğuk" },
    { word: "ıslak", antonym: "kuru" }, { word: "taze", antonym: "bayat" }, { word: "acı", antonym: "tatlı" },
    { word: "ekşi", antonym: "tatlı" }, { word: "sert", antonym: "yumuşak" }, { word: "katı", antonym: "sıvı" },
    { word: "ağır", antonym: "hafif" }, { word: "dolu", antonym: "boş" }, { word: "temiz", antonym: "kirli" },
    { word: "düzenli", antonym: "dağınık" }, { word: "hızlı", antonym: "yavaş" }, { word: "erken", antonym: "geç" },
    { word: "ilk", antonym: "son" }, { word: "baş", antonym: "son" }, { word: "var", antonym: "yok" },
    { word: "çok", antonym: "az" }, { word: "artı", antonym: "eksi" }, { word: "çarpma", antonym: "bölme" },
    { word: "toplama", antonym: "çıkarma" }, { word: "gelir", antonym: "gider" }, { word: "al", antonym: "ver" },
    { word: "git", antonym: "gel" }, { word: "in", antonym: "çık" }, { word: "otur", antonym: "kalk" },
    { word: "uyu", antonym: "uyan" }, { word: "gül", antonym: "ağla" },
    { word: "dost", antonym: "düşman" }, { word: "barış", antonym: "savaş" }, { word: "cesur", antonym: "korkak" },
    { word: "cimri", antonym: "cömert" }, { word: "uysal", antonym: "hırçın" }, { word: "üretim", antonym: "tüketim" },
    { word: "yerli", antonym: "yabancı" }, { word: "öz", antonym: "üvey" }, { word: "katı", antonym: "sıvı" },
    { word: "ince", antonym: "kalın" }, { word: "yüksek", antonym: "alçak" }, { word: "derin", antonym: "sığ" },
    { word: "geniş", antonym: "dar" }, { word: "bol", antonym: "dar" }, { word: "ucuz", antonym: "pahalı" },
    { word: "ödül", antonym: "ceza" }, { word: "kar", antonym: "zarar" }, { word: "galip", antonym: "mağlup" },
    { word: "giriş", antonym: "çıkış" }, { word: "başlangıç", antonym: "bitiş" }, { word: "aktif", antonym: "pasif" },
    { word: "pozitif", antonym: "negatif" }, { word: "soyut", antonym: "somut" }, { word: "genel", antonym: "özel" },
    { word: "teorik", antonym: "pratik" }, { word: "nesnel", antonym: "öznel" }, { word: "gerçek", antonym: "hayal" }
  ],

  emojis: ["🍎", "🚗", "🏠", "⭐", "🎈", "📚", "⚽", "☀️", "🌙", "🌲", "🌺", "🎁", "⏰", "🔑", "🚲", "🎸", "👓", "☂️", "🍦", "🍕", "🍔", "🍟", "🐱", "🐶", "🦁", "🐯", "🚀", "🚁", "🚢", "🚌", "🚑", "🚒", "🚓", "🚕", "👑", "💎", "💍", "🎓", "🧢", "👟", "🦋", "🐞", "🐝", "🐌", "🐢", "🦕", "🦖", "🐙", "🐠", "🐬"],

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
