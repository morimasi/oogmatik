
import { ShapeType } from '../../types';
import { TR_VOCAB as RAW_VOCAB } from '../../data/vocabulary';

export interface VocabData {
    animals: string[];
    fruits_veggies: string[];
    jobs: string[];
    school: string[];
    items_household: string[];
    vehicles: string[];
    easy_words: string[];
    medium_words: string[];
    hard_words: string[];
    expert_words: string[];
    confusing_words: string[][];
    synonyms: { word: string; synonym: string }[];
    antonyms: { word: string; antonym: string }[];
    colors_detailed: { name: string; css: string }[];
    homonyms: string[];
    [key: string]: any;
}

export const TR_VOCAB = RAW_VOCAB as VocabData;

// Genişletilmiş Emoji Haritası (Görsel kütüphane)
export const EMOJI_MAP: Record<string, string> = {
    "🍎": "Elma", "🍐": "Armut", "🍊": "Portakal", "🍋": "Limon", "🍌": "Muz", "🍉": "Karpuz", "🍇": "Üzüm", "🍓": "Çilek", "🫐": "Yaban Mersini", "🍈": "Kavun", "🍒": "Kiraz", "🍑": "Şeftali", "🍍": "Ananas", "🥥": "Hindistan Cevizi", "🥝": "Kivi", "🍅": "Domates", "🍆": "Patlıcan", "🥑": "Avokado", "🥦": "Brokoli", "🥕": "Havuç", "🌽": "Mısır", "🌶️": "Biber", "🥒": "Salatalık", "🥬": "Marul", "🥔": "Patates", "🧄": "Sarımsak", "🧅": "Soğan", "🍄": "Mantar", "🥜": "Fıstık", "🌰": "Kestane", "🍞": "Ekmek", "🥐": "Kruvasan", "🥖": "Baget", "🥨": "Simit", "🥯": "Poğaça", "🥞": "Pankek", "🧇": "Waffle", "🧀": "Peynir", "🍖": "Et", "🍗": "Tavuk But", "🥩": "Biftek", "🥓": "Pastırma", "🍔": "Hamburger", "🍟": "Patates Kızartması", "🍕": "Pizza", "🌭": "Sosisli", "🥪": "Sandviç", "🌮": "Tako", "🌯": "Dürüm", "🥚": "Yumurta", "🍳": "Sahanda Yumurta", "🥘": "Yemek", "🍲": "Çorba", "🥗": "Salata", "🍿": "Patlamış Mısır", "🧈": "Tereyağı", "🧂": "Tuz", "🥫": "Konserve",
    "🚗": "Araba", "🚕": "Taksi", "🚙": "Cip", "🚌": "Otobüs", "🚎": "Troleybüs", "🏎️": "Yarış Arabası", "🚓": "Polis Arabası", "🚑": "Ambulans", "🚒": "İtfaiye", "🚐": "Minibüs", "🚚": "Kamyon", "🚛": "Tır", "🚜": "Traktör", "🏍️": "Motosiklet", "🛵": "Scooter", "🚲": "Bisiklet", "🛴": "Trotinet", "✈️": "Uçak", "🚁": "Helikopter", "🚀": "Roket", "🛸": "UFO", "⛵": "Yelkenli", "🚤": "Sürat Teknesi", "🛳️": "Gemi", "⛴️": "Feribot", "🚂": "Tren", "🚅": "Hızlı Tren", "🚈": "Tramvay", "🚝": "Monoray", "🚠": "Teleferik", "🚡": "Teleferik",
    "🐶": "Köpek", "🐱": "Kedi", "🐭": "Fare", "🐹": "Hamster", "🐰": "Tavşan", "🦊": "Tilki", "🐻": "Ayı", "🐼": "Panda", "🐨": "Koala", "🐯": "Kaplan", "🦁": "Aslan", "🐮": "İnek", "🐷": "Domuz", "🐸": "Kurbağa", "🐵": "Maymun", "🐔": "Tavuk", "🐧": "Penguen", "🐦": "Kuş", "🐤": "Civciv", "🦆": "Ördek", "🦅": "Kartal", "🦉": "Baykuş", "🦇": "Yarasa", "🐺": "Kurt", "🐗": "Yaban Domuzu", "🐴": "At", "🦄": "Tekboynuz", "🐝": "Arı", "🐛": "Tırtıl", "🦋": "Kelebek", "🐌": "Salyangoz", "🐞": "Uğur Böceği", "🐜": "Karınca", "🕷️": "Örümcek", "🐢": "Kaplumbağa", "🐍": "Yılan", "🦎": "Kertenkele", "🐙": "Ahtapot", "🦑": "Mürekkep Balığı", "🦐": "Karides", "🦞": "Istakoz", "🦀": "Yengeç", "🐡": "Balon Balığı", "🐠": "Balık", "🐟": "Balık", "🐬": "Yunus", "🐳": "Balina", "🦈": "Köpekbalığı", "🐊": "Timsah", "🐅": "Kaplan", "🐆": "Leopar", "🦓": "Zebra", "🦍": "Goril", "🦧": "Orangutan", "🦣": "Mamut", "🐘": "Fil", "🦛": "Suaygırı", "🦏": "Gergedan", "🐪": "Deve", "🐫": "Deve", "🦒": "Zürafa", "🦘": "Kanguru", "🦬": "Bizon", "🐂": "Öküz", "🐃": "Manda", "🐄": "İnek", "🐎": "At", "🐖": "Domuz", "🐏": "Koç", "🐑": "Koyun", "🐐": "Keçi", "🦌": "Geyik", "🐕": "Köpek", "🐩": "Kaniş", "🦮": "Rehber Köpek", "🐕‍🦺": "Hizmet Köpeği", "🐈": "Kedi", "🐓": "Horoz", "🦃": "Hindi", "🦚": "Tavuskuşu", "🦜": "Papağan", "🦢": "Kuğu", "🦩": "Flamingo",
    "⚽": "Futbol", "🏀": "Basketbol", "🏈": "Amerikan Futbolu", "⚾": "Beyzbol", "🥎": "Softbol", "🎾": "Tenis", "🏐": "Voleybol", "🏉": "Ragbi", "🎱": "Bilardo", "🏓": "Masa Tenisi", "🏸": "Badminton", "🥅": "Kale", "🥊": "Boks", "🥋": "Karate", "🤸": "Jimnastik", "⛸️": "Paten", "🎿": "Kayak", "🛷": "Kızak", "🥌": "Körling", "🎯": "Dart", "🪀": "Yo-yo", "🪁": "Uçurtma", "🔫": "Su Tabancası", "🔮": "Kristal Küre", "🎮": "Oyun Kolu", "🎰": "Slot Makinesi", "🎲": "Zar", "🧩": "Yapboz", "🧸": "Oyuncak Ayı", "🪅": "Pinyata", "🪄": "Sihirli Değnek",
    "🏠": "Ev", "🏡": "Bahçeli Ev", "🏢": "Bina", "🏣": "Postane", "🏥": "Hastane", "🏦": "Banka", "🏫": "Okul", "🏨": "Otel", "⛪": "Kilise", "🕌": "Cami", "🕍": "Tapınak", "🏰": "Kale", "🏭": "Fabrika", "🗼": "Kule", "🗽": "Özgürlük Heykeli", "🏟️": "Stadyum", "🏛️": "Müze", "🏗️": "İnşaat", "🏘️": "Evler", "⛺": "Çadır",
    "⌚": "Kol Saati", "📱": "Telefon", "💻": "Bilgisayar", "⌨️": "Klavye", "🖥️": "Masaüstü", "🖨️": "Yazıcı", "🖱️": "Fare", "🕹️": "Joystick", "📷": "Kamera", "📹": "Video Kamera", "📼": "Kaset", "🔍": "Büyüteç", "🔎": "Büyüteç", "🕯️": "Mum", "💡": "Ampul", "🔦": "Fener", "🏮": "Fener", "📔": "Defter", "📕": "Kitap", "📖": "Açık Kitap", "📚": "Kitaplar", "💰": "Para", "💵": "Dolar", "💶": "Euro", "💷": "Sterlin", "💸": "Para", "💳": "Kredi Kartı", "🧾": "Fiş", "✉️": "Zarf", "📧": "E-posta", "📦": "Paket", "✏️": "Kurşun Kalem", "✒️": "Dolma Kalem", "🖊️": "Tükenmez Kalem", "🖌️": "Fırça", "🖍️": "Pastel Boya", "📝": "Not", "💼": "Çanta", "📁": "Dosya", "📂": "Açık Dosya", "📅": "Takvim", "📌": "Rabiye", "📍": "Konum", "📎": "Ataş", "📏": "Cetvel", "📐": "Gönye", "✂️": "Makas", "🔒": "Kilit", "🔓": "Açık Kilit", "🔑": "Anahtar", "🔨": "Çekiç", "🪓": "Balta", "⛏️": "Kazma", "⚒️": "Çekiç ve Kazma", "🛠️": "Çekiç ve İngiliz Anahtarı", "🗡️": "Hançer", "⚔️": "Kılıçlar", "🏹": "Yay ve Ok", "🛡️": "Kalkan", "🔧": "İngiliz Anahtarı", "🔩": "Somun ve Cıvata", "⚙️": "Dişli",
    "🪑": "Sandalye", "🛋️": "Kanepe", "🛏️": "Yatak", "🚪": "Kapı", "🪞": "Ayna", "🪟": "Pencere", "🧼": "Sabun", "🧽": "Sünger", "🪣": "Kova", "🧹": "Süpürge", "🧺": "Sepet", "🧻": "Tuvalet Kağıdı", "🛁": "Küvet", "🚿": "Duş", "🚽": "Tuvalet",
    "👑": "Taç", "👒": "Şapka", "🎩": "Sihirbaz Şapkası", "🧢": "Kep", "⛑️": "Kask", "👔": "Kravat", "👕": "Gömlek", "👖": "Kot", "👗": "Elbise", "👘": "Kimono", "👙": "Bikini", "🩳": "Şort", "🧦": "Çorap", "👞": "Ayakkabı", "👡": "Sandalet", "👢": "Bot", "👓": "Gözlük", "🕶️": "Güneş Gözlüğü", "🧣": "Atkı", "🧤": "Eldiven", "🧥": "Mont", "🥼": "Önlük", "🦺": "Yelek", "👛": "Cüzdan", "👜": "El Çantası", "🎒": "Sırt Çantası",
    "😀": "Gülen Yüz", "😃": "Gülen Yüz", "😄": "Gülen Yüz", "😁": "Sırıtan Yüz", "😆": "Gözleri Kısık Gülen Yüz", "😅": "Terli Gülen Yüz", "🤣": "Gülmekten Kırılan Yüz", "😂": "Gözünden Yaş Gelen Yüz", "🙂": "Hafifçe Gülen Yüz", "🙃": "Ters Yüz", "😉": "Göz Kırpan Yüz", "😊": "Utangaç Gülen Yüz", "😇": "Melek Yüz", "🥰": "Kalpli Gülen Yüz", "😍": "Aşık Yüz", "🤩": "Yıldızlı Yüz", "😘": "Öpücük Atan Yüz", "😗": "Öpen Yüz", "☺️": "Gülen Yüz", "😙": "Öpen Yüz", "🥲": "Gözünden Yaş Gelen Gülen Yüz", "😋": "Lezzetli Yüz", "😛": "Dil Çıkaran Yüz", "😜": "Göz Kırpıp Dil Çıkaran Yüz", "🤪": "Çılgın Yüz", "😝": "Gözleri Kısık Dil Çıkaran Yüz", "🤑": "Paralı Yüz", "🤗": "Sarılma", "🤭": "Eliyle Ağzını Kapatan Yüz", "🤫": "Sus İşareti Yapan Yüz", "🤔": "Düşünen Yüz", "🤐": "Ağzı Fermuarlı Yüz", "🤨": "Kaşı Havada Yüz", "😐": "Nötr Yüz", "😑": "İfadesiz Yüz", "😶": "Ağzı Olmayan Yüz", "😏": "Sırıtan Yüz", "😒": "Memnuniyetsiz Yüz", "🙄": "Göz Deviren Yüz", "😬": "Yüzünü Ekşiten Yüz", "🤥": "Yalancı Yüz", "😌": "Rahatlamış Yüz", "😔": "Dalgın Yüz", "😪": "Uykulu Yüz", "🤤": "Salya Akıtan Yüz", "😴": "Uyuyan Yüz", "😷": "Maskeli Yüz", "🤒": "Ateşi Olan Yüz", "🤕": "Başı Sargılı Yüz", "🤢": "Midesi Bulanan Yüz", "🤮": "Kusan Yüz", "🤧": "Hapşıran Yüz", "🥵": "Terleyen Yüz", "🥶": "Üşüyen Yüz", "🥴": "Sersemlemiş Yüz", "😵": "Başı Dönen Yüz", "🤯": "Beyni Patlayan Yüz", "🤠": "Kovboy Şapkalı Yüz", "🥳": "Parti Yüzü", "😎": "Güneş Gözlüklü Yüz", "🤓": "İnek Öğrenci Yüzü", "🧐": "Monokllü Yüz", "😕": "Şaşkın Yüz", "😟": "Endişeli Yüz", "🙁": "Hafifçe Asık Suratlı Yüz", "☹️": "Asık Suratlı Yüz", "😮": "Ağzı Açık Yüz", "😯": "Sessiz Yüz", "😲": "Şaşırmış Yüz", "😳": "Kızarmış Yüz", "🥺": "Yalvaran Yüz", "😦": "Kaşları Çatık Yüz", "😧": "Acı Çeken Yüz", "😨": "Korkmuş Yüz", "😰": "Soğuk Terleyen Yüz", "😥": "Hayal Kırıklığına Uğramış Yüz", "😢": "Ağlayan Yüz", "😭": "Hüngür Hüngür Ağlayan Yüz", "😱": "Çığlık Atan Yüz", "😖": "Kafası Karışık Yüz", "😣": "Azimli Yüz", "😞": "Hayal Kırıklığına Uğramış Yüz", "😓": "Terleyen Yüz", "😩": "Yorgun Yüz", "😫": "Yorgun Yüz", "🥱": "Esneme Yüzü", "😤": "Zafer Yüzü", "😡": "Somurtan Yüz", "😠": "Kızgın Yüz", "🤬": "Küfreden Yüz", "😈": "Gülen Şeytan", "👿": "Şeytan", "💀": "Kafatası", "☠️": "Kuru Kafa ve Kemikler", "💩": "Dışkı", "🤡": "Palyaço Yüzü", "👹": "Dev", "👺": "Cin", "👻": "Hayalet", "👽": "Uzaylı", "👾": "Uzay İstilacısı", "🤖": "Robot",
    "⭐": "Yıldız", "🌟": "Parlayan Yıldız", "✨": "Işıltı", "⚡": "Şimşek", "☄️": "Kuyruklu Yıldız", "🌠": "Kayan Yıldız", "🔥": "Ateş", "💧": "Su Damlası", "🌊": "Dalga", "🎄": "Noel Ağacı", "🎃": "Balkabağı", "🎆": "Havai Fişek", "🎇": "Maytap", "🎈": "Balon", "🎉": "Konfeti", "🎊": "Konfeti Topu", "🎋": "Tanabata Ağacı", "🎍": "Çam Süslemesi", "🎎": "Japon Bebekleri", "🎏": "Sazan Bayrağı", "🎐": "Rüzgar Çanı", "🎑": "Ay İzleme Töreni", "🧧": "Kırmızı Zarf", "🎀": "Kurdele", "🎁": "Hediye", "🎗️": "Hatırlatma Kurdelesi", "🎟️": "Bilet", "🎫": "Bilet",
    "❤️": "Kalp", "🧡": "Turuncu Kalp", "💛": "Sarı Kalp", "💚": "Yeşil Kalp", "💙": "Mavi Kalp", "💜": "Mor Kalp", "🖤": "Siyah Kalp", "🤍": "Beyaz Kalp", "🤎": "Kahverengi Kalp", "💔": "Kırık Kalp", "❣️": "Ünlem Kalp", "💕": "İki Kalp", "💞": "Dönen Kalpler", "💓": "Atan Kalp", "💗": "Büyüyen Kalp", "💖": "Parlayan Kalp", "💘": " oklu Kalp", "💝": "Kurdeleli Kalp", "💟": "Kalp Dekoru",
};

