
import { GeneratorOptions, AttentionFocusData, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, ImageInterpretationTFData, HeartOfSkyData } from '../../types';
import { getRandomItems, shuffle, getRandomInt, TR_VOCAB, turkishAlphabet, COLORS, simpleSyllabify, getWordsForDifficulty, SHAPE_TYPES, VISUALLY_SIMILAR_CHARS, EMOJI_MAP } from './helpers';

// 1. Reading Flow (Okuma Akışı)
export const generateOfflineReadingFlow = async (options: GeneratorOptions): Promise<ReadingFlowData[]> => {
    const { worksheetCount, difficulty } = options;
    const sentences = [
        "Ali topu attı.",
        "Ayşe okula gitti.",
        "Kedi süt içti.",
        "Güneş bugün çok parlak.",
        "Bahçede renkli çiçekler açtı.",
        "Kitap okumayı çok seviyorum."
    ]; 

    return Array.from({ length: worksheetCount }, () => {
        // Construct paragraphs from random words or predefined sentences
        const paragraphText = sentences.slice(0, 3).join(' '); // Simple structure
        
        return {
            title: "Okuma Akışı (Hızlı Mod)",
            prompt: "Metni okuyun.",
            instruction: "Renkli heceleri takip ederek metni akıcı bir şekilde oku.",
            pedagogicalNote: "Heceleme ve görsel takip becerisi.",
            imagePrompt: "Okuma",
            text: {
                paragraphs: [{
                    sentences: paragraphText.split('.').filter(s=>s.trim()).map(s => ({
                        syllables: s.trim().split(' ').flatMap(word => 
                            simpleSyllabify(word).map((syl, i) => ({
                                text: syl,
                                color: i % 2 === 0 ? '#000000' : '#FF0000' // Alternating black/red
                            }))
                        )
                    }))
                }]
            }
        };
    });
};

// 2. Letter Discrimination (Harf Ayırt Etme)
export const generateOfflineLetterDiscrimination = async (options: GeneratorOptions): Promise<LetterDiscriminationData[]> => {
    const { worksheetCount, targetLetters } = options;
    const targets = targetLetters ? targetLetters.split(',').map(s=>s.trim()) : ['b', 'd'];
    const distractors = ['p', 'q', 'h', 'l', 'k']; // Common distractors

    return Array.from({ length: worksheetCount }, () => ({
        title: "Harf Ayırt Etme (Hızlı Mod)",
        prompt: "Hedef harfleri bulun.",
        instruction: `Aşağıdaki satırlarda "${targets.join(' ve ')}" harflerini bul ve daire içine al.`,
        pedagogicalNote: "Görsel ayrıştırma ve dikkat.",
        imagePrompt: "Harfler",
        targetLetters: targets,
        rows: Array.from({length: 6}, () => {
            const rowChars = Array.from({length: 10}, () => Math.random() > 0.3 ? getRandomItems(distractors, 1)[0] : getRandomItems(targets, 1)[0]);
            return {
                letters: rowChars,
                targetCount: rowChars.filter(c => targets.includes(c)).length
            };
        })
    }));
};

// 3. Rapid Naming (Hızlı İsimlendirme)
export const generateOfflineRapidNaming = async (options: GeneratorOptions): Promise<RapidNamingData[]> => {
    const { worksheetCount, contentType } = options;
    const type = contentType || 'object'; // color, object, number, letter
    
    return Array.from({ length: worksheetCount }, () => {
        let items: any[] = [];
        if (type === 'color') {
            const colors = ['Kırmızı', 'Mavi', 'Sarı', 'Yeşil', 'Siyah'];
            items = Array.from({length: 20}, () => {
                const c = getRandomItems(colors, 1)[0];
                return { type: 'color', value: c, label: c };
            });
        } else {
            // Objects
            const objs = ['Elma', 'Top', 'Ev', 'Araba', 'Kedi'];
            items = Array.from({length: 20}, () => {
                const o = getRandomItems(objs, 1)[0];
                return { type: 'icon', value: o, label: o }; // Frontend needs to map label to icon
            });
        }

        return {
            title: "Hızlı İsimlendirme (Hızlı Mod)",
            prompt: "Hızlıca isimlendirin.",
            instruction: "Soldan sağa doğru nesnelerin isimlerini en hızlı şekilde söyle.",
            pedagogicalNote: "Otomatikleşmiş isimlendirme hızı (RAN).",
            imagePrompt: "Kronometre",
            type: type,
            grid: { items }
        };
    });
};

