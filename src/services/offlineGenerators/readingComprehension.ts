import { ActivityType, GeneratorOptions, StoryData, StoryCreationPromptData, WordsInStoryData, StoryAnalysisData, StorySequencingData, MissingPartsData, StorySequencingPanel, StoryQuestion, ReadingStroopData, SynonymAntonymMatchData, ReadingSudokuData } from '../../types';
import { WorksheetBuilder } from '../generators/core/WorksheetBuilder';
import { shuffle, getRandomItems, generateSudokuGrid, getRandomInt } from './helpers';
import { COHERENT_STORY_TEMPLATES } from '../../data/sentences';
import { TR_VOCAB } from './helpers';
import { getOfflineMetadata } from './metadataHelper';

const COLORS_LIST = [
    { name: 'KIRMIZI', hex: '#ef4444' },
    { name: 'MAVİ', hex: '#3b82f6' },
    { name: 'YEŞİL', hex: '#22c55e' },
    { name: 'SARI', hex: '#eab308' },
    { name: 'MOR', hex: '#a855f7' },
    { name: 'TURUNCU', hex: '#f97316' },
    { name: 'PEMBE', hex: '#ec4899' },
    { name: 'SİYAH', hex: '#1e1e1e' }
];

const SEMANTIC_WORDS = [
    { text: 'LİMON', color: '#eab308' },
    { text: 'DENİZ', color: '#3b82f6' },
    { text: 'ÇİLEK', color: '#ef4444' },
    { text: 'ÇİMEN', color: '#22c55e' },
    { text: 'GECE', color: '#1e1e1e' },
    { text: 'GÜNEŞ', color: '#eab308' },
    { text: 'GÖKYÜZÜ', color: '#3b82f6' },
    { text: 'BULUT', color: '#94a3b8' }
];

const SHAPE_WORDS = ["KARE", "ÜÇGEN", "DAİRE", "YILDIZ", "ELİPS", "DİKDÖRTGEN", "BEŞGEN"];
const ANIMAL_WORDS = ["ASLAN", "KEDİ", "KÖPEK", "FİL", "ZÜRAFA", "KAPLAN", "AYI", "TAVŞAN"];
const VERB_WORDS = ["BAK", "GÖR", "KOŞ", "DUR", "AL", "VER", "OKU", "YAZ", "ZILA"];
const MIRROR_WORDS = ["BALIK", "DALGA", "POLAT", "OLUK", "BABA", "DADA", "KASA", "MASA"];

export const generateOfflineReadingSudoku = async (options: GeneratorOptions): Promise<ReadingSudokuData[]> => {
    const { worksheetCount, difficulty, variant = 'letters', gridSize = 4 } = options;
    const meta = getOfflineMetadata(ActivityType.READING_SUDOKU);

    const letterPool = shuffle(['B', 'D', 'P', 'Q', 'M', 'N', 'U', 'Ü', 'A', 'E', 'I', 'İ']);
    const wordPool = shuffle(['GÜNEŞ', 'YILDIZ', 'BULUT', 'YAĞMOR', 'KİTAP', 'KALEM', 'MASA', 'OKUL']);
    const visualPool = ['⭐', '❤️', '🍀', '🍎', '🚗', '🐱', '⚽', '🎨'];

    const selectedSymbols = variant === 'letters' ? letterPool.slice(0, gridSize)
        : variant === 'words' ? wordPool.slice(0, gridSize)
            : variant === 'visuals' ? visualPool.slice(0, gridSize)
                : Array.from({ length: gridSize }, (_, i) => (i + 1).toString());

    return Array.from({ length: worksheetCount ?? 1 }, () => {
        const rawGrid = generateSudokuGrid(gridSize, difficulty ?? 'Orta');

        // Map numbers to symbols
        const mappedGrid = rawGrid.map(row => row.map(cell => cell ? selectedSymbols[cell - 1] : null));
        const solution = rawGrid.map(row => row.map(cell => selectedSymbols[(cell || 1) - 1]));

        return {
            title: "Dil ve Mantık Sudokusu",
            instruction: "Tablodaki her satır, her sütun ve her kalın çizgili bölgede semboller sadece BİR KEZ bulunmalıdır. Boşlukları doldur!",
            targetSkills: meta.targetSkills,
            grid: mappedGrid,
            solution: solution,
            symbols: selectedSymbols.map(s => ({ value: s, label: s, imagePrompt: variant === 'visuals' ? s : undefined })),
            settings: {
                size: gridSize,
                variant: variant as any,
                fontFamily: options.fontFamily || 'OpenDyslexic'
            }
        };
    });
};

