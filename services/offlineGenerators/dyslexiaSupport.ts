
import { GeneratorOptions, AttentionFocusData, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData } from '../../types';
import { getRandomItems, shuffle, getRandomInt, TR_VOCAB, turkishAlphabet, COLORS, simpleSyllabify, getWordsForDifficulty, SHAPE_TYPES, VISUALLY_SIMILAR_CHARS, EMOJI_MAP } from './helpers';

// --- Helper for creating random visual tracking paths ---
const generatePaths = (count: number, width: number, height: number) => {
    const paths = [];
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    const startYStep = height / (count + 1);
    
    for(let i=0; i<count; i++) {
        const startY = startYStep * (i + 1);
        const endY = getRandomInt(20, height - 20); // Random end Y
        
        // Simple cubic bezier curve
        const cp1x = width * 0.33;
        const cp1y = startY + getRandomInt(-50, 50);
        const cp2x = width * 0.66;
        const cp2y = endY + getRandomInt(-50, 50);
        
        const d = `M 20 ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${width-20} ${endY}`;
        
        paths.push({
            id: i,
            color: colors[i % colors.length],
            d,
            startLabel: (i + 1).toString(),
            endLabel: String.fromCharCode(65 + i), // A, B, C...
            startImage: '',
            endImage: ''
        });
    }
    return paths;
};

// 1. Attention Focus (Mevcut olan korunuyor)
export const generateOfflineAttentionFocus = async (options: GeneratorOptions): Promise<AttentionFocusData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 4;

    interface ItemPoolItem {
        name: string;
        color: string;
        feature: string;
        type: 'meyve' | 'sebze';
    }

    const itemPool: { fruit: ItemPoolItem[], veg: ItemPoolItem[] } = {
        fruit: [
            { name: 'Limon', color: 'sarı', feature: 'ekşi', type: 'meyve' },
            { name: 'Çilek', color: 'kırmızı', feature: 'tatlı', type: 'meyve' },
            { name: 'Muz', color: 'sarı', feature: 'uzun', type: 'meyve' },
            { name: 'Karpuz', color: 'yeşil', feature: 'büyük', type: 'meyve' },
            { name: 'Kiraz', color: 'kırmızı', feature: 'saplı', type: 'meyve' },
            { name: 'Armut', color: 'yeşil', feature: 'sulu', type: 'meyve' }
        ],
        veg: [
            { name: 'Biber', color: 'yeşil', feature: 'acı', type: 'sebze' },
            { name: 'Domates', color: 'kırmızı', feature: 'yuvarlak', type: 'sebze' },
            { name: 'Havuç', color: 'turuncu', feature: 'uzun', type: 'sebze' },
            { name: 'Patlıcan', color: 'mor', feature: 'uzun', type: 'sebze' }
        ]
    };

    return Array.from({ length: worksheetCount }, () => {
        const puzzles = Array.from({ length: count }, () => {
            const cat = Math.random() > 0.5 ? 'fruit' : 'veg';
            const items = shuffle(itemPool[cat]);
            const target = items[0];
            const clueItem = items[1];
            
            const clueDesc = `${clueItem.color} renkli ${clueItem.type}nin`;
            const targetDesc = `${target.color} renklidir`;
            const riddle = `Aradığımız yiyecek, ${clueDesc} bulunduğu kutudadır. Bulunduğu kutudaki ${targetDesc}.`;
            
            const box1 = shuffle([target.name, clueItem.name, 'Elma', 'Soğan']);
            const box2 = shuffle(['Ispanak', 'Pırasa', 'Kavun', 'İncir']);
            
            return {
                riddle,
                boxes: [{ items: box1 }, { items: box2 }],
                options: shuffle([target.name, clueItem.name, 'Elma', 'Kavun']),
                answer: target.name
            };
        });

        return {
            title: `Dikkatini Ver (${difficulty})`,
            instruction: "İpuçlarını okuyun ve doğru cevabı bulun.",
            pedagogicalNote: "Mantıksal çıkarım.",
            imagePrompt: "Dedektif",
            puzzles
        };
    });
};

