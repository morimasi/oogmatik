


import { GeneratorOptions, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, EMOJIS, EMOJI_MAP, COLORS, simpleSyllabify, CONNECT_COLORS, TR_VOCAB, VISUALLY_SIMILAR_CHARS } from './helpers';

// --- 1. Reading Flow (Heceli/Renkli Okuma) ---
export const generateOfflineReadingFlow = async (options: GeneratorOptions): Promise<ReadingFlowData[]> => {
    const { worksheetCount, difficulty, topic, itemCount, syllableColorMode } = options;
    
    const texts = [
        "Ali okula gitti. Yolda küçük bir kedi gördü. Kedi çok sevimliydi. Ali kediyi sevdi.",
        "Ayşe'nin kırmızı bir topu var. Parkta arkadaşlarıyla oynar. Topu havaya atar. Arkadaşı topu tutar.",
        "Güneşli bir günde pikniğe gittik. Yeşil çimenlere oturduk. Annem lezzetli sandviçler yapmıştı. Kuşlar şarkı söylüyordu.",
        "Deniz kenarında yürüyüş yapmak çok güzeldir. Dalgaların sesi huzur verir. Martılar gökyüzünde uçar. Kumdan kaleler yaparız.",
        "Kitap okumayı çok severim. Her kitap yeni bir macera demektir. Bilgiler öğrenir, hayaller kurarım. Kitaplar en iyi dosttur."
    ];

    // Color Schemes
    const getColors = (mode: string) => {
        switch(mode) {
            case 'black-red': return ['#000', '#dc2626'];
            case 'gray-black': return ['#6b7280', '#000'];
            case 'rainbow': return ['#dc2626', '#d97706', '#16a34a', '#2563eb', '#7c3aed'];
            default: return ['#000', '#2563eb']; // black-blue
        }
    };
    const colors = getColors(syllableColorMode || 'black-blue');

    return Array.from({ length: worksheetCount }, () => {
        const baseText = getRandomItems(texts, 1)[0];
        let sentences = baseText.split(/(?<=[.!?])\s+/);
        const count = itemCount || 5;
        
        if (sentences.length < count) {
             while(sentences.length < count) {
                 sentences = [...sentences, ...sentences];
             }
        }
        sentences = sentences.slice(0, count);
        
        const processedParagraph = sentences.map(sentence => {
            const words = sentence.split(' ');
            const syllables = words.flatMap(word => {
                const parts = simpleSyllabify(word);
                return parts.map((part, idx) => ({
                    text: part,
                    color: colors[idx % colors.length]
                }));
            });
            return { syllables };
        });

        return {
            title: 'Akıcı Okuma Çalışması',
            prompt: 'Renklendirilmiş heceleri takip ederek metni okuyun.',
            instruction: 'Metni hecelere dikkat ederek, akıcı bir şekilde okumaya çalış.',
            pedagogicalNote: `Görsel takibi kolaylaştıran ${syllableColorMode} renk şeması ile okuma akıcılığını destekler.`,
            text: { paragraphs: [{ sentences: processedParagraph }] }
        };
    });
};

// --- 2. Letter Discrimination (Harf Ayrımı) ---
export const generateOfflineLetterDiscrimination = async (options: GeneratorOptions): Promise<LetterDiscriminationData[]> => {
    const { worksheetCount, difficulty, itemCount, targetLetters, distractionLevel } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        let targetLetter = 'b';
        let distractor = 'd';

        if (targetLetters) {
            const parts = targetLetters.split(/[\s,-]+/).filter(s => s.length === 1);
            if (parts.length >= 2) {
                targetLetter = parts[0];
                distractor = parts[1];
            } else {
                // Fallback map
                const map: any = {'b': 'd', 'd': 'b', 'p': 'q', 'q': 'p', 'm': 'n', 'n': 'u', 'u': 'n'};
                targetLetter = parts[0] || 'b';
                distractor = map[targetLetter] || 'd';
            }
        }

        const rowCount = itemCount || 8;
        // Distraction level controls ratio (20-90 -> 0.2 - 0.9)
        const ratio = (distractionLevel || 50) / 100; 
        
        const rows = Array.from({ length: rowCount }, () => {
            const rowLen = 12; // Standard width
            const letters = Array.from({ length: rowLen }, () => Math.random() > ratio ? targetLetter : distractor);
            const count = letters.filter(l => l === targetLetter).length;
            return { letters, targetCount: count };
        });

        return {
            title: `Harf Karışıklığı: ${targetLetter} - ${distractor}`,
            prompt: `Sadece "${targetLetter}" harflerini bul ve daire içine al.`,
            instruction: `${targetLetter} ve ${distractor} harflerini ayırt etmeye çalış.`,
            pedagogicalNote: 'Görsel ayrım (discrimination) ve yön algısını güçlendirir.',
            targetLetters: [targetLetter, distractor],
            rows
        };
    });
};