export const generateOfflineSynonymAntonymMatch = async (options: GeneratorOptions): Promise<any> => {
    const { difficulty = 'Orta', itemCount = 8, variant = 'mixed' } = options;

    const pool = variant === 'synonym' ? TR_VOCAB.synonyms : variant === 'antonym' ? TR_VOCAB.antonyms : shuffle([...TR_VOCAB.synonyms, ...TR_VOCAB.antonyms]);
    const selection = shuffle(pool).slice(0, itemCount);

    const pairs = selection.map(item => ({
        source: item.word,
        target: (item as any).synonym || (item as any).antonym,
        type: (item as any).synonym ? 'synonym' : 'antonym'
    }));

    const title = variant === 'synonym' ? 'Eş Anlamlı Kelimeler' : variant === 'antonym' ? 'Zıt Anlamlı Kelimeler' : 'Eş ve Zıt Anlamlar';

    const builder = new WorksheetBuilder(ActivityType.SYNONYM_ANTONYM_MATCH, title)
        .addPremiumHeader()
        .addPrimaryActivity('match_columns', {
            leftTitle: 'Kelime',
            rightTitle: 'Anlamdaşı/Zıttı',
            pairs: shuffle(pairs.map(p => ({ left: p.source, right: p.target })))
        });

    // Destekleyici alıştırma: Cümle tamamlama
    const drillSentences = [
        { text: "Bugün hava çok _______. (Sıcak zıt anlamlısı)", target: "Soğuk" },
        { text: "En sevdiğim _______ bugün geliyor. (Konuk eş anlamlısı)", target: "Misafir" }
    ];

    builder.addSupportingDrill('Cümle Tamamlama', {
        sentences: drillSentences,
        instruction: 'Parantez içindeki ipuçlarına göre boşlukları doldurun.'
    });

    return [builder.addSuccessIndicator().build()];
};

