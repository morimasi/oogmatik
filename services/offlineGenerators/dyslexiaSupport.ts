
import { GeneratorOptions, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, EMOJIS, EMOJI_MAP, COLORS, simpleSyllabify, CONNECT_COLORS } from './helpers';

// --- 1. Reading Flow (Heceli/Renkli Okuma) ---
export const generateOfflineReadingFlow = async (options: GeneratorOptions): Promise<ReadingFlowData[]> => {
    const { worksheetCount, difficulty, topic, itemCount } = options;
    
    const texts = [
        "Ali okula gitti. Yolda küçük bir kedi gördü. Kedi çok sevimliydi. Ali kediyi sevdi.",
        "Ayşe'nin kırmızı bir topu var. Parkta arkadaşlarıyla oynar. Topu havaya atar. Arkadaşı topu tutar.",
        "Güneşli bir günde pikniğe gittik. Yeşil çimenlere oturduk. Annem lezzetli sandviçler yapmıştı. Kuşlar şarkı söylüyordu.",
        "Deniz kenarında yürüyüş yapmak çok güzeldir. Dalgaların sesi huzur verir. Martılar gökyüzünde uçar. Kumdan kaleler yaparız.",
        "Kitap okumayı çok severim. Her kitap yeni bir macera demektir. Bilgiler öğrenir, hayaller kurarım. Kitaplar en iyi dosttur."
    ];

    return Array.from({ length: worksheetCount }, () => {
        const baseText = getRandomItems(texts, 1)[0];
        // Simulate sentence count control by repeating or slicing sentences from a longer text
        let sentences = baseText.split(/(?<=[.!?])\s+/);
        const count = itemCount || 5;
        
        if (sentences.length < count) {
             // Repeat to meet count if needed for demo
             while(sentences.length < count) {
                 sentences = [...sentences, ...sentences];
             }
        }
        sentences = sentences.slice(0, count);
        
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
    const { worksheetCount, difficulty, itemCount, targetLetters } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        let targetLetter = 'b';
        let distractor = 'd';

        if (targetLetters) {
            const parts = targetLetters.split(/[\s,]+/).filter(s => s.length === 1);
            if (parts.length >= 2) {
                targetLetter = parts[0].toLowerCase();
                distractor = parts[1].toLowerCase();
            } else if (parts.length === 1) {
                targetLetter = parts[0].toLowerCase();
                distractor = targetLetter === 'b' ? 'd' : 'b';
            }
        } else {
            const pairs = [['b', 'd'], ['p', 'q'], ['m', 'n'], ['u', 'n']];
            const targetPair = getRandomItems(pairs, 1)[0];
            targetLetter = targetPair[0];
            distractor = targetPair[1];
        }

        const rowCount = itemCount || 6;
        
        const rows = Array.from({ length: rowCount }, () => {
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
    const { worksheetCount, difficulty, itemCount } = options;
    
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

        const count = itemCount || 20;
        const gridItems = Array.from({ length: count }, () => getRandomItems(pool, 1)[0]);

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
    const { worksheetCount, difficulty, itemCount } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const count = itemCount || 4;
        const exercises = Array.from({ length: count }, () => {
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

// --- 5. Mirror Letters (Ayna Harfler) ---
export const generateOfflineMirrorLetters = async (options: GeneratorOptions): Promise<MirrorLettersData[]> => {
    const { worksheetCount, difficulty, itemCount, targetPair } = options;
    
    let selectedPair = ['b', 'd'];
    if (targetPair) {
        const parts = targetPair.split(/[\s,/]+/).filter(s => s.length === 1);
        if (parts.length >= 2) {
            selectedPair = [parts[0].toLowerCase(), parts[1].toLowerCase()];
        }
    } else {
        const pairs = [['b', 'd'], ['p', 'q']];
        selectedPair = getRandomItems(pairs, 1)[0];
    }
    
    return Array.from({ length: worksheetCount }, () => {
        const rowCount = itemCount || 5;
        const rows = Array.from({ length: rowCount }, () => {
            const rowItems = Array.from({ length: 8 }, () => {
                const isCorrect = Math.random() > 0.5;
                const letter = isCorrect ? selectedPair[0] : selectedPair[1];
                // In fast mode, we rely on actual letter substitution for mirroring effect since we can't easily rotate text in plain text mode
                // But for UI rendering, we will pass rotation flags
                return {
                    letter: selectedPair[0], // Always show the target letter base
                    isMirrored: !isCorrect, // If not correct, it should be mirrored
                    rotation: !isCorrect ? 180 : 0 // Visual rotation
                };
            });
            return { items: rowItems };
        });

        return {
            title: 'Ayna Harf Savaşçısı',
            instruction: `Sadece doğru duran "${selectedPair[0]}" harflerini daire içine al.`,
            pedagogicalNote: 'Uzamsal algı ve harf yönü ayırt etme (Reversal errors).',
            targetPair: selectedPair.join('/'),
            rows
        };
    });
};

// --- 6. Syllable Train (Hece Treni) ---
export const generateOfflineSyllableTrain = async (options: GeneratorOptions): Promise<SyllableTrainData[]> => {
    const { worksheetCount, difficulty, topic, itemCount } = options;
    const count = itemCount || 5;
    const words = getRandomItems(getWordsForDifficulty(difficulty, topic), count);

    return Array.from({ length: worksheetCount }, () => {
        const trains = words.map(word => ({
            word: word,
            syllables: simpleSyllabify(word),
            imagePrompt: '' // fast mode fallback
        }));

        return {
            title: 'Hece Treni',
            instruction: 'Kelimelerin hecelerini vagonlara yerleştir ve oku.',
            pedagogicalNote: 'Kelime analizi ve parçadan bütüne gitme.',
            trains
        };
    });
};

// --- 7. Visual Tracking Lines (Görsel Takip) ---
export const generateOfflineVisualTrackingLines = async (options: GeneratorOptions): Promise<VisualTrackingLineData[]> => {
    const { worksheetCount, difficulty, itemCount } = options;
    const width = 600;
    const height = 400;
    const pathCount = itemCount || (difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 4 : 5));

    return Array.from({ length: worksheetCount }, () => {
        const paths = [];
        const startYStep = height / (pathCount + 1);
        const endYStep = height / (pathCount + 1);
        const colors = getRandomItems(CONNECT_COLORS, pathCount);
        
        // Generate shuffled end indices to create crossing lines
        const endIndices = shuffle(Array.from({length: pathCount}, (_, i) => i));

        for (let i = 0; i < pathCount; i++) {
            const startY = startYStep * (i + 1);
            const endY = endYStep * (endIndices[i] + 1);
            
            // Bezier curve generation logic for "tangled" look
            // Control points pull the line up/down/left/right
            const cp1x = width * 0.33;
            const cp1y = startY + getRandomInt(-50, 50);
            const cp2x = width * 0.66;
            const cp2y = endY + getRandomInt(-50, 50);

            const pathData = `M 50 ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${width-50} ${endY}`;

            paths.push({
                id: i,
                color: colors[i],
                d: pathData,
                startLabel: (i + 1).toString(),
                endLabel: String.fromCharCode(65 + endIndices[i]) // A, B, C... matching the shuffled end
            });
        }

        return {
            title: 'Görsel Takip Yolları',
            instruction: 'Soldaki numaradan başlayıp çizgiyi gözünle takip et ve hangi harfe ulaştığını bul.',
            pedagogicalNote: 'Göz takibi (Eye tracking) ve şekil-zemin ayrımı.',
            width,
            height,
            paths
        };
    });
};

// --- 8. Backward Spelling (Ters Kelime Avcısı) ---
export const generateOfflineBackwardSpelling = async (options: GeneratorOptions): Promise<BackwardSpellingData[]> => {
    const { worksheetCount, difficulty, topic, itemCount } = options;
    const count = itemCount || 8;
    const words = getRandomItems(getWordsForDifficulty(difficulty, topic), count);

    return Array.from({ length: worksheetCount }, () => {
        const items = words.map(word => ({
            reversed: word.split('').reverse().join(''),
            correct: word,
            imagePrompt: '' // No images in offline mode by default
        }));

        return {
            title: 'Ters Kelime Avcısı',
            instruction: 'Tersten yazılmış kelimeleri oku ve doğrusunu yanına yaz.',
            pedagogicalNote: 'Ortografik işlemleme ve görsel dikkat becerisi.',
            items
        };
    });
};
