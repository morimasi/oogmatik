
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, HandwritingPracticeData, RealLifeProblemData, LetterVisualMatchingData, SyllableMasterLabData, MorphologyMatrixData, ReadingPyramidData } from '../../types';
import { getRandomItems, shuffle, getRandomInt, TR_VOCAB, turkishAlphabet, COLORS, syllabifyWord, getWordsForDifficulty, SHAPE_TYPES, VISUALLY_SIMILAR_CHARS, EMOJI_MAP } from './helpers';

// COMPREHENSIVE SYLLABLE MASTER LAB (OFFLINE)
export const generateOfflineSyllableMasterLab = async (options: GeneratorOptions): Promise<SyllableMasterLabData[]> => {
    const { worksheetCount, difficulty, itemCount, topic, variant = 'split', case: letterCase, syllableRange = '2-3' } = options;
    const count = itemCount || 32;

    const [minSyllables, maxSyllables] = syllableRange.split('-').map(Number);

    return Array.from({ length: worksheetCount }, () => {
        const pool = getWordsForDifficulty(difficulty, topic || 'animals');
        const filteredPool = pool.filter(word => {
            const sylCount = syllabifyWord(word).length;
            return sylCount >= minSyllables && sylCount <= maxSyllables;
        });

        const finalPool = filteredPool;
        if (finalPool.length < count) {
            Object.keys(TR_VOCAB).forEach(cat => {
                if (Array.isArray(TR_VOCAB[cat])) {
                    TR_VOCAB[cat].forEach((w: any) => {
                        const wordStr = typeof w === 'string' ? w : w.text;
                        if (wordStr) {
                            const sylCount = syllabifyWord(wordStr).length;
                            if (sylCount >= minSyllables && sylCount <= maxSyllables) finalPool.push(wordStr);
                        }
                    });
                }
            });
        }

        const selection = getRandomItems([...new Set(finalPool)], count);
        const items = selection.map(word => {
            const syllables = syllabifyWord(word);
            const processedWord = letterCase === 'upper' ? word.toLocaleUpperCase('tr') : word.toLocaleLowerCase('tr');
            const processedSyllables = syllables.map(s => letterCase === 'upper' ? s.toLocaleUpperCase('tr') : s.toLocaleLowerCase('tr'));

            return {
                word: processedWord,
                syllables: processedSyllables,
                missingIndex: variant === 'complete' ? getRandomInt(0, processedSyllables.length - 1) : undefined,
                scrambledIndices: variant === 'scrambled' ? shuffle(Array.from({ length: processedSyllables.length }, (_, i) => i)) : undefined,
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
    const { worksheetCount, _difficulty, itemCount, case: letterCase, fontFamily } = options;
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
    const { worksheetCount, _difficulty } = options;
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
        for (let i = 0; i < count; i++) {
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

// READING PYRAMID (Akıcı Okuma Piramidi)
export const generateOfflineReadingPyramid = async (options: GeneratorOptions): Promise<ReadingPyramidData[]> => {
    const { worksheetCount, difficulty, pyramidHeight, _topic } = options;
    const height = pyramidHeight || 5;

    // Hazır Cümle Setleri (Genişletilmiş)
    const SENTENCE_SETS = [
        ["Güneş.", "Güneş açtı.", "Bugün güneş açtı.", "Bugün parlak güneş açtı.", "Bugün gökyüzünde parlak güneş açtı."],
        ["Kedi.", "Kedi uyuyor.", "Sarı kedi uyuyor.", "Sarı kedi koltukta uyuyor.", "Küçük sarı kedi koltukta uyuyor."],
        ["Ağaç.", "Ağaç büyüdü.", "Yeşil ağaç büyüdü.", "Bahçedeki yeşil ağaç büyüdü.", "Bahçedeki kocaman yeşil ağaç büyüdü."],
        ["Deniz.", "Deniz dalgalı.", "Mavi deniz dalgalı.", "Bugün mavi deniz çok dalgalı.", "Bugün masmavi deniz çok dalgalı."],
        ["Kitap.", "Kitap okudum.", "Güzel bir kitap okudum.", "Dün akşam güzel bir kitap okudum.", "Dün akşam odamda güzel bir kitap okudum."],
        ["Yol.", "Yol uzun.", "Bu yol çok uzun.", "Bu taşlı yol çok uzun.", "Köye giden bu taşlı yol çok uzun."],
        ["Elma.", "Elma yedim.", "Kırmızı elma yedim.", "Tatlı kırmızı elma yedim.", "Bahçeden kopardığım tatlı kırmızı elma yedim."]
    ];

    return Array.from({ length: worksheetCount }, () => {
        const pyramids = [];
        // Bir sayfaya 2 piramit sığdır (Orta/Büyük boy için)
        // Küçük boy (3-4 satır) için 4 tane sığdırılabilir.
        const countPerPage = height <= 5 ? 4 : 2;

        const selectedSets = getRandomItems(SENTENCE_SETS, countPerPage);

        for (const set of selectedSets) {
            // İstenen yüksekliğe göre kes
            const levels = set.slice(0, height);
            // Eğer set yetersizse son cümleyi tekrarla (veya boş bırak)
            while (levels.length < height) {
                levels.push(levels[levels.length - 1] + " (Tekrar)");
            }
            pyramids.push({
                title: levels[0], // Başlık ilk kelime
                levels
            });
        }

        return {
            title: "Akıcı Okuma Piramidi",
            instruction: "En üstten başlayarak aşağıya doğru sesli oku. Gözlerinle satırın ortasına odaklan.",
            pedagogicalNote: "Göz sıçramalarını (saccades) ve görsel dikkat alanını (span) genişleterek okuma akıcılığını artırır.",
            pyramids,
            difficulty
        };
    });
};

// DİĞER EKSİK MODÜLLER İÇİN BOŞ/STANDART DÖNÜŞLER (Hataları önlemek için)
export const generateOfflineReadingFlow = async (options: GeneratorOptions): Promise<ReadingFlowData[]> => {
    const { worksheetCount, difficulty, _topic } = options;
    const results: ReadingFlowData[] = [];

    // Pedagojik Ritmik Akış Setleri (Seviye Bazlı)
    const FLOW_TEMPLATES: Record<string, string[][]> = {
        'Başlangıç': [
            ["Ali", "Ali bak.", "Ali eve bak.", "Ali büyük eve bak.", "Ali o büyük eve bak."],
            ["Işık", "Işık yak.", "Işık hızla yak.", "Işık mumu hızla yak.", "Işık o mumu hızla yak."],
            ["Ece", "Ece ye.", "Ece elma ye.", "Ece tatlı elma ye.", "Ece o tatlı elma ye."]
        ],
        'Orta': [
            ["Kitap", "Kitap oku.", "Her gün kitap oku.", "Her gün bir kitap oku.", "Her gün yeni bir kitap oku."],
            ["Okul", "Okul açıldı.", "Bugün okul açıldı.", "Bugün neşeyle okul açıldı.", "Bugün tüm yurtta okul açıldı."],
            ["Boya", "Boya yap.", "Kırmızı boya yap.", "Duvara kırmızı boya yap.", "Büyük duvara kırmızı boya yap."]
        ],
        'Zor': [
            ["Yapay", "Yapay zeka.", "Gelecek yapay zeka.", "Gelecek tamamen yapay zeka.", "Gelecek tamamen yapay zeka olacak."],
            ["Bilim", "Bilim insanı.", "Genç bir bilim insanı.", "Genç bir bilim insanı geldi.", "Genç bir bilim insanı bize geldi."],
            ["Orman", "Orman kralı.", "Yüce orman kralı.", "Yüce orman kralı aslan.", "Yüce orman kralı aslan kükredi."]
        ]
    };

    const selectedDifficulty = ((FLOW_TEMPLATES as any)[difficulty] || FLOW_TEMPLATES['Orta']) as string[][];

    for (let p = 0; p < worksheetCount; p++) {
        const selectedSets = getRandomItems(selectedDifficulty, 3);
        const paragraphs = selectedSets.map((set: string[]) => {
            return {
                sentences: set.map((s: string) => ({
                    syllables: s.split(' ').flatMap((word: string, wIdx: number, words: string[]) => {
                        const syls = syllabifyWord(word).map(syllable => ({ text: syllable }));
                        // Kelime aralarına boşluk ekle (boş bir hece objesi gibi veya özel bir işaretle)
                        if (wIdx < words.length - 1) syls.push({ text: ' ' });
                        return syls;
                    })
                }))
            };
        });

        results.push({
            title: "Ritmik Okuma Akıcılığı",
            instruction: "Kelimeleri ritmik bir şekilde, her satırda bir kelime ekleyerek oku.",
            pedagogicalNote: "Görsel tarama hızını artırırken, kelime tanıma eşiğini düşürür ve okuma akıcılığını (fluency) destekler.",
            text: { paragraphs }
        });
    }
    return results;
};

export const generateOfflinePhonologicalAwareness = async (options: GeneratorOptions): Promise<PhonologicalAwarenessData[]> => {
    const { worksheetCount, _difficulty } = options;
    const results: PhonologicalAwarenessData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        const exercises = [
            { question: "Hangi kelime 'A' ile başlar?", word: "Araba" },
            { question: "Hangi kelime 'MA' ile biter?", word: "Elma" },
            { question: "Hangi kelimenin ortasında 'TA' vardır?", word: "Yatak" }
        ];

        results.push({
            title: "Fonolojik Farkındalık",
            instruction: "Sorulan ses özelliklerine uygun kelimeleri bulun.",
            pedagogicalNote: "Sesbirimsel farkındalık ve işitsel ayrıştırma becerilerini geliştirir.",
            exercises
        });
    }
    return results;
};

export const generateOfflineSyllableTrain = async (options: GeneratorOptions): Promise<SyllableTrainData[]> => {
    const { worksheetCount, difficulty, variant = 'standard' } = options;
    const results: SyllableTrainData[] = [];

    const TOPICS = ['animals', 'fruits_veggies', 'school', 'items_household'];

    for (let p = 0; p < worksheetCount; p++) {
        const topic = getRandomItems(TOPICS, 1)[0];
        const wordsPool = getWordsForDifficulty(difficulty, topic);
        const selectedWords = getRandomItems(wordsPool, 4);

        const trains = selectedWords.map(word => {
            const syllables = syllabifyWord(word);
            let trainSyllables = [...syllables];
            let missingSyllableIndex: number | undefined;

            if (variant === 'missing') {
                missingSyllableIndex = getRandomInt(0, syllables.length - 1);
            } else if (variant === 'scrambled') {
                trainSyllables = shuffle([...syllables]);
            }

            return {
                word,
                syllables: trainSyllables,
                missingSyllableIndex,
                isPseudo: Math.random() > 0.8 // %20 ihtimalle anlamsız kelime (analiz odaklı)
            };
        });

        results.push({
            title: "Hece Ekspresi (Vagon Sentezi)",
            instruction: variant === 'missing'
                ? "Trendeki eksik vagonu bulup kelimeyi tamamlayın."
                : (variant === 'scrambled' ? "Karışık vagonları birleştirerek anlamlı kelimeyi raylara oturtun." : "Vagonlardaki heceleri birleştirip kelimeyi yüksek sesle okuyun."),
            pedagogicalNote: "Hece sentezi (synthesis) ve fonolojik farkındalık becerilerini vagon metaforu ile görselleştirir.",
            trains
        });
    }
    return results;
};

export const generateOfflineVisualTrackingLines = async (options: GeneratorOptions): Promise<VisualTrackingLineData[]> => {
    const { worksheetCount, difficulty = 'Orta' } = options;
    const results: VisualTrackingLineData[] = [];

    const complexityMap: Record<string, number> = { 'Başlangıç': 2, 'Orta': 3, 'Zor': 5, 'Uzman': 8 };
    const lineCount = complexityMap[difficulty] || 3;

    const generatePath = (yStart: number, yEnd: number, _pIdx: number) => {
        const segments = 4;
        const segmentWidth = 700 / segments;
        let d = `M 50 ${yStart}`;
        for (let i = 1; i <= segments; i++) {
            const cp1x = 50 + (i - 1) * segmentWidth + segmentWidth / 3;
            const cp1y = yStart + (Math.random() - 0.5) * 200;
            const cp2x = 50 + (i - 1) * segmentWidth + (2 * segmentWidth) / 3;
            const cp2y = yEnd + (Math.random() - 0.5) * 200;
            const targetX = 50 + i * segmentWidth;
            const targetY = i === segments ? yEnd : yStart + (Math.random() - 0.5) * 50;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`;
        }
        return d;
    };

    for (let p = 0; p < worksheetCount; p++) {
        const startChars = shuffle(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, lineCount));
        const endChars = shuffle(['1', '2', '3', '4', '5', '6', '7', '8'].slice(0, lineCount));

        const paths = startChars.map((char, idx) => {
            const yStart = 50 + (idx * 350) / lineCount;
            const targetIdx = getRandomInt(0, lineCount - 1);
            const yEnd = 50 + (targetIdx * 350) / lineCount;

            return {
                id: idx + 1,
                d: generatePath(yStart, yEnd, idx),
                color: COLORS[idx % COLORS.length].css,
                strokeWidth: 2.5,
                startLabel: char,
                endLabel: endChars[idx],
                yStart,
                yEnd
            };
        });

        results.push({
            title: "Görsel Takip ve Labirent Yollar",
            instruction: "Harflerden başlayarak çizgileri takip edin ve hangi rakama ulaştığınızı kutucuklara yazın.",
            pedagogicalNote: "Göz takip hareketlerini (saccadic movements), görsel dikkati ve el-göz koordinasyonunu geliştirir.",
            paths,
            width: 800,
            height: 450
        });
    }
    return results;
};

export const generateOfflineBackwardSpelling = async (options: GeneratorOptions): Promise<BackwardSpellingData[]> => {
    const { worksheetCount, difficulty } = options;
    const results: BackwardSpellingData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        const words = getWordsForDifficulty(difficulty, 'Rastgele');
        const items = getRandomItems(words, 5).map(w => ({
            original: w,
            reversed: w.split('').reverse().join('')
        }));

        results.push({
            title: "Geriye Doğru Heceleme",
            instruction: "Kelimeleri sondan başa doğru yazın veya okuyun.",
            pedagogicalNote: "İşitsel çalışan bellek ve fonolojik manipülasyon.",
            items
        });
    }
    return results;
};

export const generateOfflineCodeReading = async (options: GeneratorOptions): Promise<CodeReadingData[]> => {
    const { worksheetCount, _difficulty } = options;
    const results: CodeReadingData[] = [];

    const symbols = ["⭐", "🌙", "☀️", "☁️", "⚡", "❄️", "🌀", "🔥"];
    const chars = turkishAlphabet.split('').slice(0, 8);

    for (let p = 0; p < worksheetCount; p++) {
        const keyMap = symbols.map((s, i) => ({ symbol: s, value: chars[i], color: "black" }));
        const codesToSolve = [
            { sequence: [symbols[0], symbols[2], symbols[4]] },
            { sequence: [symbols[1], symbols[3], symbols[5]] }
        ];

        results.push({
            title: "Şifre Okuma Labirenti",
            instruction: "Sembollerin karşılığı olan harfleri kullanarak şifreyi çözün.",
            pedagogicalNote: "Sembol eşleştirme, görsel kodlama ve çalışma belleği.",
            keyMap,
            codesToSolve
        });
    }
    return results;
};

export const generateOfflineAttentionToQuestion = async (_o: any): Promise<AttentionToQuestionData[]> => [{
    title: 'Dikkat ve Sorular',
    instruction: 'Aşağıdaki metinde geçen tüm "b" harflerini işaretleyin.',
    pedagogicalNote: 'Harf ayrıştırma ve sürdürülebilir dikkat.',
    subType: 'letter-cancellation'
}];

export const generateOfflineHandwritingPractice = async (_o: any): Promise<HandwritingPracticeData[]> => [{
    title: 'Yazı Alıştırması',
    instruction: 'Noktalı çizgilerin üzerinden geçerek kelimeleri yazın.',
    pedagogicalNote: 'İnce motor beceriler ve yazı formasyonu.',
    lines: [{ text: 'Elma', type: 'trace' }, { text: 'Armut', type: 'copy' }],
    guideType: 'dotted'
}];
