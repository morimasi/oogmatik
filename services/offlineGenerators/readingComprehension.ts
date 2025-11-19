import { GeneratorOptions, StoryData, StoryCreationPromptData, WordsInStoryData, StoryAnalysisData, StorySequencingData, ProverbFillData, ProverbSayingSortData, ProverbWordChainData, ProverbSentenceFinderData } from '../../types';
import { shuffle, getRandomItems, getWordsForDifficulty, getRandomInt } from './helpers';
import { PROVERBS, STORY_TEMPLATES } from '../../data/sentences';


export const generateOfflineStoryComprehension = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, topic, difficulty, characterName } = options;
    const results: StoryData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const template = getRandomItems(STORY_TEMPLATES, 1)[0];
        
        let story = template.template;
        const placeholders = [...story.matchAll(/{(\w+)}/g)];
        const uniqueKeys = [...new Set(placeholders.map(p => p[1]))]; // e.g., ['place', 'character', 'activity']
        
        const usedValues: { [key: string]: string } = {};

        uniqueKeys.forEach(key => {
            const pluralKey = `${key}s`;
            // Check for plural first (characters), then singular (character)
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

        const availableQuestionKeys = Object.keys(usedValues).filter(k => k !== 'character' && k !== 'greeting');
        
        const questions = Array.from({ length: 3 }).map((_, qIndex) => {
            if (difficulty === 'Başlangıç' || qIndex === 0) {
                const wordPool = story.split(' ').filter(w => w.length > 3 && !Object.values(usedValues).includes(w));
                const answer = getRandomItems(wordPool, 1)[0] || "cevap";
                const distractors = getRandomItems(getWordsForDifficulty(difficulty, topic).filter(w => !wordPool.includes(w) && w !== answer), 2);
                const options = shuffle([answer, ...distractors]);
                return { question: `Hikayede geçen kelimelerden hangisi aşağıdadır?`, options, answerIndex: options.indexOf(answer) };
            } 
            
            if (availableQuestionKeys.length > 0) {
                const questionKey = getRandomItems(availableQuestionKeys, 1)[0];
                availableQuestionKeys.splice(availableQuestionKeys.indexOf(questionKey), 1);

                const answer = usedValues[questionKey];
                const pluralKey = `${questionKey}s`;
                const dataArray = (template as any)[pluralKey] || (template as any)[questionKey];

                let questionText = `Hikayede bahsedilen ${questionKey} neydi?`;
                if (questionKey === 'place') questionText = `Olaylar nerede geçiyordu?`;
                if (questionKey === 'activity') questionText = `${usedValues['character'] || 'Karakter'} ne yapmayı seviyordu?`;
                if (questionKey === 'object') questionText = `Hikayede bulunan nesne neydi?`;
                if (questionKey === 'goal') questionText = `${usedValues['character'] || 'Karakter'}'in amacı neydi?`;

                const distractors = (dataArray && Array.isArray(dataArray)) 
                    ? getRandomItems(dataArray.filter((item: string) => item !== answer), 2)
                    : [];

                const options = shuffle([answer, ...distractors]);
                
                return { question: questionText, options, answerIndex: options.indexOf(answer) };

            } else {
                return { question: `Hikaye ne hakkındaydı?`, options: [topic || 'Macera', 'Okul', 'Aile'], answerIndex: 0 };
            }
        });

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
    const panels = [{id: 'A', description: 'Çocuk uyandı.'}, {id: 'B', description: 'Okula gitti.'}, {id: 'C', description: 'Kahvaltı yaptı.'}, {id: 'D', description: 'Oyun oynadı.'}];
    return [{ title: 'Hikaye Oluşturma', prompt: 'Resimleri sırala.', panels: shuffle(panels) }];
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
    return Array(options.worksheetCount).fill({ title: 'Şifre Bul (Atasözü/Özdeyiş)', prompt: 'Cümlelerin atasözü mü yoksa özdeyiş mi olduğunu belirleyin.', items: [{text: 'Damlaya damlaya göl olur.', type: 'atasözü'}]});
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