// --- 3. Rapid Naming (RAN) ---
export const generateOfflineRapidNaming = async (options: GeneratorOptions): Promise<RapidNamingData[]> => {
    const { worksheetCount, itemCount, type: optionType, targetLetters, gridConfig } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const type = (optionType || 'object') as 'color' | 'object' | 'number' | 'letter';
        let pool: any[] = [];
        
        if (type === 'color') {
            pool = getRandomItems(COLORS, 5).map(c => ({ type: 'color', value: c.css, label: c.name }));
        } else if (type === 'number') {
            pool = getRandomItems(['1', '2', '3', '4', '5', '6', '7', '8', '9'], 5).map(n => ({ type: 'number', value: n, label: n }));
        } else if (type === 'letter') {
            let lettersToUse: string[] = [];
            if (targetLetters) {
                lettersToUse = targetLetters.split(/[\s,]+/).map(s => s.trim().toLowerCase()).filter(s => s.length === 1);
                if (lettersToUse.length < 5) {
                    const others = turkishAlphabet.split('').filter(l => !lettersToUse.includes(l));
                    lettersToUse = [...lettersToUse, ...getRandomItems(others, 5 - lettersToUse.length)];
                }
                lettersToUse = lettersToUse.slice(0, 5);
            } else {
                lettersToUse = ['b', 'd', 'p', 'q', 'm'];
            }
            pool = lettersToUse.map(l => ({ type: 'letter', value: l, label: l }));
        } else {
            // Objects: Use simple, distinct emojis
            pool = getRandomItems(['🍎','🚗','🏠','⭐','🐶','⚽'], 5).map(e => ({ type: 'icon', value: e, label: EMOJI_MAP[e] || 'Nesne' }));
        }

        // Grid Config parsing (e.g. "5x4")
        const [colsStr, rowsStr] = (gridConfig || '5x4').split('x');
        const cols = parseInt(colsStr) || 5;
        const rows = parseInt(rowsStr) || 4;
        const count = cols * rows;

        const gridItems = Array.from({ length: count }, () => getRandomItems(pool, 1)[0]);

        return {
            title: `Hızlı İsimlendirme (RAN): ${type === 'color' ? 'Renkler' : type === 'number' ? 'Sayılar' : type === 'letter' ? 'Harfler' : 'Nesneler'}`,
            prompt: 'Soldan sağa doğru, duraksamadan isimlendir.',
            instruction: 'Mümkün olduğunca hızlı ve hatasız söylemeye çalış.',
            pedagogicalNote: 'İşlemleme hızı ve fonolojik geri çağırma (retrieval) becerisi.',
            grid: { items: gridItems },
            type: type as any
        };
    });
};

// --- 4. Phonological Awareness ---
export const generateOfflinePhonologicalAwareness = async (options: GeneratorOptions): Promise<PhonologicalAwarenessData[]> => {
    const { worksheetCount, difficulty, itemCount, skillType } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const count = itemCount || 4;
        const exercises = Array.from({ length: count }, () => {
            
            if (skillType === 'rhyme') {
                const pair = getRandomItems(TR_VOCAB.synonyms, 1)[0]; // Placeholder logic, better to have rhyming dict
                // Simulating rhyme with simple ending match for offline demo
                const word = getRandomItems(['masa', 'kasa', 'tasa', 'yasa'], 1)[0];
                return {
                    type: 'rhyming' as const,
                    question: `"${word}" ile kafiyeli olan kelime hangisidir?`,
                    word: word,
                    options: ['kasa', 'elma', 'top'], // Mock options
                    answer: 'kasa'
                };
            } else if (skillType === 'initial-sound') {
                const word = getRandomItems(getWordsForDifficulty(difficulty), 1)[0];
                const initial = word.charAt(0).toUpperCase();
                return {
                    type: 'syllable-counting' as const, // Reusing type for simplicity in types.ts unless extended
                    question: `"${word}" kelimesi hangi sesle başlar?`,
                    word: word,
                    options: [initial, 'Z', 'K'],
                    answer: initial
                };
            } else {
                // Default: Syllable Counting
                const word = getRandomItems(getWordsForDifficulty(difficulty), 1)[0];
                const syllables = simpleSyllabify(word);
                return {
                    type: 'syllable-counting' as const,
                    question: 'Bu kelime kaç hecelidir?',
                    word: word,
                    options: [1, 2, 3, 4],
                    answer: syllables.length
                };
            }
        });

        return {
            title: skillType === 'rhyme' ? 'Kafiye Bulma' : skillType === 'initial-sound' ? 'İlk Ses Farkındalığı' : 'Hece Sayma',
            prompt: 'Soruları cevapla.',
            instruction: 'Sesleri dinle ve doğru cevabı bul.',
            pedagogicalNote: 'Fonolojik farkındalık ve ses bilgisi.',
            exercises
        };
    });
};

