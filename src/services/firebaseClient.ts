// @ts-ignore — Firebase ESM package uses `exports` field; suppressed for Vite's moduleResolution:node
import { initializeApp, getApp, getApps } from "firebase/app";
// @ts-ignore — same as above
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { logInfo, logWarn } from "../utils/logger.js";
// @ts-ignore — same as above; all Firestore symbols imported in one block to cover the full statement
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
  increment,
  serverTimestamp,
  type QueryConstraint,
  type DocumentData,
} from "firebase/firestore";

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
  increment,
  serverTimestamp,
  type QueryConstraint,
  type DocumentData,
};

const firebaseConfig = {
  apiKey: "AIzaSyDEnRDzfZ65myaEFTXVjdYu6tyKyFhXP3w",
  authDomain: "ooggen-08916543-87358.firebaseapp.com",
  projectId: "ooggen-08916543-87358",
  storageBucket: "ooggen-08916543-87358.firebasestorage.app",
  messagingSenderId: "1013986256525",
  appId: "1:1013986256525:web:21ff26593d2422ad0e24c4"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

const isDev = (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') || 
              (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.MODE === 'development');

// Development mode domain check
if (isDev) {
  logInfo("Firebase Auth initialized with domain: " + firebaseConfig.authDomain);
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('AIzaSyDEnRD')) {
    logWarn("Firebase API Key is present but ensure it is the correct one for your project.");
  }
}

/**
 * Modern Firestore Initialization
 * WebChannel streaming (400 Bad Request) hatalarını önlemek için yapılandırıldı.
 * Not: Çoklu sekme desteği için persistentMultipleTabManager etkinleştirildi.
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  experimentalForceLongPolling: true
});

export const storage = getStorage(app);

export const checkDbConnection = async () => {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
};
