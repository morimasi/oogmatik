import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData } from '../../types';
import { getRandomItems, shuffle, getRandomInt, TR_VOCAB, turkishAlphabet, COLORS, simpleSyllabify, getWordsForDifficulty, SHAPE_TYPES, VISUALLY_SIMILAR_CHARS, EMOJI_MAP } from './helpers';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Bilişsel beceri açıklaması.
3. "instruction": Net yönerge.
4. "imagePrompt": Etkinlik için MUTLAKA bir adet ana görsel betimlemesi (İngilizce). Konuyla ilgili sevimli, renkli bir illüstrasyon.
5. İçerik dolu ve gerçekçi olmalı.
`;

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

// 1. Attention Focus (Geliştirilmiş Özellik Bazlı Sorular)
export const generateOfflineAttentionFocus = async (options: GeneratorOptions): Promise<AttentionFocusData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 4;

    // Gelişmiş Özellik Havuzu
    interface ItemPoolItem {
        name: string;
        category: string;
        features: string[]; // Renk dışındaki özellikler
        negations: string[]; // Olumsuz özellikler (X değildir)
    }

    const itemPool: ItemPoolItem[] = [
        { 
            name: 'Limon', category: 'Meyve', 
            features: ['tadı çok ekşidir', 'çay ve salatalara sıkılır', 'kabuğu pütürlüdür', 'sarı renklidir'], 
            negations: ['tatlı değildir', 'kırmızı değildir'] 
        },
        { 
            name: 'Çilek', category: 'Meyve', 
            features: ['üzerinde küçük noktalar vardır', 'yazın yetişir', 'reçeli çok güzel olur', 'kırmızı renklidir'], 
            negations: ['ekşi değildir', 'büyük bir meyve değildir'] 
        },
        { 
            name: 'Karpuz', category: 'Meyve', 
            features: ['dışı yeşil içi kırmızıdır', 'yazın serinlemek için yenir', 'çekirdekleri vardır', 'oldukça ağırdır'], 
            negations: ['ağaçta yetişmez', 'kabuğuyla yenmez'] 
        },
        { 
            name: 'Havuç', category: 'Sebze', 
            features: ['tavşanlar çok sever', 'toprağın altında yetişir', 'uzun ve sivri şekillidir', 'gözlere faydalıdır'], 
            negations: ['meyve değildir', 'yumuşak değildir'] 
        },
        { 
            name: 'Patlıcan', category: 'Sebze', 
            features: ['karnıyarık yemeği yapılır', 'mor renkli bir kabuğu vardır', 'sapı yeşildir', 'uzun veya tombul olabilir'], 
            negations: ['çiğ yenmez', 'kırmızı değildir'] 
        },
        { 
            name: 'Penguen', category: 'Hayvan', 
            features: ['buzullarda yaşar', 'uçamayan bir kuştur', 'paytak paytak yürür', 'siyah beyaz renklidir'], 
            negations: ['sıcağı sevmez', 'dört ayaklı değildir'] 
        },
        { 
            name: 'Zürafa', category: 'Hayvan', 
            features: ['çok uzun bir boynu vardır', 'ağaçların tepesindeki yaprakları yer', 'üzerinde kahverengi benekler vardır'], 
            negations: ['et yemez', 'küçük değildir'] 
        },
        { 
            name: 'Ambulans', category: 'Araç', 
            features: ['hastaları hastaneye taşır', 'sireni çaldığında yol verilir', 'üzerinde kırmızı şeritler vardır'], 
            negations: ['yük taşımaz', 'denizde gitmez'] 
        },
        { 
            name: 'İtfaiye', category: 'Araç', 
            features: ['yangınları söndürmeye gider', 'uzun bir merdiveni vardır', 'kırmızı renklidir'], 
            negations: ['yolcu taşımaz', 'mavi değildir'] 
        }
    ];

    return Array.from({ length: worksheetCount }, () => {
        const puzzles = Array.from({ length: count }, () => {
            // Hedef öğeyi seç
            const target = getRandomItems(itemPool, 1)[0];
            
            // Çeldiricileri seç (Aynı kategoriden veya tamamen farklı)
            const sameCategoryItems = itemPool.filter(i => i.category === target.category && i.name !== target.name);
            const diffCategoryItems = itemPool.filter(i => i.category !== target.category);
            
            const distractor1 = getRandomItems(sameCategoryItems, 1)[0] || getRandomItems(diffCategoryItems, 1)[0];
            const distractor2 = getRandomItems(diffCategoryItems, 1)[0];
            
            // Soruyu oluştur (Riddle)
            let riddle = "";
            const feature1 = getRandomItems(target.features, 1)[0];
            const feature2 = getRandomItems(target.features.filter(f => f !== feature1), 1)[0];
            const negation = getRandomItems(target.negations, 1)[0];

            if (difficulty === 'Başlangıç') {
                riddle = `Aradığımız varlık bir ${target.category}dir. ${feature1} ve ${feature2}.`;
            } else {
                riddle = `Aradığım şey bir ${distractor2.category} değildir. ${feature1}. Genellikle ${feature2} ama kesinlikle ${negation}.`;
            }
            
            // Kutuları oluştur
            const box1Items = shuffle([target.name, distractor1.name, getRandomItems(diffCategoryItems, 1)[0]?.name || 'Elma']);
            const box2Items = shuffle([distractor2.name, getRandomItems(sameCategoryItems, 1)[0]?.name || 'Armut', 'Masa']);
            
            return {
                riddle,
                boxes: [{ title: 'Kutu A', items: box1Items }, { title: 'Kutu B', items: box2Items }],
                options: shuffle([target.name, distractor1.name, distractor2.name]),
                answer: target.name
            };
        });

        return {
            title: `Dikkatini Ver (${difficulty})`,
            instruction: "Verilen özellikleri dikkatlice oku, ipuçlarını takip et ve doğru cevabı bul.",
            pedagogicalNote: "İşitsel/Sözel dikkati sürdürme, detayları analiz etme ve eleme yöntemiyle problem çözme.",
            imagePrompt: "Dedektif büyüteç ile iz sürüyor, flat vector style.",
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

// 4. Attention Development (Geliştirilmiş - Profesyonel Mantık)
export const generateOfflineAttentionDevelopment = async (options: GeneratorOptions): Promise<AttentionDevelopmentData[]> => {
    const { worksheetCount, itemCount, difficulty, concept } = options;
    const isVerbal = concept === 'verbal';
    const count = itemCount || 4;

    // Word Pools for Verbal Logic
    const colors = ['kırmızı', 'mavi', 'yeşil', 'sarı', 'mor', 'turuncu'];
    const objects = ['kalem', 'defter', 'silgi', 'çanta', 'kitap', 'masa'];
    const animals = ['kedi', 'köpek', 'kuş', 'balık', 'tavşan', 'kaplumbağa'];

    return Array.from({ length: worksheetCount }, () => {
        const puzzles = Array.from({ length: count }, () => {
            // === NUMERIC LOGIC GENERATOR ===
            if (!isVerbal) {
                // 1. Generate Content First (Answer)
                const answer = getRandomInt(10, 99);
                
                // 2. Create Box Contents (Target Box and Distractor Box)
                const isLeftBoxTarget = Math.random() > 0.5;
                const targetBoxName = isLeftBoxTarget ? "Sol" : "Sağ";
                const otherBoxName = isLeftBoxTarget ? "Sağ" : "Sol";
                
                // Fill Target Box with Answer + Distractors
                const targetDistractors = [answer + getRandomInt(1, 5), answer - getRandomInt(1, 5), getRandomInt(10, 99)];
                const targetBoxNumbers = shuffle([answer, ...targetDistractors]);
                
                // Fill Other Box with random numbers
                const otherBoxNumbers = Array.from({ length: 4 }, () => getRandomInt(10, 99));

                // 3. Generate Riddle based on Difficulty
                let riddle = "";
                
                if (difficulty === 'Başlangıç') {
                    // Direct Identification
                    riddle = `Aradığımız sayı ${targetBoxName} kutudadır. Bu kutudaki ${answer} sayısıdır.`;
                } else if (difficulty === 'Orta') {
                    // One Condition + One Negation
                    const isEven = answer % 2 === 0;
                    const compVal = answer - 5;
                    riddle = `Aradığım sayı ${targetBoxName} kutuda saklanıyor. Bu sayı ${isEven ? 'çift' : 'tek'} bir sayıdır ve ${compVal}'ten büyüktür. Sakın ${otherBoxName} kutudaki sayılara bakma!`;
                } else if (difficulty === 'Zor') {
                    // Comparative Logic
                    const maxInOther = Math.max(...otherBoxNumbers);
                    const relation = answer > maxInOther ? "büyüktür" : "küçüktür";
                    riddle = `Gizli sayı ${targetBoxName} kutudadır. Bu sayı, ${otherBoxName} kutudaki en büyük sayıdan daha ${relation}. Ayrıca bu sayının birler basamağı ${answer % 10} rakamıdır.`;
                } else { // Uzman
                    // Complex Narrative + Math Operation
                    const sumDigits = Math.floor(answer / 10) + (answer % 10);
                    riddle = `Bir dedektif gibi iz sür. Şüpheli sayı ${targetBoxName} kutuda gizleniyor. Eğer bu sayının rakamlarını toplarsan ${sumDigits} elde edersin. Ayrıca bu sayı ${otherBoxName} kutudaki hiç bir sayıya eşit değildir. Dikkatli ol, yanlış kutuya bakma!`;
                }

                // 4. Generate Options
                const correct = answer.toString();
                const wrong1 = targetDistractors[0].toString();
                const wrong2 = otherBoxNumbers[0].toString();
                
                return {
                    riddle,
                    boxes: [
                        { label: isLeftBoxTarget ? 'Sol' : 'Sağ', numbers: isLeftBoxTarget ? targetBoxNumbers : otherBoxNumbers },
                        { label: isLeftBoxTarget ? 'Sağ' : 'Sol', numbers: isLeftBoxTarget ? otherBoxNumbers : targetBoxNumbers }
                    ],
                    options: shuffle([correct, wrong1, wrong2]),
                    answer: correct
                };
            } 
            // === VERBAL LOGIC GENERATOR ===
            else {
                // Similar structure for words
                const targetObj = getRandomItems(objects, 1)[0];
                const targetColor = getRandomItems(colors, 1)[0];
                const answer = `${targetColor} ${targetObj}`; // e.g. "mavi kalem"
                
                const targetBoxName = "A";
                const otherBoxName = "B";
                
                // Distractors
                const d1 = `${targetColor} ${getRandomItems(objects.filter(o=>o!==targetObj), 1)[0]}`; // Same color, diff object
                const d2 = `${getRandomItems(colors.filter(c=>c!==targetColor), 1)[0]} ${targetObj}`; // Diff color, same object
                const d3 = `${getRandomItems(colors, 1)[0]} ${getRandomItems(animals, 1)[0]}`; // Completely diff
                
                const targetBoxItems = shuffle([answer, d1, getRandomItems(objects, 1)[0]]);
                const otherBoxItems = shuffle([d2, d3, getRandomItems(objects, 1)[0]]);
                
                let riddle = "";
                if (difficulty === 'Başlangıç') {
                    riddle = `A kutusundaki ${targetColor} renkli ${targetObj}i bul.`;
                } else {
                    riddle = `Aradığım nesne A kutusundadır. Rengi ${targetColor}dir ama bir ${d1.split(' ')[1]} değildir. B kutusundaki ${d2} ile karıştırma.`;
                }

                return {
                    riddle,
                    boxes: [
                        { label: 'Kutu A', numbers: [], items: targetBoxItems }, // Using extended type in frontend if needed, otherwise string array mapping
                        { label: 'Kutu B', numbers: [], items: otherBoxItems }
                    ],
                    options: shuffle([answer, d1, d2]),
                    answer
                };
            }
        });

        return {
            title: `Dikkat Geliştirme (${difficulty}) - ${isVerbal ? 'Sözel' : 'Sayısal'}`,
            instruction: 'Metni dikkatlice oku, ipuçlarını takip et ve doğru cevabı bul.',
            pedagogicalNote: 'İşleyen bellek (working memory) ve yönerge takibi becerilerini geliştirir.',
            imagePrompt: 'Dikkat',
            puzzles: puzzles.map(p => ({
                ...p,
                boxes: p.boxes.map(b => ({
                    ...b,
                    // If verbal, put items in numbers array as strings (frontend handles diverse types or cast)
                    // For safety in current types, we ensure frontend creates string representation
                    numbers: b.numbers.length > 0 ? b.numbers : b.items as any 
                }))
            }))
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

// AI Generator for Code Reading (Symbol Decoding)
export const generateCodeReadingFromAI = async (options: GeneratorOptions): Promise<CodeReadingData[]> => {
    const { worksheetCount, symbolType, codeLength, itemCount } = options;
    
    const prompt = `
    Kod Okuma (Şifre Çözme) etkinliği.
    Sembol Tipi: ${symbolType || 'arrows'} (Oklar, Şekiller veya Renkler).
    Kod Uzunluğu: ${codeLength || 4} karakter.
    Soru Sayısı: ${itemCount || 5}.
    
    KURALLAR:
    - Bir "Anahtar" (Key Map) oluştur: Sembol -> Değer (Harf veya Sayı).
    - Anahtarı kullanarak anlamlı veya anlamsız kısa kodlar oluştur.
    - Semboller: 'arrow-up', 'arrow-down', 'triangle', 'square', 'red', 'blue' gibi tanımlayıcı stringler kullan.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            keyMap: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { symbol: { type: Type.STRING }, value: { type: Type.STRING }, color: { type: Type.STRING } },
                    required: ['symbol', 'value']
                }
            },
            codesToSolve: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sequence: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }
                    },
                    required: ['sequence', 'answer']
                }
            }
        },
        required: ['title', 'instruction', 'keyMap', 'codesToSolve', 'pedagogicalNote', 'imagePrompt']
    };
    
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<CodeReadingData[]>;
};

export const generateAttentionToQuestionFromAI = async (options: GeneratorOptions): Promise<AttentionToQuestionData[]> => {
    const { worksheetCount, subType } = options;
    
    const prompt = `
    "Soruya Dikkat" başlığı altında bir dikkat ve görsel algı etkinliği üret.
    Alt Tip: ${subType || 'letter-cancellation'}
    
    Eğer 'letter-cancellation' (Harf Eleme) ise:
    - Bir kelime/şifre seç. 
    - Harflerden oluşan bir ızgara (grid) oluştur.
    - Bazı harfleri "targetChars" (üzeri çizilecekler) olarak belirle.
    - Kalan harfler sırayla okunduğunda şifreyi oluştursun.
    
    Eğer 'path-finding' (Yol Takibi) ise:
    - Bir ızgara dolusu sembol ('star-outline', 'star-filled' gibi).
    - Başlangıçtan bitişe giden doğru bir yolu (correctPath) koordinat olarak ver.
    
    Eğer 'visual-logic' (Görsel Mantık) ise:
    - Beşgen (pentagon) şekilleri düşün. Köşelerinde renkli noktalar ve içlerinde çizgiler var.
    - 4 adet şekil üret. 3 tanesi aynı kurala uysun, 1 tanesi farklı olsun (isOdd).
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            subType: { type: Type.STRING, enum: ['letter-cancellation', 'path-finding', 'visual-logic'] },
            // Letter Cancellation Props
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            targetChars: { type: Type.ARRAY, items: { type: Type.STRING } },
            password: { type: Type.STRING },
            // Path Finding Props
            pathGrid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            correctPath: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {r: {type: Type.NUMBER}, c: {type: Type.NUMBER}} } },
            // Visual Logic Props
            logicItems: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.NUMBER },
                        isOdd: { type: Type.BOOLEAN },
                        correctAnswer: { type: Type.STRING },
                        shapes: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { color: { type: Type.STRING }, type: { type: Type.STRING }, connectedTo: { type: Type.ARRAY, items: { type: Type.NUMBER } } } 
                            } 
                        }
                    }
                }
            }
        },
        required: ['title', 'instruction', 'subType', 'pedagogicalNote', 'imagePrompt']
    };
    
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AttentionToQuestionData[]>;
};