// --- 5. Mirror Letters (Ayna Harfler) ---
export const generateOfflineMirrorLetters = async (options: GeneratorOptions): Promise<MirrorLettersData[]> => {
    const { worksheetCount, difficulty, itemCount, targetPair, rotationMode } = options;
    
    let selectedPair = ['b', 'd'];
    if (targetPair) {
        const parts = targetPair.split(/[\s,-]+/).filter(s => s.length === 1);
        if (parts.length >= 2) selectedPair = [parts[0], parts[1]];
    }
    
    const isComplex = rotationMode === 'complex';

    return Array.from({ length: worksheetCount }, () => {
        const rowCount = itemCount || 6;
        const rows = Array.from({ length: rowCount }, () => {
            const rowItems = Array.from({ length: 8 }, () => {
                const isCorrect = Math.random() > 0.6; // Bias towards correct a bit
                const letter = selectedPair[0]; // Target is always the first one to find
                
                let rotation = 0;
                let isMirrored = false;

                if (!isCorrect) {
                    if (isComplex) {
                        // Random rotation or mirror
                        const type = getRandomInt(0, 3);
                        if (type === 0) isMirrored = true;
                        else if (type === 1) rotation = 90;
                        else if (type === 2) rotation = 180;
                        else rotation = 270;
                    } else {
                        // Simple mirror (flip X)
                        isMirrored = true;
                    }
                }

                return {
                    letter: letter, 
                    isMirrored: isMirrored,
                    rotation: rotation
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
    const { worksheetCount, difficulty, topic, wordLength, itemCount } = options;
    
    let pool = getWordsForDifficulty(difficulty, topic);
    if (wordLength && wordLength !== 'mixed') {
        const len = parseInt(wordLength);
        pool = pool.filter(w => simpleSyllabify(w).length === len);
        if (pool.length < 5) pool = getWordsForDifficulty(difficulty, 'Rastgele'); // Fallback
    }

    const count = itemCount || 5;
    const words = getRandomItems(pool, count);

    return Array.from({ length: worksheetCount }, () => {
        const trains = words.map(word => ({
            word: word,
            syllables: simpleSyllabify(word),
            imagePrompt: '' 
        }));

        return {
            title: 'Hece Treni',
            instruction: 'Kelimelerin hecelerini vagonlara yerleştir.',
            pedagogicalNote: 'Kelime analizi ve hece farkındalığı.',
            trains
        };
    });
};

// --- 7. Visual Tracking Lines (Görsel Takip) ---
export const generateOfflineVisualTrackingLines = async (options: GeneratorOptions): Promise<VisualTrackingLineData[]> => {
    const { worksheetCount, difficulty, itemCount, pathComplexity } = options;
    const width = 600;
    const height = 400;
    const pathCount = itemCount || 5;

    return Array.from({ length: worksheetCount }, () => {
        const paths = [];
        const startYStep = height / (pathCount + 1);
        const endYStep = height / (pathCount + 1);
        const colors = getRandomItems(CONNECT_COLORS, pathCount);
        const endIndices = shuffle(Array.from({length: pathCount}, (_, i) => i));

        for (let i = 0; i < pathCount; i++) {
            const startY = startYStep * (i + 1);
            const endY = endYStep * (endIndices[i] + 1);
            
            // Complex Bezier Logic
            const cp1x = width * 0.25;
            const cp2x = width * 0.75;
            
            let cp1y, cp2y;
            
            if (pathComplexity === 'hard') {
                // Spaghetti: Control points go wildly up/down
                cp1y = getRandomInt(0, height);
                cp2y = getRandomInt(0, height);
            } else if (pathComplexity === 'medium') {
                // Tangled: Control points deviate significantly
                cp1y = startY + getRandomInt(-100, 100);
                cp2y = endY + getRandomInt(-100, 100);
            } else {
                // Simple: Smooth flow
                cp1y = startY;
                cp2y = endY;
            }

            const pathData = `M 50 ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${width-50} ${endY}`;

            paths.push({
                id: i,
                color: colors[i],
                d: pathData,
                startLabel: (i + 1).toString(),
                endLabel: String.fromCharCode(65 + endIndices[i]),
                startImage: '',
                endImage: ''
            });
        }

        return {
            title: 'Görsel Takip Yolları',
            instruction: 'Soldaki numaradan başlayıp çizgiyi gözünle takip et ve hedefe ulaş.',
            pedagogicalNote: 'Göz takibi (Eye tracking) ve şekil-zemin ayrımı.',
            width,
            height,
            paths
        };
    });
};

// --- 8. Backward Spelling (Ters Kelime Avcısı) ---
export const generateOfflineBackwardSpelling = async (options: GeneratorOptions): Promise<BackwardSpellingData[]> => {
    const { worksheetCount, difficulty, topic, itemCount, showVisual } = options;
    const count = itemCount || 8;
    const words = getRandomItems(getWordsForDifficulty(difficulty, topic), count);

    return Array.from({ length: worksheetCount }, () => {
        const items = words.map(word => ({
            reversed: word.split('').reverse().join(''),
            correct: word,
            imagePrompt: showVisual ? word : '' // Populate imagePrompt if visual requested
        }));

        return {
            title: 'Ters Kelime Avcısı',
            instruction: 'Tersten yazılmış kelimeleri oku ve doğrusunu yaz.',
            pedagogicalNote: 'Ortografik işlemleme ve görsel dikkat.',
            items
        };
    });
};
