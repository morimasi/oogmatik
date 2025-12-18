
import { WorksheetData, ActivityType } from '../types';

const DB_NAME = 'DyslexiaAICache';
const STORE_NAME = 'generations';
const DRAFT_STORE_NAME = 'drafts'; // New store for current session state
const DB_VERSION = 2; // Incremented version

export const cacheService = {
    async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                reject(new Error("IndexedDB not supported"));
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
            };

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    },

    // --- GENERATION CACHING (Exact match for API savings) ---
    async get(key: string): Promise<WorksheetData | null> {
        try {
            const db = await this.openDB();
            return new Promise((resolve) => {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(key);

                request.onsuccess = () => {
                    resolve(request.result ? request.result.data : null);
                };

                request.onerror = () => {
                    console.error("Cache retrieval failed");
                    resolve(null);
                };
            });
        } catch (e) {
            console.warn('Cache read error (safely ignored):', e);
            return null;
        }
    },

    async set(key: string, data: WorksheetData): Promise<void> {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.put({ key, data, timestamp: Date.now() });

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            console.warn('Cache write error:', e);
        }
    },

    // --- DRAFT/PERSISTENCE (Restore last session) ---
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
            console.warn('Draft save error:', e);
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
        } catch (e) {
            return null;
        }
    },

    generateKey(activityType: string, options: any): string {
        return `${activityType}-${JSON.stringify(options)}`;
    }
};
