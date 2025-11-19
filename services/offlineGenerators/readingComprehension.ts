import { GeneratorOptions, StoryData, StoryCreationPromptData, WordsInStoryData, StoryAnalysisData, StorySequencingData, ProverbFillData, ProverbSayingSortData, ProverbWordChainData, ProverbSentenceFinderData } from '../../types';
import { shuffle, getRandomItems, getWordsForDifficulty, getRandomInt } from './helpers';
import { PROVERBS, STORY_TEMPLATES, SAYINGS } from '../../data/sentences';


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

        const questions = shuffle(questionCandidates).slice(0, 3).map(questionKey => {
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

            return { question: questionText, options, answerIndex };
        });

        while (questions.length < 3) {
            const wordPool = story.split(' ').filter(w => w.length > 3 && !Object.values(usedValues).includes(w) && w.replace(/[.,]/g, '').length > 2);
            const answer = getRandomItems(wordPool, 1)[0]?.replace(/[.,]/g, '') || "cevap";
            const distractors = getRandomItems(getWordsForDifficulty(difficulty, topic).filter(w => !wordPool.includes(w) && w !== answer), 2);
            const options = shuffle([answer, ...distractors]);
            questions.push({
                question: `Hikayede geçen kelime hangisidir?`,
                options,
                answerIndex: options.indexOf(answer)
            });
        }

        results.push({ title: `Hikaye Anlama (${topic || 'Rastgele'})`, story, questions });
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
        const inStoryList = getRandomItems(wordsInStory, 6);
        const notInStoryList = getRandomItems(getWordsForDifficulty(difficulty, topic).filter(w => !wordsInStory.includes(w)), 6);
        const wordList = shuffle([...inStoryList.map(w => ({ word: w, isInStory: true })), ...notInStoryList.map(w => ({ word: w, isInStory: false }))]);
        results.push({ title: 'Metindeki Kelimeler', story, wordList });
    }
    return results;
};

export const generateOfflineStoryAnalysis = async (options: GeneratorOptions): Promise<StoryAnalysisData[]> => {
    const res = await generateOfflineStoryComprehension(options);
    return res.map(r => ({ ...r, title: 'Hikaye Analizi', questions: r.questions.map(q => ({ question: q.question, context: q.options.join(', ') })) }));
};

export const generateOfflineStorySequencing = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const { worksheetCount } = options;
    const results: StorySequencingData[] = [];
    const story1 = [
        { id: 'A', description: 'Küçük tırtıl bir yaprakta uyandı.' },
        { id: 'B', description: 'Tırtıl çok acıkmıştı ve yaprağı yemeye başladı.' },
        { id: 'C', description: 'Karnı doyan tırtıl kendine bir koza ördü.' },
        { id: 'D', description: 'Kozadan rengarenk bir kelebek çıktı.' }
    ];
    const story2 = [
        { id: 'A', description: 'Çocuk bir tohum ekti.' },
        { id: 'B', description: 'Tohumu her gün suladı.' },
        { id: 'C', description: 'Tohum filizlendi ve büyüdü.' },
        { id: 'D', description: 'Büyük bir çiçek açtı.' }
    ];
    const stories = [story1, story2];
    for(let i=0; i < worksheetCount; i++){
        results.push({
            title: 'Hikaye Sıralama (Hızlı Mod)',
            prompt: 'Olayları doğru sıraya koymak için resimleri numaralandır.',
            panels: shuffle(getRandomItems(stories, 1)[0])
        });
    }
    return results;
};

export const generateOfflineProverbFillInTheBlank = async (options: GeneratorOptions): Promise<ProverbFillData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: ProverbFillData[] = [];
    for(let i=0; i < worksheetCount; i++){
        const proverbs = getRandomItems(PROVERBS, itemCount).map(p => {
            const words = p.split(' ');
            const blankIndex = getRandomInt(1, words.length - 2);
            const start = words.slice(0, blankIndex).join(' ');
            const end = words.slice(blankIndex + 1).join(' ');
            return { start, end };
        });
        results.push({ title: 'Atasözü Doldurma', proverbs });
    }
    return results;
}

export const generateOfflineProverbSayingSort = async (options: GeneratorOptions): Promise<ProverbSayingSortData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: ProverbSayingSortData[] = [];
    for(let i=0; i < worksheetCount; i++){
        const proverbs = getRandomItems(PROVERBS, Math.ceil(itemCount/2)).map(p => ({ text: p, type: 'atasözü' as const }));
        const sayings = getRandomItems(SAYINGS, Math.floor(itemCount/2)).map(s => ({ text: s, type: 'özdeyiş' as const }));
        results.push({
            title: 'Atasözü / Özdeyiş (Hızlı Mod)',
            prompt: 'Aşağıdaki cümleleri "Atasözü" ve "Özdeyiş" olarak doğru kutulara yerleştirin.',
            items: shuffle([...proverbs, ...sayings])
        });
    }
    return results;
}
export const generateOfflineProverbWordChain = async (options: GeneratorOptions): Promise<ProverbWordChainData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: ProverbWordChainData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const solutions = getRandomItems(PROVERBS, itemCount);
        const wordCloud = solutions.flatMap(s => s.replace(/[.,]/g, '').split(' ')).map(word => ({word, color: 'blue'}));
        results.push({title: 'Atasözü/Özdeyiş Bulma', prompt: 'Karışık kelimelerden atasözleri ve özdeyişler oluşturun.', wordCloud: shuffle(wordCloud), solutions});
    }
    return results;
}

export const generateOfflineProverbSentenceFinder = async (options: GeneratorOptions): Promise<ProverbSentenceFinderData[]> => {
    const res = await generateOfflineProverbWordChain(options);
    return res.map(r => ({...r, title: 'Cümle Bulma (Atasözü)'}))
}