
import { GeneratorOptions, PatternCompletionData } from '../../types';
import { getRandomInt, shuffle } from './helpers';

export const generateOfflinePatternCompletion = async (options: GeneratorOptions): Promise<PatternCompletionData[]> => {
    const { worksheetCount, difficulty } = options;
    const size = 3; // 3x3 Matris

    return Array.from({ length: worksheetCount }, () => ({
        title: "Kafayı Çalıştır: Desen Tamamla",
        instruction: "Aşağıdaki 3x3 matriste soru işareti yerine hangi parça gelmelidir?",
        pedagogicalNote: "Görsel-mantıksal analiz ve matris tamamlama becerisini ölçer.",
        patterns: [{
            matrix: [
                ["circle", "square", "triangle"],
                ["square", "triangle", "circle"],
                ["triangle", "circle", "?"]
            ],
            options: ["circle", "square", "triangle", "star"],
            correctAnswer: "square",
            logicType: "rotation"
        } as any],
        settings: {
            difficulty: difficulty || 'Orta',
            patternType: 'geometric',
            gridSize: size
        }
    } as any));
};
