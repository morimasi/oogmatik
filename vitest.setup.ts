import { expect, afterEach, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

import { cleanup } from '@testing-library/react';

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// In-memory Firestore Store Mock
const firestoreStore = new Map<string, any>();

export const mockFirestoreDb = {};

vi.mock('@/services/firebaseClient', () => {
  return {
    db: mockFirestoreDb,
    collection: vi.fn((_db, name) => ({ type: 'collection', name })),
    doc: vi.fn((_db, ...parts) => {
      const path = parts.join('/');
      return { type: 'doc', path, id: parts[parts.length - 1] };
    }),
    getDoc: vi.fn(async (docRef) => {
      const path = docRef?.path || docRef?.id || String(docRef);
      const data = firestoreStore.get(path);
      return {
        exists: () => data !== undefined,
        data: () => (data ? JSON.parse(JSON.stringify(data)) : undefined),
        id: docRef?.id || 'mock-id',
      };
    }),
    setDoc: vi.fn(async (docRef, data) => {
      const path = docRef?.path || docRef?.id || String(docRef);
      firestoreStore.set(path, JSON.parse(JSON.stringify(data)));
    }),
    updateDoc: vi.fn(async (docRef, data) => {
      const path = docRef?.path || docRef?.id || String(docRef);
      const existing = firestoreStore.get(path) || {};
      firestoreStore.set(path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
    }),
    deleteDoc: vi.fn(async (docRef) => {
      const path = docRef?.path || docRef?.id || String(docRef);
      firestoreStore.delete(path);
    }),
    getDocs: vi.fn(async () => ({
      empty: true,
      docs: [],
      forEach: vi.fn(),
    })),
    query: vi.fn((c) => c),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    startAfter: vi.fn(),
    serverTimestamp: vi.fn(() => Date.now()),
    Timestamp: {
      now: vi.fn(() => ({ toMillis: () => Date.now(), toDate: () => new Date() })),
      fromMillis: vi.fn((m) => ({ toMillis: () => m, toDate: () => new Date(m) })),
      fromDate: vi.fn((d) => ({ toMillis: () => d.getTime(), toDate: () => d })),
    },
    runTransaction: vi.fn(async (_db, updateFunction) => {
      const transaction = {
        get: async (docRef: any) => {
          const path = docRef?.path || docRef?.id || String(docRef);
          const data = firestoreStore.get(path);
          return {
            exists: () => data !== undefined,
            data: () => (data ? JSON.parse(JSON.stringify(data)) : undefined),
            id: docRef?.id || 'mock-id',
          };
        },
        set: (docRef: any, data: any) => {
          const path = docRef?.path || docRef?.id || String(docRef);
          firestoreStore.set(path, JSON.parse(JSON.stringify(data)));
        },
        update: (docRef: any, data: any) => {
          const path = docRef?.path || docRef?.id || String(docRef);
          const existing = firestoreStore.get(path) || {};
          firestoreStore.set(path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
        },
        delete: (docRef: any) => {
          const path = docRef?.path || docRef?.id || String(docRef);
          firestoreStore.delete(path);
        },
      };
      return await updateFunction(transaction);
    }),
    writeBatch: vi.fn(() => ({
      set: vi.fn((docRef, data) => {
        const path = docRef?.path || docRef?.id || String(docRef);
        firestoreStore.set(path, data);
      }),
      update: vi.fn((docRef, data) => {
        const path = docRef?.path || docRef?.id || String(docRef);
        const existing = firestoreStore.get(path) || {};
        firestoreStore.set(path, { ...existing, ...data });
      }),
      delete: vi.fn((docRef) => {
        const path = docRef?.path || docRef?.id || String(docRef);
        firestoreStore.delete(path);
      }),
      commit: vi.fn(async () => {}),
    })),
  };
});
