
import { ShapeType } from '../../types';

export const EMOJI_MAP: Record<string, string> = {
    "🍎": "Elma", "🍐": "Armut", "🍊": "Portakal", "🍋": "Limon", "🍌": "Muz", "🍉": "Karpuz", "🍇": "Üzüm", "🍓": "Çilek", "🫐": "Yaban Mersini", "🍈": "Kavun", "🍒": "Kiraz", "🍑": "Şeftali", "🍍": "Ananas", "🥥": "Hindistan Cevizi", "🥝": "Kivi", "🍅": "Domates", "🍆": "Patlıcan", "🥑": "Avokado", "🥦": "Brokoli", "🥕": "Havuç", "🌽": "Mısır", "🌶️": "Biber", "🥒": "Salatalık", "🥬": "Marul",
    "🚗": "Araba", "🚕": "Taksi", "🚙": "Cip", "🚌": "Otobüs", "🚎": "Troleybüs", "🏎️": "Yarış Arabası", "🚓": "Polis Arabası", "🚑": "Ambulans", "🚒": "İtfaiye", "🚐": "Minibüs", "🚚": "Kamyon", "🚛": "Tır", "🚜": "Traktör", "🏍️": "Motosiklet", "🛵": "Scooter", "🚲": "Bisiklet", "🛴": "Trotinet", "✈️": "Uçak", "🚁": "Helikopter", "🚀": "Roket", "🛸": "UFO", "⛵": "Yelkenli", "🚤": "Sürat Teknesi", "🛳️": "Gemi", "⛴️": "Feribot", "🚂": "Tren",
    "🐶": "Köpek", "🐱": "Kedi", "🐭": "Fare", "🐹": "Hamster", "🐰": "Tavşan", "🦊": "Tilki", "🐻": "Ayı", "🐼": "Panda", "🐨": "Koala", "🐯": "Kaplan", "🦁": "Aslan", "🐮": "İnek", "🐷": "Domuz", "🐸": "Kurbağa", "🐵": "Maymun", "🐔": "Tavuk", "🐧": "Penguen", "🐦": "Kuş", "🐤": "Civciv", "🦆": "Ördek", "🦅": "Kartal", "🦉": "Baykuş", "🦇": "Yarasa", "🐺": "Kurt", "🐗": "Yaban Domuzu", "🐴": "At", "🦄": "Tekboynuz", "🐝": "Arı", "🐛": "Tırtıl", "🦋": "Kelebek", "🐌": "Salyangoz", "🐞": "Uğur Böceği", "🐜": "Karınca", "🕷️": "Örümcek", "🐢": "Kaplumbağa", "🐍": "Yılan", "🦎": "Kertenkele", "🐙": "Ahtapot", "🦑": "Mürekkep Balığı", "🦐": "Karides", "🦞": "Istakoz", "🦀": "Yengeç", "🐡": "Balon Balığı", "🐠": "Balık", "🐟": "Balık", "🐬": "Yunus", "🐳": "Balina", "🦈": "Köpekbalığı", "🐊": "Timsah", "🐅": "Kaplan", "🐆": "Leopar", "🦓": "Zebra", "🦍": "Goril", "🦧": "Orangutan", "🦣": "Mamut", "🐘": "Fil", "🦛": "Suaygırı", "🦏": "Gergedan", "🐪": "Deve", "🐫": "Deve", "🦒": "Zürafa", "🦘": "Kanguru", "🦬": "Bizon", "🐂": "Öküz", "🐃": "Manda", "🐄": "İnek", "🐎": "At", "🐖": "Domuz", "🐏": "Koç", "🐑": "Koyun", "🐐": "Keçi", "🦌": "Geyik", "🐕": "Köpek", "🐩": "Kaniş", "🦮": "Rehber Köpek", "🐕‍🦺": "Hizmet Köpeği", "🐈": "Kedi", "🐓": "Horoz", "🦃": "Hindi", "🦚": "Tavuskuşu", "🦜": "Papağan", "swan": "Kuğu", "flamingo": "Flamingo",
    "⚽": "Futbol", "🏀": "Basketbol", "🏈": "Amerikan Futbolu", "⚾": "Beyzbol", "🥎": "Softbol", "Vm": "Tenis", "🏐": "Voleybol", "🏉": "Ragbi", "🎱": "Bilardo", "🏓": "Masa Tenisi", "badminton": "Badminton", "goal": "Kale", "boxing": "Boks", "karate": "Karate", "gymnastics": "Jimnastik", "skating": "Paten", "skiing": "Kayak",
    "🏠": "Ev", "🏡": "Bahçeli Ev", "🏢": "Bina", "🏣": "Postane", "🏥": "Hastane", "bank": "Banka", "school": "Okul", "hotel": "Otel", "church": "Kilise", "mosque": "Cami", "temple": "Tapınak", "castle": "Kale", "factory": "Fabrika",
    "⌚": "Saat", "📱": "Telefon", "💻": "Bilgisayar", "⌨️": "Klavye", "🖥️": "Masaüstü", "🖨️": "Yazıcı", "🖱️": "Fare", "🕹️": "Joystick", "📷": "Kamera", "📹": "Video Kamera", "📼": "Kaset", "🔍": "Büyüteç", "🔎": "Büyüteç", "🕯️": "Mum", "💡": "Ampul", "🔦": "Fener", "🏮": "Fener", "📔": "Defter", "📕": "Kitap", "📖": "Açık Kitap", "📚": "Kitaplar", "💰": "Para", "💵": "Dolar", "💶": "Euro", "💷": "Sterlin", "💸": "Para", "💳": "Kredi Kartı", "🧾": "Fiş", "✉️": "Zarf", "📧": "E-posta", "📦": "Paket", "✏️": "Kurşun Kalem", "✒️": "Dolma Kalem", "🖊️": "Tükenmez Kalem", "🖌️": "Fırça", "🖍️": "Pastel Boya", "📝": "Not", "💼": "Çanta", "📁": "Dosya", "📂": "Açık Dosya", "📅": "Takvim", "📌": "Rabiye", "📍": "Konum", "📎": "Ataş", "📏": "Cetvel", "📐": "Gönye", "✂️": "Makas", "🔒": "Kilit", "🔓": "Açık Kilit", "🔑": "Anahtar", "🔨": "Çekiç", "🪓": "Balta", "⛏️": "Kazma", "⚒️": "Çekiç ve Kazma", "🛠️": "Çekiç ve İngiliz Anahtarı", "🗡️": "Hançer", "⚔️": "Kılıçlar", "🔫": "Tabanca", "🏹": "Yay ve Ok", "🛡️": "Kalkan", "🔧": "İngiliz Anahtarı", "nut_and_bolt": "Somun ve Cıvata", "gear": "Dişli",
    "🪑": "Sandalye", "🛋️": "Kanepe", "🛏️": "Yatak", "🚪": "Kapı", "🪞": "Ayna", "🪟": "Pencere", "🧼": "Sabun", "🧽": "Sünger", "🪣": "Kova", "🧹": "Süpürge", "🧺": "Sepet", "🧻": "Tuvalet Kağıdı", "🛁": "Küvet", "🚿": "Duş", "🚽": "Tuvalet",
    "👑": "Taç", "👒": "Şapka", "🎩": "Sihirbaz Şapkası", "🧢": "Kep", "helm": "Kask", "tie": "Kravat", "shirt": "Gömlek", "jeans": "Kot", "dress": "Elbise", "kimono": "Kimono", "bikini": "Bikini", "shorts": "Şort", "sock": "Çorap", "shoe": "Ayakkabı", "sandal": "Sandalet", "boot": "Bot", "glasses": "Gözlük", "sunglasses": "Güneş Gözlüğü", "scarf": "Atkı", "gloves": "Eldiven", "coat": "Mont", "lab_coat": "Önlük", "vest": "Yelek", "purse": "Cüzdan", "handbag": "El Çantası",
    "😀": "Gülen Yüz", "😃": "Gülen Yüz", "😄": "Gülen Yüz", "😁": "Sırıtan Yüz", "😆": "Gözleri Kısık Gülen Yüz", "😅": "Terli Gülen Yüz", "🤣": "Gülmekten Kırılan Yüz", "😂": "Gözünden Yaş Gelen Yüz", "🙂": "Hafifçe Gülen Yüz", "🙃": "Ters Yüz", "😉": "Göz Kırpan Yüz", "😊": "Utangaç Gülen Yüz", "😇": "Melek Yüz", "🥰": "Kalpli Gülen Yüz", "😍": "Aşık Yüz", "🤩": "Yıldızlı Yüz", "😘": "Öpücük Atan Yüz", "😗": "Öpen Yüz", "☺️": "Gülen Yüz", "Vk": "Öpen Yüz", "😙": "Öpen Yüz", "🥲": "Gözünden Yaş Gelen Gülen Yüz", "😋": "Lezzetli Yüz", "😛": "Dil Çıkaran Yüz", "😜": "Göz Kırpıp Dil Çıkaran Yüz", "🤪": "Çılgın Yüz", "😝": "Gözleri Kısık Dil Çıkaran Yüz", "🤑": "Paralı Yüz", "🤗": "Sarılma", "🤭": "Eliyle Ağzını Kapatan Yüz", "🤫": "Sus İşareti Yapan Yüz", "🤔": "Düşünen Yüz", "🤐": "Ağzı Fermuarlı Yüz", "🤨": "Kaşı Havada Yüz", "😐": "Nötr Yüz", "😑": "İfadesiz Yüz", "😶": "Ağzı Olmayan Yüz", "😏": "Sırıtan Yüz", "unamused": "Memnuniyetsiz Yüz", "roll_eyes": "Göz Deviren Yüz", "grimacing": "Yüzünü Ekşiten Yüz", "lying_face": "Yalancı Yüz", "relieved": "Rahatlamış Yüz", "pensive": "Dalgın Yüz", "sleepy": "Uykulu Yüz", "drooling_face": "Salya Akıtan Yüz", "sleeping": "Uyuyan Yüz", "mask": "Maskeli Yüz", "thermometer_face": "Ateşi Olan Yüz", "head_bandage": "Başı Sargılı Yüz", "nauseated_face": "Midesi Bulanan Yüz", "vomiting_face": "Kusan Yüz", "sneezing_face": "Hapşıran Yüz", "hot_face": "Terleyen Yüz", "cold_face": "Üşüyen Yüz", "woozy_face": "Sersemlemiş Yüz", "dizzy_face": "Başı Dönen Yüz", "exploding_head": "Beyni Patlayan Yüz", "cowboy_hat_face": "Kovboy Şapkalı Yüz", "party_face": "Parti Yüzü", "sunglasses_face": "Güneş Gözlüklü Yüz", "nerd_face": "İnek Öğrenci Yüzü", "monocle_face": "Monokllü Yüz", "confused": "Şaşkın Yüz", "worried": "Endişeli Yüz", "slightly_frowning_face": "Hafifçe Asık Suratlı Yüz", "frowning_face": "Asık Suratlı Yüz", "open_mouth": "Ağzı Açık Yüz", "hushed": "Sessiz Yüz", "astonished": "Şaşırmış Yüz", "flushed": "Kızarmış Yüz", "pleading_face": "Yalvaran Yüz", "frowning": "Kaşları Çatık Yüz", "anguished": "Acı Çeken Yüz", "fearful": "Korkmuş Yüz", "cold_sweat": "Soğuk Terleyen Yüz", "disappointed_relieved": "Hayal Kırıklığına Uğramış Yüz", "cry": "Ağlayan Yüz", "sob": "Hüngür Hüngür Ağlayan Yüz", "scream": "Çığlık Atan Yüz", "confounded": "Kafası Karışık Yüz", "persevere": "Azimli Yüz", "disappointed": "Hayal Kırıklığına Uğramış Yüz", "sweat": "Terleyen Yüz", "weary": "Yorgun Yüz", "tired_face": "Yorgun Yüz", "yawning_face": "Esneme Yüzü", "triumph": "Zafer Yüzü", "pout": "Somurtan Yüz", "angry": "Kızgın Yüz", "cursing_face": "Küfreden Yüz", "smiling_imp": "Gülen Şeytan", "imp": "Şeytan", "skull": "Kafatası", "skull_and_crossbones": "Kuru Kafa ve Kemikler", "poop": "Dışkı", "clown_face": "Palyaço Yüzü", "ogre": "Dev", "goblin": "Cin", "ghost": "Hayalet", "alien": "Uzaylı", "space_invader": "Uzay İstilacısı", "robot": "Robot",
    "⭐": "Yıldız", "🌟": "Parlayan Yıldız", "✨": "Işıltı", "⚡": "Şimşek", "☄️": "Kuyruklu Yıldız", "🌠": "Kayan Yıldız", "🔥": "Ateş", "💧": "Su Damlası", "🌊": "Dalga", "🎄": "Noel Ağacı", "🎃": "Balkabağı", "🎆": "Havai Fişek", "🎇": "Maytap", "🎈": "Balon", "🎉": "Konfeti", "🎊": "Konfeti Topu", "🎋": "Tanabata Ağacı", "🎍": "Çam Süslemesi", "🎎": "Japon Bebekleri", "🎏": "Sazan Bayrağı", "🎐": "Rüzgar Çanı", "🎑": "Ay İzleme Töreni", "🧧": "Kırmızı Zarf", "🎀": "Kurdele", "🎁": "Hediye", "🎗️": "Hatırlatma Kurdelesi", "🎟️": "Bilet", "🎫": "Bilet",
    "❤️": "Kalp", "🧡": "Turuncu Kalp", "💛": "Sarı Kalp", "💚": "Yeşil Kalp", "💙": "Mavi Kalp", "💜": "Mor Kalp", "🖤": "Siyah Kalp", "🤍": "Beyaz Kalp", "🤎": "Kahverengi Kalp", "💔": "Kırık Kalp", "❣️": "Ünlem Kalp", "💕": "İki Kalp", "💞": "Dönen Kalpler", "💓": "Atan Kalp", "💗": "Büyüyen Kalp", "💖": "Parlayan Kalp", "💘": " oklu Kalp", "💝": "Kurdeleli Kalp", "💟": "Kalp Dekoru",
};

