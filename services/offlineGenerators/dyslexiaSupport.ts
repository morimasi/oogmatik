
import { GeneratorOptions, CodeReadingData } from '../../types';
import { getRandomInt, getRandomItems, COLORS, SHAPE_TYPES } from './helpers';

export const generateOfflineCodeReading = async (options: GeneratorOptions): Promise<CodeReadingData[]> => {
    const { worksheetCount, symbolType, codeLength, itemCount } = options;
    const len = codeLength || 4;
    const count = itemCount || 5;
    
    return Array.from({ length: worksheetCount }, () => {
        let symbols: string[] = [];
        let values: string[] = [];

        if (symbolType === 'shapes') {
            symbols = getRandomItems(SHAPE_TYPES, 5);
            values = getRandomItems(['A', 'E', 'K', 'L', 'M', '1', '2', '3'], 5);
        } else if (symbolType === 'colors') {
            const selectedColors = getRandomItems(COLORS, 5);
            symbols = selectedColors.map(c => c.css); 
            values = getRandomItems(['1', '2', '3', '4', '5'], 5);
        } else {
            // Arrows default
            symbols = ['arrow-up', 'arrow-down', 'arrow-left', 'arrow-right'];
            values = getRandomItems(['b', 'd', 'p', 'q'], 4);
        }

        // Create Key Map
        const keyMap = symbols.map((sym, i) => ({
            symbol: sym,
            value: values[i],
            color: symbolType === 'shapes' ? COLORS[i % COLORS.length].css : undefined
        }));

        // Generate Puzzles
        const codesToSolve = Array.from({ length: count }, () => {
            const sequenceIndices = Array.from({ length: len }, () => getRandomInt(0, symbols.length - 1));
            const sequence = sequenceIndices.map(i => symbols[i]);
            const answer = sequenceIndices.map(i => values[i]).join('');
            return { sequence, answer };
        });

        return {
            title: 'Kod Okuma ve Şifre Çözme (Hızlı Mod)',
            instruction: 'Sembollerin karşılıklarını tablodan bul ve kutulara yaz.',
            pedagogicalNote: 'Sembolik işlemleme, çalışma belleği ve dikkat geliştirme.',
            imagePrompt: 'Şifre',
            keyMap,
            codesToSolve
        };
    });
};

// Re-export placeholders for other offline generators if needed
export const generateOfflineReadingFlow = async (o: any) => [];
export const generateOfflineLetterDiscrimination = async (o: any) => [];
export const generateOfflineRapidNaming = async (o: any) => [];
export const generateOfflinePhonologicalAwareness = async (o: any) => [];
export const generateOfflineMirrorLetters = async (o: any) => [];
export const generateOfflineSyllableTrain = async (o: any) => [];
export const generateOfflineVisualTrackingLines = async (o: any) => [];
export const generateOfflineBackwardSpelling = async (o: any) => [];
