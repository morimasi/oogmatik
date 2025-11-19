import { GeneratorOptions, StoryData, StoryCreationPromptData, WordsInStoryData, StoryAnalysisData, StorySequencingData, ProverbFillData, ProverbSayingSortData, ProverbWordChainData, ProverbSentenceFinderData, StoryQuestion, MultipleChoiceStoryQuestion, ProverbSearchData } from '../../types';
import { shuffle, getRandomItems, getWordsForDifficulty, getRandomInt } from './helpers';
import { PROVERBS, STORY_TEMPLATES, SAYINGS } from '../../data/sentences';
import { generateOfflineWordSearch } from './wordGames';

export const generateOfflineStoryComprehension = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, topic, difficulty, characterName } = options;
    const results: StoryData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const template = getRandomItems(STORY_TEMPLATES, 1)[0];
        
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

        const remainingPlaceholders = story.match(/{(\w+)}/g);
        if (remainingPlaceholders) {
            console.warn(`Story template has unfilled placeholders: ${remainingPlaceholders.join(', ')}. Filling with '[?]'.`);
            remainingPlaceholders.forEach(p => {
                story = story.replace(p, '[?]');
            });
        }

        const questionCandidates = Object.keys(usedValues).filter(k => k !== 'greeting');

        const questions: StoryQuestion[] = shuffle(questionCandidates).slice(0, 3).map(questionKey => {
            const answer = usedValues[questionKey];
            const pluralKey = `${questionKey}s`;
            const dataArray = (template as any)[pluralKey] || (template as any)[questionKey] || [];
            
            let questionText = `Hikayede geçen ${questionKey} neydi?`;
            const questionTextMap: { [key: string]: string } = {
                place: "Olaylar nerede geçiyordu?",
                activity: `${usedValues['character'] || 'Karakter'} ne yapmayı severdi?`,
                object: "Hikayede bulunan nesne neydi?",
                goal: `${usedValues['character'] || 'Karakter'}'in amacı neydi?`,
                animal: "Hikayedeki hayvan neydi?",
                food: "Karakterin en sevdiği yiyecek neydi?"
            };
            if (questionTextMap[questionKey]) {
                questionText = questionTextMap[questionKey];
            }
            
            // FIX: Cast `dataArray` to string[] to resolve type error where 'options' was inferred as 'unknown[]' instead of 'string[]'.
            const distractors = getRandomItems((dataArray as string[]).filter((item: string) => item !== answer), 2);
            
            while (distractors.length < 2) {
                const fallbackWord = getRandomItems(getWordsForDifficulty('Orta', topic), 1)[0];
                if (fallbackWord && fallbackWord !== answer && !distractors.includes(fallbackWord)) {
                    distractors.push(fallbackWord);
                }
            }

            const options = shuffle([answer, ...distractors]);
            const answerIndex = options.indexOf(answer);

            // FIX: Add missing 'type' property to satisfy the MultipleChoiceStoryQuestion interface.
            return { type: 'multiple-choice', question: questionText, options, answerIndex };
        });

        while (questions.length < 3) {
            const wordPool = story.split(' ').filter(w => w.length > 3 && !Object.values(usedValues).includes(w) && w.replace(/[.,]/g, '').length > 2);
            const answer = getRandomItems(wordPool, 1)[0]?.replace(/[.,]/g, '') || "cevap";
            const distractors = getRandomItems(getWordsForDifficulty(difficulty, topic).filter(w => !wordPool.includes(w) && w !== answer), 2);
            const options = shuffle([answer, ...distractors]);
            questions.push({
                // FIX: Add missing 'type' property to satisfy the MultipleChoiceStoryQuestion interface.
                type: 'multiple-choice',
                question: `Hikayede geçen kelime hangisidir?`,
                options,
                answerIndex: options.indexOf(answer)
            });
        }

        results.push({ title: `Hikaye Anlama (${topic || 'Rastgele'})`, story, questions, characters: [usedValues['character'] || 'Bilinmiyor'], mainIdea: 'Bir macera yaşandı.', setting: usedValues['place'] || 'Bilinmiyor' });
    }
    return results;
};

export const generateOfflineStoryCreationPrompt = async (options: GeneratorOptions): Promise<StoryCreationPromptData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    const results: StoryCreationPromptData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        results.push({
            title: `Hikaye Oluşturma (${topic || 'Rastgele'})`,
            prompt: `Aşağıdaki kelimeleri kullanarak ${topic || 'serbest'} konulu bir hikaye yaz.`,
            keywords: getRandomItems(getWordsForDifficulty(difficulty, topic), itemCount)
        });
    }
    return results;
};

export const generateOfflineWordsInStory = async (options: GeneratorOptions): Promise<WordsInStoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const results: WordsInStoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const template = getRandomItems(STORY_TEMPLATES, 1)[0];
        const story = template.template.replace('{place}', getRandomItems(template.places, 1)[0]).replace(/{character}/g, getRandomItems(template.characters, 1)[0]).replace('{activity}', getRandomItems(template.activities, 1)[0]).replace('{object}', getRandomItems(template.objects, 1)[0]);
        const wordsInStory = [...new Set(story.replace(/[.,]/g, '').split(' ').filter(w => w.length > 3))];
        const selectedWords = getRandomItems(wordsInStory, 4);

        const questions = selectedWords.map(word => ({
            word,
            question: `'${word}' kelimesini kullanarak bir cümle yaz.`
        }));

        results.push({ title: 'Metindeki Kelimeler', story, questions });
    }
    return results;
};

