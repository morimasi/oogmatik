import type { SariKitapConfig, SariKitapDocument, SariKitapGeneratedContent } from '../types/sariKitap';
import { cacheService } from './cacheService';

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 dakika

// ─── Cache Hash Algoritması ──────────────────────────────────────

export function buildCacheKey(config: SariKitapConfig): string {
  const normalized = [
    config.type,
    config.ageGroup,
    config.difficulty,
    [...config.topics].sort().join(','),
    [...config.targetSkills].sort().join(','),
  ].join('|');

  return `sari-kitap-${normalized}`;
}

// ─── Cache Operations ────────────────────────────────────────────

export const sariKitapCacheService = {
  async getCached(config: SariKitapConfig): Promise<SariKitapGeneratedContent | null> {
    try {
      const key = buildCacheKey(config);
      const cached = await cacheService.get(key);
      if (!cached) return null;

      // TTL kontrolü
      const entry = cached as unknown as { data: SariKitapGeneratedContent; timestamp: number };
      if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        return null;
      }
      return entry.data;
    } catch {
      return null;
    }
  },

  async setCache(config: SariKitapConfig, content: SariKitapGeneratedContent): Promise<void> {
    try {
      const key = buildCacheKey(config);
      await cacheService.set(key, { data: content, timestamp: Date.now() } as unknown as null);
    } catch {
      // Cache yazma hatası sessizce geçilir
    }
  },
};

// ─── Firestore CRUD (placeholder — Firebase entegrasyonu için) ───

export const sariKitapService = {
  buildCacheKey,
  cache: sariKitapCacheService,
};