// 2. Code Reading
export const generateOfflineCodeReading = async (options: GeneratorOptions): Promise<CodeReadingData[]> => {
    const { worksheetCount, itemCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const symbols = ['arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'triangle', 'square', 'circle', 'star'];
        const values = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        
        const selectedSymbols = getRandomItems(symbols, 5);
        const selectedValues = getRandomItems(values, 5);
        
        const keyMap = selectedSymbols.map((sym, i) => ({
            symbol: sym,
            value: selectedValues[i],
            color: COLORS[i % COLORS.length].css
        }));
        
        const codesToSolve = Array.from({ length: itemCount || 5 }, () => {
            const seqLength = getRandomInt(3, 5);
            const sequenceIndices = Array.from({length: seqLength}, () => getRandomInt(0, 4));
            const sequence = sequenceIndices.map(i => keyMap[i].symbol);
            const answer = sequenceIndices.map(i => keyMap[i].value).join('');
            return { sequence, answer };
        });

        return {
            title: 'Kod Okuma (Hızlı Mod)',
            instruction: 'Sembollerin karşılıklarını anahtardan bularak şifreyi çözün.',
            pedagogicalNote: 'Sembolik kodlama ve dikkati sürdürme.',
            imagePrompt: 'Şifre',
            keyMap,
            codesToSolve
        };
    });
};

// 3. Attention To Question
export const generateOfflineAttentionToQuestion = async (options: GeneratorOptions): Promise<AttentionToQuestionData[]> => {
    const { worksheetCount, subType } = options;
    const type = subType || 'letter-cancellation';
    
    return Array.from({ length: worksheetCount }, () => {
        if (type === 'letter-cancellation') {
            const word = getRandomItems(['DİKKAT', 'BAŞARI', 'OKUL', 'ZEKA'], 1)[0];
            const targetChars = ['X', 'Q', 'W'];
            const size = 10;
            const grid = Array.from({length: size}, () => Array.from({length: size}, () => getRandomItems(turkishAlphabet.split(''), 1)[0]));
            
            // Embed targets
            for(let i=0; i<15; i++) {
                grid[getRandomInt(0, size-1)][getRandomInt(0, size-1)] = getRandomItems(targetChars, 1)[0];
            }
            
            return {
                title: 'Harf Eleme (Hızlı Mod)',
                instruction: 'Belirtilen harflerin üzerini çizin.',
                pedagogicalNote: 'Seçici dikkat.',
                imagePrompt: 'Harf',
                subType: 'letter-cancellation',
                grid,
                targetChars,
                password: word
            };
        } else if (type === 'path-finding') {
            return {
                title: 'Yol Takibi (Hızlı Mod)',
                instruction: 'Yıldızları takip ederek çıkışa ulaş.',
                pedagogicalNote: 'Görsel takip.',
                imagePrompt: 'Labirent',
                subType: 'path-finding',
                pathGrid: [
                    ['start', 'star', 'empty', 'empty'],
                    ['empty', 'star', 'star', 'empty'],
                    ['empty', 'empty', 'star', 'end']
                ]
            };
        } else {
            return {
                title: 'Görsel Mantık (Hızlı Mod)',
                instruction: 'Farklı olan şekli bul.',
                pedagogicalNote: 'Görsel ayrım.',
                imagePrompt: 'Şekil',
                subType: 'visual-logic',
                logicItems: [{id: 1, isOdd: false, correctAnswer: '', shapes: []}]
            };
        }
    });
};

// 4. Attention Development
export const generateOfflineAttentionDevelopment = async (options: GeneratorOptions): Promise<AttentionDevelopmentData[]> => {
    const { worksheetCount, itemCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const puzzles = Array.from({ length: itemCount || 4 }, () => {
            const n1 = getRandomInt(10, 50);
            const n2 = getRandomInt(10, 50);
            return {
                riddle: 'Sol kutudaki en büyük sayıyı bul.',
                boxes: [
                    { label: 'Sol', numbers: [n1, n1-5, n1+2, n1-10] },
                    { label: 'Sağ', numbers: [n2, n2+5, n2-2, n2+10] }
                ],
                options: [(n1+2).toString(), n1.toString(), (n1-5).toString()],
                answer: (n1+2).toString()
            };
        });
        return {
            title: 'Dikkat Geliştirme (Hızlı Mod)',
            instruction: 'Soruyu dikkatlice oku ve cevabı bul.',
            pedagogicalNote: 'Yönerge takibi ve sayısal dikkat.',
            imagePrompt: 'Dikkat',
            puzzles
        };
    });
};