export const generateOfflineReadingStroop = async (options: GeneratorOptions): Promise<ReadingStroopData[]> => {
    const { worksheetCount, itemCount = 48, difficulty, variant = 'colors', gridSize } = options;
    const meta = getOfflineMetadata(ActivityType.READING_STROOP);

    return Array.from({ length: worksheetCount ?? 1 }, () => {
        const grid = Array.from({ length: itemCount }).map(() => {
            let text = "";
            let baseColorHex = "";

            if (variant === 'semantic') {
                const base = SEMANTIC_WORDS[Math.floor(Math.random() * SEMANTIC_WORDS.length)];
                text = base.text;
                baseColorHex = base.color;
            } else if (variant === 'shapes') {
                text = SHAPE_WORDS[Math.floor(Math.random() * SHAPE_WORDS.length)];
                baseColorHex = "#ffffff";
            } else if (variant === 'animals') {
                text = ANIMAL_WORDS[Math.floor(Math.random() * ANIMAL_WORDS.length)];
                baseColorHex = "#ffffff";
            } else if (variant === 'verbs') {
                text = VERB_WORDS[Math.floor(Math.random() * VERB_WORDS.length)];
                baseColorHex = "#ffffff";
            } else if (variant === 'mirror_chars') {
                text = MIRROR_WORDS[Math.floor(Math.random() * MIRROR_WORDS.length)];
                baseColorHex = "#ffffff";
            } else if (variant === 'confusing') {
                const pair = [["MAVİ", "MANİ"], ["SARI", "SARI"], ["KARA", "KASA"], ["YEŞİL", "YENİL"]];
                const selectedPair = pair[Math.floor(Math.random() * pair.length)];
                text = selectedPair[Math.floor(Math.random() * selectedPair.length)];
                baseColorHex = "#ffffff";
            } else {
                const textObj = COLORS_LIST[Math.floor(Math.random() * COLORS_LIST.length)];
                text = textObj.name;
                baseColorHex = textObj.hex;
            }

            const otherColors = COLORS_LIST.filter(c => c.hex !== baseColorHex);
            const finalColor = otherColors[Math.floor(Math.random() * otherColors.length)].hex;

            return { text, color: finalColor };
        });

        return {
            title: 'Sözel Stroop Efekti Testi',
            instruction: 'DİKKAT: Kelimeyi okuma! Kelimenin yazıldığı RENGİ yüksek sesle söyle.',
            targetSkills: meta.targetSkills,
            grid: shuffle(grid),
            settings: {
                // Öncelik gridSize, yoksa zorluk seviyesine göre default
                cols: gridSize || (difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 4 : 5)),
                fontSize: difficulty === 'Başlangıç' ? 32 : (difficulty === 'Orta' ? 24 : 20),
                wordType: variant as any
            },
            evaluationBox: true
        };
    });
};

const buildBaseStory = (difficulty: string) => {
    let candidates = COHERENT_STORY_TEMPLATES.filter(t => t.level === difficulty);
    if (candidates.length === 0) candidates = COHERENT_STORY_TEMPLATES;

    const template = getRandomItems(candidates, 1)[0];

    const chosenValues: Record<string, string> = {};
    template.variables && Object.keys(template.variables).forEach(key => {
        chosenValues[key] = getRandomItems(template.variables[key], 1)[0] as string;
    });

    let title = template.titleTemplate;
    let story = template.textTemplate;
    let imagePrompt = template.imagePromptTemplate;

    Object.keys(chosenValues).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        title = title.replace(regex, chosenValues[key]);
        story = story.replace(regex, chosenValues[key]);
        imagePrompt = imagePrompt.replace(regex, chosenValues[key]);
    });

    return { title, story, imagePrompt, chosenValues, template };
};

export const generateOfflineStoryComprehension = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, difficulty } = options;
    const meta = getOfflineMetadata(ActivityType.STORY_COMPREHENSION);
    return Array.from({ length: worksheetCount ?? 1 }, () => {
        const { title, story, imagePrompt, template, chosenValues } = buildBaseStory(difficulty ?? 'Orta');

        const questions: StoryQuestion[] = template.questions.map((qTemp: any) => {
            let qText = qTemp.q;
            Object.keys(chosenValues).forEach(key => {
                qText = qText.replace(new RegExp(`{${key}}`, 'g'), chosenValues[key]);
            });

            let correctAnswer = "";
            if (qTemp.aKey.startsWith("custom:")) {
                correctAnswer = qTemp.aKey.split("custom:")[1];
            } else {
                correctAnswer = chosenValues[qTemp.aKey];
            }

            const distractors = getRandomItems(qTemp.distractors as string[], 3);
            return {
                type: 'multiple-choice',
                question: qText,
                options: shuffle([correctAnswer, ...distractors]),
                answer: correctAnswer
            };
        });

        questions.push({
            type: 'true-false',
            question: `Bu hikaye ${chosenValues['place'] || 'bir yerde'} geçmektedir.`,
            isTrue: true,
            answer: 'Doğru'
        });

        const vocabulary = template.vocabulary || [
            { word: "Merak", definition: "Bir şeyi öğrenme isteği." },
            { word: "Heyecan", definition: "Coşkulu duygu durumu." }
        ];

        return {
            title,
            story,
            instruction: "Hikayeyi 3 kez oku, yıldızları boya ve soruları cevapla.",
            targetSkills: meta.targetSkills,
            imagePrompt,
            mainIdea: "Dikkatli okuma.",
            characters: [chosenValues['character']],
            setting: chosenValues['place'],
            vocabulary,
            creativeTask: template.creativeTask || "Hikayenin resmini çiz.",
            questions
        };
    });
};

