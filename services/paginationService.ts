
import { WorksheetData, ActivityType, StyleSettings } from '../types';

/**
 * Sayfa Kapasite Mantığı:
 * İçeriklerin sayfalara ne kadar "sıkı" yerleşeceğini belirler.
 * MAX_PAGE_WEIGHT artırıldığında sayfalar daha dolu olur.
 */

const MAX_PAGE_WEIGHT = 75; 

const getWeight = (item: any, activityType: ActivityType): number => {
    if (!item) return 0;
    
    // Sayısal Mantık Bilmeceleri için: Bir sayfada tam 4 tane (2x2) duracak şekilde ayarlandı
    if (activityType === ActivityType.NUMBER_LOGIC_RIDDLES) return 18;
    
    // Algoritma Üretici: Genelde tek sayfa olması istenir ama çok adımsa böler
    if (activityType === ActivityType.ALGORITHM_GENERATOR) return 12;

    // Hece Ustası: Bir sayfaya yaklaşık 32-40 tane sığmalı
    if (activityType === ActivityType.SYLLABLE_MASTER_LAB) return 1.8;
    
    // Hafıza Kartları: Kart sayısına göre ağırlık ver
    // Bir sayfaya 24-32 kart sığması için ağırlığı küçültüyoruz
    if (activityType === ActivityType.MATH_MEMORY_CARDS) return 1.8;

    if (item.type === 'image' || item.imagePrompt || item.imageBase64) return 15;
    if (item.type === 'table') return 10 + ((item.rows?.length || 0) * 2);
    if (item.text && item.text.length > 400) return 20;
    if (item.type === 'question' && item.options) return 10;
    return 5;
};

export const paginationService = {
    process: (data: WorksheetData, activityType: ActivityType, settings?: StyleSettings): WorksheetData => {
        if (!data || !Array.isArray(data) || data.length === 0) return [];
        
        // Bu türler akışkan kalmalı
        if (activityType === ActivityType.STORY_COMPREHENSION || activityType === ActivityType.AI_WORKSHEET_CONVERTER) return data;

        if (settings && settings.smartPagination === false) return data;

        const newPages: any[] = [];
        data.forEach((originalPageData) => {
            // Check cards for MathMemoryCards or items for general
            const listKey = originalPageData.cards ? 'cards' : (originalPageData.puzzles ? 'puzzles' : (originalPageData.operations ? 'operations' : (originalPageData.steps ? 'steps' : (originalPageData.problems ? 'problems' : (originalPageData.items ? 'items' : null)))));
            
            if (listKey && Array.isArray(originalPageData[listKey])) {
                let currentItems: any[] = [];
                let currentWeight = 0;

                originalPageData[listKey].forEach((item: any) => {
                    const weight = getWeight(item, activityType);
                    
                    if (currentWeight + weight > MAX_PAGE_WEIGHT && currentItems.length > 0) {
                        newPages.push({ ...originalPageData, [listKey]: currentItems, isContinuation: newPages.length > 0 });
                        currentItems = [];
                        currentWeight = 0;
                    }
                    currentItems.push(item);
                    currentWeight += weight;
                });

                if (currentItems.length > 0) {
                    newPages.push({ ...originalPageData, [listKey]: currentItems, isContinuation: newPages.length > 0 });
                }
            } else {
                newPages.push(originalPageData);
            }
        });

        return newPages;
    }
};
