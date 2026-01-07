
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, HandwritingPracticeData, RealLifeProblemData, LetterVisualMatchingData, SyllableMasterLabData } from '../../types';
import { getRandomItems, shuffle, getRandomInt, TR_VOCAB, turkishAlphabet, COLORS, simpleSyllabify, getWordsForDifficulty, SHAPE_TYPES, VISUALLY_SIMILAR_CHARS, EMOJI_MAP } from './helpers';

// COMPREHENSIVE SYLLABLE MASTER LAB (OFFLINE - IMPROVED)
export const generateOfflineSyllableMasterLab = async (options: GeneratorOptions): Promise<SyllableMasterLabData[]> => {
    const { worksheetCount, difficulty, itemCount, topic, variant = 'split', case: letterCase, syllableRange = '2-3' } = options;
    const count = itemCount || 32; // Defaulted to 32 for dense layout
    
    const [minSyllables, maxSyllables] = syllableRange.split('-').map(Number);
    
    return Array.from({ length: worksheetCount }, () => {
        let pool = getWordsForDifficulty(difficulty, topic || 'animals');
        
        // Filter pool by syllable count
        const filteredPool = pool.filter(word => {
            const sylCount = simpleSyllabify(word).length;
            return sylCount >= minSyllables && sylCount <= maxSyllables;
        });

        // If filtered is too small, use more words from other categories
        let finalPool = filteredPool;
        if (finalPool.length < count) {
            Object.keys(TR_VOCAB).forEach(cat => {
                if (Array.isArray(TR_VOCAB[cat])) {
                    TR_VOCAB[cat].forEach((w: any) => {
                        const wordStr = typeof w === 'string' ? w : w.text;
                        if (wordStr) {
                             const sylCount = simpleSyllabify(wordStr).length;
                             if (sylCount >= minSyllables && sylCount <= maxSyllables) finalPool.push(wordStr);
                        }
                    });
                }
            });
        }
        
        const selection = getRandomItems([...new Set(finalPool)], count);
        
        const items = selection.map(word => {
            const syllables = simpleSyllabify(word);
            const processedWord = letterCase === 'upper' ? word.toLocaleUpperCase('tr') : word.toLocaleLowerCase('tr');
            const processedSyllables = syllables.map(s => letterCase === 'upper' ? s.toLocaleUpperCase('tr') : s.toLocaleLowerCase('tr'));
            
            return {
                word: processedWord,
                syllables: processedSyllables,
                missingIndex: variant === 'complete' ? getRandomInt(0, processedSyllables.length - 1) : undefined,
                scrambledIndices: variant === 'scrambled' ? shuffle(Array.from({length: processedSyllables.length}, (_,i)=>i)) : undefined,
                syllableCount: syllables.length
            };
        });

        const instructions: Record<string, string> = {
            split: "Kelimeleri hecelerine ayırıp kutucuklara yazın.",
            combine: "Heceleri birleştirerek anlamlı kelimeler oluşturun.",
            complete: "Eksik heceyi bularak kelimeyi tamamlayın.",
            rainbow: "Her heceyi farklı tonda okuyun (Okuma Akıcılığı).",
            scrambled: "Karışık heceleri doğru sıraya dizerek kelimeyi bulun."
        };

        return {
            title: `Hece Laboratuvarı: ${variant.toUpperCase()}`,
            instruction: instructions[variant] || "Hece çalışmasını tamamlayın.",
            pedagogicalNote: "Fonolojik farkındalık, hece sentezi ve analiz yoluyla okuma akıcılığını destekler.",
            mode: variant as any,
            items
        };
    });
};
// ... rest remains same ...