export const turkishAlphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';
export const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];
export const EMOJIS = Object.keys(EMOJI_MAP);
export const COLORS: { name: string; css: string }[] = TR_VOCAB.colors_detailed;
export const HOMONYMS: string[] = TR_VOCAB.homonyms;
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
    const parts = [];
    let i = 0;
    while (i < text.length) {
        const len = (Math.random() > 0.5 && i + 3 <= text.length) ? 3 : 2;
        parts.push(text.substring(i, Math.min(i + len, text.length)));
        i += len;
    }
    return parts;
};

// --- DIFFICULTY & CONFIGURATION SETTINGS ---
export const getDifficultySettings = (difficulty: string) => {
    if (difficulty === 'Başlangıç') {
        return { 
            gridSize: 6,
            wordLength: {min: 2, max: 4}, 
            directions: [0, 1],
            numberRange: {min: 1, max: 10}, 
            sudokuSize: 4, 
            pyramidRows: 3, 
            mazeComplexity: 5, 
            operations: ['+'] 
        };
    }
    if (difficulty === 'Orta') {
        return { 
            gridSize: 10,
            wordLength: {min: 4, max: 7}, 
            directions: [0, 1, 2],
            numberRange: {min: 1, max: 50}, 
            sudokuSize: 6, 
            pyramidRows: 4, 
            mazeComplexity: 10, 
            operations: ['+', '-'] 
        };
    }
    if (difficulty === 'Zor') {
        return { 
            gridSize: 15,
            wordLength: {min: 6, max: 10}, 
            directions: [0, 1, 2, 3, 4, 5],
            numberRange: {min: 10, max: 100}, 
            sudokuSize: 9, 
            pyramidRows: 5, 
            mazeComplexity: 15, 
            operations: ['+', '-', '*'] 
        };
    }
    return { 
        gridSize: 20,
        wordLength: {min: 10, max: 15}, 
        directions: [0, 1, 2, 3, 4, 5, 6, 7],
        numberRange: {min: 100, max: 1000}, 
        sudokuSize: 9, 
        pyramidRows: 6, 
        mazeComplexity: 25, 
        operations: ['+', '-', '*', '/'] 
    };
};

