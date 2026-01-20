
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, HandwritingPracticeData, RealLifeProblemData, LetterVisualMatchingData, SyllableMasterLabData, MorphologyMatrixData } from '../../types';
import { getRandomItems, shuffle, getRandomInt, TR_VOCAB, turkishAlphabet, COLORS, simpleSyllabify, getWordsForDifficulty, SHAPE_TYPES, VISUALLY_SIMILAR_CHARS, EMOJI_MAP } from './helpers';

// COMPREHENSIVE SYLLABLE MASTER LAB (OFFLINE)
export const generateOfflineSyllableMasterLab = async (options: GeneratorOptions): Promise<SyllableMasterLabData[]> => {
    const { worksheetCount, difficulty, itemCount, topic, variant = 'split', case: letterCase, syllableRange = '2-3' } = options;
    const count = itemCount || 32; 
    
    const [minSyllables, maxSyllables] = syllableRange.split('-').map(Number);
    
    return Array.from({ length: worksheetCount }, () => {
        let pool = getWordsForDifficulty(difficulty, topic || 'animals');
        const filteredPool = pool.filter(word => {
            const sylCount = simpleSyllabify(word).length;
            return sylCount >= minSyllables && sylCount <= maxSyllables;
        });

        let finalPool = filteredPool;
        if (finalPool.length < count) {
            Object.keys(TR_VOCAB).forEach(cat => {
                if (Array.isArray(TR_VOCAB[cat])) {
                    TR_VOCAB[cat].forEach((w: any) => {
                        const wordStr = typeof w === 'string' ? w : w.text;
                        if (wordStr) {
                             const sylCount = simpleSyllabify(wordStr).length;
                             if (sylCount >= minSyllables && sylCount <= maxSyllables) finalPool.push(wordStr);
                        }
                    });
                }
            });
        }
        
        const selection = getRandomItems([...new Set(finalPool)], count);
        const items = selection.map(word => {
            const syllables = simpleSyllabify(word);
            const processedWord = letterCase === 'upper' ? word.toLocaleUpperCase('tr') : word.toLocaleLowerCase('tr');
            const processedSyllables = syllables.map(s => letterCase === 'upper' ? s.toLocaleUpperCase('tr') : s.toLocaleLowerCase('tr'));
            
            return {
                word: processedWord,
                syllables: processedSyllables,
                missingIndex: variant === 'complete' ? getRandomInt(0, processedSyllables.length - 1) : undefined,
                scrambledIndices: variant === 'scrambled' ? shuffle(Array.from({length: processedSyllables.length}, (_,i)=>i)) : undefined,
                syllableCount: syllables.length
            };
        });

        return {
            title: "Hece Ustası Laboratuvarı",
            instruction: "Hece çalışmasını yönergeye göre tamamlayın.",
            pedagogicalNote: "Fonolojik farkındalık ve sentez becerilerini destekler.",
            mode: variant as any,
            items
        };
    });
};

// HARF-GÖRSEL EŞLEME (FIX: Missing generator added)
export const generateOfflineLetterVisualMatching = async (options: GeneratorOptions): Promise<LetterVisualMatchingData[]> => {
    const { worksheetCount, difficulty, itemCount, case: letterCase, fontFamily } = options;
    const count = itemCount || 8;

    const letterMap: Record<string, string> = {
        'A': 'Aslan', 'B': 'Balık', 'C': 'Civciv', 'Ç': 'Çilek', 'D': 'Dondurma',
        'E': 'Elma', 'F': 'Fil', 'G': 'Güneş', 'H': 'Havuç', 'I': 'Irmak', 
        'İ': 'İnek', 'K': 'Kedi', 'L': 'Limon', 'M': 'Maymun', 'N': 'Nar', 
        'O': 'Otobüs', 'Ö': 'Ördek', 'P': 'Portakal', 'R': 'Roket', 'S': 'Saat', 
        'Ş': 'Şemsiye', 'T': 'Top', 'U': 'Uçak', 'Ü': 'Üzüm', 'V': 'Vazo', 
        'Y': 'Yıldız', 'Z': 'Zürafa'
    };

    return Array.from({ length: worksheetCount }, () => {
        const alphabet = Object.keys(letterMap).filter(l => l !== 'Ğ');
        const selectedLetters = getRandomItems(alphabet, count);

        const pairs = selectedLetters.map(letter => ({
            letter: letterCase === 'lower' ? letter.toLocaleLowerCase('tr') : letter,
            word: letterMap[letter],
            imagePrompt: `${letterMap[letter]} educational illustration, high contrast`
        }));

        return {
            title: "Harf-Görsel Eşleme",
            instruction: "Harfleri, o harfle başlayan varlıkların görselleri ile eşleştirin.",
            pedagogicalNote: "Ses-sembol ilişkisini ve fonolojik farkındalığı güçlendirir.",
            pairs,
            settings: {
                fontFamily: fontFamily || 'OpenDyslexic',
                letterCase: letterCase || 'upper',
                showTracing: true,
                gridCols: options.gridSize || 2
            }
        };
    });
};

