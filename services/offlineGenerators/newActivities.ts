
import { getRandomInt, shuffle, getRandomItems, simpleSyllabify, getWordsForDifficulty, turkishAlphabet, VISUALLY_SIMILAR_CHARS } from './helpers';
import { SyllableWordBuilderData, FamilyRelationsData, FamilyLogicTestData, GeneratorOptions, FindLetterPairData } from '../../types';

export const generateOfflineFindLetterPair = async (options: GeneratorOptions): Promise<FindLetterPairData[]> => {
    const { worksheetCount, difficulty, itemCount = 1, gridSize = 10, targetPair } = options;
    const pages: FindLetterPairData[] = [];

    const getSimilars = (char: string) => {
        const pool = VISUALLY_SIMILAR_CHARS.filter(c => c !== char);
        return pool.length > 0 ? pool : turkishAlphabet.split('');
    };

    for (let p = 0; p < worksheetCount; p++) {
        const grids = [];
        
        for (let i = 0; i < itemCount; i++) {
            const pair = (targetPair || (Math.random() > 0.5 ? 'bd' : 'pq')).toLowerCase().substring(0, 2);
            const size = gridSize || 10;
            
            // Matrisi çeldiricilerle doldur
            const matrix = Array.from({ length: size }, () => 
                Array.from({ length: size }, () => {
                    const pool = (difficulty === 'Zor' || difficulty === 'Uzman') 
                        ? getSimilars(pair[0]) 
                        : turkishAlphabet.split('');
                    return pool[getRandomInt(0, pool.length - 1)];
                })
            );

            // Hedefleri yerleştir (En az size kadar)
            const countToPlace = Math.floor(size * 1.2);
            for (let k = 0; k < countToPlace; k++) {
                const r = getRandomInt(0, size - 1);
                const c = getRandomInt(0, size - 2);
                matrix[r][c] = pair[0];
                matrix[r][c + 1] = pair[1];
            }

            grids.push({ 
                grid: matrix.map(row => row.map(cell => cell.toLocaleUpperCase('tr'))), 
                targetPair: pair.toLocaleUpperCase('tr') 
            });
        }

        pages.push({
            title: "Harf İkilisi Dedektifi",
            instruction: "Tabloları dikkatlice tara ve hedef ikilileri bulup daire içine al.",
            pedagogicalNote: "Görsel ayrıştırma, hızlı tarama ve fonolojik sentez kapasitesini ölçer.",
            grids,
            settings: { gridSize: gridSize || 10, itemCount, difficulty: difficulty || 'Orta' }
        });
    }

    return pages;
};
// ... rest of file (Family relations, etc.)
