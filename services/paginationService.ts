
import { WorksheetData, ActivityType, StyleSettings } from '../types';

/**
 * Sayfa Kapasite Mantığı:
 * İçeriklerin sayfalara ne kadar "sıkı" yerleşeceğini belirler.
 * MAX_PAGE_WEIGHT artırıldığında sayfalar daha dolu olur.
 */

const MAX_PAGE_WEIGHT = 52; // Slightly increased for tighter packing

const getWeight = (item: any): number => {
    if (!item) return 0;
    if (item.type === 'image' || item.imagePrompt || item.imageBase64) return 10;
    if (item.type === 'table') return 6 + ((item.rows?.length || 0) * 1.5);
    if (item.text && item.text.length > 400) return 10;
    if (item.type === 'question' && item.options) return 6;
    return 3;
};

export const paginationService = {
    process: (data: WorksheetData, activityType: ActivityType, settings?: StyleSettings): WorksheetData => {
        if (!data || !Array.isArray(data) || data.length === 0) return [];
        
        // Okuma Stüdyosu veya jenerik metin içerikleri tek bir akışkan sayfada tutulur (Browser Print pagination devralır)
        if (activityType === 'STORY_COMPREHENSION' || activityType === 'AI_WORKSHEET_CONVERTER') return data;

        if (settings && settings.smartPagination === false) return data;

        const newPages: any[] = [];
        data.forEach((originalPageData) => {
            if (originalPageData && originalPageData.sections && Array.isArray(originalPageData.sections)) {
                let currentPageSections: any[] = [];
                let currentWeight = 0;

                originalPageData.sections.forEach((section: any) => {
                    const sectionWeight = (section.content || []).reduce((acc: number, item: any) => acc + getWeight(item), 4);
                    
                    // If adding this section exceeds max weight, push current page and start a new one
                    if (currentWeight + sectionWeight > MAX_PAGE_WEIGHT && currentPageSections.length > 0) {
                        newPages.push({ ...originalPageData, sections: currentPageSections, isContinuation: newPages.length > 0 });
                        currentPageSections = [];
                        currentWeight = 0;
                    }
                    currentPageSections.push(section);
                    currentWeight += sectionWeight;
                });

                if (currentPageSections.length > 0) {
                    newPages.push({ ...originalPageData, sections: currentPageSections, isContinuation: newPages.length > 0 });
                }
            } else {
                newPages.push(originalPageData);
            }
        });

        return newPages;
    }
};
