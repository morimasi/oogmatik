
import { GeneratorOptions, StoryData, StoryCreationPromptData, WordsInStoryData, StoryAnalysisData, StorySequencingData, ProverbFillData, ProverbSayingSortData, ProverbWordChainData, ProverbSentenceFinderData, StoryQuestion, ProverbSearchData } from '../../types';
import { shuffle, getRandomItems, getWordsForDifficulty, getRandomInt } from './helpers';
import { PROVERBS, STORY_TEMPLATES, SAYINGS } from '../../data/sentences';
import { generateOfflineWordSearch } from './wordGames';

// --- Helper: Generate Logic-Based Story ---
const generateLogicBasedStory = (topic?: string, characterName?: string) => {
    // 1. Select a structural template
    const template = getRandomItems(STORY_TEMPLATES, 1)[0];
    
    // 2. Fill variables with consistency check (if needed)
    // For now, simple random replacement from template pools
    let story = template.template;
    const placeholders = [...story.matchAll(/{(\w+)}/g)];
    const uniqueKeys = [...new Set(placeholders.map(p => p[1]))];
    
    const usedValues: { [key: string]: string } = {};

    uniqueKeys.forEach(key => {
        const pluralKey = `${key}s`;
        const dataArray = (template as any)[pluralKey] || (template as any)[key];

        if (dataArray && Array.isArray(dataArray) && dataArray.length > 0) {
            let value = '';
            if (key === 'character' && characterName) {
                value = characterName;
            } else {
                value = getRandomItems(dataArray, 1)[0];
            }
            
            if (value) {
                usedValues[key] = value;
                story = story.replace(new RegExp(`{${key}}`, 'g'), value);
            }
        }
    });
    
    // Clean up any remaining brackets
    story = story.replace(/{.*?}/g, '...');

    return { story, usedValues, template };
};

export const generateOfflineStoryComprehension = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, topic, difficulty, characterName } = options;
    const results: StoryData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const { story, usedValues, template } = generateLogicBasedStory(topic, characterName);
        
        // 3. Generate Pedagogical Questions
        const questions: StoryQuestion[] = [];
        const questionCandidates = Object.keys(usedValues).filter(k => k !== 'greeting');

        // A. Literal Question (Hatırlama)
        if (questionCandidates.length > 0) {
            const qKey = questionCandidates[0];
            const answer = usedValues[qKey];
            // Distractors: other items from the same category in the template
            const pool = ((template as any)[qKey + 's'] || []) as string[];
            const distractors = getRandomItems(pool.filter(i => i !== answer), 2);
            
            questions.push({
                type: 'multiple-choice',
                question: `Hikayede geçen ${qKey === 'place' ? 'mekan neresidir?' : qKey === 'character' ? 'karakter kimdir?' : qKey === 'object' ? 'nesne nedir?' : `${qKey} nedir?`}`,
                options: shuffle([answer, ...distractors]),
                answerIndex: 0 // Shuffle will change this, fix below
            });
        }

        // B. Inferential Question (Çıkarım)
        // Based on adjectives or emotions if present, otherwise fallback
        const emotion = usedValues['adjective'] || usedValues['weather'];
        if (emotion) {
            questions.push({
                type: 'multiple-choice',
                question: `Bu hikayenin atmosferi veya karakterin durumu nasıldı?`,
                options: shuffle([emotion, 'tam tersi', 'alakasız']), // Simplified logic
                answerIndex: 0
            });
        } else {
             questions.push({
                type: 'open-ended',
                question: `Sence karakter bundan sonra ne yapmıştır?`
            });
        }

        // C. Critical Question (Değerlendirme)
        questions.push({
            type: 'open-ended',
            question: `Sen olsaydın ${usedValues['object'] || 'bu durumda'} ne yapardın?`
        });

        // Fix indices for MC
        questions.forEach(q => {
            if (q.type === 'multiple-choice') {
                const correct = q.options[0]; // Before shuffle it was first
                // Re-shuffle options here properly
                q.options = shuffle(q.options);
                q.answerIndex = q.options.indexOf(correct);
            }
        });

        results.push({ 
            title: `Hikaye Anlama`, 
            story, 
            questions, 
            characters: [usedValues['character'] || 'Bilinmiyor'], 
            mainIdea: 'Olayların akışını ve detayları anlama.', 
            setting: usedValues['place'] || 'Bilinmiyor',
            pedagogicalNote: "Bloom taksonomisine göre (Hatırlama, Çıkarım, Değerlendirme) sorular içerir."
        });
    }
    return results;
};

