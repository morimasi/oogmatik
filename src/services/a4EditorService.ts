import type { SingleWorksheetData, WorksheetBlock, WorksheetData } from '../types';

/**
 * a4EditorService — A4 Tasarımcısı saf veri işlemleri.
 *
 * Tüm fonksiyonlar immutable çalışır: verilen WorksheetData dizisini
 * değiştirmez, yeni bir dizi döndürür. Panel, araç çubuğu ve sayfa üzerindeki
 * hızlı işlemler (çoğalt / sil / gizle / kilitle / sırala) bu katmanı kullanır;
 * böylece canlı önizleme, kayıt ve çıktı aynı veriyi paylaşır.
 */

export type BlockStylePatch = Partial<NonNullable<WorksheetBlock['style']>>;

export interface BlockEntry {
  pageIndex: number;
  index: number;
  block: WorksheetBlock;
}

const normalize = (data: WorksheetData): SingleWorksheetData[] =>
  Array.isArray(data) ? data.filter((page): page is SingleWorksheetData => !!page && typeof page === 'object') : [];

const restore = (original: WorksheetData, pages: SingleWorksheetData[]): WorksheetData =>
  Array.isArray(original) ? pages : null;

export const cloneValue = <T,>(value: T): T => {
  if (value === null || typeof value !== 'object') return value;
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // fall through to JSON clone
    }
  }
  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return value;
  }
};

export const getPageBlocks = (page: SingleWorksheetData): WorksheetBlock[] => {
  if (Array.isArray(page.layoutArchitecture?.blocks)) return page.layoutArchitecture.blocks;
  if (Array.isArray(page.blocks)) return page.blocks;
  return [];
};

export const pageSupportsBlocks = (page: SingleWorksheetData): boolean =>
  !!page.layoutArchitecture || Array.isArray(page.blocks);

export const withPageBlocks = (
  page: SingleWorksheetData,
  blocks: WorksheetBlock[]
): SingleWorksheetData => {
  if (page.layoutArchitecture) {
    return { ...page, layoutArchitecture: { ...page.layoutArchitecture, blocks } };
  }
  if (Array.isArray(page.blocks)) {
    return { ...page, blocks };
  }
  return page;
};

export const flattenBlocks = (data: WorksheetData): BlockEntry[] =>
  normalize(data).flatMap((page, pageIndex) =>
    getPageBlocks(page).map((block, index) => ({ pageIndex, index, block }))
  );

export const findBlock = (data: WorksheetData, blockId: string): BlockEntry | null =>
  flattenBlocks(data).find((entry) => entry.block.id === blockId) ?? null;

const mapBlockPages = (
  data: WorksheetData,
  ids: string[],
  updater: (blocks: WorksheetBlock[]) => WorksheetBlock[]
): WorksheetData => {
  const pages = normalize(data);
  if (!pages.length || !ids.length) return data;
  const idSet = new Set(ids);

  const nextPages = pages.map((page) => {
    const blocks = getPageBlocks(page);
    if (!blocks.some((block) => block.id && idSet.has(block.id))) return page;
    return withPageBlocks(page, updater(blocks));
  });

  return restore(data, nextPages);
};

export const updateBlockStyle = (
  data: WorksheetData,
  ids: string[],
  patch: BlockStylePatch
): WorksheetData =>
  mapBlockPages(data, ids, (blocks) =>
    blocks.map((block) =>
      block.id && ids.includes(block.id)
        ? { ...block, style: { ...(block.style ?? {}), ...patch } }
        : block
    )
  );

export const resetBlockStyle = (data: WorksheetData, ids: string[]): WorksheetData =>
  mapBlockPages(data, ids, (blocks) =>
    blocks.map((block) =>
      block.id && ids.includes(block.id) ? { ...block, style: undefined } : block
    )
  );

export const replaceBlockContent = (
  data: WorksheetData,
  blockId: string,
  content: Record<string, unknown>
): WorksheetData =>
  mapBlockPages(data, [blockId], (blocks) =>
    blocks.map((block) => (block.id === blockId ? { ...block, content } : block))
  );

export const updateBlockContent = (
  data: WorksheetData,
  blockId: string,
  patch: Record<string, unknown>
): WorksheetData =>
  mapBlockPages(data, [blockId], (blocks) =>
    blocks.map((block) => {
      if (block.id !== blockId) return block;
      const current =
        block.content && typeof block.content === 'object' && !Array.isArray(block.content)
          ? (block.content as Record<string, unknown>)
          : { text: block.content ?? '' };
      return { ...block, content: { ...current, ...patch } };
    })
  );

