
import { WorksheetData, ActivityType, StyleSettings, WorksheetBlock } from '../types';

/**
 * Sayfa Kapasite Mantığı v2.0:
 * Artık sadece item sayısına değil, blokların fiziksel 'weight' (yükseklik) değerlerine bakar.
 */

const MAX_PAGE_WEIGHT = 1188; // 297mm * 4 (A4 Tam Boy)
const HEADER_COST = 160;   // PedagogicalHeader ortalama maliyeti (40mm)
const STUDENT_INFO_COST = 60; // Öğrenci bilgi şeridi (15mm)

const recursiveSafeText = (val: any): string => {
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.map(recursiveSafeText).join(' ');
    if (val && typeof val === 'object') return Object.values(val).map(recursiveSafeText).join(' ');
    return '';
};

const getBlockWeight = (block: WorksheetBlock): number => {
    const content: any = block.content || {};

    switch (block.type) {
        case 'header': return 60;
        case 'text': {
            const text = recursiveSafeText(content.text || content);
            const lines = Math.ceil(text.length / 85);
            return 15 + (lines * 22);
        }
        case 'grid': {
            const rows = Math.ceil((content.cells?.length || 0) / (content.cols || 4));
            return 35 + (rows * 32);
        }
        case 'table': {
            const rows = (content.rows || content.data || []).length;
            return 40 + (rows * 28);
        }
        case 'image': return content.height || 260;
        case 'cloze_test': {
            const text = recursiveSafeText(content.text || '');
            const lines = Math.ceil(text.length / 80);
            return 60 + (lines * 24);
        }
        case 'categorical_sorting': return 60 + (content.categories?.length || 0) * 45;
        case 'match_columns': {
            const leftLen = (content.leftColumn || content.left || []).length;
            return 50 + leftLen * 35;
        }
        case 'visual_clue_card': return 80;
        case 'neuro_marker': return 45;
        case 'logic_card': return 140;
        case 'footer_validation': return 100;
        case 'svg_shape': return content.height || 100;
        default: return 70;
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