export const generateOfflineStoryCreationPrompt = async (options: GeneratorOptions): Promise<StoryCreationPromptData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    const results: StoryCreationPromptData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const keywords = getRandomItems(getWordsForDifficulty(difficulty, topic), itemCount);
        results.push({
            title: `Hikaye Oluşturma`,
            prompt: `Aşağıdaki kelimeleri kullanarak, giriş, gelişme ve sonuç bölümleri olan bir hikaye yaz.`,
            keywords: keywords,
            pedagogicalNote: "Yaratıcı yazma, kelime kullanımı ve hikaye kurgulama becerisi."
        });
    }
    return results;
};

export const generateOfflineWordsInStory = async (options: GeneratorOptions): Promise<WordsInStoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const results: WordsInStoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const { story } = generateLogicBasedStory(topic);
        // Pick words that are suitable for the level
        const words = story.split(' ').map(w => w.replace(/[.,!?]/g, ''));
        const candidates = words.filter(w => w.length > 4); // Filter simple words
        const selectedWords = getRandomItems([...new Set(candidates)], 4);

        const questions = selectedWords.map(word => ({
            word,
            question: `Bu kelimenin anlamını tahmin et ve bir cümlede kullan.`
        }));

        results.push({ 
            title: 'Metindeki Kelimeler', 
            story, 
            questions,
            pedagogicalNote: "Bağlamdan kelime anlamı çıkarma ve kelime dağarcığı geliştirme."
        });
    }
    return results;
};

export const generateOfflineStoryAnalysis = async (options: GeneratorOptions): Promise<StoryAnalysisData[]> => {
    const { worksheetCount, topic } = options;
    const results: StoryAnalysisData[] = [];
    
    for (let i = 0; i < worksheetCount; i++) {
         const { story, usedValues } = generateLogicBasedStory(topic);
         
         results.push({
             title: 'Hikaye Analizi',
             story,
             analysisQuestions: [
                 { type: 'tema', question: 'Bu hikayeye en uygun başlık ne olurdu?' },
                 { type: 'karakter', question: `${usedValues['character'] || 'Ana karakter'} sence nasıl biri?` },
                 { type: 'sebep-sonuç', question: `Olaylar neden ${usedValues['place'] || 'burada'} geçti?` },
                 { type: 'çıkarım', question: 'Hikayenin sonunu değiştirmek istesen nasıl bitirirdin?' }
             ],
             pedagogicalNote: "Metnin derin yapısını (tema, karakter, kurgu) analiz etme."
         });
    }
    return results;
};

export const generateOfflineStorySequencing = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const { worksheetCount } = options;
    // Logic: Cause -> Effect chains.
    const logicalStories = [
        [
            { id: 'A', description: 'Ayşe toprağı kazdı ve tohumu ekti.' },
            { id: 'B', description: 'Her gün tohumu suladı ve güneş almasını sağladı.' },
            { id: 'C', description: 'Topraktan küçük yeşil bir filiz çıktı.' },
            { id: 'D', description: 'Filiz büyüdü ve kocaman bir çiçek açtı.' }
        ],
        [
            { id: 'A', description: 'Kedi mırnav acıkmıştı, mutfağa gitti.' },
            { id: 'B', description: 'Tezgahın üzerinde bir süt şişesi gördü.' },
            { id: 'C', description: 'Zıplayıp şişeyi devirdi, süt döküldü.' },
            { id: 'D', description: 'Sahibi gelince masanın altına saklandı.' }
        ]
    ];

    return Array.from({length: worksheetCount}, () => ({
            title: 'Hikaye Sıralama',
            prompt: 'Olayların oluş sırasına göre resimleri (veya cümleleri) numaralandır.',
            panels: shuffle(getRandomItems(logicalStories, 1)[0]),
            pedagogicalNote: "Olay örgüsü kurma, neden-sonuç ilişkisi ve zaman algısı."
        }));
};

