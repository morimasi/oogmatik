
import { WorksheetData, ActivityType, StyleSettings, WorksheetBlock } from '../types';

/**
 * Sayfa Kapasite Mantığı v4.0 (Print Optimize):
 * - Blokların fiziksel 'weight' (yükseklik) değerlerine bakar
 * - Devam sayfalarına otomatik mini-header ekler
 * - Sayfa numarası ve toplam sayfa bilgisi ekler
 * - A4 ebatlarına tam oturması için taşma limitleri daraltıldı
 */

const MAX_PAGE_WEIGHT = 950; // Önceden 1100'dü, A4 tam baskıda sayfada taşmaları önlemek için 950'ye düşürüldü
const HEADER_COST = 160;   // PedagogicalHeader ortalama maliyeti (40mm)
const STUDENT_INFO_COST = 60; // Öğrenci bilgi şeridi (15mm)
const CONTINUATION_HEADER_COST = 80; // Devam sayfası mini-header maliyeti

const recursiveSafeText = (val: any): string => {
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.map(recursiveSafeText).join(' ');
    if (val && typeof val === 'object') return Object.values(val).map(recursiveSafeText).join(' ');
    return '';
};

const getBlockWeight = (block: WorksheetBlock): number => {
    const content: any = block.content || {};

    switch (block.type) {
        case 'header': return 80;
        case 'text': {
            const text = recursiveSafeText(content.text || content);
            const lines = Math.ceil(text.length / 75); // Geniş font nedeniyle 85'ten 75'e düşürdüm (daha fazla satır)
            return 25 + (lines * 28); // Ekstra padding/margin payları
        }
        case 'grid': {
            const rows = Math.ceil((content.cells?.length || 0) / (content.cols || 4));
            return 45 + (rows * 40);
        }
        case 'table': {
            const rows = (content.rows || content.data || []).length;
            return 50 + (rows * 35);
        }
        case 'image': return content.height || 300;
        case 'cloze_test': {
            const text = recursiveSafeText(content.text || '');
            const lines = Math.ceil(text.length / 70);
            return 70 + (lines * 30);
        }
        case 'categorical_sorting': return 80 + (content.categories?.length || 0) * 55;
        case 'match_columns': {
            const leftLen = (content.leftColumn || content.left || []).length;
            return 60 + leftLen * 45;
        }
        case 'visual_clue_card': return 100;
        case 'neuro_marker': return 60;
        case 'logic_card': return 160;
        case 'footer_validation': return 120;
        case 'svg_shape': return content.height || 120;
        default: return 85;
    }
};

export const paginationService = {
    process: (data: WorksheetData, activityType: ActivityType, settings?: StyleSettings): WorksheetData => {
        if (!data || !Array.isArray(data) || data.length === 0) return [];
        if (settings && settings.smartPagination === false) return data;

        const allPages: any[] = [];

        data.forEach((originalPageData) => {
            const listKey = originalPageData.blocks ? 'blocks' : (originalPageData.puzzles ? 'puzzles' : (originalPageData.operations ? 'operations' : (originalPageData.steps ? 'steps' : (originalPageData.problems ? 'problems' : (originalPageData.items ? 'items' : null)))));

            if (listKey && Array.isArray(originalPageData[listKey])) {
                let currentItems: any[] = [];
                let currentWeight = 0;
                let pageIndex = 0;

                // İlk sayfa: tam header maliyeti
                let availableWeight = MAX_PAGE_WEIGHT;

                originalPageData[listKey].forEach((item: any) => {
                    const weight = originalPageData.blocks ? getBlockWeight(item) : 10;

                    if (currentWeight + weight > availableWeight && currentItems.length > 0) {
                        allPages.push({
                            ...originalPageData,
                            [listKey]: currentItems,
                            isContinuation: pageIndex > 0,
                            pageTotalWeight: currentWeight,
                            _pageIndex: pageIndex,
                        });
                        currentItems = [];
                        currentWeight = 0;
                        pageIndex++;
                        // Devam sayfaları: mini-header maliyeti düş
                        availableWeight = MAX_PAGE_WEIGHT - CONTINUATION_HEADER_COST;
                    }
                    currentItems.push(item);
                    currentWeight += weight;
                });

                if (currentItems.length > 0) {
                    allPages.push({
                        ...originalPageData,
                        [listKey]: currentItems,
                        isContinuation: pageIndex > 0,
                        pageTotalWeight: currentWeight,
                        _pageIndex: pageIndex,
                    });
                }
            } else {
                allPages.push(originalPageData);
            }
        });

        // Toplam sayfa sayısını her sayfaya ekle + sayfa numarası
        const totalPages = allPages.length;
        allPages.forEach((page, i) => {
            page._totalPages = totalPages;
            page._currentPage = i + 1;
        });

        return allPages;
    }
};
