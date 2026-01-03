
import { GeneratorOptions, StoryData, StoryCreationPromptData, WordsInStoryData, StoryAnalysisData, StorySequencingData, MissingPartsData, StoryQuestion, ReadingStroopData } from '../../types';
import { shuffle, getRandomItems } from './helpers';
import { COHERENT_STORY_TEMPLATES } from '../../data/sentences';

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

export const generateOfflineReadingStroop = async (options: GeneratorOptions): Promise<ReadingStroopData[]> => {
    const { worksheetCount, itemCount = 48, difficulty, variant = 'colors', gridSize } = options;
    
    return Array.from({ length: worksheetCount }, () => {
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
            pedagogicalNote: 'Dürtü kontrolü, yönetici işlevler ve sözel işlemleme hızını geliştirir.',
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

// ... rest of the file ...
const buildBaseStory = (difficulty: string) => {
    let candidates = COHERENT_STORY_TEMPLATES.filter(t => t.level === difficulty);
    if (candidates.length === 0) candidates = COHERENT_STORY_TEMPLATES;
    
    const template = getRandomItems(candidates, 1)[0];
    
    const chosenValues: Record<string, string> = {};
    Object.keys(template.variables).forEach(key => {
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
    return Array.from({ length: worksheetCount }, () => {
        const { title, story, imagePrompt, template, chosenValues } = buildBaseStory(difficulty);
        
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
            pedagogicalNote: "Okuduğunu anlama, kelime bilgisi ve yaratıcı ifade.",
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
    return Array.from({ length: worksheetCount }, () => {
        const { title, imagePrompt, chosenValues } = buildBaseStory(difficulty);
        
        return {
            title: `Hikaye Atölyesi: ${title}`,
            instruction: "Verilen ipuçlarını kullanarak kendi hikayeni oluştur.",
            pedagogicalNote: "Yaratıcı yazma ve kurgu oluşturma.",
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
    return Array.from({ length: worksheetCount }, () => {
        const { title, story, imagePrompt, template } = buildBaseStory(difficulty);
        
        const vocabWork = (template.vocabulary || []).map(v => ({
            word: v.word,
            contextQuestion: `"${v.word}" kelimesi metinde ne anlama geliyor?`,
            type: 'meaning' as const
        }));

        return {
            title: 'Kelime Dedektifi',
            instruction: "Metni oku ve seçili kelimelerin anlamlarını bul.",
            pedagogicalNote: "Bağlamdan anlam çıkarma.",
            imagePrompt,
            story,
            vocabWork: vocabWork.length > 0 ? vocabWork : [{word: 'Hikaye', contextQuestion: 'Hikaye nedir?', type: 'meaning'}]
        };
    });
};

export const generateOfflineStoryAnalysis = async (options: GeneratorOptions): Promise<StoryAnalysisData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const { title, story, imagePrompt, chosenValues } = buildBaseStory(difficulty);
        return {
            title: 'Hikaye Haritası',
            instruction: "Hikayenin unsurlarını analiz et.",
            pedagogicalNote: "Hikaye kurgusunu anlama.",
            imagePrompt,
            story,
            storyMap: {
                characters: chosenValues['character'],
                setting: chosenValues['place'],
                problem: "Hikayedeki sorun neydi?",
                solution: "Sorun nasıl çözüldü?",
                theme: "Ana fikir nedir?"
            }
        };
    });
};

export const generateOfflineStorySequencing = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const { worksheetCount } = options;
    const sequences = [
        { title: "Tohumun Büyümesi", steps: ["Tohumu ektim.", "Suladım.", "Filizlendi.", "Çiçek açtı."], img: "Plant growth" },
        { title: "Kek Yapımı", steps: ["Malzemeleri karıştırdım.", "Kalıba döktüm.", "Fırında pişirdim.", "Dilimleyip yedim."], img: "Baking cake" },
        { title: "Diş Fırçalama", steps: ["Macunu sürdüm.", "Dişlerimi fırçaladım.", "Ağzımı çalkaladım.", "Gülümsedim."], img: "Brushing teeth" }
    ];

    return Array.from({ length: worksheetCount }, () => {
        const seq = getRandomItems(sequences, 1)[0];
        const shuffledPanels = shuffle(seq.steps.map((s, i) => ({
            id: `step-${i}`,
            description: s,
            order: i + 1,
            imagePrompt: `${seq.img} step ${i+1}`
        })));

        return {
            title: `Olay Sıralama: ${seq.title}`,
            instruction: "Olayları oluş sırasına göre numaralandır.",
            pedagogicalNote: "Kronolojik düşünme.",
            imagePrompt: "Sequencing",
            prompt: "Doğru sırayı bul.",
            panels: shuffledPanels,
            transitionWords: ["Önce", "Sonra", "Daha sonra", "En sonunda"]
        };
    });
};

export const generateOfflineMissingParts = async (options: GeneratorOptions): Promise<MissingPartsData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const { title, story, chosenValues, imagePrompt } = buildBaseStory(difficulty);
        
        const words = Object.values(chosenValues);
        let maskedStory = story;
        words.forEach(w => {
            maskedStory = maskedStory.replace(w, "_______");
        });
        
        const parts = maskedStory.split('.').filter(s => s.trim().length > 0).map(s => s.trim() + '.');

        return {
            title: 'Boşluk Doldurma',
            instruction: "Hikayedeki boşlukları kutudaki kelimelerle tamamla.",
            pedagogicalNote: "Cümle tamamlama ve anlamsal bütünlük.",
            imagePrompt,
            storyWithBlanks: parts,
            wordBank: shuffle(words),
            answers: words
        };
    });
};

export const generateOfflineProverbFillInTheBlank = async (o: GeneratorOptions) => [] as any;
export const generateOfflineProverbSayingSort = async (o: GeneratorOptions) => [] as any;
export const generateOfflineProverbWordChain = async (o: GeneratorOptions) => [] as any;
export const generateOfflineProverbSentenceFinder = async (o: GeneratorOptions) => [] as any;
export const generateOfflineProverbSearch = async (o: GeneratorOptions) => [] as any;
