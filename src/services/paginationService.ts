import { WorksheetData, ActivityType, StyleSettings, WorksheetBlock } from '../types';

/**
 * Sayfa Kapasite Mantığı v4.0 (Akıllı Izgara & Çoklu Sayfa Motoru):
 * - Blokların fiziksel 'weight' (yükseklik) değerlerine bakar
 * - Grid, Table, MatchColumns, Text ve ClozeTest bloklarını bütünlüğü bozmadan satır/cümle bazlı böler
 * - Özel aktivite dizilerini (puzzles, operations, steps, problems, items) içerik yoğunluğuna göre tartar
 * - Devam sayfalarına otomatik mini-header ve sayfa numarası bilgisi ekler
 */

const MAX_PAGE_WEIGHT = 1080; // A4 güvenli kullanılabilir dikey alan (header+footer marjları hariç)
const CONTINUATION_HEADER_COST = 80; // Devam sayfası mini-header maliyeti

const recursiveSafeText = (val: unknown): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (Array.isArray(val)) return val.map(recursiveSafeText).join(' ');
    if (val && typeof val === 'object') return Object.values(val).map(recursiveSafeText).join(' ');
    return '';
};

const getItemWeight = (item: unknown): number => {
    if (!item || typeof item !== 'object') return 70;
    const obj = item as Record<string, unknown>;
    if (typeof obj.type === 'string' && 'content' in obj) {
        return getBlockWeight(item as WorksheetBlock);
    }
    const textLen = recursiveSafeText(obj).length;
    const hasGrid = Array.isArray(obj.grid) || Array.isArray(obj.matrix);
    const hasOptions = Array.isArray(obj.options) || Array.isArray(obj.choices);
    const base = hasGrid ? 210 : hasOptions ? 130 : 80;
    const extraLines = Math.min(6, Math.floor(textLen / 120));
    return base + extraLines * 26;
};

export const getBlockWeight = (block: WorksheetBlock): number => {
    const type = block.type;
    const content = block.content as Record<string, unknown> | undefined;
    if (!content) return 0;

    switch (type) {
        case 'header':
            return 80;
        case 'text': {
            const text = recursiveSafeText(content.text ?? content);
            const lines = Math.max(1, Math.ceil(text.length / 75));
            return 25 + lines * 28;
        }
        case 'grid': {
            const cells = Array.isArray(content.cells) ? content.cells : [];
            const cols = typeof content.cols === 'number' && content.cols > 0 ? content.cols : 4;
            const rows = Math.max(1, Math.ceil(cells.length / cols));
            return 45 + rows * 60;
        }
        case 'table': {
            const rawRows = Array.isArray(content.rows)
                ? content.rows
                : Array.isArray(content.data)
                    ? content.data
                    : [];
            return 55 + rawRows.length * 36;
        }
        case 'image':
            return typeof content.height === 'number' ? content.height : 280;
        case 'cloze_test': {
            const text = recursiveSafeText(content.text ?? '');
            const lines = Math.max(1, Math.ceil(text.length / 70));
            return 70 + lines * 30;
        }
        case 'categorical_sorting': {
            const cats = Array.isArray(content.categories) ? content.categories : [];
            return 80 + cats.length * 55;
        }
        case 'match_columns': {
            const left = Array.isArray(content.leftColumn)
                ? content.leftColumn
                : Array.isArray(content.left)
                    ? content.left
                    : [];
            return 60 + left.length * 45;
        }
        case 'visual_clue_card':
            return 100;
        case 'neuro_marker':
            return 60;
        case 'logic_card':
            return 160;
        case 'footer_validation':
            return 110;
        case 'svg_shape':
            return typeof content.height === 'number' ? content.height : 120;
        default:
            return 85;
    }
};

/**
 * Sayfa sınırını aşan blokları (metin, cloze, ızgara, tablo, eşleştirme) mantıklı sınırlarından böler.
 */