export const getWordsForDifficulty = (difficulty: string, topic?: string): string[] => {
    let pool: string[] = [];
    
    if (difficulty === 'Başlangıç') {
        pool = TR_VOCAB.easy_words;
    } else if (difficulty === 'Orta') {
        pool = TR_VOCAB.medium_words;
    } else if (difficulty === 'Zor') {
        pool = TR_VOCAB.hard_words;
    } else {
        pool = TR_VOCAB.expert_words;
    }

    if (topic && topic !== 'Rastgele' && topic in TR_VOCAB) {
        const topicWords = (TR_VOCAB[topic] as string[]) || [];
        pool = [...getRandomItems(pool, 10), ...getRandomItems(topicWords, 10)];
    }

    return [...new Set(pool)];
};

export const generateCrosswordLayout = (words: string[]) => {
    return { 
        gridObj: {}, 
        placements: words.map((w, i) => ({ 
            word: w, 
            row: i * 2, 
            col: i % 2 === 0 ? 0 : 2, 
            dir: i % 2 === 0 ? 'across' : 'down' as 'across'|'down' 
        })) 
    };
};

export const wordToRebus = (word: string) => {
    const sylls = simpleSyllabify(word);
    return sylls.map(s => {
        const visual = findEmojiForDescription(s);
        return visual 
            ? { type: 'image' as const, value: s, imagePrompt: visual }
            : { type: 'text' as const, value: s };
    });
} 

