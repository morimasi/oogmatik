
import { GeneratorOptions, HiddenPasswordGridData } from '../../types';
import { getWordsForDifficulty, getRandomItems, turkishAlphabet, shuffle } from './helpers';

const SIMILAR_GROUPS = [
    ['B', 'D', 'P'], ['M', 'N', 'U'], ['E', 'F', 'L'], 
    ['S', 'Ş', 'Z'], ['I', 'İ', 'L'], ['O', 'Ö', 'C']
];

export const generateOfflineHiddenPasswordGrid = async (options: GeneratorOptions): Promise<HiddenPasswordGridData[]> => {
    const { topic, difficulty, worksheetCount, gridSize = 5, itemCount = 6, case: letterCase = 'upper' } = options;
    const results: HiddenPasswordGridData[] = [];

    const isExpert = difficulty === 'Zor' || difficulty === 'Uzman';
    const targetCount = isExpert ? 3 : 1;

    // Filter words that can fit in the matrix (at least some space left for distractors)
    const maxWordLen = Math.floor((gridSize * gridSize) * 0.6);
    const wordPool = getWordsForDifficulty(difficulty, topic || 'Rastgele').filter(w => w.length >= 3 && w.length <= maxWordLen);

    for (let i = 0; i < worksheetCount; i++) {
        const grids = [];
        const selectedWords = getRandomItems(wordPool, itemCount);

        for (const word of selectedWords) {
            let processedWord = letterCase === 'upper' ? word.toLocaleUpperCase('tr') : word.toLocaleLowerCase('tr');
            
            // Choose target letters based on difficulty
            let targetLetters: string[] = [];
            if (isExpert) {
                const group = SIMILAR_GROUPS[Math.floor(Math.random() * SIMILAR_GROUPS.length)];
                targetLetters = getRandomItems(group, targetCount);
            } else {
                const alphabet = turkishAlphabet.toLocaleUpperCase('tr').split('');
                const potentialTargets = alphabet.filter(l => !processedWord.toUpperCase().includes(l));
                targetLetters = [getRandomItems(potentialTargets, 1)[0]];
            }

            if (letterCase === 'lower') {
                targetLetters = targetLetters.map(l => l.toLocaleLowerCase('tr'));
            }

            const totalCells = gridSize * gridSize;
            const matrix = Array.from({ length: gridSize }, () => 
                Array(gridSize).fill(null).map(() => targetLetters[Math.floor(Math.random() * targetLetters.length)])
            );
            
            // Random but ordered positions for hidden word to maintain visual flow (Left to Right, Top to Bottom)
            const availablePositions = Array.from({ length: totalCells }, (_, i) => i);
            const wordPositions = getRandomItems(availablePositions, processedWord.length).sort((a, b) => a - b);
            
            wordPositions.forEach((pos, idx) => {
                const r = Math.floor(pos / gridSize);
                const c = pos % gridSize;
                matrix[r][c] = processedWord[idx];
            });

            grids.push({ targetLetters, hiddenWord: processedWord, grid: matrix });
        }

        results.push({
            title: `Gizli Şifre Matrisi (${gridSize}x${gridSize})`,
            instruction: isExpert 
                ? 'Grup içindeki TÜM hedef harfleri eleyiniz. Kalan harfler gizli şifreyi oluşturur.' 
                : 'Hedef harfi kutularda karalayınız. Kalan harflerden şifreyi bulun.',
            pedagogicalNote: `Bu etkinlik ${gridSize}x${gridSize} matris üzerinde görsel tarama ve seçici dikkat becerilerini zorlar.`,
            settings: { 
                gridSize, 
                itemCount, 
                cellStyle: options.variant as any || 'square', 
                letterCase: letterCase as any || 'upper' 
            },
            grids
        });
    }
    return results;
};
