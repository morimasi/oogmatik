// @ts-ignore
import { initializeApp, getApp, getApps } from "firebase/app";
// @ts-ignore
import { getAuth } from "firebase/auth";
// @ts-ignore - Firebase Firestore advanced cache API (v9.6+)
// @ts-ignore
import { initializeFirestore } from "firebase/firestore";
// @ts-ignore
import { persistentLocalCache } from "firebase/firestore";
// @ts-ignore
import { persistentMultipleTabManager } from "firebase/firestore";

// Re-export Firestore functions for use in services
// @ts-ignore
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
} from "firebase/firestore";

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
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalAutoDetectLongPolling: true
});

export const checkDbConnection = async () => {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
};
