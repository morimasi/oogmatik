
import { getRandomInt, shuffle, getRandomItems, simpleSyllabify, getWordsForDifficulty } from './helpers';
import { SyllableWordBuilderData, FamilyRelationsData, FamilyLogicTestData, GeneratorOptions } from '../../types';

export const generateOfflineFamilyRelations = async (options: GeneratorOptions): Promise<FamilyRelationsData[]> => {
    const { worksheetCount, difficulty } = options;
    
    const baseRelations = [
        { definition: "Annemin kız kardeşidir.", label: "Teyze", side: 'mom' },
        { definition: "Babamın annesidir.", label: "Babaanne", side: 'dad' },
        { definition: "Babamın kız kardeşidir.", label: "Hala", side: 'dad' },
        { definition: "Annemin annesidir.", label: "Anneanne", side: 'mom' },
        { definition: "Annemin erkek kardeşidir.", label: "Dayı", side: 'mom' },
        { definition: "Babamın erkek kardeşidir.", label: "Amca", side: 'dad' },
        { definition: "Babamın babasıdır.", label: "Dede", side: 'dad' },
        { definition: "Annemin babasıdır.", label: "Büyükbaba", side: 'mom' },
        { definition: "Amcamın karısıdır.", label: "Yenge", side: 'dad' },
        { definition: "Dayımın çocuğudur.", label: "Kuzen", side: 'mom' }
    ];

    return Array.from({ length: worksheetCount }, () => {
        const selected = shuffle(baseRelations).slice(0, 10);
        return {
            title: "Akrabalık İlişkileri",
            instruction: "Aşağıdaki tanımlarla kişileri eşleştiriniz.",
            pedagogicalNote: "Sosyal hiyerarşi algısı, sözel tanımlama ve kategorizasyon becerilerini destekler.",
            pairs: selected as any,
            momRelatives: selected.filter(s => s.side === 'mom').map(s => s.label),
            dadRelatives: selected.filter(s => s.side === 'dad').map(s => s.label),
            difficulty: difficulty || 'Orta'
        };
    });
};

export const generateOfflineFamilyLogicTest = async (options: GeneratorOptions): Promise<FamilyLogicTestData[]> => {
    const { worksheetCount, difficulty } = options;
    
    const pool = [
        { text: "Teyzem annemin akrabasıdır.", isTrue: true },
        { text: "Dedem annemden büyüktür.", isTrue: true },
        { text: "Anneannem annemin akrabası değildir.", isTrue: false },
        { text: "Babaannem benden büyüktür.", isTrue: true },
        { text: "Teyzem annemden küçük olamaz.", isTrue: false },
        { text: "Amcam babamın abisi olabilir.", isTrue: true },
        { text: "Dayım babamın kardeşidir.", isTrue: false },
        { text: "Halam ile annem kardeştir.", isTrue: false },
        { text: "Babaannem babamdan büyüktür.", isTrue: true },
        { text: "Anneannem teyzemden büyük değildir.", isTrue: false },
        { text: "Halam ve teyzem kardeştirler.", isTrue: false },
        { text: "Yengem ile benim kan bağım yoktur.", isTrue: true }
    ];

    return Array.from({ length: worksheetCount }, () => ({
        title: "Akrabalık Mantık Testi",
        instruction: "Aşağıdaki ifadeler doğru ise 'D' yanlış ise 'Y'nin bulunduğu kutucuğu işaretle.",
        pedagogicalNote: "Mantıksal çıkarım, akraba hiyerarşisi ve dikkat becerilerini geliştirir.",
        statements: shuffle(pool).slice(0, 10),
        difficulty: difficulty || 'Orta'
    }));
};

export const generateOfflineSyllableWordBuilder = async (options: GeneratorOptions): Promise<SyllableWordBuilderData[]> => {
    const { worksheetCount, itemCount, difficulty, topic } = options;
    const count = itemCount || 6;
    
    return Array.from({ length: worksheetCount }, () => {
        const pool = getWordsForDifficulty(difficulty, topic);
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