// 4. Phonological Awareness (Fonolojik Farkındalık)
export const generateOfflinePhonologicalAwareness = async (options: GeneratorOptions): Promise<PhonologicalAwarenessData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: "Sesleri Duy (Hızlı Mod)",
        prompt: "Soruları cevaplayın.",
        instruction: "Soruları cevapla.",
        pedagogicalNote: "Ses ve hece farkındalığı.",
        imagePrompt: "Kulak",
        exercises: [
            { type: 'syllable-counting', question: 'Kaç heceli?', word: 'Kalemlik', options: ['2', '3', '4'], answer: '3', imagePrompt: 'Kalemlik' },
            { type: 'rhyming', question: 'Hangisi kafiyeli?', word: 'Masa', options: ['Kasa', 'Sandalye', 'Tabak'], answer: 'Kasa', imagePrompt: 'Masa' },
            { type: 'syllable-counting', question: 'Kaç heceli?', word: 'Araba', options: ['2', '3', '4'], answer: '3', imagePrompt: 'Araba' },
            { type: 'rhyming', question: 'Hangisi kafiyeli?', word: 'Bal', options: ['Şal', 'Süt', 'Çay'], answer: 'Şal', imagePrompt: 'Bal' }
        ]
    }));
};

// 5. Mirror Letters (Ayna Harfler)
export const generateOfflineMirrorLetters = async (options: GeneratorOptions): Promise<MirrorLettersData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: "Ayna Harfler (Hızlı Mod)",
        instruction: "Ters (ayna) duran harfleri bul ve işaretle.",
        pedagogicalNote: "Yön algısı ve görsel ayrım.",
        imagePrompt: "Ayna",
        targetPair: "b-d",
        rows: Array.from({length: 5}, () => ({
            items: Array.from({length: 6}, () => ({
                letter: Math.random() > 0.5 ? 'b' : 'd',
                isMirrored: Math.random() > 0.7,
                rotation: 0
            }))
        }))
    }));
};

// 6. Syllable Train (Hece Treni)
export const generateOfflineSyllableTrain = async (options: GeneratorOptions): Promise<SyllableTrainData[]> => {
    const { worksheetCount } = options;
    const words = ['Bilgisayar', 'Televizyon', 'Helikopter', 'Kütüphane'];
    
    return Array.from({ length: worksheetCount }, () => ({
        title: "Hece Treni (Hızlı Mod)",
        instruction: "Vagonlardaki heceleri birleştirip kelimeyi oku.",
        pedagogicalNote: "Heceleme ve sentez.",
        imagePrompt: "Tren",
        trains: words.map(w => ({
            word: w,
            syllables: simpleSyllabify(w),
            imagePrompt: w
        }))
    }));
};

// 7. Visual Tracking Lines (Gözle Takip)
export const generateOfflineVisualTrackingLines = async (options: GeneratorOptions): Promise<VisualTrackingLineData[]> => {
    const { worksheetCount } = options;
    // Simple straight/curved lines logic for offline is hard to randomize well without SVG lib logic
    // Returning a static placeholder structure that Frontend renders
    return Array.from({ length: worksheetCount }, () => ({
        title: "Gözle Takip (Hızlı Mod)",
        instruction: "Çizgileri gözünle takip et ve hangi harfin hangi sayıya gittiğini bul.",
        pedagogicalNote: "Göz takibi ve dikkat sürdürme.",
        imagePrompt: "Yollar",
        width: 300,
        height: 300,
        paths: [
            { id: 1, color: 'red', d: 'M 10 10 C 100 10, 10 100, 100 100', startLabel: 'A', endLabel: '1' },
            { id: 2, color: 'blue', d: 'M 10 50 L 100 50', startLabel: 'B', endLabel: '2' },
            { id: 3, color: 'green', d: 'M 10 90 C 50 90, 50 10, 100 10', startLabel: 'C', endLabel: '3' }
        ]
    }));
};

// 8. Backward Spelling (Ters Harf)
export const generateOfflineBackwardSpelling = async (options: GeneratorOptions): Promise<BackwardSpellingData[]> => {
    const { worksheetCount } = options;
    const words = ['Elma', 'Kitap', 'Kalem', 'Masa'];
    return Array.from({ length: worksheetCount }, () => ({
        title: "Tersten Okuma (Hızlı Mod)",
        instruction: "Tersten yazılmış kelimeleri düzelt.",
        pedagogicalNote: "Görsel işlemleme ve kelime tanıma.",
        imagePrompt: "Ters",
        items: words.map(w => ({
            correct: w,
            reversed: w.split('').reverse().join('').toLowerCase(),
            imagePrompt: w
        }))
    }));
};

// 9. Code Reading (Kod Okuma)
export const generateOfflineCodeReading = async (options: GeneratorOptions): Promise<CodeReadingData[]> => {
    const { worksheetCount } = options;
    const keyMap = [
        { symbol: '★', value: 'A', color: 'red' },
        { symbol: '♦', value: 'L', color: 'blue' },
        { symbol: '●', value: 'İ', color: 'green' }
    ];
    
    return Array.from({ length: worksheetCount }, () => ({
        title: "Kod Okuma (Hızlı Mod)",
        instruction: "Sembolleri harflerle eşleştirip şifreyi çöz.",
        pedagogicalNote: "Sembolik kodlama ve dikkat.",
        imagePrompt: "Şifre",
        keyMap: keyMap,
        codesToSolve: [
            { sequence: ['★', '♦', '●'], answer: 'ALİ' },
            { sequence: ['♦', '★', '♦', '★'], answer: 'LALA' }
        ]
    }));
};

