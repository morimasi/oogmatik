
import { GeneratorOptions, StoryData, StoryCreationPromptData, WordsInStoryData, StoryAnalysisData, StorySequencingData, MissingPartsData, StoryQuestion } from '../../types';
import { shuffle, getRandomItems } from './helpers';
import { COHERENT_STORY_TEMPLATES } from '../../data/sentences';

// --- CORE ENGINE: Coherent Story Builder ---
const buildBaseStory = (difficulty: string) => {
    // Zorluk seviyesine göre şablon filtrele
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

// 1. STORY COMPREHENSION (Okuma Anlama - Ana Etkinlik)
export const generateOfflineStoryComprehension = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const { title, story, imagePrompt, template, chosenValues } = buildBaseStory(difficulty);
        
        // Soruları oluştur
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

        // Ekstra Sorular
        questions.push({
            type: 'true-false',
            question: `Bu hikaye ${chosenValues['place'] || 'bir yerde'} geçmektedir.`,
            isTrue: true,
            answer: 'Doğru'
        });

        // Kelime Listesi (Template'den veya varsayılan)
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

// 2. STORY CREATION PROMPT (Hikaye Yazma)
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

// 3. WORDS IN STORY (Metin Analizi / Kelime Avı)
export const generateOfflineWordsInStory = async (options: GeneratorOptions): Promise<WordsInStoryData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const { title, story, imagePrompt, template } = buildBaseStory(difficulty);
        
        // Template'deki kelimeleri kullan
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

// 4. STORY ANALYSIS (Hikaye Haritası)
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

// 5. STORY SEQUENCING (Olay Sıralama)
export const generateOfflineStorySequencing = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const { worksheetCount } = options;
    // Basit sıralama senaryoları
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

// 6. MISSING PARTS (Boşluk Doldurma)
export const generateOfflineMissingParts = async (options: GeneratorOptions): Promise<MissingPartsData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const { title, story, chosenValues, imagePrompt } = buildBaseStory(difficulty);
        
        // Hikayeden bazı kelimeleri çıkar
        const words = Object.values(chosenValues);
        let maskedStory = story;
        words.forEach(w => {
            maskedStory = maskedStory.replace(w, "_______");
        });
        
        // Basit bölme (cümle bazlı)
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

// Legacy exports for compatibility
export const generateOfflineProverbFillInTheBlank = async (o: GeneratorOptions) => [] as any;
export const generateOfflineProverbSayingSort = async (o: GeneratorOptions) => [] as any;
export const generateOfflineProverbWordChain = async (o: GeneratorOptions) => [] as any;
export const generateOfflineProverbSentenceFinder = async (o: GeneratorOptions) => [] as any;
export const generateOfflineProverbSearch = async (o: GeneratorOptions) => [] as any;
