import { WorksheetData, ActivityType } from '../types';

import { logInfo, logError, logWarn } from '../utils/logger.js';

const DB_NAME = 'DyslexiaAICache';
const STORE_NAME = 'generations';
const DRAFT_STORE_NAME = 'drafts';
const STATS_STORE_NAME = 'cacheStats';
const DB_VERSION = 3;

export interface CacheStrategy {
  key: string;
  ttl: number;
  invalidateOn: string[];
  warmUp: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  size: number;
  lastCleared: number;
}

export const cacheService = {
  async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB not supported'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(DRAFT_STORE_NAME)) {
          db.createObjectStore(DRAFT_STORE_NAME, { keyPath: 'activityType' });
        }
        if (!db.objectStoreNames.contains(STATS_STORE_NAME)) {
          db.createObjectStore(STATS_STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  },

  async get(key: string, strategy?: CacheStrategy): Promise<WorksheetData | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          const entry = request.result;
          if (!entry) {
            this._recordMiss();
            resolve(null);
            return;
          }

          // TTL check
          if (strategy?.ttl) {
            const age = Date.now() - entry.timestamp;
            if (age > strategy.ttl) {
              this._recordMiss();
              this.remove(key).catch(() => {});
              resolve(null);
              return;
            }
          }

          this._recordHit();
          resolve(entry.data);
        };

        request.onerror = () => {
          logError('Cache retrieval failed');
          this._recordMiss();
          resolve(null);
        };
      });
    } catch (e) {
      logWarn(e instanceof Error ? e.message : String(e));
      return null;
    }
  },

  async set(key: string, data: WorksheetData, strategy?: CacheStrategy): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({
          key,
          data,
          timestamp: Date.now(),
          ttl: strategy?.ttl || 0,
        });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      logWarn('Cache write error:', typeof e === 'object' && e !== null && !Array.isArray(e) ? e as Record<string, unknown> : undefined);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Silent
    }
  },

  async clearAll(): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Silent
    }
  },

  async saveDraft(activityType: ActivityType, data: WorksheetData): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([DRAFT_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(DRAFT_STORE_NAME);
        const request = store.put({ activityType, data, timestamp: Date.now() });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      logWarn('Draft save error:', typeof e === 'object' && e !== null && !Array.isArray(e) ? e as Record<string, unknown> : undefined);
    }
  },

  async getDraft(activityType: ActivityType): Promise<WorksheetData | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([DRAFT_STORE_NAME], 'readonly');
        const store = transaction.objectStore(DRAFT_STORE_NAME);
        const request = store.get(activityType);

        request.onsuccess = () => {
          resolve(request.result ? request.result.data : null);
        };
        request.onerror = () => resolve(null);
      });
    } catch (_e) {
      return null;
    }
  },

  generateKey(activityType: string, options: unknown): string {
    return `${activityType}-${JSON.stringify(options)}`;
  },

  // --- Universal Cache Strategy: Cache Warming ---
  preCacheCommonActivities(activities: { key: string; data: WorksheetData; strategy?: CacheStrategy }[]): void {
    const processBatch = async () => {
      try {
        const db = await this.openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        for (const { key, data, strategy } of activities) {
          store.put({
            key,
            data,
            timestamp: Date.now(),
            ttl: strategy?.ttl || 0,
          });
        }
      } catch {
        // Silent fail for pre-caching
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        processBatch().catch(() => {});
      });
    } else if (typeof window !== 'undefined') {
      setTimeout(() => {
        processBatch().catch(() => {});
      }, 1000);
    } else {
      processBatch().catch(() => {});
    }
  },

  // --- Cache stats ---
  _hits: 0,
  _misses: 0,

  _recordHit(): void {
    this._hits++;
  },

  _recordMiss(): void {
    this._misses++;
  },

  getStats(): CacheStats {
    const total = this._hits + this._misses;
    return {
      hits: this._hits,
      misses: this._misses,
      totalRequests: total,
      hitRate: total > 0 ? Math.round((this._hits / total) * 100) : 0,
      size: 0,
      lastCleared: Date.now(),
    };
  },

  resetStats(): void {
    this._hits = 0;
    this._misses = 0;
  },

  // --- Expired entry cleanup ---
  async cleanExpired(defaultTTL = 86400000): Promise<number> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.openCursor();
        let cleaned = 0;

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const entry = cursor.value;
            const ttl = entry.ttl || defaultTTL;
            const age = Date.now() - entry.timestamp;
            if (age > ttl) {
              cursor.delete();
              cleaned++;
            }
            cursor.continue();
          } else {
            resolve(cleaned);
          }
        };

        request.onerror = () => resolve(0);
      });
    } catch {
      return 0;
    }
  },
};
