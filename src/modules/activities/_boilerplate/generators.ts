import { GeneratorOptions } from '../../../types/core';
import { BoilerplateData, BoilerplateItem } from './types';

/**
 * Boilerplate — AI (Derin) Üretici
 * Gemini API ile zenginleştirilmiş içerik üretir.
 */
export const generateBoilerplateFromAI = async (options: GeneratorOptions): Promise<BoilerplateData> => {
    // TODO: generateWithSchema çağrısı eklenecek
    return generateBoilerplateOffline(options);
};

/**
 * Boilerplate — Offline (Hızlı) Üretici
 * Algoritmik olarak içerik üretir, AI gerektirmez.
 */
export const generateBoilerplateOffline = async (options: GeneratorOptions): Promise<BoilerplateData> => {
    const { difficulty = 'Orta', count = 8 } = options;

    const countMap: Record<string, number> = { 'Kolay': 6, 'Orta': 8, 'Zor': 12 };
    const itemCount = countMap[difficulty as string] ?? count;

    const items: BoilerplateItem[] = Array.from({ length: itemCount }, (_, i) => ({
        id: `item-${i + 1}`,
        content: `Örnek içerik ${i + 1}`,
        isCorrect: i % 2 === 0,
        visualHint: '💡',
    }));

    return {
        instruction: 'Aşağıdaki etkinliği tamamlayın.',
        items,
        pedagogicalNote: 'Bu etkinlik temel becerileri hedefler. Çocuğun dikkat süresine göre mola verin.',
        difficulty: difficulty as BoilerplateData['difficulty'],
        totalItems: items.length,
    };
};