// Expanded TR_VOCAB with categories for offline generation
export const TR_VOCAB = {
    animals: ["kedi", "köpek", "kuş", "balık", "tavşan", "at", "eşek", "inek", "koyun", "tavuk", "horoz", "civciv", "ördek", "kaz", "hindi", "arı", "kelebek", "karınca", "örümcek", "yılan", "kaplumbağa", "kurbağa", "timsah", "aslan", "kaplan", "fil", "zürafa", "maymun", "ayı", "kurt", "tilki", "geyik", "sincap", "fare", "yunus", "balina", "köpekbalığı", "ahtapot", "yengeç", "penguen"],
    fruits_veggies: ["elma", "armut", "muz", "çilek", "kiraz", "vişne", "karpuz", "kavun", "üzüm", "portakal", "mandalina", "limon", "şeftali", "kayısı", "erik", "incir", "nar", "ayva", "kivi", "ananas", "domates", "salatalık", "biber", "patlıcan", "kabak", "fasulye", "bezelye", "havuç", "patates", "soğan", "sarımsak", "ıspanak", "pırasa", "lahana", "karnabahar", "brokoli", "marul", "maydanoz", "dereotu", "nane"],
    jobs: ["doktor", "hemşire", "dişçi", "öğretmen", "polis", "asker", "itfaiyeci", "pilot", "kaptan", "şoför", "aşçı", "garson", "fırıncı", "kasap", "manav", "bakkal", "berber", "kuaför", "terzi", "tamirci", "mühendis", "mimar", "avukat", "hakim", "savcı", "yazar", "gazeteci", "şarkıcı", "ressam", "sporcu", "çiftçi", "balıkçı", "marangoz", "elektrikçi", "postacı", "kurye", "bankacı", "muhasebeci", "sekreter", "veteriner"],
    school: ["okul", "sınıf", "öğretmen", "öğrenci", "müdür", "ders", "teneffüs", "zil", "kitap", "defter", "kalem", "silgi", "kalemtıraş", "çanta", "beslenme", "suluk", "tahta", "tebeşir", "sıra", "masa", "sandalye", "bilgisayar", "tablet", "proje", "ödev", "sınav", "karne", "tatil", "kütüphane", "laboratuvar", "spor salonu", "kantin", "bahçe", "oyun", "arkadaş", "servis", "tören", "bayrak", "istiklal marşı", "atatürk"],
    items_household: ["masa", "sandalye", "koltuk", "kanepe", "yatak", "dolap", "halı", "perde", "lamba", "televizyon", "bilgisayar", "telefon", "saat", "ayna", "tablo", "vazo", "çiçek", "kitaplık", "sehpa", "ütü", "süpürge", "çamaşır makinesi", "bulaşık makinesi", "buzdolabı", "fırın", "ocak", "tencere", "tava", "tabak", "bardak", "çatal", "kaşık", "bıçak", "yastık", "yorgan", "battaniye", "havlu", "sabun", "şampuan", "diş fırçası"],
    vehicles: ["araba", "otobüs", "kamyon", "tır", "minibüs", "taksi", "motosiklet", "bisiklet", "tren", "metro", "tramvay", "uçak", "helikopter", "gemi", "vapur", "tekne", "yat", "kayık", "traktör", "iş makinesi", "ambulans", "itfaiye", "polis arabası", "çöp kamyonu", "vinç", "dozer", "kepçe", "kamyonet", "karavan", "limuzin", "spor araba", "yarış arabası", "at arabası", "fayton", "kızak", "teleferik", "balon", "zeplin", "roket", "uzay mekiği"],
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
    synonyms: [
        { word: "siyah", synonym: "kara" }, { word: "beyaz", synonym: "ak" }, { word: "kırmızı", synonym: "al" },
        { word: "okul", synonym: "mektep" }, { word: "öğrenci", synonym: "talebe" }, { word: "öğretmen", synonym: "muallim" },
        { word: "doktor", synonym: "hekim" }, { word: "cevap", synonym: "yanıt" }, { word: "soru", synonym: "sual" },
        { word: "kelime", synonym: "sözcük" }, { word: "cümle", synonym: "tümce" }, { word: "hikaye", synonym: "öykü" },
        { word: "zaman", synonym: "vakit" }, { word: "yıl", synonym: "sene" }, { word: "sonbahar", synonym: "güz" }
    ],
    antonyms: [
        { word: "büyük", antonym: "küçük" }, { word: "uzun", antonym: "kısa" }, { word: "şişman", antonym: "zayıf" },
        { word: "güzel", antonym: "çirkin" }, { word: "iyi", antonym: "kötü" }, { word: "doğru", antonym: "yanlış" },
        { word: "çalışkan", antonym: "tembel" }, { word: "zengin", antonym: "fakir" }, { word: "genç", antonym: "yaşlı" },
        { word: "yeni", antonym: "eski" }, { word: "açık", antonym: "kapalı" }, { word: "aşağı", antonym: "yukarı" },
        { word: "ileri", antonym: "geri" }, { word: "içeri", antonym: "dışarı" }, { word: "ön", antonym: "arka" }
    ],
    colors_detailed: [
        { name: 'KIRMIZI', css: 'red' }, { name: 'MAVİ', css: 'blue' }, { name: 'YEŞİL', css: 'green' }, { name: 'SARI', css: 'gold' },
        { name: 'TURUNCU', css: 'orange' }, { name: 'MOR', css: 'purple' }, { name: 'PEMBE', css: 'pink' }, { name: 'SİYAH', css: 'black' },
        { name: 'TURKUAZ', css: 'turquoise' }, { name: 'GRİ', css: 'gray' }, { name: 'KAHVERENGİ', css: 'saddlebrown' }, { name: 'LACİVERT', css: 'navy' }
    ],
    homonyms: ["yüz", "çay", "düş", "at", "ben", "bin", "dil", "diz", "ekmek", "el", "in", "iç", "kara", "kır", "kız", "ocak", "oy", "pazar", "saç", "satır", "soluk", "sürü", "yaş", "yaz", "yol"],
    easy_words: ["at", "ev", "el", "ip", "ot", "su", "un", "ay", "ok", "ak", "al", "aş", "aç", "ad", "ağ", "az"],
    hard_words: ["bilgisayar", "televizyon", "buzdolabı", "çamaşır", "bulaşık", "sandalye", "pencere", "kütüphane", "hastane", "postane"],
    expert_words: ["muvaffakiyet", "elektromanyetik", "biyokimyasal", "nanoteknoloji", "sürdürülebilirlik", "küreselleşme", "modernizasyon"]
};

