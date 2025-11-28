
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import * as firestore from "firebase/firestore";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDEnRDzfZ65myaEFTXVjdYu6tyKyFhXP3w",
  authDomain: "ooggen-08916543-87358.firebaseapp.com",
  projectId: "ooggen-08916543-87358",
  storageBucket: "ooggen-08916543-87358.firebasestorage.app",
  messagingSenderId: "1013986256525",
  appId: "1:1013986256525:web:21ff26593d2422ad0e24c4"
};

// Firebase'i Başlat
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (e) {
    console.error("Firebase initialization failed:", e);
}

// Export auth and db, handling potential initialization failures gracefully in the app
export const auth = app ? getAuth(app) : {} as any;
export const db = app ? firestore.getFirestore(app) : {} as any;

// Veritabanı bağlantısını kontrol etme
export const checkDbConnection = async () => {
    return !!app; 
};