// 10. Attention To Question (Soruya Dikkat)
export const generateOfflineAttentionToQuestion = async (options: GeneratorOptions): Promise<AttentionToQuestionData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: "Soruya Dikkat (Hızlı Mod)",
        instruction: "Yönergeyi dikkatlice oku ve uygula.",
        pedagogicalNote: "Yönerge takibi ve görsel dikkat.",
        imagePrompt: "Dikkat",
        subType: 'visual-logic',
        logicItems: [
            { id: 1, shapes: [{color: 'red', type: 'circle'}], isOdd: false, correctAnswer: 'Kırmızı Daire' },
            { id: 2, shapes: [{color: 'blue', type: 'square'}], isOdd: true, correctAnswer: 'Mavi Kare' }
        ]
    }));
};

// 11. Attention Development (Dikkat Geliştirme)
export const generateOfflineAttentionDevelopment = async (options: GeneratorOptions): Promise<AttentionDevelopmentData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: "Dikkat Geliştirme (Hızlı Mod)",
        instruction: "İpuçlarına göre doğru sayıyı bul.",
        pedagogicalNote: "Mantıksal çıkarım ve dikkat.",
        imagePrompt: "Büyüteç",
        puzzles: [
            {
                riddle: "Sol kutudaki en büyük sayı hangisi?",
                boxes: [{ label: 'Sol', numbers: [5, 12, 8] }, { label: 'Sağ', numbers: [3, 9, 15] }],
                options: ['5', '12', '8', '15'],
                answer: '12'
            }
        ]
    }));
};

// 12. Attention Focus (Dikkatini Ver)
export const generateOfflineAttentionFocus = async (options: GeneratorOptions): Promise<AttentionFocusData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: "Dikkatini Ver (Hızlı Mod)",
        instruction: "Sadece 'Kırmızı' olanları bul.",
        pedagogicalNote: "Seçici dikkat.",
        imagePrompt: "Odak",
        puzzles: [
            {
                riddle: "Kırmızı olanları işaretle",
                boxes: [{ title: 'Liste', items: ['Kırmızı Elma', 'Yeşil Elma', 'Kırmızı Top'] }],
                options: ['Kırmızı Elma', 'Kırmızı Top'],
                answer: '2'
            }
        ]
    }));
};

// 13. Image Interpretation TF
export const generateOfflineImageInterpretationTF = async (options: GeneratorOptions): Promise<ImageInterpretationTFData[]> => {
    const { worksheetCount } = options;
    
    const scenarios = [
        {
            title: "Oyun Hamuru Zamanı",
            sceneDescription: "Üç çocuk masada oyun hamuru ile oynuyor.",
            imagePrompt: "Çocuklar Oyun Hamuru",
            items: [
                { text: "Çocuklar masada oturuyor.", isCorrect: true },
                { text: "Çocuklar oyun hamurları ile oynuyor.", isCorrect: true },
                { text: "Çocuklar ayakta duruyor.", isCorrect: false },
                { text: "Masada hiç oyuncak yok.", isCorrect: false }
            ]
        },
        {
            title: "Parkta Eğlence",
            sceneDescription: "Parkta kaydıraktan kayan bir çocuk ve salıncakta sallanan bir kız var.",
            imagePrompt: "Park Kaydırak Salıncak",
            items: [
                { text: "Parkta iki çocuk var.", isCorrect: true },
                { text: "Bir çocuk kaydıraktan kayıyor.", isCorrect: true },
                { text: "Parkta havuz var.", isCorrect: false },
                { text: "Çocuklar top oynuyor.", isCorrect: false }
            ]
        }
    ];

    return Array.from({ length: worksheetCount }, () => {
        const scenario = getRandomItems(scenarios, 1)[0];
        return {
            title: scenario.title,
            instruction: "Resme bak ve cümlelerin doğru mu yanlış mı olduğuna karar ver.",
            pedagogicalNote: "Görsel yorumlama ve okuduğunu anlama.",
            imagePrompt: scenario.imagePrompt,
            sceneDescription: scenario.sceneDescription,
            items: scenario.items
        };
    });
};

// 14. Heart of Sky (Gökyüzünün Kalbi) - Offline Stub
export const generateOfflineHeartOfSky = async (options: GeneratorOptions): Promise<HeartOfSkyData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: "Gökyüzünün Kalbi (Hızlı Mod)",
        instruction: "Hikayeyi oku ve soruları cevapla.",
        pedagogicalNote: "Okuduğunu anlama ve görselleştirme.",
        imagePrompt: "Kurbağa ve Nilüfer",
        theme: "Doğa",
        scenes: [
            {
                title: "Varki ve Nilüfer",
                text: "Minik kurbağa Varki, göletteki büyük nilüfer yaprağının üzerinde oturuyordu. Akşam olmuştu.",
                visualDescription: "Kurbağa nilüfer yaprağında.",
                imagePrompt: "Kurbağa",
                question: "Varki nerede oturuyordu?"
            }
        ]
    }));
};