export const splitLargeBlock = (block: WorksheetBlock, maxWeight: number): WorksheetBlock[] => {
    const content = (block.content || {}) as Record<string, unknown>;
    const weight = getBlockWeight(block);
    if (weight <= maxWeight) return [block];

    // 1. GRID BLOKLARINI SATIR BÜTÜNLÜĞÜNÜ KORUYARAK BÖL (cols katları halinde)
    if (block.type === 'grid' && Array.isArray(content.cells)) {
        const cells = content.cells;
        const cols = typeof content.cols === 'number' && content.cols > 0 ? content.cols : 4;
        const rowWeight = 44;
        const headerOverhead = 45;
        const maxRowsPerChunk = Math.max(1, Math.floor((maxWeight - headerOverhead) / rowWeight));
        const cellsPerChunk = maxRowsPerChunk * cols;

        if (cells.length > cellsPerChunk) {
            const chunks: WorksheetBlock[] = [];
            for (let i = 0; i < cells.length; i += cellsPerChunk) {
                chunks.push({
                    ...block,
                    content: {
                        ...content,
                        cells: cells.slice(i, i + cellsPerChunk),
                        isContinuation: i > 0,
                    },
                });
            }
            return chunks;
        }
    }

    // 2. TABLO BLOKLARINI SATIR BAZLI BÖL (başlıkları her parçada koru)
    if (block.type === 'table') {
        const rowKey = Array.isArray(content.rows) ? 'rows' : Array.isArray(content.data) ? 'data' : null;
        if (rowKey) {
            const rows = content[rowKey] as unknown[];
            const maxRowsPerChunk = Math.max(1, Math.floor((maxWeight - 55) / 36));
            if (rows.length > maxRowsPerChunk) {
                const chunks: WorksheetBlock[] = [];
                for (let i = 0; i < rows.length; i += maxRowsPerChunk) {
                    chunks.push({
                        ...block,
                        content: {
                            ...content,
                            [rowKey]: rows.slice(i, i + maxRowsPerChunk),
                            isContinuation: i > 0,
                        },
                    });
                }
                return chunks;
            }
        }
    }

    // 3. EŞLEŞTİRME SÜTUNLARINI ÇİFTLERİ KORUYARAK BÖL
    if (block.type === 'match_columns') {
        const leftKey = Array.isArray(content.leftColumn) ? 'leftColumn' : Array.isArray(content.left) ? 'left' : null;
        const rightKey = Array.isArray(content.rightColumn) ? 'rightColumn' : Array.isArray(content.right) ? 'right' : null;
        if (leftKey && rightKey) {
            const left = content[leftKey] as unknown[];
            const right = content[rightKey] as unknown[];
            const maxPairsPerChunk = Math.max(1, Math.floor((maxWeight - 60) / 45));
            if (left.length > maxPairsPerChunk) {
                const chunks: WorksheetBlock[] = [];
                for (let i = 0; i < left.length; i += maxPairsPerChunk) {
                    chunks.push({
                        ...block,
                        content: {
                            ...content,
                            [leftKey]: left.slice(i, i + maxPairsPerChunk),
                            [rightKey]: right.slice(i, i + maxPairsPerChunk),
                            isContinuation: i > 0,
                        },
                    });
                }
                return chunks;
            }
        }
    }

    // 4. TEXT BLOKLARINI CÜMLE/PARAGRAF BAZLI BÖL
    if (block.type === 'text') {
        const text = recursiveSafeText(content.text ?? '');
        const paragraphs = text.split(/\n+/);

        if (paragraphs.length > 1) {
            const result: WorksheetBlock[] = [];
            let currentText = '';
            let currentWeight = 25;

            paragraphs.forEach((p) => {
                const pWeight = Math.ceil(p.length / 75) * 28;
                if (currentWeight + pWeight > maxWeight && currentText) {
                    result.push({ ...block, content: { ...content, text: currentText.trim(), isContinuation: result.length > 0 } });
                    currentText = p + '\n';
                    currentWeight = 25 + pWeight;
                } else {
                    currentText += p + '\n';
                    currentWeight += pWeight;
                }
            });

            if (currentText) {
                result.push({ ...block, content: { ...content, text: currentText.trim(), isContinuation: result.length > 0 } });
            }
            return result;
        }

        const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [text];
        if (sentences.length >= 2) {
            const result: WorksheetBlock[] = [];
            let currentText = '';
            let currentWeight = 25;

            sentences.forEach((s) => {
                const sWeight = Math.ceil(s.length / 75) * 28;
                if (currentWeight + sWeight > maxWeight && currentText) {
                    result.push({ ...block, content: { ...content, text: currentText.trim(), isContinuation: result.length > 0 } });
                    currentText = s + ' ';
                    currentWeight = 25 + sWeight;
                } else {
                    currentText += s + ' ';
                    currentWeight += sWeight;
                }
            });

            if (currentText) {
                result.push({ ...block, content: { ...content, text: currentText.trim(), isContinuation: result.length > 0 } });
            }
            return result;
        }
    }

    // 5. CLOZE TEST BÖLME
    if (block.type === 'cloze_test') {
        const text = recursiveSafeText(content.text ?? '');
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

const LIST_KEYS = [
    'blocks',
    'puzzles',
    'operations',
    'steps',
    'problems',
    'items',
    'questions',
    'exercises',
    'rows',
    'sentences',
    'words',
    'cards',
    'tasks',
] as const;

export const paginationService = {
    process: (data: WorksheetData, _activityType: ActivityType, settings?: StyleSettings): WorksheetData => {
        if (!data || !Array.isArray(data) || data.length === 0) return [];

        if (settings && settings.smartPagination === false) return data;

        const isAlreadyProcessed = data.length > 1 && data.every((p) => (p as Record<string, unknown>)._currentPage !== undefined);
        if (isAlreadyProcessed) return data;

        // Yatay (landscape) sayfada kullanılabilir dikey alan daha azdır.
        // Sabit 1080px varsayımı yatay çıktılarda taşmaya (yarıda kesilmeye) yol açıyordu.
        const pageWeightLimit =
            settings?.orientation === 'landscape' ? 760 : MAX_PAGE_WEIGHT;

        const pages: Record<string, unknown>[] = [];
        let currentItems: unknown[] = [];
        let currentWeight = 0;
        let pageIndex = 0;
        const originalPageTemplate: Record<string, unknown> = { ...((data[0] as Record<string, unknown>) || {}) };

        let targetKey: string = 'blocks';
        for (const page of data) {
            const pRec = page as Record<string, unknown>;
            const foundKey = LIST_KEYS.find((k) => Array.isArray(pRec[k]));
            if (foundKey) {
                targetKey = foundKey;
                break;
            }
        }

        LIST_KEYS.forEach((key) => {
            if (key !== targetKey) delete originalPageTemplate[key];
        });

        const rawItems: unknown[] = [];
        data.forEach((page) => {
            const pRec = page as Record<string, unknown>;
            const foundKey = LIST_KEYS.find((k) => Array.isArray(pRec[k]));
            if (foundKey && Array.isArray(pRec[foundKey])) {
                (pRec[foundKey] as unknown[]).forEach((item) => {
                    const weight = getItemWeight(item);
                    const safeLimit = pageWeightLimit - CONTINUATION_HEADER_COST;
                    if (foundKey === 'blocks' && weight > safeLimit) {
                        const splitBlocks = splitLargeBlock(item as WorksheetBlock, safeLimit);
                        rawItems.push(...splitBlocks);
                    } else {
                        rawItems.push(item);
                    }
                });
            } else {
                rawItems.push(page);
            }
        });

        rawItems.forEach((item) => {
            const weight = getItemWeight(item);
            const limit = pageIndex === 0 ? pageWeightLimit : pageWeightLimit - CONTINUATION_HEADER_COST;

            // Akıllı Izgara / Blok Kalan Alan Kontrolü:
            // Eğer blok tek başına sayfaya sığıyor ama mevcut sayfada yer kalmamışsa:
            if (currentWeight + weight > limit && currentItems.length > 0) {
                const remainingSpace = limit - currentWeight;
                const maybeBlock = item as WorksheetBlock;

                // A) Sığmayan blok bölünebilir ise (grid, table, text, cloze, match, questions):
                if (targetKey === 'blocks' && maybeBlock && typeof maybeBlock === 'object' && remainingSpace >= 90) {
                    const parts = splitLargeBlock(maybeBlock, remainingSpace);
                    if (parts.length > 1 && getBlockWeight(parts[0]) <= remainingSpace + 35) {
                        currentItems.push(parts[0]);
                        pages.push({
                            ...originalPageTemplate,
                            [targetKey]: [...currentItems],
                            isContinuation: pageIndex > 0,
                            _pageIndex: pageIndex,
                        });
                        currentItems = [];
                        currentWeight = 0;
                        pageIndex++;

                        parts.slice(1).forEach((restPart) => {
                            const w = getBlockWeight(restPart);
                            const nextLimit = pageWeightLimit - CONTINUATION_HEADER_COST;
                            if (currentWeight + w > nextLimit && currentItems.length > 0) {
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
                            currentItems.push(restPart);
                            currentWeight += w;
                        });
                        return;
                    }

                    // B) Sığmayan blok kesilemeyecek bir bileşen ise:
                    // Sayfada anlamlı boşluk var ve aşırı taşmıyorsa (%35'e kadar):
                    // Bloğu sonraki sayfaya fırlatıp bu sayfanın yarısını boş bırakmak YERİNE sayfaya sığdır!
                    if (remainingSpace >= 110 && weight <= remainingSpace * 1.35) {
                        const fitScale = Math.max(0.72, Math.min(0.96, Number((remainingSpace / weight).toFixed(2))));
                        const fittedBlock: WorksheetBlock = {
                            ...maybeBlock,
                            style: {
                                ...(maybeBlock.style || {}),
                                transform: `scale(${fitScale})`,
                                transformOrigin: 'top center',
                                marginBottom: 2,
                            },
                        };
                        currentItems.push(fittedBlock);
                        currentWeight += remainingSpace;
                        return;
                    }
                }

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

        return pages as unknown as WorksheetData;
    },
};
