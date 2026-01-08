
import { getRandomInt, shuffle, getRandomItems, simpleSyllabify, getWordsForDifficulty } from './helpers';
import { SyllableWordBuilderData, FamilyRelationsData, FamilyLogicTestData, GeneratorOptions } from '../../types';

export const generateOfflineFamilyRelations = async (options: GeneratorOptions): Promise<FamilyRelationsData[]> => {
    const { worksheetCount, difficulty, variant = 'mixed', familyDepth = 'extended' } = options;
    
    const basic = [
        { definition: "Beni dünyaya getiren kadındır.", label: "Anne", side: 'mom' },
        { definition: "Beni dünyaya getiren erkektir.", label: "Baba", side: 'dad' },
        { definition: "Aynı anne babadan olan kız kardeşim.", label: "Abla/Kız Kardeş", side: 'mixed' },
        { definition: "Aynı anne babadan olan erkek kardeşim.", label: "Abi/Erkek Kardeş", side: 'mixed' },
        { definition: "Babamın babasıdır.", label: "Dede", side: 'dad' },
        { definition: "Annemin annesidir.", label: "Anneanne", side: 'mom' },
    ];

    const extended = [
        { definition: "Annemin kız kardeşidir.", label: "Teyze", side: 'mom' },
        { definition: "Babamın annesidir.", label: "Babaanne", side: 'dad' },
        { definition: "Babamın kız kardeşidir.", label: "Hala", side: 'dad' },
        { definition: "Annemin erkek kardeşidir.", label: "Dayı", side: 'mom' },
        { definition: "Babamın erkek kardeşidir.", label: "Amca", side: 'dad' },
        { definition: "Teyzemin veya amcamın çocuğudur.", label: "Kuzen", side: 'mixed' }
    ];

    const expert = [
        { definition: "Amcamın veya dayımın karısıdır.", label: "Yenge", side: 'mixed' },
        { definition: "Halamın veya teyzemin kocasıdır.", label: "Enişte", side: 'mixed' },
        { definition: "Eşimin kız kardeşidir.", label: "Görümce/Baldız", side: 'mixed' },
        { definition: "Eşimin erkek kardeşidir.", label: "Kayınbirader", side: 'mixed' },
        { definition: "Kardeşimin çocuğudur.", label: "Yeğen", side: 'mixed' }
    ];

    let pool = [...basic];
    if (familyDepth === 'extended' || familyDepth === 'expert') pool = [...pool, ...extended];
    if (familyDepth === 'expert') pool = [...pool, ...expert];

    // Filter by side if not mixed
    if (variant === 'mom') pool = pool.filter(p => p.side === 'mom' || p.side === 'mixed');
    if (variant === 'dad') pool = pool.filter(p => p.side === 'dad' || p.side === 'mixed');

    return Array.from({ length: worksheetCount }, () => {
        const selected = shuffle(pool).slice(0, 10);
        return {
            title: "Akrabalık İlişkileri Atölyesi",
            instruction: "Tanımları okuyun ve yanındaki kutucuğa uygun akrabalık adını yazın.",
            pedagogicalNote: "Hiyerarşik sınıflama, sözel çıkarım ve sosyal kavram geliştirme becerilerini destekler.",
            pairs: selected as any,
            momRelatives: selected.filter(s => s.side === 'mom').map(s => s.label),
            dadRelatives: selected.filter(s => s.side === 'dad').map(s => s.label),
            difficulty: difficulty || 'Orta'
        };
    });
};

export const generateOfflineFamilyLogicTest = async (options: GeneratorOptions): Promise<FamilyLogicTestData[]> => {
    const { worksheetCount, difficulty, familyDepth = 'extended' } = options;
    
    const pool = [
        { text: "Teyzem annemin akrabasıdır.", isTrue: true },
        { text: "Dedem annemden büyüktür.", isTrue: true },
        { text: "Anneannem annemin annesidir.", isTrue: true },
        { text: "Babaannem babamın annesidir.", isTrue: true },
        { text: "Amcam babamın kardeşidir.", isTrue: true },
        { text: "Dayım babamın kardeşidir.", isTrue: false },
        { text: "Halam annemin kız kardeşidir.", isTrue: false },
        { text: "Kuzenim amcamın çocuğu olabilir.", isTrue: true },
        { text: "Yengem ile babam kardeştir.", isTrue: false },
        { text: "Eniştem halamın eşidir.", isTrue: true }
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
