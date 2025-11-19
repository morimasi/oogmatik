import { GeneratorOptions, StoryData, StoryCreationPromptData, WordsInStoryData, StoryAnalysisData, StorySequencingData, ProverbFillData, ProverbSayingSortData, ProverbWordChainData, ProverbSentenceFinderData } from '../../types';
// FIX: Imported getRandomInt to make it available in the module.
import { shuffle, getRandomItems, getWordsForDifficulty, getRandomInt } from './helpers';
import { PROVERBS, STORY_TEMPLATES } from '../../data/sentences';


export const generateOfflineStoryComprehension = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, topic, difficulty, characterName } = options;
    const results: StoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const template = getRandomItems(STORY_TEMPLATES, 1)[0];
        let story = template.template.replace('{place}', getRandomItems(template.places, 1)[0]).replace(/{character}/g, characterName || getRandomItems(template.characters, 1)[0]).replace('{activity}', getRandomItems(template.activities, 1)[0]).replace('{object}', getRandomItems(template.objects, 1)[0]);
        const questions = Array.from({ length: 3 }).map(() => {
            const wordPool = story.split(' ').filter(w => w.length > 3);
            const answer = getRandomItems(wordPool, 1)[0] || "cevap";
            const options = shuffle([answer, getRandomItems(getWordsForDifficulty(difficulty, topic), 1)[0] || "yanlış1", getRandomItems(getWordsForDifficulty(difficulty, topic), 1)[0] || "yanlış2"]);
            return { question: `Hikayede geçen kelimelerden hangisi aşağıdadır?`, options, answerIndex: options.indexOf(answer) };
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