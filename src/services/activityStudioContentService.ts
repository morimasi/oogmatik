import type {
  ContentBlock,
  BlockType,
  OrchestratorResult,
} from '@/types/activityStudio';

// ─── Prompt Injection Koruma (Selin Arslan standardı) ───────────────
/**
 * Malzeme metnini sanitize eder — prompt injection kalıplarını temizler,
 * HTML etiketlerini siler ve uzunluk sınırını uygular.
 */
function sanitizeText(raw: string, maxLength: number): string {
  const cleaned = raw
    .replace(/ignore\s+(all\s+)?previous\s+instructions/gi, '')
    .replace(/you\s+are\s+now/gi, '')
    .replace(/forget\s+(your|all)\s+rules/gi, '')
    .replace(/system\s*:\s*/gi, '')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .trim();

  return cleaned.slice(0, maxLength);
}

// ─── CRUD: ContentBlock ─────────────────────────────────────────────

/**
 * Yeni bir ContentBlock oluşturur.
 */
export function createActivityBlock(input: {
  type: BlockType;
  content: string;
  pedagogicalNote?: string;
  order?: number;
  videoUrl?: string;
  imageUrl?: string;
}): ContentBlock {
  return {
    id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: input.type,
    order: input.order ?? 0,
    content: input.content,
    pedagogicalNote: input.pedagogicalNote ?? '',
    videoUrl: input.videoUrl,
    imageUrl: input.imageUrl,
  };
}

/**
 * Mevcut bir ContentBlock'u immutable olarak günceller.
 * ID korunur — değişmez.
 */
export function updateActivityBlock(
  block: ContentBlock,
  updates: Partial<Omit<ContentBlock, 'id'>>
): ContentBlock {
  return { ...block, ...updates };
}

/**
 * Bir ContentBlock'u id'sine göre listeden kaldırır.
 */
export function removeActivityBlock(blocks: ContentBlock[], id: string): ContentBlock[] {
  return blocks.filter((b) => b.id !== id);
}

// ─── OrchestratorResult → ContentBlock[] Dönüşümü ──────────────────

/**
 * AI orkestrasyon sonucundan ContentBlock dizisi çıkarır.
 *
 * Selin kuralı: `unknown` + type guard — `any` yasak.
 */
export function extractContentBlocks(
  orchestratorResult: OrchestratorResult
): { blocks: ContentBlock[]; pedagogicalNote: string } {
  const contentAgent = orchestratorResult.agentOutputs?.['content'];
  const agentNote = contentAgent?.pedagogicalNote ?? '';

  if (!contentAgent?.data) {
    return { blocks: [], pedagogicalNote: agentNote };
  }

  const rawData = contentAgent.data as Record<string, unknown>;
  if (typeof rawData !== 'object' || rawData === null) {
    return { blocks: [], pedagogicalNote: agentNote };
  }

  let rawBlocks: unknown[] = [];
  if (Array.isArray(rawData['blocks'])) {
    rawBlocks = rawData['blocks'];
  } else {
    let payload = rawData.raw;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch {}
    }
    if (typeof payload === 'object' && payload !== null && typeof (payload as Record<string, unknown>).text === 'string') {
      try { payload = JSON.parse((payload as Record<string, unknown>).text as string); } catch {}
    }
    if (typeof payload === 'object' && payload !== null && Array.isArray((payload as Record<string, unknown>)['blocks'])) {
      rawBlocks = (payload as Record<string, unknown>)['blocks'] as unknown[];
    }
  }

  const blocks: ContentBlock[] = rawBlocks.map((raw: unknown, idx: number) => {
    const item = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
    const blockNote = typeof item['pedagogicalNote'] === 'string' && item['pedagogicalNote'].trim().length > 0
      ? item['pedagogicalNote']
      : agentNote;

    return {
      id: `block_${idx}`,
      type: (typeof item['type'] === 'string' ? item['type'] : 'activity') as BlockType,
      order: idx,
      content: String(item['content'] ?? ''),
      pedagogicalNote: blockNote,
      videoUrl: typeof item['videoUrl'] === 'string' ? item['videoUrl'] : undefined,
      imageUrl: typeof item['imageUrl'] === 'string' ? item['imageUrl'] : undefined,
    };
  });

  return {
    blocks,
    pedagogicalNote: agentNote,
  };
}

// ─── Materials Sanitization (Selin: max 5 öğe, 500 karakter) ───────

/**
 * Malzeme listesini sanitize eder:
 * - Prompt injection kalıplarını temizler
 * - maxItems (varsayılan 5) öğeye sınırlar
 * - Her öğeyi maxCharPerItem (varsayılan 500) karaktere keser
 */
export function sanitizeMaterialsList(
  materials: string[],
  maxItems = 5,
  maxCharPerItem = 500
): string[] {
  return materials
    .slice(0, maxItems)
    .map((m) => sanitizeText(m, maxCharPerItem));
}
