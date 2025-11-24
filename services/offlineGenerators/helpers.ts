
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

// Genişletilmiş Emoji Haritası
export const EMOJI_MAP: Record<string, string> = {
    "🍎": "Elma", "🍐": "Armut", "🍊": "Portakal", "🍋": "Limon", "🍌": "Muz", "🍉": "Karpuz", "🍇": "Üzüm", "🍓": "Çilek", "🫐": "Yaban Mersini", "🍈": "Kavun", "🍒": "Kiraz", "🍑": "Şeftali", "🍍": "Ananas", "🥥": "Hindistan Cevizi", "🥝": "Kivi", "🍅": "Domates", "🍆": "Patlıcan", "🥑": "Avokado", "🥦": "Brokoli", "🥕": "Havuç", "🌽": "Mısır", "🌶️": "Biber", "🥒": "Salatalık", "🥬": "Marul",
    "🚗": "Araba", "🚕": "Taksi", "🚙": "Cip", "🚌": "Otobüs", "🚎": "Troleybüs", "🏎️": "Yarış Arabası", "🚓": "Polis Arabası", "🚑": "Ambulans", "🚒": "İtfaiye", "🚐": "Minibüs", "🚚": "Kamyon", "🚛": "Tır", "🚜": "Traktör", "🏍️": "Motosiklet", "🛵": "Scooter", "🚲": "Bisiklet", "🛴": "Trotinet", "✈️": "Uçak", "🚁": "Helikopter", "🚀": "Roket", "🛸": "UFO", "⛵": "Yelkenli", "🚤": "Sürat Teknesi", "🛳️": "Gemi", "⛴️": "Feribot", "🚂": "Tren",
    "🐶": "Köpek", "🐱": "Kedi", "🐭": "Fare", "🐹": "Hamster", "🐰": "Tavşan", "🦊": "Tilki", "🐻": "Ayı", "🐼": "Panda", "🐨": "Koala", "🐯": "Kaplan", "🦁": "Aslan", "🐮": "İnek", "🐷": "Domuz", "🐸": "Kurbağa", "🐵": "Maymun", "🐔": "Tavuk", "🐧": "Penguen", "🐦": "Kuş", "🐤": "Civciv", "🦆": "Ördek", "🦅": "Kartal", "🦉": "Baykuş", "🦇": "Yarasa", "🐺": "Kurt", "🐗": "Yaban Domuzu", "🐴": "At", "🦄": "Tekboynuz", "🐝": "Arı", "🐛": "Tırtıl", "🦋": "Kelebek", "🐌": "Salyangoz", "🐞": "Uğur Böceği", "🐜": "Karınca", "🕷️": "Örümcek", "🐢": "Kaplumbağa", "🐍": "Yılan", "🦎": "Kertenkele", "🐙": "Ahtapot", "🦑": "Mürekkep Balığı", "🦐": "Karides", "🦞": "Istakoz", "🦀": "Yengeç", "🐡": "Balon Balığı", "🐠": "Balık", "🐟": "Balık", "🐬": "Yunus", "🐳": "Balina", "🦈": "Köpekbalığı", "🐊": "Timsah", "🐅": "Kaplan", "🐆": "Leopar", "🦓": "Zebra", "🦍": "Goril", "🦧": "Orangutan", "🦣": "Mamut", "🐘": "Fil", "🦛": "Suaygırı", "🦏": "Gergedan", "🐪": "Deve", "🐫": "Deve", "🦒": "Zürafa", "🦘": "Kanguru", "🦬": "Bizon", "🐂": "Öküz", "🐃": "Manda", "🐄": "İnek", "🐎": "At", "🐖": "Domuz", "🐏": "Koç", "🐑": "Koyun", "🐐": "Keçi", "🦌": "Geyik", "🐕": "Köpek", "🐩": "Kaniş", "🦮": "Rehber Köpek", "🐕‍🦺": "Hizmet Köpeği", "🐈": "Kedi", "🐓": "Horoz", "🦃": "Hindi", "🦚": "Tavuskuşu", "🦜": "Papağan", "🦢": "Kuğu", "🦩": "Flamingo",
    "⚽": "Futbol", "🏀": "Basketbol", "🏈": "Amerikan Futbolu", "⚾": "Beyzbol", "🥎": "Softbol", "🎾": "Tenis", "🏐": "Voleybol", "🏉": "Ragbi", "🎱": "Bilardo", "🏓": "Masa Tenisi", "🏸": "Badminton", "🥅": "Kale", "🥊": "Boks", "🥋": "Karate", "🤸": "Jimnastik", "⛸️": "Paten", "🎿": "Kayak",
    "🏠": "Ev", "🏡": "Bahçeli Ev", "🏢": "Bina", "🏣": "Postane", "🏥": "Hastane", "🏦": "Banka", "🏫": "Okul", "🏨": "Otel", "⛪": "Kilise", "🕌": "Cami", "🕍": "Tapınak", "🏰": "Kale", "🏭": "Fabrika",
    "⌚": "Saat", "📱": "Telefon", "💻": "Bilgisayar", "⌨️": "Klavye", "🖥️": "Masaüstü", "🖨️": "Yazıcı", "🖱️": "Fare", "🕹️": "Joystick", "📷": "Kamera", "📹": "Video Kamera", "📼": "Kaset", "🔍": "Büyüteç", "🔎": "Büyüteç", "🕯️": "Mum", "💡": "Ampul", "🔦": "Fener", "🏮": "Fener", "📔": "Defter", "📕": "Kitap", "📖": "Açık Kitap", "📚": "Kitaplar", "💰": "Para", "💵": "Dolar", "💶": "Euro", "💷": "Sterlin", "💸": "Para", "💳": "Kredi Kartı", "🧾": "Fiş", "✉️": "Zarf", "📧": "E-posta", "📦": "Paket", "✏️": "Kurşun Kalem", "✒️": "Dolma Kalem", "🖊️": "Tükenmez Kalem", "🖌️": "Fırça", "🖍️": "Pastel Boya", "📝": "Not", "💼": "Çanta", "📁": "Dosya", "📂": "Açık Dosya", "📅": "Takvim", "📌": "Rabiye", "📍": "Konum", "📎": "Ataş", "📏": "Cetvel", "📐": "Gönye", "✂️": "Makas", "🔒": "Kilit", "🔓": "Açık Kilit", "🔑": "Anahtar", "🔨": "Çekiç", "🪓": "Balta", "⛏️": "Kazma", "⚒️": "Çekiç ve Kazma", "🛠️": "Çekiç ve İngiliz Anahtarı", "🗡️": "Hançer", "⚔️": "Kılıçlar", "🔫": "Tabanca", "🏹": "Yay ve Ok", "🛡️": "Kalkan", "🔧": "İngiliz Anahtarı", "🔩": "Somun ve Cıvata", "⚙️": "Dişli",
    "🪑": "Sandalye", "🛋️": "Kanepe", "🛏️": "Yatak", "🚪": "Kapı", "🪞": "Ayna", "🪟": "Pencere", "🧼": "Sabun", "🧽": "Sünger", "🪣": "Kova", "🧹": "Süpürge", "🧺": "Sepet", "🧻": "Tuvalet Kağıdı", "🛁": "Küvet", "🚿": "Duş", "🚽": "Tuvalet",
    "👑": "Taç", "👒": "Şapka", "🎩": "Sihirbaz Şapkası", "🧢": "Kep", "⛑️": "Kask", "👔": "Kravat", "👕": "Gömlek", "👖": "Kot", "👗": "Elbise", "👘": "Kimono", "👙": "Bikini", "🩳": "Şort", "🧦": "Çorap", "👞": "Ayakkabı", "👡": "Sandalet", "👢": "Bot", "👓": "Gözlük", "🕶️": "Güneş Gözlüğü", "🧣": "Atkı", "🧤": "Eldiven", "🧥": "Mont", "🥼": "Önlük", "🦺": "Yelek", "👛": "Cüzdan", "👜": "El Çantası",
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
    // Mock syllabification for visual purposes (every 2-3 chars roughly)
    // In a real app, use a Turkish NLP library
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
        // Beginner: Very simple, small grid, basic math
        return { 
            gridSize: 6, // 6x6 grid
            wordLength: {min: 2, max: 4}, 
            directions: [0, 1], // Right, Down only
            numberRange: {min: 1, max: 10}, 
            sudokuSize: 4, 
            pyramidRows: 3, 
            mazeComplexity: 5, 
            operations: ['+'] 
        };
    }
    if (difficulty === 'Orta') {
        // Intermediate: Standard
        return { 
            gridSize: 10, // 10x10 grid
            wordLength: {min: 4, max: 7}, 
            directions: [0, 1, 2], // + Diagonal
            numberRange: {min: 1, max: 50}, 
            sudokuSize: 6, 
            pyramidRows: 4, 
            mazeComplexity: 10, 
            operations: ['+', '-'] 
        };
    }
    if (difficulty === 'Zor') {
        // Hard: Challenge
        return { 
            gridSize: 15, // 15x15 grid
            wordLength: {min: 6, max: 10}, 
            directions: [0, 1, 2, 3, 4, 5], // + Backwards
            numberRange: {min: 10, max: 100}, 
            sudokuSize: 9, 
            pyramidRows: 5, 
            mazeComplexity: 15, 
            operations: ['+', '-', '*'] 
        };
    }
    // Expert: Max Complexity
    return { 
        gridSize: 20, // 20x20 grid (huge)
        wordLength: {min: 10, max: 15}, 
        directions: [0, 1, 2, 3, 4, 5, 6, 7], // All directions including reverse diagonal
        numberRange: {min: 100, max: 1000}, 
        sudokuSize: 9, 
        pyramidRows: 6, 
        mazeComplexity: 25, 
        operations: ['+', '-', '*', '/'] 
    };
};

export const getWordsForDifficulty = (difficulty: string, topic?: string): string[] => {
    // Strictly use tiered lists for better differentiation
    let pool: string[] = [];
    
    // 1. Select base pool based on difficulty
    if (difficulty === 'Başlangıç') {
        pool = TR_VOCAB.easy_words;
    } else if (difficulty === 'Orta') {
        pool = TR_VOCAB.medium_words;
    } else if (difficulty === 'Zor') {
        pool = TR_VOCAB.hard_words;
    } else { // Uzman
        pool = TR_VOCAB.expert_words;
    }

    // 2. If topic is provided and valid, mix in topic words
    if (topic && topic !== 'Rastgele' && topic in TR_VOCAB) {
        const topicWords = TR_VOCAB[topic] || [];
        // Mix 50/50 topic words and difficulty words to ensure variety
        pool = [...getRandomItems(pool, 10), ...getRandomItems(topicWords, 10)];
    }

    return [...new Set(pool)];
};

export const generateCrosswordLayout = (words: string[]) => {
    // Simple layout generator for offline mode
    // Places words diagonally or simply for demo purposes
    // In a real app, a proper crossword layout algorithm is needed
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

export const wordToRebus = (word: string) => [{ type: 'text' as const, value: word }]; 
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
