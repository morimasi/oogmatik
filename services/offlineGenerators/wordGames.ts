
import { GeneratorOptions, HiddenPasswordGridData } from '../../types';
import { getWordsForDifficulty, getRandomItems, turkishAlphabet } from './helpers';

// Added missing types and imports for HiddenPasswordGrid generator
export const generateOfflineHiddenPasswordGrid = async (options: GeneratorOptions): Promise<HiddenPasswordGridData[]> => {
    const { topic, difficulty, worksheetCount, gridSize = 5, itemCount = 9, case: letterCase } = options;
    const results: HiddenPasswordGridData[] = [];

    const wordPool = getWordsForDifficulty(difficulty, topic || 'Rastgele').filter(w => w.length >= 3 && w.length <= gridSize + 2);

    for (let i = 0; i < worksheetCount; i++) {
        const grids = [];
        const selectedWords = getRandomItems(wordPool, itemCount);

        for (const word of selectedWords) {
            let processedWord = letterCase === 'upper' ? word.toLocaleUpperCase('tr') : word.toLocaleLowerCase('tr');
            
            const alphabet = turkishAlphabet.toLocaleUpperCase('tr').split('');
            const potentialTargets = alphabet.filter(l => !processedWord.toUpperCase().includes(l));
            let targetLetter = getRandomItems(potentialTargets, 1)[0];
            if (letterCase === 'lower') targetLetter = targetLetter.toLocaleLowerCase('tr');

            const totalCells = gridSize * gridSize;
            const matrix = Array.from({ length: gridSize }, () => Array(gridSize).fill(targetLetter));
            
            // Random but ordered positions
            const availablePositions = Array.from({ length: totalCells }, (_, i) => i);
            const wordPositions = getRandomItems(availablePositions, processedWord.length).sort((a, b) => a - b);
            
            wordPositions.forEach((pos, idx) => {
                const r = Math.floor(pos / gridSize);
                const c = pos % gridSize;
                matrix[r][c] = processedWord[idx];
            });

            grids.push({ targetLetter, hiddenWord: processedWord, grid: matrix });
        }

        results.push({
            title: 'Gizli Şifre Matrisi',
            instruction: 'Daire içindeki harfleri kutularda karalayınız. Kalan harfleri sırasıyla yazıp şifreyi bulun.',
            pedagogicalNote: 'Görsel tarama ve seçici dikkat becerilerini geliştirir.',
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