// 5. Reading Flow
export const generateOfflineReadingFlow = async (options: GeneratorOptions): Promise<ReadingFlowData[]> => {
    const { worksheetCount } = options;
    const text = "Ali okula gitti. Okulda arkadaşları ile oynadı. Derslerini dikkatle dinledi. Öğretmeni onu tebrik etti. Akşam eve mutlu döndü.";
    
    return Array.from({ length: worksheetCount }, () => {
        const paragraphs = text.split('. ').filter(s => s).map(sent => ({
            sentences: [{
                syllables: simpleSyllabify(sent).map((s, i) => ({
                    text: s,
                    color: i % 2 === 0 ? '#000' : '#4F46E5' // Alternating black/blue
                }))
            }]
        }));

        return {
            title: 'Okuma Akışı (Hızlı Mod)',
            instruction: 'Renkli heceleri takip ederek metni okuyun.',
            prompt: 'Renkli heceleri takip ederek metni okuyun.',
            pedagogicalNote: 'Okuma hızını ve takibini kolaylaştırır.',
            imagePrompt: 'Kitap',
            text: { paragraphs }
        };
    });
};

// 6. Letter Discrimination
export const generateOfflineLetterDiscrimination = async (options: GeneratorOptions): Promise<LetterDiscriminationData[]> => {
    const { worksheetCount, targetLetters } = options;
    const targets = targetLetters ? targetLetters.split(',') : ['b', 'd'];
    
    return Array.from({ length: worksheetCount }, () => {
        const rows = Array.from({ length: 8 }, () => {
            const letters = Array.from({ length: 15 }, () => Math.random() > 0.5 ? targets[0] : targets[1]);
            return {
                letters,
                targetCount: letters.filter(l => l === targets[0]).length
            };
        });

        return {
            title: 'Harf Ayırt Etme (Hızlı Mod)',
            instruction: `Sadece "${targets[0]}" harflerini bul ve daire içine al.`,
            prompt: `Sadece "${targets[0]}" harflerini bul.`,
            pedagogicalNote: 'Benzer harfleri ayırt etme (b/d/p/q).',
            imagePrompt: 'Harfler',
            targetLetters: targets,
            rows
        };
    });
};

// 7. Rapid Naming
export const generateOfflineRapidNaming = async (options: GeneratorOptions): Promise<RapidNamingData[]> => {
    const { worksheetCount, type } = options; // type: 'color', 'object', 'number'
    
    return Array.from({ length: worksheetCount }, () => {
        let items: any[] = [];
        if (type === 'number') {
            const nums = ['2', '4', '6', '8', '9'];
            items = Array.from({ length: 25 }, () => {
                const val = getRandomItems(nums, 1)[0];
                return { type: 'number', value: val, label: val };
            });
        } else if (type === 'color') {
            const colors = ['red', 'blue', 'green', 'yellow', 'black'];
            items = Array.from({ length: 25 }, () => {
                const c = getRandomItems(colors, 1)[0];
                return { type: 'color', value: c, label: '' };
            });
        } else { // Object (Default)
            const objs = ['star', 'heart', 'circle', 'square'];
            items = Array.from({ length: 25 }, () => {
                const o = getRandomItems(objs, 1)[0];
                return { type: 'icon', value: o, label: o === 'star' ? '⭐' : o === 'heart' ? '❤️' : o === 'circle' ? '⚫' : '🟦' };
            });
        }

        return {
            title: 'Hızlı İsimlendirme (Hızlı Mod)',
            instruction: 'Soldan sağa doğru olabildiğince hızlı bir şekilde isimlendirin.',
            prompt: 'Hızlıca isimlendir.',
            pedagogicalNote: 'Otomatikleşmiş isimlendirme hızı (RAN).',
            imagePrompt: 'Saat',
            grid: { items },
            type: (type as any) || 'object'
        };
    });
};