// Internal helper for rebus to avoid circular dependency
const findEmojiForDescription = (desc: string): string | null => {
    const lowerDesc = desc.toLocaleLowerCase('tr');
    if (EMOJI_MAP[desc]) return EMOJI_MAP[desc];
    for (const [emoji, name] of Object.entries(EMOJI_MAP)) {
        if (lowerDesc.includes(name.toLocaleLowerCase('tr')) || name.toLocaleLowerCase('tr').includes(lowerDesc)) {
            return emoji;
        }
    }
    return null;
};

export const generateSmartConnectGrid = (dim: number, count: number) => {
    const res = [];
    // Simple 2-column layout:
    for(let i=0; i<count; i++) {
        res.push({pairIndex: i, x: 0, y: i * 2, isStart: true});
        res.push({pairIndex: i, x: 1, y: i * 2, isStart: false});
    }
    return res;
};

// --- VALID MAZE GENERATOR (Recursive Backtracker) ---
export const generateMaze = (rows: number, cols: number): number[][] => {
    // Ensure odd dimensions for proper wall generation
    const h = rows % 2 === 0 ? rows + 1 : rows;
    const w = cols % 2 === 0 ? cols + 1 : cols;
    
    // 0: Wall, 1: Path
    const grid = Array.from({length: h}, () => Array(w).fill(0));
    const stack: {r:number, c:number}[] = [];
    const dirs = [[0,2], [0,-2], [2,0], [-2,0]]; // Jump 2
    
    const startR = 1, startC = 1;
    grid[startR][startC] = 1;
    stack.push({r: startR, c: startC});
    
    while(stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = [];
        
        for(const [dr, dc] of dirs) {
            const nr = current.r + dr, nc = current.c + dc;
            if (nr > 0 && nr < h - 1 && nc > 0 && nc < w - 1 && grid[nr][nc] === 0) {
                neighbors.push({r: nr, c: nc, dr: dr/2, dc: dc/2});
            }
        }
        
        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            // Break wall
            grid[current.r + next.dr][current.c + next.dc] = 1;
            grid[next.r][next.c] = 1;
            stack.push({r: next.r, c: next.c});
        } else {
            stack.pop();
        }
    }
    
    // Ensure Start and End open
    grid[1][0] = 1; 
    grid[h-2][w-1] = 1; 
    
    // Map back to original requested size if different
    if (h !== rows || w !== cols) {
        return grid.slice(0, rows).map(row => row.slice(0, cols));
    }
    
    return grid;
};

