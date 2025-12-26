
import { WorksheetData, ActivityType, StyleSettings } from '../types';

/**
 * Sayfa Kapasite Mantığı:
 * Okuma Stüdyosu içerikleri 'height: auto' ve 'print-auto-height' ile kağıda tam yayılmalı.
 */

const MAX_PAGE_WEIGHT = 48; 

const getWeight = (item: any): number => {
    if (!item) return 0;
    if (item.type === 'image' || item.imagePrompt || item.imageBase64) return 12;
    if (item.type === 'table') return 8 + ((item.rows?.length || 0) * 2);
    if (item.text && item.text.length > 400) return 12;
    return 4;
};

export const paginationService = {
    process: (data: WorksheetData, activityType: ActivityType, settings?: StyleSettings): WorksheetData => {
        if (!data || !Array.isArray(data) || data.length === 0) return [];
        
        // Okuma Stüdyosu veya jenerik metin içerikleri tek bir akışkan sayfada tutulur
        if (activityType === 'STORY_COMPREHENSION' || activityType === 'AI_WORKSHEET_CONVERTER') return data;

        if (settings && settings.smartPagination === false) return data;

        const newPages: any[] = [];
        data.forEach((originalPageData) => {
            // Sadece 'sections' yapısı olan verileri sayfalamaya çalış
            if (originalPageData && originalPageData.sections && Array.isArray(originalPageData.sections)) {
                let currentPageSections: any[] = [];
                let currentWeight = 0;

                originalPageData.sections.forEach((section: any) => {
                    const sectionWeight = (section.content || []).reduce((acc: number, item: any) => acc + getWeight(item), 5);
                    
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
                // Sections yapısı yoksa veriyi olduğu gibi bırak
                newPages.push(originalPageData);
            }
        });

        return newPages;
    }
};
