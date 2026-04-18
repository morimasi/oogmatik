
import { WorksheetData, ActivityType, StyleSettings, WorksheetBlock } from '../types';

/**
 * Sayfa Kapasite Mantığı v3.0:
 * - Blokların fiziksel 'weight' (yükseklik) değerlerine bakar
 * - Devam sayfalarına otomatik mini-header ekler
 * - Sayfa numarası ve toplam sayfa bilgisi ekler
 */

const MAX_PAGE_WEIGHT = 1100; // A4 yüksekliğinin güvenli kullanılabilir alanı (header+footer marjları çıkarılarak)
const _HEADER_COST = 160;   // PedagogicalHeader ortalama maliyeti (40mm)
const _STUDENT_INFO_COST = 60; // Öğrenci bilgi şeridi (15mm)
const CONTINUATION_HEADER_COST = 80; // Devam sayfası mini-header maliyeti

const recursiveSafeText = (val: any): string => {
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.map(recursiveSafeText).join(' ');
    if (val && typeof val === 'object') return Object.values(val).map(recursiveSafeText).join(' ');
    return '';
};

const getBlockWeight = (block: WorksheetBlock): number => {
    const type = block.type;
    const content: any = block.content;
    if (!content) return 0;

    switch (type) {
        case 'header':
            return 80;
        case 'text': {
            const text = recursiveSafeText(content.text || content);
            const lines = Math.ceil(text.length / 75);
            return 25 + lines * 28;
        }
        case 'grid': {
            const rows = Math.ceil((content.cells?.length || 0) / (content.cols || 4));
            return 45 + rows * 40;
        }
        case 'table': {
            const rows = (content.rows || content.data || []).length;
            return 50 + rows * 35;
        }
        case 'image':
            return content.height || 300;
        case 'cloze_test': {
            const text = recursiveSafeText(content.text || '');
            const lines = Math.ceil(text.length / 70);
            return 70 + lines * 30;
        }
        case 'categorical_sorting':
            return 80 + (content.categories?.length || 0) * 55;
        case 'match_columns': {
            const leftLen = (content.leftColumn || content.left || []).length;
            return 60 + leftLen * 45;
        }
        case 'visual_clue_card':
            return 100;
        case 'neuro_marker':
            return 60;
        case 'logic_card':
            return 160;
        case 'footer_validation':
            return 120;
        case 'svg_shape':
            return content.height || 120;
        default:
            return 85;
    }
};

/**
 * Sayfa sınırını aşan blokları böler.
 */
const splitLargeBlock = (block: WorksheetBlock, maxWeight: number): WorksheetBlock[] => {
    const content: any = block.content;
    const weight = getBlockWeight(block);
    if (weight <= maxWeight) return [block];

    // TEXT BLOKLARINI CÜMLE/PARAGRAF BAZLI BÖL
    if (block.type === 'text') {
        const text = recursiveSafeText(content.text || '');
        const paragraphs = text.split(/\n+/);
        
        if (paragraphs.length > 1) {
            const result: WorksheetBlock[] = [];
            let currentText = '';
            let currentWeight = 25;

            paragraphs.forEach((p) => {
                const pWeight = Math.ceil(p.length / 75) * 28;
                if (currentWeight + pWeight > maxWeight && currentText) {
                    result.push({ ...block, content: { ...content, text: currentText.trim() } });
                    currentText = p + '\n';
                    currentWeight = 25 + pWeight;
                } else {
                    currentText += p + '\n';
                    currentWeight += pWeight;
                }
            });
            
            if (currentText) {
                result.push({ ...block, content: { ...content, text: currentText.trim(), isContinuation: true } });
            }
            return result;
        }

        // Tek paragraf ise cümle bazlı böl
        const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [text];
        if (sentences.length >= 2) {
            const result: WorksheetBlock[] = [];
            let currentText = '';
            let currentWeight = 25;

            sentences.forEach((s) => {
                const sWeight = Math.ceil(s.length / 75) * 28;
                if (currentWeight + sWeight > maxWeight && currentText) {
                    result.push({ ...block, content: { ...content, text: currentText.trim() } });
                    currentText = s + ' ';
                    currentWeight = 25 + sWeight;
                } else {
                    currentText += s + ' ';
                    currentWeight += sWeight;
                }
            });

            if (currentText) {
                result.push({ ...block, content: { ...content, text: currentText.trim(), isContinuation: true } });
            }
            return result;
        }
    }

    // CLOZE TEST BÖLME
    if (block.type === 'cloze_test') {
        const text = recursiveSafeText(content.text || '');
        const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [text];
        if (sentences.length >= 2) {
            const mid = Math.ceil(sentences.length / 2);
            return [
                { ...block, content: { ...content, text: sentences.slice(0, mid).join(' ').trim() } },
                {
                    ...block,
                    content: {
                        ...content,
                        text: sentences.slice(mid).join(' ').trim(),
                        isContinuation: true,
                    },
                },
            ];
        }
    }

    return [block];
};