// --- VALID LATIN SQUARE GENERATOR (Randomized) ---
export const generateLatinSquare = (n: number): number[][] => {
    // 1. Create first row 1..n shuffled
    const firstRow = shuffle(Array.from({length: n}, (_, i) => i + 1));
    let grid: number[][] = [firstRow];
    
    // 2. Generate shifted rows to ensure Latin property
    for (let i = 1; i < n; i++) {
        const prevRow = grid[i-1];
        grid.push([...prevRow.slice(1), prevRow[0]]);
    }
    
    // 3. Shuffle Rows
    grid = shuffle(grid);
    
    // 4. Transpose (Swap Rows/Cols) to mix columns
    grid = grid[0].map((_, colIndex) => grid.map(row => row[colIndex]));
    
    // 5. Shuffle Rows again (Effectively shuffles columns of original)
    grid = shuffle(grid);
    
    return grid;
};

// --- VALID SUDOKU GENERATOR (Backtracking) ---
export const generateSudokuGrid = (n: number, difficulty: string): (number | null)[][] => {
    const size = n;
    const boxH = size === 9 ? 3 : (size === 6 ? 2 : 2);
    const boxW = size === 9 ? 3 : (size === 6 ? 3 : 2);
    
    const grid: number[][] = Array.from({length: size}, () => Array(size).fill(0));
    
    const isValid = (r: number, c: number, num: number): boolean => {
        // Row/Col check
        for(let k=0; k<size; k++) {
            if (grid[r][k] === num || grid[k][c] === num) return false;
        }
        // Box check
        const startR = Math.floor(r / boxH) * boxH;
        const startC = Math.floor(c / boxW) * boxW;
        for(let i=0; i<boxH; i++) {
            for(let j=0; j<boxW; j++) {
                if(grid[startR+i][startC+j] === num) return false;
            }
        }
        return true;
    };
    
    const solve = (r: number, c: number): boolean => {
        if (r === size) return true;
        const nextR = c === size - 1 ? r + 1 : r;
        const nextC = c === size - 1 ? 0 : c + 1;
        
        if (grid[r][c] !== 0) return solve(nextR, nextC);
        
        const nums = shuffle(Array.from({length: size}, (_, i) => i + 1));
        
        for (const num of nums) {
            if (isValid(r, c, num)) {
                grid[r][c] = num;
                if (solve(nextR, nextC)) return true;
                grid[r][c] = 0;
            }
        }
        return false;
    };
    
    solve(0, 0); // Generate full valid grid
    
    // Remove numbers based on difficulty
    const removeCount = difficulty === 'Başlangıç' ? Math.floor(size*size*0.3) : (difficulty === 'Orta' ? Math.floor(size*size*0.5) : Math.floor(size*size*0.6));
    
    const puzzle: (number|null)[][] = grid.map(row => [...row]);
    let removed = 0;
    let attempts = 0;
    // Safety break to prevent infinite loop
    while(removed < removeCount && attempts < size*size*4) {
        attempts++;
        const r = getRandomInt(0, size-1);
        const c = getRandomInt(0, size-1);
        if (puzzle[r][c] !== null) {
            puzzle[r][c] = null;
            removed++;
        }
    }
    
    return puzzle;
};

