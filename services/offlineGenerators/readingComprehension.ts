
import { GeneratorOptions, StoryData, StoryCreationPromptData, WordsInStoryData, StoryAnalysisData, StorySequencingData, ProverbFillData, ProverbSayingSortData, ProverbWordChainData, ProverbSentenceFinderData, StoryQuestion, ProverbSearchData } from '../../types';
import { shuffle, getRandomItems, getWordsForDifficulty, getRandomInt } from './helpers';
import { PROVERBS, SAYINGS, DYNAMIC_STORY_MODULES } from '../../data/sentences';
import { generateOfflineWordSearch } from './wordGames';

// --- HELPER: Story Assembler ---
// Constructs a story with exact sentence count based on difficulty
const buildDynamicStory = (difficulty: string, topic?: string, characterName?: string) => {
    let targetSentenceCount = 5;
    if (difficulty === 'Orta') targetSentenceCount = 10;
    if (difficulty === 'Zor') targetSentenceCount = 15;
    if (difficulty === 'Uzman') targetSentenceCount = 20;

    // 1. Select Base Components
    const intro = getRandomItems(DYNAMIC_STORY_MODULES.intros, 1)[0];
    const conclusion = getRandomItems(DYNAMIC_STORY_MODULES.conclusions, 1)[0];
    
    // 2. Calculate Middle Sentences Needed
    // Total - 1 (Intro) - 1 (Conclusion) = Body Actions
    // For very long stories, we might chain multiple intros or split actions
    let bodyCount = targetSentenceCount - 2;
    if (bodyCount < 1) bodyCount = 1; // Safety

    const actions = getRandomItems(DYNAMIC_STORY_MODULES.actions, bodyCount);
    
    // 3. Assemble Raw Text
    const storyTemplate = [intro, ...actions, conclusion].join(' ');

    // 4. Fill Placeholders
    let story = storyTemplate;
    const fillers = DYNAMIC_STORY_MODULES.fillers;
    
    // Consistent choices for the whole story
    const chosenValues: Record<string, string> = {
        character: characterName || getRandomItems(fillers.characters, 1)[0],
        place: getRandomItems(fillers.places, 1)[0],
        object: getRandomItems(fillers.objects, 1)[0],
        friend: getRandomItems(fillers.friends, 1)[0],
        animal: getRandomItems(fillers.animals, 1)[0]
    };

    // Replace all occurrences
    Object.keys(chosenValues).forEach(key => {
        story = story.replace(new RegExp(`{${key}}`, 'g'), chosenValues[key]);
    });

    // Random fillers for remaining unique placeholders
    story = story.replace(/{(\w+)}/g, (match, p1) => {
        const list = (fillers as any)[p1 + 's']; // e.g. 'adjective' -> 'adjectives'
        return list ? (getRandomItems(list, 1)[0] as string) : match;
    });

    return { story, chosenValues };
};

// --- GENERATOR FUNCTIONS ---

export const generateOfflineStoryComprehension = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, topic, characterName, difficulty } = options;
    const results: StoryData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const { story, chosenValues } = buildDynamicStory(difficulty, topic, characterName);
        
        // Generate Logic-Based Questions based on Difficulty
        const questions: StoryQuestion[] = [];
        
        // Q1: Retrieval (Kim/Nerede) - Always included
        questions.push({
            type: 'multiple-choice',
            question: "Hikayenin ana kahramanı kimdir?",
            options: shuffle([chosenValues.character, 'Bilinmiyor', 'Kardeşi', 'Öğretmen']),
            answerIndex: 0
        });

        // Q2: Setting (Nerede)
        if (difficulty !== 'Başlangıç') {
            questions.push({
                type: 'multiple-choice',
                question: "Olay nerede geçmektedir?",
                options: shuffle([chosenValues.place, 'Okulda', 'Evde', 'Bahçede']),
                answerIndex: 0
            });
        }

        // Q3: Detail/Action
        questions.push({
            type: 'open-ended',
            question: `Hikayede ${chosenValues.character} ne buldu?`
        });

        // Q4: Inference (Zor/Uzman)
        if (difficulty === 'Zor' || difficulty === 'Uzman') {
            questions.push({
                type: 'open-ended',
                question: "Hikayenin ana fikri sence nedir?"
            });
        }

        // Q5: Creative (Uzman)
        if (difficulty === 'Uzman') {
            questions.push({
                type: 'open-ended',
                question: "Hikayeye yeni bir başlık bulabilir misin?"
            });
        }

        // Adjust Visual Difficulty Description
        let visualDesc = "Basit, net çizgili, tek karakter, beyaz arka plan.";
        if (difficulty === 'Orta') visualDesc = "Renkli, mekan detaylı, karakter ve çevre.";
        if (difficulty === 'Zor') visualDesc = "Zengin detaylı, gölgelendirmeli, kitap illüstrasyonu tarzı.";
        if (difficulty === 'Uzman') visualDesc = "Gerçekçi, atmosferik ışıklandırma, karmaşık kompozisyon.";

        results.push({ 
            title: `Okuma Anlama: ${chosenValues.character}'in Macerası`, 
            story, 
            questions: questions, // No shuffle here to keep logic order? Or shuffle if desired.
            characters: [chosenValues.character, chosenValues.friend].filter(Boolean), 
            mainIdea: 'Dikkatli okuma ve çıkarım yapma.', 
            setting: chosenValues.place,
            pedagogicalNote: `${difficulty} seviyesi (${difficulty === 'Başlangıç' ? '5' : difficulty === 'Orta' ? '10' : difficulty === 'Zor' ? '15' : '20'} cümle). Okuma hızı ve anlama.`,
            imagePrompt: `${visualDesc} Konu: ${chosenValues.place} içinde ${chosenValues.character}.`
        });
    }
    return results;
};