export const paginationService = {
    process: (data: WorksheetData, activityType: ActivityType, settings?: StyleSettings): WorksheetData => {
        if (!data || !Array.isArray(data) || data.length === 0) return [];
        if (settings && settings.smartPagination === false) return data;

        const pages: any[] = [];
        let currentItems: any[] = [];
        let currentWeight = 0;
        let pageIndex = 0;
        const originalPageTemplate = data[0] || {};

        // Veriyi bir düz listeye aç (bölme işlemiyle beraber)
        const rawItems: any[] = [];
        data.forEach(page => {
            const listKey = page.blocks ? 'blocks' : (page.puzzles ? 'puzzles' : (page.operations ? 'operations' : (page.steps ? 'steps' : (page.problems ? 'problems' : (page.items ? 'items' : null)))));
            if (listKey && Array.isArray(page[listKey])) {
                page[listKey].forEach((item: any) => {
                    const weight = page.blocks ? getBlockWeight(item) : 70;
                    if (weight > MAX_PAGE_WEIGHT - CONTINUATION_HEADER_COST) {
                        const splitBlocks = splitLargeBlock(item, MAX_PAGE_WEIGHT - CONTINUATION_HEADER_COST);
                        rawItems.push(...splitBlocks);
                    } else {
                        rawItems.push(item);
                    }
                });
            } else {
                rawItems.push(page);
            }
        });

        // Orijinal veri anahtarını tespit et
        let targetKey = 'blocks';
        for (const page of data) {
            const listKey = page.blocks ? 'blocks' : (page.puzzles ? 'puzzles' : (page.operations ? 'operations' : (page.steps ? 'steps' : (page.problems ? 'problems' : (page.items ? 'items' : null)))));
            if (listKey) {
                targetKey = listKey;
                break;
            }
        }

        rawItems.forEach((item) => {
            const weight = getBlockWeight(item);
            const limit = pageIndex === 0 ? MAX_PAGE_WEIGHT : MAX_PAGE_WEIGHT - CONTINUATION_HEADER_COST;

            if (currentWeight + weight > limit && currentItems.length > 0) {
                pages.push({
                    ...originalPageTemplate,
                    [targetKey]: [...currentItems],
                    isContinuation: pageIndex > 0,
                    _pageIndex: pageIndex,
                });
                currentItems = [];
                currentWeight = 0;
                pageIndex++;
            }
            currentItems.push(item);
            currentWeight += weight;
        });

        if (currentItems.length > 0) {
            pages.push({
                ...originalPageTemplate,
                [targetKey]: currentItems,
                isContinuation: pageIndex > 0,
                _pageIndex: pageIndex,
            });
        }


        const totalPages = pages.length;
        pages.forEach((page, i) => {
            page._totalPages = totalPages;
            page._currentPage = i + 1;
        });

        return pages;
    }
};

