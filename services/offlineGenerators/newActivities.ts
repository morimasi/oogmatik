
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, FamilyRelationsData, LogicDeductionData, NumberBoxLogicData, MapInstructionData, MindGamesData, MindGames56Data } from '../../types';
import { shuffle, getRandomInt, getRandomItems, simpleSyllabify, getWordsForDifficulty } from './helpers';

// Helper for better image prompts
const TR_EN_MAP: Record<string, string> = {
    'kedi': 'cute cat', 'köpek': 'friendly dog', 'elma': 'red apple', 'araba': 'yellow car',
    'uçak': 'airplane', 'güneş': 'smiling sun', 'kitap': 'open book', 'kalem': 'wooden pencil',
    'ev': 'sweet home', 'çiçek': 'colorful flower', 'balık': 'orange fish', 'kuş': 'little bird',
    'kaplumbağa': 'green turtle', 'aslan': 'brave lion', 'zürafa': 'tall giraffe', 'fil': 'gray elephant'
};

export const generateOfflineSyllableWordBuilder = async (options: GeneratorOptions): Promise<any[]> => {
    const { worksheetCount, itemCount, difficulty, topic } = options;
    const count = itemCount || 6;
    
    return Array.from({ length: worksheetCount }, () => {
        const pool = getWordsForDifficulty(difficulty, topic);
        const selectedWords = getRandomItems(pool.filter(w => w.length > 3), count);
        
        const allSyllables: string[] = [];
        const words = selectedWords.map((word, i) => {
            const syllables = simpleSyllabify(word).map(s => s.toUpperCase());
            allSyllables.push(...syllables);
            return {
                id: i + 1,
                targetWord: word.toUpperCase(),
                syllables,
                imagePrompt: TR_EN_MAP[word.toLowerCase()] || `${word} object illustration`
            };
        });

        // Add some distractors to bank based on difficulty
        const distractorCount = difficulty === 'Zor' ? 10 : 4;
        const alphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";
        for(let k=0; k<distractorCount; k++) {
            allSyllables.push(alphabet[getRandomInt(0, alphabet.length-1)] + alphabet[getRandomInt(0, alphabet.length-1)]);
        }

        return {
            title: "Hece Dedektifi",
            instruction: "Resmi incele, hece bankasındaki doğru heceleri bulup kelimeyi inşa et.",
            pedagogicalNote: "Fonolojik işlemleme ve görsel tarama becerisi.",
            words,
            syllableBank: shuffle(allSyllables)
        };
    });
};

// TÜRKİYE İL VERİ SETİ (Pedagojik ve Coğrafi Veriler)
const TR_CITIES_DB = [
    { name: "İstanbul", x: 190, y: 55, id: "tr-34", region: "Marmara", isCoastal: true, startChar: "İ" },
    { name: "Ankara", x: 380, y: 120, id: "tr-06", region: "İç Anadolu", isCoastal: false, startChar: "A" },
    { name: "İzmir", x: 80, y: 180, id: "tr-35", region: "Ege", isCoastal: true, startChar: "İ" },
    { name: "Antalya", x: 260, y: 280, id: "tr-07", region: "Akdeniz", isCoastal: true, startChar: "A" },
    { name: "Erzurum", x: 740, y: 110, id: "tr-25", region: "Doğu Anadolu", isCoastal: false, startChar: "E" },
    { name: "Diyarbakır", x: 720, y: 220, id: "tr-21", region: "Güneydoğu", isCoastal: false, startChar: "D" },
    { name: "Samsun", x: 500, y: 45, id: "tr-55", region: "Karadeniz", isCoastal: true, startChar: "S" },
    { name: "Trabzon", x: 670, y: 60, id: "tr-61", region: "Karadeniz", isCoastal: true, startChar: "T" },
    { name: "Konya", x: 380, y: 230, id: "tr-42", region: "İç Anadolu", isCoastal: false, startChar: "K" },
    { name: "Van", x: 860, y: 200, id: "tr-65", region: "Doğu Anadolu", isCoastal: true, startChar: "V" },
    { name: "Bursa", x: 190, y: 105, id: "tr-16", region: "Marmara", isCoastal: true, startChar: "B" },
    { name: "Edirne", x: 60, y: 35, id: "tr-22", region: "Marmara", isCoastal: false, startChar: "E" },
    { name: "Aydın", x: 100, y: 230, id: "tr-09", region: "Ege", isCoastal: true, startChar: "A" },
    { name: "Muğla", x: 120, y: 280, id: "tr-48", region: "Ege", isCoastal: true, startChar: "M" },
    { name: "Hatay", x: 520, y: 310, id: "tr-31", region: "Akdeniz", isCoastal: true, startChar: "H" },
    { name: "Sivas", x: 570, y: 130, id: "tr-58", region: "İç Anadolu", isCoastal: false, startChar: "S" },
    { name: "Zonguldak", x: 310, y: 55, id: "tr-67", region: "Karadeniz", isCoastal: true, startChar: "Z" }
];