export const generateOfflineStoryCreationPrompt = async (options: GeneratorOptions): Promise<StoryCreationPromptData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    
    const prompts = {
        'Başlangıç': "Verilen 3 kelimeyi kullanarak 5 cümlelik kısa bir hikaye yaz.",
        'Orta': "Karakterleri konuşturarak (diyalog) 10 cümlelik bir hikaye oluştur.",
        'Zor': "Giriş, gelişme ve sonuç bölümlerine dikkat ederek 15 cümlelik heyecanlı bir hikaye kurgula.",
        'Uzman': "Betimlemeler yaparak ve duyguları anlatarak 20 cümlelik detaylı bir öykü yaz."
    };

    return Array.from({ length: worksheetCount }, () => ({
        title: `Hikaye Oluşturma (${difficulty})`,
        prompt: prompts[difficulty as keyof typeof prompts] || prompts['Orta'],
        keywords: getRandomItems(getWordsForDifficulty(difficulty, topic), itemCount || 5),
        pedagogicalNote: "Yaratıcı yazma ve kurgu yeteneği.",
        imagePrompt: `Yaratıcı yazarlık ilhamı. ${difficulty} seviyesi. Renkli ve hayal gücünü tetikleyen soyut veya somut çizim.`
    }));
};

export const generateOfflineWordsInStory = async (options: GeneratorOptions): Promise<WordsInStoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const { story, chosenValues } = buildDynamicStory(difficulty, topic);
        // Simple extraction of longer words as targets
        const words = story.split(' ').map(w => w.replace(/[.,!?]/g, ''));
        const targets = [...new Set(words.filter(w => w.length > 5))].slice(0, 4);

        return { 
            title: 'Metindeki Kelimeler', 
            story, 
            questions: targets.map(word => ({
                word,
                question: `Bu kelimeyi metinde bul ve altını çiz. Anlamını tahmin et.`
            })),
            pedagogicalNote: "Bağlamdan anlam çıkarma ve görsel tarama.",
            imagePrompt: `Hikaye görseli: ${chosenValues.place} ve ${chosenValues.object}.`
        };
    });
};

export const generateOfflineStoryAnalysis = async (options: GeneratorOptions): Promise<StoryAnalysisData[]> => {
    const { worksheetCount, topic, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
         const { story, chosenValues } = buildDynamicStory(difficulty, topic);
         return {
             title: 'Hikaye Analizi',
             story,
             analysisQuestions: [
                 { type: 'tema', question: 'Hikayenin konusu nedir?' },
                 { type: 'karakter', question: `${chosenValues.character} nasıl biridir?` },
                 { type: 'sebep-sonuç', question: `Olaylar nasıl başladı ve nasıl bitti?` },
                 { type: 'çıkarım', question: 'Sence bundan sonra ne olabilir?' }
             ],
             pedagogicalNote: "Metin analizi ve eleştirel düşünme.",
             imagePrompt: `Analitik düşünme temalı, ${chosenValues.place} içeren eğitici görsel.`
         };
    });
};