// 8. Phonological Awareness
export const generateOfflinePhonologicalAwareness = async (options: GeneratorOptions): Promise<PhonologicalAwarenessData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Fonolojik Farkındalık (Hızlı Mod)',
        instruction: 'Soruları cevaplayın.',
        prompt: 'Soruları cevaplayın.',
        pedagogicalNote: 'Ses ve hece farkındalığı.',
        imagePrompt: 'Kulak',
        exercises: [
            { type: 'syllable-counting', question: 'Bu kelime kaç hecelidir?', word: 'Kaplumbağa', options: [3, 4, 5], answer: 4 },
            { type: 'rhyming', question: 'Hangi kelime bununla kafiyelidir?', word: 'Masa', options: ['Kasa', 'Sandalye', 'Kalem'], answer: 'Kasa' },
            { type: 'syllable-counting', question: 'Bu kelime kaç hecelidir?', word: 'Bilgisayar', options: [3, 4, 5], answer: 4 },
            { type: 'rhyming', question: 'Hangi kelime bununla kafiyelidir?', word: 'Gül', options: ['Bülbül', 'Ağaç', 'Yaprak'], answer: 'Bülbül' }
        ]
    }));
};

// 9. Mirror Letters
export const generateOfflineMirrorLetters = async (options: GeneratorOptions): Promise<MirrorLettersData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Ayna Harfler (Hızlı Mod)',
        instruction: 'Ters duran harfleri bul ve işaretle.',
        pedagogicalNote: 'Uzamsal yönelim ve harf tanıma.',
        imagePrompt: 'Ayna',
        targetPair: 'b-d',
        rows: Array.from({ length: 5 }, () => ({
            items: Array.from({ length: 6 }, () => {
                const isMirrored = Math.random() > 0.7;
                return {
                    letter: getRandomItems(['b', 'd', 'p', 'q'], 1)[0],
                    isMirrored,
                    rotation: isMirrored ? 180 : 0
                };
            })
        }))
    }));
};

// 10. Syllable Train
export const generateOfflineSyllableTrain = async (options: GeneratorOptions): Promise<SyllableTrainData[]> => {
    return Array.from({ length: options.worksheetCount }, () => {
        const words = ['Araba', 'Kelebek', 'Televizyon', 'Bilgisayar'];
        const trains = words.map(w => ({
            word: w,
            syllables: simpleSyllabify(w)
        }));
        return {
            title: 'Hece Treni (Hızlı Mod)',
            instruction: 'Vagonlardaki heceleri birleştir ve kelimeyi oku.',
            pedagogicalNote: 'Heceleme ve kelime oluşturma.',
            imagePrompt: 'Tren',
            trains
        };
    });
};

// 11. Visual Tracking Lines
export const generateOfflineVisualTrackingLines = async (options: GeneratorOptions): Promise<VisualTrackingLineData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Gözle Takip Çizgileri (Hızlı Mod)',
        instruction: 'Çizgileri gözünle takip et ve nereye gittiğini bul.',
        pedagogicalNote: 'Göz kaslarını güçlendirme ve görsel takip.',
        imagePrompt: 'Yol',
        width: 500,
        height: 400,
        paths: generatePaths(5, 500, 400)
    }));
};

// 12. Backward Spelling
export const generateOfflineBackwardSpelling = async (options: GeneratorOptions): Promise<BackwardSpellingData[]> => {
    const { worksheetCount } = options;
    const words = ['Kedi', 'Masa', 'Kitap', 'Okul', 'Elma'];
    
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Ters Harfler (Hızlı Mod)',
        instruction: 'Tersten yazılmış kelimeleri düzelt.',
        pedagogicalNote: 'Ortografik farkındalık.',
        imagePrompt: 'Harf',
        items: words.map(w => ({
            reversed: w.split('').reverse().join(''),
            correct: w
        }))
    }));
};
