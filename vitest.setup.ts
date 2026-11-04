import { expect, afterEach, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

import { cleanup } from '@testing-library/react';

// In-memory Firestore Store Mock
export const firestoreStore = new Map<string, any>();

// Runs a cleanup after each test case (e.g. clearing jsdom and in-memory stores)
afterEach(() => {
  cleanup();
  firestoreStore.clear();
});

export const mockFirestoreDb = {};

vi.mock('@/services/firebaseClient', () => {
  return {
    db: mockFirestoreDb,
    collection: vi.fn((_db, name) => ({ type: 'collection', name })),
    doc: vi.fn((parent, ...parts) => {
      let path = '';
      if (parent && typeof parent === 'object' && parent.type === 'collection') {
        path = `${parent.name}/${parts.join('/')}`;
      } else {
        path = parts.join('/');
      }
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
    getDocs: vi.fn(async (queryOrCol) => {
      const colName = queryOrCol?.collection?.name || queryOrCol?.name || '';
      const filters = queryOrCol?.filters || [];
      const prefix = colName ? `${colName}/` : '';

      const docs: any[] = [];
      for (const [path, data] of firestoreStore.entries()) {
        if (!colName || path.startsWith(prefix)) {
          let matches = true;
          for (const f of filters) {
            if (f.op === '==' && data[f.field] !== f.value) {
              matches = false;
              break;
            }
          }
          if (matches) {
            docs.push({
              id: path.split('/').pop() || path,
              ref: { path, id: path.split('/').pop() || path },
              data: () => JSON.parse(JSON.stringify(data)),
              exists: () => true,
            });
          }
        }
      }
      return {
        empty: docs.length === 0,
        size: docs.length,
        docs,
        forEach: (cb: any) => docs.forEach(cb),
      };
    }),
    query: vi.fn((col, ...filters) => {
      return {
        type: 'query',
        collection: col,
        name: col?.name,
        filters: filters.filter(Boolean),
      };
    }),
    where: vi.fn((field, op, value) => ({ field, op, value })),
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
