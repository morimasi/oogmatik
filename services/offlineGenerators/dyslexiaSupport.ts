
import { GeneratorOptions, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, EMOJIS, EMOJI_MAP, COLORS, simpleSyllabify } from './helpers';

// --- 1. Reading Flow (Heceli/Renkli Okuma) ---
export const generateOfflineReadingFlow = async (options: GeneratorOptions): Promise<ReadingFlowData[]> => {
    const { worksheetCount, difficulty, topic } = options;
    
    const texts = [
        "Ali okula gitti. Yolda küçük bir kedi gördü. Kedi çok sevimliydi. Ali kediyi sevdi.",
        "Ayşe'nin kırmızı bir topu var. Parkta arkadaşlarıyla oynar. Topu havaya atar. Arkadaşı topu tutar.",
        "Güneşli bir günde pikniğe gittik. Yeşil çimenlere oturduk. Annem lezzetli sandviçler yapmıştı. Kuşlar şarkı söylüyordu.",
        "Deniz kenarında yürüyüş yapmak çok güzeldir. Dalgaların sesi huzur verir. Martılar gökyüzünde uçar. Kumdan kaleler yaparız.",
        "Kitap okumayı çok severim. Her kitap yeni bir macera demektir. Bilgiler öğrenir, hayaller kurarım. Kitaplar en iyi dosttur."
    ];

    return Array.from({ length: worksheetCount }, () => {
        const text = getRandomItems(texts, 1)[0];
        const sentences = text.split(/(?<=[.!?])\s+/);
        
        const processedParagraph = sentences.map(sentence => {
            const words = sentence.split(' ');
            const syllables = words.flatMap(word => {
                // Basic syllable approximation or word chunking
                const parts = simpleSyllabify(word);
                // Assign colors: alternating black/blue or red/blue for distinction
                return parts.map((part, idx) => ({
                    text: part,
                    color: idx % 2 === 0 ? '#000' : '#3B82F6' // Black / Blue pattern
                }));
            });
            return { syllables };
        });

        return {
            title: 'Heceli Okuma Çalışması',
            prompt: 'Renklendirilmiş heceleri takip ederek metni okuyun.',
            instruction: 'Metni akıcı bir şekilde okumaya çalış.',
            pedagogicalNote: 'Görsel takibi kolaylaştırarak okuma akıcılığını (fluency) artırır.',
            text: { paragraphs: [{ sentences: processedParagraph }] }
        };
    });
};

// --- 2. Letter Discrimination (Harf Ayrımı) ---
export const generateOfflineLetterDiscrimination = async (options: GeneratorOptions): Promise<LetterDiscriminationData[]> => {
    const { worksheetCount, difficulty } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const pairs = [['b', 'd'], ['p', 'q'], ['m', 'n'], ['u', 'n']];
        const targetPair = getRandomItems(pairs, 1)[0];
        const targetLetter = targetPair[0];
        const distractor = targetPair[1];
        
        const rows = Array.from({ length: 6 }, () => {
            const rowLen = 10;
            const letters = Array.from({ length: rowLen }, () => Math.random() > 0.5 ? targetLetter : distractor);
            const count = letters.filter(l => l === targetLetter).length;
            return { letters, targetCount: count };
        });

        return {
            title: `Harf Karışıklığı: ${targetLetter} - ${distractor}`,
            prompt: `Sadece "${targetLetter}" harflerini bul ve daire içine al.`,
            instruction: `${targetLetter} ve ${distractor} harflerini ayırt et.`,
            pedagogicalNote: 'Görsel ayrım (discrimination) ve yön algısını güçlendirir.',
            targetLetters: [targetLetter, distractor],
            rows
        };
    });
};

// --- 3. Rapid Naming (RAN) ---
export const generateOfflineRapidNaming = async (options: GeneratorOptions): Promise<RapidNamingData[]> => {
    const { worksheetCount, difficulty } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const type = getRandomItems(['color', 'object', 'number'], 1)[0] as 'color' | 'object' | 'number';
        let pool: any[] = [];
        
        if (type === 'color') {
            pool = getRandomItems(COLORS, 5).map(c => ({ type: 'color', value: c.css, label: c.name }));
        } else if (type === 'number') {
            pool = getRandomItems(['1', '2', '3', '4', '5', '6', '7', '8', '9'], 5).map(n => ({ type: 'number', value: n, label: n }));
        } else {
            pool = getRandomItems(EMOJIS, 5).map(e => ({ type: 'icon', value: e, label: EMOJI_MAP[e] }));
        }

        const gridItems = Array.from({ length: 20 }, () => getRandomItems(pool, 1)[0]);

        return {
            title: 'Hızlı İsimlendirme (RAN)',
            prompt: 'Soldan sağa doğru, duraksamadan isimlendir.',
            instruction: 'Mümkün olduğunca hızlı ve hatasız söyle.',
            pedagogicalNote: 'İşlemleme hızı ve geri çağırma (retrieval) becerisi.',
            grid: { items: gridItems },
            type
        };
    });
};

// --- 4. Phonological Awareness ---
export const generateOfflinePhonologicalAwareness = async (options: GeneratorOptions): Promise<PhonologicalAwarenessData[]> => {
    const { worksheetCount, difficulty } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const exercises = Array.from({ length: 4 }, () => {
            const word = getRandomItems(getWordsForDifficulty(difficulty), 1)[0];
            const syllables = simpleSyllabify(word);
            
            return {
                type: 'syllable-counting' as const,
                question: 'Bu kelime kaç hecelidir?',
                word: word,
                // Simple image logic not implemented in offline fully, just text focus
                options: [1, 2, 3, 4],
                answer: syllables.length
            };
        });

        return {
            title: 'Fonolojik Farkındalık',
            prompt: 'Kelimelerin hece sayılarını bul.',
            instruction: 'Her kelimeyi sesli söyle ve hecelerini say.',
            pedagogicalNote: 'Ses farkındalığı ve heceleme becerisi.',
            exercises
        };
    });
};
