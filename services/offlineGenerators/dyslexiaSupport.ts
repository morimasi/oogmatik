import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, HandwritingPracticeData, RealLifeProblemData, LetterVisualMatchingData } from '../../types';
import { getRandomItems, shuffle, getRandomInt, TR_VOCAB, turkishAlphabet, COLORS, simpleSyllabify, getWordsForDifficulty, SHAPE_TYPES, VISUALLY_SIMILAR_CHARS, EMOJI_MAP } from './helpers';

const generateComplexPaths = (count: number, width: number, height: number, difficulty: string) => {
    const paths = [];
    let colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];
    let strokeWidth = 3;
    let zones = 2; 
    let amplitude = 50; 
    
    if (difficulty === 'Orta') {
        strokeWidth = 2; zones = 3; amplitude = 100; colors = ['#1d4ed8', '#1e40af', '#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa']; 
    } else if (difficulty === 'Zor') {
        strokeWidth = 1.5; zones = 4; amplitude = 150; colors = ['#000000'];
    } else if (difficulty === 'Uzman') {
        strokeWidth = 1; zones = 5; amplitude = 200; colors = ['#333333'];
    }

    const startYStep = height / (count + 1);
    const endYStep = height / (count + 1);
    let currentPositions = Array.from({length: count}, (_, i) => ({ id: i, y: startYStep * (i + 1) }));

    for (let i = 0; i < count; i++) {
        let pathData = `M 20 ${currentPositions[i].y}`;
        let prevX = 20;
        let prevY = currentPositions[i].y;
        const segmentWidth = (width - 40) / zones;
        
        for (let z = 1; z <= zones; z++) {
            const targetX = 20 + z * segmentWidth;
            const randomYShift = getRandomInt(-amplitude, amplitude);
            let targetY = prevY + randomYShift;
            targetY = Math.max(20, Math.min(height - 20, targetY));
            if (z === zones) targetY = endYStep * (shuffle(Array.from({length: count}, (_,k)=>k))[i] + 1); 
            const cp1x = prevX + segmentWidth * 0.5;
            const cp1y = prevY; 
            const cp2x = targetX - segmentWidth * 0.5;
            const cp2y = targetY;
            pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`;
            prevX = targetX; prevY = targetY;
        }

        paths.push({
            id: i,
            color: difficulty === 'Başlangıç' ? colors[i % colors.length] : colors[0],
            d: pathData,
            strokeWidth,
            startLabel: (i + 1).toString(),
            endLabel: '', 
            startImage: '',
            endImage: ''
        });
    }
    const endLabels = shuffle(Array.from({length: count}, (_, i) => String.fromCharCode(65 + i)));
    paths.forEach((p, idx) => { p.endLabel = endLabels[idx]; });
    return paths;
};

// NEW: Offline Letter Visual Matching
export const generateOfflineLetterVisualMatching = async (options: GeneratorOptions): Promise<LetterVisualMatchingData[]> => {
    const { worksheetCount, difficulty, itemCount, targetLetters, case: letterCase } = options;
    const count = itemCount || 6;
    
    // Core data mapping for letters to objects
    const letterMap: Record<string, {word: string, img: string}> = {
        'A': { word: 'At', img: 'Horse' }, 'B': { word: 'Balık', img: 'Fish' }, 'C': { word: 'Civciv', img: 'Chick' },
        'Ç': { word: 'Çilek', img: 'Strawberry' }, 'D': { word: 'Davul', img: 'Drum' }, 'E': { word: 'Elma', img: 'Apple' },
        'F': { word: 'Fil', img: 'Elephant' }, 'G': { word: 'Güneş', img: 'Sun' }, 'H': { word: 'Havuç', img: 'Carrot' },
        'I': { word: 'Ispanak', img: 'Spinach' }, 'İ': { word: 'İncir', img: 'Fig' }, 'J': { word: 'Jeton', img: 'Coin' },
        'K': { word: 'Kedi', img: 'Cat' }, 'L': { word: 'Limon', img: 'Lemon' }, 'M': { word: 'Maymun', img: 'Monkey' },
        'N': { word: 'Nar', img: 'Pomegranate' }, 'O': { word: 'Otobüs', img: 'Bus' }, 'Ö': { word: 'Ördek', img: 'Duck' },
        'P': { word: 'Pasta', img: 'Cake' }, 'R': { word: 'Robot', img: 'Robot' }, 'S': { word: 'Saat', img: 'Clock' },
        'Ş': { word: 'Şemsiye', img: 'Umbrella' }, 'T': { word: 'Top', img: 'Ball' }, 'U': { word: 'Uçak', img: 'Plane' },
        'Ü': { word: 'Üzüm', img: 'Grapes' }, 'V': { word: 'Vazo', img: 'Vase' }, 'Y': { word: 'Yıldız', img: 'Star' },
        'Z': { word: 'Zürafa', img: 'Giraffe' }
    };

    return Array.from({ length: worksheetCount }, () => {
        let pool = targetLetters ? targetLetters.split(',').map(l => l.trim().toUpperCase()) : Object.keys(letterMap);
        if (difficulty === 'Orta') pool = ['B', 'D', 'P', 'Q', 'M', 'N']; // Mirror Focus
        
        const selectedKeys = getRandomItems(pool, count);
        const pairs = selectedKeys.map(k => {
            const data = letterMap[k] || { word: k, img: k };
            return {
                letter: letterCase === 'lower' ? k.toLowerCase() : k,
                word: data.word,
                imagePrompt: data.img
            };
        });

        return {
            title: "Harf-Görsel Eşleme",
            instruction: "Resimleri incele ve her resmin hangi harfle başladığını bulup çizgiyle birleştir.",
            pedagogicalNote: "Fonolojik farkındalık ve harf-ses eşleştirmesi.",
            pairs: shuffle(pairs),
            settings: {
                fontFamily: options.fontFamily || 'OpenDyslexic',
                letterCase: (letterCase as any) || 'upper',
                showTracing: difficulty === 'Başlangıç',
                gridCols: options.gridSize || 3
            }
        };
    });
};

// Fixed GeneratorOptions and other types
export const generateOfflineHandwritingPractice = async (options: GeneratorOptions): Promise<HandwritingPracticeData[]> => {
    const { worksheetCount, difficulty, topic } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        let lines: any[] = [];
        
        if (difficulty === 'Başlangıç') {
            const letters = shuffle(turkishAlphabet.split('')).slice(0, 3);
            const words = getWordsForDifficulty('Başlangıç', topic).slice(0, 2);
            
            letters.forEach(l => {
                lines.push({ text: `${l.toUpperCase()} ${l} ${l.toUpperCase()} ${l}`, type: 'trace' as const });
                lines.push({ text: '', type: 'empty' as const });
            });
            words.forEach(w => {
                lines.push({ text: w, type: 'trace' as const, imagePrompt: w });
                lines.push({ text: '', type: 'empty' as const });
            });
            
        } else {
            const sentences = [
                "Ali topu at.", "Ayşe eve gel.", "Hava çok güzel.", 
                "Kitap okumayı severim.", "Kalemim masada duruyor."
            ];
            const selection = getRandomItems(sentences, 4);
            
            selection.forEach(s => {
                lines.push({ text: s, type: 'trace' as const });
                lines.push({ text: s, type: 'copy' as const });
                lines.push({ text: '', type: 'empty' as const });
            });
        }

        return {
            title: 'Güzel Yazı Çalışması',
            instruction: 'Harflerin üzerinden geç ve alt satıra kendin yaz.',
            pedagogicalNote: 'İnce motor becerileri ve harf formasyonu.',
            imagePrompt: 'Pencil',
            guideType: 'standard',
            lines
        };
    });
};

export const generateOfflineAttentionFocus = async (options: GeneratorOptions): Promise<AttentionFocusData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 4;
    return Array.from({ length: worksheetCount }, () => ({
        title: `Dikkatini Ver`, instruction: "Özellikleri oku.", pedagogicalNote: "Sözel dikkat.", imagePrompt: "Focus",
        puzzles: Array.from({ length: count }, () => ({ riddle: 'Sarıdır.', boxes: [], options: ['Limon', 'Elma'], answer: 'Limon' }))
    }));
};

export const generateOfflineCodeReading = async (options: GeneratorOptions): Promise<CodeReadingData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({ title: 'Kod Okuma', instruction: 'Çöz.', pedagogicalNote: 'Kodlama.', imagePrompt: 'Code', keyMap: [], codesToSolve: [] }));
};

export const generateOfflineAttentionToQuestion = async (options: GeneratorOptions): Promise<AttentionToQuestionData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({ title: 'Soruya Dikkat', instruction: 'Bul.', pedagogicalNote: 'Seçici dikkat.', imagePrompt: 'Search', subType: 'visual-logic' }));
};

export const generateOfflineAttentionDevelopment = async (options: GeneratorOptions): Promise<AttentionDevelopmentData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({ title: 'Dikkat Geliştirme', instruction: 'Çöz.', pedagogicalNote: 'Dikkat.', imagePrompt: 'Brain', puzzles: [] }));
};

export const generateOfflineReadingFlow = async (options: GeneratorOptions): Promise<ReadingFlowData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({ title: 'Okuma Akışı', instruction: 'Oku.', pedagogicalNote: 'Akıcılık.', imagePrompt: 'Book', text: { paragraphs: [] } }));
};

export const generateOfflineLetterDiscrimination = async (options: GeneratorOptions): Promise<LetterDiscriminationData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({ title: 'Harf Ayırt Etme', instruction: 'Seç.', pedagogicalNote: 'Görsel.', imagePrompt: 'Letters', targetLetters: [], rows: [] }));
};

// Fixed generateOfflineRapidNaming to ensure grid property matches RapidNamingData interface structure (array of objects with items property)
export const generateOfflineRapidNaming = async (options: GeneratorOptions): Promise<RapidNamingData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({ 
        title: 'Hızlı İsimlendirme', 
        instruction: 'Oku.', 
        pedagogicalNote: 'RAN.', 
        imagePrompt: 'Clock', 
        grid: [{items:[]}], 
        type: 'object' 
    }));
};

export const generateOfflinePhonologicalAwareness = async (options: GeneratorOptions): Promise<PhonologicalAwarenessData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({ title: 'Fonolojik', instruction: 'Dinle.', pedagogicalNote: 'Ses.', imagePrompt: 'Ear', exercises: [] }));
};

export const generateOfflineMirrorLetters = async (options: GeneratorOptions): Promise<MirrorLettersData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({ title: 'Ayna Harfler', instruction: 'Bul.', pedagogicalNote: 'Yön.', imagePrompt: 'Mirror', targetPair: '', rows: [] }));
};

export const generateOfflineSyllableTrain = async (options: GeneratorOptions): Promise<SyllableTrainData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({ title: 'Hece Treni', instruction: 'Birleştir.', pedagogicalNote: 'Hece.', imagePrompt: 'Train', trains: [] }));
};

export const generateOfflineVisualTrackingLines = async (options: GeneratorOptions): Promise<VisualTrackingLineData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 5;
    return Array.from({ length: worksheetCount }, () => ({
        title: `Görsel Takip Labirenti`,
        instruction: 'Çizgileri takip et.',
        pedagogicalNote: 'Görsel tarama.',
        imagePrompt: 'Maze Lines',
        width: 800, height: 1000, difficultyLevel: 'medium', lineStyle: 'solid', nodeStyle: 'icon', showGridBackground: false,
        paths: generateComplexPaths(count, 800, 1000, difficulty)
    }));
};

export const generateOfflineBackwardSpelling = async (options: GeneratorOptions): Promise<BackwardSpellingData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({ title: 'Ters Harfler', instruction: 'Düzelt.', pedagogicalNote: 'Ortografi.', imagePrompt: 'Letters', items: [] }));
};