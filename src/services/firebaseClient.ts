// @ts-nocheck — Firebase v12 ESM exports TypeScript ile uyumsuz, Vite runtime'da çalışıyor
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import type { QueryConstraint, DocumentData } from 'firebase/firestore';

// Re-export Firestore functions for use in services
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  runTransaction,
  type QueryConstraint,
  type DocumentData,
};

const firebaseConfig = {
  apiKey: 'AIzaSyDEnRDzfZ65myaEFTXVjdYu6tyKyFhXP3w',
  authDomain: 'ooggen-08916543-87358.firebaseapp.com',
  projectId: 'ooggen-08916543-87358',
  storageBucket: 'ooggen-08916543-87358.appspot.com',
  messagingSenderId: '1013986256525',
  appId: '1:1013986256525:web:21ff26593d2422ad0e24c4',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

/**
 * Modern Firestore Initialization
 * WebChannel streaming (400 Bad Request) hatalarını önlemek için yapılandırıldı.
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
  experimentalAutoDetectLongPolling: true,
});

export const checkDbConnection = async () => {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
};
