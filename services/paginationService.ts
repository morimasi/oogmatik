
import { WorksheetData, ActivityType, StyleSettings, WorksheetBlock } from '../types';

/**
 * Sayfa Kapasite Mantığı v2.0:
 * Artık sadece item sayısına değil, blokların fiziksel 'weight' (yükseklik) değerlerine bakar.
 */

const MAX_PAGE_WEIGHT = 100; // Standart A4 kapasitesi

const getBlockWeight = (block: WorksheetBlock): number => {
    if (block.weight) return block.weight;
    
    switch(block.type) {
        case 'header': return 15;
        case 'image': return 30;
        case 'question': return 12;
        case 'grid': return 40;
        case 'text': return Math.min(40, (block.content?.length || 0) / 20);
        default: return 10;
    }
};

export const paginationService = {
    process: (data: WorksheetData, activityType: ActivityType, settings?: StyleSettings): WorksheetData => {
        if (!data || !Array.isArray(data) || data.length === 0) return [];
        if (settings && settings.smartPagination === false) return data;

        const newPages: any[] = [];

        data.forEach((originalPageData) => {
            // Eğer veride 'blocks' varsa yeni sistem, yoksa eski listelere (puzzles, operations vb.) bak
            const listKey = originalPageData.blocks ? 'blocks' : (originalPageData.puzzles ? 'puzzles' : (originalPageData.operations ? 'operations' : (originalPageData.steps ? 'steps' : (originalPageData.problems ? 'problems' : (originalPageData.items ? 'items' : null)))));
            
            if (listKey && Array.isArray(originalPageData[listKey])) {
                let currentItems: any[] = [];
                let currentWeight = 0;

                originalPageData[listKey].forEach((item: any) => {
                    // Blok ağırlığı hesapla
                    const weight = originalPageData.blocks ? getBlockWeight(item) : 10; // Fallback for old items
                    
                    if (currentWeight + weight > MAX_PAGE_WEIGHT && currentItems.length > 0) {
                        newPages.push({ 
                            ...originalPageData, 
                            [listKey]: currentItems, 
                            isContinuation: newPages.length > 0,
                            pageTotalWeight: currentWeight
                        });
                        currentItems = [];
                        currentWeight = 0;
                    }
                    currentItems.push(item);
                    currentWeight += weight;
                });

                if (currentItems.length > 0) {
                    newPages.push({ 
                        ...originalPageData, 
                        [listKey]: currentItems, 
                        isContinuation: newPages.length > 0,
                        pageTotalWeight: currentWeight
                    });
                }
            } else {
                newPages.push(originalPageData);
            }
        });

        return newPages;
    }
};
