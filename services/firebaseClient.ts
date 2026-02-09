
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
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
 * 'experimentalForceLongPolling' ayarı 400 Bad Request/Streaming hatalarını önlemek için eklendi.
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  // FIX: WebChannel streaming hatalarını önlemek için uzun yoklama zorlanır
  experimentalForceLongPolling: true 
});

export const checkDbConnection = async () => {
    return !!(firebaseConfig.apiKey && firebaseConfig.projectId); 
};
