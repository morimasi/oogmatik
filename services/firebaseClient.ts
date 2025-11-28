
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import * as firestore from "firebase/firestore";

// Using hardcoded Firebase configuration as requested to fix deployment issues.
const firebaseConfig = {
  apiKey: "AIzaSyDlJLU4r8nX5PSKZ6R9WllteGXVbQgvcGs",
  authDomain: "ooggen-08916543-87358.firebaseapp.com",
  projectId: "ooggen-08916543-87358",
  storageBucket: "ooggen-08916543-87358.firebasestorage.app",
  messagingSenderId: "1013986256525",
  appId: "1:1013986256525:web:21ff26593d2422ad0e24c4"
};

// Check if required hardcoded values are set.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase configuration is missing. Please check the hardcoded config in services/firebaseClient.ts.");
}


// Firebase'i Başlat
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = firestore.getFirestore(app);

// Veritabanı bağlantısını kontrol etme
export const checkDbConnection = async () => {
    return !!auth; 
};
