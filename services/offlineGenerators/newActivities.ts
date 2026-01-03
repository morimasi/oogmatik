// ... existing imports
import { getRandomInt, shuffle, getRandomItems, simpleSyllabify, getWordsForDifficulty } from './helpers';
import { SyllableWordBuilderData, GeneratorOptions } from '../../types';

export const generateOfflineSyllableWordBuilder = async (options: GeneratorOptions): Promise<SyllableWordBuilderData[]> => {
    const { worksheetCount, itemCount, difficulty, topic } = options;
    const count = itemCount || 6;
    
    return Array.from({ length: worksheetCount }, () => {
        const pool = getWordsForDifficulty(difficulty, topic);
        // Filter words to ensure they have appropriate syllable count for difficulty
        const minSyllables = difficulty === 'Başlangıç' ? 2 : (difficulty === 'Orta' ? 3 : 3);
        const filteredPool = pool.filter(w => simpleSyllabify(w).length >= minSyllables);
        
        const selectedWords = getRandomItems(filteredPool.length > 0 ? filteredPool : pool, count);
        
        const allSyllables: string[] = [];
        const words = selectedWords.map((word, i) => {
            const syllables = simpleSyllabify(word).map(s => s.toLocaleUpperCase('tr'));
            allSyllables.push(...syllables);
            return {
                id: i + 1,
                targetWord: word.toLocaleUpperCase('tr'),
                syllables,
                imagePrompt: `${word} educational illustration, white background`
            };
        });

        // Add distractors based on difficulty
        const distractorCount = difficulty === 'Zor' ? 12 : (difficulty === 'Orta' ? 6 : 0);
        const distractors = ["KA", "MA", "AL", "DE", "RE", "BA", "SU", "TA", "TE", "AN", "ER", "İZ"];
        const chosenDistractors = getRandomItems(distractors, distractorCount);

        return {
            title: "Hece Dedektifi",
            instruction: "Resimleri incele, aşağıdaki hece havuzundan doğru heceleri seçerek kelimeleri kutucuklara inşa et.",
            pedagogicalNote: "Fonolojik farkındalık, hece sentezi ve görsel tarama becerilerini geliştirir.",
            words,
            syllableBank: shuffle([...allSyllables, ...chosenDistractors])
        };
    });
};
