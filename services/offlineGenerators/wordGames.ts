
import { GeneratorOptions, HiddenPasswordGridData, WordSearchData } from '../../types';
import { getWordsForDifficulty, getRandomItems, turkishAlphabet, getRandomInt, shuffle } from './helpers';

// Directions: [dx, dy]
const DIR_RIGHT = { x: 1, y: 0 };
const DIR_DOWN = { x: 0, y: 1 };
const DIR_DIAG_DR = { x: 1, y: 1 }; // Diagonal Down-Right
const DIR_DIAG_UR = { x: 1, y: -1 }; // Diagonal Up-Right

// Backwards (Hard mode only)
const DIR_LEFT = { x: -1, y: 0 };
const DIR_UP = { x: 0, y: -1 };
const DIR_DIAG_UL = { x: -1, y: -1 };
const DIR_DIAG_DL = { x: -1, y: 1 };

export const generateOfflineHiddenPasswordGrid = async (options: GeneratorOptions): Promise<HiddenPasswordGridData[]> => {
    // ... (HiddenPasswordGrid mantığı şimdilik aynı kalabilir, sadece kare kullanıyor olabilir, ileride güncellenebilir)
    const { topic, difficulty, worksheetCount, gridSize = 5, itemCount = 6, case: letterCase } = options;
    const results: HiddenPasswordGridData[] = [];
    
    for (let p = 0; p < worksheetCount; p++) {
        const grids = [];
        const words = getWordsForDifficulty(difficulty, topic || 'Rastgele');
        
        for (let i = 0; i < itemCount; i++) {
            const word = getRandomItems(words, 1)[0];
            let distractor = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)];
            while (word.includes(distractor)) {
                distractor = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)];
            }

            const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(distractor));
            const positions = new Set<number>();
            while (positions.size < word.length) {
                positions.add(getRandomInt(0, gridSize * gridSize - 1));
            }
            const sortedPos = Array.from(positions).sort((a, b) => a - b);
            
            sortedPos.forEach((pos, idx) => {
                const r = Math.floor(pos / gridSize);
                const c = pos % gridSize;
                grid[r][c] = word[idx];
            });

            const finalGrid = grid.map(row => row.map(char => letterCase === 'lower' ? char.toLocaleLowerCase('tr') : char.toLocaleUpperCase('tr')));
            const finalTarget = letterCase === 'lower' ? distractor.toLocaleLowerCase('tr') : distractor.toLocaleUpperCase('tr');
            const finalWord = letterCase === 'lower' ? word.toLocaleLowerCase('tr') : word.toLocaleUpperCase('tr');

            grids.push({
                targetLetter: finalTarget,
                hiddenWord: finalWord,
                grid: finalGrid
            });
        }

        results.push({
            title: "Gizli Şifre Matrisi",
            instruction: "Kutuların içindeki farklı harfleri sırasıyla bularak gizli kelimeyi oluştur.",
            pedagogicalNote: "Seçici dikkat ve görsel tarama becerisi.",
            settings: {
                gridSize,
                itemCount,
                cellStyle: (options.variant as 'square' | 'minimal' | 'rounded') || 'square',
                letterCase: letterCase || 'upper'
            },
            grids
        });
    }
    return results;
};

export const generateOfflineWordSearch = async (options: GeneratorOptions): Promise<WordSearchData[]> => {
    const { topic, difficulty, worksheetCount, itemCount = 10, case: letterCase } = options;
    
    // Satır ve Sütun ayrımı
    const rows = options.gridRows || options.gridSize || 12;
    const cols = options.gridCols || options.gridSize || 12;

    const results: WordSearchData[] = [];

    // 1. Configure Directions based on Difficulty
    let allowedDirections = [DIR_RIGHT, DIR_DOWN]; // Başlangıç
    
    if (difficulty === 'Orta') {
        allowedDirections = [DIR_RIGHT, DIR_DOWN, DIR_DIAG_DR];
    } else if (difficulty === 'Zor' || difficulty === 'Uzman') {
        allowedDirections = [DIR_RIGHT, DIR_DOWN, DIR_DIAG_DR, DIR_DIAG_UR, DIR_LEFT, DIR_UP];
    }

    for (let p = 0; p < worksheetCount; p++) {
        // 2. Fetch and Prepare Words
        // Max kelime uzunluğu, grid'in en büyük boyutunu geçemez
        const maxDim = Math.max(rows, cols);
        
        let wordPool = getWordsForDifficulty(difficulty, topic || 'Rastgele')
            .filter(w => w.length <= maxDim && w.length >= 3)
            .map(w => letterCase === 'lower' ? w.toLocaleLowerCase('tr') : w.toLocaleUpperCase('tr'));
        
        // Ensure we have enough words
        if (wordPool.length < itemCount) {
            wordPool = [...wordPool, ...getWordsForDifficulty('Orta', 'Rastgele').map(w => letterCase === 'lower' ? w.toLocaleLowerCase('tr') : w.toLocaleUpperCase('tr'))];
        }
        
        const selectedWords = getRandomItems([...new Set(wordPool)], itemCount).sort((a, b) => b.length - a.length);
        
        // 3. Grid Initialization
        const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(''));
        const placedWords: string[] = [];
        
        // 4. Word Placement Algorithm
        for (const word of selectedWords) {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 150) {
                const dir = allowedDirections[getRandomInt(0, allowedDirections.length - 1)];
                const startRow = getRandomInt(0, rows - 1);
                const startCol = getRandomInt(0, cols - 1);
                
                // Calculate end position
                const endRow = startRow + dir.y * (word.length - 1);
                const endCol = startCol + dir.x * (word.length - 1);
                
                // Check Bounds
                if (endRow >= 0 && endRow < rows && endCol >= 0 && endCol < cols) {
                    let canPlace = true;
                    // Check Collisions
                    for (let i = 0; i < word.length; i++) {
                        const r = startRow + dir.y * i;
                        const c = startCol + dir.x * i;
                        const cellChar = grid[r][c];
                        if (cellChar !== '' && cellChar !== word[i]) {
                            canPlace = false;
                            break;
                        }
                    }
                    
                    if (canPlace) {
                        for (let i = 0; i < word.length; i++) {
                            grid[startRow + dir.y * i][startCol + dir.x * i] = word[i];
                        }
                        placedWords.push(word);
                        placed = true;
                    }
                }
                attempts++;
            }
        }
        
        // 5. Fill Empty Spaces with Distractors
        const alphabet = turkishAlphabet.split('').map(c => letterCase === 'lower' ? c : c.toUpperCase());
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === '') {
                    grid[r][c] = alphabet[getRandomInt(0, alphabet.length - 1)];
                }
            }
        }

        results.push({
            title: `Kelime Avı: ${topic || 'Karışık'}`,
            instruction: "Listelenen kelimeleri bulmaca içinde bularak üzerini çiz.",
            pedagogicalNote: "Görsel tarama, şekil-zemin algısı ve kelime tanıma.",
            grid,
            words: placedWords
        });
    }
    return results;
};
