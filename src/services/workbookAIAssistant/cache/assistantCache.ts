/**
 * Workbook AI Assistant — Cache Mekanizmasi
 *
 * Prompt cache ile token maliyet optimizasyonu:
 * - Memory cache (hizli erisim)
 * - IndexedDB (kalici depolama)
 * - TTL: 10 dakika
 *
 * @author Selin Arslan (AI Muhendisi)
 * @created 2026-04-02
 */

import { cacheService } from '../../cacheService';

// ============================================================
// CONSTANTS
// ============================================================

const ASSISTANT_CACHE_PREFIX = 'workbook_ai_assistant_';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 dakika

// ============================================================
// TYPES
// ============================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promptHash: string;
}

type CacheType = 'suggestions' | 'feedback' | 'autoComplete';

// ============================================================
// ASSISTANT CACHE CLASS
// ============================================================

export class AssistantCache {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();

  /**
   * Prompt hash olustur (ayni prompt = ayni sonuc)
   * Simple DJB2 hash algorithm
   */
  private generatePromptHash(prompt: string, schema: object): string {
    const combined = prompt + JSON.stringify(schema);
    let hash = 5381;

    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) + hash + char; // hash * 33 + char
      hash = hash & hash; // 32bit integer
    }

    return `${ASSISTANT_CACHE_PREFIX}${Math.abs(hash).toString(16)}`;
  }

  /**
   * Cache'den oku (TTL kontrolu ile)
   */
  async get<T>(prompt: string, schema: object): Promise<T | null> {
    const key = this.generatePromptHash(prompt, schema);

    // 1. Memory cache kontrol (en hizli)
    const memEntry = this.memoryCache.get(key);
    if (memEntry && Date.now() - memEntry.timestamp < CACHE_TTL_MS) {
      return memEntry.data as T;
    }

    // 2. IndexedDB kontrol
    try {
      const dbEntry = await cacheService.get(key);
      if (
        dbEntry &&
        (dbEntry as any).timestamp &&
        Date.now() - (dbEntry as any).timestamp < CACHE_TTL_MS
      ) {
        // Memory cache'e de yaz (sonraki erisimleri hizlandirmak icin)
        this.memoryCache.set(key, {
          data: dbEntry,
          timestamp: (dbEntry as any).timestamp,
          promptHash: key,
        });
        return dbEntry as T;
      }
    } catch {
      // Cache miss — sessizce devam et
    }

    return null;
  }

  /**
   * Cache'e yaz (hem memory hem IndexedDB)
   */
  async set<T>(prompt: string, schema: object, data: T): Promise<void> {
    const key = this.generatePromptHash(prompt, schema);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      promptHash: key,
    };

    // Memory cache (senkron)
    this.memoryCache.set(key, entry);

    // IndexedDB (async, fire-and-forget)
    cacheService.set(key, { ...data, timestamp: Date.now() } as any).catch(() => {
      // Sessiz basarisizlik — kritik degil
    });
  }

  /**
   * Belirli bir cache key'i kontrol et
   */
  async has(prompt: string, schema: object): Promise<boolean> {
    const result = await this.get(prompt, schema);
    return result !== null;
  }

  /**
   * Belirli bir cache key'i sil
   */
  invalidate(prompt: string, schema: object): void {
    const key = this.generatePromptHash(prompt, schema);
    this.memoryCache.delete(key);
    // IndexedDB'den silme suan desteklenmiyor — TTL ile expire olur
  }

  /**
   * Belirli bir tur icin cache temizle
   */
  invalidateByType(type: CacheType): void {
    const prefix = `${ASSISTANT_CACHE_PREFIX}${type}_`;
    const keysToDelete: string[] = [];

    this.memoryCache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.memoryCache.delete(key));
  }

  /**
   * Tum asistan cache'ini temizle
   */
  clearAll(): void {
    const keysToDelete: string[] = [];

    this.memoryCache.forEach((_, key) => {
      if (key.startsWith(ASSISTANT_CACHE_PREFIX)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.memoryCache.delete(key));
  }

  /**
   * Cache istatistikleri
   */
  getStats(): { memoryEntries: number; oldestEntry: number | null } {
    let oldestTimestamp: number | null = null;
    let count = 0;

    this.memoryCache.forEach((entry) => {
      count++;
      if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    });

    return {
      memoryEntries: count,
      oldestEntry: oldestTimestamp,
    };
  }

  /**
   * Expired entry'leri temizle (memory cleanup)
   */
  pruneExpired(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.memoryCache.forEach((entry, key) => {
      if (now - entry.timestamp > CACHE_TTL_MS) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.memoryCache.delete(key));
    return keysToDelete.length;
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

export const assistantCache = new AssistantCache();

// ============================================================
// CACHE INVALIDATION RULES
// ============================================================

/**
 * Cache invalidation kurallari:
 *
 * | Durum                      | Aksiyon                                           |
 * |----------------------------|---------------------------------------------------|
 * | Yeni aktivite eklendi      | invalidateByType('suggestions') + ('feedback')    |
 * | Aktivite silindi           | invalidateByType('suggestions') + ('feedback')    |
 * | Aktivite siralama degisti  | invalidateByType('feedback')                      |
 * | Ogrenci profili degisti    | clearAll()                                        |
 * | 10 dakika gecti            | Otomatik TTL expire                               |
 */

export const invalidateOnWorkbookChange = (
  changeType: 'add' | 'remove' | 'reorder' | 'profileChange'
): void => {
  switch (changeType) {
    case 'add':
    case 'remove':
      assistantCache.invalidateByType('suggestions');
      assistantCache.invalidateByType('feedback');
      break;
    case 'reorder':
      assistantCache.invalidateByType('feedback');
      break;
    case 'profileChange':
      assistantCache.clearAll();
      break;
  }
};