export const generateOfflineProverbFillInTheBlank = async (options: GeneratorOptions): Promise<ProverbFillData[]> => {
    const { itemCount, worksheetCount } = options;
    // Categorized proverbs could be implemented here for better context
    return Array.from({length: worksheetCount}, () => {
        const proverbs = getRandomItems(PROVERBS, itemCount).map(p => {
            const words = p.split(' ');
            // Intelligent blanking: try to avoid blanking stop words (ve, ile, bir)
            const candidateIndices = words.map((w, i) => ({w, i})).filter(x => x.w.length > 3).map(x => x.i);
            const blankIndex = candidateIndices.length > 0 ? getRandomItems(candidateIndices, 1)[0] : getRandomInt(0, words.length-1);
            
            return {
                start: words.slice(0, blankIndex).join(' '),
                end: words.slice(blankIndex + 1).join(' '),
                full: p
            };
        });
        return { 
            title: 'Atasözü Tamamlama',
            proverbs,
            meaning: 'Atasözleri tecrübe aktarır. Eksik parçayı bağlamdan çıkarmaya çalış.',
            usagePrompt: 'Seçtiğin bir atasözünü gerçek bir olayla ilişkilendirerek yaz.',
            pedagogicalNote: "Kültürel miras aktarımı ve semantik tamamlama (Cloze Test) becerisi."
        };
    });
}

export const generateOfflineProverbSayingSort = async (options: GeneratorOptions): Promise<ProverbSayingSortData[]> => {
    const { itemCount, worksheetCount } = options;
    return Array.from({length: worksheetCount}, () => {
        const proverbs = getRandomItems(PROVERBS, Math.ceil(itemCount/2)).map(p => ({ text: p, type: 'atasözü' as const }));
        const sayings = getRandomItems(SAYINGS, Math.floor(itemCount/2)).map(s => ({ text: s, type: 'özdeyiş' as const }));
        return {
            title: 'Atasözü / Özdeyiş',
            prompt: 'Anonim olanları "Atasözü", söyleyeni belli olanları "Özdeyiş" kutusuna ayır.',
            items: shuffle([...proverbs, ...sayings]),
            pedagogicalNote: "Bilgi kaynağını ayırt etme ve kategorizasyon."
        };
    });
}
export const generateOfflineProverbWordChain = async (options: GeneratorOptions): Promise<ProverbWordChainData[]> => {
    const {itemCount, worksheetCount} = options;
    return Array.from({length: worksheetCount}, () => {
        const solutions = getRandomItems(PROVERBS, itemCount);
        // Word cloud generation
        const wordCloud = solutions.flatMap(s => s.replace(/[.,]/g, '').split(' ')).map(word => ({
            word, 
            color: getRandomItems(['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'], 1)[0]
        }));
        return {
            title: 'Atasözü Zinciri', 
            prompt: 'Dağınık kelimeleri birleştirerek anlamlı atasözleri oluştur.', 
            wordCloud: shuffle(wordCloud), 
            solutions,
            pedagogicalNote: "Sözdizimi (sentaks) kuralları ve cümle oluşturma becerisi."
        };
    });
}

export const generateOfflineProverbSentenceFinder = async (options: GeneratorOptions): Promise<ProverbSentenceFinderData[]> => {
    const res = await generateOfflineProverbWordChain(options);
    return res.map(r => ({...r, title: 'Cümle Bulma (Atasözü)'}))
}

export const generateOfflineProverbSearch = async (options: GeneratorOptions): Promise<ProverbSearchData[]> => {
    const { worksheetCount, gridSize } = options;
    const results: ProverbSearchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const proverb = getRandomItems(PROVERBS, 1)[0];
        // Use word search generator logic but for a sentence
        const searchResult = await generateOfflineWordSearch({ ...options, words: proverb.replace(/[.,]/g, '').split(' '), itemCount: 1, worksheetCount: 1, gridSize });
        results.push({
            title: 'Atasözü Avı',
            grid: searchResult[0].grid,
            proverb: proverb,
            meaning: 'Atasözünün içerdiği kelimeleri bulmacada bul.',
            pedagogicalNote: "Görsel tarama ve parça-bütün ilişkisi."
        });
    }
    return results;
};