export const generateOfflineMapInstruction = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 8;

    return Array.from({ length: worksheetCount }, () => {
        const instructions: string[] = [];
        const usedCityNames = new Set<string>();

        // Yönerge Tipleri (Görsellerdeki mantığa göre)
        const generateRule = () => {
            const types = ['basic', 'spatial', 'phonological', 'geographical', 'path'];
            const type = difficulty === 'Başlangıç' ? 'basic' : getRandomItems(types, 1)[0];
            
            if (type === 'basic') {
                const city = getRandomItems(TR_CITIES_DB.filter(c => !usedCityNames.has(c.name)), 1)[0] || TR_CITIES_DB[0];
                usedCityNames.add(city.name);
                const colors = ['kırmızı', 'mavi', 'sarı', 'yeşil'];
                return `${city.name}'yı ${getRandomItems(colors, 1)[0]} renge boya.`;
            }
            
            if (type === 'spatial') {
                const reference = getRandomItems(TR_CITIES_DB, 1)[0];
                const directions = [
                    { label: 'üstündeki', dx: 0, dy: -40 },
                    { label: 'altındaki', dx: 0, dy: 40 },
                    { label: 'sağındaki', dx: 60, dy: 0 },
                    { label: 'solundaki', dx: -60, dy: 0 }
                ];
                const dir = getRandomItems(directions, 1)[0];
                return `${reference.name}'nın ${dir.label} şehri bul ve işaretle.`;
            }
            
            if (type === 'phonological') {
                const chars = ['A', 'B', 'S', 'E', 'K', 'M'];
                const char = getRandomItems(chars, 1)[0];
                const colors = ['turuncu', 'mor', 'pembe'];
                return `"${char}" harfiyle başlayan bir şehri bul ve ${getRandomItems(colors, 1)[0]} renge boya.`;
            }
            
            if (type === 'geographical') {
                const condition = Math.random() > 0.5 ? 'Karadeniz\'e kıyısı olan' : 'Denize kıyısı olmayan';
                return `${condition} bir şehri bul ve üzerine yıldız çiz.`;
            }

            if (type === 'path') {
                return "İzmir'den Ankara'ya giderken geçeceğin yolları hayal et ve bir şehri seçip boya.";
            }

            return "İstanbul'un komşularından birini yeşile boya.";
        };

        for (let i = 0; i < count; i++) {
            instructions.push(generateRule());
        }

        return {
            title: "Harita Dedektifi (Türkiye)",
            instruction: "Haritayı incele ve yönergeleri sırasıyla takip ederek görevleri tamamla.",
            pedagogicalNote: "Görsel-uzamsal algı, yön tayini ve bilişsel esneklik becerilerini destekler.",
            imagePrompt: "Educational Turkey map puzzle for kids, simple flat lines, clear city markers",
            cities: TR_CITIES_DB.map(c => ({...c})),
            instructions,
            settings: {
                showCityNames: difficulty !== 'Uzman',
                markerStyle: 'circle',
                difficulty
            }
        };
    });
};

export const generateFamilyRelationsFromAI = async (options: GeneratorOptions): Promise<FamilyRelationsData[]> => {
    const { worksheetCount, itemCount, topic } = options;
    const prompt = `Akrabalık İlişkileri Eşleştirme. Konu: ${topic || 'Akrabalık'}. ${itemCount || 10} çift oluştur. [ROL: UZMAN PEDAGOG] Sadece JSON.`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, leftColumn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, id: { type: Type.NUMBER } }, required: ['text', 'id'] } }, rightColumn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, id: { type: Type.NUMBER } }, required: ['text', 'id'] } } }, required: ['title', 'instruction', 'leftColumn', 'rightColumn'] } };
    return generateWithSchema(prompt, schema) as Promise<FamilyRelationsData[]>;
};

export const generateLogicDeductionFromAI = async (options: GeneratorOptions): Promise<LogicDeductionData[]> => {
    const { worksheetCount, itemCount, topic } = options;
    const prompt = `Mantıksal Çıkarım Bulmacaları. Kategori: ${topic || 'Karışık'}. ${itemCount || 4} soru. [ROL: UZMAN PEDAGOG] Sadece JSON.`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { riddle: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answerIndex: { type: Type.NUMBER }, correctLetter: { type: Type.STRING } }, required: ['riddle', 'options', 'answerIndex'] } } }, required: ['title', 'instruction', 'questions'] } };
    return generateWithSchema(prompt, schema) as Promise<LogicDeductionData[]>;
};

export const generateNumberBoxLogicFromAI = async (options: GeneratorOptions): Promise<NumberBoxLogicData[]> => {
    const { worksheetCount, itemCount, numberRange } = options;
    const prompt = `Kutulu Sayı Analizi. Sayı Aralığı: ${numberRange}. ${itemCount || 2} bulmaca seti. [ROL: UZMAN PEDAGOG] Sadece JSON.`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { box1: { type: Type.ARRAY, items: { type: Type.NUMBER } }, box2: { type: Type.ARRAY, items: { type: Type.NUMBER } }, questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING } }, required: ['text', 'options'] } } }, required: ['box1', 'box2', 'questions'] } } }, required: ['title', 'instruction', 'puzzles'] } };
    return generateWithSchema(prompt, schema) as Promise<NumberBoxLogicData[]>;
};