export const turkishAlphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';
export const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];
export const EMOJIS = Object.keys(EMOJI_MAP);
export const COLORS = TR_VOCAB.colors_detailed;
export const HOMONYMS = TR_VOCAB.homonyms;
export const ITEM_CATEGORIES = ['animals', 'fruits_veggies', 'jobs', 'school', 'items_household', 'vehicles'];
export const CATEGORY_NAMES: Record<string, string> = {
    'animals': 'Hayvanlar', 'fruits_veggies': 'Meyve & Sebze', 'jobs': 'Meslekler',
    'school': 'Okul', 'items_household': 'Ev Eşyaları', 'vehicles': 'Araçlar'
};
export const VISUALLY_SIMILAR_CHARS: Record<string, string[]> = {
    'b': ['d', 'p', 'q'], 'd': ['b', 'p', 'q'], 'p': ['b', 'd', 'q'], 'q': ['p', 'b', 'd'],
    'm': ['n', 'u'], 'n': ['m', 'u'], 'u': ['n', 'ü'], 'ü': ['u', 'ö'],
    'o': ['ö', 'c'], 'ö': ['o', 'u'], 's': ['ş'], 'ş': ['s'], 'z': ['2', '7']
};
export const CONNECT_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

// Helper Functions
export const shuffle = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const getRandomItems = <T>(arr: T[], count: number): T[] => {
    if (!arr || arr.length === 0) return [];
    if (count >= arr.length) return shuffle(arr);
    return shuffle(arr).slice(0, count);
};