export const generateOfflineStoryAnalysis = async (options: GeneratorOptions): Promise<StoryAnalysisData[]> => {
    const { worksheetCount } = options;
    const staticStories = [
        {
            story: "Küçük ve sevimli kedi, sıcak bir günde soğuk bir süt içti. Mutlu bir şekilde mırıldandı.",
            questions: [
                { type: 'tema' as const, question: "Bu hikayenin ana duygusu nedir?"},
                { type: 'sebep-sonuç' as const, question: "Kedi neden mırıldandı?"},
                { type: 'çıkarım' as const, question: "Hikayedeki 'sıcak' kelimesinin zıt anlamlısı nedir?"}
            ]
        },
        {
            story: "Cesur bir fare, büyük bir peynir parçası buldu. Zayıf arkadaşıyla bu peyniri paylaştı.",
            questions: [
                { type: 'karakter' as const, question: "Farenin en belirgin özelliği nedir?"},
                { type: 'sebep-sonuç' as const, question: "Farenin arkadaşıyla peyniri paylaşması neyi gösterir?"},
                { type: 'çıkarım' as const, question: "Hikayedeki 'büyük' kelimesinin zıt anlamlısı nedir?"}
            ]
        }
    ];
    return Array.from({length: worksheetCount}, () => {
        const chosenStory = getRandomItems(staticStories, 1)[0];
        return {
            title: 'Hikaye Analizi (Hızlı Mod)',
            story: chosenStory.story,
            analysisQuestions: chosenStory.questions,
        }
    });
};

export const generateOfflineStorySequencing = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const { worksheetCount } = options;
    const stories = [
        [
            { id: 'A', description: 'Küçük tırtıl bir yaprakta uyandı.' },
            { id: 'B', description: 'Tırtıl çok acıkmıştı ve yaprağı yemeye başladı.' },
            { id: 'C', description: 'Karnı doyan tırtıl kendine bir koza ördü.' },
            { id: 'D', description: 'Kozadan rengarenk bir kelebek çıktı.' }
        ],
        [
            { id: 'A', description: 'Çocuk bir tohum ekti.' },
            { id: 'B', description: 'Tohumu her gün suladı.' },
            { id: 'C', description: 'Tohum filizlendi ve büyüdü.' },
            { id: 'D', description: 'Büyük bir çiçek açtı.' }
        ]
    ];
    return Array.from({length: worksheetCount}, () => ({
            title: 'Hikaye Sıralama (Hızlı Mod)',
            prompt: 'Olayları doğru sıraya koymak için resimleri numaralandır.',
            panels: shuffle(getRandomItems(stories, 1)[0])
        }));
};

export const generateOfflineProverbFillInTheBlank = async (options: GeneratorOptions): Promise<ProverbFillData[]> => {
    const { itemCount, worksheetCount } = options;
    return Array.from({length: worksheetCount}, () => {
        const proverbs = getRandomItems(PROVERBS, itemCount).map(p => {
            const words = p.split(' ');
            const blankIndex = getRandomInt(1, words.length - 2);
            return {
                start: words.slice(0, blankIndex).join(' '),
                end: words.slice(blankIndex + 1).join(' '),
                full: p
            };
        });
        return { 
            title: 'Atasözü Doldurma (Hızlı Mod)',
            proverbs,
            meaning: 'Atasözleri, geçmişten gelen deneyimleri ve öğütleri kısa ve öz bir şekilde anlatır.',
            usagePrompt: 'Yukarıdaki atasözlerinden birini seç ve uygun bir durumda kullanıldığı kısa bir olay yaz.'
        };
    });
}

export const generateOfflineProverbSayingSort = async (options: GeneratorOptions): Promise<ProverbSayingSortData[]> => {
    const { itemCount, worksheetCount } = options;
    return Array.from({length: worksheetCount}, () => {
        const proverbs = getRandomItems(PROVERBS, Math.ceil(itemCount/2)).map(p => ({ text: p, type: 'atasözü' as const }));
        const sayings = getRandomItems(SAYINGS, Math.floor(itemCount/2)).map(s => ({ text: s, type: 'özdeyiş' as const }));
        return {
            title: 'Atasözü / Özdeyiş (Hızlı Mod)',
            prompt: 'Aşağıdaki cümleleri "Atasözü" ve "Özdeyiş" olarak doğru kutulara yerleştirin.',
            items: shuffle([...proverbs, ...sayings])
        };
    });
}
export const generateOfflineProverbWordChain = async (options: GeneratorOptions): Promise<ProverbWordChainData[]> => {
    const {itemCount, worksheetCount} = options;
    return Array.from({length: worksheetCount}, () => {
        const solutions = getRandomItems(PROVERBS, itemCount);
        const wordCloud = solutions.flatMap(s => s.replace(/[.,]/g, '').split(' ')).map(word => ({word, color: 'blue'}));
        return {title: 'Atasözü/Özdeyiş Bulma', prompt: 'Karışık kelimelerden atasözleri ve özdeyişler oluşturun.', wordCloud: shuffle(wordCloud), solutions};
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
        const searchResult = await generateOfflineWordSearch({ ...options, words: proverb.replace(/ /g, '').split(''), itemCount: 1, worksheetCount: 1, gridSize });
        results.push({
            title: 'Atasözü Avı (Hızlı Mod)',
            grid: searchResult[0].grid,
            proverb: proverb,
            meaning: 'Bu atasözü, küçük birikimlerin zamanla büyüyebileceğini anlatır.' // Generic meaning
        });
    }
    return results;
};

// FIX: Removed mock generator functions that are implemented in other files to resolve export ambiguity.
// These are hybrid activities that are better suited for wordGames.ts
/*
export const generateOfflineJumbledWordStory = async (options: GeneratorOptions): Promise<any[]> => [];
export const generateOfflineThematicJumbledWordStory = async (options: GeneratorOptions): Promise<any[]> => [];
export const generateOfflineSynonymSearchStory = async (options: GeneratorOptions): Promise<any[]> => [];
*/