// --- RANDOM PATTERN GENERATOR (Grid Drawing - Connected Path) ---
export const generateRandomPattern = (dim: number, density: number): [number, number][][] => {
    const lines: [number, number][][] = [];
    const numPaths = Math.max(1, Math.floor(density)); // 1 for simple, more for complex
    const stepsPerPath = Math.min(dim * 2, 5 + density * 2);

    for (let p = 0; p < numPaths; p++) {
        let currX = getRandomInt(0, dim);
        let currY = getRandomInt(0, dim);
        
        for (let s = 0; s < stepsPerPath; s++) {
            // Possible neighbors
            const neighbors = [
                [currX+1, currY], [currX-1, currY], [currX, currY+1], [currX, currY-1],
                [currX+1, currY+1], [currX-1, currY-1], [currX+1, currY-1], [currX-1, currY+1]
            ].filter(pos => pos[0] >= 0 && pos[0] <= dim && pos[1] >= 0 && pos[1] <= dim);
            
            if (neighbors.length === 0) break;
            
            const next = getRandomItems(neighbors, 1)[0];
            
            // Check if line already exists
            const exists = lines.some(l => 
                (l[0][0]===currX && l[0][1]===currY && l[1][0]===next[0] && l[1][1]===next[1]) ||
                (l[0][0]===next[0] && l[0][1]===next[1] && l[1][0]===currX && l[1][1]===currY)
            );
            
            if (!exists) {
                lines.push([[currX, currY], next]);
            }
            
            currX = next[0];
            currY = next[1];
        }
    }
    return lines;
};

