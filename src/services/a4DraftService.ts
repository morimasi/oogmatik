import type { WorksheetBlock, WorksheetData } from '../types';

/**
 * a4DraftService — A4 Studio'nun cihaz üzerindeki kalıcı yardımcıları.
 *
 * - Adlandırılmış sürümler (localStorage, etkinlik başına 20 kayıt)
 * - Kişisel blok kütüphanesi (en fazla 30 blok)
 * - Sürüm dosyası dışa/içe aktarma (cihazlar arası taşıma)
 *
 * Tüm işlemler sessizce güvenli bozulur: depolama kapalıysa veya kota doluysa
 * arayüz çalışmaya devam eder, kullanıcıya yanlış "kaydedildi" bilgisi verilmez
 * (fonksiyonlar gerçek sonucu döndürür).
 */

const VERSION_PREFIX = 'bdmind.a4versions.v1';
const LIBRARY_KEY = 'bdmind.a4library.v1';
const MAX_VERSIONS = 20;
const MAX_LIBRARY = 30;

export interface A4VersionEntry {
  id: string;
  name: string;
  createdAt: number;
  blockCount: number;
  data: WorksheetData;
}

export interface A4SavedBlock {
  id: string;
  label: string;
  createdAt: number;
  block: WorksheetBlock;
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const resolveStorage = (override?: StorageLike | null): StorageLike | null => {
  if (override) return override;
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {
    // Gizli mod / kapalı depolama
  }
  return null;
};

const newId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `a4_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const isWorksheetData = (value: unknown): value is WorksheetData =>
  value === null ||
  (Array.isArray(value) && value.every((item) => !!item && typeof item === 'object'));

export const versionStorageKey = (activityKey: string): string =>
  `${VERSION_PREFIX}:${activityKey || 'genel'}`;

const countBlocks = (data: WorksheetData): number => {
  if (!Array.isArray(data)) return 0;
  return data.reduce((total, page) => {
    const blocks = page?.layoutArchitecture?.blocks ?? page?.blocks ?? [];
    return total + (Array.isArray(blocks) ? blocks.length : 0);
  }, 0);
};

export const loadVersions = (
  activityKey: string,
  storage?: StorageLike | null
): A4VersionEntry[] => {
  const target = resolveStorage(storage);
  if (!target) return [];
  try {
    const raw = target.getItem(versionStorageKey(activityKey));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is A4VersionEntry => {
      if (!entry || typeof entry !== 'object') return false;
      const candidate = entry as Partial<A4VersionEntry>;
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.name === 'string' &&
        typeof candidate.createdAt === 'number' &&
        isWorksheetData(candidate.data)
      );
    });
  } catch {
    return [];
  }
};

export const saveVersion = (
  activityKey: string,
  name: string,
  data: WorksheetData,
  storage?: StorageLike | null
): { versions: A4VersionEntry[]; saved: boolean } => {
  const target = resolveStorage(storage);
  const versions = loadVersions(activityKey, target);
  if (!target || !isWorksheetData(data)) return { versions, saved: false };

  const entry: A4VersionEntry = {
    id: newId(),
    name: name.trim() || `Sürüm ${versions.length + 1}`,
    createdAt: Date.now(),
    blockCount: countBlocks(data),
    data,
  };

  const next = [entry, ...versions].slice(0, MAX_VERSIONS);
  try {
    target.setItem(versionStorageKey(activityKey), JSON.stringify(next));
    return { versions: next, saved: true };
  } catch {
    return { versions, saved: false };
  }
};

export const deleteVersion = (
  activityKey: string,
  versionId: string,
  storage?: StorageLike | null
): A4VersionEntry[] => {
  const target = resolveStorage(storage);
  const versions = loadVersions(activityKey, target);
  if (!target) return versions;
  const next = versions.filter((entry) => entry.id !== versionId);
  try {
    target.setItem(versionStorageKey(activityKey), JSON.stringify(next));
  } catch {
    return versions;
  }
  return next;
};

/** Sürümleri taşınabilir JSON dosyası içeriğine çevirir. */
export const serializeVersions = (versions: A4VersionEntry[]): string =>
  JSON.stringify(
    {
      kind: 'bdmind-a4-versions',
      version: 1,
      exportedAt: new Date().toISOString(),
      versions,
    },
    null,
    2
  );

/** Dışa aktarılmış sürüm dosyasını doğrulayarak içe aktarır. */
export const parseVersionsFile = (raw: string): A4VersionEntry[] => {
  try {
    const parsed: unknown = JSON.parse(raw);
    const candidate =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as { versions?: unknown }).versions
        : parsed;
    if (!Array.isArray(candidate)) return [];
    return candidate
      .filter((entry): entry is A4VersionEntry => {
        if (!entry || typeof entry !== 'object') return false;
        const item = entry as Partial<A4VersionEntry>;
        return typeof item.name === 'string' && isWorksheetData(item.data);
      })
      .map((entry) => ({
        id: typeof entry.id === 'string' ? entry.id : newId(),
        name: entry.name || 'İçe aktarılan sürüm',
        createdAt: typeof entry.createdAt === 'number' ? entry.createdAt : Date.now(),
        blockCount: countBlocks(entry.data),
        data: entry.data,
      }));
  } catch {
    return [];
  }
};

export const importVersions = (
  activityKey: string,
  entries: A4VersionEntry[],
  storage?: StorageLike | null
): A4VersionEntry[] => {
  const target = resolveStorage(storage);
  const current = loadVersions(activityKey, target);
  if (!target || !entries.length) return current;
  const merged = [...entries, ...current].slice(0, MAX_VERSIONS);
  try {
    target.setItem(versionStorageKey(activityKey), JSON.stringify(merged));
    return merged;
  } catch {
    return current;
  }
};

/* ------------------------------ Blok kütüphanesi ----------------------------- */

export const loadBlockLibrary = (storage?: StorageLike | null): A4SavedBlock[] => {
  const target = resolveStorage(storage);
  if (!target) return [];
  try {
    const raw = target.getItem(LIBRARY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is A4SavedBlock => {
      if (!entry || typeof entry !== 'object') return false;
      const item = entry as Partial<A4SavedBlock>;
      return (
        typeof item.id === 'string' &&
        typeof item.label === 'string' &&
        !!item.block &&
        typeof item.block === 'object'
      );
    });
  } catch {
    return [];
  }
};

export const saveBlockToLibrary = (
  block: WorksheetBlock,
  label: string,
  storage?: StorageLike | null
): A4SavedBlock[] => {
  const target = resolveStorage(storage);
  const library = loadBlockLibrary(target);
  if (!target) return library;

  const entry: A4SavedBlock = {
    id: newId(),
    label: label.trim() || 'Kaydedilmiş bileşen',
    createdAt: Date.now(),
    block,
  };
  const next = [entry, ...library].slice(0, MAX_LIBRARY);
  try {
    target.setItem(LIBRARY_KEY, JSON.stringify(next));
    return next;
  } catch {
    return library;
  }
};

export const removeBlockFromLibrary = (
  entryId: string,
  storage?: StorageLike | null
): A4SavedBlock[] => {
  const target = resolveStorage(storage);
  const library = loadBlockLibrary(target);
  if (!target) return library;
  const next = library.filter((entry) => entry.id !== entryId);
  try {
    target.setItem(LIBRARY_KEY, JSON.stringify(next));
  } catch {
    return library;
  }
  return next;
};