// AYNA HARFLER (Mirror Letters)
export const generateOfflineMirrorLetters = async (options: GeneratorOptions): Promise<MirrorLettersData[]> => {
    const { worksheetCount, difficulty } = options;
    const pairs = [['b', 'd'], ['p', 'q'], ['m', 'n'], ['u', 'n']];
    
    return Array.from({ length: worksheetCount }, () => {
        const targetPair = getRandomItems(pairs, 1)[0];
        const rows = Array.from({ length: 10 }, () => ({
            items: Array.from({ length: 6 }, () => ({
                letter: targetPair[getRandomInt(0, 1)],
                rotation: Math.random() > 0.8 ? [90, 180, 270][getRandomInt(0, 2)] : 0,
                isMirrored: Math.random() > 0.8
            }))
        }));

        return {
            title: "Ayna Harfler (Görsel Ayırt Etme)",
            instruction: `Birbirine benzeyen "${targetPair[0]}" ve "${targetPair[1]}" harflerini ayırt et.`,
            pedagogicalNote: "Yönsel algı ve görsel diskriminasyon becerilerini geliştirir.",
            targetPair: targetPair.join('/'),
            rows
        };
    });
};

// RAPİD NAMİNG (Hızlı İsimlendirme)
export const generateOfflineRapidNaming = async (options: GeneratorOptions): Promise<RapidNamingData[]> => {
    const { worksheetCount } = options;
    const items = ['🍎', '🚗', '⭐', '🏠', '🐱', '⚽', '🔔', '🔑'];
    
    return Array.from({ length: worksheetCount }, () => {
        const grid = Array.from({ length: 5 }, () => ({
            items: Array.from({ length: 8 }, () => ({
                type: 'object',
                value: items[getRandomInt(0, items.length - 1)]
            }))
        }));

        return {
            title: "Hızlı İsimlendirme (RAN)",
            instruction: "Gördüğün nesneleri en hızlı şekilde, soldan sağa doğru sesli olarak oku.",
            pedagogicalNote: "Görsel uyaranları işlemleme hızı ve sözel tepki akıcılığını ölçer.",
            type: 'object',
            grid
        };
    });
};

// HARF ELEME (Letter Discrimination)
export const generateOfflineLetterDiscrimination = async (options: GeneratorOptions): Promise<LetterDiscriminationData[]> => {
    const { worksheetCount } = options;
    const targets = ['b', 'd', 'p'];
    
    return Array.from({ length: worksheetCount }, () => {
        const rows = Array.from({ length: 15 }, () => ({
            letters: Array.from({ length: 30 }, () => Math.random() > 0.2 ? 'o' : targets[getRandomInt(0, targets.length - 1)])
        }));

        return {
            title: "Harf Ayırt Etme Testi",
            instruction: `Satırlar içindeki "${targets.join(', ')}" harflerini bul ve üzerini çiz.`,
            pedagogicalNote: "Seçici dikkat ve görsel tarama yoğunluğunu artırır.",
            targetLetters: targets,
            rows
        };
    });
};

