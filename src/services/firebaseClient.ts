// @ts-ignore — Firebase ESM package uses `exports` field; suppressed for Vite's moduleResolution:node
import { initializeApp, getApp, getApps } from "firebase/app";
// @ts-ignore — same as above
import { getAuth } from "firebase/auth";
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
  type QueryConstraint,
  type DocumentData,
};

const firebaseConfig = {
  apiKey: "AIzaSyDEnRDzfZ65myaEFTXVjdYu6tyKyFhXP3w",
  authDomain: "ooggen-08916543-87358.firebaseapp.com",
  projectId: "ooggen-08916543-87358",
  storageBucket: "ooggen-08916543-87358.appspot.com",
  messagingSenderId: "1013986256525",
  appId: "1:1013986256525:web:21ff26593d2422ad0e24c4"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

/**
 * Modern Firestore Initialization
 * WebChannel streaming (400 Bad Request) hatalarını önlemek için yapılandırıldı.
 * Not: Geliştirme sürecinde "Failed to obtain primary lease" hatalarını engellemek için
 * multiTabManager yerine basit Single Tab IndexedDB tercih edildi.
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
  experimentalAutoDetectLongPolling: true
});

export const checkDbConnection = async () => {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
};
