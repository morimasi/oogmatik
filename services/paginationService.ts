import { WorksheetData, ActivityType, StyleSettings } from '../types';

/**
 * Sayfa Kapasite Mantığı:
 * İçeriklerin sayfalara ne kadar "sıkı" yerleşeceğini belirler.
 * MAX_PAGE_WEIGHT artırıldığında sayfalar daha dolu olur.
 */

const MAX_PAGE_WEIGHT = 65; // Kapasite ciddi oranda artırıldı

const getWeight = (item: any, activityType: ActivityType): number => {
    if (!item) return 0;
    
    // Sayısal Mantık Bilmeceleri için özel ağırlık (Bir sayfaya tam 4 adet sığacak şekilde)
    if (activityType === 'NUMBER_LOGIC_RIDDLES') return 15;

    if (item.type === 'image' || item.imagePrompt || item.imageBase64) return 12;
    if (item.type === 'table') return 8 + ((item.rows?.length || 0) * 2);
    if (item.text && item.text.length > 400) return 15;
    if (item.type === 'question' && item.options) return 8;
    return 4;
};

export const paginationService = {
    process: (data: WorksheetData, activityType: ActivityType, settings?: StyleSettings): WorksheetData => {
        if (!data || !Array.isArray(data) || data.length === 0) return [];
        
        // Bu türler akışkan kalmalı, tarayıcı bölmeli
        if (activityType === 'STORY_COMPREHENSION' || activityType === 'AI_WORKSHEET_CONVERTER') return data;

        if (settings && settings.smartPagination === false) return data;

        const newPages: any[] = [];
        data.forEach((originalPageData) => {
            // Eğer veride "puzzles" veya "operations" gibi listeler varsa onları da böl
            const listKey = originalPageData.puzzles ? 'puzzles' : (originalPageData.operations ? 'operations' : null);
            
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