// MORPHOLOGY MATRIX (Morfolojik Kelime İnşaatı)
export const generateOfflineMorphologyMatrix = async (options: GeneratorOptions): Promise<MorphologyMatrixData[]> => {
    const { worksheetCount, difficulty, itemCount } = options;
    const count = itemCount || 10;

    // Seviyeye Göre Veri Setleri
    const DATA_SETS = {
        'Başlangıç': [ // Bileşik Kelimeler
            { root: "Hanım", suffixes: ["eli", "ağacı", "kuşu"], hint: "Bir çiçek adı" },
            { root: "Kuş", suffixes: ["burnu", "evi", "yemi"], hint: "Bir çay bitkisi" },
            { root: "Aslan", suffixes: ["ağzı", "pençesi", "yelesi"], hint: "Bir çiçek adı" },
            { root: "Ateş", suffixes: ["böceği", "topu", "suyu"], hint: "Işık saçan böcek" },
            { root: "Gök", suffixes: ["kuşağı", "yüzü", "gürültüsü"], hint: "Renkli doğa olayı" },
            { root: "Buz", suffixes: ["dolabı", "dağı", "kıran"], hint: "Beyaz eşya" },
            { root: "Bilgi", suffixes: ["sayar", "işlem", "küpü"], hint: "Teknolojik cihaz" },
            { root: "Ayak", suffixes: ["kabı", "topu", "izi"], hint: "Giyilen eşya" }
        ],
        'Orta': [ // Basit Çekim Ekleri
            { root: "Kitap", suffixes: ["lar", "ler", "da"], hint: "Çoğul hali" },
            { root: "Okul", suffixes: ["da", "dan", "a"], hint: "Bulunma hali" },
            { root: "Kalem", suffixes: ["im", "in", "i"], hint: "Benim kalemim" },
            { root: "Ev", suffixes: ["de", "den", "e"], hint: "Ayrılma hali" },
            { root: "Çocuk", suffixes: ["lar", "u", "a"], hint: "Çoğul hali" },
            { root: "Ağaç", suffixes: ["ta", "tan", "a"], hint: "Bulunma hali (sertleşme)" },
            { root: "Yol", suffixes: ["cular", "da", "a"], hint: "Yolculuk edenler" },
            { root: "Göz", suffixes: ["ler", "ü", "e"], hint: "Çoğul hali" }
        ],
        'Zor': [ // Yapım Ekleri
            { root: "Göz", suffixes: ["lük", "cü", "süz"], hint: "Görme aracı" },
            { root: "Simit", suffixes: ["çi", "lik", "siz"], hint: "Simit satan kişi" },
            { root: "Yol", suffixes: ["cu", "luk", "suz"], hint: "Seyahat eden" },
            { root: "Su", suffixes: ["cu", "luk", "suz"], hint: "Susuz kalmak" },
            { root: "Şeker", suffixes: ["lik", "li", "siz"], hint: "Şeker konulan kap" },
            { root: "Tuz", suffixes: ["luk", "lu", "suz"], hint: "Yemeğe tuz atan" },
            { root: "Kalem", suffixes: ["lik", "li", "siz"], hint: "Kalem kutusu" },
            { root: "Kitap", suffixes: ["lık", "çı", "sız"], hint: "Kitap koyulan raf" }
        ],
        'Uzman': [ // Ses Olayları ve Karmaşık Türetim
            { root: "Kayıp", suffixes: ["ol", "et", "ver"], hint: "Ses düşmesi (I gider)" },
            { root: "His", suffixes: ["et", "siz", "li"], hint: "Ünsüz türemesi (SS)" },
            { root: "Renk", suffixes: ["i", "e", "den"], hint: "Ünsüz yumuşaması (G)" },
            { root: "Ağaç", suffixes: ["a", "ı", "ta"], hint: "Ünsüz yumuşaması (C)" },
            { root: "Şehir", suffixes: ["e", "i", "de"], hint: "Ses düşmesi (İ gider)" },
            { root: "Burun", suffixes: ["um", "a", "da"], hint: "Ses düşmesi (U gider)" },
            { root: "Sabır", suffixes: ["et", "lı", "sız"], hint: "Ses düşmesi (I gider)" },
            { root: "Fikir", suffixes: ["im", "e", "den"], hint: "Ses düşmesi (İ gider)" }
        ]
    };

    return Array.from({ length: worksheetCount }, () => {
        const selectedPool = (DATA_SETS as any)[difficulty] || DATA_SETS['Orta'];
        
        // Eğer havuz yetersizse (kullanıcı çok istemişse), tekrarlı doldur
        const items = [];
        for(let i=0; i<count; i++) {
            const base = selectedPool[i % selectedPool.length];
            // Suffixleri karıştır
            const shuffledSuffixes = shuffle([...base.suffixes]);
            items.push({ ...base, suffixes: shuffledSuffixes });
        }

        return {
            title: "Morfim Matrisi (Kelime İnşaatı)",
            instruction: "Kök kelimeyi uygun ekle birleştir ve yeni kelimeyi yaz.",
            pedagogicalNote: "Kelimeleri anlamlı parçalara (morfimlere) ayırarak analiz etme yeteneğini geliştirir. Dislekside okuma stratejisi olarak kritiktir.",
            items: shuffle(items),
            difficulty
        };
    });
};

// DİĞER EKSİK MODÜLLER İÇİN BOŞ/STANDART DÖNÜŞLER (Hataları önlemek için)
export const generateOfflineReadingFlow = async (o: any) => [{ title: 'Okuma Akıcılığı', text: { paragraphs: [] } }];
export const generateOfflinePhonologicalAwareness = async (o: any) => [{ title: 'Fonolojik Farkındalık', exercises: [] }];
export const generateOfflineSyllableTrain = async (o: any) => [{ title: 'Hece Treni', trains: [] }];
export const generateOfflineVisualTrackingLines = async (o: any) => [{ title: 'Görsel Takip', paths: [], width: 800, height: 600 }];
export const generateOfflineBackwardSpelling = async (o: any) => [{ title: 'Geriye Doğru Heceleme', items: [] }];
export const generateOfflineCodeReading = async (o: any) => [{ title: 'Şifre Okuma', keyMap: [], codesToSolve: [] }];
export const generateOfflineAttentionToQuestion = async (o: any) => [{ title: 'Dikkat ve Sorular', subType: 'letter-cancellation' }];
export const generateOfflineHandwritingPractice = async (o: any) => [{ title: 'Yazı Alıştırması', lines: [] }];