export type BlockMetaPatch = Pick<
  WorksheetBlock,
  'answerText' | 'reviewComment' | 'reviewResolved' | 'pedagogicalNote'
>;

/**
 * Blok üst verisini (cevap anahtarı, inceleme notu, pedagojik not) günceller.
 * İçerik ve stil dokunulmaz; pedagojik not asla silinmez (undefined ile de korunur).
 */
export const updateBlockMeta = (
  data: WorksheetData,
  blockId: string,
  patch: BlockMetaPatch
): WorksheetData => {
  const safePatch: BlockMetaPatch = { ...patch };
  if (safePatch.pedagogicalNote === undefined) delete safePatch.pedagogicalNote;
  if (safePatch.pedagogicalNote === '') delete safePatch.pedagogicalNote;

  return mapBlockPages(data, [blockId], (blocks) =>
    blocks.map((block) => (block.id === blockId ? { ...block, ...safePatch } : block))
  );
};

export const updateBlockFlags = (
  data: WorksheetData,
  ids: string[],
  flags: { hidden?: boolean; locked?: boolean }
): WorksheetData =>
  mapBlockPages(data, ids, (blocks) =>
    blocks.map((block) => (block.id && ids.includes(block.id) ? { ...block, ...flags } : block))
  );

export const createBlock = (
  type: WorksheetBlock['type'],
  content: Record<string, unknown>,
  style?: BlockStylePatch
): WorksheetBlock => {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `block_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return { id, type, content, style };
};

export const addBlock = (
  data: WorksheetData,
  block: WorksheetBlock,
  afterId?: string | null
): WorksheetData => {
  const pages = normalize(data);
  if (!pages.length) return data;

  const targetIndex = (() => {
    if (afterId) {
      const entry = flattenBlocks(data).find((item) => item.block.id === afterId);
      if (entry) return entry.pageIndex;
    }
    const firstBlockPage = pages.findIndex((page) => pageSupportsBlocks(page));
    return firstBlockPage === -1 ? 0 : firstBlockPage;
  })();

  const target = pages[targetIndex];
  if (!pageSupportsBlocks(target)) return data;

  const blocks = getPageBlocks(target);
  const insertAfter = afterId ? blocks.findIndex((item) => item.id === afterId) : -1;
  const nextBlocks = [...blocks];
  nextBlocks.splice(insertAfter >= 0 ? insertAfter + 1 : nextBlocks.length, 0, block);

  const nextPages = pages.map((page, index) =>
    index === targetIndex ? withPageBlocks(page, nextBlocks) : page
  );
  return restore(data, nextPages);
};

export const duplicateBlocks = (data: WorksheetData, ids: string[]): WorksheetData =>
  mapBlockPages(data, ids, (blocks) => {
    const nextBlocks: WorksheetBlock[] = [];
    blocks.forEach((block) => {
      nextBlocks.push(block);
      if (block.id && ids.includes(block.id)) {
        nextBlocks.push({
          ...block,
          id: createBlock(block.type, {}).id,
          content: cloneValue(block.content),
          style: block.style ? { ...block.style } : undefined,
        });
      }
    });
    return nextBlocks;
  });

export const removeBlocks = (data: WorksheetData, ids: string[]): WorksheetData =>
  mapBlockPages(data, ids, (blocks) => blocks.filter((block) => !block.id || !ids.includes(block.id)));

export const reorderBlocks = (
  data: WorksheetData,
  activeId: string,
  overId: string
): WorksheetData => {
  if (activeId === overId) return data;
  const entry = findBlock(data, activeId);
  const overEntry = findBlock(data, overId);
  if (!entry || !overEntry) return data;

  const pages = normalize(data);
  if (entry.pageIndex !== overEntry.pageIndex) {
    // Sayfalar arası taşıma: kaynak sayfadan çıkar, hedef sayfada hedefin önüne ekle.
    const moved = entry.block;
    const sourcePage = pages[entry.pageIndex];
    const targetPage = pages[overEntry.pageIndex];
    const sourceBlocks = getPageBlocks(sourcePage).filter((block) => block.id !== activeId);
    const targetBlocks = [...getPageBlocks(targetPage)];
    const targetPos = targetBlocks.findIndex((block) => block.id === overId);
    targetBlocks.splice(targetPos >= 0 ? targetPos : targetBlocks.length, 0, moved);

    const nextPages = pages.map((page, index) => {
      if (index === entry.pageIndex) return withPageBlocks(page, sourceBlocks);
      if (index === overEntry.pageIndex) return withPageBlocks(page, targetBlocks);
      return page;
    });
    return restore(data, nextPages);
  }

  const nextPages = pages.map((page, index) => {
    if (index !== entry.pageIndex) return page;
    const blocks = [...getPageBlocks(page)];
    const from = blocks.findIndex((block) => block.id === activeId);
    const to = blocks.findIndex((block) => block.id === overId);
    if (from < 0 || to < 0) return page;
    const [moved] = blocks.splice(from, 1);
    blocks.splice(to, 0, moved);
    return withPageBlocks(page, blocks);
  });
  return restore(data, nextPages);
};

export const moveBlocks = (data: WorksheetData, ids: string[], delta: -1 | 1): WorksheetData =>
  mapBlockPages(data, ids, (blocks) => {
    const next = [...blocks];
    const order = [...next.keys()];
    if (delta > 0) order.reverse();
    order.forEach((index) => {
      const block = next[index];
      if (!block?.id || !ids.includes(block.id)) return;
      const target = index + delta;
      if (target < 0 || target >= next.length) return;
      if (next[target]?.id && ids.includes(next[target].id as string)) return;
      [next[index], next[target]] = [next[target], next[index]];
    });
    return next;
  });

export const applyLayoutSettings = (
  data: WorksheetData,
  patch: { cols?: number; gap?: number }
): WorksheetData => {
  const pages = normalize(data);
  if (!pages.length) return data;
  const nextPages = pages.map((page) =>
    page.layoutArchitecture
      ? { ...page, layoutArchitecture: { ...page.layoutArchitecture, ...patch } }
      : page
  );
  return restore(data, nextPages);
};

export const allBlockIds = (data: WorksheetData): string[] =>
  flattenBlocks(data)
    .map((entry) => entry.block.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

export const copyBlockStyle = (
  data: WorksheetData,
  blockId: string
): NonNullable<WorksheetBlock['style']> | null => {
  const entry = findBlock(data, blockId);
  return entry?.block.style ? { ...entry.block.style } : null;
};

export const blockTypeLabel = (type: WorksheetBlock['type'] | string): string => {
  const labels: Record<string, string> = {
    header: 'Başlık',
    text: 'Metin',
    grid: 'Izgara',
    table: 'Tablo',
    svg_shape: 'Şekil',
    dual_column: 'İki Kolon',
    image: 'Görsel',
    question: 'Soru',
    logic_card: 'Mantık Kartı',
    footer_validation: 'Doğrulama',
    cloze_test: 'Boşluk Doldurma',
    categorical_sorting: 'Gruplama',
    match_columns: 'Eşleştirme',
    visual_clue_card: 'İpucu Kartı',
    neuro_marker: 'Nöro İşaret',
  };
  return labels[String(type)] ?? String(type);
};

export const blockTypeIcon = (type: WorksheetBlock['type'] | string): string => {
  const icons: Record<string, string> = {
    header: 'fa-heading',
    text: 'fa-align-left',
    grid: 'fa-border-all',
    table: 'fa-table',
    svg_shape: 'fa-shapes',
    dual_column: 'fa-columns',
    image: 'fa-image',
    question: 'fa-circle-question',
    logic_card: 'fa-lightbulb',
    footer_validation: 'fa-clipboard-check',
    cloze_test: 'fa-pen-nib',
    categorical_sorting: 'fa-layer-group',
    match_columns: 'fa-arrows-left-right',
    visual_clue_card: 'fa-comment-dots',
    neuro_marker: 'fa-crosshairs',
  };
  return icons[String(type)] ?? 'fa-cube';
};

export const blockPreview = (block: WorksheetBlock): string => {
  const content =
    block.content && typeof block.content === 'object' && !Array.isArray(block.content)
      ? (block.content as Record<string, unknown>)
      : { text: block.content };
  const raw =
    (typeof content.text === 'string' && content.text) ||
    (typeof content.answer === 'string' && content.answer) ||
    (Array.isArray(content.items) && content.items.length ? String(content.items.length) + ' öğe' : '') ||
    (Array.isArray(content.rows) && content.rows.length ? String(content.rows.length) + ' satır' : '') ||
    (Array.isArray(content.options) && content.options.length
      ? String(content.options.length) + ' seçenek'
      : '');
  const text = String(raw).replace(/\s+/g, ' ').trim();
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
};