export const generateOfflineStorySequencing = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const { worksheetCount } = options;
    
    const sequences = [
        { theme: 'Tohum', steps: ['Tohum ekildi.', 'Sulanınca filizlendi.', 'Güneşle büyüdü.', 'Çiçek açtı.'] },
        { theme: 'Kek', steps: ['Malzemeler karıştı.', 'Fırına verildi.', 'Pişti ve kabardı.', 'Dilimlenip yendi.'] },
        { theme: 'Yağmur', steps: ['Bulutlar karardı.', 'Şimşek çaktı.', 'Yağmur yağdı.', 'Gökkuşağı çıktı.'] }
    ];

    return Array.from({ length: worksheetCount }, () => {
        const seq = getRandomItems(sequences, 1)[0];
        return {
            title: 'Olay Sıralama',
            prompt: "Olayları oluş sırasına göre numaralandır.",
            pedagogicalNote: "Zaman algısı ve mantıksal sıralama.",
            panels: shuffle(seq.steps.map((desc, i) => ({
                id: (i+1).toString(), 
                description: desc,
                imageBase64: '' // Offline placeholders
            }))),
            imagePrompt: 'Sıralama kartları.'
        };
    });
};

export const generateOfflineProverbFillInTheBlank = async (options: GeneratorOptions): Promise<ProverbFillData[]> => {
    const { itemCount, worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const proverbs = getRandomItems(PROVERBS, itemCount || 5).map(p => {
            const parts = p.split(' ');
            const hideIdx = getRandomInt(0, parts.length - 1);
            const full = p;
            const start = parts.slice(0, hideIdx).join(' ');
            const end = parts.slice(hideIdx + 1).join(' ');
            return { start, end, full };
        });
        return { 
            title: 'Atasözü Tamamlama',
            proverbs,
            meaning: 'Eksik kelimeleri bularak atasözlerini tamamla.',
            usagePrompt: 'Bir tanesini seç ve resmini çiz.',
            pedagogicalNote: "Kültürel bellek ve cümle tamamlama.",
            imagePrompt: "Atasözleri ve deyimler temalı, düşünen çocuk görseli."
        };
    });
};

export const generateOfflineProverbSayingSort = async (options: GeneratorOptions): Promise<ProverbSayingSortData[]> => {
    const { itemCount, worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const count = itemCount || 8;
        const countPerType = Math.ceil(count / 2);
        const items = shuffle([
            ...getRandomItems(PROVERBS, countPerType).map(t => ({text: t, type: 'atasözü' as const})),
            ...getRandomItems(SAYINGS, countPerType).map(t => ({text: t, type: 'özdeyiş' as const}))
        ]).slice(0, count);
        return {
            title: 'Atasözü mü Özdeyiş mi?',
            prompt: 'Söyleyeni belli olanlara Özdeyiş, anonim olanlara Atasözü denir. Sınıflandır.',
            items,
            pedagogicalNote: "Bilgi kaynağı analizi.",
            imagePrompt: "Terazi veya iki ayrı kutu içeren sınıflandırma görseli."
        };
    });
};

export const generateOfflineProverbWordChain = async (options: GeneratorOptions): Promise<ProverbWordChainData[]> => {
    const { itemCount, worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const solution = getRandomItems(PROVERBS, 1)[0];
        const words = shuffle(solution.replace(/[.,]/g,'').split(' ')).map(w => ({word: w, color: '#333'}));
        return {
            title: 'Kelime Zinciri',
            prompt: 'Karışık kelimeleri sıraya diz.',
            wordCloud: words,
            solutions: [solution],
            pedagogicalNote: "Sözdizimi (Sentaks) becerisi.",
            imagePrompt: "Zincir halkaları veya yapboz parçaları."
        };
    });
};

export const generateOfflineProverbSentenceFinder = async (options: GeneratorOptions) => {
    const res = await generateOfflineProverbWordChain(options);
    return res.map(r => ({...r, title: 'Cümle Kurmaca'}));
};

export const generateOfflineProverbSearch = async (options: GeneratorOptions): Promise<ProverbSearchData[]> => {
    const { worksheetCount, gridSize } = options;
    const results: ProverbSearchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const proverb = getRandomItems(PROVERBS, 1)[0];
        const words = proverb.replace(/[.,]/g, '').split(' ');
        const searchData = await generateOfflineWordSearch({ ...options, words, itemCount: words.length, worksheetCount: 1 });
        results.push({
            title: 'Atasözü Avı',
            instruction: "Tabloda gizli olan atasözünün kelimelerini bul.",
            grid: searchData[0].grid,
            proverb,
            meaning: 'Bulduğun kelimeleri sıraya dizerek atasözünü yaz.',
            pedagogicalNote: "Görsel tarama ve bütünleme.",
            imagePrompt: "Büyüteç ve harfler."
        });
    }
    return results;
};