export const simpleSyllabify = (text: string): string[] => {
    // Basic mock implementation for offline demo
    const parts = [];
    for(let i=0; i<text.length; i+=2) parts.push(text.substring(i, Math.min(i+2, text.length)));
    return parts;
};

// ... Rest of helpers (getDifficultySettings, generateMaze etc.) ...
// Keeping them concise for this update block
export const getDifficultySettings = (difficulty: string) => {
    if (difficulty === 'Başlangıç') return { gridSize: 8, wordLength: {min:3, max:5}, directions: [0,1], numberRange: {min:1, max:10}, sudokuSize: 4, pyramidRows: 3, mazeComplexity: 5, operations: ['+'] };
    if (difficulty === 'Orta') return { gridSize: 12, wordLength: {min:4, max:7}, directions: [0,1,2], numberRange: {min:1, max:50}, sudokuSize: 6, pyramidRows: 4, mazeComplexity: 10, operations: ['+', '-'] };
    if (difficulty === 'Zor') return { gridSize: 15, wordLength: {min:6, max:9}, directions: [0,1,2,3,4,5], numberRange: {min:10, max:100}, sudokuSize: 9, pyramidRows: 5, mazeComplexity: 15, operations: ['+', '-', '*'] };
    return { gridSize: 18, wordLength: {min:8, max:14}, directions: [0,1,2,3,4,5,6,7], numberRange: {min:100, max:1000}, sudokuSize: 9, pyramidRows: 6, mazeComplexity: 20, operations: ['+', '-', '*', '/'] };
};

