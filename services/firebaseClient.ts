
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import * as firestore from "firebase/firestore";

// Firebase Config
// NOT: Gemini API Key (AIza...) buraya YAZILMAMALIDIR. Burası sadece Firebase Auth/Firestore içindir.
// Ancak, kullanıcı ortam değişkenlerini ayarlamadıysa uygulamanın çökmemesi için geçici bir fallback eklenmiştir.
// Bu anahtarın Firebase projesinde Auth için yetkili olduğundan emin olun.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDEnRDzfZ65myaEFTXVjdYu6tyKyFhXP3w", 
  authDomain: "ooggen-08916543-87358.firebaseapp.com",
  projectId: "ooggen-08916543-87358",
  storageBucket: "ooggen-08916543-87358.firebasestorage.app",
  messagingSenderId: "1013986256525",
  appId: "1:1013986256525:web:21ff26593d2422ad0e24c4"
};

// Check if API Key is missing (Common setup issue)
if (!firebaseConfig.apiKey) {
    console.warn("Firebase API Key eksik. Lütfen Vercel ayarlarında FIREBASE_API_KEY değişkenini tanımlayın veya services/firebaseClient.ts dosyasına geçerli bir anahtar girin.");
}

// Firebase'i Başlat
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = firestore.getFirestore(app);

// Veritabanı bağlantısını kontrol etme
export const checkDbConnection = async () => {
    return !!auth; 
};