export const generateOfflineStoryCreationPrompt = async (options: GeneratorOptions): Promise<StoryCreationPromptData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount ?? 1 }, () => {
        const { title, imagePrompt, chosenValues } = buildBaseStory(difficulty ?? 'Orta');

        return {
            title: `Hikaye Atölyesi: ${title}`,
            instruction: "Verilen ipuçlarını kullanarak kendi hikayeni oluştur.",
            imagePrompt,
            prompt: "Aşağıdaki anahtar kelimeleri kullanarak hikayeyi tamamla.",
            keywords: Object.values(chosenValues).slice(0, 5),
            structureHints: {
                who: chosenValues['character'],
                where: chosenValues['place'],
                when: "Bir gün",
                problem: "Beklenmedik bir olay oldu"
            }
        };
    });
};

export const generateOfflineWordsInStory = async (options: GeneratorOptions): Promise<WordsInStoryData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount ?? 1 }, () => {
        const { title: _title, story, imagePrompt, template } = buildBaseStory(difficulty ?? 'Orta');

        const vocabWork = (template.vocabulary || []).map((v: any) => ({
            word: v.word,
            contextQuestion: `"${v.word}" kelimesi metinde ne anlama geliyor?`,
            type: 'meaning' as const
        }));

        return {
            title: 'Kelime Dedektifi',
            instruction: "Metni oku ve seçili kelimelerin anlamlarını bul.",
            imagePrompt,
            story,
            vocabWork: vocabWork.length > 0 ? vocabWork : [{ word: 'Hikaye', contextQuestion: 'Hikaye nedir?', type: 'meaning' }]
        };
    });
};

export const generateOfflineStoryAnalysis = async (options: GeneratorOptions): Promise<StoryAnalysisData[]> => {
    const { worksheetCount = 1, difficulty = 'orta' } = options;
    return Array.from({ length: worksheetCount }, () => {
        const { title, story, chosenValues, template } = buildBaseStory(difficulty);
        
        return {
            title: 'Kapsamlı Hikaye Analizi (Ultra Pro)',
            instruction: "Hikayeyi dikkatlice oku ve aşağıdaki analiz tablosunu doldur.",
            content: {
                title,
                story,
                analysis: {
                    characters: [
                        { name: chosenValues['character'] || 'Ana Karakter', traits: ['Meraklı', 'Azimli'] }
                    ],
                    setting: {
                        place: chosenValues['place'] || 'Bilinmeyen Yer',
                        time: 'Bir zamanlar'
                    },
                    conflict: 'Hikayede karşılaşılan temel zorluk nedir?',
                    resolution: 'Bu zorluk nasıl aşıldı?',
                    mainIdea: (template as any).mainIdea || 'Kendi yolunu bulmak.',
                    subThemes: ['Dostluk', 'Cesaret', 'Yardımlaşma']
                }
            },
            questions: template.questions.map((q: any) => ({
                type: 'multiple-choice',
                question: q.q,
                answer: 'Cevap metinde gizli.'
            }))
        };
    });
};

