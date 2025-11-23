
import { GeneratorOptions, StoryData, StoryCreationPromptData, StoryAnalysisData, StorySequencingData, StoryQuestion } from '../../types';
import { shuffle, getRandomItems, getWordsForDifficulty } from './helpers';
import { DYNAMIC_STORY_MODULES } from '../../data/sentences';

// --- HELPER: Story Assembler ---
const buildDynamicStory = (difficulty: string, topic?: string, characterName?: string) => {
    let targetSentenceCount = 5;
    if (difficulty === 'Orta') targetSentenceCount = 10;
    if (difficulty === 'Zor') targetSentenceCount = 15;
    if (difficulty === 'Uzman') targetSentenceCount = 20;

    const intro = getRandomItems(DYNAMIC_STORY_MODULES.intros, 1)[0];
    const conclusion = getRandomItems(DYNAMIC_STORY_MODULES.conclusions, 1)[0];
    
    let bodyCount = targetSentenceCount - 2;
    if (bodyCount < 1) bodyCount = 1;

    const actions = getRandomItems(DYNAMIC_STORY_MODULES.actions, bodyCount);
    
    const storyTemplate = [intro, ...actions, conclusion].join(' ');

    let story = storyTemplate;
    const fillers = DYNAMIC_STORY_MODULES.fillers;
    
    const chosenValues: Record<string, string> = {
        character: characterName || getRandomItems(fillers.characters, 1)[0],
        place: getRandomItems(fillers.places, 1)[0],
        object: getRandomItems(fillers.objects, 1)[0],
        friend: getRandomItems(fillers.friends, 1)[0],
        animal: getRandomItems(fillers.animals, 1)[0]
    };

    Object.keys(chosenValues).forEach(key => {
        story = story.replace(new RegExp(`{${key}}`, 'g'), chosenValues[key]);
    });

    story = story.replace(/{(\w+)}/g, (match, p1) => {
        const list = (fillers as any)[p1 + 's']; 
        return list ? (getRandomItems(list, 1)[0] as string) : match;
    });

    return { story, chosenValues };
};

export const generateOfflineStoryComprehension = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, topic, characterName, difficulty } = options;
    const results: StoryData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const { story, chosenValues } = buildDynamicStory(difficulty, topic, characterName);
        
        const questions: StoryQuestion[] = [];
        
        questions.push({
            type: 'multiple-choice',
            question: "Hikayenin ana kahramanı kimdir?",
            options: shuffle([chosenValues.character, 'Bilinmiyor', 'Kardeşi', 'Öğretmen']),
            answerIndex: 0
        });

        if (difficulty !== 'Başlangıç') {
            questions.push({
                type: 'multiple-choice',
                question: "Olay nerede geçmektedir?",
                options: shuffle([chosenValues.place, 'Okulda', 'Evde', 'Bahçede']),
                answerIndex: 0
            });
        }

        questions.push({
            type: 'open-ended',
            question: `Hikayede ${chosenValues.character} ne buldu?`
        });

        if (difficulty === 'Zor' || difficulty === 'Uzman') {
            questions.push({
                type: 'open-ended',
                question: "Hikayenin ana fikri sence nedir?"
            });
        }

        if (difficulty === 'Uzman') {
            questions.push({
                type: 'open-ended',
                question: "Hikayeye yeni bir başlık bulabilir misin?"
            });
        }

        let visualDesc = "Basit, net çizgili, tek karakter, beyaz arka plan.";
        if (difficulty === 'Orta') visualDesc = "Renkli, mekan detaylı, karakter ve çevre.";
        if (difficulty === 'Zor') visualDesc = "Zengin detaylı, gölgelendirmeli, kitap illüstrasyonu tarzı.";
        if (difficulty === 'Uzman') visualDesc = "Gerçekçi, atmosferik ışıklandırma, karmaşık kompozisyon.";

        results.push({ 
            title: `Okuma Anlama: ${chosenValues.character}'in Macerası`, 
            story, 
            questions: questions,
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
        keywords: getRandomItems(getWordsForDifficulty(difficulty, topic), 3),
        imagePrompt: '',
        pedagogicalNote: 'Yaratıcı yazarlık ve dil bilgisi.'
    }));
};

export const generateOfflineStoryAnalysis = async (options: GeneratorOptions): Promise<StoryAnalysisData[]> => {
    const { worksheetCount, topic, difficulty } = options;
    const results: StoryAnalysisData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const { story } = buildDynamicStory(difficulty, topic);
        
        results.push({
            title: 'Hikaye Analizi',
            instruction: 'Hikayeyi oku ve analiz sorularını yanıtla.',
            pedagogicalNote: 'Metin çözümleme ve eleştirel okuma.',
            story,
            imagePrompt: '',
            analysisQuestions: [
                { type: 'tema', question: 'Bu hikayenin ana teması nedir?' },
                { type: 'karakter', question: 'Ana karakterin en belirgin özelliği sence ne?' },
                { type: 'sebep-sonuç', question: 'Hikayedeki olaylar neden bu şekilde gelişti?' },
                { type: 'çıkarım', question: 'Sence hikayenin sonunda karakter ne hissetti?' }
            ]
        });
    }
    return results;
};

export const generateOfflineStorySequencing = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const { worksheetCount, topic, difficulty } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const { story } = buildDynamicStory(difficulty, topic);
        // Split story into 4 logical parts roughly
        const parts = story.split(/(?<=[.!?])\s+/);
        const chunkSize = Math.ceil(parts.length / 4);
        
        const panels = [];
        for(let k=0; k<4; k++) {
            const desc = parts.slice(k*chunkSize, (k+1)*chunkSize).join(' ').substring(0, 80) + '...';
            panels.push({
                id: `${k+1}`,
                description: desc || "Olay devam ediyor...",
                imageBase64: ''
            });
        }

        return {
            title: 'Olay Sıralama',
            prompt: 'Karışık verilen olayları oluş sırasına göre numaralandır.',
            pedagogicalNote: 'Olay örgüsü takibi ve neden-sonuç ilişkisi.',
            imagePrompt: '',
            panels: shuffle(panels)
        };
    });
};