export const generateAttentionDevelopmentFromAI = async (options: GeneratorOptions): Promise<AttentionDevelopmentData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    
    const prompt = `
    "Dikkat Geliştirme" (Mantık Bilmecesi) etkinliği.
    ${itemCount || 4} adet soru üret.
    
    HER SORU İÇİN:
    1. İki kutu (Sol/Sağ) içinde rastgele sayılar oluştur.
    2. Bir hedef sayıyı tanımlayan KARMAŞIK ve ÇELDİRİCİ bir bilmece (riddle) yaz.
    
    Zorluk Seviyesi: ${difficulty || 'Orta'}
    
    METİN KURALLARI:
    - Metinler uzun olsun (en az 2-3 cümle).
    - Çeldirici ifadeler kullan (Örn: "En büyük sayı değildir ama en küçük de değildir.", "Diğer kutudaki sayılarla karıştırma.", "Tek sayıları hemen ele.").
    - Matematiksel terimler ekle: "Bir deste", "düzine", "rakamları toplamı", "çift sayı", "5'in katı".
    - Örnek: "Aradığımız sayı sol kutuda saklanıyor. Bu sayı bir deste gülden fazladır ama 50'ye ulaşamaz. Çift bir sayıdır ve kutudaki en büyük sayı değildir."
    
    3. Seçenekleri (a, b, c, d, e) belirle.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        riddle: { type: Type.STRING },
                        boxes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    numbers: { type: Type.ARRAY, items: { type: Type.INTEGER } }
                                },
                                required: ['numbers']
                            }
                        },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }
                    },
                    required: ['riddle', 'boxes', 'options', 'answer']
                }
            }
        },
        required: ['title', 'instruction', 'puzzles', 'pedagogicalNote', 'imagePrompt']
    };
    
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AttentionDevelopmentData[]>;
};

export const generateAttentionFocusFromAI = async (options: GeneratorOptions): Promise<AttentionFocusData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 4;

    const prompt = `
    "Dikkatini Ver" (Mantıksal Bulmaca) etkinliği. 
    Bu etkinlikte öğrenci, verilen ipuçlarını kullanarak doğru nesneyi bulmalıdır.
    
    HER SORU İÇİN:
    1. İki veya üç liste/kutu oluştur (Örn: "Meyveler", "Sebzeler" veya "Yazlık", "Kışlık" kıyafetler).
    2. Her kutuda 4-5 öğe olsun.
    3. Hedef bir öğe seç.
    4. Bu hedefi tarif eden MANTIKLI ve ELEME GEREKTİREN bir bilmece yaz.
       - Konum ipucu: "Aradığımız şey X ile aynı kutudadır."
       - Olumsuzlama ipucu: "Y değildir", "Rengi kırmızı değildir."
       - Özellik ipucu: "Z harfi ile başlar", "Ekşidir".
    
    Zorluk Seviyesi: ${difficulty}.
    - Başlangıç: Kısa, net ipuçları.
    - Orta/Zor: Daha dolaylı ipuçları (Örn: "Çekirdekli bir meyvenin olmadığı kutudadır.").
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;

    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        riddle: { type: Type.STRING },
                        boxes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING }, // e.g. "Kutu 1" or empty
                                    items: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ['items']
                            }
                        },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }
                    },
                    required: ['riddle', 'boxes', 'options', 'answer']
                }
            }
        },
        required: ['title', 'instruction', 'puzzles', 'pedagogicalNote', 'imagePrompt']
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AttentionFocusData[]>;
};

// Re-export placeholders to prevent errors
export const generateReadingFlowFromAI = async (o: GeneratorOptions): Promise<ReadingFlowData[]> => [];
export const generateLetterDiscriminationFromAI = async (o: GeneratorOptions): Promise<LetterDiscriminationData[]> => [];
export const generateRapidNamingFromAI = async (o: GeneratorOptions): Promise<RapidNamingData[]> => [];
export const generatePhonologicalAwarenessFromAI = async (o: GeneratorOptions): Promise<PhonologicalAwarenessData[]> => [];
export const generateMirrorLettersFromAI = async (o: GeneratorOptions): Promise<MirrorLettersData[]> => [];
export const generateSyllableTrainFromAI = async (o: GeneratorOptions): Promise<SyllableTrainData[]> => [];
export const generateVisualTrackingLinesFromAI = async (o: GeneratorOptions): Promise<VisualTrackingLineData[]> => [];
export const generateBackwardSpellingFromAI = async (o: GeneratorOptions): Promise<BackwardSpellingData[]> => [];