// --- MAZE PATH GENERATOR (For Punctuation Maze) ---
export const generateMazePath = (rows: number, cols: number): { grid: number[][], pathIds: number[], distractorIds: number[] } => {
    const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
    const path: {r: number, c: number}[] = [];
    const pathIds: number[] = [];
    const distractorIds: number[] = [];
    
    // Generate simple path from TL to BR
    let currR = 0;
    let currC = 0;
    let step = 1;
    
    path.push({r: 0, c: 0});
    
    while(currR < rows - 1 || currC < cols - 1) {
        step++;
        const moves = [];
        if (currR < rows - 1) moves.push({r: currR+1, c: currC});
        if (currC < cols - 1) moves.push({r: currR, c: currC+1});
        
        const next = getRandomItems(moves, 1)[0];
        if(!next) break;
        
        currR = next.r;
        currC = next.c;
        path.push({r: currR, c: currC});
    }
    
    // Fill grid with unique IDs and categorize
    let cellCounter = 1;
    for(let r=0; r<rows; r++) {
        const row: number[] = [];
        for(let c=0; c<cols; c++) {
            const id = cellCounter++;
            row.push(id);
            const isOnPath = path.some(p => p.r === r && p.c === c);
            if (isOnPath) pathIds.push(id);
            else distractorIds.push(id);
        }
        grid[r] = row;
    }

    return { grid, pathIds, distractorIds };
};
