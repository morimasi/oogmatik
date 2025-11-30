import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import * as firestore from "firebase/firestore";

// Firebase Config - Hardcoded values as requested by the user
const firebaseConfig = {
  apiKey: "AIzaSyDEnRDzfZ65myaEFTXVjdYu6tyKyFhXP3w",
  authDomain: "ooggen-08916543-87358.firebaseapp.com",
  projectId: "ooggen-08916543-87358",
  storageBucket: "ooggen-08916543-87358.appspot.com",
  messagingSenderId: "1013986256525",
  appId: "1:1013986256525:web:21ff26593d2422ad0e24c4"
};

// Check for incomplete configuration to provide a clear error in the console.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Firebase configuration is incomplete. Please check your environment variables.");
}

// Initialize Firebase safely for both server and HMR environments
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export auth and db services
export const auth = getAuth(app);
export const db = firestore.getFirestore(app);

// Veritabanı bağlantısını kontrol etme
export const checkDbConnection = async () => {
    // A simple check to see if the essential config values are present
    return !!(firebaseConfig.apiKey && firebaseConfig.projectId); 
};