export const generateOfflineStorySequencing = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const { worksheetCount = 1, difficulty = 'orta' } = options;
    const sequences = [
        { title: "Tohumun Yolculuğu", steps: ["Tohum toprağa düşer.", "Can suyu verilir.", "Güneşle filizlenir.", "Kocaman bir çiçek olur."], img: "Plant life cycle" },
        { title: "Piknik Hazırlığı", steps: ["Sepet hazırlanır.", "Parka gidilir.", "Örtü serilir.", "Yemekler afiyetle yenir."], img: "Picnic prep" }
    ];

    return Array.from({ length: worksheetCount }, () => {
        const seq = getRandomItems(sequences, 1)[0];
        const panels: StorySequencingPanel[] = seq.steps.map((s, i) => ({
            id: `p-${i}`,
            text: s,
            correctOrder: i + 1,
            imagePrompt: `${seq.img} - step ${i + 1}`
        }));

        return {
            title: 'Olay Örgüsü Sıralama (Ultra Pro)',
            instruction: "Olayları oluş sırasına göre (1-4) numaralandırarak dizin.",
            content: {
                title: seq.title,
                panels: shuffle(panels),
                transitionWords: ["Önce", "Sonra", "Ardından", "Son olarak"],
                fullStory: seq.steps.join(' ')
            },
            settings: {
                difficulty: difficulty as any,
                panelCount: panels.length,
                showTransitionWords: true
            }
        };
    });
};

export const generateOfflineMissingParts = async (options: GeneratorOptions): Promise<MissingPartsData[]> => {
    const { worksheetCount = 1, difficulty = 'orta' } = options;
    return Array.from({ length: worksheetCount }, () => {
        const { title, story, chosenValues } = buildBaseStory(difficulty);
        const words = Object.values(chosenValues).filter(v => typeof v === 'string');
        
        let maskedParts: { text: string; isBlank: boolean; answer?: string }[] = [];
        const storyWords = story.split(' ');
        
        storyWords.forEach(w => {
            const cleanWord = w.replace(/[.,!?]/g, '');
            if (words.includes(cleanWord)) {
                maskedParts.push({ text: '_______', isBlank: true, answer: cleanWord });
            } else {
                maskedParts.push({ text: w, isBlank: false });
            }
        });

        return {
            title: 'Anlamsal Akış ve Boşluk Doldurma (Ultra Pro)',
            instruction: "Metindeki boşlukları anlam akışına uygun kelimelerle tamamlayın.",
            content: {
                title,
                paragraphs: [{ parts: maskedParts }],
                wordBank: shuffle([...words, 'Çeldirici 1', 'Çeldirici 2'])
            },
            settings: {
                difficulty: difficulty as any,
                blankType: 'word',
                showWordBank: true,
                topic: 'Genel'
            }
        };
    });
};

const PROVERBS = [
    "Damlaya damlaya göl olur.",
    "Birlikten kuvvet doğur.",
    "Sakla samanı gelir zamanı.",
    "Gülme komşuna gelir başına.",
    "Ağaç yaşken eğilir."
];

export const generateOfflineProverbFillInTheBlank = async (o: GeneratorOptions) => {
    return Array.from({ length: o.worksheetCount ?? 1 }, () => ({
        title: "Atasözü Tamamlama",
        instruction: "Eksik bırakılan atasözlerini uygun kelimelerle tamamlayın.",
        puzzles: getRandomItems(PROVERBS, 3).map(p => {
            const words = p.split(' ');
            const idx = getRandomInt(0, words.length - 1);
            const answer = words[idx];
            words[idx] = "_______";
            return { sentence: words.join(' '), answer };
        })
    }));
};

export const generateOfflineProverbSayingSort = async (o: GeneratorOptions) => {
    return Array.from({ length: o.worksheetCount ?? 1 }, () => ({
        title: "Atasözü Karışık Kelimeler",
        instruction: "Karışık verilen kelimeleri anlamlı bir atasözü oluşturacak şekilde sıralayın.",
        puzzles: getRandomItems(PROVERBS, 3).map(p => ({
            scrambled: shuffle(p.split(' ')).join(' / '),
            original: p
        }))
    }));
};

// ... and so on for others, keeping them simple but functional
export const generateOfflineProverbWordChain = async (_o: GeneratorOptions) => [];
export const generateOfflineProverbSentenceFinder = async (_o: GeneratorOptions) => [];
export const generateOfflineProverbSearch = async (_o: GeneratorOptions) => [];