export const getWordsForDifficulty = (difficulty: string, topic?: string): string[] => {
    let pool: string[] = [];
    if (topic && topic !== 'Rastgele' && topic in TR_VOCAB) {
        pool = (TR_VOCAB as any)[topic] || [];
    } else {
        Object.values(TR_VOCAB).forEach(val => { 
            if (Array.isArray(val)) {
                const strings = val.filter((v): v is string => typeof v === 'string');
                pool.push(...strings); 
            } 
        });
    }
    return [...new Set(pool)];
};

export const generateCrosswordLayout = (words: string[]) => {
    // Mock layout generator
    return { 
        gridObj: {}, 
        placements: words.map((w, i) => ({ word: w, row: i*2, col: 0, dir: i%2===0?'across':'down' as 'across'|'down' })) 
    };
};

export const wordToRebus = (word: string) => [{ type: 'text' as const, value: word }]; // Simplified
export const generateSmartConnectGrid = (dim: number, count: number) => {
    const res = [];
    for(let i=0; i<count; i++) {
        res.push({pairIndex: i, x: 0, y: i*2, isStart: true});
        res.push({pairIndex: i, x: 5, y: i*2, isStart: false});
    }
    return res;
};
export const generateMaze = (r: number, c: number) => Array(r).fill(Array(c).fill(0));
export const generateLatinSquare = (n: number) => Array(n).fill(Array(n).fill(1));
export const generateRandomPattern = (dim: number, den: number) => [];
export const generateSudokuGrid = (n: number, d: string) => Array(n).fill(Array(n).fill(null));
