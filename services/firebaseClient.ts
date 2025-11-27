import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import * as firestore from "firebase/firestore";

// --- DİKKAT: BURAYI DOLDURUN ---
// Firebase Console -> Project Settings -> General -> Your apps -> SDK setup and configuration
// bölümünden aldığınız "firebaseConfig" nesnesini aşağıya yapıştırın.

const firebaseConfig = {
  apiKey: "AIzaSyDEnRDzfZ65myaEFTXVjdYu6tyKyFhXP3w",
  authDomain: "ooggen-08916543-87358.firebaseapp.com",
  projectId: "ooggen-08916543-87358",
  storageBucket: "ooggen-08916543-87358.firebasestorage.app",
  messagingSenderId: "1013986256525",
  appId: "1:1013986256525:web:21ff26593d2422ad0e24c4"
};

// Firebase'i Başlat
// Config boşsa hata vermemesi için kontrol (geliştirme aşaması için)
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : initializeApp({ apiKey: "demo", projectId: "demo" });

export const auth = getAuth(app);
export const db = firestore.getFirestore(app);

// Veritabanı bağlantısını kontrol etme (Basit bir ping yok, ancak auth hazır mı diye bakabiliriz)
export const checkDbConnection = async () => {
    return !!auth; 
};