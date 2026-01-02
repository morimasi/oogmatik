
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, HandwritingPracticeData, RealLifeProblemData, PseudowordReadingData } from '../../types';
import { getRandomItems, shuffle, getRandomInt, TR_VOCAB, turkishAlphabet, COLORS, simpleSyllabify, getWordsForDifficulty, SHAPE_TYPES, VISUALLY_SIMILAR_CHARS, EMOJI_MAP } from './helpers';

// Helper for generating pseudowords offline
const generateTurkishPseudowords = (count: number, difficulty: string): string[] => {
    const vowels = "aeıioöuü".split("");
    const consonants = "bcçdfgğhjklmnprsştvyz".split("");
    const result: string[] = [];

    for (let i = 0; i < count; i++) {
        let word = "";
        if (difficulty === 'Başlangıç') {
            // CV-CV or V-CV structure
            const h1 = consonants[getRandomInt(0, consonants.length - 1)] + vowels[getRandomInt(0, vowels.length - 1)];
            const h2 = consonants[getRandomInt(0, consonants.length - 1)] + vowels[getRandomInt(0, vowels.length - 1)];
            word = h1 + h2;
        } else if (difficulty === 'Orta') {
            // CVC-CVC structure
            const h1 = consonants[getRandomInt(0, consonants.length - 1)] + vowels[getRandomInt(0, vowels.length - 1)] + consonants[getRandomInt(0, consonants.length - 1)];
            const h2 = consonants[getRandomInt(0, consonants.length - 1)] + vowels[getRandomInt(0, vowels.length - 1)] + consonants[getRandomInt(0, consonants.length - 1)];
            word = h1 + "-" + h2;
        } else {
            // CCVC or multi-syllable complex
            const c1 = consonants[getRandomInt(0, consonants.length - 1)];
            const c2 = consonants[getRandomInt(0, consonants.length - 1)];
            const v1 = vowels[getRandomInt(0, vowels.length - 1)];
            const c3 = consonants[getRandomInt(0, consonants.length - 1)];
            word = c1 + c2 + v1 + c3 + vowels[getRandomInt(0, vowels.length - 1)] + consonants[getRandomInt(0, consonants.length - 1)];
        }
        result.push(word.toLowerCase());
    }
    return result;
};

export const generateOfflinePseudowordReading = async (options: GeneratorOptions): Promise<PseudowordReadingData[]> => {
    const { difficulty, itemCount, worksheetCount, visualMode = 'standard' } = options;
    const count = itemCount || 40;
    
    return Array.from({ length: worksheetCount }, () => ({
        title: "Sözde Kelime Okuma Seti",
        instruction: "Aşağıdaki kelimeler anlamlı değildir. Sadece seslerine odaklanarak en hızlı ve doğru şekilde oku.",
        pedagogicalNote: "Ezbere okumayı engeller, fonolojik farkındalığı ve kod çözme becerisini artırır.",
        words: generateTurkishPseudowords(count, difficulty),
        syllableType: difficulty,
        visualMode: visualMode as any,
        scoringTable: true,
        difficulty
    }));
};

// ... existing exports ...
