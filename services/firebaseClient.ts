
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDEnRDzfZ65myaEFTXVjdYu6tyKyFhXP3w",
  authDomain: "ooggen-08916543-87358.firebaseapp.com",
  projectId: "ooggen-08916543-87358",
  storageBucket: "ooggen-08916543-87358.appspot.com",
  messagingSenderId: "1013986256525",
  appId: "1:1013986256525:web:21ff26593d2422ad0e24c4"
};

// Check for incomplete configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Firebase configuration is incomplete. Please check your environment variables.");
}

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export auth service
export const auth = getAuth(app);

/**
 * Modern Firestore Initialization with Offline Persistence
 * Deprecated 'enableMultiTabIndexedDbPersistence' replaced with 'localCache'
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Veritabanı bağlantısını kontrol etme
export const checkDbConnection = async () => {
    return !!(firebaseConfig.apiKey && firebaseConfig.projectId); 
};
