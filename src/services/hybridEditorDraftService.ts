/**
 * hybridEditorDraftService — Hibrit Belge & Vektör Editörü için cihaz üzeri taslak.
 *
 * - Tek otomatik taslak yuvası (localStorage), kullanıcı bazlı anahtar.
 * - Boyut ve kota koruması: yazma başarısızsa arayüz yanlış "kaydedildi" demez.
 * - Bozuk/eksik kayıtlar sessizce yok sayılır (editör boş belgeyle açılır).
 *
 * Saklanan içerik `HybridDocumentSchema`'nın JSON metnidir; doğrulama
 * `parseHybridDocumentJson` ile çağıran tarafta yapılır.
 */

export interface DraftStorageMeta {
  savedAt: number;
  title: string;
  bytes: number;
}

export interface StoredHybridDraft extends DraftStorageMeta {
  json: string;
}

export type DraftWriteResult =
  | { ok: true; meta: DraftStorageMeta }
  | { ok: false; reason: 'unavailable' | 'quota' | 'too-large' | 'serialize'; message: string };

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export const DRAFT_MAX_BYTES = 4_000_000;
export const DRAFT_KEY_PREFIX = 'bdmind.hybrid.editor.draft.v1';

export const hybridDraftKey = (ownerKey?: string | null): string =>
  ownerKey ? `${DRAFT_KEY_PREFIX}:${ownerKey}` : DRAFT_KEY_PREFIX;

const resolveStorage = (override?: StorageLike | null): StorageLike | null => {
  if (override) return override;
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {
    // Gizli mod / kapalı depolama
  }
  return null;
};

const byteLength = (value: string): number => {
  try {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(value).length;
  } catch {
    // TextEncoder yoksa karakter sayısı üst sınır kabul edilir
  }
  return value.length * 2;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const readStored = (storage: StorageLike | null, key: string): StoredHybridDraft | null => {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const { json, savedAt, title, bytes } = parsed;
    if (typeof json !== 'string' || !json) return null;
    if (typeof savedAt !== 'number' || !Number.isFinite(savedAt)) return null;
    return {
      json,
      savedAt,
      title: typeof title === 'string' ? title : '',
      bytes: typeof bytes === 'number' && Number.isFinite(bytes) ? bytes : byteLength(json),
    };
  } catch {
    return null;
  }
};

/** Taslağı yazar; başarısız yazımda önceki taslak korunur. */
export const writeHybridDraft = (
  json: string,
  meta: { title?: string } = {},
  storage?: StorageLike | null,
  ownerKey?: string | null
): DraftWriteResult => {
  if (typeof json !== 'string') {
    return { ok: false, reason: 'serialize', message: 'Belge serileştirilemedi.' };
  }
  const bytes = byteLength(json);
  if (bytes > DRAFT_MAX_BYTES) {
    return {
      ok: false,
      reason: 'too-large',
      message: 'Taslak çok büyük (görselleri küçültün); bu sefer kaydedilmedi.',
    };
  }
  const target = resolveStorage(storage);
  if (!target) {
    return { ok: false, reason: 'unavailable', message: 'Cihaz deposu kullanılamıyor.' };
  }

  const result: StoredHybridDraft = {
    json,
    savedAt: Date.now(),
    title: (meta.title ?? '').slice(0, 120),
    bytes,
  };

  try {
    target.setItem(hybridDraftKey(ownerKey), JSON.stringify(result));
    return {
      ok: true,
      meta: { savedAt: result.savedAt, title: result.title, bytes: result.bytes },
    };
  } catch {
    return {
      ok: false,
      reason: 'quota',
      message: 'Depolama dolu; taslak kaydedilemedi.',
    };
  }
};

export const readHybridDraft = (
  storage?: StorageLike | null,
  ownerKey?: string | null
): StoredHybridDraft | null => {
  const target = resolveStorage(storage);
  return readStored(target, hybridDraftKey(ownerKey));
};

export const clearHybridDraft = (
  storage?: StorageLike | null,
  ownerKey?: string | null
): boolean => {
  const target = resolveStorage(storage);
  if (!target) return false;
  try {
    target.removeItem(hybridDraftKey(ownerKey));
    return true;
  } catch {
    return false;
  }
};
